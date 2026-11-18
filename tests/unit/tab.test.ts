import { describe, expect, it } from 'vitest';
import { parseTab, TabParseError } from '../../src/music/tab.ts';

describe('tab DSL (S2-1)', () => {
  it('parses notes, chords, rests, durations and bars', () => {
    const p = parseTab('1.0 2.3*2 r | Em*2v Em*1^ G', 4);
    expect(p.totalBeats).toBe(8);
    expect(p.barStarts).toEqual([0, 4]);
    expect(p.steps.map((s) => [s.index, s.beat, s.beats, s.bar])).toEqual([
      [0, 0, 1, 0],
      [1, 1, 2, 0],
      [2, 4, 2, 1],
      [3, 6, 1, 1],
      [4, 7, 1, 1],
    ]);
    expect(p.steps[0]!.target).toEqual({ kind: 'note', string: 1, fret: 0, midi: 64 });
    expect(p.steps[3]!.target).toEqual({ kind: 'chord', chord: 'Em', strum: 'up' });
  });

  it('allows a pickup bar and a short final bar', () => {
    expect(parseTab('4.0 | 3.0*3 | 3.0', 3).steps).toHaveLength(3);
  });

  it.each([
    ['7.0', /String must be 1–6/],
    ['1.16', /Fret must be/],
    ['Bm', /Unknown chord/],
    ['Hm', /Unrecognised token/],
    ['1.0*0', /Bad duration/],
    ['1.0v', /strum direction/],
    ['x', /Unrecognised token/],
    ['1.0 | 1.0 | 1.0', /Bar 2 has 1 beats, expected 4/],
    ['r r', /no notes or chords/],
  ])('rejects %s', (tab, msg) => {
    expect(() => parseTab(tab, 4)).toThrow(TabParseError);
    expect(() => parseTab(tab, 4)).toThrow(msg);
  });
});
