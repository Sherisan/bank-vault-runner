# Bank Vault Runner

A crash game built with React and HTML canvas. The robber drills the vault and grabs the gold, then runs from the vault through the bank hall and out onto the street, jumping and sliding past booby traps while guards, police, a police car and a helicopter chase him.
The multiplier climbs the whole way. Cash out before he's caught to win your bet × the multiplier.

The game runs on the **GameEngineAPI** (game id `bank-vault-runner`, ProviderGameId 25, engine `LiveCrash`). The server draws every crash point with its provably fair RNG, runs the rounds, takes the bets, pays cash-outs (by hand or automatic) and keeps the wallet. The browser only shows what the server says.

## Run it locally

You need Node.js 18 or newer, and the .NET SDK for the API.

1. Get the API (it's a submodule on the `feature/BankVaultRunnergameengineapi` branch):

   ```bash
   git submodule update --init --remote
   ```

2. Start the API with the in-memory demo wallet (no database needed):

   ```bash
   cd GameEngineAPI
   set ASPNETCORE_ENVIRONMENT=Development
   dotnet run --no-launch-profile      # listens on http://localhost:5003
   ```

   The API targets .NET 8. If only a newer runtime is installed, also `set DOTNET_ROLL_FORWARD=Major`.

3. Start the game:

   ```bash
   npm install
   npm run dev      # http://localhost:5173
   ```

   With no `?token=` in the address, the game asks the API for a demo token (`/api/dev-token?gameId=bank-vault-runner`) and plays with a demo balance.

## Build and deploy

```bash
npm run build    # production build in dist/
```

`npm run build` uses `VITE_GAME_API_URL` from `.env.production` (https://demogameapi.easygamesdemo.co.za). Deploy `dist/` to https://bankvaultrunner.easygamesdemo.co.za/, the game's `LaunchUrl`. The lobby opens the game as `/?token=<jwt>`.

Lobby setup is in the API repo: `Infrastructure/Persistence/BankVaultRunnerGameServer.sql` (game server catalogue) and `BankVaultRunnerCatalogue.sql` (BetAvenue). Add `public/thumbnail.png` (600×400) for the lobby image.

## Offline demo

`vault-runner.html` is an older single-file build that runs on its own with browser-only demo credits. It does not talk to the API.

## Files

| File | What it does |
| --- | --- |
| `src/App.jsx` | Connects to the game server, runs the animation clock and lays out the page |
| `src/api/liveCrash.js` | SignalR client for the API's `/livecrashhub`: session token, rounds, ticks, bets, cash-outs |
| `src/games.js` | Game title and on-screen labels ("Cracking the vault", "Busted", ...) |
| `src/engine/engine.js` | Mirrors the server's rounds for the UI: phases, two bet slots, auto cash-out, auto bet, queued bets for the next round, other players' bets |
| `src/engine/wallet.js` | The balance the server last reported |
| `src/engine/sound.js` | Sound effects made with Web Audio, no audio files needed |
| `src/engine/toasts.js` | Pop-up messages ("Cashed out 64.20 at 6.42×") |
| `src/scenes/vault.js` | The animation: vault, bank hall, street, traps, police, car, helicopter, cage, handcuffs |
| `src/scenes/people.js` | Draws the robber, police officers and guard in every pose (run, jump, slide, hands up, grab) |
| `src/scenes/util.js` | Small drawing and particle helpers |
| `src/components/` | Top bar, stage with the big multiplier, bet panels, crash history chips, players list, toasts |
| `src/styles.css` | All styling. Colours are CSS variables under `[data-theme='vault']` |

## Things you can change

- **Game speed, countdown, house edge, max multiplier, bet limits:** these live on the server, in the game's row in the back office (seeded from `appsettings.json` in the API). Growth is e^(GrowthRate × seconds); 0.085 reaches 2× after about 8 seconds.
- **When the robber reaches the bank hall and the street:** `ZONE_AT` at the top of `src/scenes/vault.js` (1.6× and 3.2×).
- **Which traps show up where:** `TRAPS` in the same file.
- **Colours:** the `[data-theme='vault']` block in `src/styles.css`.

## Fonts

The page loads Bungee (title and multiplier) and Chakra Petch (everything else) from Google Fonts. Without an internet connection it falls back to system fonts.
