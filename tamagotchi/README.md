# 🦞 Mardy's Cyber Lab

A production dashboard disguised as a fun pet game. Every metric is real. Every button does something.

## Features

### Real Data Integration
- **Wallet:** Real ETH balance from ACP (`npm run acp -- wallet balance`)
- **Sessions:** Real OpenClaw gateway status and running processes
- **System:** Real CPU, memory, disk usage from the Raspberry Pi
- **Activity:** Real-time activity log of all operations

### Functional Buttons
Every button does something real:
- **Browse ACP** → Search the ACP marketplace for agents
- **Check Wallet** → Show detailed wallet information
- **View Sessions** → List active sessions with process details
- **System Health** → Full system diagnostics
- **Gateway Status** → Check OpenClaw gateway status
- **Restart GW** → Actually restart the OpenClaw gateway
- **Top Procs** → Show top processes by CPU usage
- **Who Am I** → Show ACP agent identity

### Cyber Theme
- Matrix rain background effect
- Animated pet characters in a digital environment
- Real-time data visualizations with gauges
- Glow effects and cyber aesthetics

## Pets

- 🦞 **Mardy** - Main Agent (the lobster)
- 🦋 **Byte** - API Monitor (reacts to API calls)
- ⚡ **Spark** - Task Runner (reacts to task activity)
- 🐙 **Coral** - System Health (alerts on high CPU/memory)

## Running

```bash
# Start the server
node server.js

# Or use pm2 for production
pm2 start server.js --name mardy-dashboard
```

Access at: **http://192.168.0.109:18790**

## Architecture

```
tamagotchi/
├── index.html          # Main dashboard
├── server.js           # Backend with real data endpoints
├── css/
│   └── style.css       # Cyber aesthetic styling
└── js/
    ├── theme.js        # Matrix background, effects
    ├── api.js          # Real data fetching (ACP, sessions, system)
    ├── ui.js           # Dashboard panel updates
    ├── game.js         # Pet animations
    └── commands.js     # Functional button handlers
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/system/stats` | Real system metrics (CPU, memory, disk, temp) |
| `/api/wallet/balance` | Wallet balance from ACP |
| `/api/sessions` | Active sessions and gateway status |
| `/api/marketplace/search?q=` | Search ACP marketplace |
| `/api/marketplace/browse` | Browse ACP agents |
| `/api/activity` | Activity log |
| `/api/command` (POST) | Execute commands (gateway-status, etc.) |
| `/api/health` | Server health check |

## Data Refresh Rates

- System stats: every 3 seconds
- Sessions: every 5 seconds
- Wallet: every 30 seconds
- Activity: every 10 seconds
- Health check: every 5 seconds

## Alerts

The dashboard automatically alerts when:
- CPU usage > 80%
- Memory usage > 80%
- Disk usage > 90%

Coral the octopus also reacts to system alerts! 🐙
