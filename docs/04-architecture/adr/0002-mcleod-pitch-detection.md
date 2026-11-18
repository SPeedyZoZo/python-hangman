# ADR-0002: McLeod Pitch Method (pitchy) for single notes

- **Status:** Accepted · **Deciders:** Audio/DSP Engineer, Solution Architect

## Decision

Use `pitchy` (MPM, MIT) on 2048-sample windows with a clarity gate, a 70–1000 Hz clamp and 3-frame
median smoothing. Matching is target-aware (we check the expected MIDI, not open recognition).

## Consequences

- ✓ Small, fast and robust on low strings. The clarity score gives a natural confidence gate.
- ✗ Monophonic only. Chords use ADR-0003.
- Alternatives: YIN (pitchfinder) is a fallback if benchmarks fail. ML models are too heavy for MVP.
