import { useCallback, useEffect, useRef, useState } from 'react';
import { audioEngine, MicError, type EngineMode, type MicFailure } from '../audio/AudioEngine.ts';
import { FrameAnalyzer, type AudioFrame } from '../audio/analysis/FrameAnalyzer.ts';
import { useSettings } from '../settings/store.ts';

export type ListenStatus = 'idle' | 'starting' | 'listening' | 'error';

export interface ListeningOptions {
  onFrame: (frame: AudioFrame) => void;
  /** Return true when the current target needs chroma (chords). */
  wantChroma?: () => boolean;
}

/**
 * Starts the audio engine on demand (call `start()` from a click) and runs the analysis loop on
 * requestAnimationFrame while listening. Falls back to virtual input if the mic fails.
 */
export function useListening({ onFrame, wantChroma }: ListeningOptions) {
  const sensitivity = useSettings((s) => s.sensitivity);
  const preferVirtual = useSettings((s) => s.virtualInput);
  const [status, setStatus] = useState<ListenStatus>('idle');
  const [mode, setMode] = useState<EngineMode | null>(null);
  const [micError, setMicError] = useState<MicFailure | null>(null);
  const onFrameRef = useRef(onFrame);
  const wantChromaRef = useRef(wantChroma);
  const analyzerRef = useRef<FrameAnalyzer | null>(null);
  const acquiredRef = useRef(false);

  useEffect(() => {
    onFrameRef.current = onFrame;
    wantChromaRef.current = wantChroma;
  });

  useEffect(() => {
    if (analyzerRef.current) analyzerRef.current.sensitivity = sensitivity;
  }, [sensitivity]);

  const start = useCallback(
    async (forceVirtual = false) => {
      if (acquiredRef.current) return;
      setStatus('starting');
      let m: EngineMode;
      try {
        m = await audioEngine.acquire(forceVirtual || preferVirtual ? 'virtual' : 'mic');
        setMicError(null);
      } catch (e) {
        setMicError(e instanceof MicError ? e.reason : 'unavailable');
        try {
          m = await audioEngine.acquire('virtual');
        } catch {
          setStatus('error');
          return;
        }
      }
      acquiredRef.current = true;
      analyzerRef.current = new FrameAnalyzer(audioEngine.sampleRate, sensitivity);
      setMode(m);
      setStatus('listening');
    },
    [preferVirtual, sensitivity],
  );

  const stop = useCallback(() => {
    if (!acquiredRef.current) return;
    acquiredRef.current = false;
    audioEngine.release();
    setStatus('idle');
    setMode(null);
  }, []);

  useEffect(() => {
    if (status !== 'listening') return;
    let raf = 0;
    const loop = () => {
      const analyzer = analyzerRef.current;
      if (analyzer) {
        const frame = analyzer.analyze(audioEngine.readSamples(), performance.now(), {
          chroma: wantChromaRef.current?.() ?? false,
        });
        onFrameRef.current(frame);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  useEffect(() => () => stop(), [stop]);

  return { status, mode, micError, start, stop };
}
