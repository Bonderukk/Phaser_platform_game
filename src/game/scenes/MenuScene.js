import Phaser from 'phaser';
import data from '../difficulties.json';

function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini/i.test(userAgent);
}

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

        this.isMobile = isMobileDevice();

        difficulties.forEach((diff, index) => {
            const yPos = startY + index * 30;
            const text = this.add.text(centerX, yPos, diff.label, { font: '20px Arial', fill: '#ffffff' });
            text.setOrigin(0.5);
            text.setInteractive({ useHandCursor: true });

            text.on('pointerup', async () => {
                if (this.isMobile) {
                    // Sme na mobile, chceme ovládanie gyroskopom

                    // Najprv skontrolujeme, či sme na novšom iOS (>= 13),
                    // ktoré vyžaduje requestPermission.
                    if (
                        typeof DeviceOrientationEvent !== 'undefined' &&
                        typeof DeviceOrientationEvent.requestPermission === 'function'
                    ) {
                        try {
                            // Požiadame o prístup k motion & orientation
                            const permissionState = await DeviceOrientationEvent.requestPermission();
                            if (permissionState === 'granted') {
                                // Máme povolenie, môžeme ísť do MainScene
                                this.scene.start('main', {
                                    difficulty: diff.value,
                                    controlMethod: 'gyroscope'
                                });
                            } else {
                                // Používateľ odmietol prístup
                                this.showDeniedMessage();
                            }
                        } catch (error) {
                            console.error('Gyroscope requestPermission error:', error);
                            // Fallback / show error
                        }
                    } else {
                        // Staršie iOS alebo Android, kde netreba requestPermission
                        this.scene.start('main', {
                            difficulty: diff.value,
                            controlMethod: 'gyroscope'
                        });
                    }

                } else {
                    // Na desktope pokračujeme do ControlsScene (myš / klávesnica)
                    this.scene.start('controls', { difficulty: diff.value });
                }
            });

            text.on('pointerover', () => {
                text.setStyle({ fill: '#ff0' });
            });
            text.on('pointerout', () => {
                text.setStyle({ fill: '#fff' });
            });
        });
    }

    // Zobrazí upozornenie, že používateľ odmietol prístup k gyroskopu
    /*showDeniedMessage() {
        const msg = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'Povolenie zamietnuté :(',
            { font: '18px Arial', fill: '#ff0000' }
        ).setOrigin(0.5);

    }*/
}