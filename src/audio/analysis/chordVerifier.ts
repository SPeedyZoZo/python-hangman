import { CHORD_IDS, voicing, type ChordId } from '../../music/chords.ts';
import { pitchClass, pitchClassName, type StringNumber } from '../../music/theory.ts';
import { cosine } from './chroma.ts';
import type { DetectionParams } from './sensitivity.ts';

/**
 * Chord *verification* (ADR-0003): compare observed chroma with a harmonic-aware template of the
 * expected voicing, and require it to beat every other chord in the library by a margin.
 */

const HARMONICS = 6;
const HARMONIC_DECAY = 0.75;

const templateCache = new Map<ChordId, Float32Array>();

/** Expected chroma of a voicing: each string's fundamental plus decaying harmonics. */
export function chordTemplate(id: ChordId): Float32Array {
  const cached = templateCache.get(id);
  if (cached) return cached;
  const t = new Float32Array(12);
  for (const n of voicing(id)) {
    for (let h = 1; h <= HARMONICS; h++) {
      const pc = pitchClass(n.midi + 12 * Math.log2(h));
      t[pc] = t[pc]! + HARMONIC_DECAY ** (h - 1);
    }
  }
  let norm = 0;
  for (let i = 0; i < 12; i++) norm += t[i]! * t[i]!;
  norm = Math.sqrt(norm);
  for (let i = 0; i < 12; i++) t[i] = t[i]! / norm;
  templateCache.set(id, t);
  return t;
}

export interface ChordHint {
  kind: 'missing' | 'extra';
  pitchClass: number;
  note: string;
  /** Set when the missing note is played on exactly one string of the voicing. */
  string?: StringNumber;
}

export interface ChordVerdict {
  match: boolean;
  score: number;
  /** Best competing chord and its score. */
  rival: { id: ChordId; score: number } | null;
  hints: ChordHint[];
}

export function scoreChords(chroma: ArrayLike<number>, candidates: readonly ChordId[] = CHORD_IDS) {
  return candidates.map((id) => ({ id, score: cosine(chroma, chordTemplate(id)) }));
}

export function verifyChord(
  target: ChordId,
  chroma: ArrayLike<number>,
  params: DetectionParams,
): ChordVerdict {
  const scores = scoreChords(chroma);
  const score = scores.find((s) => s.id === target)!.score;
  let rival: ChordVerdict['rival'] = null;
  for (const s of scores) if (s.id !== target && (!rival || s.score > rival.score)) rival = s;
  const match = score >= params.chordThreshold && score - (rival?.score ?? 0) >= params.chordMargin;
  return { match, score, rival, hints: match ? [] : chordHints(target, chroma) };
}

/** Which chord tones are weak, and which non-chord tones are loud. */
export function chordHints(target: ChordId, chroma: ArrayLike<number>): ChordHint[] {
  const notes = voicing(target);
  const tones = [...new Set(notes.map((n) => pitchClass(n.midi)))];
  let maxTone = 0;
  for (const pc of tones) maxTone = Math.max(maxTone, chroma[pc]!);
  if (maxTone <= 0) return [];
  const hints: ChordHint[] = [];
  for (const pc of tones) {
    if (chroma[pc]! < 0.35 * maxTone) {
      const onStrings = notes.filter((n) => pitchClass(n.midi) === pc);
      hints.push({
        kind: 'missing',
        pitchClass: pc,
        note: pitchClassName(pc),
        string: onStrings.length === 1 ? onStrings[0]!.string : undefined,
      });
    }
  }
  for (let pc = 0; pc < 12; pc++) {
    if (tones.includes(pc)) continue;
    // Harmonics of chord tones (e.g. the 5th harmonic) are expected; only flag strong extras.
    const expected = chordTemplate(target)[pc]!;
    if (chroma[pc]! > 0.6 * maxTone && chroma[pc]! > expected * 2.5) {
      hints.push({ kind: 'extra', pitchClass: pc, note: pitchClassName(pc) });
    }
  }
  return hints;
}
