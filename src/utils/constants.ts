import Phaser from 'phaser';
import { GameState } from '../utils/GameState';

type GeneratorDef = {
  key: string;
  name: string;
  baseCost: number;
  costMult: number;
  baseCps: number;
  emoji: string;
};

export const GENERATORS: GeneratorDef[] = [
  { key: 'cursor',   name: 'Cursor',      baseCost: 15,    costMult: 1.15, baseCps: 0.1,  emoji: '🖱️' },
  { key: 'miner',    name: 'Miner',       baseCost: 100,   costMult: 1.15, baseCps: 0.5,  emoji: '⛏️' },
  { key: 'factory',  name: 'Factory',     baseCost: 500,   costMult: 1.15, baseCps: 2,    emoji: '🏭' },
  { key: 'lab',      name: 'Lab',         baseCost: 3000,  costMult: 1.15, baseCps: 10,   emoji: '🔬' },
  { key: 'ai',       name: 'AI Core',     baseCost: 15000, costMult: 1.15, baseCps: 50,   emoji: '🤖' },
  { key: 'portal',   name: 'Portal',      baseCost: 80000, costMult: 1.15, baseCps: 250,  emoji: '🌀' },
];

export function fmt(n: number): string {
  if (n < 1000) return Math.floor(n).toLocaleString();
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
  let tier = 0;
  let v = n;
  while (v >= 1000 && tier < suffixes.length - 1) { v /= 1000; tier++; }
  return v.toFixed(1) + suffixes[tier];
}
