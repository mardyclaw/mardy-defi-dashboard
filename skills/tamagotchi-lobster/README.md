# 🦞 Tamagotchi Lobster Dashboard

A simple pixel art tamagotchi-style dashboard for OpenClaw featuring an animated lobster that responds to system activity.

## Features

- **8x16 Pixel Art**: Four hand-crafted sprite states
- **Real-time Monitoring**: Tracks OpenClaw session activity
- **Interactive**: Click to pet and increase health
- **Autonomous**: Health system with natural decay
- **Zero Build**: Pure HTML/CSS/JS, no frameworks

## Quick Start

1. **Server is already running** on port 18790
2. **Access immediately**: http://192.168.0.109:18790
3. **Pet the lobster**: Click to interact
4. **Watch it live**: Reacts to OpenClaw activity

## Architecture

- **Frontend**: Single `index.html` file (10KB)
- **Backend**: Minimal Express server (proxies OpenClaw API)
- **Assets**: 4 PNG sprites (~500 bytes total)
- **No dependencies**: Works in any modern browser

## Behavior

| State | Trigger | Animation |
|-------|---------|-----------|
| **Idle** | No sessions | Static orange lobster |
| **Walking** | Active sessions | Alternating walk frames |
| **Excited** | Petted | Bounce + yellow sparkles |
| **Sleeping** | Prolonged idle | Lower position, closed eyes |

## Technical Details

- Polls `/api/sessions_list` every 5 seconds
- Health decays 0.5% per 30 seconds
- Petting adds +5% health (max 100%)
- Activity adds +2% health
- Sprites use crisp-edges rendering for retro look

## Files

```
tamagotchi-lobster/
├── index.html          # Main dashboard
├── backend/
│   └── server.js       # API proxy server
├── assets/
│   ├── idle.png        # Base state
│   ├── walking.png     # Active animation
│   ├── excited.png     # Pet reaction
│   └── sleeping.png    # Rest state
└── create_sprites.py   # Pixel art generator
```

## Customization

Edit `index.html` directly:
- Line 15-80: Styling
- Line 200-280: Game logic
- Line 285-305: API integration

## API Endpoints

- `GET /` - Dashboard HTML
- `GET /api/sessions_list` - OpenClaw session data (proxied)
- `GET /api/health` - Server health check
- `GET /assets/*.png` - Sprite images

See `QUICK-START.md` for deployment and management details.

Built with ❤️ for OpenClaw
