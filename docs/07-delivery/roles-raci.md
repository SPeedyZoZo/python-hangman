# Roles and RACI

**Owner:** Delivery Lead. One agent performs every role in turn (role-switching, see [ways of working](ways-of-working.md)).

## Roles

| #   | Role                             | Mission                               | Key artefacts                                     |
| --- | -------------------------------- | ------------------------------------- | ------------------------------------------------- |
| 1   | Product Owner / PM               | Maximise learner value and own scope  | Charter, backlog priority, acceptance             |
| 2   | Business Analyst                 | Turn needs into testable requirements | PRD, stories and ACs, journeys, traceability      |
| 3   | Delivery Lead / Scrum Master     | Flow, cadence, risk, transparency     | Delivery plan, RAID, decision log, sprint reports |
| 4   | Solution Architect               | Coherent, evolvable technical design  | Architecture, ADRs                                |
| 5   | UX Researcher                    | Evidence about users and competitors  | Competitive analysis, personas, heuristic review  |
| 6   | UX/UI and Brand Designer         | Usable, delightful, on-brand UI       | Design system, wireframes, icon                   |
| 7   | Guitar Educator                  | Effective learning progression        | Curriculum, coaching rules                        |
| 8   | Music Content Author             | Correct, playable content             | Lesson and song data, provenance                  |
| 9   | Audio / DSP Engineer             | Reliable listening                    | Audio spec, analysis modules, benchmarks          |
| 10  | Frontend Developer               | Working, fast, maintainable app       | `src/**`                                          |
| 11  | AI / Coaching Engineer           | Helpful, specific feedback            | Coach interface, rule engine, Claude-coach spec   |
| 12  | QA / Test Automation             | Confidence to ship                    | Test strategy, suites, QA reports                 |
| 13  | Accessibility Specialist         | Inclusive experience                  | A11y plan, audits                                 |
| 14  | Security and Privacy Officer     | Safe and private by design            | Privacy, security, CSP, dependency audit          |
| 15  | Legal / Licensing                | Clean IP                              | Licensing and provenance                          |
| 16  | DevOps / Release                 | Repeatable builds and releases        | CI, deploy workflow, versioning                   |
| 17  | Technical Writer                 | Clear docs for users and contributors | README, user guide, CLAUDE.md                     |
| 18  | Data / Analytics                 | Local metrics that drive coaching     | SessionSummary design, progress metrics           |
| 19  | Backend Engineer _(post-MVP)_    | Claude proxy, sync                    | (not exercised in MVP)                            |
| 20  | Growth / Marketing _(post-MVP)_  | Acquisition and retention             | (not exercised in MVP)                            |
| 21  | Support / Community _(post-MVP)_ | Help users and gather feedback        | (not exercised in MVP)                            |

## RACI (R = responsible, A = accountable, C = consulted, I = informed)

| Deliverable           | PO  | BA  | DL  | Arch | UXR | UXD | Edu | Cont | DSP | FE  | Coach | QA  | A11y | Sec | Legal | Ops | TW  | Data |
| --------------------- | --- | --- | --- | ---- | --- | --- | --- | ---- | --- | --- | ----- | --- | ---- | --- | ----- | --- | --- | ---- |
| Charter and scope     | A/R | C   | C   | C    | C   | I   | C   | I    | I   | I   | I     | I   | I    | I   | I     | I   | I   | I    |
| PRD and stories       | A   | R   | C   | C    | C   | C   | C   | I    | C   | C   | C     | C   | C    | C   | I     | I   | I   | C    |
| Sprint plan and RAID  | C   | C   | A/R | C    | I   | I   | I   | I    | C   | C   | I     | C   | I    | C   | I     | C   | I   | I    |
| Architecture and ADRs | C   | I   | I   | A/R  | I   | C   | I   | I    | C   | C   | C     | C   | I    | C   | I     | C   | I   | I    |
| Design system and UI  | C   | C   | I   | C    | C   | A/R | C   | I    | I   | C   | I     | I   | C    | I   | I     | I   | I   | I    |
| Curriculum            | C   | C   | I   | I    | C   | C   | A/R | R    | C   | I   | C     | I   | I    | I   | C     | I   | I   | I    |
| Lesson and song data  | I   | I   | I   | C    | I   | I   | A   | R    | I   | C   | I     | C   | I    | I   | C     | I   | I   | I    |
| Audio engine          | I   | C   | I   | C    | I   | I   | C   | I    | A/R | C   | I     | C   | I    | C   | I     | I   | I   | I    |
| App implementation    | C   | C   | I   | C    | I   | C   | I   | I    | C   | A/R | C     | C   | C    | C   | I     | C   | I   | I    |
| Coach                 | C   | C   | I   | C    | I   | C   | C   | I    | I   | C   | A/R   | C   | I    | C   | I     | I   | I   | C    |
| Tests and QA reports  | I   | C   | I   | C    | I   | I   | I   | I    | C   | C   | C     | A/R | C    | C   | I     | C   | I   | I    |
| A11y audit            | I   | I   | I   | I    | I   | C   | I   | I    | I   | C   | I     | C   | A/R  | I   | I     | I   | I   | I    |
| Privacy and security  | C   | I   | I   | C    | I   | I   | I   | I    | C   | C   | C     | C   | I    | A/R | C     | C   | I   | C    |
| Licensing             | C   | I   | I   | I    | I   | I   | C   | C    | I   | I   | I     | I   | I    | I   | A/R   | I   | I   | I    |
| CI/CD and deploy      | I   | I   | C   | C    | I   | I   | I   | I    | I   | C   | I     | C   | I    | C   | I     | A/R | I   | I    |
| Docs and README       | C   | C   | C   | C    | I   | I   | I   | I    | I   | C   | I     | I   | I    | I   | I     | I   | A/R | I    |
