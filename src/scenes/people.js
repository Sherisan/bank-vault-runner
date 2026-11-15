// A poseable side-view person (faces right; facing:-1 mirrors).
// Local units: feet on y=0, head top near y=-115. Scale with `sc`.
import { TAU, rr, limb, joint } from './util';

export const OUTFITS = {
  robber: { skin: '#d99a6c', torso: '#ece4d2', stripes: '#1d1f2b', sleeve: '#1d1f2b', pants: '#262a3d', shoe: '#0c0d12', hat: { type: 'beanie', color: '#191a24' }, mask: true },
  police: { skin: '#a8714a', torso: '#22346b', sleeve: '#22346b', pants: '#141c3a', shoe: '#0a0a10', belt: '#0b0b10', badge: '#f2c14e', hat: { type: 'peaked', color: '#141c3a', band: '#0b1024', badge: '#f2c14e' } },
  guard: { skin: '#e2b08a', torso: '#4a5568', sleeve: '#4a5568', pants: '#2d3442', shoe: '#0a0a10', belt: '#111', badge: '#c9d1dc', hat: { type: 'cap', color: '#2d3748' } },
};

export function drawHat(ctx, hat) {
  if (!hat) return;
  ctx.fillStyle = hat.color;
  if (hat.type === 'beanie') {
    ctx.beginPath();
    ctx.arc(0, -1, 12, Math.PI + 0.1, -0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a2c3a';
    rr(ctx, -12.5, -5, 25, 4.5, 2);
    ctx.fill();
  } else if (hat.type === 'cap') {
    ctx.beginPath();
    ctx.arc(0, -2, 12, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    rr(ctx, 4, -4.5, 15, 3.5, 1.5); // brim forward
    ctx.fill();
  } else if (hat.type === 'peaked') {
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-14, -15);
    ctx.quadraticCurveTo(0, -20, 15, -14);
    ctx.lineTo(12, -4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = hat.band || '#000';
    ctx.fillRect(-12, -7, 24, 3.5);
    ctx.fillStyle = '#0a0a0e';
    ctx.beginPath();
    ctx.moveTo(6, -4);
    ctx.quadraticCurveTo(15, -4, 18, -1.5);
    ctx.lineTo(6, -2);
    ctx.closePath();
    ctx.fill();
    if (hat.badge) {
      ctx.fillStyle = hat.badge;
      ctx.beginPath();
      ctx.arc(6, -12, 2.4, 0, TAU);
      ctx.fill();
    }
  }
}

export function drawMustache(ctx) {
  ctx.fillStyle = '#17110c';
  ctx.beginPath();
  ctx.moveTo(4, 5.5);
  ctx.quadraticCurveTo(7, 3.2, 10, 4.6);
  ctx.quadraticCurveTo(13, 3.2, 15, 6);
  ctx.quadraticCurveTo(12, 7.6, 10, 6.6);
  ctx.quadraticCurveTo(7, 7.8, 4, 5.5);
  ctx.fill();
}

export function drawItem(ctx, item, opts = {}) {
  // drawn in hand-local coords: hand at (0,0)
  if (item === 'flashlight') {
    ctx.fillStyle = '#2b2d36';
    rr(ctx, -2, -3, 14, 6, 2);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(11, -3.5, 3, 7);
  } else if (item === 'mop') {
    ctx.strokeStyle = '#a87b4a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-14, 26);
    ctx.lineTo(10, -30);
    ctx.stroke();
    ctx.fillStyle = '#cfd6e0';
    ctx.beginPath();
    ctx.ellipse(-15, 29, 7, 4, 0.4, 0, TAU);
    ctx.fill();
  } else if (item === 'clipboard') {
    ctx.fillStyle = '#8a5a2b';
    rr(ctx, -4, -14, 13, 17, 1.5);
    ctx.fill();
    ctx.fillStyle = '#f4f1e8';
    ctx.fillRect(-2.5, -11, 10, 13);
    ctx.fillStyle = '#9aa';
    for (let i = 0; i < 4; i++) ctx.fillRect(-1, -9 + i * 3, 7, 1);
  } else if (item === 'briefcase') {
    ctx.fillStyle = '#4a2e1a';
    rr(ctx, -9, 2, 18, 13, 2);
    ctx.fill();
    ctx.strokeStyle = '#2a190c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 2, 4, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#d8a93a';
    ctx.fillRect(-1.5, 6, 3, 2.5);
  } else if (item === 'drill') {
    ctx.fillStyle = '#e0b43a';
    rr(ctx, -4, -6, 20, 9, 3);
    ctx.fill();
    ctx.fillStyle = '#222';
    rr(ctx, -2, 0, 6, 10, 2);
    ctx.fill();
    ctx.fillStyle = '#b8c2c8';
    ctx.fillRect(16, -3, 12, 3);
  } else if (item === 'baton') {
    ctx.strokeStyle = '#0b0b0e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-2, 2);
    ctx.lineTo(16, -8);
    ctx.stroke();
  }
}

export function drawBag(ctx, bx, by, r) {
  const g = ctx.createRadialGradient(bx - r * 0.3, by - r * 0.35, 2, bx, by, r * 1.15);
  g.addColorStop(0, '#a06a35');
  g.addColorStop(1, '#6a421f');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#3c2510';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(bx, by, r, r * 0.95, -0.2, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  rr(ctx, bx - r * 0.7, by + r * 0.1, r * 0.4, r * 0.35, 1.5);
  ctx.fill();
  ctx.fillStyle = '#e8b24a';
  ctx.font = `900 ${Math.round(r * 1.05)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', bx - 1, by + 1);
}

/**
 * o: { pose: 'idle'|'walk'|'run'|'jump'|'slide'|'hands'|'grab', ph, t, facing, outfit, item, bag (radius), amp, hide: {hat, mustache, item} }
 */
export function drawPerson(ctx, x, y, sc, o) {
  const f = o.outfit;
  const pose = o.pose || 'idle';
  const ph = o.ph || 0, t = o.t || 0;
  const hide = o.hide || {};
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc * (o.facing || 1), sc);

  if (!o.noShadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(pose === 'slide' ? 8 : 0, 1, pose === 'slide' ? 40 : 24, 5, 0, 0, TAU);
    ctx.fill();
  }

  const moving = pose === 'run' || pose === 'walk' || pose === 'grab';
  const walk = pose === 'walk';
  const amp = o.amp ?? (walk ? 0.55 : 0.85);
  let hipY = -46, lean = 0.04, bob = 0;
  if (moving) { bob = -Math.abs(Math.sin(ph)) * (walk ? 2.5 : 5); lean = walk ? 0.08 : 0.3; }
  if (pose === 'grab') lean = 0.45;
  if (pose === 'idle') bob = Math.sin(t * 2.4) * 1.2;
  if (pose === 'hands') lean = -0.06;
  if (pose === 'jump') lean = 0.22;
  if (pose === 'slide') { lean = -1.05; hipY = -9; }
  hipY += bob;
  const hipX = 0;

  const legAngles = (side) => {
    if (moving) {
      const p = ph + side;
      const th = Math.sin(p) * amp;
      return [th, th - (0.15 + Math.max(0, Math.cos(p)) * (walk ? 0.7 : 1.35))];
    }
    if (pose === 'jump') return side === 0 ? [1.05, 0.15] : [-0.45, -1.55];
    if (pose === 'slide') return side === 0 ? [1.5, 1.55] : [2.2, 0.9];
    return side === 0 ? [0.12, 0.12] : [-0.12, -0.12];
  };
  const drawLeg = (side, color) => {
    const [th, sh] = legAngles(side);
    const knee = joint(hipX, hipY, th, 22);
    const foot = joint(knee[0], knee[1], sh, 22);
    limb(ctx, [[hipX, hipY], knee, foot], 10, color);
    ctx.fillStyle = f.shoe;
    ctx.beginPath();
    ctx.ellipse(foot[0] + 4, foot[1] + 1, 8, 4.2, moving ? sh * 0.4 : 0, 0, TAU);
    ctx.fill();
  };

  const sx = hipX + Math.sin(lean) * 34, sy = hipY - Math.cos(lean) * 34;
  const arm = (side) => {
    // returns [upper, fore] angles
    if (pose === 'hands') return side === 0 ? [Math.PI - 0.3, Math.PI - 0.12] : [Math.PI + 0.25, Math.PI + 0.1];
    if (pose === 'grab') return side === 0 ? [1.45, 1.6] : [1.2, 1.5];
    if (pose === 'jump') return side === 0 ? [2.3, 2.6] : [-0.9, -0.5];
    if (pose === 'slide') return side === 0 ? [0.5, 1.2] : [-0.4, 0.2];
    if (o.item === 'drill' && side === 0) return [1.35, 1.55];
    if (o.item === 'clipboard' && side === 0) return [0.4, 2.0];
    if (moving) {
      const a = Math.sin(ph) * amp * 1.1;
      return side === 0 ? [-a, -a + (walk ? 0.5 : 1.3)] : [a, a + (walk ? 0.4 : 1.2)];
    }
    return side === 0 ? [0.15, 0.35] : [-0.1, 0.1];
  };
  const drawArm = (side, color) => {
    const [ua, fa] = arm(side);
    const ox = side === 0 ? sx + 2 : sx - 3;
    const oy = sy + 1;
    const el = joint(ox, oy, ua, 15);
    const hand = joint(el[0], el[1], fa, 14);
    limb(ctx, [[ox, oy], el, hand], 7.5, color);
    ctx.fillStyle = f.skin;
    ctx.beginPath();
    ctx.arc(hand[0], hand[1], 4, 0, TAU);
    ctx.fill();
    return { hand, fa };
  };

  // back leg + back arm (behind torso)
  drawLeg(Math.PI, shade(f.pants));
  if (o.bag) {
    const bx = sx - 6 - o.bag * 0.75, by = sy + 3 + (moving ? Math.sin(ph * 2) * 2.2 : 0);
    drawBag(ctx, bx, by, o.bag);
    limb(ctx, [[sx, sy], [sx + 7, sy + 7], [bx + o.bag * 0.7, by - o.bag * 0.75]], 7, f.sleeve);
    ctx.fillStyle = f.skin;
    ctx.beginPath();
    ctx.arc(bx + o.bag * 0.7, by - o.bag * 0.75, 3.6, 0, TAU);
    ctx.fill();
  } else {
    const back = drawArm(1, shade(f.sleeve));
    if (o.item === 'mop' && !hide.item) {
      ctx.save(); ctx.translate(back.hand[0], back.hand[1]); drawItem(ctx, 'mop'); ctx.restore();
    }
  }
  drawLeg(0, f.pants);

  // torso
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(lean);
  rr(ctx, -12, -37, 25, 40, 10);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = f.torso;
  ctx.fillRect(-14, -40, 30, 46);
  if (f.stripes) {
    ctx.fillStyle = f.stripes;
    for (let yy = -36; yy < 6; yy += 7) ctx.fillRect(-14, yy, 30, 3.4);
  }
  if (f.lapel) {
    ctx.fillStyle = '#f2f2f2';
    ctx.beginPath(); ctx.moveTo(2, -37); ctx.lineTo(13, -37); ctx.lineTo(9, -22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = f.tie;
    ctx.beginPath(); ctx.moveTo(8, -35); ctx.lineTo(11, -35); ctx.lineTo(10.5, -18); ctx.lineTo(8.5, -20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = f.lapel;
    ctx.beginPath(); ctx.moveTo(0, -37); ctx.lineTo(6, -37); ctx.lineTo(8, -24); ctx.closePath(); ctx.fill();
  }
  if (f.sash) {
    ctx.strokeStyle = f.sash;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-10, -34); ctx.lineTo(14, -6); ctx.stroke();
  }
  if (f.belt) { ctx.fillStyle = f.belt; ctx.fillRect(-14, -6, 30, 4); }
  if (f.pocket) { ctx.fillStyle = f.pocket; ctx.fillRect(2, -28, 8, 6); }
  ctx.restore();
  if (f.badge) {
    ctx.fillStyle = f.badge;
    ctx.beginPath(); ctx.arc(7, -27, 2.6, 0, TAU); ctx.fill();
  }
  if (f.medals) {
    const cols = ['#d8a93a', '#c23b3b', '#3b7bc2'];
    cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(1 + i * 3.4, -30, 2.6, 4); });
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 1.5;
  rr(ctx, -12, -37, 25, 40, 10);
  ctx.stroke();
  // long coat
  if (f.coat) {
    const sway = moving ? Math.sin(ph * 2) * 3 : 0;
    ctx.fillStyle = f.coat;
    ctx.beginPath();
    ctx.moveTo(-13, -36);
    ctx.lineTo(13, -36);
    ctx.lineTo(13 + sway * 0.4, 12);
    ctx.lineTo(-15 + sway, 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.stroke();
    ctx.fillStyle = f.torso;
    ctx.beginPath(); ctx.moveTo(3, -36); ctx.lineTo(11, -36); ctx.lineTo(7, -20); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // head
  const hx = sx + Math.sin(lean) * 12 + 3, hy = sy - Math.cos(lean) * 12 - 2;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(lean * 0.4);
  ctx.fillStyle = f.skin;
  ctx.beginPath(); ctx.arc(0, 0, 11.5, 0, TAU); ctx.fill();
  ctx.fillStyle = shade(f.skin);
  ctx.beginPath(); ctx.arc(-3, 3, 2.6, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(11.6, 3.5, 2.6, 0, TAU); ctx.fill();
  if (f.hair && (!f.hat || hide.hat)) {
    ctx.fillStyle = f.hair;
    ctx.beginPath(); ctx.arc(-1, -2, 12, Math.PI * 0.95, Math.PI * 1.9); ctx.closePath(); ctx.fill();
  }
  if (f.mask) {
    ctx.fillStyle = '#0c0d12';
    rr(ctx, -10.5, -0.5, 22.5, 6, 2.5);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(4.5, 2.5, 2.2, 1.9, 0, 0, TAU);
    ctx.ellipse(9.6, 2.5, 2.2, 1.9, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    const look = pose === 'hands' ? -0.6 : 0.8;
    ctx.arc(4.5 + look, 2.6, 1, 0, TAU);
    ctx.arc(9.6 + look, 2.6, 1, 0, TAU);
    ctx.fill();
  } else {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(7, -0.5, 2.4, 2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#16120f';
    ctx.beginPath(); ctx.arc(pose === 'hands' ? 7 : 7.8, -0.4, 1.2, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(30,20,10,0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(4.5, -4); ctx.lineTo(9.5, -4.5); ctx.stroke();
  }
  if (f.glasses === 'sun') {
    ctx.fillStyle = '#0b0b10';
    rr(ctx, 3, -3, 9.5, 4.8, 2);
    ctx.fill();
    ctx.fillRect(-6, -2, 9, 1.4);
  } else if (f.glasses === 'clear') {
    ctx.strokeStyle = '#2a2a33';
    ctx.lineWidth = 1.2;
    rr(ctx, 4, -3, 7, 5, 1.5);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(4, -1); ctx.stroke();
  }
  // mouth
  ctx.fillStyle = '#5a2a1a';
  if (pose === 'hands') { ctx.beginPath(); ctx.ellipse(8, 8.2, 2, 2.4, 0, 0, TAU); ctx.fill(); }
  else ctx.fillRect(6, 8, 5, 1.4);
  if (f.mustache && !hide.mustache) drawMustache(ctx);
  if (!hide.hat) drawHat(ctx, f.hat);
  ctx.restore();

  // front arm + held item
  const front = drawArm(0, f.sleeve);
  if (o.item && o.item !== 'mop' && !hide.item) {
    ctx.save();
    ctx.translate(front.hand[0], front.hand[1]);
    if (o.item === 'drill' || o.item === 'flashlight') ctx.rotate(Math.PI / 2 - front.fa);
    drawItem(ctx, o.item);
    ctx.restore();
  }
  ctx.restore();
  return { headX: x + hx * sc * (o.facing || 1), headY: y + hy * sc, handX: x + front.hand[0] * sc * (o.facing || 1), handY: y + front.hand[1] * sc };
}

function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * 0.72);
  const g = Math.round(((n >> 8) & 255) * 0.72);
  const b = Math.round((n & 255) * 0.72);
  return `rgb(${r},${g},${b})`;
}
