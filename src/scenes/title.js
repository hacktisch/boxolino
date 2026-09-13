// Start screen with the controls.
import { assets } from '../engine/assets.js';
import { drawSprite, text } from '../engine/draw.js';
import { TEXT } from '../data/config.js';
import { state } from '../state.js';
import { sound } from '../engine/sound.js';

export class TitleScene {
  constructor(game) { this.game = game; this.t = 0; }
  enter() { this.t = 0; }
  update(dt, input) {
    this.t += dt;
    if (input.pressed('Enter') || input.pressed('Space')) { sound.play('start'); this.game.switchTo(state.currentLevel); }
    if (input.pressed('KeyR') && input.down('ShiftLeft')) state.reset();   // Shift+R wipes the save
  }
  draw(ctx) {
    text(ctx, "BOXOLINO", 480, 90, { size: 64, align: 'center', color: '#c0392b', stroke: true });
    text(ctx, "Gemaakt door Simon", 480, 145, { size: 34, align: 'center', color: '#0000ff', stroke: true });
    drawSprite(ctx, assets.get('walk2'), 300, 380, { h: 200, flip: false });
    drawSprite(ctx, assets.get('boss'), 660, 380, { h: 180, flip: true });
    TEXT.controls.forEach((c, i) => text(ctx, c, 480, 420 + i * 28, { size: 20, align: 'center' }));
    if (Math.floor(this.t * 2) % 2 === 0) text(ctx, 'Druk op Enter om te spelen', 480, 570, { size: 26, align: 'center', color: '#27ae60' });
    text(ctx, 'Shift+R: opnieuw beginnen', 940, 585, { size: 12, align: 'right', bold: false });
  }
}
