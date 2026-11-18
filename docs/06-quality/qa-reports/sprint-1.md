# QA report: Sprint 1 (Audio core and tuner)

**Role:** QA / Test Automation Engineer · **Build:** branch `ccr-7c43b1a1-kunrlh`

## Automated results

| Suite                                                                        | Result                                                                                                          |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Unit: theory, tuner, synth, smoke                                            | ✅ 15/15                                                                                                        |
| Accuracy: single notes (78 notes × 7 variants)                               | ✅ 100% on every variant: clean, ±10 cents detune, 20 dB and 10 dB noise, bright pick, soft and quiet fingertip |
| Accuracy: single-note false accepts (neighbouring semitone, 144 cases)       | ✅ 0%                                                                                                           |
| Accuracy: onsets (8-pluck trains, re-plucked while ringing, clean and noisy) | ✅ count within ±1 (one extra onset on low E with noise), timing within ±30 ms                                  |
| E2E: tuner with fake mic (`tuner-e2.wav`)                                    | ✅ reads E2 / string 6 through the real `getUserMedia` path                                                     |

## Honest limits

- Karplus-Strong audio is cleaner than a real guitar: no body resonance, no string inharmonicity, no room reverb, no phone-mic colouration. **100% here does not mean 100% on a real guitar** (RAID R1). A real-device check is a release dependency (D1).
- The extra onset on noisy low E is harmless for scoring: a step still needs a matching pitch, and duplicate onsets inside the same step are ignored.

## Defects

| ID    | Sev | Description                                                                                         | Status                                        |
| ----- | --- | --------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| DEF-1 | S1  | `midis.map(midiToHz)` passed the array index as `a4`, giving 0 Hz and a crash in fixture generation | Fixed (lambda, plus a guard in `renderPluck`) |
| DEF-2 | S3  | Tuner "In tune" label wrapped onto two lines on phones                                              | Fixed (`white-space: nowrap`)                 |

## UX review (UX Designer hat)

Screenshot reviewed at 390×844 in the light theme: the dial, the note, the string and cents text,
the status with icon and text, the level meter and the reference tones all read clearly.
