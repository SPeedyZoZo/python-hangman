import type { AudioFrame } from '../../src/audio/analysis/FrameAnalyzer.ts';
import { chordTemplate } from '../../src/audio/analysis/chordVerifier.ts';
import type { ChordId } from '../../src/music/chords.ts';

/** Synthetic analysis frames for state-machine tests. */
export function silence(t: number): AudioFrame {
  return { t, rms: 0, onset: false, onsetT: null, pitch: null, chroma: null };
}
export function note(t: number, midi: number, onset = false, cents = 0): AudioFrame {
  return {
    t,
    rms: 0.2,
    onset,
    onsetT: onset ? t - 10 : null,
    pitch: { hz: 0, midi, cents, clarity: 0.97 },
    chroma: null,
  };
}
export function chord(t: number, id: ChordId, onset = false): AudioFrame {
  return {
    t,
    rms: 0.2,
    onset,
    onsetT: onset ? t - 10 : null,
    pitch: null,
    chroma: chordTemplate(id),
  };
}

/** Run `fn(t)` for each 16 ms frame from `from` to `to` and feed the session. */
export function drive<T extends { tick: (now: number, f: AudioFrame | null) => unknown[] }>(
  session: T,
  from: number,
  to: number,
  fn: (t: number) => AudioFrame | null,
) {
  const events: unknown[] = [];
  for (let t = from; t <= to; t += 16) events.push(...session.tick(t, fn(t)));
  return events;
}
