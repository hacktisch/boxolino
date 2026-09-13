// Game loop + scene switching. Add new scenes to the `scenes` map.
import { assets } from './engine/assets.js';
import { Input } from './engine/input.js';
import { Effects } from './engine/effects.js';
import { state } from './state.js';
import { sound } from './engine/sound.js';
import { setupTouch } from './engine/touch.js';
import { TitleScene } from './scenes/title.js';
import { LevelScene } from './scenes/level.js';
import { LEVELS } from './data/config.js';
import { ArenaScene } from './scenes/arena.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

window.game = { state };   // handy for debugging in the browser console
const game = window.game.game = {
  effects: new Effects(),
  input: new Input(),
  scenes: {},
  scene: null,
  switchTo(name, params = {}) {
    this.scene = this.scenes[name];
    this.scene.enter(params);
  },
};

// Fit the canvas on screen (touch controls overlay it; in portrait the game sits at the top).
function fit() {
  const W = window.innerWidth, H = window.innerHeight, touch = document.body.classList.contains('touch');
  const s = Math.min(W / canvas.width, H / canvas.height), w = canvas.width * s, h = canvas.height * s;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  canvas.style.left = (W - w) / 2 + 'px';
  canvas.style.top = (touch && H > W ? Math.min(40, (H - h) / 2) : (H - h) / 2) + 'px';
}
window.refit = fit;
window.addEventListener('resize', fit); fit();
setupTouch(game.input);

async function main() {
  ctx.fillStyle = '#2b3a2b'; ctx.font = '30px sans-serif'; ctx.fillText('Laden...', 420, 300);
  await assets.load();
  state.load();
  game.scenes.title = new TitleScene(game);
  for (const L of LEVELS) game.scenes[L.id] = new LevelScene(game, L);
  game.scenes.arena = new ArenaScene(game);
  game.switchTo('title');

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (game.input.pressed('KeyM')) sound.toggle();   // M = mute
    game.scene.update(dt, game.input);
    game.effects.update(dt);
    game.input.endFrame();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#f1e8d2'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (game.effects.shake > 0) ctx.translate((Math.random() - 0.5) * game.effects.shake, (Math.random() - 0.5) * game.effects.shake);
    game.scene.draw(ctx);
    game.effects.draw(ctx);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
main().catch(e => { ctx.fillStyle = 'red'; ctx.fillText('Fout: ' + e.message, 20, 340); console.error(e); });
