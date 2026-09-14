// Player progress. Saved to localStorage automatically.
import { TUNING, ITEMS, CONTENT_LEVEL } from './data/config.js';
const KEY = 'simon-game-save-v1';
const SAVED = ['v', 'level', 'xp', 'coins', 'inventory', 'flags', 'walls', 'bossWins', 'bagHits', 'currentLevel', 'bonusPower', 'consumables'];
const VERSION = 2;   // 2 = after the rebalance

export const state = {
  v: VERSION,
  level: 1, xp: 0, coins: 0, hp: 110,
  inventory: [],          // item ids (one-time purchases)
  flags: [],              // things unlocked by playing (e.g. 'mega', 'ironfist')
  walls: {},              // wall id -> current wall level
  bossWins: {},           // boss id (or super fight id) -> times beaten
  bagHits: {},            // bag id -> times punched
  bonusPower: 0,          // kracht earned from unlocks, mystery drinks, splinters...
  consumables: {},        // item id -> how many you carry (banana, life)
  currentLevel: 'gym',

  get ownedItems() { return ITEMS.filter(i => this.inventory.includes(i.id)); },
  get maxHp() { return TUNING.maxHp(this.level) + this.ownedItems.reduce((s, i) => s + (i.hp || 0), 0); },
  get power() { return TUNING.basePower(this.level) + this.ownedItems.reduce((s, i) => s + (i.power || 0), 0) + this.bonusPower; },
  get xpNeeded() { return TUNING.xpForLevel(this.level); },
  has(itemId) { return this.inventory.includes(itemId); },
  hasFlag(flag) { return this.flags.includes(flag) || this.ownedItems.some(i => i.flag === flag); },
  wallLevel(id) { return this.walls[id] || 1; },
  wins(bossId) { return this.bossWins[bossId] || 0; },
  count(itemId) { return this.consumables[itemId] || 0; },
  use(itemId) { if (this.count(itemId) <= 0) return false; this.consumables[itemId]--; this.save(); return true; },

  // returns true when a level-up happened
  addXp(n) {
    this.xp += n; let up = false;
    while (this.xp >= this.xpNeeded) { this.xp -= this.xpNeeded; this.level++; this.hp = this.maxHp; up = true; }
    this.save(); return up;
  },
  addCoins(n) { this.coins += n; this.save(); },
  addPower(n) { this.bonusPower += n; this.save(); },
  // one-time flag with optional bonus kracht; returns false if already had
  unlock(flag, power = 0) {
    if (this.flags.includes(flag)) return false;
    this.flags.push(flag); this.bonusPower += power; this.save(); return true;
  },
  // Buy an item. Returns 'owned' | 'poor' | 'ok'.
  buy(item) {
    const oneTime = !item.consumable && !item.effect;
    if (oneTime && this.has(item.id)) return 'owned';
    if (this.coins < item.price) return 'poor';
    this.coins -= item.price;
    if (item.consumable) this.consumables[item.id] = this.count(item.id) + 1;
    else if (oneTime) this.inventory.push(item.id);
    this.save(); return 'ok';
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
    // Saves from before the rebalance: one level used to cost 100×level, which let the level
    // run to 1000 while the last gate is 200. Rebuild it from the XP actually earned, and stop
    // at the end of the drawn content so the numbers mean something again.
    if (d.level && !d.v) {
      let earned = 50 * d.level * (d.level - 1) + (d.xp || 0), lvl = 1;
      while (lvl < CONTENT_LEVEL && earned >= TUNING.xpForLevel(lvl)) { earned -= TUNING.xpForLevel(lvl); lvl++; }
      d.level = lvl; d.xp = lvl < CONTENT_LEVEL ? earned : 0;
    }
    for (const k of SAVED) if (d[k] !== undefined) this[k] = d[k];
    this.v = VERSION;
    this.hp = this.maxHp;
  },
  reset() { localStorage.removeItem(KEY); location.reload(); },
};
