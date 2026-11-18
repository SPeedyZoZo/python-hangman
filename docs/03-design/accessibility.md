# Accessibility plan (WCAG 2.2 AA)

**Owner:** Accessibility Specialist

## Checklist

| Area                     | Requirement                             | How we meet it                                                                                                            |
| ------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Contrast                 | Text ≥4.5:1, UI ≥3:1                    | Tokens chosen and verified in both themes                                                                                 |
| Not colour alone (1.4.1) | Hit, miss and timing feedback           | ✓/✗/◷ glyphs plus text labels. String lanes have letter labels                                                            |
| Keyboard (2.1.1)         | Everything operable without a pointer   | Native buttons and links. Player shortcuts: Space (pause), W (mode), ←/→ (tempo), L (listen)                              |
| Focus (2.4.7, 2.4.11)    | Visible and not obscured                | 3 px accent outline with offset. Bottom nav doesn't cover focused items                                                   |
| Target size (2.5.8)      | ≥24 px (we aim for 44 px)               | `--touch: 44px` minimum on controls                                                                                       |
| Names (4.1.2)            | Accessible names and roles              | aria-labels on icon buttons, `role="meter"` on the level meter, the SVG highway has `role="img"` plus a live text summary |
| Live updates (4.1.3)     | Status messages                         | "Heard" indicator and step results via a throttled `aria-live="polite"` region                                            |
| Motion (2.3.3)           | Respect reduced motion                  | Hit animations disabled under `prefers-reduced-motion`                                                                    |
| Audio                    | Mic explained, reference audio optional | Permission explainer. Visual metronome flash in addition to the click                                                     |
| Handedness               | Mirror diagrams and fretboard           | Settings → Left-handed                                                                                                    |

## Audit method

`@axe-core/playwright` on every route in the e2e suite (fails on serious or critical violations),
plus a manual keyboard pass recorded in the Sprint 5 QA report.
