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
        // Set FEI STU background color
        this.cameras.main.setBackgroundColor('#003366');
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Add FEI STU logo text
        const titleText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 150,
            'FEI Jump',
            {
                font: 'bold 64px Arial',
                fill: '#FFFFFF',
                stroke: '#0066CC',
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        const buttonStyle = {
            font: 'bold 42px Arial',
            fill: '#FFFFFF',
            padding: { x: 50, y: 25 }
        };

        // Create button backgrounds with graphics
        const createButtonBackground = (x, y, width, height) => {
            const graphics = this.add.graphics();
            graphics.fillStyle(0x0066CC, 1);
            graphics.lineStyle(2, 0x0088FF, 1);
            graphics.fillRoundedRect(x - width/2, y - height/2, width, height, 16);
            graphics.strokeRoundedRect(x - width/2, y - height/2, width, height, 16);
            return graphics;
        };

        // Create backgrounds first
        const easyBg = createButtonBackground(
            this.cameras.main.centerX, 
            this.cameras.main.centerY - 30,
            500,
            90
        );

        const hardBg = createButtonBackground(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 110,
            500,
            90
        );

        // Create text on top of backgrounds
        const easyModeText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 30,
            'Hrať ľahkú obtiažnosť',
            buttonStyle
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const hardModeText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 110,
            'Hrať ťažkú obtiažnosť',
            buttonStyle
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Enhanced hover effects
        [easyModeText, hardModeText].forEach((text, index) => {
            const bg = index === 0 ? easyBg : hardBg;
            
            // Add constant subtle pulsing animation
            this.tweens.add({
                targets: bg,
                alpha: 0.8,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            text.on('pointerover', () => {
                // Stop the pulsing animation
                this.tweens.killTweensOf(bg);
                
                bg.clear();
                bg.fillStyle(0x003366, 1);
                bg.lineStyle(4, 0x0088FF, 1);
                bg.fillRoundedRect(
                    text.x - 250,
                    text.y - 45,
                    500,
                    90,
                    16
                );
                bg.strokeRoundedRect(
                    text.x - 250,
                    text.y - 45,
                    500,
                    90,
                    16
                );

                // Scale only the text, reduced to 1.1x
                this.tweens.add({
                    targets: text,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 300,
                    ease: 'Back.easeOut'
                });
            });

            text.on('pointerout', () => {
                bg.clear();
                bg.fillStyle(0x0066CC, 1);
                bg.lineStyle(2, 0x0088FF, 1);
                bg.fillRoundedRect(
                    text.x - 250,
                    text.y - 45,
                    500,
                    90,
                    16
                );
                bg.strokeRoundedRect(
                    text.x - 250,
                    text.y - 45,
                    500,
                    90,
                    16
                );

                // Return only the text to original scale
                this.tweens.add({
                    targets: text,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300,
                    ease: 'Back.easeOut'
                });

                // Restart the pulsing animation
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

        // Update question mark styling for mobile
        if (this.isMobile) {
            // Create background for question mark
            const questionMarkBg = this.add.graphics();
            questionMarkBg.fillStyle(0x0066CC, 1);
            questionMarkBg.lineStyle(2, 0x0088FF, 1);
            questionMarkBg.fillRoundedRect(
                this.cameras.main.width - 80,
                20,
                50,
                50,
                12
            );
            questionMarkBg.strokeRoundedRect(
                this.cameras.main.width - 80,
                20,
                50,
                50,
                12
            );

            const questionMark = this.add.text(
                this.cameras.main.width - 55,
                45,
                '?',
                {
                    font: 'bold 40px Arial',
                    fill: '#FFFFFF'
                }
            ).setOrigin(0.5);

            // Make both the background and text interactive
            questionMark.setInteractive({ useHandCursor: true });
            
            // Add hover effects
            questionMark.on('pointerover', () => {
                questionMarkBg.clear();
                questionMarkBg.fillStyle(0x003366, 1);
                questionMarkBg.lineStyle(2, 0x0088FF, 1);
                questionMarkBg.fillRoundedRect(
                    this.cameras.main.width - 80,
                    20,
                    50,
                    50,
                    12
                );
                questionMarkBg.strokeRoundedRect(
                    this.cameras.main.width - 80,
                    20,
                    50,
                    50,
                    12
                );
            });

            questionMark.on('pointerout', () => {
                questionMarkBg.clear();
                questionMarkBg.fillStyle(0x0066CC, 1);
                questionMarkBg.lineStyle(2, 0x0088FF, 1);
                questionMarkBg.fillRoundedRect(
                    this.cameras.main.width - 80,
                    20,
                    50,
                    50,
                    12
                );
                questionMarkBg.strokeRoundedRect(
                    this.cameras.main.width - 80,
                    20,
                    50,
                    50,
                    12
                );
            });

            questionMark.on('pointerup', () => {
                this.showInstructionsOverlay();
            });
        }

        easyModeText.on('pointerup', async () => {
            // Skontrolujeme, či máme ešte dostupné levely
            if (this.levels.length === 0) {
                this.levels = [1, 2, 3, 4, 5];
                this.playedLevels = [];
            }
            const randomIndex = Math.floor(Math.random() * this.levels.length);
            const randomLevel = this.levels[randomIndex];

            this.saveProgress();

            if (this.isMobile) {
                if (typeof DeviceOrientationEvent !== 'undefined' &&
                    typeof DeviceOrientationEvent.requestPermission === 'function'
                ) {
                    try {
                        const permissionState = await DeviceOrientationEvent.requestPermission();
                        if (permissionState === 'granted') {
                            this.scene.start('main', {
                                level: randomLevel,
                                controlMethod: 'gyroscope',
                                gameMode: 'easy',
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
                    this.scene.start('main', {
                        level: randomLevel,
                        controlMethod: 'gyroscope',
                        gameMode: 'easy',
                        levels: this.levels,
                        playedLevels: this.playedLevels
                    });
                }
            } else {
                this.scene.start('controls', {
                    difficulty: randomLevel,
                    gameMode: 'easy',
                    levels: this.levels,
                    playedLevels: this.playedLevels
                });
            }
        });

        hardModeText.on('pointerup', async () => {
            // Skontrolujeme, či máme ešte dostupné levely
            if (this.levels.length === 0) {
                this.levels = [1, 2, 3, 4, 5];
                this.playedLevels = [];
            }
            const randomIndex = Math.floor(Math.random() * this.levels.length);
            const randomLevel = this.levels[randomIndex];

            this.saveProgress();

            if (this.isMobile) {
                if (typeof DeviceOrientationEvent !== 'undefined' &&
                    typeof DeviceOrientationEvent.requestPermission === 'function'
                ) {
                    try {
                        const permissionState = await DeviceOrientationEvent.requestPermission();
                        if (permissionState === 'granted') {
                            this.scene.start('main', {
                                level: randomLevel,
                                controlMethod: 'gyroscope',
                                gameMode: 'hard',
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
                    this.scene.start('main', {
                        level: randomLevel,
                        controlMethod: 'gyroscope',
                        gameMode: 'hard',
                        levels: this.levels,
                        playedLevels: this.playedLevels
                    });
                }
            } else {
                this.scene.start('controls', {
                    difficulty: randomLevel,
                    gameMode: 'hard',
                    levels: this.levels,
                    playedLevels: this.playedLevels
                });
            }
        });
    }

    showInstructionsOverlay() {
        const overlay = this.add.rectangle(
            0,
            0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000
        ).setOrigin(0).setAlpha(0.8);

        const instructionsText = 
            `Popis hry\n\n` +
            `FEI Jump je jednoduchá skákacia hra. Cieľom hry je dostať sa na\n` +
            `finálnu platformu bez toho, aby ste spadli. Po ceste budete zbierať\n` +
            `boostery, ktoré vám pomôžu zdolať jednotlivé semestre našej školy až\n` +
            `kým sa nedostanete na vrchol.\n\n` +
            `Ovládanie:\n\n` +
            `🖱️  Myš (desktop): Panáčik sa hýbe podľa pozície kurzora.\n\n` +
            `⌨️  Klávesnica (desktop): Šípky vľavo/vpravo alebo klávesy A/D na pohyb.\n\n` +
            `📱  Gyroskop (mobil): Nakláňajte telefón, aby sa panáčik pohyboval doľava či doprava.`;

        const instructions = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            instructionsText,
            {
                font: '20px Arial',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 10,
                wordWrap: { 
                    width: this.cameras.main.width * 0.8,
                    useAdvancedWrap: true
                }
            }
        ).setOrigin(0.5);

        const closeText = this.add.text(
            this.cameras.main.width / 2,
            instructions.y + instructions.displayHeight / 2 + 40,
            'Zavrieť',
            { font: '24px Arial', fill: '#ff4444' }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

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