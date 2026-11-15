// Poseable side-view characters (face right; facing:-1 mirrors).
// Local units: feet on y=0, head top near y=-122. Scale with `sc`.
import { TAU, rr, limb, joint } from './util';

const INK = 'rgba(6,8,12,0.9)';

export const OUTFITS = {
  robber: {
    skin: '#e8ae80', torso: '#f5eedd', stripes: '#191b27', sleeve: '#1d1f2c', pants: '#2a3050',
    shoe: '#c0392b', sole: '#f2efe6', laces: '#f2efe6', glove: '#14151c', mask: '#2a2c3d',
    scarf: '#e0413a', collar: '#191b27', belt: '#2b2118', pouches: '#3a3a2a', strap: true,
    jacket: '#1c1f2a', headset: true, cargo: true,
    build: { leg: 20, legW: 14, arm: 14.5, armW: 11, torso: 1.06, head: 1.06, shoe: 1.12 },
    hat: { type: 'beanie', color: '#1a1b26', pom: '#e04848' },
  },
  police: {
    skin: '#a8714a', torso: '#1d2d63', sleeve: '#1d2d63', pants: '#0f152e', shoe: '#08080d', sole: '#2a2c34',
    glove: '#0b0d14', belt: '#0b0b10', badge: '#f5c84c', radio: true, tie: '#0b1024', epaulette: '#c9a646', holster: true,
    vest: '#161a24', vestText: 'POLICE', brow: '#1a0f08',
    build: { leg: 22, legW: 13.5, arm: 16, armW: 11, torso: 1.1, head: 0.96, shoe: 1.08 },
    hat: { type: 'peaked', color: '#0f152e', band: '#e8e2d0', badge: '#f5c84c' },
  },
  police2: {
    skin: '#e2b48c', torso: '#1d2d63', sleeve: '#1d2d63', pants: '#0f152e', shoe: '#08080d', sole: '#2a2c34',
    glove: '#0b0d14', belt: '#0b0b10', badge: '#f5c84c', radio: true, shades: true, tie: '#0b1024', epaulette: '#c9a646', holster: true,
    vest: '#161a24', vestText: 'POLICE', brow: '#2a1a0e',
    build: { leg: 22, legW: 13.5, arm: 16, armW: 11, torso: 1.12, head: 0.96, shoe: 1.08 },
    hat: { type: 'peaked', color: '#0f152e', band: '#e8e2d0', badge: '#f5c84c' },
  },
  guard: {
    skin: '#d9a47c', torso: '#3e4656', sleeve: '#3e4656', pants: '#22283a', shoe: '#0a0a10', sole: '#2a2c34',
    glove: '#111318', belt: '#111', badge: '#d4dbe4', patch: '#d4dbe4', keys: true, vest: '#1b1f27', vestText: 'GUARD', brow: '#3a2414',
    build: { leg: 22, legW: 14, arm: 16, armW: 11.5, torso: 1.14, head: 0.95, shoe: 1.1 },
    hat: { type: 'cap', color: '#1b2030' },
  },
  swat: {
    skin: '#c48b62', torso: '#1a1d22', vest: '#2a3038', vestText: 'SWAT', sleeve: '#20242b', pants: '#181b20',
    shoe: '#0a0a0c', sole: '#1a1b1e', glove: '#0b0c0e', knee: '#0e1013', belt: '#0b0b0e', holster: true,
    build: { leg: 22, legW: 14.5, arm: 16, armW: 12, torso: 1.16, head: 0.95, shoe: 1.12 },
    hat: { type: 'helmet', color: '#111418' },
  },
};

function shade(hex, k = 0.72) {
  if (hex.startsWith('rgb')) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
}

function inkLimb(ctx, pts, width, color) {
  limb(ctx, pts, width + 3, INK);
  limb(ctx, pts, width, color);
}

export function drawHat(ctx, hat, t = 0) {
  if (!hat) return;
  ctx.fillStyle = hat.color;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  if (hat.type === 'beanie') {
    ctx.beginPath();
    ctx.moveTo(-13, -3);
    ctx.quadraticCurveTo(-14, -21, 0, -22);
    ctx.quadraticCurveTo(14, -21, 13.5, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = -9; i <= 9; i += 4.5) ctx.fillRect(i, -19, 1.6, 14);
    ctx.fillStyle = '#2a2c3a';
    rr(ctx, -14, -6, 28, 6, 2.5);
    ctx.fill();
    ctx.stroke();
    if (hat.pom) {
      ctx.fillStyle = hat.pom;
      ctx.beginPath();
      ctx.arc(-3 + Math.sin(t * 9) * 0.8, -24, 4.4, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  } else if (hat.type === 'cap') {
    ctx.beginPath();
    ctx.arc(0, -3, 13, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    rr(ctx, 5, -6, 16, 4, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d4dbe4';
    rr(ctx, -2, -12, 7, 4, 1);
    ctx.fill();
  } else if (hat.type === 'peaked') {
    ctx.beginPath();
    ctx.moveTo(-13, -4);
    ctx.lineTo(-15, -16);
    ctx.quadraticCurveTo(0, -23, 16, -15);
    ctx.lineTo(13, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // checkered band
    ctx.save();
    ctx.beginPath();
    ctx.rect(-13, -9, 26, 4.5);
    ctx.clip();
    ctx.fillStyle = hat.band;
    ctx.fillRect(-13, -9, 26, 4.5);
    ctx.fillStyle = '#121a38';
    for (let i = -13; i < 13; i += 4.5) { ctx.fillRect(i, -9, 2.25, 2.25); ctx.fillRect(i + 2.25, -6.75, 2.25, 2.25); }
    ctx.restore();
    ctx.fillStyle = '#07080c';
    ctx.beginPath();
    ctx.moveTo(5, -4.5);
    ctx.quadraticCurveTo(16, -5, 20, -1.5);
    ctx.lineTo(5, -2);
    ctx.closePath();
    ctx.fill();
    if (hat.badge) {
      ctx.fillStyle = hat.badge;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i / 5) * TAU;
        ctx.lineTo(6 + Math.cos(a) * 3.2, -14 + Math.sin(a) * 3.2);
        ctx.lineTo(6 + Math.cos(a + Math.PI / 5) * 1.4, -14 + Math.sin(a + Math.PI / 5) * 1.4);
      }
      ctx.closePath();
      ctx.fill();
    }
  } else if (hat.type === 'helmet') {
    ctx.beginPath();
    ctx.moveTo(-14, 2);
    ctx.quadraticCurveTo(-16, -21, 1, -22);
    ctx.quadraticCurveTo(16, -21, 15, -2);
    ctx.lineTo(10, -2);
    ctx.lineTo(-10, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.beginPath();
    ctx.ellipse(-3, -15, 8, 3, -0.3, 0, TAU);
    ctx.fill();
    // visor
    const vg = ctx.createLinearGradient(0, -6, 0, 6);
    vg.addColorStop(0, 'rgba(140,200,240,0.75)');
    vg.addColorStop(1, 'rgba(40,70,110,0.75)');
    ctx.fillStyle = vg;
    ctx.beginPath();
    ctx.moveTo(1, -6);
    ctx.lineTo(16, -5);
    ctx.quadraticCurveTo(17, 3, 13, 6);
    ctx.lineTo(1, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f2f2f2';
    ctx.font = '900 5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SWAT', -5, -10);
  }
}

export function drawMustache(ctx) {
  ctx.fillStyle = '#17110c';
  ctx.beginPath();
  ctx.moveTo(5, 6.5);
  ctx.quadraticCurveTo(8.5, 3.6, 12, 5.2);
  ctx.quadraticCurveTo(15, 3.8, 17, 7);
  ctx.quadraticCurveTo(13.5, 8.8, 11.5, 7.4);
  ctx.quadraticCurveTo(8, 8.8, 5, 6.5);
  ctx.fill();
}

export function drawItem(ctx, item, t = 0) {
  // drawn in hand-local coords: hand at (0,0), pointing +x
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  if (item === 'flashlight') {
    ctx.fillStyle = '#2b2d36';
    rr(ctx, -3, -3.5, 17, 7, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3d404c';
    rr(ctx, 11, -5, 6, 10, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff6c8';
    ctx.fillRect(16.5, -4, 2, 8);
  } else if (item === 'baton') {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-2, 2); ctx.lineTo(20, -10); ctx.stroke();
    ctx.strokeStyle = '#26282f';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-2, 2); ctx.lineTo(20, -10); ctx.stroke();
  } else if (item === 'drill') {
    // heavy-duty core drill
    ctx.fillStyle = '#f2b632';
    rr(ctx, -6, -8, 24, 12, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1c1d22';
    rr(ctx, -4, 1, 8, 13, 2.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1c1d22';
    ctx.fillRect(-4, -6, 6, 8);
    ctx.fillStyle = '#55595f';
    rr(ctx, 17, -6, 6, 8, 1.5);
    ctx.fill();
    ctx.stroke();
    // spinning bit
    ctx.fillStyle = '#c9d2d8';
    ctx.fillRect(22, -3.5, 16, 3);
    ctx.fillStyle = '#6b737a';
    const off = (t * 60) % 4;
    for (let x = 22 + off; x < 38; x += 4) ctx.fillRect(x, -3.5, 1.4, 3);
  } else if (item === 'shield') {
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = 'rgba(20,24,30,0.92)';
    rr(ctx, -30, 2, 60, 26, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(150,200,235,0.35)';
    rr(ctx, -22, 6, 16, 18, 3);
    ctx.fill();
    ctx.fillStyle = '#f2f2f2';
    ctx.font = '900 7px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(10, 15);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('POLICE', 0, 0);
    ctx.restore();
    ctx.restore();
  }
}

// Loot sack, tied at the top (towards the shoulder).
export function drawBag(ctx, bx, by, r, t = 0) {
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(-0.25);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.3, r * 0.1, 0, 0, r * 1.25);
  g.addColorStop(0, '#c08a4c');
  g.addColorStop(0.6, '#8a5a2c');
  g.addColorStop(1, '#5a3818');
  // bills peeking out when the haul is big
  if (r > 15) {
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(r * 0.45 + i * 2.5, -r * 0.82 - i * 1.5);
      ctx.rotate(-0.6 + i * 0.35 + Math.sin(t * 7 + i) * 0.08);
      ctx.fillStyle = '#7fc98a';
      ctx.strokeStyle = '#2f6b3a';
      ctx.lineWidth = 1;
      ctx.fillRect(-3, -8, 7, 11);
      ctx.strokeRect(-3, -8, 7, 11);
      ctx.restore();
    }
  }
  ctx.fillStyle = g;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(r * 0.35, -r * 0.92);
  ctx.bezierCurveTo(r * 1.25, -r * 0.6, r * 1.15, r * 0.95, 0, r * 0.98);
  ctx.bezierCurveTo(-r * 1.2, r * 0.95, -r * 1.25, -r * 0.55, -r * 0.3, -r * 0.92);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // burlap texture
  ctx.strokeStyle = 'rgba(60,35,10,0.25)';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * r * 0.3, -r * 0.6);
    ctx.quadraticCurveTo(i * r * 0.38, 0, i * r * 0.3, r * 0.8);
    ctx.stroke();
  }
  // tied neck
  ctx.fillStyle = '#6a4420';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  rr(ctx, -r * 0.32, -r * 1.12, r * 0.7, r * 0.28, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#d9a441';
  ctx.fillRect(-r * 0.36, -r * 0.95, r * 0.78, r * 0.12);
  // $ stamp
  ctx.fillStyle = '#ffd56a';
  ctx.strokeStyle = 'rgba(60,30,0,0.6)';
  ctx.lineWidth = 1;
  ctx.font = `900 ${Math.round(r * 1.05)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', 0, r * 0.12);
  ctx.strokeText('$', 0, r * 0.12);
  // glint
  const gl = (Math.sin(t * 3) + 1) / 2;
  ctx.fillStyle = `rgba(255,255,230,${0.25 + gl * 0.5})`;
  ctx.beginPath();
  ctx.ellipse(-r * 0.45, -r * 0.35, r * 0.18, r * 0.09, -0.6, 0, TAU);
  ctx.fill();
  ctx.restore();
}


function hiLimb(ctx, pts, width, color) {
  limb(ctx, pts, width + 3.2, INK);
  limb(ctx, pts, width, color);
  limb(ctx, pts.map(([px, py]) => [px + 1.1, py - 1.3]), width * 0.28, 'rgba(255,255,255,0.14)');
}

function torsoPath(ctx, g, belly) {
  const b = belly ? 7 : 0;
  ctx.beginPath();
  ctx.moveTo(-13 + g, -39 + g);
  ctx.quadraticCurveTo(1, -44 + g, 15 - g, -38 + g);
  ctx.quadraticCurveTo(19 + b - g, -21, 12 + b * 0.45 - g, 2 - g);
  ctx.lineTo(-11 + g, 2 - g);
  ctx.quadraticCurveTo(-16.5 + g, -20, -13 + g, -39 + g);
  ctx.closePath();
}

function drawScarf(ctx, nx, ny, t, wind, color) {
  for (let k = 1; k >= 0; k--) {
    const L = 12, pts = [];
    const len = 26 + 34 * wind + k * 6;
    for (let i = 0; i <= L; i++) {
      const u = i / L;
      pts.push([
        nx - 3 - u * len,
        ny + 4 + k * 3 + u * (26 - 22 * wind) + Math.sin(t * (5 + 12 * wind) - u * 6 + k * 2) * u * (2 + 5 * wind),
      ]);
    }
    const left = [], right = [];
    for (let i = 0; i <= L; i++) {
      const p = pts[i], q = pts[Math.min(L, i + 1)], o = pts[Math.max(0, i - 1)];
      let dx = q[0] - o[0], dy = q[1] - o[1];
      const d = Math.hypot(dx, dy) || 1;
      dx /= d; dy /= d;
      const hw = 3.2 * (1 - (i / L) * 0.85);
      left.push([p[0] - dy * hw, p[1] + dx * hw]);
      right.push([p[0] + dy * hw, p[1] - dx * hw]);
    }
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (const p of left) ctx.lineTo(p[0], p[1]);
    for (let i = L; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = INK;
    ctx.stroke();
    const g = ctx.createLinearGradient(pts[0][0], 0, pts[L][0], 0);
    g.addColorStop(0, k ? shade(color, 0.7) : color);
    g.addColorStop(1, shade(color, k ? 0.55 : 0.75));
    ctx.fillStyle = g;
    ctx.fill();
  }
}

/**
 * o: { pose: 'idle'|'walk'|'run'|'jump'|'slide'|'hands'|'grab'|'ride', ph, t, facing, outfit, item, bag (radius), amp, noShadow }
 */
export function drawPerson(ctx, x, y, sc, o) {
  const f = o.outfit;
  const B = { leg: 23, legW: 12, arm: 16, armW: 9.5, torso: 1, head: 1, shoe: 1, ...(f.build || {}) };
  const pose = o.pose || 'idle';
  const ph = o.ph || 0, t = o.t || 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc * (o.facing || 1), sc);

  if (!o.noShadow) {
    const sg = ctx.createRadialGradient(pose === 'slide' ? 10 : 0, 1, 2, pose === 'slide' ? 10 : 0, 1, pose === 'slide' ? 46 : 30);
    sg.addColorStop(0, 'rgba(0,0,0,0.5)');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(pose === 'slide' ? 10 : 0, 1, pose === 'slide' ? 48 : 30, 6.5, 0, 0, TAU);
    ctx.fill();
  }

  const moving = pose === 'run' || pose === 'walk' || pose === 'grab';
  const walk = pose === 'walk';
  const amp = o.amp ?? (walk ? 0.55 : 0.95);
  let hipY = -(B.leg * 2 + 1), lean = 0.04, bob = 0;
  if (moving) { bob = -Math.abs(Math.sin(ph)) * (walk ? 2.5 : 6.5); lean = walk ? 0.08 : 0.34; }
  if (pose === 'grab') lean = 0.5;
  if (pose === 'idle') bob = Math.sin(t * 2.4) * 1.2;
  if (pose === 'hands') lean = -0.06;
  if (pose === 'jump') lean = 0.26;
  if (pose === 'slide') { lean = -1.05; hipY = -10; }
  if (pose === 'ride') { lean = 0.28; hipY = -40; }
  if (pose === 'kneel') { lean = 0.02; hipY = -(B.leg + 4); }
  if (pose === 'point') { lean = 0.06; }
  if (pose === 'type') { lean = 0.14; bob = Math.sin(t * 2.2) * 0.8; }
  hipY += bob;
  const hipX = 0;

  const legAngles = (side) => {
    if (moving) {
      const p = ph + side;
      const th = Math.sin(p) * amp;
      return [th, th - (0.15 + Math.max(0, Math.cos(p)) * (walk ? 0.7 : 1.45))];
    }
    if (pose === 'jump') return side === 0 ? [1.15, 0.1] : [-0.5, -1.65];
    if (pose === 'slide') return side === 0 ? [1.5, 1.55] : [2.2, 0.9];
    if (pose === 'ride') return side === 0 ? [1.35, 0.15] : [1.2, 0.05];
    if (pose === 'kneel') return side === 0 ? [1.25, -0.05] : [0.12, -1.55];
    if (pose === 'point') return side === 0 ? [0.3, 0.22] : [-0.3, -0.24];
    return side === 0 ? [0.12, 0.12] : [-0.12, -0.12];
  };
  const drawLeg = (side, color) => {
    const [th, sh] = legAngles(side);
    const knee = joint(hipX, hipY, th, B.leg);
    const foot = joint(knee[0], knee[1], sh, B.leg);
    hiLimb(ctx, [[hipX, hipY], knee, foot], B.legW, color);
    if (f.cargo) {
      const mx = (hipX + knee[0]) / 2, my = (hipY + knee[1]) / 2;
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(-th);
      ctx.fillStyle = INK;
      rr(ctx, -B.legW * 0.42, -4, B.legW * 0.84, 10, 2); ctx.fill();
      ctx.fillStyle = shade(color, 1.12);
      rr(ctx, -B.legW * 0.34, -3.2, B.legW * 0.68, 8.4, 1.6); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-B.legW * 0.34, -3.2, B.legW * 0.68, 2.4);
      ctx.restore();
    }
    if (f.knee) {
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.arc(knee[0] + 2, knee[1], 7, 0, TAU); ctx.fill();
      ctx.fillStyle = f.knee;
      ctx.beginPath(); ctx.arc(knee[0] + 2, knee[1], 5.6, 0, TAU); ctx.fill();
    }
    const rot = moving ? sh * 0.4 : pose === 'slide' ? 1.2 : 0;
    ctx.save();
    ctx.translate(foot[0], foot[1]);
    ctx.rotate(rot);
    ctx.scale(B.shoe, B.shoe);
    ctx.fillStyle = INK;
    rr(ctx, -6.5, -6.5, 22, 11.5, 5.5);
    ctx.fill();
    ctx.fillStyle = f.shoe;
    rr(ctx, -5, -5.2, 19, 8.8, 4.2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.beginPath(); ctx.ellipse(9.5, -2.5, 3.4, 1.8, 0, 0, TAU); ctx.fill();
    if (f.sole) { ctx.fillStyle = f.sole; rr(ctx, -5.5, 1.4, 20.5, 3, 1.5); ctx.fill(); }
    if (f.laces) {
      ctx.strokeStyle = f.laces;
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(1 + i * 2.6, -5); ctx.lineTo(2.6 + i * 2.6, -2.2); ctx.stroke(); }
    }
    ctx.restore();
  };

  const sx = hipX + Math.sin(lean) * 36 * B.torso, sy = hipY - Math.cos(lean) * 36 * B.torso;
  const arm = (side) => {
    if (pose === 'hands') return side === 0 ? [Math.PI - 0.3, Math.PI - 0.12] : [Math.PI + 0.25, Math.PI + 0.1];
    if (pose === 'grab') return side === 0 ? [1.45, 1.6] : [1.2, 1.5];
    if (pose === 'jump') return side === 0 ? [2.3, 2.75] : [-0.9, -0.5];
    if (pose === 'slide') return side === 0 ? [0.5, 1.2] : [-0.4, 0.2];
    if (pose === 'ride') return [1.2, 1.5];
    if (pose === 'kneel') return side === 0 ? [-0.55, -1.5] : [-0.45, -1.4];
    if (pose === 'point') return side === 0 ? [1.42, 1.56] : [0.25, 0.5];
    if (pose === 'type') {
      const tap = Math.sin(t * 26 + side * 1.9) * 0.07;
      return side === 0 ? [1.0 + tap, 1.72 + tap * 2] : [0.82 - tap, 1.62 - tap * 2];
    }
    if (o.item === 'drill' && side === 0) return [1.3, 1.55];
    if (o.item === 'shield' && side === 0) return [1.1, 2.0];
    if (moving) {
      const a = Math.sin(ph) * amp * 1.15;
      return side === 0 ? [-a, -a + (walk ? 0.5 : 1.4)] : [a, a + (walk ? 0.4 : 1.3)];
    }
    return side === 0 ? [0.15, 0.35] : [-0.1, 0.1];
  };
  const drawArm = (side, color) => {
    const [ua, fa] = arm(side);
    const ox = side === 0 ? sx + 2 : sx - 3;
    const oy = sy + 1;
    const el = joint(ox, oy, ua, B.arm);
    const hand = joint(el[0], el[1], fa, B.arm * 0.94);
    hiLimb(ctx, [[ox, oy], el, hand], B.armW, color);
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(hand[0], hand[1], 6.6, 0, TAU); ctx.fill();
    ctx.fillStyle = f.glove || f.skin;
    ctx.beginPath(); ctx.arc(hand[0], hand[1], 5.2, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.arc(hand[0] + 1.4, hand[1] - 1.6, 1.8, 0, TAU); ctx.fill();
    return { hand, fa };
  };

  const wind = moving || pose === 'jump' || pose === 'slide' ? 1 : 0.2;
  if (f.scarf) drawScarf(ctx, sx, sy, t, wind, f.scarf);

  // back leg + back arm (behind the torso)
  drawLeg(Math.PI, shade(f.pants));
  let bagPos = null;
  if (o.bag) {
    const bx = sx - 8 - o.bag * 0.7, by = sy + 6 + (moving ? Math.sin(ph * 2) * 2.4 : 0) + (pose === 'slide' ? 10 : 0);
    drawBag(ctx, bx, by, o.bag, t);
    bagPos = [bx, by];
    hiLimb(ctx, [[sx, sy], [sx - 2, sy + 4], [bx + o.bag * 0.25, by - o.bag * 1.0]], 8.5, shade(f.sleeve, 0.85));
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(bx + o.bag * 0.25, by - o.bag * 1.0, 6.2, 0, TAU); ctx.fill();
    ctx.fillStyle = f.glove || f.skin;
    ctx.beginPath(); ctx.arc(bx + o.bag * 0.25, by - o.bag * 1.0, 4.8, 0, TAU); ctx.fill();
  } else {
    drawArm(1, shade(f.sleeve));
  }
  drawLeg(0, f.pants);

  // torso
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(lean);
  ctx.scale(B.torso, B.torso);
  ctx.fillStyle = INK;
  torsoPath(ctx, -1.6, f.belly);
  ctx.fill();
  torsoPath(ctx, 0, f.belly);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = f.torso;
  ctx.fillRect(-20, -46, 46, 52);
  if (f.stripes && f.jacket) {
    ctx.fillStyle = f.stripes;
    for (let yy = -38; yy < 6; yy += 8.5) ctx.fillRect(-20, yy, 46, 4.2);
    ctx.fillStyle = f.jacket;
    ctx.fillRect(-20, -46, 15, 52);
    ctx.fillRect(10.5, -46, 16, 52);
    ctx.fillStyle = INK;
    ctx.fillRect(-5.6, -46, 1.6, 52);
    ctx.fillRect(10, -46, 1.6, 52);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    rr(ctx, -16, -30, 9, 8, 1.5); ctx.fill();
    rr(ctx, -16, -19, 9, 8, 1.5); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(-16, -30, 9, 2); ctx.fillRect(-16, -19, 9, 2);
  } else if (f.stripes) {
    ctx.fillStyle = f.stripes;
    for (let yy = -38; yy < 6; yy += 8.5) ctx.fillRect(-20, yy, 46, 4.2);
  }
  if (f.tie) {
    ctx.fillStyle = '#d9dce4';
    ctx.beginPath(); ctx.moveTo(3, -41); ctx.lineTo(12, -41); ctx.lineTo(8, -33); ctx.closePath(); ctx.fill();
    ctx.fillStyle = f.tie;
    ctx.beginPath(); ctx.moveTo(6.5, -38); ctx.lineTo(9, -38); ctx.lineTo(10, -22); ctx.lineTo(7.8, -19); ctx.lineTo(5.8, -22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(-3, -30, 1.2, 28);
  }
  if (f.vest) {
    ctx.fillStyle = f.vest;
    ctx.fillRect(-20, -36, 46, 36);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    for (let k = 0; k < 3; k++) { rr(ctx, -10 + k * 8, -17, 7, 9, 1.5); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let k = 0; k < 3; k++) ctx.fillRect(-10 + k * 8, -17, 7, 2);
    ctx.fillStyle = '#ececec';
    ctx.font = '900 7px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(f.vestText || '', 1, -27);
  }
  if (f.collar) {
    ctx.fillStyle = f.collar;
    ctx.beginPath(); ctx.ellipse(2, -40, 13, 5, 0, 0, TAU); ctx.fill();
  }
  if (f.belt) {
    ctx.fillStyle = f.belt;
    ctx.fillRect(-20, -8, 46, 5.5);
    ctx.fillStyle = '#d4b04a';
    rr(ctx, 4, -7.5, 5.5, 4.5, 1); ctx.fill();
    if (f.holster) { ctx.fillStyle = '#111'; rr(ctx, -12, -6, 7, 9, 2); ctx.fill(); }
    if (f.keys) {
      ctx.strokeStyle = '#d8dee6';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(-6, -1, 3, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#d8dee6';
      ctx.fillRect(-8, 1, 1.4, 5); ctx.fillRect(-5, 1.5, 1.4, 4.5);
    }
  }
  if (f.strap && o.bag) {
    ctx.lineCap = 'butt';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7.5;
    ctx.beginPath(); ctx.moveTo(-15, -41); ctx.lineTo(15, -5); ctx.stroke();
    ctx.strokeStyle = '#7a4e24';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#e8b24a';
    rr(ctx, -3, -26, 6, 5, 1); ctx.fill();
  }
  if (f.pouches) {
    for (const px of [-10, 6]) {
      ctx.fillStyle = INK; rr(ctx, px - 1, -10, 8, 9, 2); ctx.fill();
      ctx.fillStyle = f.pouches; rr(ctx, px, -9, 6, 7, 1.5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(px, -9, 6, 1.6);
    }
  }
  if (f.patch) { ctx.fillStyle = f.patch; rr(ctx, -10, -34, 6.5, 7, 1.5); ctx.fill(); }
  // light from the front, shadow at the back
  const lg = ctx.createLinearGradient(-14, 0, 16, 0);
  lg.addColorStop(0, 'rgba(0,0,0,0.32)');
  lg.addColorStop(0.55, 'rgba(0,0,0,0)');
  lg.addColorStop(1, 'rgba(255,255,255,0.12)');
  ctx.fillStyle = lg;
  ctx.fillRect(-20, -46, 46, 52);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.ellipse(8, -34, 6, 3, -0.3, 0, TAU); ctx.fill();
  ctx.restore();
  if (f.badge) {
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.moveTo(8, -33); ctx.lineTo(12.5, -30.5); ctx.lineTo(12, -25.5); ctx.lineTo(8, -23.5); ctx.lineTo(4, -25.5); ctx.lineTo(3.5, -30.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = f.badge;
    ctx.beginPath(); ctx.moveTo(8, -31.8); ctx.lineTo(11.3, -29.8); ctx.lineTo(10.9, -26); ctx.lineTo(8, -24.6); ctx.lineTo(5.1, -26); ctx.lineTo(4.7, -29.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(6.4, -30, 1.4, 2.6);
  }
  if (f.epaulette) {
    ctx.fillStyle = INK;
    rr(ctx, -8, -42.5, 16, 5.5, 2); ctx.fill();
    ctx.fillStyle = f.epaulette;
    rr(ctx, -7, -41.6, 14, 3.8, 1.5); ctx.fill();
  }
  if (f.radio) {
    ctx.fillStyle = INK;
    rr(ctx, -11, -38, 8, 11, 2); ctx.fill();
    ctx.fillStyle = '#1b1c22';
    rr(ctx, -10, -37, 6, 9, 1.5); ctx.fill();
    ctx.fillStyle = Math.sin(t * 5) > 0.6 ? '#ff4040' : '#3a1010';
    ctx.fillRect(-8.5, -35.5, 2.2, 2.2);
  }
  ctx.restore();

  // scarf knot at the neck
  if (f.scarf) {
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(sx + 1, sy - 2, 9.5, 6, lean, 0, TAU); ctx.fill();
    ctx.fillStyle = f.scarf;
    ctx.beginPath(); ctx.ellipse(sx + 1, sy - 2, 8, 4.6, lean, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.ellipse(sx + 4, sy - 3.5, 3, 1.4, lean, 0, TAU); ctx.fill();
  }

  // head
  const scared = pose === 'hands' || pose === 'kneel';
  const hx = sx + Math.sin(lean) * 15 * B.torso + 3, hy = sy - Math.cos(lean) * 15 * B.torso - 3;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(lean * 0.4);
  ctx.scale(B.head, B.head);
  const head = (g) => {
    ctx.beginPath();
    ctx.arc(0, -1, 14 + g, 0, TAU);
    ctx.moveTo(16 + g, 6);
    ctx.ellipse(5, 6, 11 + g, 8.5 + g, 0.12, 0, TAU);
  };
  // profile: forehead, brow, nose, lips, chin, jaw
  const profile = () => {
    ctx.beginPath();
    ctx.moveTo(-6, 13);
    ctx.bezierCurveTo(-15, 8, -16, -10, -6, -14.5);
    ctx.bezierCurveTo(2, -17.5, 12, -14, 13.5, -7);
    ctx.quadraticCurveTo(14.6, -4.6, 14.2, -3.2);
    ctx.quadraticCurveTo(16.5, 0, 18.6, 3.4);
    ctx.quadraticCurveTo(18.8, 5, 16, 5.2);
    ctx.quadraticCurveTo(16.8, 6.4, 16.4, 7.6);
    ctx.lineTo(15.4, 8.4);
    ctx.quadraticCurveTo(16.4, 9.2, 16, 10.4);
    ctx.quadraticCurveTo(14.6, 11.2, 15.4, 13.2);
    ctx.quadraticCurveTo(14.6, 15.8, 9, 15.8);
    ctx.quadraticCurveTo(3, 15.6, -1, 12.6);
    ctx.closePath();
  };
  if (f.mask) {
    ctx.fillStyle = INK;
    head(1.6);
    ctx.fill();
    const hg = ctx.createRadialGradient(6, -6, 2, 2, 2, 18);
    hg.addColorStop(0, '#34364a');
    hg.addColorStop(1, f.mask);
    ctx.fillStyle = hg;
    head(0);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(-4, 2, 4.6, 0, TAU); ctx.fill();
    ctx.fillStyle = '#26283a';
    ctx.beginPath(); ctx.arc(-4, 2, 3.4, 0, TAU); ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(15.5, 2.5, 5, 4.3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2a2c3c';
    ctx.beginPath(); ctx.ellipse(15.5, 2.5, 3.8, 3.2, 0, 0, TAU); ctx.fill();
  } else {
    ctx.save();
    ctx.translate(2, 0);
    ctx.scale(1.1, 1.1);
    ctx.translate(-2, 0);
    ctx.fillStyle = INK;
    profile();
    ctx.fill();
    ctx.restore();
    const hg = ctx.createLinearGradient(-12, -10, 16, 10);
    hg.addColorStop(0, shade(f.skin, 0.82));
    hg.addColorStop(0.55, f.skin);
    hg.addColorStop(1, shade(f.skin, 1.12));
    ctx.fillStyle = hg;
    profile();
    ctx.fill();
    // jaw shadow and cheekbone light
    ctx.save();
    profile();
    ctx.clip();
    ctx.fillStyle = 'rgba(40,18,8,0.22)';
    ctx.beginPath(); ctx.ellipse(3, 16, 13, 5, 0.1, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,220,0.18)';
    ctx.beginPath(); ctx.ellipse(10, 3, 4, 2.2, -0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(40,28,22,0.22)';
    ctx.beginPath(); ctx.ellipse(9, 12, 9, 5.5, 0.1, 0, TAU); ctx.fill();
    ctx.restore();
    // short hair and sideburn under the hat
    ctx.fillStyle = f.hair || '#1d140e';
    ctx.beginPath(); ctx.moveTo(-11, -8); ctx.lineTo(1.5, -8); ctx.lineTo(2, 1.5); ctx.quadraticCurveTo(-5, 0, -11, -8); ctx.fill();
    // ear
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(-1.5, 2.5, 4.6, 5.8, 0.15, 0, TAU); ctx.fill();
    ctx.fillStyle = shade(f.skin, 0.9);
    ctx.beginPath(); ctx.ellipse(-1.5, 2.5, 3.4, 4.6, 0.15, 0, TAU); ctx.fill();
    ctx.strokeStyle = shade(f.skin, 0.65);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(-1.2, 2.6, 2, -1.2, 1.6); ctx.stroke();
  }

  if (f.mask) {
    // balaclava: wide eye opening, big determined eyes, cocky grin
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.moveTo(-0.6, -9.8); ctx.lineTo(18.2, -7.6); ctx.quadraticCurveTo(19.8, 4.2, 14, 4.8); ctx.lineTo(3, 4.8); ctx.quadraticCurveTo(-1.8, 4.2, -0.6, -9.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = f.skin;
    ctx.beginPath(); ctx.moveTo(0.9, -8.4); ctx.lineTo(16.9, -6.5); ctx.quadraticCurveTo(18.2, 3.2, 13.6, 3.5); ctx.lineTo(3.4, 3.5); ctx.quadraticCurveTo(-0.2, 3.2, 0.9, -8.4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(1, 0.5, 16.5, 3);
    const look = scared ? -1.2 : 1.1;
    for (const [ex, ew, eh] of [[6.6, 3.7, 4.3], [13.1, 3.2, 4]]) {
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.ellipse(ex, -2, ew + 1, eh + 1, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(ex, -2, ew, eh, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3a2614';
      ctx.beginPath(); ctx.arc(ex + look, -1.4, scared ? 1.5 : 2.2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0c0805';
      ctx.beginPath(); ctx.arc(ex + look, -1.4, scared ? 0.9 : 1.3, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(ex + look + 0.8, -2.6, 0.8, 0, TAU); ctx.fill();
    }
    // brows: knitted down when running, raised when caught
    ctx.strokeStyle = f.mask;
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (scared) { ctx.moveTo(3, -8.6); ctx.quadraticCurveTo(6.6, -10.4, 9.6, -8.2); ctx.moveTo(10.6, -8); ctx.quadraticCurveTo(13.4, -9.8, 16.2, -7.6); }
    else { ctx.moveTo(2.6, -8.2); ctx.lineTo(9.4, -5.6); ctx.moveTo(10.8, -5.5); ctx.lineTo(16.4, -7.2); }
    ctx.stroke();
    // mouth opening with a confident smirk
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(11.8, 10.4, 5.4, scared ? 4.8 : 3.3, -0.08, 0, TAU); ctx.fill();
    ctx.fillStyle = f.skin;
    ctx.beginPath(); ctx.ellipse(11.8, 10.4, 4.3, scared ? 3.7 : 2.3, -0.08, 0, TAU); ctx.fill();
    if (scared) {
      ctx.fillStyle = '#4a1414';
      ctx.beginPath(); ctx.ellipse(11.8, 10.8, 2.2, 2.6, 0, 0, TAU); ctx.fill();
    } else {
      ctx.strokeStyle = '#4a1414';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(8.8, 10.6); ctx.quadraticCurveTo(12, 12, 15.2, 9.2); ctx.stroke();
      ctx.fillStyle = '#ffcf3a';
      ctx.beginPath(); ctx.arc(13.4, 10.6, 0.8, 0, TAU); ctx.fill();
    }
  } else {
    if (f.shades) {
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.moveTo(5, -4.6); ctx.lineTo(15.6, -4.2); ctx.quadraticCurveTo(15.6, 1.6, 11, 1.6); ctx.quadraticCurveTo(5.6, 1.6, 5, -4.6); ctx.fill();
      const sg2 = ctx.createLinearGradient(0, -4.6, 0, 1.6);
      sg2.addColorStop(0, '#4a5a7a'); sg2.addColorStop(1, '#0c0f18');
      ctx.fillStyle = sg2;
      ctx.beginPath(); ctx.moveTo(6.2, -3.8); ctx.lineTo(14.6, -3.5); ctx.quadraticCurveTo(14.6, 0.8, 11, 0.8); ctx.quadraticCurveTo(6.6, 0.8, 6.2, -3.8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(8, -3.2, 3, 0.9);
      ctx.fillStyle = INK;
      ctx.fillRect(-1, -3.6, 7, 1.4);
    } else {
      // almond eye with a heavy upper lid
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.ellipse(9.8, -1.6, 3.9, 2.8, 0.08, 0, TAU); ctx.fill();
      ctx.fillStyle = '#f4efe6';
      ctx.beginPath(); ctx.ellipse(9.8, -1.6, 3, 1.9, 0.08, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4a2e16';
      ctx.beginPath(); ctx.arc(11, -1.4, 1.5, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0c0805';
      ctx.beginPath(); ctx.arc(11.2, -1.4, 0.8, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(11.6, -2, 0.5, 0, TAU); ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.7;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(6, -3); ctx.quadraticCurveTo(10, -4.4, 13.8, -2.4); ctx.stroke();
      ctx.strokeStyle = 'rgba(60,30,15,0.4)';
      ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(7.4, 1.3); ctx.quadraticCurveTo(10, 2.4, 12.8, 1.1); ctx.stroke();
    }
    // heavy, angry brow
    ctx.fillStyle = f.brow || '#22150c';
    ctx.beginPath(); ctx.moveTo(4.4, -8.2); ctx.quadraticCurveTo(9.4, -9.6, 14.8, -5.2); ctx.lineTo(14.1, -3.8); ctx.quadraticCurveTo(9.2, -6.8, 4.8, -6); ctx.closePath(); ctx.fill();
    // nostril and smile line
    ctx.fillStyle = 'rgba(40,20,10,0.6)';
    ctx.beginPath(); ctx.ellipse(16.2, 4.3, 1.2, 0.7, 0.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(60,30,15,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(13.8, 3.6); ctx.quadraticCurveTo(12.3, 6, 12.9, 8.8); ctx.stroke();
    // mouth: a hard line, or a shout when he grabs
    if (pose === 'grab') {
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.moveTo(16.4, 7.3); ctx.lineTo(11.2, 7.8); ctx.quadraticCurveTo(10.8, 10.8, 12.6, 11.6); ctx.lineTo(16, 10.9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a1418';
      ctx.beginPath(); ctx.moveTo(15.4, 8.6); ctx.lineTo(12.2, 8.9); ctx.quadraticCurveTo(12, 10.4, 13, 10.8); ctx.lineTo(15.2, 10.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f2efe6';
      ctx.fillRect(12.4, 7.9, 3.8, 1.1);
    } else {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(15.6, 8.4); ctx.lineTo(11.6, 8.8); ctx.lineTo(10.7, 9.9); ctx.stroke();
    }
  }
  if (f.mustache) { ctx.save(); ctx.translate(0.6, 0.6); drawMustache(ctx); ctx.restore(); }
  ctx.save();
  ctx.translate(0, f.hat && f.hat.type === 'beanie' ? -6.5 : -1.5);
  ctx.scale(1.12, 1.12);
  drawHat(ctx, f.hat, t);
  ctx.restore();
  if (f.headset) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, 1); ctx.quadraticCurveTo(-6, -14, 2, -21); ctx.stroke();
    ctx.strokeStyle = '#3a3d48';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(-3, 4); ctx.quadraticCurveTo(4, 14, 12.5, 12.5); ctx.stroke();
    ctx.strokeStyle = '#4a4e5c';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(-4, 2, 4.8, 5.6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#20232c';
    ctx.beginPath(); ctx.ellipse(-4, 2, 3.6, 4.4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.ellipse(-5, 0, 1.6, 2.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#59e39a';
    ctx.beginPath(); ctx.arc(-2, 5.5, 0.8, 0, TAU); ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(13, 12.4, 2.2, 0, TAU); ctx.fill();
    ctx.fillStyle = Math.sin(t * 4) > 0 ? '#ff4d4d' : '#5a1414';
    ctx.beginPath(); ctx.arc(13, 12.4, 1.1, 0, TAU); ctx.fill();
  }
  ctx.restore();

  // front arm + held item
  const front = drawArm(0, f.sleeve);
  if (o.item) {
    ctx.save();
    ctx.translate(front.hand[0], front.hand[1]);
    if (o.item === 'drill' || o.item === 'flashlight' || o.item === 'shield') ctx.rotate(Math.PI / 2 - front.fa);
    drawItem(ctx, o.item, t);
    ctx.restore();
  }
  ctx.restore();
  const fs = o.facing || 1;
  return {
    headX: x + hx * sc * fs, headY: y + hy * sc,
    handX: x + front.hand[0] * sc * fs, handY: y + front.hand[1] * sc,
    bagX: bagPos ? x + bagPos[0] * sc * fs : x, bagY: bagPos ? y + bagPos[1] * sc : y - 60 * sc,
  };
}

// K9 police dog (German Shepherd) with a proper gallop. Faces right; feet on y=0.
export function drawDog(ctx, x, y, sc, o = {}) {
  const ph = o.ph || 0, t = o.t || 0;
  const run = o.pose !== 'sit';
  const bark = o.pose === 'bark';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  const sg = ctx.createRadialGradient(2, 1, 2, 2, 1, 44);
  sg.addColorStop(0, 'rgba(0,0,0,0.5)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.ellipse(2, 1, 44, 6.5, 0, 0, TAU); ctx.fill();

  const g = run ? 1 : 0.15;
  const p = ph;
  const bob = run ? -Math.abs(Math.sin(p)) * 3.5 + 1.5 : Math.sin(t * 3) * 0.6;
  const stretch = run ? 1 + 0.09 * Math.sin(p - 0.6) : 1;
  const fx = 17 * stretch, hx = -17 * stretch;
  const tan = '#ad7036', tanL = '#cc9050', tanD = '#734420', black = '#120c08', cream = '#d6b588';

  const paw = (pw, col) => {
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(pw[0] + 2.6, pw[1] + 0.4, 5.6, 3.8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(pw[0] + 2.6, pw[1], 4.3, 2.7, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(pw[0] + 4, pw[1] - 1.5); ctx.lineTo(pw[0] + 4.4, pw[1] + 1.5); ctx.moveTo(pw[0] + 5.8, pw[1] - 1.2); ctx.lineTo(pw[0] + 6, pw[1] + 1.4); ctx.stroke();
  };
  const frontLeg = (off, col) => {
    const q = p + off;
    const up = Math.sin(q) * 0.95 * g + 0.05;
    const fold = Math.max(0, Math.cos(q)) * 1.5 * g;
    const s0 = [fx + 2, -28 + bob];
    const el = joint(s0[0], s0[1], up, 13);
    const wr = joint(el[0], el[1], up - fold, 11);
    const pw = joint(wr[0], wr[1], up - fold * 0.3 + 0.3, 4);
    hiLimb(ctx, [s0, el, wr, pw], 6.8, col);
    paw(pw, col);
  };
  const backLeg = (off, col) => {
    const q = p + Math.PI * 0.9 + off;
    const th = 0.45 + Math.sin(q) * 0.8 * g;
    const h0 = [hx, -30 + bob];
    const kn = joint(h0[0], h0[1], th, 13);
    const hk = joint(kn[0], kn[1], th - 1.35, 11);
    const pw = joint(hk[0], hk[1], th - 0.2 - Math.max(0, Math.cos(q)) * 0.5 * g, 9);
    hiLimb(ctx, [h0, kn, hk, pw], 7.4, col);
    paw(pw, col);
  };

  // far legs
  backLeg(0.45, shade(tanD, 0.78));
  frontLeg(0.45, shade(tanD, 0.78));

  // bushy tail, streaming with the run
  const tw = Math.sin(t * (run ? 9 : 4)) * (run ? 4 : 2);
  const tail = [[hx - 5, -41 + bob], [hx - 17, -44 + bob + tw * 0.4], [hx - 29, -39 + bob + tw], [hx - 37, -33 + bob + tw * 1.3]];
  for (let i = 0; i < 3; i++) limb(ctx, [tail[i], tail[i + 1]], 15 - i * 3, INK);
  for (let i = 0; i < 3; i++) limb(ctx, [tail[i], tail[i + 1]], 11.5 - i * 2.8, i < 2 ? tanD : black);
  limb(ctx, [tail[0], tail[1], tail[2]], 4.5, black);

  // body: deep chest, tucked waist
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(fx + 4, -47 + bob);
    ctx.bezierCurveTo(fx - 10, -49 + bob, hx + 8, -45 + bob, hx - 2, -43 + bob);
    ctx.quadraticCurveTo(hx - 12, -39 + bob, hx - 8, -26 + bob);
    ctx.quadraticCurveTo(hx + 6, -20 + bob, 0, -25 + bob);
    ctx.quadraticCurveTo(fx - 4, -15 + bob, fx + 8, -22 + bob);
    ctx.quadraticCurveTo(fx + 15, -34 + bob, fx + 4, -47 + bob);
    ctx.closePath();
  };
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  body();
  ctx.stroke();
  const bg = ctx.createLinearGradient(0, -49 + bob, 0, -16 + bob);
  bg.addColorStop(0, tanL);
  bg.addColorStop(0.5, tan);
  bg.addColorStop(1, tanD);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.save();
  body();
  ctx.clip();
  // black saddle and a light chest
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.ellipse(-3, -47 + bob, 27, 9.5, -0.04, 0, TAU); ctx.fill();
  ctx.fillStyle = cream;
  ctx.beginPath(); ctx.ellipse(fx + 6, -22 + bob, 8, 7, 0.3, 0, TAU); ctx.fill();
  ctx.restore();
  // chest ruff
  ctx.fillStyle = cream;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(fx + 9, -40 + bob);
  for (let i = 0; i < 5; i++) { ctx.lineTo(fx + 14 - i * 0.6, -37 + i * 3.4 + bob); ctx.lineTo(fx + 10.5 - i * 0.4, -35.5 + i * 3.4 + bob); }
  ctx.lineTo(fx + 6, -22 + bob);
  ctx.closePath();
  ctx.fill();

  // police harness
  ctx.fillStyle = INK;
  rr(ctx, -10, -47 + bob, 23, 18, 4); ctx.fill();
  const hgr = ctx.createLinearGradient(0, -46 + bob, 0, -30 + bob);
  hgr.addColorStop(0, '#2a3f86'); hgr.addColorStop(1, '#14204a');
  ctx.fillStyle = hgr;
  rr(ctx, -9, -46 + bob, 21, 16, 3.5); ctx.fill();
  ctx.fillStyle = '#e8ff5a';
  ctx.fillRect(-9, -34.5 + bob, 21, 2.2);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 7.5px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('K9', 0, -40.5 + bob);
  ctx.fillStyle = '#f5c84c';
  ctx.beginPath(); ctx.arc(8.2, -40.5 + bob, 2.3, 0, TAU); ctx.fill();
  ctx.fillStyle = '#101a3c';
  ctx.fillRect(fx - 3, -44 + bob, 3.5, 20);

  // near legs, then the muscles over them
  backLeg(0, tanD);
  frontLeg(0, tan);
  for (const [mx, my, rx2, ry2, rot] of [[hx + 1, -33, 11, 10, -0.35], [fx - 1, -35, 8.5, 10, 0.2]]) {
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(mx, my + bob, rx2 + 1.4, ry2 + 1.4, rot, 0, TAU); ctx.fill();
    const mg = ctx.createRadialGradient(mx + 2, my - 3 + bob, 1, mx, my + bob, rx2 + 2);
    mg.addColorStop(0, tanL); mg.addColorStop(1, tanD);
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.ellipse(mx, my + bob, rx2, ry2, rot, 0, TAU); ctx.fill();
  }
  // harness straps back over the shoulder
  ctx.fillStyle = '#14204a';
  ctx.fillRect(fx - 4, -44 + bob, 3, 13);

  // neck
  const biteK = o.bite || 0;
  const hx0 = fx + 18 + biteK * 7, hy0 = -57 + bob * 0.6 + (run ? Math.sin(p * 2) * 1.1 : 0) + biteK * 3;
  const neck = () => {
    ctx.beginPath();
    ctx.moveTo(fx - 2, -46 + bob);
    ctx.quadraticCurveTo(fx + 6, -56 + bob, hx0 - 6, hy0 - 6);
    ctx.lineTo(hx0 + 3, hy0 + 8);
    ctx.quadraticCurveTo(fx + 12, -36 + bob, fx + 9, -30 + bob);
    ctx.closePath();
  };
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = INK;
  neck();
  ctx.stroke();
  ctx.fillStyle = tan;
  ctx.fill();
  ctx.save();
  neck();
  ctx.clip();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.ellipse(fx + 2, -52 + bob, 9, 6, -0.7, 0, TAU); ctx.fill();
  ctx.restore();
  // collar + tag
  ctx.save();
  ctx.translate(fx + 9, -44 + bob);
  ctx.rotate(-0.55);
  ctx.fillStyle = INK;
  rr(ctx, -2.8, -9, 5.6, 18, 2); ctx.fill();
  ctx.fillStyle = '#d63a3a';
  rr(ctx, -1.8, -8, 3.6, 16, 1.5); ctx.fill();
  ctx.restore();
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(fx + 13, -38 + bob, 3.4, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath(); ctx.arc(fx + 13, -38 + bob, 2.4, 0, TAU); ctx.fill();

  // head
  const hx2 = hx0, hy2 = hy0;
  // ears
  for (const [ex, tipx, col] of [[-7, -7, shade(black, 1)], [0, 2.5, black]]) {
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.moveTo(hx2 + ex - 6, hy2 - 4); ctx.quadraticCurveTo(hx2 + ex - 3, hy2 - 18, hx2 + tipx, hy2 - 26); ctx.quadraticCurveTo(hx2 + ex + 7, hy2 - 14, hx2 + ex + 7, hy2 - 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(hx2 + ex - 4.5, hy2 - 4.5); ctx.quadraticCurveTo(hx2 + ex - 2, hy2 - 17, hx2 + tipx, hy2 - 23.5); ctx.quadraticCurveTo(hx2 + ex + 5.6, hy2 - 13.5, hx2 + ex + 5.6, hy2 - 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d8916f';
    ctx.beginPath(); ctx.moveTo(hx2 + ex - 2, hy2 - 6); ctx.quadraticCurveTo(hx2 + ex - 0.5, hy2 - 14, hx2 + tipx * 0.9 + ex * 0.1, hy2 - 18); ctx.quadraticCurveTo(hx2 + ex + 3.6, hy2 - 12, hx2 + ex + 3.4, hy2 - 6.5); ctx.closePath(); ctx.fill();
  }
  // skull
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.ellipse(hx2, hy2, 12.6, 11, 0, 0, TAU); ctx.fill();
  const sk = ctx.createRadialGradient(hx2 + 3, hy2 - 4, 1, hx2, hy2, 13);
  sk.addColorStop(0, tanL); sk.addColorStop(1, tan);
  ctx.fillStyle = sk;
  ctx.beginPath(); ctx.ellipse(hx2, hy2, 11.2, 9.6, 0, 0, TAU); ctx.fill();
  // fluffy cheek
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.moveTo(hx2 - 9, hy2 + 1);
  for (let i = 0; i < 4; i++) { ctx.lineTo(hx2 - 8 + i * 3, hy2 + 9 + (i % 2) * 2); }
  ctx.lineTo(hx2 + 4, hy2 + 5);
  ctx.closePath();
  ctx.fill();
  // dark cap
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.ellipse(hx2 - 1, hy2 - 6, 8.5, 4, -0.15, 0, TAU); ctx.fill();
  // muzzle (black mask)
  const open = (run || bark ? (bark ? 5.5 : 3.4) : 1) + (o.bite || 0) * 5 * (0.6 + 0.4 * Math.abs(Math.sin(t * 22)));
  const muz = () => {
    ctx.beginPath();
    ctx.moveTo(hx2 + 4, hy2 - 6);
    ctx.quadraticCurveTo(hx2 + 16, hy2 - 5, hx2 + 25, hy2 - 1);
    ctx.quadraticCurveTo(hx2 + 27.5, hy2 + 3, hx2 + 23, hy2 + 4);
    ctx.lineTo(hx2 + 6, hy2 + 6);
    ctx.closePath();
  };
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  muz();
  ctx.stroke();
  const mz = ctx.createLinearGradient(hx2 + 4, 0, hx2 + 26, 0);
  mz.addColorStop(0, '#5a3a20'); mz.addColorStop(0.45, '#241812'); mz.addColorStop(1, '#0c0806');
  ctx.fillStyle = mz;
  ctx.fill();
  // snarl: lips pulled back, fangs bared, drool
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.moveTo(hx2 + 6, hy2 + 4.5); ctx.lineTo(hx2 + 22.5, hy2 + 4); ctx.quadraticCurveTo(hx2 + 21.5, hy2 + 7.5 + open, hx2 + 17, hy2 + 8 + open); ctx.lineTo(hx2 + 7, hy2 + 8.5 + open * 0.6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3e0c0e';
  ctx.beginPath(); ctx.moveTo(hx2 + 8, hy2 + 5.4); ctx.lineTo(hx2 + 21, hy2 + 5); ctx.quadraticCurveTo(hx2 + 20, hy2 + 6.5 + open, hx2 + 16.5, hy2 + 7 + open); ctx.lineTo(hx2 + 8.5, hy2 + 7.4 + open * 0.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b8434e';
  ctx.fillRect(hx2 + 9, hy2 + 4.2, 12, 1.5);
  ctx.fillStyle = '#fbf7ea';
  for (let i = 0; i < 5; i++) { const tx = hx2 + 10.5 + i * 1.9; ctx.beginPath(); ctx.moveTo(tx, hy2 + 5.6); ctx.lineTo(tx + 0.9, hy2 + 6.9); ctx.lineTo(tx + 1.8, hy2 + 5.6); ctx.fill(); }
  for (const fx2 of [8.6, 19.4]) { ctx.beginPath(); ctx.moveTo(hx2 + fx2, hy2 + 5.3); ctx.lineTo(hx2 + fx2 + 1.1, hy2 + 9.6); ctx.lineTo(hx2 + fx2 + 2.3, hy2 + 5.3); ctx.closePath(); ctx.fill(); }
  for (const fx2 of [10.5, 17]) { ctx.beginPath(); ctx.moveTo(hx2 + fx2, hy2 + 7.2 + open * 0.8); ctx.lineTo(hx2 + fx2 + 1, hy2 + 4.6 + open * 0.5); ctx.lineTo(hx2 + fx2 + 2, hy2 + 7.2 + open * 0.8); ctx.closePath(); ctx.fill(); }
  if (run || bark) {
    const dr = (t * 1.4) % 1;
    ctx.fillStyle = 'rgba(220,235,255,0.7)';
    ctx.beginPath(); ctx.ellipse(hx2 + 14, hy2 + 9 + open + dr * 7, 0.9, 1.6 + dr * 2.2, 0, 0, TAU); ctx.fill();
  }
  // snout wrinkles
  ctx.strokeStyle = 'rgba(0,0,0,0.65)';
  ctx.lineWidth = 0.9;
  for (const wx of [12.5, 15.5, 18.5]) { ctx.beginPath(); ctx.moveTo(hx2 + wx, hy2 - 4); ctx.quadraticCurveTo(hx2 + wx + 1.6, hy2 - 2.4, hx2 + wx + 0.5, hy2 - 0.6); ctx.stroke(); }
  // nose
  ctx.fillStyle = '#050505';
  ctx.beginPath(); ctx.ellipse(hx2 + 25, hy2 + 0.2, 3.8, 3.1, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.ellipse(hx2 + 25.6, hy2 - 0.9, 1.3, 0.8, 0, 0, TAU); ctx.fill();
  // amber eye with a brow ridge
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.ellipse(hx2 + 5.5, hy2 - 2.2, 3.6, 2.8, -0.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffb21e';
  ctx.beginPath(); ctx.ellipse(hx2 + 5.5, hy2 - 2.2, 2.7, 2, -0.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#120a04';
  ctx.beginPath(); ctx.arc(hx2 + 6.2, hy2 - 2.1, 1.25, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(hx2 + 6.7, hy2 - 2.8, 0.6, 0, TAU); ctx.fill();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.moveTo(hx2 + 0.5, hy2 - 7.8); ctx.lineTo(hx2 + 10.2, hy2 - 3.4); ctx.lineTo(hx2 + 9.4, hy2 - 1.9); ctx.lineTo(hx2 + 1.2, hy2 - 5.2); ctx.closePath(); ctx.fill();
  // bark lines
  if (bark && Math.floor(t * 6) % 2 === 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    for (const [dx2, dy2] of [[30, -6], [33, 1], [30, 8]]) { ctx.beginPath(); ctx.moveTo(hx2 + dx2, hy2 + dy2); ctx.lineTo(hx2 + dx2 + 5, hy2 + dy2 * 1.3); ctx.stroke(); }
  }
  ctx.restore();
}
