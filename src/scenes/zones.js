// The four places the chase goes through, each a stack of parallax layers.
import { TAU, hash, rr } from './util';

export const ZONE_NAMES = {
  vault: 'THE VAULT',
  hall: 'GRAND HALL',
  street: 'CITY STREETS',
  roof: 'THE ROOFTOPS',
};

// Static layers are drawn once into an offscreen strip and then blitted, which
// keeps the per-frame cost low. The strip repeats every `count` tiles.
const strips = new Map();
function strip(ctx, key, tileW, height, count, drawTile) {
  const tf = ctx.getTransform ? ctx.getTransform() : null;
  const dpr = Math.max(1, Math.min(2, Math.abs((tf && tf.a) || 1)));
  const id = `${key}:${Math.round(tileW)}:${Math.round(height)}:${dpr}`;
  let c = strips.get(id);
  if (!c) {
    if (strips.size > 40) strips.clear();
    c = document.createElement('canvas');
    c.width = Math.ceil(tileW * count * dpr);
    c.height = Math.ceil(height * dpr);
    const x = c.getContext('2d');
    x.scale(dpr, dpr);
    for (let n = 0; n < count; n++) drawTile(x, n * tileW, n);
    c.cssW = tileW * count;
    c.cssH = height;
    strips.set(id, c);
  }
  return c;
}
function blit(ctx, c, w, scroll, factor, y) {
  const sw = c.cssW;
  const off = ((scroll * factor) % sw + sw) % sw;
  for (let x = -off; x < w; x += sw) ctx.drawImage(c, x, y, sw, c.cssH);
}
// Cheap neon glow without shadowBlur.
function neonText(ctx, text, x, y, col, width) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = col;
  ctx.globalAlpha *= 0.18;
  ctx.lineWidth = width * 2.2;
  ctx.strokeText(text, x, y);
  ctx.globalAlpha /= 0.18;
  ctx.globalAlpha *= 0.35;
  ctx.lineWidth = width;
  ctx.strokeText(text, x, y);
  ctx.restore();
  ctx.fillStyle = col;
  ctx.fillText(text, x, y);
}

// Calls fn(x, n) for each repeating tile of a parallax layer.
function tiles(w, scroll, factor, period, fn) {
  const s = scroll * factor;
  const start = Math.floor(s / period);
  const off = s - start * period;
  for (let k = -1; k <= Math.ceil(w / period) + 1; k++) fn(k * period - off, start + k);
}

function vgrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

function glow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function slantLines(ctx, w, bottom, floorY, scroll, T, color, width = 2) {
  const off = scroll % T;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  for (let x = -off - T; x < w + T * 3; x += T) {
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x - (bottom - floorY) * 0.9, bottom);
    ctx.stroke();
  }
}

function beacon(ctx, x, y, r, h, alarm, time, phase) {
  // rotating red beacon with a sweeping beam
  if (alarm > 0) {
    const a = time * 4 + phase;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const len = h * 0.9;
    for (const dir of [a, a + Math.PI]) {
      const c = Math.cos(dir);
      if (c < -0.2) continue;
      const bx = x + Math.cos(dir) * len, by = y + Math.abs(Math.sin(dir)) * len * 0.5 + h * 0.1;
      const g = ctx.createLinearGradient(x, y, bx, by);
      g.addColorStop(0, `rgba(255,40,40,${0.32 * alarm})`);
      g.addColorStop(1, 'rgba(255,40,40,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(bx - Math.sin(dir) * h * 0.12, by - h * 0.1);
      ctx.lineTo(bx + Math.sin(dir) * h * 0.12, by + h * 0.1);
      ctx.closePath();
      ctx.fill();
    }
    glow(ctx, x, y, h * 0.12, `rgba(255,60,60,${0.6 * alarm})`);
    ctx.restore();
  }
  ctx.fillStyle = '#2a0c0c';
  rr(ctx, x - r * 1.2, y - 1, r * 2.4, r * 0.7, 2);
  ctx.fill();
  ctx.fillStyle = alarm > 0 ? '#ff4545' : '#5a1a1a';
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.45, r * 0.25, 0, TAU); ctx.fill();
}

/* ───────── The vault ───────── */

function drawVault(ctx, w, h, scroll, floorY, gy, time, alarm) {
  ctx.fillStyle = vgrad(ctx, 0, floorY, [[0, '#04100f'], [0.55, '#0c2725'], [1, '#164340']]);
  ctx.fillRect(-20, -20, w + 40, floorY + 20);

  // deposit box wall
  const bw = Math.max(30, h * 0.105), bh = bw * 0.58, gap = Math.max(3, bw * 0.07);
  const top = h * 0.1;
  const rows = Math.floor((floorY - h * 0.08 - top) / (bh + gap));
  const wall = strip(ctx, 'vaultwall', bw + gap, rows * (bh + gap), 32, (x2, x, col) => {
    for (let r = 0; r < rows; r++) {
      const y = r * (bh + gap);
      const open = hash(col * 13 + r, 2) > 0.93;
      if (open) {
        x2.fillStyle = '#031010';
        x2.fillRect(x, y, bw, bh);
        x2.fillStyle = 'rgba(247,201,72,0.65)';
        x2.fillRect(x + bw * 0.12, y + bh * 0.5, bw * 0.76, bh * 0.36);
        glow(x2, x + bw / 2, y + bh * 0.65, bw * 0.7, 'rgba(255,200,90,0.18)');
        continue;
      }
      x2.fillStyle = vgrad(x2, y, y + bh, [[0, '#2a6a62'], [0.15, '#1c4f49'], [1, '#123733']]);
      x2.fillRect(x, y, bw, bh);
      x2.fillStyle = '#0a2422';
      x2.fillRect(x, y + bh - 2, bw, 2);
      x2.fillStyle = '#c2903a';
      rr(x2, x + bw * 0.12, y + bh * 0.3, bw * 0.22, bh * 0.34, 1.5);
      x2.fill();
      x2.fillStyle = '#e8b24a';
      x2.beginPath(); x2.arc(x + bw * 0.82, y + bh * 0.5, Math.max(1.8, bw * 0.055), 0, TAU); x2.fill();
    }
  });
  blit(ctx, wall, w, scroll, 0.3, top);
  ctx.fillStyle = vgrad(ctx, 0, floorY, [[0, 'rgba(3,12,11,0.7)'], [0.6, 'rgba(8,28,26,0.2)'], [1, 'rgba(8,28,26,0.65)']]);
  ctx.fillRect(-20, -20, w + 40, floorY + 20);

  // ceiling pipes
  ctx.fillStyle = vgrad(ctx, 0, h * 0.08, [[0, '#071513'], [1, '#0d2321']]);
  ctx.fillRect(-20, -20, w + 40, h * 0.08 + 20);
  for (const [py, pr, col] of [[h * 0.035, h * 0.018, '#2b4a46'], [h * 0.07, h * 0.012, '#6b4e22']]) {
    ctx.fillStyle = vgrad(ctx, py - pr, py + pr, [[0, col], [0.4, '#88a39e'], [1, '#0b1b19']]);
    ctx.fillRect(-20, py - pr, w + 40, pr * 2);
  }
  tiles(w, scroll, 0.5, Math.max(140, w * 0.22), (x) => {
    ctx.fillStyle = '#0b1b19';
    ctx.fillRect(x, h * 0.012, h * 0.02, h * 0.08);
  });

  // hanging cage lamps
  tiles(w, scroll, 0.65, Math.max(300, w * 0.5), (x) => {
    const lx = x + Math.max(300, w * 0.5) * 0.08;
    const ly = h * 0.2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cone = ctx.createLinearGradient(0, ly, 0, floorY);
    cone.addColorStop(0, 'rgba(255,214,140,0.22)');
    cone.addColorStop(1, 'rgba(255,214,140,0.02)');
    ctx.fillStyle = cone;
    ctx.beginPath(); ctx.moveTo(lx - h * 0.03, ly); ctx.lineTo(lx + h * 0.03, ly); ctx.lineTo(lx + h * 0.22, floorY); ctx.lineTo(lx - h * 0.22, floorY); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#0b1b19';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, h * 0.08); ctx.lineTo(lx, ly - h * 0.03); ctx.stroke();
    ctx.fillStyle = '#ffe6a8';
    ctx.beginPath(); ctx.arc(lx, ly - h * 0.01, h * 0.018, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#3a2a10';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(lx, ly - h * 0.01, h * 0.026, Math.PI, 0); ctx.stroke();
    for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(lx + k * h * 0.013, ly - h * 0.034); ctx.lineTo(lx + k * h * 0.02, ly + h * 0.006); ctx.stroke(); }
  });

  // massive riveted pillars with rotating beacons
  const P = Math.max(280, w * 0.5);
  tiles(w, scroll, 0.75, P, (x0, n) => {
    const x = x0 + P * 0.55;
    const pw = Math.max(30, h * 0.095);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x + pw, h * 0.08, pw * 0.25, floorY - h * 0.08);
    ctx.fillStyle = (() => {
      const g = ctx.createLinearGradient(x, 0, x + pw, 0);
      g.addColorStop(0, '#0a201e'); g.addColorStop(0.35, '#2b5a54'); g.addColorStop(0.6, '#1b3f3b'); g.addColorStop(1, '#081a18');
      return g;
    })();
    ctx.fillRect(x, h * 0.06, pw, floorY - h * 0.06);
    ctx.fillStyle = '#081614';
    for (let y = h * 0.12; y < floorY - h * 0.05; y += h * 0.055) {
      ctx.beginPath(); ctx.arc(x + pw * 0.2, y, 1.8, 0, TAU); ctx.arc(x + pw * 0.8, y, 1.8, 0, TAU); ctx.fill();
    }
    for (const by of [h * 0.13, floorY - h * 0.06]) {
      ctx.fillStyle = vgrad(ctx, by, by + h * 0.02, [[0, '#f0c25a'], [1, '#7a5418']]);
      ctx.fillRect(x - 4, by, pw + 8, h * 0.02);
    }
    beacon(ctx, x + pw / 2, h * 0.13, pw * 0.24, h, alarm, time, n * 1.7);
  });

  // polished steel floor with reflections
  ctx.fillStyle = vgrad(ctx, floorY, h, [[0, '#13302d'], [0.3, '#0a1a19'], [1, '#050c0c']]);
  ctx.fillRect(-20, floorY, w + 40, h - floorY + 20);
  slantLines(ctx, w, h, floorY, scroll, Math.max(46, h * 0.2), 'rgba(80,140,130,0.18)');
  ctx.strokeStyle = 'rgba(80,140,130,0.12)';
  ctx.lineWidth = 1.5;
  for (const k of [0.3, 0.62]) {
    const y = floorY + (h - floorY) * k;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.fillStyle = vgrad(ctx, floorY, floorY + (h - floorY) * 0.35, [[0, 'rgba(255,200,110,0.16)'], [1, 'rgba(255,200,110,0)']]);
  ctx.fillRect(0, floorY, w, (h - floorY) * 0.35);
  ctx.fillStyle = vgrad(ctx, floorY - 3, floorY + 2, [[0, '#ffd77a'], [1, '#8c6119']]);
  ctx.fillRect(-20, floorY - 3, w + 40, 4);
}

/* ───────── The grand hall ───────── */

function drawHall(ctx, w, h, scroll, floorY, gy, time, alarm) {
  ctx.fillStyle = vgrad(ctx, 0, floorY, [[0, '#14070c'], [0.5, '#2c1018'], [1, '#4a1d27']]);
  ctx.fillRect(-20, -20, w + 40, floorY + 20);
  // coffered ceiling
  ctx.fillStyle = '#1a0a10';
  ctx.fillRect(-20, -20, w + 40, h * 0.07 + 20);
  tiles(w, scroll, 0.2, Math.max(70, h * 0.2), (x) => {
    ctx.fillStyle = '#2a121a';
    rr(ctx, x + 6, h * 0.008, Math.max(70, h * 0.2) - 12, h * 0.048, 3);
    ctx.fill();
    ctx.strokeStyle = 'rgba(214,170,80,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  ctx.fillStyle = vgrad(ctx, h * 0.065, h * 0.08, [[0, '#e8c66a'], [1, '#6a4a14']]);
  ctx.fillRect(-20, h * 0.065, w + 40, h * 0.015);

  // tall arched windows with moonlight shafts
  const Wp = Math.max(260, h * 0.9);
  tiles(w, scroll, 0.28, Wp, (x0, n) => {
    const ww = Wp * 0.34, x = x0 + Wp * 0.33;
    const tp = h * 0.13, bot = floorY - h * 0.26;
    ctx.beginPath();
    ctx.moveTo(x, bot); ctx.lineTo(x, tp + ww / 2); ctx.arc(x + ww / 2, tp + ww / 2, ww / 2, Math.PI, 0); ctx.lineTo(x + ww, bot); ctx.closePath();
    ctx.fillStyle = vgrad(ctx, tp, bot, [[0, '#0b1636'], [1, '#2b3f80']]);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#f2efdc';
    ctx.beginPath(); ctx.arc(x + ww * 0.7, tp + ww * 0.45, ww * 0.12, 0, TAU); ctx.fill();
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(x + hash(n * 7 + i, 4) * ww, tp + hash(n * 7 + i, 5) * (bot - tp) * 0.6, 1.5, 1.5);
    }
    ctx.restore();
    ctx.strokeStyle = '#a07a30';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + ww / 2, tp); ctx.lineTo(x + ww / 2, bot);
    for (const k of [0.45, 0.72]) { ctx.moveTo(x, tp + (bot - tp) * k); ctx.lineTo(x + ww, tp + (bot - tp) * k); }
    ctx.stroke();
    // light shaft onto the floor
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const sg = ctx.createLinearGradient(0, bot, 0, floorY + h * 0.08);
    sg.addColorStop(0, 'rgba(150,175,255,0.13)');
    sg.addColorStop(1, 'rgba(150,175,255,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.moveTo(x, bot); ctx.lineTo(x + ww, bot); ctx.lineTo(x + ww + h * 0.25, floorY + h * 0.08); ctx.lineTo(x + h * 0.25, floorY + h * 0.08); ctx.closePath(); ctx.fill();
    ctx.restore();
    // red banner between windows
    const bx = x0 + Wp * 0.04, bwid = Wp * 0.1;
    ctx.fillStyle = '#7d1622';
    ctx.beginPath(); ctx.moveTo(bx, h * 0.1); ctx.lineTo(bx + bwid, h * 0.1); ctx.lineTo(bx + bwid, h * 0.38); ctx.lineTo(bx + bwid / 2, h * 0.34); ctx.lineTo(bx, h * 0.38); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#d6aa50';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#e8c66a';
    ctx.font = `900 ${Math.round(bwid * 0.6)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', bx + bwid / 2, h * 0.2);
  });

  // wainscot
  ctx.fillStyle = vgrad(ctx, floorY - h * 0.18, floorY, [[0, '#3a1822'], [1, '#1d0a10']]);
  ctx.fillRect(-20, floorY - h * 0.18, w + 40, h * 0.18);
  ctx.fillStyle = '#b48a3a';
  ctx.fillRect(-20, floorY - h * 0.18, w + 40, 2.5);

  // chandeliers
  tiles(w, scroll, 0.5, Math.max(360, w * 0.55), (x0, n) => {
    const cx = x0 + Math.max(360, w * 0.55) * 0.6;
    const sway = Math.sin(time * 1.4 + n) * (alarm > 0 ? 0.06 : 0.02);
    const len = h * 0.14;
    const cy = h * 0.07 + len;
    const ox = cx + Math.sin(sway) * len;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, ox, cy, h * 0.28, 'rgba(255,210,130,0.20)');
    ctx.restore();
    ctx.strokeStyle = '#8a6a2a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, h * 0.07); ctx.lineTo(ox, cy - h * 0.02); ctx.stroke();
    const cw = h * 0.12;
    ctx.fillStyle = '#c9a046';
    ctx.beginPath(); ctx.ellipse(ox, cy, cw, cw * 0.12, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ox, cy + cw * 0.35, cw * 0.6, cw * 0.09, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 9; i++) {
      const px = ox - cw + (i / 8) * cw * 2;
      const dy = Math.cos(((i / 8) - 0.5) * Math.PI) * cw * 0.25;
      ctx.fillStyle = 'rgba(230,245,255,0.85)';
      ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px + 2.2, cy + cw * 0.18 + dy); ctx.lineTo(px, cy + cw * 0.28 + dy); ctx.lineTo(px - 2.2, cy + cw * 0.18 + dy); ctx.closePath(); ctx.fill();
      if (i % 2 === 0) {
        ctx.fillStyle = '#fff3c4';
        ctx.beginPath(); ctx.arc(px, cy - 4, 2.4, 0, TAU); ctx.fill();
      }
    }
  });

  // teller counter
  const Cp = Math.max(340, w * 0.62);
  tiles(w, scroll, 0.85, Cp, (x) => {
    const cw = Cp * 0.7, ct = floorY - h * 0.14;
    ctx.strokeStyle = 'rgba(214,170,80,0.65)';
    ctx.lineWidth = 1.6;
    for (let gx = x + 6; gx < x + cw - 4; gx += 9) { ctx.beginPath(); ctx.moveTo(gx, ct); ctx.lineTo(gx, ct - h * 0.11); ctx.stroke(); }
    ctx.fillStyle = '#b48a3a';
    ctx.fillRect(x, ct - h * 0.11 - 3, cw, 3.5);
    for (const lx of [x + cw * 0.25, x + cw * 0.72]) {
      glow(ctx, lx, ct - 4, h * 0.07, 'rgba(120,255,170,0.25)');
      ctx.fillStyle = '#1f6b44';
      ctx.beginPath(); ctx.ellipse(lx, ct - 6, h * 0.022, h * 0.01, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#b48a3a';
      ctx.fillRect(lx - 1, ct - 6, 2, 6);
    }
    ctx.fillStyle = vgrad(ctx, ct, floorY, [[0, '#6b3d26'], [1, '#2a160e']]);
    ctx.fillRect(x, ct, cw, floorY - ct);
    ctx.fillStyle = vgrad(ctx, ct - 3, ct + 3, [[0, '#f0d080'], [1, '#8a6a2a']]);
    ctx.fillRect(x - 3, ct - 3, cw + 6, 5);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let k = 1; k < 4; k++) ctx.fillRect(x + (cw / 4) * k, ct + 5, 2, floorY - ct - 5);
    ctx.strokeStyle = 'rgba(214,170,80,0.4)';
    ctx.lineWidth = 1;
    for (let k = 0; k < 4; k++) { rr(ctx, x + (cw / 4) * k + 8, ct + 9, cw / 4 - 16, floorY - ct - 16, 2); ctx.stroke(); }
  });

  // marble columns
  const P = Math.max(250, w * 0.44);
  tiles(w, scroll, 0.95, P, (x0) => {
    const x = x0 + P * 0.15, cw = Math.max(28, h * 0.085);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + cw, h * 0.08, cw * 0.3, floorY - h * 0.08);
    const g = ctx.createLinearGradient(x, 0, x + cw, 0);
    g.addColorStop(0, '#6f6455'); g.addColorStop(0.45, '#f2e8d2'); g.addColorStop(1, '#5e5446');
    ctx.fillStyle = g;
    ctx.fillRect(x, h * 0.09, cw, floorY - h * 0.09);
    ctx.fillStyle = 'rgba(80,60,40,0.22)';
    for (let k = 1; k < 5; k++) ctx.fillRect(x + (cw / 5) * k, h * 0.12, 1.5, floorY - h * 0.17);
    ctx.fillStyle = vgrad(ctx, h * 0.075, h * 0.115, [[0, '#f0d080'], [1, '#8a6a2a']]);
    ctx.fillRect(x - cw * 0.25, h * 0.075, cw * 1.5, h * 0.04);
    ctx.fillRect(x - cw * 0.2, floorY - h * 0.035, cw * 1.4, h * 0.035);
    beacon(ctx, x + cw / 2, h * 0.17, cw * 0.26, h, alarm, time, x0 * 0.01);
  });

  // checkered marble floor
  ctx.fillStyle = '#1e1013';
  ctx.fillRect(-20, floorY, w + 40, h - floorY + 20);
  const T = Math.max(44, h * 0.17);
  const start = Math.floor(scroll / T), off = scroll % T;
  const rws = [floorY, floorY + (h - floorY) * 0.3, floorY + (h - floorY) * 0.65, h + 4];
  for (let r = 0; r < 3; r++) {
    const y0 = rws[r], y1 = rws[r + 1];
    const d0 = (y0 - floorY) * 0.9, d1 = (y1 - floorY) * 0.9;
    for (let k = -2; k <= Math.ceil(w / T) + 3; k++) {
      if ((start + k + r) % 2 !== 0) continue;
      const x0 = k * T - off;
      ctx.fillStyle = '#d8ccb6';
      ctx.globalAlpha = 0.22;
      ctx.beginPath(); ctx.moveTo(x0 - d0, y0); ctx.lineTo(x0 + T - d0, y0); ctx.lineTo(x0 + T - d1, y1); ctx.lineTo(x0 - d1, y1); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  ctx.fillStyle = vgrad(ctx, floorY, floorY + (h - floorY) * 0.4, [[0, 'rgba(255,220,170,0.14)'], [1, 'rgba(255,220,170,0)']]);
  ctx.fillRect(0, floorY, w, (h - floorY) * 0.4);
  ctx.fillStyle = '#b48a3a';
  ctx.fillRect(-20, floorY - 2, w + 40, 3);
}

/* ───────── City streets ───────── */

const NEON = [
  ['PAWN', '#ff4fa3'], ['24/7', '#59e3ff'], ['DINER', '#ffcf4a'], ['HOTEL', '#ff6a3d'],
  ['BAR', '#9b6bff'], ['GOLD', '#ffd56a'], ['CASH', '#59e39a'], ['JAZZ', '#59e3ff'],
];

function drawStreet(ctx, w, h, scroll, floorY, gy, time) {
  ctx.fillStyle = vgrad(ctx, 0, floorY, [[0, '#03061a'], [0.6, '#151a4a'], [1, '#3a2560']]);
  ctx.fillRect(-20, -20, w + 40, floorY + 20);
  for (let i = 0; i < 50; i++) {
    const sx = hash(i, 51) * w, sy = hash(i, 52) * floorY * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * Math.abs(Math.sin(time * 1.5 + i))})`;
    ctx.fillRect(sx, sy, 1.4, 1.4);
  }
  const mx = w * 0.84, my = h * 0.12, mr = h * 0.05;
  glow(ctx, mx, my, mr * 5, 'rgba(240,236,210,0.28)');
  ctx.fillStyle = '#f2efdc';
  ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(180,175,150,0.5)';
  ctx.beginPath(); ctx.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.2, 0, TAU); ctx.arc(mx + mr * 0.35, my + mr * 0.3, mr * 0.14, 0, TAU); ctx.fill();
  // sweeping searchlights
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 2; i++) {
    const bx = w * (0.25 + i * 0.4), a = -Math.PI / 2 + Math.sin(time * 0.5 + i * 2) * 0.5;
    const L = h * 1.2;
    const g = ctx.createLinearGradient(bx, floorY, bx + Math.cos(a) * L, floorY + Math.sin(a) * L);
    g.addColorStop(0, 'rgba(200,220,255,0.16)');
    g.addColorStop(1, 'rgba(200,220,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(bx, floorY);
    ctx.lineTo(bx + Math.cos(a - 0.06) * L, floorY + Math.sin(a - 0.06) * L);
    ctx.lineTo(bx + Math.cos(a + 0.06) * L, floorY + Math.sin(a + 0.06) * L);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // far skyline
  const Bw = Math.max(42, h * 0.16);
  const sky = strip(ctx, 'skyline', Bw, floorY, 16, (x2, x, n) => {
    const bh = h * (0.25 + hash(n, 31) * 0.35);
    x2.fillStyle = '#0c1132';
    x2.fillRect(x, floorY - bh, Bw - 2, bh);
    if (hash(n, 34) > 0.7) {
      x2.fillRect(x + Bw * 0.45, floorY - bh - h * 0.06, 2, h * 0.06);
      x2.fillStyle = '#ff3b3b';
      x2.beginPath(); x2.arc(x + Bw * 0.45 + 1, floorY - bh - h * 0.06, 2, 0, TAU); x2.fill();
    }
    x2.fillStyle = 'rgba(255,210,122,0.5)';
    for (let wy = floorY - bh + 8; wy < floorY - 10; wy += 10) {
      for (let wx = 5; wx < Bw - 9; wx += 8) if (hash(Math.floor(wx * 3 + wy * 7) + n, 33) > 0.8) x2.fillRect(x + wx, wy, 3.5, 4.5);
    }
  });
  blit(ctx, sky, w, scroll, 0.08, 0);
  ctx.fillStyle = vgrad(ctx, floorY - h * 0.3, floorY, [[0, 'rgba(90,50,130,0)'], [1, 'rgba(90,50,130,0.35)']]);
  ctx.fillRect(-20, floorY - h * 0.3, w + 40, h * 0.3);

  // storefronts with neon
  const Fw = Math.max(220, h * 0.8);
  const fronts = strip(ctx, 'fronts', Fw, floorY, 8, (x2, x, n) => {
    const tp = floorY - h * (0.48 + hash(n, 41) * 0.16);
    x2.fillStyle = hash(n, 43) > 0.5 ? '#3a1f26' : '#232744';
    x2.fillRect(x, tp, Fw - 8, floorY - tp);
    x2.fillStyle = 'rgba(0,0,0,0.18)';
    for (let by = tp + 6; by < floorY; by += 8) x2.fillRect(x, by, Fw - 8, 1);
    x2.fillStyle = 'rgba(0,0,0,0.35)';
    x2.fillRect(x, tp, Fw - 8, 5);
    for (let wy = tp + h * 0.05; wy < floorY - h * 0.25; wy += h * 0.08) {
      for (let wx = Fw * 0.08; wx < Fw - Fw * 0.15; wx += Fw * 0.17) {
        const lit = hash(Math.floor(wx + wy * 5) + n * 17, 47) > 0.5;
        x2.fillStyle = lit ? 'rgba(255,200,120,0.65)' : '#12142a';
        x2.fillRect(x + wx, wy, Fw * 0.09, h * 0.045);
        if (lit) { x2.fillStyle = 'rgba(0,0,0,0.3)'; x2.fillRect(x + wx + Fw * 0.045, wy, 1, h * 0.045); }
      }
    }
    if (hash(n, 45) > 0.5) {
      x2.strokeStyle = 'rgba(10,10,20,0.85)';
      x2.lineWidth = 2;
      const fx = x + Fw * 0.62;
      for (let fy = tp + h * 0.1; fy < floorY - h * 0.22; fy += h * 0.09) {
        x2.beginPath(); x2.moveTo(fx, fy); x2.lineTo(fx + Fw * 0.26, fy); x2.stroke();
        x2.beginPath(); x2.moveTo(fx + 4, fy); x2.lineTo(fx + Fw * 0.22, fy + h * 0.09); x2.stroke();
      }
    }
    x2.fillStyle = 'rgba(255,207,122,0.35)';
    x2.fillRect(x + Fw * 0.08, floorY - h * 0.16, Fw * 0.58, h * 0.13);
    x2.fillStyle = 'rgba(0,0,0,0.25)';
    x2.fillRect(x + Fw * 0.37, floorY - h * 0.16, 2, h * 0.13);
    const aw = Fw * 0.64, ax = x + Fw * 0.05, ay = floorY - h * 0.2;
    for (let s = 0; s < 8; s++) {
      x2.fillStyle = s % 2 ? '#f2efe6' : (hash(n, 49) > 0.5 ? '#c0392b' : '#2e86ab');
      x2.beginPath(); x2.moveTo(ax + (aw / 8) * s, ay); x2.lineTo(ax + (aw / 8) * (s + 1), ay); x2.lineTo(ax + (aw / 8) * (s + 1) + 3, ay + h * 0.035); x2.lineTo(ax + (aw / 8) * s + 3, ay + h * 0.035); x2.closePath(); x2.fill();
    }
  });
  blit(ctx, fronts, w, scroll, 0.5, 0);
  // neon signs (live, they flicker)
  const fs = Math.round(h * 0.05);
  ctx.font = `400 ${fs}px "Bungee", Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  tiles(w, scroll, 0.5, Fw, (x, n0) => {
    const n = ((n0 % 8) + 8) % 8;
    const [label, col] = NEON[Math.floor(hash(n, 53) * NEON.length)];
    ctx.globalAlpha = hash(Math.floor(time * 12) + n0, 55) > 0.04 ? 1 : 0.25;
    neonText(ctx, label, x + Fw * 0.36, floorY - h * 0.27, col, fs * 0.22);
    ctx.globalAlpha = 1;
  });

  // sidewalk + road
  const curbY = gy + h * 0.05;
  ctx.fillStyle = vgrad(ctx, floorY, curbY, [[0, '#3a3c4c'], [1, '#262836']]);
  ctx.fillRect(-20, floorY, w + 40, curbY - floorY);
  slantLines(ctx, w, curbY, floorY, scroll, Math.max(44, h * 0.18), 'rgba(0,0,0,0.25)');
  ctx.fillStyle = '#101118';
  ctx.fillRect(-20, curbY, w + 40, h - curbY + 20);
  ctx.fillStyle = '#6a6d80';
  ctx.fillRect(-20, curbY, w + 40, 3);
  const dashY = curbY + (h - curbY) * 0.6;
  const D = Math.max(60, h * 0.22);
  const dOff = (scroll * 1.15) % D;
  ctx.fillStyle = 'rgba(255,214,102,0.85)';
  for (let x = -dOff; x < w + D; x += D) ctx.fillRect(x, dashY, D * 0.5, Math.max(2, h * 0.008));
  // neon puddles
  tiles(w, scroll, 1.15, Math.max(300, w * 0.45), (x, n) => {
    const col = NEON[Math.floor(hash(n, 57) * NEON.length)][1];
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(x + 40, curbY + (h - curbY) * 0.35, h * 0.08, h * 0.012, 0, 0, TAU); ctx.fill();
    ctx.restore();
  });

  // street lamps
  tiles(w, scroll, 1, Math.max(280, w * 0.5), (x0) => {
    const x = x0 + Math.max(280, w * 0.5) * 0.7;
    const tp = h * 0.24;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const lg = ctx.createLinearGradient(0, tp, 0, floorY + h * 0.05);
    lg.addColorStop(0, 'rgba(255,214,140,0.25)');
    lg.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(x + 10, tp); ctx.lineTo(x + 10 + h * 0.14, floorY + h * 0.06); ctx.lineTo(x + 10 - h * 0.14, floorY + h * 0.06); ctx.closePath(); ctx.fill();
    glow(ctx, x + 10, tp + 4, h * 0.05, 'rgba(255,226,160,0.6)');
    ctx.restore();
    ctx.fillStyle = '#23263a';
    ctx.fillRect(x - 2.5, tp, 5, floorY - tp);
    ctx.fillRect(x - 2.5, tp, 16, 3.5);
    ctx.fillRect(x - 5, floorY - 8, 10, 8);
    ctx.fillStyle = '#ffe2a0';
    rr(ctx, x + 4, tp + 2.5, 12, 6, 2);
    ctx.fill();
  });
}

/* ───────── Rooftops ───────── */

function drawRoof(ctx, w, h, scroll, floorY, gy, time) {
  ctx.fillStyle = vgrad(ctx, 0, floorY, [[0, '#060418'], [0.5, '#1d0f3d'], [0.85, '#5a2350'], [1, '#a2405a']]);
  ctx.fillRect(-20, -20, w + 40, floorY + 20);
  for (let i = 0; i < 70; i++) {
    const sx = hash(i, 61) * w, sy = hash(i, 62) * floorY * 0.55;
    ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.6 * Math.abs(Math.sin(time * 1.2 + i * 1.7))})`;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }
  const mx = w * 0.78, my = h * 0.17, mr = h * 0.1;
  glow(ctx, mx, my, mr * 4, 'rgba(255,230,200,0.25)');
  ctx.fillStyle = '#fbf3df';
  ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(190,175,150,0.45)';
  ctx.beginPath(); ctx.arc(mx - mr * 0.35, my - mr * 0.15, mr * 0.18, 0, TAU); ctx.arc(mx + mr * 0.3, my + mr * 0.35, mr * 0.12, 0, TAU); ctx.arc(mx + mr * 0.2, my - mr * 0.4, mr * 0.09, 0, TAU); ctx.fill();
  // drifting clouds
  for (let i = 0; i < 4; i++) {
    const cx = ((hash(i, 63) * w * 1.6 - scroll * 0.03 - time * 6) % (w * 1.6) + w * 1.6) % (w * 1.6) - w * 0.3;
    const cy = h * (0.12 + hash(i, 64) * 0.25);
    ctx.fillStyle = 'rgba(70,40,100,0.55)';
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(cx + k * h * 0.06, cy + Math.sin(k) * h * 0.01, h * 0.08, h * 0.03, 0, 0, TAU); ctx.fill(); }
  }
  // the city far below
  const Cw = Math.max(36, h * 0.11);
  const city = strip(ctx, 'citybelow', Cw, floorY, 24, (x2, x, n) => {
    const bh = h * (0.12 + hash(n, 65) * 0.2);
    x2.fillStyle = '#1a0e33';
    x2.fillRect(x, floorY - bh, Cw - 2, bh);
    x2.fillStyle = 'rgba(255,190,120,0.65)';
    for (let wy = floorY - bh + 5; wy < floorY - 4; wy += 7) {
      for (let wx = 3; wx < Cw - 6; wx += 6) if (hash(Math.floor(wx * 5 + wy * 3) + n, 66) > 0.7) x2.fillRect(x + wx, wy, 2.5, 3);
    }
  });
  blit(ctx, city, w, scroll, 0.05, 0);
  ctx.fillStyle = vgrad(ctx, floorY - h * 0.2, floorY, [[0, 'rgba(255,120,120,0)'], [1, 'rgba(255,120,140,0.3)']]);
  ctx.fillRect(-20, floorY - h * 0.2, w + 40, h * 0.2);

  // neighbouring rooftops: water towers, antennas
  tiles(w, scroll, 0.25, Math.max(260, w * 0.4), (x, n) => {
    const tp = floorY - h * (0.1 + hash(n, 67) * 0.12);
    ctx.fillStyle = '#120a24';
    ctx.fillRect(x, tp, Math.max(260, w * 0.4) * 0.8, floorY - tp);
    if (hash(n, 68) > 0.35) {
      const tx = x + Math.max(260, w * 0.4) * 0.3, tw = h * 0.08, th = h * 0.09;
      ctx.strokeStyle = '#120a24';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tx, tp); ctx.lineTo(tx + tw * 0.15, tp - h * 0.06); ctx.moveTo(tx + tw, tp); ctx.lineTo(tx + tw * 0.85, tp - h * 0.06); ctx.stroke();
      ctx.fillStyle = '#2a1a3e';
      ctx.fillRect(tx, tp - h * 0.06 - th, tw, th);
      ctx.beginPath(); ctx.moveTo(tx - 3, tp - h * 0.06 - th); ctx.lineTo(tx + tw / 2, tp - h * 0.06 - th - h * 0.035); ctx.lineTo(tx + tw + 3, tp - h * 0.06 - th); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      for (let k = 1; k < 4; k++) ctx.fillRect(tx + (tw / 4) * k, tp - h * 0.06 - th, 1.5, th);
    }
    const ax = x + Math.max(260, w * 0.4) * 0.65;
    ctx.fillStyle = '#120a24';
    ctx.fillRect(ax, tp - h * 0.16, 2.5, h * 0.16);
    ctx.fillStyle = Math.sin(time * 2.5 + n) > 0.2 ? '#ff4040' : '#4a1010';
    ctx.beginPath(); ctx.arc(ax + 1.2, tp - h * 0.16, 2.6, 0, TAU); ctx.fill();
  });

  // giant neon billboard
  tiles(w, scroll, 0.4, Math.max(700, w * 1.1), (x) => {
    const bw = h * 0.55, bh = h * 0.2, bx = x + h * 0.2, by = floorY - h * 0.5;
    ctx.fillStyle = '#120a24';
    ctx.fillRect(bx + bw * 0.2, by + bh, 4, h * 0.3);
    ctx.fillRect(bx + bw * 0.8, by + bh, 4, h * 0.3);
    ctx.fillStyle = '#0d0820';
    rr(ctx, bx, by, bw, bh, 6);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(232,178,74,0.25)';
    ctx.lineWidth = 9;
    rr(ctx, bx + 4, by + 4, bw - 8, bh - 8, 4);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#e8b24a';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `400 ${Math.round(bh * 0.36)}px "Bungee", Impact, sans-serif`;
    neonText(ctx, 'LAST SECOND', bx + bw / 2, by + bh * 0.42, '#ffd56a', bh * 0.06);
    ctx.font = `700 ${Math.round(bh * 0.16)}px "Chakra Petch", sans-serif`;
    neonText(ctx, 'CASH OUT BEFORE IT ENDS', bx + bw / 2, by + bh * 0.76, '#ff7ac0', bh * 0.03);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = Math.floor(time * 6 + i) % 3 === 0 ? '#fff6c8' : '#6a5a2a';
      ctx.beginPath(); ctx.arc(bx + 10 + i * (bw - 20) / 9, by - 4, 2.2, 0, TAU); ctx.fill();
    }
  });

  // our rooftop: tar roof and a brick parapet
  ctx.fillStyle = vgrad(ctx, floorY, h, [[0, '#2a2433'], [0.4, '#1a1622'], [1, '#0e0b14']]);
  ctx.fillRect(-20, floorY, w + 40, h - floorY + 20);
  slantLines(ctx, w, h, floorY, scroll, Math.max(60, h * 0.26), 'rgba(255,255,255,0.05)');
  tiles(w, scroll, 1, Math.max(90, h * 0.3), (x, n) => {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(x + 20, floorY + (h - floorY) * (0.3 + hash(n, 69) * 0.5), h * 0.03, h * 0.006, 0, 0, TAU); ctx.fill();
  });
  ctx.fillStyle = vgrad(ctx, floorY - h * 0.03, floorY, [[0, '#7a3a34'], [1, '#4a201c']]);
  ctx.fillRect(-20, floorY - h * 0.03, w + 40, h * 0.03);
  ctx.fillStyle = '#9a5a4a';
  ctx.fillRect(-20, floorY - h * 0.034, w + 40, h * 0.006);
  tiles(w, scroll, 1, 22, (x) => { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, floorY - h * 0.028, 1.5, h * 0.028); });
}

export function drawZone(ctx, type, w, h, scroll, floorY, gy, time, alarm) {
  if (type === 'vault') drawVault(ctx, w, h, scroll, floorY, gy, time, alarm);
  else if (type === 'hall') drawHall(ctx, w, h, scroll, floorY, gy, time, alarm);
  else if (type === 'street') drawStreet(ctx, w, h, scroll, floorY, gy, time);
  else drawRoof(ctx, w, h, scroll, floorY, gy, time);
}

/* ───────── Gateways between zones ───────── */

export function drawGate(ctx, x, h, floorY, type, time) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (type === 'hall') {
    // blown-open blast door frame
    const gw = h * 0.09;
    const g = ctx.createLinearGradient(x - gw, 0, x + gw, 0);
    g.addColorStop(0, '#2b3d3a'); g.addColorStop(0.5, '#b9d0cb'); g.addColorStop(1, '#2b3d3a');
    ctx.fillStyle = g;
    ctx.fillRect(x - gw, -10, gw * 2, floorY + 10);
    ctx.fillStyle = '#f2c14e';
    for (let y = 0; y < floorY; y += h * 0.08) {
      ctx.beginPath(); ctx.moveTo(x - gw, y); ctx.lineTo(x - gw * 0.4, y); ctx.lineTo(x - gw, y + h * 0.04); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#0f3d22';
    rr(ctx, x - gw * 0.85, h * 0.2, gw * 1.7, h * 0.055, 3);
    ctx.fill();
    ctx.font = `700 ${Math.round(h * 0.034)}px "Chakra Petch", system-ui, sans-serif`;
    neonText(ctx, 'EXIT', x, h * 0.228, '#5cf29a', h * 0.008);
  } else if (type === 'street') {
    // grand bank entrance
    const gw = h * 0.06;
    ctx.fillStyle = '#5a4a32';
    ctx.beginPath(); ctx.moveTo(x - gw * 3, h * 0.13); ctx.lineTo(x, h * 0.03); ctx.lineTo(x + gw * 3, h * 0.13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d8ccb0';
    ctx.fillRect(x - gw * 3, h * 0.13, gw * 6, h * 0.035);
    ctx.fillStyle = '#4a3a20';
    ctx.font = `700 ${Math.round(h * 0.03)}px Georgia, serif`;
    ctx.fillText('NATIONAL BANK', x, h * 0.148);
    ctx.fillStyle = 'rgba(180,220,255,0.12)';
    ctx.fillRect(x - gw * 2.4, h * 0.165, gw * 4.8, floorY - h * 0.165);
    for (const cx of [x - gw * 2.8, x + gw * 2.2]) {
      const cg = ctx.createLinearGradient(cx, 0, cx + gw * 0.6, 0);
      cg.addColorStop(0, '#8a7d68'); cg.addColorStop(0.5, '#f2e8d2'); cg.addColorStop(1, '#8a7d68');
      ctx.fillStyle = cg;
      ctx.fillRect(cx, h * 0.165, gw * 0.6, floorY - h * 0.165);
    }
    ctx.fillStyle = '#b08a3e';
    ctx.fillRect(x - 1.5, h * 0.165, 3, floorY - h * 0.165);
  } else {
    // roof access stairwell door
    const gw = h * 0.08;
    ctx.fillStyle = '#3a2a33';
    ctx.fillRect(x - gw, floorY - h * 0.42, gw * 2, h * 0.42);
    ctx.fillStyle = '#1a1018';
    ctx.fillRect(x - gw * 0.6, floorY - h * 0.3, gw * 1.2, h * 0.3);
    ctx.font = `700 ${Math.round(h * 0.028)}px "Chakra Petch", system-ui, sans-serif`;
    neonText(ctx, 'ROOF', x, floorY - h * 0.35, '#ff5a5a', h * 0.007);
    ctx.fillStyle = Math.sin(time * 4) > 0 ? '#ffcf4a' : '#5a4a10';
    ctx.beginPath(); ctx.arc(x, floorY - h * 0.4, 3, 0, TAU); ctx.fill();
  }
}
