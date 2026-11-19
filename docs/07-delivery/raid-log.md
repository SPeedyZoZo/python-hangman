# RAID log (Risks, Assumptions, Issues, Dependencies)

**Owner:** Delivery Lead · Probability (P) and Impact (I): L, M or H

## Risks

| ID  | Risk                                                              | P   | I   | Mitigation                                                                                                                                                                                            | Owner | Status                                   |
| --- | ----------------------------------------------------------------- | --- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------- |
| R1  | Real-guitar detection is worse than the synthetic benchmarks      | M   | H   | Target-aware matching, sensitivity presets, "heard" indicator, latency calibration, real-device test before public launch                                                                             | DSP   | Open: release gate D1 (real-device test) |
| R2  | Safari ignores raw-audio constraints (AGC and filters)            | H   | M   | Judge on onsets and the first 150 ms. Lenient presets. Test on iOS                                                                                                                                    | DSP   | Open                                     |
| R3  | Chords with shared tones are confused (X vs X7, E vs Em)          | M   | M   | Note-level discrimination (ADR-0003 amendment). Confusion benchmark at 2.3% false accepts. The remaining confusions (X played when X7 expected) only affect chords in the library that no lesson uses | DSP   | Mitigated                                |
| R4  | Copyright exposure through songs                                  | L   | H   | PD or traditional only, no lyrics, provenance log                                                                                                                                                     | Legal | Mitigated                                |
| R5  | Mic permission denied, so the app looks broken                    | M   | M   | On-screen guitar fallback, onboarding explainer, MicNotice messages per failure reason                                                                                                                | UXD   | Mitigated                                |
| R6  | Scope creep (copying a large commercial app)                      | M   | M   | MoSCoW scope in the charter. Icebox                                                                                                                                                                   | PO    | Open                                     |
| R7  | Dev-tool dependency advisories (glob, minimatch, picomatch ReDoS) | L   | L   | Dev-only, not shipped. Production audit is clean. Re-check each sprint                                                                                                                                | Sec   | Accepted                                 |

## Assumptions

| ID  | Assumption                                                                   |
| --- | ---------------------------------------------------------------------------- |
| A1  | Standard tuning (EADGBE) only for MVP                                        |
| A2  | Learners use an acoustic or an amplified electric guitar near the device mic |
| A3  | Beginner tempos (≤120 bpm) make browser audio latency acceptable             |

## Issues

| ID  | Issue                                                                               | Resolution                                   |
| --- | ----------------------------------------------------------------------------------- | -------------------------------------------- |
| I1  | The repo was empty (no Python code to reuse)                                        | Greenfield build in the same repo (ADR-0001) |
| I2  | npm arborist crashed while resolving Vite 8's optional devtools peers with Vitest 4 | Forced a single `vite` via `overrides`       |

## Dependencies

| ID  | Dependency                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------- |
| D1  | The sponsor tests on a real guitar and phone before any public launch                                         |
| D2  | GitHub Pages enabled by the sponsor (Sprint 7). Live at https://speedyzozo.github.io/python-hangman/ (closed) |
