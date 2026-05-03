import { useEffect, useRef, useState } from 'react'
import { CHECKPOINTS, TRACK, pointInRoundedRect } from './constants'
import { drawCar, drawSkids, drawTrack } from './render'

const mkState = () => ({
  car: { x: TRACK.cx - TRACK.outerW / 2 + 95, y: TRACK.cy + 120, angle: 0, speed: 0 },
  keys: {},
  skids: [],
  boost: 100,
  score: 0,
  combo: 0,
  laps: 0,
  cp: 0,
  time: 90,
  over: false,
  lastTs: 0
})

export const useSkidmarkEngine = (canvasRef, started, setStarted) => {
  const rafRef = useRef(0)
  const gRef = useRef(mkState())
  const [hud, setHud] = useState({ score: 0, time: 90, laps: 0, combo: 0, boost: 100 })
  const [gameOver, setGameOver] = useState(false)

  const restart = () => {
    gRef.current = mkState()
    setHud({ score: 0, time: 90, laps: 0, combo: 0, boost: 100 })
    setGameOver(false)
    setStarted(true)
  }

  useEffect(() => {
    if (!started || gameOver) return undefined
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return undefined

    gRef.current = mkState()

    const onDown = (e) => { gRef.current.keys[e.key.toLowerCase()] = true }
    const onUp = (e) => { gRef.current.keys[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)

    const loop = (ts) => {
      const g = gRef.current
      if (g.over) return
      if (!g.lastTs) g.lastTs = ts
      const dt = Math.min(2.2, (ts - g.lastTs) / 16.67)
      g.lastTs = ts
      const dtSec = dt / 60

      const car = g.car
      const up = g.keys.w || g.keys.arrowup
      const down = g.keys.s || g.keys.arrowdown
      const left = g.keys.a || g.keys.arrowleft
      const right = g.keys.d || g.keys.arrowright
      const boosting = !!g.keys.shift && g.boost > 0.4 && up

      g.time = Math.max(0, g.time - dtSec)
      if (g.time <= 0) {
        g.over = true
        setStarted(false)
        setGameOver(true)
        return
      }

      const accel = boosting ? 0.28 : 0.2
      const maxSpeed = boosting ? 12.5 : 9.5
      if (up) car.speed = Math.min(maxSpeed, car.speed + accel * dt)
      else if (down) car.speed = Math.max(-3.2, car.speed - 0.24 * dt)
      else car.speed *= Math.pow(0.986, dt)

      if (Math.abs(car.speed) > 0.3) {
        const steer = 0.055 * (Math.abs(car.speed) / 7)
        if (left) car.angle -= steer * dt
        if (right) car.angle += steer * dt
      }

      const prevX = car.x
      const prevY = car.y
      car.x += Math.cos(car.angle) * car.speed * dt
      car.y += Math.sin(car.angle) * car.speed * dt

      const inOuter = pointInRoundedRect(car.x, car.y, TRACK.cx, TRACK.cy, TRACK.outerW, TRACK.outerH, TRACK.outerR)
      const inInner = pointInRoundedRect(car.x, car.y, TRACK.cx, TRACK.cy, TRACK.innerW - 10, TRACK.innerH - 10, TRACK.innerR)
      if (!(inOuter && !inInner)) {
        car.x = prevX
        car.y = prevY
        car.speed *= 0.72
      }

      g.boost = boosting ? Math.max(0, g.boost - 25 * dtSec) : Math.min(100, g.boost + 9 * dtSec)

      const drift = Math.abs(car.speed) > 4 && (left || right)
      if (drift) {
        const sideX = Math.cos(car.angle + Math.PI / 2) * 9
        const sideY = Math.sin(car.angle + Math.PI / 2) * 9
        const rearX = car.x - Math.cos(car.angle) * 15
        const rearY = car.y - Math.sin(car.angle) * 15
        g.skids.push({ x1: rearX - sideX, y1: rearY - sideY, x2: rearX + sideX, y2: rearY + sideY, heavy: true, life: 2, maxLife: 2 })
        g.combo += 1.2 * dt
        g.score += (1 + Math.abs(car.speed) * 0.2) * dt
      } else {
        g.combo *= Math.pow(0.9, dt)
      }

      g.skids.forEach((s) => { s.life -= dtSec })
      g.skids = g.skids.filter((s) => s.life > 0).slice(-220)

      const cp = CHECKPOINTS[g.cp]
      const d = Math.hypot(car.x - cp.x, car.y - cp.y)
      if (d < 40) {
        g.cp += 1
        if (g.cp >= CHECKPOINTS.length) {
          g.cp = 0
          g.laps += 1
          g.score += 240
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawTrack(ctx)
      drawSkids(ctx, g.skids)
      drawCar(ctx, car, boosting)

      setHud({ score: Math.floor(g.score), time: Math.ceil(g.time), laps: g.laps, combo: Math.floor(g.combo), boost: Math.round(g.boost) })
      rafRef.current = window.requestAnimationFrame(loop)
    }

    rafRef.current = window.requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.cancelAnimationFrame(rafRef.current)
    }
  }, [started, gameOver, canvasRef, setStarted])

  return { hud, gameOver, restart }
}
