#!/bin/bash

# Tamagotchi Lobster Dashboard - Installation Script
# This script sets up the frontend, backend, and starts the server

set -e

SKILL_DIR="/home/mardy/.openclaw/workspace/skills/tamagotchi-lobster"

echo "🦞 Installing Tamagotchi Lobster Dashboard..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ first:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    exit 1
fi

echo "✓ Node.js $(node --version) found"
echo ""

# Create public directory for frontend
mkdir -p "$SKILL_DIR/frontend/public"

# Copy lobster sprites to public directory
echo "📦 Copying assets..."
cp "$SKILL_DIR/assets/lobster-sprites.svg" "$SKILL_DIR/frontend/public/"
echo "✓ Assets copied"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd "$SKILL_DIR/frontend"
npm install
echo "✓ Frontend dependencies installed"
echo ""

# Build frontend
echo "🔨 Building frontend..."
npm run build
echo "✓ Frontend built"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd "$SKILL_DIR/backend"
npm install
echo "✓ Backend dependencies installed"
echo ""

# Create systemd service file (optional)
read -p "Do you want to create a systemd service to run on boot? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    SERVICE_FILE="/etc/systemd/system/tamagotchi-lobster.service"
    
    echo "Creating systemd service..."
    sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Tamagotchi Lobster Dashboard
After=network.target

[Service]
Type=simple
User=mardy
WorkingDirectory=$SKILL_DIR/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable tamagotchi-lobster.service
    sudo systemctl start tamagotchi-lobster.service
    
    echo "✓ Systemd service created and started"
    echo ""
    echo "Service commands:"
    echo "  sudo systemctl status tamagotchi-lobster"
    echo "  sudo systemctl stop tamagotchi-lobster"
    echo "  sudo systemctl restart tamagotchi-lobster"
else
    echo ""
    echo "To start manually, run:"
    echo "  cd $SKILL_DIR/backend"
    echo "  npm start"
fi

echo ""
echo "✨ Installation complete!"
echo ""
echo "🦞 Access your dashboard at:"
echo "   http://192.168.0.109:18789/tamagotchi"
echo ""
echo "📖 See README.md for customization and troubleshooting"
echo ""
