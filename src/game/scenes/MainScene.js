import Phaser from 'phaser';
import PlatformGenerator from '../PlatformGenerator';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('main');
        this.gyroHandler = this.gyroHandler.bind(this);
        this.highestY = 0; // Track the highest point reached
    }

    init(data) {
        this.selectedDifficulty = data.difficulty || 1;
        this.controlMethod = data.controlMethod || 'mouse';
    }

    preload() {
        this.load.image('player', 'game/assets/player.png');
        this.load.image('platform', 'game/assets/platform.png');
        this.load.image('pauseButton', 'game/assets/pause-button.png');
    }

    create() {
        this.add.text(10, 10, `Zvolená obtiažnosť: ${this.selectedDifficulty}. semester`, { font: '20px Arial', fill: '#fff' });

        // Set world and camera bounds first
        this.physics.world.setBounds(0, -2000, this.cameras.main.width, this.cameras.main.height + 2500);

        // Create platform generator and platforms before player
        this.platformGenerator = new PlatformGenerator(this, this.selectedDifficulty);
        const [platforms, movingPlatforms] = this.platformGenerator.generatePlatforms();

        // Start player just above the bottom platform
        const centerX = this.cameras.main.width / 2;
        const startY = this.cameras.main.height - 150; // Moved higher up

        this.player = this.physics.add.sprite(centerX, startY, 'player')
            .setCollideWorldBounds(true)
            .setGravityY(300)
            .setBounce(0);
        
        // Add collision between player and both platform groups
        this.physics.add.collider(this.player, platforms, (player, platform) => {
            if (player.body.touching.down) {
                if (platform.isFinish) {
                    this.handleLevelComplete();
                } else {
                    player.setVelocityY(-600);
                    
                    // Make platform disappear if it's marked as disappearing
                    if (platform.isDisappearing) {
                        this.tweens.add({
                            targets: platform,
                            alpha: 0,
                            duration: 200,
                            onComplete: () => {
                                platform.destroy();
                            }
                        });
                    }
                }
            }
        });

        this.physics.add.collider(this.player, movingPlatforms, (player, platform) => {
            if (player.body.touching.down) {
                player.setVelocityY(-600);
                
                // Make platform disappear if it's marked as disappearing
                if (platform.isDisappearing) {
                    this.tweens.add({
                        targets: platform,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => {
                            platform.destroy();
                        }
                    });
                }
            }
        });
        
        // Store initial player Y position as highest
        this.highestY = this.cameras.main.scrollY + (this.cameras.main.height * 2/3);
        
        // Set camera bounds to match world bounds
        this.cameras.main.setBounds(0, -2000, this.cameras.main.width, this.cameras.main.height + 2500);
        

        // Initial jump
        this.player.setVelocityY(-600);

        this.maxHorizontalVelocity = 300;

        // Nastavíme klávesové vstupy
        if (this.controlMethod === 'keyboard') {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keys = this.input.keyboard.addKeys({
                'A': Phaser.Input.Keyboard.KeyCodes.A,
                'D': Phaser.Input.Keyboard.KeyCodes.D
            });
        } else if (this.controlMethod === 'gyroscope') {
            window.addEventListener('deviceorientation', this.gyroHandler);
        }

        this.pauseButton = this.add.image(
            this.cameras.main.width - 50,
            50,
            'pauseButton'
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

        this.pauseButton.on('pointerup', () => {
            this.showPauseMenu();
        });
    }

    // Handler pre gyroskop
    gyroHandler(event) {
        // gamma: náklon do strán (od -90 do 90)
        // Pozitívna gamma: telefón naklonený doprava
        // Negatívna gamma: telefón naklonený doľava
        const gamma = event.gamma || 0;
        // Napr. gamma 0 = žiadne naklonenie, gamma 20 = naklonenie doprava
        const speedFactor = 10;
        let newVelocityX = gamma * speedFactor;

        if (newVelocityX > this.maxHorizontalVelocity) {
            newVelocityX = this.maxHorizontalVelocity;
        } else if (newVelocityX < -this.maxHorizontalVelocity) {
            newVelocityX = -this.maxHorizontalVelocity;
        }

        // this.debugText.setText(`gamma: ${gamma.toFixed(2)}\nvelocityX: ${newVelocityX.toFixed(2)}`);

        if (this.player && this.player.body) {
            this.player.setVelocityX(newVelocityX);
        }
    }

    update() {
        // Check if player has fallen below camera view
        const cameraBottom = this.cameras.main.scrollY + this.cameras.main.height;
        
        if (this.player.y > cameraBottom) {
            this.handlePlayerDeath();
            return;
        }

        // Update camera position to follow player only upwards
        const targetY = this.player.y - (this.cameras.main.height * 2/3);
        if (targetY < this.cameras.main.scrollY) {
            this.cameras.main.scrollY = targetY;
        }

        if (this.controlMethod === 'mouse') {
            // Ovládanie myšou
            const pointer = this.input.activePointer;
            const dx = pointer.x - this.player.x;
            const speedFactor = 2;
            let newVelocityX = dx * speedFactor;

            if (newVelocityX > this.maxHorizontalVelocity) {
                newVelocityX = this.maxHorizontalVelocity;
            } else if (newVelocityX < -this.maxHorizontalVelocity) {
                newVelocityX = -this.maxHorizontalVelocity;
            }
            this.player.setVelocityX(newVelocityX);

        } else if (this.controlMethod === 'keyboard') {
            // Ovládanie klávesnicou
            let velocityX = 0;

            // Šípky
            if (this.cursors.left.isDown) {
                velocityX = -this.maxHorizontalVelocity;
            } else if (this.cursors.right.isDown) {
                velocityX = this.maxHorizontalVelocity;
            }

            // A/D
            if (this.keys.A.isDown) {
                velocityX = -this.maxHorizontalVelocity;
            } else if (this.keys.D.isDown) {
                velocityX = this.maxHorizontalVelocity;
            }

            this.player.setVelocityX(velocityX);
        }
    }

    shutdown() {
        window.removeEventListener('deviceorientation', this.gyroHandler);
    }

    destroy() {
        super.destroy();
        window.removeEventListener('deviceorientation', this.gyroHandler);
    }

    handleLevelComplete() {
        // Stop player movement
        this.player.setVelocity(0, 0);
        this.player.body.allowGravity = false;

        // Create victory overlay
        const overlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        overlay.setScrollFactor(0);

        // Add victory text
        const victoryText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            `${this.selectedDifficulty}. semester dokončený!`,
            { font: '32px Arial', fill: '#fff' }
        );
        victoryText.setOrigin(0.5);
        victoryText.setScrollFactor(0);

        // Add continue button
        const nextLevel = this.selectedDifficulty + 1;
        const buttonText = nextLevel <= 5 ? 'Ďalší semester' : 'Späť do menu';
        
        const continueButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 50,
            buttonText,
            { font: '24px Arial', fill: '#fff', backgroundColor: '#4a4a4a', padding: { x: 20, y: 10 } }
        );
        continueButton.setOrigin(0.5);
        continueButton.setScrollFactor(0);
        continueButton.setInteractive({ useHandCursor: true });

        continueButton.on('pointerup', () => {
            if (nextLevel <= 5) {
                this.scene.start('main', { 
                    difficulty: nextLevel,
                    controlMethod: this.controlMethod 
                });
            } else {
                this.scene.start('menu');
            }
        });

        // Add hover effect
        continueButton.on('pointerover', () => continueButton.setStyle({ fill: '#ffff00' }));
        continueButton.on('pointerout', () => continueButton.setStyle({ fill: '#ffffff' }));
    }

    handlePlayerDeath() {
        // Reset to the same level
        this.scene.restart({
            difficulty: this.selectedDifficulty,
            controlMethod: this.controlMethod
        });
    }

    showPauseMenu() {
        // Pozastavíme fyziku v hre, aby sa hráč a platformy prestali hýbať.
        this.physics.world.pause();

        // Vytvoríme overlay
        this.pauseOverlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        this.pauseOverlay.setOrigin(0.5);
        this.pauseOverlay.setScrollFactor(0);

        this.pauseText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            'Hra je pozastavená',
            { font: '32px Arial', fill: '#fff' }
        );
        this.pauseText.setOrigin(0.5);
        this.pauseText.setScrollFactor(0);

        // Vytvoríme tlačidlo "Ukončiť hru"
        this.quitButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 80,
            'Ukončiť hru',
            { font: '24px Arial', fill: '#fff', backgroundColor: '#4a4a4a', padding: { x: 20, y: 10 } }
        );
        this.quitButton.setOrigin(0.5);
        this.quitButton.setScrollFactor(0);
        this.quitButton.setInteractive({ useHandCursor: true });

        this.quitButton.on('pointerup', () => {
            this.scene.start('menu');
        });

        // Vytvoríme tlačidlo "Pokračovať"
        this.continueButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Pokračovať',
            { font: '24px Arial', fill: '#fff', backgroundColor: '#4a4a4a', padding: { x: 20, y: 10 } }
        );
        this.continueButton.setOrigin(0.5);
        this.continueButton.setScrollFactor(0);
        this.continueButton.setInteractive({ useHandCursor: true });

        this.continueButton.on('pointerup', () => {
            this.resumeGame();
        });

        this.pauseButton.setVisible(false);
    }

    // Metóda na pokračovanie v hre
    resumeGame() {
        // Zmažeme overlay a texty
        this.pauseOverlay.destroy();
        this.pauseText.destroy();
        this.quitButton.destroy();
        this.continueButton.destroy();

        // Obnovíme fyziku
        this.physics.world.resume();

        // Opäť zobrazíme "pause" tlačidlo
        this.pauseButton.setVisible(true);
    }
}