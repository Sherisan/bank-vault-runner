// Synthesized sound kit and heist soundtrack (Web Audio). No audio files needed.
const KEY = 'vaultrunner.v1.muted';
const MUSIC_KEY = 'vaultrunner.v1.music';
const VOL_KEY = 'vaultrunner.v1.volume';

let ctx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
let muted = false, musicOn = true, volume = 0.8;
try {
  muted = localStorage.getItem(KEY) === '1';
  musicOn = localStorage.getItem(MUSIC_KEY) !== '0';
  const v = parseFloat(localStorage.getItem(VOL_KEY));
  if (Number.isFinite(v)) volume = Math.min(1, Math.max(0, v));
} catch {}
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const save = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

function ac() {
  if (!ctx) {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      master = ctx.createGain();
      sfxBus = ctx.createGain();
      musicBus = ctx.createGain();
      sfxBus.connect(master);
      musicBus.connect(master);
      master.connect(comp).connect(ctx.destination);
      applyLevels();
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      music._start();
    } catch { ctx = null; return null; }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function applyLevels() {
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(muted ? 0 : volume, t, 0.05);
  musicBus.gain.setTargetAtTime(musicOn ? 0.42 : 0, t, 0.1);
  sfxBus.gain.setTargetAtTime(1, t, 0.05);
}

// Browsers only allow audio after a user gesture: call this from any click.
export function unlockAudio() { ac(); }

const live = () => ctx && ctx.state === 'running' && !muted;
const mtof = (n) => 440 * Math.pow(2, (n - 69) / 12);

// One shaped oscillator note.
function voice(t, { type = 'sine', freq = 440, to = null, dur = 0.15, gain = 0.07, attack = 0.008, filter = null, bus = sfxBus, detune = 0 }) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.detune.value = detune;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = filter.type || 'lowpass';
    f.Q.value = filter.q ?? 0.8;
    f.frequency.setValueAtTime(filter.freq, t);
    if (filter.to) f.frequency.exponentialRampToValueAtTime(filter.to, t + dur);
    node.connect(f);
    node = f;
  }
  node.connect(g).connect(bus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// A burst of filtered noise.
function hiss(t, { dur = 0.3, gain = 0.1, type = 'lowpass', freq = 900, to = null, q = 0.8, bus = sfxBus, attack = 0.004 }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(bus);
  src.start(t, Math.random() * 1.5);
  src.stop(t + dur + 0.05);
}

const now = () => ctx.currentTime;

export const sfx = {
  bet() {
    if (!live()) return;
    const t = now();
    voice(t, { type: 'triangle', freq: 660, dur: 0.06, gain: 0.08 });
    voice(t + 0.05, { type: 'triangle', freq: 990, dur: 0.08, gain: 0.07 });
    hiss(t, { dur: 0.05, gain: 0.05, type: 'highpass', freq: 5000 });
  },
  cancel() {
    if (!live()) return;
    voice(now(), { type: 'triangle', freq: 520, to: 260, dur: 0.16, gain: 0.07 });
  },
  tick() {
    if (!live()) return;
    const t = now();
    voice(t, { type: 'square', freq: 1320, dur: 0.05, gain: 0.04, filter: { freq: 3000 } });
    voice(t, { type: 'sine', freq: 660, dur: 0.08, gain: 0.05 });
  },
  launch() {
    if (!live()) return;
    const t = now();
    // the vault door blows
    hiss(t, { dur: 1.4, gain: 0.55, freq: 2400, to: 60 });
    voice(t, { type: 'sine', freq: 120, to: 28, dur: 0.9, gain: 0.6 });
    voice(t, { type: 'sawtooth', freq: 60, to: 30, dur: 0.6, gain: 0.12, filter: { freq: 400 } });
    hiss(t + 0.05, { dur: 0.5, gain: 0.12, type: 'highpass', freq: 3000, to: 800 });
  },
  cash() {
    if (!live()) return;
    const t = now();
    // cha-ching
    hiss(t, { dur: 0.08, gain: 0.12, type: 'bandpass', freq: 3500, q: 2 });
    [1568, 2093, 2637].forEach((f, i) => voice(t + 0.07 + i * 0.05, { type: 'sine', freq: f, dur: 0.6, gain: 0.08 }));
    [3136, 4186].forEach((f, i) => voice(t + 0.1 + i * 0.04, { type: 'triangle', freq: f, dur: 0.35, gain: 0.03 }));
    for (let i = 0; i < 6; i++) voice(t + 0.2 + i * 0.045, { type: 'square', freq: 2400 + Math.random() * 1600, dur: 0.05, gain: 0.015, filter: { freq: 6000 } });
  },
  crash() {
    if (!live()) return;
    const t = now();
    // steel slam + bass drop
    [220, 563, 891, 1290, 1740].forEach((f, i) => voice(t, { type: 'sine', freq: f, dur: 1.2 - i * 0.15, gain: 0.11 - i * 0.015 }));
    hiss(t, { dur: 0.5, gain: 0.35, freq: 4000, to: 300 });
    voice(t, { type: 'sine', freq: 90, to: 30, dur: 0.9, gain: 0.5 });
  },
  lose() {
    if (!live()) return;
    const t = now() + 0.15;
    [392, 370, 349, 311].forEach((f, i) => voice(t + i * 0.16, { type: 'triangle', freq: f, dur: 0.22, gain: 0.05 }));
  },
  jump() {
    if (!live()) return;
    const t = now();
    hiss(t, { dur: 0.22, gain: 0.12, type: 'bandpass', freq: 500, to: 2200, q: 1.5 });
    voice(t, { type: 'triangle', freq: 280, to: 620, dur: 0.16, gain: 0.04 });
  },
  slide() {
    if (!live()) return;
    hiss(now(), { dur: 0.4, gain: 0.12, type: 'bandpass', freq: 2500, to: 900, q: 0.7 });
  },
  coin() {
    if (!live()) return;
    const t = now();
    voice(t, { type: 'square', freq: 1320, dur: 0.07, gain: 0.03, filter: { freq: 5000 } });
    voice(t + 0.06, { type: 'square', freq: 1976, dur: 0.14, gain: 0.03, filter: { freq: 6000 } });
  },
  cuffs() {
    if (!live()) return;
    const t = now();
    [0, 0.09].forEach((d) => {
      voice(t + d, { type: 'square', freq: 3200, dur: 0.03, gain: 0.05, filter: { type: 'highpass', freq: 2000 } });
      hiss(t + d, { dur: 0.05, gain: 0.12, type: 'bandpass', freq: 5200, q: 4 });
    });
    voice(t + 0.12, { type: 'sine', freq: 1900, dur: 0.25, gain: 0.03 });
  },
  zone() {
    if (!live()) return;
    const t = now();
    hiss(t, { dur: 0.5, gain: 0.1, type: 'bandpass', freq: 300, to: 3000, q: 1 });
    voice(t + 0.35, { type: 'sine', freq: 70, to: 40, dur: 0.4, gain: 0.25 });
  },
};

/* ───────── Soundtrack ───────── */
// A-minor heist groove. Betting: tense pulse with a ticking clock. Running: full
// groove that speeds up and adds layers as the multiplier climbs.

const PROG = [
  { root: 45, chord: [57, 60, 64] }, // Am
  { root: 45, chord: [57, 60, 64] }, // Am
  { root: 41, chord: [53, 57, 60] }, // F
  { root: 40, chord: [52, 56, 59] }, // E
];
const BASS = [0, null, 0, 12, null, 0, 7, null, 0, null, 0, 10, 12, null, 7, null];
const ARP = [0, 1, 2, 1, 0, 2, 1, 2];

export const music = (() => {
  let mode = 'off';
  let mult = 1;
  let step = 0, bar = 0, nextTime = 0, timer = null;
  let siren = null, drill = null;

  const bpm = () => (mode === 'running' ? 112 + Math.min(40, Math.log(Math.max(1, mult)) * 15) : 96);

  function kick(t) { voice(t, { freq: 150, to: 42, dur: 0.3, gain: 0.9, bus: musicBus }); }
  function snare(t) {
    hiss(t, { dur: 0.16, gain: 0.32, type: 'bandpass', freq: 1900, q: 0.7, bus: musicBus });
    voice(t, { type: 'triangle', freq: 200, to: 150, dur: 0.08, gain: 0.18, bus: musicBus });
  }
  function hat(t, open) { hiss(t, { dur: open ? 0.22 : 0.04, gain: open ? 0.08 : 0.07, type: 'highpass', freq: 7500, bus: musicBus }); }
  function bass(t, n, len) {
    voice(t, { type: 'sawtooth', freq: mtof(n), dur: len, gain: 0.22, attack: 0.005, filter: { freq: 1300, to: 260, q: 4 }, bus: musicBus });
    voice(t, { type: 'sine', freq: mtof(n - 12), dur: len, gain: 0.2, bus: musicBus });
  }
  function stab(t, notes) {
    notes.forEach((n) => {
      voice(t, { type: 'sawtooth', freq: mtof(n), dur: 0.2, gain: 0.05, filter: { freq: 2600, to: 600, q: 2 }, bus: musicBus, detune: -8 });
      voice(t, { type: 'sawtooth', freq: mtof(n), dur: 0.2, gain: 0.05, filter: { freq: 2600, to: 600, q: 2 }, bus: musicBus, detune: 8 });
    });
  }
  function pad(t, notes, len) { notes.forEach((n) => voice(t, { type: 'triangle', freq: mtof(n - 12), dur: len, gain: 0.04, attack: 0.4, bus: musicBus })); }
  function lead(t, n) { voice(t, { type: 'square', freq: mtof(n), dur: 0.12, gain: 0.035, filter: { freq: 3200 }, bus: musicBus }); }
  function clock(t, hi) { voice(t, { type: 'sine', freq: hi ? 2100 : 1600, dur: 0.03, gain: 0.05, bus: musicBus }); }

  function schedule(t) {
    const ch = PROG[bar % 4];
    const s16 = 60 / bpm() / 4;
    if (mode === 'betting') {
      if (step % 4 === 0) clock(t, step % 8 === 0);
      if (step === 0 || step === 8) bass(t, ch.root, s16 * 3);
      if (step === 0) pad(t, ch.chord, s16 * 16);
      if (step === 14) hat(t, true);
    } else if (mode === 'running') {
      const lvl = mult >= 8 ? 4 : mult >= 3.2 ? 3 : mult >= 1.6 ? 2 : 1;
      if ([0, 7, 8, 10].includes(step)) kick(t);
      if (step === 4 || step === 12) snare(t);
      if (lvl >= 4 && bar % 4 === 3 && step >= 13) snare(t);
      if (step % 2 === 0) hat(t, step === 14);
      else if (lvl >= 3) hat(t, false);
      const b = BASS[step];
      if (b !== null) bass(t, ch.root + b, s16 * 1.6);
      if (lvl >= 2 && (step === 0 || step === 6)) stab(t, ch.chord);
      if (lvl >= 3 && step % 2 === 0) lead(t, ch.chord[ARP[(step / 2) % 8]] + 12);
      if (lvl >= 4 && step % 2 === 1) lead(t, ch.chord[ARP[((step - 1) / 2 + 3) % 8]] + 24);
    }
    step = (step + 1) % 16;
    if (step === 0) bar++;
    return s16;
  }

  function tick() {
    if (!ctx || ctx.state !== 'running' || mode === 'off' || mode === 'crashed') return;
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
    while (nextTime < ctx.currentTime + 0.12) nextTime += schedule(nextTime);
  }

  function stopLoop(node) {
    if (!node) return;
    const t = ctx.currentTime;
    node.g.gain.setTargetAtTime(0.0001, t, 0.08);
    node.srcs.forEach((s) => { try { s.stop(t + 0.5); } catch {} });
  }

  function startSiren() {
    if (siren || !ctx) return;
    const o = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = 760;
    lfo.frequency.value = 0.55;
    lg.gain.value = 170;
    lfo.connect(lg).connect(o.frequency);
    g.gain.value = 0.0001;
    g.gain.setTargetAtTime(0.03, ctx.currentTime, 0.4);
    o.connect(g).connect(musicBus);
    o.start();
    lfo.start();
    siren = { g, srcs: [o, lfo] };
  }

  function startDrill() {
    if (drill || !ctx) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 2600;
    f.Q.value = 3;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = 118;
    const of = ctx.createBiquadFilter();
    of.type = 'lowpass';
    of.frequency.value = 900;
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 7;
    lg.gain.value = 9;
    lfo.connect(lg).connect(o.frequency);
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    g.gain.setTargetAtTime(0.035, ctx.currentTime, 0.2);
    src.connect(f).connect(g);
    o.connect(of).connect(g);
    g.connect(sfxBus);
    src.start();
    o.start();
    lfo.start();
    drill = { g, srcs: [src, o, lfo] };
  }

  function stinger() {
    const t = ctx.currentTime + 0.05;
    [64, 60, 57, 52].forEach((n, i) => voice(t + i * 0.09, { type: 'sawtooth', freq: mtof(n), dur: 0.5, gain: 0.05, filter: { freq: 1800, to: 400 }, bus: musicBus }));
    voice(t, { type: 'sine', freq: mtof(33), dur: 1.4, gain: 0.3, bus: musicBus });
  }

  function apply(prev) {
    if (!ctx || ctx.state !== 'running') return;
    if (mode === 'betting') startDrill(); else { stopLoop(drill); drill = null; }
    if (mode === 'running' && mult >= 3.2) startSiren();
    if (mode !== 'running') { stopLoop(siren); siren = null; }
    if (mode === 'running' && prev !== 'running') { step = 0; bar = 0; nextTime = ctx.currentTime + 0.05; }
    if (mode === 'betting' && prev !== 'betting') { step = 0; nextTime = ctx.currentTime + 0.05; }
    if (mode === 'crashed' && prev === 'running' && musicOn && !muted) stinger();
  }

  return {
    setMode(m) {
      if (m === mode) return;
      const prev = mode;
      mode = m;
      if (m !== 'running') mult = 1;
      apply(prev);
    },
    setMult(m) {
      mult = m;
      if (mode === 'running' && m >= 3.2 && ctx && ctx.state === 'running') startSiren();
    },
    _start() {
      if (!timer) timer = setInterval(tick, 25);
      if (ctx) ctx.addEventListener?.('statechange', () => apply(null));
      apply(null);
    },
  };
})();

export const sound = {
  isMuted: () => muted,
  isMusicOn: () => musicOn,
  getVolume: () => volume,
  toggle() {
    muted = !muted;
    save(KEY, muted ? '1' : '0');
    if (!muted) ac();
    applyLevels();
    if (!muted) sfx.bet();
    emit();
  },
  toggleMusic() {
    musicOn = !musicOn;
    save(MUSIC_KEY, musicOn ? '1' : '0');
    ac();
    applyLevels();
    emit();
  },
  setVolume(v) {
    volume = Math.min(1, Math.max(0, v));
    save(VOL_KEY, String(volume));
    applyLevels();
    emit();
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
