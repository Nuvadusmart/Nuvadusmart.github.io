import React, { useRef, useState } from 'react'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants'
import { useSkidmarkEngine } from './useSkidmarkEngine'

const Skidmark = () => {
  const canvasRef = useRef(null)
  const [started, setStarted] = useState(false)
  const { hud, gameOver, restart } = useSkidmarkEngine(canvasRef, started, setStarted)

  return (
    <div className="skidmark-game">
      <div className="sm-header sm-header-pro">
        <span>Score {hud.score}</span>
        <span>Time {hud.time}s</span>
        <span>Laps {hud.laps}/3</span>
        <span>Combo {hud.combo}</span>
        <span>Boost {hud.boost}%</span>
        {!started && !gameOver ? (
          <button onClick={() => setStarted(true)}>Start Race</button>
        ) : gameOver ? (
          <button onClick={restart}>Restart</button>
        ) : null}
      </div>

      <div className="sm-stage">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

        {!started && !gameOver ? (
          <div className="sm-start-screen">
            <p className="sm-title">SKIDMARK PRO</p>
            <p>WASD or Arrow Keys to steer</p>
            <p>Hold Shift to boost and chain drifts for points.</p>
          </div>
        ) : null}

        {gameOver ? (
          <div className="sm-start-screen">
            <p className="sm-title">RACE COMPLETE</p>
            <p>Final Score: {hud.score}</p>
            <p>Laps: {hud.laps}</p>
          </div>
        ) : null}
      </div>

      <div className="sm-controls">Tip: smooth steering keeps speed high. hard steering builds combo.</div>
    </div>
  )
}

export default Skidmark
