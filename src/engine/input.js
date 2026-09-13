// Keyboard input: `down` = currently held, `pressed` = went down this frame.
export class Input {
  constructor() {
    this.held = new Set();
    this.justPressed = new Set();
    window.addEventListener('keydown', e => {
      if (!this.held.has(e.code)) this.justPressed.add(e.code);
      this.held.add(e.code);
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => this.held.delete(e.code));
    window.addEventListener('blur', () => this.held.clear());
  }
  // used by the on-screen touch buttons
  press(code) { if (!this.held.has(code)) this.justPressed.add(code); this.held.add(code); }
  hold(code) { this.held.add(code); }
  release(code) { this.held.delete(code); }
  down(code) { return this.held.has(code); }
  pressed(code) { return this.justPressed.has(code); }
  endFrame() { this.justPressed.clear(); }
}
