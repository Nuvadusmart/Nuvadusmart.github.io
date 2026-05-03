# Decisions

## Purpose
Capture non-trivial technical decisions so future updates are consistent.

## Entry Template
### YYYY-MM-DD - Title
- Context:
- Decision:
- Alternatives considered:
- Consequences:

## Maintenance Rule
- Add an entry for architecture, performance, or workflow decisions that affect future work.

## 2026-05-03 - Enforce 200-Line Rule by Module Extraction
- Context: multiple files exceeded 200 lines and mixed component rendering with heavy logic.
- Decision: extract app registry, background config, background renderer, and Skidmark game logic/rendering into separate files.
- Alternatives considered: keep monolithic files and only trim comments or whitespace.
- Consequences: improved maintainability and rule compliance; requires more file navigation.

## 2026-05-03 - Split Global Stylesheet by Domain
- Context: src/styles/globals.css exceeded the 200-line limit significantly.
- Decision: split styles into base.css, windowing.css, apps-basic.css, builder.css, and skidmark.css with globals.css as an import hub.
- Alternatives considered: keep a single file with compressed one-line declarations.
- Consequences: clearer ownership per style domain, easier incremental refactors.

## 2026-05-03 - Remove Legacy SkidmarkClean Variant
- Context: duplicate Skidmark implementations increased maintenance cost and violated size constraints.
- Decision: remove SkidmarkClean.jsx and keep a single modular Skidmark implementation.
- Alternatives considered: keep both versions and mark one deprecated.
- Consequences: reduced duplication and less divergence risk.
