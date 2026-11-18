# Audio technology research

**Owner:** Audio/DSP Engineer · **Feeds:** ADR-0002, ADR-0003, the [audio engine spec](../04-architecture/audio-engine-spec.md)

## 1. Requirements from the product

- Detect single notes across a standard-tuned guitar: E2 (82.41 Hz) up to roughly E5 (659 Hz) at fret 12 on the high e string.
- Verify strummed open chords (3 to 6 notes sounding at once).
- Detect _new_ plucks and strums (onsets) so that repeated notes count separately and timing can be scored.
- Run in real time in the browser on mid-range phones, with feedback within about 150 ms.

## 2. Monophonic pitch: options

| Option                                  | Notes                                                                                                                          | Verdict       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| FFT peak picking                        | Simple, but guitar harmonics are often stronger than the fundamental, which causes octave errors                               | ✗             |
| Autocorrelation                         | Classic tuner approach, prone to octave errors                                                                                 | ~             |
| YIN (`pitchfinder`)                     | Good balance of accuracy and speed, though its README warns it occasionally returns wrong values                               | ✓ alternative |
| **McLeod Pitch Method (`pitchy`, MIT)** | Normalised square difference function plus key-maximum picking. Good on low frequencies, returns a _clarity_ score, ESM, small | **✓ chosen**  |
| ML (CREPE, Basic Pitch)                 | Accurate but heavy (MBs of weights and a TF.js runtime)                                                                        | ✗ for MVP     |

The window size must hold at least 3 periods of the lowest note. E2 has a period of about 12.1 ms,
so a 2048-sample window (42.7 ms at 48 kHz) is enough. We add median smoothing across frames and
an octave-sanity check.

## 3. Chords: recognition vs. verification

- Open-ended polyphonic transcription in the browser is unreliable. One project reports Basic Pitch at about 70–75% on clear pop/rock and about 60–65% on jazz, and the model is heavy.
- The classic DSP route is a **chromagram**: fold spectral energy into 12 pitch classes, then match against chord templates.
- **Key insight:** Strumly always knows the _expected_ chord. We verify it with **harmonic-aware templates** built from the actual voicing (each string's fundamental plus decaying harmonics), compared by cosine similarity. We accept when the expected chord's similarity passes a threshold **and** beats every confusable chord in the database by a margin.
- Bonus: per-pitch-class energy tells us which chord tone is missing (for example "F♯ is quiet, so check your ring finger on the high e string").

## 4. Onsets

RMS energy with a rising-edge detector (current RMS greater than k times the recent average, above
a noise floor), plus a refractory period of about 70 ms. Strums show up as one onset. Pitch-change
onsets (legato) are out of scope for MVP.

## 5. Browser capture quirks

- Request `echoCancellation`, `noiseSuppression` and `autoGainControl` all set to `false`. Safari may ignore these and keep its filters on, and AGC can fade sustained notes. Mitigation: judge on the onset plus the first ~150 ms, not on long sustains.
- `getUserMedia` needs a secure context (HTTPS or localhost).
- An `AudioContext` must be resumed after a user gesture on iOS and Chrome.
- Using `AnalyserNode.getFloatTimeDomainData` with our _own_ FFT means the browser and Node tests share exactly the same analysis code.

## 6. Test strategy for audio

- A **Karplus-Strong plucked-string synthesiser** generates realistic, harmonic-rich guitar tones, so the full analysis pipeline can be tested under Node.
- Variants: detune (±10 cents), white noise (about 20 dB SNR), and amplitude changes.
- End-to-end: Chromium's `--use-file-for-fake-audio-capture` plays generated WAVs through the real `getUserMedia` path.
- **Limit:** synthetic audio isn't a real guitar in a real room. Real-device testing by the user is a release task, supported by a sensitivity setting.

## Sources

- pitchy (McLeod Pitch Method), MIT: https://github.com/ianprime0509/pitchy
- pitchfinder (YIN and others): https://github.com/peterkhayes/pitchfinder
- Basic Pitch chord pipeline notes (Amadeus): https://amadeus-chordzart.readthedocs.io/en/latest/pipeline/chord_detection.html
- getUserMedia audio constraints: https://blog.addpipe.com/audio-constraints-getusermedia/
- WebKit capture-processing reports: https://bugs.webkit.org/show_bug.cgi?id=179411
