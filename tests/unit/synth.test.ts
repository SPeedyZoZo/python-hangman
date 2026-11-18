import { describe, expect, it } from 'vitest';
import { PitchDetector } from 'pitchy';
import { renderPluck, renderStrum } from '../../src/audio/synth/karplusStrong.ts';
import { encodeWav } from '../../src/audio/synth/wav.ts';
import { centsFrom, midiToHz } from '../../src/music/theory.ts';

const SR = 48000;

describe('Karplus–Strong synth (FR-TUN-3, S1-5)', () => {
  it('is deterministic for the same seed', () => {
    const a = renderPluck(220, { sampleRate: SR, durationSec: 0.2, seed: 3 });
    const b = renderPluck(220, { sampleRate: SR, durationSec: 0.2, seed: 3 });
    expect(Array.from(a.slice(0, 500))).toEqual(Array.from(b.slice(0, 500)));
  });

  it('is tuned to within 2 cents across the guitar range', () => {
    const det = PitchDetector.forFloat32Array(4096);
    for (const midi of [40, 45, 50, 55, 59, 64, 69, 76]) {
      const hz = midiToHz(midi);
      const sig = renderPluck(hz, { sampleRate: SR, durationSec: 0.6, decay: 0.999 });
      const [found] = det.findPitch(sig.subarray(SR * 0.2, SR * 0.2 + 4096), SR);
      expect(Math.abs(centsFrom(found, midi))).toBeLessThan(2);
    }
  });

  it('peaks at the requested amplitude and strums are bounded', () => {
    const p = renderPluck(330, { sampleRate: SR, durationSec: 0.3, amplitude: 0.5 });
    expect(Math.max(...Array.from(p, Math.abs))).toBeCloseTo(0.5, 3);
    const s = renderStrum([82.4, 123.5, 164.8], { sampleRate: SR, durationSec: 0.5 });
    expect(Math.max(...Array.from(s, Math.abs))).toBeLessThanOrEqual(0.7001);
  });

  it('encodes a valid 16-bit mono WAV header', () => {
    const wav = encodeWav(new Float32Array(100), SR);
    const v = new DataView(wav.buffer);
    expect(String.fromCharCode(...wav.slice(0, 4))).toBe('RIFF');
    expect(v.getUint32(24, true)).toBe(SR);
    expect(v.getUint16(34, true)).toBe(16);
    expect(wav.length).toBe(44 + 200);
  });
});
