# Sprint 2 report: Practice engine

**Goal:** the core learning loop for single notes, in Wait Mode and play-along. **Result:** ✅ met, with scope pulled forward from Sprint 4.

## Delivered

- `music/tab.ts`: tab DSL parser with bars, durations, rests and strum directions. `music/chords.ts`: 12-chord library with fingerings.
- `content/`: types, validator and the **full curriculum (21 lessons, 5 units) and 9 public-domain songs** (pulled forward from Sprint 4; the Delivery Lead accepted this because the content is data and unblocks demos).
- `practice/session.ts`: pure state machine covering Wait Mode, play-along, demo (Listen), tempo, A–B loop, pause and latency calibration. `practice/matcher.ts`, `practice/scoring.ts` (grades, accuracy, stars, XP, `SessionSummary`).
- `audio/synth/render.ts`: exercise renderer for "Listen" and the metronome click. `audio/analysis/chordVerifier.ts` (benchmarked in Sprint 3).
- `progress/`: IndexedDB-persisted bests, XP, streak and practice time, plus unlock logic (pulled forward from Sprint 4).
- UI: `TabHighway` (ref-driven 60 fps scroll), `Fretboard` (virtual input), `ChordDiagram`, `Stars`. Screens: **Home learning path**, **Player**, **Results**, **Songs**.
- `CoachProvider` interface (ADR-0006) with a placeholder provider. The rule-based coach comes in Sprint 4.

## Role handoffs

### Handoff: Guitar Educator → Content Author

- Input: [curriculum](../../05-content/curriculum.md). Output: `src/content/lessons.ts` and `songs.ts`.
- Legal gate: every song carries a public-domain provenance string. The test enforces it, and there are no lyrics.

### Handoff: Architect → Dev

- The session is pure and driven by `tick(now, frame)`. Frames come from `useListening`. The highway reads a position ref (no per-frame React renders).

### Handoff: Dev → QA → Dev (defect loop)

- The pipeline test found DEF-4 and the UX review found DEF-5. Both were fixed the same sprint, with regression tests.

### Handoff: UX Designer → Accessibility

- Feedback line uses `role="status"` with an icon, text and colour. The mode switch is a radiogroup. The fretboard buttons have full names ("String 1 (e), open: E4"). Locked lessons explain how to unlock them.

## Retro

- 👍 The Node pipeline test (audio → analyzer → session) is the most valuable test in the repo. It found a bug no unit test would.
- 👍 Pulling content forward de-risked Sprint 4.
- 👎 Wait Mode semantics (when may a note be played?) were under-specified in the PRD. ➡️ The BA added the "arm 1 beat ahead" rule to the audio spec.
- ➡️ Sprint 3: chord benchmarks, Chord library and Check-my-chord, and the strum lessons verified end to end.
