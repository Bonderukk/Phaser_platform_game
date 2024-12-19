import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene';
import MainScene from './scenes/MainScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MenuScene, MainScene],
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false }
    }
};

export function createGame(containerId) {
    return new Phaser.Game({ ...config, parent: containerId });
}