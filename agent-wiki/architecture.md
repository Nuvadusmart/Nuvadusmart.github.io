# Architecture

## Workspace
- Root app: browser-os
- Frontend stack: React + Vite
- Main source directory: src

## Current High-Level Layout
- src/components: feature and UI components
- src/hooks: reusable hooks
- src/styles: global and shared styles
- src/config: app registry and window metadata
- src/utils: shared config normalization and style helpers

## Rules for Architecture Changes
- Keep files <= 200 lines.
- Separate rendering components from game/business logic modules.
- Extract shared logic into hooks/services/utils before files exceed limit.

## Implemented Boundaries
- App shell orchestration: src/App.jsx
- App registry: src/config/apps.js
- Background config logic: src/utils/backgroundConfig.js
- Background rendering: src/components/BackgroundEffects/BackgroundEffects.jsx
- Skidmark game logic: src/components/SkidmarkGame/useSkidmarkEngine.js
- Skidmark drawing logic: src/components/SkidmarkGame/render.js
- Skidmark constants/geometry: src/components/SkidmarkGame/constants.js
- Skidmark UI shell: src/components/SkidmarkGame/Skidmark.jsx
- BuilderCalculator logic: src/components/BuilderCalculator/calcPlan.js
- BuilderCalculator UI split: src/components/BuilderCalculator/BuilderInputs.jsx and src/components/BuilderCalculator/BuilderResults.jsx
- GeometricDash loop logic: src/components/GeometricDash/useGDGame.js
- GeometricDash rendering/audio split: src/components/GeometricDash/render.js and src/components/GeometricDash/audio.js
- Styles split by domain via import hub: src/styles/globals.css

## Change Log Reference
- Detailed change history belongs in changelog.md.
