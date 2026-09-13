// Sound effects made with the Web Audio API (no sound files needed).
// Usage: sound.play('punch'). Add new sounds to the SOUNDS table below.
let ctx = null;
function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
// Browsers only allow audio after the first key press / click.
window.addEventListener('keydown', () => ac(), { once: true });
window.addEventListener('pointerdown', () => ac(), { once: true });

// helpers -------------------------------------------------------------
function tone({ type = 'square', freq = 440, to = null, dur = 0.1, vol = 0.2, delay = 0 }) {
  const c = ac(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime + delay;
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise({ dur = 0.15, vol = 0.3, delay = 0, lowpass = 1200 }) {
  const c = ac(), t = c.currentTime + delay;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource(); s.buffer = buf;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lowpass;
  const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f).connect(g).connect(c.destination); s.start(t);
}

// the sounds ----------------------------------------------------------
const SOUNDS = {
  punch:   () => { noise({ dur: 0.08, vol: 0.4, lowpass: 900 }); tone({ type: 'sine', freq: 150, to: 60, dur: 0.1, vol: 0.4 }); },
  kick:    () => { noise({ dur: 0.12, vol: 0.5, lowpass: 600 }); tone({ type: 'sine', freq: 120, to: 40, dur: 0.16, vol: 0.5 }); },
  whoosh:  () => noise({ dur: 0.25, vol: 0.15, lowpass: 3000 }),
  jump:    () => tone({ type: 'sine', freq: 300, to: 900, dur: 0.25, vol: 0.15 }),
  xp:      () => tone({ type: 'triangle', freq: 660, to: 990, dur: 0.12, vol: 0.15 }),
  crack:   () => { noise({ dur: 0.2, vol: 0.5, lowpass: 2500 }); tone({ type: 'square', freq: 90, to: 50, dur: 0.15, vol: 0.2 }); },
  wallBreak: () => { noise({ dur: 0.6, vol: 0.7, lowpass: 800 }); tone({ type: 'sawtooth', freq: 80, to: 30, dur: 0.5, vol: 0.4 });
                     [0.05, 0.15, 0.3].forEach(d => noise({ dur: 0.15, vol: 0.4, delay: d, lowpass: 1500 })); },
  coin:    () => { tone({ type: 'square', freq: 1046, dur: 0.08, vol: 0.12 }); tone({ type: 'square', freq: 1568, dur: 0.25, vol: 0.12, delay: 0.08 }); },
  buy:     () => [523, 659, 784, 1046].forEach((f, i) => tone({ type: 'square', freq: f, dur: 0.12, vol: 0.12, delay: i * 0.08 })),
  nope:    () => { tone({ type: 'square', freq: 220, to: 160, dur: 0.2, vol: 0.15 }); },
  select:  () => tone({ type: 'square', freq: 800, dur: 0.04, vol: 0.08 }),
  levelUp: () => [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone({ type: 'triangle', freq: f, dur: 0.18, vol: 0.2, delay: i * 0.1 })),
  hurt:    () => { tone({ type: 'sawtooth', freq: 200, to: 80, dur: 0.25, vol: 0.25 }); noise({ dur: 0.1, vol: 0.3 }); },
  miss:    () => noise({ dur: 0.15, vol: 0.12, lowpass: 4000 }),
  bossStep:() => tone({ type: 'sine', freq: 70, to: 40, dur: 0.12, vol: 0.25 }),
  super:   () => { tone({ type: 'sawtooth', freq: 200, to: 1200, dur: 0.4, vol: 0.25 }); noise({ dur: 0.5, vol: 0.5, lowpass: 2000, delay: 0.1 });
                   tone({ type: 'sine', freq: 100, to: 30, dur: 0.5, vol: 0.5, delay: 0.15 }); },
  ultra:   () => { [0, 0.1, 0.2].forEach(d => tone({ type: 'sawtooth', freq: 150 + d * 800, to: 1800, dur: 0.5, vol: 0.2, delay: d }));
                   noise({ dur: 0.9, vol: 0.7, lowpass: 1500, delay: 0.25 }); tone({ type: 'sine', freq: 80, to: 25, dur: 0.9, vol: 0.6, delay: 0.3 }); },
  fight:   () => [392, 392, 392, 523].forEach((f, i) => tone({ type: 'square', freq: f, dur: i === 3 ? 0.5 : 0.15, vol: 0.2, delay: i * 0.18 })),
  win:     () => [523, 659, 784, 1046, 1318, 1046, 1318, 1568].forEach((f, i) => tone({ type: 'triangle', freq: f, dur: 0.25, vol: 0.2, delay: i * 0.13 })),
  lose:    () => [392, 370, 349, 330, 262].forEach((f, i) => tone({ type: 'sawtooth', freq: f, dur: 0.4, vol: 0.15, delay: i * 0.3 })),
  gate:    () => [262, 330, 392, 523].forEach((f, i) => tone({ type: 'sine', freq: f, dur: 0.6, vol: 0.15, delay: i * 0.15 })),
  start:   () => [523, 659, 784].forEach((f, i) => tone({ type: 'square', freq: f, dur: 0.15, vol: 0.15, delay: i * 0.1 })),
};

export const sound = {
  muted: false,
  play(name) { if (this.muted) return; try { SOUNDS[name]?.(); } catch (e) { console.warn('sound', name, e); } },
  toggle() { this.muted = !this.muted; return this.muted; },
};
