import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { xpFor, type SessionSummary } from '../practice/scoring.ts';
import { idbStorage } from './idbStorage.ts';
import { localDay, nextStreak, type Bests, type Streak } from './logic.ts';

export interface RecordOutcome {
  xpEarned: number;
  firstCompletion: boolean;
  newBest: boolean;
  streak: number;
}

interface ProgressState {
  bests: Bests;
  xp: number;
  streak: Streak;
  practiceMs: number;
  sessions: number;
  record: (key: string, summary: SessionSummary, baseXp: number, today?: string) => RecordOutcome;
  reset: () => void;
}

const EMPTY = {
  bests: {} as Bests,
  xp: 0,
  streak: { count: 0, lastDay: null } as Streak,
  practiceMs: 0,
  sessions: 0,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      record(key, summary, baseXp, today = localDay()) {
        const s = get();
        const prev = s.bests[key];
        const firstCompletion = !prev || prev.stars === 0;
        const xpEarned = xpFor(baseXp, summary.stars, firstCompletion);
        const newBest = !prev || summary.accuracy > prev.accuracy;
        const best = {
          stars: Math.max(prev?.stars ?? 0, summary.stars) as typeof summary.stars,
          accuracy: Math.max(prev?.accuracy ?? 0, summary.accuracy),
          plays: (prev?.plays ?? 0) + 1,
          lastPlayed: today,
        };
        const streak = nextStreak(s.streak, today);
        set({
          bests: { ...s.bests, [key]: best },
          xp: s.xp + xpEarned,
          streak,
          practiceMs: s.practiceMs + summary.durationMs,
          sessions: s.sessions + 1,
        });
        return { xpEarned, firstCompletion, newBest, streak: streak.count };
      },
      reset: () => set({ ...EMPTY }),
    }),
    {
      name: 'strumly.progress',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: ({ bests, xp, streak, practiceMs, sessions }) => ({
        bests,
        xp,
        streak,
        practiceMs,
        sessions,
      }),
    },
  ),
);
