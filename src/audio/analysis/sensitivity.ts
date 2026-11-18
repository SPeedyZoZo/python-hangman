/** Detection sensitivity presets. Source of truth: docs/04-architecture/audio-engine-spec.md §5. */
export type Sensitivity = 'easy' | 'normal' | 'strict';

export interface DetectionParams {
  clarity: number;
  noiseFloor: number;
  chordThreshold: number;
  chordMargin: number;
  octaveLenient: boolean;
}

export const SENSITIVITY: Readonly<Record<Sensitivity, DetectionParams>> = {
  easy: {
    clarity: 0.75,
    noiseFloor: 0.006,
    chordThreshold: 0.72,
    chordMargin: 0.0,
    octaveLenient: true,
  },
  normal: {
    clarity: 0.85,
    noiseFloor: 0.01,
    chordThreshold: 0.8,
    chordMargin: 0.03,
    octaveLenient: false,
  },
  strict: {
    clarity: 0.92,
    noiseFloor: 0.015,
    chordThreshold: 0.86,
    chordMargin: 0.06,
    octaveLenient: false,
  },
};
