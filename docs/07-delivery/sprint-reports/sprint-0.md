# Sprint 0 report: Discovery and foundations

**Goal:** a shared playbook and a working scaffold. **Result:** ✅ met.

## Role handoffs

### Handoff: Product Owner → Business Analyst

- Input: sponsor brief ("Artie, but for guitar"), sponsor decisions (PWA, rule-based coach, role-switching, name Strumly).
- Output: [charter](../../00-charter.md) with goals G1–G5 and MoSCoW scope.
- Open questions: none blocking. Copyrighted songs are explicitly out of scope.
- Next: BA writes the PRD and backlog.

### Handoff: UX Researcher → BA and UX Designer

- Input: public information on Artie, Yousician, Simply Guitar and Fender Play.
- Output: [competitive analysis](../../01-research/competitive-analysis.md). Key insight: detection trust is the #1 pain point.
- Next: personas and journeys, then design system.

### Handoff: Business Analyst → Architect, Educator, UX

- Output: [PRD](../../02-product/prd.md) (FR/NFR IDs), [personas](../../02-product/personas.md), [journeys](../../02-product/user-journeys.md), [backlog](../../02-product/backlog.md).

### Handoff: Audio/DSP Engineer → Architect

- Output: [audio research](../../01-research/audio-tech-research.md) and the [audio engine spec](../../04-architecture/audio-engine-spec.md). Proposed target-aware verification (ADR-0002, ADR-0003).

### Handoff: Architect → Frontend Dev and DevOps

- Output: [architecture](../../04-architecture/architecture.md), ADR-0001…0007, [content schema](../../04-architecture/content-schema.md).

### Handoff: Guitar Educator → Content Author and Coach Engineer

- Output: [curriculum](../../05-content/curriculum.md) (21 lessons, 9 songs) and coaching rules.

### Handoff: Legal → Content Author

- Output: [licensing](../../05-content/licensing.md). PD or traditional only, no lyrics.

### Handoff: DevOps → QA

- Output: Vite + React + TS scaffold, ESLint and Prettier, Vitest, CI (`ci.yml`), manual Pages deploy (`deploy.yml`), production CSP plugin, PWA manifest and service worker.

## Gates

- **Security:** production `npm audit` clean. Dev-only advisories accepted (R7). Arborist crash worked around (I2).
- **A11y:** plan written. Tokens chosen for contrast in both themes.
- **Legal:** content policy set.

## QA

`npm run check` passes: typecheck ✓, lint ✓, 1 smoke test ✓, build ✓ (69 KB gzip JS, SW generated).

## Retro

- 👍 Research front-loaded the main risk (detection trust) and shaped the architecture.
- 👎 Tooling churn (Vite 8 peers vs Vitest 4). Pin versions and keep the lockfile committed.
- ➡️ Sprint 1: prove the listening engine with benchmarks before building any UI on top of it.
