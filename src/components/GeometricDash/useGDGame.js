import { useEffect, useRef, useState } from 'react'
import { playSoundGD } from './audio'
import { drawFrame } from './render'
import { BASE_SPEED, BIG_BLOCK_HEIGHT, BIG_BLOCK_HITBOX_INSET, BIG_BLOCK_WIDTH, BLOCK_SIZE, GRAVITY, GROUND, JUMP_VEL, MAX_SPEED, PLAYER_SIZE, SPAWN_INTERVAL, W } from './constants'

const createState = () => ({
  player: { x: 100, y: GROUND - PLAYER_SIZE, vy: 0, angle: 0 },
  obstacles: [],
  particles: [],
  frame: 0,
  groundOffset: 0,
  speed: BASE_SPEED,
  running: false,
  dead: false
})

export const useGDGame = (canvasRef) => {
  const rafRef = useRef(0)
  const gRef = useRef(createState())
  const [score, setScore] = useState(0)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('gd-best') || '0', 10))
  const scoreRef = useRef(0)
  const bestScoreRef = useRef(parseInt(localStorage.getItem('gd-best') || '0', 10))

  const createParticles = (x, y) => {
    for (let i = 0; i < 15; i++) {
      gRef.current.particles.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1, color: `hsl(${Math.random() * 60 + 30},100%,50%)` })
    }
  }

  const resetGame = () => {
    gRef.current = { ...createState(), running: true }
    setScore(0)
    scoreRef.current = 0
    setGameOver(false)
    setStarted(true)
  }

  const jump = () => {
    const g = gRef.current
    if (g.dead) return
    const p = g.player
    if (p.y >= GROUND - PLAYER_SIZE - 5 || Math.abs(p.y - (GROUND - PLAYER_SIZE)) < 3) {
      p.vy = JUMP_VEL
      playSoundGD(600, 0.1, 'sine', 0.1)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return undefined

    let spawnTimer = 0
    const loop = () => {
      const g = gRef.current
      if (!g.running) {
        drawFrame(ctx, g, scoreRef.current, bestScoreRef.current)
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      g.frame += 1
      g.speed = Math.min(MAX_SPEED, BASE_SPEED)
      g.groundOffset = (g.groundOffset + g.speed) % BLOCK_SIZE
      spawnTimer += 1
      if (spawnTimer >= SPAWN_INTERVAL) {
        spawnTimer = 0
        const typeRoll = Math.random()
        if (typeRoll < 0.45) {
          g.obstacles.push({ x: W + 50, y: GROUND - BLOCK_SIZE * 2, w: BLOCK_SIZE, h: BLOCK_SIZE * 2, type: 'spike' })
        } else if (typeRoll < 0.75) {
          g.obstacles.push({ x: W + 50, y: GROUND - BLOCK_SIZE * 2, w: BLOCK_SIZE, h: BLOCK_SIZE * 2, type: 'spike' })
          g.obstacles.push({ x: W + 80, y: GROUND - BLOCK_SIZE * 2, w: BLOCK_SIZE, h: BLOCK_SIZE * 2, type: 'spike' })
        } else {
          g.obstacles.push({ x: W + 50, y: GROUND - BIG_BLOCK_HEIGHT, w: BIG_BLOCK_WIDTH, h: BIG_BLOCK_HEIGHT, type: 'block' })
        }
      }

      const p = g.player
      const wasAirborne = p.y < GROUND - PLAYER_SIZE
      p.vy += GRAVITY
      p.y += p.vy
      if (p.y >= GROUND - PLAYER_SIZE) {
        p.y = GROUND - PLAYER_SIZE
        p.vy = 0
        if (wasAirborne) {
          const quarterTurn = Math.PI / 2
          p.angle = Math.round(p.angle / quarterTurn) * quarterTurn
        }
      } else {
        p.angle += 0.09
      }

      g.obstacles.forEach((o) => { o.x -= g.speed })
      g.obstacles = g.obstacles.filter((o) => o.x > -o.w - 50)

      const px = p.x + 4
      const py = p.y + 4
      const pw = PLAYER_SIZE - 8
      const ph = PLAYER_SIZE - 8
      for (const o of g.obstacles) {
        if (o.type === 'spike') {
          if (!(px < o.x + o.w && px + pw > o.x && py < o.y + o.h && py + ph > o.y)) continue
        } else {
          const ox = o.x + BIG_BLOCK_HITBOX_INSET
          const oy = o.y + BIG_BLOCK_HITBOX_INSET
          const ow = o.w - BIG_BLOCK_HITBOX_INSET * 2
          const oh = o.h - BIG_BLOCK_HITBOX_INSET * 2
          if (!(px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy)) continue
        }

          g.dead = true
          g.running = false
          setGameOver(true)
          createParticles(p.x + PLAYER_SIZE / 2, p.y + PLAYER_SIZE / 2)
          playSoundGD(150, 0.4, 'sawtooth', 0.2)
          const finalScore = Math.floor(g.frame / 15)
          if (finalScore > bestScoreRef.current) {
            localStorage.setItem('gd-best', finalScore.toString())
            bestScoreRef.current = finalScore
            setBestScore(finalScore)
          }
        break
      }

      if (!g.dead && g.frame % 15 === 0) {
        const nextScore = Math.floor(g.frame / 15)
        scoreRef.current = nextScore
        setScore(nextScore)
      }
      g.particles.forEach((pt) => { pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.03 })
      g.particles = g.particles.filter((pt) => pt.life > 0)
      drawFrame(ctx, g, scoreRef.current, bestScoreRef.current)
      if (g.running || g.dead) rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [canvasRef])

  return { score, bestScore, started, gameOver, resetGame, jump }
}
