import { isChordId, type ChordId } from './chords.ts';
import { fretToMidi, isStringNumber, MAX_FRET, type StringNumber } from './theory.ts';

/** Tab DSL. See docs/04-architecture/content-schema.md. */

export interface NoteTarget {
  kind: 'note';
  string: StringNumber;
  fret: number;
  midi: number;
}
export interface ChordTarget {
  kind: 'chord';
  chord: ChordId;
  strum: 'down' | 'up';
}
export type Target = NoteTarget | ChordTarget;

export interface Step {
  /** Index among playable steps (rests excluded). */
  index: number;
  /** Start beat from the beginning of the exercise. */
  beat: number;
  beats: number;
  /** 0-based bar number. */
  bar: number;
  target: Target;
}

export interface ParsedTab {
  steps: Step[];
  /** Start beat of each bar. */
  barStarts: number[];
  totalBeats: number;
}

export class TabParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TabParseError';
  }
}

// Chord names: root, optional accidental, optional quality (e.g. Em, F#m, G7, Cmaj7, Dsus4).
const TOKEN =
  /^(?:(\d)\.(\d{1,2})|(r)|([A-G][#b]?(?:maj7|m7|m|7|sus2|sus4|dim|aug)?))(?:\*(\d+(?:\.\d+)?|\.\d+))?([v^])?$/;

export function parseTab(tab: string, beatsPerBar: number): ParsedTab {
  const steps: Step[] = [];
  const barStarts: number[] = [0];
  const barSums: number[] = [0];
  let beat = 0;
  let bar = 0;
  const tokens = tab.trim().split(/\s+/).filter(Boolean);
  tokens.forEach((tok, pos) => {
    if (tok === '|') {
      bar++;
      barStarts.push(beat);
      barSums.push(0);
      return;
    }
    const m = TOKEN.exec(tok);
    if (!m) throw new TabParseError(`Unrecognised token "${tok}" at position ${pos + 1}`);
    const [, sStr, fStr, rest, chord, durStr, dir] = m;
    const beats = durStr ? Number(durStr) : 1;
    if (!(beats > 0) || !Number.isFinite(beats))
      throw new TabParseError(`Bad duration in "${tok}"`);
    if (rest) {
      if (dir) throw new TabParseError(`Rests can't have a strum direction ("${tok}")`);
    } else if (chord) {
      if (!isChordId(chord)) throw new TabParseError(`Unknown chord "${chord}" in "${tok}"`);
      steps.push({
        index: steps.length,
        beat,
        beats,
        bar,
        target: { kind: 'chord', chord, strum: dir === '^' ? 'up' : 'down' },
      });
    } else {
      const string = Number(sStr);
      const fret = Number(fStr);
      if (!isStringNumber(string)) throw new TabParseError(`String must be 1–6 in "${tok}"`);
      if (fret > MAX_FRET) throw new TabParseError(`Fret must be 0–${MAX_FRET} in "${tok}"`);
      if (dir) throw new TabParseError(`Single notes can't have a strum direction ("${tok}")`);
      steps.push({
        index: steps.length,
        beat,
        beats,
        bar,
        target: { kind: 'note', string, fret, midi: fretToMidi(string, fret) },
      });
    }
    beat += beats;
    barSums[bar] = (barSums[bar] ?? 0) + beats;
  });
  // Every bar except the first (pickup) and the last must be complete.
  barSums.forEach((sum, i) => {
    if (i === 0 || i === barSums.length - 1) {
      if (sum > beatsPerBar + 1e-9)
        throw new TabParseError(`Bar ${i + 1} has ${sum} beats (max ${beatsPerBar})`);
      return;
    }
    if (Math.abs(sum - beatsPerBar) > 1e-9)
      throw new TabParseError(`Bar ${i + 1} has ${sum} beats, expected ${beatsPerBar}`);
  });
  if (!steps.length) throw new TabParseError('Exercise has no notes or chords');
  return { steps, barStarts, totalBeats: beat };
}

export function targetLabel(t: Target): string {
  return t.kind === 'chord' ? t.chord : `${t.string}.${t.fret}`;
}
