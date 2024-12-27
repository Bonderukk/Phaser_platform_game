import Phaser from 'phaser';
import levelConfig from './levelConfig.json';

export default class PlatformGenerator {
    constructor(scene, level, semester) {
        this.scene = scene;
        this.level = level;
        this.semester = semester;
        this.platformGroup = scene.physics.add.staticGroup();
        this.movingPlatformGroup = scene.physics.add.group();
        this.gameWidth = scene.cameras.main.width;
        this.gameHeight = scene.cameras.main.height;
        this.platformWidth = 100;
        this.platformHeight = 20;
        
        // Get level configuration
        this.config = levelConfig.levels.find(l => l.id === level).config;

        this.powerUpGroup = scene.physics.add.staticGroup();
        this.lastPowerUpY = this.gameHeight; // Track last power-up position
        this.powerUpSpacing = 1000; // Minimum vertical distance between power-ups
    }

    generatePlatforms() {
        this.platformGroup.clear(true, true);
        this.powerUpGroup.clear(true, true);
        if (this.movingPlatformGroup) {
            this.movingPlatformGroup.clear(true, true);
        }

        // Generate all five semesters in one continuous level
        const semesterHeight = 1600;
        
        // Starting platform
        this.createPlatform(this.gameWidth / 2, this.gameHeight - 100);
        
        // Generate each semester section with level-specific mechanics
        for (let semester = 1; semester <= 5; semester++) {
            const startY = this.gameHeight - 250 - ((semester - 1) * semesterHeight);
            const endY = startY - semesterHeight;
            
            // Create dashed line for semester divider
            const lineWidth = this.gameWidth;
            const dashLength = 50;
            const gapLength = 30;
            let x = 0;
            
            while (x < lineWidth) {
                this.scene.add.rectangle(
                    x + dashLength/2, 
                    startY, 
                    dashLength, 
                    4, 
                    0xFFFFFF
                );
                x += dashLength + gapLength;
            }
            
            // Add semester text
            this.scene.add.text(this.gameWidth / 2, startY - 30, 
                `${semester}. semester`, 
                { font: '24px Arial', fill: '#FFFFFF' }
            ).setOrigin(0.5);
            
            // Generate platforms based on level type
            switch(this.level) {
                case 1: // Static platforms with increasing gaps
                    this.generateStaticSection(startY - 100, endY, semester);
                    break;
                    
                case 2: // Moving platforms
                    this.generateMovingSection(startY - 100, endY, semester);
                    break;
                    
                case 3: // Alternating moving and static
                    this.generateAlternatingSection(startY - 100, endY, semester);
                    break;
                    
                case 4: // Disappearing platforms
                    this.generateDisappearingSection(startY - 100, endY, semester);
                    break;
                    
                case 5: // Chaos level (all mechanics combined)
                    this.generateChaosSection(startY - 100, endY, semester);
                    break;
            }
        }
        
        // Add final finish line at the top
        this.finishLine = this.createFinishPlatform(this.gameWidth / 2, -7800);
        
        // Add power-ups throughout the level
        this.generatePowerUps();

        return [this.platformGroup, this.movingPlatformGroup, this.powerUpGroup];
    }

    generateStaticSection(startY, endY, semester) {
        let y = startY;
        let prevX = this.gameWidth / 2;
        
        while (y > endY) {
            const spacing = 200 + (semester * 40); // Gaps increase with semester
            const minX = Math.max(this.platformWidth, prevX - spacing);
            const maxX = Math.min(this.gameWidth - this.platformWidth, prevX + spacing);
            const x = Phaser.Math.Between(minX, maxX);
            
            this.createPlatform(x, y);
            prevX = x;
            y -= Phaser.Math.Between(100 + (semester * 10), 160 + (semester * 15));
        }
    }

    generateMovingSection(startY, endY, semester) {
        let y = startY;
        
        while (y > endY) {
            const x = Phaser.Math.Between(this.platformWidth + 100, this.gameWidth - this.platformWidth - 100);
            const platform = this.createMovingPlatform(x, y);
            
            // Use config values for movement
            const moveDistance = this.config.baseMoveDistance;
            const moveDirection = Math.random() < 0.5 ? moveDistance : -moveDistance;
            const duration = this.config.baseSpeed - (semester * this.config.speedIncrease);
            
            this.scene.tweens.add({
                targets: platform,
                x: x + moveDirection,
                duration: duration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            y -= Phaser.Math.Between(this.config.minGap, this.config.maxGap);
        }
    }

    generateDisappearingSection(startY, endY, semester) {
        let y = startY;
        
        while (y > endY) {
            const x = Phaser.Math.Between(this.platformWidth, this.gameWidth - this.platformWidth);
            
            if (semester >= 3) {
                const movingChance = (semester - 2) * 0.25;
                
                if (Math.random() < movingChance) {
                    const platform = this.createMovingPlatform(x, y);
                    platform.isDisappearing = true;
                    
                    const moveDistance = this.config.baseMoveDistance + ((semester - 3) * this.config.distanceIncrease);
                    const duration = this.config.baseSpeed - ((semester - 3) * this.config.speedIncrease);
                    
                    this.scene.tweens.add({
                        targets: platform,
                        x: x + (Math.random() < 0.5 ? moveDistance : -moveDistance),
                        duration: duration,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                } else {
                    const platform = this.createPlatform(x, y);
                    platform.isDisappearing = true; // Set this before creation
                }
            } else {
                const platform = this.createPlatform(x, y);
                platform.isDisappearing = true; // Set this before creation
            }
            
            y -= Phaser.Math.Between(110 + (semester * 5), 150 + (semester * 10));
        }
    }

    generateAlternatingSection(startY, endY, semester) {
        let y = startY;
        let isMoving = false;
        
        while (y > endY) {
            const x = Phaser.Math.Between(this.platformWidth + 100, this.gameWidth - this.platformWidth - 100);
            
            if (isMoving) {
                const platform = this.createMovingPlatform(x, y);
                const moveDistance = this.config.baseMoveDistance + (semester * this.config.distanceIncrease);
                const duration = this.config.baseSpeed - (semester * this.config.speedIncrease);
                
                this.scene.tweens.add({
                    targets: platform,
                    x: x + (Math.random() < 0.5 ? moveDistance : -moveDistance),
                    duration: duration,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else {
                this.createPlatform(x, y);
            }
            
            isMoving = !isMoving;
            y -= Phaser.Math.Between(this.config.minGap, this.config.maxGap);
        }
    }

    generateChaosSection(startY, endY, semester) {
        let y = startY;
        
        while (y > endY) {
            const x = Phaser.Math.Between(this.platformWidth + 100, this.gameWidth - this.platformWidth - 100);
            const platformType = Math.random();
            
            if (platformType < this.config.movingChance) {
                const platform = this.createMovingPlatform(x, y);
                platform.isDisappearing = Math.random() < 0.5;
                
                const moveDistance = this.config.baseMoveDistance + (semester * this.config.distanceIncrease);
                const duration = this.config.baseSpeed - (semester * this.config.speedIncrease);
                
                this.scene.tweens.add({
                    targets: platform,
                    x: x + (Math.random() < 0.5 ? moveDistance : -moveDistance),
                    duration: duration,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else {
                const platform = this.createPlatform(x, y);
                platform.isDisappearing = Math.random() < this.config.disappearingChance;
            }
            
            y -= Phaser.Math.Between(this.config.minGap, this.config.maxGap);
        }
    }

    createPlatform(x, y) {
        const platform = this.platformGroup.create(x, y, 'platform');
        
        // Set default color for static platforms
        platform.setTint(0xFFFFFF); // White for regular platforms
        
        // If it's a disappearing platform, make it orange
        if (platform.isDisappearing) {
            platform.setTint(0xFF4500); // Brighter orange
        }
        
        return platform;
    }

    createMovingPlatform(x, y) {
        const platform = this.movingPlatformGroup.create(x, y, 'platform');
        platform.body.allowGravity = false;
        platform.body.immovable = true;
        
        // Set color based on platform type
        if (platform.isDisappearing) {
            platform.setTint(0x9932CC); // Bright purple for disappearing moving platforms
        } else {
            platform.setTint(0x00FF00); // Bright green for moving platforms
        }
        
        return platform;
    }

    createFinishPlatform(x, y) {
        const platform = this.platformGroup.create(x, y, 'platform');
        platform.setTint(0xFFD700); // Gold color
        platform.setScale(2, 1); // Make it wider
        platform.isFinish = true;
        
        // Add visual indicator (trophy or text)
        this.scene.add.text(x, y - 50, '🏆 Finish! 🏆', {
            font: '24px Arial',
            fill: '#FFD700'
        }).setOrigin(0.5);
        
        return platform;
    }

    generatePowerUps() {
        let y = this.gameHeight - 400;
        
        while (y > -7800) {
            const x = Phaser.Math.Between(50, this.gameWidth - 50);
            
            // Alternate between jump boost and slow fall power-ups
            const powerUpType = Math.random() < 0.5 ? 'jumpBoost' : 'slowFall';
            
            // Create power-up with appropriate image
            const powerUp = this.powerUpGroup.create(x, y, 
                powerUpType === 'jumpBoost' ? 'powerUp' : 'slowFallPowerUp'
            );
            powerUp.powerUpType = powerUpType;
            
            // Add spinning animation
            this.scene.tweens.add({
                targets: powerUp,
                angle: 360,
                duration: 1500,
                repeat: -1
            });
            
            y -= Phaser.Math.Between(1000, 1500);
        }
    }
}