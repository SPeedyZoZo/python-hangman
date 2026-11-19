import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { resolvePlayable } from '../content/index.ts';
import type { Playable } from '../content/types.ts';
import { CHORD_IDS, type ChordId } from '../music/chords.ts';
import type { Step } from '../music/tab.ts';
import { useFullscreen } from '../app/device.ts';
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

function isTyping(el: EventTarget | null): boolean {
  return (
    el instanceof HTMLElement &&
    (el.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName))
  );
}

function Player({ playable }: { playable: Playable }) {
  const p = usePractice(playable);
  const lefty = useSettings((s) => s.handedness === 'left');
  const labels = useSettings((s) => s.labels);
  const showFretboard = useSettings((s) => s.showFretboard);
  const metronome = useSettings((s) => s.metronome);
  const setSettings = useSettings((s) => s.set);
  const [moreOpen, setMoreOpen] = useState(false);
  const { parsed, phase } = p;
  const bars = parsed.barStarts.length;
  const hasChords = parsed.steps.some((s) => s.target.kind === 'chord');
  const hasNotes = parsed.steps.some((s) => s.target.kind === 'note');
  // The on-screen fretboard only needs the frets this exercise uses (no sideways scrolling).
  const fretboardMax = Math.min(
    12,
    Math.max(
      4,
      parsed.steps.reduce(
        (m, s) => (s.target.kind === 'note' ? Math.max(m, s.target.fret) : m),
        0,
      ) + 1,
    ),
  );
  const fullscreen = useFullscreen();
  const current = p.currentStep;
  const chords = upcomingChord(parsed.steps, current);
  const virtual = p.listening.mode === 'virtual';
  const inputMode = virtual || showFretboard;
  const backTo = playable.kind === 'song' ? '/songs' : '/';
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

  // Keyboard shortcuts (docs/03-design/accessibility.md): Space play/pause, W mode, ←/→ tempo, L listen.
  useEffect(() => {
    if (phase === 'intro') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
      if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        if (phase === 'playing') p.pause();
        else if (phase === 'paused') p.resume();
        else if (phase === 'ready') void p.begin();
      } else if (e.key === 'w' || e.key === 'W') p.setMode(p.mode === 'wait' ? 'play' : 'wait');
      else if (e.key === 'ArrowLeft') p.setTempo(p.tempo - 0.1);
      else if (e.key === 'ArrowRight') p.setTempo(p.tempo + 0.1);
      else if (e.key === 'l' || e.key === 'L')
        void (phase === 'listening' ? p.stopListen() : p.listen());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p, phase]);

  if (phase === 'intro') {
    return (
      <section className="stack player-intro" aria-labelledby="player-title">
        <div className="row title-row">
          <ButtonLink to={backTo} variant="ghost" icon="back" aria-label="Back" />
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
        <div className="row sticky-actions">
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
    <section
      className={`player-shell${inputMode ? ' player-shell--input' : ''}`}
      aria-labelledby="player-title"
    >
      <header className="player-top">
        <ButtonLink to={backTo} variant="ghost" icon="back" aria-label="Back" />
        <div className="player-titles">
          <p className="small muted player-subtitle">{playable.subtitle}</p>
          <h1 id="player-title" className="player-title">
            {playable.title}
          </h1>
        </div>
        <div className="row player-top-actions">
          {fullscreen.supported && (
            <Button
              icon={fullscreen.active ? 'shrink' : 'expand'}
              aria-label={fullscreen.active ? 'Exit full screen' : 'Full screen'}
              aria-pressed={fullscreen.active}
              onClick={fullscreen.toggle}
            />
          )}
          {phase === 'playing' && <Button icon="pause" aria-label="Pause" onClick={p.pause} />}
          {phase === 'paused' && (
            <Button variant="primary" icon="play" aria-label="Resume" onClick={p.resume} />
          )}
          {(phase === 'playing' || phase === 'paused') && (
            <Button icon="restart" aria-label="Restart" onClick={() => p.begin()} />
          )}
        </div>
      </header>

      {p.listening.status === 'listening' && !virtual && (
        <div className="player-status">
          <MicNotice mode={p.listening.mode} micError={p.listening.micError} compact />
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
          minLane={inputMode ? 20 : undefined}
        />
        {p.countIn !== null && p.mode === 'play' && phase === 'playing' && (
          <div className="count-in" aria-hidden="true">
            {p.countIn}
          </div>
        )}
        {(phase === 'ready' || phase === 'listening' || phase === 'paused') && (
          <div className="highway-overlay">
            {phase === 'listening' ? (
              <Button icon="pause" onClick={p.stopListen}>
                Stop listening
              </Button>
            ) : phase === 'paused' ? (
              <Button variant="primary" size="lg" icon="play" onClick={p.resume}>
                Resume
              </Button>
            ) : (
              <div className="stack center" style={{ gap: 'var(--s2)' }}>
                {virtual && (
                  <MicNotice mode={p.listening.mode} micError={p.listening.micError} compact />
                )}
                <Button variant="primary" size="lg" icon="play" onClick={() => p.begin()}>
                  Start
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="player-feedback-row">
        <p
          className={`feedback tone-${p.feedback?.tone ?? 'info'}`}
          role="status"
          aria-live="polite"
        >
          {p.feedback?.tone === 'good' && <Icon name="check" size={22} />}
          {p.feedback?.tone === 'bad' && <Icon name="cross" size={22} />}
          {p.feedback?.tone === 'warn' && <Icon name="clock" size={22} />}
          <span>
            {p.feedback?.text ??
              (phase === 'playing' && p.mode === 'wait'
                ? 'Take your time. The music waits for you.'
                : ' ')}
          </span>
        </p>
        {hasChords && (chords.now || chords.next) && (
          <div className="chord-strip" aria-label="Chords">
            {chords.now && (
              <div className="chord-slot">
                <span className="small muted">Now</span>
                <ChordDiagram id={chords.now} lefty={lefty} size={92} />
              </div>
            )}
            {chords.next && (
              <div className="chord-slot next-chord">
                <span className="small muted">Next</span>
                <ChordDiagram id={chords.next} lefty={lefty} size={74} />
              </div>
            )}
          </div>
        )}
      </div>

      {inputMode && (
        <div className="player-fretboard">
          {hasChords && (
            <div className="strum-row" role="group" aria-label="Strum a chord">
              {[...usedChords, ...distractors].map((c) => (
                <Button key={c} size="sm" onClick={() => p.strum(c)}>
                  Strum {c}
                </Button>
              ))}
            </div>
          )}
          {hasNotes && (
            <Fretboard
              lefty={lefty}
              onPlay={p.pluck}
              maxFret={fretboardMax}
              hint={
                current?.target.kind === 'note'
                  ? { string: current.target.string, fret: current.target.fret }
                  : null
              }
            />
          )}
        </div>
      )}

      {moreOpen && (
        <div className="card stack player-more" id="player-more">
          {virtual && <MicNotice mode={p.listening.mode} micError={p.listening.micError} />}
          <div className="row">
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
          {p.loop && (
            <div className="row loop-row" role="group" aria-label="Loop bars">
              <label className="small">
                Loop from bar{' '}
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
            </div>
          )}
          <p className="small muted">
            Wait Mode holds each note until you play it. Play-along keeps time and scores your
            timing. <Link to="/tuner">Tune up first</Link> for the best results. Prop your phone
            30–60 cm from the guitar.
          </p>
        </div>
      )}

      <div className="player-dock" role="toolbar" aria-label="Practice controls">
        <div className="segmented" role="radiogroup" aria-label="Practice mode">
          {(['wait', 'play'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={p.mode === m}
              aria-label={m === 'wait' ? 'Wait Mode' : 'Play-along'}
              className="seg"
              onClick={() => p.setMode(m)}
            >
              {m === 'wait' ? (
                <>
                  Wait<span className="seg-extra"> Mode</span>
                </>
              ) : (
                <>
                  Play<span className="seg-extra">-along</span>
                </>
              )}
            </button>
          ))}
        </div>
        <div className="tempo" role="group" aria-label="Tempo">
          <Button
            size="sm"
            icon="minus"
            aria-label="Slower"
            onClick={() => p.setTempo(p.tempo - 0.1)}
            disabled={p.tempo <= 0.5}
          />
          <span className="tempo-value" aria-live="polite">
            <span className="visually-hidden">Tempo </span>
            {Math.round(p.tempo * 100)}%
          </span>
          <Button
            size="sm"
            icon="plus"
            aria-label="Faster"
            onClick={() => p.setTempo(p.tempo + 0.1)}
            disabled={p.tempo >= 1}
          />
        </div>
        <div className="dock-actions">
          <Button
            size="sm"
            icon="listen"
            aria-label={phase === 'listening' ? 'Stop' : 'Listen'}
            onClick={() => (phase === 'listening' ? p.stopListen() : p.listen())}
          >
            <span className="dock-label">{phase === 'listening' ? 'Stop' : 'Listen'}</span>
          </Button>
          <Button
            size="sm"
            icon="loop"
            aria-label="Loop"
            aria-pressed={!!p.loop}
            onClick={() => {
              p.setLoop(p.loop ? null : { startBar: 0, endBar: Math.min(1, bars - 1) });
              if (!p.loop) setMoreOpen(true);
            }}
          >
            <span className="dock-label">Loop</span>
          </Button>
          <Button
            size="sm"
            icon="settings"
            aria-label="More"
            aria-expanded={moreOpen}
            aria-controls="player-more"
            onClick={() => setMoreOpen((o) => !o)}
          >
            <span className="dock-label">More</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
