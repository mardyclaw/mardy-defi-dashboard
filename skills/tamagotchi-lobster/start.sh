#!/bin/bash

# Quick start script for Tamagotchi Lobster Dashboard

SKILL_DIR="/home/mardy/.openclaw/workspace/skills/tamagotchi-lobster"

echo "🦞 Starting Tamagotchi Lobster Dashboard..."
echo ""

# Check if built
if [ ! -d "$SKILL_DIR/frontend/dist" ]; then
    echo "⚠️  Frontend not built yet!"
    echo "Running installation script..."
    "$SKILL_DIR/install.sh"
fi

# Check if node_modules exists
if [ ! -d "$SKILL_DIR/backend/node_modules" ]; then
    echo "⚠️  Backend dependencies not installed!"
    echo "Installing..."
    cd "$SKILL_DIR/backend"
    npm install
fi

# Start the server
echo "🚀 Starting server..."
cd "$SKILL_DIR/backend"
node server.js
