// ======================================================================
//  ALL GAME NUMBERS LIVE HERE. Change these to tune the game or add stuff.
// ======================================================================

// Text shown in the game (Dutch, because the drawings are in Dutch).
export const TEXT = {
  punchBag: 'Spatie: sla de bokszak',
  punchWall: 'Spatie: sla de muur',
  enterShop: 'Enter: winkel',
  challengeBoss: 'Enter: daag uit',
  superFight: 'Enter: SUPERGEVECHT!',
  superFightLocked: 'Versla eerst alle 3 de bazen',
  gateLocked: lvl => `Poort gaat open op level ${lvl}`,
  gateOpen: 'Enter: door de poort',
  gateSoon: 'Volgend level komt nog! (nog te tekenen)',
  back: 'Backspace: terug naar vorig level',
  buyGoldBag: 'Koop de gouden bokszak in de winkel',
  levelUp: 'LEVEL UP!',
  wallBroken: 'MUUR KAPOT!',
  shopTitle: 'WINKEL',
  shopHelp: '↑↓ kies   Enter koop   Esc sluit',
  bought: 'Gekocht!',
  owned: 'Al gekocht',
  tooPoor: 'Te weinig munten!',
  locked: lvl => `Vanaf level ${lvl}`,
  fightStart: 'VECHT!',
  youWin: 'GEWONNEN!',
  youLose: 'Verloren... train meer!',
  pressEnter: 'Druk op Enter',
  newAttack: 'NIEUWE AANVAL: D = MEGA SUPER!',
  crit: 'KRITIEK!',
  extraLife: 'EXTRA LEVEN!',
  banana: 'BANANENSCHIL! 🍌',
  invisible: 'ONZICHTBAAR!',
  coinBag: 'MUNTENZAK!',
  controls: ['Pijltjes: lopen', 'Spatie: slaan', 'X: schoppen', 'Z: salto',
             'S: SUPER  U: ULTRA SUPER  D: MEGA SUPER  B: bananenschil (in de arena)', 'M: geluid aan/uit'],
};

// The whole game is tuned around one idea: every world costs about the same amount of
// *work* (≈750 bag hits or a dozen boss wins) even though its numbers are ten times bigger.
// So XP per level, kracht and HP all grow with the level, and each world's bags, walls and
// bosses are scaled to the level band that plays it. Gates: 20 → 50 → 120 → 200.
export const CONTENT_LEVEL = 200;         // the last gate; where the drawn content ends

export const TUNING = {
  playerSpeed: 230,                       // pixels per second
  xpForLevel: lvl => Math.round(17 * Math.pow(lvl, 1.6)),   // XP to go from lvl to lvl+1
  basePower: lvl => Math.round(5 + lvl * 2 + lvl * lvl / 40),   // "kracht" without gloves
  maxHp: lvl => Math.round(100 + lvl * 10 + lvl * lvl / 2),
  wallRespawn: 2.5,                       // seconds before a new wall appears
  kickMultiplier: 1.6,                    // kick hits harder but is slower
  superMeterPerHit: 12,                   // meter fills per landed hit (0-100)
  superCost: 50, superMultiplier: 4,      // SUPER: needs 50 meter, 4x power
  ultraCost: 100, ultraMultiplier: 9,     // ULTRA SUPER: full meter, 9x power
  ultraLevel: 5,                          // level needed to use ULTRA SUPER
  megaCost: 70, megaMultiplier: 6, megaStun: 2.5,   // MEGA SUPER (unlocked by the level-2 bag): stuns the boss
  critEvery: 10, critMultiplier: 3,       // every 10th landed hit is a critical hit
  invisibleTime: 5,                       // seconds you can't be hit at the start of a fight (Onzichtbaarheidsdrank)
  bananaStun: 3,                          // seconds every boss slips on a banana peel
  coinBagChance: 0.35,                    // chance a bag of coins drops into the ring during a fight
  coinBagShare: 0.05,                     // ...worth this share of the boss prize
  // Beating a boss makes it stronger and its prize bigger (Simon's rule). The prize grows
  // slower than its health, so farming one boss has diminishing returns and pushes you on.
  bossScalePerWin: 1.35,                  // boss hp grows by this every time you beat it
  bossPowerPerWin: 1.12,                  // boss power grows by this every time you beat it
};

// Things you can buy. `power` adds to kracht, `hp` to health. `flag` unlocks something in the world.
// `requires` = must own that item first. `minLevel` = only for sale from that level (shown locked before).
// `consumable` = stackable, used in the arena. `effect` = happens right away, can be bought again.
// Which shop sells what is decided in the LEVELS layouts below.
export const ITEMS = [
  // world 1 (levels 1-20): ~2.400 coins of gear, walls + boss pay ~4.500
  { id: 'gloves1', name: 'Bokshandschoenen lvl 2', price: 50,  power: 5 },
  { id: 'goldbag', name: 'Gouden bokszak (20 XP per slag)', price: 100, flag: 'goldBag' },
  { id: 'gloves2', name: 'Bokshandschoenen lvl 3', price: 200, power: 12, requires: 'gloves1' },
  { id: 'gloves3', name: 'Gouden handschoenen', price: 600, power: 25, requires: 'gloves2' },
  { id: 'potion',  name: 'Krachtdrank (+40 kracht)', price: 400, power: 40, minLevel: 15 },
  { id: 'belt',    name: 'Kampioensriem (+80 kracht)', price: 1000, power: 80, minLevel: 18, requires: 'potion' },
  // world 2 (20-50): ~25.000 of gear, walls + bosses pay ~150.000
  { id: 'drink2',  name: 'Spierdrank (+150 kracht)', price: 1500, power: 150, requires: 'potion' },
  { id: 'drink3',  name: 'Monsterdrank (+400 kracht)', price: 6000, power: 400, requires: 'drink2', minLevel: 30 },
  { id: 'gloves4', name: 'Stalen handschoenen (+200)', price: 3000, power: 200, requires: 'gloves3' },
  { id: 'gloves5', name: 'Diamanten handschoenen (+500)', price: 12000, power: 500, requires: 'gloves4', minLevel: 35 },
  { id: 'shield',  name: 'Schild (+200 HP in de arena)', price: 2500, hp: 200 },
  // world 3 (50-120): ~100.000 of gear, walls + bosses pay ~400.000
  { id: 'drink4',  name: 'Vulkaandrank (+1200 kracht)', price: 8000, power: 1200, requires: 'drink3' },
  { id: 'gloves6', name: 'Vuurhandschoenen (+1500)', price: 15000, power: 1500, requires: 'gloves5' },
  { id: 'gloves7', name: 'Bliksemhandschoenen (+4000)', price: 60000, power: 4000, requires: 'gloves6', minLevel: 80 },
  { id: 'armor',   name: 'Harnas (+1500 HP)', price: 6000, hp: 1500 },
  { id: 'invis',   name: 'Onzichtbaarheidsdrank (5 sec onraakbaar per gevecht)', price: 5000, flag: 'invisible', minLevel: 60 },
  { id: 'banana',  name: 'Bananenschil (B in de arena: bazen glijden uit)', price: 300, consumable: true },
  { id: 'life',    name: 'Extra leven (1x opstaan in de arena)', price: 2500, consumable: true },
  // gambles. `scale` multiplies both the prize and what a fair price would be, so the
  // world-4 versions stay exciting instead of turning into pocket change.
  { id: 'mystery', name: 'Mysteriedrank (?!)', price: 6000, effect: 'mystery', scale: 1 },
  { id: 'lottery', name: 'Loterijlot', price: 1000, effect: 'lottery', scale: 1 },
  // world 4 (120-200): ~1,4 miljoen of gear, walls + bosses pay ~1,8 miljoen (dubbel met de magneet)
  { id: 'drink5',  name: 'Drakendrank (+10000 kracht)', price: 120000, power: 10000, requires: 'drink4' },
  { id: 'drink6',  name: 'Sterrendrank (+30000 kracht)', price: 400000, power: 30000, requires: 'drink5', minLevel: 160 },
  { id: 'gloves8', name: 'Katchin handschoenen (+12000)', price: 150000, power: 12000, requires: 'gloves7' },
  { id: 'gloves9', name: 'Diamant-Katchin handschoenen (+40000)', price: 600000, power: 40000, requires: 'gloves8', minLevel: 170 },
  { id: 'armor2',  name: 'Drakenharnas (+8000 HP)', price: 60000, hp: 8000, requires: 'armor' },
  { id: 'magnet',  name: 'Muntenmagneet (muren betalen dubbel)', price: 50000, flag: 'magnet' },
  { id: 'mystery4', name: 'Mega mysteriedrank (?!?!)', price: 150000, effect: 'mystery', scale: 25 },
  { id: 'lottery4', name: 'Superloterijlot', price: 25000, effect: 'lottery', scale: 25 },
];

// Bosses. Each win makes them stronger and the reward bigger (`prizeGrowth`).
// traits: dash = lunges at you · double = hits twice · stomp = shockwave, jump to dodge · laser = shoots, jump to dodge
export const BOSSES = [
  // hp ≈ 15-30 punches when you first meet it, power ≈ 1/30th of your HP at that level.
  // prizeCoins are Simon's numbers off the drawings; prizeXp ≈ 1-6 levels per win.
  { id: 'boss1',  name: 'De Baas',    sprite: 'boss',   h: 130, hp: 200,     power: 15,   speed: 100, attackEvery: 1.0, reach: 80,  prizeCoins: 25,    prizeXp: 600,     prizeGrowth: 1.25 },
  { id: 'boss2a', name: 'Bokser',     sprite: 'boss2a', h: 140, hp: 4000,    power: 25,   speed: 110, attackEvery: 1.0, reach: 85,  prizeCoins: 300,   prizeXp: 4000,    prizeGrowth: 1.25 },
  { id: 'boss2b', name: 'Robot',      sprite: 'boss2b', h: 150, hp: 8000,    power: 40,   speed: 120, attackEvery: 0.9, reach: 95,  prizeCoins: 900,   prizeXp: 10000,   prizeGrowth: 1.25 },
  { id: 'boss2c', name: 'Spierbaas',  sprite: 'boss2c', h: 210, hp: 16000,   power: 70,   speed: 130, attackEvery: 0.8, reach: 110, prizeCoins: 5000,  prizeXp: 25000,   prizeGrowth: 1.25 },
  // world 3
  { id: 'boss3a', name: 'Engel',      sprite: 'boss3a', h: 150, hp: 32000,   power: 120,  speed: 140, attackEvery: 0.9, reach: 90,  prizeCoins: 1000,  prizeXp: 20000,   prizeGrowth: 1.25, traits: ['dash'] },
  { id: 'boss3b', name: 'Vleugelmonster', sprite: 'boss3b', h: 190, hp: 70000, power: 220, speed: 130, attackEvery: 1.0, reach: 100, prizeCoins: 5000, prizeXp: 60000,  prizeGrowth: 1.25, traits: ['double'] },
  { id: 'boss3c', name: 'Steenreus',  sprite: 'boss3c', h: 200, hp: 150000,  power: 350,  speed: 90,  attackEvery: 1.4, reach: 110, prizeCoins: 7000,  prizeXp: 120000,  prizeGrowth: 1.25, traits: ['stomp'] },
  // world 4
  { id: 'boss4c', name: 'Boksrobot',  sprite: 'boss4c', h: 170, hp: 250000,  power: 500,  speed: 150, attackEvery: 0.8, reach: 100, prizeCoins: 5000,  prizeXp: 60000,   prizeGrowth: 1.25, traits: ['dash'] },
  { id: 'boss4b', name: 'Reuzenrobot', sprite: 'boss4b', h: 230, hp: 625000, power: 800,  speed: 100, attackEvery: 1.3, reach: 120, prizeCoins: 7000,  prizeXp: 180000,  prizeGrowth: 1.25, traits: ['stomp', 'double'] },
  { id: 'boss4a', name: 'TV-kop',     sprite: 'boss4a', h: 190, hp: 1500000, power: 1000, speed: 120, attackEvery: 1.0, reach: 100, prizeCoins: 10000, prizeXp: 350000,  prizeGrowth: 1.25, traits: ['laser'] },
];

// Levels. Every level is a layout: where things stand (x,y = feet position, h = drawn height),
// `at` = where the player stands to use it, `block` = rectangle you can't walk through.
// bags: `xp` per hit; `unlock` = after N hits you get a flag (an attack) and/or bonus kracht.
// walls: hp/coins per wall level; `firstBreak` = a one-time bonus the first time it breaks.
// superFight: all the level's bosses at once; opens once each of them has been beaten.
const SHOPS_TOP = (a, b, c, { h = 105, xs = [330, 470, 610] } = {}) =>
  [a, b, c].map((shop, i) => ({ ...shop, x: xs[i], y: 215, h, at: { x: xs[i], y: 245 }, block: { x: xs[i] - 60, y: 110, w: 120, h } }));

export const LEVELS = [
  {
    id: 'gym', name: 'Level 1 - De sportschool', start: { x: 470, y: 480 }, prev: null,
    gate: { x: 150, y: 190, h: 165, sprite: 'gate', needLevel: 20, next: 'level2', at: { x: 150, y: 220 }, block: { x: 40, y: 0, w: 220, h: 175 } },
    bosses: [{ id: 'boss1', x: 840, y: 190, h: 105, sign: 'boss_sign', at: { x: 840, y: 230 }, block: { x: 790, y: 60, w: 100, h: 120 } }],
    shops: [{ id: 'shop', x: 470, y: 370, h: 190, sprite: 'shop', at: { x: 470, y: 400 }, block: { x: 360, y: 190, w: 225, h: 175 },
              items: ['gloves1', 'goldbag', 'gloves2', 'gloves3', 'potion', 'belt'] }],
    bags: [{ id: 'bag1', x: 70, y: 560, h: 140, sprite: 'bag1', xp: 5, at: { x: 150, y: 540 }, block: { x: 20, y: 440, w: 95, h: 120 } },
           { id: 'goldbag', x: 250, y: 565, h: 155, sprite: 'bag_gold', xp: 20, needs: 'goldBag', at: { x: 330, y: 540 }, block: { x: 195, y: 430, w: 120, h: 130 } }],
    walls: [{ id: 'wall', x: 830, y: 590, h: 260, sprite: 'wall', at: { x: 690, y: 500 }, block: { x: 720, y: 330, w: 220, h: 260 },
              hp: lvl => Math.round(30 * Math.pow(lvl, 1.5)), coins: lvl => 15 * lvl }],
  },
  {
    id: 'level2', name: 'Level 2 - De stad', start: { x: 480, y: 520 }, prev: 'gym',
    gate: { x: 150, y: 200, h: 175, sprite: 'gate2', needLevel: 50, next: 'level3', at: { x: 150, y: 230 }, block: { x: 50, y: 0, w: 200, h: 185 } },
    bosses: [
      { id: 'boss2a', x: 600, y: 225, h: 115, at: { x: 600, y: 265 }, block: { x: 555, y: 110, w: 90, h: 115 } },
      { id: 'boss2b', x: 730, y: 225, h: 115, at: { x: 730, y: 265 }, block: { x: 670, y: 110, w: 120, h: 115 } },
      { id: 'boss2c', x: 855, y: 250, h: 165, at: { x: 855, y: 300 }, block: { x: 775, y: 85, w: 160, h: 165 } },
    ],
    shops: [
      { id: 'drinkshop', x: 250, y: 385, h: 140, sprite: 'drinkshop', at: { x: 250, y: 410 }, block: { x: 175, y: 250, w: 150, h: 135 },
        items: ['potion', 'drink2', 'drink3'] },
      { id: 'gloveshop', x: 420, y: 215, h: 105, sprite: 'gloveshop', at: { x: 420, y: 245 }, block: { x: 370, y: 110, w: 100, h: 105 },
        items: ['gloves1', 'gloves2', 'gloves3', 'gloves4', 'gloves5'] },
      { id: 'shop2', x: 420, y: 425, h: 150, sprite: 'shop2', at: { x: 420, y: 450 }, block: { x: 345, y: 280, w: 150, h: 145 },
        items: ['goldbag', 'belt', 'shield'] },
    ],
    bags: [
      { id: 'bag2a', x: 90, y: 405, h: 150, sprite: 'bag2a', xp: 50, at: { x: 175, y: 385 }, block: { x: 40, y: 260, w: 100, h: 145 },
        unlock: { hits: 100, flag: 'mega' } },   // punch it 100 times -> new super attack
      { id: 'bag2b', x: 90, y: 590, h: 165, sprite: 'bag2b', xp: 200, at: { x: 170, y: 565 }, block: { x: 40, y: 430, w: 90, h: 160 } },
    ],
    walls: [{ id: 'wall2', x: 830, y: 590, h: 240, sprite: 'wall2', at: { x: 690, y: 500 }, block: { x: 720, y: 350, w: 220, h: 240 },
              hp: lvl => Math.round(600 * Math.pow(lvl, 1.5)), coins: lvl => 60 * lvl }],
  },
  {
    id: 'level3', name: 'Level 3 - De bergen', start: { x: 480, y: 450 }, prev: 'level2',
    gate: { x: 130, y: 190, h: 165, sprite: 'gate3', needLevel: 120, next: 'level4', at: { x: 130, y: 220 }, block: { x: 40, y: 0, w: 180, h: 175 } },
    bosses: [
      { id: 'boss3a', x: 885, y: 200, h: 90,  at: { x: 885, y: 235 }, block: { x: 820, y: 115, w: 130, h: 85 } },
      { id: 'boss3b', x: 880, y: 340, h: 120, at: { x: 770, y: 320 }, block: { x: 800, y: 225, w: 160, h: 115 } },
      { id: 'boss3c', x: 880, y: 480, h: 120, at: { x: 775, y: 470 }, block: { x: 797, y: 365, w: 166, h: 115 } },
    ],
    superFight: { id: 'super3', sprite: 'super3', x: 745, y: 215, h: 120, at: { x: 745, y: 250 }, block: { x: 672, y: 100, w: 146, h: 115 },
                  prizeCoins: 25000, prizeXp: 400000, prizeGrowth: 1.25 },
    shops: SHOPS_TOP(
      { id: 'shop3a', sprite: 'shop3a', items: ['drink3', 'mystery', 'drink4', 'invis'] },
      { id: 'shop3b', sprite: 'shop3b', items: ['gloves5', 'gloves6', 'gloves7'] },
      { id: 'shop3c', sprite: 'shop3c', items: ['shield', 'armor', 'banana', 'life', 'lottery'] }),
    bags: [
      { id: 'bag3a', x: 90, y: 400, h: 150, sprite: 'bag3a', xp: 500, at: { x: 175, y: 385 }, block: { x: 30, y: 255, w: 110, h: 145 } },
      { id: 'bag3b', x: 80, y: 585, h: 165, sprite: 'bag3b', xp: 2000, at: { x: 165, y: 565 }, block: { x: 30, y: 425, w: 90, h: 160 },
        unlock: { hits: 50, flag: 'ironfist', power: 1500, text: 'IJZEREN VUIST! +1500 kracht' } },
    ],
    walls: [{ id: 'wall3', x: 680, y: 590, h: 160, sprite: 'wall3', at: { x: 560, y: 520 }, block: { x: 605, y: 430, w: 150, h: 160 },
              hp: lvl => Math.round(3600 * Math.pow(lvl, 1.5)), coins: lvl => 500 * lvl, label: 'Bakstenen muur' }],
  },
  {
    id: 'level4', name: 'Level 4 - De robotfabriek', start: { x: 480, y: 480 }, prev: 'level3',
    gate: { x: 110, y: 180, h: 160, sprite: 'gate4', needLevel: 200, next: null, at: { x: 110, y: 210 }, block: { x: 30, y: 0, w: 160, h: 170 } },
    bosses: [
      { id: 'boss4a', x: 865, y: 230, h: 130, at: { x: 865, y: 265 }, block: { x: 785, y: 100, w: 165, h: 130 } },
      { id: 'boss4b', x: 870, y: 470, h: 150, at: { x: 750, y: 410 }, block: { x: 785, y: 320, w: 170, h: 150 } },
      { id: 'boss4c', x: 560, y: 410, h: 120, at: { x: 560, y: 445 }, block: { x: 490, y: 290, w: 140, h: 120 } },
    ],
    superFight: { id: 'super4', sprite: 'super4', x: 700, y: 230, h: 90, at: { x: 700, y: 265 }, block: { x: 645, y: 140, w: 110, h: 90 },
                  prizeCoins: 35000, prizeXp: 1200000, prizeGrowth: 1.25 },
    shops: SHOPS_TOP(
      { id: 'shop4a', sprite: 'shop4a', items: ['drink5', 'drink6', 'mystery4', 'invis'] },
      { id: 'shop4b', sprite: 'shop4b', items: ['gloves7', 'gloves8', 'gloves9'] },
      { id: 'shop4c', sprite: 'shop4c', items: ['armor2', 'magnet', 'banana', 'life', 'lottery4'] },
      { h: 98, xs: [320, 480, 640] }),
    bags: [
      { id: 'bag4a', x: 95, y: 400, h: 160, sprite: 'bag4a', xp: 1500, at: { x: 190, y: 385 }, block: { x: 30, y: 245, w: 130, h: 155 } },
      { id: 'bag4b', x: 85, y: 585, h: 170, sprite: 'bag4b', xp: 6000, at: { x: 175, y: 565 }, block: { x: 30, y: 420, w: 110, h: 165 },
        unlock: { hits: 100, flag: 'titanfist', power: 15000, text: 'TITANENVUIST! +15000 kracht' } },
    ],
    walls: [{ id: 'wall4', x: 700, y: 590, h: 140, sprite: 'wall4', at: { x: 560, y: 540 }, block: { x: 620, y: 450, w: 160, h: 140 },
              hp: lvl => Math.round(36000 * Math.pow(lvl, 1.5)), coins: lvl => 6000 * lvl, label: 'Katchin staal',
              firstBreak: { flag: 'katchin', power: 8000, text: 'KATCHIN-SPLINTER! +8000 kracht' } }],
  },
];
