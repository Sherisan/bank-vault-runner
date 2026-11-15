# Bank Vault Runner

A crash game built with React and HTML canvas. The robber drills the vault and grabs the gold, then runs from the vault through the bank hall and out onto the street, jumping and sliding past booby traps while guards, police, a police car and a helicopter chase him.
The multiplier climbs the whole way. Cash out before he's caught to win your bet × the multiplier.
Everything runs on demo credits that are saved in your browser.

## Play without installing anything

Open `vault-runner.html` in any browser. It's the whole game in one file.

## Run the React project

You need Node.js 18 or newer.

```bash
npm install
npm run dev      # opens a local dev server, usually http://localhost:5173
npm run build    # production build in dist/
```

## Files

| File | What it does |
| --- | --- |
| `src/App.jsx` | Starts the round clock and lays out the page |
| `src/games.js` | Game title and on-screen labels ("Cracking the vault", "Busted", ...) |
| `src/engine/engine.js` | Round logic: countdown, running and crashed phases, crash points, two bet slots, auto cash-out, auto bet, simulated players |
| `src/engine/wallet.js` | Demo balance (starts at 1,000, saved in localStorage) |
| `src/engine/sound.js` | Sound effects made with Web Audio, no audio files needed |
| `src/engine/toasts.js` | Pop-up messages ("Cashed out 64.20 at 6.42×") |
| `src/scenes/vault.js` | The animation: vault, bank hall, street, traps, police, car, helicopter, cage, handcuffs |
| `src/scenes/people.js` | Draws the robber, police officers and guard in every pose (run, jump, slide, hands up, grab) |
| `src/scenes/util.js` | Small drawing and particle helpers |
| `src/components/` | Top bar, stage with the big multiplier, bet panels, crash history chips, players list, toasts |
| `src/styles.css` | All styling. Colours are CSS variables under `[data-theme='vault']` |

## Things you can change easily

- **Game speed:** `K` in `src/engine/engine.js`. The multiplier is e^(K × seconds), so 0.085 reaches 2× after about 8 seconds.
- **Countdown and crash-screen length:** `BET_MS` and `CRASH_MS` in the same file.
- **Payout curve:** `genCrashPoint()`. It's currently a 3% house edge: P(crash ≥ x) = 0.97 / x.
- **When the robber reaches the bank hall and the street:** `ZONE_AT` at the top of `src/scenes/vault.js` (1.6× and 3.2×).
- **Which traps show up where:** `TRAPS` in the same file.
- **Starting balance:** `START_BALANCE` in `src/engine/wallet.js`.
- **Colours:** the `[data-theme='vault']` block in `src/styles.css`.

## Fonts

The page loads Bungee (title and multiplier) and Chakra Petch (everything else) from Google Fonts. Without an internet connection it falls back to system fonts.

Note: crash points come from `Math.random()` in the browser, which is fine for a demo. A real-money version would need a server-side, provably fair generator and the licences that go with it.
