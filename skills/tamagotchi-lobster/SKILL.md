# Tamagotchi Lobster Dashboard

A simple pixel art tamagotchi-style dashboard for OpenClaw featuring an animated lobster that responds to system activity.

## Features

- **Pixel Art Lobster**: 8x16 pixel sprites with 4 states (idle, walking, excited, sleeping)
- **Real-time Activity**: Monitors OpenClaw sessions via `/api/sessions_list`
- **Interactive**: Click to pet the lobster and increase its health
- **Health System**: Health decays over time, increases with activity and pets
- **Stats Display**: Shows sessions, tasks, and simulated ETH balance

## Files

- `index.html` - Main dashboard (vanilla HTML/CSS/JS)
- `assets/idle.png` - Idle state sprite
- `assets/walking.png` - Walking animation frame
- `assets/excited.png` - Excited state (when petted)
- `assets/sleeping.png` - Sleeping state (when idle)
- `create_sprites.py` - Script to generate pixel art sprites

## Behavior

- **Active**: Lobster walks when sessions are active
- **Idle**: Lobster sleeps when no sessions detected
- **Pet**: Click lobster for bounce animation and health boost
- **Health**: Decays slowly over time, increases with activity

## Access

Dashboard available at: `http://192.168.0.109:18789/tamagotchi/`

## Technical

- No build step required
- No external dependencies
- Polls API every 5 seconds
- Fully self-contained single HTML file
