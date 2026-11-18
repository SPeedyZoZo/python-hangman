import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { audioEngine } from '../audio/AudioEngine.ts';
import type { AudioFrame } from '../audio/analysis/FrameAnalyzer.ts';
import { scoreChords } from '../audio/analysis/chordVerifier.ts';
import { renderPluck } from '../audio/synth/karplusStrong.ts';
import { renderClick, renderExercise, renderStep } from '../audio/synth/render.ts';
import { playableKey } from '../content/index.ts';
import type { Playable } from '../content/types.ts';
import type { ChordId } from '../music/chords.ts';
import { parseTab, type Step } from '../music/tab.ts';
import { fretToMidi, midiToHz, noteName, type StringNumber } from '../music/theory.ts';
import { summarize } from '../practice/scoring.ts';
import { PracticeSession, type LoopRange, type SessionEvent } from '../practice/session.ts';
import { useProgress } from '../progress/store.ts';
import { useSettings } from '../settings/store.ts';
import { feedbackForResult, feedbackForWrong, type Feedback } from './feedback.ts';
import { useListening } from './useListening.ts';
import { useOnHidden, useWakeLock } from './useWakeLock.ts';

export type Phase = 'intro' | 'ready' | 'playing' | 'paused' | 'listening';
export type PlayMode = 'wait' | 'play';

export interface ResultsState {
  playable: { kind: Playable['kind']; id: string; arrangementId?: string };
  summary: ReturnType<typeof summarize>;
  outcome: ReturnType<ReturnType<typeof useProgress.getState>['record']>;
}

export function usePractice(playable: Playable) {
  const navigate = useNavigate();
  const sensitivity = useSettings((s) => s.sensitivity);
  const latencyMs = useSettings((s) => s.latencyMs);
  const metronomeOn = useSettings((s) => s.metronome);
  const parsed = useMemo(
    () => parseTab(playable.exercise.tab, playable.exercise.beatsPerBar),
    [playable],
  );
  const { bpm, beatsPerBar } = playable.exercise;

  const [mode, setModeState] = useState<PlayMode>(playable.defaultMode);
  const [tempo, setTempoState] = useState(playable.defaultTempo);
  const [loop, setLoopState] = useState<LoopRange | null>(null);
  const [phase, setPhaseState] = useState<Phase>(playable.tips.length ? 'intro' : 'ready');
  const [version, setVersion] = useState(0);
  const [heard, setHeard] = useState('');
  const [level, setLevel] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [countIn, setCountIn] = useState<number | null>(null);

  const sessionRef = useRef<PracticeSession | null>(null);
  const positionRef = useRef(-2);
  const phaseRef = useRef(phase);
  const startedAt = useRef(0);
  const nextClick = useRef(0);
  const lastUi = useRef(0);
  const demoRaf = useRef(0);
  const demoStop = useRef<(() => void) | null>(null);
  const clicks = useRef<{ accent: Float32Array; normal: Float32Array } | null>(null);

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const currentTarget = () => sessionRef.current?.currentStep?.target;

  const finish = useCallback(
    (s: PracticeSession) => {
      const summary = summarize(s.results(), parsed.steps, {
        mode: s.mode,
        tempo: s.tempo,
        bpm,
        durationMs: performance.now() - startedAt.current,
      });
      const outcome = useProgress.getState().record(playableKey(playable), summary, playable.xp);
      const state: ResultsState = {
        playable: { kind: playable.kind, id: playable.id, arrangementId: playable.arrangementId },
        summary,
        outcome,
      };
      navigate('/results', { state, replace: true });
    },
    [bpm, navigate, parsed.steps, playable],
  );

  const handleEvents = useCallback(
    (s: PracticeSession, events: SessionEvent[]) => {
      if (!events.length) return;
      let changed = false;
      for (const e of events) {
        if (e.type === 'result') {
          changed = true;
          const step = parsed.steps[e.result.index];
          if (step && s.mode !== 'demo') setFeedback(feedbackForResult(e.result));
        } else if (e.type === 'wrong') {
          const step = parsed.steps[e.index];
          if (step) setFeedback(feedbackForWrong(step, e.heardMidi, e.hints));
        } else if (e.type === 'loop') {
          changed = true;
          setFeedback({ tone: 'info', text: `Loop ${e.pass}: go again!` });
        } else if (e.type === 'finished' && s.mode !== 'demo') {
          finish(s);
        }
      }
      if (changed) setVersion((v) => v + 1);
    },
    [finish, parsed.steps],
  );

  const scheduleClicks = (s: PracticeSession) => {
    const ctx = audioEngine.context;
    if (!ctx || !metronomeOn || s.mode !== 'play') return;
    clicks.current ??= {
      accent: renderClick(audioEngine.sampleRate, true),
      normal: renderClick(audioEngine.sampleRate, false),
    };
    while (nextClick.current <= positionRef.current + 0.5) {
      const beat = nextClick.current;
      const ctxT = audioEngine.perfToCtx(s.timeOfBeat(beat));
      const accent = (((beat - s.startBeat) % beatsPerBar) + beatsPerBar) % beatsPerBar === 0;
      if (ctxT > ctx.currentTime + 0.005)
        audioEngine.playOut(accent ? clicks.current.accent : clicks.current.normal, ctxT);
      nextClick.current++;
    }
  };

  const onFrame = useCallback(
    (frame: AudioFrame) => {
      const s = sessionRef.current;
      if (s && phaseRef.current === 'playing') {
        const events = s.tick(frame.t, frame);
        positionRef.current = s.position(frame.t);
        scheduleClicks(s);
        handleEvents(s, events);
      }
      if (frame.t - lastUi.current > 120) {
        lastUi.current = frame.t;
        setLevel(frame.rms);
        const s2 = sessionRef.current;
        if (s2 && phaseRef.current === 'playing') {
          const ci = s2.startBeat - positionRef.current;
          setCountIn(ci > 0 ? Math.ceil(ci) : null);
        }
        let h = '';
        if (frame.pitch) h = noteName(frame.pitch.midi);
        else if (frame.chroma) {
          const best = scoreChords(frame.chroma).sort((a, b) => b.score - a.score)[0];
          if (best && best.score > 0.8) h = `sounds like ${best.id}`;
        }
        setHeard((prev) => (prev === h ? prev : h));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleEvents],
  );

  const listening = useListening({
    onFrame,
    wantChroma: () => currentTarget()?.kind === 'chord',
  });

  const stopDemo = () => {
    cancelAnimationFrame(demoRaf.current);
    demoStop.current?.();
    demoStop.current = null;
  };

  const begin = useCallback(
    async (opts: { mode?: PlayMode; tempo?: number; loop?: LoopRange | null } = {}) => {
      stopDemo();
      await listening.start();
      const m = opts.mode ?? mode;
      const t = opts.tempo ?? tempo;
      const lp = opts.loop === undefined ? loop : opts.loop;
      const s = new PracticeSession({
        ...parsed,
        bpm,
        beatsPerBar,
        mode: m,
        tempo: t,
        loop: lp,
        sensitivity,
        latencyMs,
      });
      const now = performance.now();
      s.start(now);
      sessionRef.current = s;
      startedAt.current = now;
      positionRef.current = s.position(now);
      nextClick.current = Math.ceil(positionRef.current);
      setFeedback(null);
      setVersion((v) => v + 1);
      setPhase('playing');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      listening.start,
      mode,
      tempo,
      loop,
      parsed,
      bpm,
      beatsPerBar,
      sensitivity,
      latencyMs,
      setPhase,
    ],
  );

  // Mobile: keep the screen on while practising or listening, and pause when the phone locks.
  useWakeLock(phase === 'playing' || phase === 'listening' || phase === 'paused');
  useOnHidden(
    useCallback(() => {
      if (phaseRef.current === 'playing') {
        sessionRef.current?.pause(performance.now());
        setPhase('paused');
        setFeedback({
          tone: 'info',
          text: 'Paused while the screen was away. Tap play to carry on.',
        });
      } else if (phaseRef.current === 'listening') {
        demoStop.current?.();
      }
    }, [setPhase]),
  );

  const pause = () => {
    sessionRef.current?.pause(performance.now());
    setPhase('paused');
  };
  const resume = () => {
    sessionRef.current?.resume(performance.now());
    setPhase('playing');
  };

  const setMode = (m: PlayMode) => {
    setModeState(m);
    if (phaseRef.current === 'playing' || phaseRef.current === 'paused') void begin({ mode: m });
  };
  const setTempo = (t: number) => {
    const clamped = Math.round(Math.min(1, Math.max(0.5, t)) * 10) / 10;
    setTempoState(clamped);
    sessionRef.current?.setTempo(clamped, performance.now());
  };
  const setLoop = (lp: LoopRange | null) => {
    setLoopState(lp);
    if (phaseRef.current === 'playing' || phaseRef.current === 'paused') void begin({ loop: lp });
  };

  /** Reference playback with the highway animating along (FR-PLY-6). */
  const listen = async () => {
    stopDemo();
    sessionRef.current?.pause(performance.now());
    const ctx = await audioEngine.ensureContext();
    const msPerBeat = 60000 / (bpm * tempo);
    const from = loop ? (parsed.barStarts[loop.startBar] ?? 0) : 0;
    const to = loop ? (parsed.barStarts[loop.endBar + 1] ?? parsed.totalBeats) : parsed.totalBeats;
    const audio = renderExercise(parsed.steps, {
      sampleRate: audioEngine.sampleRate,
      msPerBeat,
      leadInBeats: 1,
      fromBeat: from,
      toBeat: to,
    });
    const startCtx = ctx.currentTime + 0.15;
    const handle = audioEngine.playOut(audio, startCtx);
    const firstBeat = parsed.steps.find((s) => s.beat >= from)?.beat ?? from;
    const demo = new PracticeSession({
      ...parsed,
      bpm,
      beatsPerBar,
      mode: 'demo',
      tempo,
      loop,
      leadInBeats: 1 + firstBeat - from,
    });
    demo.start(audioEngine.ctxToPerf(startCtx));
    sessionRef.current = demo;
    setVersion((v) => v + 1);
    setPhase('listening');
    const tick = () => {
      const now = performance.now();
      handleEvents(demo, demo.tick(now, null));
      positionRef.current = demo.position(now);
      demoRaf.current = requestAnimationFrame(tick);
    };
    demoRaf.current = requestAnimationFrame(tick);
    let stopped = false;
    demoStop.current = () => {
      stopped = true;
      handle.stop();
    };
    await handle.done;
    cancelAnimationFrame(demoRaf.current);
    if (!stopped || phaseRef.current === 'listening') {
      sessionRef.current = null;
      positionRef.current = -1;
      setVersion((v) => v + 1);
      setPhase('ready');
    }
  };

  const stopListen = () => {
    stopDemo();
  };

  /** Virtual guitar input: pluck a note into the analyser (and speakers). */
  const pluck = async (string: StringNumber, fret: number) => {
    await audioEngine.ensureContext();
    const midi = fretToMidi(string, fret);
    audioEngine.inject(
      renderPluck(midiToHz(midi), {
        sampleRate: audioEngine.sampleRate,
        durationSec: 1.6,
        amplitude: 0.5,
        seed: Math.floor(Math.random() * 1e6),
      }),
    );
  };

  const strum = async (chord: ChordId) => {
    await audioEngine.ensureContext();
    const step: Step = {
      index: 0,
      beat: 0,
      beats: 1,
      bar: 0,
      target: { kind: 'chord', chord, strum: 'down' },
    };
    audioEngine.inject(
      renderStep(step, audioEngine.sampleRate, 1.8, Math.floor(Math.random() * 1e6)),
    );
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(demoRaf.current);
      demoStop.current?.();
    },
    [],
  );

  const statusOf = useCallback((i: number) => sessionRef.current?.statusOf(i) ?? 'upcoming', []);

  return {
    parsed,
    phase,
    mode,
    tempo,
    loop,
    version,
    heard,
    level,
    feedback,
    countIn,
    positionRef,
    statusOf,
    currentStep: sessionRef.current?.currentStep,
    listening,
    begin,
    pause,
    resume,
    setMode,
    setTempo,
    setLoop,
    listen,
    stopListen,
    pluck,
    strum,
    setPhase,
  };
}
