# Components

## Index
- App shell and windowing components under src/components
- Feature apps (games/tools) under src/components/*

## Current Component Notes
- Path: src/App.jsx
	Responsibility: workspace shell orchestration, window lifecycle, routing apps into windows.
	Inputs: local React state for windows, activeWindow, bgConfig.
	Dependencies: src/config/apps.js, BackgroundEffects, Desktop, Taskbar, Window.

- Path: src/components/BackgroundEffects/BackgroundEffects.jsx
	Responsibility: visual background layer rendering for orb and matrix modes.
	Inputs: bgConfig.mode.
	Dependencies: background classes in src/styles/base.css.

- Path: src/components/SkidmarkGame/Skidmark.jsx
	Responsibility: Skidmark game UI wrapper and overlays.
	Inputs: hook state from useSkidmarkEngine.
	Dependencies: constants.js, useSkidmarkEngine.js, skidmark.css.

- Path: src/components/SkidmarkGame/useSkidmarkEngine.js
	Responsibility: Skidmark simulation loop, controls, score/lap/combo/boost state.
	Inputs: canvasRef, started flag.
	Dependencies: constants.js and render.js.

- Path: src/components/SkidmarkGame/render.js
	Responsibility: draw track, car, and skid primitives.
	Inputs: canvas context + runtime state.
	Dependencies: constants.js.

- Path: src/components/BuilderCalculator/Builder.jsx
	Responsibility: Builder calculator UI shell.
	Inputs: local form state + calculated result state.
	Dependencies: calcPlan.js, BuilderInputs.jsx, BuilderResults.jsx.

- Path: src/components/BuilderCalculator/calcPlan.js
	Responsibility: cut-plan calculations and validations.
	Inputs: raw form input strings.
	Dependencies: none.

- Path: src/components/GeometricDash/GD.jsx
	Responsibility: Geometric Dash UI shell and user input wiring.
	Inputs: hook state from useGDGame.
	Dependencies: constants.js and useGDGame.js.

- Path: src/components/GeometricDash/useGDGame.js
	Responsibility: game loop state updates and collision/score management.
	Inputs: canvasRef.
	Dependencies: constants.js, render.js, audio.js.

- Path: src/components/TetrisGame/constants.js
	Responsibility: Tetris game constants — grid dimensions, tetromino shapes, colors, scoring points.
	Inputs: none (pure exports).
	Dependencies: none.

- Path: src/components/TetrisGame/useTetrisEngine.js
	Responsibility: Tetris game logic — board state, piece movement, rotation, collision detection, line clearing, scoring, auto-drop loop.
	Inputs: none (React hook with internal state).
	Dependencies: constants.js.

- Path: src/components/TetrisGame/Tetris.jsx
	Responsibility: Tetris UI shell — canvas rendering of board/pieces/ghost/preview, touch controls, game status buttons.
	Inputs: hook state from useTetrisEngine.
	Dependencies: useTetrisEngine.js, constants.js.

## Documentation Template
For each component include:
- Path
- Responsibility
- Inputs (props/state)
- Dependencies (hooks/services)
- Notes

## Maintenance Rule
- Update this page whenever a component is added, removed, split, or responsibilities change.
