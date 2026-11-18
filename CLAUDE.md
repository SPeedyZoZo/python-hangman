# CLAUDE.md — working agreement for Strumly

Strumly is a guitar-learning Progressive Web App (PWA). It listens to the learner through the
microphone and gives real-time feedback. It has a **Wait Mode** (the music holds until you play the
right note or chord), a play-along mode with tempo control and looping, a guided curriculum, a
public-domain song library, a tuner and a rule-based coach.

> The repository is called `python-hangman` for historical reasons. It was empty and has been
> repurposed. The product name is **Strumly**.

## Commands

| Task                    | Command                                        |
| ----------------------- | ---------------------------------------------- |
| Install                 | `npm install`                                  |
| Dev server              | `npm run dev` (mic needs `localhost` or HTTPS) |
| Type-check              | `npm run typecheck`                            |
| Lint                    | `npm run lint`                                 |
| Unit and accuracy tests | `npm test`                                     |
| Build                   | `npm run build`                                |
| Everything CI runs      | `npm run check`                                |
| Generate WAV fixtures   | `npm run fixtures`                             |
| End-to-end (fake mic)   | `npm run e2e`                                  |

Playwright is pinned to **1.63.0** to match the browser preinstalled in the cloud container. Do
not run `playwright install`.

## Where things live

- `docs/`: the project playbook. Start at `docs/README.md`.
- `src/music`: pure music theory (notes, tunings, chord shapes, the tab DSL).
- `src/audio`: the audio engine (browser) and `analysis/` (pure DSP: pitch, chroma, onset, chord verification).
- `src/practice`: the pure practice-session state machine and scoring.
- `src/content`: curriculum and songs as data, plus the validator.
- `src/coach`: `CoachProvider` interface and `RuleBasedCoach`.
- `src/progress`, `src/settings`: persisted zustand stores.
- `src/ui`: reusable components. `src/screens`: routed pages.
- `tests/unit`, `tests/accuracy` (detector benchmarks on synthetic guitar audio), `tests/e2e` (Playwright with a fake microphone).

## Engineering rules

1. **Domain logic stays pure.** `music/`, `audio/analysis/`, `practice/`, `content/` and `coach/` must not import React or touch the DOM, so they run under Node in tests.
2. **Imports use explicit extensions** (`./theory.ts`). Only erasable TypeScript syntax is allowed (no `enum`, no parameter properties), so Node can run scripts with type stripping.
3. **Content is data.** Lessons and songs live in `src/content/**` and must pass `validateContent()`. Songs must be public domain or traditional, **melody and chords only, no lyrics**, and each one must be logged in `docs/05-content/licensing.md`.
4. **Audio never leaves the device.** No network calls with audio or analysis data. See `docs/08-ops/privacy.md`.
5. **Feedback never depends on colour alone.** Always pair colour with an icon or shape and text.
6. Every change that alters behaviour must update the relevant doc and the traceability matrix.

## Role-switch protocol (how this project is run)

One agent wears every project hat in turn. For each backlog story, run the loop in
`docs/07-delivery/ways-of-working.md`:

`PO → BA → Educator/UX → Architect → Dev/DSP → QA → A11y/Security/Legal → Tech Writer → Delivery Lead`

Write a short handoff note (input → output → open questions → next role) in the sprint report
whenever the hat changes. Record decisions in `docs/07-delivery/decision-log.md` (and as an ADR
when they are architectural), and risks and issues in `docs/07-delivery/raid-log.md`.

## Definition of Done (summary)

Acceptance criteria met · tests added and green · `npm run check` passes · docs and traceability
updated · a11y checked · no new production audit findings · committed and pushed to the working branch.
