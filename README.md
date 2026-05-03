# BrowserOS

A web-based desktop operating system simulation built with React. Features a fully interactive desktop environment with draggable/resizable windows, taskbar management, and multiple built-in applications including games, utilities, and customization options.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Architecture Overview

BrowserOS is a single-page React application that simulates a desktop operating system. The architecture follows a component-based hierarchy with centralized state management at the top level.

### Project Structure

```
browser-os/
├── index.html                    # Entry HTML file
├── package.json                  # Dependencies & scripts (Vite + React)
├── vite.config.js                # Vite bundler configuration
├── src/
│   ├── main.jsx                  # React entry point — renders <App />
│   ├── App.jsx                   # Root component — manages OS-level state
│   ├── components/
│   │   ├── BuilderCalculator/
│   │   │   └── Builder.jsx       # Timber frame layout calculator with board allocation
│   │   ├── ClockWidget/
│   │   │   └── Clock.jsx         # Analog + digital clock widget app
│   │   ├── CalculatorApp/
│   │   │   └── Calculator.jsx    # Scientific calculator app
│   │   ├── SnakeGame/
│   │   │   └── Snake.jsx         # Classic snake game with canvas rendering
│   │   ├── FlappyBird/
│   │   │   └── FlappyBird.jsx    # Flappy Bird clone with pipe obstacles
│   │   ├── GeometricDash/
│   │   │   └── GD.jsx            # Auto-scroll platformer with jumping cube
│   │   ├── SkidmarkGame/
│   │   │   └── Skidmark.jsx      # Drift racing game with skid mark rendering
│   │   └── BackgroundSettings/
│   │       └── Backgrounds.jsx   # Gradient background customizer
│   ├── hooks/
│   │   └── useClock.js           # Custom hook for real-time clock data
│   └── styles/
│       └── globals.css           # Global stylesheet (all components)
```

---

## Core Systems

### 1. State Management (`App.jsx`)

All application state lives in the root `App` component using React's built-in `useState`. There is no Redux, Context API, or external state library — just plain React state lifted to the top level.

**Three state slices:**
- **`windows`** — Array of open window objects, each containing `{ id, appId, title, icon, minimized, initialX, initialY, initialW, initialH }`
- **`activeWindow`** — ID of the currently focused window (controls z-index layering)
- **`bgConfig`** — Background configuration persisted to `localStorage`

The component provides four callback functions via props:
- `openApp(appId)` — Opens a new window or restores a minimized one. Deduplicates by reusing existing windows of the same app type.
- `closeWindow(winId)` — Removes a window from the array entirely
- `minimizeWindow(winId)` — Sets `minimized: true` on a window
- `focusWindow(winId)` — Brings a window to the front (highest z-index) and un-minimizes it

### 2. Window Management (`Window.jsx`)

Each open application is wrapped in a `Window` component that provides:

**Positioning & Sizing:**
- Initial position offset by app launch count (staggered cascade effect)
- Draggable via header mouse-down events with continuous tracking
- Resizable from all four edges using dedicated resize handle elements
- Maximizable to fullscreen toggle

**Z-index Layering:**
- Active window: `zIndex: 30`
- Inactive windows: `zIndex: 15`
- Controlled by the `isActive` flag derived from comparing `win.id === activeWindow`

**Special App Handling:**
The Backgrounds app receives special props (`bgConfig`, `setBgConfig`) passed through the Window component, allowing it to modify the OS-level background configuration.

### 3. Desktop & Icon System (`Desktop.jsx` + `Icon.jsx`)

The desktop renders a grid of application icons using CSS flexbox wrapping. Each icon is clickable and triggers `openApp(appId)` from the parent.

**Icon data source:** A local `APPS` array in `Desktop.jsx` mirrors the master list from `App.jsx`. This duplication means both arrays must stay in sync when adding new apps.

### 4. Taskbar (`Taskbar.jsx`)

The bottom bar contains:
- Left section: Start menu with app launch buttons for each app type (opens first instance)
- Middle section: Open window items showing running apps with active state highlighting
- Right section: System clock display

Clicking a taskbar item toggles between minimizing and restoring that specific window instance.

---

## Applications

### 🕐 Clock Widget (`ClockWidget/Clock.jsx`)

An analog clock face with hour, minute, and second hands, plus a digital time/date display below. Uses `setInterval` to update every second. Numbers are positioned using trigonometric calculations around the circular face.

**Sound:** Direction change click sound on keypress (440Hz sine wave).

### 🧮 Calculator (`CalculatorApp/Calculator.jsx`)

A functional calculator with grid-based button layout supporting basic arithmetic operations (+, -, ×, ÷), clear, delete, and decimal point. Display updates in real-time as buttons are pressed.

### 🔨 Builder Calculator (`BuilderCalculator/Builder.jsx`)

A timber frame layout calculator for carpenters and builders:
- Input area dimensions, lip sizes, joist spacing, board length, and plank width
- Automatically calculates optimal board allocation to minimize waste
- Visual bar showing cut positions and remaining material per board
- Summary table with measurements and layout visualization

### 🐍 Snake Game (`SnakeGame/Snake.jsx`)

Classic snake game rendered on HTML5 Canvas:
- 20×20 grid with 20px cells
- Arrow key controls for direction (with touch button support)
- Food consumption triggers ascending tone burst sound
- Collision detection for walls and self-intersection
- Game over screen with score display and restart option

**Sound system:** Uses Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`) for procedural sound generation without external assets.

### 🐦 Flappy Bird (`FlappyBird/FlappyBird.jsx`)

Canvas-based platformer:
- Gravity physics with flap power impulse
- Procedurally generated pipe obstacles with gap sizing of 130px
- Score tracking per pipe passed through
- Parallax star background animation
- Rotating bird sprite with eye and beak details

**Sound system:** Web Audio API with flap sounds (500Hz sine), score chimes (660→880Hz ascending), and collision crash (120Hz sawtooth).

### 🟩 Geometric Dash (`GeometricDash/GD.jsx`)

Auto-scrolling side-view platformer:
- Player cube with rotation animation and glowing eye detail
- Three obstacle types: single spikes, double spikes, blocks
- Increasing speed over time (5 + frame × 0.002)
- Particle explosion system on death (15 particles with random velocities)
- Best score persistence via `localStorage`
- Keyboard (SPACE) and mouse/touch input support

**Sound system:** Jump sounds (600Hz sine), crash effects (150Hz sawtooth).

### 🏎️ Skidmark (`SkidmarkGame/Skidmark.jsx`)

Drift racing game rendered on HTML5 Canvas:
- Circular track with WASD/Arrow key controls for driving and drifting
- Drift physics — turning at speed triggers skid mark rendering
- Tire smoke particles during drift maneuvers
- Visual tire tread patterns on skid marks
- 60-second timer countdown with score tracking based on drift time
- Speed indicator bar (green → yellow → red gradient)

**Physics:** Drift detection based on turning speed threshold — sharp turns at high velocity trigger full skid rendering. Uses `requestAnimationFrame` for smooth canvas updates and refs to avoid stale closure issues in game loops.

### 🎨 Background Settings (`BackgroundSettings/Backgrounds.jsx`)

Customization panel allowing:
- Gradient color picker with two custom colors
- Animated gradient toggle (CSS animation)
- Preset gradient themes
- Live preview of background changes

Communicates with `App.jsx` via callback props to update the OS-level background configuration.

---

## Styling (`globals.css`)

All styles are global (no CSS-in-JS, no scoped CSS). Key design decisions:

**Glassmorphism aesthetic:** Semi-transparent backgrounds with backdrop blur on taskbar and window headers.

**Gradient backgrounds:** Animated gradient keyframe animation for dynamic background switching.

**Window styling:** Border radius 12px with layered box shadows creating a floating effect. Active windows get enhanced shadow with purple accent glow.

**Responsive grid:** Desktop icons use flex-wrap alignment for automatic layout across different viewport sizes.

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| React 18+ | UI framework |
| ReactDOM 18+ | DOM rendering |
| Vite | Build tool + dev server |

No other dependencies are required. All games use Canvas API and Web Audio API natively — no external game libraries. Builder Calculator uses only React state and CSS for layout visualization.

---

## Adding a New Application

1. Create component file in `src/components/YourApp/YourApp.jsx`
2. Export default React functional component
3. Add to `APPS` array in both `App.jsx` AND `Desktop/Desktop.jsx` (keep them in sync)
4. The app will automatically appear on the desktop and be launchable from the taskbar

No changes needed to Window or Taskbar components — they dynamically render any registered app component.

---

## Technical Notes

- **No external state management** — all state is local to `App.jsx`
- **No CSS framework** — custom global stylesheet only
- **No game engine** — all games use raw Canvas 2D API with manual game loops via `requestAnimationFrame` and `setInterval`
- **Audio uses Web Audio API** — procedural sound generation, no audio files needed
- **localStorage persistence** for background config and best scores
- **Vite dev server** on port 5173 by default

---

## Known Behaviors

- Multiple instances of the same app type stack with staggered initial positions
- Window z-index is controlled by `activeWindow` state — only one window can be active at a time
- Background config persists across page reloads via localStorage
- Audio context requires user gesture to initialize (browser autoplay policy)