# QA report: Sprint 7 (Mobile extras and going live)

## Automated results

| Suite                      | Result                                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`            | ✅ 100 unit and accuracy tests, typecheck, lint, build                                                                             |
| `npm run size`             | ✅ first-screen JS 93.4 KB gzip (budget 100 KB, was 123 KB)                                                                        |
| E2E (`npm run e2e`)        | ✅ **44/44** (37 existing plus 7 new)                                                                                              |
| New: on-screen guitar fits | ✅ 375×667 and 852×393, note and chord lessons: no vertical or horizontal scroll, input and dock controls in view, highway ≥140 px |
| New: haptics               | ✅ tap vibrates, and the Settings switch turns it off                                                                              |
| New: fullscreen            | ✅ the button calls `requestFullscreen` and shows "Exit full screen" pressed                                                       |

## Deployment

- Re-ran the failed publish job after the sponsor enabled Pages: ✅ **success**. The site is live at https://speedyzozo.github.io/python-hangman/.
- This container (and its fetch agent) can't reach github.io because of network policy. The live check relies on the successful `deploy-pages` run, and the local sub-path smoke test from Sprint 6 (all routes, SW scope, no errors).

## Defects

| ID     | Sev     | Description                                                                                                                                          | Fix                                                                                                           |
| ------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| DEF-23 | S2 (UX) | The one-row icon dock overflowed sideways on 375 px phones in on-screen guitar mode (Loop and More cut off). The first fit test only checked heights | Compact dock only at ≥480 px. The fit test now checks horizontal overflow and every dock control's right edge |

## Manual follow-ups

Real-device check of vibration (Android only; iOS Safari doesn't support `navigator.vibrate`) and of
the fullscreen bars on Android Chrome.
