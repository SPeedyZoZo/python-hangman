# QA report: Sprint 4 (Coach, onboarding and settings)

## Automated results

| Suite                                                                                                                                                                                                                                                                                     | Result                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Unit total                                                                                                                                                                                                                                                                                | ✅ 99 passing (15 files) |
| Coaching rules (fret slip, wrong string, rushing and dragging, late changes, missing tone with finger advice, ready for more, struggling, tuning, encourage, priority ordering)                                                                                                           | ✅                       |
| FAQ matcher (8 paraphrased questions → correct topic, fallback, data integrity)                                                                                                                                                                                                           | ✅                       |
| E2E (9 tests): onboarding (fresh user → welcome → returning, electric, left-handed → mic check "Microphone working" → Home with all lessons unlocked, settings persisted), Ask the coach, on-screen-guitar lesson with coach tips on results, plus all earlier mic, chord and tuner tests | ✅ 9/9                   |

## UX review (light theme, 390×844)

Onboarding, the mic check, Settings, Ask the coach, play-along and results with coach tips were all reviewed.

| ID     | Sev | Finding                                                                                   | Fix                                      |
| ------ | --- | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| DEF-11 | S3  | Back button and title wrapped onto separate lines on phones (Coach, Chord detail, Player) | `.title-row` (no wrap, shrinkable title) |
| DEF-12 | S3  | Light theme: pale lane colours (yellow D lane) on a white surface                         | Darker light-theme string tokens         |
| DEF-13 | S3  | Lint false positive: the React hooks rule flagged Playwright's fixture `use()`            | Renamed the fixture callback             |

## Notes

- E2E tests seed `onboarded: true` through a custom Playwright fixture. `onboarding.spec.ts` opts out with `fresh: true`.
- Play-along with consistently wrong notes produces "struggling" tips before "fret slip" tips, which is the intended priority. Wrong-note collection in play-along is limited to frames with an onset.
