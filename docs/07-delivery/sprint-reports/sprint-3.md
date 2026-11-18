# Sprint 3 report: Chords and strumming

**Goal:** trustworthy chord verification and the chord experience. **Result:** ✅ met (milestone M2: core loop works for notes and chords).

## Delivered

- Chord verification v2: band-limited chroma, richer templates, a strum settle time, tone presence, note-level rival discrimination with harmonic-leak modelling, and better hints.
- Sensitivity presets extended (discrimination, absent and presence thresholds).
- **Chords** tab: a grid of diagrams. **Chord detail**: notes, tip, Listen, and live **Check my chord** (mic or on-screen strums).
- Player: "Now / Next" chord diagrams (FR-PLY-9) and chord-specific feedback with hints.
- Tests: chord benchmark suite, chord pipeline tests, ChordDiagram component tests, and 4 chord e2e tests.

## Role handoffs

### Handoff: QA → Audio/DSP Engineer

- The benchmark showed 67% accepts and X/X7 confusions. A debug probe confirmed that the high-harmonic smear and the 7th harmonic were to blame.

### Handoff: Audio/DSP Engineer → Architect

- Proposed a band-limited chroma and note-level discrimination. Accepted and recorded as the ADR-0003 amendment and D-016/D-017.

### Handoff: Architect → Dev → QA

- `matchTarget` gained a `msSinceOnset` argument for the chord settle time. The session passes it through.

### Handoff: Guitar Educator → AI/Coaching Engineer

- Chord hints ("F♯ is quiet: check string 1") feed the Sprint 4 coaching rule "Missing tone".

### Gates

- **A11y:** chord diagrams have full text alternatives. The verdict is `role="status"` with an icon and text. ✅
- **Privacy:** Check my chord uses the same reference-counted mic, released when leaving the screen. ✅

## Retro

- 👍 Measuring before tuning (benchmark, then debug probe, then grid search) turned a vague "chords are hard" into a precise fix.
- 👎 A scripted multi-line edit silently missed after Prettier reflowed the code. ➡️ Scripted edits now assert their target exists.
- ➡️ Sprint 4: rule-based coach, Ask-the-coach FAQ, onboarding and settings.
