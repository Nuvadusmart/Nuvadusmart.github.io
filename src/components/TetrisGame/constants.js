export const COLS = 10
export const ROWS = 20
export const CELL_SIZE = 28

const BASE_SPEED = 800
export const getSpeed = (level) => Math.max(100, BASE_SPEED - (level - 1) * 75)

export const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
}

export const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[1, 1, 1], [0, 1, 0]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
}

export const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

export const LINE_POINTS = { 1: 100, 2: 300, 3: 500, 4: 800 }