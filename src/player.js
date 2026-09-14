// The main character: walking, punching, kicking, somersault. Used in the gym and in the arena.
import { assets } from './engine/assets.js';
import { drawSprite } from './engine/draw.js';
import { TUNING } from './data/config.js';

export class Player {
  constructor(x, y) {
    this.x = x; this.y = y; this.facing = 1; this.h = 110;
    this.action = null;       // { name, t, dur, hitDone }
    this.walkT = 0; this.moving = false;
    this.flashT = 0;          // red flash when hurt
  }
  get busy() { return !!this.action; }
  get reachX() { return this.x + this.facing * 60; }   // where punches land

  // Start an action. Returns false if already busy.
  start(name) {
    if (this.action) return false;
    const dur = { punch: 0.28, kick: 0.42, jump: 0.7, super: 0.6, ultra: 0.9, mega: 1.0, dead: 99 }[name] || 0.3;
    this.action = { name, t: 0, dur, hitDone: false };
    return true;
  }

  // Move with arrow keys inside bounds; `blocks` = rectangles you can't walk through.
  move(input, dt, bounds, blocks = []) {
    if (this.action && this.action.name !== 'jump') { this.moving = false; return; }
    let dx = (input.down('ArrowRight') ? 1 : 0) - (input.down('ArrowLeft') ? 1 : 0);
    let dy = (input.down('ArrowDown') ? 1 : 0) - (input.down('ArrowUp') ? 1 : 0);
    this.moving = dx !== 0 || dy !== 0;
    if (!this.moving) return;
    if (dx) this.facing = dx;
    const len = Math.hypot(dx, dy); dx /= len; dy /= len;
    const step = TUNING.playerSpeed * dt;
    const nx = this.x + dx * step, ny = this.y + dy * step;
    if (!this.hits(nx, this.y, blocks)) this.x = nx;
    if (!this.hits(this.x, ny, blocks)) this.y = ny;
    this.x = Math.max(bounds.x + 30, Math.min(bounds.x + bounds.w - 30, this.x));
    this.y = Math.max(bounds.y + 40, Math.min(bounds.y + bounds.h, this.y));
    this.walkT += dt;
  }
  hits(x, y, blocks) { return blocks.some(b => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h); }

  update(dt) {
    this.flashT = Math.max(0, this.flashT - dt);
    if (this.action) {
      this.action.t += dt;
      if (this.action.t >= this.action.dur) this.action = null;
    }
  }
  // true exactly once, in the middle of a punch/kick, when the hit should land
  hitNow() {
    const a = this.action;
    if (!a || a.hitDone || a.name === 'jump' || a.name === 'dead') return false;
    if (a.t >= a.dur * 0.4) { a.hitDone = true; return true; }
    return false;
  }

  draw(ctx) {
    let img = assets.get('stand'), rot = 0, dy = 0, h = this.h;
    const a = this.action;
    if (a) {
      if (a.name === 'punch') img = assets.get('punch');
      else if (a.name === 'kick') img = assets.get('kick');
      else if (a.name === 'super') { img = assets.get('punch'); h = this.h * 1.15; }
      else if (a.name === 'ultra') { img = assets.get('flykick'); h = this.h * 0.9; dy = -30; }
      else if (a.name === 'mega') { img = assets.get('somersault'); const p = a.t / a.dur; dy = -Math.sin(p * Math.PI) * 160 - 60; rot = p * Math.PI * 4; h = this.h; }
      else if (a.name === 'dead') { img = assets.get('dead'); h = this.h * 0.6; }
      else if (a.name === 'jump') {
        img = assets.get('somersault'); const p = a.t / a.dur;
        dy = -Math.sin(p * Math.PI) * 120; rot = p * Math.PI * 2 * this.facing; h = this.h * 0.8;
      }
    } else if (this.moving) {
      const frames = ['walk1', 'walk2', 'walk3', 'walk2'];
      img = assets.get(frames[Math.floor(this.walkT * 8) % frames.length]);
      dy = -Math.abs(Math.sin(this.walkT * 12)) * 8;    // "he walks with jumps"
    }
    // shadow
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(this.x, this.y, 35, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (this.flashT > 0) { ctx.save(); ctx.filter = 'sepia(1) saturate(6) hue-rotate(-30deg)'; }
    drawSprite(ctx, img, this.x, this.y + dy, { h, flip: this.facing < 0, rot, alpha: this.alpha ?? 1, anchor: a && (a.name === 'jump' || a.name === 'mega') ? 'center' : 'bottom' });
    if (this.flashT > 0) ctx.restore();
  }
}
