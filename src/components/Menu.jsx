import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEngine, useMuted, useMusic, useVolume, money } from '../hooks';
import { sound, unlockAudio } from '../engine/sound';
import { CloseIcon, VaultIcon, RunIcon, CashIcon, AutoIcon, ShieldIcon } from './Icons';

const TABS = [
  ['how', 'How to play'],
  ['rules', 'Rules'],
  ['fair', 'Fairness'],
  ['settings', 'Settings'],
];

const STEPS = [
  [VaultIcon, 'Bet while the vault is drilled', 'Place up to two bets in the countdown. A bet placed mid-run joins the next round.'],
  [RunIcon, 'The robber makes a run for it', 'The door blows and the loot multiplier climbs from 1.00×.'],
  [CashIcon, "Cash out before he's busted", 'Win your bet × the multiplier. If he\'s caught first, the bet is lost.'],
  [AutoIcon, 'Let it run on its own', 'Auto bet repeats your bet. Auto cash-out takes the win at your target.'],
];

const ZONES = [
  { m: '1.00×', name: 'The Vault', color: '#3fc1a8', tags: ['Lasers', 'Electric plates', 'Guard', 'K9 dog'] },
  { m: '1.60×', name: 'Grand Hall', color: '#e0566a', tags: ['Spikes', 'Steel shutters', 'Velvet ropes', 'Police'] },
  { m: '3.20×', name: 'City Streets', color: '#9b6bff', tags: ['Barriers', 'Spike strips', 'SWAT', 'Squad car'] },
  { m: '8.00×', name: 'The Rooftops', color: '#ff7ac0', tags: ['AC units', 'Washing lines', 'Helicopter'] },
];

function Switch({ checked, onChange, label, hint }) {
  return (
    <label className="menu-switch">
      <span>
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden="true"><span className="toggle-thumb" /></span>
    </label>
  );
}

export default function Menu({ engine, open, onClose }) {
  const [tab, setTab] = useState('how');
  const s = useEngine(engine);
  const muted = useMuted();
  const musicOn = useMusic();
  const volume = useVolume();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    panelRef.current?.querySelector('button')?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open, onClose]);

  if (!open) return null;
  const L = s.limits;
  const f = s.fairness;

  return createPortal(
    <div className="menu-backdrop" data-theme="vault" onClick={onClose}>
      <aside className="menu" role="dialog" aria-modal="true" aria-label="Game menu" ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <header className="menu-head">
          <span className="menu-title">BANK VAULT RUNNER</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu"><CloseIcon /></button>
        </header>
        <nav className="menu-tabs" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>

        <div className="menu-body">
          {tab === 'how' && (
            <>
              <section className="menu-hero">
                <p className="hero-kicker">Crash game</p>
                <h2 className="hero-title">Crack the vault.<br />Grab the gold.</h2>
                <p className="hero-sub">Cash out before the robber gets busted.</p>
                <dl className="hero-stats">
                  <div><dt>RTP</dt><dd>97%</dd></div>
                  <div><dt>Top win</dt><dd>{Math.round(L.maxMultiplier).toLocaleString('en-US')}×</dd></div>
                  <div><dt>Bets</dt><dd>{L.slots || 2} a round</dd></div>
                </dl>
              </section>

              <h3 className="menu-h">How a round works</h3>
              <ol className="timeline">
                {STEPS.map(([Icon, title, text], i) => (
                  <li key={title}>
                    <span className="tl-num" aria-hidden="true"><Icon /></span>
                    <div className="tl-body">
                      <span className="tl-step">Step {i + 1}</span>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <h3 className="menu-h">The escape route</h3>
              <ol className="route">
                {ZONES.map((z) => (
                  <li key={z.name} style={{ '--z': z.color }}>
                    <span className="route-node" aria-hidden="true" />
                    <div className="route-card">
                      <div className="route-head">
                        <strong>{z.name}</strong>
                        <span className="route-m">from {z.m}</span>
                      </div>
                      <ul className="route-tags">
                        {z.tags.map((t) => <li key={t}>{t}</li>)}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="menu-tip"><kbd>Space</kbd> bets, cancels or cashes out with bet 1.</p>
            </>
          )}

          {tab === 'rules' && (
            <>
              <dl className="rules">
                <div><dt>Return to player</dt><dd>97%</dd></div>
                <div><dt>Highest multiplier</dt><dd>{money(L.maxMultiplier)}×</dd></div>
                <div><dt>Minimum bet</dt><dd>{money(L.minBet)}</dd></div>
                <div><dt>Maximum bet</dt><dd>{money(L.maxBet)}</dd></div>
                <div><dt>Maximum win per round</dt><dd>{money(L.maxWin)}</dd></div>
                <div><dt>Bets per round</dt><dd>{L.slots || 2}</dd></div>
                <div><dt>Lowest auto cash-out</dt><dd>{L.minAutoCashOut.toFixed(2)}×</dd></div>
              </dl>
              <ul className="menu-list">
                <li>The game server decides every round. The crash point is drawn before betting opens.</li>
                <li>A cash-out pays your bet × the multiplier at the moment the server receives it.</li>
                <li>An auto cash-out pays at exactly the multiplier you set, if the round gets there.</li>
                <li>If you lose connection, the server still settles your bet, including any auto cash-out.</li>
                <li>Wins are capped at the maximum win per round.</li>
              </ul>
            </>
          )}

          {tab === 'fair' && (
            <>
              <div className="fair-hero"><ShieldIcon /><p>Every crash point comes from a server seed that is fixed before you bet. You can check it after the seed changes.</p></div>
              <h3 className="menu-h">This round</h3>
              <dl className="rules mono">
                <div><dt>Round</dt><dd>{s.roundId || '—'}</dd></div>
                <div><dt>Nonce</dt><dd>{f.nonce ?? '—'}</dd></div>
              </dl>
              <p className="hash-label">Server seed hash (SHA-256)</p>
              <code className="hash">{f.hash || 'Waiting for the server…'}</code>
              <h3 className="menu-h">Previous seed</h3>
              {f.prevSeed ? (
                <>
                  <p className="hash-label">Revealed seed</p>
                  <code className="hash">{f.prevSeed}</code>
                  {f.prevHash && (<><p className="hash-label">Its hash</p><code className="hash">{f.prevHash}</code></>)}
                </>
              ) : <p className="menu-note">No seed has been revealed yet. Seeds rotate every 1,000 rounds.</p>}
            </>
          )}

          {tab === 'settings' && (
            <div className="settings">
              <Switch label="Sound" hint="Everything: effects and music" checked={!muted} onChange={() => { unlockAudio(); sound.toggle(); }} />
              <Switch label="Music" hint="The heist soundtrack" checked={musicOn} onChange={() => { unlockAudio(); sound.toggleMusic(); }} />
              <label className="menu-range">
                <span><strong>Volume</strong><small>{Math.round(volume * 100)}%</small></span>
                <input type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={(e) => { unlockAudio(); sound.setVolume(Number(e.target.value) / 100); }} />
              </label>
              <p className="menu-note">Animations calm down automatically if your device is set to reduce motion.</p>
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
