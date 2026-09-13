// The boss fight. Player HP top-left, boss HP bottom-right, SUPER and ULTRA SUPER attacks.
import { assets } from '../engine/assets.js';
import { drawSprite, text, bar, roundRect } from '../engine/draw.js';
import { TUNING, TEXT } from '../data/config.js';
import { state } from '../state.js';
import { Player } from '../player.js';
import { sound } from '../engine/sound.js';

const RING = { x: 190, y: 150, w: 580, h: 360 };

export class ArenaScene {
  constructor(game) { this.game = game; }
  enter({ boss }) {
    const wins = state.wins(boss.id), scale = Math.pow(boss.scalePerWin, wins);
    this.bossDef = boss; this.wins = wins;
    this.boss = { x: 650, y: 420, hp: Math.round(boss.hp * scale), maxHp: Math.round(boss.hp * scale),
      power: Math.round(boss.power * Math.pow(1.25, wins)), speed: boss.speed, attackT: 1.5, windup: 0, flash: 0, stun: 0, facing: -1, h: boss.h };
    this.player = new Player(320, 420);
    this.player.h = 105;
    state.hp = state.maxHp;
    sound.play('fight');
    this.meter = 0; this.over = null; this.startT = 1.2; this.overT = 0; this.bossNumber = wins + 1;
  }

  update(dt, input) {
    const fx = this.game.effects, p = this.player, b = this.boss;
    p.update(dt); b.flash = Math.max(0, b.flash - dt);
    if (this.startT > 0) { this.startT -= dt; return; }
    if (this.over) {
      this.overT += dt;
      if (this.overT > 1 && input.pressed('Enter')) this.game.switchTo(state.currentLevel);
      return;
    }
    p.move(input, dt, RING, []);
    // face the boss when not walking
    if (!p.moving && !p.busy) p.facing = b.x > p.x ? 1 : -1;

    // attacks
    if (input.pressed('Space') && p.start('punch')) sound.play('whoosh');
    if (input.pressed('KeyX') && p.start('kick')) sound.play('whoosh');
    if (input.pressed('KeyZ') && p.start('jump')) sound.play('jump');
    if (input.pressed('KeyS')) {
      if (this.meter >= TUNING.superCost) { if (p.start('super')) { this.meter -= TUNING.superCost; sound.play('super'); } }
      else fx.float(`SUPER: meter ${Math.floor(this.meter)}/${TUNING.superCost}`, p.x, p.y - 130, '#e67e22', 18);
    }
    if (input.pressed('KeyU')) {
      if (state.level < TUNING.ultraLevel) fx.float(`ULTRA SUPER vanaf level ${TUNING.ultraLevel}`, p.x, p.y - 130, '#8e44ad', 18);
      else if (this.meter >= TUNING.ultraCost) { if (p.start('ultra')) { this.meter -= TUNING.ultraCost; sound.play('ultra'); } }
      else fx.float(`ULTRA: meter ${Math.floor(this.meter)}/${TUNING.ultraCost}`, p.x, p.y - 130, '#8e44ad', 18);
    }
    if (input.pressed('KeyD')) {
      if (!state.hasFlag('mega')) fx.float('MEGA SUPER: sla de bokszak in level 2 100 keer', p.x, p.y - 130, '#8e44ad', 18);
      else if (this.meter >= TUNING.megaCost) { if (p.start('mega')) { this.meter -= TUNING.megaCost; sound.play('ultra'); } }
      else fx.float(`MEGA: meter ${Math.floor(this.meter)}/${TUNING.megaCost}`, p.x, p.y - 130, '#8e44ad', 18);
    }
    if (p.hitNow()) this.playerHit(p.action.name);

    // boss AI: walk to the player, then swing
    const dx = p.x - b.x, dy = p.y - b.y, dist = Math.hypot(dx, dy);
    b.facing = dx < 0 ? -1 : 1;
    if (b.stun > 0) { b.stun -= dt; return; }
    if (b.windup > 0) {
      b.windup -= dt;
      if (b.windup <= 0) this.bossHit();
    } else {
      b.attackT -= dt;
      if (dist > this.bossDef.reach - 10) { b.x += dx / dist * b.speed * dt; b.y += dy / dist * b.speed * dt; }
      else if (b.attackT <= 0) { sound.play('bossStep'); b.windup = 0.45; b.attackT = this.bossDef.attackEvery; }
    }
  }

  playerHit(kind) {
    const p = this.player, b = this.boss, fx = this.game.effects;
    const mult = { punch: 1, kick: TUNING.kickMultiplier, super: TUNING.superMultiplier, ultra: TUNING.ultraMultiplier, mega: TUNING.megaMultiplier }[kind];
    const reach = kind === 'super' ? 160 : kind === 'ultra' ? 260 : kind === 'mega' ? 300 : 100;
    const inReach = kind === 'mega' ? Math.hypot(b.x - p.x, b.y - p.y) < reach
      : Math.abs(b.x - p.x) < reach && Math.abs(b.y - p.y) < 70 && Math.sign(b.x - p.x) === p.facing;
    if (kind === 'super') fx.ring(p.reachX, p.y - 50, 140, '#e67e22');
    if (kind === 'ultra') { fx.ring(p.x, p.y - 50, 320, '#8e44ad', 0.8); fx.bump(16); }
    if (kind === 'mega') { fx.ring(p.x, p.y - 50, 360, '#2980b9', 1.0); fx.ring(p.x, p.y - 50, 200, '#f1c40f', 0.7); fx.bump(20); }
    if (!inReach) { sound.play('miss'); return; }
    sound.play(kind === 'punch' ? 'punch' : 'kick');
    const dmg = Math.round(state.power * mult);
    b.hp -= dmg; b.flash = 0.2; b.x += p.facing * (kind === 'ultra' ? 60 : 15);
    if (kind === 'mega') { b.stun = TUNING.megaStun; b.windup = 0; }
    b.x = Math.max(RING.x + 40, Math.min(RING.x + RING.w - 40, b.x));
    this.meter = Math.min(100, this.meter + TUNING.superMeterPerHit);
    fx.float(kind === 'mega' ? `MEGA SUPER! -${dmg}` : kind === 'ultra' ? `ULTRA SUPER! -${dmg}` : kind === 'super' ? `SUPER! -${dmg}` : `-${dmg}`, b.x, b.y - b.h - 10, '#c0392b', kind === 'punch' ? 26 : 36);
    fx.bump(kind === 'punch' ? 3 : 8);
    if (b.hp <= 0) this.finish(true);
  }
  bossHit() {
    const p = this.player, b = this.boss, fx = this.game.effects;
    const dodging = p.action && p.action.name === 'jump';
    if (Math.hypot(p.x - b.x, p.y - b.y) > this.bossDef.reach + 20 || dodging) { fx.float('mis!', b.x, b.y - b.h, '#7f8c8d', 20); sound.play('miss'); return; }
    state.hp -= b.power; p.flashT = 0.25; fx.bump(6); sound.play('hurt');
    fx.float(`-${b.power}`, p.x, p.y - p.h - 10, '#c0392b');
    if (state.hp <= 0) { state.hp = 0; p.action = null; p.start('dead'); this.finish(false); }
  }
  finish(won) {
    this.over = won ? 'win' : 'lose';
    setTimeout(() => sound.play(won ? 'win' : 'lose'), 400);
    if (won) {
      const d = this.bossDef, g = Math.pow(d.prizeGrowth, this.wins), coins = Math.round(d.prizeCoins * g), xp = Math.round(d.prizeXp * g);
      state.addCoins(coins); state.bossWins[d.id] = this.wins + 1; state.save();
      this.prize = `+${coins} munten  +${xp} XP`;
      if (state.addXp(xp)) { this.prize += '  LEVEL UP!'; setTimeout(() => sound.play('levelUp'), 1600); }
    }
  }

  draw(ctx) {
    const p = this.player, b = this.boss;
    this.drawRing(ctx);
    // draw back-to-front by feet position
    const order = [p, b].sort((a, c) => a.y - c.y);
    for (const e of order) e === p ? p.draw(ctx) : this.drawBoss(ctx);
    // HP bars like in the drawing: ours top-left, boss bottom-right
    text(ctx, 'JIJ', 30, 30, { size: 22 });
    bar(ctx, 30, 45, 260, 26, state.hp / state.maxHp, '#7dc36b', `${state.hp}/${state.maxHp}`);
    bar(ctx, 30, 78, 260, 14, this.meter / 100, this.meter >= TUNING.ultraCost ? '#8e44ad' : '#e67e22');
    const ready = [];
    if (this.meter >= TUNING.superCost) ready.push('S: SUPER');
    if (this.meter >= TUNING.megaCost && state.hasFlag('mega')) ready.push('D: MEGA');
    if (this.meter >= TUNING.ultraCost && state.level >= TUNING.ultraLevel) ready.push('U: ULTRA');
    text(ctx, ready.length ? ready.join('   ') + '!' : 'super meter', 30, 106, { size: 16 });
    text(ctx, `${this.bossDef.name} ${this.bossNumber}`, 930, 530, { size: 22, align: 'right' });
    bar(ctx, 670, 545, 260, 26, b.hp / b.maxHp, '#e74c3c', `${Math.max(0, b.hp)}/${b.maxHp}`);

    if (this.startT > 0) text(ctx, TEXT.fightStart, 480, 300, { size: 70, align: 'center', color: '#c0392b', stroke: true });
    if (this.over) {
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.75)'; roundRect(ctx, 230, 210, 500, 180, 16); ctx.fill(); ctx.restore();
      text(ctx, this.over === 'win' ? TEXT.youWin : TEXT.youLose, 480, 260, { size: 44, align: 'center', color: this.over === 'win' ? '#27ae60' : '#c0392b' });
      if (this.over === 'win') text(ctx, this.prize, 480, 310, { size: 24, align: 'center', color: '#b7950b' });
      if (this.overT > 1) text(ctx, TEXT.pressEnter, 480, 360, { size: 20, align: 'center' });
    }
  }
  drawBoss(ctx) {
    const b = this.boss;
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(b.x, b.y, 45, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    let h = b.h, dx = 0, rot = 0;
    if (b.stun > 0) rot = Math.sin(b.stun * 10) * 0.15;
    if (b.windup > 0) { h = b.h * (1 + (0.45 - b.windup) * 0.5); dx = b.facing * (0.45 - b.windup) * 60; }
    if (b.flash > 0) { ctx.save(); ctx.filter = 'sepia(1) saturate(8) hue-rotate(-40deg)'; }
    const shake = b.flash > 0 ? (Math.random() - 0.5) * 10 : 0;
    drawSprite(ctx, assets.get(this.bossDef.sprite), b.x + dx + shake, b.y, { h, flip: b.facing > 0, rot });
    if (b.stun > 0) text(ctx, '💫', b.x, b.y - h - 10, { size: 30, align: 'center' });
    if (b.flash > 0) ctx.restore();
  }
  drawRing(ctx) {
    const { x, y, w, h } = RING;
    ctx.save();
    ctx.fillStyle = '#f7efdc'; ctx.fillRect(x - 40, y - 40, w + 80, h + 60);
    ctx.strokeStyle = '#5f7f5a'; ctx.lineWidth = 4;
    for (const off of [-40, -28]) ctx.strokeRect(x - 20, y + off, w + 40, h + 40);   // ropes, drawn like the sketch
    ctx.strokeRect(x - 20, y - 40, w + 40, h + 40);
    ctx.fillStyle = '#e9dcc0';
    for (const [px, py] of [[x - 30, y - 60], [x + w + 10, y - 60], [x - 30, y + h - 20], [x + w + 10, y + h - 20]]) {
      ctx.fillRect(px, py, 24, 40); ctx.strokeRect(px, py, 24, 40);
    }
    ctx.restore();
  }
}
