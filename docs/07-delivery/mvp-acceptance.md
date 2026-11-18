# MVP acceptance review

**Chaired by:** Product Owner · **Attended by (hats):** BA, Delivery Lead, Architect, DSP, QA, A11y, Security, Legal, DevOps, Tech Writer
**Build:** branch `ccr-7c43b1a1-kunrlh`, version 0.1.0 · **Decision:** ✅ **MVP accepted as a release candidate**, with the release conditions below.

## Acceptance checklist (from the approved plan)

| #   | Criterion                                                                                                   | Evidence                                                                                              | Result |
| --- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------ |
| 1   | Onboarding with mic permission and a tuning check                                                           | `onboarding.spec.ts`: welcome → level → guitar → hand → "Microphone working" → tuner offer            | ✅     |
| 2   | Tuner reads standard tuning within ±5 cents                                                                 | `tuner.test.ts` (E2 within 3 cents, flat and sharp signs, 500 ms hold), `tuner.spec.ts` (fake mic)    | ✅     |
| 3   | Learning path of about 20 lessons (orientation → melodies → Em/Am/D/G/C/E/A → strumming → changes → mini F) | 21 lessons in 5 units, `content.test.ts` (validated, chords covered), Home path with unlocks          | ✅     |
| 4   | Wait Mode and Play-along, tempo 50–100%, A–B loop, Listen, metronome                                        | `session.test.ts`, `session-audio.test.ts`, `lesson-mic.spec.ts`, Player screen                       | ✅     |
| 5   | Real-time hit/miss/early/late feedback and chord hints ("missing F♯, check string 1")                       | `scoring.test.ts`, `chords.test.ts`, `chords-am.spec.ts`                                              | ✅     |
| 6   | At least 6 public-domain songs                                                                              | 9 songs, provenance enforced by test, licensing log                                                   | ✅     |
| 7   | Results: accuracy, timing, stars, coach tips                                                                | `ResultsScreen`, `coach.test.ts`, `lesson-virtual.spec.ts` (coach tips shown)                         | ✅     |
| 8   | Progress, XP and streak saved locally                                                                       | `progress.test.ts` (IndexedDB store, streak across days, unlocks)                                     | ✅     |
| 9   | Left-handed, dark mode, offline, phone-responsive                                                           | `chordDiagram.test.tsx` (mirroring), a11y scans in both themes, `offline.spec.ts`, 390 px screenshots | ✅     |
| 10  | Detection: notes ≥95%, chords ≥90%, false accepts <5% (synthetic)                                           | Notes 100% (0% false accepts). Chords 100/100/91.7%, 2.3% false accepts                               | ✅     |

## Non-functional summary

| NFR                  | Result                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Performance          | 0.5 ms analysis per frame (budget 3 ms). 123 KB gzip JS (budget 250 KB)                         |
| Accessibility        | 0 serious or critical axe violations on 10 screens × 2 themes plus onboarding                   |
| Privacy and security | No network calls, mic released on exit, strict CSP, production audit clean, permissive licences |
| Offline              | Service-worker precache verified by an offline reload e2e                                       |

## Release conditions (must happen before a _public_ launch)

1. **D1 / R1: real-device test** by the sponsor: real guitar, phone and laptop, quiet and noisy rooms. Adjust the sensitivity presets in `sensitivity.ts` if needed.
2. **R2: iOS Safari check** of mic capture (processing may stay on). Use the _Easy_ preset if notes are missed.
3. **D2:** enable GitHub Pages (Settings → Pages → Source: GitHub Actions) and run the "Deploy to GitHub Pages" workflow. Optionally rename the repository to `strumly`.

## Known limitations (accepted for MVP)

- "X played when X7 expected" can be accepted for G7, E7 and A7. These chords are only in the library, not in any lesson.
- Strum _direction_ is shown but not verified. Only the chord and its timing are checked.
- Wrong-note collection in Play-along is limited to frames with an onset, so the fret-slip coaching mostly comes from Wait Mode.
- Header controls wrap under the title on very narrow phones (cosmetic).

## Roadmap (icebox, prioritised by PO)

1. Claude-powered coach behind `CoachProvider` (server proxy, opt-in, summary-only, ADR-0006).
2. Optional account and sync of progress.
3. Rhythm lessons with strum-direction detection. Barre chords. Alternate tunings.
4. Licensed contemporary songs. MIDI and USB guitar input. Practice reminders.
