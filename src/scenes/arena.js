// The boss fight: one boss, or all of a level's bosses at once (SUPERGEVECHT).
// Player HP top-left, boss HP bottom-right, SUPER / ULTRA / MEGA attacks, boss traits, surprises.
import { assets } from '../engine/assets.js';
import { drawSprite, text, bar, roundRect, nl } from '../engine/draw.js';
import { TUNING, TEXT } from '../data/config.js';
import { state } from '../state.js';
import { Player } from '../player.js';
import { sound } from '../engine/sound.js';

const RING = { x: 190, y: 150, w: 580, h: 360 };
const clampX = x => Math.max(RING.x + 40, Math.min(RING.x + RING.w - 40, x));
const clampY = y => Math.max(RING.y + 40, Math.min(RING.y + RING.h, y));

export class ArenaScene {
  constructor(game) { this.game = game; }

  // params: { bosses: [bossDef...], superFight?: { id, prizeCoins, prizeXp, prizeGrowth } }
  enter({ bosses, superFight = null }) {
    this.superFight = superFight;
    const winsOf = def => superFight ? state.wins(superFight.id) : state.wins(def.id);
    const spots = bosses.length === 1 ? [[650, 420]] : [[640, 330], [700, 450], [560, 470]];
    this.bosses = bosses.map((def, i) => {
      const wins = winsOf(def), hp = Math.round(def.hp * Math.pow(TUNING.bossScalePerWin, wins));
      return { def, wins, x: spots[i][0], y: spots[i][1], hp, maxHp: hp, power: Math.round(def.power * Math.pow(TUNING.bossPowerPerWin, wins)), speed: def.speed,
        attackT: 1.5 + i * 0.5, windup: 0, stun: 0, flash: 0, facing: -1, h: def.h, dashT: 3 + i, dashing: 0, laserT: 2 + i, secondHit: 0, dead: false, traits: def.traits || [] };
    });
    this.player = new Player(320, 420); this.player.h = 105;
    state.hp = state.maxHp;
    this.meter = 0; this.over = null; this.startT = 1.2; this.overT = 0; this.hits = 0;
    this.invuln = state.hasFlag('invisible') ? TUNING.invisibleTime : 0;
    this.lasers = []; this.stomps = [];
    this.coinBag = null; this.coinBagT = Math.random() < TUNING.coinBagChance ? 3 + Math.random() * 6 : -1;
    this.prizeCoins = this.prizeFor('prizeCoins'); this.prizeXp = this.prizeFor('prizeXp');
    sound.play('fight');
  }
  prizeFor(key) {
    if (this.superFight) return Math.round(this.superFight[key] * Math.pow(this.superFight.prizeGrowth, state.wins(this.superFight.id)));
    const b = this.bosses[0]; return Math.round(b.def[key] * Math.pow(b.def.prizeGrowth, b.wins));
  }
  get alive() { return this.bosses.filter(b => !b.dead); }
  get title() { return this.superFight ? `SUPERGEVECHT ${state.wins(this.superFight.id) + 1}` : `${this.bosses[0].def.name} ${this.bosses[0].wins + 1}`; }

  update(dt, input) {
    const fx = this.game.effects, p = this.player;
    p.update(dt); this.bosses.forEach(b => b.flash = Math.max(0, b.flash - dt));
    this.invuln = Math.max(0, this.invuln - dt); p.alpha = this.invuln > 0 ? 0.4 : 1;
    if (this.startT > 0) { this.startT -= dt; return; }
    if (this.over) { this.overT += dt; if (this.overT > 1 && input.pressed('Enter')) this.game.switchTo(state.currentLevel); return; }

    p.move(input, dt, RING, []);
    const nearest = this.nearestBoss();
    if (!p.moving && !p.busy && nearest) p.facing = nearest.x > p.x ? 1 : -1;

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
    if (input.pressed('KeyB')) {
      if (state.use('banana')) { sound.play('jump'); fx.float(TEXT.banana, 480, 250, '#f1c40f', 40); fx.bump(6); this.alive.forEach(b => { b.stun = TUNING.bananaStun; b.windup = 0; }); }
      else fx.float('Geen bananenschil (te koop in level 3)', p.x, p.y - 130, '#7f8c8d', 18);
    }
    if (p.hitNow()) this.playerHit(p.action.name);

    for (const b of this.alive) this.updateBoss(b, dt);
    this.updateProjectiles(dt);
    this.updateCoinBag(dt);
  }

  nearestBoss() {
    let best = null, d = 1e9;
    for (const b of this.alive) { const k = Math.hypot(b.x - this.player.x, b.y - this.player.y); if (k < d) { d = k; best = b; } }
    return best;
  }

  updateBoss(b, dt) {
    const p = this.player, def = b.def, fx = this.game.effects;
    const dx = p.x - b.x, dy = p.y - b.y, dist = Math.hypot(dx, dy) || 1;
    b.facing = dx < 0 ? -1 : 1;
    if (b.stun > 0) { b.stun -= dt; return; }
    if (b.secondHit > 0) { b.secondHit -= dt; if (b.secondHit <= 0) this.bossMelee(b, 0.7); }
    if (b.windup > 0) {
      b.windup -= dt;
      if (b.windup <= 0) {
        if (b.attackKind === 'stomp') this.bossStomp(b);
        else { this.bossMelee(b, 1); if (b.traits.includes('double')) b.secondHit = 0.35; }
      }
      return;
    }
    b.attackT -= dt;
    // dash: every few seconds, a fast lunge
    if (b.traits.includes('dash')) {
      b.dashT -= dt;
      if (b.dashT <= 0 && dist > 160) { b.dashing = 0.3; b.dashT = 4; sound.play('whoosh'); fx.float('!', b.x, b.y - b.h - 10, '#e67e22', 30); }
    }
    // laser: shoot when far away
    if (b.traits.includes('laser')) {
      b.laserT -= dt;
      if (b.laserT <= 0 && dist > 150) {
        b.laserT = 3; sound.play('super');
        this.lasers.push({ x: b.x, y: b.y - b.h * 0.6, vx: Math.sign(dx) * 520, vy: dy / dist * 120, power: b.power, life: 2 });
      }
    }
    const speed = b.dashing > 0 ? b.speed * 4 : b.speed;
    if (b.dashing > 0) b.dashing -= dt;
    // keep some distance from the other bosses so they don't stack
    for (const o of this.alive) if (o !== b) { const ox = b.x - o.x, oy = b.y - o.y, od = Math.hypot(ox, oy) || 1; if (od < 130) { b.x = clampX(b.x + ox / od * 220 * dt); b.y = clampY(b.y + oy / od * 220 * dt); } }
    if (dist > def.reach - 10) { b.x = clampX(b.x + dx / dist * speed * dt); b.y = clampY(b.y + dy / dist * speed * dt); }
    else if (b.attackT <= 0) {
      b.attackT = def.attackEvery;
      if (b.traits.includes('stomp') && Math.random() < 0.5) { b.attackKind = 'stomp'; b.windup = 0.8; sound.play('bossStep'); }
      else { b.attackKind = 'melee'; b.windup = 0.45; sound.play('bossStep'); }
    }
  }
  bossMelee(b, mult) {
    const p = this.player, fx = this.game.effects;
    if (Math.hypot(p.x - b.x, p.y - b.y) > b.def.reach + 20) { fx.float('mis!', b.x, b.y - b.h, '#7f8c8d', 20); sound.play('miss'); return; }
    this.hurt(Math.round(b.power * mult), b);
  }
  bossStomp(b) {
    const fx = this.game.effects;
    fx.ring(b.x, b.y, 260, '#7f8c8d', 0.6); fx.bump(14); sound.play('wallBreak');
    if (Math.hypot(this.player.x - b.x, this.player.y - b.y) < 260) this.hurt(Math.round(b.power * 1.3), b);
  }
  // damage to the player, unless dodging / invisible
  hurt(dmg, b) {
    const p = this.player, fx = this.game.effects;
    const dodging = p.action && (p.action.name === 'jump' || p.action.name === 'mega');
    if (dodging || this.invuln > 0) { fx.float('mis!', b.x, b.y - b.h, '#7f8c8d', 20); sound.play('miss'); return; }
    state.hp -= dmg; p.flashT = 0.25; fx.bump(6); sound.play('hurt');
    fx.float(`-${nl(dmg)}`, p.x, p.y - p.h - 10, '#c0392b');
    if (state.hp <= 0) {
      if (state.use('life')) { state.hp = state.maxHp; this.invuln = 1.5; sound.play('levelUp'); fx.float(TEXT.extraLife, 480, 250, '#27ae60', 44); return; }
      state.hp = 0; p.action = null; p.start('dead'); this.finish(false);
    }
  }
  updateProjectiles(dt) {
    const p = this.player, fx = this.game.effects;
    for (const l of this.lasers) {
      l.x += l.vx * dt; l.y += l.vy * dt; l.life -= dt;
      if (!l.hit && Math.abs(l.x - p.x) < 30 && Math.abs(l.y - (p.y - 50)) < 55) { l.hit = true; l.life = 0; this.hurt(Math.round(l.power * 0.8), this.bosses.find(b => b.traits.includes('laser')) || this.bosses[0]); fx.ring(l.x, l.y, 60, '#e74c3c', 0.3); }
    }
    this.lasers = this.lasers.filter(l => l.life > 0 && l.x > 0 && l.x < 960);
  }
  updateCoinBag(dt) {
    const p = this.player, fx = this.game.effects;
    if (this.coinBagT > 0) { this.coinBagT -= dt; if (this.coinBagT <= 0) { this.coinBag = { x: RING.x + 60 + Math.random() * (RING.w - 120), y: RING.y + 60 + Math.random() * (RING.h - 80) }; fx.float(TEXT.coinBag, this.coinBag.x, this.coinBag.y - 40, '#b7950b', 24); sound.play('coin'); } }
    if (this.coinBag && Math.hypot(p.x - this.coinBag.x, p.y - this.coinBag.y) < 50) {
      const coins = Math.max(5, Math.round(this.prizeCoins * TUNING.coinBagShare));
      state.addCoins(coins); sound.play('coin'); fx.float(`+${nl(coins)} munten`, p.x, p.y - 120, '#b7950b', 28); this.coinBag = null;
    }
  }

  playerHit(kind) {
    const p = this.player, fx = this.game.effects;
    let mult = { punch: 1, kick: TUNING.kickMultiplier, super: TUNING.superMultiplier, ultra: TUNING.ultraMultiplier, mega: TUNING.megaMultiplier }[kind];
    const reach = kind === 'super' ? 160 : kind === 'ultra' ? 260 : kind === 'mega' ? 300 : 100;
    const inReach = b => kind === 'mega' ? Math.hypot(b.x - p.x, b.y - p.y) < reach
      : Math.abs(b.x - p.x) < reach && Math.abs(b.y - p.y) < 70 && Math.sign(b.x - p.x) === p.facing;
    if (kind === 'super') fx.ring(p.reachX, p.y - 50, 140, '#e67e22');
    if (kind === 'ultra') { fx.ring(p.x, p.y - 50, 320, '#8e44ad', 0.8); fx.bump(16); }
    if (kind === 'mega') { fx.ring(p.x, p.y - 50, 360, '#2980b9', 1.0); fx.ring(p.x, p.y - 50, 200, '#f1c40f', 0.7); fx.bump(20); }
    let targets = this.alive.filter(inReach);
    if (kind === 'punch' || kind === 'kick') targets = targets.slice(0, 1);   // plain hits land on one boss
    if (!targets.length) { sound.play('miss'); return; }
    this.hits++;
    const crit = this.hits % TUNING.critEvery === 0;
    if (crit) { mult *= TUNING.critMultiplier; fx.float(TEXT.crit, p.x, p.y - 150, '#e74c3c', 34); fx.bump(10); }
    sound.play(kind === 'punch' ? 'punch' : 'kick');
    const dmg = Math.round(state.power * mult);
    for (const b of targets) {
      b.hp -= dmg; b.flash = 0.2; b.x = clampX(b.x + p.facing * (kind === 'ultra' ? 60 : 15));
      if (kind === 'mega') { b.stun = TUNING.megaStun; b.windup = 0; }
      const label = kind === 'mega' ? 'MEGA SUPER!' : kind === 'ultra' ? 'ULTRA SUPER!' : kind === 'super' ? 'SUPER!' : '';
      fx.float(`${label} -${nl(dmg)}`.trim(), b.x, b.y - b.h - 10, '#c0392b', kind === 'punch' && !crit ? 26 : 36);
      if (b.hp <= 0 && !b.dead) { b.dead = true; fx.float(`${b.def.name} verslagen!`, b.x, b.y - b.h - 40, '#27ae60', 28); sound.play('wallBreak'); }
    }
    this.meter = Math.min(100, this.meter + TUNING.superMeterPerHit);
    fx.bump(kind === 'punch' ? 3 : 8);
    if (!this.alive.length) this.finish(true);
  }

  finish(won) {
    this.over = won ? 'win' : 'lose';
    setTimeout(() => sound.play(won ? 'win' : 'lose'), 400);
    if (!won) return;
    const id = this.superFight ? this.superFight.id : this.bosses[0].def.id;
    state.addCoins(this.prizeCoins); state.bossWins[id] = state.wins(id) + 1; state.save();
    this.prize = `+${nl(this.prizeCoins)} munten  +${nl(this.prizeXp)} XP`;
    if (state.addXp(this.prizeXp)) { this.prize += '  LEVEL UP!'; setTimeout(() => sound.play('levelUp'), 1600); }
  }

  draw(ctx) {
    const p = this.player;
    this.drawRing(ctx);
    if (this.coinBag) text(ctx, '💰', this.coinBag.x, this.coinBag.y - 16, { size: 34, align: 'center' });
    const order = [p, ...this.alive].sort((a, c) => a.y - c.y);
    for (const e of order) e === p ? p.draw(ctx) : this.drawBoss(ctx, e);
    for (const l of this.lasers) { ctx.save(); ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(l.x - Math.sign(l.vx) * 40, l.y); ctx.lineTo(l.x, l.y); ctx.stroke(); ctx.restore(); }

    text(ctx, 'JIJ', 30, 30, { size: 22 });
    bar(ctx, 30, 45, 260, 26, state.hp / state.maxHp, '#7dc36b', `${nl(state.hp)}/${nl(state.maxHp)}`);
    bar(ctx, 30, 78, 260, 14, this.meter / 100, this.meter >= TUNING.ultraCost ? '#8e44ad' : '#e67e22');
    const ready = [];
    if (this.meter >= TUNING.superCost) ready.push('S: SUPER');
    if (this.meter >= TUNING.megaCost && state.hasFlag('mega')) ready.push('D: MEGA');
    if (this.meter >= TUNING.ultraCost && state.level >= TUNING.ultraLevel) ready.push('U: ULTRA');
    text(ctx, ready.length ? ready.join('   ') + '!' : 'super meter', 30, 106, { size: 16 });
    const extras = [];
    if (state.count('banana')) extras.push(`🍌 ×${state.count('banana')} (B)`);
    if (state.count('life')) extras.push(`❤️ ×${state.count('life')}`);
    if (this.invuln > 0) extras.push(`👻 ${this.invuln.toFixed(1)}`);
    if (extras.length) text(ctx, extras.join('   '), 30, 128, { size: 15 });

    // boss bars, bottom right, one per boss
    text(ctx, this.title, 930, 545 - this.bosses.length * 30, { size: 22, align: 'right' });
    this.bosses.forEach((b, i) => {
      const y = 555 - (this.bosses.length - i) * 30;
      bar(ctx, 670, y, 260, 24, b.hp / b.maxHp, b.dead ? '#95a5a6' : '#e74c3c', `${b.def.name}  ${nl(Math.max(0, b.hp))}/${nl(b.maxHp)}`);
    });

    if (this.startT > 0) text(ctx, this.superFight ? 'SUPERGEVECHT!' : TEXT.fightStart, 480, 300, { size: 70, align: 'center', color: '#c0392b', stroke: true });
    if (this.over) {
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.75)'; roundRect(ctx, 230, 210, 500, 180, 16); ctx.fill(); ctx.restore();
      text(ctx, this.over === 'win' ? TEXT.youWin : TEXT.youLose, 480, 260, { size: 44, align: 'center', color: this.over === 'win' ? '#27ae60' : '#c0392b' });
      if (this.over === 'win') text(ctx, this.prize, 480, 310, { size: 24, align: 'center', color: '#b7950b' });
      if (this.overT > 1) text(ctx, TEXT.pressEnter, 480, 360, { size: 20, align: 'center' });
    }
  }
  drawBoss(ctx, b) {
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(b.x, b.y, 45, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    let h = b.h, dx = 0, rot = 0;
    if (b.stun > 0) rot = Math.sin(b.stun * 10) * 0.15;
    if (b.windup > 0) { const p = b.attackKind === 'stomp' ? (0.8 - b.windup) / 0.8 : (0.45 - b.windup) / 0.45; h = b.h * (1 + p * (b.attackKind === 'stomp' ? 0.35 : 0.2)); dx = b.attackKind === 'stomp' ? 0 : b.facing * p * 30; }
    if (b.flash > 0) { ctx.save(); ctx.filter = 'sepia(1) saturate(8) hue-rotate(-40deg)'; }
    const shake = b.flash > 0 ? (Math.random() - 0.5) * 10 : 0;
    drawSprite(ctx, assets.get(b.def.sprite), b.x + dx + shake, b.y, { h, flip: b.facing > 0, rot });
    if (b.flash > 0) ctx.restore();
    if (b.stun > 0) text(ctx, '💫', b.x, b.y - h - 10, { size: 30, align: 'center' });
  }
  drawRing(ctx) {
    const { x, y, w, h } = RING;
    ctx.save();
    ctx.fillStyle = '#f7efdc'; ctx.fillRect(x - 40, y - 40, w + 80, h + 60);
    ctx.strokeStyle = '#5f7f5a'; ctx.lineWidth = 4;
    for (const off of [-40, -28]) ctx.strokeRect(x - 20, y + off, w + 40, h + 40);
    ctx.strokeRect(x - 20, y - 40, w + 40, h + 40);
    ctx.fillStyle = '#e9dcc0';
    for (const [px, py] of [[x - 30, y - 60], [x + w + 10, y - 60], [x - 30, y + h - 20], [x + w + 10, y + h - 20]]) { ctx.fillRect(px, py, 24, 40); ctx.strokeRect(px, py, 24, 40); }
    ctx.restore();
  }
}
