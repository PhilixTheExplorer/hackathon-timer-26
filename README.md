# SIT Hackathon Timer

An apocalypse-themed, full-screen countdown clock for **SIT Hackathon 2026**
(School of Information Technology, KMUTT). Built with **React + Vite +
Tailwind CSS**. Counts **down to the deadline**, reckoned in **Bangkok time
(Asia/Bangkok, UTC+7)**, with three visual directions and reactive phases.

![states: calm → urgent → alarm → time's up](./preview.png)

---

## Quick start

```bash
cp .env.example .env      # then edit .env to taste
npm install
npm run dev               # http://localhost:5173
npm run build && npm run preview   # production build
```

## Configuration — everything lives in `.env`

All vars are prefixed `VITE_` so Vite exposes them to the client.

| Variable | Purpose | Example |
|---|---|---|
| `VITE_EVENT_TITLE` | Big title | `SIT HACKATHON` |
| `VITE_EVENT_YEAR` | Year under the title | `2026` |
| `VITE_EVENT_ORG` | Top-left org line | `School of Information Technology · KMUTT` |
| `VITE_TIMEZONE` | IANA timezone the clock is reckoned in | `Asia/Bangkok` |
| `VITE_START_TIME` | Event start | `2026-05-29T09:00:00` |
| `VITE_END_TIME` | Deadline (counts down to this) | `2026-05-31T17:00:00` |
| `VITE_URGENT_MIN` | Remaining ≤ this (min) → **URGENT** (amber) | `60` |
| `VITE_ALARM_MIN` | Remaining ≤ this (min) → **ALARM** (red) | `5` |
| `VITE_THEME` | `terminal` \| `reactor` \| `signal` | `signal` |
| `VITE_SHOW_DAYS` | Show the DAYS group | `true` |
| `VITE_SHOW_MILESTONES` | Show the milestone track | `true` |
| `VITE_SCANLINES` | CRT scanline overlay | `true` |
| `VITE_MILESTONES` | JSON array of `{ label, time }` checkpoints | see `.env.example` |

### Times & timezone

You can write times **two ways** — both resolve to the same instant:

- **With an explicit offset:** `2026-05-31T17:00:00+07:00` — parsed as-is.
- **Without an offset:** `2026-05-31T17:00:00` — interpreted as **wall-clock
  time in `VITE_TIMEZONE`**. So with `VITE_TIMEZONE=Asia/Bangkok`, `17:00:00`
  means 5pm in Bangkok no matter where the viewer's browser is.

The countdown itself is offset-safe: it compares absolute instants, so a laptop
set to any timezone shows the correct remaining time. The footer clock shows the
current **Bangkok** wall time.

## Phases

The UI reacts as the deadline approaches:

| Phase | Trigger | Look |
|---|---|---|
| **CALM** | default | theme accent (cyan / green) |
| **URGENT** | remaining ≤ `VITE_URGENT_MIN` | amber |
| **ALARM** | remaining ≤ `VITE_ALARM_MIN` | red, pulsing vignette + per-second beep |
| **TIME'S UP** | remaining ≤ 0 | glitching "TIME'S UP" end screen + detonation tone |

## Themes

- **`terminal`** — monochrome phosphor-green CRT, minimal.
- **`reactor`** — meltdown amber/red shift, hazard-striped flip cards.
- **`signal`** — SIT cyan neon + Orbitron + datamosh glitch (matches the poster).

## Controls

- **SOUND** — toggles the alarm beeps / detonation tone (off until clicked; browsers block autoplay).
- **FULLSCREEN** — projector mode.

## Project layout

```
src/
  config.js              env parsing, timezone math, phase logic
  hooks/useNow.js        250ms ticker
  components/
    FlipClock.jsx        split-flap DD:HH:MM:SS
    MilestoneTrack.jsx   progress + checkpoints
    Overlays.jsx         CRT, sparkles, glitch text
  App.jsx                layout + audio + fullscreen
  index.css             Tailwind + theme styles
```
