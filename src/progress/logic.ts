import { ORDERED_LESSONS } from '../content/index.ts';
import type { Stars } from '../practice/scoring.ts';

export interface Best {
  stars: Stars;
  accuracy: number;
  plays: number;
  lastPlayed: string;
}

export type Bests = Record<string, Best>;

export interface Streak {
  count: number;
  lastDay: string | null;
}

/** Local calendar day as YYYY-MM-DD. */
export function localDay(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dayBefore(day: string): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return localDay(new Date(y, m - 1, d - 1));
}

/** FR-PRG-2: consecutive days with at least one completed exercise. */
export function nextStreak(streak: Streak, today: string): Streak {
  if (streak.lastDay === today) return streak;
  if (streak.lastDay && streak.lastDay === dayBefore(today))
    return { count: streak.count + 1, lastDay: today };
  return { count: 1, lastDay: today };
}

/** Streak as shown today: broken if the last practice was before yesterday. */
export function currentStreak(streak: Streak, today: string): number {
  if (!streak.lastDay) return 0;
  return streak.lastDay === today || streak.lastDay === dayBefore(today) ? streak.count : 0;
}

/** FR-LRN-3: the first lesson is open; each next one unlocks at ≥1 star on the previous. */
export function isLessonUnlocked(lessonId: string, bests: Bests, unlockAll = false): boolean {
  const i = ORDERED_LESSONS.findIndex((l) => l.id === lessonId);
  if (i < 0) return false;
  if (i === 0 || unlockAll) return true;
  const prev = ORDERED_LESSONS[i - 1]!;
  return (bests[prev.id]?.stars ?? 0) >= 1;
}

/** The first unlocked lesson without stars (or the last lesson if everything is done). */
export function nextUpLessonId(bests: Bests): string {
  const next = ORDERED_LESSONS.find(
    (l) => (bests[l.id]?.stars ?? 0) === 0 && isLessonUnlocked(l.id, bests),
  );
  return (next ?? ORDERED_LESSONS[ORDERED_LESSONS.length - 1]!).id;
}
