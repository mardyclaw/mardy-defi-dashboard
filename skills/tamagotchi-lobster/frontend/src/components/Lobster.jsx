import { useState, useEffect } from 'react'
import './Lobster.css'

const spriteMap = {
  idle: { x: 0, y: 0, frames: 1 },
  walk: { x: 128, y: 0, frames: 2, frameWidth: 128 },
  happy: { x: 128, y: 0, frames: 2, frameWidth: 128 },
  excited: { x: 384, y: 0, frames: 1 },
  sleeping: { x: 512, y: 0, frames: 1 },
  busy: { x: 128, y: 0, frames: 2, frameWidth: 128 }
}

function Lobster({ mood = 'idle', onPet }) {
  const [frame, setFrame] = useState(0)
  const [isPetting, setIsPetting] = useState(false)
  const [hearts, setHearts] = useState([])

  // Animate sprite frames
  useEffect(() => {
    const sprite = spriteMap[mood]
    if (sprite.frames === 1) return

    const speed = mood === 'busy' ? 150 : 300
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % sprite.frames)
    }, speed)

    return () => clearInterval(interval)
  }, [mood])

  const handleClick = () => {
    setIsPetting(true)
    onPet?.()
    
    // Add floating heart
    const newHeart = {
      id: Date.now(),
      x: Math.random() * 100 - 50,
      y: 0
    }
    setHearts(prev => [...prev, newHeart])
    
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id))
    }, 2000)

    setTimeout(() => setIsPetting(false), 500)
  }

  const sprite = spriteMap[mood]
  const spriteX = sprite.x + (frame * (sprite.frameWidth || 128))

  return (
    <div className={`lobster-wrapper ${mood}`}>
      <svg
        className={`lobster pixelated ${isPetting ? 'petting' : ''}`}
        viewBox="0 0 128 128"
        width="256"
        height="256"
        onClick={handleClick}
      >
        <use
          href="/lobster-sprites.svg#lobster-idle"
          x={-spriteX}
          y="0"
        />
      </svg>

      {hearts.map(heart => (
        <div
          key={heart.id}
          className="heart"
          style={{
            left: `calc(50% + ${heart.x}px)`,
            '--heart-x': `${heart.x}px`
          }}
        >
          ❤️
        </div>
      ))}

      {mood === 'sleeping' && (
        <div className="sleep-indicator">
          <span className="z" style={{ animationDelay: '0s' }}>Z</span>
          <span className="z" style={{ animationDelay: '0.3s' }}>z</span>
          <span className="z" style={{ animationDelay: '0.6s' }}>z</span>
        </div>
      )}
    </div>
  )
}

export default Lobster
