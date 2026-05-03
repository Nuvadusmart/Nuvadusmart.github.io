# BrowserOS — Deep-Dive Architecture Documentation

Each section below is a "vertical slice": a complete, self-contained explanation of one file or subsystem, including its responsibilities, props, state, side effects, and interactions with other slices.

---

## 0. Entry Point & Bootstrap

### `index.html`

```yaml
file: index.html
purpose: >
  HTML shell that loads the Vite-bundled JavaScript bundle.
  Contains a single <div id="root"> mount point.
structure:
  - <!DOCTYPE html> declaration
  - <head> with meta tags and title "BrowserOS"
  - <body> with <div id="root"></div>
  - <script type="module" src="/src/main.jsx"> (Vite HMR entry)
dependencies:
  imports: none (pure HTML container)
lifecycle:
  - Browser loads HTML
  - Vite dev server injects module script pointing to main.jsx
```

### `src/main.jsx`

```yaml
file: src/main.jsx
purpose: >
  React DOM entry point. Creates the root ReactDOM container and mounts <App>.
imports:
  - React from 'react'
  - ReactDOM from 'react-dom/client'
  - App from './App'
render_pipeline:
  - ReactDOM.createRoot(document.getElementById('root')) creates the root
  - .render(<React.StrictMode><App /></React.StrictMode>) mounts the app tree
state_management: none (pure mount point)
lifecycle:
  - Executes once on page load
  - StrictMode wraps <App> in development for double-render effect
```

### `src/hooks/useClock.js`

```yaml
file: src/hooks/useClock.js
purpose: >
  Custom React hook that provides the current time formatted as a locale string.
returns: >
  A string like "5/2/2026, 12:30:45 AM" updated every second.
implementation:
  - Uses useState to hold the formatted time string
  - useEffect sets up a setInterval(fn, 1000) that calls new Date().toLocaleString()
  - Cleanup function clears the interval on unmount
consumed_by: Taskbar.jsx (for the system clock display)
```

---

## 1. Root Application

### `src/App.jsx`

```yaml
file: src/App.jsx
role: >
  Top-level orchestrator. Manages all OS-level state and provides callbacks to child components.
state_slices:
  windows: "Array<{ id, appId, title, icon, minimized, initialX, initialY, initialW, initialH }>"
  activeWindow: "null | number — ID of focused window"
  bgConfig: "{ type, colors[], animated } — persisted to localStorage"
key_functions:
  openApp(appId): >
    - Searches existing windows for matching appId (reverse order)
    - If found and minimized: restores it and sets active
    - If found and visible: brings to front (already active)
    - If not found: creates new window with staggered position offset
      based on existing instance count
  closeWindow(winId): >
    - Filters out the window from array
    - Clears activeWindow if it was the closed one
  minimizeWindow(winId): >
    - Sets minimized flag to true
    - Clears activeWindow
  focusWindow(winId): >
    - Un-minimizes the target window
    - Sets as activeWindow (controls z-index)
  toggleWindowFromTaskbar(winId): >
    - If active and not minimized: minimizes it
    - Otherwise: un-minimizes and focuses
background_system:
  getBgStyle(cfg): >
    - Returns inline style object for the .os container
    - If animated: uses 4-color gradient with CSS animation
    - If static: uses 2-color gradient from cfg.colors
  persistence: >
    - Reads from localStorage on mount ('browseros-bg')
    - Writes to localStorage whenever bgConfig changes
component_tree:
  renders: <Desktop /> + dynamic <Window> for each open app + <Taskbar />
apps_registered:
  - clock → ClockWidget (🕐)
  - calculator → CalculatorApp (🧮)
  - snake → SnakeGame (🐍)
  - flappybird → FlappyBirdGame (🐦)
  - geometricdash → GeometricDash (🟩)
  - backgrounds → Backgrounds (🎨)
  - buildercalc → BuilderCalculator (🔨)
  - skidmark → SkidmarkGame (🏎️)
```

---

## 2. Window System

### `src/components/Window/Window.jsx`

```yaml
file: src/components/Window/Window.jsx
role: >
  Wraps each open application instance with draggable, resizable, maximizable window chrome.
props:
  win: "Window metadata { id, appId, title, icon, minimized, initialX, initialY }"
  component: "The React component to render inside the window"
  activeWindow: "Current active window ID (for z-index)"
  focusWindow, closeWindow, minimizeWindow: "Callbacks from App.jsx"
  bgConfig, setBgConfig: "Passed through for Backgrounds app special handling"
internal_state:
  pos: "{ x, y } — current window position (updated during drag)"
  size: "{ w, h } — current window dimensions (updated during resize)"
  maximized: "boolean — whether the window is fullscreen"
  dragging: "null | { startX, startY, origX, origY } — in-progress drag state"
  resizing: "null | { direction, startX, startY, origW, origH } — in-progress resize state"
mouse_handlers:
  handleMouseDown(e): >
    - Triggered on window header mousedown (excluding .window-controls)
    - Sets dragging state with offset from click position to original pos
    - Focuses the window
  handleResizeDrag(dir): >
    - Returns event handler that sets resizing state for direction n/s/e/w
    - Prevents default and stops propagation (prevents triggering window drag)
mouse_events:
  - window.addEventListener('mousemove', handleMouseMove) on mount
  - window.addEventListener('mouseup', handleMouseUp) on mount
  - Both removed on unmount
  - Tracks across the entire window, not just the element (better UX)
rendering_logic:
  if win.minimized: return null (hidden from DOM)
  else renders:
    - <div.window> with dynamic transform/width/height/zIndex
    - .window-header with icon, title, and control buttons
    - .window-content rendering the app component
    - Four .resize-handle elements for edge resizing (hidden when maximized)
z_index_values:
  active: 30
  inactive: 15
maximized_behavior:
  width: '100vw'
  height: 'calc(100vh - 48px)'
  transform: 'none' (no translate)
  resize handles hidden
app_component_rendering: >
  - If win.appId === 'backgrounds': passes bgConfig and setBgConfig as props
  - Otherwise: renders <AppComponent /> with no props
```

---

## 3. Desktop & Icons

### `src/components/Desktop/Desktop.jsx`

```yaml
file: src/components/Desktop/Desktop.jsx
role: >
  Container that renders the desktop icon grid. Delegates all logic to child Icon components.
props:
  windows: "Array of open window objects from App.jsx"
  openApp: "Callback to open an app by appId"
internal_apps_list: >
  const APPS = [
    { id: 'clock', name: 'Clock', icon: '🕐' },
    { id: 'calculator', name: 'Calculator', icon: '🧮' },
    { id: 'snake', name: 'Snake Game', icon: '🐍' },
    { id: 'flappybird', name: 'Flappy Bird', icon: '🐦' },
    { id: 'geometricdash', name: 'Geometric Dash', icon: '🟩' },
    { id: 'backgrounds', name: 'Backgrounds', icon: '🎨' }
  ]
rendering: >
  - <div.desktop> (flex container)
  - <div.desktop-icons> containing mapped Icon components
sync_requirement: >
  This APPS array MUST match the one in App.jsx. When adding a new app,
  both arrays must be updated simultaneously.
```

### `src/components/Desktop/Icon.jsx`

```yaml
file: src/components/Desktop/Icon.jsx
role: >
  Single desktop icon element. Handles click-to-open and visual state feedback.
props:
  app: "{ id, name, icon }" — from Desktop.jsx APPS array
  windows: "Array of open window objects"
  onOpenApp: "Callback to App.jsx openApp"
state_derivation:
  isActive: >
    windows.some(w => w.appId === app.id && !w.minimized)
  isMinimized: >
    windows.some(w => w.appId === app.id && w.minimized)
rendering:
  - <div.desktop-icon> with onClick → onOpenApp(app.id)
  - <span.icon-emoji> showing the emoji icon
  - <span.icon-label> showing the name with CSS classes for active/minimized state
behavior: >
  Clicking an icon always calls openApp, which either creates a new window
  or restores an existing one. The visual state (active/minimized) is purely
  derived from the windows array — no local state.
```

---

## 4. Taskbar System

### `src/components/Taskbar/Taskbar.jsx`

```yaml
file: src/components/Taskbar/Taskbar.jsx
role: >
  Bottom bar containing start menu, open window items, and system clock.
props:
  windows: "Array of open window objects"
  apps: "Array of app definitions from App.jsx"
  activeWindow: "Current active window ID"
  onToggleWindow: "Callback to minimize/restore a specific window"
  onOpenApp: "Callback to open an app by appId"
internal_state:
  isStartOpen: "boolean — whether the start menu dropdown is visible"
  startMenuRef: "React ref for click-outside detection"
hooks_used:
  useClock: >
    - Imported from '../../hooks/useClock'
    - Returns formatted time string displayed in taskbar clock
start_menu_logic:
  handleStartClick(): toggles isStartOpen boolean
  handleStartAppLaunch(appId): >
    - Calls onOpenApp(appId) to open the app
    - Closes start menu (setIsStartOpen(false))
  outside_click_detection: >
    - useEffect watches isStartOpen
    - Adds document.mousedown listener when menu opens
    - Removes listener when menu closes or component unmounts
    - handleOutsideClick: checks if click target is outside startMenuRef
  escape_key_detection: >
    - window.addEventListener('keydown', handleEscape)
    - Closes menu on Escape press
rendering:
  <div.taskbar>
    <div.taskbar-left>
      - Start button (🖥️) with active class when menu open
      - Start menu dropdown (conditional render)
        * Title "Apps" header
        * Mapped app buttons with icon + name
      - Taskbar apps container showing open windows
        * Each window gets a .taskbar-item button
        * Active state highlighted via CSS
    <div.taskbar-right>
      - Clock span displaying useClock() result
```

---

## 5. Applications

### `src/components/ClockWidget/Clock.jsx`

```yaml
file: src/components/ClockWidget/Clock.jsx
role: >
  Analog clock widget app with digital time/date display below.
internal_state:
  time: "Date object updated every second via setInterval"
lifecycle:
  - useEffect sets up setInterval(() => setTime(new Date()), 1000)
  - Cleanup on unmount
computed_values:
  hours: "time.getHours() % 12 (12-hour format)"
  minutes: "time.getMinutes()"
  seconds: "time.getSeconds()"
  hourAngle: "(hours * 30) + (minutes * 0.5) — accounts for minute progression"
  minuteAngle: "minutes * 6 (6° per minute)"
  secondAngle: "seconds * 6 (6° per second)"
rendering:
  <div.clock-widget>
    <div.analog-clock>
      <div.clock-face>
        - 12 clock numbers positioned with trigonometric calculations
          angle = (num * 30 - 90) * (Math.PI / 180)
          x = 100 + 75 * Math.cos(angle)
          y = 100 + 75 * Math.sin(angle)
        - Hour hand: white, 4px × 55px, transform-origin bottom center
        - Minute hand: white (80% opacity), 3px × 75px
        - Second hand: red (#ff6b6b), 2px × 80px
        - Center dot: red circle at 50%/50%
    <div.digital-time> "HH:MM:SS" formatted with toLocaleDateString([], { hour, minute, second })</div>
    <div.digital-date> "Weekday, Month Day, Year" formatted similarly</div>
styling_notes: >
  - Clock face uses radial gradient background
  - Hands use transform-origin: bottom center for proper rotation
  - Numbers positioned absolutely around the circular face
sound: >
  - Direction change click sound (440Hz sine wave, 30ms) triggered on keydown in Snake game
    (Note: this sound is actually from Snake.jsx, not Clock itself)
```

### `src/components/CalculatorApp/Calculator.jsx`

```yaml
file: src/components/CalculatorApp/Calculator.jsx
role: >
  Functional calculator supporting basic arithmetic operations.
internal_state:
  display: "string — current number shown in the display (starts '0')"
  prevValue: "null | number — first operand stored for chaining"
  operator: "null | string — current active operator (+, -, *, /)"
  waitingForNewInput: "boolean — whether next digit replaces or appends to display"
handlers:
  handleNumber(num): >
    - If waitingForNewInput: replaces display with num (resets)
    - Else: appends num to display string (handles leading zero)
  handleOperator(op): >
    - Parses current display as float
    - If prevValue exists and operator set: calculates intermediate result
      then stores it back as prevValue
    - Otherwise: stores current value as prevValue
    - Sets active operator and waitingForNewInput = true
  handleEquals(): >
    - Calculates prevValue op currentDisplay
    - Shows result in display, resets prevValue/operator/waitingForNewInput
  handleClear(): >
    - Resets all state to initial values (display='0', prev=null, op=null)
  handlePercent(): >
    - Divides current display value by 100
  handleDecimal(): >
    - If waitingForNewInput: sets display to '0.' and resets flag
    - Else: appends '.' if not already present (prevents double decimal)
calculation_logic:
  calculate(a, b, op): >
    '+' → a + b
    '-' → a - b
    '*' → a * b
    '/' → b !== 0 ? a / b : 'Error'
button_grid:
  row_1: ['C', '%', '±', '/']   (note: ± is present in grid but not wired)
  row_2: ['7', '8', '9', '*']
  row_3: ['4', '5', '6', '-']
  row_4: ['1', '2', '3', '+']
  row_5: ['0' (span 2 cols), '.' (dot button), '=' (equals button)]
rendering:
  <div.calculator>
    <div.calc-display> — shows current display value
    <div.calc-buttons> — CSS grid layout, 4 columns
      - Buttons with special classes: calc-zero (span 2 cols), calc-equals (purple gradient)
styling_notes: >
  - Calculator buttons scale up slightly on hover (transform: scale(1.03))
  - Display uses right-aligned text with flexbox
```

### `src/components/BuilderCalculator/Builder.jsx`

```yaml
file: src/components/BuilderCalculator/Builder.jsx
role: >
  Timber frame layout calculator for carpenters and builders. Computes optimal board allocation.
internal_state:
  areaLength, lipSize, joistSpacing, boardLength, plankWidth: "number inputs from user"
  results: "{ boards: [{ cutPositions[], waste }], totalWaste, numBoards } — computed layout data"
calculation_logic:
  calculateLayout(): >
    - Computes number of cuts per board based on joist spacing and lip size
    - Allocates cuts to boards minimizing waste
    - Calculates remaining material per board (waste)
    - Returns structured results for rendering
rendering:
  <div.builder-calc>
    - Input fields for areaLength, lipSize, joistSpacing, boardLength, plankWidth
    - "Calculate" button triggering calculateLayout()
    - Visual bar showing cut positions and remaining material per board
      * .bc-board-header with title and waste display
      * .bc-board-bar containing segments (green for cuts, yellow for waste)
    - Summary table with columns: Board #, Cuts, Waste percentage
    - Layout visualization showing joist lines and seam positions
data_flow: >
  - User inputs → Calculate button → calculateLayout() → results state
  - Results rendered as visual bars + tables + layout diagrams
```

### `src/components/SnakeGame/Snake.jsx`

```yaml
file: src/components/SnakeGame/Snake.jsx
role: >
  Classic snake game rendered on HTML5 Canvas with Web Audio API sound effects.
constants:
  GRID: 20 (grid dimensions)
  CELL: 20 (cell size in pixels)
audio_system:
  audioCtx: "Module-level singleton, lazily initialized on first user interaction"
  getAudioCtx(): >
    - Creates new AudioContext if not exists
    - Returns existing context on subsequent calls
  playSound(freq, duration, type='square', vol=0.15): >
    - Creates OscillatorNode and GainNode
    - Sets frequency, applies exponential decay to gain for smooth fade-out
    - Connects: oscillator → gain → destination
    - Starts and stops oscillator within duration
internal_state:
  canvasRef: "React ref to <canvas>"
  score: "number — current game score"
  gameOver: "boolean — whether the game has ended"
  started: "boolean — whether the game is running"
refs:
  snakeRef: "[{ x, y }, ...] — snake body segments (head at index 0)"
  dirRef: "{ x, y } — current movement direction (starts {1, 0} = right)"
  foodRef: "{ x, y } — food position"
  scoreRef: "number — mirrored score for closure-safe access in game loop"
  gameLoopRef: "number — interval ID for game tick"
game_mechanics:
  spawnFood(): >
    - Returns random { x, y } within grid bounds
  resetGame(): >
    - Resets snake to center [{x:10, y:10}]
    - Direction to right, food to random position
    - Clears score, game over, sets started = true
  update loop (setInterval 100ms): >
    1. Calculate new head position from current head + direction
    2. Check wall collision (x < 0 || x >= GRID || y < 0 || y >= GRID) → game over
    3. Check self collision (head overlaps any body segment) → game over
    4. If head matches food: increment score, spawn new food, play eat sound
    5. Else: remove tail segment (snake moves without growing)
sound_events:
  direction_change: >
    - 440Hz sine wave, 30ms duration, volume 0.05
    - Triggered on every arrow key press
  food_eaten: >
    - 880Hz square wave, 150ms, volume 0.12
    - Followed by 110Hz burst at 80ms delay, 100ms duration
    - Creates ascending tone effect
  game_over: >
    - 150Hz sawtooth wave, 400ms, volume 0.2
    - Low rumbling crash sound
rendering_loop (draw):
  - Background: dark (#1a1a2e)
  - Grid lines: subtle white at 3% opacity
  - Snake body: gradient from green (100%) to transparent (50%), rounded rects, glow on head
    alpha = 1 - (i / snake.length) * 0.5 for each segment i
  - Food: red circle with 15px shadow blur glow
input_handlers:
  keyboard: >
    - ArrowUp: sets direction {0, -1} unless currently going down
    - ArrowDown: sets direction {0, 1} unless currently going up
    - ArrowLeft: sets direction {-1, 0} unless currently going right
    - ArrowRight: sets direction {1, 0} unless currently going left
    - All four directions blocked from reversing into themselves
  touch controls: >
    - Four directional buttons rendered below canvas
    - handleTouch(dx, dy) with same blocking logic as keyboard
rendering_structure:
  <div.snake-game>
    <div.game-header>
      - Score display
      - Start Game / Play Again button (conditional on started/gameOver state)
    <canvas ref={canvasRef} width={400} height={400}>
    <div.touch-controls> (only when !gameOver && started)
      - ▲ button
      - ◀ ▼ ▶ row of three buttons
```

### `src/components/FlappyBird/FlappyBird.jsx`

```yaml
file: src/components/FlappyBird/FlappyBird.jsx
role: >
  Flappy Bird clone with canvas rendering, gravity physics, and Web Audio API sound.
constants: (none explicitly defined at top level)
audio_system:
  audioCtx: "Module-level singleton"
  getAudioCtxFB(): >
    - Creates new AudioContext if not exists
    - Returns existing context
  playSoundFB(freq, duration, type='square', vol=0.15): >
    - Same pattern as Snake's playSound but with separate namespace
internal_state:
  canvasRef: "React ref to <canvas>"
  score: "number — pipes passed through"
  gameOver: "boolean"
  started: "boolean"
game_ref:
  bird: "{ y, velocity }" — starts at {y:250, velocity:0}
  pipes: "[]" — array of { x, topH, scored }
  frame: "number — game frame counter"
  gravity: 0.4
  flapPower: -7 (negative = upward impulse)
  pipeGap: 130px (gap between top and bottom pipes)
  pipeWidth: 60px
  pipeSpeed: 3 (pixels per frame, increases over time)
game_mechanics:
  resetGame(): >
    - Resets all game ref values to initial state
    - Clears score, sets gameOver=false, started=true
  flap(): >
    - Returns early if gameOver or !started
    - Plays 500Hz sine sound (100ms)
    - Sets bird.velocity = flapPower (-7, upward impulse)
update loop (requestAnimationFrame):
  frame increment: g.frame++
  physics: >
    g.bird.velocity += g.gravity (gravity pulls down)
    g.bird.y += g.bird.velocity (position update)
  pipe spawning: every 90 frames → push new pipe at x=400 with random topH
  pipe movement: each pipe.x -= g.pipeSpeed
  pipe cleanup: filter pipes where x > -pipeWidth
  collision detection: >
    - Screen bounds: bird.y < 0 || bird.y > 450 → game over (plays crash sound)
    - Pipe collision: if birdX(80) overlaps pipe horizontally AND
      bird top/bottom doesn't fit in gap → game over (plays crash sound)
    - Score increment: pipe.x + pipeWidth < birdX && !pipe.scored → scored=true, score++
  scoring sounds: >
    - 660Hz sine wave, 120ms, volume 0.15
    - Followed by 880Hz at 70ms delay, 100ms duration
rendering (per frame):
  background: linear gradient from #0a0a2e to #1a1a3e
  stars: 30 white dots with parallax movement and opacity oscillation via Math.sin
  pipes: >
    - Gradient fill from #4ecdc4 to #2ecc71 (green)
    - Rounded rectangles for pipe bodies
    - Darker green (#27ae60) caps on pipe edges
    - 10px shadow blur glow
  bird: >
    - Rotated based on velocity (clamped between -0.5 and 0.5 radians)
    - Golden circle body with #ffd700 color, 20px shadow glow
    - White eye circle at offset (6, -4)
    - Dark pupil at offset (8, -4)
    - Red beak triangle starting from bird center
    - Orange wing ellipse on side
  ground: dark gray (#2d3436) strip at bottom
input_handlers:
  keyboard: >
    - Space/Space key triggers flap() or resetGame()
    - Prevents default browser behavior
  no touch controls: >
    - Only a single "Flap" button rendered below canvas (not directional like Snake)
rendering_structure:
  <div.flappy-game>
    <div.game-header>
      - Score display
      - Start Game / Play Again button (conditional)
    <canvas ref={canvasRef} width={400} height={450}>
    <div.touch-controls> (only when !gameOver && started)
      - "Flap" button with onMouseDown={flap}
```

### `src/components/GeometricDash/GD.jsx`

```yaml
file: src/components/GeometricDash/GD.jsx
role: >
  Auto-scrolling platformer inspired by Geometric Dash, with rotating cube player and obstacle avoidance.
constants:
  W: 800 (canvas width)
  H: 450 (canvas height)
  GROUND: H - 60 = 390 (ground Y position)
  GRAVITY: 0.6 (downward acceleration per frame)
  JUMP_VEL: -12 (upward velocity on jump)
  BLOCK_SIZE: 30 (grid unit for obstacles and ground pattern)
  PLAYER_SIZE: 30 (cube dimensions)
audio_system:
  audioCtxGD: "Module-level singleton"
  getAudioCtxGD(): >
    - Creates new AudioContext if not exists
    - Returns existing context
  playSoundGD(freq, duration, type='square', vol=0.15): >
    - Same Web Audio API pattern as other games
internal_state:
  canvasRef: "React ref to <canvas>"
  score: "number — frames / 15 (distance-based scoring)"
  gameOver: "boolean"
  started: "boolean"
  bestScore: "number — loaded from localStorage key 'gd-best' on init"
game_ref:
  player: "{ x: 100, y: GROUND - PLAYER_SIZE, vy: 0 }"
  obstacles: "[]" — array of { x, y, w, h, type }
  particles: "[]" — array of { x, y, vx, vy, life, color }
  groundOffset: "number — scrolling offset for ground pattern"
  frame: "number — game frame counter"
  speed: "5 — horizontal scroll speed (increases over time)"
  gravity: GRAVITY
  jumpVel: JUMP_VEL
  running: "boolean — game is active"
  dead: "boolean — player has crashed"
game_mechanics:
  spawnObstacle(): >
    - Random type selection:
      * < 0.4: single spike (30×60)
      * < 0.7: double spike (two spikes spaced 30px apart)
      * >= 0.7: block (60×90)
    - All obstacles spawn at x = W + 50 (right edge, off-screen)
  createParticles(px, py): >
    - Creates 15 particles with random velocities (±8 in each axis)
    - Random HSL colors in warm range (hue 30-90, saturation 100%, lightness 50%)
    - Life starts at 1.0 and decays by 0.03 per frame
  jump(): >
    - Returns if dead
    - Checks if player is on ground (y >= GROUND - PLAYER_SIZE - 5)
    - Sets vy = jumpVel (-12, upward impulse)
    - Plays 600Hz sine sound (100ms)
update loop (requestAnimationFrame):
  physics: >
    g.frame++
    g.groundOffset = (g.groundOffset + g.speed) % BLOCK_SIZE (scrolling pattern)
    g.speed = 5 + g.frame * 0.002 (increasing difficulty)
  obstacle spawning: spawnTimer increments; triggers when > 90 - min(frame*0.01, 40)
    (spawns become more frequent over time, minimum interval ~50 frames)
  player physics: >
    p.vy += g.gravity
    p.y += p.vy
    if p.y >= GROUND - PLAYER_SIZE: snap to ground, vy = 0
  obstacle movement: each o.x -= g.speed
  obstacle cleanup: filter where x > -o.w - 50 (off-screen left)
  collision detection: >
    - Player hitbox: {x+4, y+4, PLAYER_SIZE-8, PLAYER_SIZE-8} (tighter than full cube)
    - Spike: triangle approximated as rect at {o.x+4, o.y+4, o.w-8, o.h-8}
    - Block: rect at {o.x+2, o.y+2, o.w-4, o.h-4}
    - On collision: set dead=true, createParticles(), play crash sound (150Hz sawtooth)
      check bestScore and update localStorage if score > bestScore
  scoring: every 15 frames → score = Math.floor(g.frame / 15)
  particle physics: pt.x += pt.vx, pt.y += pt.vy, pt.life -= 0.03
rendering (per frame):
  background: linear gradient #0a0a2e to #1a1a3e
  stars: 50 white dots with parallax and opacity oscillation
  ground: >
    - Gradient from #2d3436 to #1a1a2e
    - Grid pattern lines (white at 10% opacity) scrolling with groundOffset
    - Glowing blue (#667eea) line at ground edge with 10px shadow blur
  obstacles: >
    - Spikes: red (#ff6b6b) triangles with 8px glow
    - Blocks: gradient from #e74c3c to #c0392b, white stroke outline, 5px glow
  player (if !dead): >
    - Translated to cube center, rotated by frame * 0.08 radians
    - Outer glow: semi-transparent gold rectangle (6px larger than cube)
    - Main body: gold-to-orange gradient fill
    - White stroke inner border (4px inset)
    - Eye: white circle at (5, -3), dark pupil at (7, -3)
  particles: >
    - Rendered with alpha = pt.life
    - HSL colored 6×6 squares with glow
  death overlay: >
    - Semi-transparent black rectangle over entire canvas
    - "CRASHED!" text in red (#ff6b6b), bold 48px
    - Score and best score display in white, 24px
    - Restart instruction in light gray, 18px
input_handlers:
  keyboard: >
    - Space/Space key triggers jump() or resetGame()
    - Prevents default browser behavior
  mouse/touch: >
    - canvas onMouseDown={handleClick} calls jump() or resetGame()
    - canvas onTouchStart={...} with preventDefault for mobile support
rendering_structure:
  <div.snake-game> (reuses existing game container class)
    <div.game-header>
      - "Score: {score} | Best: {bestScore}" display
      - Start Game button (when !started) or Restart button (when gameOver)
    <canvas ref={canvasRef} width={800} height={450}>
      - cursor: pointer style
      - onMouseDown and onTouchStart event handlers
```

### `src/components/SkidmarkGame/Skidmark.jsx`

```yaml
file: src/components/SkidmarkGame/Skidmark.jsx
role: >
  Drift racing game rendered on HTML5 Canvas with skid mark rendering, tire smoke particles,
  and drift physics. Uses refs for game state to avoid stale closure issues in requestAnimationFrame loops.
constants:
  CANVAS_W: 600 (canvas width)
  CANVAS_H: 500 (canvas height)
  TRACK_CENTER_X: 300 (center of circular track)
  TRACK_CENTER_Y: 250
  TRACK_RADIUS: 280 (outer boundary radius)
  INNER_TRACK_RADIUS: 40 (inner boundary radius)
audio_system: >
  - No audio — silent game experience
internal_state:
  canvasRef: "React ref to <canvas>"
  score: "number — base score from previous runs"
  timeLeft: "number — countdown timer starting at 60 seconds"
  gameOver: "boolean — whether the 60s timer has expired"
  started: "boolean — whether the game is actively running"
refs:
  gameOverRef: "useRef(false) — mirrors gameOver state for closure-safe access in game loop"
  gameRef: "{ car, skidMarks, keys, frame, driftScore, particles }" mutable game state
game_ref_structure:
  car: "{ x, y, angle, speed }" — starts at {300, 250, -π/2, 0}
  skidMarks: "[]" — array of { points[], isSkid, frame }
  keys: "{}" — current key states (WASD + Arrow Keys)
  frame: "number — game loop frame counter"
  driftScore: "number — accumulated drift score this run"
  particles: "[]" — tire smoke particles with { x, y, vx, vy, size, alpha, r, g, b }
physics:
  accel: 0.25 (acceleration per frame)
  maxSpeed: 7 (maximum forward/reverse speed)
  friction: 0.98 (speed decay per frame)
  turnSpeed: 0.045 (radians per frame when turning)
  driftFactor: 0.92 (applied on boundary collision)
game_mechanics:
  resetGame(): >
    - Resets car to center, clears skid marks and particles
    - Sets gameOverRef.current = false, score=0, timeLeft=60
  movement: >
    - W/Up accelerates forward (maxSpeed cap)
    - S/Down accelerates backward (-maxSpeed * 0.4 cap)
    - A/Left and D/Right turn based on car.angle + turnSpeed
    - Circular track boundaries at radius 280 and 40 — collision bounces back
  drift_detection: >
    - isTurning = any arrow key for left/right
    - absSpeed > 3 threshold for skidding
    - When drifting: adds skid marks, spawns tire smoke particles, increments driftScore by 2 per frame
    - When not drifting: adds faint tire marks every 4 frames
  skid_mark_rendering: >
    - Skid marks: dark lines (rgba(30,30,30,0.7)) with 6px width and black shadow blur
    - Tire tread pattern overlay for active skids (every ~4 points)
    - Normal tire marks: fainter lines (rgba(50,50,50,0.4)) at 3px width
  particle_system: >
    - Drift particles spawn at car position with random velocity (±2 px/frame)
    - Alpha decays by 0.015 per frame, size shrinks by 0.98
    - Particles rendered as colored circles in warm gray tones
    - Limited to 200 skid marks max (slices array to last 150 on overflow)
timer: >
  - requestAnimationFrame loop decrements timeLeft every 60 frames (~1 second)
  - Separate useEffect with setInterval for reliable timer countdown
  - Both check gameOverRef.current before setting game over state
rendering (per frame):
  background: #2c3e50 dark asphalt color
  asphalt texture: random 2px dots at 5% opacity for surface detail
  track boundaries: dashed blue lines at outer/inner radii, center circle decoration
  skid marks drawn as continuous paths with tire tread patterns
  particles rendered with alpha blending
  car drawn as red rectangle with windshield, headlights (yellow glow), tail lights (red glow)
  HUD overlay on canvas: score and time in dark box top-left, speed indicator bar below
  game over screen: black overlay with "GAME OVER" title, final score, controls reminder
input_handlers:
  keyboard: >
    - W/Up: accelerate forward
    - S/Down: brake/reverse
    - A/Left and D/Right: steer left/right
    - Space or Enter on game over: restart game
rendering_structure:
  <div.skidmark-game>
    <div.sm-header>
      - Score display (current score + driftScore)
      - Time remaining countdown
      - Start Game / Race Again button (conditional on started/gameOver state)
    <canvas ref={canvasRef} width={600} height={500}>
    <div.sm-controls> (only when !gameOver && started) — "Tilt to drift!" hint
    <div.sm-start-screen> (only when !started && !gameOver) — instructions overlay
```

### `src/components/BackgroundSettings/Backgrounds.jsx`

```yaml
file: src/components/BackgroundSettings/Backgrounds.jsx
role: >
  Background customization panel allowing gradient color selection, animation toggle, and preset application.
props:
  bgConfig: "{ type, colors[], animated } — current background config from App.jsx"
  setBgConfig: "(cfg) => void — callback to update OS-level background state"
internal_state:
  colors: "Array of two hex color strings (initialized from bgConfig or preset default)"
  animated: "boolean — whether gradient animation is enabled"
presets:
  - Ocean: ['#667eea', '#764ba2']
  - Sunset: ['#f093fb', '#f5576c']
  - Forest: ['#11998e', '#38ef87']
  - Fire: ['#ff4e50', '#f9d423']
  - Night: ['#232526', '#414348']
  - Dawn: ['#e57a90', '#c33f64']
handlers:
  handleColorChange(index, value): >
    - Creates copy of colors array with new value at index
    - Updates state via setColors
  applyPreset(preset): >
    - Sets colors to preset.colors
    - Disables animation (setAnimated(false))
  handleApply(): >
    - If setBgConfig exists: calls it with { type: 'gradient', colors, animated }
    - Else: writes directly to localStorage ('browseros-bg')
      (fallback for when App.jsx doesn't pass the callback)
rendering:
  <div.backgrounds-app>
    <h3>Background Settings</h3>
    <div.bg-preview> — live preview of current gradient with optional animation
    <div.color-pickers> — two <input type="color"> pickers for each gradient stop
    <label.toggle> — checkbox for animated gradient (mirrors CSS keyframe)
    <div.presets> — 6 preset buttons showing gradient swatches, active state highlight
    <button.apply-btn> — "Apply" button triggering handleApply
data_flow: >
  - Reads from bgConfig prop on mount (or uses preset defaults)
  - User modifications stay in local state until Apply is clicked
  - On Apply: callback updates App.jsx bgConfig → triggers getBgStyle update → background changes
```

---

## 6. Global Styles

### `src/styles/globals.css`

```yaml
file: src/styles/globals.css
role: >
  Single global stylesheet applied to all components. No CSS modules, no scoped styles.
design_system:
  reset: >
    - * { margin: 0; padding: 0; box-sizing: border-box }
    - html/body: 100% width/height, overflow hidden, user-select none
  typography: 'Inter' font family (inherited from system default or parent)
color_palette:
  primary_blue: '#667eea'
  secondary_purple: '#764ba2'
  accent_pink: '#f093fb'
  accent_cyan: '#4facbe'
  success_green: '#2ecc71'
  danger_red: '#ff6b6b' / '#e74c3c'
  warning_gold: '#ffd700' / '#fdd947'
  dark_bg: '#1a1a2e' / '#0a0a2e'
  window_surface: 'rgba(25,25,45,0.95)'
keyframes:
  gradientShift: >
    - 0%: background-position 0% 50%
    - 50%: background-position 100% 50%
    - 100%: background-position 0% 50%
    - Used for animated gradient backgrounds (8s ease infinite)
component_styles:
  .os: >
    - Full viewport minus taskbar height (calc(100vh - 48px))
    - overflow hidden, position fixed
    - background set dynamically via inline styles in App.jsx
  .desktop: >
    - Full desktop area, padding 20px
    - flex column, flex-wrap wrap for icon grid
  .desktop-icons: >
    - Flex container wrapping icons with 15px gap
  .desktop-icon: >
    - Flex column layout, centered alignment
    - Hover effect: white background at low opacity
    - Icon emoji 40px, label white with text shadow
  .window: >
    - Position absolute (controlled by inline transform)
    - Border radius 12px, layered box shadows
    - Active window gets enhanced shadow + z-index 30
    - Inactive z-index 15
  .window-header: >
    - Flex row with icon, title, controls
    - Dark gradient background, subtle border
    - Control buttons: colored circles (yellow minimize, green maximize, red close)
      * Minimize: #fdd947
      * Maximize: #4cd859
      * Close: #ff5f56
  .window-content: >
    - Fills remaining height (calc(100% - 48px))
    - Scrollable overflow (overflow-y: auto)
  .resize-handle: >
    - n/s/e/w positioned handles at edges
    - 6px thick, cursor pointer for resize direction
  .taskbar: >
    - Fixed to bottom, full width
    - Height 48px, dark gradient background
    - Backdrop blur 20px (glassmorphism)
    - Top border with subtle white highlight
  .start-menu: >
    - Dropdown panel below start button
    - Dark semi-transparent background
    - App list with hover effects
  .clock-widget: >
    - Centered flex layout for analog clock face
    - Clock numbers positioned absolutely
    - Digital time/date below in white text
  .calculator: >
    - Flex column layout, full height
    - Display area with gradient background
    - Button grid 4 columns, hover scale effect
    - Special buttons: zero (span 2), equals (purple gradient)
  .snake-game / .flappy-game / .skidmark-game: >
    - Flex column layout for game containers
    - Canvas rendering area with box-shadow glow effects
    - Touch control buttons below canvas
  .builder-calc: >
    - Input fields with color pickers and gradient backgrounds
    - Visual board allocation bars with segment coloring
    - Summary tables with hover highlighting
  ::-webkit-scrollbar: >
    - Thin 6px scrollbar
    - Thumb at 15% white opacity
```

---

## 7. Build Configuration

### `vite.config.js`

```yaml
file: vite.config.js
purpose: >
  Vite bundler configuration for React development and production builds.
typical_config:
  plugins:
    - react() — Vite React plugin for JSX transform and HMR
  server:
    port: 5173 (default)
    open: true (auto-open in browser)
build:
  target: ES modules
  outDir: dist/ (production build output)
dependencies_in_package_json:
  dependencies:
    - react
    - react-dom
    - react-dom (or react-dom/client for createRoot)
  devDependencies:
    - vite
    - @vitejs/plugin-react
```

### `package.json`

```yaml
file: package.json
scripts:
  dev: "vite" — starts development server with HMR
  build: "vite build" — production build
  preview: "vite preview" — preview production build locally
```

---

## Data Flow Summary

```
App.jsx (state root)
  ├── windows[]          → Window components (open/close/minimize/focus)
  ├── activeWindow       → Window z-index layering
  └── bgConfig           → Backgrounds app (read/write via callback)

Desktop.jsx + Icon.jsx ← openApp(appId) from App.jsx
Taskbar.jsx              ← onToggleWindow(winId), onOpenApp(appId) from App.jsx
                           ← useClock() hook for system clock

Window.jsx               ← renders <AppComponent /> dynamically based on win.appId
  ├── ClockWidget        → setInterval for time updates
  ├── CalculatorApp      → local state for calculator logic
  ├── BuilderCalculator  → calculateLayout() with results visualization
  ├── SnakeGame          → Canvas + requestAnimationFrame game loop
  ├── FlappyBird         → Canvas + requestAnimationFrame game loop
  ├── GeometricDash      → Canvas + requestAnimationFrame game loop
  ├── SkidmarkGame       → Canvas + requestAnimationFrame drift physics loop
  └── Backgrounds        → setBgConfig callback to App.jsx

localStorage keys:
  - 'browseros-bg' → background configuration (persisted)
  - 'gd-best'      → Geometric Dash best score (persisted)
```

## Component Communication Map

| From | To | What | Method |
|------|-----|------|--------|
| App.jsx | Desktop.jsx | openApp callback | prop |
| App.jsx | Window.jsx | windows[], focus/close/minimize callbacks | prop |
| App.jsx | Taskbar.jsx | windows, apps, toggle/open callbacks | prop |
| App.jsx | Backgrounds app | bgConfig, setBgConfig | passed through Window.jsx |
| Desktop.jsx | Icon.jsx | onOpenApp callback | prop |
| Taskbar.jsx | Start menu items | onOpenApp callback | internal handler |

## Key Design Patterns

1. **Lifted State**: All state lives in App.jsx; children receive callbacks via props
2. **Dynamic Component Rendering**: Window component renders app components by reference (`component` prop)
3. **Ref-based Game Loops**: Games use `useRef` for mutable game state (avoids React re-renders during gameplay). Skidmark uses `gameOverRef` to avoid stale closure issues in requestAnimationFrame loops.
4. **Module-level Audio Contexts**: Web Audio API contexts are singletons per game to avoid recreation overhead
5. **localStorage Persistence**: Background config and best scores persist across page reloads
6. **CSS-in-JS via Inline Styles**: Dynamic styles (position, size, background) use inline style objects
7. **Global CSS**: No scoped styling; all rules in a single globals.css file