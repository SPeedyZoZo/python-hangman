import type { ChordHint } from '../audio/analysis/chordVerifier.ts';
import type { ChordId } from '../music/chords.ts';
import type { Step } from '../music/tab.ts';
import type { Grade, Mode, StepResult } from './session.ts';

export const GRADE_POINTS: Readonly<Record<Grade, number>> = {
  perfect: 1,
  good: 0.85,
  early: 0.6,
  late: 0.6,
  miss: 0,
  hit: 1,
};

/** Wait Mode: full marks for a first-try hit, less for each wrong attempt before it. */
export function stepScore(r: StepResult): number {
  if (r.grade === 'hit') return r.wrongAttempts === 0 ? 1 : r.wrongAttempts === 1 ? 0.7 : 0.4;
  return GRADE_POINTS[r.grade];
}

export type Stars = 0 | 1 | 2 | 3;

export function starsFor(accuracy: number): Stars {
  if (accuracy >= 0.95) return 3;
  if (accuracy >= 0.8) return 2;
  if (accuracy >= 0.6) return 1;
  return 0;
}

export interface WrongNote {
  targetMidi: number;
  heardMidi: number;
  string: number;
  fret: number;
}

export interface SessionSummary {
  mode: Mode;
  tempo: number;
  bpm: number;
  passes: number;
  totalSteps: number;
  counts: Record<Grade, number>;
  accuracy: number;
  stars: Stars;
  /** Mean signed timing offset of timed hits (ms); negative = rushing. */
  meanDeltaMs: number | null;
  wrongAttempts: number;
  wrongNotes: WrongNote[];
  chordIssues: { chord: ChordId; hints: ChordHint[] }[];
  meanAbsCents: number | null;
  /** Steps that start a new chord, and how many of those were missed or late. */
  changeSteps: number;
  changeProblems: number;
  durationMs: number;
}

export function summarize(
  results: StepResult[],
  steps: Step[],
  info: { mode: Mode; tempo: number; bpm: number; durationMs: number },
): SessionSummary {
  const byIndex = new Map(steps.map((s) => [s.index, s]));
  const counts: Record<Grade, number> = { perfect: 0, good: 0, early: 0, late: 0, miss: 0, hit: 0 };
  let points = 0;
  let deltaSum = 0;
  let deltaN = 0;
  let centsSum = 0;
  let centsN = 0;
  let wrongAttempts = 0;
  let changeSteps = 0;
  let changeProblems = 0;
  const wrongNotes: WrongNote[] = [];
  const chordIssues: SessionSummary['chordIssues'] = [];
  for (const r of results) {
    counts[r.grade]++;
    points += stepScore(r);
    wrongAttempts += r.wrongAttempts;
    if (r.deltaMs !== null && r.grade !== 'miss' && r.grade !== 'hit') {
      deltaSum += r.deltaMs;
      deltaN++;
    }
    if (r.cents !== null) {
      centsSum += Math.abs(r.cents);
      centsN++;
    }
    const step = byIndex.get(r.index);
    if (!step) continue;
    if (step.target.kind === 'note') {
      for (const heard of r.wrongHeard) {
        wrongNotes.push({
          targetMidi: step.target.midi,
          heardMidi: heard,
          string: step.target.string,
          fret: step.target.fret,
        });
      }
    } else {
      if (r.chordHints.length) chordIssues.push({ chord: step.target.chord, hints: r.chordHints });
      const prev = byIndex.get(r.index - 1);
      const isChange =
        !prev || prev.target.kind !== 'chord' || prev.target.chord !== step.target.chord;
      if (isChange && prev) {
        changeSteps++;
        if (r.grade === 'miss' || r.grade === 'late' || r.wrongAttempts > 0) changeProblems++;
      }
    }
  }
  const accuracy = results.length ? points / results.length : 0;
  const passes = results.reduce((m, r) => Math.max(m, r.pass), 0);
  return {
    mode: info.mode,
    tempo: info.tempo,
    bpm: info.bpm,
    passes,
    totalSteps: results.length,
    counts,
    accuracy,
    stars: starsFor(accuracy),
    meanDeltaMs: deltaN ? deltaSum / deltaN : null,
    wrongAttempts,
    wrongNotes,
    chordIssues,
    meanAbsCents: centsN ? centsSum / centsN : null,
    changeSteps,
    changeProblems,
    durationMs: info.durationMs,
  };
}

/** XP: proportional to stars, at least 5 for finishing; bonus for a first completion. */
export function xpFor(baseXp: number, stars: Stars, firstCompletion: boolean): number {
  const earned = Math.max(5, Math.round((baseXp * stars) / 3));
  return earned + (firstCompletion && stars > 0 ? 10 : 0);
}
