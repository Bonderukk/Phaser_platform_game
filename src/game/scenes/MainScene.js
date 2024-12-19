import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('main');
    }

    init(data) {
        // data.difficulty bude obsahovať vybraný semester (1-6)
        this.selectedDifficulty = data.difficulty || 1;
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

        this.player = this.physics.add.sprite(centerX, groundY, 'player');

        // Nastavíme kolízie s hranicami sveta
        this.player.setCollideWorldBounds(true);

        // Nastavíme gravitáciu
        this.player.setGravityY(500);

        // Nastavíme odraz (bounce) pri dopade na spodnú hranu
        this.player.setBounce(1);

        this.player.setVelocityY(-700);
    }

    update() {
        // herná logika
    }
}