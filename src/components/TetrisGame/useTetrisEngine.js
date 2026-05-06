import { useState, useEffect, useRef, useCallback } from 'react'
import { COLS, ROWS, SHAPES, PIECE_TYPES, COLORS, getSpeed, LINE_POINTS } from './constants'

const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null))

const randomPiece = () => {
  const idx = Math.floor(Math.random() * PIECE_TYPES.length)
  const type = PIECE_TYPES[idx]
  return {
    type,
    shape: SHAPES[type],
    x: Math.floor(COLS / 2) - Math.ceil(SHAPES[type][0].length / 2),
    y: 0
  }
}

const rotate = (shape) => {
  const rows = shape.length
  const cols = shape[0].length
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c]
    }
  }
  return rotated
}

const isValid = (board, shape, px, py) => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const nx = px + c
        const ny = py + r
        if (nx < 0 || nx >= COLS || ny >= ROWS) return false
        if (ny >= 0 && board[ny][nx] !== null) return false
      }
    }
  }
  return true
}

const getGhostY = (board, shape, px) => {
  let gy = 0
  while (isValid(board, shape, px, gy + 1)) gy++
  return gy
}

export const useTetrisEngine = () => {
  const [board, setBoard] = useState(createBoard())
  const [current, setCurrent] = useState(null)
  const [next, setNext] = useState(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)

  const boardRef = useRef(board)
  const currentRef = useRef(current)
  const scoreRef = useRef(score)
  const levelRef = useRef(level)
  const linesRef = useRef(lines)
  const gameOverRef = useRef(gameOver)
  const startedRef = useRef(started)

  useEffect(() => { boardRef.current = board }, [board])
  useEffect(() => { currentRef.current = current }, [current])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { levelRef.current = level }, [level])
  useEffect(() => { linesRef.current = lines }, [lines])
  useEffect(() => { gameOverRef.current = gameOver }, [gameOver])
  useEffect(() => { startedRef.current = started }, [started])

  const lockPiece = useCallback(() => {
    const piece = currentRef.current
    if (!piece) return
    const newBoard = boardRef.current.map(r => [...r])
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const ny = piece.y + r
          const nx = piece.x + c
          if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
            newBoard[ny][nx] = piece.type
          }
        }
      }
    }

    let clearedLines = 0
    const filtered = newBoard.filter(row => row.includes(null))
    clearedLines = ROWS - filtered.length

    if (clearedLines > 0) {
      const pts = LINE_POINTS[clearedLines] || 0
      setScore(s => s + pts * levelRef.current)
      setLines(l => l + clearedLines)
      setLevel(lvl => Math.floor((linesRef.current + clearedLines) / 10) + 1)
    }

    const newBoard2 = [...filtered, ...Array.from({ length: clearedLines }, () => Array(COLS).fill(null))]
    setBoard(newBoard2)

    if (!nextRef.current) {
      const np = randomPiece()
      setNext(np)
      setCurrent({ ...np, y: 0 })
      return
    }

    const np = nextRef.current
    const nn = randomPiece()
    setNext(nn)
    setCurrent({ ...np, y: 0 })

    if (!isValid(newBoard2, np.shape, np.x, np.y)) {
      setGameOver(true)
      setStarted(false)
    }
  }, [])

  const nextRef = useRef(next)
  useEffect(() => { nextRef.current = next }, [next])

  const moveDown = useCallback(() => {
    if (gameOverRef.current || !startedRef.current) return
    const piece = currentRef.current
    if (!piece) { lockPiece(); return }
    if (isValid(boardRef.current, piece.shape, piece.x, piece.y + 1)) {
      setCurrent(p => ({ ...p, y: p.y + 1 }))
    } else {
      lockPiece()
    }
  }, [lockPiece])

  const moveLeft = useCallback(() => {
    if (gameOverRef.current || !startedRef.current) return
    const piece = currentRef.current
    if (!piece) return
    if (isValid(boardRef.current, piece.shape, piece.x - 1, piece.y)) {
      setCurrent(p => ({ ...p, x: p.x - 1 }))
    }
  }, [])

  const moveRight = useCallback(() => {
    if (gameOverRef.current || !startedRef.current) return
    const piece = currentRef.current
    if (!piece) return
    if (isValid(boardRef.current, piece.shape, piece.x + 1, piece.y)) {
      setCurrent(p => ({ ...p, x: p.x + 1 }))
    }
  }, [])

  const rotatePiece = useCallback(() => {
    if (gameOverRef.current || !startedRef.current) return
    const piece = currentRef.current
    if (!piece) return
    const rotated = rotate(piece.shape)
    for (const offset of [0, -1, 1, -2, 2]) {
      if (isValid(boardRef.current, rotated, piece.x + offset, piece.y)) {
        setCurrent(p => ({ ...p, shape: rotated, x: p.x + offset }))
        return
      }
    }
  }, [])

  const hardDrop = useCallback(() => {
    if (gameOverRef.current || !startedRef.current) return
    const piece = currentRef.current
    if (!piece) return
    const ghostY = getGhostY(boardRef.current, piece.shape, piece.x)
    setScore(s => s + (ghostY - piece.y) * 2)
    setCurrent(p => ({ ...p, y: ghostY }))
    setTimeout(() => lockPiece(), 10)
  }, [lockPiece])

  const startGame = useCallback(() => {
    setBoard(createBoard())
    const first = randomPiece()
    const second = randomPiece()
    setCurrent({ ...first, y: 0 })
    setNext(second)
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setStarted(true)
  }, [])

  useEffect(() => {
    if (!started || gameOver) return
    const speed = getSpeed(level)
    const id = setInterval(moveDown, speed)
    return () => clearInterval(id)
  }, [started, gameOver, level, moveDown])

  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowLeft') moveLeft()
    else if (e.key === 'ArrowRight') moveRight()
    else if (e.key === 'ArrowUp') rotatePiece()
    else if (e.key === ' ') { e.preventDefault(); hardDrop() }
  }, [moveLeft, moveRight, rotatePiece, hardDrop])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const ghostY = current ? getGhostY(board, current.shape, current.x) : 0

  return { board, current, next, score, level, lines, gameOver, started, setStarted, moveLeft, moveRight, rotatePiece, hardDrop, startGame, ghostY }
}