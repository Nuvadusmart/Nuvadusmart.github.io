import React from 'react'
import Icon from './Icon'

const APPS = [
  { id: 'clock', name: 'Clock', icon: '🕐' },
  { id: 'calculator', name: 'Calculator', icon: '🧮' },
  { id: 'snake', name: 'Snake Game', icon: '🐍' },
  { id: 'flappybird', name: 'Flappy Bird', icon: '🐦' },
  { id: 'geometricdash', name: 'Geometric Dash', icon: '🟩' },
  { id: 'backgrounds', name: 'Backgrounds', icon: '🎨' },
  { id: 'buildercalc', name: 'Builder Calculator', icon: '🔨' },
  { id: 'skidmark', name: 'Skidmarks', icon: '🏎️' }
]

const Desktop = ({ windows, openApp }) => {

  return (
    <div className="desktop">
      <div className="desktop-icons">
        {APPS.map((app) => (
          <Icon key={app.id} app={app} windows={windows} onOpenApp={openApp} />
        ))}
      </div>
    </div>
  )
}

export default Desktop