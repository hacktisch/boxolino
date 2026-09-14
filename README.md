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

## How the numbers are balanced

`src/data/config.js` is tuned around one idea: **every world costs about the same amount of work**
(roughly 750 bag hits, or a dozen boss wins) even though its numbers are ten times bigger.

| | world 1 | world 2 | world 3 | world 4 |
|---|---|---|---|---|
| levels | 1–20 | 20–50 | 50–120 | 120–200 |
| kracht on arrival | 7 | ~220 | ~1.600 | ~8.700 |
| first boss | 13 punches | 18 | 21 | 29 |
| hits you survive | 9 | 22 | 18 | 20 |

So `xpForLevel`, `basePower` and `maxHp` all grow with the level (`lvl^1.6`, `lvl²/40`, `lvl²/2`), and
each world's bags, walls, bosses and prices are scaled to the level band that plays it. A wall is
`base × wallLevel^1.35`, which keeps it at 10–25 punches forever instead of exploding. A boss's health
grows 1,35× per win but its prize only 1,25×, so farming one boss has diminishing returns.

Saves made before this balance are migrated on load (`src/state.js`): the level is rebuilt from the XP
actually earned and stops at `CONTENT_LEVEL`, because the old curve let the level reach 1000 while the
last gate is 200. Coins, items and wall progress are kept.

## Levels 3 and 4

Both have a **supergevecht**: all three bosses of the level at once, unlocked after beating each of them once. Bosses have `traits` (dash, double, stomp, laser). Every 10th hit is a critical. Shops sell surprises: a mystery drink and a lottery ticket (repeatable, random), banana peels (B in the arena: bosses slip), extra lives, an invisibility drink (untouchable for the first seconds of a fight) and a coin magnet. Some bags give bonus kracht after N hits; the Katchin wall in level 4 gives a one-time splinter bonus.

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
