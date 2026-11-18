# Traceability matrix (requirement → story → test)

**Owner:** QA Engineer with Business Analyst. Updated every sprint.

| Requirement                  | Story            | Test(s)                                                                                                                               | Status |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-DET-1, NFR-ACC-1          | S1-1, S1-2       | `tests/unit/theory.test.ts`, `tests/accuracy/notes.test.ts`                                                                           | ☑      |
| FR-DET-3                     | S1-6             | `tests/accuracy/onset.test.ts`                                                                                                        | ☑      |
| FR-TUN-1/2                   | S1-3             | `tests/unit/tuner.test.ts`, `tests/e2e/tuner.spec.ts`                                                                                 | ☑      |
| FR-TUN-3                     | S1-4             | `tests/unit/synth.test.ts`                                                                                                            | ☑      |
| NFR-LEGAL-1                  | S2-1, S4-1, S4-2 | `tests/unit/tab.test.ts`, `tests/unit/content.test.ts`                                                                                | ☑      |
| FR-PLY-2                     | S2-3             | `tests/unit/session.test.ts` (wait), `tests/accuracy/session-audio.test.ts`, `tests/e2e/lesson-mic.spec.ts`                           | ☑      |
| FR-PLY-3                     | S2-4             | `tests/unit/session.test.ts` (play), `tests/unit/scoring.test.ts`                                                                     | ☑      |
| FR-PLY-4/5                   | S2-5             | `tests/unit/session.test.ts` (tempo, loop)                                                                                            | ☑      |
| FR-PLY-6                     | S2-6             | `tests/unit/synth.test.ts` (renderExercise)                                                                                           | ☑      |
| FR-RES-1/3                   | S2-7             | `tests/unit/scoring.test.ts`                                                                                                          | ☑      |
| FR-ONB-4, FR-SET-3           | S2-8             | `tests/e2e/lesson-virtual.spec.ts`                                                                                                    | ☑      |
| FR-DET-2, NFR-ACC-1          | S3-1             | `tests/accuracy/chords.test.ts`, `tests/accuracy/session-audio.test.ts`, `tests/e2e/chords-em.spec.ts`, `tests/e2e/chords-am.spec.ts` | ☑      |
| FR-DET-4                     | S3-2             | `tests/accuracy/chords.test.ts` (missing tone), `tests/e2e/chords-am.spec.ts`                                                         | ☑      |
| FR-CHD-1, FR-SET-1           | S3-3             | `tests/unit/chordDiagram.test.tsx`                                                                                                    | ☑      |
| FR-RES-2                     | S4-5             | `tests/unit/coach.test.ts`                                                                                                            | ☑      |
| FR-RES-4                     | S4-6             | `tests/unit/coach.test.ts` (FAQ), `tests/e2e/coach.spec.ts`                                                                           | ☑      |
| FR-PRG-1/2                   | S4-3             | `tests/unit/progress.test.ts`                                                                                                         | ☑      |
| FR-LRN-3                     | S4-4             | `tests/unit/progress.test.ts` (unlock)                                                                                                | ☑      |
| FR-ONB-1…3                   | S4-7             | `tests/e2e/onboarding.spec.ts`                                                                                                        | ☑      |
| FR-SET-*, FR-DET-5, FR-PRG-3 | S4-8             | `tests/e2e/onboarding.spec.ts` (settings persisted), manual review                                                                    | ☑      |
| NFR-A11Y-1                   | S5-2             | `tests/e2e/a11y.spec.ts`                                                                                                              | ☐      |
| NFR-OFF-1                    | S5-1             | build output check (`dist/sw.js`, manifest)                                                                                           | ☐      |
