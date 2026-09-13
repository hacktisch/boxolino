// ======================================================================
//  ALL GAME NUMBERS LIVE HERE. Change these to tune the game or add stuff.
// ======================================================================

// Text shown in the game (Dutch, because the drawings are in Dutch).
export const TEXT = {
  punchBag: 'Spatie: sla de bokszak',
  punchWall: 'Spatie: sla de muur',
  enterShop: 'Enter: winkel',
  challengeBoss: 'Enter: daag uit',
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
  controls: ['Pijltjes: lopen', 'Spatie: slaan', 'X: schoppen', 'Z: salto',
             'S: SUPER  U: ULTRA SUPER  D: MEGA SUPER (in de arena)', 'M: geluid aan/uit'],
};

export const TUNING = {
  playerSpeed: 230,                       // pixels per second
  xpForLevel: lvl => 100 * lvl,           // XP needed to go from lvl to lvl+1
  basePower: lvl => 5 + lvl * 2,          // "kracht" without gloves
  maxHp: lvl => 100 + lvl * 10,
  wallRespawn: 2.5,                       // seconds before a new wall appears
  kickMultiplier: 1.6,                    // kick hits harder but is slower
  superMeterPerHit: 12,                   // meter fills per landed hit (0-100)
  superCost: 50, superMultiplier: 4,      // SUPER: needs 50 meter, 4x power
  ultraCost: 100, ultraMultiplier: 9,     // ULTRA SUPER: full meter, 9x power
  ultraLevel: 5,                          // level needed to use ULTRA SUPER
  megaCost: 70, megaMultiplier: 6, megaStun: 2.5,   // MEGA SUPER (unlocked by the level-2 bag): stuns the boss
};

// Things you can buy. `power` adds to kracht. `flag` unlocks something in the world.
// `requires` = must own that item first. `minLevel` = only for sale from that level (shown locked before).
// Which shop sells what is decided in the LEVELS layouts below.
export const ITEMS = [
  { id: 'gloves1', name: 'Bokshandschoenen lvl 2', price: 50,  power: 5 },
  { id: 'goldbag', name: 'Gouden bokszak (20 XP per slag)', price: 100, flag: 'goldBag' },
  { id: 'gloves2', name: 'Bokshandschoenen lvl 3', price: 200, power: 12, requires: 'gloves1' },
  { id: 'gloves3', name: 'Gouden handschoenen', price: 600, power: 25, requires: 'gloves2' },
  { id: 'potion',  name: 'Krachtdrank (+40 kracht)', price: 400, power: 40, minLevel: 15 },
  { id: 'belt',    name: 'Kampioensriem (+80 kracht)', price: 1000, power: 80, minLevel: 18, requires: 'potion' },
  // level 2 stuff
  { id: 'drink2',  name: 'Spierdrank (+150 kracht)', price: 1500, power: 150, requires: 'potion' },
  { id: 'drink3',  name: 'Monsterdrank (+400 kracht)', price: 6000, power: 400, requires: 'drink2', minLevel: 30 },
  { id: 'gloves4', name: 'Stalen handschoenen (+200)', price: 3000, power: 200, requires: 'gloves3' },
  { id: 'gloves5', name: 'Diamanten handschoenen (+500)', price: 12000, power: 500, requires: 'gloves4', minLevel: 35 },
  { id: 'shield',  name: 'Schild (+100 HP in de arena)', price: 2500, hp: 100 },
];

// Bosses. Each win makes them stronger (`scalePerWin`) and the reward bigger (`prizeGrowth`).
export const BOSSES = [
  { id: 'boss1',  name: 'De Baas',   sprite: 'boss',   h: 130, hp: 200,   power: 15, speed: 100, attackEvery: 1.0, reach: 80,
    prizeCoins: 10,   prizeXp: 100,  scalePerWin: 1.4, prizeGrowth: 1.3 },
  { id: 'boss2a', name: 'Bokser',    sprite: 'boss2a', h: 140, hp: 1500,  power: 25, speed: 110, attackEvery: 1.0, reach: 85,
    prizeCoins: 300,  prizeXp: 800,  scalePerWin: 1.4, prizeGrowth: 1.5 },
  { id: 'boss2b', name: 'Robot',     sprite: 'boss2b', h: 150, hp: 4000,  power: 40, speed: 120, attackEvery: 0.9, reach: 95,
    prizeCoins: 900,  prizeXp: 2000, scalePerWin: 1.4, prizeGrowth: 1.5 },
  { id: 'boss2c', name: 'Spierbaas', sprite: 'boss2c', h: 210, hp: 15000, power: 70, speed: 130, attackEvery: 0.8, reach: 110,
    prizeCoins: 5000, prizeXp: 6000, scalePerWin: 1.4, prizeGrowth: 1.5 },
];

// Levels. Every level is a layout: where things stand (x,y = feet position, h = drawn height),
// `at` = where the player stands to use it, `block` = rectangle you can't walk through.
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
              hp: lvl => 30 * lvl, coins: lvl => 5 + 5 * lvl }],
  },
  {
    id: 'level2', name: 'Level 2 - De stad', start: { x: 480, y: 520 }, prev: 'gym',
    gate: { x: 150, y: 200, h: 175, sprite: 'gate2', needLevel: 50, next: null, at: { x: 150, y: 230 }, block: { x: 50, y: 0, w: 200, h: 185 } },
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
      { id: 'bag2a', x: 90, y: 405, h: 150, sprite: 'bag2a', xp: 40, at: { x: 175, y: 385 }, block: { x: 40, y: 260, w: 100, h: 145 },
        unlock: { hits: 100, flag: 'mega' } },   // punch it 100 times -> new super attack
      { id: 'bag2b', x: 90, y: 590, h: 165, sprite: 'bag2b', xp: 80, at: { x: 170, y: 565 }, block: { x: 40, y: 430, w: 90, h: 160 } },
    ],
    walls: [{ id: 'wall2', x: 830, y: 590, h: 240, sprite: 'wall2', at: { x: 690, y: 500 }, block: { x: 720, y: 350, w: 220, h: 240 },
              hp: lvl => 250 * lvl, coins: lvl => 50 + 50 * lvl }],
  },
];
