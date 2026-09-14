// Shop overlay (opened from a level). Items come from ITEMS in config.js; which ones from the level layout.
import { ITEMS, TEXT } from '../data/config.js';
import { state } from '../state.js';
import { text, roundRect, nl } from '../engine/draw.js';
import { sound } from '../engine/sound.js';

// Surprise purchases, priced to be worth about what the same coins buy in gear — so they are
// a gamble, not a shortcut. `scale` (from the item) makes the world-4 versions 25× bigger.
const EFFECTS = {
  mystery(scale) {
    const r = Math.random(), give = n => { const v = Math.round(n * scale); state.addPower(v); return v; };
    if (r < 0.15) return 'Bleh... smaakt naar niks.';
    if (r < 0.55) return `Mmm! +${nl(give(50 + Math.random() * 250))} kracht`;
    if (r < 0.90) return `WOW! +${nl(give(300 + Math.random() * 700))} kracht!`;
    sound.play('levelUp'); return `BOEM!!! +${nl(give(1500))} kracht!!!`;
  },
  lottery(scale) {
    const r = Math.random(), win = n => { const v = Math.round(n * scale); state.addCoins(v); return nl(v); };
    if (r < 0.70) return 'Niets gewonnen... volgende keer!';
    if (r < 0.90) return `Gewonnen: ${win(1500)} munten!`;
    if (r < 0.99) { sound.play('win'); return `JACKPOT: ${win(3000)} munten!!`; }
    sound.play('win'); return `MEGA JACKPOT: ${win(30000)} MUNTEN!!!`;
  },
};

export class Shop {
  constructor(effects) { this.open = false; this.sel = 0; this.msg = ''; this.msgT = 0; this.effects = effects; this.ids = []; }
  show(ids) { this.open = true; this.sel = 0; this.msg = ''; this.ids = ids; }
  get items() { return ITEMS.filter(i => this.ids.includes(i.id) && (!i.requires || state.has(i.requires))); }
  locked(it) { return it.minLevel && state.level < it.minLevel; }
  update(input, dt) {
    this.msgT = Math.max(0, this.msgT - dt);
    if (input.pressed('Escape')) { this.open = false; return; }
    const items = this.items;
    if (input.pressed('ArrowUp') || input.pressed('ArrowDown')) sound.play('select');
    if (input.pressed('ArrowUp')) this.sel = (this.sel + items.length - 1) % items.length;
    if (input.pressed('ArrowDown')) this.sel = (this.sel + 1) % items.length;
    if (input.pressed('Enter')) {
      const it = items[this.sel];
      if (this.locked(it)) { this.say(TEXT.locked(it.minLevel)); sound.play('nope'); return; }
      const r = state.buy(it);
      if (r === 'owned') { this.say(TEXT.owned); sound.play('nope'); }
      else if (r === 'poor') { this.say(TEXT.tooPoor); sound.play('nope'); }
      else if (it.effect) { sound.play('buy'); const m = EFFECTS[it.effect](it.scale || 1); this.say(m, 3); this.effects.float(m, 480, 560, '#8e44ad', 30); }
      else { this.say(it.consumable ? `${TEXT.bought} (je hebt er nu ${state.count(it.id)})` : TEXT.bought); sound.play('buy'); this.effects.float(TEXT.bought, 480, 560, '#27ae60', 40); }
    }
  }
  say(m, t = 1.5) { this.msg = m; this.msgT = t; }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, 960, 600);
    const items = this.items, top = 70, h = 130 + items.length * 46 + 70;
    ctx.fillStyle = '#fbf5e6'; ctx.strokeStyle = '#2b3a2b'; ctx.lineWidth = 4;
    roundRect(ctx, 180, top, 600, h, 16); ctx.fill(); ctx.stroke();
    text(ctx, TEXT.shopTitle, 480, top + 40, { size: 36, align: 'center' });
    text(ctx, `Munten: ${nl(state.coins)}`, 480, top + 80, { size: 22, align: 'center', color: '#b7950b' });
    items.forEach((it, i) => {
      const y = top + 130 + i * 46, owned = !it.consumable && !it.effect && state.has(it.id), locked = this.locked(it);
      if (i === this.sel) { ctx.fillStyle = '#ffe9a8'; roundRect(ctx, 200, y - 20, 560, 40, 8); ctx.fill(); }
      const name = it.name + (it.consumable && state.count(it.id) ? `  ×${state.count(it.id)}` : '');
      const right = owned ? '✔' : locked ? TEXT.locked(it.minLevel) : `${nl(it.price)} 🪙`;
      ctx.save(); ctx.font = 'bold 22px "Comic Sans MS", sans-serif';
      const rightW = ctx.measureText(right).width; ctx.restore();
      text(ctx, (i === this.sel ? '▶ ' : '   ') + (locked ? '🔒 ' : '') + name, 215, y,
        { size: 22, maxWidth: 520 - rightW, color: owned || locked ? '#888' : '#2b3a2b' });
      text(ctx, right, 745, y, { size: locked ? 18 : 22, align: 'right', color: owned ? '#27ae60' : locked ? '#888' : '#b7950b' });
    });
    const bottom = top + 130 + items.length * 46;
    if (this.msgT > 0) text(ctx, this.msg, 480, bottom + 5, { size: 24, align: 'center', color: '#c0392b', maxWidth: 560 });
    text(ctx, TEXT.shopHelp, 480, bottom + 40, { size: 16, align: 'center', bold: false });
    ctx.restore();
  }
}
