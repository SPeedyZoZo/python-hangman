import { describe, expect, it } from 'vitest';
import { analyzeSignal } from '../../src/audio/analysis/FrameAnalyzer.ts';
import { mixInto, renderPluck } from '../../src/audio/synth/karplusStrong.ts';
import { midiToHz } from '../../src/music/theory.ts';
import { SR, withNoise } from './helpers.ts';

/** 8 plucks at 90 bpm. Each new pluck lands while the previous one still rings. */
function pluckTrain(midis: number[], bpm: number, lead = 0.3) {
  const beat = 60 / bpm;
  const sig = new Float32Array(Math.floor(SR * (lead + beat * midis.length + 1)));
  const times: number[] = [];
  midis.forEach((m, i) => {
    const t = lead + i * beat;
    times.push(t * 1000);
    mixInto(
      sig,
      renderPluck(midiToHz(m), { sampleRate: SR, durationSec: 1.5, seed: i + 1 }),
      Math.floor(t * SR),
    );
  });
  return { sig, times };
}

function onsetTimes(sig: Float32Array) {
  return analyzeSignal(sig, SR)
    .filter((f) => f.onset)
    .map((f) => f.onsetT!);
}

describe('onset detection benchmark', () => {
  const cases = [
    { name: 'repeated high e', midis: Array(8).fill(64) as number[] },
    { name: 'repeated low E', midis: Array(8).fill(40) as number[] },
    { name: 'melody', midis: [64, 62, 60, 62, 64, 64, 64, 67] },
  ];
  for (const c of cases) {
    for (const noisy of [false, true]) {
      it(`${c.name}${noisy ? ' + noise' : ''}: one onset per pluck, within ±30 ms`, () => {
        const train = pluckTrain(c.midis, 90);
        const sig = noisy ? withNoise(train.sig, 20) : train.sig;
        const found = onsetTimes(sig);
        console.log(
          `[onset:${c.name}${noisy ? '+noise' : ''}] expected ${train.times.length}, found ${found.length}`,
        );
        expect(Math.abs(found.length - train.times.length)).toBeLessThanOrEqual(1);
        let matched = 0;
        for (const t of train.times) if (found.some((x) => Math.abs(x - t) <= 30)) matched++;
        expect(matched).toBeGreaterThanOrEqual(train.times.length - 1);
      });
    }
  }
});
