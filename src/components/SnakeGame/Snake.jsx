import React, { useState, useEffect, useRef } from 'react'

const GRID = 20
const CELL = 20

let audioCtx = null
const getAudioCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

const playSound = (freq, duration, type = 'square', vol = 0.15) => {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch (e) {}
}

const Snake = () => {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)

  const snakeRef = useRef([{ x: 10, y: 10 }])
  const dirRef = useRef({ x: 1, y: 0 })
  const foodRef = useRef({ x: 15, y: 15 })
  const scoreRef = useRef(0)
  const gameLoopRef = useRef(null)

  const spawnFood = () => ({
    x: Math.floor(Math.random() * GRID),
    y: Math.floor(Math.random() * GRID)
  })

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }]
    dirRef.current = { x: 1, y: 0 }
    foodRef.current = spawnFood()
    scoreRef.current = 0
    setScore(0)
    setGameOver(false)
    setStarted(true)
  }

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, GRID * CELL, GRID * CELL)

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath()
        ctx.moveTo(i * CELL, 0)
        ctx.lineTo(i * CELL, GRID * CELL)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * CELL)
        ctx.lineTo(GRID * CELL, i * CELL)
        ctx.stroke()
      }

      // Draw snake with gradient
      const snake = snakeRef.current
      snake.forEach((seg, i) => {
        const alpha = 1 - (i / snake.length) * 0.5
        ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`
        ctx.shadowColor = '#00ff88'
        ctx.shadowBlur = i === 0 ? 10 : 4
        ctx.beginPath()
        ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4)
        ctx.fill()
      })

      // Draw food
      const food = foodRef.current
      ctx.shadowColor = '#ff6b6b'
      ctx.shadowBlur = 15
      ctx.fillStyle = '#ff6b6b'
      ctx.beginPath()
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0
    }

    const update = () => {
      const snake = snakeRef.current
      const head = { x: snake[0].x + dirRef.current.x, y: snake[0].y + dirRef.current.y }

      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        playSound(150, 0.4, 'sawtooth', 0.2)
        setGameOver(true)
        clearInterval(gameLoopRef.current)
        return
      }

      for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          playSound(150, 0.4, 'sawtooth', 0.2)
          setGameOver(true)
          clearInterval(gameLoopRef.current)
          return
        }
      }

      const newSnake = [head, ...snake]

      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        scoreRef.current++
        setScore(scoreRef.current)
        playSound(880, 0.15, 'square', 0.12)
        setTimeout(() => playSound(1100, 0.1, 'square', 0.1), 80)
        foodRef.current = spawnFood()
      } else {
        newSnake.pop()
      }

      snakeRef.current = newSnake
    }

    draw()
    gameLoopRef.current = setInterval(() => { update(); draw() }, 100)
    return () => clearInterval(gameLoopRef.current)
  }, [gameOver])

  useEffect(() => {
    const handleKey = (e) => {
      playSound(440, 0.03, 'sine', 0.05)

      const dir = dirRef.current
      if (e.key === 'ArrowUp' && dir.y !== 1) dirRef.current = { x: 0, y: -1 }
      else if (e.key === 'ArrowDown' && dir.y !== -1) dirRef.current = { x: 0, y: 1 }
      else if (e.key === 'ArrowLeft' && dir.x !== 1) dirRef.current = { x: -1, y: 0 }
      else if (e.key === 'ArrowRight' && dir.x !== -1) dirRef.current = { x: 1, y: 0 }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleTouch = (dx, dy) => {
    const dir = dirRef.current
    if (dy === -1 && dir.y !== 1) dirRef.current = { x: 0, y: -1 }
    else if (dy === 1 && dir.y !== -1) dirRef.current = { x: 0, y: 1 }
    else if (dx === -1 && dir.x !== 1) dirRef.current = { x: -1, y: 0 }
    else if (dx === 1 && dir.x !== -1) dirRef.current = { x: 1, y: 0 }
  }

  return (
    <div className="snake-game">
      <div className="game-header">
        <span>Score: {score}</span>
        {!started ? (
          <button onClick={resetGame}>Start Game</button>
        ) : !gameOver ? null : (
          <button onClick={resetGame}>Play Again</button>
        )}
      </div>
      <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} />
      {!gameOver && started && (
        <div className="touch-controls">
          <button onMouseDown={() => handleTouch(0, -1)}>▲</button>
          <div className="row">
            <button onMouseDown={() => handleTouch(-1, 0)}>◀</button>
            <button onMouseDown={() => handleTouch(0, 1)}>▼</button>
            <button onMouseDown={() => handleTouch(1, 0)}>▶</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Snake