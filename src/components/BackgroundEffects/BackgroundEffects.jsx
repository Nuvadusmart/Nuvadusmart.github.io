import React, { useEffect, useRef } from 'react'

const MatrixRain = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let rafId = 0
    let drops = []
    const fontSize = 15
    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%*+-'

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = Math.max(0, window.innerHeight - 48)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cols = Math.floor(width / fontSize)
      drops = Array(cols).fill(0).map(() => Math.floor(Math.random() * height / fontSize))
    }

    const draw = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.fillStyle = 'rgba(3, 10, 12, 0.14)'
      ctx.fillRect(0, 0, width, height)
      ctx.font = `${fontSize}px monospace`
      drops.forEach((drop, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drop * fontSize
        ctx.fillStyle = Math.random() > 0.6 ? 'rgba(190,255,198,0.9)' : 'rgba(74,214,102,0.65)'
        ctx.fillText(text, x, y)
        drops[i] = y > height && Math.random() > 0.975 ? 0 : drop + 1
      })
      rafId = window.requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    rafId = window.requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(rafId)
    }
  }, [])

  return <canvas ref={canvasRef} className="bg-matrix-canvas" aria-hidden="true" />
}

export const BackgroundEffects = ({ bgConfig }) => {
  const mode = bgConfig?.mode || 'gradient'

  if (mode === 'orbs') {
    return (
      <div className="bg-effects" aria-hidden="true">
        <div className="bg-orbs">
          <span className="bg-orb orb-1" />
          <span className="bg-orb orb-2" />
          <span className="bg-orb orb-3" />
          <span className="bg-orb orb-4" />
          <span className="bg-orb orb-5" />
        </div>
        <div className="bg-haze" />
      </div>
    )
  }

  if (mode === 'matrix') {
    return (
      <div className="bg-effects" aria-hidden="true">
        <MatrixRain />
        <div className="bg-haze matrix-haze" />
      </div>
    )
  }

  return null
}
