import { describe, expect, it } from 'vitest';
import { FrameAnalyzer } from '../../src/audio/analysis/FrameAnalyzer.ts';
import { renderStrum } from '../../src/audio/synth/karplusStrong.ts';
import { SR } from './helpers.ts';

/**
 * NFR-PERF-1: the per-frame analysis must fit comfortably in a 60 fps frame on a phone.
 * Phones are roughly 3–5× slower than CI machines, so we budget 3 ms per frame here (16.7 ms frame).
 */
describe('analysis performance', () => {
  it('analyses a frame (pitch + onset + chroma) in under 3 ms on average', () => {
    const sig = renderStrum([82.4, 123.5, 164.8, 196, 246.9, 329.6], {
      sampleRate: SR,
      durationSec: 1.5,
    });
    const analyzer = new FrameAnalyzer(SR);
    const buf = new Float32Array(8192);
    const hop = 800;
    // Warm up the JIT.
    for (let i = 0; i < 50; i++)
      analyzer.analyze(sig.subarray(i * 100, i * 100 + 8192), i, { chroma: true });
    const n = 300;
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      const start = (i * hop) % (sig.length - 8192);
      buf.set(sig.subarray(start, start + 8192));
      analyzer.analyze(buf, i * 16, { chroma: true });
    }
    const perFrame = (performance.now() - t0) / n;
    console.log(`[perf] FrameAnalyzer.analyze with chroma: ${perFrame.toFixed(3)} ms/frame`);
    expect(perFrame).toBeLessThan(3);
  });
});
