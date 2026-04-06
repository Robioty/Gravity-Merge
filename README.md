# 🚀 Supernova: Infinity

A mobile-first planet-merging game built as a single HTML file. Drop planets, merge matching ones, chain combos, and try to reach **Vortex** — the rarest planet in the universe.

No app store required. No backend. No build step. Just one file.

---

## Playing the game

Open `index.html` in any modern mobile browser (Chrome on Android, Safari on iOS). It also works on desktop. If you're hosting on GitHub Pages, it's live the moment you push.

---

## Before publishing

Two constants at the very top of the `<script>` block need updating:

```js
const TIP_JAR_URL      = 'https://ko-fi.com/YOUR_NAME_HERE'; // your donation link
const BUG_REPORT_EMAIL = 'your@email.com';                   // your support email
```

These power the **Tip Jar** button on the home screen and the **Space Bug** reporter in the pause menu.

---

## How the game works

### Core loop
- Drag left/right to aim, lift finger to drop a planet
- Matching planets that touch **merge** into the next level up
- Chain merges quickly for **COMBO** multipliers
- Don't let planets pile past the red **danger line** — you get 7 seconds grace, then game over
- One **Near Miss Save** per run: when the grace period expires for the first time, the 3 highest planets are automatically cleared

### Planets (10 levels)
| Level | Name | Radius | Colour | Notes |
|---|---|---|---|---|
| 0 | Mote | 14 | White | Star points |
| 1 | Verdis | 22 | Green | |
| 2 | Krath | 31 | Red | |
| 3 | Auroris | 41 | Gold | Striped |
| 4 | Phaedra | 53 | Purple | Striped |
| 5 | Orrath | 70 | Blue | Ringed |
| 6 | Solux | 89 | Yellow | Sun corona |
| 7 | Zephyra | 97 | Pink | Striped |
| 8 | Nullar | 118 | Black | Singularity rings |
| 9 | Vortex | 31 | Black | **Compact Black Hole** — same size as Krath, deadly mechanics (see below) |

Drop probability is **weighted by score**: early game drops are mostly Mote/Verdis/Krath. Late game opens up Auroris. There is a 3% **Lucky Drop** chance to get one level higher than normal.

### Special mechanics
| Mechanic | How it works |
|---|---|
| **HOLD** | Bank your current planet — swap it back any time, one use per drop |
| **Gravity Flip (G)** | Flips physics direction, 6-minute recharge |
| **Comet** | Flies across periodically — tap it to open the Choice Chest (Vacuum / Gravity Surge / Double Score) |
| **Solar Wind** | Pushes all planets sideways for 30 seconds — unlocks after 3 games |
| **Black Hole** | Vortex (level 9) is a compact black hole (r:31). Every frame it pulls level 0/1/2 planets toward it. Every 4 seconds it consumes the nearest small planet within 120px. A faint pink dashed ring shows the capture zone. |
| **Wormhole** | Merge **two** level-9 Black Holes together and a wormhole event fires. Physics pauses briefly, all planets within 200px are consumed (200pts each), a swirling void animation plays, then it collapses and the game continues. Neither Black Hole is replaced by a new body. |
| **Glitter Planet** | Rare wildcard (2% chance, unlocks at Captain rank) — upgrades whatever planet it touches by +1 level regardless of their types |

### Stardust (✨)
Earned on every merge. Spend it in **Constellation** (permanent upgrades) or **Armory** (in-run power-ups).

**Constellation upgrades:**
- Stellar Recharge — gravity recharges faster (5 levels)
- Combo Flow — longer combo grace window (5 levels)
- Stardust Magnet — more stardust per merge (5 levels)
- Crisis Buffer — longer danger grace period (3 levels)
- Happy Planets 😊 — smiley faces on all planets (one-time, toggleable)
- Planet Gas 💨 — fart sound on every merge (one-time, toggleable)

**Armory power-ups** (unlock after 3 total games played):
- **Nuke** (250✨) — removes all level 0–1 planets
- **Collapse** (600✨) — removes all level 2–3 planets
- **Seismic Pulse** (150✨) — shakes the board to unstick piled planets
- **Laser Strike** (400✨) — tap up to 3 planets (max level 4) for a spaceship to vaporise them

### Modes
| Mode | What happens to rank |
|---|---|
| Free Play | No rank change — no pressure |
| Ranked | Earn or lose RP based on score vs your tier's target |

### Rank system (10 tiers)
Cadet → Pilot → Navigator → Ace → Captain → Major → Colonel → Commander → Admiral → **Grand Admiral**

- RP is earned by beating your tier's score target, lost by falling under 50% of it
- **Rank floor**: once you reach a rank, your RP can never drop below that rank's minimum — you can't be demoted below your highest earned rank
- Tap the RANK cell on the home screen to see the full ladder with your current progress

### Daily features
- **Daily Bonus**: +100✨ stardust each new day
- **Daily Streak**: consecutive day bonus; 7-day streak = +300✨ extra
- **Idle Stardust**: away for 2+ hours? Earn 8✨/hour (cap 150) on return
- **Daily Run**: same seeded planet sequence for all players each day — compare scores fairly

---

## localStorage keys

All data is stored in the browser's `localStorage`. Nothing is sent to a server.

| Key | Contents |
|---|---|
| `sn_v10` | Main save: best score, stardust, discovered planets, RP, total games played |
| `sn_const` | Constellation upgrade levels |
| `sn_cosmetic_toggles` | Happy Planets / Planet Gas on/off state |
| `sn_settings` | Sound, shake, particles, haptic toggles |
| `sn_streak` | Daily streak count and last-played date |
| `sn_daily` | Last date daily bonus was claimed |
| `sn_daily_run` | Today's Daily Run best score |
| `sn_missions` | Today's mission definitions and progress |
| `sn_last_played` | Timestamp for idle stardust calculation |
| `sn_tutdone` | Whether the first-launch tutorial has been dismissed |

To reset all progress: open browser DevTools → Application → Local Storage → delete all `sn_*` keys.

---

## Code structure

Everything lives in one `index.html`. Inside the `<script>` block, sections are labelled with `// ──` comments:

```
Config constants          TIP_JAR_URL, BUG_REPORT_EMAIL, CHARGE_TIME, COMET_*, ANOMALY_*, BH_*
Layout                    width, height, TOP_BAR, BOT_BAR, PLAY_H
Rank system               RANKS array, getRankFromRP, getRankIndex
Community leaderboard     COMMUNITY_PLAYERS (20 simulated entries)
Game state                All let variables — reset in startGame()
Planet data               PLANET_DATA — 10 entries, r = radius in px
Safe storage              safeGet / safeSet — localStorage with fallback
Stats                     loadStats, saveStats, totalGamesEver
RP logic                  calcRPChange, applyRPChange (with rank floor)
Seeded RNG                seedRNG, rng, getDailySeed (mulberry32)
Glitter planet            shouldBeGlitter, performGlitterMerge
Weighted drops            getNextPlanetLevel (probability table by score)
Constellation             CONSTELLATIONS array, show/buy/toggle functions
Daily missions            MISSION_DEFS, initMissions, trackMission
Audio                     playSound (all SFX), ensureAudioCtx, playFart
Planet drawing            drawPlanet (handles blackhole/singularity flags), drawGlitterOverlay, drawPreviewCanvas
Spawn / merge             spawn, performMerge, performGlitterMerge
Near Miss Save            nearMissSave (one per run)
Power-ups                 buyPowerUp, buySeismic, buyLaserStrike, fireLaser
Gravity flip              flipGravity
Comet                     scheduleComet, trySpawnComet, catchComet, cometChoice
Solar wind                scheduleAnomaly, startAnomaly, applyAnomaly
Black hole + Wormhole     startBlackHole, performWormhole, drawWormhole
End screen                showEndScreen (two-card: THE RUN + THE CAREER)
Pause / game over         togglePause, confirmAbandon, gameOver
Tutorial                  TUT_STEPS, startTutorial, showTutStep, endTutorial
Start game                startGame — full engine teardown and rebuild
Events                    initEvents — physics hooks, render loop, danger check
Input                     pointermove, pointerup handlers
Boot                      loadSettings, checkDailyBonus, checkIdleDust, loadStats
```

### Key design decisions worth knowing

**Physics engine**: Matter.js is torn down and rebuilt on every `startGame()` call. This is intentional — it's the cleanest way to guarantee no stale bodies or event listeners carry over between games. The alternative (clearing the world) left subtle edge cases.

**Gravity attraction**: Planets at level 3+ attract smaller nearby planets. This force is scaled down as the board fills (`gravScale` in `beforeUpdate`) and disabled entirely above 15 bodies — otherwise late-game becomes a crushing squeeze.

**Gravity rings**: The dashed circles showing a planet's attraction radius are only drawn for levels 3–8 when there are ≤10 bodies on screen. Above that, they add visual noise without useful information. Level 9 (Vortex) shows its own capture zone ring instead.

**Vortex / Black Hole design**: Vortex was shrunk from r:162 to r:31 (same as Krath) to stop it blocking the entire screen. It's now a compact black hole drawn with a black disc, pink event horizon ring, and three rotating accretion disc ellipses. Its mechanical danger comes from two behaviours: a constant per-frame gravitational pull on lvl 0/1/2 planets (applied in `beforeUpdate` alongside the normal inter-planet attraction), and a 4-second consumption timer that removes the nearest small planet within 120px. The capture radius is drawn as a faint dashed circle so players can see the threat zone.

**Wormhole event**: When two level-9 Black Holes merge, `performMerge` detects `nl >= PLANET_DATA.length` (since there is no level 10) and calls `performWormhole(x,y)` instead of spawning a new body. `performWormhole` pauses the physics engine, consumes all bodies within 200px, awards 200pts per body, and plays a 90-frame canvas animation (`drawWormhole`) consisting of expanding/contracting rings, rotating spiral arms, and a dark void gradient. Physics resumes after 1.5 seconds and the `blackHoleTimer` is cleared since both Black Holes are now gone.

**Fart sound synthesis**: Four-layer Web Audio API chain — brown noise through dual bandpass filters (the "body"), a sawtooth oscillator with pitch drop (the "raspberry"), a sub-bass sine for large planets, and a square-wave transient at the attack (the "blap"). All routed through a DynamicsCompressor for consistent volume. `ensureAudioCtx()` calls `resume()` before every sound to handle Chrome's autoplay policy on mobile.

**AudioContext**: Created lazily on first sound, then reused. `ensureAudioCtx()` always calls `resume()` first — Chrome suspends the context until a user gesture, and merge events fire from physics callbacks rather than directly from taps.

**Daily Run fairness**: Uses mulberry32 — a deterministic seeded PRNG — seeded from `new Date().toDateString()`. Every player on the same calendar day gets identical planet sequences, making score comparison fair.

**Power-up unlocks**: Gated on `totalGamesEver()` (persisted in `sn_v10.totalGames`) rather than the session `gamesPlayed` counter. This means they stay unlocked after page reload once the threshold is crossed.

---

## Version history

See the comment block at the top of the `<script>` tag in `index.html` for the full changelog (v7.0 → v12.0).

Key changes in the most recent version:
- **Bug fix**: `CHARGE_TIME is not defined` — constants block was accidentally dropped during a header restructure; all timing constants restored
- **Zephyra** (lvl 7): r:108 → r:97 (−10%)
- **Nullar** (lvl 8): r:131 → r:118 (−10%)
- **Vortex** (lvl 9): r:162 → r:31, completely redesigned as a compact Black Hole with gravitational pull mechanics
- **Wormhole**: merging two Black Holes triggers a board-clearing wormhole event with canvas animation

---

## Tech

- **Matter.js 0.19** (loaded from cdnjs CDN) — 2D rigid body physics
- **Web Audio API** — all sound effects synthesised in-browser, no audio files
- **localStorage** — all persistence, no backend
- **CSS custom properties** — theming via `--accent`, `--gold`, `--danger`, `--success`, `--wind`
- No framework. No build tools. No dependencies beyond Matter.js.
