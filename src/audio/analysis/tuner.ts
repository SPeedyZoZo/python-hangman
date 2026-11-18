import { nearestOpenString, noteName, type StringNumber } from '../../music/theory.ts';
import type { PitchReading } from './pitch.ts';

export interface TunerReading {
  hz: number;
  /** Nearest chromatic note, e.g. "E2". */
  note: string;
  /** Nearest open string in standard tuning. */
  string: StringNumber;
  /** Cents relative to that string's target pitch (positive = sharp). */
  cents: number;
  /** Within ±IN_TUNE_CENTS and held for IN_TUNE_HOLD_MS. */
  inTune: boolean;
}

export const IN_TUNE_CENTS = 5;
export const IN_TUNE_HOLD_MS = 500;
const SMOOTH_N = 5;
const HOLD_LAST_MS = 400;

/** Pure tuner model: median-smooths readings and tracks the "held in tune" state. */
export class TunerModel {
  private hzHistory: number[] = [];
  private inTuneSince: number | null = null;
  private last: TunerReading | null = null;
  private lastT = -Infinity;

  update(pitch: PitchReading | null, tMs: number): TunerReading | null {
    if (!pitch) {
      // Keep showing the last reading briefly so the needle doesn't flicker between plucks.
      if (tMs - this.lastT > HOLD_LAST_MS) {
        this.hzHistory = [];
        this.inTuneSince = null;
        this.last = null;
      }
      return this.last;
    }
    const prevHz = this.hzHistory[this.hzHistory.length - 1];
    if (prevHz !== undefined && Math.abs(1200 * Math.log2(pitch.hz / prevHz)) > 80)
      this.hzHistory = [];
    this.hzHistory.push(pitch.hz);
    if (this.hzHistory.length > SMOOTH_N) this.hzHistory.shift();
    const sorted = [...this.hzHistory].sort((a, b) => a - b);
    const hz = sorted[Math.floor(sorted.length / 2)]!;
    const near = nearestOpenString(hz);
    const centered = Math.abs(near.cents) <= IN_TUNE_CENTS;
    if (centered) this.inTuneSince ??= tMs;
    else this.inTuneSince = null;
    const inTune = this.inTuneSince !== null && tMs - this.inTuneSince >= IN_TUNE_HOLD_MS;
    const midi = Math.round(69 + 12 * Math.log2(hz / 440));
    this.last = { hz, note: noteName(midi), string: near.string, cents: near.cents, inTune };
    this.lastT = tMs;
    return this.last;
  }
}
