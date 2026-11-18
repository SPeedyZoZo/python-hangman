# ADR-0005: Local-first persistence (IndexedDB) with no accounts

- **Status:** Accepted · **Deciders:** Solution Architect, Security and Privacy Officer

## Decision

Use zustand `persist` with an idb-keyval (IndexedDB) storage adapter, falling back to localStorage.
There are no accounts and no server.

## Consequences

- ✓ Private, offline and instant. ✗ Progress doesn't sync across devices (roadmap: optional sync).
- Stored data: settings, per-lesson bests, XP, streak and practice minutes. **Never audio.**
