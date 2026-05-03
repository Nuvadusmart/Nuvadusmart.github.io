import React, { useEffect, useRef } from 'react'
import { H, W } from './constants'
import { useGDGame } from './useGDGame'

const GeometricDash = () => {
  const canvasRef = useRef(null)
  const { score, bestScore, started, gameOver, resetGame, jump } = useGDGame(canvasRef)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      e.preventDefault()
      if (!started || gameOver) return resetGame()
      jump()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameOver, jump, resetGame, started])

  const handleClick = () => {
    if (!started || gameOver) return resetGame()
    jump()
  }

  return (
    <div className="snake-game">
      <div className="game-header">
        <span>Score: {score} | Best: {bestScore}</span>
        {!started ? <button onClick={resetGame}>Start Game</button> : gameOver ? <button onClick={resetGame}>Restart</button> : null}
      </div>
      <canvas ref={canvasRef} width={W} height={H} style={{ cursor: 'pointer' }} onMouseDown={handleClick} onTouchStart={(e) => { e.preventDefault(); handleClick() }} />
    </div>
  )
}

export default GeometricDash
