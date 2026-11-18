import { parseTab, TabParseError } from '../music/tab.ts';
import type { Exercise, Lesson, Song, Unit } from './types.ts';

const TEMPOS = [0.5, 0.6, 0.7, 0.8, 0.9, 1];

function checkExercise(where: string, ex: Exercise, errors: string[]) {
  if (ex.bpm < 40 || ex.bpm > 160) errors.push(`${where}: bpm ${ex.bpm} outside 40–160`);
  if (ex.beatsPerBar < 2 || ex.beatsPerBar > 6)
    errors.push(`${where}: beatsPerBar ${ex.beatsPerBar} outside 2–6`);
  try {
    parseTab(ex.tab, ex.beatsPerBar);
  } catch (e) {
    errors.push(`${where}: ${e instanceof TabParseError ? e.message : String(e)}`);
  }
}

/** Returns a list of human-readable problems (empty = valid). Runs in unit tests and CI. */
export function validateContent(units: Unit[], lessons: Lesson[], songs: Song[]): string[] {
  const errors: string[] = [];
  const lessonIds = new Set<string>();
  for (const l of lessons) {
    if (lessonIds.has(l.id)) errors.push(`Duplicate lesson id ${l.id}`);
    lessonIds.add(l.id);
    if (!l.title.trim()) errors.push(`${l.id}: empty title`);
    if (!l.objectives.length) errors.push(`${l.id}: needs at least one objective`);
    if (l.tips.length < 1 || l.tips.length > 3) errors.push(`${l.id}: needs 1–3 tips`);
    if (!TEMPOS.includes(l.defaultTempo))
      errors.push(`${l.id}: defaultTempo must be one of ${TEMPOS.join(', ')}`);
    if (l.xp <= 0) errors.push(`${l.id}: xp must be positive`);
    checkExercise(l.id, l.exercise, errors);
  }
  const seenInUnits = new Map<string, string>();
  const unitIds = new Set<string>();
  for (const u of units) {
    if (unitIds.has(u.id)) errors.push(`Duplicate unit id ${u.id}`);
    unitIds.add(u.id);
    for (const id of u.lessonIds) {
      if (!lessonIds.has(id)) errors.push(`${u.id}: unknown lesson ${id}`);
      if (seenInUnits.has(id))
        errors.push(`${id} appears in both ${seenInUnits.get(id)} and ${u.id}`);
      seenInUnits.set(id, u.id);
    }
  }
  for (const l of lessons) {
    if (!seenInUnits.has(l.id)) errors.push(`${l.id} is not in any unit`);
    else if (seenInUnits.get(l.id) !== l.unitId)
      errors.push(`${l.id}: unitId ${l.unitId} doesn't match unit ${seenInUnits.get(l.id)}`);
  }
  const songIds = new Set<string>();
  for (const s of songs) {
    if (songIds.has(s.id)) errors.push(`Duplicate song id ${s.id}`);
    songIds.add(s.id);
    if (!s.provenance.trim()) errors.push(`${s.id}: provenance is required (public domain only)`);
    if (!s.arrangements.length) errors.push(`${s.id}: needs at least one arrangement`);
    for (const a of s.arrangements) checkExercise(`${s.id}/${a.id}`, a.exercise, errors);
  }
  return errors;
}
