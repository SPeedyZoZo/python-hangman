/**
 * Karplus–Strong plucked-string synthesiser (pure, deterministic).
 * Used for: "Listen" reference playback, the on-screen fretboard, tuner reference tones,
 * and generating realistic guitar-like audio for tests and e2e fixtures.
 *
 * Tuning accuracy: the two-point averaging loop filter adds 0.5 samples of delay, and the
 * remaining fractional delay is handled with a first-order all-pass (Jaffe & Smith), so
 * pitches are accurate to well under 1 cent.
 */

export interface PluckOptions {
  sampleRate: number;
  durationSec?: number;
  /** Per-period loss factor (0.98–0.999). Higher = longer sustain. */
  decay?: number;
  /** 0 = dark/soft pluck, 1 = bright/pick. */
  brightness?: number;
  /** Peak amplitude of the result (0–1). */
  amplitude?: number;
  /** Seed for the deterministic noise burst. */
  seed?: number;
}

/** Small deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function renderPluck(hz: number, opts: PluckOptions): Float32Array {
  const { sampleRate, durationSec = 1.5, decay = 0.996, brightness = 0.6, amplitude = 0.6 } = opts;
  if (!(hz > 0) || !Number.isFinite(hz))
    throw new RangeError(`renderPluck: invalid frequency ${hz}`);
  const rand = mulberry32(opts.seed ?? Math.round(hz * 1000));
  const n = Math.max(1, Math.floor(sampleRate * durationSec));
  const out = new Float32Array(n);

  const loopDelay = sampleRate / hz - 0.5; // compensate the averaging filter
  const li = Math.max(2, Math.floor(loopDelay - 0.1));
  const frac = loopDelay - li; // in [0.1, 1.1)
  const c = (1 - frac) / (1 + frac); // all-pass coefficient

  // Excitation: noise burst, low-passed according to brightness.
  const buf = new Float32Array(li);
  const smooth = 1 - Math.min(0.95, Math.max(0.05, brightness));
  let lp = 0;
  for (let i = 0; i < li; i++) {
    const white = rand() * 2 - 1;
    lp = lp * smooth + white * (1 - smooth);
    buf[i] = lp;
  }
  // Remove DC from the excitation so the string doesn't drift.
  let mean = 0;
  for (let i = 0; i < li; i++) mean += buf[i]!;
  mean /= li;
  for (let i = 0; i < li; i++) buf[i] = buf[i]! - mean;

  let idx = 0;
  let prev = 0;
  let apX1 = 0;
  let apY1 = 0;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const y = buf[idx]!;
    const filtered = decay * 0.5 * (y + prev);
    prev = y;
    const ap = c * filtered + apX1 - c * apY1;
    apX1 = filtered;
    apY1 = ap;
    buf[idx] = ap;
    idx = idx + 1 === li ? 0 : idx + 1;
    out[i] = y;
    const a = Math.abs(y);
    if (a > peak) peak = a;
  }

  // Short attack ramp (2 ms) and a 30 ms release at the end to avoid clicks.
  const attack = Math.min(n, Math.floor(sampleRate * 0.002));
  for (let i = 0; i < attack; i++) out[i] = out[i]! * (i / attack);
  const release = Math.min(n, Math.floor(sampleRate * 0.03));
  for (let i = 0; i < release; i++) {
    const k = n - 1 - i;
    out[k] = out[k]! * (i / release);
  }

  const gain = peak > 0 ? amplitude / peak : 0;
  for (let i = 0; i < n; i++) out[i] = out[i]! * gain;
  return out;
}

export interface StrumOptions extends PluckOptions {
  direction?: 'down' | 'up';
  /** Delay between successive strings in ms. */
  spreadMs?: number;
}

/**
 * Strum several notes. `midisLowToHigh` must be ordered from the lowest string to the highest;
 * a down-strum plays them in that order, an up-strum in reverse.
 */
export function renderStrum(hzLowToHigh: readonly number[], opts: StrumOptions): Float32Array {
  const { sampleRate, durationSec = 2, direction = 'down', spreadMs = 14, amplitude = 0.7 } = opts;
  const n = Math.floor(sampleRate * durationSec);
  const out = new Float32Array(n);
  const order = direction === 'down' ? [...hzLowToHigh] : [...hzLowToHigh].reverse();
  const spread = Math.floor((spreadMs / 1000) * sampleRate);
  order.forEach((hz, i) => {
    const pluck = renderPluck(hz, {
      ...opts,
      amplitude: 1,
      durationSec: durationSec - (i * spread) / sampleRate,
      seed: (opts.seed ?? 7) * 31 + i * 101 + Math.round(hz),
    });
    mixInto(out, pluck, i * spread, 1);
  });
  normalize(out, amplitude);
  return out;
}

export function mixInto(target: Float32Array, src: Float32Array, offset: number, gain = 1): void {
  const start = Math.max(0, offset);
  const end = Math.min(target.length, offset + src.length);
  for (let i = start; i < end; i++) target[i] = target[i]! + src[i - offset]! * gain;
}

export function normalize(buf: Float32Array, peakTarget: number): void {
  let peak = 0;
  for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]!));
  if (peak === 0) return;
  const g = peakTarget / peak;
  for (let i = 0; i < buf.length; i++) buf[i] = buf[i]! * g;
}

/** Deterministic white noise at a given RMS level, added in place. */
export function addNoise(buf: Float32Array, rms: number, seed = 99): void {
  const rand = mulberry32(seed);
  const amp = rms * Math.sqrt(3); // uniform distribution RMS = amp / sqrt(3)
  for (let i = 0; i < buf.length; i++) buf[i] = buf[i]! + (rand() * 2 - 1) * amp;
}

export function rmsOf(buf: Float32Array, start = 0, end = buf.length): number {
  let sum = 0;
  for (let i = start; i < end; i++) sum += buf[i]! * buf[i]!;
  return Math.sqrt(sum / Math.max(1, end - start));
}
