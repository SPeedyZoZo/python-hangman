import { describe, expect, it } from 'vitest';
import { analyzeSignal } from '../../src/audio/analysis/FrameAnalyzer.ts';
import { fretToMidi, midiToHz, noteName, STRINGS } from '../../src/music/theory.ts';
import { pct, pluckSignal, SR, withNoise } from './helpers.ts';

/**
 * Benchmark (NFR-ACC-1): strings 1–6 × frets 0–12, judged the way the matcher does:
 * within 300 ms after the pluck, at least 2 consecutive frames read the target MIDI.
 */
function detectsNote(
  sig: Float32Array,
  target: number,
  leadSec: number,
): { ok: boolean; heard: number[] } {
  const frames = analyzeSignal(sig, SR);
  const heard: number[] = [];
  let run = 0;
  for (const f of frames) {
    if (f.t < leadSec * 1000 || f.t > leadSec * 1000 + 300) continue;
    if (f.pitch) heard.push(f.pitch.midi);
    if (f.pitch && f.pitch.midi === target && Math.abs(f.pitch.cents) <= 50) {
      run++;
      if (run >= 2) return { ok: true, heard };
    } else run = 0;
  }
  return { ok: false, heard };
}

const variants: {
  name: string;
  make: (hz: number, seed: number) => Float32Array;
  detune: number;
}[] = [
  { name: 'clean', make: (hz, seed) => pluckSignal(hz, { seed }), detune: 0 },
  {
    name: 'detune +10c',
    make: (hz, seed) => pluckSignal(hz * 2 ** (10 / 1200), { seed }),
    detune: 10,
  },
  {
    name: 'detune -10c',
    make: (hz, seed) => pluckSignal(hz * 2 ** (-10 / 1200), { seed }),
    detune: -10,
  },
  {
    name: 'noise 20dB',
    make: (hz, seed) => withNoise(pluckSignal(hz, { seed }), 20, seed),
    detune: 0,
  },
  {
    name: 'noise 10dB',
    make: (hz, seed) => withNoise(pluckSignal(hz, { seed }), 10, seed),
    detune: 0,
  },
  {
    name: 'bright pick',
    make: (hz, seed) => pluckSignal(hz, { seed, brightness: 0.97 }),
    detune: 0,
  },
  {
    name: 'soft fingertip, quiet',
    make: (hz, seed) =>
      withNoise(pluckSignal(hz, { seed, brightness: 0.15, amplitude: 0.08 }), 20, seed),
    detune: 0,
  },
];

describe('single-note detection benchmark', () => {
  for (const v of variants) {
    it(`≥95% correct across strings 1–6, frets 0–12 (${v.name})`, () => {
      let ok = 0;
      let total = 0;
      const failures: string[] = [];
      for (const s of STRINGS) {
        for (let f = 0; f <= 12; f++) {
          const midi = fretToMidi(s, f);
          const res = detectsNote(v.make(midiToHz(midi), s * 100 + f), midi, 0.2);
          total++;
          if (res.ok) ok++;
          else
            failures.push(
              `${noteName(midi)} (s${s}f${f}) heard [${res.heard.slice(0, 6).join(',')}]`,
            );
        }
      }
      const rate = pct(ok, total);
      console.log(
        `[notes:${v.name}] ${ok}/${total} = ${rate}%${failures.length ? ' · misses: ' + failures.join('; ') : ''}`,
      );
      expect(rate).toBeGreaterThanOrEqual(95);
    });
  }
});

describe('single-note false-accept benchmark', () => {
  it('a neighbouring semitone is not accepted as the target (<5%)', () => {
    let falseAccepts = 0;
    let total = 0;
    for (const s of STRINGS) {
      for (let f = 1; f <= 12; f++) {
        const target = fretToMidi(s, f);
        for (const played of [target - 1, target + 1]) {
          total++;
          if (detectsNote(pluckSignal(midiToHz(played), { seed: played }), target, 0.2).ok)
            falseAccepts++;
        }
      }
    }
    const rate = pct(falseAccepts, total);
    console.log(`[notes:false-accept] ${falseAccepts}/${total} = ${rate}%`);
    expect(rate).toBeLessThan(5);
  });
});
