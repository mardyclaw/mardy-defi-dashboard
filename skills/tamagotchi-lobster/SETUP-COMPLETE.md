# 🦞 Tamagotchi Lobster Dashboard - Setup Complete!

## ✅ Installation Status

Your Tamagotchi Lobster dashboard has been successfully installed and is ready to use!

## 🚀 Quick Start

The server is running on port **18790**:

```bash
# Start the server
cd /home/mardy/.openclaw/workspace/skills/tamagotchi-lobster
./start.sh

# Or manually
cd backend
node server.js
```

## 🌐 Access Points

### Direct Access (Current)
- **Dashboard**: http://192.168.0.109:18790
- **WebSocket**: ws://192.168.0.109:18790/ws
- **Health Check**: http://192.168.0.109:18790/api/health

### Via OpenClaw Gateway (Recommended)
- **Dashboard**: http://192.168.0.109:18789/tamagotchi
- **WebSocket**: ws://192.168.0.109:18789/tamagotchi/ws

See `GATEWAY-SETUP.md` for gateway configuration instructions.

## 📦 What's Included

✅ Pixel art lobster with 5 animation states (idle, walk, happy, excited, sleeping)
✅ Real-time system monitoring (CPU, memory, temperature)
✅ Wallet balance display
✅ API usage tracking
✅ Interactive petting feature
✅ Cleanup button
✅ Ocean-themed UI with waves and bubbles
✅ Responsive design for desktop and small screens
✅ WebSocket for real-time updates

## 🎮 How to Use

1. **Open the dashboard** in your browser
2. **Pet the lobster** by clicking on it (hearts appear!)
3. **Watch the mood** change based on system activity
4. **Feed & Cleanup** button triggers system maintenance
5. **Monitor metrics** in real-time on the right panel

## 🧪 Testing

```bash
# Check if server is running
curl http://localhost:18790/api/health

# View server logs
tail -f /tmp/tamagotchi.log

# Check metrics endpoint
curl http://localhost:18790/api/metrics
```

## 🔧 Configuration

### Change Port
Edit `backend/.env`:
```bash
PORT=18790
```

### Update WebSocket URL
Edit `frontend/.env`:
```bash
VITE_WS_URL=ws://192.168.0.109:18790/ws
```

Then rebuild frontend:
```bash
cd frontend
npm run build
```

## 🤖 Run as Service

Create a systemd service:

```bash
sudo tee /etc/systemd/system/tamagotchi-lobster.service > /dev/null <<EOF
[Unit]
Description=Tamagotchi Lobster Dashboard
After=network.target

[Service]
Type=simple
User=mardy
WorkingDirectory=/home/mardy/.openclaw/workspace/skills/tamagotchi-lobster/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=18790

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable tamagotchi-lobster
sudo systemctl start tamagotchi-lobster
```

Service commands:
```bash
sudo systemctl status tamagotchi-lobster
sudo systemctl restart tamagotchi-lobster
sudo systemctl stop tamagotchi-lobster
sudo journalctl -u tamagotchi-lobster -f
```

## 📁 File Structure

```
skills/tamagotchi-lobster/
├── assets/
│   └── lobster-sprites.svg        # Pixel art animations
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── hooks/                 # WebSocket hook
│   │   └── App.jsx                # Main app
│   ├── dist/                      # Built files
│   └── package.json
├── backend/
│   ├── server.js                  # Express + WebSocket server
│   └── package.json
├── README.md                      # User guide
├── SKILL.md                       # Technical docs
├── GATEWAY-SETUP.md              # Gateway configuration
├── install.sh                     # Installation script
└── start.sh                       # Quick start script
```

## 🎨 Customization

See `README.md` for full customization guide including:
- Changing colors
- Modifying health formula
- Adjusting update frequency
- Creating new sprites

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port is in use
netstat -tuln | grep 18790

# Kill existing process
pkill -f "node server.js"
```

### Dashboard not loading
```bash
# Rebuild frontend
cd frontend
npm run build

# Check if files exist
ls -la frontend/dist/
```

### WebSocket not connecting
```bash
# Check server logs
tail -f /tmp/tamagotchi.log

# Test WebSocket connection
websocat ws://localhost:18790/ws
```

## 📚 Documentation

- **README.md** - Full user guide
- **SKILL.md** - Technical reference
- **GATEWAY-SETUP.md** - Gateway integration
- **SETUP-COMPLETE.md** - This file!

## 🎉 Next Steps

1. **Test the dashboard** - Open http://192.168.0.109:18790
2. **Pet Mardy** - Click the lobster!
3. **Watch metrics update** - Real-time every 5 seconds
4. **Configure gateway** - See GATEWAY-SETUP.md
5. **Set up autostart** - Create systemd service

## 💡 Tips

- Pet Mardy at least once a day to keep him happy! 
- The cleanup button helps maintain system health
- Watch the mood change during different times of day
- Health bar reflects wallet balance + system resources
- Try clicking the settings button (more features coming!)

---

**Enjoy your Tamagotchi Lobster! 🦞✨**

Having issues? Check the logs at `/tmp/tamagotchi.log`
