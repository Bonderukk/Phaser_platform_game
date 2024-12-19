import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('main');
    }

    preload() {
        // načítanie assetov
    }

    create() {
        // inicializácia herných objektov
        this.add.text(100, 100, 'Hello from Phaser', { font: '24px Arial', fill: '#ffffff' });
    }

    update() {
        // herná logika
    }
}