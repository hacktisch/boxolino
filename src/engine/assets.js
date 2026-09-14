// Loads every sprite in assets/sprites once; access with assets.get('walk1').
const NAMES = [
  'somersault','dead','kick','bag_kick','bag_left','flykick','walk1','walk2','walk3','stand','punch','bag_right',
  'gate','boss','boss_sign','shop','bag1','bag_gold','wall','hud_coin','hud_level','hud_power',
  'gate2','drinkshop','gloveshop','shop2','boss2a','boss2b','boss2c','bag2a','bag2b','wall2',
  'gate3','shop3a','shop3b','shop3c','super3','boss3a','boss3b','boss3c','bag3a','bag3b','wall3',
  'gate4','shop4a','shop4b','shop4c','super4','boss4a','boss4b','boss4c','bag4a','bag4b','wall4',
];
export const assets = {
  images: new Map(),
  async load() {
    await Promise.all(NAMES.map(n => new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => { this.images.set(n, img); res(); };
      img.onerror = () => rej(new Error('missing sprite ' + n));
      img.src = `assets/sprites/${n}.png`;
    })));
  },
  get(name) { return this.images.get(name); },
};
