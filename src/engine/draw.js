// Small drawing helpers. Sprites are anchored at bottom-center so "y" is where the feet are.
export function drawSprite(ctx, img, x, y, { h = 100, flip = false, rot = 0, alpha = 1, anchor = 'bottom' } = {}) {
  if (!img) return;
  const scale = h / img.height, w = img.width * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  if (flip) ctx.scale(-1, 1);
  const oy = anchor === 'bottom' ? -h : anchor === 'center' ? -h / 2 : 0;
  ctx.drawImage(img, -w / 2, oy, w, h);
  ctx.restore();
  return w;
}

// Dutch thousands separators, so 1500000 reads as 1.500.000.
export const nl = n => Math.round(n).toLocaleString('nl-NL');

export function text(ctx, str, x, y, { size = 22, color = '#2b3a2b', align = 'left', bold = true, stroke = false, maxWidth = 0 } = {}) {
  ctx.save();
  const font = s => `${bold ? 'bold ' : ''}${s}px "Comic Sans MS", "Chalkboard SE", sans-serif`;
  if (maxWidth) {                      // shrink (and finally clip) rather than run into the next column
    ctx.font = font(size);
    const w = ctx.measureText(str).width;
    if (w > maxWidth) size = Math.max(12, size * maxWidth / w);
    ctx.font = font(size);
    while (str.length > 4 && ctx.measureText(str).width > maxWidth) str = str.slice(0, -2) + '…';
  }
  ctx.font = font(size);
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (stroke) { ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(str, x, y); }
  ctx.fillStyle = color; ctx.fillText(str, x, y);
  ctx.restore();
}

export function bar(ctx, x, y, w, h, frac, color, label) {
  ctx.save();
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), h);
  ctx.lineWidth = 3; ctx.strokeStyle = '#2b3a2b'; ctx.strokeRect(x, y, w, h);
  if (label) text(ctx, label, x + w / 2, y + h / 2, { size: h * 0.6, align: 'center' });
  ctx.restore();
}

// Speech-bubble style hint above a point.
export function hint(ctx, str, x, y) {
  ctx.save();
  ctx.font = 'bold 18px "Comic Sans MS", "Chalkboard SE", sans-serif';
  const w = ctx.measureText(str).width + 20;
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.strokeStyle = '#2b3a2b'; ctx.lineWidth = 2;
  roundRect(ctx, x - w / 2, y - 34, w, 30, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2b3a2b'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y - 19);
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
