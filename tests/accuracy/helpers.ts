import { addNoise, mixInto, renderPluck, rmsOf } from '../../src/audio/synth/karplusStrong.ts';

export const SR = 48000;

/** Signal with leading silence, then one pluck. */
export function pluckSignal(
  hz: number,
  opts: {
    lead?: number;
    dur?: number;
    seed?: number;
    brightness?: number;
    amplitude?: number;
  } = {},
) {
  const lead = opts.lead ?? 0.2;
  const dur = opts.dur ?? 1.0;
  const sig = new Float32Array(Math.floor(SR * (lead + dur)));
  mixInto(
    sig,
    renderPluck(hz, {
      sampleRate: SR,
      durationSec: dur,
      seed: opts.seed,
      brightness: opts.brightness,
      amplitude: opts.amplitude,
    }),
    Math.floor(SR * lead),
  );
  return sig;
}

/** Add white noise at the given SNR (dB) relative to the signal's active RMS. */
export function withNoise(sig: Float32Array, snrDb: number, seed = 5): Float32Array {
  const out = Float32Array.from(sig);
  const nz = sig.findIndex((x) => Math.abs(x) > 1e-4);
  const active = rmsOf(sig, Math.max(0, nz), Math.min(sig.length, nz + SR * 0.5));
  addNoise(out, active / 10 ** (snrDb / 20), seed);
  return out;
}

export function pct(n: number, d: number) {
  return Math.round((1000 * n) / d) / 10;
}
