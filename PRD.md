# Product Requirements Document (PRD)

## Product Name
App Store Screenshot Engine

## Version
v0.0.09 PRD baseline (February 27, 2026)

## 1. Purpose
App Store Screenshot Engine is a web-based creative production tool that helps teams design, manage, and export high-quality App Store screenshots quickly and consistently.

The product focuses on:
- Fast multi-screenshot editing.
- Structured layer-based composition.
- Deterministic export outputs for App Store submission workflows.
- Design flexibility (text, image, decorative visuals, and mockup-oriented composition support).

## 2. Problem Statement
Teams shipping mobile apps often build screenshots manually in general-purpose design tools. This creates:
- Slow repetitive production work.
- Inconsistent layout between screenshots.
- Export/package friction for localization and submission.
- Frequent QA loops due to dimensions, text overflow, and asset organization issues.

## 3. Goals
- Reduce screenshot production time for a full App Store set.
- Standardize output quality and dimensions.
- Minimize packaging mistakes across locales.
- Allow non-designer and designer personas to collaborate in one editing flow.

## 4. Non-Goals
- Full Photoshop/Figma replacement.
- Direct API submission to App Store Connect.
- Video or animated export.
- Multi-device export matrix in the current baseline (currently fixed to one preset).

## 5. Target Users
- Growth/design teams preparing release assets.
- Indie developers managing launch materials alone.
- Product marketing teams localizing screenshot sets.

## 6. Core User Stories
- As a creator, I can create and reorder multiple screenshots in one workspace.
- As a creator, I can upload PNG/JPG assets and place them precisely.
- As a creator, I can add styled text and tune typography.
- As a creator, I can add decorative layers for visual direction.
- As a creator, I can work with mockup-oriented composition layers.
- As a creator, I can export a single PNG or a full ZIP package by locale.
- As QA, I can detect text layers that exceed horizontal bounds before export.

## 7. Functional Requirements

### 7.1 Workspace and Screenshot Management
- System initializes with a minimum of 5 screenshots.
- User can add, duplicate, delete, and reorder screenshots.
- Active screenshot state is always maintained (fallback to existing screenshot on delete).

### 7.2 Layer System
- Layer types in scope:
- `text`
- `image`
- `shape` (decor presets: `orb`, `ring`, `pill`, `glow`)
- `mockup` (style presets and screen-content binding support)
- Per-layer controls:
- select/deselect
- visibility toggle
- reorder up/down
- delete
- drag/transform/rotate
- numerical property edits in inspector

### 7.3 Text Editing
- Add text layer with default typography baseline.
- Editable properties:
- content
- width
- font size
- font family (curated list)
- color
- alignment
- position and rotation

### 7.4 Image Editing
- Upload PNG/JPG via picker or drag-and-drop.
- Auto-fit initial placement based on device canvas.
- Editable properties:
- x, y, width, height, rotation
- visibility and ordering

### 7.5 Decorative Layer Editing
- Quick-add decor presets: orb, ring, pill, glow.
- Editable properties (contextual by style):
- primary/secondary color
- opacity
- blur
- stroke width (ring)
- corner radius (pill/glow)
- position, size, rotation

### 7.6 Mockup Layer Support
- Mockup layer entity is supported in product scope with style presets (`realistic`, `flat`, `rounded`).
- Mockup layer supports device frame-oriented properties (bezel, frame/accent/screen colors, corner radius, shadow).
- Mockup layer supports screen image assignment (`screenDataUrl`) for composition workflows.

### 7.7 Canvas and Interaction
- Canvas is rendered via Konva with responsive preview scaling.
- Direct manipulation:
- drag
- transform handles
- rotate
- click-to-select
- click background to clear selection
- Drop-zone interaction for asset upload.

### 7.8 Validation and Warnings
- Rule: text layers must remain within horizontal device bounds.
- Violations shown as compliance warnings in UI.

### 7.9 Export
- Single export: active screenshot -> PNG.
- Bulk export: all screenshots -> ZIP.
- Hard requirement: render at exact 1290 x 2796.
- Locale packaging structure:
- `Root/{locale}/6_7inch/screenshot_XX_6_7inch.png`
- Default locales:
- `en-US`
- `de-DE`
- `tr-TR`

### 7.10 Theme
- User can toggle dark/light mode.
- Theme preference is persisted in local storage.
- First load defaults to OS color scheme preference.

## 8. Non-Functional Requirements
- Performance: responsive interactions for typical screenshot set sizes.
- Deterministic output: same input state must produce same export dimensions and file naming.
- Reliability: export should fail with explicit error if target resolution constraints are violated.
- Usability: editing controls must be keyboard/mouse friendly with clear visual hierarchy.

## 9. Success Metrics (Initial)
- Time-to-first-export (TTFE) under 5 minutes for new users.
- Full 5+ screenshot set completion time reduced vs manual baseline.
- Export failure rate below 2%.
- Zero packaging-structure defects in QA checks.

## 10. Risks and Constraints
- Current device preset is fixed (single target resolution/device family).
- Large bundle size warning exists in build output and may impact initial load performance.
- Mockup capability requires continuous UX alignment to ensure complete end-user discoverability and parity across editing/export paths.

## 11. Roadmap Proposals
- Add multi-device presets and per-device export matrix.
- Add reusable templates and brand kits.
- Add project save/load and collaboration-ready file format.
- Add richer compliance rules (safe zones, contrast guidance, truncation checks).
- Add automated locale text variants and batch text replacement.

## 12. Acceptance Criteria (Baseline)
- User can manage multiple screenshots in one project.
- User can add/edit text, image, decor, and mockup-oriented layers.
- User can export active screenshot PNG and full ZIP package with locale structure.
- System enforces exact output resolution during export.
- User receives warnings for text overflow beyond horizontal bounds.
- Dark mode toggle and persistence work as expected.

