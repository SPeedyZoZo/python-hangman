import type { ChordHint } from '../audio/analysis/chordVerifier.ts';
import type { Step } from '../music/tab.ts';
import { describePosition, noteName } from '../music/theory.ts';
import type { StepResult } from '../practice/session.ts';

export interface Feedback {
  tone: 'good' | 'warn' | 'bad' | 'info';
  text: string;
}

const PRAISE = ['Nice!', 'Great!', 'Yes!', 'Spot on!', 'Lovely!'];

export function feedbackForResult(r: StepResult): Feedback {
  switch (r.grade) {
    case 'perfect':
      return { tone: 'good', text: 'Perfect timing!' };
    case 'good':
      return { tone: 'good', text: 'Good!' };
    case 'early':
      return { tone: 'warn', text: 'A little early' };
    case 'late':
      return { tone: 'warn', text: 'A little late' };
    case 'miss':
      return { tone: 'bad', text: 'Missed that one. Keep going!' };
    default:
      return { tone: 'good', text: PRAISE[r.index % PRAISE.length]! };
  }
}

export function hintText(hints: ChordHint[]): string {
  const missing = hints.find((h) => h.kind === 'missing');
  if (missing) {
    return missing.string
      ? `${missing.note} is quiet: check string ${missing.string}.`
      : `${missing.note} is quiet: check every finger is pressing cleanly.`;
  }
  const extra = hints.find((h) => h.kind === 'extra');
  if (extra) return `An extra ${extra.note} is ringing: mute strings you shouldn't play.`;
  return 'Check your finger positions.';
}

export function feedbackForWrong(step: Step, heardMidi?: number, hints?: ChordHint[]): Feedback {
  if (step.target.kind === 'chord') {
    return { tone: 'bad', text: `Not quite ${step.target.chord}. ${hintText(hints ?? [])}` };
  }
  const want = step.target;
  if (heardMidi === undefined) return { tone: 'bad', text: `Try ${describePosition(want)}.` };
  const diff = heardMidi - want.midi;
  let advice = `play ${describePosition(want)}`;
  if (Math.abs(diff) <= 2 && diff !== 0)
    advice = `${Math.abs(diff)} fret${Math.abs(diff) > 1 ? 's' : ''} too ${diff > 0 ? 'high' : 'low'}? Aim for ${describePosition(want)}`;
  return { tone: 'bad', text: `Heard ${noteName(heardMidi)}: ${advice}.` };
}
