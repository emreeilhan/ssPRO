# CHANGELOGS

## 0.0.31 - 2026-02-27
- Improved canvas fit behavior in `src/components/CanvasStage.jsx` by combining width-based and viewport-height-based scaling.
- Added responsive viewport height tracking so the preview auto-rescales on window resize.
- Reduced vertical overflow risk so the full screenshot canvas is visible without extra page scrolling in typical editor layouts.
- Verified canvas scaling update with a successful production build using `npm run build`.

## 0.0.30 - 2026-02-27
- Added distraction-free Focus Mode in `src/components/ScreenshotEditor.jsx` to hide left/right sidebars and maximize canvas workspace.
- Added visible `Focus Mode` / `Exit Focus` header toggle for one-click mode switching.
- Added keyboard shortcut `F` to toggle focus mode quickly (with typing-context guard to avoid interfering with form input).
- Verified focus mode integration with a successful production build using `npm run build`.

## 0.0.29 - 2026-02-27
- Enhanced layer stack scanability in `src/components/LayerPanel.jsx` with per-type icon badges (`TXT`, `IMG`, `MCK`, `SHP`).
- Added explicit status badges for `Locked` and `Hidden` states in each layer row for faster operator feedback.
- Added type-specific visual tones for quick classification of text/image/mockup/shape layers at a glance.
- Verified layer stack icon + status badge integration with a successful production build using `npm run build`.

## 0.0.28 - 2026-02-27
- Refactored inspector form in `src/components/LayerPanel.jsx` into accordion sections for `Transform`, `Appearance`, and `Type Specific` controls.
- Added reusable `AccordionSection` UI block with collapse/expand behavior and section state management.
- Preserved existing control behaviors while reducing long-form visual load and improving edit focus.
- Verified accordion inspector integration with a successful production build using `npm run build`.

## 0.0.27 - 2026-02-27
- Added visible mini navigation controls (`Prev` / `Next`) on top of the editable canvas in `src/components/CanvasStage.jsx`.
- Wired controls to existing screenshot cycle handlers used by horizontal wheel navigation for consistent behavior.
- Kept controls hidden in read-only compare panels to avoid accidental context confusion.
- Verified discoverable navigation control integration with a successful production build using `npm run build`.

## 0.0.26 - 2026-02-27
- Reduced initial Google Fonts payload in `src/index.css` to only core UI families (`IBM Plex Sans`, `IBM Plex Mono`).
- Added on-demand font loading utility in `src/utils/fontLoader.js` for text-layer font families used in projects.
- Integrated lazy font loading in `src/App.jsx` by scanning active project text layers and requesting missing fonts only when needed.
- Verified typography-load optimization with a successful production build using `npm run build`.

## 0.0.25 - 2026-02-27
- Added canvas helper overlay system in `src/components/CanvasStage.jsx` with independent toggles for Safe Area, Center guides, and Margin Grid.
- Added toolbar toggle controls in `src/components/ScreenshotEditor.jsx` and synced overlay visibility across normal and comparison canvases.
- Implemented non-interactive overlay rendering (safe boundary frame, center crosshair, and margin grid lines) to improve alignment precision without affecting layer edits.
- Verified overlay toggle integration with a successful production build using `npm run build`.

## 0.0.24 - 2026-02-27
- Added screenshot thumbnails to the left sidebar list for faster visual navigation.
- Implemented new `src/components/ScreenshotThumbnail.jsx` that renders compact, read-only previews using Konva.
- Updated screenshot list cards in `src/components/ScreenshotEditor.jsx` to show thumbnail + index + layer count together.
- Verified thumbnail list integration with a successful production build using `npm run build`.

## 0.0.23 - 2026-02-27
- Added keyboard delete behavior in `src/App.jsx`: pressing `Delete` or `Backspace` now removes the currently selected layer.
- Added typing-context guard so delete shortcuts are ignored while editing inputs, textareas, selects, or contenteditable fields.
- Verified delete-shortcut integration with a successful production build using `npm run build`.

## 0.0.22 - 2026-02-27
- Added context-aware empty-state coaching in `src/components/ScreenshotEditor.jsx` with actionable quick-start recommendations.
- Implemented dynamic guidance logic for different composition states (empty canvas, visual-only, text-only, and near-final layouts).
- Added one-click coaching actions wired to existing commands (`Add Text`, image upload, decor, and mockup insertion) to reduce first-session drop-off.
- Verified empty-state coaching integration with a successful production build using `npm run build`.

## 0.0.21 - 2026-02-27
- Added side-by-side comparison mode in `src/components/ScreenshotEditor.jsx` with a `Compare` toggle and variant selector.
- Implemented dual-canvas layout: editable current screenshot panel + read-only comparison panel for faster decision-making.
- Added read-only rendering support in `src/components/CanvasStage.jsx` and interaction gating in canvas layer renderers to prevent accidental edits on compare view.
- Added panel labels (`Current`, `Compare Variant`) and preserved existing editing workflow when compare mode is off.
- Verified comparison mode integration with a successful production build using `npm run build`.

## 0.0.20 - 2026-02-27
- Added standardized typography scale presets in `src/constants.js`: `Hero`, `Subhead`, and `Caption`.
- Added one-click preset controls in `src/components/LayerPanel.jsx` for text layers to apply consistent `fontSize`, `lineHeight`, and text `width`.
- Added active preset highlighting so teams can quickly verify typography hierarchy consistency in the inspector.
- Verified typography preset integration with a successful production build using `npm run build`.

## 0.0.19 - 2026-02-27
- Added batch export progress reporting with phase-aware updates (`render` and `zip`) in `src/utils/exportScreenshots.js`.
- Added cancellable export flow using `AbortController` and `AbortError` handling for long-running ZIP exports.
- Added live export progress UI in `src/components/LayerPanel.jsx` with percent bar, status message, and `Cancel Export` action.
- Wired progress/cancel state through `src/App.jsx` and `src/components/ScreenshotEditor.jsx` so users can monitor and interrupt long batch jobs safely.
- Verified progress + cancel export integration with a successful production build using `npm run build`.

## 0.0.18 - 2026-02-27
- Expanded compliance validation in `src/utils/layerChecks.js` beyond horizontal overflow.
- Added vertical overflow checks for text bounds against device height.
- Added recommended safe-area checks using 5% horizontal/vertical margins.
- Added minimum text size warnings for readability (`42px` threshold).
- Added contrast warnings with ratio output against screenshot background (`4.5:1` normal text, `3:1` large text).
- Verified updated validation pipeline with a successful production build using `npm run build`.

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

## 0.0.15 - 2026-03-01
- Redesigned the editor into a minimal, neutral, modern SaaS interface using a light gray app background (`#f7f7f8`), white panels, soft blue accents, and no decorative grid textures.
- Introduced a cleaner global visual system in `src/index.css` with hairline dividers, rounded 8px button styling, thinner top bar treatment, and reduced UI density.
- Reworked `ScreenshotEditor` layout to support collapsible left Screenshots and right Inspector panels with smooth 200ms ease transitions, including subtle collapse controls and automatic canvas expansion.
- Refined toolbar and action hierarchy by converting dense square controls into soft ghost/primary buttons and reducing visual noise while preserving existing editing/export capabilities.
- Updated `LayerPanel` into a cleaner accordion-driven inspector with improved spacing, subtle section separation, and calmer stack/action presentation.
- Updated canvas shell styling in `CanvasStage` to match the new UI language and removed yellow guide tones in favor of neutral guide colors.
- Verified the redesign with a successful production build using `npm run build`.

## 0.0.16 - 2026-03-01
- Implemented a more contextual action bar in `ScreenshotEditor`: kept core active-screen actions visible (`Background`, `Upload`, `Add Text`, `Compare`, `Safe Area`) and moved secondary controls into a compact `More` menu to reduce visual clutter.
- Upgraded screenshot cards in the left panel to a more content-first layout by enlarging previews and reducing metadata emphasis, improving quick scan quality across variants.
- Added a global micro-interaction standard in `src/index.css` with shared motion tokens (`--motion-fast`, `--motion-base`, `--motion-panel`) and unified easing, then applied these to button and panel transitions for a more premium, consistent feel.
- Verified changes with a successful production build using `npm run build`.

## 0.0.17 - 2026-03-01
- Established a clear typography hierarchy in `src/index.css` with reusable semantic classes: `type-heading`, `type-subheading`, and `type-meta`.
- Applied the hierarchy across primary editor surfaces (`ScreenshotEditor`, `LayerPanel`, `CanvasStage`) so headings, section labels, and metadata now follow consistent scale/weight rules.
- Improved visual scanning by reducing ad-hoc text sizing and uppercase density in favor of semantic text roles, creating a calmer, less tool-like UI rhythm.
- Verified the update with a successful production build using `npm run build`.

## 0.0.21 - 2026-03-01
- Reorganized the `ScreenshotEditor` top bar into clear task-based action groups: `Edit`, `Project`, `View`, and `Export`.
- Grouped undo/redo, save/load, focus/theme, and export actions under dedicated sections to reduce command-scanning time for first-time users.
- Added top-level export controls (`Export PNG`, `Export All`, and conditional `Cancel`) so export flow is discoverable without opening the inspector.

## 0.0.19 - 2026-03-01
- Replaced click-based screenshot reordering controls (`^` / `v`) in the left panel with drag-and-drop sorting on screenshot cards.
- Added direct reorder support in app state via `handleReorderScreenshot(sourceId, targetId)` for index-to-index moves.
- Added drop-target visual highlighting during drag to improve placement confidence in multi-screenshot projects.
- Verified behavior with a successful production build using `npm run build`.

## 0.0.17 - 2026-03-01
- Completed a design-system consistency pass in `src/components/ScreenshotEditor.jsx` by switching the screenshot delete action to the shared `Button` danger variant (`variant=\"danger\"`).
- Kept the existing centralized `Button/Input/Card` architecture intact and aligned destructive-action styling with the same semantic token usage.
- Verified the update with a successful production build using `npm run build`.

## 0.0.20 - 2026-03-01
- Simplified `LayerPanel` -> `Type Specific` section with progressive disclosure: advanced controls are now hidden by default and revealed via a dedicated toggle.
- Kept core controls immediately visible for fast edits, while moving secondary controls under `Show Advanced Controls` for `text`, `shape`, and `mockup` layers.
- Added automatic reset of advanced-panel state when switching selected layer/type, preventing carry-over clutter between editing contexts.
- Verified behavior with a successful production build using `npm run build`.

## 0.0.18 - 2026-03-01
- Modernized the main header in `ScreenshotEditor` with a clearer premium layout: identity block, grouped command clusters (`Edit/Project/View/Export`), and compact status pills.
- Introduced a refreshed header visual system in `src/index.css` with glass-style surface layering, stronger hierarchy, and polished micro-interactions for top-bar controls.
- Upgraded typography in the app shell to a `Manrope` + `Sora` pairing to improve product-level visual character and readability.
- Verified changes with a successful production build using `npm run build`.

## 0.0.20 - 2026-03-01
- Added production-ready background preset catalog in `src/constants.js` with quick options for solid, linear, and radial styles.
- Introduced full gradient-capable background model (`backgroundType`, `backgroundColor`, `backgroundColor2`, `backgroundAngle`) with backward-compatible defaults in `src/utils/screenshotHelpers.js`.
- Implemented shared background rendering engine in `src/utils/backgroundUtils.js` and applied it consistently to canvas preview (`CanvasStage`), screenshot thumbnails, and final PNG/ZIP export pipeline.
- Upgraded `ScreenshotEditor` background controls with type selector (`Solid`, `Linear`, `Radial`), secondary color + angle controls, and one-click preset chips for faster art direction.
- Updated layer contrast checks to evaluate against computed background contrast color so warnings remain meaningful when gradients are used.
- Verified end-to-end behavior with a successful production build using `npm run build`.

## 0.0.21 - 2026-03-01
- Modernized the main header in `ScreenshotEditor` with a clearer premium layout: identity block, grouped command clusters (`Edit/Project/View/Export`), and compact status pills.
- Introduced a refreshed header visual system in `src/index.css` with glass-style surface layering, stronger hierarchy, and polished micro-interactions for top-bar controls.
- Upgraded typography in the app shell to a `Manrope` + `Sora` pairing to improve product-level visual character and readability.
- Verified changes with a successful production build using `npm run build`.

## 0.0.26 - 2026-03-01
- Added reusable loading micro-interaction support to `src/components/ui/Button.jsx` with semantic `loading`/`loadingLabel` props, spinner rendering, and `aria-busy` feedback.
- Expanded interaction feedback in `src/index.css` with stronger `focus-visible` rings, hover/press motion for buttons, and reduced-motion safeguards for accessibility.
- Introduced animated micro-surface patterns: `interactive-card` (hover lift + focus-within highlight) and `surface-popover` (soft entry animation), then applied them in `ScreenshotEditor`, `LayerPanel`, and `CanvasStage`.
- Wired real loading states for export actions in top bar and inspector (`single`/`batch` mode aware) so users immediately see which operation is running.
- Verified all updates with a successful production build using `npm run build`.

## 0.0.21 - 2026-03-01
- Added a short canvas pulse highlight for selected layers in `CanvasStage` to improve selection clarity.
- Implemented a transient animated selection ring using the selected Konva node bounding box so users can instantly locate the active layer.
- Cleans up animation frame resources on selection changes/unmount to keep interactions smooth.
- Verified behavior with a successful production build using `npm run build`.

## 0.0.24 - 2026-03-01
- Refactored editor shell layout so the `Screenshots` panel is now a true left sidebar outside the center workspace flow, matching chat-style app structure.
- Moved header into the main content column (separate from left sidebar) and adjusted heading alignment for a more centered-leading composition.
- Updated responsive grid behavior: desktop now uses `left-sidebar + content` shell and `canvas + inspector` workspace columns for clearer visual hierarchy.
- Verified changes with a successful production build using `npm run build`.

## 0.0.25 - 2026-03-01
- Added robust UI state handling in `src/App.jsx` for `isBootstrapping`, `isProcessingImages`, `isLoadingProject`, and dismissible `uiError` messages.
- Replaced blocking alert-based failures with in-app error reporting for image import, single/batch export, project save, and project load.
- Added empty-state fallback in `src/components/ScreenshotEditor.jsx` for missing active screenshot data, including a direct `Create Screenshot` recovery action.
- Implemented skeleton loading UI in `ScreenshotEditor` (workspace skeleton, project-load skeleton, image-processing skeleton) to prevent “broken screen” perception during async operations.
- Added empty-project hint in the screenshot sidebar and synchronized error reset behavior when new operations start.
- Verified behavior with a successful production build using `npm run build`.

## 0.0.23 - 2026-03-01
- Added local autosave with debounced persistence (`1.2s`) using project serialization so editing progress is continuously protected.
- Added startup autosave recovery flow to restore the latest local project snapshot automatically when available.
- Added top-bar live status label showing relative save time (for example: `Last saved 10s ago`) and autosave error visibility when persistence fails.
- Verified behavior with a successful production build using `npm run build`.

## 0.0.24 - 2026-03-01
- Strengthened dark mode foundation in `src/index.css` with pure-black core tokens (`--bg: #000000`, `--panel: #050505`) and updated dark topbar/group/status surfaces for true black visual consistency.
- Applied component-level dark refinements in `ScreenshotEditor`, `LayerPanel`, `CanvasStage`, and shared `Input` styles by replacing gray translucent dark backgrounds with black-first surfaces and brighter high-contrast text.
- Improved dark-state clarity for warning/coaching/selection surfaces so emphasis remains visible on OLED-black backgrounds without muddy gray blending.

## 0.0.25 - 2026-03-01
- Built a unified workspace surface for the content column so header, toolbar/canvas area, and inspector now read as one connected hierarchy instead of isolated cards.
- Embedded the header into this shared surface (`topbar-modern--embedded`) with an internal divider, reducing visual fragmentation and improving flow from title to actions.
- Converted the main editor section to a primary in-surface section (`workspace-primary`) and tuned inspector surface styling (`inspector-shell`) to keep consistent depth levels.
- Reduced inter-section spacing and normalized panel rhythm in the content rail for a clearer parent-child UI structure.
- Verified updates with a successful production build using `npm run build`.

## 0.0.27 - 2026-03-01
- Added three one-click style packages (`Bold Launch`, `Minimal Clean`, `Gaming Neon`) and exposed them in the `More` menu under a dedicated `Style Packages` section.
- Implemented package application logic that updates active screenshot background + layer styling (text/image/shape/mockup) for immediate visual direction.
- Added starter composition generation for empty screenshots when a style package is applied, so first-time users get an instant, usable design baseline.
- Verified behavior with a successful production build using `npm run build`.

## 0.0.28 - 2026-03-01
- Investigated white-screen behavior and validated current `ScreenshotEditor` hook order against `HEAD` to confirm no net code drift in that file during diagnosis.
- Re-ran production build verification using `npm run build` while collecting stability context.

## 0.0.29 - 2026-03-01
- Added a global `AppErrorBoundary` (`src/components/AppErrorBoundary.jsx`) to prevent hard white-screen failures by rendering a recovery UI when runtime errors occur.
- Added one-click recovery actions (`Clear Autosave + Reload`, `Reload Only`) to quickly recover from local state/schema incompatibilities without manual storage cleanup.
- Wrapped `App` with `AppErrorBoundary` in `src/main.jsx` to enforce crash containment at the application root.
- Verified changes with a successful production build using `npm run build`.

## 0.0.31 - 2026-03-01
- Rebalanced desktop workspace widths to prioritize canvas area by reducing side panels approximately 20% in total (`left: 272px -> 218px`, `right: 344px -> 275px`).
- Updated layout fallbacks in `src/index.css` and synchronized editor/skeleton panel widths in `src/components/ScreenshotEditor.jsx` for consistent responsive behavior.
- Verified layout update with a successful production build using `npm run build`.

## 0.0.32 - 2026-03-01
- Fixed topbar flooding when the left screenshot panel is expanded by adding a conditional stacked-header mode in `src/components/ScreenshotEditor.jsx`.
- Added `topbar-modern--stacked` behavior in `src/index.css` to force single-column header flow and left-aligned controls under constrained workspace width.
- Improved control-wrap stability with `align-content: flex-start` for topbar control groups.
- Verified the update with a successful production build using `npm run build`.

## 0.0.33 - 2026-03-01
- Converted the editor shell into a single unified workspace frame so sidebar/content/inspector feel like one continuous app surface instead of separate cards.
- Added `app-shell-unified` styling in `src/index.css` with shared border, shared radius, and shared atmosphere layer, then removed independent card treatment from sidebar and main content wrappers.
- Replaced card-like separation inside the workspace with structural dividers (`sidebar right divider`, `inspector left divider`) and reduced internal grid gaps to improve Claude-style continuity.
- Added mobile-safe divider fallbacks for stacked layout (`sidebar bottom divider`, `inspector top divider`).
- Verified the update with a successful production build using `npm run build`.

## 0.0.34 - 2026-03-01
- Reduced internal corner radius across unified workspace components to remove floating-card feel and make UI surfaces look embedded.
- Added scoped geometry flattening under `app-shell-unified` in `src/index.css` for buttons, topbar groups/status chips, interactive cards, popovers, and common rounded utility blocks.
- Flattened embedded topbar corners and softened eyebrow chip radius for stronger single-surface continuity.
- Verified the update with a successful production build using `npm run build`.

## 0.0.35 - 2026-03-01
- Removed outer card framing to make the app feel truly embedded: set root shell padding to `0`, removed unified shell border/radius/shadow, and switched to full-bleed viewport layout.
- Updated desktop sidebar sticky height to `100vh` so panel behavior remains consistent after outer-frame removal.
- Preserved internal structure/dividers while eliminating the “website inside a website” perimeter effect.
- Verified the update with a successful production build using `npm run build`.

## 0.0.36 - 2026-03-01
- Fixed sidebar screenshot-card drag hint clipping by removing the narrow right-side `Drag` column and moving reorder guidance into the card metadata line.
- Improved left sidebar open/close smoothness by switching to animated content/rail transitions (`sidebar-panel-body` + `collapse-rail`) instead of hard content swapping.
- Added grid-column transition to `app-shell-modern` so sidebar width changes interpolate smoothly with content reflow.
- Verified the update with a successful production build using `npm run build`.

## 0.0.37 - 2026-03-01
- Increased canvas visual priority by enlarging preview sizing rules in `CanvasStage` (`width cap 480 -> 620`, `height budget floor 420 -> 560`, and less conservative viewport subtraction).
- Reduced non-canvas chrome spacing inside `CanvasStage` (container padding, label spacing, helper-text spacing, and nav chip offset) so more vertical space is dedicated to the editable canvas.
- Verified the update with a successful production build using `npm run build`.

## 0.0.38 - 2026-03-01
- Compacted the upper workspace area by roughly 30% to prioritize canvas space: reduced topbar padding/gaps, heading scale, metadata typography, action-group spacing, and status-chip sizing.
- Made the `Background` control strip denser in `ScreenshotEditor` by tightening section spacing, shrinking select/color controls, and switching key actions (`Upload`, `Add Text`, `Compare`, `Safe Area`, `More`) to `sm` button sizing.
- Added `topbar-status--error` truncation so long autosave errors no longer expand header height unexpectedly.
- Verified the update with a successful production build using `npm run build`.

## 0.0.39 - 2026-03-01
- Fixed inspector panel recoverability bug: after collapse, expand control now remains visible by applying `collapse-rail--visible` to the right panel in collapsed state.
- Updated right inspector to use the same animated body/rail visibility structure as the left sidebar, preventing “lost panel” state.
- Verified the fix with a successful production build using `npm run build`.
