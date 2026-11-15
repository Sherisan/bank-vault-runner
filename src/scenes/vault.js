// Bank Vault Runner: the chase. Draws one frame from the round state `v`.
import { TAU, clamp, lerp, easeOut, easeOutBack, hash, rr, particles } from './util';
import { drawPerson, drawDog, drawBag, OUTFITS } from './people';
import { drawZone, drawGate, ZONE_NAMES } from './zones';
import { drawTrap, TRAPS } from './traps';
import { drawPoliceCar, drawMoto, drawHeli } from './vehicles';
import { sfx } from '../engine/sound';

const C = {
  brass: '#e8b24a', brassDark: '#8c6119',
  gold: '#f7c948', goldDark: '#b07a14', goldLight: '#fff0b8',
  steel: '#b9d0cb', steelDark: '#3d5551',
};
// Where the chase goes as the multiplier climbs.
const ZONE_AT = [
  { min: 1.6, type: 'hall', after: 'vault' },
  { min: 3.2, type: 'street', after: 'hall' },
  { min: 8, type: 'roof', after: 'street' },
];
const CHASER_OUTFIT = { guard: OUTFITS.guard, police: OUTFITS.police, police2: OUTFITS.police2, swat: OUTFITS.swat };
const CHASER_ITEM = { guard: 'flashlight', police: 'flashlight', police2: 'baton', swat: 'shield' };

/* ───────── Set pieces ───────── */

function drawDoor(ctx, cx, cy, R, spin, progress, openAngle, time) {
  if (openAngle > 0) {
    const gl = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.6);
    gl.addColorStop(0, `rgba(255,214,120,${0.65 * Math.min(1, openAngle)})`);
    gl.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = gl;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, TAU); ctx.fill();
  }
  // frame
  ctx.fillStyle = '#061615';
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.16, 0, TAU); ctx.fill();
  const fg = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  fg.addColorStop(0, '#f0c25a'); fg.addColorStop(1, '#6a4512');
  ctx.strokeStyle = fg;
  ctx.lineWidth = R * 0.07;
  ctx.stroke();
  if (openAngle > 0) {
    const gi = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    gi.addColorStop(0, 'rgba(255,236,160,1)');
    gi.addColorStop(0.5, 'rgba(255,200,90,0.8)');
    gi.addColorStop(1, 'rgba(160,100,20,0.4)');
    ctx.fillStyle = gi;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, TAU); ctx.fill();
    // gold mountain inside
    for (let i = 0; i < 7; i++) {
      const bx = cx - R * 0.6 + (i % 4) * R * 0.32 + (i > 3 ? R * 0.16 : 0);
      const by = cy + R * 0.7 - (i > 3 ? R * 0.16 : 0);
      drawGoldBar(ctx, bx, by, R * 0.28, R * 0.11);
    }
  }
  // drill progress ring
  if (progress > 0 && openAngle === 0) {
    ctx.strokeStyle = 'rgba(232,178,74,0.15)';
    ctx.lineWidth = R * 0.07;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, TAU); ctx.stroke();
    ctx.save();
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, -Math.PI / 2, -Math.PI / 2 + progress * TAU);
    ctx.strokeStyle = 'rgba(255,207,74,0.25)';
    ctx.lineWidth = R * 0.16;
    ctx.stroke();
    ctx.strokeStyle = C.brass;
    ctx.lineWidth = R * 0.07;
    ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  const sq = Math.cos(Math.min(openAngle, 1.5));
  ctx.translate(cx - R, cy);
  ctx.scale(sq, 1);
  ctx.translate(R, 0);
  // door thickness when swinging
  if (openAngle > 0) {
    ctx.fillStyle = '#2a3b38';
    ctx.fillRect(-R - R * 0.25 * (1 - sq) * 4, -R * 0.9, R * 0.25 * (1 - sq) * 4, R * 1.8);
  }
  const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
  g.addColorStop(0, '#e2efec');
  g.addColorStop(0.55, '#8aa6a1');
  g.addColorStop(1, '#344a47');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(15,32,30,0.6)';
  ctx.lineWidth = R * 0.022;
  for (const k of [0.84, 0.66, 0.3]) { ctx.beginPath(); ctx.arc(0, 0, R * k, 0, TAU); ctx.stroke(); }
  // locking bolts retract as the drill gets through
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    const out = R * (0.93 + 0.12 * (1 - progress) * (openAngle > 0 ? 0 : 1));
    ctx.fillStyle = '#2f4441';
    ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.92, R * 0.035, 0, TAU); ctx.fill();
    if (openAngle === 0) {
      ctx.strokeStyle = '#c9d6d3';
      ctx.lineWidth = R * 0.045;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.92); ctx.lineTo(Math.cos(a) * out, Math.sin(a) * out); ctx.stroke();
    }
  }
  // combination dial + spokes
  ctx.save();
  ctx.rotate(spin);
  ctx.strokeStyle = C.brass;
  ctx.lineCap = 'round';
  ctx.lineWidth = R * 0.075;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * -R * 0.46, Math.sin(a) * -R * 0.46); ctx.lineTo(Math.cos(a) * R * 0.46, Math.sin(a) * R * 0.46); ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    ctx.fillStyle = '#ffd77a';
    ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.48, Math.sin(a) * R * 0.48, R * 0.075, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = C.brassDark;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.16, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffd77a';
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    ctx.fillRect(Math.cos(a) * R * 0.12 - 0.8, Math.sin(a) * R * 0.12 - 0.8, 1.6, 1.6);
  }
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
  ctx.strokeStyle = 'rgba(80,50,0,0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(x + bw * 0.2, y - bh + 1.5, bw * 0.35, Math.max(1, bh * 0.12));
}

function drawCash(ctx, x, y, bw, bh) {
  ctx.fillStyle = 'rgba(6,8,12,0.85)';
  ctx.fillRect(x - 1, y - bh - 1, bw + 2, bh + 2);
  ctx.fillStyle = '#7fc98a';
  ctx.fillRect(x, y - bh, bw, bh);
  ctx.fillStyle = '#5aa868';
  for (let k = 1; k < 4; k++) ctx.fillRect(x, y - bh + (bh / 4) * k, bw, 0.8);
  ctx.fillStyle = '#f2efe6';
  ctx.fillRect(x + bw * 0.4, y - bh, bw * 0.2, bh);
}

function drawCamera(ctx, x, y, s, angle, time, alarmed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const len = s * 260;
  ctx.rotate(angle);
  const g = ctx.createLinearGradient(0, 0, len, 0);
  g.addColorStop(0, alarmed ? 'rgba(255,40,40,0.35)' : 'rgba(255,60,60,0.18)');
  g.addColorStop(1, 'rgba(255,60,60,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, -len * 0.25); ctx.lineTo(len, len * 0.25); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#1a1d22';
  ctx.fillRect(-s * 4, -s * 18, s * 8, s * 18);
  ctx.rotate(angle);
  ctx.fillStyle = 'rgba(6,8,12,0.9)';
  rr(ctx, -s * 6, -s * 9, s * 34, s * 18, s * 3);
  ctx.fill();
  ctx.fillStyle = '#d8dde4';
  rr(ctx, -s * 5, -s * 8, s * 32, s * 16, s * 3);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(s * 26, 0, s * 6, 0, TAU); ctx.fill();
  ctx.fillStyle = Math.sin(time * 6) > 0 ? '#ff3b3b' : '#4a1010';
  ctx.beginPath(); ctx.arc(s * 2, -s * 4, s * 2, 0, TAU); ctx.fill();
  ctx.restore();
}

// Wall keypad beside the vault: digits scramble and lock in as the drill gets through.
function drawKeypad(ctx, x, y, s, progress, open, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const W = 46, H = 70;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(-W / 2 + 4, -H / 2 + 5, W, H);
  ctx.fillStyle = 'rgba(6,8,12,0.95)';
  rr(ctx, -W / 2 - 1.5, -H / 2 - 1.5, W + 3, H + 3, 6); ctx.fill();
  const g = ctx.createLinearGradient(0, -H / 2, 0, H / 2);
  g.addColorStop(0, '#4a5560'); g.addColorStop(1, '#1e252c');
  ctx.fillStyle = g;
  rr(ctx, -W / 2, -H / 2, W, H, 5); ctx.fill();
  // screen
  ctx.fillStyle = '#04110a';
  rr(ctx, -W / 2 + 4, -H / 2 + 5, W - 8, 16, 2); ctx.fill();
  ctx.font = '700 9px "Chakra Petch", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const code = '739184';
  for (let i = 0; i < 6; i++) {
    const locked = open || progress > (i + 1) / 7;
    const ch = locked ? code[i] : String(Math.floor(hash(Math.floor(time * 18) + i * 13, 7) * 10));
    ctx.fillStyle = locked ? '#59e39a' : '#ffb347';
    ctx.fillText(ch, -W / 2 + 9 + i * 6.3, -H / 2 + 13.5);
  }
  // keys
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const kx = -W / 2 + 8 + c * 11.5, ky = -H / 2 + 27 + r * 9;
    const pressed = !open && progress < 1 && Math.floor(time * 9) % 12 === r * 3 + c;
    ctx.fillStyle = pressed ? '#ffd77a' : '#11161b';
    rr(ctx, kx - 1, ky - 1, 9, 7, 1.5); ctx.fill();
    ctx.fillStyle = pressed ? '#fff4c4' : '#39424c';
    rr(ctx, kx, ky, 7, 5, 1.2); ctx.fill();
  }
  // status
  const ok = open || progress >= 1;
  const blink = Math.floor(time * 6) % 2 === 0;
  ctx.fillStyle = ok ? '#59e39a' : blink ? '#ff4d4d' : '#5a1414';
  ctx.beginPath(); ctx.arc(-W / 2 + 8, H / 2 - 5, 2.4, 0, TAU); ctx.fill();
  ctx.fillStyle = ok ? '#59e39a' : '#ff8a8a';
  ctx.font = '800 6.5px "Chakra Petch", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(ok ? 'OPEN' : 'LOCKED', -W / 2 + 13, H / 2 - 4.8);
  ctx.restore();
  if (ok) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gl = ctx.createRadialGradient(x, y, 0, x, y, 60 * s);
    gl.addColorStop(0, 'rgba(89,227,154,0.25)');
    gl.addColorStop(1, 'rgba(89,227,154,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(x - 60 * s, y - 60 * s, 120 * s, 120 * s);
    ctx.restore();
  }
}

// The hacker's workstation: a rolling cart with a laptop on top and a cracking
// box on the lower shelf. (x, y) = the robber's feet. The laptop is drawn in a
// 3/4 view so its screen faces the player.
function drawHackRig(ctx, x, y, s, time, progress = 0) {
  const INKC = 'rgba(6,8,12,0.95)';
  const L = x + 20 * s, R = x + 66 * s, top = y - 64 * s;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse((L + R) / 2, y + 1, 30 * s, 4 * s, 0, 0, TAU); ctx.fill();
  // legs + casters
  for (const lx of [L + 3 * s, R - 3 * s]) {
    ctx.fillStyle = INKC;
    ctx.fillRect(lx - 2 * s, top, 4 * s, y - top - 4 * s);
    ctx.fillStyle = '#9aa3b2';
    ctx.fillRect(lx - 1 * s, top, 2 * s, y - top - 4 * s);
    ctx.fillStyle = INKC;
    ctx.beginPath(); ctx.arc(lx, y - 3 * s, 3.4 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3a3f4a';
    ctx.beginPath(); ctx.arc(lx, y - 3 * s, 2 * s, 0, TAU); ctx.fill();
  }
  // lower shelf with the cracking box: blinking LEDs and an antenna
  ctx.fillStyle = INKC;
  rr(ctx, L - 1 * s, y - 24 * s, R - L + 2 * s, 4 * s, 1.5 * s); ctx.fill();
  ctx.fillStyle = INKC;
  rr(ctx, L + 6 * s, y - 42 * s, 34 * s, 19 * s, 2.5 * s); ctx.fill();
  const bg = ctx.createLinearGradient(0, y - 41 * s, 0, y - 24 * s);
  bg.addColorStop(0, '#2c313c'); bg.addColorStop(1, '#151820');
  ctx.fillStyle = bg;
  rr(ctx, L + 7 * s, y - 41 * s, 32 * s, 17 * s, 2 * s); ctx.fill();
  for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) {
    const on = hash(Math.floor(time * 10) + r * 7 + c, 151) > 0.45;
    ctx.fillStyle = on ? (r ? '#ffb347' : '#59e39a') : '#1d2a22';
    ctx.fillRect(L + 10 * s + c * 4 * s, y - 37 * s + r * 5 * s, 2.4 * s, 2.4 * s);
  }
  ctx.strokeStyle = INKC;
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath(); ctx.moveTo(L + 36 * s, y - 41 * s); ctx.lineTo(L + 40 * s, y - 54 * s); ctx.stroke();
  ctx.fillStyle = Math.sin(time * 8) > 0 ? '#ff4d4d' : '#4a1010';
  ctx.beginPath(); ctx.arc(L + 40 * s, y - 54 * s, 1.6 * s, 0, TAU); ctx.fill();
  // top tray
  ctx.fillStyle = INKC;
  rr(ctx, L - 2 * s, top - 2 * s, R - L + 4 * s, 6 * s, 2 * s); ctx.fill();
  ctx.fillStyle = '#c9d1dc';
  rr(ctx, L - 1 * s, top - 1 * s, R - L + 2 * s, 3.5 * s, 1.5 * s); ctx.fill();
  // laptop base (3/4 view)
  const b0 = top - 1 * s;
  ctx.fillStyle = INKC;
  ctx.beginPath(); ctx.moveTo(L + 2 * s, b0 + 1 * s); ctx.lineTo(R - 6 * s, b0 + 1 * s); ctx.lineTo(R - 1 * s, b0 - 7 * s); ctx.lineTo(L + 8 * s, b0 - 7 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a3f4c';
  ctx.beginPath(); ctx.moveTo(L + 4 * s, b0); ctx.lineTo(R - 7 * s, b0); ctx.lineTo(R - 3 * s, b0 - 6 * s); ctx.lineTo(L + 9 * s, b0 - 6 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = `rgba(89,227,255,${0.45 + 0.3 * Math.sin(time * 11)})`;
  for (let k = 0; k < 3; k++) ctx.fillRect(L + 9 * s + k * 1.4 * s, b0 - 5 * s + k * 1.6 * s, 26 * s, 0.9 * s);
  // screen, facing the player
  const sL = L + 8 * s, sR = R - 1 * s, sB = b0 - 7 * s, sT = sB - 28 * s, lean = 4 * s;
  ctx.fillStyle = INKC;
  ctx.beginPath(); ctx.moveTo(sL - 1.5 * s, sB + 1 * s); ctx.lineTo(sR + 1.5 * s, sB + 1 * s); ctx.lineTo(sR + lean + 1.5 * s, sT - 1.5 * s); ctx.lineTo(sL + lean - 1.5 * s, sT - 1.5 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a2e38';
  ctx.beginPath(); ctx.moveTo(sL, sB); ctx.lineTo(sR, sB); ctx.lineTo(sR + lean, sT); ctx.lineTo(sL + lean, sT); ctx.closePath(); ctx.fill();
  // display content
  const dL = sL + 2.5 * s, dR = sR - 2.5 * s, dB = sB - 2.5 * s, dT = sT + 2.5 * s;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(dL, dB); ctx.lineTo(dR, dB); ctx.lineTo(dR + lean, dT); ctx.lineTo(dL + lean, dT); ctx.closePath();
  ctx.clip();
  ctx.fillStyle = '#03110c';
  ctx.fillRect(dL, dT, dR - dL + lean, dB - dT);
  for (let i = 0; i < 6; i++) {
    const n = Math.floor(time * 9) + i;
    const yy = dT + 2 * s + i * 3.2 * s;
    const xx = dL + 1.5 * s + lean * (1 - (yy - dT) / (dB - dT));
    ctx.fillStyle = i === 5 ? '#ffb347' : `rgba(89,227,154,${0.5 + 0.4 * hash(n, 152)})`;
    ctx.fillRect(xx, yy, (0.25 + hash(n, 153) * 0.65) * (dR - dL - 4 * s), 1.6 * s);
  }
  ctx.fillStyle = 'rgba(89,227,154,0.25)';
  ctx.fillRect(dL + 1 * s, dB - 4 * s, dR - dL - 2 * s, 2.2 * s);
  ctx.fillStyle = '#59e39a';
  ctx.fillRect(dL + 1 * s, dB - 4 * s, (dR - dL - 2 * s) * Math.min(1, progress), 2.2 * s);
  ctx.restore();
  // screen glow
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const gl = ctx.createRadialGradient((sL + sR) / 2, (sT + sB) / 2, 0, (sL + sR) / 2, (sT + sB) / 2, 40 * s);
  gl.addColorStop(0, 'rgba(89,227,154,0.22)');
  gl.addColorStop(1, 'rgba(89,227,154,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(sL - 40 * s, sT - 40 * s, 120 * s, 100 * s);
  ctx.restore();
  return { portX: R + 1 * s, portY: top + 1 * s, screenX: (sL + sR) / 2 + lean, screenY: sT, legX: R - 3 * s };
}

// Floating hologram above the laptop: code, progress, access granted.
function drawHologram(ctx, rig, s, progress, time) {
  const W = 100 * s, H = 58 * s;
  const bx = rig.screenX - W * 0.18, by = rig.screenY - H - 30 * s;
  const flick = 0.82 + 0.18 * Math.sin(time * 31) * Math.sin(time * 7);
  const done = progress >= 0.97;
  const col = done ? '89,227,154' : '90,230,255';
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // projection beam
  const pg = ctx.createLinearGradient(0, rig.screenY, 0, by + H);
  pg.addColorStop(0, `rgba(${col},0.28)`);
  pg.addColorStop(1, `rgba(${col},0.04)`);
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.moveTo(rig.screenX - 2 * s, rig.screenY); ctx.lineTo(bx + W, by + H); ctx.lineTo(bx, by + H); ctx.lineTo(rig.screenX - 6 * s, rig.screenY); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = flick;
  ctx.fillStyle = `rgba(${col},0.12)`;
  ctx.fillRect(bx, by, W, H);
  ctx.strokeStyle = `rgba(${col},0.8)`;
  ctx.lineWidth = 1.2 * s;
  ctx.strokeRect(bx, by, W, H);
  // corner brackets
  ctx.lineWidth = 2.2 * s;
  for (const [cx, cy, dx, dy] of [[bx, by, 1, 1], [bx + W, by, -1, 1], [bx, by + H, 1, -1], [bx + W, by + H, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(cx + dx * 7 * s, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * 7 * s); ctx.stroke();
  }
  ctx.fillStyle = `rgba(${col},0.95)`;
  ctx.font = `700 ${Math.max(7, Math.round(6.5 * s))}px "Chakra Petch", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('VAULT-OS  //  BREACH', bx + 5 * s, by + 4 * s);
  // scrolling code
  for (let i = 0; i < 5; i++) {
    const n = Math.floor(time * 7) + i;
    const lw = (0.3 + hash(n, 141) * 0.6) * (W - 10 * s);
    ctx.fillStyle = `rgba(${col},${0.35 + 0.3 * hash(n, 142)})`;
    ctx.fillRect(bx + 5 * s + hash(n, 143) * 8 * s, by + 15 * s + i * 5.2 * s, lw, 2.2 * s);
  }
  // progress bar
  const py = by + H - 12 * s;
  ctx.fillStyle = `rgba(${col},0.18)`;
  ctx.fillRect(bx + 5 * s, py, W - 30 * s, 6 * s);
  ctx.fillStyle = `rgba(${col},0.9)`;
  ctx.fillRect(bx + 5 * s, py, (W - 30 * s) * Math.min(1, progress), 6 * s);
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.min(100, Math.floor(progress * 100))}%`, bx + W - 23 * s, py + 3 * s);
  // scan line
  const sy = by + ((time * 0.8) % 1) * H;
  ctx.fillStyle = `rgba(${col},0.25)`;
  ctx.fillRect(bx, sy, W, 1.5 * s);
  if (done) {
    ctx.fillStyle = 'rgba(89,227,154,1)';
    ctx.font = `900 ${Math.max(8, Math.round(9 * s))}px "Chakra Petch", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ACCESS GRANTED', bx + W / 2, by + H * 0.52);
  }
  ctx.restore();
}

// Data cable from the laptop, along the floor and up the wall to the keypad.
function drawCable(ctx, x1, y1, groundY, wallY, x2, y2, s) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x1 + 10 * s, groundY, x1 + 30 * s, groundY - 2 * s);
    ctx.quadraticCurveTo((x1 + x2) / 2, groundY - 4 * s, x2 - 18 * s, wallY + 2 * s);
    ctx.quadraticCurveTo(x2, wallY, x2, y2);
  };
  ctx.strokeStyle = 'rgba(6,8,12,0.95)';
  ctx.lineWidth = 4 * s;
  path(); ctx.stroke();
  ctx.strokeStyle = '#2b6cff';
  ctx.lineWidth = 2.2 * s;
  path(); ctx.stroke();
}

const ZAP_TYPES = new Set(['laserLow', 'laserHigh', 'laserGrid', 'plate']);

// Electric arcs crackling around the robber.
function drawZap(ctx, x, y, s, h) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y - 60 * s, 0, x, y - 60 * s, 90 * s);
  g.addColorStop(0, 'rgba(120,220,255,0.35)');
  g.addColorStop(1, 'rgba(120,220,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 90 * s, y - 150 * s, 180 * s, 180 * s);
  for (let a = 0; a < 7; a++) {
    let px = x + (Math.random() - 0.5) * 50 * s, py = y - Math.random() * 120 * s;
    ctx.strokeStyle = a % 2 ? 'rgba(200,240,255,0.95)' : 'rgba(110,200,255,0.9)';
    ctx.lineWidth = Math.max(1.2, 2 * s);
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let k = 0; k < 5; k++) { px += (Math.random() - 0.5) * 26 * s; py += (Math.random() - 0.5) * 26 * s; ctx.lineTo(px, py); }
    ctx.stroke();
  }
  ctx.restore();
}

// Dizzy stars circling his head after a trip.
function drawStars(ctx, x, y, s, time) {
  for (let i = 0; i < 3; i++) {
    const a = time * 5 + (i / 3) * TAU;
    const sx = x + Math.cos(a) * 18 * s, sy = y + Math.sin(a) * 5 * s;
    const r = (Math.sin(a) > 0 ? 5 : 3.6) * s;
    ctx.fillStyle = 'rgba(6,8,12,0.9)';
    star(ctx, sx, sy, r * 1.35);
    ctx.fillStyle = '#ffd34d';
    star(ctx, sx, sy, r);
  }
}
function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * TAU;
    const rr2 = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2);
  }
  ctx.closePath();
  ctx.fill();
}

// Dark shapes rushing past in front of the camera, for depth.
function drawForeground(ctx, type, w, h, scroll) {
  const P = w * 1.25;
  const s = scroll * 1.8;
  const start = Math.floor(s / P), off = s - start * P;
  for (let k = -1; k <= 1; k++) {
    const n = start + k;
    if (hash(n, 131) < 0.4) continue;
    const x = k * P - off + P * 0.5;
    if (x < -h * 0.4 || x > w + h * 0.4) continue;
    ctx.save();
    ctx.globalAlpha = 0.92;
    if (type === 'vault' || type === 'hall') {
      const pw = h * 0.14;
      const g = ctx.createLinearGradient(x, 0, x + pw, 0);
      const mid = type === 'vault' ? '#10302c' : '#3a2a20';
      g.addColorStop(0, '#020606'); g.addColorStop(0.45, mid); g.addColorStop(1, '#020404');
      ctx.fillStyle = g;
      ctx.fillRect(x, -10, pw, h + 20);
      ctx.fillStyle = type === 'vault' ? 'rgba(232,178,74,0.55)' : 'rgba(214,170,80,0.6)';
      ctx.fillRect(x - 4, h * 0.2, pw + 8, h * 0.02);
      ctx.fillRect(x - 4, h * 0.82, pw + 8, h * 0.02);
    } else if (type === 'street') {
      ctx.fillStyle = '#05060c';
      ctx.fillRect(x, -10, h * 0.035, h + 20);
      ctx.fillRect(x - h * 0.02, h * 0.86, h * 0.075, h * 0.2);
      ctx.fillStyle = 'rgba(255,214,140,0.5)';
      ctx.fillRect(x + h * 0.005, h * 0.3, h * 0.025, h * 0.03);
    } else {
      ctx.fillStyle = '#07040c';
      ctx.fillRect(x, h * 0.62, h * 0.18, h * 0.5);
      ctx.fillRect(x - h * 0.015, h * 0.6, h * 0.21, h * 0.035);
      ctx.fillRect(x + h * 0.14, h * 0.3, h * 0.012, h * 0.32);
      ctx.fillStyle = Math.sin(scroll * 0.01 + n) > 0 ? '#ff4040' : '#4a1010';
      ctx.beginPath(); ctx.arc(x + h * 0.146, h * 0.3, h * 0.008, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}

function drawCuffs(ctx, x, y, r) {
  if (r <= 0) return;
  ctx.save();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = Math.max(2, r * 0.24);
  ctx.beginPath(); ctx.arc(x - r * 0.75, y, r * 0.55, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + r * 0.75, y, r * 0.55, 0, TAU); ctx.stroke();
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.beginPath(); ctx.moveTo(x - r * 0.2, y); ctx.lineTo(x + r * 0.2, y); ctx.stroke();
  ctx.restore();
}

function drawNet(ctx, cx, bottom, W, H) {
  // knotted rope mesh, gathered at a steel ring on top, weighted along the bottom
  const rows = 7, cols = 10;
  const P = (u, v) => {
    const wv = W * (0.1 + 0.9 * Math.pow(Math.sin(v * Math.PI / 2), 0.75));
    return [cx + (u - 0.5) * wv, bottom - H + v * H + Math.sin(u * Math.PI) * v * H * 0.06];
  };
  const line = (pts, width, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const verts = [], horiz = [];
  for (let c = 0; c <= cols; c++) { const pts = []; for (let r = 0; r <= rows; r++) pts.push(P(c / cols, r / rows)); verts.push(pts); }
  for (let r = 1; r <= rows; r++) { const pts = []; for (let c = 0; c <= cols; c++) pts.push(P(c / cols, r / rows)); horiz.push(pts); }
  for (const pts of [...verts, ...horiz]) line(pts, 3.6, 'rgba(6,8,12,0.85)');
  for (const pts of [...verts, ...horiz]) line(pts, 2, '#d8c79a');
  // knots
  ctx.fillStyle = '#8a7444';
  for (let r = 1; r <= rows; r++) for (let c = 0; c <= cols; c++) { const [x, y] = P(c / cols, r / rows); ctx.beginPath(); ctx.arc(x, y, 1.9, 0, TAU); ctx.fill(); }
  // heavier rim rope
  line(horiz[rows - 1], 5, 'rgba(6,8,12,0.9)');
  line(horiz[rows - 1], 3.2, '#e6d6a6');
  // ring and weights
  const [rx0, ry0] = P(0.5, 0);
  ctx.strokeStyle = 'rgba(6,8,12,0.9)';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(rx0, ry0 - 4, 5.5, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#a9b3c2';
  ctx.lineWidth = 2.8;
  ctx.stroke();
  for (let c = 0; c <= cols; c += 2) {
    const [x, y] = P(c / cols, 1);
    ctx.fillStyle = 'rgba(6,8,12,0.9)';
    ctx.beginPath(); ctx.arc(x, y + 2, 5, 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(x - 1.5, y, 0.5, x, y + 2, 4);
    g.addColorStop(0, '#9aa3b2'); g.addColorStop(1, '#3a404c');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y + 2, 3.8, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/* ───────── Scene ───────── */

export function createVaultScene() {
  let scroll = 0, speed = 0, ph = 0, time = 0, wheel = 0;
  let lastPhase = null, lastRound = -1, scrollAtStart = 0, crashTime = -10, crashZone = 'vault', launchTime = -10;
  let zones = [{ start: -1e12, type: 'vault' }];
  let traps = [], nextTrapX = 0, action = null;
  let collected = new Set();
  let chasers = [], car = null, moto = null, heliOn = 0, bagR = 15, coinAcc = 0, billAcc = 0;
  let shake = 0, flash = 0, banner = null, lastHere = 'vault', rain = 0, slamDone = false;
  let bagAt = null; // where the loot bag was drawn last frame: pickups fly into it
  let heliT0 = 0, heliLock = 0, heliSpot = null, spotted = false, car2 = null, cuffed = false;
  let dashT = -10, crashCause = 'police', caughtTrap = null;
  const fx = particles();

  const zoneAt = (wx) => {
    let z = zones[0].type;
    for (const zn of zones) if (wx >= zn.start) z = zn.type;
    return z;
  };
  const addChaser = (kind, gap) => chasers.push({ kind, gap, ph: Math.random() * 6 });
  const hasKind = (kind) => chasers.some((c) => c.kind === kind);

  return {
    draw(ctx, w, h, v, dt, reduced) {
      time += dt;
      const floorY = h * 0.74;
      const gy = floorY + (h - floorY) * 0.45;
      const sc = h * 0.0026;
      const rx = w * 0.42;
      const doorR = h * 0.21;
      const doorBase = rx + h * 0.54;
      const doorY = floorY - doorR * 1.22;

      /* phase changes */
      if (v.phase !== lastPhase || v.roundId !== lastRound) {
        if (v.phase === 'running') {
          scrollAtStart = scroll;
          zones = [{ start: -1e12, type: 'vault' }];
          traps = [];
          nextTrapX = scroll + w * 1.25;
          collected = new Set();
          chasers = [];
          addChaser('guard', rx + 120);
          car = null; moto = null; car2 = null; heliOn = 0; action = null; lastHere = 'vault';
          launchTime = time;
          if (!reduced) { shake = 0.7; flash = 0.85; }
          // the door blows open
          for (let i = 0; i < (reduced ? 6 : 26); i++) {
            const a = Math.random() * TAU;
            fx.add({ kind: 'smoke', x: doorBase + Math.cos(a) * doorR * 0.8, y: doorY + Math.sin(a) * doorR * 0.8, vx: Math.cos(a) * h * 0.25 - w * 0.1, vy: Math.sin(a) * h * 0.18 - h * 0.05, drag: 2.2, life: 1.2 + Math.random() * 0.8, r: h * (0.04 + Math.random() * 0.05), scroll: 1 });
          }
          for (let i = 0; i < (reduced ? 4 : 18); i++) {
            fx.add({ kind: 'debris', x: doorBase, y: doorY, vx: (Math.random() - 0.3) * w * 0.8, vy: -h * (0.4 + Math.random() * 0.9), g: h * 3, life: 1.6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 20, r: h * (0.008 + Math.random() * 0.014), bounce: 0.3, floor: gy + (Math.random() - 0.5) * h * 0.05, scroll: 1 });
          }
        }
        if (v.phase === 'crashed' && lastPhase === 'running') {
          crashTime = time;
          crashZone = zoneAt(scroll + rx);
          crashCause = Math.random() < 0.5 ? 'trap' : 'police';
          caughtTrap = null;
          if (crashCause === 'trap') {
            const opts = TRAPS[crashZone];
            const [type] = opts[Math.floor(Math.random() * opts.length)];
            caughtTrap = { x: scroll + rx + 6, type, action: 'jump', started: true, hit: true };
            traps.push(caughtTrap);
            const zap = ZAP_TYPES.has(type);
            banner = { name: zap ? 'ZAPPED!' : 'TRIPPED A TRAP!', t0: time, red: true };
            if (zap) sfx.zap?.(); else sfx.slide?.();
          }
          action = null;
          slamDone = false;
          cuffed = false;
          car2 = null;
          if (!reduced) shake = 1;
          for (let i = 0; i < (reduced ? 8 : 30); i++) {
            fx.add({ kind: 'coin', x: rx - 20 * sc, y: gy - 60 * sc, vx: (Math.random() - 0.6) * w * 0.35, vy: -h * (0.3 + Math.random() * 0.6), g: h * 2.6, life: 2.8, bounce: 0.45, rot: Math.random() * 6, vr: 8 + Math.random() * 10, r: h * 0.012, floor: gy + (Math.random() - 0.5) * h * 0.03 });
          }
          for (let i = 0; i < (reduced ? 4 : 14); i++) {
            fx.add({ kind: 'bill', x: rx - 20 * sc, y: gy - 70 * sc, vx: (Math.random() - 0.5) * w * 0.25, vy: -h * (0.3 + Math.random() * 0.4), g: h * 0.35, drag: 1.2, life: 3, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 8, r: h * 0.018 });
          }
        }
        if (v.phase === 'betting') {
          fx.clear();
          zones = [{ start: -1e12, type: 'vault' }];
          traps = []; chasers = []; car = null; moto = null; car2 = null; heliOn = 0; bagR = 15; banner = null; lastHere = 'vault';
        }
        lastPhase = v.phase;
        lastRound = v.roundId;
      }

      const running = v.phase === 'running';
      const crashed = v.phase === 'crashed';
      const target = running ? w * (0.36 + 0.42 * clamp(Math.log(v.mult) / Math.log(10), 0, 1.8)) : 0;
      speed = lerp(speed, target, Math.min(1, dt * (crashed ? 9 : 3)));
      const dx = speed * dt;
      scroll += dx;
      ph += dt * (4 + speed / (h * 0.09));
      wheel += dx / (h * 0.045);

      /* new zones open up as the multiplier climbs */
      if (running) {
        const last = zones[zones.length - 1].type;
        for (const z of ZONE_AT) {
          if (v.mult >= z.min && last === z.after) zones.push({ start: scroll + w + h * 0.15, type: z.type });
        }
      }
      const here = zoneAt(scroll + rx);
      if (running && here !== lastHere) {
        banner = { name: ZONE_NAMES[here], t0: time };
        lastHere = here;
        sfx.zone?.();
      }

      /* booby traps ahead */
      if (running) {
        while (nextTrapX < scroll + w * 1.3) {
          const zt = zoneAt(nextTrapX);
          const nearGate = zones.some((zn) => Math.abs(zn.start - nextTrapX) < h * 0.45);
          if (!nearGate) {
            const opts = TRAPS[zt];
            const [type, act] = opts[Math.floor(Math.random() * opts.length)];
            traps.push({ x: nextTrapX, type, action: act, started: false });
          }
          nextTrapX += Math.max(w * 0.5, speed * 0.95) + Math.random() * w * 0.45;
        }
      }
      traps = traps.filter((t) => t.x - scroll > -w * 0.5);

      /* the robber reacts to the next trap */
      if (running && !action) {
        const rw = scroll + rx;
        const next = traps.find((t) => !t.started && t.x > rw - 5);
        if (next && speed > 1) {
          const dur = clamp((h * 0.2 / speed) * 2.4, 0.4, 0.85);
          if (next.x - rw < speed * dur * 0.5 + 4) {
            next.started = true;
            action = { type: next.action, t0: time, dur };
            if (next.action === 'jump') sfx.jump?.(); else sfx.slide?.();
          }
        }
      }
      let pose = running ? 'run' : crashed ? 'hands' : 'type';
      let jumpY = 0;
      if (action) {
        const p = (time - action.t0) / action.dur;
        if (p >= 1 || !running) {
          if (action.type === 'jump' && running) {
            for (let k = 0; k < 6; k++) fx.add({ kind: 'dust', x: rx + (Math.random() - 0.5) * 30 * sc, y: gy, vx: -speed * 0.3 + (Math.random() - 0.5) * h * 0.2, vy: -h * Math.random() * 0.1, drag: 3, life: 0.5, r: h * 0.02, scroll: 1 });
          }
          action = null;
        } else if (action.type === 'jump') { pose = 'jump'; jumpY = -Math.sin(Math.PI * p) * h * 0.16; }
        else {
          pose = 'slide';
          if (Math.random() < 0.6) fx.add({ kind: 'spark', x: rx + 20 * sc, y: gy - 2, vx: -h * (0.3 + Math.random() * 0.4), vy: -h * Math.random() * 0.3, g: h * 2, life: 0.3 });
        }
      }

      /* draw */
      ctx.save();
      shake = Math.max(0, shake - dt * 2.2);
      if (shake > 0) ctx.translate((Math.random() - 0.5) * h * 0.035 * shake, (Math.random() - 0.5) * h * 0.035 * shake);

      const alarm = running || crashed ? (reduced ? 1 : 0.55 + 0.45 * Math.sin(time * TAU * 1.1)) : 0;
      for (let i = 0; i < zones.length; i++) {
        const xa = Math.max(-30, zones[i].start - scroll);
        const xb = i + 1 < zones.length ? Math.min(w + 30, zones[i + 1].start - scroll) : w + 30;
        if (xb <= xa) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(xa, -30, xb - xa, h + 60);
        ctx.clip();
        drawZone(ctx, zones[i].type, w, h, scroll, floorY, gy, time, alarm);
        ctx.restore();
      }
      for (let i = 1; i < zones.length; i++) {
        const gx = zones[i].start - scroll;
        if (gx > -h * 0.4 && gx < w + h * 0.4) drawGate(ctx, gx, h, floorY, zones[i].type, time);
      }

      // floating dust in the vault and hall
      if (here === 'vault' || here === 'hall') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 36; i++) {
          const px = ((hash(i, 81) * w * 1.4 - scroll * 0.35 + Math.sin(time * 0.4 + i) * 20) % (w * 1.4) + w * 1.4) % (w * 1.4) - w * 0.2;
          const py = hash(i, 82) * floorY + Math.sin(time * 0.7 + i * 2) * 10;
          ctx.fillStyle = `rgba(255,230,170,${0.12 + 0.18 * hash(i, 83)})`;
          ctx.fillRect(px, py, 2, 2);
        }
        ctx.restore();
      }

      // loot lying around: gold bars in the vault, cash bricks in the hall
      const S = Math.max(220, w * 0.42);
      const startSeg = Math.floor(scroll / S);
      const gbw = Math.max(22, h * 0.075), gbh = gbw * 0.38;
      for (let i = -1; i <= Math.ceil(w / S) + 1; i++) {
        const seg = startSeg + i;
        if (hash(seg, 7) < 0.3 || collected.has(seg)) continue;
        const wx = seg * S + hash(seg, 9) * S * 0.5;
        const zt = zoneAt(wx);
        if (zt !== 'vault' && zt !== 'hall') continue;
        const x = wx - scroll;
        if (running && x < rx + 6 && x > rx - h * 0.4) {
          collected.add(seg);
          sfx.coin?.();
          for (let k = 0; k < 16; k++) {
            fx.add({ kind: 'homing', vx: 0, vy: 0, x: x + Math.random() * gbw * 2, y: floorY - Math.random() * gbh * 3, tx: rx - 26 * sc, ty: gy - 70 * sc, life: 0.45 + Math.random() * 0.25, gold: zt === 'vault' });
          }
          continue;
        }
        const tiers = 1 + Math.floor(hash(seg, 11) * 3);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const gl = ctx.createRadialGradient(x + gbw, floorY, 0, x + gbw, floorY, gbw * 2.4);
        gl.addColorStop(0, zt === 'vault' ? 'rgba(255,200,80,0.28)' : 'rgba(120,255,160,0.18)');
        gl.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(x - gbw * 1.4, floorY - gbw * 2.4, gbw * 4.8, gbw * 4.8);
        ctx.restore();
        for (let tIdx = 0; tIdx < tiers; tIdx++) {
          for (let k = 0; k < tiers - tIdx + 1; k++) {
            const bx = x + tIdx * gbw * 0.5 + k * gbw * 1.02, by = floorY + h * 0.02 - tIdx * gbh;
            if (zt === 'vault') drawGoldBar(ctx, bx, by, gbw, gbh);
            else drawCash(ctx, bx, by, gbw * 0.9, gbh * 0.9);
          }
        }
      }

      // betting: the security camera pans and the robber hacks the vault
      let rig = null;
      if (v.phase === 'betting') {
        drawCamera(ctx, w * 0.1, h * 0.12, h * 0.0024, 0.6 + Math.sin(time * 0.8) * 0.35, time, false);
        drawDoor(ctx, doorBase, doorY, doorR, v.betProgress * TAU * 1.5, v.betProgress, 0, time);
        drawKeypad(ctx, doorBase + doorR * 1.5, doorY - doorR * 0.15, h * 0.0024, v.betProgress, false, time);
        rig = drawHackRig(ctx, rx, gy, sc, time, v.betProgress);
        drawCable(ctx, rig.portX, rig.portY, gy - 2 * sc, floorY + 3, doorBase + doorR * 1.5, doorY - doorR * 0.15 + 37 * h * 0.0024, sc);
      } else if (running && scroll - scrollAtStart < w * 1.6) {
        const dx0 = doorBase - (scroll - scrollAtStart);
        drawDoor(ctx, dx0, doorY, doorR, 1.5 * TAU, 1, easeOut((time - launchTime) / 0.5) * 1.5, time);
        drawKeypad(ctx, dx0 + doorR * 1.5, doorY - doorR * 0.15, h * 0.0024, 1, true, time);
        const rg = drawHackRig(ctx, rx - (scroll - scrollAtStart), gy, sc, time, 1);
        drawCable(ctx, rg.portX, rg.portY, gy - 2 * sc, floorY + 3, dx0 + doorR * 1.5, doorY - doorR * 0.15 + 37 * h * 0.0024, sc);
      }

      const info = { w, h, floorY, gy, rx, time };
      for (const tr of traps) {
        const x = tr.x - scroll;
        if (x > -w * 0.3 && x < w * 1.3) drawTrap(ctx, tr, x, info);
      }

      /* helicopter: its searchlight sweeps for the robber, then locks on */
      const wantHeli = (running && ((here === 'street' && v.mult > 4) || here === 'roof')) || (crashed && heliOn > 0);
      if (wantHeli && heliOn === 0) { heliT0 = time; spotted = false; }
      heliOn = clamp(heliOn + dt * (wantHeli ? 0.7 : -0.5), 0, 1);
      let heliX = 0, heliY = 0, beam = null;
      if (heliOn > 0) {
        heliX = rx - w * 0.04 + Math.sin(time * 0.5) * w * 0.08;
        heliY = h * 0.11 - (1 - easeOut(heliOn)) * h * 0.3 + Math.sin(time * 1.7) * h * 0.008;
        const lockT = crashed ? 1 : clamp((time - heliT0 - 2.4) / 2.6, 0, 1);
        heliLock = lerp(heliLock, lockT, Math.min(1, dt * 3));
        const wander = (Math.sin(time * 1.25) * 0.6 + Math.sin(time * 2.7 + 1) * 0.4) * w * 0.34;
        const tx = rx + wander * (1 - heliLock);
        heliSpot = heliSpot === null ? tx : lerp(heliSpot, tx, Math.min(1, dt * 4));
        const spotY = gy + h * 0.01 + Math.sin(time * 1.9) * h * 0.02 * (1 - heliLock);
        const R = h * (0.13 - 0.025 * heliLock);
        const a = heliOn * (0.55 + 0.45 * heliLock);
        const lx = heliX + h * 0.068, ly = heliY + h * 0.045;
        beam = { x: heliSpot, y: spotY, R, a, on: Math.abs(heliSpot - rx) < R * 0.8 };
        if (running && !spotted && heliLock > 0.92) {
          spotted = true;
          banner = { name: 'SPOTTED!', t0: time, red: true };
        }
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const bg = ctx.createLinearGradient(lx, ly, heliSpot, spotY);
        bg.addColorStop(0, `rgba(255,250,225,${0.42 * a})`);
        bg.addColorStop(1, `rgba(255,250,225,${0.07 * a})`);
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.moveTo(lx - 3, ly); ctx.lineTo(heliSpot + R, spotY); ctx.lineTo(heliSpot - R, spotY); ctx.lineTo(lx + 3, ly); ctx.closePath(); ctx.fill();
        // dust and rain catching the light
        for (let i = 0; i < 16; i++) {
          const u = (hash(i, 120) + time * 0.15) % 1;
          const px = lerp(lx, heliSpot + (hash(i, 121) - 0.5) * R * 1.8, u);
          const py = lerp(ly, spotY, u);
          ctx.fillStyle = `rgba(255,255,240,${0.35 * a * (1 - u * 0.5)})`;
          ctx.fillRect(px, py, 2, 2);
        }
        const pool = ctx.createRadialGradient(heliSpot, spotY, 0, heliSpot, spotY, R * 1.15);
        pool.addColorStop(0, `rgba(255,252,232,${0.5 * a})`);
        pool.addColorStop(0.7, `rgba(255,252,232,${0.2 * a})`);
        pool.addColorStop(1, 'rgba(255,252,232,0)');
        ctx.fillStyle = pool;
        ctx.beginPath(); ctx.ellipse(heliSpot, spotY, R * 1.15, R * 0.3, 0, 0, TAU); ctx.fill();
        ctx.restore();
        drawHeli(ctx, heliX, heliY, h * 0.0026, time, reduced);
      } else { heliSpot = null; heliLock = 0; }

      /* chasers join as the escape goes on */
      if (running) {
        if (!hasKind('dog') && v.mult >= 1.25) addChaser('dog', rx + 160);
        if (here !== 'vault' && !hasKind('police')) addChaser('police', rx + 140);
        if ((here === 'street' || here === 'roof') && !hasKind('police2')) addChaser('police2', rx + 160);
        if ((here === 'street' || here === 'roof') && !hasKind('swat')) addChaser('swat', rx + 180);
        if (here === 'street' && !car) car = { gap: rx + w * 0.7 };
        if (here === 'street' && !moto && v.mult >= 4) moto = { gap: rx + w * 0.5 };
      }
      const sinceStart = running ? scroll - scrollAtStart : 1e9;
      const onFoot = chasers.filter((c) => c.kind !== 'dog');
      const tcr = crashed ? time - crashTime : 0;
      chasers.forEach((c) => {
        const i = onFoot.indexOf(c);
        let tgt;
        if (crashed) tgt = c.kind === 'dog' ? -64 * sc : (i === 0 ? 26 : 78 + (i - 1) * 48) * sc;
        else if (c.kind === 'dog') {
          tgt = w * (0.2 + 0.08 / Math.sqrt(v.mult));
          c.bite = 0;
          if (running && sinceStart > w * 0.6) {
            if (c.nextLunge === undefined) c.nextLunge = time + 1.2;
            if (action) { c.lunge0 = -10; if (time > c.nextLunge - 0.8) c.nextLunge = time + 0.8; }
            else if (time > c.nextLunge) { c.lunge0 = time; c.nextLunge = time + 3 + Math.random() * 2.5; c.dashed = false; }
            const L = (time - (c.lunge0 ?? -10)) / 1.0;
            if (L >= 0 && L < 1) {
              const k = Math.sin(L * Math.PI);
              tgt = lerp(tgt, 50 * sc, k);
              c.bite = k;
              if (!c.dashed && L > 0.4) {
                c.dashed = true;
                dashT = time;
                sfx.bark?.();
                for (let q = 0; q < 6; q++) fx.add({ kind: 'dust', x: rx, y: gy, vx: -speed * 0.4 - Math.random() * h * 0.2, vy: -h * Math.random() * 0.12, drag: 3, life: 0.6, r: h * 0.02, scroll: 1 });
              }
            }
          }
        }
        else tgt = w * (0.3 + 0.12 / Math.sqrt(v.mult)) + i * w * 0.075;
        if (running && c.kind === 'guard' && sinceStart < w * 0.4) tgt = rx + 120; // a moment after the alarm
        c.gap = lerp(c.gap, tgt, Math.min(1, dt * (crashed ? 3.5 : c.kind === 'dog' ? 3 : 1.1)));
        c.ph += dt * (4 + Math.max(speed, crashed ? h * 0.4 : 0) / (h * 0.09)) * (c.kind === 'dog' ? 1.4 : 1);
      });
      if (car) {
        const tgt = here === 'roof' && !crashed ? rx + w * 1.2 : crashed ? w * 0.36 : w * (0.5 + 0.06 / Math.sqrt(v.mult));
        car.gap = lerp(car.gap, tgt, Math.min(1, dt * 1.2));
      }
      if (moto) {
        const tgt = here === 'roof' && !crashed ? rx + w : crashed ? w * 0.22 : w * (0.3 + 0.06 / Math.sqrt(v.mult));
        moto.gap = lerp(moto.gap, tgt, Math.min(1, dt * 1.4));
      }

      // a second squad car skids in from the right to box him in (street arrest)
      if (crashed && crashZone === 'street') {
        if (!car2) car2 = { x: w + h * 0.9, v: w * 2.2 };
        const stopX = rx + h * 0.62;
        const brake = car2.x - stopX;
        car2.v = Math.max(0, Math.min(car2.v, brake * 5));
        car2.x -= car2.v * dt;
        if (car2.v > w * 0.2 && !reduced) {
          for (let k = 0; k < 2; k++) fx.add({ kind: 'smoke', x: car2.x + h * 0.25 + (Math.random() - 0.5) * h * 0.4, y: gy + h * 0.11, vx: w * 0.1, vy: -h * 0.12, drag: 2, life: 0.9, r: h * 0.03 });
        }
      }

      // draw chasers, far ones first
      const order = crashed ? [...chasers].sort((a, b) => { const da = a.kind === 'dog' ? 9 : [0, -0.045, 0.03, -0.02][onFoot.indexOf(a) % 4]; const db = b.kind === 'dog' ? 9 : [0, -0.045, 0.03, -0.02][onFoot.indexOf(b) % 4]; return da - db; }) : [...chasers].sort((a, b) => b.gap - a.gap);
      order.forEach((c) => {
        const cx = rx - c.gap;
        if (cx < -h * 0.35) return;
        const i = onFoot.indexOf(c);
        const depth = crashed && c.kind !== 'dog' ? [0, -0.045, 0.03, -0.02][i % 4] : -i * 0.02;
        const cy = gy - (c.kind === 'dog' ? -h * 0.025 : -depth * h);
        const csc = sc * (crashed && c.kind !== 'dog' ? 1 + depth * 2.2 : 1 - Math.max(0, i) * 0.05);
        if (c.kind === 'dog') {
          const facingLeft = crashed && c.gap < 0;
          if (facingLeft) { ctx.save(); ctx.translate(cx, cy); ctx.scale(-1, 1); drawDog(ctx, 0, 0, csc * 0.95, { ph: c.ph, t: time, pose: Math.abs(c.gap + 64 * sc) < 30 * sc ? 'bark' : 'run' }); ctx.restore(); }
          else drawDog(ctx, cx, cy, csc * 0.95, { ph: c.ph, t: time, pose: 'run', bite: c.bite || 0 });
          return;
        }
        const grab = crashed && i === 0 && c.gap < 60 * sc;
        const settled = crashed && !grab && Math.abs(c.gap - (78 + (i - 1) * 48) * sc) < 24 * sc;
        const item = grab ? null : CHASER_ITEM[c.kind];
        if (item === 'flashlight' && v.phase !== 'betting') {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const fg = ctx.createLinearGradient(cx, 0, cx + h * 0.5, 0);
          fg.addColorStop(0, 'rgba(255,240,170,0.18)');
          fg.addColorStop(1, 'rgba(255,240,170,0)');
          ctx.fillStyle = fg;
          ctx.beginPath(); ctx.moveTo(cx + 34 * csc, cy - 64 * csc); ctx.lineTo(cx + h * 0.5, cy - 120 * csc); ctx.lineTo(cx + h * 0.5, cy + 4); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        drawPerson(ctx, cx, cy, csc, { pose: grab ? 'grab' : settled ? 'point' : 'run', ph: c.ph, t: time, outfit: CHASER_OUTFIT[c.kind], item });
      });

      // rooftop arrest: SWAT abseils down from the helicopter
      if (crashed && crashZone === 'roof' && heliOn > 0) {
        const p = reduced ? 1 : easeOut(clamp((tcr - 0.35) / 0.8, 0, 1));
        const swx = rx + h * 0.24, top = heliY + h * 0.04;
        const feet = lerp(top + h * 0.2, gy, p);
        ctx.strokeStyle = 'rgba(30,26,20,0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(heliX + h * 0.02, top); ctx.lineTo(swx + 6 * sc, feet - 100 * sc); ctx.stroke();
        drawPerson(ctx, swx, feet, sc, { pose: p < 1 ? 'jump' : 'idle', t: time, outfit: OUTFITS.swat, facing: -1, item: p < 1 ? null : 'shield' });
      }

      /* the robber */
      if (running) bagR = lerp(bagR, 15 + Math.min(15, Math.log(v.mult) * 6), Math.min(1, dt * 3));
      if (crashed) drawBag(ctx, rx + 46 * sc, gy - bagR * sc * 1.05, bagR * sc, time, { fill: 1 });
      // motion streaks behind him at speed
      if (running && speed > w * 0.55 && !reduced) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 6; k++) {
          const yy = gy + jumpY - (20 + k * 16) * sc;
          const len = (speed / w) * h * (0.15 + hash(k + Math.floor(time * 8), 91) * 0.2);
          ctx.strokeStyle = `rgba(255,230,170,${0.10 + 0.1 * hash(k, 92)})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(rx - 30 * sc, yy); ctx.lineTo(rx - 30 * sc - len, yy); ctx.stroke();
        }
        ctx.restore();
      }
      const dk = (time - dashT) / 0.7;
      const dashOff = running && dk >= 0 && dk < 1 ? Math.sin(dk * Math.PI) * 34 * sc : 0;
      const kneelAt = crashCause === 'trap' ? 0.95 : 0.55;
      const zapped = crashed && crashCause === 'trap' && caughtTrap && ZAP_TYPES.has(caughtTrap.type);
      let shakeX = 0;
      if (crashed) {
        if (tcr > kneelAt) pose = 'kneel';
        else if (crashCause === 'trap') {
          if (zapped) { pose = 'hands'; shakeX = (Math.random() - 0.5) * 7 * sc; }
          else pose = 'slide';
        }
      }
      const r = drawPerson(ctx, rx + dashOff + shakeX, gy + jumpY, sc * 0.88, {
        pose, ph, t: time, outfit: OUTFITS.robber,
        bag: crashed ? 0 : bagR,
        bagFill: clamp(Math.log(Math.max(1, v.mult)) / Math.log(20), 0, 1),
        bagTag: running && v.stake > 0 ? '+' + (v.stake * v.mult).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null,
        item: null,
      });
      bagAt = crashed ? null : [r.bagX, r.bagY];
      // caught in the searchlight
      if (beam && beam.on) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const lg = ctx.createRadialGradient(rx, gy - 60 * sc, 0, rx, gy - 60 * sc, 90 * sc);
        lg.addColorStop(0, `rgba(255,250,225,${0.22 * beam.a})`);
        lg.addColorStop(1, 'rgba(255,250,225,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(rx - 90 * sc, gy - 150 * sc, 180 * sc, 180 * sc);
        ctx.restore();
      }
      // handcuffs snap on
      if (crashed && crashCause === 'trap' && tcr < 2.6) {
        if (zapped && tcr < 1) drawZap(ctx, rx, gy, sc, h);
        else if (!zapped && tcr > 0.2) drawStars(ctx, r.headX, r.headY - 22 * sc, sc, time);
      }
      if (crashed && tcr > kneelAt) {
        if (!cuffed) { cuffed = true; sfx.cuffs?.(); for (let k = 0; k < 8; k++) fx.add({ kind: 'spark', x: r.handX, y: r.handY, vx: (Math.random() - 0.5) * h * 0.6, vy: -h * Math.random() * 0.5, g: h * 2, life: 0.35 }); }
        drawCuffs(ctx, r.handX, r.handY, h * 0.018 * easeOutBack(clamp((tcr - kneelAt) / 0.25, 0, 1)));
      }

      // hacking: hologram above the laptop, screen light on his face, sparks at the keypad
      if (v.phase === 'betting' && rig) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const fg2 = ctx.createRadialGradient(r.headX + 10 * sc, r.headY, 0, r.headX + 10 * sc, r.headY, 40 * sc);
        fg2.addColorStop(0, 'rgba(90,230,255,0.22)');
        fg2.addColorStop(1, 'rgba(90,230,255,0)');
        ctx.fillStyle = fg2;
        ctx.fillRect(r.headX - 30 * sc, r.headY - 40 * sc, 80 * sc, 80 * sc);
        ctx.restore();
        drawHologram(ctx, rig, sc, v.betProgress, time);
        if (!reduced && Math.random() < 0.25) {
          const kx = doorBase + doorR * 1.5, ky = doorY - doorR * 0.15 + 37 * h * 0.0024;
          for (let k = 0; k < 3; k++) fx.add({ kind: 'spark', x: kx, y: ky, vx: (Math.random() - 0.5) * h * 0.5, vy: -h * Math.random() * 0.4, g: h * 2, life: 0.25 });
        }
      }

      if (moto && rx - moto.gap > -h * 0.6) drawMoto(ctx, rx - moto.gap, gy + h * 0.08, h * 0.0034, time, wheel, ph, reduced);
      if (car && rx - car.gap > -h * 0.9) drawPoliceCar(ctx, rx - car.gap, gy + h * 0.12, h * 0.0044, time, wheel, reduced, 1);
      if (car2 && crashed) drawPoliceCar(ctx, car2.x, gy + h * 0.12, h * 0.0044, time, wheel * 0.3, reduced, -1);

      // coins and bills slip out of the bag at speed
      if (running && v.mult > 2) {
        coinAcc += dt * Math.log(v.mult) * 3;
        while (coinAcc > 1) {
          coinAcc -= 1;
          fx.add({ kind: 'coin', x: r.bagX, y: r.bagY, vx: -w * (0.02 + Math.random() * 0.06), vy: -h * (0.2 + Math.random() * 0.3), g: h * 2.4, life: 1.4, bounce: 0.4, rot: Math.random() * 6, vr: 10, r: h * 0.011, scroll: 1, floor: gy + (Math.random() - 0.5) * h * 0.03 });
        }
      }
      if (running && v.mult > 5 && !reduced) {
        billAcc += dt * Math.log(v.mult) * 1.5;
        while (billAcc > 1) {
          billAcc -= 1;
          fx.add({ kind: 'bill', x: r.bagX, y: r.bagY, vx: -w * (0.05 + Math.random() * 0.1), vy: -h * (0.1 + Math.random() * 0.25), g: h * 0.3, drag: 1, life: 2.2, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 8, r: h * 0.016, scroll: 0.6 });
        }
      }

      if (running && !reduced) drawForeground(ctx, here, w, h, scroll);

      // rain on the street
      rain = clamp(rain + dt * (here === 'street' && v.phase !== 'betting' ? 0.6 : -0.8), 0, 1);
      if (rain > 0 && !reduced) {
        ctx.strokeStyle = `rgba(180,200,255,${0.35 * rain})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < 90; i++) {
          const px = ((hash(i, 101) * w * 1.2 - time * w * 0.25 - scroll * 0.2) % (w * 1.2) + w * 1.2) % (w * 1.2) - w * 0.1;
          const py = ((hash(i, 102) * h + time * h * 1.6) % h);
          ctx.moveTo(px, py);
          ctx.lineTo(px - h * 0.012, py + h * 0.035);
        }
        ctx.stroke();
      }

      /* particles */
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
        } else if (p.kind === 'homing') {
          const e = easeOut(k);
          const tx = bagAt ? bagAt[0] : p.tx, ty = bagAt ? bagAt[1] : p.ty;
          const x = lerp(p.x, tx, e), y = lerp(p.y, ty, e) - Math.sin(k * Math.PI) * h * 0.1;
          const s = Math.max(2, h * 0.009) * (1 - k * 0.6);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(p.x * 0.1 + k * 6);
          if (p.gold) {
            ctx.fillStyle = k < 0.5 ? C.goldLight : C.gold;
            ctx.beginPath(); ctx.moveTo(0, -s * 1.6); ctx.lineTo(s * 0.5, 0); ctx.lineTo(0, s * 1.6); ctx.lineTo(-s * 0.5, 0); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-s * 1.6, 0); ctx.lineTo(0, s * 0.5); ctx.lineTo(s * 1.6, 0); ctx.lineTo(0, -s * 0.5); ctx.closePath(); ctx.fill();
          } else {
            ctx.fillStyle = '#7fc98a';
            ctx.fillRect(-s * 1.4, -s * 0.7, s * 2.8, s * 1.4);
            ctx.fillStyle = '#3f7d4a';
            ctx.fillRect(-s * 0.3, -s * 0.7, s * 0.6, s * 1.4);
          }
          ctx.restore();
        } else if (p.kind === 'spark') {
          ctx.strokeStyle = `rgba(255,${Math.round(240 - k * 120)},140,${1 - k})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025);
          ctx.stroke();
        } else if (p.kind === 'smoke' || p.kind === 'dust') {
          const rr2 = p.r * (1 + k * 1.6);
          ctx.fillStyle = p.kind === 'smoke' ? `rgba(120,120,120,${0.45 * (1 - k)})` : `rgba(200,190,170,${0.3 * (1 - k)})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, rr2, 0, TAU); ctx.fill();
        } else if (p.kind === 'debris') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = 1 - Math.max(0, k - 0.7) * 3.3;
          ctx.fillStyle = '#5d7470';
          ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
          ctx.restore();
          ctx.globalAlpha = 1;
        } else if (p.kind === 'bill') {
          ctx.save();
          ctx.translate(p.x + Math.sin(p.age * 5 + p.rot) * h * 0.01, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, Math.abs(Math.cos(p.age * 6 + p.rot)) * 0.8 + 0.2);
          ctx.globalAlpha = 1 - Math.max(0, k - 0.7) * 3.3;
          ctx.fillStyle = '#7fc98a';
          ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
          ctx.fillStyle = '#3f7d4a';
          ctx.beginPath(); ctx.arc(0, 0, p.r * 0.28, 0, TAU); ctx.fill();
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      });

      /* busted */
      if (crashed) {
        const tc = time - crashTime;
        if (crashZone === 'vault' || crashZone === 'hall') {
          // steel cage slams down
          const e = reduced ? 1 : easeOutBack(tc / 0.42);
          const bottom = lerp(-h * 0.1, gy + h * 0.015, e);
          if (!slamDone && tc > 0.32) {
            slamDone = true;
            if (!reduced) shake = Math.max(shake, 0.8);
            for (let k = 0; k < (reduced ? 4 : 16); k++) fx.add({ kind: 'dust', x: rx + (Math.random() - 0.5) * h * 0.45, y: gy + h * 0.01, vx: (Math.random() - 0.5) * h * 0.6, vy: -h * Math.random() * 0.15, drag: 3, life: 0.8, r: h * 0.025 });
          }
          const cageW = h * 0.44, left = rx - cageW / 2;
          for (let i = 0; i <= 9; i++) {
            const x = left + (i / 9) * cageW;
            const g = ctx.createLinearGradient(x - 3, 0, x + 3, 0);
            g.addColorStop(0, C.steelDark); g.addColorStop(0.5, '#eef6f4'); g.addColorStop(1, C.steelDark);
            ctx.fillStyle = g;
            ctx.fillRect(x - Math.max(2, h * 0.007), bottom - h * 1.2, Math.max(4, h * 0.014), h * 1.2);
          }
          ctx.fillStyle = vg2(ctx, bottom - h * 0.44, bottom - h * 0.42);
          ctx.fillRect(left - 8, bottom - h * 0.44, cageW + 16, Math.max(5, h * 0.02));
          ctx.fillRect(left - 8, bottom - 5, cageW + 16, Math.max(6, h * 0.022));
          const a = reduced ? 0.16 : 0.1 + 0.1 * (0.5 + 0.5 * Math.sin(tc * TAU * 1.1));
          ctx.fillStyle = `rgba(255,40,40,${a})`;
          ctx.fillRect(-30, -30, w + 60, h + 60);
        } else if (crashZone === 'roof') {
          // the helicopter drops a net: it falls open, lands, then cinches tight
          const tn = tc - 0.15;
          const fall = reduced ? 1 : clamp(tn / 0.55, 0, 1);
          const cinch = reduced ? 1 : clamp((tn - 0.55) / 0.35, 0, 1);
          const bottom = lerp(heliY + h * 0.2, gy + h * 0.012, fall * fall);
          const W = lerp(h * 0.6, h * 0.3, easeOutBack(cinch));
          const H = lerp(h * 0.12, h * 0.24, easeOut(cinch));
          const sway = (1 - cinch) * Math.sin(time * 9) * h * 0.02;
          if (tn > 0) {
            ctx.strokeStyle = 'rgba(6,8,12,0.9)';
            ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.moveTo(heliX + h * 0.02, heliY + h * 0.05); ctx.lineTo(rx + sway, bottom - H - 8); ctx.stroke();
            ctx.strokeStyle = '#b8a77a';
            ctx.lineWidth = 2;
            ctx.stroke();
            drawNet(ctx, rx + sway, bottom, W, H);
            if (cinch > 0 && cinch < 0.3 && !reduced) shake = Math.max(shake, 0.35);
          }
          const red = reduced ? true : Math.floor(tc * 2.4) % 2 === 0;
          ctx.fillStyle = red ? 'rgba(255,40,60,0.12)' : 'rgba(60,90,255,0.12)';
          ctx.fillRect(-30, -30, w + 60, h + 60);
        } else {
          // police lights wash over everything, cuffs pop above the robber
          const red = reduced ? true : Math.floor(tc * 2.4) % 2 === 0;
          ctx.fillStyle = red ? 'rgba(255,40,60,0.14)' : 'rgba(60,90,255,0.14)';
          ctx.fillRect(-30, -30, w + 60, h + 60);
        }
        // police tape sweeps across the foreground
        if (tc > 0.8) {
          const p = reduced ? 1 : easeOut((tc - 0.8) / 0.5);
          drawTape(ctx, -20, h * 0.95, w + 20, h * 0.87, p, h);
          drawTape(ctx, w + 20, h * 0.99, -20, h * 0.9, reduced ? 1 : easeOut((tc - 1.0) / 0.5), h);
        }
      } else if (running && here !== 'vault') {
        // red/blue siren tint at the edges
        const red = reduced ? true : Math.floor(time * 2.4) % 2 === 0;
        const eg = ctx.createLinearGradient(0, 0, w * 0.35, 0);
        eg.addColorStop(0, red ? 'rgba(255,40,60,0.24)' : 'rgba(60,90,255,0.24)');
        eg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = eg;
        ctx.fillRect(-30, -30, w * 0.35 + 30, h + 60);
      }

      // golden glow as the haul grows
      if (running && v.mult > 2) {
        const k = clamp(Math.log(v.mult) / Math.log(50), 0, 1);
        const gg = ctx.createRadialGradient(rx, gy - 60 * sc, 0, rx, gy - 60 * sc, h * 0.5);
        gg.addColorStop(0, `rgba(255,200,80,${0.12 * k})`);
        gg.addColorStop(1, 'rgba(255,200,80,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(rx - h * 0.5, gy - 60 * sc - h * 0.5, h, h);
      }

      const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(-30, -30, w + 60, h + 60);
      ctx.restore();

      // explosion flash
      flash = Math.max(0, flash - dt * 2.5);
      if (flash > 0) {
        ctx.fillStyle = `rgba(255,245,220,${flash})`;
        ctx.fillRect(0, 0, w, h);
      }

      // zone banner
      if (banner) {
        const t = time - banner.t0;
        if (t > 2.4) banner = null;
        else {
          const a = clamp(t / 0.25, 0, 1) * clamp((2.4 - t) / 0.4, 0, 1);
          const slide = (1 - easeOut(t / 0.35)) * -w * 0.08;
          const fs = Math.max(14, Math.round(h * 0.045));
          ctx.save();
          ctx.globalAlpha = a;
          ctx.font = `400 ${fs}px "Bungee", Impact, sans-serif`;
          const tw = ctx.measureText(banner.name).width;
          const bx = w * 0.03 + slide, by = h * 0.06;
          ctx.fillStyle = 'rgba(8,12,14,0.72)';
          rr(ctx, bx, by, tw + fs * 1.6, fs * 1.7, fs * 0.4);
          ctx.fill();
          ctx.fillStyle = banner.red ? '#ff4d4d' : '#e8b24a';
          ctx.fillRect(bx, by, fs * 0.25, fs * 1.7);
          ctx.fillStyle = banner.red ? '#ff8a8a' : '#ffd77a';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(banner.name, bx + fs * 0.85, by + fs * 0.88);
          ctx.restore();
        }
      }
    },
  };
}

// "POLICE LINE - DO NOT CROSS" tape from (x1,y1) towards (x2,y2), drawn up to `p` of its length.
function drawTape(ctx, x1, y1, x2, y2, p, h) {
  if (p <= 0) return;
  const len = Math.hypot(x2 - x1, y2 - y1) * p;
  const th = Math.max(16, h * 0.045);
  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, -th / 2 + 4, len, th);
  ctx.fillStyle = '#f5c518';
  ctx.fillRect(0, -th / 2, len, th);
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, -th / 2, len, th * 0.09);
  ctx.fillRect(0, th / 2 - th * 0.09, len, th * 0.09);
  ctx.beginPath();
  ctx.rect(0, -th / 2, len, th);
  ctx.clip();
  ctx.fillStyle = '#111';
  ctx.font = `900 ${Math.round(th * 0.55)}px "Chakra Petch", system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const label = 'POLICE LINE  •  DO NOT CROSS  •  ';
  const lw = ctx.measureText(label).width;
  for (let x = 6; x < len; x += lw) ctx.fillText(label, x, 1);
  ctx.restore();
}

function vg2(ctx, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, '#d8e4e2');
  g.addColorStop(1, '#3d5551');
  return g;
}
