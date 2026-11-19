import { useState, type ReactNode } from 'react';
import type { Sensitivity } from '../audio/analysis/sensitivity.ts';
import { useProgress } from '../progress/store.ts';
import { useSettings, type Handedness, type NoteLabels, type Theme } from '../settings/store.ts';
import { Button, ButtonLink } from '../ui/Button.tsx';

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="setting">
      <span className="setting-label" id={`lbl-${label}`}>
        {label}
      </span>
      <div className="segmented" role="radiogroup" aria-labelledby={`lbl-${label}`}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className="seg"
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="setting toggle">
      <span>
        <span className="setting-label">{label}</span>
        {help && <span className="small muted block">{help}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function SettingsScreen() {
  const s = useSettings();
  const progress = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const minutes = Math.round(progress.practiceMs / 60000);

  return (
    <section className="stack" aria-labelledby="settings-title">
      <h1 id="settings-title">Settings</h1>

      <div className="card stack">
        <h2 className="h3">You</h2>
        <Segmented<Handedness>
          label="Strumming hand"
          value={s.handedness}
          onChange={(v) => s.set({ handedness: v })}
          options={[
            { value: 'right', label: 'Right' },
            { value: 'left', label: 'Left (mirrored)' },
          ]}
        />
        <Toggle
          label="Unlock all lessons"
          help="For returning players who want to skip ahead."
          checked={s.unlockAll}
          onChange={(v) => s.set({ unlockAll: v })}
        />
      </div>

      <div className="card stack">
        <h2 className="h3">Listening</h2>
        <Segmented<Sensitivity>
          label="Detection sensitivity"
          value={s.sensitivity}
          onChange={(v) => s.set({ sensitivity: v })}
          options={[
            { value: 'easy', label: 'Easy' },
            { value: 'normal', label: 'Normal' },
            { value: 'strict', label: 'Strict' },
          ]}
        />
        <p className="small muted">
          Choose Easy if correct notes are sometimes not heard (noisy room, quiet guitar). Strict is
          for precise players.
        </p>
        <div className="setting">
          <label className="setting-label" htmlFor="latency">
            Timing calibration: {s.latencyMs > 0 ? '+' : ''}
            {s.latencyMs} ms
          </label>
          <input
            id="latency"
            type="range"
            min={-100}
            max={300}
            step={10}
            value={s.latencyMs}
            onChange={(e) => s.set({ latencyMs: Number(e.target.value) })}
            aria-describedby="latency-help"
          />
        </div>
        <p id="latency-help" className="small muted">
          If Play-along keeps saying "late" when you're on the beat, move this to the right
          (Bluetooth headphones add delay).
        </p>
        <Toggle
          label="Use on-screen guitar instead of the microphone"
          help="Practise without a guitar by tapping frets."
          checked={s.virtualInput}
          onChange={(v) => s.set({ virtualInput: v })}
        />
        <Toggle
          label="Show on-screen guitar in lessons"
          checked={s.showFretboard}
          onChange={(v) => s.set({ showFretboard: v })}
        />
        <Toggle
          label="Metronome in Play-along"
          checked={s.metronome}
          onChange={(v) => s.set({ metronome: v })}
        />
        <Toggle
          label="Vibrate on taps (on-screen guitar)"
          help="A short buzz when you tap a fret. Never used while the microphone is listening."
          checked={s.haptics}
          onChange={(v) => s.set({ haptics: v })}
        />
      </div>

      <div className="card stack">
        <h2 className="h3">Display</h2>
        <Segmented<Theme>
          label="Theme"
          value={s.theme}
          onChange={(v) => s.set({ theme: v })}
          options={[
            { value: 'system', label: 'System' },
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
          ]}
        />
        <Segmented<NoteLabels>
          label="Labels on notes"
          value={s.labels}
          onChange={(v) => s.set({ labels: v })}
          options={[
            { value: 'fret', label: 'Fret numbers' },
            { value: 'note', label: 'Note names' },
          ]}
        />
      </div>

      <div className="card stack">
        <h2 className="h3">Your progress</h2>
        <p>
          {progress.xp} XP · {progress.sessions} sessions · {minutes} minutes practised
        </p>
        {!confirmReset ? (
          <div>
            <Button onClick={() => setConfirmReset(true)}>Reset progress…</Button>
          </div>
        ) : (
          <div className="row" role="alertdialog" aria-labelledby="reset-q">
            <p id="reset-q">Delete all stars, XP and streaks? This can't be undone.</p>
            <Button
              variant="primary"
              onClick={() => {
                progress.reset();
                setConfirmReset(false);
              }}
            >
              Yes, reset
            </Button>
            <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
          </div>
        )}
        <div>
          <ButtonLink to="/welcome" variant="ghost">
            Run setup again
          </ButtonLink>
        </div>
      </div>

      <div className="card stack" aria-labelledby="privacy-title">
        <h2 id="privacy-title" className="h3">
          About and privacy
        </h2>
        <ul className="privacy">
          <li>
            Strumly uses your microphone only while a practice, tuner or chord-check screen is open.
          </li>
          <li>Audio is analysed on your device and is never recorded, stored or sent anywhere.</li>
          <li>
            Your progress and settings are stored only in this browser. Clearing site data, or Reset
            progress, deletes them.
          </li>
          <li>No accounts, ads, analytics or trackers.</li>
        </ul>
        <p className="small muted">
          Strumly {__APP_VERSION__}. Songs are public-domain melodies and chord charts arranged for
          learning. Original app, not affiliated with any other music-learning product.
        </p>
      </div>
    </section>
  );
}
