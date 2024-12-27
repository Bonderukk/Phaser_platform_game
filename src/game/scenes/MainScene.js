import Phaser from 'phaser';
import PlatformGenerator from '../PlatformGenerator';
import levelConfig from '../levelConfig';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('main');
        this.gyroHandler = this.gyroHandler.bind(this);
        this.highestY = 0; // Track the highest point reached
    }

    init(data) {
        this.level = data.level || 1;
        this.semester = data.semester || 1;
        this.controlMethod = data.controlMethod || 'mouse';
    }

    preload() {
        this.load.image('player', 'game/assets/player.png');
        this.load.image('platform', 'game/assets/platform.png');
        this.load.image('powerUp', 'game/assets/boost_smaller.png');
        this.load.image('slowFallPowerUp', 'game/assets/cigy_small.png'); // New power-up image
    }

    create() {
        // Get the background color from levelConfig
        const levelData = levelConfig.levels.find(l => l.id === this.level);
        
        // Set background color
        this.cameras.main.setBackgroundColor(levelData.background);

        this.add.text(10, 10, `Level ${this.level}`, { font: '20px Arial', fill: '#fff' });

        // Set world bounds for all five semesters
        this.physics.world.setBounds(0, -8200, this.cameras.main.width, this.cameras.main.height + 8700);
        this.cameras.main.setBounds(0, -8200, this.cameras.main.width, this.cameras.main.height + 8700);

        // Create platform generator and platforms
        this.platformGenerator = new PlatformGenerator(this, this.level, this.semester);
        const [platforms, movingPlatforms, powerUps] = this.platformGenerator.generatePlatforms();

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
                    // Use jump boost if active
                    const jumpVelocity = this.jumpBoostActive ? this.boostedJumpVelocity : this.normalJumpVelocity;
                    player.setVelocityY(jumpVelocity);
                    
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
                // Use jump boost if active
                const jumpVelocity = this.jumpBoostActive ? this.boostedJumpVelocity : this.normalJumpVelocity;
                player.setVelocityY(jumpVelocity);
                
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
        this.cameras.main.setBounds(0, -8200, this.cameras.main.width, this.cameras.main.height + 8700);
        

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

        // this.debugText = this.add.text(10, 50, 'Debug log:', { font: '16px Arial', fill: '#fff' });

        // Add power-up collision
        this.physics.add.overlap(this.player, powerUps, this.collectPowerUp, null, this);

        // Add power-up states and timers
        this.jumpBoostActive = false;
        this.slowFallActive = false;
        this.jumpBoostTimer = null;
        this.slowFallTimer = null;
        this.normalJumpVelocity = -600;
        this.boostedJumpVelocity = -1000;
        this.normalGravity = 300;
        this.slowFallGravity = 100;
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

        // Visual effect for slow fall
        if (this.slowFallActive && this.player.body.velocity.y > 0) {
            // Optional: Add floating particle effect here
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
            `Level ${this.level}, ${this.semester}. semester dokončený!`,
            { font: '32px Arial', fill: '#fff' }
        );
        victoryText.setOrigin(0.5);
        victoryText.setScrollFactor(0);

        // Determine next level/semester
        let nextLevel = this.level;
        let nextSemester = this.semester + 1;
        
        if (nextSemester > 5) {
            nextSemester = 1;
            nextLevel++;
        }

        // Add continue button
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
                    level: nextLevel,
                    semester: nextSemester,
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
            level: this.level,
            semester: this.semester,
            controlMethod: this.controlMethod
        });
    }

    collectPowerUp(player, powerUp) {
        const powerUpType = powerUp.powerUpType;
        
        // Remove the power-up
        powerUp.destroy();

        if (powerUpType === 'jumpBoost') {
            // Clear existing timer if there is one
            if (this.jumpBoostTimer) {
                this.jumpBoostTimer.remove();
            }
            
            // Activate jump boost
            this.jumpBoostActive = true;
            player.setTint(0x00ff00); // Green tint
            
            // Set new timer
            this.jumpBoostTimer = this.time.delayedCall(5000, () => {
                this.jumpBoostActive = false;
                if (!this.slowFallActive) {
                    player.clearTint();
                }
            });
        } else if (powerUpType === 'slowFall') {
            // Clear existing timer if there is one
            if (this.slowFallTimer) {
                this.slowFallTimer.remove();
            }
            
            // Activate slow fall
            this.slowFallActive = true;
            player.setTint(0x00ffff); // Cyan tint
            player.setGravityY(this.slowFallGravity);
            
            // Set new timer
            this.slowFallTimer = this.time.delayedCall(5000, () => {
                this.slowFallActive = false;
                player.setGravityY(this.normalGravity);
                if (!this.jumpBoostActive) {
                    player.clearTint();
                }
            });
        }
    }

    // Modify your existing jump logic to use the power-up
    handleJump() {
        if (this.player.body.touching.down) {
            const jumpVelocity = this.jumpBoostActive ? this.boostedJumpVelocity : this.normalJumpVelocity;
            this.player.setVelocityY(jumpVelocity);
        }
    }
}