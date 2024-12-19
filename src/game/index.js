import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene';
import ControlsScene from './scenes/ControlsScene';
import MainScene from './scenes/MainScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MenuScene, ControlsScene, MainScene],
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false }
    }
};

export function createGame(containerId) {
    return new Phaser.Game({ ...config, parent: containerId });
}