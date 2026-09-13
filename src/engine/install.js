// "Zet op je beginscherm" nudge for phones/tablets. Android/Chrome: real install prompt.
// iOS Safari: instructions (Apple has no install API). Dismissal is remembered for a week.
export function setupInstall() {
  const standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone;
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);   // iPad reports as Mac
  const isMobile = isIOS || /android|mobile/i.test(ua) || (navigator.userAgentData && navigator.userAgentData.mobile);
  if (standalone || !isMobile) return;   // desktop: no nudge
  let snoozedUntil = 0; try { snoozedUntil = +localStorage.getItem('simon-install-snooze') || 0; } catch {}
  if (Date.now() < snoozedUntil) return;

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  const bar = document.getElementById('install'), btn = document.getElementById('install-btn'), txt = document.getElementById('install-text');
  const close = () => { bar.hidden = true; try { localStorage.setItem('simon-install-snooze', Date.now() + 7 * 864e5); } catch {} };
  document.getElementById('install-close').addEventListener('click', close);
  bar.addEventListener('pointerdown', e => e.stopPropagation());   // don't let the game swallow the taps

  if (isIOS) {
    txt.textContent = 'Zet het spel op je beginscherm: tik op Deel (□↑) en dan "Zet op beginscherm".';
    btn.hidden = true; bar.hidden = false;
    return;
  }
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferred = e;
    txt.textContent = 'Zet het spel op je beginscherm, dan speelt het op volledig scherm.';
    bar.hidden = false;
  });
  btn.addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt(); await deferred.userChoice; deferred = null; bar.hidden = true;
  });
  window.addEventListener('appinstalled', () => { bar.hidden = true; });
}
