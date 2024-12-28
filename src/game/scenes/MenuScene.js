import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    init(data) {
        // Try to load saved progress first
        const savedProgress = this.loadProgress();
        
        if (data?.levels !== undefined && data?.playedLevels !== undefined) {
            // Use data passed from other scenes
            this.levels = data.levels;
            this.playedLevels = data.playedLevels;
        } else if (savedProgress) {
            // Use saved progress if no data was passed
            this.levels = savedProgress.levels;
            this.playedLevels = savedProgress.playedLevels;
        } else {
            // Initialize new arrays if nothing exists
            this.levels = [1, 2, 3, 4, 5];
            this.playedLevels = [];
        }

        // If all levels have been played, reset
        if (this.levels.length === 0) {
            this.levels = [1, 2, 3, 4, 5];
            this.playedLevels = [];
        }

        // Save current state
        this.saveProgress();

        console.log('MenuScene - Available Levels:', this.levels);
        console.log('MenuScene - Played Levels:', this.playedLevels);
    }

    preload() {
    }

    create() {
        // Set background color to blue
        this.cameras.main.setBackgroundColor('#1a237e');  // Deep blue

        const startText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Start Game', {
            font: '32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startText.on('pointerup', async () => {
            // Check if all levels have been played
            if (this.levels.length === 0) {
                this.levels = [1, 2, 3, 4, 5];
                this.playedLevels = [];
            }

            const randomIndex = Math.floor(Math.random() * this.levels.length);
            const randomLevel = this.levels[randomIndex];

            this.saveProgress();

            if (this.isMobile) {
                // We're on mobile, check for gyroscope permissions
                if (typeof DeviceOrientationEvent !== 'undefined' &&
                    typeof DeviceOrientationEvent.requestPermission === 'function'
                ) {
                    try {
                        // Request permission for iOS 13+
                        const permissionState = await DeviceOrientationEvent.requestPermission();
                        if (permissionState === 'granted') {
                            this.scene.start('main', {
                                level: randomLevel,
                                controlMethod: 'gyroscope',
                                levels: this.levels,
                                playedLevels: this.playedLevels
                            });
                        } else {
                            this.showDeniedMessage();
                        }
                    } catch (error) {
                        console.error('Gyroscope permission error:', error);
                        this.showDeniedMessage();
                    }
                } else {
                    // Older iOS or Android, no need for permission
                    this.scene.start('main', {
                        level: randomLevel,
                        controlMethod: 'gyroscope',
                        levels: this.levels,
                        playedLevels: this.playedLevels
                    });
                }
            } else {
                // On desktop, go to controls selection
                this.scene.start('controls', {
                    difficulty: randomLevel,
                    levels: this.levels,
                    playedLevels: this.playedLevels
                });
            }
        });

        // Add mobile detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // If on mobile, you might want to skip the controls scene and go straight to gyroscope
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

            questionMark.setOrigin(1, 0); // Align to the top right
            questionMark.setInteractive({ useHandCursor: true });

            questionMark.on('pointerup', () => {
                this.showInstructionsOverlay();
            });
        }
    }

    // Zobrazí upozornenie, že používateľ odmietol prístup k gyroskopu
    /*showDeniedMessage() {
    showDeniedMessage() {
        const msg = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'Povolenie zamietnuté :(',
            { font: '18px Arial', fill: '#ff0000' }
        ).setOrigin(0.5);

    }*/
    

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

    saveProgress() {
        const progress = {
            levels: this.levels,
            playedLevels: this.playedLevels,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('gameProgress', JSON.stringify(progress));
    }

    loadProgress() {
        const savedProgress = localStorage.getItem('gameProgress');
        return savedProgress ? JSON.parse(savedProgress) : null;
    }

    showDeniedMessage() {
        const msg = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'Povolenie zamietnuté :(',
            { font: '18px Arial', fill: '#ff0000' }
        ).setOrigin(0.5);

        // Remove message after 2 seconds
        this.time.delayedCall(2000, () => {
            msg.destroy();
        });
    }
}