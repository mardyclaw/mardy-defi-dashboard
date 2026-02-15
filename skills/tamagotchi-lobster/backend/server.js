import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 18790
const OPENCLAW_GATEWAY = process.env.OPENCLAW_GATEWAY || 'http://localhost:18789'

// Serve static files from skill directory
const skillRoot = path.join(__dirname, '..')
app.use('/', express.static(skillRoot))
app.use(express.json())

// Proxy sessions_list API from OpenClaw gateway
app.get('/api/sessions_list', async (req, res) => {
  try {
    const response = await fetch(`${OPENCLAW_GATEWAY}/api/sessions_list`)
    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Failed to fetch sessions:', error.message)
    // Return mock data if gateway unavailable
    res.json({
      sessions: []
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// Fallback to index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(skillRoot, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🦞 Tamagotchi Lobster Dashboard running on http://0.0.0.0:${PORT}`)
  console.log(`\nAccess via OpenClaw Gateway: http://192.168.0.109:18789/tamagotchi`)
})
