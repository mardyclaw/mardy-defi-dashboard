#!/bin/bash

# Mardy's Village - Game Launcher
# This script starts the game with all system dialogs suppressed

export DISPLAY=:0

# Kill any existing browsers/dialogs
pkill -9 chromium chromium-browser google-chrome firefox xterm konsole gnome-terminal 2>/dev/null || true
sleep 2

# Close all open windows/dialogs
xdotool search --name "." windowkill 2>/dev/null || true
sleep 1

# Suppress system dialogs
export GNOME_KEYRING_CONTROL=
export SSH_AUTH_SOCK=
export DBUS_SESSION_BUS_ADDRESS=
export DBUS_SYSTEM_BUS_ADDRESS=

# Kill keyring daemons
pkill -9 gnome-keyring ssh-agent 2>/dev/null || true
sleep 1

# Start HTTP server (if not already running)
if ! netstat -tuln 2>/dev/null | grep -q ":8000 "; then
  cd /home/mardy/.openclaw/workspace/dashboard
  python3 -m http.server 8000 > /dev/null 2>&1 &
  sleep 2
fi

# Set desktop background to game color
xsetroot -solid "#7cd896" 2>/dev/null || true

# Launch browser fullscreen with game
exec chromium \
  --no-sandbox \
  --disable-gpu-sandbox \
  --disable-password-manager \
  --new-window \
  --app="http://localhost:8000/game.html" \
  2>/dev/null
