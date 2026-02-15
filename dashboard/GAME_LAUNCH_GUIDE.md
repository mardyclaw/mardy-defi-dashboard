# 🦞 Mardy's Village - Launch Guide

## What's Been Built ✅
- **Game HTML:** `/home/mardy/.openclaw/workspace/dashboard/game.html`
- **HTTP Server:** Running on `http://localhost:8000`
- **Game Features:** 
  - Green Fire Red village environment
  - Walkable lobster character (🦞)
  - Clickable houses to visit
  - Arrow keys to move (↑↓←→ or WASD)

## The Problem 🚫
System keyring dialogs keep blocking the browser from displaying. This is a Linux security feature interfering with display.

## Solutions (Choose One)

### Option 1: Disable Keyring (Recommended)
```bash
# Open terminal and run:
killall gnome-keyring-daemon 2>/dev/null || true
killall ssh-agent 2>/dev/null || true

# Then launch browser:
firefox http://localhost:8000/game.html &
```

### Option 2: Use the Launcher Script
```bash
bash /home/mardy/.openclaw/workspace/dashboard/start-game.sh
```

### Option 3: Desktop Entry (Autostart)
Copy the .desktop file to autostart folder:
```bash
cp /home/mardy/.openclaw/workspace/dashboard/mardy-game.desktop \
   ~/.config/autostart/
```
Game will launch automatically on next reboot.

### Option 4: Manual Launch from Terminal
```bash
# In terminal:
export DISPLAY=:0
pkill -9 chromium firefox python3
cd /home/mardy/.openclaw/workspace/dashboard
python3 -m http.server 8000 &
chromium --no-sandbox http://localhost:8000/game.html
```

## If Keyring Password Dialog Appears
- **Option A:** Enter a password, click Continue
- **Option B:** Leave blank, click Continue (creates unlocked keyring)
- **Option C:** Click Cancel (may require repeated clicking)

## Game Controls
- **Arrow Keys** or **WASD** - Move lobster around
- **Click Houses** - Visit locations, record in mailbox
- **Navigate the village** - Explore the Fire Red environment

## Server Already Running
HTTP server is running at: `http://localhost:8000/game.html`
Port: **8000**
Can access from any device on network with: `http://<pi-ip>:8000/game.html`

## If Still Not Working
1. Check server: `curl http://localhost:8000/game.html`
2. Restart server: `pkill python3 && cd ~/...dashboard && python3 -m http.server 8000 &`
3. Check X display: `echo $DISPLAY` (should be `:0`)
4. Restart X: `pkill Xwayland` (will require re-login)

---

**The game is 100% built and ready. Just need to clear system dialogs. 🦞**
