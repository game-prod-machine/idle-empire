import Phaser from 'phaser';
import { GameState } from '../utils/GameState';
import { GENERATORS, fmt } from '../utils/constants';

export class Game extends Phaser.Scene {
  state!: GameState;
  coinText!: Phaser.GameObjects.Text;
  cpsText!: Phaser.GameObjects.Text;
  clickArea!: Phaser.GameObjects.Container;
  clickText!: Phaser.GameObjects.Text;
  genContainer!: Phaser.GameObjects.Container;
  genButtons: Phaser.GameObjects.Container[] = [];
  floatingTexts: Phaser.GameObjects.Text[] = [];
  orbitCoins: { obj: Phaser.GameObjects.Text; angle: number; speed: number; radius: number }[] = [];
  lastTick = 0;
  saveTimer = 0;

  constructor() {
    super({ key: 'Game' });
  }

  create(): void {
    this.state = new GameState();
    this.state.load();

    const { width, height } = this.cameras.main;

    // --- Header bar ---
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x0d0d1f, 0.9);
    headerBg.fillRect(0, 0, width, 72);

    this.add.text(16, 28, '🏛️', { fontSize: '22px' }).setOrigin(0, 0.5);

    this.add.text(width / 2, 20, 'IDLE EMPIRE', {
      fontSize: '20px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Stats row
    this.coinText = this.add.text(width / 2, 48, '', {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.cpsText = this.add.text(width / 2, 68, '', {
      fontSize: '13px', color: '#66cc66',
    }).setOrigin(0.5, 0);

    // --- Click area ---
    this.clickArea = this.add.container(width / 2, 200);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a3e, 1);
    bg.fillRoundedRect(-120, -65, 240, 130, 18);
    bg.lineStyle(2, 0xffd700, 0.5);
    bg.strokeRoundedRect(-120, -65, 240, 130, 18);
    this.clickArea.add(bg);

    // Subtle inner ring
    const innerRing = this.add.graphics();
    innerRing.lineStyle(1, 0xffd700, 0.2);
    innerRing.strokeCircle(0, -8, 42);
    this.clickArea.add(innerRing);

    const coin = this.add.text(0, -8, '🪙', { fontSize: '38px' }).setOrigin(0.5);
    this.clickArea.add(coin);

    this.clickText = this.add.text(0, 32, 'Click me!', {
      fontSize: '14px', color: '#ffd700',
    }).setOrigin(0.5);
    this.clickArea.add(this.clickText);

    this.clickArea.setSize(240, 130);
    this.clickArea.setInteractive();
    this.clickArea.on('pointerdown', () => this.handleClick());
    this.clickArea.on('pointerover', () => {
      this.tweens.add({ targets: this.clickArea, scaleX: 1.05, scaleY: 1.05, duration: 80 });
    });
    this.clickArea.on('pointerout', () => {
      this.tweens.add({ targets: this.clickArea, scaleX: 1, scaleY: 1, duration: 80 });
    });

    // --- Generator shop ---
    this.add.text(width / 2, 298, '━━ SHOP ━━', {
      fontSize: '14px', color: '#666', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.genContainer = this.add.container(0, 0);

    const genStartY = 330;
    const genRowH = 64;
    GENERATORS.forEach((gen, i) => {
      const y = genStartY + i * genRowH;
      this.createGenRow(gen, i, y, width);
    });

    // Save indicator
    this.add.text(width / 2, genStartY + GENERATORS.length * genRowH + 16, '💾 Auto-saved every 10s', {
      fontSize: '10px', color: '#333',
    }).setOrigin(0.5);

    // Spawn orbit coins
    for (let i = 0; i < 6; i++) {
      const c = this.add.text(0, 0, '🪙', { fontSize: '14px' }).setOrigin(0.5).setAlpha(0.2);
      this.orbitCoins.push({
        obj: c,
        angle: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.3,
        radius: 80 + Math.random() * 30,
      });
    }

    this.updateUI();
  }

  createGenRow(gen: typeof GENERATORS[0], idx: number, y: number, width: number): void {
    const row = this.add.container(width / 2, y);

    const rowW = 420;
    const rowH = 46;

    // Row background
    const rowBg = this.add.graphics();
    rowBg.fillStyle(0x12122a, 1);
    rowBg.fillRoundedRect(-rowW / 2, -rowH / 2, rowW, rowH, 10);
    rowBg.lineStyle(1, 0x2a2a4a, 1);
    rowBg.strokeRoundedRect(-rowW / 2, -rowH / 2, rowW, rowH, 10);
    row.add(rowBg);

    // Emoji + name (left side)
    const nameText = this.add.text(-rowW / 2 + 14, 0, `${gen.emoji}  ${gen.name}`, {
      fontSize: '15px', color: '#ddd', fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    row.add(nameText);

    // Count badge
    const countText = this.add.text(-rowW / 2 + 170, 0, 'x0', {
      fontSize: '12px', color: '#999',
    }).setOrigin(0, 0.5);
    row.add(countText);

    // Cost button (right side)
    const btnW = 100;
    const btnH = 32;
    const btnX = rowW / 2 - btnW / 2 - 10;

    const costBtnBg = this.add.graphics();
    const drawBtn = (hover: boolean) => {
      costBtnBg.clear();
      const canAfford = this.state && this.state.coins >= this.state.genCost(gen.key);
      const fill = canAfford ? (hover ? 0x3a8a3a : 0x2a6a2a) : (hover ? 0x444444 : 0x333333);
      const stroke = hover ? 0xffd700 : (canAfford ? 0x449944 : 0x555555);
      costBtnBg.fillStyle(fill, 1);
      costBtnBg.fillRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
      costBtnBg.lineStyle(1, stroke, hover ? 1 : 0.5);
      costBtnBg.strokeRoundedRect(btnX - btnW / 2, -btnH / 2, btnW, btnH, 8);
    };
    drawBtn(false);
    row.add(costBtnBg);

    const costText = this.add.text(btnX, 0, '', {
      fontSize: '12px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    row.add(costText);

    row.setSize(rowW, rowH);
    row.setInteractive();
    row.on('pointerdown', () => {
      if (this.state.buyGenerator(gen.key)) {
        this.spawnParticles(btnX, y, gen.emoji);
        this.updateUI();
      }
    });
    row.on('pointerover', () => drawBtn(true));
    row.on('pointerout', () => drawBtn(false));

    (row as any).genKey = gen.key;
    (row as any)._costText = costText;
    (row as any)._countText = countText;
    (row as any)._drawBtn = drawBtn;

    this.genContainer.add(row);
    this.genButtons.push(row);
  }

  handleClick(): void {
    const earned = this.state.click();
    const cx = this.clickArea.x;
    const cy = this.clickArea.y - 20;

    // Floating +N text
    const ft = this.add.text(cx + (Math.random() - 0.5) * 50, cy, `+${fmt(earned)}`, {
      fontSize: '16px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(1);
    this.floatingTexts.push(ft);
    this.tweens.add({
      targets: ft, y: cy - 60, alpha: 0, duration: 700,
      onComplete: () => ft.destroy(),
    });

    // Pulse the coin
    this.tweens.add({
      targets: this.clickArea, scaleX: 1.15, scaleY: 0.9, duration: 60, yoyo: true,
    });

    this.updateUI();
  }

  spawnParticles(x: number, y: number, emoji: string): void {
    for (let i = 0; i < 6; i++) {
      const p = this.add.text(x, y, emoji, { fontSize: '12px' }).setOrigin(0.5);
      this.tweens.add({
        targets: p,
        x: x + (Math.random() - 0.5) * 60,
        y: y - 30 - Math.random() * 30,
        alpha: 0,
        duration: 500 + Math.random() * 300,
        onComplete: () => p.destroy(),
      });
    }
  }

  updateUI(): void {
    const s = this.state;
    this.coinText.setText(`${fmt(s.coins)} 🪙`);
    this.cpsText.setText(`${fmt(s.totalCps)}/s`);

    // Update generator rows
    this.genButtons.forEach(row => {
      const key = (row as any).genKey as string;
      const costText = (row as any)._costText as Phaser.GameObjects.Text;
      const countText = (row as any)._countText as Phaser.GameObjects.Text;
      const drawBtn = (row as any)._drawBtn as (hover: boolean) => void;

      const count = s.generators[key].count;
      const cost = s.genCost(key);

      countText.setText(`x${count}`);
      costText.setText(`💰 ${fmt(cost)}`);
      drawBtn(false);
    });

    // Update orbit
    this.orbitCoins.forEach(oc => {
      oc.obj.setColor(s.totalCps > 10 ? '#ffd700' : '#555555');
    });
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    if (dt <= 0) return;

    const earned = this.state.tick(dt);
    this.updateUI();

    // Auto-save every 10s
    this.saveTimer += dt;
    if (this.saveTimer >= 10) {
      this.saveTimer = 0;
      this.state.save();
    }

    // Animate orbit coins
    const centerX = this.cameras.main.width / 2;
    const centerY = 200;
    this.orbitCoins.forEach(oc => {
      oc.angle += oc.speed * dt * (this.state.totalCps > 0 ? 1 + this.state.totalCps * 0.02 : 0.3);
      if (oc.angle > Math.PI * 2) oc.angle -= Math.PI * 2;
      oc.obj.x = centerX + Math.cos(oc.angle) * oc.radius;
      oc.obj.y = centerY + Math.sin(oc.angle) * oc.radius;
      const alpha = 0.15 + (this.state.totalCps > 0 ? 0.4 : 0);
      oc.obj.setAlpha(alpha);
    });

    // Clean up old floating texts
    this.floatingTexts = this.floatingTexts.filter(t => t.active);
  }
}
