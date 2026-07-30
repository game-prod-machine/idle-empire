import Phaser from 'phaser';

export class UI extends Phaser.Scene {
  constructor() {
    super({ key: 'UI' });
  }

  create(): void {
    // UI Scene is a thin overlay — most UI is in Game scene for this design
  }
}
