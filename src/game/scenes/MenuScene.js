import Phaser from 'phaser';
import data from '../difficulties.json';
import {isMobileDevice} from "../../utils/isMobileDevice.js";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    preload() {
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a237e'); 
        const difficulties = data.difficulties;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const startY = centerY - (difficulties.length * 30)/2;

        this.isMobile = isMobileDevice();

        if (this.isMobile) {
            const questionMark = this.add.text(
                this.cameras.main.width - 100,
                50,
                '?',
                {
                    font: '50px Arial',
                    fill: '#ff0',
                }
            );

            questionMark.setOrigin(1, 0); // zarovnať vpravo hore
            questionMark.setInteractive({ useHandCursor: true });

            questionMark.on('pointerup', () => {
                this.showInstructionsOverlay();
            });
        }

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
    showDeniedMessage() {
        const msg = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'Povolenie zamietnuté :(',
            { font: '18px Arial', fill: '#ff0000' }
        ).setOrigin(0.5);
    }

    showInstructionsOverlay() {
        const overlay = this.add.rectangle(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000
        )
            .setOrigin(0)
            .setAlpha(0.8)

        const instructionsText =
            `Popis hry
FEI Jump je jednoduchá skákacia hra. Cieľom hry je dostať sa na finálnu platformu bez toho, aby ste spadli.

Ovládanie:
  • Myš (desktop): Panáčik sa hýbe podľa pozície kurzora.
  • Klávesnica (desktop): Šípky vľavo/vpravo alebo klávesy A/D na pohyb.
  • Gyroskop (mobil): Nakláňajte telefón, aby sa panáčik pohyboval doľava či doprava.
`;

        const instructions = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            instructionsText,
            {
                font: '20px Arial',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: this.cameras.main.width * 0.8 }
            }
        )
            .setOrigin(0.5);

        const closeText = this.add.text(
            this.cameras.main.width / 2,
            instructions.y + instructions.displayHeight / 2 + 40,
            'Zavrieť',
            { font: '24px Arial', fill: '#ff4444' }
        )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        closeText.on('pointerup', () => {
            overlay.destroy();
            instructions.destroy();
            closeText.destroy();
        });
    }
}