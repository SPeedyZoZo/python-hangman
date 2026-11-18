# Delivery plan

**Owner:** Delivery Lead

| Sprint | Goal                           | Stories    | Exit demo                                                             |
| ------ | ------------------------------ | ---------- | --------------------------------------------------------------------- |
| 0      | Discovery and foundations      | S0-1, S0-2 | Docs playbook, scaffold builds, CI green                              |
| 1      | Audio core and tuner           | S1-1…S1-6  | Tuner reads synthetic and fake-mic notes. Benchmarks pass             |
| 2      | Practice engine                | S2-1…S2-9  | Wait Mode and play-along lesson playable with the on-screen fretboard |
| 3      | Chords and strumming           | S3-1…S3-5  | Chord lessons verified. Chord library with "Check my chord"           |
| 4      | Curriculum, progress and coach | S4-1…S4-8  | Full learning path, songs, onboarding, coach tips, persistence        |
| 5      | Hardening and release          | S5-1…S5-5  | Offline PWA, e2e and a11y green, deploy workflow, MVP sign-off        |

## Milestones

- **M1 (end of S1):** listening engine proven on benchmarks.
- **M2 (end of S3):** the core learning loop works for notes and chords.
- **M3 (end of S5):** MVP release candidate.

## Dependencies

S2 depends on S1 (FrameAnalyzer). S3 depends on S2 (session and matcher). S4 depends on S2 and S3
(content kinds). S5 depends on all of them.
