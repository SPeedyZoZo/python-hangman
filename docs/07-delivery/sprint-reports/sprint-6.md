# Sprint 6 report: Deployment and mobile-first optimisation

**Trigger:** the sponsor asked to "use computer use to open it and set it up on my computer", then to "optimise it for mobile devices over computers".
**Result:** ✅ mobile-first player and device integration shipped. GitHub Pages deployment prepared (it needs the sponsor to enable Pages).

## Role handoffs

### Handoff: Product Owner → DevOps

- Computer use and the user's computer aren't reachable from the cloud session. The sponsor chose hosting on GitHub Pages instead (D-020).
- DevOps verified the `/python-hangman/` sub-path build locally, then triggered `deploy.yml`. The build job passed on GitHub. Publishing returned 404 because Pages isn't enabled yet (DEF-22, D2).

### Handoff: Product Owner → Business Analyst → UX Designer

- Context: phone on a stand, hands busy, arm's-length reading. Recorded as FR-MOB-1…6 and stories S6-1…S6-6.
- The UX design is in the [design system §6](../../03-design/design-system.md) and [ADR-0008](../../04-architecture/adr/0008-mobile-first-player.md).

### Handoff: Architect → Frontend Developer

- `TabHighway` became height-aware. New hook `useWakeLock` / `useOnHidden`. iOS audio session in `AudioEngine`. Player restructured into header, status, highway, feedback, dock and More.

### Handoff: Frontend Developer → QA → Frontend Developer

- Screenshot measurements found the three-row dock on small phones (DEF-20). An accessibility-name check found DEF-19. The CI log found DEF-18. All were fixed with tests.

### Gates

- **A11y:** axe scans still pass in both themes. 44 px targets checked. Shortcuts implemented. ✅
- **Privacy:** Wake Lock and visibility APIs send nothing anywhere. ✅
- **Legal:** icons are derived from the project's own SVG. ✅

## Retro

- 👍 Measuring layouts (bounding boxes) instead of eyeballing turned "feels cramped" into numbers and tests.
- 👍 CI on GitHub caught a timing flake the local run had hidden.
- ➡️ Next: real-device testing on Android and iOS. Consider a compact highway in on-screen-guitar mode on small phones.
