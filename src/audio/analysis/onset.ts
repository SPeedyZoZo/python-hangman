/**
 * Onset detector for plucks and strums.
 *
 * Feature: RMS of the first difference of the signal (a cheap high-frequency-content measure).
 * A fresh pluck is broadband, so this rises sharply even when the string is already ringing,
 * while the decaying tail of a note (whose high harmonics die quickly) keeps falling.
 * Fires on a rising edge: feature > riseRatio × mean(previous frames) and above a noise floor,
 * with a refractory period.
 */
export interface OnsetOptions {
  riseRatio?: number;
  refractoryMs?: number;
  historyLen?: number;
}

export const ONSET_WINDOW = 1024;

export function diffRms(samples: Float32Array, window = ONSET_WINDOW): number {
  const start = Math.max(1, samples.length - window);
  let sum = 0;
  for (let i = start; i < samples.length; i++) {
    const d = samples[i]! - samples[i - 1]!;
    sum += d * d;
  }
  return Math.sqrt(sum / Math.max(1, samples.length - start));
}

export function rms(samples: Float32Array, window = ONSET_WINDOW): number {
  const start = Math.max(0, samples.length - window);
  let sum = 0;
  for (let i = start; i < samples.length; i++) sum += samples[i]! * samples[i]!;
  return Math.sqrt(sum / Math.max(1, samples.length - start));
}

export class OnsetDetector {
  private readonly riseRatio: number;
  private readonly refractoryMs: number;
  private readonly historyLen: number;
  private history: number[] = [];
  private lastOnsetMs = -Infinity;

  constructor(opts: OnsetOptions = {}) {
    this.riseRatio = opts.riseRatio ?? 1.8;
    this.refractoryMs = opts.refractoryMs ?? 70;
    this.historyLen = opts.historyLen ?? 6;
  }

  reset(): void {
    this.history = [];
    this.lastOnsetMs = -Infinity;
  }

  /** `feature` is the diff-RMS of the newest samples, `level` the plain RMS (for the noise gate). */
  process(feature: number, level: number, tMs: number, noiseFloor: number): boolean {
    const prev = this.history.length
      ? this.history.reduce((a, b) => a + b, 0) / this.history.length
      : 0;
    this.history.push(feature);
    if (this.history.length > this.historyLen) this.history.shift();
    const isOnset =
      level >= noiseFloor &&
      feature > this.riseRatio * prev + 1e-4 &&
      tMs - this.lastOnsetMs >= this.refractoryMs;
    if (isOnset) this.lastOnsetMs = tMs;
    return isOnset;
  }
}
