// A walk-around level (gym, city, ...). Everything it shows comes from a layout in config.js LEVELS.
import { assets } from '../engine/assets.js';
import { drawSprite, text, hint, nl } from '../engine/draw.js';
import { TUNING, TEXT, BOSSES } from '../data/config.js';
import { state } from '../state.js';
import { Player } from '../player.js';
import { drawHud } from '../hud.js';
import { Shop } from './shop.js';
import { sound } from '../engine/sound.js';

export class LevelScene {
  constructor(game, layout) {
    this.game = game; this.L = layout;
    this.player = new Player(layout.start.x, layout.start.y);
    this.shop = new Shop(game.effects);
    this.bounds = { x: 0, y: 150, w: 960, h: 440 };
    this.walls = {};     // wall id -> { hp, broken, cracks }
    for (const w of layout.walls) this.walls[w.id] = { hp: w.hp(state.wallLevel(w.id)), broken: 0, cracks: [] };
    // everything with a position, for hints/targets
    this.targets = [...layout.bags.map(b => ({ ...b, kind: 'bag' })), ...layout.walls.map(w => ({ ...w, kind: 'wall' }))];
  }
  enter() {
    this.player.action = null; state.hp = state.maxHp;
    state.currentLevel = this.L.id; state.save();
    this.player.x = this.L.start.x; this.player.y = this.L.start.y;
  }
  get blocks() {
    const L = this.L;
    return [L.gate, ...L.bosses, ...L.shops, ...L.bags, ...L.walls, ...(L.superFight ? [L.superFight] : [])].map(t => t.block);
  }
  dist(t) { return Math.hypot(this.player.x - t.at.x, this.player.y - t.at.y); }
  nearestTarget() {
    let best = null, bestD = 100;
    for (const t of this.targets) { const d = this.dist(t); if (d < bestD) { best = t; bestD = d; } }
    return best;
  }
  nearShop() { return this.L.shops.find(s => this.dist(s) < 80); }
  nearBoss() { return this.L.bosses.find(b => this.dist(b) < 110); }
  nearGate() { return this.dist(this.L.gate) < 100; }
  nearSuper() { return this.L.superFight && this.dist(this.L.superFight) < 90; }
  superOpen() { return this.L.bosses.every(b => state.wins(b.id) > 0); }

  update(dt, input) {
    const fx = this.game.effects;
    if (this.shop.open) { this.shop.update(input, dt); return; }
    const p = this.player;
    p.move(input, dt, this.bounds, this.blocks);
    p.update(dt);

    if (input.pressed('Space') || input.pressed('KeyX')) {
      const target = this.nearestTarget();
      if (target) p.facing = target.x > p.x ? 1 : -1;
      if (p.start(input.pressed('KeyX') ? 'kick' : 'punch')) { p.action.target = target; sound.play('whoosh'); }
    }
    if (input.pressed('KeyZ') && p.start('jump')) sound.play('jump');
    if (p.hitNow() && p.action.target) this.hit(p.action.target, p.action.name === 'kick' ? TUNING.kickMultiplier : 1);

    if (input.pressed('Enter')) {
      const shop = this.nearShop(), boss = this.nearBoss();
      if (shop) { this.shop.show(shop.items); sound.play('select'); }
      else if (this.nearSuper()) {
        if (this.superOpen()) this.game.switchTo('arena', { bosses: this.L.bosses.map(b => BOSSES.find(d => d.id === b.id)), superFight: this.L.superFight });
        else { sound.play('nope'); fx.float(TEXT.superFightLocked, this.L.superFight.x, this.L.superFight.y - this.L.superFight.h - 20, '#8e44ad', 22); }
      }
      else if (boss) this.game.switchTo('arena', { bosses: [BOSSES.find(b => b.id === boss.id)] });
      else if (this.nearGate()) {
        const g = this.L.gate;
        if (state.level < g.needLevel) { sound.play('nope'); fx.float(TEXT.gateLocked(g.needLevel), g.x + 150, 250, '#8e44ad', 26); }
        else if (g.next) { sound.play('gate'); this.game.switchTo(g.next); }
        else { sound.play('gate'); fx.float(TEXT.gateSoon, g.x + 150, 250, '#8e44ad', 28); }
      }
    }
    if (input.pressed('Backspace') && this.L.prev) { sound.play('select'); this.game.switchTo(this.L.prev); }

    for (const [id, w] of Object.entries(this.walls)) {
      if (w.broken > 0) {
        w.broken -= dt;
        if (w.broken <= 0) { w.hp = this.L.walls.find(x => x.id === id).hp(state.wallLevel(id)); w.cracks = []; }
      }
    }
  }

  hit(t, mult) {
    const fx = this.game.effects, p = this.player;
    fx.bump(4);
    if (t.kind === 'bag') {
      if (t.needs && !state.hasFlag(t.needs)) { sound.play('nope'); fx.float(TEXT.buyGoldBag, p.x, p.y - 130, '#8e44ad', 20); return; }
      const xp = Math.round(t.xp * mult);
      sound.play(mult > 1 ? 'kick' : 'punch'); sound.play('xp');
      fx.float(`+${nl(xp)} XP`, t.x, t.y - t.h, '#27ae60');
      state.bagHits[t.id] = (state.bagHits[t.id] || 0) + 1;
      if (t.unlock && state.bagHits[t.id] >= t.unlock.hits && state.unlock(t.unlock.flag, t.unlock.power || 0)) {
        sound.play('win'); fx.bump(10);
        fx.float(t.unlock.text || TEXT.newAttack, 480, 300, '#8e44ad', 40);
      }
      if (state.addXp(xp)) this.levelUp();
    } else if (t.kind === 'wall') {
      const w = this.walls[t.id];
      if (w.broken > 0) return;
      const dmg = Math.round(state.power * mult);
      w.hp -= dmg; sound.play('crack');
      w.cracks.push({ x: 0.15 + Math.random() * 0.7, y: 0.1 + Math.random() * 0.8, a: Math.random() * Math.PI, l: 30 + Math.random() * 50 });
      fx.float(`-${nl(dmg)}`, t.x, t.y - t.h - 10, '#c0392b');
      if (w.hp <= 0) {
        const lvl = state.wallLevel(t.id), coins = t.coins(lvl) * (state.hasFlag('magnet') ? 2 : 1);
        if (t.firstBreak && state.unlock(t.firstBreak.flag, t.firstBreak.power || 0)) { fx.float(t.firstBreak.text, t.x - 100, 240, '#2980b9', 34); sound.play('levelUp'); }
        fx.float(TEXT.wallBroken, t.x, 300, '#e67e22', 40); fx.float(`+${nl(coins)} munten`, t.x, 340, '#b7950b', 30); fx.bump(14);
        state.addCoins(coins); state.walls[t.id] = lvl + 1; state.save(); sound.play('wallBreak'); sound.play('coin');
        w.broken = TUNING.wallRespawn;
      }
    }
  }
  levelUp() { sound.play('levelUp'); this.game.effects.float(TEXT.levelUp, this.player.x, this.player.y - 150, '#8e44ad', 44); this.game.effects.bump(8); }

  draw(ctx) {
    const L = this.L;
    ctx.strokeStyle = '#7a7060'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 590); ctx.lineTo(960, 590); ctx.stroke();
    drawSprite(ctx, assets.get(L.gate.sprite), L.gate.x, L.gate.y, { h: L.gate.h, alpha: state.level >= L.gate.needLevel ? 1 : 0.6 });
    for (const b of L.bosses) {
      const def = BOSSES.find(d => d.id === b.id);
      drawSprite(ctx, assets.get(def.sprite), b.x, b.y, { h: b.h });
      if (b.sign) drawSprite(ctx, assets.get(b.sign), b.x, b.y + 32, { h: 34 });
      const wins = state.wins(b.id);
      text(ctx, `${def.name} ${wins + 1}`, b.x, b.y + (b.sign ? 48 : 14), { size: 15, align: 'center' });
      text(ctx, `🪙 ${nl(def.prizeCoins * Math.pow(def.prizeGrowth, wins))}`, b.x, b.y + (b.sign ? 66 : 32), { size: 15, align: 'center', color: '#b7950b' });
    }
    for (const s of L.shops) drawSprite(ctx, assets.get(s.sprite), s.x, s.y, { h: s.h });
    if (L.superFight) {
      const sf = L.superFight, open = this.superOpen();
      drawSprite(ctx, assets.get(sf.sprite), sf.x, sf.y, { h: sf.h, alpha: open ? 1 : 0.4 });
      const prize = Math.round(sf.prizeCoins * Math.pow(sf.prizeGrowth, state.wins(sf.id)));
      text(ctx, open ? `🪙 ${nl(prize)}` : '🔒', sf.x, sf.y + 14, { size: 15, align: 'center', color: '#b7950b' });
    }
    for (const b of L.bags) {
      drawSprite(ctx, assets.get(b.sprite), b.x, b.y, { h: b.h, alpha: b.needs && !state.hasFlag(b.needs) ? 0.25 : 1 });
      if (b.unlock && !state.flags.includes(b.unlock.flag)) text(ctx, `${state.bagHits[b.id] || 0}/${b.unlock.hits}`, b.x, b.y - b.h - 12, { size: 16, align: 'center', color: '#8e44ad' });
    }
    for (const w of L.walls) this.drawWall(ctx, w);
    this.player.draw(ctx);
    this.drawHints(ctx);
    drawHud(ctx);
    text(ctx, L.name, 12, 585, { size: 13, bold: false, color: '#7a7060' });
    if (L.prev) text(ctx, TEXT.back, 948, 585, { size: 13, align: 'right', bold: false, color: '#7a7060' });
    if (this.shop.open) this.shop.draw(ctx);
  }
  drawWall(ctx, t) {
    const w = this.walls[t.id], img = assets.get(t.sprite);
    const width = img.width * (t.h / img.height), x0 = t.x - width / 2, y0 = t.y - t.h;
    if (w.broken > 0) {
      const p = 1 - w.broken / TUNING.wallRespawn;
      for (let i = 0; i < 4; i++) {
        ctx.save(); ctx.globalAlpha = 1 - p;
        ctx.translate(x0 + width * (i + 0.5) / 4, t.y); ctx.rotate((i - 1.5) * p * 0.6); ctx.translate(0, p * 80);
        ctx.drawImage(img, img.width * i / 4, 0, img.width / 4, img.height, -width / 8, -t.h, width / 4, t.h);
        ctx.restore();
      }
      return;
    }
    drawSprite(ctx, img, t.x, t.y, { h: t.h });
    ctx.save(); ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 3;
    for (const c of w.cracks) {
      const cx = x0 + c.x * width, cy = y0 + c.y * t.h;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(c.a) * c.l, cy + Math.sin(c.a) * c.l);
      ctx.lineTo(cx + Math.cos(c.a + 1) * c.l * 0.5, cy + Math.sin(c.a + 1) * c.l * 0.5); ctx.stroke();
    }
    ctx.restore();
    const lvl = state.wallLevel(t.id);
    text(ctx, `${t.label || 'Muur'} ${lvl}`, t.x, y0 - 40, { size: 20, align: 'center' });
    text(ctx, `${nl(Math.max(0, w.hp))}/${nl(t.hp(lvl))}`, t.x, y0 - 18, { size: 16, align: 'center', color: '#c0392b', maxWidth: 210 });
  }
  drawHints(ctx) {
    const p = this.player, y = p.y - p.h - 10, g = this.L.gate;
    let h = null;
    const target = this.nearestTarget();
    if (this.nearShop()) h = TEXT.enterShop;
    else if (this.nearSuper()) h = this.superOpen() ? TEXT.superFight : TEXT.superFightLocked;
    else if (this.nearBoss()) h = TEXT.challengeBoss;
    else if (this.nearGate()) h = state.level >= g.needLevel ? TEXT.gateOpen : TEXT.gateLocked(g.needLevel);
    else if (target) h = target.kind === 'wall' ? TEXT.punchWall : TEXT.punchBag;
    if (h) hint(ctx, h, p.x, y);
  }
}
