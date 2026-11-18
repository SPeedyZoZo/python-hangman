# ADR-0004: Content as validated data with a compact tab DSL

- **Status:** Accepted · **Deciders:** Solution Architect, Content Author, Guitar Educator

## Decision

Lessons and songs are TypeScript data modules in `src/content`. Exercises use the tab DSL. A
validator runs in unit tests (and therefore CI), so bad content can't ship.

## Consequences

- ✓ Authoring is fast and reviewable in diffs. Content is bundled (works offline).
- ✓ The same exercise can be rendered, synthesised (Listen) and scored.
- ✗ Updating content needs a deploy. Fine for MVP. A remote content pack is a future option.
