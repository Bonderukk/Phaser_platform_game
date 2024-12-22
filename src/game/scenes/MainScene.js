import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('main');
        this.gyroHandler = this.gyroHandler.bind(this);
    }

    init(data) {
        this.selectedDifficulty = data.difficulty || 1;
        this.controlMethod = data.controlMethod || 'mouse';
    }

    preload() {
        this.load.image('player', 'game/assets/player.png');
    }

    create() {
        this.add.text(10, 10, `Zvolená obtiažnosť: ${this.selectedDifficulty}. semester`, { font: '20px Arial', fill: '#fff' });

        // Nastavíme fyziku pre scénu
        this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

        // Pridáme hráča doprostred spodnej časti obrazovky
        const centerX = this.cameras.main.width / 2;
        const groundY = this.cameras.main.height - 50;

        this.player = this.physics.add.sprite(centerX, groundY, 'player')
            .setCollideWorldBounds(true)
            .setGravityY(300)
            .setBounce(1);

        this.player.setVelocityY(-600);

        this.maxHorizontalVelocity = 300;

        // Nastavíme klávesové vstupy
        if (this.controlMethod === 'keyboard') {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.keys = this.input.keyboard.addKeys({
                'A': Phaser.Input.Keyboard.KeyCodes.A,
                'D': Phaser.Input.Keyboard.KeyCodes.D
            });
        } else if (this.controlMethod === 'gyroscope') {
            window.addEventListener('deviceorientation', this.gyroHandler);
        }

        // this.debugText = this.add.text(10, 50, 'Debug log:', { font: '16px Arial', fill: '#fff' });
    }

    // Handler pre gyroskop
    gyroHandler(event) {
        // gamma: náklon do strán (od -90 do 90)
        // Pozitívna gamma: telefón naklonený doprava
        // Negatívna gamma: telefón naklonený doľava
        const gamma = event.gamma || 0;
        // Napr. gamma 0 = žiadne naklonenie, gamma 20 = naklonenie doprava
        const speedFactor = 10;
        let newVelocityX = gamma * speedFactor;

        if (newVelocityX > this.maxHorizontalVelocity) {
            newVelocityX = this.maxHorizontalVelocity;
        } else if (newVelocityX < -this.maxHorizontalVelocity) {
            newVelocityX = -this.maxHorizontalVelocity;
        }

        // this.debugText.setText(`gamma: ${gamma.toFixed(2)}\nvelocityX: ${newVelocityX.toFixed(2)}`);

        if (this.player && this.player.body) {
            this.player.setVelocityX(newVelocityX);
        }
    }

    update() {
        if (this.controlMethod === 'mouse') {
            // Ovládanie myšou
            const pointer = this.input.activePointer;
            const dx = pointer.x - this.player.x;
            const speedFactor = 2;
            let newVelocityX = dx * speedFactor;

            if (newVelocityX > this.maxHorizontalVelocity) {
                newVelocityX = this.maxHorizontalVelocity;
            } else if (newVelocityX < -this.maxHorizontalVelocity) {
                newVelocityX = -this.maxHorizontalVelocity;
            }
            this.player.setVelocityX(newVelocityX);

        } else if (this.controlMethod === 'keyboard') {
            // Ovládanie klávesnicou
            let velocityX = 0;

            // Šípky
            if (this.cursors.left.isDown) {
                velocityX = -this.maxHorizontalVelocity;
            } else if (this.cursors.right.isDown) {
                velocityX = this.maxHorizontalVelocity;
            }

            // A/D
            if (this.keys.A.isDown) {
                velocityX = -this.maxHorizontalVelocity;
            } else if (this.keys.D.isDown) {
                velocityX = this.maxHorizontalVelocity;
            }

            this.player.setVelocityX(velocityX);
        }
    }

    shutdown() {
        window.removeEventListener('deviceorientation', this.gyroHandler);
    }

    destroy() {
        super.destroy();
        window.removeEventListener('deviceorientation', this.gyroHandler);
    }
}