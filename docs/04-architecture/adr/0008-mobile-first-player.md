# ADR-0008: Mobile-first player layout and device integration

- **Status:** Accepted (Sprint 6) · **Deciders:** Sponsor ("optimise it for mobile devices over computers"), UX/UI Designer, Solution Architect, Frontend Developer

## Context

Learners hold a guitar with both hands. The device is usually a phone propped 30–60 cm away. The
Sprint 2 player was a long scrolling page designed at phone width, but it wasn't designed for that
context. Controls were spread out, the highway had a fixed small size, and the screen could sleep
mid-lesson.

## Decision

1. **Layout:** the player is a full-height flex column on phones (CSS grid in phone landscape). The highway card takes the free space. `TabHighway` measures its container and scales lane height (28–48 px), gem size and beat spacing. Its SVG is absolutely positioned so it never forces the layout taller, which keeps it stable on rotation.
2. **Controls:** a sticky bottom **dock** within thumb reach holds the most-used controls (mode, tempo, Listen, Loop, More). Everything else moves to a **More** panel.
3. **Device APIs:** Screen Wake Lock while listening, practising or tuning. Auto-pause on `visibilitychange` → hidden. iOS `audioSession.type = 'play-and-record'` where supported.
4. **Install:** PNG and maskable icons plus an apple-touch-icon (rendered from the SVGs), iOS standalone meta tags, and a `theme-color` per scheme that follows the user's theme setting.
5. **Touch:** `touch-action: manipulation`, no selection or callouts on playing surfaces, `overscroll-behavior: none`, safe-area padding.

## Consequences

- ✓ One-screen practice verified at 375×667 portrait and 852×393 landscape (e2e). Bigger, readable lanes on larger phones.
- ✓ Desktop still works (same column, capped widths). Keyboard shortcuts now implemented.
- ✗ On-screen-guitar mode on small phones needs scrolling (highway plus fretboard don't fit together). The dock stays sticky. Acceptable for a fallback mode.
- ✗ Wake Lock isn't available on every browser (it fails silently). The iOS audio session needs a real-device check (R2).
