import { GENERATORS } from './constants';

export interface GeneratorState {
  count: number;
  totalCps: number;
}

export class GameState {
  coins: number = 0;
  totalEarned: number = 0;
  clickPower: number = 1;
  clickMultiplier: number = 1;
  generators: Record<string, GeneratorState>;
  totalClicks: number = 0;

  constructor() {
    this.generators = {};
    for (const g of GENERATORS) {
      this.generators[g.key] = { count: 0, totalCps: 0 };
    }
  }

  get totalCps(): number {
    let cps = 0;
    for (const g of GENERATORS) {
      cps += this.generators[g.key].totalCps;
    }
    return cps * this.clickMultiplier;
  }

  genCost(key: string): number {
    const g = GENERATORS.find(x => x.key === key)!;
    const owned = this.generators[key].count;
    return Math.floor(g.baseCost * Math.pow(g.costMult, owned));
  }

  buyGenerator(key: string): boolean {
    const cost = this.genCost(key);
    if (this.coins < cost) return false;
    this.coins -= cost;
    const g = this.generators[key];
    g.count++;
    const def = GENERATORS.find(x => x.key === key)!;
    g.totalCps = def.baseCps * g.count;
    return true;
  }

  tick(dtSec: number): number {
    const earned = this.totalCps * dtSec;
    this.coins += earned;
    this.totalEarned += earned;
    return earned;
  }

  click(): number {
    const earned = this.clickPower * this.clickMultiplier;
    this.coins += earned;
    this.totalEarned += earned;
    this.totalClicks++;
    return earned;
  }

  save(): void {
    localStorage.setItem('idle-empire-save', JSON.stringify({
      coins: this.coins,
      totalEarned: this.totalEarned,
      clickPower: this.clickPower,
      clickMultiplier: this.clickMultiplier,
      generators: this.generators,
      totalClicks: this.totalClicks,
    }));
  }

  load(): boolean {
    const raw = localStorage.getItem('idle-empire-save');
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      this.coins = data.coins ?? 0;
      this.totalEarned = data.totalEarned ?? 0;
      this.clickPower = data.clickPower ?? 1;
      this.clickMultiplier = data.clickMultiplier ?? 1;
      this.generators = data.generators ?? this.generators;
      this.totalClicks = data.totalClicks ?? 0;
      return true;
    } catch { return false; }
  }
}
