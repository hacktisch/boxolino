// Top bar: level, kracht (power), coins — using the labels Simon drew.
import { assets } from './engine/assets.js';
import { drawSprite, text, bar } from './engine/draw.js';
import { state } from './state.js';

export function drawHud(ctx) {
  const y = 34;
  drawSprite(ctx, assets.get('hud_level'), 380, y, { h: 44, anchor: 'center' });
  text(ctx, state.level, 460, y, { size: 30 });
  bar(ctx, 320, 58, 180, 12, state.xp / state.xpNeeded, '#7dc36b');
  text(ctx, `${state.xp}/${state.xpNeeded} XP`, 410, 80, { size: 14, align: 'center' });

  drawSprite(ctx, assets.get('hud_power'), 600, y, { h: 44, anchor: 'center' });
  text(ctx, state.power, 665, y, { size: 30, color: '#c0392b' });
  bar(ctx, 545, 58, 140, 12, Math.min(1, state.power / 100), '#e74c3c');

  drawSprite(ctx, assets.get('hud_coin'), 790, y, { h: 44, anchor: 'center' });
  text(ctx, state.coins, 850, y, { size: 30, color: '#b7950b' });
}
