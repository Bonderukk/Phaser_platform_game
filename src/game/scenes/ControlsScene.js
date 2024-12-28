import Phaser from 'phaser';

export default class ControlsScene extends Phaser.Scene {
    constructor() {
        super('controls');
    }

    init(data) {
        this.selectedDifficulty = data.difficulty;
        this.levels = data.levels;
        this.playedLevels = data.playedLevels;
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.text(centerX, centerY - 40, 'Vyber si ovládanie', { font: '24px Arial', fill: '#fff' }).setOrigin(0.5);

        const mouseText = this.add.text(centerX, centerY, 'Myš', { font: '20px Arial', fill: '#ffffff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        const keyboardText = this.add.text(centerX, centerY + 40, 'Klávesnica', { font: '20px Arial', fill: '#ffffff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        mouseText.on('pointerup', () => {
            this.scene.start('main', { 
                level: this.selectedDifficulty, 
                controlMethod: 'mouse',
                levels: this.levels,
                playedLevels: this.playedLevels
            });
        });

        keyboardText.on('pointerup', () => {
            this.scene.start('main', { 
                level: this.selectedDifficulty, 
                controlMethod: 'keyboard',
                levels: this.levels,
                playedLevels: this.playedLevels
            });
        });

        const hoverIn = (txt) => txt.setStyle({ fill: '#ff0' });
        const hoverOut = (txt) => txt.setStyle({ fill: '#fff' });

        mouseText.on('pointerover', () => hoverIn(mouseText));
        mouseText.on('pointerout', () => hoverOut(mouseText));

        keyboardText.on('pointerover', () => hoverIn(keyboardText));
        keyboardText.on('pointerout', () => hoverOut(keyboardText));
    }
}