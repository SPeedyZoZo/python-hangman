# ADR-0009: Route-level code splitting, idle prefetch and a first-screen size budget

- **Status:** Accepted (Sprint 7) · **Deciders:** Sponsor ("faster load on mobile data"), Solution Architect, DevOps, Frontend Developer

## Context

Up to Sprint 6 the app shipped as one 377 KB (123 KB gzip) script. The first screen (Home) needs
none of the audio engine, DSP, synthesiser or other screens, yet a phone on mobile data downloaded
and parsed all of it before anything appeared.

## Decision

1. Every screen except **Home** is loaded with `React.lazy`, through a small `lazyScreen()` helper (`src/app/lazyScreen.ts`) that also exposes `preload()`. A `<Suspense>` fallback ("Loading…", `role="status"`) sits inside each layout, so the bottom nav stays put.
2. After the first paint, `requestIdleCallback` (or a timer) **prefetches** the Player, Tuner and Results chunks, so the first tap feels instant.
3. React, React DOM and React Router go into a long-cached `vendor-react` chunk.
4. `build.manifest: true`, and `scripts/check-size.ts` (`npm run size`, run in CI) fails the build if the first screen's JavaScript (entry plus its static imports) exceeds **100 KB gzip**.
5. The Workbox precache still lists every chunk, so offline use is unchanged. This is verified by `offline.spec.ts`.

## Consequences

- ✓ First-screen JS **93 KB gzip** (−24%). 17 on-demand chunks total 37 KB.
- ✓ CI guards against regressions.
- ✗ On a first visit with a very slow connection, a screen can briefly show "Loading…". The prefetch and SW precache make that rare.
- Next lever: the router (~20 KB gzip) could be replaced by a tiny hash router if the budget gets tight.
