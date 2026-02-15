import { useState, useEffect } from 'react'
import Lobster from './components/Lobster'
import Dashboard from './components/Dashboard'
import OceanBackground from './components/OceanBackground'
import useWebSocket from './hooks/useWebSocket'
import './App.css'

function App() {
  const { data, connected, sendMessage } = useWebSocket()
  const [mood, setMood] = useState('idle')
  const [health, setHealth] = useState(85)
  const [petCount, setPetCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  // Calculate mood based on system state
  useEffect(() => {
    if (!data) return

    const { sessions, system, wallet } = data

    // Determine mood
    if (system?.cpu > 80 || system?.memory > 90) {
      setMood('busy')
    } else if (sessions?.active > 0) {
      setMood(sessions.active > 2 ? 'excited' : 'happy')
    } else if (new Date().getHours() < 6 || new Date().getHours() > 22) {
      setMood('sleeping')
    } else {
      setMood('idle')
    }

    // Calculate health (wallet + system resources)
    const walletHealth = wallet?.balance > 0 ? 30 : 10
    const cpuHealth = ((100 - (system?.cpu || 0)) / 100) * 35
    const memHealth = ((100 - (system?.memory || 0)) / 100) * 35
    setHealth(Math.round(walletHealth + cpuHealth + memHealth))
  }, [data])

  const handlePet = () => {
    setPetCount(prev => prev + 1)
    setMood('excited')
    setTimeout(() => setMood('happy'), 2000)
  }

  const handleCleanup = () => {
    sendMessage({ action: 'cleanup' })
    setHealth(Math.min(100, health + 10))
    setMood('happy')
  }

  return (
    <div className="app">
      <OceanBackground />
      
      <header className="header">
        <h1>🦞 Mardy the Lobster</h1>
        <div className="connection-status">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <main className="main-content">
        <div className="lobster-container">
          <Lobster mood={mood} onPet={handlePet} />
          <div className="mood-label">{mood.toUpperCase()}</div>
        </div>

        <Dashboard 
          data={data}
          health={health}
          mood={mood}
          petCount={petCount}
          onCleanup={handleCleanup}
          onSettings={() => setShowSettings(!showSettings)}
        />
      </main>

      {showSettings && (
        <div className="settings-modal" onClick={() => setShowSettings(false)}>
          <div className="settings-content" onClick={e => e.stopPropagation()}>
            <h2>Settings</h2>
            <p>🚧 Customization coming soon!</p>
            <p>Future features:</p>
            <ul>
              <li>Choose different pixel creatures</li>
              <li>Custom color themes</li>
              <li>Animation speed</li>
              <li>Sound effects</li>
            </ul>
            <button onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>OpenClaw Agent Dashboard • Running on Raspberry Pi</p>
      </footer>
    </div>
  )
}

export default App
