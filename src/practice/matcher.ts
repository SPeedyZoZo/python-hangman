import type { AudioFrame } from '../audio/analysis/FrameAnalyzer.ts';
import { verifyChord, type ChordHint } from '../audio/analysis/chordVerifier.ts';
import type { DetectionParams } from '../audio/analysis/sensitivity.ts';
import type { Target } from '../music/tab.ts';

export type MatchKind = 'match' | 'other' | 'none';

export interface MatchResult {
  kind: MatchKind;
  /** For notes: the heard MIDI note. */
  heardMidi?: number;
  cents?: number;
  /** For chords: similarity score and hints. */
  score?: number;
  hints?: ChordHint[];
}

/**
 * Does this frame sound like the target?
 * - 'match': yes
 * - 'other': a confident, different sound (counts towards wrong attempts)
 * - 'none': nothing usable (silence, noise, no chroma)
 */
export function matchTarget(
  target: Target,
  frame: AudioFrame,
  params: DetectionParams,
): MatchResult {
  if (target.kind === 'note') {
    const p = frame.pitch;
    if (!p) return { kind: 'none' };
    const d = p.midi - target.midi;
    const ok = (d === 0 || (params.octaveLenient && Math.abs(d) === 12)) && Math.abs(p.cents) <= 50;
    return { kind: ok ? 'match' : 'other', heardMidi: p.midi, cents: p.cents };
  }
  if (!frame.chroma) return { kind: 'none' };
  const v = verifyChord(target.chord, frame.chroma, params);
  return { kind: v.match ? 'match' : 'other', score: v.score, hints: v.hints };
}

/** Consecutive matching frames required before a step counts. */
export function stableFramesFor(target: Target): number {
  return target.kind === 'chord' ? 3 : 2;
}

/** How long after an onset a match may still be credited to it. */
export function maxMatchDelayMs(target: Target): number {
  return target.kind === 'chord' ? 700 : 450;
}
