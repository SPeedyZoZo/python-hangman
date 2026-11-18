# Sprint 5 report: Hardening and release

**Goal:** release-quality MVP. **Result:** ✅ **MVP accepted as a release candidate** (milestone M3). See the [acceptance review](../mvp-acceptance.md).

## Delivered

- Accessibility: axe-core scans of every screen in both themes. Two serious issues fixed.
- Offline PWA verified end to end. Manifest validated.
- Performance budget test for the analysis loop.
- CI: a new e2e job (Playwright plus fake mic) after the check job. The production audit gates CI.
- Docs: full README, [user guide](../../user-guide.md), MIT LICENSE, security audit and licence status, traceability completed, MVP acceptance review.

## Role handoffs

### Handoff: Accessibility Specialist → Frontend Developer

- DEF-14 and DEF-15 fixed. The scan is now a permanent regression test.

### Handoff: DevOps → Security

- CI runs `npm audit --omit=dev --audit-level=high` before anything else. Dev-only advisories stay accepted (R7).

### Handoff: Tech Writer → Product Owner

- The README states benchmark results honestly, labelled as synthetic, with real-device testing called out.

### Handoff: Product Owner → Sponsor

- MVP accepted. Release conditions: real-device test (D1), iOS Safari check (R2), enable Pages (D2).

## Project retro (all sprints)

- 👍 **Measure, then tune:** benchmark-driven DSP took chord accepts from 67% to 100% and caught the X/X7 harmonic trap.
- 👍 **One analysis path for Node and the browser** let a fake-mic e2e and Node pipeline tests exercise the real code.
- 👍 **Role loop with written handoffs:** decisions (D-001…D-017) and defects (DEF-1…17) are all traceable.
- 👎 Prettier reflow broke scripted doc and code edits twice. ➡️ Assert edit targets exist.
- 👎 Synthetic audio saturates the note benchmarks. ➡️ Next: record a small real-guitar fixture set (with consent) for regression tests.
