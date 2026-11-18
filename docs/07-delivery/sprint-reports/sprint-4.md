# Sprint 4 report: Coach, onboarding and settings

**Goal:** a motivating, guided first-run experience and specific coaching. **Result:** ✅ met. (Curriculum, songs, progress and the learning path were delivered early in Sprint 2.)

## Delivered

- **RuleBasedCoach** (`src/coach/`): 9 rules from the Educator's table, with priorities and the top 3 shown on Results. Finger-specific advice for missing chord tones ("press your second (middle) finger firmly at fret 2 on string 1").
- **Ask the coach**: an offline FAQ of 14 topics with a keyword matcher, suggested questions and links to the relevant screens. Reached from Home.
- **Onboarding**: welcome, level, guitar, hand, mic check (live meter, "Microphone working", on-screen fallback), then a tuner offer. First launch is gated. Returning players get every lesson unlocked.
- **Settings**: handedness, unlock all, sensitivity, latency calibration, on-screen guitar, metronome, theme, note labels, progress and reset (with confirmation), re-run setup, about and privacy.
- `CoachProvider` swap point documented for a future Claude coach (ADR-0006).

## Role handoffs

### Handoff: Guitar Educator → AI/Coaching Engineer

- Input: the coaching-rules table in [curriculum.md](../../05-content/curriculum.md). Output: `rules.ts`, one rule per row, unit-tested.
- Open question → PO: should the Claude coach (post-MVP) also generate tips, or only answer questions? Logged for the roadmap.

### Handoff: UX Designer → Frontend Developer

- Onboarding copy puts the privacy promise in bold before the permission prompt (trust before asking).

### Handoff: Security and Privacy Officer → Tech Writer

- The privacy notice text in Settings matches `docs/08-ops/privacy.md`.

### Handoff: QA → Dev

- DEF-11 to DEF-13 fixed in-sprint.

## Retro

- 👍 A custom Playwright fixture made "skip onboarding" one line per test.
- 👍 The coach's rules read like the Educator's table, so content experts can review them.
- ➡️ Sprint 5: offline PWA check, axe accessibility scan of every screen, performance, README and user guide, deploy workflow check, PO acceptance.
