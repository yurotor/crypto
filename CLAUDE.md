# CryptoView

Real-time crypto rates dashboard, similar to TradingView.

## Tech Stack
- React 19 + Vite + TypeScript
- TradingView Lightweight Charts v5 (BaselineSeries for green/red area)
- CoinGecko Free API (no key needed, ~30 calls/min)
- CSS custom properties for theming

## Run
```bash
npm install
npm run dev
```

## Architecture

```
src/
  services/coingecko.ts    # API client with 30s in-memory cache
  hooks/useCryptoData.ts   # Data fetching + 30s auto-refresh
  components/
    Chart/                 # TradingView BaselineSeries chart
    StatsPanel/            # Price, % change, volume, supply
    CoinSelector/          # Top 10 coins by volume (pill buttons)
    TimeRange/             # 24h, 1w, 1m, 1y
    RefreshButton/         # Manual refresh with countdown
    ThemeSwitcher/         # Theme dropdown
  themes/                  # 6 CSS theme files
  utils/format.ts          # Currency, compact, percent formatters
```

## Key Decisions
- **BaselineSeries** (not AreaSeries) — natively supports green above / red below a baseline price
- **No state management library** — just useState + useCallback in App.tsx
- **No axios** — native fetch + simple cache Map
- **CSS variables** via `data-theme` attribute on `<html>` — each theme file sets `--bg`, `--text`, `--card-bg`, `--accent`, etc.
- **Theme persistence** — saved to localStorage

## Themes
Standard (Apple UI), Retro (90s CRT), Futuristic (Cyberpunk), Vaporwave, Paper (Newspaper), Hacker (Matrix)

## API Rate Limits
CoinGecko free tier: ~10-30 calls/min. Cache TTL is 30s. Auto-refresh every 30s.
