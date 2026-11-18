# Architecture

**Owner:** Solution Architect · **Decisions:** see [ADRs](adr/)

## 1. Context

Strumly is a static, client-only PWA with no backend. Everything (audio analysis, content and
progress) runs and stays in the browser.

```
 ┌───────────── Browser (PWA) ──────────────────────────────────────────┐
 │  React UI (screens, ui)  ──reads──►  zustand stores (settings, progress)│
 │        │  usePractice()                       │ persist (IndexedDB)    │
 │        ▼                                      ▼                        │
 │  PracticeSession (pure)  ◄─AudioFrame─  AudioEngine ─► FrameAnalyzer   │
 │        │ events                   mic ─► Analyser ◄─ synth (fretboard) │
 │        ▼                                                               │
 │  scoring → SessionSummary → CoachProvider (RuleBasedCoach)             │
 │  content (lessons, songs, chords: validated data)                      │
 └────────────────────────────────────────────────────────────────────────┘
```

## 2. Layers and dependency rule

Dependencies point **downwards only**.

| Layer                  | Path                                                                                             | May import       | Notes                            |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ---------------- | -------------------------------- |
| Screens                | `src/screens`                                                                                    | everything below | Routed pages                     |
| UI components          | `src/ui`                                                                                         | hooks, domain    | Presentational plus small hooks  |
| App hooks and stores   | `src/app`, `src/settings`, `src/progress`                                                        | domain, audio    | React and zustand glue           |
| Audio engine (browser) | `src/audio/AudioEngine.ts`                                                                       | analysis, synth  | Owns the `AudioContext` and mic  |
| **Domain (pure)**      | `src/music`, `src/audio/analysis`, `src/audio/synth`, `src/practice`, `src/content`, `src/coach` | each other only  | No React or DOM. Runs under Node |

## 3. Runtime data flow (one animation frame)

1. `AudioEngine.readFrame()` pulls the newest 8192 time-domain samples from an `AnalyserNode`.
2. `FrameAnalyzer.analyze(samples, tMs)` returns an `AudioFrame`: `{ t, rms, onset, pitch: {hz, midi, cents, clarity} | null, chroma[12] }`.
3. `PracticeSession.tick(tMs, frame)` advances the song position (or holds it in Wait Mode), checks the active step with `matchTarget(step.target, frame, ctx)`, and emits `StepResult` events.
4. React subscribes to session events. The highway position is applied directly to an SVG transform through a ref (no React re-render per frame).
5. At the end, `summarize(results)` returns a `SessionSummary`, which feeds `coach.getTips(summary)`, then the progress store, then the Results screen.

## 4. Key modules

| Module                            | Responsibility                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `music/theory.ts`                 | midi↔Hz↔name, cents, standard tuning, `fretToMidi(string, fret)`                        |
| `music/chords.ts`                 | Chord library: voicing (per-string frets), fingers, display name                        |
| `music/tab.ts`                    | Tab DSL parser (`"1.0 2.3*2 Em*4v"`) to `Step[]` with beat positions                    |
| `audio/analysis/fft.ts`           | Radix-2 FFT (real input), Hann window                                                   |
| `audio/analysis/pitch.ts`         | `pitchy` McLeod wrapper with clarity gate, range clamp and median smoothing             |
| `audio/analysis/chroma.ts`        | Magnitude spectrum to 12-bin chroma (60–2000 Hz), normalised                            |
| `audio/analysis/onset.ts`         | RMS rising-edge onset detector with refractory period                                   |
| `audio/analysis/chordVerifier.ts` | Harmonic-aware templates, cosine similarity, margin vs. confusables, missing-tone hints |
| `audio/analysis/FrameAnalyzer.ts` | Composes the above into an `AudioFrame`                                                 |
| `audio/synth/karplusStrong.ts`    | Plucked-string synth: `renderPluck`, `renderStrum`, `renderExercise`                    |
| `practice/session.ts`             | Wait and play state machine, tempo, loop, count-in                                      |
| `practice/matcher.ts`             | `matchTarget()` for note, chord and rest targets, with sensitivity presets              |
| `practice/scoring.ts`             | Timing grades, accuracy, stars, XP, `SessionSummary`                                    |
| `coach/*`                         | `CoachProvider` interface, `RuleBasedCoach` (tips plus FAQ)                             |
| `content/*`                       | Units, lessons and songs as data, plus `validateContent()`                              |

## 5. Cross-cutting

- **Routing:** `HashRouter` (works on GitHub Pages without server rewrites).
- **Persistence:** zustand `persist` with an IndexedDB (idb-keyval) storage adapter and a localStorage fallback.
- **PWA:** `vite-plugin-pwa` (Workbox) precaches the shell. Content is bundled, so it works offline.
- **Config:** `BASE_PATH` env var for sub-path hosting.
- **Error handling:** if the mic is unavailable, the app falls back to virtual input and shows a non-blocking banner.
