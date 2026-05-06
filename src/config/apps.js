import ClockWidget from '../components/ClockWidget/Clock'
import CalculatorApp from '../components/CalculatorApp/Calculator'
import SnakeGame from '../components/SnakeGame/Snake'
import FlappyBirdGame from '../components/FlappyBird/FlappyBird'
import Backgrounds from '../components/BackgroundSettings/Backgrounds'
import GeometricDash from '../components/GeometricDash/GD'
import BuilderCalculator from '../components/BuilderCalculator/Builder'
import SkidmarkGame from '../components/SkidmarkGame/Skidmark'
import TetrisGame from '../components/TetrisGame/Tetris'

export const APPS = [
  { id: 'clock', name: 'Clock', icon: '🕐', component: ClockWidget, window: { w: 540, h: 500, minW: 420, minH: 360 } },
  { id: 'calculator', name: 'Calculator', icon: '🧮', component: CalculatorApp, window: { w: 420, h: 560, minW: 340, minH: 460 } },
  { id: 'snake', name: 'Snake Game', icon: '🐍', component: SnakeGame, window: { w: 560, h: 620, minW: 500, minH: 520 } },
  { id: 'flappybird', name: 'Flappy Bird', icon: '🐦', component: FlappyBirdGame, window: { w: 560, h: 620, minW: 500, minH: 520 } },
  { id: 'geometricdash', name: 'Geometric Dash', icon: '🟩', component: GeometricDash, window: { w: 920, h: 640, minW: 700, minH: 500 } },
  { id: 'backgrounds', name: 'Backgrounds', icon: '🎨', component: Backgrounds, window: { w: 700, h: 560, minW: 520, minH: 420 } },
  { id: 'buildercalc', name: 'Builder Calculator', icon: '🔨', component: BuilderCalculator, window: { w: 1240, h: 820, minW: 960, minH: 620 } },
  { id: 'skidmark', name: 'Skidmark', icon: '🏎️', component: SkidmarkGame, window: { w: 1040, h: 860, minW: 920, minH: 760 } },
  { id: 'tetris', name: 'Tetris', icon: '🟦', component: TetrisGame, window: { w: 520, h: 640, minW: 400, minH: 520 } }
]
