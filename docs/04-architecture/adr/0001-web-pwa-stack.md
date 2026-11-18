# ADR-0001: Web PWA with React, TypeScript and Vite

- **Status:** Accepted (Sprint 0) · **Deciders:** Solution Architect, Product Owner, sponsor

## Context

We need mic access, a fast iteration loop, phone reach and the ability to build and test fully in
a Linux cloud container. The repo was an empty Python placeholder.

## Decision

A client-only PWA: React 19, TypeScript 5.9 (strict), Vite 7, vite-plugin-pwa, react-router (HashRouter), zustand.

## Consequences

- ✓ One codebase for phone and desktop, installable, offline, no app-store review.
- ✓ Fully testable here: Vitest for the pure domain, Playwright with a fake mic for e2e.
- ✗ Browser audio processing varies (Safari). Mitigated in ADR-0002 and ADR-0003.
- ✗ No native low-latency audio. Acceptable for the beginner tempos (≤120 bpm) we use.
- Alternatives considered: Python desktop (no phone reach, can't test the mic here), Expo/React Native (needs devices and Xcode to test audio).
