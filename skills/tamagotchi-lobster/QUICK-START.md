# 🦞 Tamagotchi Lobster - Quick Start

Your pixel art tamagotchi lobster dashboard is **LIVE and READY**!

## 🚀 Access Now

**Direct Access (Working Now):**
```
http://192.168.0.109:18790
```

**Via Gateway (Needs Configuration):**
```
http://192.168.0.109:18789/tamagotchi/
```

## ✅ What's Working

- ✅ Pixel art sprites (4 states: idle, walking, excited, sleeping)
- ✅ Server running on port 18790
- ✅ Real-time session monitoring
- ✅ Click-to-pet interaction
- ✅ Health bar with decay system
- ✅ Task counter
- ✅ ETH balance display (simulated)
- ✅ Accessible from your main computer

## 🎮 How to Use

1. **Open the dashboard** at http://192.168.0.109:18790
2. **Click the lobster** to pet it (increases health, bounce animation)
3. **Watch it react:**
   - Walks when OpenClaw sessions are active
   - Sleeps when idle
   - Gets excited when petted
   - Health decays slowly over time

## 🔧 Server Management

**Server is currently running** (PID 52106)

To stop:
```bash
pkill -f "node server.js"
```

To restart:
```bash
cd /home/mardy/.openclaw/workspace/skills/tamagotchi-lobster/backend
node server.js &
```

To start at boot, add to crontab:
```bash
@reboot cd /home/mardy/.openclaw/workspace/skills/tamagotchi-lobster/backend && node server.js >> /tmp/tamagotchi.log 2>&1 &
```

## 📁 Files

- `index.html` - Main dashboard (single file, no build needed)
- `assets/*.png` - 8x16 pixel art sprites
- `backend/server.js` - Express server (simplified)
- `create_sprites.py` - Sprite generation script

## 🔌 Gateway Integration

To access via `/tamagotchi` path on the main gateway, you need to configure OpenClaw gateway routing. The gateway-config.json shows the desired setup:

```json
{
  "routes": [
    {
      "path": "/tamagotchi",
      "target": "http://localhost:18790"
    }
  ]
}
```

Check OpenClaw gateway documentation for route configuration.

## 🎨 Customization

All code is in `index.html` - edit directly:
- Change colors in CSS
- Adjust health decay rate
- Modify animation speeds
- Add new stats

## 📊 Data Sources

- **Sessions:** Fetches from `/api/sessions_list`
- **Health:** Simulated with decay/boost logic
- **Tasks:** Counts active sessions
- **ETH:** Mock data (integrate with actual wallet)

Enjoy your pixel lobster! 🦞✨
