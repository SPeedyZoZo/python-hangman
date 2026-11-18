# ADR-0006: CoachProvider interface, rule-based now and Claude-ready

- **Status:** Accepted · **Deciders:** AI/Coaching Engineer, Product Owner, sponsor

## Decision

```ts
interface CoachProvider {
  id: string;
  getTips(summary: SessionSummary, ctx: CoachContext): Promise<CoachTip[]>;
  ask(question: string, ctx: CoachContext): Promise<CoachAnswer>;
}
```

The MVP ships `RuleBasedCoach`: deterministic rules over `SessionSummary`, plus an offline FAQ
matched on keywords. Screens depend only on the interface, through `useCoach()`.

## Future: Claude coach (not in MVP)

- A `ClaudeCoach` implements the same interface and calls a small server-side proxy (it must **not** ship an API key to the browser).
- It sends only the `SessionSummary` (no audio) plus the question. It uses a current Claude model, a system prompt with the curriculum context, and short answers.
- Falls back to `RuleBasedCoach` when offline or on error.

## Consequences

- ✓ The MVP needs no key or backend. ✓ Swapping providers is a one-line change.
