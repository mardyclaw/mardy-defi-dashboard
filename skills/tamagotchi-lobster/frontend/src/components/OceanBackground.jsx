import { useEffect, useState } from 'react'
import './OceanBackground.css'

function OceanBackground() {
  const [bubbles, setBubbles] = useState([])

  useEffect(() => {
    // Generate random bubbles
    const newBubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 20,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: Math.random() * 10 + 10
    }))
    setBubbles(newBubbles)
  }, [])

  return (
    <div className="ocean-background">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`
          }}
        />
      ))}
      
      {/* Wave overlay */}
      <div className="wave wave1"></div>
      <div className="wave wave2"></div>
      <div className="wave wave3"></div>
    </div>
  )
}

export default OceanBackground
