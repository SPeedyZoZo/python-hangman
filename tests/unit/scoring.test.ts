import { describe, expect, it } from 'vitest';
import { parseTab } from '../../src/music/tab.ts';
import { starsFor, stepScore, summarize, xpFor } from '../../src/practice/scoring.ts';
import type { StepResult } from '../../src/practice/session.ts';

const r = (
  index: number,
  grade: StepResult['grade'],
  extra: Partial<StepResult> = {},
): StepResult => ({
  index,
  pass: 1,
  grade,
  deltaMs: null,
  wrongAttempts: 0,
  wrongHeard: [],
  chordHints: [],
  cents: null,
  ...extra,
});

describe('scoring (FR-RES-1)', () => {
  it('maps accuracy to stars', () => {
    expect(starsFor(0.96)).toBe(3);
    expect(starsFor(0.85)).toBe(2);
    expect(starsFor(0.6)).toBe(1);
    expect(starsFor(0.59)).toBe(0);
  });

  it('penalises wrong attempts in Wait Mode', () => {
    expect(stepScore(r(0, 'hit'))).toBe(1);
    expect(stepScore(r(0, 'hit', { wrongAttempts: 1 }))).toBe(0.7);
    expect(stepScore(r(0, 'hit', { wrongAttempts: 3 }))).toBe(0.4);
  });

  it('summarises a play-along session', () => {
    const steps = parseTab('G*4 | D*4 | G*4 | 1.0', 4).steps;
    const res = [
      r(0, 'perfect', { deltaMs: 20 }),
      r(1, 'late', { deltaMs: 200 }),
      r(2, 'good', { deltaMs: 120 }),
      r(3, 'miss', { wrongHeard: [65] }),
    ];
    const s = summarize(res, steps, { mode: 'play', tempo: 0.8, bpm: 70, durationMs: 10000 });
    expect(s.counts).toMatchObject({ perfect: 1, late: 1, good: 1, miss: 1 });
    expect(s.accuracy).toBeCloseTo((1 + 0.6 + 0.85 + 0) / 4, 5);
    expect(s.stars).toBe(1);
    expect(s.meanDeltaMs).toBeCloseTo(340 / 3, 5);
    expect(s.changeSteps).toBe(2);
    expect(s.changeProblems).toBe(1);
    expect(s.wrongNotes).toEqual([{ targetMidi: 64, heardMidi: 65, string: 1, fret: 0 }]);
  });

  it('awards XP', () => {
    expect(xpFor(30, 3, true)).toBe(40);
    expect(xpFor(30, 2, false)).toBe(20);
    expect(xpFor(30, 0, true)).toBe(5);
  });
});
