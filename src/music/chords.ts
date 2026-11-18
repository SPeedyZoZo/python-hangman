import { pitchClass, pitchClassName, STANDARD_TUNING, type StringNumber } from './theory.ts';

export const CHORD_IDS = [
  'Em',
  'Am',
  'D',
  'G',
  'C',
  'E',
  'A',
  'Dm',
  'F',
  'G7',
  'E7',
  'A7',
] as const;
export type ChordId = (typeof CHORD_IDS)[number];

export interface ChordShape {
  id: ChordId;
  /** Spoken/display name. */
  name: string;
  /** Frets per string, index 0 = string 6 (low E) … index 5 = string 1 (high e). null = muted. */
  frets: readonly (number | null)[];
  /** Fretting finger per string (1 index … 4 pinky), 0 = open, null = muted. */
  fingers: readonly (number | null)[];
  tip: string;
}

export const CHORDS: Readonly<Record<ChordId, ChordShape>> = {
  Em: {
    id: 'Em',
    name: 'E minor',
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    tip: 'Two fingers on fret 2 of the A and D strings. Strum all six strings.',
  },
  Am: {
    id: 'Am',
    name: 'A minor',
    frets: [null, 0, 2, 2, 1, 0],
    fingers: [null, 0, 2, 3, 1, 0],
    tip: 'Same shape as E major, moved down a string. Skip the low E.',
  },
  D: {
    id: 'D',
    name: 'D major',
    frets: [null, null, 0, 2, 3, 2],
    fingers: [null, null, 0, 1, 3, 2],
    tip: 'A little triangle on the top three strings. Strum from the D string.',
  },
  G: {
    id: 'G',
    name: 'G major',
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    tip: 'Stretch wide: middle finger on the low E, ring finger on the high e.',
  },
  C: {
    id: 'C',
    name: 'C major',
    frets: [null, 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, 0, 1, 0],
    tip: 'A diagonal staircase. Keep the low E quiet and let the G string ring.',
  },
  E: {
    id: 'E',
    name: 'E major',
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    tip: 'Em plus your first finger on the G string, fret 1.',
  },
  A: {
    id: 'A',
    name: 'A major',
    frets: [null, 0, 2, 2, 2, 0],
    fingers: [null, 0, 1, 2, 3, 0],
    tip: 'Three fingers squeezed into fret 2. Keep the high e ringing.',
  },
  Dm: {
    id: 'Dm',
    name: 'D minor',
    frets: [null, null, 0, 2, 3, 1],
    fingers: [null, null, 0, 2, 3, 1],
    tip: 'Like D, but your first finger drops to fret 1 on the high e.',
  },
  F: {
    id: 'F',
    name: 'F major (mini)',
    frets: [null, null, 3, 2, 1, 1],
    fingers: [null, null, 3, 2, 1, 1],
    tip: 'A small F: your first finger covers the top two strings at fret 1.',
  },
  G7: {
    id: 'G7',
    name: 'G seven',
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
    tip: 'Like G, with fret 1 on the high e for a bluesy pull towards C.',
  },
  E7: {
    id: 'E7',
    name: 'E seven',
    frets: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
    tip: 'E major with the ring finger lifted.',
  },
  A7: {
    id: 'A7',
    name: 'A seven',
    frets: [null, 0, 2, 0, 2, 0],
    fingers: [null, 0, 2, 0, 3, 0],
    tip: 'A major with the middle string left open.',
  },
};

export function isChordId(s: string): s is ChordId {
  return (CHORD_IDS as readonly string[]).includes(s);
}

/** String number for an index into `frets` (0 → string 6). */
export function stringForIndex(i: number): StringNumber {
  return (6 - i) as StringNumber;
}

export interface VoicingNote {
  string: StringNumber;
  fret: number;
  midi: number;
}

/** Sounding notes from low string to high string. */
export function voicing(id: ChordId): VoicingNote[] {
  const shape = CHORDS[id];
  const out: VoicingNote[] = [];
  shape.frets.forEach((fret, i) => {
    if (fret === null || fret === undefined) return;
    const string = stringForIndex(i);
    out.push({ string, fret, midi: STANDARD_TUNING[string] + fret });
  });
  return out;
}

export function chordPitchClasses(id: ChordId): number[] {
  return [...new Set(voicing(id).map((n) => pitchClass(n.midi)))];
}

export function chordNoteNames(id: ChordId): string[] {
  return voicing(id).map((n) => pitchClassName(pitchClass(n.midi)));
}
