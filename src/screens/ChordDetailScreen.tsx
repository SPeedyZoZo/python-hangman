import { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { audioEngine } from '../audio/AudioEngine.ts';
import type { AudioFrame } from '../audio/analysis/FrameAnalyzer.ts';
import { verifyChord, type ChordHint } from '../audio/analysis/chordVerifier.ts';
import { SENSITIVITY } from '../audio/analysis/sensitivity.ts';
import { renderStep } from '../audio/synth/render.ts';
import { hintText } from '../app/feedback.ts';
import { useListening } from '../app/useListening.ts';
import { CHORD_IDS, chordNoteNames, CHORDS, isChordId, type ChordId } from '../music/chords.ts';
import { CHORD_SETTLE_MS } from '../practice/matcher.ts';
import { useSettings } from '../settings/store.ts';
import { Button, ButtonLink } from '../ui/Button.tsx';
import { ChordDiagram } from '../ui/ChordDiagram.tsx';
import { Icon } from '../ui/Icon.tsx';
import { LevelMeter } from '../ui/LevelMeter.tsx';
import { MicNotice } from '../ui/MicNotice.tsx';

type Verdict =
  | { kind: 'idle' }
  | { kind: 'listening' }
  | { kind: 'ok' }
  | { kind: 'almost'; hints: ChordHint[] };

function strumSamples(chord: ChordId) {
  return renderStep(
    { index: 0, beat: 0, beats: 1, bar: 0, target: { kind: 'chord', chord, strum: 'down' } },
    audioEngine.sampleRate,
    2.2,
    Math.floor(Math.random() * 1e6),
  );
}

export function ChordDetailScreen() {
  const { id = '' } = useParams();
  if (!isChordId(id)) {
    return (
      <section className="stack">
        <h1>Unknown chord</h1>
        <ButtonLink to="/chords" icon="back">
          All chords
        </ButtonLink>
      </section>
    );
  }
  return <ChordDetail key={id} id={id} />;
}

function ChordDetail({ id }: { id: ChordId }) {
  const shape = CHORDS[id];
  const lefty = useSettings((s) => s.handedness === 'left');
  const sensitivity = useSettings((s) => s.sensitivity);
  const [verdict, setVerdict] = useState<Verdict>({ kind: 'idle' });
  const [level, setLevel] = useState(0);
  const lastOnset = useRef(-Infinity);
  const run = useRef(0);
  const decided = useRef(false);
  const lastHints = useRef<ChordHint[]>([]);
  const lastUi = useRef(0);

  const onFrame = useCallback(
    (f: AudioFrame) => {
      if (f.t - lastUi.current > 100) {
        lastUi.current = f.t;
        setLevel(f.rms);
      }
      if (f.onset && f.onsetT !== null) {
        lastOnset.current = f.onsetT;
        run.current = 0;
        decided.current = false;
        lastHints.current = [];
        setVerdict({ kind: 'listening' });
      }
      const since = f.t - lastOnset.current;
      if (decided.current || !f.chroma || since < CHORD_SETTLE_MS || since > 900) return;
      const v = verifyChord(id, f.chroma, SENSITIVITY[sensitivity]);
      if (v.match) {
        if (++run.current >= 3) {
          decided.current = true;
          setVerdict({ kind: 'ok' });
        }
      } else {
        run.current = 0;
        if (v.hints.length) lastHints.current = v.hints;
        if (since > 650) {
          decided.current = true;
          setVerdict({ kind: 'almost', hints: lastHints.current });
        }
      }
    },
    [id, sensitivity],
  );

  const { status, mode, micError, start } = useListening({ onFrame, wantChroma: () => true });

  const listen = async () => {
    await audioEngine.ensureContext();
    audioEngine.playOut(strumSamples(id));
  };

  const others = CHORD_IDS.filter((c) => c !== id).slice(0, 2);

  return (
    <section className="stack" aria-labelledby="chord-title">
      <div className="row title-row">
        <ButtonLink to="/chords" variant="ghost" icon="back" aria-label="All chords" />
        <div>
          <h1 id="chord-title">{id}</h1>
          <p className="muted">{shape.name}</p>
        </div>
      </div>
      <div className="card chord-detail">
        <ChordDiagram id={id} lefty={lefty} size={180} showName={false} />
        <div className="stack">
          <p>
            <strong>Notes:</strong> {chordNoteNames(id).join(' · ')}
          </p>
          <p>{shape.tip}</p>
          <div>
            <Button icon="listen" onClick={listen}>
              Listen
            </Button>
          </div>
        </div>
      </div>

      <div className="card stack center" aria-labelledby="check-title">
        <h2 id="check-title" className="h3">
          Check my chord
        </h2>
        {status !== 'listening' ? (
          <Button
            variant="primary"
            size="lg"
            icon="mic"
            onClick={() => start()}
            disabled={status === 'starting'}
          >
            {status === 'starting' ? 'Starting…' : 'Start checking'}
          </Button>
        ) : (
          <>
            <MicNotice mode={mode} micError={micError} />
            <LevelMeter rms={level} />
            <p
              className={`verdict verdict-${verdict.kind}`}
              role="status"
              aria-live="polite"
              data-testid="chord-verdict"
            >
              {verdict.kind === 'idle' && 'Fret the chord and strum once.'}
              {verdict.kind === 'listening' && 'Listening…'}
              {verdict.kind === 'ok' && (
                <>
                  <Icon name="check" /> Sounds like {id}!
                </>
              )}
              {verdict.kind === 'almost' && (
                <>
                  <Icon name="cross" /> Not quite. {hintText(verdict.hints)}
                </>
              )}
            </p>
            {mode === 'virtual' && (
              <div className="row" role="group" aria-label="Strum on screen">
                {[id, ...others].map((c) => (
                  <Button key={c} size="sm" onClick={() => audioEngine.inject(strumSamples(c))}>
                    Strum {c}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
