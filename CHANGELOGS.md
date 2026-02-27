# CHANGELOGS

## 0.0.17 - 2026-02-27
- Added command-stack based Undo/Redo in `src/App.jsx` with bounded history (`past/future`, max 60 steps) for screenshot and layer mutations.
- Added keyboard shortcuts for history navigation: `Cmd/Ctrl+Z` (undo), `Shift+Cmd/Ctrl+Z` and `Ctrl+Y` (redo).
- Added header-level `Undo` and `Redo` controls with disabled state binding in `src/components/ScreenshotEditor.jsx`.
- Refactored object URL lifecycle tracking to include active state plus history snapshots, ensuring image sources remain valid during undo/redo jumps.
- Cleared undo/redo history on project load to prevent cross-project command contamination.
- Verified the undo/redo integration with a successful production build using `npm run build`.

## 0.0.16 - 2026-02-27
- Added project persistence workflow with `Save Project` and `Load Project` actions in the editor header.
- Implemented portable JSON project format in `src/utils/projectPersistence.js` with schema/version validation for safer team handoff.
- Added image source serialization that embeds image payloads only at save-time, then restores them as object URLs on load to keep runtime state memory-efficient.
- Added load-time recovery for app runtime counters (`screenshotIdRef`, `layerIdRef`) and active screenshot selection consistency.
- Verified project persistence changes with a successful production build using `npm run build`.

## 0.0.15 - 2026-02-27
- Replaced image layer storage from base64 `dataUrl` strings to lightweight `object URL` references (`imageSrc`, `screenImageSrc`) in app state.
- Added centralized object URL reference counting in `src/App.jsx` to prevent memory leaks across duplicate/delete/update flows.
- Kept backward compatibility for legacy layers by resolving `dataUrl/screenDataUrl` as fallback sources during render/export.
- Optimized export pipeline in `src/utils/exportScreenshots.js` by replacing `toDataURL -> atob -> Blob` with direct `Konva.Stage.toBlob()` output.
- Verified the refactor with a successful production build using `npm run build`.

## 0.0.14 - 2026-02-27
- Scanned the codebase and confirmed there are no source files above 1000 lines.
- Modularized large code files for better maintainability and lower merge-conflict risk.
- Refactored `src/App.jsx` from 666 lines to 510 lines by extracting image/file helpers, screenshot helpers, layer presets, and theme preference behavior into dedicated modules.
- Refactored `src/components/CanvasStage.jsx` from 663 lines to 215 lines by extracting canvas layer nodes, layer rendering branches, and transform logic into `src/components/canvas/`.
- Verified the refactor with a successful production build using `npm run build`.

## 0.0.13 - 2026-02-27
- Added advanced layer engine controls: lock/unlock, duplicate layer, and one-click alignment (`Center X`, `Center Y`, `Center Both`).
- Added universal per-layer visual controls: opacity and blend mode (normal, multiply, screen, overlay, soft/hard light, darken/lighten, color dodge/burn).
- Applied lock behavior to canvas interactions by disabling drag/transform for locked layers.
- Synced blend mode and opacity rendering across both editor preview and export pipeline for image/text/shape/mockup layers.

## 0.0.12 - 2026-02-27
- Reverted screenshot list UI back to previous vertical sidebar layout.
- Implemented screenshot switching on canvas via horizontal scroll gesture with infinite cycling behavior.
- Added looped navigation logic so scrolling right advances `01 -> 02 -> 03` and wraps from the last screenshot to the first.

## 0.0.11 - 2026-02-27
- Added new mockup layer system with three presets: `realistic`, `flat`, and `rounded`.
- Added toolbar actions to insert each mockup style directly into the editor.
- Added mockup screen image support via auto-pick from latest image layer and manual upload in inspector.
- Added mockup controls for style, frame/accent colors, bezel, and corner radius.
- Extended both canvas preview and full-resolution export renderer to include mockup layers and embedded screens.

## 0.0.10 - 2026-02-27
- Reworked screenshot navigator into a horizontal, scrollable carousel for faster sequence browsing.
- Added infinite-loop style scrolling behavior so horizontal movement continues fluidly across screenshot cards.
- Synced active screenshot selection to the centered card while scrolling, enabling natural `02 -> 03 -> 04` progression.
- Updated reorder controls to left/right semantics to match horizontal navigation direction.

## 0.0.09 - 2026-02-27
- Added comprehensive PRD document (`PRD.md`) describing product purpose, scope, requirements, metrics, risks, and acceptance criteria.
- Captured current codebase capabilities in a structured product format for planning and stakeholder alignment.

## 0.0.08 - 2026-02-27
- Added a production-ready `.gitignore` tuned for Vite/React projects.
- Excluded dependency, build, cache, env, editor, and test artifact files from version control.
- Prepared repository for clean first commit and remote push without noisy/generated files.

## 0.0.07 - 2026-02-27
- Expanded decorative design system with multiple presets: `orb`, `ring`, `pill`, and `glow`.
- Added dedicated quick-add controls in editor toolbar for each decor preset.
- Extended inspector controls for advanced decor styling (secondary color, stroke width, corner radius, opacity, blur).
- Updated canvas and export pipeline so all new decor styles render consistently in preview and final PNG/ZIP outputs.

## 0.0.06 - 2026-02-27
- Added decorative visual layer support (`Decor Orb`) for circle-like background effects.
- Enabled drag, resize, rotate, color, opacity, and blur editing for decor layers in canvas + inspector.
- Included decor layers in full-resolution PNG export and ZIP batch export output.

## 0.0.05 - 2026-02-27
- Added full dark mode support with manual toggle button in the header.
- Added persisted theme preference via `localStorage` and automatic first-load fallback to OS color scheme.
- Enabled Tailwind class-based dark variants and updated editor/inspector/canvas controls for dark mode readability.
- Added dark-aware global design tokens for app background, panel, border, text, accent, and grid texture.

## 0.0.04 - 2026-02-27
- Added broad multi-font support for text layers with a curated font list.
- Added font-family selector in Inspector for text layers.
- Synced font availability through Google Fonts import so canvas and exported PNGs keep chosen font style.

## 0.0.03 - 2026-02-27
- Removed status bar and safe area features from the editor flow.
- Removed safe-area overlay rendering and toggle control from the canvas UI.
- Simplified compliance checks to keep only text horizontal bounds validation.

## 0.0.02 - 2026-02-27
- Updated ZIP batch export structure to deterministic App Store Connect packaging layout: `Root/{locale}/iphone_6_7/screenshot_XX_iphone_6_7.png`.
- Added default localization set for batch packaging: `en-US`, `de-DE`, `tr-TR`.

## 0.0.01 - 2026-02-27
- Initialized App Store Screenshot Engine MVP with Vite + React + Tailwind setup.
- Implemented multi-screenshot architecture with independent state, navigation, duplication, deletion, and reordering.
- Added Konva-based canvas editor with image/text layers, drag/resize/transform controls, and safe-area guides.
- Added compliance checks for safe-area overlap and text width overflow warnings.
- Added single PNG and batch ZIP export utilities rendering at exact 1290x2796 resolution.
