// Floating texts ("+5 XP", "POW!"), shockwave rings and screen shake.
import { text } from './draw.js';
export class Effects {
  constructor() { this.items = []; this.shake = 0; }
  float(str, x, y, color = '#c0392b', size = 26) { this.items.push({ kind: 'text', str, x, y, color, size, t: 0, life: 1 }); }
  ring(x, y, radius = 120, color = '#e67e22', life = 0.5) { this.items.push({ kind: 'ring', x, y, radius, color, t: 0, life }); }
  bump(amount = 6) { this.shake = Math.max(this.shake, amount); }
  update(dt) {
    this.items.forEach(i => i.t += dt);
    this.items = this.items.filter(i => i.t < i.life);
    this.shake = Math.max(0, this.shake - dt * 30);
  }
  draw(ctx) {
    for (const i of this.items) {
      const p = i.t / i.life;
      if (i.kind === 'text') {
        ctx.save(); ctx.globalAlpha = 1 - p;
        text(ctx, i.str, i.x, i.y - p * 50, { size: i.size, color: i.color, align: 'center', stroke: true });
        ctx.restore();
      } else {
        ctx.save(); ctx.globalAlpha = 1 - p; ctx.strokeStyle = i.color; ctx.lineWidth = 8 * (1 - p) + 2;
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(i.x, i.y, i.radius * p * (1 - k * 0.2), 0, Math.PI * 2); ctx.stroke(); }
        ctx.restore();
      }
    }
  }
}
