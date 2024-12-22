import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene';
import ControlsScene from './scenes/ControlsScene';
import MainScene from './scenes/MainScene';

function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini/i.test(userAgent);
}

export function createGame(containerId) {
    const isMobile = isMobileDevice();

    let scaleConfig;
    if (isMobile) {
        // Na mobile roztiahnuť na celý displej
        scaleConfig = {
            mode: Phaser.Scale.EXPAND,
            autoCenter: Phaser.Scale.CENTER_BOTH
        };
    } else {
        // Na desktope neškálovať, použiť pevnú veľkosť 800×600
        scaleConfig = {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        };
    }

    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: [MenuScene, ControlsScene, MainScene],
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: 300 }, debug: false }
        },
        scale: scaleConfig
    };

    return new Phaser.Game({
        ...config,
        parent: containerId
    });
}