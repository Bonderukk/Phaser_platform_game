import Phaser from 'phaser';
import data from '../difficulties.json';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    preload() {
    }

    create() {
        const difficulties = data.difficulties;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const startY = centerY - (difficulties.length * 30)/2;
        difficulties.forEach((diff, index) => {
            const yPos = startY + index * 30;
            const text = this.add.text(centerX, yPos, diff.label, { font: '20px Arial', fill: '#ffffff' });
            text.setOrigin(0.5);
            text.setInteractive({ useHandCursor: true });

            text.on('pointerup', () => {
                this.scene.start('controls', { difficulty: diff.value });
            });

            text.on('pointerover', () => {
                text.setStyle({ fill: '#ff0' });
            });
            text.on('pointerout', () => {
                text.setStyle({ fill: '#fff' });
            });
        });
    }
}