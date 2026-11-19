# Sprint 7 report: Mobile extras and going live

**Trigger:** the sponsor re-requested mobile optimisation, picked three extra improvements, and enabled GitHub Pages.
**Result:** ✅ live on GitHub Pages. All three improvements shipped and tested.

## Delivered

- **Live site:** the publish job re-ran successfully, so https://speedyzozo.github.io/python-hangman/ is serving the Sprint 6 build. Sprint 7 is deployed at the end of this sprint.
- **On-screen guitar fits one screen** (FR-MOB-7): only the needed input, a trimmed fretboard, a compact highway, and an adaptive dock.
- **Full screen and haptics** (FR-MOB-8/9): `src/app/device.ts`, a header toggle, and a Settings switch. Haptics are never used in mic mode.
- **Faster first load** (ADR-0009): lazy screens, idle prefetch, a vendor chunk, and a CI size budget. 123 KB → 93 KB gzip.

## Role handoffs

### Handoff: Product Owner → DevOps

- Sponsor confirmed Pages is on. DevOps re-ran only the failed publish job (artifact reused): success. D2 is closed in RAID and the MVP acceptance.

### Handoff: UX Designer → Frontend Developer → QA

- Budget per screen size worked out first (375×667 needs about 610 px). QA screenshots found DEF-23 (dock overflow), which was fixed and is now guarded by stricter tests.

### Handoff: Audio/DSP Engineer → UX Designer

- Vibration motors are audible to a phone mic, so haptics stay off whenever the microphone listens (D-025).

### Handoff: Architect → DevOps

- `npm run size` joins the CI check job. The budget is in `scripts/check-size.ts` (env `SIZE_BUDGET_KB`).

### Gates

- **A11y:** axe scans unchanged and green. Icon-only buttons keep their names. ✅
- **Privacy:** no new network calls. Fullscreen and vibration are local APIs. ✅

## Retro

- 👍 Re-running only the failed publish job published in seconds.
- 👎 A layout test that checked only heights missed a width overflow. ➡️ Fit tests now check both axes.
