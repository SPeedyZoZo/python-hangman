import { CHORD_IDS, voicing, type ChordId } from '../../music/chords.ts';
import { pitchClass, pitchClassName, type StringNumber } from '../../music/theory.ts';
import { CHROMA_DEFAULTS, cosine } from './chroma.ts';
import type { DetectionParams } from './sensitivity.ts';

/**
 * Chord *verification* (ADR-0003): compare observed chroma with a harmonic-aware template of the
 * expected voicing, and require it to beat every other chord in the library by a margin.
 */

export interface TemplateOptions {
  harmonics: number;
  decay: number;
  /** Harmonics above this frequency are outside the chroma band and left out. */
  maxHz: number;
}

export const TEMPLATE_DEFAULTS: TemplateOptions = {
  harmonics: 8,
  decay: 0.9,
  maxHz: CHROMA_DEFAULTS.maxHz,
};

const templateCache = new Map<string, Float32Array>();

/** Expected chroma of a voicing: each string's fundamental plus decaying in-band harmonics. */
export function chordTemplate(
  id: ChordId,
  opts: TemplateOptions = TEMPLATE_DEFAULTS,
): Float32Array {
  const key = `${id}|${opts.harmonics}|${opts.decay}|${opts.maxHz}`;
  const cached = templateCache.get(key);
  if (cached) return cached;
  const t = new Float32Array(12);
  for (const n of voicing(id)) {
    const f0 = 440 * 2 ** ((n.midi - 69) / 12);
    for (let h = 1; h <= opts.harmonics; h++) {
      if (f0 * h > opts.maxHz) break;
      const pc = pitchClass(n.midi + 12 * Math.log2(h));
      t[pc] = t[pc]! + opts.decay ** (h - 1);
    }
  }
  let norm = 0;
  for (let i = 0; i < 12; i++) norm += t[i]! * t[i]!;
  norm = Math.sqrt(norm);
  for (let i = 0; i < 12; i++) t[i] = t[i]! / norm;
  templateCache.set(key, t);
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

export function scoreChords(
  chroma: ArrayLike<number>,
  candidates: readonly ChordId[] = CHORD_IDS,
  opts: TemplateOptions = TEMPLATE_DEFAULTS,
) {
  return candidates.map((id) => ({ id, score: cosine(chroma, chordTemplate(id, opts)) }));
}

/** Rivals scoring within this much of the target get the note-level discrimination test. */
const CLOSE_RACE = 0.1;

const tonesCache = new Map<ChordId, number[]>();
export function chordTones(id: ChordId): number[] {
  let t = tonesCache.get(id);
  if (!t) {
    t = [...new Set(voicing(id).map((n) => pitchClass(n.midi)))];
    tonesCache.set(id, t);
  }
  return t;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/**
 * Does the target beat a close rival on the notes that tell them apart?
 * - both have unique notes (E vs Em: G♯ vs G): target's unique notes must be louder.
 * - target ⊂ rival (G vs G7): the rival's extra note must be quiet.
 * - rival ⊂ target (G7 vs G): the target's extra note must be clearly present.
 */
export function beatsRival(
  target: ChordId,
  rival: ChordId,
  chroma: ArrayLike<number>,
  params: DetectionParams,
): boolean {
  const t = chordTones(target);
  const r = chordTones(rival);
  const onlyT = t.filter((pc) => !r.includes(pc));
  const onlyR = r.filter((pc) => !t.includes(pc));
  const toneLevel = mean(t.map((pc) => chroma[pc]!));
  if (onlyT.length && onlyR.length) {
    return (
      mean(onlyT.map((pc) => chroma[pc]!)) >=
      params.chordDiscrimination * mean(onlyR.map((pc) => chroma[pc]!))
    );
  }
  if (!onlyT.length) {
    // Target ⊂ rival: the rival's extra note must not exceed what the target's own harmonics explain.
    const leak = harmonicLeak(target, chroma);
    return onlyR.every((pc) => chroma[pc]! - leak(pc) < params.chordAbsent * toneLevel);
  }
  // Rival ⊂ target: the target's extra note must be clearly louder than the rival's harmonics explain.
  const leak = harmonicLeak(rival, chroma);
  return onlyT.every((pc) => chroma[pc]! - leak(pc) >= (params.chordAbsent / 2) * toneLevel);
}

/** Expected energy at a pitch class from the harmonics of `id`, scaled to the observed chord tones. */
function harmonicLeak(id: ChordId, chroma: ArrayLike<number>): (pc: number) => number {
  const tmpl = chordTemplate(id);
  const tones = chordTones(id);
  const scale =
    mean(tones.map((pc) => chroma[pc]!)) / Math.max(1e-9, mean(tones.map((pc) => tmpl[pc]!)));
  return (pc: number) => tmpl[pc]! * scale;
}

export function verifyChord(
  target: ChordId,
  chroma: ArrayLike<number>,
  params: DetectionParams,
): ChordVerdict {
  const scores = scoreChords(chroma);
  const score = scores.find((s) => s.id === target)!.score;
  let rival: ChordVerdict['rival'] = null;
  let match =
    score >= params.chordThreshold &&
    chordHints(target, chroma, params).every((h) => h.kind !== 'missing');
  for (const s of scores) {
    if (s.id === target) continue;
    if (!rival || s.score > rival.score) rival = s;
    if (match && s.score >= score - CLOSE_RACE && !beatsRival(target, s.id, chroma, params))
      match = false;
  }
  return { match, score, rival, hints: match ? [] : chordHints(target, chroma, params) };
}

/**
 * Which chord tones are weak, and which non-chord tones are loud.
 * A tone is "missing" when it is below `chordTonePresence` × the level the voicing template
 * predicts for it (a note on one string is expected to be quieter than one on three strings).
 */
export function chordHints(
  target: ChordId,
  chroma: ArrayLike<number>,
  params: DetectionParams,
): ChordHint[] {
  const notes = voicing(target);
  const tones = chordTones(target);
  const tmpl = chordTemplate(target);
  const observed = mean(tones.map((pc) => chroma[pc]!));
  if (observed <= 0) return [];
  const scale = observed / Math.max(1e-9, mean(tones.map((pc) => tmpl[pc]!)));
  let maxTone = 0;
  for (const pc of tones) maxTone = Math.max(maxTone, chroma[pc]!);
  const hints: ChordHint[] = [];
  for (const pc of tones) {
    if (chroma[pc]! < params.chordTonePresence * tmpl[pc]! * scale) {
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
    // Harmonics of chord tones are expected; only flag strong extras.
    if (chroma[pc]! > 0.6 * maxTone && chroma[pc]! > tmpl[pc]! * scale * 2.5) {
      hints.push({ kind: 'extra', pitchClass: pc, note: pitchClassName(pc) });
    }
  }
  return hints;
}
