// Top bar: level, kracht (power), coins — using the labels Simon drew.
// Late in the game these run to seven figures, so every value has a box it must fit in
// (`maxWidth` shrinks the text) and the three groups are spaced so they cannot collide.
import { assets } from './engine/assets.js';
import { drawSprite, text, bar, nl } from './engine/draw.js';
import { state } from './state.js';

// bubble x, where its number starts, how wide the number may be
const LEVEL = { bubble: 250, value: 332, width: 100, bar: 180 };
const POWER = { bubble: 560, value: 616, width: 126, bar: 500 };
const COINS = { bubble: 790, value: 838, width: 118 };

export function drawHud(ctx) {
  const y = 34;

  drawSprite(ctx, assets.get('hud_level'), LEVEL.bubble, y, { h: 44, anchor: 'center' });
  text(ctx, state.level, LEVEL.value, y, { size: 30, maxWidth: LEVEL.width });
  bar(ctx, LEVEL.bar, 58, 180, 12, state.xp / state.xpNeeded, '#7dc36b');
  text(ctx, `${nl(state.xp)}/${nl(state.xpNeeded)} XP`, LEVEL.bar + 90, 80, { size: 14, align: 'center', maxWidth: 180 });

  drawSprite(ctx, assets.get('hud_power'), POWER.bubble, y, { h: 44, anchor: 'center' });
  text(ctx, nl(state.power), POWER.value, y, { size: 30, color: '#c0392b', maxWidth: POWER.width });
  // Kracht spans 7 → 100.000 across the whole game, so the bar is logarithmic: it fills by
  // one fifth for every ten times stronger, and is only full at the end of world 4.
  bar(ctx, POWER.bar, 58, 150, 12, Math.min(1, Math.log10(Math.max(1, state.power)) / 5), '#e74c3c');

  drawSprite(ctx, assets.get('hud_coin'), COINS.bubble, y, { h: 44, anchor: 'center' });
  text(ctx, nl(state.coins), COINS.value, y, { size: 30, color: '#b7950b', maxWidth: COINS.width });
}
