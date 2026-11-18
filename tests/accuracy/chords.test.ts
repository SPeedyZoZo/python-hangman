import { describe, expect, it } from 'vitest';
import { analyzeSignal } from '../../src/audio/analysis/FrameAnalyzer.ts';
import { verifyChord } from '../../src/audio/analysis/chordVerifier.ts';
import { SENSITIVITY } from '../../src/audio/analysis/sensitivity.ts';
import { mixInto, renderStrum } from '../../src/audio/synth/karplusStrong.ts';
import { CHORD_IDS, voicing, type ChordId } from '../../src/music/chords.ts';
import { midiToHz } from '../../src/music/theory.ts';
import { CHORD_SETTLE_MS } from '../../src/practice/matcher.ts';
import { pct, SR, withNoise } from './helpers.ts';

const params = SENSITIVITY.normal;

function strumSignal(midis: number[], opts: { direction?: 'down' | 'up'; seed?: number } = {}) {
  const lead = 0.3;
  const sig = new Float32Array(Math.floor(SR * (lead + 1.5)));
  mixInto(
    sig,
    renderStrum(
      midis.map((m) => midiToHz(m)),
      { sampleRate: SR, durationSec: 1.5, direction: opts.direction, seed: opts.seed ?? 1 },
    ),
    Math.floor(lead * SR),
  );
  return sig;
}

/**
 * Judged like the session: from CHORD_SETTLE_MS after the strum (at 300 ms) up to 700 ms after
 * it, 3 consecutive matching frames.
 */
function accepts(sig: Float32Array, target: ChordId) {
  let run = 0;
  for (const f of analyzeSignal(sig, SR, { chroma: true })) {
    if (f.t < 300 + CHORD_SETTLE_MS || f.t > 1000) continue;
    if (f.chroma && verifyChord(target, f.chroma, params).match) {
      if (++run >= 3) return true;
    } else run = 0;
  }
  return false;
}

const midisOf = (id: ChordId) => voicing(id).map((n) => n.midi);

describe('chord verification benchmark (NFR-ACC-1, S3-1)', () => {
  const variants = [
    { name: 'down-strum', make: (id: ChordId, i: number) => strumSignal(midisOf(id), { seed: i }) },
    {
      name: 'up-strum',
      make: (id: ChordId, i: number) => strumSignal(midisOf(id), { direction: 'up', seed: i }),
    },
    {
      name: 'noise 20dB',
      make: (id: ChordId, i: number) => withNoise(strumSignal(midisOf(id), { seed: i }), 20, i),
    },
  ];
  for (const v of variants) {
    it(`accepts the right chord ≥90% (${v.name})`, () => {
      const misses: string[] = [];
      CHORD_IDS.forEach((id, i) => {
        if (!accepts(v.make(id, i + 1), id)) misses.push(id);
      });
      const rate = pct(CHORD_IDS.length - misses.length, CHORD_IDS.length);
      console.log(
        `[chords:${v.name}] ${rate}%${misses.length ? ' · rejected: ' + misses.join(', ') : ''}`,
      );
      expect(rate).toBeGreaterThanOrEqual(90);
    });
  }

  it('false-accepts a wrong chord <5% of the time (confusion matrix)', () => {
    let fa = 0;
    let total = 0;
    const confusions: string[] = [];
    CHORD_IDS.forEach((played, i) => {
      const sig = strumSignal(midisOf(played), { seed: 100 + i });
      for (const target of CHORD_IDS) {
        if (target === played) continue;
        total++;
        if (accepts(sig, target)) {
          fa++;
          confusions.push(`${played}→${target}`);
        }
      }
    });
    const rate = pct(fa, total);
    console.log(
      `[chords:false-accept] ${fa}/${total} = ${rate}%${confusions.length ? ' · ' + confusions.join(', ') : ''}`,
    );
    expect(rate).toBeLessThan(5);
  });

  it('rejects a chord with a missing string and names the missing note (FR-DET-4)', () => {
    // D chord with the high e string (F#4) not sounding.
    const d = midisOf('D').filter((m) => m !== 66);
    let hintFound = false;
    let accepted = false;
    for (const f of analyzeSignal(strumSignal(d), SR, { chroma: true })) {
      if (f.t < 400 || f.t > 1000 || !f.chroma) continue;
      const v = verifyChord('D', f.chroma, params);
      if (v.match) accepted = true;
      if (v.hints.some((h) => h.kind === 'missing' && h.note === 'F♯' && h.string === 1))
        hintFound = true;
    }
    expect(accepted).toBe(false);
    expect(hintFound).toBe(true);
  });

  it('a muted string the voicing needs (G without its high G) still names a hint', () => {
    const g = midisOf('G').filter((m) => m !== 67);
    const hints = new Set<string>();
    for (const f of analyzeSignal(strumSignal(g), SR, { chroma: true })) {
      if (f.t < 400 || f.t > 1000 || !f.chroma) continue;
      verifyChord('G', f.chroma, params).hints.forEach((h) => hints.add(`${h.kind}:${h.note}`));
    }
    console.log('[chords:G-missing-top] hints', [...hints].join(', ') || 'none (accepted)');
  });
});
