// Player progress. Saved to localStorage automatically.
import { TUNING, ITEMS } from './data/config.js';
const KEY = 'simon-game-save-v1';
const SAVED = ['level', 'xp', 'coins', 'inventory', 'flags', 'walls', 'bossWins', 'bagHits', 'currentLevel'];

export const state = {
  level: 1, xp: 0, coins: 0, hp: 110,
  inventory: [],          // item ids
  flags: [],              // things unlocked by playing (e.g. 'mega')
  walls: {},              // wall id -> current wall level
  bossWins: {},           // boss id -> times beaten
  bagHits: {},            // bag id -> times punched
  currentLevel: 'gym',

  get maxHp() { return TUNING.maxHp(this.level) + this.ownedItems.reduce((s, i) => s + (i.hp || 0), 0); },
  get ownedItems() { return ITEMS.filter(i => this.inventory.includes(i.id)); },
  get power() { return TUNING.basePower(this.level) + this.ownedItems.reduce((s, i) => s + (i.power || 0), 0); },
  get xpNeeded() { return TUNING.xpForLevel(this.level); },
  has(itemId) { return this.inventory.includes(itemId); },
  hasFlag(flag) { return this.flags.includes(flag) || this.ownedItems.some(i => i.flag === flag); },
  wallLevel(id) { return this.walls[id] || 1; },
  wins(bossId) { return this.bossWins[bossId] || 0; },

  // returns true when a level-up happened
  addXp(n) {
    this.xp += n; let up = false;
    while (this.xp >= this.xpNeeded) { this.xp -= this.xpNeeded; this.level++; this.hp = this.maxHp; up = true; }
    this.save(); return up;
  },
  addCoins(n) { this.coins += n; this.save(); },
  buy(item) {
    if (this.has(item.id) || this.coins < item.price) return false;
    this.coins -= item.price; this.inventory.push(item.id); this.save(); return true;
  },
  save() {
    const out = {}; for (const k of SAVED) out[k] = this[k];
    localStorage.setItem(KEY, JSON.stringify(out));
  },
  load() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch {}
    // old saves (before level 2) stored a single wall level and boss win count
    if (typeof d.wallLevel === 'number') { d.walls = { wall: d.wallLevel }; delete d.wallLevel; }
    if (typeof d.bossWins === 'number') { d.bossWins = { boss1: d.bossWins }; }
    for (const k of SAVED) if (d[k] !== undefined) this[k] = d[k];
    this.hp = this.maxHp;
  },
  reset() { localStorage.removeItem(KEY); location.reload(); },
};
