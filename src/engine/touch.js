// On-screen controls for phones/tablets. They press the same "keys" as the keyboard,
// so the game code doesn't know the difference. Shown automatically on touch devices; 🎮 toggles.
export function setupTouch(input) {
  const body = document.body, toggle = document.getElementById('toggle');
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  let shown = isTouch;
  try { const s = localStorage.getItem('simon-touch'); if (s !== null) shown = s === '1'; } catch {}
  const apply = () => { body.classList.toggle('touch', shown); window.refit && window.refit(); };
  apply();
  toggle.addEventListener('click', () => { shown = !shown; apply(); toggle.blur(); try { localStorage.setItem('simon-touch', shown ? '1' : '0'); } catch {} });

  // action buttons: hold = key held
  for (const el of document.querySelectorAll('#btns .btn')) {
    const key = el.dataset.key;
    const down = e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch {} el.classList.add('active'); input.press(key); };
    const up = e => { el.classList.remove('active'); input.release(key); };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('contextmenu', e => e.preventDefault());
  }

  // joystick pad: direction from the touch position relative to the centre
  const pad = document.getElementById('pad'), stick = document.getElementById('stick');
  const DIRS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  let padPointer = null;
  const setDir = (dx, dy) => {
    const dead = 12, held = new Set();
    if (Math.hypot(dx, dy) > dead) {
      const a = Math.atan2(dy, dx);                 // 8 directions: diagonals allowed
      if (Math.cos(a) > 0.38) held.add('ArrowRight'); if (Math.cos(a) < -0.38) held.add('ArrowLeft');
      if (Math.sin(a) > 0.38) held.add('ArrowDown'); if (Math.sin(a) < -0.38) held.add('ArrowUp');
    }
    for (const d of DIRS) held.has(d) ? input.press(d) : input.release(d);   // press() = counts as a new key press once
    const r = Math.min(45, Math.hypot(dx, dy)), a = Math.atan2(dy, dx);
    stick.style.transform = held.size ? `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r}px)` : '';
  };
  const move = e => {
    if (e.pointerId !== padPointer) return;
    const b = pad.getBoundingClientRect();
    setDir(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2));
  };
  pad.addEventListener('pointerdown', e => { e.preventDefault(); padPointer = e.pointerId; try { pad.setPointerCapture(e.pointerId); } catch {} move(e); });
  pad.addEventListener('pointermove', move);
  const end = e => { if (e.pointerId !== padPointer) return; padPointer = null; setDir(0, 0); };
  pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
}
