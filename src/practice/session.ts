import type { AudioFrame } from '../audio/analysis/FrameAnalyzer.ts';
import type { ChordHint } from '../audio/analysis/chordVerifier.ts';
import {
  SENSITIVITY,
  type DetectionParams,
  type Sensitivity,
} from '../audio/analysis/sensitivity.ts';
import type { Step } from '../music/tab.ts';
import { matchTarget, maxMatchDelayMs, stableFramesFor } from './matcher.ts';

/**
 * Pure practice-session state machine (no DOM, no audio APIs).
 *
 * Time model: the song position in beats is `anchorBeat + (now - anchorT) / msPerBeat` while
 * running. In Wait Mode the position freezes at the active step until it is played.
 * Feed it `tick(now, frame)` once per animation frame.
 */

export type Mode = 'wait' | 'play' | 'demo';
export type Grade = 'perfect' | 'good' | 'early' | 'late' | 'miss' | 'hit';
export type SessionState = 'ready' | 'running' | 'waiting' | 'paused' | 'finished';
export type StepStatus = Grade | 'upcoming' | 'active';

/** Timing windows (ms, absolute deviation). */
export const WINDOW = { perfect: 80, good: 160, ok: 300 } as const;
const ONSET_GRACE_MS = 60;
/** Wait Mode only listens for a step once it is this close to the hit line (no racing ahead). */
const ARM_AHEAD_BEATS = 1;
const WRONG_SETTLE_MS = { note: 150, chord: 320 } as const;

export interface StepResult {
  index: number;
  pass: number;
  grade: Grade;
  /** Onset time minus scheduled time (play mode). Negative = early. */
  deltaMs: number | null;
  wrongAttempts: number;
  wrongHeard: number[];
  chordHints: ChordHint[];
  cents: number | null;
}

export interface LoopRange {
  startBar: number;
  endBar: number;
}

export interface SessionConfig {
  steps: Step[];
  barStarts: number[];
  totalBeats: number;
  bpm: number;
  beatsPerBar: number;
  mode: Mode;
  /** 0.5 – 1.0 */
  tempo: number;
  loop?: LoopRange | null;
  sensitivity?: Sensitivity;
  latencyMs?: number;
  leadInBeats?: number;
}

export type SessionEvent =
  | { type: 'result'; result: StepResult }
  | { type: 'wrong'; index: number; heardMidi?: number; hints?: ChordHint[] }
  | { type: 'loop'; pass: number }
  | { type: 'finished' };

interface Pending {
  wrong: number;
  wrongHeard: number[];
  hints: ChordHint[];
}

export class PracticeSession {
  readonly cfg: SessionConfig;
  readonly startBeat: number;
  readonly endBeat: number;
  readonly active: Step[];
  state: SessionState = 'ready';
  pass = 1;

  private params: DetectionParams;
  private msPerBeat: number;
  private anchorT = 0;
  private anchorBeat = 0;
  private resumeState: SessionState = 'running';
  private judged = new Map<number, StepResult>();
  private runs = new Map<number, number>();
  private pending = new Map<number, Pending>();
  private history: StepResult[] = [];
  private lastOnsetT = -Infinity;
  private onsetConsumed = true;
  // Wait mode
  private nextIdx = 0;
  private armedAt = -Infinity;
  private otherRun = 0;
  private lastWrongOnsetT = -Infinity;

  constructor(cfg: SessionConfig) {
    this.cfg = cfg;
    this.params = SENSITIVITY[cfg.sensitivity ?? 'normal'];
    this.msPerBeat = 60000 / (cfg.bpm * cfg.tempo);
    const { loop, barStarts, totalBeats } = cfg;
    this.startBeat = loop ? (barStarts[loop.startBar] ?? 0) : 0;
    this.endBeat = loop ? (barStarts[loop.endBar + 1] ?? totalBeats) : totalBeats;
    this.active = cfg.steps.filter(
      (s) => s.beat >= this.startBeat - 1e-9 && s.beat < this.endBeat - 1e-9,
    );
  }

  get mode(): Mode {
    return this.cfg.mode;
  }

  get tempo(): number {
    return this.cfg.tempo;
  }

  get beatMs(): number {
    return this.msPerBeat;
  }

  position(now: number): number {
    return this.state === 'running'
      ? this.anchorBeat + (now - this.anchorT) / this.msPerBeat
      : this.anchorBeat;
  }

  /** Scheduled wall-clock time (ms) of a beat, given the current anchor (play mode). */
  timeOfBeat(beat: number): number {
    return this.anchorT + (beat - this.anchorBeat) * this.msPerBeat;
  }

  start(now: number): void {
    const leadIn = this.cfg.leadInBeats ?? (this.cfg.mode === 'wait' ? 2 : this.cfg.beatsPerBar);
    this.anchorT = now;
    this.anchorBeat = this.startBeat - leadIn;
    this.armedAt = now;
    this.state = 'running';
  }

  pause(now: number): void {
    if (this.state !== 'running' && this.state !== 'waiting') return;
    this.anchorBeat = this.position(now);
    this.resumeState = this.state;
    this.state = 'paused';
  }

  resume(now: number): void {
    if (this.state !== 'paused') return;
    this.anchorT = now;
    this.state = this.resumeState;
    this.lastOnsetT = -Infinity;
    this.onsetConsumed = true;
    this.armedAt = now;
  }

  setTempo(tempo: number, now: number): void {
    this.anchorBeat = this.position(now);
    this.anchorT = now;
    this.cfg.tempo = tempo;
    this.msPerBeat = 60000 / (this.cfg.bpm * tempo);
  }

  /** The step the learner should play now (Wait Mode) or the next unjudged one (play). */
  get currentStep(): Step | undefined {
    if (this.cfg.mode === 'wait') return this.active[this.nextIdx];
    return this.active.find((s) => !this.judged.has(s.index));
  }

  statusOf(index: number): StepStatus {
    const r = this.judged.get(index);
    if (r) return r.grade;
    return this.currentStep?.index === index ? 'active' : 'upcoming';
  }

  results(): StepResult[] {
    return [...this.history];
  }

  tick(now: number, frame: AudioFrame | null): SessionEvent[] {
    if (this.state === 'ready' || this.state === 'paused' || this.state === 'finished') return [];
    if (frame?.onset && frame.onsetT !== null) {
      this.lastOnsetT = frame.onsetT - (this.cfg.latencyMs ?? 0);
      this.onsetConsumed = false;
    }
    const events: SessionEvent[] = [];
    if (this.cfg.mode === 'wait') this.tickWait(now, frame, events);
    else this.tickTimed(now, frame, events);
    this.checkEnd(now, events);
    return events;
  }

  private judge(
    step: Step,
    result: Omit<StepResult, 'index' | 'pass'>,
    events: SessionEvent[],
  ): void {
    const r: StepResult = { ...result, index: step.index, pass: this.pass };
    this.judged.set(step.index, r);
    this.history.push(r);
    events.push({ type: 'result', result: r });
  }

  private tickWait(now: number, frame: AudioFrame | null, events: SessionEvent[]): void {
    const step = this.active[this.nextIdx];
    if (!step) return;
    if (this.state === 'running' && this.position(now) >= step.beat) {
      this.anchorBeat = step.beat;
      this.anchorT = now;
      this.state = 'waiting';
    }
    if (this.state === 'waiting') this.anchorT = now;
    if (this.state === 'running' && this.position(now) < step.beat - ARM_AHEAD_BEATS) {
      this.armedAt = now;
      this.runs.set(step.index, 0);
      this.otherRun = 0;
      return;
    }
    if (!frame) return;

    const m = matchTarget(step.target, frame, this.params, now - this.lastOnsetT);
    const run = m.kind === 'match' ? (this.runs.get(step.index) ?? 0) + 1 : 0;
    this.runs.set(step.index, run);
    const fresh =
      !this.onsetConsumed &&
      this.lastOnsetT >= this.armedAt - ONSET_GRACE_MS &&
      now - this.lastOnsetT <= maxMatchDelayMs(step.target);
    const p = this.pending.get(step.index) ?? { wrong: 0, wrongHeard: [], hints: [] };
    this.pending.set(step.index, p);

    if (run >= stableFramesFor(step.target) && fresh) {
      this.onsetConsumed = true;
      this.judge(
        step,
        {
          grade: 'hit',
          deltaMs: null,
          wrongAttempts: p.wrong,
          wrongHeard: p.wrongHeard,
          chordHints: p.hints,
          cents: m.cents ?? null,
        },
        events,
      );
      this.nextIdx++;
      this.armedAt = now;
      this.otherRun = 0;
      if (this.state === 'waiting') {
        this.state = 'running';
        this.anchorT = now;
        this.anchorBeat = step.beat;
      }
      return;
    }

    // Wrong attempts: a fresh onset followed by a stable, confident, different sound.
    this.otherRun = m.kind === 'other' ? this.otherRun + 1 : 0;
    const settle = WRONG_SETTLE_MS[step.target.kind];
    if (
      this.otherRun >= 3 &&
      !this.onsetConsumed &&
      this.lastOnsetT >= this.armedAt - ONSET_GRACE_MS &&
      this.lastOnsetT !== this.lastWrongOnsetT &&
      now - this.lastOnsetT >= settle &&
      now - this.lastOnsetT <= settle + 400
    ) {
      this.lastWrongOnsetT = this.lastOnsetT;
      p.wrong++;
      if (m.heardMidi !== undefined) p.wrongHeard.push(m.heardMidi);
      if (m.hints?.length) p.hints = m.hints;
      events.push({ type: 'wrong', index: step.index, heardMidi: m.heardMidi, hints: m.hints });
    }
  }

  private tickTimed(now: number, frame: AudioFrame | null, events: SessionEvent[]): void {
    let best: { step: Step; delta: number; cents: number | null } | null = null;
    for (const step of this.active) {
      if (this.judged.has(step.index)) continue;
      const stepT = this.timeOfBeat(step.beat);
      if (this.cfg.mode === 'demo') {
        if (now >= stepT)
          this.judge(
            step,
            {
              grade: 'hit',
              deltaMs: 0,
              wrongAttempts: 0,
              wrongHeard: [],
              chordHints: [],
              cents: null,
            },
            events,
          );
        continue;
      }
      if (now < stepT - WINDOW.ok - 50) break; // later steps aren't open yet
      const deadline = stepT + WINDOW.ok + maxMatchDelayMs(step.target);
      let m = null;
      if (frame) {
        m = matchTarget(step.target, frame, this.params, now - this.lastOnsetT);
        const run = m.kind === 'match' ? (this.runs.get(step.index) ?? 0) + 1 : 0;
        this.runs.set(step.index, run);
        const delta = this.lastOnsetT - stepT;
        if (
          run >= stableFramesFor(step.target) &&
          !this.onsetConsumed &&
          Math.abs(delta) <= WINDOW.ok &&
          now - this.lastOnsetT <= maxMatchDelayMs(step.target) &&
          (!best || Math.abs(delta) < Math.abs(best.delta))
        ) {
          best = { step, delta, cents: m.cents ?? null };
        }
        if (m.kind === 'other' && step.target.kind === 'chord' && m.hints?.length) {
          const p = this.pending.get(step.index) ?? { wrong: 0, wrongHeard: [], hints: [] };
          p.hints = m.hints;
          this.pending.set(step.index, p);
        }
        if (m.kind === 'other' && m.heardMidi !== undefined && frame.onset) {
          const p = this.pending.get(step.index) ?? { wrong: 0, wrongHeard: [], hints: [] };
          p.wrongHeard.push(m.heardMidi);
          this.pending.set(step.index, p);
        }
      }
      if (now > deadline && !(best && best.step === step)) {
        const p = this.pending.get(step.index);
        this.judge(
          step,
          {
            grade: 'miss',
            deltaMs: null,
            wrongAttempts: 0,
            wrongHeard: p?.wrongHeard ?? [],
            chordHints: p?.hints ?? [],
            cents: null,
          },
          events,
        );
      }
    }
    if (best) {
      this.onsetConsumed = true;
      const a = Math.abs(best.delta);
      const grade: Grade =
        a <= WINDOW.perfect
          ? 'perfect'
          : a <= WINDOW.good
            ? 'good'
            : best.delta < 0
              ? 'early'
              : 'late';
      this.judge(
        best.step,
        {
          grade,
          deltaMs: best.delta,
          wrongAttempts: 0,
          wrongHeard: [],
          chordHints: [],
          cents: best.cents,
        },
        events,
      );
    }
  }

  private checkEnd(now: number, events: SessionEvent[]): void {
    if (this.state !== 'running') return;
    const allDone = this.active.every((s) => this.judged.has(s.index));
    if (!allDone || this.position(now) < this.endBeat) return;
    if (this.cfg.loop) {
      this.anchorT = this.timeOfBeat(this.endBeat);
      this.anchorBeat = this.startBeat;
      this.pass++;
      this.judged.clear();
      this.runs.clear();
      this.pending.clear();
      this.nextIdx = 0;
      this.armedAt = now;
      events.push({ type: 'loop', pass: this.pass });
      return;
    }
    this.state = 'finished';
    events.push({ type: 'finished' });
  }
}
