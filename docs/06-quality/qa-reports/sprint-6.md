# QA report: Sprint 6 (Mobile-first optimisation and deployment)

## Automated results

| Suite                                                    | Result                                                                                                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`                                          | ✅ 100 unit and accuracy tests, typecheck, lint, build                                                                                       |
| E2E (`npm run e2e`)                                      | ✅ **37/37** (30 existing plus 7 new mobile tests)                                                                                           |
| New: `mobile-layout.spec.ts`                             | ✅ player fits 375×667 portrait and 852×393 landscape with no page scroll, highway ≥170 px                                                   |
| New: `mobile.spec.ts`                                    | ✅ wake lock requested and released · auto-pause on hide · PNG and maskable icons plus apple-touch-icon · 44 px targets · keyboard shortcuts |
| Overflow sweep (10 routes × 320 and 375 px)              | ✅ no horizontal overflow                                                                                                                    |
| Sub-path build (`BASE_PATH=/python-hangman/`) smoke test | ✅ all routes render, SW scope `/python-hangman/`, no console or network errors                                                              |

## Measured layouts (player, chord lesson, mic mode)

| Viewport          | Highway height                              | Dock height | Page scroll |
| ----------------- | ------------------------------------------- | ----------- | ----------- |
| iPhone SE 375×667 | 280 px (was 228 before the dock fix)        | 120 px      | none        |
| Pixel 7 412×915   | 380 px (lanes capped at 48 px)              | 120 px      | none        |
| Landscape 852×393 | 220 px (side panel for feedback and chords) | 60 px       | none        |

## Defects

| ID     | Sev       | Description                                                                                                                             | Fix                                       |
| ------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| DEF-18 | S2 (CI)   | Flaky `lesson-virtual` e2e: the last tap navigated to Results mid-click and the click waited forever (failed on GitHub, passed locally) | Short click timeout tolerated in the loop |
| DEF-19 | S3 (a11y) | Visually-hidden label suffix produced the accessible name "Play -along"                                                                 | Explicit `aria-label` on the mode radios  |
| DEF-20 | S3        | Dock wrapped to 3 rows on small phones                                                                                                  | Short "Wait" / "Play" labels below 420 px |
| DEF-21 | S3        | The a11y plan promised keyboard shortcuts that were never implemented                                                                   | Implemented and tested                    |
| DEF-22 | —         | First Pages deploy failed: Pages not enabled (expected, sponsor action D2)                                                              | Sponsor enables Pages, then redeploy      |

## Still manual (release conditions)

Real-device checks on Android Chrome and iOS Safari: mic capture, wake lock, the audio session and the install flow (R1, R2).
