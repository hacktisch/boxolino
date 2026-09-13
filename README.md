# BOXOLINO

A top-down boxing/training game built from Simon's own drawings.

## Play

```
npm start          # or: python3 -m http.server 8080
```
Then open http://localhost:8080 in a browser. (It must be served over http, not opened as a file.)

Controls: arrow keys walk, Space punch, X kick, Z somersault, Enter use shop / boss / gate,
S = SUPER and U = ULTRA SUPER in the arena. M mutes sound.
The game is a PWA (`manifest.webmanifest`, `sw.js`, icons in `assets/icons/`): on a phone it can be installed to the home screen and then runs full screen in landscape; a banner offers this. Bump `CACHE` in `sw.js` when you want to force old installs to refetch everything.
On phones and tablets on-screen buttons appear (joystick left, actions right); the 🎮 button in the corner toggles them.
Sound effects are synthesized in `src/engine/sound.js` (no audio files); add a new one to the `SOUNDS` table and call `sound.play('name')`. Progress saves automatically in the browser.
Shift+R on the title screen wipes the save.

## How it is built

- `assets/sprites/*.png` – cut out of the photos of the drawings by `tools/extract_sprites.py`.
  To add a new drawing: photograph it, add the crop box to `BOXES` in that script, run `npm run sprites`,
  then add the name to `src/engine/assets.js`.
- `src/data/config.js` – **all the game numbers and text**: XP per hit, wall strength, shop items, bosses, levels.
  Most tweaks ("the boss is too hard", "gloves should cost 30") only need this file.
- `src/state.js` – level, XP, coins, inventory, saved to localStorage.
- `src/player.js` – the main character (walking, punching, kicking, somersault).
- `src/scenes/level.js` – a walk-around level, built from a layout in config. `arena.js` – boss fight. `shop.js` – shop overlay. `title.js` – start screen.
- `src/main.js` – game loop and scene switching.

## Adding a level

Levels are pure data: see `LEVELS` in `src/data/config.js`. Each level lists its gate, bosses, shops
(with the item ids they sell), punching bags (XP per hit, optional unlock after N hits) and walls
(hp and coin formulas per wall level). `x,y` is where the feet are, `h` the drawn height, `at` where
the player stands to use it, `block` a rectangle you can't walk through.

1. Draw it, photograph it, add crop boxes in `tools/extract_sprites.py`, run `npm run sprites`,
   add the sprite names to `src/engine/assets.js`.
2. Copy the `level2` object in `LEVELS`, change the positions and sprites, give it a new `id`.
3. Set `next: '<new id>'` on the previous level's gate. Bosses go in `BOSSES`, items in `ITEMS`.

Backspace walks back to the previous level. Debug in the browser console: `game.state` (e.g. `game.state.coins = 999; game.state.save()`).
