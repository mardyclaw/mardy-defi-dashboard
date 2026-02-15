const express = require('express');
const cors = require('cors');
const fs = require('fs');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const startTime = Date.now();

// Mock activity log (in real setup, pull from OpenClaw sessions)
let activityLog = [
  { time: new Date().toLocaleTimeString(), action: 'System booted', status: 'ready' }
];

// API endpoint for dashboard data
app.get('/api/status', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const cpuUsage = (os.loadavg()[0] * 100).toFixed(1);
  const freeMemory = (os.freemem() / os.totalmem() * 100).toFixed(1);
  
  res.json({
    name: 'Mardy',
    emoji: '🧠',
    status: 'online',
    uptime: uptime,
    cpuUsage: cpuUsage,
    memoryFree: freeMemory,
    activities: activityLog.slice(-8),
    timestamp: new Date().toISOString()
  });
});

// HTML Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mardy Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%);
      color: #eee;
      font-family: 'Courier New', monospace;
      overflow: hidden;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .container {
      width: 95vw;
      height: 95vh;
      background: rgba(0, 0, 0, 0.6);
      border: 2px solid #00ff88;
      border-radius: 12px;
      padding: 40px;
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      gap: 30px;
      box-shadow: 0 0 40px rgba(0, 255, 136, 0.2);
    }
    
    .avatar {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 255, 136, 0.05);
      border: 2px solid #00ff88;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
    }
    
    .avatar-emoji {
      font-size: 120px;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    .avatar-name {
      font-size: 32px;
      font-weight: bold;
      color: #00ff88;
      margin-bottom: 10px;
    }
    
    .avatar-status {
      font-size: 14px;
      color: #00cc66;
      margin-bottom: 20px;
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      background: #00ff88;
      border-radius: 50%;
      display: inline-block;
      margin-right: 8px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .metrics {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .metric {
      background: rgba(0, 255, 136, 0.08);
      border-left: 3px solid #00ff88;
      padding: 15px;
      border-radius: 6px;
      font-size: 14px;
    }
    
    .metric-label {
      color: #00ff88;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .metric-value {
      font-size: 20px;
      color: #fff;
    }
    
    .progress-bar {
      background: rgba(0, 255, 136, 0.1);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }
    
    .progress-fill {
      background: linear-gradient(90deg, #00ff88, #00cc66);
      height: 100%;
      border-radius: 4px;
    }
    
    .center {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .title {
      text-align: center;
      font-size: 24px;
      color: #00ff88;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .activity-log {
      background: rgba(0, 255, 136, 0.03);
      border: 1px solid #00ff88;
      border-radius: 8px;
      padding: 20px;
      flex: 1;
      overflow-y: auto;
    }
    
    .activity-log h3 {
      color: #00ff88;
      margin-bottom: 15px;
      font-size: 14px;
      text-transform: uppercase;
    }
    
    .activity-item {
      padding: 10px;
      margin: 8px 0;
      background: rgba(0, 255, 136, 0.05);
      border-left: 2px solid #00ff88;
      border-radius: 4px;
      font-size: 12px;
      color: #ccc;
    }
    
    .activity-time {
      color: #00ff88;
      font-weight: bold;
    }
    
    .right-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .info-box {
      background: rgba(0, 255, 136, 0.05);
      border: 2px solid #00ff88;
      border-radius: 8px;
      padding: 20px;
      font-size: 13px;
      text-align: center;
    }
    
    .info-box h4 {
      color: #00ff88;
      margin-bottom: 10px;
      font-size: 14px;
      text-transform: uppercase;
    }
    
    .info-value {
      font-size: 18px;
      color: #fff;
      margin-bottom: 8px;
    }
    
    .divider { height: 1px; background: rgba(0, 255, 136, 0.2); margin: 20px 0; }
    
    /* Scrollbar styling */
    .activity-log::-webkit-scrollbar {
      width: 6px;
    }
    .activity-log::-webkit-scrollbar-track {
      background: rgba(0, 255, 136, 0.05);
      border-radius: 3px;
    }
    .activity-log::-webkit-scrollbar-thumb {
      background: #00ff88;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Left: Avatar -->
    <div class="avatar">
      <div class="avatar-emoji">🦞</div>
      <div class="avatar-name" id="name">Mardy</div>
      <div class="avatar-status">
        <span class="status-dot"></span>
        <span id="status">Online</span>
      </div>
      <div class="divider"></div>
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Uptime</div>
          <div class="metric-value" id="uptime">0s</div>
        </div>
      </div>
    </div>
    
    <!-- Center: Activity & Metrics -->
    <div class="center">
      <div class="title">Live Status</div>
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">CPU Usage</div>
          <div class="metric-value" id="cpu">0%</div>
          <div class="progress-bar">
            <div class="progress-fill" id="cpu-bar" style="width: 0%"></div>
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">Memory Available</div>
          <div class="metric-value" id="memory">0%</div>
          <div class="progress-bar">
            <div class="progress-fill" id="memory-bar" style="width: 0%"></div>
          </div>
        </div>
      </div>
      
      <div class="activity-log">
        <h3>Activity Log</h3>
        <div id="activities"></div>
      </div>
    </div>
    
    <!-- Right: Info -->
    <div class="right-panel">
      <div class="info-box">
        <h4>Mode</h4>
        <div class="info-value">Online</div>
      </div>
      <div class="info-box">
        <h4>Sensors</h4>
        <div class="info-value">📷 🎙️ 🔊</div>
      </div>
      <div class="info-box">
        <h4>Network</h4>
        <div class="info-value">Connected</div>
      </div>
      <div class="info-box">
        <h4>Last Update</h4>
        <div class="info-value" id="update-time" style="font-size: 12px;">Now</div>
      </div>
    </div>
  </div>
  
  <script>
    async function updateStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        // Update avatar
        document.getElementById('name').textContent = data.name;
        document.getElementById('status').textContent = data.status === 'online' ? 'Online' : 'Offline';
        
        // Update metrics
        document.getElementById('uptime').textContent = formatUptime(data.uptime);
        document.getElementById('cpu').textContent = data.cpuUsage + '%';
        document.getElementById('cpu-bar').style.width = Math.min(data.cpuUsage, 100) + '%';
        document.getElementById('memory').textContent = data.memoryFree + '%';
        document.getElementById('memory-bar').style.width = data.memoryFree + '%';
        
        // Update activities
        const actDiv = document.getElementById('activities');
        actDiv.innerHTML = '';
        data.activities.forEach(act => {
          const div = document.createElement('div');
          div.className = 'activity-item';
          div.innerHTML = '<span class="activity-time">' + act.time + '</span> • ' + act.action;
          actDiv.appendChild(div);
        });
        
        document.getElementById('update-time').textContent = new Date().toLocaleTimeString();
      } catch (e) {
        console.error('Update failed:', e);
      }
    }
    
    function formatUptime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      if (hours > 0) return hours + 'h ' + mins + 'm';
      if (mins > 0) return mins + 'm ' + secs + 's';
      return secs + 's';
    }
    
    updateStatus();
    setInterval(updateStatus, 2000);
  </script>
</body>
</html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Dashboard running on http://localhost:' + PORT);
  console.log('Open in browser on the Pi');
});
