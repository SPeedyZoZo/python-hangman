import { describe, expect, it } from 'vitest';
import { analyzeSignal } from '../../src/audio/analysis/FrameAnalyzer.ts';
import { TunerModel } from '../../src/audio/analysis/tuner.ts';
import { renderPluck } from '../../src/audio/synth/karplusStrong.ts';
import { midiToHz } from '../../src/music/theory.ts';

const SR = 48000;

function runTuner(hz: number) {
  const sig = renderPluck(hz, { sampleRate: SR, durationSec: 2.5, decay: 0.998 });
  const tuner = new TunerModel();
  let reading = null;
  let everInTune = false;
  for (const f of analyzeSignal(sig, SR)) {
    reading = tuner.update(f.pitch, f.t) ?? reading;
    if (reading?.inTune) everInTune = true;
  }
  return { reading, everInTune };
}

describe('tuner (FR-TUN-1/2)', () => {
  it('reads an in-tune low E as E2 on string 6 and reports in tune', () => {
    const { reading, everInTune } = runTuner(midiToHz(40));
    expect(reading?.note).toBe('E2');
    expect(reading?.string).toBe(6);
    expect(Math.abs(reading!.cents)).toBeLessThan(3);
    expect(everInTune).toBe(true);
  });

  it('reports a flat A string with the right sign and never "in tune"', () => {
    const { reading, everInTune } = runTuner(midiToHz(45) * 2 ** (-20 / 1200));
    expect(reading?.string).toBe(5);
    expect(reading!.cents).toBeGreaterThan(-25);
    expect(reading!.cents).toBeLessThan(-15);
    expect(everInTune).toBe(false);
  });

  it('reports a sharp high e', () => {
    const { reading } = runTuner(midiToHz(64) * 2 ** (12 / 1200));
    expect(reading?.string).toBe(1);
    expect(reading!.cents).toBeGreaterThan(8);
    expect(reading!.cents).toBeLessThan(16);
  });

  it('requires the in-tune state to be held for 500 ms', () => {
    const tuner = new TunerModel();
    const p = { hz: midiToHz(55), midi: 55, cents: 0, clarity: 0.99 };
    expect(tuner.update(p, 0)?.inTune).toBe(false);
    expect(tuner.update(p, 300)?.inTune).toBe(false);
    expect(tuner.update(p, 520)?.inTune).toBe(true);
  });
});
