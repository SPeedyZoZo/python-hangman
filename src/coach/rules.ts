import { CHORDS, stringForIndex, type ChordId } from '../music/chords.ts';
import { fretToMidi, noteName, STRING_LABELS, type StringNumber } from '../music/theory.ts';
import type { SessionSummary } from '../practice/scoring.ts';
import type { CoachTip } from './types.ts';

/**
 * Rule-based coaching (curriculum.md → "Coaching rules"). Each rule inspects the session summary
 * and may return a tip with a priority; the coach shows the top three.
 */
export interface RuledTip extends CoachTip {
  priority: number;
}

type Rule = (s: SessionSummary) => RuledTip | null;

const pct = (x: number) => `${Math.round(x * 100)}%`;
const FINGER = ['', 'first (index)', 'second (middle)', 'third (ring)', 'fourth (pinky)'];

function mostCommon<T>(items: T[], key: (t: T) => string): { item: T; count: number } | null {
  const counts = new Map<string, { item: T; count: number }>();
  for (const it of items) {
    const k = key(it);
    const c = counts.get(k) ?? { item: it, count: 0 };
    c.count++;
    counts.set(k, c);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)[0] ?? null;
}

export const fretSlip: Rule = (s) => {
  const slips = s.wrongNotes.filter((w) => {
    const d = w.heardMidi - w.targetMidi;
    return d !== 0 && Math.abs(d) <= 2 && w.fret + d >= 0;
  });
  if (slips.length < 2 || slips.length < s.wrongNotes.length / 2) return null;
  const top = mostCommon(
    slips,
    (w) => `${w.string}.${w.fret}.${Math.sign(w.heardMidi - w.targetMidi)}`,
  )!.item;
  const d = top.heardMidi - top.targetMidi;
  const where =
    top.fret === 0
      ? `the open ${STRING_LABELS[top.string as StringNumber]} string`
      : `fret ${top.fret} on string ${top.string}`;
  return {
    id: 'fret-slip',
    priority: 80,
    title: `${d > 0 ? 'A fret too high' : 'A fret too low'}.`,
    body:
      top.fret === 0
        ? `Some notes came out as ${noteName(top.heardMidi)} instead of ${noteName(top.targetMidi)}. For ${where}, lift every finger off that string.`
        : `Some notes came out as ${noteName(top.heardMidi)} instead of ${noteName(top.targetMidi)}. Aim for ${where}, and press just behind the fret wire.`,
  };
};

export const wrongString: Rule = (s) => {
  const crossed = s.wrongNotes.filter((w) =>
    [w.string - 1, w.string + 1].some(
      (adj) => adj >= 1 && adj <= 6 && fretToMidi(adj as StringNumber, w.fret) === w.heardMidi,
    ),
  );
  if (crossed.length < 2) return null;
  const top = mostCommon(crossed, (w) => `${w.string}.${w.heardMidi}`)!.item;
  const other = ([top.string - 1, top.string + 1] as StringNumber[]).find(
    (adj) => adj >= 1 && adj <= 6 && fretToMidi(adj, top.fret) === top.heardMidi,
  )!;
  return {
    id: 'wrong-string',
    priority: 85,
    title: 'Right fret, wrong string.',
    body: `You sometimes hit string ${other} (${STRING_LABELS[other]}) instead of string ${top.string} (${STRING_LABELS[top.string as StringNumber]}). Rest your picking hand lightly on the bridge to keep your aim steady.`,
  };
};

export const timing: Rule = (s) => {
  if (s.mode !== 'play' || s.meanDeltaMs === null) return null;
  if (s.meanDeltaMs < -60)
    return {
      id: 'rushing',
      priority: 70,
      title: "You're rushing a little.",
      body: 'You tended to play ahead of the beat. Count along with the metronome and wait for each click.',
    };
  if (s.meanDeltaMs > 60)
    return {
      id: 'dragging',
      priority: 70,
      title: "You're a touch behind the beat.",
      body: 'Look one note ahead on the highway so your fingers are ready before the note reaches the line.',
    };
  return null;
};

export const lateChanges: Rule = (s) => {
  if (s.changeSteps < 2 || s.changeProblems / s.changeSteps < 0.4) return null;
  return {
    id: 'late-changes',
    priority: 90,
    title: 'Chord changes are the tricky bit.',
    body: 'Start moving to the next chord on the last beat of the current one, even if the last strum is a bit messy. Practise just the change with the loop.',
  };
};

export const missingTone: Rule = (s) => {
  const missing = s.chordIssues.flatMap((c) =>
    c.hints.filter((h) => h.kind === 'missing').map((h) => ({ chord: c.chord, hint: h })),
  );
  if (!missing.length) return null;
  const top = mostCommon(missing, (m) => `${m.chord}.${m.hint.note}`)!;
  if (top.count < 2) return null;
  const { chord, hint } = top.item;
  const shape = CHORDS[chord as ChordId];
  let advice =
    'Check that every finger is pressing cleanly and arched so it doesn’t touch other strings.';
  if (hint.string) {
    const idx = shape.frets.findIndex((_, i) => stringForIndex(i) === hint.string);
    const fret = shape.frets[idx];
    const finger = shape.fingers[idx];
    advice =
      fret === 0
        ? `String ${hint.string} should ring open: arch your fingers so none of them touch it.`
        : `Press your ${FINGER[finger ?? 0] ?? ''} finger firmly at fret ${fret} on string ${hint.string}, right behind the fret wire.`;
  }
  return {
    id: 'missing-tone',
    priority: 88,
    title: `In ${chord}, the ${hint.note} isn't ringing.`,
    body: advice,
  };
};

export const readyForMore: Rule = (s) => {
  if (s.accuracy < 0.95) return null;
  if (s.mode === 'wait')
    return {
      id: 'try-play-along',
      priority: 60,
      title: 'Nailed it!',
      body: 'Ready for a challenge? Switch to Play-along and keep the music moving.',
    };
  if (s.tempo < 1)
    return {
      id: 'speed-up',
      priority: 60,
      title: 'Nailed it!',
      body: `Try it at ${pct(Math.min(1, s.tempo + 0.1))} tempo next.`,
    };
  return {
    id: 'full-speed',
    priority: 40,
    title: 'Full speed, full marks.',
    body: 'Move on to the next lesson, or play a song that uses these skills.',
  };
};

export const struggling: Rule = (s) => {
  if (s.accuracy >= 0.6) return null;
  if (s.mode === 'play')
    return {
      id: 'slow-down',
      priority: 95,
      title: 'Let’s make it easier.',
      body: `Switch to Wait Mode, or drop the tempo to ${pct(Math.max(0.5, s.tempo - 0.2))}. Slow and clean beats fast and messy.`,
    };
  return {
    id: 'slow-down-wait',
    priority: 95,
    title: 'Take it one note at a time.',
    body: 'Listen first, then look at the next gem before you play. Accuracy first, then speed.',
  };
};

export const tuning: Rule = (s) => {
  if (s.meanAbsCents === null || s.meanAbsCents <= 20) return null;
  return {
    id: 'tuning',
    priority: 75,
    title: 'Your guitar may be out of tune.',
    body: 'Notes were a little off-pitch on average. A quick visit to the tuner will make everything sound better.',
  };
};

const ENCOURAGE = [
  'Short, regular practice beats long, rare sessions. Five minutes a day adds up.',
  'Sore fingertips are normal for the first few weeks. They toughen up fast.',
  'Every guitarist started exactly where you are. Keep going!',
];

export const encourage: Rule = (s) => ({
  id: 'encourage',
  priority: 10,
  title: s.stars >= 2 ? 'Great session.' : 'Keep at it.',
  body: ENCOURAGE[Math.floor(s.durationMs / 1000) % ENCOURAGE.length]!,
});

export const RULES: Rule[] = [
  struggling,
  lateChanges,
  missingTone,
  wrongString,
  fretSlip,
  tuning,
  timing,
  readyForMore,
  encourage,
];

export function tipsFor(summary: SessionSummary, max = 3): CoachTip[] {
  return RULES.map((r) => r(summary))
    .filter((t): t is RuledTip => t !== null)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, max)
    .map(({ id, title, body }) => ({ id, title, body }));
}
