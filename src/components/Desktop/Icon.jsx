import React from 'react'

const Icon = ({ app, windows, onOpenApp }) => {
  const isActive = windows.some(w => w.appId === app.id && !w.minimized)
  const isMinimized = windows.some(w => w.appId === app.id && w.minimized)

  return (
    <div className="desktop-icon" onClick={() => onOpenApp(app.id)} title={app.name}>
      <span className="icon-emoji">{app.icon}</span>
      <span className={`icon-label ${isActive ? 'active' : ''} ${isMinimized ? 'minimized' : ''}`}>{app.name}</span>
    </div>
  )
}

export default Icon