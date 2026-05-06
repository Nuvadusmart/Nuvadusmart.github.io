import React, { useRef } from 'react'
import { useTetrisEngine } from './useTetrisEngine'
import { COLS, ROWS, CELL_SIZE, COLORS } from './constants'

const Tetris = () => {
  const canvasRef = useRef(null)
  const engine = useTetrisEngine()

  const drawCell = (ctx, x, y, color, alpha = 1) => {
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    ctx.shadowColor = color
    ctx.shadowBlur = 6
    ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  }

  const drawBoard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE)

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, ROWS * CELL_SIZE); ctx.stroke()
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(COLS * CELL_SIZE, i * CELL_SIZE); ctx.stroke()
    }

    // Board cells
    engine.board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) drawCell(ctx, x, y, COLORS[cell])
      })
    })

    // Ghost piece
    if (engine.current && !engine.gameOver) {
      const shape = engine.current.shape
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            drawCell(ctx, engine.current.x + c, engine.ghostY + r, COLORS[engine.current.type], 0.2)
          }
        }
      }
    }

    // Current piece
    if (engine.current && !engine.gameOver) {
      const shape = engine.current.shape
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) drawCell(ctx, engine.current.x + c, engine.current.y + r, COLORS[engine.current.type])
        }
      }
    }

    // Next piece preview
    if (engine.next) {
      const shape = engine.next.shape
      const offsetX = COLS + 2
      const offsetY = 1
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) drawCell(ctx, offsetX + c, offsetY + r, COLORS[engine.next.type])
        }
      }
    }
  }

  React.useEffect(() => { drawBoard() }, [engine.board, engine.current, engine.next, engine.ghostY])

  const handleTouch = (action) => { if (!engine.gameOver && engine.started) action() }

  return (
    <div className="tetris-game">
      <div className="game-header">
        <span>Score: {engine.score} | Lvl: {engine.level} | Lines: {engine.lines}</span>
        {!engine.started ? (
          <button onClick={engine.startGame}>Start Game</button>
        ) : engine.gameOver ? (
          <button onClick={engine.startGame}>Play Again</button>
        ) : null}
      </div>
      <canvas ref={canvasRef} width={(COLS + 4) * CELL_SIZE} height={ROWS * CELL_SIZE} />
      {engine.started && !engine.gameOver && (
        <div className="touch-controls">
          <button onMouseDown={() => handleTouch(engine.rotatePiece)}>↻</button>
          <div className="row">
            <button onMouseDown={() => handleTouch(engine.moveLeft)}>◀</button>
            <button onMouseDown={() => handleTouch(engine.hardDrop)}>⏬</button>
            <button onMouseDown={() => handleTouch(engine.moveRight)}>▶</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tetris