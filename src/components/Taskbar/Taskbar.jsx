import React, { useEffect, useRef, useState } from 'react'
import useClock from '../../hooks/useClock'

const Taskbar = ({ windows, apps, activeWindow, onToggleWindow, onOpenApp }) => {
  const time = useClock()
  const [isStartOpen, setIsStartOpen] = useState(false)
  const startMenuRef = useRef(null)

  useEffect(() => {
    if (!isStartOpen) return

    const handleOutsideClick = (event) => {
      if (startMenuRef.current && !startMenuRef.current.contains(event.target)) {
        setIsStartOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsStartOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isStartOpen])

  const handleStartClick = () => {
    setIsStartOpen(prev => !prev)
  }

  const handleStartAppLaunch = (appId) => {
    onOpenApp(appId)
    setIsStartOpen(false)
  }

  return (
    <div className="taskbar">
      <div className="taskbar-left">
        <div className="start-menu-container" ref={startMenuRef}>
          <button className={`start-button ${isStartOpen ? 'active' : ''}`} onClick={handleStartClick}>🖥️</button>
          {isStartOpen && (
            <div className="start-menu">
              <div className="start-menu-title">Apps</div>
              <div className="start-menu-list">
                {apps.map(app => (
                  <button key={app.id} className="start-menu-item" onClick={() => handleStartAppLaunch(app.id)}>
                    <span>{app.icon}</span>
                    <span>{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="taskbar-apps">
          {windows.map(win => (
            <button key={win.id} className={`taskbar-item ${activeWindow === win.id ? 'active' : ''}`}
              onClick={() => onToggleWindow(win.id)}>
              <span>{win.icon}</span>
              <span>{win.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="taskbar-right">
        <span className="clock">{time}</span>
      </div>
    </div>
  )
}

export default Taskbar