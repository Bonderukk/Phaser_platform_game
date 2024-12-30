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
        this.gameMode = data.gameMode || 'hard';
        
        // Make sure we get the arrays from the previous scene or death restart
        try {
            // First try to use data passed from previous scene
            if (data?.levels && data?.playedLevels) {
                this.levels = [...data.levels];
                this.playedLevels = [...data.playedLevels];
                console.log('Using passed data:', { levels: this.levels, playedLevels: this.playedLevels });
            } else {
                // Try to load from localStorage
                try {
                    const savedProgress = localStorage.getItem('gameProgress');
                    if (savedProgress) {
                        const progress = JSON.parse(savedProgress);
                        this.levels = progress.levels || [1, 2, 3, 4, 5];
                        this.playedLevels = progress.playedLevels || [];
                        console.log('Loaded from localStorage:', { levels: this.levels, playedLevels: this.playedLevels });
                    } else {
                        // Initialize with default values if no saved data
                        this.levels = [1, 2, 3, 4, 5];
                        this.playedLevels = [];
                        console.log('Using default values:', { levels: this.levels, playedLevels: this.playedLevels });
                    }
                } catch (e) {
                    console.error('Error loading from localStorage:', e);
                    // Fallback to default values
                    this.levels = [1, 2, 3, 4, 5];
                    this.playedLevels = [];
                }
            }
        } catch (e) {
            console.error('Error in init:', e);
            // Final fallback
            this.levels = [1, 2, 3, 4, 5];
            this.playedLevels = [];
        }

        // Add gyroscope handler if on mobile
        if (this.controlMethod === 'gyroscope') {
            window.addEventListener('deviceorientation', this.gyroHandler);
        }
    }

    preload() {
        this.load.image('player', 'game/assets/player.png');
        this.load.image('platform', 'game/assets/platform.png');
        this.load.image('powerUp', 'game/assets/boost_smaller.png');
        this.load.image('slowFallPowerUp', 'game/assets/cigy_small.png');
        this.load.image('pauseButton', 'game/assets/pause-button.png');
    }

    create() {
        // Get the background color from levelConfig
        const levelData = levelConfig.levels.find(l => l.id === this.level);
        
        // Set background color
        this.cameras.main.setBackgroundColor(levelData.background);

        this.add.text(10, 10, `${levelData.name}`, { font: '20px Arial', fill: '#fff' });

        // Set world bounds for all five semesters
        this.physics.world.setBounds(0, -8200, this.cameras.main.width, this.cameras.main.height + 8700);
        this.cameras.main.setBounds(0, -8200, this.cameras.main.width, this.cameras.main.height + 8700);

        // Create platform generator and platforms
        this.platformGenerator = new PlatformGenerator(this, this.level, this.semester);
        const [platforms, movingPlatforms, powerUps] = this.platformGenerator.generatePlatforms();

        if (this.gameMode === 'easy') {
            platforms.children.iterate(platform => {
                platform.body.checkCollision.up = true;
                platform.body.checkCollision.down = false;
                platform.body.checkCollision.left = false;
                platform.body.checkCollision.right = false;
            });

            movingPlatforms.children.iterate(platform => {
                platform.body.checkCollision.up = true;
                platform.body.checkCollision.down = false;
                platform.body.checkCollision.left = false;
                platform.body.checkCollision.right = false;
            });
        }

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

    // Handler for gyroscope
    gyroHandler(event) {
        // gamma: side tilt (-90 to 90)
        // Positive gamma: phone tilted right
        // Negative gamma: phone tilted left
        const gamma = event.gamma || 0;
        const speedFactor = 20;
        let newVelocityX = gamma * speedFactor;

        if (newVelocityX > this.maxHorizontalVelocity) {
            newVelocityX = this.maxHorizontalVelocity;
        } else if (newVelocityX < -this.maxHorizontalVelocity) {
            newVelocityX = -this.maxHorizontalVelocity;
        }

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
            // Mouse control
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
            // Keyboard control
            let velocityX = 0;

            if (this.cursors.left.isDown || this.keys.A.isDown) {
                velocityX = -this.maxHorizontalVelocity;
            } else if (this.cursors.right.isDown || this.keys.D.isDown) {
                velocityX = this.maxHorizontalVelocity;
            }

            this.player.setVelocityX(velocityX);
        }
        // Note: gyroscope control is handled by the event listener

        // Visual effect for slow fall
        if (this.slowFallActive && this.player.body.velocity.y > 0) {
            // Optional: Add floating particle effect here
        }
    }

    shutdown() {
        if (this.controlMethod === 'gyroscope') {
            window.removeEventListener('deviceorientation', this.gyroHandler);
        }
    }

    destroy() {
        if (this.controlMethod === 'gyroscope') {
            window.removeEventListener('deviceorientation', this.gyroHandler);
        }
        super.destroy();
    }

    handleLevelComplete() {
        try {
            // Get the current level
            const currentLevel = this.level;
            
            // Update arrays
            const levelIndex = this.levels.indexOf(currentLevel);
            if (levelIndex > -1) {
                this.levels.splice(levelIndex, 1);
                this.playedLevels.push(currentLevel);
            }

            // Save progress with error handling
            this.saveProgress();

            // Start menu scene with updated arrays
            this.scene.start('menu', {
                levels: this.levels,
                playedLevels: this.playedLevels
            });
        } catch (e) {
            console.error('Error in handleLevelComplete:', e);
            // Fallback to menu without saving
            this.scene.start('menu');
        }
    }

    handlePlayerDeath() {
        // Restart the same level but maintain the arrays
        this.scene.restart({
            level: this.level,
            semester: this.semester,
            controlMethod: this.controlMethod,
            gameMode: this.gameMode,
            levels: this.levels,          // Pass the current levels array
            playedLevels: this.playedLevels  // Pass the played levels array
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

    showPauseMenu() {
        // Pause physics
        this.physics.world.pause();
        
        // Create semi-transparent overlay
        this.pauseOverlay = this.add.rectangle(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.8
        ).setOrigin(0).setScrollFactor(0);

        // Title with better styling
        this.pauseText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 150,
            'Hra je pozastavená',
            { 
                font: 'bold 42px Arial',
                fill: '#FFFFFF',
                stroke: '#0066CC',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setScrollFactor(0);

        // Create styled text buttons
        this.continueButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 20,
            'Pokračovať',
            { 
                font: 'bold 36px Arial', 
                fill: '#FFFFFF',
                stroke: '#0066CC',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

        this.quitButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 70,
            'Ukončiť hru',
            { 
                font: 'bold 36px Arial', 
                fill: '#FFFFFF',
                stroke: '#0066CC',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

        this.helpButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 160,
            'Nápoveda',
            { 
                font: 'bold 36px Arial', 
                fill: '#FFFFFF',
                stroke: '#0066CC',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

        // Add hover effects
        [this.continueButton, this.quitButton, this.helpButton].forEach(button => {
            button.on('pointerover', () => {
                button.setStyle({ fill: '#00ffff' });
            });

            button.on('pointerout', () => {
                button.setStyle({ fill: '#FFFFFF' });
            });
        });

        // Keep original click handlers
        this.continueButton.on('pointerup', () => this.resumeGame());
        this.quitButton.on('pointerup', () => {
            // Original quit logic
            const currentLevel = this.level;
            const levels = [...this.levels];
            const playedLevels = [...this.playedLevels];
            const levelIndex = levels.indexOf(currentLevel);
            if (levelIndex > -1) {
                levels.splice(levelIndex, 1);
                if (!playedLevels.includes(currentLevel)) {
                    playedLevels.push(currentLevel);
                }
            }
            localStorage.setItem('gameProgress', JSON.stringify({
                levels: levels,
                playedLevels: playedLevels,
                lastUpdated: new Date().toISOString()
            }));
            this.scene.start('menu', {
                levels: levels,
                playedLevels: playedLevels
            });
        });
        this.helpButton.on('pointerup', () => this.showHelp());

        this.pauseButton.setVisible(false);
    }
    // Metóda na pokračovanie v hre
    resumeGame() {
        // Zmažeme overlay a texty
        this.pauseOverlay.destroy();
        this.pauseText.destroy();
        this.quitButton.destroy();
        this.continueButton.destroy();
        this.helpButton.destroy();
        // Obnovíme fyziku
        this.physics.world.resume();
        // Opäť zobrazíme "pause" tlačidlo
        this.pauseButton.setVisible(true);
    }

    handleGyroscope(event) {
        if (!this.player || this.isPaused) return;

        // Beta is front-to-back tilt in degrees, where front is positive
        const tiltFrontBack = event.beta;
        // Gamma is left-to-right tilt in degrees, where right is positive
        const tiltLeftRight = event.gamma;

        // Adjust player velocity based on device tilt
        if (tiltLeftRight !== null && tiltFrontBack !== null) {
            // Left-right movement
            if (tiltLeftRight > 10) { // Tilted right
                this.player.setVelocityX(300);
            } else if (tiltLeftRight < -10) { // Tilted left
                this.player.setVelocityX(-300);
            } else { // Nearly flat
                this.player.setVelocityX(0);
            }

            // Jump when device is tilted forward significantly
            if (tiltFrontBack < -30 && this.player.body.touching.down) {
                this.player.setVelocityY(-400); // Jump
            }
        }
    }

    // Update save progress method to be more robust
    saveProgress() {
        try {
            const progress = {
                levels: this.levels,
                playedLevels: this.playedLevels,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('gameProgress', JSON.stringify(progress));
            console.log('Progress saved successfully:', progress);
        } catch (e) {
            console.error('Error saving progress:', e);
        }
    }

    showHelp() {
        // Overlay
        this.helpOverlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.8
        ).setOrigin(0.5).setScrollFactor(0);

        // Title
        this.helpText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            'Ovládanie:\n\n' +
            '🖱️ Myš (desktop): Panáčik sa hýbe podľa pozície kurzora.\n\n' +
            '⌨️ Klávesnica (desktop): Použite šípky vľavo/vpravo alebo klávesy A/D na pohyb.\n\n' +
            '📱 Gyroskop (mobil): Nakláňajte telefón, aby sa panáčik pohyboval doľava či doprava.\n\n' +
            'Boostery:\n\n' +
            '⚡ Red Bull: Dočasne zvýši výšku skoku.\n\n' +
            '🌫️ Cigarety: Dočasne zníži rýchlosť pádu.',
            {
                font: '18px Arial',
                fill: '#fff',
                align: 'center',
                wordWrap: { width: this.cameras.main.width - 100 }
            }
        );
        this.helpText.setOrigin(0.5, 0.5);
        this.helpText.setScrollFactor(0);

        // Close button
        this.closeHelpButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 140,
            'Zavrieť',
            { 
                font: 'bold 32px Arial',
                fill: '#FFFFFF',
                stroke: '#0066CC',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0)
         .setInteractive({ useHandCursor: true });

        // Add hover effect
        this.closeHelpButton.on('pointerover', () => {
            this.closeHelpButton.setStyle({ fill: '#00ffff' });
        });

        this.closeHelpButton.on('pointerout', () => {
            this.closeHelpButton.setStyle({ fill: '#FFFFFF' });
        });

        this.closeHelpButton.on('pointerup', () => {
            this.helpOverlay.destroy();
            this.helpText.destroy();
            this.closeHelpButton.destroy();
        });
    }
}