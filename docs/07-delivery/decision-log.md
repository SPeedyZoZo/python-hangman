# Decision log

**Owner:** Delivery Lead · Architectural decisions link to ADRs.

| #     | Date     | Decision                                                                                  | By (role)          | Ref                  |
| ----- | -------- | ----------------------------------------------------------------------------------------- | ------------------ | -------------------- |
| D-001 | Sprint 0 | Product name **Strumly**. Original brand, not a clone of Artie                            | Sponsor, PO        | Charter              |
| D-002 | Sprint 0 | Web PWA (React, TS, Vite)                                                                 | Sponsor, Architect | ADR-0001             |
| D-003 | Sprint 0 | Rule-based coach in MVP behind `CoachProvider`. Claude later                              | Sponsor, Coach Eng | ADR-0006             |
| D-004 | Sprint 0 | One agent switching roles (no parallel subagents)                                         | Sponsor, DL        | Ways of working      |
| D-005 | Sprint 0 | pitchy (MPM) for notes                                                                    | DSP                | ADR-0002             |
| D-006 | Sprint 0 | Chord _verification_ with harmonic templates                                              | DSP                | ADR-0003             |
| D-007 | Sprint 0 | Content as validated TS data with a tab DSL                                               | Architect          | ADR-0004             |
| D-008 | Sprint 0 | IndexedDB local-first, no accounts                                                        | Architect, Sec     | ADR-0005             |
| D-009 | Sprint 0 | Custom SVG tab highway                                                                    | UXD, FE            | ADR-0007             |
| D-010 | Sprint 0 | Public-domain songs only, melody and chords, no lyrics                                    | Legal              | licensing.md         |
| D-011 | Sprint 0 | Vitest 4 (fixes tinypool and mocker advisories). `vite` overridden to a single version    | Sec, Ops           | RAID I2, R7          |
| D-012 | Sprint 0 | HashRouter for static hosting                                                             | Architect          | architecture.md      |
| D-013 | Sprint 1 | Settings in localStorage (sync), progress in IndexedDB                                    | Architect          | ADR-0005 (amended)   |
| D-014 | Sprint 2 | Full curriculum, songs and progress store pulled forward from Sprint 4                    | DL, PO             | Sprint 2 report      |
| D-015 | Sprint 2 | Wait Mode arms a step 1 beat before the hit line                                          | BA, DSP            | audio-engine-spec §3 |
| D-016 | Sprint 3 | Chroma band 60–800 Hz, linear magnitude; templates 8 harmonics at decay 0.9 (grid search) | DSP                | audio spec §2        |
| D-017 | Sprint 3 | Chord verification adds a settle time, tone presence and note-level rival discrimination  | DSP, Architect     | ADR-0003 amendment   |
