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
        // načítanie assetov
    }

    create() {
        this.add.text(10, 10, `Zvolená obtiažnosť: ${this.selectedDifficulty}. semester`, { font: '20px Arial', fill: '#fff' });
    }

    update() {
        // herná logika
    }
}