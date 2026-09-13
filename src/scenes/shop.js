// Shop overlay (opened from the gym). Items come from ITEMS in config.js.
import { ITEMS, TEXT } from '../data/config.js';
import { state } from '../state.js';
import { text, roundRect } from '../engine/draw.js';
import { sound } from '../engine/sound.js';

export class Shop {
  constructor(effects) { this.open = false; this.sel = 0; this.msg = ''; this.msgT = 0; this.effects = effects; }
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
      if (state.has(it.id)) { this.say(TEXT.owned); sound.play('nope'); }
      else if (this.locked(it)) { this.say(TEXT.locked(it.minLevel)); sound.play('nope'); }
      else if (state.buy(it)) { this.say(TEXT.bought); sound.play('buy'); this.effects.float(TEXT.bought, 480, 150, '#27ae60', 40); }
      else { this.say(TEXT.tooPoor); sound.play('nope'); }
    }
  }
  say(m) { this.msg = m; this.msgT = 1.5; }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, 960, 600);
    const items = this.items, top = 70, h = 130 + items.length * 46 + 70;
    ctx.fillStyle = '#fbf5e6'; ctx.strokeStyle = '#2b3a2b'; ctx.lineWidth = 4;
    roundRect(ctx, 180, top, 600, h, 16); ctx.fill(); ctx.stroke();
    text(ctx, TEXT.shopTitle, 480, top + 40, { size: 36, align: 'center' });
    text(ctx, `Munten: ${state.coins}`, 480, top + 80, { size: 22, align: 'center', color: '#b7950b' });
    items.forEach((it, i) => {
      const y = top + 130 + i * 46, owned = state.has(it.id), locked = this.locked(it);
      if (i === this.sel) { ctx.fillStyle = '#ffe9a8'; roundRect(ctx, 200, y - 20, 560, 40, 8); ctx.fill(); }
      text(ctx, (i === this.sel ? '▶ ' : '   ') + (locked ? '🔒 ' : '') + it.name, 215, y, { size: 22, color: owned || locked ? '#888' : '#2b3a2b' });
      text(ctx, owned ? '✔' : locked ? TEXT.locked(it.minLevel) : `${it.price} 🪙`, 745, y, { size: locked ? 18 : 22, align: 'right', color: owned ? '#27ae60' : locked ? '#888' : '#b7950b' });
    });
    const bottom = top + 130 + items.length * 46;
    if (this.msgT > 0) text(ctx, this.msg, 480, bottom + 5, { size: 24, align: 'center', color: '#c0392b' });
    text(ctx, TEXT.shopHelp, 480, bottom + 40, { size: 16, align: 'center', bold: false });
    ctx.restore();
  }
}
