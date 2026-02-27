# CHANGELOGS

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
