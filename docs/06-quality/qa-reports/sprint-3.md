# QA report: Sprint 3 (Chords and strumming)

## Benchmarks (synthetic strums, 12 library chords)

| Suite                          | Before tuning                | After tuning                                          | Target  |
| ------------------------------ | ---------------------------- | ----------------------------------------------------- | ------- |
| Accept, down-strum             | 66.7% (Em, G, E, A rejected) | **100%**                                              | ≥90% ✅ |
| Accept, up-strum               | 66.7%                        | **100%**                                              | ≥90% ✅ |
| Accept, 20 dB noise            | 66.7%                        | **91.7%** (G rejected once)                           | ≥90% ✅ |
| False accept (132 wrong pairs) | 3.0%                         | **2.3%** (Em→E7, E→E7, A→A7)                          | <5% ✅  |
| Missing tone (D without F♯)    | accepted ❌                  | **rejected, with hint "F♯ is quiet: check string 1"** | ✅      |

## Pipeline and e2e

| Test                                                                     | Result                                           |
| ------------------------------------------------------------------------ | ------------------------------------------------ |
| Play-along chord changes G–C–D–Em (synthetic audio → session)            | ✅ 5/5 perfect                                   |
| Wait Mode: Am strummed when Em expected                                  | ✅ 1 wrong attempt, then Em accepted             |
| E2E: Em lesson via fake mic (`strum-em.wav`)                             | ✅ completes                                     |
| E2E: Check my chord (Em)                                                 | ✅ "Sounds like Em!"                             |
| E2E: Check my chord with Am audio                                        | ✅ "Not quite…" plus a hint                      |
| E2E: Em lesson with Am audio                                             | ✅ "Not quite Em" and the lesson doesn't advance |
| Component: ChordDiagram a11y name, left-handed mirroring, finger numbers | ✅                                               |

## Defects

| ID     | Sev | Description                                                                                                    | Fix                                                              |
| ------ | --- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| DEF-7  | S2  | Plain chroma cosine confused X and X7 (the 7th harmonic is the ♭7)                                             | Band-limited chroma, note-level discrimination                   |
| DEF-8  | S2  | Chords judged during the strum (low strings only) gave false accepts                                           | 120 ms settle                                                    |
| DEF-9  | S2  | A chord missing a tone (D without F♯) was accepted                                                             | Tone-presence check                                              |
| DEF-10 | S1  | A Prettier-reflowed signature made a scripted edit silently fail, which a unit test caught as a ReferenceError | Fixed. Process: scripted edits now assert the target text exists |

## Known limitation

The remaining false accepts are "X played when X7 is expected". No lesson uses E7, A7 or G7, so
they only affect "Check my chord" for those three chords (RAID R3).
