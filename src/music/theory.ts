/**
 * Pure music-theory helpers. MIDI note numbers are the common currency:
 * 60 = C4, 69 = A4 (440 Hz). Guitar strings follow guitar convention: 1 = high e … 6 = low E.
 */

export const A4_HZ = 440;

/** Display names use sharps with the Unicode ♯ sign. */
export const NOTE_NAMES = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
] as const;

export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;
export const STRINGS: readonly StringNumber[] = [1, 2, 3, 4, 5, 6];

/** Standard tuning E2 A2 D3 G3 B3 E4, indexed by string number. */
export const STANDARD_TUNING: Readonly<Record<StringNumber, number>> = {
  1: 64,
  2: 59,
  3: 55,
  4: 50,
  5: 45,
  6: 40,
};

export const STRING_LABELS: Readonly<Record<StringNumber, string>> = {
  1: 'e',
  2: 'B',
  3: 'G',
  4: 'D',
  5: 'A',
  6: 'E',
};

export const MAX_FRET = 15;

export function isStringNumber(n: unknown): n is StringNumber {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 6;
}

export function midiToHz(midi: number, a4 = A4_HZ): number {
  return a4 * 2 ** ((midi - 69) / 12);
}

/** Fractional MIDI number for a frequency (e.g. 69.12 for a slightly sharp A4). */
export function hzToMidiFloat(hz: number, a4 = A4_HZ): number {
  return 69 + 12 * Math.log2(hz / a4);
}

export function hzToMidi(hz: number, a4 = A4_HZ): number {
  return Math.round(hzToMidiFloat(hz, a4));
}

/** Cents between a frequency and the exact pitch of a MIDI note (positive = sharp). */
export function centsFrom(hz: number, midi: number, a4 = A4_HZ): number {
  return 1200 * Math.log2(hz / midiToHz(midi, a4));
}

export function pitchClass(midi: number): number {
  return ((Math.round(midi) % 12) + 12) % 12;
}

export function octaveOf(midi: number): number {
  return Math.floor(Math.round(midi) / 12) - 1;
}

export function noteName(midi: number, withOctave = true): string {
  const name = NOTE_NAMES[pitchClass(midi)] ?? '?';
  return withOctave ? `${name}${octaveOf(midi)}` : name;
}

export function pitchClassName(pc: number): string {
  return NOTE_NAMES[((pc % 12) + 12) % 12] ?? '?';
}

export function fretToMidi(
  string: StringNumber,
  fret: number,
  tuning: Readonly<Record<StringNumber, number>> = STANDARD_TUNING,
): number {
  return tuning[string] + fret;
}

export interface FretPosition {
  string: StringNumber;
  fret: number;
}

/** All places a MIDI note can be played, lowest fret first. */
export function positionsForMidi(midi: number, maxFret = 12): FretPosition[] {
  const out: FretPosition[] = [];
  for (const s of STRINGS) {
    const fret = midi - STANDARD_TUNING[s];
    if (fret >= 0 && fret <= maxFret) out.push({ string: s, fret });
  }
  return out.sort((a, b) => a.fret - b.fret);
}

export function describePosition(p: FretPosition): string {
  const where = p.fret === 0 ? 'open' : `fret ${p.fret}`;
  return `string ${p.string} (${STRING_LABELS[p.string]}), ${where}`;
}

export interface NearestString {
  string: StringNumber;
  targetMidi: number;
  /** Cents relative to the open string's target pitch. */
  cents: number;
}

/** Nearest open string in standard tuning by pitch distance. */
export function nearestOpenString(hz: number): NearestString {
  const m = hzToMidiFloat(hz);
  let best: StringNumber = 6;
  let bestDist = Infinity;
  for (const s of STRINGS) {
    const d = Math.abs(m - STANDARD_TUNING[s]);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  const targetMidi = STANDARD_TUNING[best];
  return { string: best, targetMidi, cents: centsFrom(hz, targetMidi) };
}
