// Poseable side-view characters (face right; facing:-1 mirrors).
// Local units: feet on y=0, head top near y=-122. Scale with `sc`.
import { TAU, rr, limb, joint } from './util';

const INK = 'rgba(6,8,12,0.9)';

export const OUTFITS = {
  robber: {
    skin: '#e8ae80', torso: '#f5eedd', stripes: '#191b27', sleeve: '#1d1f2c', pants: '#2a3050',
    shoe: '#c0392b', sole: '#f2efe6', laces: '#f2efe6', glove: '#14151c', mask: '#17181f',
    scarf: '#e0413a', collar: '#191b27', belt: '#2b2118', pouches: '#3a3a2a', strap: true,
    build: { leg: 20, legW: 14.5, arm: 14.5, armW: 11.5, torso: 1.12, head: 1.16, shoe: 1.18 },
    hat: { type: 'beanie', color: '#1a1b26', pom: '#e04848' },
  },
  police: {
    skin: '#a8714a', torso: '#24397a', sleeve: '#24397a', pants: '#121a38', shoe: '#08080d', sole: '#2a2c34',
    glove: '#0d0f18', belt: '#0b0b10', badge: '#f5c84c', radio: true, tie: '#0b1024', epaulette: '#f5c84c', holster: true,
    hat: { type: 'peaked', color: '#121a38', band: '#e8e2d0', badge: '#f5c84c' },
  },
  police2: {
    skin: '#eab993', torso: '#24397a', sleeve: '#24397a', pants: '#121a38', shoe: '#08080d', sole: '#2a2c34',
    glove: '#0d0f18', belt: '#0b0b10', badge: '#f5c84c', radio: true, mustache: true, shades: true, tie: '#0b1024', epaulette: '#f5c84c', holster: true,
    hat: { type: 'peaked', color: '#121a38', band: '#e8e2d0', badge: '#f5c84c' },
  },
  guard: {
    skin: '#e2b08a', torso: '#66718a', sleeve: '#66718a', pants: '#2c3343', shoe: '#0a0a10', sole: '#2a2c34',
    belt: '#111', badge: '#d4dbe4', patch: '#d4dbe4', belly: true, keys: true, mustache: true, brow: '#5a3a20',
    hat: { type: 'cap', color: '#2c3546' },
  },
  swat: {
    skin: '#c48b62', torso: '#20252c', vest: '#323a45', vestText: 'SWAT', sleeve: '#262b33', pants: '#1d2127',
    shoe: '#0a0a0c', sole: '#1a1b1e', glove: '#0d0e10', knee: '#101215', belt: '#0b0b0e', holster: true,
    hat: { type: 'helmet', color: '#15181d' },
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
    const L = 10, pts = [];
    for (let i = 0; i <= L; i++) {
      const u = i / L;
      pts.push([
        nx - 4 - k * 3 - u * (9 + 44 * wind),
        ny + 3 + k * 4 + u * (30 - 26 * wind) + Math.sin(t * (5 + 11 * wind) - u * 5 + k * 1.7) * u * (2.5 + 6 * wind),
      ]);
    }
    const left = [], right = [];
    for (let i = 0; i <= L; i++) {
      const p = pts[i], q = pts[Math.min(L, i + 1)], o = pts[Math.max(0, i - 1)];
      let dx = q[0] - o[0], dy = q[1] - o[1];
      const d = Math.hypot(dx, dy) || 1;
      dx /= d; dy /= d;
      const hw = (4.6 - i * 0.16) * (k ? 0.88 : 1);
      left.push([p[0] - dy * hw, p[1] + dx * hw]);
      right.push([p[0] + dy * hw, p[1] - dx * hw]);
    }
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (const p of left) ctx.lineTo(p[0], p[1]);
    for (let i = L; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.fillStyle = k ? shade(color, 0.75) : color;
    ctx.fill();
    // a white band near the end and a frayed fringe
    const e = pts[L - 2];
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(e[0], e[1], 2.2, 0, TAU); ctx.fill();
    ctx.strokeStyle = k ? shade(color, 0.75) : color;
    ctx.lineWidth = 1.4;
    for (let f = -1; f <= 1; f++) {
      const p = pts[L];
      ctx.beginPath(); ctx.moveTo(p[0], p[1] + f * 2); ctx.lineTo(p[0] - 5, p[1] + f * 3 + Math.sin(t * 12 + f) * 1.5); ctx.stroke();
    }
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
    return side === 0 ? [0.12, 0.12] : [-0.12, -0.12];
  };
  const drawLeg = (side, color) => {
    const [th, sh] = legAngles(side);
    const knee = joint(hipX, hipY, th, B.leg);
    const foot = joint(knee[0], knee[1], sh, B.leg);
    hiLimb(ctx, [[hipX, hipY], knee, foot], B.legW, color);
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
  if (f.stripes) {
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
  ctx.fillStyle = INK;
  head(1.6);
  ctx.fill();
  const face = f.mask || f.skin;
  const hg = ctx.createRadialGradient(6, -6, 2, 2, 2, 18);
  hg.addColorStop(0, f.mask ? '#34364a' : shade(f.skin, 1.15));
  hg.addColorStop(1, f.mask ? f.mask : shade(f.skin, 0.92));
  ctx.fillStyle = hg;
  head(0);
  ctx.fill();
  // ear
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(-4, 2, 4.6, 0, TAU); ctx.fill();
  ctx.fillStyle = f.mask ? '#26283a' : shade(f.skin, 0.86);
  ctx.beginPath(); ctx.arc(-4, 2, 3.4, 0, TAU); ctx.fill();
  // nose
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.ellipse(15.5, 2.5, 5, 4.3, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = f.mask ? '#2a2c3c' : shade(f.skin, 0.95);
  ctx.beginPath(); ctx.ellipse(15.5, 2.5, 3.8, 3.2, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath(); ctx.arc(16.5, 1.2, 1.1, 0, TAU); ctx.fill();

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
    // mouth hole
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(11.6, 10.2, 6.8, scared ? 5.4 : 4.4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = f.skin;
    ctx.beginPath(); ctx.ellipse(11.6, 10.2, 5.6, scared ? 4.2 : 3.2, 0, 0, TAU); ctx.fill();
    if (scared) {
      ctx.fillStyle = '#4a1414';
      ctx.beginPath(); ctx.ellipse(11.6, 10.6, 2.8, 3, 0, 0, TAU); ctx.fill();
    } else {
      ctx.fillStyle = '#4a1414';
      ctx.beginPath(); ctx.moveTo(7.4, 9.1); ctx.quadraticCurveTo(11.6, 15, 16, 8.6); ctx.quadraticCurveTo(11.6, 10.8, 7.4, 9.1); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(8.2, 9.4); ctx.quadraticCurveTo(11.6, 11.2, 15.2, 9); ctx.lineTo(15, 10.4); ctx.quadraticCurveTo(11.6, 12.2, 8.4, 10.6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffcf3a';
      ctx.fillRect(12.4, 9.9, 1.8, 1.8);
      ctx.fillStyle = '#fff8d0';
      ctx.fillRect(12.6, 10, 0.7, 0.7);
    }
  } else {
    if (f.shades) {
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.moveTo(4, -5); ctx.lineTo(15, -5); ctx.quadraticCurveTo(15, 2, 10, 2); ctx.quadraticCurveTo(4.5, 2, 4, -5); ctx.fill();
      const sg2 = ctx.createLinearGradient(0, -5, 0, 2);
      sg2.addColorStop(0, '#3a4a6a'); sg2.addColorStop(1, '#0c0f18');
      ctx.fillStyle = sg2;
      ctx.beginPath(); ctx.moveTo(5.2, -4.2); ctx.lineTo(14, -4.2); ctx.quadraticCurveTo(14, 1, 10, 1); ctx.quadraticCurveTo(5.6, 1, 5.2, -4.2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(7, -3.6, 3, 1);
      ctx.fillStyle = INK;
      ctx.fillRect(-3, -4, 8, 1.6);
    } else {
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.ellipse(9.5, -2, 4.2, 3.9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(9.5, -2, 3.2, 2.9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#20160e';
      ctx.beginPath(); ctx.arc(scared ? 9 : 10.5, -1.8, 1.7, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(scared ? 9.6 : 11.1, -2.6, 0.6, 0, TAU); ctx.fill();
    }
    // stern brow
    ctx.strokeStyle = f.brow || '#2a1a10';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(5, -8.5); ctx.lineTo(13.5, -6); ctx.stroke();
    // mouth
    ctx.strokeStyle = '#4a1e12';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    if (pose === 'grab') { ctx.fillStyle = '#4a1e12'; ctx.ellipse(11, 10, 3, 2.4, 0, 0, TAU); ctx.fill(); }
    else { ctx.moveTo(7.5, 10.5); ctx.quadraticCurveTo(10.5, 9, 14, 10.5); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,110,110,0.2)';
    ctx.beginPath(); ctx.ellipse(5, 4, 3.4, 2.2, 0, 0, TAU); ctx.fill();
  }
  if (f.mustache) { ctx.save(); ctx.translate(1, 2.5); drawMustache(ctx); ctx.restore(); }
  ctx.save();
  ctx.translate(0, -1.5);
  ctx.scale(1.12, 1.12);
  drawHat(ctx, f.hat, t);
  ctx.restore();
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

// K9 police dog (German Shepherd). Faces right.
export function drawDog(ctx, x, y, sc, o = {}) {
  const ph = o.ph || 0, t = o.t || 0;
  const run = o.pose !== 'sit';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  const sg = ctx.createRadialGradient(4, 1, 2, 4, 1, 40);
  sg.addColorStop(0, 'rgba(0,0,0,0.45)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.ellipse(4, 1, 40, 6, 0, 0, TAU); ctx.fill();

  const bob = run ? Math.sin(ph * 2) * 2.8 : 0;
  const tan = '#c88a4a', tanD = '#94612f', black = '#1c1510';
  const g = run ? 1 : 0;
  const leg = (bx, by, a1, a2, col, back) => {
    const k = joint(bx, by, a1, back ? 13 : 12);
    const p = joint(k[0], k[1], a2, back ? 13 : 12.5);
    hiLimb(ctx, [[bx, by], k, p], back ? 7 : 6, col);
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.ellipse(p[0] + 2.5, p[1] + 0.5, 5, 3.6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(p[0] + 2.5, p[1], 3.8, 2.5, 0, 0, TAU); ctx.fill();
  };
  // gallop: the back pair lags the front pair
  const fa = (off) => Math.sin(ph + off) * 1.05 * g;
  const ba = (off) => Math.sin(ph + Math.PI * 0.85 + off) * 1.0 * g;
  leg(-19, -28 + bob, ba(0.5), ba(0.5) - 0.9 * g - 0.2, shade(tanD, 0.8), true);
  leg(16, -26 + bob, fa(0.5), fa(0.5) + 0.35 * g, shade(tanD, 0.8), false);

  // bushy tail
  const wag = Math.sin(t * 13) * 5;
  const tail = [[-24, -36 + bob], [-36, -40 + bob + wag * 0.4], [-48, -32 + bob + wag]];
  limb(ctx, tail, 13, INK);
  limb(ctx, tail, 10, tanD);
  limb(ctx, [tail[1], tail[2]], 7, black);

  // body
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(19, -46 + bob);
    ctx.quadraticCurveTo(-2, -45 + bob, -22, -40 + bob);
    ctx.quadraticCurveTo(-31, -33 + bob, -25, -23 + bob);
    ctx.quadraticCurveTo(-12, -21 + bob, -2, -25 + bob);
    ctx.quadraticCurveTo(12, -15 + bob, 23, -24 + bob);
    ctx.quadraticCurveTo(30, -35 + bob, 19, -46 + bob);
    ctx.closePath();
  };
  ctx.fillStyle = INK;
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = INK;
  body();
  ctx.stroke();
  const bg = ctx.createLinearGradient(0, -46 + bob, 0, -18 + bob);
  bg.addColorStop(0, tan);
  bg.addColorStop(1, tanD);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.save();
  body();
  ctx.clip();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.ellipse(-4, -44 + bob, 24, 8, -0.05, 0, TAU); ctx.fill();
  ctx.fillStyle = '#efcf9e';
  ctx.beginPath(); ctx.ellipse(18, -20 + bob, 9, 6, 0, 0, TAU); ctx.fill();
  ctx.restore();
  // K9 harness
  ctx.fillStyle = INK;
  rr(ctx, -9, -44 + bob, 20, 16, 3.5); ctx.fill();
  ctx.fillStyle = '#1b2a5a';
  rr(ctx, -8, -43 + bob, 18, 14, 3); ctx.fill();
  ctx.fillStyle = '#f5c84c';
  ctx.font = '900 7.5px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('K9', 1, -36 + bob);
  ctx.fillStyle = '#0f1a3a';
  ctx.fillRect(11, -42 + bob, 3, 14);

  leg(-16, -26 + bob, ba(0), ba(0) - 0.9 * g - 0.2, tanD, true);
  leg(19, -25 + bob, fa(0), fa(0) + 0.35 * g, tan, false);

  // neck + head
  const hx = 31, hy = -52 + bob;
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.moveTo(14, -45 + bob); ctx.lineTo(hx - 4, hy - 7); ctx.lineTo(hx + 4, hy + 6); ctx.lineTo(25, -30 + bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle = tan;
  ctx.beginPath(); ctx.moveTo(16, -43 + bob); ctx.lineTo(hx - 3, hy - 5); ctx.lineTo(hx + 3, hy + 5); ctx.lineTo(24, -32 + bob); ctx.closePath(); ctx.fill();
  // ears
  for (const [ex, tip] of [[-5, -5], [1, 0]]) {
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.moveTo(hx + ex - 5, hy - 4); ctx.lineTo(hx + ex + tip, hy - 21); ctx.lineTo(hx + ex + 6, hy - 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = black;
    ctx.beginPath(); ctx.moveTo(hx + ex - 3.5, hy - 4.5); ctx.lineTo(hx + ex + tip, hy - 18.5); ctx.lineTo(hx + ex + 4.5, hy - 5.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c47a6a';
    ctx.beginPath(); ctx.moveTo(hx + ex - 1.5, hy - 6); ctx.lineTo(hx + ex + tip * 0.8, hy - 14); ctx.lineTo(hx + ex + 2.5, hy - 6.5); ctx.closePath(); ctx.fill();
  }
  // skull + muzzle
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.ellipse(hx, hy, 11, 9.5, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 4, hy - 6); ctx.lineTo(hx + 22, hy - 1); ctx.quadraticCurveTo(hx + 24, hy + 5, hx + 19, hy + 6); ctx.lineTo(hx + 4, hy + 7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = tan;
  ctx.beginPath(); ctx.ellipse(hx, hy, 9.6, 8.2, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 4, hy - 4.8); ctx.lineTo(hx + 21, hy - 0.2); ctx.quadraticCurveTo(hx + 22.5, hy + 4, hx + 18.5, hy + 4.8); ctx.lineTo(hx + 4, hy + 5.8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = black;
  ctx.beginPath(); ctx.moveTo(hx + 8, hy - 3.6); ctx.lineTo(hx + 21, hy - 0.2); ctx.quadraticCurveTo(hx + 22.5, hy + 4, hx + 18.5, hy + 4.8); ctx.lineTo(hx + 8, hy + 4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + 1, hy - 5, 7, 3.5, -0.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#050505';
  ctx.beginPath(); ctx.ellipse(hx + 21, hy + 0.5, 3.2, 2.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.arc(hx + 21.5, hy - 0.4, 0.9, 0, TAU); ctx.fill();
  // amber eye
  ctx.fillStyle = '#e8a83a';
  ctx.beginPath(); ctx.ellipse(hx + 5, hy - 2, 2.4, 2, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(hx + 5.6, hy - 2, 1.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(hx + 6, hy - 2.6, 0.5, 0, TAU); ctx.fill();
  if (run || o.pose === 'bark') {
    ctx.fillStyle = '#3a0f0f';
    ctx.beginPath(); ctx.moveTo(hx + 8, hy + 5); ctx.lineTo(hx + 19, hy + 5); ctx.lineTo(hx + 14, hy + 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ef6f86';
    ctx.beginPath(); ctx.ellipse(hx + 12, hy + 10 + Math.sin(t * 16) * 1.2, 2.8, 4.8, 0.25, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
