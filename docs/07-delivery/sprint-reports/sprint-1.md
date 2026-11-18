# Sprint 1 report: Audio core and tuner

**Goal:** prove the listening engine before building on it. **Result:** ✅ met (milestone M1).

## Delivered

- `music/theory.ts`: midi↔Hz↔names, standard tuning, fret→midi, positions, nearest string.
- `audio/synth/karplusStrong.ts`: tuned Karplus-Strong (all-pass fractional delay, under 2 cents error), strums, noise, and `wav.ts`.
- `audio/analysis/`: radix-2 FFT, McLeod pitch tracker with median smoothing, diff-RMS onset detector, chroma (ready for Sprint 3), `FrameAnalyzer`, `TunerModel`, sensitivity presets.
- `audio/AudioEngine.ts`: reference-counted mic, synthetic injection, speaker playback, and the ctx↔performance clock mapping.
- App shell: HashRouter, tab layout, bottom nav, icon set, buttons, settings store, and the **Tuner** screen with reference tones.
- `scripts/gen-fixtures.ts` and the Playwright fake-mic harness.

## Role handoffs

### Handoff: Audio/DSP Engineer → QA

- Output: analysis modules and benchmark suites (`tests/accuracy`).
- Open question: real-device accuracy (R1). The synth is a stand-in.
- Next: QA ran the benchmarks and the e2e test (see the [QA report](../../06-quality/qa-reports/sprint-1.md)).

### Handoff: Architect → Frontend Developer

- Decision: settings in localStorage (synchronous) and progress in IndexedDB. ADR-0005 amended.
- Decision: the analysis loop runs on `requestAnimationFrame` and React updates are throttled to about 30 fps.

### Handoff: UX Designer → Accessibility Specialist

- The tuner status uses text and an icon, not only colour. The level meter has `role="meter"`. The dial has an accessible name ("E2, 0 cents").

## Gates

- **Privacy:** the mic only opens on a click in a listening screen, and tracks are stopped when the last user releases them. ✅
- **Security:** no new production dependencies. ✅
- **A11y:** labels and live status in place. Full axe scan in Sprint 5.

## Retro

- 👍 Testing through the _same_ analysis code in Node and the browser paid off at once: the e2e passed first time.
- 👎 Synthetic benchmarks are saturated at 100%, so they can't separate good settings from great ones. ➡️ Sprint 3 adds chord-confusion tests, which are harder.
- ➡️ Sprint 2: content DSL, practice session state machine, tab highway, Wait Mode.
