// Booby traps and obstacles. Each has an action the robber uses to get past it.
import { TAU, clamp, lerp, easeOut, rr } from './util';

export const TRAPS = {
  vault: [['laserLow', 'jump'], ['laserHigh', 'slide'], ['plate', 'jump'], ['laserGrid', 'slide']],
  hall: [['spikes', 'jump'], ['shutter', 'slide'], ['rope', 'jump'], ['cart', 'jump']],
  street: [['barrier', 'jump'], ['spikestrip', 'jump'], ['cones', 'jump'], ['scaffold', 'slide']],
  roof: [['ac', 'jump'], ['line', 'slide'], ['vent', 'jump'], ['line', 'slide']],
};

const INK = 'rgba(6,8,12,0.9)';

function hazard(ctx, x, y, w, h, s = 10) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = '#f2c14e';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111';
  for (let k = -h; k < w + h; k += s) {
    ctx.beginPath(); ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + s / 2, y + h); ctx.lineTo(x + k + s / 2 + h, y); ctx.lineTo(x + k + h, y); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function laserBeam(ctx, x1, y1, x2, y2, width, time, seed) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const a = 0.7 + 0.3 * Math.sin(time * 30 + seed);
  ctx.strokeStyle = `rgba(255,40,80,${0.35 * a})`;
  ctx.lineWidth = width * 5;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = `rgba(255,60,100,${0.9 * a})`;
  ctx.lineWidth = width * 1.6;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,220,230,0.95)';
  ctx.lineWidth = width * 0.6;
  ctx.stroke();
  ctx.restore();
}

function emitter(ctx, px, py, ph, k) {
  ctx.fillStyle = INK;
  rr(ctx, px - 5.5 * k, py - ph - 1, 11 * k, ph + 2, 3);
  ctx.fill();
  ctx.fillStyle = '#2a3036';
  rr(ctx, px - 4.5 * k, py - ph, 9 * k, ph, 2);
  ctx.fill();
  ctx.fillStyle = '#ff2d55';
  ctx.beginPath(); ctx.arc(px, py - ph + 5 * k, 2.6 * k, 0, TAU); ctx.fill();
}

export function drawTrap(ctx, tr, x, info) {
  const { w, h, floorY, gy, rx, time } = info;
  const yB = floorY + 2, yF = gy + (h - gy) * 0.75;
  const xB = x + (gy - yB) * 0.9, xF = x - (yF - gy) * 0.9;
  const kB = 0.82, kF = 1.12;
  const near = clamp((w * 0.5 - (x - rx)) / (w * 0.18), 0, 1);
  const lw = Math.max(2, h * 0.006);
  const s = h * 0.0028; // object scale, matches the characters

  switch (tr.type) {
    case 'laserLow':
    case 'laserHigh': {
      const H = tr.type === 'laserLow' ? h * 0.07 : h * 0.21;
      emitter(ctx, xB, yB, H * kB + 10, kB);
      laserBeam(ctx, xB, yB - H * kB, xF, yF - H * kF, lw, time, tr.x);
      emitter(ctx, xF, yF, H * kF + 10, kF);
      break;
    }
    case 'laserGrid': {
      // three stacked beams up high: slide under them
      const hs = [h * 0.2, h * 0.27, h * 0.34];
      emitter(ctx, xB, yB, hs[2] * kB + 10, kB);
      hs.forEach((H, i) => laserBeam(ctx, xB, yB - H * kB, xF, yF - H * kF, lw * 0.8, time, tr.x + i));
      emitter(ctx, xF, yF, hs[2] * kF + 10, kF);
      break;
    }
    case 'plate': {
      // electrified floor plate
      ctx.fillStyle = '#1a1f24';
      ctx.beginPath(); ctx.moveTo(xB - 16, yB); ctx.lineTo(xB + 16, yB); ctx.lineTo(xF + 22, yF); ctx.lineTo(xF - 22, yF); ctx.closePath(); ctx.fill();
      const pulse = 0.5 + 0.5 * Math.sin(time * 10 + tr.x);
      ctx.fillStyle = `rgba(90,200,255,${0.25 + pulse * 0.35})`;
      ctx.beginPath(); ctx.moveTo(xB - 12, yB + 2); ctx.lineTo(xB + 12, yB + 2); ctx.lineTo(xF + 17, yF - 3); ctx.lineTo(xF - 17, yF - 3); ctx.closePath(); ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(170,230,255,0.9)';
      ctx.lineWidth = 1.6;
      for (let a = 0; a < 3; a++) {
        const seed = Math.floor(time * 20) + a * 7;
        ctx.beginPath();
        let px = lerp(xB, xF, (a + 0.5) / 3), py = lerp(yB, yF, (a + 0.5) / 3);
        ctx.moveTo(px, py);
        for (let k = 0; k < 5; k++) {
          px += Math.sin(seed * 3.1 + k * 7.7) * 6;
          py -= h * 0.018;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
      break;
    }
    case 'spikes':
    case 'spikestrip': {
      const big = tr.type === 'spikes';
      const pop = big ? easeOut(near) : 1;
      if (big) {
        ctx.fillStyle = '#2a2f36';
        ctx.beginPath(); ctx.moveTo(xB - 14, yB); ctx.lineTo(xB + 14, yB); ctx.lineTo(xF + 18, yF); ctx.lineTo(xF - 18, yF); ctx.closePath(); ctx.fill();
      } else {
        ctx.fillStyle = '#e8b030';
        ctx.beginPath(); ctx.moveTo(xB - 6, yB); ctx.lineTo(xB + 6, yB); ctx.lineTo(xF + 9, yF); ctx.lineTo(xF - 9, yF); ctx.closePath(); ctx.fill();
      }
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const px = lerp(xB, xF, u), py = lerp(yB, yF, u);
        const k = lerp(kB, kF, u);
        const sh = (big ? h * 0.075 : h * 0.028) * k * pop;
        for (const dx of big ? [-8, 0, 8] : [-4, 4]) {
          const g = ctx.createLinearGradient(px, py - sh, px, py);
          g.addColorStop(0, '#ffffff');
          g.addColorStop(1, '#5a6470');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.moveTo(px + dx * k - 3.8 * k, py); ctx.lineTo(px + dx * k, py - sh); ctx.lineTo(px + dx * k + 3.8 * k, py); ctx.closePath(); ctx.fill();
        }
      }
      break;
    }
    case 'shutter': {
      const bottom = lerp(-h * 0.1, gy - h * 0.2, easeOut(near));
      const sw = h * 0.055, depth = h * 0.05;
      ctx.fillStyle = '#30363d';
      ctx.beginPath(); ctx.moveTo(x + sw / 2, -10); ctx.lineTo(x + sw / 2 + depth, -10 - depth * 0.6); ctx.lineTo(x + sw / 2 + depth, bottom - depth * 0.6); ctx.lineTo(x + sw / 2, bottom); ctx.closePath(); ctx.fill();
      const g = ctx.createLinearGradient(x - sw / 2, 0, x + sw / 2, 0);
      g.addColorStop(0, '#6c7680'); g.addColorStop(0.5, '#c8d2dc'); g.addColorStop(1, '#5d6670');
      ctx.fillStyle = g;
      ctx.fillRect(x - sw / 2, -10, sw, bottom + 10);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      for (let y = bottom - 8; y > 0; y -= 9) ctx.fillRect(x - sw / 2, y, sw, 2);
      hazard(ctx, x - sw / 2, bottom - h * 0.026, sw, h * 0.026, 10);
      ctx.fillStyle = Math.sin(time * 8) > 0 ? '#ffb347' : '#5a3a10';
      ctx.beginPath(); ctx.arc(x, bottom - h * 0.04, 3, 0, TAU); ctx.fill();
      break;
    }
    case 'rope': {
      // brass stanchions with a velvet rope
      const H = h * 0.1;
      const post = (px, py, k) => {
        ctx.fillStyle = INK;
        rr(ctx, px - 4 * k, py - H * k - 2, 8 * k, H * k + 2, 3);
        ctx.fill();
        const pg = ctx.createLinearGradient(px - 3 * k, 0, px + 3 * k, 0);
        pg.addColorStop(0, '#8a6a2a'); pg.addColorStop(0.5, '#ffe08a'); pg.addColorStop(1, '#8a6a2a');
        ctx.fillStyle = pg;
        ctx.fillRect(px - 2.8 * k, py - H * k, 5.6 * k, H * k);
        ctx.beginPath(); ctx.arc(px, py - H * k, 5 * k, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(px, py, 9 * k, 3 * k, 0, 0, TAU); ctx.fill();
      };
      post(xB, yB, kB);
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 3.2;
      ctx.lineCap = 'round';
      const mx = (xB + xF) / 2, my = (yB - H * kB + yF - H * kF) / 2 + h * 0.04;
      ctx.beginPath(); ctx.moveTo(xB, yB - H * kB + 4); ctx.quadraticCurveTo(mx, my, xF, yF - H * kF + 4); ctx.stroke();
      ctx.strokeStyle = '#b3172b';
      ctx.lineWidth = lw * 2.2;
      ctx.stroke();
      post(xF, yF, kF);
      break;
    }
    case 'cart': {
      // cash trolley loaded with money
      ctx.save();
      ctx.translate(x, gy);
      ctx.scale(s, s);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.ellipse(0, 2, 34, 5, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#9aa3b2';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-30, -10); ctx.lineTo(30, -10); ctx.moveTo(-30, -28); ctx.lineTo(30, -28); ctx.moveTo(26, -28); ctx.lineTo(34, -44); ctx.stroke();
      for (const wx of [-24, 24]) { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(wx, -4, 4.5, 0, TAU); ctx.fill(); }
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
        const bx = -28 + c * 14, by = -30 - r * 7;
        ctx.fillStyle = INK;
        ctx.fillRect(bx - 1, by - 1, 14, 8);
        ctx.fillStyle = '#7fc98a';
        ctx.fillRect(bx, by, 12, 6);
        ctx.fillStyle = '#f2efe6';
        ctx.fillRect(bx + 4, by, 3, 6);
      }
      ctx.restore();
      break;
    }
    case 'barrier': {
      const H = h * 0.11;
      const leg = (px, py, k) => {
        ctx.strokeStyle = '#d7dbe2';
        ctx.lineWidth = 3 * k;
        ctx.beginPath(); ctx.moveTo(px - 10 * k, py); ctx.lineTo(px, py - H * k); ctx.lineTo(px + 10 * k, py); ctx.stroke();
      };
      leg(xB, yB, kB);
      const th = h * 0.034;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xB, yB - H * kB - th * kB); ctx.lineTo(xF, yF - H * kF - th * kF); ctx.lineTo(xF, yF - H * kF); ctx.lineTo(xB, yB - H * kB);
      ctx.closePath();
      ctx.fillStyle = '#f4f4f4';
      ctx.fill();
      ctx.clip();
      ctx.fillStyle = '#e8402f';
      const len = Math.hypot(xF - xB, yF - yB);
      for (let d = 0; d < len + 40; d += 16) {
        const u = d / len;
        const px = lerp(xB, xF, u), py = lerp(yB - H * kB, yF - H * kF, u);
        ctx.beginPath(); ctx.moveTo(px, py - th * 2); ctx.lineTo(px + 8, py - th * 2); ctx.lineTo(px - 4, py + th); ctx.lineTo(px - 12, py + th); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      leg(xF, yF, kF);
      const on = Math.sin(time * 7 + tr.x) > 0;
      ctx.fillStyle = on ? '#ffb347' : '#5a3a10';
      ctx.beginPath(); ctx.arc(xF, yF - H * kF - th * kF - 5, 4, 0, TAU); ctx.fill();
      if (on) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(xF, yF - H * kF - th * kF - 5, 0, xF, yF - H * kF - th * kF - 5, h * 0.05);
        g.addColorStop(0, 'rgba(255,180,70,0.5)');
        g.addColorStop(1, 'rgba(255,180,70,0)');
        ctx.fillStyle = g;
        ctx.fillRect(xF - h * 0.05, yF - H * kF - th * kF - 5 - h * 0.05, h * 0.1, h * 0.1);
        ctx.restore();
      }
      break;
    }
    case 'cones': {
      for (let i = 0; i < 3; i++) {
        const u = i / 2;
        const px = lerp(xB, xF, u), py = lerp(yB, yF, u), k = lerp(kB, kF, u) * h * 0.0032;
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(k, k);
        ctx.fillStyle = INK;
        ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-4.5, -30); ctx.lineTo(4.5, -30); ctx.lineTo(11, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff6a1a';
        ctx.beginPath(); ctx.moveTo(-9.5, -1); ctx.lineTo(-3.5, -29); ctx.lineTo(3.5, -29); ctx.lineTo(9.5, -1); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f2f2f2';
        ctx.fillRect(-6.5, -18, 13, 4);
        ctx.fillRect(-4.8, -25, 9.6, 3);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-13, -2, 26, 3);
        ctx.restore();
      }
      break;
    }
    case 'scaffold': {
      // low scaffold beam with a caution sign: slide under
      const beamY = gy - h * 0.2;
      ctx.strokeStyle = '#8a929e';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(xB, yB); ctx.lineTo(xB, beamY - h * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xF, yF); ctx.lineTo(xF, beamY - h * 0.3); ctx.stroke();
      hazard(ctx, Math.min(xB, xF) - 10, beamY - h * 0.03, Math.abs(xB - xF) + 20, h * 0.03, 12);
      ctx.fillStyle = '#f2c14e';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      const sx = x - h * 0.05, sy = beamY - h * 0.12;
      ctx.beginPath(); ctx.moveTo(sx, sy - h * 0.06); ctx.lineTo(sx + h * 0.06, sy + h * 0.03); ctx.lineTo(sx - h * 0.06, sy + h * 0.03); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.font = `900 ${Math.round(h * 0.045)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', sx, sy);
      break;
    }
    case 'ac': {
      ctx.save();
      ctx.translate(x, gy);
      ctx.scale(s, s);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.ellipse(0, 2, 30, 5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = INK;
      rr(ctx, -27, -34, 54, 35, 4); ctx.fill();
      const g = ctx.createLinearGradient(0, -33, 0, 0);
      g.addColorStop(0, '#9aa3b2'); g.addColorStop(1, '#4a5160');
      ctx.fillStyle = g;
      rr(ctx, -25.5, -32.5, 51, 32, 3); ctx.fill();
      ctx.fillStyle = '#1a1d24';
      ctx.beginPath(); ctx.arc(-6, -17, 11, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#6a7282';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        const a = time * 18 + (i / 4) * TAU;
        ctx.beginPath(); ctx.moveTo(-6, -17); ctx.lineTo(-6 + Math.cos(a) * 9, -17 + Math.sin(a) * 9); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for (let i = 0; i < 4; i++) ctx.fillRect(10, -28 + i * 6, 12, 2.5);
      ctx.restore();
      break;
    }
    case 'vent': {
      ctx.save();
      ctx.translate(x, gy);
      ctx.scale(s, s);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.ellipse(0, 2, 20, 4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = INK;
      rr(ctx, -10, -32, 20, 33, 3); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, -32, 17, 7, 0, 0, TAU); ctx.fill();
      const g = ctx.createLinearGradient(-9, 0, 9, 0);
      g.addColorStop(0, '#5a6170'); g.addColorStop(0.5, '#c2cad6'); g.addColorStop(1, '#4a5160');
      ctx.fillStyle = g;
      ctx.fillRect(-8.5, -31, 17, 31);
      ctx.beginPath(); ctx.ellipse(0, -32, 15.5, 5.5, 0, 0, TAU); ctx.fill();
      // steam
      for (let i = 0; i < 3; i++) {
        const p = (time * 0.8 + i / 3) % 1;
        ctx.fillStyle = `rgba(220,220,235,${0.35 * (1 - p)})`;
        ctx.beginPath(); ctx.arc(Math.sin(p * 6 + i) * 4, -40 - p * 40, 5 + p * 10, 0, TAU); ctx.fill();
      }
      ctx.restore();
      break;
    }
    case 'line': {
      // clothesline with laundry: slide under
      const ly = gy - h * 0.25;
      ctx.strokeStyle = '#3a3040';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(xB, yB); ctx.lineTo(xB, ly - h * 0.1); ctx.moveTo(xF, yF); ctx.lineTo(xF, ly - h * 0.06); ctx.stroke();
      ctx.strokeStyle = '#d8d0c0';
      ctx.lineWidth = 1.5;
      const mx = (xB + xF) / 2, my = ly;
      ctx.beginPath(); ctx.moveTo(xB, ly - h * 0.1); ctx.quadraticCurveTo(mx, my + h * 0.02, xF, ly - h * 0.06); ctx.stroke();
      const cols = ['#e04848', '#4aa3ff', '#ffcf4a', '#59e39a'];
      for (let i = 0; i < 4; i++) {
        const u = 0.15 + i * 0.23;
        const px = lerp(xB, xF, u);
        const py = lerp(ly - h * 0.1, ly - h * 0.06, u) + Math.sin(u * Math.PI) * h * 0.04;
        const sway = Math.sin(time * 4 + i) * 0.15;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(sway);
        ctx.fillStyle = INK;
        ctx.fillRect(-h * 0.03 - 1, -1, h * 0.06 + 2, h * 0.07 + 2);
        ctx.fillStyle = cols[i];
        ctx.fillRect(-h * 0.03, 0, h * 0.06, h * 0.07);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(-h * 0.03, h * 0.035, h * 0.06, 2);
        ctx.restore();
      }
      break;
    }
    default:
      break;
  }
}
