import React, { useState, useEffect } from 'react'

const TASKBAR_HEIGHT = 48
const WINDOW_MARGIN = 12

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const getClampedLaunchSize = (win) => {
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1280
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800
  const maxW = Math.max(360, viewportW - WINDOW_MARGIN * 2)
  const maxH = Math.max(260, viewportH - TASKBAR_HEIGHT - WINDOW_MARGIN * 2)

  return {
    w: clamp(win.initialW || 600, 300, maxW),
    h: clamp(win.initialH || 450, 200, maxH)
  }
}

const getClampedLaunchPos = (win, size) => {
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1280
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800
  const maxX = Math.max(WINDOW_MARGIN, viewportW - size.w - WINDOW_MARGIN)
  const maxY = Math.max(WINDOW_MARGIN, viewportH - TASKBAR_HEIGHT - size.h - WINDOW_MARGIN)

  return {
    x: clamp(win.initialX || 80, WINDOW_MARGIN, maxX),
    y: clamp(win.initialY || 60, WINDOW_MARGIN, maxY)
  }
}

const Window = ({ win, component: AppComponent, activeWindow, focusWindow, closeWindow, minimizeWindow, bgConfig, setBgConfig }) => {
  const launchSize = getClampedLaunchSize(win)
  const [size, setSize] = useState(launchSize)
  const [pos, setPos] = useState(getClampedLaunchPos(win, launchSize))
  const [maximized, setMaximized] = useState(false)
  const [dragging, setDragging] = useState(null)
  const [resizing, setResizing] = useState(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        setPos({ x: dragging.origX + e.clientX - dragging.startX, y: dragging.origY + e.clientY - dragging.startY })
      }
      if (resizing) {
        setSize({
          w: Math.max(win.minW || 300, resizing.origW + e.clientX - resizing.startX),
          h: Math.max(win.minH || 200, resizing.origH + e.clientY - resizing.startY)
        })
      }
    }
    const handleMouseUp = () => { setDragging(null); setResizing(null) }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp) }
  }, [dragging, resizing])

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls')) return
    if (maximized) return
    e.preventDefault()
    focusWindow(win.id)
    setDragging({ startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y })
  }

  const handleResizeDrag = (dir) => (e) => {
    e.stopPropagation()
    setResizing({ direction: dir, startX: e.clientX, startY: e.clientY, origW: size.w, origH: size.h })
  }

  const isActive = activeWindow === win.id

  if (win.minimized) return null

  return (
    <div className={`window ${isActive ? 'active' : ''} ${maximized ? 'maximized' : ''}`}
      style={{
        transform: maximized ? 'none' : `translate(${pos.x}px, ${pos.y}px)`,
        width: maximized ? '100vw' : size.w,
        height: maximized ? 'calc(100vh - 48px)' : size.h,
        zIndex: isActive ? 30 : 15
      }}
      onMouseDown={(e) => { e.stopPropagation(); focusWindow(win.id) }}>
      <div className="window-header" onMouseDown={handleMouseDown}>
        <span className="window-icon">{win.icon}</span>
        <span className="window-title">{win.title}</span>
        <div className="window-controls">
          <button className="btn-minimize" onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id) }}>─</button>
          <button className="btn-maximize" onClick={(e) => { e.stopPropagation(); setMaximized(!maximized) }}>{maximized ? '□' : '▪'}</button>
          <button className="btn-close" onClick={(e) => { e.stopPropagation(); closeWindow(win.id) }}>×</button>
        </div>
      </div>
      <div className="window-content">
        {AppComponent ? (
          win.appId === 'backgrounds'
            ? <AppComponent bgConfig={bgConfig} setBgConfig={setBgConfig} />
            : <AppComponent />
        ) : null}
      </div>
      {!maximized && <>
        <div className="resize-handle resize-n" onMouseDown={handleResizeDrag('n')} />
        <div className="resize-handle resize-s" onMouseDown={handleResizeDrag('s')} />
        <div className="resize-handle resize-e" onMouseDown={handleResizeDrag('e')} />
        <div className="resize-handle resize-w" onMouseDown={handleResizeDrag('w')} />
      </>}
    </div>
  )
}

export default Window
