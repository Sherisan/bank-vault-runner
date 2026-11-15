import { useCallback, useState } from 'react';
import { useBalance, useMuted, useMusic, useEngine, money } from '../hooks';
import { engines } from '../engine/engine';
import History from './History';
import Menu from './Menu';
import { MenuIcon, SoundIcon, MusicIcon } from './Icons';
import { wallet } from '../engine/wallet';
import { sound, unlockAudio } from '../engine/sound';

export default function TopBar() {
  const balance = useBalance();
  const muted = useMuted();
  const musicOn = useMusic();
  const engine = engines.vault;
  const s = useEngine(engine);
  const [menu, setMenu] = useState(false);
  const close = useCallback(() => setMenu(false), []);
  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={() => { unlockAudio(); setMenu(true); }} aria-label="Open menu" aria-haspopup="dialog">
        <MenuIcon />
      </button>
      <span className="nav-title">BANK VAULT RUNNER</span>
      <div className="nav-history">
        <p className="game-round">Round {s.roundId}</p>
        <History engine={engine} />
      </div>
      <div className="wallet">
        <div className="balance" aria-live="polite">
          <span className="bal-label">Balance{wallet.currency() ? ` (${wallet.currency()})` : ''}</span>
          <span className="bal-amount">{balance === null ? '—' : money(balance)}</span>
        </div>
        <button className="icon-btn" onClick={() => { unlockAudio(); sound.toggleMusic(); }} aria-pressed={musicOn} aria-label={musicOn ? 'Turn music off' : 'Turn music on'}>
          <MusicIcon off={!musicOn} />
        </button>
        <button className="icon-btn" onClick={() => { unlockAudio(); sound.toggle(); }} aria-pressed={!muted} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>
          <SoundIcon muted={muted} />
        </button>
      </div>
      <Menu engine={engine} open={menu} onClose={close} />
    </header>
  );
}
