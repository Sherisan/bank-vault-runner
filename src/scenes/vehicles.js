// Police vehicles. All face right; drawn around (x, y) = ground contact.
import { TAU, rr } from './util';
import { drawPerson, OUTFITS } from './people';

const INK = 'rgba(6,8,12,0.9)';

function wheel(ctx, wx, wy, r, rot) {
  ctx.fillStyle = '#07070a';
  ctx.beginPath(); ctx.arc(wx, wy, r, 0, TAU); ctx.fill();
  const g = ctx.createRadialGradient(wx - r * 0.2, wy - r * 0.2, 1, wx, wy, r * 0.6);
  g.addColorStop(0, '#e2e6ee');
  g.addColorStop(1, '#6d7585');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(wx, wy, r * 0.55, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2a2f3a';
  ctx.lineWidth = r * 0.12;
  for (let i = 0; i < 5; i++) {
    const a = rot + (i / 5) * TAU;
    ctx.beginPath();
    ctx.moveTo(wx + Math.cos(a) * r * 0.15, wy + Math.sin(a) * r * 0.15);
    ctx.lineTo(wx + Math.cos(a) * r * 0.5, wy + Math.sin(a) * r * 0.5);
    ctx.stroke();
  }
}

function strobe(ctx, cx, cy, col, radius) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, col);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}

// Police interceptor. facing 1 = right, -1 = left. Text stays readable either way.
export function drawPoliceCar(ctx, x, y, s, time, wheelRot, reduced, facing = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * facing, s);
  const text = (str, tx, ty, font, color) => {
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(facing, 1);
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, 0, 0);
    ctx.restore();
  };
  const flash = reduced ? 0 : Math.floor(time * 8) % 2;
  // headlight beams (wig-wag)
  for (const [hy, on] of [[-26, flash === 0], [-26, true]]) {
    if (!on) continue;
    const hb = ctx.createLinearGradient(92, hy, 360, hy);
    hb.addColorStop(0, 'rgba(255,248,210,0.32)');
    hb.addColorStop(1, 'rgba(255,248,210,0)');
    ctx.fillStyle = hb;
    ctx.beginPath(); ctx.moveTo(92, hy - 5); ctx.lineTo(360, hy - 50); ctx.lineTo(360, hy + 34); ctx.lineTo(92, hy + 6); ctx.closePath(); ctx.fill();
    break;
  }
  // ground shadow
  const sg = ctx.createRadialGradient(0, 2, 10, 0, 2, 100);
  sg.addColorStop(0, 'rgba(0,0,0,0.55)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.ellipse(0, 3, 100, 10, 0, 0, TAU); ctx.fill();

  const shape = (g) => {
    ctx.beginPath();
    ctx.moveTo(-92 - g, -12);
    ctx.lineTo(-91 - g, -36);
    ctx.quadraticCurveTo(-89, -44 - g, -76, -45 - g);
    ctx.lineTo(-52, -46 - g);
    ctx.lineTo(-32, -70 - g);
    ctx.quadraticCurveTo(-28, -73 - g, -22, -73 - g);
    ctx.lineTo(26, -73 - g);
    ctx.quadraticCurveTo(32, -73 - g, 36, -69 - g);
    ctx.lineTo(58, -46 - g);
    ctx.lineTo(86, -42 - g);
    ctx.quadraticCurveTo(97 + g, -39, 97 + g, -27);
    ctx.lineTo(97 + g, -12);
    ctx.closePath();
  };
  ctx.fillStyle = INK;
  shape(2.5);
  ctx.fill();
  const bg = ctx.createLinearGradient(0, -73, 0, -10);
  bg.addColorStop(0, '#3a3e4c');
  bg.addColorStop(0.35, '#15171e');
  bg.addColorStop(1, '#05060a');
  ctx.fillStyle = bg;
  shape(0);
  ctx.fill();
  // white door panels
  const dg = ctx.createLinearGradient(0, -45, 0, -14);
  dg.addColorStop(0, '#ffffff');
  dg.addColorStop(1, '#c4cad6');
  ctx.fillStyle = dg;
  ctx.beginPath(); ctx.moveTo(-50, -45); ctx.lineTo(56, -45); ctx.lineTo(58, -14); ctx.lineTo(-52, -14); ctx.closePath(); ctx.fill();
  // livery: blue band + gold chevrons at the back
  ctx.fillStyle = '#1f3b8a';
  ctx.fillRect(-52, -27, 110, 7);
  ctx.fillStyle = '#f5c84c';
  ctx.fillRect(-52, -20, 110, 2.5);
  ctx.save();
  ctx.beginPath(); ctx.rect(-91, -42, 40, 28); ctx.clip();
  for (let k = -100; k < -40; k += 12) {
    ctx.fillStyle = (k / 12) % 2 ? '#f5c84c' : '#1f3b8a';
    ctx.beginPath(); ctx.moveTo(k, -14); ctx.lineTo(k + 6, -14); ctx.lineTo(k + 20, -42); ctx.lineTo(k + 14, -42); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  text('POLICE', 2, -35, '900 13px system-ui, sans-serif', '#14275f');
  text('BV-07', -70, -55, '800 7px system-ui, sans-serif', '#c9d1dc');
  // door seams, handles, mirror
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(4, -45); ctx.lineTo(4, -14); ctx.stroke();
  ctx.fillStyle = '#8a92a2';
  ctx.fillRect(-20, -40, 9, 2.4);
  ctx.fillRect(32, -40, 9, 2.4);
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.moveTo(52, -48); ctx.lineTo(62, -50); ctx.lineTo(60, -44); ctx.closePath(); ctx.fill();
  // windows with a driver silhouette
  const wg = ctx.createLinearGradient(0, -70, 0, -46);
  wg.addColorStop(0, '#9cc2e6');
  wg.addColorStop(1, '#43678f');
  ctx.fillStyle = wg;
  ctx.beginPath(); ctx.moveTo(-46, -47); ctx.lineTo(-29, -68); ctx.lineTo(1, -68); ctx.lineTo(1, -47); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(6, -47); ctx.lineTo(6, -68); ctx.lineTo(29, -68); ctx.lineTo(49, -47); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(10,14,30,0.75)';
  ctx.beginPath(); ctx.arc(22, -55, 6, 0, TAU); ctx.fill();
  ctx.fillRect(14, -52, 16, 6);
  ctx.beginPath(); ctx.moveTo(14, -60); ctx.lineTo(30, -60); ctx.lineTo(28, -64); ctx.lineTo(16, -64); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.moveTo(-40, -48); ctx.lineTo(-27, -65); ctx.lineTo(-20, -65); ctx.lineTo(-33, -48); ctx.closePath(); ctx.fill();
  // body highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-86, -42); ctx.lineTo(-52, -43); ctx.moveTo(60, -44); ctx.lineTo(86, -40); ctx.stroke();
  // push bar
  ctx.fillStyle = INK;
  rr(ctx, 94, -34, 10, 26, 3); ctx.fill();
  ctx.fillStyle = '#2a2d36';
  rr(ctx, 96, -32, 6, 22, 2); ctx.fill();
  ctx.fillRect(90, -26, 10, 3);
  ctx.fillRect(90, -16, 10, 3);
  // lights
  ctx.fillStyle = flash === 0 ? '#fffbe0' : '#d9d2a8';
  rr(ctx, 86, -37, 9, 8, 2); ctx.fill();
  ctx.fillStyle = '#ff3d3d';
  rr(ctx, -93, -37, 6, 9, 2); ctx.fill();
  // LED lightbar
  ctx.fillStyle = INK;
  rr(ctx, -30, -82, 60, 10, 3); ctx.fill();
  for (let i = 0; i < 6; i++) {
    const red = i < 3;
    const lit = reduced ? true : (red ? flash === 0 : flash === 1) && Math.floor(time * 24 + i) % 3 !== 0;
    ctx.fillStyle = red ? (lit ? '#ff4a4a' : '#5a1414') : (lit ? '#5b86ff' : '#16245a');
    rr(ctx, -28 + i * 9.6, -80, 8.4, 6, 1.5);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-28, -80, 56, 1.5);
  const gx = flash === 0 ? -14 : 14;
  strobe(ctx, gx, -77, flash === 0 ? 'rgba(255,50,50,0.6)' : 'rgba(80,120,255,0.65)', 120);
  // wheels in arches
  for (const wx of [-58, 62]) {
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(wx, -10, 21, Math.PI, 0); ctx.fill();
    wheel(ctx, wx, -7, 17, wheelRot);
  }
  ctx.restore();
}

export function drawMoto(ctx, x, y, s, time, wheelRot, ph, reduced) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(0, 3, 50, 6, 0, 0, TAU); ctx.fill();
  const hb = ctx.createLinearGradient(40, -30, 220, -30);
  hb.addColorStop(0, 'rgba(255,248,210,0.3)');
  hb.addColorStop(1, 'rgba(255,248,210,0)');
  ctx.fillStyle = hb;
  ctx.beginPath(); ctx.moveTo(42, -34); ctx.lineTo(220, -60); ctx.lineTo(220, 0); ctx.lineTo(42, -26); ctx.closePath(); ctx.fill();
  wheel(ctx, -32, -14, 14, wheelRot);
  wheel(ctx, 34, -14, 14, wheelRot);
  // frame
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.moveTo(-36, -22); ctx.lineTo(-10, -40); ctx.lineTo(24, -42); ctx.lineTo(40, -30); ctx.lineTo(10, -18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#eef1f6';
  ctx.beginPath(); ctx.moveTo(-32, -24); ctx.lineTo(-9, -38); ctx.lineTo(22, -40); ctx.lineTo(36, -30); ctx.lineTo(9, -20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1f3b8a';
  ctx.fillRect(-12, -33, 30, 4);
  ctx.strokeStyle = '#9aa3b2';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(34, -14); ctx.lineTo(26, -50); ctx.stroke();
  ctx.fillStyle = '#fff7cf';
  ctx.beginPath(); ctx.arc(38, -36, 4, 0, TAU); ctx.fill();
  const on = reduced ? true : Math.floor(time * 7) % 2 === 0;
  ctx.fillStyle = on ? '#ff3b3b' : '#5b7dff';
  ctx.beginPath(); ctx.arc(-30, -40, 3.5, 0, TAU); ctx.fill();
  strobe(ctx, -30, -40, on ? 'rgba(255,50,50,0.45)' : 'rgba(80,120,255,0.5)', 50);
  ctx.restore();
  drawPerson(ctx, x - 2 * s, y - 20 * s, s * 0.95, { pose: 'ride', ph, t: time, outfit: OUTFITS.police, noShadow: true });
}

export function drawHeli(ctx, x, y, s, time, reduced) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(0.08 + Math.sin(time * 1.3) * 0.03);
  // tail boom
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.moveTo(-20, -8); ctx.lineTo(-92, -12); ctx.lineTo(-92, -3); ctx.lineTo(-20, 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1b2240';
  ctx.beginPath(); ctx.moveTo(-20, -6); ctx.lineTo(-90, -10); ctx.lineTo(-90, -5); ctx.lineTo(-20, 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1b2240';
  ctx.beginPath(); ctx.moveTo(-86, -10); ctx.lineTo(-98, -30); ctx.lineTo(-90, -30); ctx.lineTo(-80, -9); ctx.closePath(); ctx.fill();
  // tail rotor
  const tr = reduced ? 0.5 : Math.abs(Math.sin(time * 40));
  ctx.fillStyle = 'rgba(180,190,220,0.45)';
  ctx.beginPath(); ctx.ellipse(-94, -18, 3, 14 * tr + 3, 0, 0, TAU); ctx.fill();
  // skids
  ctx.strokeStyle = '#0b0d16';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-26, 26); ctx.lineTo(30, 26); ctx.quadraticCurveTo(36, 26, 38, 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, 26); ctx.lineTo(-10, 14); ctx.moveTo(18, 26); ctx.lineTo(14, 14); ctx.stroke();
  // body
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.ellipse(4, 0, 40, 19, 0, 0, TAU); ctx.fill();
  const bg = ctx.createLinearGradient(0, -18, 0, 18);
  bg.addColorStop(0, '#34407a');
  bg.addColorStop(0.5, '#1b2240');
  bg.addColorStop(1, '#0c1024');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(4, 0, 38, 17, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#eef1f6';
  ctx.fillRect(-26, 2, 50, 6);
  ctx.fillStyle = '#1f3b8a';
  ctx.font = '900 6px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POLICE', -2, 5.5);
  // cockpit glass
  const cg = ctx.createLinearGradient(20, -14, 40, 6);
  cg.addColorStop(0, '#bfe3ff');
  cg.addColorStop(1, '#3d6a99');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.moveTo(14, -14); ctx.quadraticCurveTo(38, -14, 42, 2); ctx.lineTo(18, 2); ctx.closePath(); ctx.fill();
  // searchlight housing
  ctx.fillStyle = '#0b0d16';
  ctx.beginPath(); ctx.arc(26, 16, 5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fffbe0';
  ctx.beginPath(); ctx.arc(28, 18, 2.6, 0, TAU); ctx.fill();
  // mast + main rotor
  ctx.fillStyle = '#0b0d16';
  ctx.fillRect(0, -26, 6, 10);
  const blur = reduced ? 0.7 : Math.abs(Math.sin(time * 26));
  ctx.fillStyle = 'rgba(170,180,210,0.28)';
  ctx.beginPath(); ctx.ellipse(3, -26, 96, 4.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(20,24,40,0.85)';
  ctx.fillRect(3 - 92 * blur, -27.5, 184 * blur, 3);
  // strobes
  const on = reduced ? true : Math.sin(time * 9) > 0;
  ctx.fillStyle = on ? '#ff3b3b' : '#3b0d0d';
  ctx.beginPath(); ctx.arc(-96, -30, 3, 0, TAU); ctx.fill();
  if (on) strobe(ctx, -96, -30, 'rgba(255,60,60,0.5)', 26);
  ctx.fillStyle = !on ? '#6b8cff' : '#18204a';
  ctx.beginPath(); ctx.arc(4, 18, 2.5, 0, TAU); ctx.fill();
  ctx.restore();
}
