import { describe, expect, it } from 'vitest';
import { ORDERED_LESSONS } from '../../src/content/index.ts';
import type { SessionSummary } from '../../src/practice/scoring.ts';
import {
  currentStreak,
  dayBefore,
  isLessonUnlocked,
  nextStreak,
  nextUpLessonId,
} from '../../src/progress/logic.ts';
import { useProgress } from '../../src/progress/store.ts';

const summary = (stars: 0 | 1 | 2 | 3, accuracy: number): SessionSummary => ({
  mode: 'wait',
  tempo: 0.7,
  bpm: 70,
  passes: 1,
  totalSteps: 10,
  counts: { perfect: 0, good: 0, early: 0, late: 0, miss: 0, hit: 10 },
  accuracy,
  stars,
  meanDeltaMs: null,
  wrongAttempts: 0,
  wrongNotes: [],
  chordIssues: [],
  meanAbsCents: null,
  changeSteps: 0,
  changeProblems: 0,
  durationMs: 60000,
});

describe('progress (FR-PRG-1/2, FR-LRN-3)', () => {
  it('computes streaks across days and month boundaries', () => {
    expect(dayBefore('2026-03-01')).toBe('2026-02-28');
    let s = nextStreak({ count: 0, lastDay: null }, '2026-11-17');
    expect(s.count).toBe(1);
    s = nextStreak(s, '2026-11-17');
    expect(s.count).toBe(1);
    s = nextStreak(s, '2026-11-18');
    expect(s.count).toBe(2);
    expect(currentStreak(s, '2026-11-19')).toBe(2);
    expect(currentStreak(s, '2026-11-20')).toBe(0);
    expect(nextStreak(s, '2026-11-21').count).toBe(1);
  });

  it('unlocks lessons in order', () => {
    const [l1, l2, l3] = ORDERED_LESSONS;
    expect(isLessonUnlocked(l1!.id, {})).toBe(true);
    expect(isLessonUnlocked(l2!.id, {})).toBe(false);
    const bests = { [l1!.id]: { stars: 1 as const, accuracy: 0.6, plays: 1, lastPlayed: '' } };
    expect(isLessonUnlocked(l2!.id, bests)).toBe(true);
    expect(isLessonUnlocked(l3!.id, bests)).toBe(false);
    expect(nextUpLessonId(bests)).toBe(l2!.id);
  });

  it('records sessions, keeps bests and awards XP once for first completion', () => {
    const store = useProgress.getState();
    store.reset();
    const a = useProgress.getState().record('u1-open-e', summary(2, 0.85), 30, '2026-11-18');
    expect(a).toEqual({ xpEarned: 30, firstCompletion: true, newBest: true, streak: 1 });
    const b = useProgress.getState().record('u1-open-e', summary(1, 0.7), 30, '2026-11-18');
    expect(b.firstCompletion).toBe(false);
    expect(b.xpEarned).toBe(10);
    const best = useProgress.getState().bests['u1-open-e']!;
    expect(best).toMatchObject({ stars: 2, accuracy: 0.85, plays: 2 });
    expect(useProgress.getState().xp).toBe(40);
    expect(useProgress.getState().practiceMs).toBe(120000);
  });
});
