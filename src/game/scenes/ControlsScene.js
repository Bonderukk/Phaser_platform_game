import Phaser from 'phaser';

export default class ControlsScene extends Phaser.Scene {
    constructor() {
        super('controls');
    }

    init(data) {
        this.selectedDifficulty = data.difficulty;
        this.levels = data.levels;
        this.playedLevels = data.playedLevels;
        this.gameMode = data.gameMode || 'hard';
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.text(centerX, centerY - 100, 'Vyber si ovládanie', { 
            font: 'bold 42px Arial', 
            fill: '#FFFFFF',
            stroke: '#0066CC',
            strokeThickness: 6
        }).setOrigin(0.5);

        const createButtonBackground = (x, y, width, height) => {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x0066CC, 1);
            graphics.lineStyle(2, 0x0088FF, 1);
            graphics.fillRoundedRect(x - width/2, y - height/2, width, height, 16);
            graphics.strokeRoundedRect(x - width/2, y - height/2, width, height, 16);
            return graphics;
        };

        const mouseBg = createButtonBackground(centerX, centerY - 20, 300, 70);
        const keyboardBg = createButtonBackground(centerX, centerY + 70, 300, 70);

        const mouseText = this.add.text(centerX, centerY - 20, 'Myš', { 
            font: 'bold 36px Arial', 
            fill: '#FFFFFF',
            padding: { x: 40, y: 20 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const keyboardText = this.add.text(centerX, centerY + 70, 'Klávesnica', { 
            font: 'bold 36px Arial', 
            fill: '#FFFFFF',
            padding: { x: 40, y: 20 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        [mouseText, keyboardText].forEach((text, index) => {
            const bg = index === 0 ? mouseBg : keyboardBg;
            
            this.tweens.add({
                targets: bg,
                alpha: 0.8,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            text.on('pointerover', () => {
                this.tweens.killTweensOf(bg);
                
                bg.clear();
                bg.fillStyle(0x003366, 1);
                bg.lineStyle(4, 0x0088FF, 1);
                bg.fillRoundedRect(
                    text.x - 150,
                    text.y - 35,
                    300,
                    70,
                    16
                );
                bg.strokeRoundedRect(
                    text.x - 150,
                    text.y - 35,
                    300,
                    70,
                    16
                );

                this.tweens.add({
                    targets: text,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 300,
                    ease: 'Back.easeOut'
                });
            });

            text.on('pointerout', () => {
                bg.clear();
                bg.fillStyle(0x0066CC, 1);
                bg.lineStyle(2, 0x0088FF, 1);
                bg.fillRoundedRect(
                    text.x - 150,
                    text.y - 35,
                    300,
                    70,
                    16
                );
                bg.strokeRoundedRect(
                    text.x - 150,
                    text.y - 35,
                    300,
                    70,
                    16
                );

                this.tweens.add({
                    targets: text,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300,
                    ease: 'Back.easeOut'
                });

                this.tweens.add({
                    targets: bg,
                    alpha: 0.8,
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            });
        });

        mouseText.on('pointerup', () => {
            this.scene.start('main', { 
                level: this.selectedDifficulty, 
                controlMethod: 'mouse',
                gameMode: this.gameMode,
                levels: this.levels,
                playedLevels: this.playedLevels
            });
        });

        keyboardText.on('pointerup', () => {
            this.scene.start('main', { 
                level: this.selectedDifficulty, 
                controlMethod: 'keyboard',
                gameMode: this.gameMode,
                levels: this.levels,
                playedLevels: this.playedLevels
            });
        });
    }
}