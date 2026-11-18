import { voicing } from '../../music/chords.ts';
import type { Step } from '../../music/tab.ts';
import { midiToHz } from '../../music/theory.ts';
import { mixInto, normalize, renderPluck, renderStrum } from './karplusStrong.ts';

/** Render one step (note or chord) as audio. */
export function renderStep(
  step: Step,
  sampleRate: number,
  durationSec: number,
  seed = 1,
): Float32Array {
  if (step.target.kind === 'note') {
    return renderPluck(midiToHz(step.target.midi), {
      sampleRate,
      durationSec,
      seed,
      amplitude: 0.7,
    });
  }
  const hz = voicing(step.target.chord).map((n) => midiToHz(n.midi));
  return renderStrum(hz, { sampleRate, durationSec, direction: step.target.strum, seed });
}

/**
 * Render a whole exercise ("Listen" reference playback, FR-PLY-6).
 * `leadInBeats` of silence come first so the highway can scroll in.
 */
export function renderExercise(
  steps: Step[],
  opts: {
    sampleRate: number;
    msPerBeat: number;
    leadInBeats?: number;
    fromBeat?: number;
    toBeat?: number;
  },
): Float32Array {
  const { sampleRate, msPerBeat, leadInBeats = 0, fromBeat = -Infinity, toBeat = Infinity } = opts;
  const chosen = steps.filter((s) => s.beat >= fromBeat && s.beat < toBeat);
  if (!chosen.length) return new Float32Array(1);
  const first = Math.max(chosen[0]!.beat, fromBeat === -Infinity ? 0 : fromBeat);
  const last = chosen[chosen.length - 1]!;
  const totalBeats = last.beat + last.beats - first + leadInBeats;
  const out = new Float32Array(Math.ceil(((totalBeats * msPerBeat) / 1000 + 1.5) * sampleRate));
  chosen.forEach((s, i) => {
    const startSec = ((s.beat - first + leadInBeats) * msPerBeat) / 1000;
    const dur = Math.min(2.5, (s.beats * msPerBeat) / 1000 + 0.6);
    mixInto(out, renderStep(s, sampleRate, dur, i + 1), Math.floor(startSec * sampleRate), 0.8);
  });
  normalize(out, 0.8);
  return out;
}

/** A short metronome click (accented = higher pitch). */
export function renderClick(sampleRate: number, accent: boolean): Float32Array {
  const n = Math.floor(sampleRate * 0.05);
  const out = new Float32Array(n);
  const f = accent ? 1760 : 1320;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    out[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 90) * (accent ? 0.5 : 0.35);
  }
  return out;
}
