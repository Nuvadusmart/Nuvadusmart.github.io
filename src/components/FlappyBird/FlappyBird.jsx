import React, { useState, useEffect, useRef } from 'react'

let audioCtx = null
const getAudioCtxFB = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

const playSoundFB = (freq, duration, type = 'square', vol = 0.15) => {
  try {
    const ctx = getAudioCtxFB()
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

const FlappyBird = () => {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)

  const gameRef = useRef({
    bird: { y: 250, velocity: 0 }, pipes: [], frame: 0, gravity: 0.4,
    flapPower: -7, pipeGap: 130, pipeWidth: 60, pipeSpeed: 3
  })

  const resetGame = () => {
    gameRef.current = { bird: { y: 250, velocity: 0 }, pipes: [], frame: 0,
      gravity: 0.4, flapPower: -7, pipeGap: 130, pipeWidth: 60, pipeSpeed: 3 }
    setScore(0); setGameOver(false); setStarted(true)
  }

  const flap = () => {
    if (gameOver || !started) return
    playSoundFB(500, 0.1, 'sine', 0.12)
    gameRef.current.bird.velocity = gameRef.current.flapPower
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      const g = gameRef.current; g.frame++
      g.bird.velocity += g.gravity; g.bird.y += g.bird.velocity

      if (g.frame % 90 === 0) {
        g.pipes.push({ x: 400, topH: Math.random() * 180 + 50, scored: false })
      }
      g.pipes.forEach(p => { p.x -= g.pipeSpeed })
      g.pipes = g.pipes.filter(p => p.x > -g.pipeWidth)

      const birdX = 80
      if (g.bird.y < 0 || g.bird.y > 450) { playSoundFB(120, 0.5, 'sawtooth', 0.2); setGameOver(true); return }
      g.pipes.forEach(p => {
        if (birdX + 15 > p.x && birdX - 15 < p.x + g.pipeWidth) {
          if (g.bird.y - 15 < p.topH || g.bird.y + 15 > p.topH + g.pipeGap) { playSoundFB(120, 0.5, 'sawtooth', 0.2); setGameOver(true) }
        }
        if (!p.scored && p.x + g.pipeWidth < birdX) {
          p.scored = true
          playSoundFB(660, 0.12, 'sine', 0.15)
          setTimeout(() => playSoundFB(880, 0.1, 'sine', 0.12), 70)
          setScore(s => s + 1)
        }
      })

      const grad = ctx.createLinearGradient(0, 0, 0, 450)
      grad.addColorStop(0, '#0a0a2e'); grad.addColorStop(1, '#1a1a3e')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 400, 450)

      for (let i = 0; i < 30; i++) {
        const sx = (i * 47 + g.frame * 0.2) % 400, sy = (i * 31) % 300
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(g.frame * 0.05 + i) * 0.3})`
        ctx.fillRect(sx, sy, 2, 2)
      }

      g.pipes.forEach(p => {
        const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + g.pipeWidth, 0)
        pipeGrad.addColorStop(0, '#4ecdc4'); pipeGrad.addColorStop(1, '#2ecc71')
        ctx.fillStyle = pipeGrad; ctx.shadowColor = '#2ecc71'; ctx.shadowBlur = 10
        ctx.beginPath(); ctx.roundRect(p.x, 0, g.pipeWidth, p.topH, [0, 0, 8, 8]); ctx.fill()
        ctx.beginPath(); ctx.roundRect(p.x, p.topH + g.pipeGap, g.pipeWidth, 450 - p.topH - g.pipeGap, [8, 8, 0, 0]); ctx.fill()
        ctx.fillStyle = '#27ae60'
        ctx.beginPath(); ctx.roundRect(p.x - 5, p.topH - 15, g.pipeWidth + 10, 15, [8, 0, 0, 0]); ctx.fill()
        ctx.beginPath(); ctx.roundRect(p.x - 5, p.topH + g.pipeGap, g.pipeWidth + 10, 15, [0, 0, 8, 8]); ctx.fill()
      })

      ctx.shadowBlur = 0
      const bx = 80, by = g.bird.y
      ctx.save(); ctx.translate(bx, by)
      ctx.rotate(Math.min(Math.max(g.bird.velocity * 0.03, -0.5), 0.5))
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 20; ctx.fillStyle = '#ffd700'
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0; ctx.fillStyle = '#ff9f43'
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(6, -4, 6, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(8, -4, 3, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(22, 5); ctx.lineTo(12, 8); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.ellipse(-5, 5, 10, 6, -0.3, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      ctx.fillStyle = '#2d3436'; ctx.fillRect(0, 450, 400, 10)
      if (gameOver || !started) return
      requestAnimationFrame(loop)
    }

    const id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [gameOver, started])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      e.preventDefault()

      if (!started || gameOver) {
        resetGame()
        return
      }

      flap()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [started, gameOver])

  return (
    <div className="flappy-game">
      <div className="game-header">
        <span>Score: {score}</span>
        {!started ? <button onClick={resetGame}>Start Game</button> : gameOver ? <button onClick={resetGame}>Play Again</button> : null}
      </div>
      <canvas ref={canvasRef} width={400} height={450} />
      {!gameOver && started && <div className="touch-controls"><button onMouseDown={flap}>Flap</button></div>}
    </div>
  )
}

export default FlappyBird