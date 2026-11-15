import { TAU, clamp, lerp, easeOut, easeOutBack, hash, rr, particles } from './util';
import { drawPerson, OUTFITS } from './people';

const C = {
  brass: '#e8b24a', brassDark: '#8c6119',
  gold: '#f7c948', goldDark: '#b07a14', goldLight: '#fff0b8',
  alarm: '#ff4d4d', alarmOff: '#5a1a1a',
  steel: '#a9c2bd', steelDark: '#4a6560',
  laser: '#ff2d55',
};
const ZONE_AT = [
  { min: 1.6, type: 'hall' },
  { min: 3.2, type: 'street' },
];
const TRAPS = {
  vault: [['laserLow', 'jump'], ['laserHigh', 'slide']],
  hall: [['spikes', 'jump'], ['shutter', 'slide'], ['laserLow', 'jump']],
  street: [['barrier', 'jump'], ['spikestrip', 'jump'], ['barrier', 'jump']],
};

/* ───────── Backgrounds per zone ───────── */

function drawVaultBG(ctx, w, h, scroll, floorY, alarm) {
  const wg = ctx.createLinearGradient(0, 0, 0, floorY);
  wg.addColorStop(0, '#071918');
  wg.addColorStop(1, '#143a36');
  ctx.fillStyle = wg;
  ctx.fillRect(-20, -20, w + 40, floorY + 20);
  const bw = Math.max(26, h * 0.1), bh = bw * 0.56, gap = Math.max(3, bw * 0.07);
  const colW = bw + gap, rowH = bh + gap;
  const bScroll = scroll * 0.3;
  const off = bScroll % colW;
  const startCol = Math.floor(bScroll / colW);
  const top = h * 0.05;
  const rows = Math.floor((floorY - h * 0.06 - top) / rowH);
  for (let i = -1; i <= Math.ceil(w / colW) + 1; i++) {
    const x = i * colW - off;
    const col = startCol + i;
    for (let r = 0; r < rows; r++) {
      const y = top + r * rowH;
      const open = hash(col * 13 + r, 2) > 0.94;
      ctx.fillStyle = open ? '#061413' : '#16403b';
      ctx.fillRect(x, y, bw, bh);
      if (open) {
        ctx.fillStyle = 'rgba(247,201,72,0.5)';
        ctx.fillRect(x + bw * 0.15, y + bh * 0.55, bw * 0.7, bh * 0.3);
      } else {
        ctx.fillStyle = '#235f58';
        ctx.fillRect(x, y, bw, 1.5);
        ctx.fillStyle = '#0d2a27';
        ctx.fillRect(x, y + bh - 2, bw, 2);
        ctx.fillStyle = C.brassDark;
        ctx.beginPath();
        ctx.arc(x + bw * 0.84, y + bh * 0.5, Math.max(1.5, bw * 0.045), 0, TAU);
        ctx.fill();
      }
    }
  }
  const haze = ctx.createLinearGradient(0, 0, 0, floorY);
  haze.addColorStop(0, 'rgba(5,18,17,0.55)');
  haze.addColorStop(0.7, 'rgba(10,32,30,0.25)');
  haze.addColorStop(1, 'rgba(10,32,30,0.6)');
  ctx.fillStyle = haze;
  ctx.fillRect(-20, -20, w + 40, floorY + 20);

  const P = Math.max(260, w * 0.48);
  const pOff = (scroll * 0.65) % P;
  const pw = Math.max(26, h * 0.085);
  for (let i = -1; i <= Math.ceil(w / P) + 1; i++) {
    const x = i * P - pOff + P * 0.55;
    const pg = ctx.createLinearGradient(x, 0, x + pw, 0);
    pg.addColorStop(0, '#0b2321');
    pg.addColorStop(0.5, '#18403b');
    pg.addColorStop(1, '#0b2321');
    ctx.fillStyle = pg;
    ctx.fillRect(x, 0, pw, floorY);
    ctx.fillStyle = C.brassDark;
    ctx.fillRect(x - 3, h * 0.13, pw + 6, h * 0.018);
    ctx.fillRect(x - 3, floorY - h * 0.05, pw + 6, h * 0.016);
    alarmLamp(ctx, x + pw / 2, h * 0.13, pw * 0.22, h, alarm);
  }
  ctx.fillStyle = '#0a1716';
  ctx.fillRect(-20, floorY, w + 40, h - floorY + 20);
  slantLines(ctx, w, h, floorY, scroll, Math.max(40, h * 0.2), '#173330');
  ctx.fillStyle = 'rgba(232,178,74,0.06)';
  ctx.fillRect(0, floorY, w, (h - floorY) * 0.25);
  ctx.fillStyle = '#c9952f';
  ctx.fillRect(-20, floorY - 2, w + 40, 3);
}

function drawHallBG(ctx, w, h, scroll, floorY, alarm) {
  const wg = ctx.createLinearGradient(0, 0, 0, floorY);
  wg.addColorStop(0, '#1b0d13');
  wg.addColorStop(1, '#3d1d26');
  ctx.fillStyle = wg;
  ctx.fillRect(-20, -20, w + 40, floorY + 20);
  // arched windows
  const Wp = Math.max(240, h * 0.85);
  const wOff = (scroll * 0.3) % Wp;
  for (let i = -1; i <= Math.ceil(w / Wp) + 1; i++) {
    const ww = Wp * 0.36;
    const x = i * Wp - wOff + Wp * 0.32;
    const top = h * 0.1, bot = floorY - h * 0.24;
    ctx.beginPath();
    ctx.moveTo(x, bot);
    ctx.lineTo(x, top + ww / 2);
    ctx.arc(x + ww / 2, top + ww / 2, ww / 2, Math.PI, 0);
    ctx.lineTo(x + ww, bot);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, top, 0, bot);
    g.addColorStop(0, '#0c1630');
    g.addColorStop(1, '#22336a');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#8c6a2c';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + ww / 2, top);
    ctx.lineTo(x + ww / 2, bot);
    ctx.moveTo(x, top + (bot - top) * 0.62);
    ctx.lineTo(x + ww, top + (bot - top) * 0.62);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // wainscot
  ctx.fillStyle = '#26101a';
  ctx.fillRect(-20, floorY - h * 0.17, w + 40, h * 0.17);
  ctx.fillStyle = '#8c6a2c';
  ctx.fillRect(-20, floorY - h * 0.17, w + 40, 2);
  // teller counter
  const Cp = Math.max(320, w * 0.62);
  const cOff = (scroll * 0.85) % Cp;
  for (let i = -1; i <= Math.ceil(w / Cp) + 1; i++) {
    const x = i * Cp - cOff;
    const cw = Cp * 0.68;
    const ct = floorY - h * 0.13;
    ctx.strokeStyle = 'rgba(200,160,80,0.55)';
    ctx.lineWidth = 1.5;
    for (let gx = x + 6; gx < x + cw - 4; gx += 9) {
      ctx.beginPath();
      ctx.moveTo(gx, ct);
      ctx.lineTo(gx, ct - h * 0.1);
      ctx.stroke();
    }
    ctx.fillStyle = '#8c6a2c';
    ctx.fillRect(x, ct - h * 0.1 - 3, cw, 3);
    const g = ctx.createLinearGradient(0, ct, 0, floorY);
    g.addColorStop(0, '#5a3322');
    g.addColorStop(1, '#2a160e');
    ctx.fillStyle = g;
    ctx.fillRect(x, ct, cw, floorY - ct);
    ctx.fillStyle = '#c9a050';
    ctx.fillRect(x - 2, ct - 2, cw + 4, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let k = 1; k < 4; k++) ctx.fillRect(x + (cw / 4) * k, ct + 4, 2, floorY - ct - 4);
  }
  // marble columns
  const P = Math.max(240, w * 0.42);
  const pOff = (scroll * 0.65) % P;
  const cw = Math.max(24, h * 0.075);
  for (let i = -1; i <= Math.ceil(w / P) + 1; i++) {
    const x = i * P - pOff + P * 0.15;
    const g = ctx.createLinearGradient(x, 0, x + cw, 0);
    g.addColorStop(0, '#6f6455');
    g.addColorStop(0.5, '#e3d7bf');
    g.addColorStop(1, '#6f6455');
    ctx.fillStyle = g;
    ctx.fillRect(x, h * 0.08, cw, floorY - h * 0.08);
    ctx.fillStyle = 'rgba(80,60,40,0.25)';
    for (let k = 1; k < 4; k++) ctx.fillRect(x + (cw / 4) * k, h * 0.1, 1.5, floorY - h * 0.14);
    ctx.fillStyle = '#cfc2a8';
    ctx.fillRect(x - cw * 0.2, h * 0.07, cw * 1.4, h * 0.03);
    ctx.fillRect(x - cw * 0.2, floorY - h * 0.03, cw * 1.4, h * 0.03);
    alarmLamp(ctx, x + cw / 2, h * 0.16, cw * 0.28, h, alarm);
  }
  // checkered marble floor
  ctx.fillStyle = '#1a0f12';
  ctx.fillRect(-20, floorY, w + 40, h - floorY + 20);
  const T = Math.max(40, h * 0.17);
  const start = Math.floor(scroll / T);
  const off = scroll % T;
  const rows = [floorY, floorY + (h - floorY) * 0.3, floorY + (h - floorY) * 0.65, h + 4];
  for (let r = 0; r < 3; r++) {
    const y0 = rows[r], y1 = rows[r + 1];
    const d0 = (y0 - floorY) * 0.9, d1 = (y1 - floorY) * 0.9;
    for (let k = -2; k <= Math.ceil(w / T) + 3; k++) {
      if ((start + k + r) % 2 !== 0) continue;
      const x0 = k * T - off;
      ctx.fillStyle = '#3a2a2c';
      ctx.beginPath();
      ctx.moveTo(x0 - d0, y0);
      ctx.lineTo(x0 + T - d0, y0);
      ctx.lineTo(x0 + T - d1, y1);
      ctx.lineTo(x0 - d1, y1);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(255,220,170,0.05)';
  ctx.fillRect(0, floorY, w, (h - floorY) * 0.3);
  ctx.fillStyle = '#8c6a2c';
  ctx.fillRect(-20, floorY - 2, w + 40, 3);
}

function drawStreetBG(ctx, w, h, scroll, floorY, gy, time) {
  const sg = ctx.createLinearGradient(0, 0, 0, floorY);
  sg.addColorStop(0, '#050918');
  sg.addColorStop(1, '#1a2250');
  ctx.fillStyle = sg;
  ctx.fillRect(-20, -20, w + 40, floorY + 20);
  const mx = w * 0.84, my = h * 0.13, mr = h * 0.05;
  const mg = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 4);
  mg.addColorStop(0, 'rgba(240,236,210,0.35)');
  mg.addColorStop(1, 'rgba(240,236,210,0)');
  ctx.fillStyle = mg;
  ctx.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
  ctx.fillStyle = '#efecd8';
  ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
  // far skyline
  const Bw = Math.max(40, h * 0.2);
  const fs = scroll * 0.1;
  const fStart = Math.floor(fs / Bw), fOff = fs % Bw;
  for (let k = -1; k <= Math.ceil(w / Bw) + 1; k++) {
    const n = fStart + k;
    const bh = h * (0.22 + hash(n, 31) * 0.32);
    const x = k * Bw - fOff;
    ctx.fillStyle = '#0e1330';
    ctx.fillRect(x, floorY - bh, Bw - 3, bh);
    for (let wy = floorY - bh + 8; wy < floorY - 10; wy += 11) {
      for (let wx = x + 5; wx < x + Bw - 10; wx += 9) {
        if (hash(Math.floor(wx * 3 + wy * 7) + n, 33) > 0.78) {
          ctx.fillStyle = 'rgba(255,210,122,0.55)';
          ctx.fillRect(wx, wy, 4, 5);
        }
      }
    }
  }
  // storefronts
  const Fw = Math.max(200, h * 0.75);
  const ns = scroll * 0.45;
  const nStart = Math.floor(ns / Fw), nOff = ns % Fw;
  for (let k = -1; k <= Math.ceil(w / Fw) + 1; k++) {
    const n = nStart + k;
    const x = k * Fw - nOff;
    const top = floorY - h * (0.42 + hash(n, 41) * 0.18);
    ctx.fillStyle = hash(n, 43) > 0.5 ? '#2a1b2a' : '#1f2238';
    ctx.fillRect(x, top, Fw - 8, floorY - top);
    for (let wy = top + h * 0.04; wy < floorY - h * 0.22; wy += h * 0.07) {
      for (let wx = x + Fw * 0.08; wx < x + Fw - Fw * 0.15; wx += Fw * 0.16) {
        const lit = hash(Math.floor(wx + wy * 5) + n * 17, 47) > 0.55;
        ctx.fillStyle = lit ? 'rgba(255,200,120,0.6)' : '#141628';
        ctx.fillRect(wx, wy, Fw * 0.08, h * 0.04);
      }
    }
    // shop window + awning
    ctx.fillStyle = 'rgba(255,207,122,0.32)';
    ctx.fillRect(x + Fw * 0.08, floorY - h * 0.16, Fw * 0.6, h * 0.13);
    const aw = Fw * 0.66, ax = x + Fw * 0.05, ay = floorY - h * 0.19;
    for (let s = 0; s < 8; s++) {
      ctx.fillStyle = s % 2 ? '#f2efe6' : (hash(n, 49) > 0.5 ? '#c0392b' : '#2e86ab');
      ctx.beginPath();
      ctx.moveTo(ax + (aw / 8) * s, ay);
      ctx.lineTo(ax + (aw / 8) * (s + 1), ay);
      ctx.lineTo(ax + (aw / 8) * (s + 1) + 3, ay + h * 0.03);
      ctx.lineTo(ax + (aw / 8) * s + 3, ay + h * 0.03);
      ctx.closePath();
      ctx.fill();
    }
  }
  // sidewalk + road
  const curbY = gy + h * 0.05;
  ctx.fillStyle = '#2b2d3a';
  ctx.fillRect(-20, floorY, w + 40, curbY - floorY);
  slantLines(ctx, w, curbY, floorY, scroll, Math.max(40, h * 0.18), '#22242f');
  ctx.fillStyle = '#12131a';
  ctx.fillRect(-20, curbY, w + 40, h - curbY + 20);
  ctx.fillStyle = '#585b6c';
  ctx.fillRect(-20, curbY, w + 40, 3);
  const dashY = curbY + (h - curbY) * 0.6;
  const D = Math.max(60, h * 0.22);
  const dOff = (scroll * 1.15) % D;
  ctx.fillStyle = 'rgba(255,214,102,0.8)';
  for (let x = -dOff; x < w + D; x += D) ctx.fillRect(x, dashY, D * 0.5, Math.max(2, h * 0.008));
  // street lamps
  const Lp = Math.max(260, w * 0.5);
  const lOff = scroll % Lp;
  for (let x = -lOff + Lp * 0.7; x < w + Lp; x += Lp) {
    const top = h * 0.24;
    const lg = ctx.createLinearGradient(0, top, 0, floorY + h * 0.05);
    lg.addColorStop(0, 'rgba(255,214,140,0.22)');
    lg.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(x + 8, top);
    ctx.lineTo(x + 8 + h * 0.13, floorY + h * 0.06);
    ctx.lineTo(x + 8 - h * 0.13, floorY + h * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2d3040';
    ctx.fillRect(x - 2, top, 4, floorY - top);
    ctx.fillRect(x - 2, top, 14, 3);
    ctx.fillStyle = '#ffe2a0';
    rr(ctx, x + 3, top + 2, 10, 5, 2);
    ctx.fill();
  }
}

function slantLines(ctx, w, bottom, floorY, scroll, T, color) {
  const off = scroll % T;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let x = -off - T; x < w + T * 3; x += T) {
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x - (bottom - floorY) * 0.9, bottom);
    ctx.stroke();
  }
}

function alarmLamp(ctx, x, y, r, h, alarm) {
  if (alarm > 0) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, h * 0.2);
    g.addColorStop(0, `rgba(255,77,77,${0.55 * alarm})`);
    g.addColorStop(1, 'rgba(255,77,77,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - h * 0.2, y - h * 0.2, h * 0.4, h * 0.4);
  }
  ctx.fillStyle = alarm > 0 ? C.alarm : C.alarmOff;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0);
  ctx.fill();
}

function drawGate(ctx, x, h, floorY, type) {
  if (type === 'hall') {
    const gw = h * 0.07;
    const g = ctx.createLinearGradient(x - gw, 0, x + gw, 0);
    g.addColorStop(0, '#3d5551');
    g.addColorStop(0.5, '#a9c2bd');
    g.addColorStop(1, '#3d5551');
    ctx.fillStyle = g;
    ctx.fillRect(x - gw, -10, gw * 2, floorY + 10);
    ctx.fillStyle = '#2b3d3a';
    for (let y = h * 0.05; y < floorY; y += h * 0.06) {
      ctx.beginPath(); ctx.arc(x - gw * 0.6, y, 2, 0, TAU); ctx.arc(x + gw * 0.6, y, 2, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = '#0f3d22';
    rr(ctx, x - gw * 0.8, h * 0.18, gw * 1.6, h * 0.05, 3);
    ctx.fill();
    ctx.fillStyle = '#5cf29a';
    ctx.font = `700 ${Math.round(h * 0.032)}px "Chakra Petch", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', x, h * 0.205);
  } else {
    const gw = h * 0.05;
    ctx.fillStyle = '#6b4e1f';
    ctx.fillRect(x - gw * 2.2, h * 0.08, gw * 4.4, h * 0.06);
    ctx.fillStyle = '#e8b24a';
    ctx.font = `700 ${Math.round(h * 0.04)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BANK', x, h * 0.11);
    ctx.fillStyle = 'rgba(180,220,255,0.10)';
    ctx.fillRect(x - gw * 2, h * 0.14, gw * 4, floorY - h * 0.14);
    ctx.fillStyle = '#b08a3e';
    ctx.fillRect(x - gw * 2.2, h * 0.14, gw * 0.3, floorY - h * 0.14);
    ctx.fillRect(x + gw * 1.9, h * 0.14, gw * 0.3, floorY - h * 0.14);
    ctx.fillRect(x - 1.5, h * 0.14, 3, floorY - h * 0.14);
  }
}

/* ───────── Booby traps ───────── */

function drawTrap(ctx, tr, x, w, h, floorY, gy, rx, time) {
  const yB = floorY + 2, yF = gy + (h - gy) * 0.75;
  const xB = x + (gy - yB) * 0.9, xF = x - (yF - gy) * 0.9;
  const kB = 0.82, kF = 1.12;
  const near = clamp((w * 0.5 - (x - rx)) / (w * 0.18), 0, 1);
  const post = (px, py, ph, k) => {
    ctx.fillStyle = '#20262c';
    rr(ctx, px - 4 * k, py - ph, 8 * k, ph, 2);
    ctx.fill();
    ctx.fillStyle = '#ff2d55';
    ctx.beginPath(); ctx.arc(px, py - ph + 4 * k, 2.4 * k, 0, TAU); ctx.fill();
  };
  if (tr.type === 'laserLow' || tr.type === 'laserHigh') {
    const H = tr.type === 'laserLow' ? h * 0.07 : h * 0.21;
    post(xB, yB, H * kB + 8, kB);
    ctx.save();
    ctx.shadowColor = C.laser;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = C.laser;
    ctx.lineWidth = Math.max(2, h * 0.006);
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(time * 30 + tr.x);
    ctx.beginPath();
    ctx.moveTo(xB, yB - H * kB);
    ctx.lineTo(xF, yF - H * kF);
    ctx.stroke();
    ctx.restore();
    post(xF, yF, H * kF + 8, kF);
  } else if (tr.type === 'spikes' || tr.type === 'spikestrip') {
    const big = tr.type === 'spikes';
    const pop = big ? easeOut(near) : 1;
    const n = 9;
    ctx.fillStyle = '#2a2f36';
    ctx.beginPath();
    ctx.moveTo(xB - 10, yB); ctx.lineTo(xB + 10, yB); ctx.lineTo(xF + 14, yF); ctx.lineTo(xF - 14, yF);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const px = lerp(xB, xF, u), py = lerp(yB, yF, u);
      const k = lerp(kB, kF, u);
      const sh = (big ? h * 0.07 : h * 0.025) * k * pop;
      for (const dx of [-7, 0, 7]) {
        const g = ctx.createLinearGradient(px, py - sh, px, py);
        g.addColorStop(0, '#f0f4f8');
        g.addColorStop(1, '#6a7480');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(px + dx * k - 3.5 * k, py);
        ctx.lineTo(px + dx * k, py - sh);
        ctx.lineTo(px + dx * k + 3.5 * k, py);
        ctx.closePath();
        ctx.fill();
      }
    }
  } else if (tr.type === 'shutter') {
    const bottom = lerp(-h * 0.1, gy - h * 0.19, easeOut(near));
    const sw = h * 0.05, depth = h * 0.05;
    ctx.fillStyle = '#3b4148';
    ctx.beginPath();
    ctx.moveTo(x + sw / 2, -10);
    ctx.lineTo(x + sw / 2 + depth, -10 - depth * 0.6);
    ctx.lineTo(x + sw / 2 + depth, bottom - depth * 0.6);
    ctx.lineTo(x + sw / 2, bottom);
    ctx.closePath();
    ctx.fill();
    const g = ctx.createLinearGradient(x - sw / 2, 0, x + sw / 2, 0);
    g.addColorStop(0, '#6c7680');
    g.addColorStop(0.5, '#b8c2cc');
    g.addColorStop(1, '#5d6670');
    ctx.fillStyle = g;
    ctx.fillRect(x - sw / 2, -10, sw, bottom + 10);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = bottom - 8; y > 0; y -= 9) ctx.fillRect(x - sw / 2, y, sw, 2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - sw / 2, bottom - h * 0.025, sw, h * 0.025);
    ctx.clip();
    ctx.fillStyle = '#f2c14e';
    ctx.fillRect(x - sw / 2, bottom - h * 0.025, sw, h * 0.025);
    ctx.fillStyle = '#111';
    for (let s = -sw; s < sw * 2; s += 10) {
      ctx.beginPath();
      ctx.moveTo(x - sw / 2 + s, bottom);
      ctx.lineTo(x - sw / 2 + s + 5, bottom);
      ctx.lineTo(x - sw / 2 + s + 5 + h * 0.025, bottom - h * 0.025);
      ctx.lineTo(x - sw / 2 + s + h * 0.025, bottom - h * 0.025);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else if (tr.type === 'barrier') {
    const H = h * 0.11;
    const leg = (px, py, k) => {
      ctx.strokeStyle = '#d7dbe2';
      ctx.lineWidth = 3 * k;
      ctx.beginPath();
      ctx.moveTo(px - 9 * k, py);
      ctx.lineTo(px, py - H * k);
      ctx.lineTo(px + 9 * k, py);
      ctx.stroke();
    };
    leg(xB, yB, kB);
    const th = h * 0.032;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xB, yB - H * kB - th * kB);
    ctx.lineTo(xF, yF - H * kF - th * kF);
    ctx.lineTo(xF, yF - H * kF);
    ctx.lineTo(xB, yB - H * kB);
    ctx.closePath();
    ctx.fillStyle = '#f4f4f4';
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = '#e8402f';
    const len = Math.hypot(xF - xB, yF - yB);
    for (let s = 0; s < len + 40; s += 16) {
      const u = s / len;
      const px = lerp(xB, xF, u), py = lerp(yB - H * kB, yF - H * kF, u);
      ctx.beginPath();
      ctx.moveTo(px, py - th * 2);
      ctx.lineTo(px + 8, py - th * 2);
      ctx.lineTo(px - 4, py + th);
      ctx.lineTo(px - 12, py + th);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    leg(xF, yF, kF);
    // little warning light
    ctx.fillStyle = Math.sin(time * 6 + tr.x) > 0 ? '#ffb347' : '#5a3a10';
    ctx.beginPath(); ctx.arc(xF, yF - H * kF - th * kF - 4, 3.5, 0, TAU); ctx.fill();
  }
}

/* ───────── Police car + helicopter ───────── */

function drawPoliceCar(ctx, x, y, s, time, wheelRot, reduced) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(0, 2, 72, 7, 0, 0, TAU); ctx.fill();
  // body
  ctx.fillStyle = '#121318';
  rr(ctx, -70, -30, 140, 24, 8);
  ctx.fill();
  ctx.fillStyle = '#eef1f6';
  ctx.fillRect(-34, -30, 64, 24);
  // cabin
  ctx.fillStyle = '#121318';
  ctx.beginPath();
  ctx.moveTo(-40, -30); ctx.lineTo(-26, -50); ctx.lineTo(22, -50); ctx.lineTo(40, -30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8fb6d8';
  ctx.beginPath();
  ctx.moveTo(-34, -32); ctx.lineTo(-24, -46); ctx.lineTo(-3, -46); ctx.lineTo(-3, -32);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1, -32); ctx.lineTo(1, -46); ctx.lineTo(20, -46); ctx.lineTo(33, -32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1f3b8a';
  ctx.font = '900 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POLICE', -2, -18);
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(64, -26, 6, 6);
  ctx.fillStyle = '#ff4d4d';
  ctx.fillRect(-70, -26, 5, 6);
  // light bar
  const on = reduced ? true : Math.floor(time * 3) % 2 === 0;
  ctx.fillStyle = '#222';
  ctx.fillRect(-14, -55, 28, 5);
  ctx.fillStyle = on ? '#ff3b3b' : '#5a1515';
  ctx.fillRect(-14, -55, 13, 5);
  ctx.fillStyle = on ? '#28307a' : '#4a6bff';
  ctx.fillRect(1, -55, 13, 5);
  const glow = (cx, col) => {
    const g = ctx.createRadialGradient(cx, -53, 0, cx, -53, 60);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 60, -113, 120, 120);
  };
  glow(on ? -7 : 7, on ? 'rgba(255,59,59,0.45)' : 'rgba(74,107,255,0.5)');
  // wheels
  for (const wx of [-44, 44]) {
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath(); ctx.arc(wx, -4, 13, 0, TAU); ctx.fill();
    ctx.fillStyle = '#8b93a3';
    ctx.beginPath(); ctx.arc(wx, -4, 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#3a3f4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx + Math.cos(wheelRot) * 6, -4 + Math.sin(wheelRot) * 6);
    ctx.lineTo(wx - Math.cos(wheelRot) * 6, -4 - Math.sin(wheelRot) * 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHeli(ctx, x, y, s, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#0d1020';
  ctx.beginPath(); ctx.ellipse(0, 0, 30, 14, 0, 0, TAU); ctx.fill();
  ctx.fillRect(-62, -4, 40, 6);
  ctx.fillRect(-66, -12, 6, 14);
  ctx.fillStyle = '#2a3150';
  ctx.beginPath(); ctx.ellipse(14, -2, 12, 8, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0d1020';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-18, 18); ctx.lineTo(22, 18); ctx.stroke();
  ctx.fillStyle = 'rgba(150,160,190,0.4)';
  ctx.beginPath(); ctx.ellipse(0, -18, 70 * Math.abs(Math.sin(time * 30)) + 20, 3, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = Math.sin(time * 8) > 0 ? '#ff3b3b' : '#3b0d0d';
  ctx.beginPath(); ctx.arc(-64, -12, 3, 0, TAU); ctx.fill();
  ctx.restore();
}

/* ───────── Vault door ───────── */

function drawDoor(ctx, cx, cy, R, spin, progress, openAngle) {
  if (openAngle > 0) {
    const gl = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.4);
    gl.addColorStop(0, `rgba(255,214,120,${0.55 * Math.min(1, openAngle)})`);
    gl.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = gl;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.4, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = '#0b201e';
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.brassDark;
  ctx.lineWidth = R * 0.04;
  ctx.stroke();
  if (openAngle > 0) {
    const gi = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    gi.addColorStop(0, 'rgba(255,220,130,0.95)');
    gi.addColorStop(1, 'rgba(160,100,20,0.35)');
    ctx.fillStyle = gi;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.02, 0, TAU); ctx.fill();
  }
  if (progress > 0 && openAngle === 0) {
    ctx.strokeStyle = 'rgba(232,178,74,0.18)';
    ctx.lineWidth = R * 0.06;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.brass;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, -Math.PI / 2, -Math.PI / 2 + progress * TAU); ctx.stroke();
  }
  ctx.save();
  const sq = Math.cos(Math.min(openAngle, 1.45));
  ctx.translate(cx - R, cy);
  ctx.scale(sq, 1);
  ctx.translate(R, 0);
  const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
  g.addColorStop(0, '#c9dad6');
  g.addColorStop(0.6, '#7d9893');
  g.addColorStop(1, '#3d5551');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(20,40,38,0.55)';
  ctx.lineWidth = R * 0.02;
  for (const k of [0.82, 0.62]) { ctx.beginPath(); ctx.arc(0, 0, R * k, 0, TAU); ctx.stroke(); }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    ctx.fillStyle = '#2f4441';
    ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.91, Math.sin(a) * R * 0.91, R * 0.035, 0, TAU); ctx.fill();
  }
  ctx.save();
  ctx.rotate(spin);
  ctx.strokeStyle = C.brass;
  ctx.lineCap = 'round';
  ctx.lineWidth = R * 0.07;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * -R * 0.44, Math.sin(a) * -R * 0.44);
    ctx.lineTo(Math.cos(a) * R * 0.44, Math.sin(a) * R * 0.44);
    ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    ctx.fillStyle = C.brass;
    ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.46, Math.sin(a) * R * 0.46, R * 0.07, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = C.brassDark;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.14, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawGoldBar(ctx, x, y, bw, bh) {
  ctx.beginPath();
  ctx.moveTo(x + bw * 0.12, y - bh);
  ctx.lineTo(x + bw * 0.88, y - bh);
  ctx.lineTo(x + bw, y);
  ctx.lineTo(x, y);
  ctx.closePath();
  const g = ctx.createLinearGradient(x, y - bh, x, y);
  g.addColorStop(0, C.goldLight);
  g.addColorStop(0.35, C.gold);
  g.addColorStop(1, C.goldDark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,50,0,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/* ───────── Scene ───────── */

export function createVaultScene() {
  let scroll = 0, speed = 0, ph = 0, time = 0, wheel = 0;
  let lastPhase = null, lastRound = -1, scrollAtStart = 0, crashTime = 0, crashZone = 'vault';
  let zones = [{ start: -1e12, type: 'vault' }];
  let traps = [], nextTrapX = 0, action = null;
  let collected = new Set();
  let cops = [], car = null, heliOn = 0, bagR = 10, coinAcc = 0;
  const fx = particles();

  const zoneAt = (wx) => {
    let z = zones[0].type;
    for (const zn of zones) if (wx >= zn.start) z = zn.type;
    return z;
  };

  return {
    draw(ctx, w, h, v, dt, reduced) {
      time += dt;
      const floorY = h * 0.76;
      const gy = floorY + (h - floorY) * 0.5;
      const sc = h * 0.003;
      const rx = w * 0.42;
      const doorR = h * 0.2;
      const doorBase = rx + h * 0.36;

      if (v.phase !== lastPhase || v.roundId !== lastRound) {
        if (v.phase === 'running') {
          scrollAtStart = scroll;
          zones = [{ start: -1e12, type: 'vault' }];
          traps = [];
          nextTrapX = scroll + w * 1.25;
          collected = new Set();
          cops = [{ kind: 'guard', gap: rx + 80, ph: 1 }];
          car = null;
          heliOn = 0;
          action = null;
        }
        if (v.phase === 'crashed' && lastPhase === 'running') {
          crashTime = time;
          crashZone = zoneAt(scroll + rx);
          action = null;
          for (let i = 0; i < 24; i++) {
            fx.add({ kind: 'coin', x: rx - 20 * sc, y: gy - 60 * sc, vx: (Math.random() - 0.6) * w * 0.3, vy: -h * (0.3 + Math.random() * 0.5), g: h * 2.6, life: 2.8, bounce: 0.45, rot: Math.random() * 6, vr: 8 + Math.random() * 10, r: h * 0.012, floor: gy + (Math.random() - 0.5) * h * 0.03 });
          }
        }
        if (v.phase === 'betting') {
          fx.clear();
          zones = [{ start: -1e12, type: 'vault' }];
          traps = [];
          cops = [];
          car = null;
          heliOn = 0;
          bagR = 10;
        }
        lastPhase = v.phase;
        lastRound = v.roundId;
      }

      const running = v.phase === 'running';
      const target = running ? w * (0.34 + 0.4 * clamp(Math.log(v.mult) / Math.log(10), 0, 1.8)) : 0;
      speed = lerp(speed, target, Math.min(1, dt * (v.phase === 'crashed' ? 9 : 3)));
      const dx = speed * dt;
      scroll += dx;
      ph += dt * (4 + speed / (h * 0.09));
      wheel += dx / (h * 0.04);

      // new zones open up as the multiplier climbs
      if (running) {
        const last = zones[zones.length - 1].type;
        for (const z of ZONE_AT) {
          if (v.mult >= z.min && zones.every((zn) => zn.type !== z.type) && ((z.type === 'hall' && last === 'vault') || (z.type === 'street' && last === 'hall'))) {
            zones.push({ start: scroll + w + h * 0.1, type: z.type });
          }
        }
      }
      const here = zoneAt(scroll + rx);

      // spawn booby traps ahead
      if (running) {
        while (nextTrapX < scroll + w * 1.3) {
          const zt = zoneAt(nextTrapX);
          const nearGate = zones.some((zn) => Math.abs(zn.start - nextTrapX) < h * 0.4);
          if (!nearGate) {
            const opts = TRAPS[zt];
            const [type, act] = opts[Math.floor(Math.random() * opts.length)];
            traps.push({ x: nextTrapX, type, action: act, started: false });
          }
          nextTrapX += Math.max(w * 0.5, speed * 0.95) + Math.random() * w * 0.45;
        }
      }
      traps = traps.filter((t) => t.x - scroll > -w * 0.5);

      // robber reacts to the next trap
      if (running && !action) {
        const rw = scroll + rx;
        const next = traps.find((t) => !t.started && t.x > rw - 5);
        if (next && speed > 1) {
          const dur = clamp((h * 0.2 / speed) * 2.4, 0.4, 0.85);
          if (next.x - rw < speed * dur * 0.5 + 4) {
            next.started = true;
            action = { type: next.action, t0: time, dur };
          }
        }
      }
      let pose = running ? 'run' : v.phase === 'crashed' ? 'hands' : 'idle';
      let jumpY = 0;
      if (action) {
        const p = (time - action.t0) / action.dur;
        if (p >= 1 || !running) action = null;
        else if (action.type === 'jump') { pose = 'jump'; jumpY = -Math.sin(Math.PI * p) * h * 0.13; }
        else pose = 'slide';
      }

      ctx.save();
      if (v.phase === 'crashed' && !reduced) {
        const k = 1 - clamp((time - crashTime) / 0.4, 0, 1);
        ctx.translate((Math.random() - 0.5) * h * 0.03 * k, (Math.random() - 0.5) * h * 0.03 * k);
      }

      // zones, clipped where each one starts
      const alarm = running || v.phase === 'crashed' ? (reduced ? 1 : 0.55 + 0.45 * Math.sin(time * TAU * 1.1)) : 0;
      for (let i = 0; i < zones.length; i++) {
        const xa = Math.max(-20, zones[i].start - scroll);
        const xb = i + 1 < zones.length ? Math.min(w + 20, zones[i + 1].start - scroll) : w + 20;
        if (xb <= xa) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(xa, -20, xb - xa, h + 40);
        ctx.clip();
        if (zones[i].type === 'vault') drawVaultBG(ctx, w, h, scroll, floorY, alarm);
        else if (zones[i].type === 'hall') drawHallBG(ctx, w, h, scroll, floorY, alarm);
        else drawStreetBG(ctx, w, h, scroll, floorY, gy, time);
        ctx.restore();
      }
      for (let i = 1; i < zones.length; i++) {
        const gx = zones[i].start - scroll;
        if (gx > -h * 0.3 && gx < w + h * 0.3) drawGate(ctx, gx, h, floorY, zones[i].type);
      }

      // gold stacks in the vault: grabbed as he runs past
      const S = Math.max(220, w * 0.42);
      const startSeg = Math.floor(scroll / S);
      const gbw = Math.max(22, h * 0.075), gbh = gbw * 0.38;
      for (let i = -1; i <= Math.ceil(w / S) + 1; i++) {
        const seg = startSeg + i;
        if (hash(seg, 7) < 0.3 || collected.has(seg)) continue;
        const wx = seg * S + hash(seg, 9) * S * 0.5;
        if (zoneAt(wx) !== 'vault') continue;
        const x = wx - scroll;
        if (running && x < rx + 6 && x > rx - h * 0.4) {
          collected.add(seg);
          for (let k = 0; k < 14; k++) {
            fx.add({ kind: 'spark', x: x + Math.random() * gbw * 2, y: floorY - Math.random() * gbh * 3, tx: rx - 22 * sc, ty: gy - 75 * sc, vx: 0, vy: 0, life: 0.45 + Math.random() * 0.2 });
          }
          continue;
        }
        const tiers = 1 + Math.floor(hash(seg, 11) * 3);
        for (let tIdx = 0; tIdx < tiers; tIdx++) {
          for (let k = 0; k < tiers - tIdx + 1; k++) drawGoldBar(ctx, x + tIdx * gbw * 0.5 + k * gbw * 1.02, floorY + h * 0.02 - tIdx * gbh, gbw, gbh);
        }
      }

      // vault door: drilled during the countdown, swings open at launch
      if (v.phase === 'betting') {
        drawDoor(ctx, doorBase, floorY - doorR * 1.3, doorR, v.betProgress * TAU * 1.25, v.betProgress, 0);
      } else if (running && scroll - scrollAtStart < w * 1.5) {
        drawDoor(ctx, doorBase - (scroll - scrollAtStart), floorY - doorR * 1.3, doorR, 1.25 * TAU, 1, easeOut(v.tPhase / 0.6) * 1.4);
      }

      for (const tr of traps) {
        const x = tr.x - scroll;
        if (x > -w * 0.3 && x < w + w * 0.3) drawTrap(ctx, tr, x, w, h, floorY, gy, rx, time);
      }

      // helicopter spotlight on the street
      if (running && here === 'street' && v.mult > 5) heliOn = Math.min(1, heliOn + dt * 0.8);
      if (heliOn > 0) {
        const hx = rx - w * 0.1 + Math.sin(time * 0.6) * w * 0.05, hy = h * 0.07 - (1 - heliOn) * h * 0.2;
        const sg = ctx.createLinearGradient(hx, hy, rx, gy);
        sg.addColorStop(0, 'rgba(255,250,220,0.3)');
        sg.addColorStop(1, 'rgba(255,250,220,0.08)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(rx + h * 0.13, gy + h * 0.02);
        ctx.lineTo(rx - h * 0.13, gy + h * 0.02);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,250,220,0.16)';
        ctx.beginPath(); ctx.ellipse(rx, gy + h * 0.01, h * 0.14, h * 0.03, 0, 0, TAU); ctx.fill();
        drawHeli(ctx, hx, hy, h * 0.0022, time);
      }

      // chasers join as the escape goes on
      if (running) {
        if (here !== 'vault' && cops.length < 2) cops.push({ kind: 'police', gap: rx + 80, ph: 2.2 });
        if (here === 'street' && cops.length < 3) cops.push({ kind: 'police', gap: rx + 120, ph: 0.6 });
        if (here === 'street' && !car) car = { gap: rx + w * 0.4 };
      }
      const sinceStart = running ? scroll - scrollAtStart : 1e9;
      cops.forEach((c, i) => {
        let tgt;
        if (v.phase === 'crashed') tgt = (i === 0 ? 34 : 34 + i * 26) * sc;
        else tgt = w * (0.13 + 0.2 / Math.sqrt(v.mult)) + i * w * 0.075;
        if (running && i === 0 && sinceStart < w * 0.4) tgt = rx + 80; // guard enters a moment after the alarm
        c.gap = lerp(c.gap, tgt, Math.min(1, dt * (v.phase === 'crashed' ? 3.5 : 1.1)));
        c.ph += dt * (4 + Math.max(speed, v.phase === 'crashed' ? h * 0.4 : 0) / (h * 0.09));
      });

      // police car behind on the road
      if (car) {
        const tgt = v.phase === 'crashed' ? w * 0.2 : w * (0.33 + 0.1 / Math.sqrt(v.mult));
        car.gap = lerp(car.gap, tgt, Math.min(1, dt * 1.2));
      }

      // draw chasers (far ones first)
      for (let i = cops.length - 1; i >= 0; i--) {
        const c = cops[i];
        const cx = rx - c.gap;
        if (cx < -h * 0.3) continue;
        const cy = gy - i * h * 0.012;
        const csc = sc * (1 - i * 0.04);
        const grab = v.phase === 'crashed' && c.gap < 60 * sc;
        if (!grab && v.phase !== 'betting') {
          // flashlight beam
          ctx.fillStyle = 'rgba(255,240,170,0.10)';
          ctx.beginPath();
          ctx.moveTo(cx + 30 * csc, cy - 62 * csc);
          ctx.lineTo(cx + h * 0.42, cy - 110 * csc);
          ctx.lineTo(cx + h * 0.42, cy + 2);
          ctx.closePath();
          ctx.fill();
        }
        drawPerson(ctx, cx, cy, csc, {
          pose: grab ? 'grab' : 'run', ph: c.ph, t: time,
          outfit: c.kind === 'guard' ? OUTFITS.guard : { ...OUTFITS.police, skin: i === 2 ? '#e2b08a' : OUTFITS.police.skin },
          item: grab ? null : 'flashlight',
        });
      }

      // the robber
      if (running) bagR = lerp(bagR, 13 + Math.min(12, Math.log(v.mult) * 6), Math.min(1, dt * 3));
      if (v.phase === 'crashed') {
        // dropped loot bag
        drawBagOnFloor(ctx, rx - 36 * sc, gy, bagR * sc);
      }
      const r = drawPerson(ctx, rx, gy + jumpY, sc, {
        pose, ph, t: time, outfit: OUTFITS.robber,
        bag: v.phase === 'crashed' ? 0 : bagR,
        item: v.phase === 'betting' ? 'drill' : null,
      });

      // drill sparks during the countdown
      if (v.phase === 'betting') {
        const tipX = r.handX + 28 * sc, tipY = r.handY - 2 * sc;
        for (let k = 0; k < 2; k++) {
          if (Math.random() < 0.7) fx.add({ kind: 'drill', x: tipX, y: tipY, vx: -w * (0.05 + Math.random() * 0.15), vy: -h * (Math.random() * 0.5), g: h * 2.2, life: 0.35 + Math.random() * 0.2 });
        }
      }

      if (car) {
        const cx = rx - car.gap;
        if (cx > -h * 0.5) drawPoliceCar(ctx, cx, gy + h * 0.085, h * 0.0034, time, wheel, reduced);
      }

      // a few coins slip out of the bag at high speed
      if (running && v.mult > 2) {
        coinAcc += dt * Math.log(v.mult) * 3;
        while (coinAcc > 1) {
          coinAcc -= 1;
          fx.add({ kind: 'coin', x: rx - 30 * sc, y: gy - 75 * sc + jumpY, vx: -w * (0.02 + Math.random() * 0.06), vy: -h * (0.2 + Math.random() * 0.3), g: h * 2.4, life: 1.4, bounce: 0.4, rot: Math.random() * 6, vr: 10, r: h * 0.011, scroll: 1, floor: gy + (Math.random() - 0.5) * h * 0.03 });
        }
      }

      fx.shift(dx);
      fx.update(dt);
      fx.each((p, k) => {
        if (p.kind === 'coin') {
          ctx.globalAlpha = 1 - Math.max(0, k - 0.75) * 4;
          ctx.fillStyle = C.gold;
          ctx.strokeStyle = C.goldDark;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, Math.max(0.8, p.r * Math.abs(Math.cos(p.rot))), p.r, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else if (p.kind === 'spark') {
          const e = easeOut(k);
          const x = lerp(p.x, p.tx, e), y = lerp(p.y, p.ty, e) - Math.sin(k * Math.PI) * h * 0.06;
          ctx.fillStyle = k < 0.5 ? C.goldLight : C.gold;
          ctx.beginPath(); ctx.arc(x, y, Math.max(1.5, h * 0.007) * (1 - k * 0.5), 0, TAU); ctx.fill();
        } else if (p.kind === 'drill') {
          ctx.strokeStyle = `rgba(255,${Math.round(240 - k * 120)},140,${1 - k})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.02, p.y - p.vy * 0.02);
          ctx.stroke();
        }
      });

      if (v.phase === 'crashed') {
        const tc = time - crashTime;
        if (crashZone === 'vault') {
          // steel cage slams down
          const e = reduced ? 1 : easeOutBack(tc / 0.42);
          const bottom = lerp(-h * 0.1, gy + h * 0.01, e);
          const cageW = h * 0.42;
          const left = rx - cageW / 2;
          for (let i = 0; i <= 8; i++) {
            const x = left + (i / 8) * cageW;
            const g = ctx.createLinearGradient(x - 3, 0, x + 3, 0);
            g.addColorStop(0, C.steelDark);
            g.addColorStop(0.5, C.steel);
            g.addColorStop(1, C.steelDark);
            ctx.fillStyle = g;
            ctx.fillRect(x - Math.max(2, h * 0.007), bottom - h * 1.2, Math.max(4, h * 0.014), h * 1.2);
          }
          ctx.fillStyle = C.steelDark;
          ctx.fillRect(left - 6, bottom - h * 0.42, cageW + 12, Math.max(4, h * 0.016));
          ctx.fillRect(left - 6, bottom - 4, cageW + 12, Math.max(5, h * 0.018));
          const a = reduced ? 0.16 : 0.1 + 0.1 * (0.5 + 0.5 * Math.sin(tc * TAU * 1.1));
          ctx.fillStyle = `rgba(255,40,40,${a})`;
          ctx.fillRect(-20, -20, w + 40, h + 40);
        } else {
          // police lights wash over everything
          const red = reduced ? true : Math.floor(tc * 2.4) % 2 === 0;
          ctx.fillStyle = red ? 'rgba(255,40,60,0.13)' : 'rgba(60,90,255,0.13)';
          ctx.fillRect(-20, -20, w + 40, h + 40);
          // handcuffs pop above the robber
          if (tc > 0.45) {
            const s = easeOutBack((tc - 0.45) / 0.35);
            drawCuffs(ctx, rx + 4 * sc, gy - 150 * sc, h * 0.05 * s);
          }
        }
      } else if (running && here !== 'vault') {
        // red/blue siren tint at the edges
        const red = reduced ? true : Math.floor(time * 2.4) % 2 === 0;
        const eg = ctx.createLinearGradient(0, 0, w * 0.35, 0);
        eg.addColorStop(0, red ? 'rgba(255,40,60,0.22)' : 'rgba(60,90,255,0.22)');
        eg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = eg;
        ctx.fillRect(-20, -20, w * 0.35 + 20, h + 40);
      }

      const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vg;
      ctx.fillRect(-20, -20, w + 40, h + 40);
      ctx.restore();
    },
  };
}

function drawBagOnFloor(ctx, x, y, r) {
  ctx.fillStyle = '#6a421f';
  ctx.strokeStyle = '#3c2510';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.6, r * 1.1, r * 0.7, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
}

function drawCuffs(ctx, x, y, r) {
  if (r <= 0) return;
  ctx.strokeStyle = '#d7dde5';
  ctx.lineWidth = Math.max(2, r * 0.22);
  ctx.beginPath(); ctx.arc(x - r * 0.75, y, r * 0.55, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + r * 0.75, y, r * 0.55, 0, TAU); ctx.stroke();
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.beginPath(); ctx.moveTo(x - r * 0.2, y); ctx.lineTo(x + r * 0.2, y); ctx.stroke();
}
