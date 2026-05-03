import React, { useState, useEffect } from 'react'

const Clock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours() % 12
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()
  const hourAngle = (hours * 30) + (minutes * 0.5)
  const minuteAngle = minutes * 6
  const secondAngle = seconds * 6

  return (
    <div className="clock-widget">
      <div className="analog-clock">
        <div className="clock-face">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(num => {
            const angle = (num * 30 - 90) * (Math.PI / 180)
            const x = 100 + 75 * Math.cos(angle)
            const y = 100 + 75 * Math.sin(angle)
            return (
              <span key={num} className="clock-number" style={{
                position: 'absolute',
                left: `${x - 8}px`,
                top: `${y - 10}px`,
                transform: 'none'
              }}>{num}</span>
            )
          })}
          <div className="hand hour-hand" style={{ transform: `rotate(${hourAngle}deg)` }} />
          <div className="hand minute-hand" style={{ transform: `rotate(${minuteAngle}deg)` }} />
          <div className="hand second-hand" style={{ transform: `rotate(${secondAngle}deg)` }} />
          <div className="center-dot" />
        </div>
      </div>
      <div className="digital-time">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="digital-date">
        {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  )
}

export default Clock