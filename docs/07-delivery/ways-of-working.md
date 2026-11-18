# Ways of working

**Owner:** Delivery Lead

## 1. Cadence

Six short sprints (0–5), each with: plan → role loop per story → QA → review (PO) → retro →
sprint report → commit and push.

## 2. The role loop (per story)

| Step | Role                          | Question the hat asks                             | Output                                               |
| ---- | ----------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| 1    | Product Owner                 | Is this the most valuable next thing?             | Priority in the backlog                              |
| 2    | Business Analyst              | Is it clear and testable?                         | Story plus ACs linked to FR/NFR                      |
| 3    | Educator / UX                 | Does it teach well? Is it usable?                 | Curriculum note and wireframe or design token update |
| 4    | Architect                     | Where does it live? Does it respect the layering? | Module placement, ADR if needed                      |
| 5    | Dev / DSP                     | Build it with tests                               | Code plus unit and accuracy tests                    |
| 6    | QA                            | Does it meet the ACs? Any regressions?            | Test results, defects                                |
| 7    | A11y / Security / Legal gates | Inclusive? Private? Clean IP?                     | Gate pass or fail noted in the sprint report         |
| 8    | Tech Writer                   | Are the docs current?                             | Docs and traceability updated                        |
| 9    | Delivery Lead                 | Done? Risks?                                      | Backlog status, RAID update                          |

**Working together:** decisions taken in one hat are written down (decision log or ADR) before
switching, so the next hat inherits context rather than re-deriving it. The traceability matrix
keeps requirements, stories and tests in sync.

## 3. Handoff note template

```
### Handoff: <from role> → <to role> (<story id>)
- Input: …
- Output: …
- Open questions / assumptions: …
- Next: …
```

## 4. Definition of Ready

Story has a user-value statement, testable ACs, linked requirement IDs, a known module location,
and no blocking dependency.

## 5. Definition of Done

1. ACs met and demonstrated (test or screenshot).
2. Unit and accuracy tests added and green. Benchmarks at target, or the gap is logged in RAID.
3. `npm run check` passes (typecheck, lint, test, build).
4. A11y: keyboard and labels checked. Feedback not colour-only.
5. Privacy: no new network calls. Legal: content provenance logged.
6. Docs, backlog status and traceability updated.
7. Committed and pushed to the working branch.

## 6. Branching and commits

Branch `ccr-7c43b1a1-kunrlh`. One or more commits per sprint, written as `sprint N: <summary>`.
No PR unless the sponsor asks.
