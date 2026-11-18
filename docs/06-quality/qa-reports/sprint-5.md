# QA report: Sprint 5 (Hardening and release)

## Full regression

| Suite                                                             | Result                                                                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check` (typecheck, lint, unit and accuracy tests, build) | ✅                                                                                                                                     |
| Unit and accuracy                                                 | ✅ 100 tests in 16 files                                                                                                               |
| E2E (`npm run e2e`)                                               | ✅ **30/30**: 19 axe scans, coach, on-screen lesson, offline and manifest, chord accept and reject (×4), mic lesson, onboarding, tuner |

## New in Sprint 5

| Area          | Test                                                                                | Result         |
| ------------- | ----------------------------------------------------------------------------------- | -------------- |
| Accessibility | `a11y.spec.ts`: 9 routes × dark and light, plus onboarding                          | ✅ after fixes |
| Offline       | `offline.spec.ts`: SW controls the page, offline reload of Home, Songs and a lesson | ✅             |
| Install       | Manifest has name, short_name, standalone display and icons                         | ✅             |
| Performance   | `perf.test.ts`: about 0.5 ms per frame with chroma                                  | ✅             |
| Licences      | Production tree: MIT and Apache-2.0 only                                            | ✅             |
| Audit         | `npm audit --omit=dev`: 0 vulnerabilities                                           | ✅             |

## Defects

| ID     | Sev       | Description                                                                               | Fix                                          |
| ------ | --------- | ----------------------------------------------------------------------------------------- | -------------------------------------------- |
| DEF-14 | S2 (a11y) | Locked lesson rows at 60% opacity failed text contrast                                    | Dashed border style, full-opacity muted text |
| DEF-15 | S2 (a11y) | Chord tiles' `aria-label` didn't include their visible text (label-content-name-mismatch) | Decorative diagram plus a visible-text name  |
| DEF-16 | S3        | The e2e tsconfig lacked DOM types for in-page `evaluate`                                  | Added DOM libs                               |
| DEF-17 | S3        | axe-core's Playwright `Page` type differs from 1.63's                                     | Typed cast at the boundary                   |

## Open (release conditions, see the MVP acceptance review)

Real-device accuracy (R1/D1) and iOS Safari capture behaviour (R2) can't be tested in the cloud container.
