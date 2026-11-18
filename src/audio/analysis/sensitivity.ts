/** Detection sensitivity presets. Source of truth: docs/04-architecture/audio-engine-spec.md §5. */
export type Sensitivity = 'easy' | 'normal' | 'strict';

export interface DetectionParams {
  clarity: number;
  noiseFloor: number;
  /** Minimum cosine similarity with the expected chord template. */
  chordThreshold: number;
  /**
   * Discrimination against close rival chords: the target's distinguishing notes must be at
   * least this many times as loud as the rival's (and a rival-only note must stay below
   * `chordAbsent` × the mean chord-tone level).
   */
  chordDiscrimination: number;
  chordAbsent: number;
  /** Every chord tone must reach this fraction of the level its voicing template predicts. */
  chordTonePresence: number;
  octaveLenient: boolean;
}

export const SENSITIVITY: Readonly<Record<Sensitivity, DetectionParams>> = {
  easy: {
    clarity: 0.75,
    noiseFloor: 0.006,
    chordThreshold: 0.72,
    chordDiscrimination: 0.8,
    chordAbsent: 0.5,
    chordTonePresence: 0.3,
    octaveLenient: true,
  },
  normal: {
    clarity: 0.85,
    noiseFloor: 0.01,
    chordThreshold: 0.8,
    chordDiscrimination: 1.0,
    chordAbsent: 0.4,
    chordTonePresence: 0.45,
    octaveLenient: false,
  },
  strict: {
    clarity: 0.92,
    noiseFloor: 0.015,
    chordThreshold: 0.86,
    chordDiscrimination: 1.25,
    chordAbsent: 0.3,
    chordTonePresence: 0.6,
    octaveLenient: false,
  },
};
