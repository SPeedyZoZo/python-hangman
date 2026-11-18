# ADR-0007: Custom SVG tab highway instead of a notation library

- **Status:** Accepted · **Deciders:** UX/UI Designer, Frontend Developer

## Decision

Render a custom SVG "tab highway" (6 lanes, gems, chord bars, a fixed hit line). The scroll
position is applied through a ref-held `transform` every animation frame.

## Consequences

- ✓ Small (no notation library), designed for Wait Mode and timing feedback, and easy to theme and mirror.
- ✗ No standard notation or Guitar Pro import. Revisit (for example with alphaTab) if we add imported songs.
