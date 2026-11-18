import { describe, expect, it } from 'vitest';
import {
  LESSONS,
  ORDERED_LESSONS,
  resolvePlayable,
  SONGS,
  UNITS,
} from '../../src/content/index.ts';
import { validateContent } from '../../src/content/validate.ts';
import { parseTab } from '../../src/music/tab.ts';
import { CHORD_IDS } from '../../src/music/chords.ts';

describe('content (S4-1, S4-2, NFR-LEGAL-1)', () => {
  it('passes validation', () => {
    expect(validateContent(UNITS, LESSONS, SONGS)).toEqual([]);
  });

  it('has about 20 lessons in 5 units and at least 6 songs', () => {
    expect(UNITS).toHaveLength(5);
    expect(LESSONS.length).toBeGreaterThanOrEqual(20);
    expect(SONGS.length).toBeGreaterThanOrEqual(6);
    expect(ORDERED_LESSONS).toHaveLength(LESSONS.length);
  });

  it('every song has provenance and no lyrics fields', () => {
    for (const s of SONGS) {
      expect(s.provenance).toMatch(/public domain/i);
      expect(JSON.stringify(s)).not.toMatch(/lyric/i);
    }
  });

  it('covers the planned chords in lessons', () => {
    const used = new Set<string>();
    for (const l of LESSONS)
      for (const st of parseTab(l.exercise.tab, l.exercise.beatsPerBar).steps)
        if (st.target.kind === 'chord') used.add(st.target.chord);
    for (const c of ['Em', 'Am', 'D', 'G', 'C', 'E', 'A', 'F']) expect(used.has(c)).toBe(true);
    for (const c of used) expect(CHORD_IDS).toContain(c);
  });

  it('melody lessons stay in first position (frets 0–5)', () => {
    for (const l of LESSONS)
      for (const st of parseTab(l.exercise.tab, l.exercise.beatsPerBar).steps)
        if (st.target.kind === 'note') expect(st.target.fret).toBeLessThanOrEqual(5);
  });

  it('validator catches bad content', () => {
    const bad = {
      ...LESSONS[0]!,
      id: 'bad',
      exercise: { tab: '7.0 1.0', bpm: 70, beatsPerBar: 4 },
    };
    const errors = validateContent(
      [{ ...UNITS[0]!, lessonIds: [...UNITS[0]!.lessonIds, 'bad'] }],
      [...LESSONS.slice(0, 4), bad],
      [],
    );
    expect(errors.join('\n')).toMatch(/String must be 1–6/);
  });

  it('resolves playables for lessons and songs', () => {
    expect(resolvePlayable('lesson', 'u1-open-e')?.subtitle).toBe('Lesson 1 · Meet your guitar');
    expect(resolvePlayable('song', 'ode-to-joy', 'chords')?.arrangementId).toBe('chords');
    expect(resolvePlayable('song', 'nope')).toBeUndefined();
  });
});
