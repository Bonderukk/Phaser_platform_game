import Phaser from 'phaser';

export default class PlatformGenerator {
    constructor(scene, difficulty) {
        this.scene = scene;
        this.difficulty = difficulty;
        this.platformGroup = scene.physics.add.staticGroup();
        this.movingPlatformGroup = scene.physics.add.group();
        this.gameWidth = scene.cameras.main.width;
        this.gameHeight = scene.cameras.main.height;
        this.platformWidth = 100;
        this.platformHeight = 20;
        
        // Maximum jump height calculation (based on physics)
        this.maxJumpHeight = 200; // Adjust based on player's jump velocity
        this.finishLine = null; // Add this to track the finish platform
    }

    generatePlatforms() {
        this.platformGroup.clear(true, true);
        if (this.movingPlatformGroup) {
            this.movingPlatformGroup.clear(true, true);
        }

        switch(this.difficulty) {
            case 1:
                this.generateFirstSemester();
                break;
            case 2:
                this.generateSecondSemester();
                break;
            case 3:
                this.generateThirdSemester();
                break;
            case 4:
                this.generateFourthSemester();
                break;
            case 5:
                this.generateFifthSemester();
                break;
        }
        
        // Add finish line at the top
        this.finishLine = this.createFinishPlatform(this.gameWidth / 2, -1600);
        
        return [this.platformGroup, this.movingPlatformGroup];
    }

    generateFirstSemester() {
        // Beginner-friendly: Consistent spacing and clear path
        this.createPlatform(this.gameWidth / 2, this.gameHeight - 100);
        
        let y = this.gameHeight - 250;
        let prevX = this.gameWidth / 2;
        
        while (y > -1500) {
            const minX = Math.max(this.platformWidth, prevX - 200);
            const maxX = Math.min(this.gameWidth - this.platformWidth, prevX + 200);
            const x = Phaser.Math.Between(minX, maxX);
            
            this.createPlatform(x, y);
            prevX = x;
            y -= Phaser.Math.Between(100, 160); // Variable but manageable gaps
        }
    }

    generateSecondSemester() {
        // Starting platform
        this.createPlatform(this.gameWidth / 2, this.gameHeight - 100);
        
        let y = this.gameHeight - 250;
        let prevX = this.gameWidth / 2;
        let platformCount = 0;
        
        while (y > -1500) {
            const minX = Math.max(this.platformWidth, prevX - 200);
            const maxX = Math.min(this.gameWidth - this.platformWidth, prevX + 200);
            const x = Phaser.Math.Between(minX, maxX);
            
            // Every third platform is moving
            if (platformCount % 3 === 1) {
                const platform = this.createMovingPlatform(x, y);
                
                // Horizontal movement
                this.scene.tweens.add({
                    targets: platform,
                    x: x + 100,  // Smaller movement range than semester 3
                    duration: 2500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else {
                // Static platforms with different colors
                const platform = this.createPlatform(x, y);
                
                // Every 5th platform is slightly larger
                if (platformCount % 5 === 0) {
                    platform.setScale(1.5, 1);
                    platform.setTint(0x00ffff); // Cyan color for larger platforms
                }
            }
            
            prevX = x;
            y -= Phaser.Math.Between(120, 150); // Consistent gaps for better learning
            platformCount++;
        }
    }

    generateThirdSemester() {
        // Moving platforms with safe zones
        this.createPlatform(this.gameWidth / 2, this.gameHeight - 100);
        
        let y = this.gameHeight - 250;
        
        while (y > -1500) {
            const x = Phaser.Math.Between(this.platformWidth + 100, this.gameWidth - this.platformWidth - 100);
            
            // Every other platform moves
            if (y % 300 < 170) {
                const platform = this.createMovingPlatform(x, y);
                platform.setImmovable(true);
                
                // Randomly decide movement direction
                const moveDistance = 150;
                const moveDirection = Math.random() < 0.5 ? moveDistance : -moveDistance;
                
                // Make sure platform won't move outside the game bounds
                const finalX = moveDirection > 0 
                    ? Math.min(x + moveDirection, this.gameWidth - this.platformWidth - 50)
                    : Math.max(x + moveDirection, this.platformWidth + 50);
                
                this.scene.tweens.add({
                    targets: platform,
                    x: finalX,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else {
                this.createPlatform(x, y);
            }
            
            y -= 170;
        }
    }

    generateFourthSemester() {
        // Disappearing platforms with safe checkpoints
        this.createPlatform(this.gameWidth / 2, this.gameHeight - 100);
        
        let y = this.gameHeight - 250;
        let platformCount = 0;
        
        while (y > -1500) {
            const x = Phaser.Math.Between(this.platformWidth, this.gameWidth - this.platformWidth);
            
            // Every second platform moves
            if (platformCount % 2 === 0) {
                const platform = this.createMovingPlatform(x, y);
                platform.setImmovable(true);
                platform.isDisappearing = true;  // Make moving platforms also disappear
                
                // Randomly decide movement direction
                const moveDistance = 150;
                const moveDirection = Math.random() < 0.5 ? moveDistance : -moveDistance;
                
                this.scene.tweens.add({
                    targets: platform,
                    x: x + moveDirection,
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
            // The rest are just disappearing platforms
            else {
                const platform = this.createPlatform(x, y);
                platform.isDisappearing = true;
            }
            
            y -= 120;
            platformCount++;
        }
    }

    generateFifthSemester() {
        // Complex combination with strategic safe spots
        this.createPlatform(this.gameWidth / 2, this.gameHeight - 100);
        
        let y = this.gameHeight - 250;
        
        while (y > -1500) {
            const x = Phaser.Math.Between(this.platformWidth + 100, this.gameWidth - this.platformWidth - 100);
            
            // Every platform is either moving or static, but all disappear
            if (Math.random() > 0.4) { // 60% chance for moving platform
                const platform = this.createMovingPlatform(x, y);
                platform.setImmovable(true);
                platform.isDisappearing = true;
                
                // Random movement parameters
                const moveDistance = Phaser.Math.Between(150, 250);
                const moveDirection = Math.random() < 0.5 ? moveDistance : -moveDistance;
                const duration = Phaser.Math.Between(1000, 2000);
                
                // Create movement tween
                const movementTween = this.scene.tweens.add({
                    targets: platform,
                    x: x + moveDirection,
                    duration: duration,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                // Randomly change direction every few seconds
                this.scene.time.addEvent({
                    delay: Phaser.Math.Between(3000, 6000),
                    callback: () => {
                        if (platform.active) { // Check if platform still exists
                            const newDirection = Phaser.Math.Between(-250, 250);
                            movementTween.stop();
                            this.scene.tweens.add({
                                targets: platform,
                                x: x + newDirection,
                                duration: Phaser.Math.Between(1000, 2000),
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut'
                            });
                        }
                    },
                    repeat: -1
                });
            } else {
                // Static but disappearing platform
                const platform = this.createPlatform(x, y);
                platform.isDisappearing = true;
            }
            
            y -= Phaser.Math.Between(100, 140); // More challenging gaps
        }
    }

    createPlatform(x, y) {
        return this.platformGroup.create(x, y, 'platform');
    }

    createMovingPlatform(x, y) {
        const platform = this.movingPlatformGroup.create(x, y, 'platform');
        platform.body.allowGravity = false;  // Disable gravity
        platform.body.immovable = true;      // Make it immovable
        return platform;
    }

    createFinishPlatform(x, y) {
        const platform = this.platformGroup.create(x, y, 'platform');
        platform.setTint(0xFFD700); // Gold color
        platform.setScale(2, 1); // Make it wider
        platform.isFinish = true; // Mark as finish line
        
        // Add visual indicator (trophy or text)
        this.scene.add.text(x, y - 50, '🏆 Finish! 🏆', {
            font: '24px Arial',
            fill: '#FFD700'
        }).setOrigin(0.5);
        
        return platform;
    }
}