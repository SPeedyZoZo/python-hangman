# Test strategy

**Owner:** QA / Test Automation Engineer

## Test pyramid

| Level                   | Tool                                                                                      | Scope                                                                                            | Runs in                        |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------ |
| Unit                    | Vitest (node)                                                                             | music theory, tab parser, content validator, scoring, session state machine, coach rules, stores | `npm test`, CI                 |
| **Accuracy benchmarks** | Vitest (node) plus the Karplus-Strong synth                                               | pitch, onset and chord verification over the full populations in the audio spec                  | `npm test`, CI                 |
| Component               | Vitest plus Testing Library (jsdom, opt-in per file)                                      | ChordDiagram, Stars, the TabHighway render contract                                              | `npm test`                     |
| End-to-end              | Playwright 1.63 (preinstalled Chromium) with a fake mic from generated WAVs plus axe-core | tuner, Wait Mode lesson, chord accept and reject, every route a11y-scanned                       | `npm run e2e`                  |
| Manual                  | Real guitar plus phone                                                                    | real-world accuracy, latency feel, Safari quirks                                                 | Sponsor, before public release |

## Entry and exit criteria

- **Entry (story):** meets the Definition of Ready (see ways of working).
- **Exit (sprint):** all new ACs have tests. `npm run check` is green. Benchmarks meet targets or a RAID entry explains the gap. QA report written.

## Fake-mic e2e technique

Chromium flags: `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream
--use-file-for-fake-audio-capture=<wav>`. Chromium loops the WAV, so fixtures are designed to be
loop-safe (for example a repeated pluck every 0.8 s).

## Defect severity

S1: crash or blocks a core journey · S2: wrong feedback (false reject or false accept) · S3:
cosmetic or minor. S1 and S2 block release.
