import { LESSONS, UNITS } from './lessons.ts';
import { SONGS } from './songs.ts';
import type { Lesson, Playable, Song, Unit } from './types.ts';

export { LESSONS, SONGS, UNITS };

const lessonById = new Map(LESSONS.map((l) => [l.id, l]));
const songById = new Map(SONGS.map((s) => [s.id, s]));

export function getLesson(id: string): Lesson | undefined {
  return lessonById.get(id);
}

export function getSong(id: string): Song | undefined {
  return songById.get(id);
}

/** Lessons in curriculum order. */
export const ORDERED_LESSONS: Lesson[] = UNITS.flatMap((u) =>
  u.lessonIds.map((id) => lessonById.get(id)!).filter(Boolean),
);

export function unitOf(lessonId: string): Unit | undefined {
  return UNITS.find((u) => u.lessonIds.includes(lessonId));
}

export function lessonNumber(lessonId: string): number {
  return ORDERED_LESSONS.findIndex((l) => l.id === lessonId) + 1;
}

export function nextLessonId(lessonId: string): string | undefined {
  const i = ORDERED_LESSONS.findIndex((l) => l.id === lessonId);
  return i >= 0 ? ORDERED_LESSONS[i + 1]?.id : undefined;
}

/** Progress key for a playable: lesson id, or `song:<id>:<arrangement>`. */
export function playableKey(p: Pick<Playable, 'kind' | 'id' | 'arrangementId'>): string {
  return p.kind === 'lesson' ? p.id : `song:${p.id}:${p.arrangementId ?? 'melody'}`;
}

export function resolvePlayable(
  kind: string,
  id: string,
  arrangementId?: string,
): Playable | undefined {
  if (kind === 'lesson') {
    const l = lessonById.get(id);
    if (!l) return undefined;
    const unit = unitOf(id);
    return {
      kind: 'lesson',
      id: l.id,
      title: l.title,
      subtitle: `Lesson ${lessonNumber(id)}${unit ? ` · ${unit.title}` : ''}`,
      exercise: l.exercise,
      defaultMode: l.defaultMode,
      defaultTempo: l.defaultTempo,
      xp: l.xp,
      tips: l.tips,
    };
  }
  if (kind === 'song') {
    const s = songById.get(id);
    const arr = s?.arrangements.find((a) => a.id === arrangementId) ?? s?.arrangements[0];
    if (!s || !arr) return undefined;
    return {
      kind: 'song',
      id: s.id,
      arrangementId: arr.id,
      title: s.title,
      subtitle: `${arr.label} · ${s.credit}`,
      exercise: arr.exercise,
      defaultMode: 'wait',
      defaultTempo: 0.7,
      xp: 30 + s.difficulty * 20,
      tips: [],
    };
  }
  return undefined;
}
