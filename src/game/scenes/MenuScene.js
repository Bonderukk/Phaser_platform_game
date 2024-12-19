import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    preload() {
    }

    create() {
        const difficulties = [
            { label: '1. semester', value: 1 },
            { label: '2. semester', value: 2 },
            { label: '3. semester', value: 3 },
            { label: '4. semester', value: 4 },
            { label: '5. semester', value: 5 },
            { label: '6. semester', value: 5 }
        ];

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const startY = centerY - (difficulties.length * 30)/2;
        difficulties.forEach((diff, index) => {
            const yPos = startY + index * 30;
            const text = this.add.text(centerX, yPos, diff.label, { font: '20px Arial', fill: '#ffffff' });
            text.setOrigin(0.5);
            text.setInteractive({ useHandCursor: true });

            text.on('pointerup', () => {
                this.scene.start('main', { difficulty: diff.value });
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