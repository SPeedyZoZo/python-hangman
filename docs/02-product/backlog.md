# Product backlog

**Owner:** Product Owner (priority) · Business Analyst (stories and acceptance criteria) · Delivery Lead (status)

Status: ☐ To do · ◐ In progress · ☑ Done. Story format: _As a … I want … so that …_.
Acceptance criteria (AC) are written as Given/When/Then shorthand.

## Epic E0: Foundations (Sprint 0)

| ID   | Story                                                                                        | AC                                                 | Req       | Status |
| ---- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------- | ------ |
| S0-1 | As the team, we want a documented playbook so that every role works from one source of truth | Docs index plus all docs in `docs/README.md` exist | —         | ☑      |
| S0-2 | As a developer I want a scaffolded Vite + React + TS app with lint, typecheck, tests and CI  | `npm run check` passes locally and in CI           | NFR-SEC-1 | ☑      |

## Epic E1: Audio core and tuner (Sprint 1)

| ID   | Story                                                                                 | AC                                                                                                         | Req                 | Status |
| ---- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------- | ------ |
| S1-1 | As a developer I want music-theory utilities (midi↔Hz↔name, tunings, fret→midi)       | Unit tests cover all strings, frets 0–24, and round trips                                                  | FR-DET-1            | ☑      |
| S1-2 | As a learner I want the app to hear single notes accurately                           | Benchmark ≥95% across strings 1–6, frets 0–12, with noise and detune                                       | FR-DET-1, NFR-ACC-1 | ☑      |
| S1-3 | As a learner I want a tuner so my guitar is in tune before practice                   | Shows note, string and cents. "In tune" within ±5 cents held 0.5 s. E2e: fake-mic E2 reads "E" on string 6 | FR-TUN-1, FR-TUN-2  | ☑      |
| S1-4 | As a learner I want to hear reference tones                                           | Tapping a string plays a synthesised pluck at the right pitch                                              | FR-TUN-3            | ☑      |
| S1-5 | As a developer I want a synthetic guitar (Karplus-Strong) and a WAV fixture generator | `npm run fixtures` writes WAVs. The synth is used by tests and "Listen"                                    | —                   | ☑      |
| S1-6 | As a learner I want each new pluck to count separately                                | Onset detector fires once per pluck (±1) on a pluck-train fixture                                          | FR-DET-3            | ☑      |

## Epic E2: Practice engine (Sprint 2)

| ID   | Story                                                                | AC                                                                                    | Req                | Status |
| ---- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------ | ------ |
| S2-1 | As a content author I want a compact tab DSL and a content validator | Invalid strings, frets or chords fail validation with a clear message                 | NFR-LEGAL-1        | ☑      |
| S2-2 | As a learner I want a tab highway that shows what to play next       | Six lanes, fret-numbered gems, chord bars, hit line, smooth 60 fps transform          | FR-PLY-1           | ☑      |
| S2-3 | As a learner I want Wait Mode                                        | The highway halts at each target and advances only on a correct, freshly plucked note | FR-PLY-2           | ☑      |
| S2-4 | As a learner I want play-along with timing judgement                 | Perfect ≤80 ms, good ≤160 ms, early or late ≤300 ms, otherwise miss                   | FR-PLY-3           | ☑      |
| S2-5 | As a learner I want tempo and loop controls                          | Tempo 50–100%. A–B bar loop repeats until turned off                                  | FR-PLY-4, FR-PLY-5 | ☑      |
| S2-6 | As a learner I want to hear the exercise first                       | "Listen" plays the synthesised exercise and detection pauses meanwhile                | FR-PLY-6           | ☑      |
| S2-7 | As a learner I want a results screen                                 | Stars, accuracy, breakdown, XP and actions                                            | FR-RES-1, FR-RES-3 | ☑      |
| S2-8 | As a learner without a guitar I want an on-screen fretboard          | Tapping a fret injects a synthetic pluck through the analysis path                    | FR-ONB-4, FR-SET-3 | ☑      |
| S2-9 | As a learner I want a metronome and count-in                         | Click per beat, accented downbeat, one count-in bar                                   | FR-PLY-7           | ☑      |

## Epic E3: Chords and strumming (Sprint 3)

| ID   | Story                                                           | AC                                                                               | Req                 | Status |
| ---- | --------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------- | ------ |
| S3-1 | As a learner I want my chords verified                          | Benchmark ≥90% correct accepts and <5% false accepts across the chord library    | FR-DET-2, NFR-ACC-1 | ☑      |
| S3-2 | As a learner I want to know which note is missing from my chord | Removing one string's note from a synthetic strum yields a hint naming that note | FR-DET-4            | ☑      |
| S3-3 | As a learner I want chord diagrams                              | Fingers, open (○) and muted (×) strings, mirrored in left-handed mode            | FR-CHD-1, FR-SET-1  | ☑      |
| S3-4 | As a learner I want a chord library with "Check my chord"       | Live verification on the detail screen                                           | FR-CHD-2            | ☑      |
| S3-5 | As a learner I want to see the next chord coming                | Upcoming-chord diagram at least 1 beat ahead                                     | FR-PLY-9            | ☑      |

## Epic E4: Curriculum, progress and coach (Sprint 4)

| ID   | Story                                            | AC                                                                | Req                          | Status |
| ---- | ------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------- | ------ |
| S4-1 | As a learner I want a guided curriculum          | About 20 lessons in 5 units, validated                            | FR-LRN-2, FR-LRN-4           | ☑      |
| S4-2 | As a learner I want public-domain songs          | At least 6 songs with provenance logged                           | FR-SNG-1, FR-SNG-2           | ☑      |
| S4-3 | As a learner I want my progress saved            | Stars, best accuracy, XP and streak persist across reloads        | FR-PRG-1, FR-PRG-2           | ☑      |
| S4-4 | As a learner I want a learning path with unlocks | Home path. Next lesson unlocks at 1★                              | FR-LRN-1, FR-LRN-3           | ☑      |
| S4-5 | As a learner I want specific coaching tips       | Rule engine returns 1–3 relevant tips, unit-tested per rule       | FR-RES-2                     | ☐      |
| S4-6 | As a learner I want to ask common questions      | Offline FAQ matches keywords to answers                           | FR-RES-4                     | ☐      |
| S4-7 | As a new user I want onboarding                  | Level, guitar type, handedness, mic check, tuner offer            | FR-ONB-1…3                   | ☐      |
| S4-8 | As a learner I want settings                     | Handedness, theme, labels, sensitivity, latency, fretboard, reset | FR-SET-*, FR-DET-5, FR-PRG-3 | ☐      |

## Epic E5: Hardening and release (Sprint 5)

| ID   | Story                                                       | AC                                                                            | Req                          | Status |
| ---- | ----------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------- | ------ |
| S5-1 | As a learner I want it to work offline and be installable   | The service worker precaches the app shell and content. The manifest is valid | NFR-OFF-1                    | ☐      |
| S5-2 | As a learner using assistive tech I want an accessible app  | axe: no serious or critical violations on every screen                        | NFR-A11Y-1, NFR-A11Y-2       | ☐      |
| S5-3 | As the team we want end-to-end tests with a fake microphone | Tuner, Wait Mode and chord accept/reject e2e tests pass                       | FR-TUN-1, FR-PLY-2, FR-DET-2 | ☐      |
| S5-4 | As the sponsor I want a deployable build and docs           | Pages workflow, README, user guide, privacy and security docs                 | NFR-PRIV-1, NFR-SEC-1        | ☐      |
| S5-5 | As the PO I want an MVP acceptance review                   | Checklist signed off in the Sprint 5 report                                   | all                          | ☐      |

## Icebox (post-MVP)

Claude-powered conversational coach (ADR-0006) · accounts and sync · MIDI and USB input · more
songs (licensed) · rhythm-only lessons with strum-direction detection · alternate tunings · barre
chords · practice reminders (notifications) · localisation.
