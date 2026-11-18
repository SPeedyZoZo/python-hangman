import { magnitudeSpectrum } from './fft.ts';

export const CHROMA_FFT = 8192;

export interface ChromaOptions {
  minHz: number;
  maxHz: number;
  /** Magnitude compression exponent (1 = linear, 0.5 = sqrt). */
  power: number;
}

/**
 * Tuned by grid search in Sprint 3 (see docs/04-architecture/audio-engine-spec.md §2):
 * band-limiting to the fundamentals and low harmonics (≤ 800 Hz) with linear magnitude
 * removes most high-harmonic smear (7th, 9th, 11th … partials land on non-chord notes).
 */
export const CHROMA_DEFAULTS: ChromaOptions = { minHz: 60, maxHz: 800, power: 1 };

/**
 * 12-bin chroma (pitch-class profile) from the newest CHROMA_FFT samples.
 * Each bin's compressed magnitude (sqrt) is assigned to its nearest pitch class.
 * Returned vector is L2-normalised (all zeros if silent).
 */
export function computeChroma(
  samples: Float32Array,
  sampleRate: number,
  opts: ChromaOptions = CHROMA_DEFAULTS,
): Float32Array {
  const mag = magnitudeSpectrum(samples, CHROMA_FFT);
  const chroma = new Float32Array(12);
  const binHz = sampleRate / CHROMA_FFT;
  const lo = Math.max(1, Math.floor(opts.minHz / binHz));
  const hi = Math.min(mag.length - 2, Math.ceil(opts.maxHz / binHz));
  // Simple spectral-peak emphasis: only count local maxima (reduces window-leakage smear).
  for (let k = lo; k <= hi; k++) {
    const m = mag[k]!;
    if (m < mag[k - 1]! || m < mag[k + 1]!) continue;
    const hz = k * binHz;
    const midi = 69 + 12 * Math.log2(hz / 440);
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pc] = chroma[pc]! + m ** opts.power;
  }
  let norm = 0;
  for (let i = 0; i < 12; i++) norm += chroma[i]! * chroma[i]!;
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < 12; i++) chroma[i] = chroma[i]! / norm;
  return chroma;
}

export function cosine(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < 12; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return na > 0 && nb > 0 ? dot / Math.sqrt(na * nb) : 0;
}
