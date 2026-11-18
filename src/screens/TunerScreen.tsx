import { useCallback, useRef, useState } from 'react';
import { audioEngine } from '../audio/AudioEngine.ts';
import type { AudioFrame } from '../audio/analysis/FrameAnalyzer.ts';
import { TunerModel, type TunerReading } from '../audio/analysis/tuner.ts';
import { renderPluck } from '../audio/synth/karplusStrong.ts';
import {
  midiToHz,
  STANDARD_TUNING,
  STRING_LABELS,
  STRINGS,
  type StringNumber,
} from '../music/theory.ts';
import { useListening } from '../app/useListening.ts';
import { useWakeLock } from '../app/useWakeLock.ts';
import { Button } from '../ui/Button.tsx';
import { LevelMeter } from '../ui/LevelMeter.tsx';
import { MicNotice } from '../ui/MicNotice.tsx';
import { TunerDial } from '../ui/TunerDial.tsx';

export function TunerScreen() {
  const model = useRef(new TunerModel());
  const [reading, setReading] = useState<TunerReading | null>(null);
  const [level, setLevel] = useState(0);
  const lastUi = useRef(0);

  const onFrame = useCallback((f: AudioFrame) => {
    const r = model.current.update(f.pitch, f.t);
    // Throttle React updates to ~30 fps.
    if (f.t - lastUi.current > 33) {
      lastUi.current = f.t;
      setReading(r);
      setLevel(f.rms);
    }
  }, []);

  const { status, mode, micError, start } = useListening({ onFrame });
  useWakeLock(status === 'listening');

  const playString = async (s: StringNumber) => {
    if (status !== 'listening') await start();
    const hz = midiToHz(STANDARD_TUNING[s]);
    audioEngine.inject(
      renderPluck(hz, {
        sampleRate: audioEngine.sampleRate,
        durationSec: 2.5,
        decay: 0.998,
        amplitude: 0.5,
      }),
    );
  };

  return (
    <section className="stack" aria-labelledby="tuner-title">
      <h1 id="tuner-title">Tuner</h1>
      <p className="muted">
        Standard tuning, low to high: E A D G B e. Pluck one string at a time.
      </p>
      {status !== 'listening' ? (
        <div className="card stack center">
          <TunerDial reading={null} />
          <Button
            variant="primary"
            size="lg"
            icon="mic"
            onClick={() => start()}
            disabled={status === 'starting'}
          >
            {status === 'starting' ? 'Starting…' : 'Start listening'}
          </Button>
          <p className="small muted">
            The microphone is only used while this screen is open. Audio never leaves your device.
          </p>
        </div>
      ) : (
        <div className="card stack center" data-testid="tuner-live">
          <MicNotice mode={mode} micError={micError} />
          <TunerDial reading={reading} />
          <LevelMeter rms={level} />
        </div>
      )}
      <div className="card stack">
        <h2 className="h3">Reference tones</h2>
        <div className="string-buttons" role="group" aria-label="Play a reference tone">
          {[...STRINGS].reverse().map((s) => (
            <Button
              key={s}
              onClick={() => playString(s)}
              aria-label={`Play string ${s}, ${STRING_LABELS[s]}`}
            >
              <span
                className="string-chip"
                style={{ background: `var(--string-${s})` }}
                aria-hidden="true"
              />
              {STRING_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
