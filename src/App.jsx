import React, { useEffect, useState } from 'react'
import Desktop from './components/Desktop/Desktop'
import Taskbar from './components/Taskbar/Taskbar'
import Window from './components/Window/Window'
import { BackgroundEffects } from './components/BackgroundEffects/BackgroundEffects'
import { APPS } from './config/apps'
import { DEFAULT_BG_CONFIG, getBgStyle, normalizeBgConfig } from './utils/backgroundConfig'

const App = () => {
  const [windows, setWindows] = useState([])
  const [activeWindow, setActiveWindow] = useState(null)
  const [bgConfig, setBgConfig] = useState(DEFAULT_BG_CONFIG)

  useEffect(() => {
    const saved = localStorage.getItem('browseros-bg')
    if (!saved) return
    try {
      setBgConfig(normalizeBgConfig(JSON.parse(saved)))
    } catch {
      setBgConfig(DEFAULT_BG_CONFIG)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('browseros-bg', JSON.stringify(bgConfig))
  }, [bgConfig])

  const openApp = (appId) => {
    const existing = [...windows].reverse().find((w) => w.appId === appId)
    if (existing) {
      setWindows((prev) => prev.map((w) => (w.id === existing.id ? { ...w, minimized: false } : w)))
      setActiveWindow(existing.id)
      return
    }

    const app = APPS.find((a) => a.id === appId)
    if (!app) return
    const count = windows.filter((w) => w.appId === appId).length
    const id = Date.now() + Math.round(Math.random() * 1000)
    setWindows((prev) => [...prev, {
      id,
      appId,
      title: app.name,
      icon: app.icon,
      minimized: false,
      initialX: 80 + count * 35,
      initialY: 60 + count * 35,
      initialW: app.window?.w || 600,
      initialH: app.window?.h || 450,
      minW: app.window?.minW || 300,
      minH: app.window?.minH || 200
    }])
    setActiveWindow(id)
  }

  const closeWindow = (id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
    if (activeWindow === id) setActiveWindow(null)
  }

  const minimizeWindow = (id) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
    if (activeWindow === id) setActiveWindow(null)
  }

  const focusWindow = (id) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: false } : w)))
    setActiveWindow(id)
  }

  const toggleWindowFromTaskbar = (id) => {
    const target = windows.find((w) => w.id === id)
    if (!target) return
    if (activeWindow === id && !target.minimized) return minimizeWindow(id)
    focusWindow(id)
  }

  return (
    <div className="os" style={getBgStyle(bgConfig)}>
      <BackgroundEffects bgConfig={bgConfig} />
      <Desktop windows={windows} openApp={openApp} />
      {windows.map((win) => {
        const app = APPS.find((a) => a.id === win.appId)
        const Comp = app ? app.component : null
        return (
          <Window
            key={win.id}
            win={win}
            component={Comp}
            activeWindow={activeWindow}
            bgConfig={bgConfig}
            setBgConfig={setBgConfig}
            focusWindow={focusWindow}
            closeWindow={closeWindow}
            minimizeWindow={minimizeWindow}
          />
        )
      })}
      <Taskbar windows={windows} apps={APPS} activeWindow={activeWindow} onToggleWindow={toggleWindowFromTaskbar} onOpenApp={openApp} />
    </div>
  )
}

export default App
