import { IN_TUNE_CENTS, type TunerReading } from '../audio/analysis/tuner.ts';
import { STRING_LABELS } from '../music/theory.ts';
import { Icon } from './Icon.tsx';

/** Needle dial from −50 to +50 cents. Status is conveyed by text and icon as well as colour. */
export function TunerDial({ reading }: { reading: TunerReading | null }) {
  const cents = reading ? Math.max(-50, Math.min(50, reading.cents)) : 0;
  const angle = (cents / 50) * 60;
  const centered = reading && Math.abs(reading.cents) <= IN_TUNE_CENTS;
  const status = !reading
    ? 'Play a string'
    : reading.inTune
      ? 'In tune'
      : centered
        ? 'Hold it…'
        : reading.cents < 0
          ? 'Too low: tighten'
          : 'Too high: loosen';
  const tone = !reading ? 'muted' : reading.inTune || centered ? 'good' : 'warn';
  return (
    <div className={`tuner-dial tone-${tone}`}>
      <svg
        viewBox="-110 -110 220 130"
        role="img"
        aria-label={
          reading ? `${reading.note}, ${Math.round(reading.cents)} cents` : 'No note detected'
        }
      >
        <path d="M -95 0 A 95 95 0 0 1 95 0" className="dial-arc" />
        <path d="M -9.9 -94.5 A 95 95 0 0 1 9.9 -94.5" className="dial-zone" />
        {[-50, -25, 0, 25, 50].map((c) => {
          const a = ((c / 50) * 60 - 90) * (Math.PI / 180);
          return (
            <line
              key={c}
              x1={Math.cos(a) * 82}
              y1={Math.sin(a) * 82}
              x2={Math.cos(a) * 95}
              y2={Math.sin(a) * 95}
              className="dial-tick"
            />
          );
        })}
        <g style={{ transform: `rotate(${angle}deg)`, transition: 'transform 120ms ease-out' }}>
          <line x1="0" y1="0" x2="0" y2="-88" className="dial-needle" />
        </g>
        <circle r="6" className="dial-hub" />
      </svg>
      <div className="tuner-note" aria-hidden="true">
        {reading ? reading.note.replace(/\d+$/, '') : '–'}
        <span className="tuner-octave">{reading ? reading.note.match(/\d+$/)?.[0] : ''}</span>
      </div>
      <div className="tuner-meta">
        {reading ? (
          <>
            String {reading.string} ({STRING_LABELS[reading.string]}) ·{' '}
            {reading.cents > 0 ? '+' : ''}
            {Math.round(reading.cents)} cents
          </>
        ) : (
          'Listening…'
        )}
      </div>
      <div className="tuner-status" role="status" aria-live="polite">
        {reading?.inTune && <Icon name="check" />}
        {status}
      </div>
    </div>
  );
}
