# Changelog

## 2026-05-03
### Task
Initialize Cline workspace rules and Agent Wiki scaffolding.

### Changes
- Added .clinerules with file-size, structure, and wiki update requirements.
- Added agent wiki index and subpages.

### Wiki Updates
- Added: README.md, architecture.md, components.md, decisions.md, todos.md, changelog.md

### Notes
- Future tasks should read Agent Wiki first and update it after every change.

## 2026-05-03
### Task
Apply first compliance pass for new Cline workspace rules.

### Changes
- Split oversized Skidmark implementation into modular files:
	- src/components/SkidmarkGame/constants.js
	- src/components/SkidmarkGame/render.js
	- src/components/SkidmarkGame/useSkidmarkEngine.js
	- src/components/SkidmarkGame/Skidmark.jsx
- Removed src/components/SkidmarkGame/SkidmarkClean.jsx.
- Split app shell dependencies into:
	- src/config/apps.js
	- src/utils/backgroundConfig.js
	- src/components/BackgroundEffects/BackgroundEffects.jsx
- Refactored src/App.jsx to use extracted modules.
- Split styles into domain files and converted src/styles/globals.css to import hub.

### Wiki Updates
- Updated: architecture.md, components.md, decisions.md, changelog.md

### Notes
- Remaining known >200 line files still need follow-up: Builder.jsx and GD.jsx.

## 2026-05-03
### Task
Complete remaining 200-line compliance for BuilderCalculator and GeometricDash.

### Changes
- Replaced monolithic BuilderCalculator with modular files:
	- src/components/BuilderCalculator/Builder.jsx
	- src/components/BuilderCalculator/calcPlan.js
	- src/components/BuilderCalculator/BuilderInputs.jsx
	- src/components/BuilderCalculator/BuilderResults.jsx
- Replaced monolithic GeometricDash with modular files:
	- src/components/GeometricDash/GD.jsx
	- src/components/GeometricDash/useGDGame.js
	- src/components/GeometricDash/render.js
	- src/components/GeometricDash/audio.js
	- src/components/GeometricDash/constants.js

### Wiki Updates
- Updated: architecture.md, components.md, changelog.md

### Notes
- After this pass, no source file in src exceeds 200 lines.

## 2026-05-03
### Task
Fix Geometric Dash runtime start issue after modular refactor.

### Changes
- Updated src/components/GeometricDash/useGDGame.js to keep requestAnimationFrame loop alive while idle.
- Ensured game starts correctly after Start/Restart by continuing loop scheduling when g.running is false.
- Updated game-over best-score write to use current frame-derived final score.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after fix.

## 2026-05-03
### Task
Restore Geometric Dash visuals and landing behavior after modular split.

### Changes
- Updated src/components/GeometricDash/render.js to restore starfield, patterned ground, glow accents, richer obstacle drawing, and player details.
- Updated src/components/GeometricDash/useGDGame.js to restore obstacle variety (single/double spikes + blocks), tuned block hitbox collision, ground scrolling offset, and flat landing angle snap.
- Updated src/components/GeometricDash/constants.js with block hitbox inset constant.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after restoration changes.

## 2026-05-03
### Task
Fix Geometric Dash obstacle spawn regression.

### Changes
- Updated src/components/GeometricDash/useGDGame.js to keep the animation loop effect stable and prevent obstacle spawn timer reset.
- Removed score-driven effect restart by replacing per-frame render values with refs (scoreRef and bestScoreRef).
- Preserved live HUD updates while allowing spawnTimer to accumulate correctly.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after obstacle spawn fix.

## 2026-05-03
### Task
Fix background gradient animation stuck on first gradient.

### Changes
- Updated src/utils/backgroundConfig.js so animated gradient mode uses the active configured color pair instead of a hardcoded default gradient.
- Preserved existing non-animated gradient, orbs, and matrix background behavior.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after background animation fix.

## 2026-05-03
### Task
Improve background settings flow for animated gradient activation.

### Changes
- Updated src/components/BackgroundSettings/Backgrounds.jsx to apply Animated Gradient toggle immediately without requiring a second Apply click.
- Added shared commitConfig helper so both Apply and immediate-toggle paths persist config consistently.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after settings UX update.

## 2026-05-03
### Task
Fix React style warning for background animation updates.

### Changes
- Updated src/components/BackgroundSettings/Backgrounds.jsx to use backgroundImage instead of background in inline preview style.
- Updated src/utils/backgroundConfig.js to use backgroundImage instead of background for desktop background style generation.
- Removed shorthand/longhand mix that triggered React warning when backgroundSize and animation changed during rerender.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after style warning fix.

## 2026-05-03
### Task
Fix Builder Calculator to account for joists in cut planning.

### Changes
- Updated src/components/BuilderCalculator/calcPlan.js so each row is assembled from joist-aligned span runs instead of one full-width cut.
- Planner now splits long widths into multiple segments at joist boundaries when width exceeds material length.
- Existing offcut reuse and board tracking remain active for each generated segment.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after Builder joist fix.

## 2026-05-03
### Task
Add joist width support to Builder Calculator.

### Changes
- Updated src/components/BuilderCalculator/Builder.jsx default form state with joistWidthStr.
- Updated src/components/BuilderCalculator/BuilderInputs.jsx to include Joist Width input.
- Updated src/components/BuilderCalculator/calcPlan.js to parse/validate joist width and derive seam buffer (+/- joistWidth/2).
- Added supportZones output so visualization can show seam landing buffer around each joist center.
- Updated src/components/BuilderCalculator/BuilderResults.jsx to display joist width, seam buffer, and joist support zones.
- Updated src/styles/builder.css with support-zone styling.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after joist width enhancement.

## 2026-05-03
### Task
Make Builder cut plan strictly joist-segmented.

### Changes
- Updated src/components/BuilderCalculator/calcPlan.js so each row is cut span-by-span from joist pattern instead of merging spans into a single long run.
- This prevents full-length row cuts from appearing when board length is longer than area width.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after strict joist segmentation update.

## 2026-05-03
### Task
Adjust Builder cut strategy to avoid over-segmentation.

### Changes
- Updated src/components/BuilderCalculator/calcPlan.js to group joist spans into the longest possible run that still fits material length.
- Seams remain joist-aligned, but cuts are no longer forced at every joist interval.
- Restored practical behavior: short rows can remain single-piece, long rows split only as needed.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after cut strategy correction.

## 2026-05-03
### Task
Improve Builder cut planning with offcut-aware joist splits.

### Changes
- Updated src/components/BuilderCalculator/calcPlan.js with an offcut-first joist split strategy.
- Planner now attempts a 2-piece row split at the largest joist position that fits available offcut before falling back to normal min-cut planning.
- This prevents repeated full-length rows when a joist-aligned split can better consume offcuts.

### Wiki Updates
- Updated: changelog.md

### Notes
- Verified scenario 240x230, lip 5/5/5, spacing 60, board 420 now produces early row sequence [240], [125,115], [240], [65,175], [240].
- Build passes after offcut strategy update.

## 2026-05-04
### Task
Add configurable minimum joist bearing limit to Builder Calculator.

### Changes
- Updated src/components/BuilderCalculator/Builder.jsx with minJoistBearingStr default.
- Updated src/components/BuilderCalculator/BuilderInputs.jsx with Min Bearing Per Side input.
- Updated src/components/BuilderCalculator/calcPlan.js to validate minimum bearing and constrain seam placement within allowed seam zones.
- Updated src/components/BuilderCalculator/BuilderResults.jsx to display configured minimum bearing.

### Wiki Updates
- Updated: changelog.md

### Notes
- Planner now enforces: minimum bearing per board end <= half joist width.
- Build passes after minimum-bearing enhancement.

## 2026-05-04
### Task
Set Builder defaults to centered bearing with customizable override.

### Changes
- Updated src/components/BuilderCalculator/Builder.jsx defaults to joist width 4.8cm and minimum bearing 2.4cm (centered/half-width).
- Updated src/components/BuilderCalculator/calcPlan.js so missing minimum bearing defaults to half of current joist width.
- Updated src/components/BuilderCalculator/calcPlan.js numeric parsing to accept comma decimals (e.g. 4,8).

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after default and parsing updates.

## 2026-05-04
### Task
Fix calculator display to show full expression before equals.

### Changes
- Updated src/components/CalculatorApp/Calculator.jsx to track current operand text separately from rendered display.
- Calculator now displays in-progress expression (e.g. 5+3) while typing after an operator.
- Equals now resolves expression and replaces display with the final result.

### Wiki Updates
- Updated: changelog.md

### Notes
- Build passes after calculator display fix.
