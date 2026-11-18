import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { resolvePlayable } from '../content/index.ts';
import type { Playable } from '../content/types.ts';
import { CHORD_IDS, type ChordId } from '../music/chords.ts';
import type { Step } from '../music/tab.ts';
import { usePractice } from '../app/usePractice.ts';
import { useSettings } from '../settings/store.ts';
import { Button, ButtonLink } from '../ui/Button.tsx';
import { ChordDiagram } from '../ui/ChordDiagram.tsx';
import { Fretboard } from '../ui/Fretboard.tsx';
import { Icon } from '../ui/Icon.tsx';
import { LevelMeter } from '../ui/LevelMeter.tsx';
import { MicNotice } from '../ui/MicNotice.tsx';
import { TabHighway } from '../ui/TabHighway.tsx';

export function PlayerScreen() {
  const { kind = '', id = '', arr } = useParams();
  const playable = useMemo(() => resolvePlayable(kind, id, arr), [kind, id, arr]);
  if (!playable) {
    return (
      <section className="stack">
        <h1>Not found</h1>
        <ButtonLink to="/" icon="back">
          Back to lessons
        </ButtonLink>
      </section>
    );
  }
  return <Player key={`${kind}/${id}/${arr ?? ''}`} playable={playable} />;
}

/** Next chord at or after the current step that differs from the current one (FR-PLY-9). */
function upcomingChord(steps: Step[], current?: Step): { now?: ChordId; next?: ChordId } {
  if (!current) return {};
  const now = current.target.kind === 'chord' ? current.target.chord : undefined;
  for (let i = current.index + 1; i < steps.length; i++) {
    const t = steps[i]!.target;
    if (t.kind === 'chord' && t.chord !== now) return { now, next: t.chord };
  }
  return { now };
}

function Player({ playable }: { playable: Playable }) {
  const p = usePractice(playable);
  const lefty = useSettings((s) => s.handedness === 'left');
  const labels = useSettings((s) => s.labels);
  const showFretboard = useSettings((s) => s.showFretboard);
  const metronome = useSettings((s) => s.metronome);
  const setSettings = useSettings((s) => s.set);
  const { parsed, phase } = p;
  const bars = parsed.barStarts.length;
  const hasChords = parsed.steps.some((s) => s.target.kind === 'chord');
  const current = p.currentStep;
  const chords = upcomingChord(parsed.steps, current);
  const virtual = p.listening.mode === 'virtual';
  const loopBeats = p.loop
    ? {
        startBeat: parsed.barStarts[p.loop.startBar] ?? 0,
        endBeat: parsed.barStarts[p.loop.endBar + 1] ?? parsed.totalBeats,
      }
    : null;
  const usedChords = useMemo(
    () => [
      ...new Set(parsed.steps.flatMap((s) => (s.target.kind === 'chord' ? [s.target.chord] : []))),
    ],
    [parsed.steps],
  );
  const distractors = CHORD_IDS.filter((c) => !usedChords.includes(c)).slice(0, 1);

  if (phase === 'intro') {
    return (
      <section className="stack" aria-labelledby="player-title">
        <div className="row title-row">
          <ButtonLink
            to={playable.kind === 'song' ? '/songs' : '/'}
            variant="ghost"
            icon="back"
            aria-label="Back"
          />
          <div>
            <p className="small muted">{playable.subtitle}</p>
            <h1 id="player-title">{playable.title}</h1>
          </div>
        </div>
        {playable.tips.map((t) => (
          <article key={t.title} className="card tip-card">
            {t.chord && <ChordDiagram id={t.chord} lefty={lefty} size={120} />}
            <div className="stack" style={{ gap: 'var(--s2)' }}>
              <h2 className="h3">{t.title}</h2>
              <p>{t.body}</p>
            </div>
          </article>
        ))}
        <div className="row">
          <Button variant="primary" size="lg" icon="play" onClick={() => p.begin()}>
            Let's play
          </Button>
          <Button size="lg" icon="listen" onClick={() => p.listen()}>
            Listen first
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="stack player" aria-labelledby="player-title">
      <header className="row spread">
        <div className="row title-row">
          <ButtonLink
            to={playable.kind === 'song' ? '/songs' : '/'}
            variant="ghost"
            icon="back"
            aria-label="Back"
          />
          <div>
            <p className="small muted">{playable.subtitle}</p>
            <h1 id="player-title" className="h2">
              {playable.title}
            </h1>
          </div>
        </div>
        <div className="row">
          {phase === 'playing' && <Button icon="pause" aria-label="Pause" onClick={p.pause} />}
          {phase === 'paused' && <Button icon="play" aria-label="Resume" onClick={p.resume} />}
          {(phase === 'playing' || phase === 'paused') && (
            <Button icon="restart" aria-label="Restart" onClick={() => p.begin()} />
          )}
        </div>
      </header>

      {p.listening.status === 'listening' && (
        <div className="row spread status-row">
          <MicNotice mode={p.listening.mode} micError={p.listening.micError} />
          <span className="heard" aria-live="off">
            Heard: <strong>{p.heard || '…'}</strong>
          </span>
          <LevelMeter rms={p.level} />
        </div>
      )}

      <div className="highway-card">
        <TabHighway
          steps={parsed.steps}
          barStarts={parsed.barStarts}
          totalBeats={parsed.totalBeats}
          positionRef={p.positionRef}
          statusOf={p.statusOf}
          version={p.version}
          labels={labels}
          loop={loopBeats}
        />
        {p.countIn !== null && p.mode === 'play' && phase === 'playing' && (
          <div className="count-in" aria-hidden="true">
            {p.countIn}
          </div>
        )}
        {(phase === 'ready' || phase === 'listening') && (
          <div className="highway-overlay">
            {phase === 'listening' ? (
              <Button icon="pause" onClick={p.stopListen}>
                Stop listening
              </Button>
            ) : (
              <Button variant="primary" size="lg" icon="play" onClick={() => p.begin()}>
                Start
              </Button>
            )}
          </div>
        )}
      </div>

      <p className={`feedback tone-${p.feedback?.tone ?? 'info'}`} role="status" aria-live="polite">
        {p.feedback?.tone === 'good' && <Icon name="check" size={18} />}
        {p.feedback?.tone === 'bad' && <Icon name="cross" size={18} />}
        {p.feedback?.tone === 'warn' && <Icon name="clock" size={18} />}
        {p.feedback?.text ??
          (phase === 'playing' && p.mode === 'wait'
            ? 'Take your time. The music waits for you.'
            : ' ')}
      </p>

      {hasChords && (chords.now || chords.next) && (
        <div className="chord-strip" aria-label="Chords">
          {chords.now && (
            <div className="stack center" style={{ gap: 4 }}>
              <span className="small muted">Now</span>
              <ChordDiagram id={chords.now} lefty={lefty} size={104} />
            </div>
          )}
          {chords.next && (
            <div className="stack center next-chord" style={{ gap: 4 }}>
              <span className="small muted">Next</span>
              <ChordDiagram id={chords.next} lefty={lefty} size={84} />
            </div>
          )}
        </div>
      )}

      <div className="controls card">
        <div className="segmented" role="radiogroup" aria-label="Practice mode">
          {(['wait', 'play'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={p.mode === m}
              className="seg"
              onClick={() => p.setMode(m)}
            >
              {m === 'wait' ? 'Wait Mode' : 'Play-along'}
            </button>
          ))}
        </div>
        <div className="row tempo" role="group" aria-label="Tempo">
          <Button
            size="sm"
            icon="minus"
            aria-label="Slower"
            onClick={() => p.setTempo(p.tempo - 0.1)}
            disabled={p.tempo <= 0.5}
          />
          <span className="tempo-value" aria-live="polite">
            Tempo {Math.round(p.tempo * 100)}%
          </span>
          <Button
            size="sm"
            icon="plus"
            aria-label="Faster"
            onClick={() => p.setTempo(p.tempo + 0.1)}
            disabled={p.tempo >= 1}
          />
        </div>
        <div className="row">
          <Button
            size="sm"
            icon="listen"
            onClick={() => (phase === 'listening' ? p.stopListen() : p.listen())}
          >
            {phase === 'listening' ? 'Stop' : 'Listen'}
          </Button>
          <Button
            size="sm"
            icon="metronome"
            aria-pressed={metronome}
            onClick={() => setSettings({ metronome: !metronome })}
          >
            Metronome
          </Button>
          <Button
            size="sm"
            icon="guitar"
            aria-pressed={showFretboard}
            onClick={() => setSettings({ showFretboard: !showFretboard })}
          >
            On-screen guitar
          </Button>
        </div>
        <div className="row loop-row" role="group" aria-label="Loop bars">
          <Button
            size="sm"
            icon="loop"
            aria-pressed={!!p.loop}
            onClick={() =>
              p.setLoop(p.loop ? null : { startBar: 0, endBar: Math.min(1, bars - 1) })
            }
          >
            Loop
          </Button>
          {p.loop && (
            <>
              <label className="small">
                from bar{' '}
                <select
                  value={p.loop.startBar}
                  onChange={(e) => {
                    const start = Number(e.target.value);
                    p.setLoop({ startBar: start, endBar: Math.max(start, p.loop!.endBar) });
                  }}
                >
                  {Array.from({ length: bars }, (_, i) => (
                    <option key={i} value={i}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
              <label className="small">
                to{' '}
                <select
                  value={p.loop.endBar}
                  onChange={(e) => {
                    const end = Number(e.target.value);
                    p.setLoop({ startBar: Math.min(p.loop!.startBar, end), endBar: end });
                  }}
                >
                  {Array.from({ length: bars }, (_, i) => (
                    <option key={i} value={i}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
      </div>

      {(virtual || showFretboard) && (
        <div className="card stack">
          <h2 className="h3">On-screen guitar</h2>
          {hasChords && (
            <div className="row" role="group" aria-label="Strum a chord">
              {[...usedChords, ...distractors].map((c) => (
                <Button key={c} size="sm" onClick={() => p.strum(c)}>
                  Strum {c}
                </Button>
              ))}
            </div>
          )}
          <Fretboard
            lefty={lefty}
            onPlay={p.pluck}
            hint={
              current?.target.kind === 'note'
                ? { string: current.target.string, fret: current.target.fret }
                : null
            }
          />
        </div>
      )}
      <p className="small muted">
        Tip: Wait Mode holds each note until you play it. Play-along keeps time and scores your
        timing. <Link to="/tuner">Tune up first</Link> for the best results.
      </p>
    </section>
  );
}
