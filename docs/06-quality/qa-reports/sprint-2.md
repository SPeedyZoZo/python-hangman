# QA report: Sprint 2 (Practice engine)

**Role:** QA / Test Automation Engineer

## Automated results

| Suite                                                                                             | Result                                                                                                                                     |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit (theory, tab DSL, content validator, session state machine, scoring, progress, tuner, synth) | ✅ 63 passing                                                                                                                              |
| Accuracy: notes, onsets (from Sprint 1)                                                           | ✅ unchanged                                                                                                                               |
| **Pipeline: synthetic audio → FrameAnalyzer → PracticeSession**                                   | ✅ play-along on time: 12/12 _perfect_. Wait Mode with irregular gaps: 12/12 first-try hits. Wrong notes counted (2) and recorded (F4, E4) |
| E2E: tuner (fake mic)                                                                             | ✅                                                                                                                                         |
| E2E: Lesson 1 in Wait Mode via fake mic (`pluck-e4.wav`)                                          | ✅ finishes with ★★★ at 100% in about 22 s, and "Next lesson" opens Lesson 2                                                               |
| E2E: Lesson 1 via the on-screen guitar (mic off)                                                  | ✅                                                                                                                                         |
| Content validation (21 lessons, 9 songs)                                                          | ✅ 0 errors                                                                                                                                |

## Defects found and fixed this sprint

| ID    | Sev | Found by             | Description                                                                                            | Fix                                                                |
| ----- | --- | -------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| DEF-3 | S2  | Content validator    | Chord token regex swallowed the strum suffix (`Emv` read as an unknown chord)                          | Strict chord-name grammar                                          |
| DEF-4 | S2  | Pipeline test        | Wait Mode counted the _previous_ note's pluck as a wrong attempt on the next step (60 ms grace window) | Consumed onsets can't be wrong attempts                            |
| DEF-5 | S3  | UX screenshot review | Wait Mode accepted plucks for notes still far off the hit line, so ✓ marks appeared far ahead          | A step only listens within 1 beat of the hit line. Unit test added |
| DEF-6 | —   | Test bug             | An early-hit unit test used an onset time not on the 16 ms frame grid                                  | Aligned                                                            |

## UX review (screenshots, 390×844, dark theme)

Home (continue card, path, locks, stars), lesson intro (tip cards), player (heard indicator,
highway with ✓ glyphs, Wait Mode feedback line, controls) and results (stars, accuracy, XP,
streak, breakdown) all render correctly. Follow-ups for Sprint 5: the header controls wrap below
the title on narrow phones, and the breakdown grid has small icons.

## Performance

Production JS bundle: 113 KB gzip (budget 250 KB, NFR-PERF-2).
