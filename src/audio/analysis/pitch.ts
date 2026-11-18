import { PitchDetector } from 'pitchy';
import { centsFrom, hzToMidi, hzToMidiFloat } from '../../music/theory.ts';

export interface PitchReading {
  hz: number;
  /** Nearest MIDI note of the (smoothed) pitch. */
  midi: number;
  /** Cents from `midi` (positive = sharp). */
  cents: number;
  clarity: number;
}

export const PITCH_WINDOW = 2048;
export const MIN_HZ = 70;
export const MAX_HZ = 1000;

/**
 * McLeod Pitch Method (pitchy) with a clarity gate, a guitar range clamp and
 * 3-frame median smoothing on the fractional MIDI value to suppress single-frame glitches.
 */
export class PitchTracker {
  private readonly detector = PitchDetector.forFloat32Array(PITCH_WINDOW);
  private readonly window = new Float32Array(PITCH_WINDOW);
  private history: number[] = [];

  constructor() {
    this.detector.minVolumeDecibels = -50;
  }

  reset(): void {
    this.history = [];
  }

  detect(samples: Float32Array, sampleRate: number, minClarity: number): PitchReading | null {
    const offset = samples.length - PITCH_WINDOW;
    if (offset < 0) return null;
    this.window.set(samples.subarray(offset));
    const [hz, clarity] = this.detector.findPitch(this.window, sampleRate);
    if (!Number.isFinite(hz) || hz < MIN_HZ || hz > MAX_HZ || clarity < minClarity) {
      this.history = [];
      return null;
    }
    const m = hzToMidiFloat(hz);
    // Reset smoothing when the note clearly changed (> 0.7 semitone jump).
    const last = this.history[this.history.length - 1];
    if (last !== undefined && Math.abs(last - m) > 0.7) this.history = [];
    this.history.push(m);
    if (this.history.length > 3) this.history.shift();
    const sorted = [...this.history].sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)]!;
    const smoothHz = 440 * 2 ** ((med - 69) / 12);
    const midi = hzToMidi(smoothHz);
    return { hz: smoothHz, midi, cents: centsFrom(smoothHz, midi), clarity };
  }
}
