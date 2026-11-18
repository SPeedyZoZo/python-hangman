# ADR-0003: Verify expected chords with harmonic-aware chroma templates

- **Status:** Accepted · **Deciders:** Audio/DSP Engineer, Guitar Educator

## Context

Open polyphonic recognition in the browser is unreliable or heavy. The app always knows which chord it expects.

## Decision

Compute chroma from our own FFT. Compare it with an expected-chroma template synthesised from the
actual voicing (fundamentals plus decaying harmonics). Accept on an absolute threshold **and** a
margin over every other library chord. Derive missing-tone hints from per-pitch-class energy.

## Consequences

- ✓ Lightweight, explainable, and gives actionable hints.
- ✓ Thresholds can be tuned per sensitivity preset.
- ✗ Can't tell which _string_ sounded when a pitch class repeats across strings. Hints name the note in that case.
- ✗ Chords sharing most tones (for example Am vs C) have a smaller margin. Covered by the confusion benchmark.
