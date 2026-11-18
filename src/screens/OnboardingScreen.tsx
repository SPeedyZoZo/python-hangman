import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AudioFrame } from '../audio/analysis/FrameAnalyzer.ts';
import { useListening } from '../app/useListening.ts';
import { useSettings, type GuitarType, type Handedness, type Level } from '../settings/store.ts';
import { Button } from '../ui/Button.tsx';
import { Icon } from '../ui/Icon.tsx';
import { LevelMeter } from '../ui/LevelMeter.tsx';

const STEPS = ['welcome', 'level', 'guitar', 'hand', 'mic', 'tune'] as const;
type StepId = (typeof STEPS)[number];

function Choice<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; title: string; body: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="choices" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className="choice"
          onClick={() => onChange(o.value)}
        >
          <strong>{o.title}</strong>
          <span className="small muted">{o.body}</span>
        </button>
      ))}
    </div>
  );
}

export function OnboardingScreen() {
  const navigate = useNavigate();
  const settings = useSettings();
  const [step, setStep] = useState<StepId>('welcome');
  const [heard, setHeard] = useState(false);
  const [level, setLevel] = useState(0);
  const lastUi = useRef(0);
  const idx = STEPS.indexOf(step);

  const onFrame = useCallback((f: AudioFrame) => {
    if (f.onset || f.rms > 0.03) setHeard(true);
    if (f.t - lastUi.current > 80) {
      lastUi.current = f.t;
      setLevel(f.rms);
    }
  }, []);
  const mic = useListening({ onFrame });

  const next = () => setStep(STEPS[Math.min(STEPS.length - 1, idx + 1)]!);
  const back = () => setStep(STEPS[Math.max(0, idx - 1)]!);
  const finish = (to: string) => {
    mic.stop();
    settings.set({ onboarded: true });
    navigate(to, { replace: true });
  };

  let body: ReactNode;
  switch (step) {
    case 'welcome':
      body = (
        <div className="stack center onboarding-hero">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width={96} height={96} />
          <h1>Welcome to Strumly</h1>
          <p className="lead">
            Your patient practice partner. Strumly <strong>listens</strong> while you play,{' '}
            <strong>waits</strong> for you on every note, and tells you{' '}
            <strong>exactly what to fix</strong>.
          </p>
          <Button variant="primary" size="lg" onClick={next}>
            Get started
          </Button>
        </div>
      );
      break;
    case 'level':
      body = (
        <>
          <h1>How much guitar have you played?</h1>
          <Choice<Level>
            label="Experience"
            value={settings.level}
            onChange={(v) => settings.set({ level: v, unlockAll: v === 'returning' })}
            options={[
              { value: 'new', title: 'Brand new', body: "I've never really played" },
              { value: 'some', title: 'A little', body: 'I know a few notes or chords' },
              {
                value: 'returning',
                title: 'Returning player',
                body: 'I used to play: unlock every lesson',
              },
            ]}
          />
        </>
      );
      break;
    case 'guitar':
      body = (
        <>
          <h1>What are you playing?</h1>
          <Choice<GuitarType>
            label="Guitar type"
            value={settings.guitarType}
            onChange={(v) => settings.set({ guitarType: v })}
            options={[
              { value: 'acoustic', title: 'Acoustic', body: 'Steel strings' },
              {
                value: 'electric',
                title: 'Electric',
                body: 'Play through an amp or speaker near the mic',
              },
              { value: 'classical', title: 'Classical', body: 'Nylon strings' },
            ]}
          />
        </>
      );
      break;
    case 'hand':
      body = (
        <>
          <h1>Which hand strums?</h1>
          <Choice<Handedness>
            label="Handedness"
            value={settings.handedness}
            onChange={(v) => settings.set({ handedness: v })}
            options={[
              { value: 'right', title: 'Right hand', body: 'Standard guitar' },
              {
                value: 'left',
                title: 'Left hand',
                body: 'Chord diagrams and the on-screen guitar are mirrored',
              },
            ]}
          />
        </>
      );
      break;
    case 'mic':
      body = (
        <>
          <h1>Let Strumly hear you</h1>
          <div className="card stack">
            <p>
              Strumly listens through your microphone to check your notes and chords.{' '}
              <strong>Audio is analysed on your device and never recorded or sent anywhere.</strong>{' '}
              The mic is only on while a practice, tuner or chord-check screen is open.
            </p>
            {mic.status !== 'listening' ? (
              <Button
                variant="primary"
                size="lg"
                icon="mic"
                onClick={() => mic.start()}
                disabled={mic.status === 'starting'}
              >
                Allow microphone
              </Button>
            ) : mic.mode === 'mic' ? (
              <div className="stack">
                <p>{heard ? 'We can hear you!' : 'Pluck any string…'}</p>
                <LevelMeter rms={level} />
                {heard && (
                  <p className="pill pill-good" role="status">
                    <Icon name="check" size={16} /> Microphone working
                  </p>
                )}
              </div>
            ) : (
              <p className="pill pill-warn" role="status">
                The microphone isn't available, so you'll use the on-screen guitar. You can try
                again from Settings.
              </p>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                settings.set({ virtualInput: true });
                next();
              }}
            >
              No guitar right now? Use the on-screen guitar
            </Button>
          </div>
        </>
      );
      break;
    case 'tune':
      body = (
        <>
          <h1>Tune up first?</h1>
          <p className="muted">
            An in-tune guitar sounds better and helps Strumly hear you accurately. It takes about a
            minute.
          </p>
          <div className="row">
            <Button variant="primary" size="lg" icon="tuner" onClick={() => finish('/tuner')}>
              Open the tuner
            </Button>
            <Button size="lg" onClick={() => finish('/')}>
              Skip for now
            </Button>
          </div>
        </>
      );
      break;
  }

  return (
    <section className="stack onboarding" aria-label="Set up Strumly">
      <div className="row spread">
        <div className="dots" aria-label={`Step ${idx + 1} of ${STEPS.length}`} role="img">
          {STEPS.map((s, i) => (
            <span key={s} className={`dot ${i <= idx ? 'on' : ''}`} />
          ))}
        </div>
        {step !== 'welcome' && step !== 'tune' && (
          <Button variant="ghost" size="sm" onClick={() => finish('/')}>
            Skip setup
          </Button>
        )}
      </div>
      {body}
      {step !== 'welcome' && step !== 'tune' && (
        <div className="row spread">
          <Button icon="back" onClick={back}>
            Back
          </Button>
          <Button variant="primary" onClick={next}>
            Continue
          </Button>
        </div>
      )}
    </section>
  );
}
