# Gateway Setup Instructions

The Tamagotchi Lobster dashboard needs to be proxied through the OpenClaw gateway on port 18789.

## Option 1: Manual Gateway Configuration

If OpenClaw gateway supports custom routes, add this configuration:

```json
{
  "routes": [
    {
      "path": "/tamagotchi",
      "target": "http://localhost:18790",
      "ws": true
    }
  ]
}
```

## Option 2: Nginx Reverse Proxy

If using nginx as the gateway, add this to your config:

```nginx
location /tamagotchi {
    proxy_pass http://localhost:18790;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Option 3: Direct Access (Temporary)

For testing, you can access the dashboard directly on port 18790:

```
http://192.168.0.109:18790
```

WebSocket connects to:
```
ws://192.168.0.109:18790/ws
```

## Updating After Gateway Config

After configuring the gateway, update the WebSocket URL in the frontend:

Edit `frontend/.env`:
```bash
VITE_WS_URL=ws://192.168.0.109:18789/tamagotchi/ws
```

Then rebuild:
```bash
cd frontend
npm run build
```

## Firewall Rules

Make sure port 18790 is accessible:

```bash
sudo ufw allow 18790/tcp
sudo ufw reload
```
