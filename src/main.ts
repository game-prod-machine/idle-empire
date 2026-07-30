import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { UI } from './scenes/UI';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#0f0f23',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [Boot, Game, UI],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
