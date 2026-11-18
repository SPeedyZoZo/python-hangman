# Audio engine specification

**Owner:** Audio/DSP Engineer · **Status:** v1 (tune thresholds from benchmark results and record them here)

## 1. Capture graph

```
getUserMedia({audio:{echoCancellation:false, noiseSuppression:false, autoGainControl:false, channelCount:1}})
  → MediaStreamAudioSourceNode ─┐
                                ├─► inputGain ─► AnalyserNode(fftSize 8192, smoothing 0)
  synthetic injection (fretboard)┘
reference playback ─► outputGain ─► destination   (detection paused while playing)
```

- Sample rate is whatever the context provides (usually 48 kHz or 44.1 kHz). All analysis is sample-rate aware.
- Frames are read on `requestAnimationFrame` (about 60 fps). Each frame uses the latest 8192 samples.

## 2. FrameAnalyzer

| Stage         | Input                      | Parameters                                                                                                                                | Output                               |
| ------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| RMS and onset | latest 1024 samples        | noise floor 0.01 RMS (sensitivity-scaled), rise ratio ≥1.6× the average of the previous 6 frames, refractory 70 ms                        | `rms`, `onset: boolean`              |
| Pitch         | latest 2048 samples        | `pitchy` MPM, clarity ≥0.85 (sensitivity-scaled), 70–1000 Hz                                                                              | `{hz, midi, cents, clarity}` or null |
| Chroma        | latest 8192 samples (Hann) | FFT, local spectral peaks only, **linear magnitude, 60–800 Hz** (tuned in Sprint 3), each peak assigned to its pitch class, L2-normalised | `chroma[12]`                         |

Median smoothing is applied to the MIDI of the last 3 pitched frames to kill single-frame glitches.

## 3. Note matching (`practice/matcher.ts`)

- The target MIDI comes from `fretToMidi(string, fret)`.
- Match when the smoothed MIDI equals the target and |cents| ≤ 50. Octave errors (±12) are accepted only at the **easy** sensitivity.
- **Fresh-attack rule:** the match must come after an onset that happened after the step was armed (minus a 60 ms grace period), so repeated notes need new plucks.
- **Stability:** 2 consecutive matching frames for notes and 3 for chords.
- **Arming** (Wait Mode): a step only listens once the song position is within 1 beat of it, so learners can't race ahead of the highway.
- **Wrong attempt** (Wait Mode): a stable, confident pitch for 4 frames that doesn't match, after a fresh onset. It is counted once per onset.

## 4. Chord verification (`chordVerifier.ts`), revised in Sprint 3

1. **Template:** for each sounding string's MIDI _m_ and harmonic _h_ = 1..8 **with h·f₀ ≤ 800 Hz**, add the weight 0.9^(h−1) to the pitch class of _m_ + 12·log₂(h). Normalise.
2. **Settle:** chords are judged only from **120 ms after the strum onset** (`CHORD_SETTLE_MS`). Before that, a down-strum of G7 still sounds like G.
3. **Accept** when all of the following hold:
   - cosine(observed, template(target)) ≥ τ;
   - **every chord tone is present**: each tone ≥ `chordTonePresence` × the level the template predicts for it (a D without its F♯ is a D5, not a D);
   - the target **beats every close rival** (score within 0.10) on the notes that tell them apart:
     - both have unique notes (E vs Em: G♯ vs G): the target's unique notes are at least `chordDiscrimination` × as loud;
     - target ⊂ rival (G vs G7): the rival's extra note must not exceed what the target's own harmonics explain by more than `chordAbsent` × the tone level;
     - rival ⊂ target (G7 vs G): the target's extra note must exceed the rival's harmonic leak by at least `chordAbsent`/2 × the tone level.
4. **Hints:** _missing_ tones (below the presence threshold) name the string when the note is on exactly one string. _Extra_ means a non-chord note louder than 0.6 × max and 2.5 × its harmonic expectation.

**Why (Sprint 3 finding):** a string's 7th harmonic _is_ the flat 7th, so plain cosine matching confused X with X7 (67% accepts). A grid search over band, compression and template harmonics, plus note-level discrimination, raised accepts to 100%, 100% and 92% (down-strum, up-strum, noisy) with 2.3% false accepts.

## 5. Sensitivity presets

| Preset | Clarity | Noise floor | τ (chord) | Discrimination | Absent | Tone presence | Octave lenient |
| ------ | ------- | ----------- | --------- | -------------- | ------ | ------------- | -------------- |
| easy   | 0.75    | 0.006       | 0.72      | 0.8            | 0.5    | 0.30          | yes            |
| normal | 0.85    | 0.010       | 0.80      | 1.0            | 0.4    | 0.45          | no             |
| strict | 0.92    | 0.015       | 0.86      | 1.25           | 0.3    | 0.60          | no             |

## 6. Timing

- The hit time is the **onset time** (not the time detection was confirmed) minus `latencyMs` (user calibration, default 0).
- Grades by |Δt|: perfect ≤80 ms, good ≤160 ms, early or late ≤300 ms, otherwise miss.

## 7. Benchmarks (tests/accuracy)

| Suite        | Population                                           | Variants                                          | Target                                |
| ------------ | ---------------------------------------------------- | ------------------------------------------------- | ------------------------------------- |
| Single notes | strings 1–6 × frets 0–12 (78 notes)                  | clean, ±10 cents detune, white noise at 20 dB SNR | ≥95% correct                          |
| Chords       | every library chord                                  | clean, noise, down and up strum                   | ≥90% accept                           |
| Confusion    | every (played, expected) pair with played ≠ expected | clean                                             | <5% false accept                      |
| Onsets       | pluck train of 8 at 90 bpm                           | clean and noise                                   | count within ±1, timing within ±30 ms |

Results are recorded in the sprint QA reports.
