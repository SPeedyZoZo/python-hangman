import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { nextLessonId, resolvePlayable } from '../content/index.ts';
import type { ResultsState } from '../app/usePractice.ts';
import { useCoachTips } from '../app/useCoach.ts';
import { Button, ButtonLink } from '../ui/Button.tsx';
import { Icon } from '../ui/Icon.tsx';
import { Stars } from '../ui/Stars.tsx';

const HEADLINES = ['Keep practising!', 'Nice work!', 'Great playing!', 'Brilliant!'];

export function ResultsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | null;
  const tips = useCoachTips(state?.summary ?? null);
  if (!state) return <Navigate to="/" replace />;
  const { summary, outcome, playable: ref } = state;
  const playable = resolvePlayable(ref.kind, ref.id, ref.arrangementId);
  const path = `/play/${ref.kind}/${ref.id}${ref.arrangementId ? `/${ref.arrangementId}` : ''}`;
  const next = ref.kind === 'lesson' && summary.stars > 0 ? nextLessonId(ref.id) : undefined;
  const pct = Math.round(summary.accuracy * 100);
  const timed = summary.mode === 'play';
  const c = summary.counts;

  return (
    <section className="stack results" aria-labelledby="results-title">
      <div className="card stack center">
        <p className="small muted">{playable?.title}</p>
        <Stars count={summary.stars} size={40} />
        <h1 id="results-title">{HEADLINES[summary.stars]}</h1>
        <p className="big-number">{pct}%</p>
        <p className="muted">
          accuracy · {timed ? 'Play-along' : 'Wait Mode'} at {Math.round(summary.tempo * 100)}%
          tempo
        </p>
        <div className="row center-row">
          <span className="pill">
            <Icon name="star" size={16} /> +{outcome.xpEarned} XP
          </span>
          <span className="pill">
            <Icon name="flame" size={16} /> {outcome.streak}-day streak
          </span>
          {outcome.newBest && <span className="pill pill-good">New best!</span>}
        </div>
      </div>

      <div className="card">
        <h2 className="h3">Breakdown</h2>
        {timed ? (
          <ul className="breakdown">
            <li>
              <Icon name="check" size={16} /> Perfect <strong>{c.perfect}</strong>
            </li>
            <li>
              <Icon name="check" size={16} /> Good <strong>{c.good}</strong>
            </li>
            <li>
              <Icon name="clock" size={16} /> Early <strong>{c.early}</strong>
            </li>
            <li>
              <Icon name="clock" size={16} /> Late <strong>{c.late}</strong>
            </li>
            <li>
              <Icon name="cross" size={16} /> Missed <strong>{c.miss}</strong>
            </li>
          </ul>
        ) : (
          <ul className="breakdown">
            <li>
              <Icon name="check" size={16} /> Notes and chords played <strong>{c.hit}</strong>
            </li>
            <li>
              <Icon name="cross" size={16} /> Wrong attempts{' '}
              <strong>{summary.wrongAttempts}</strong>
            </li>
          </ul>
        )}
      </div>

      {tips.length > 0 && (
        <div className="card stack coach-card">
          <h2 className="h3">
            <Icon name="help" size={18} /> Coach tips
          </h2>
          <ul className="tips">
            {tips.map((t) => (
              <li key={t.id}>
                <strong>{t.title}</strong> {t.body}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="row wrap-actions">
        <Button icon="restart" onClick={() => navigate(path, { replace: true })}>
          Retry
        </Button>
        {next ? (
          <ButtonLink to={`/play/lesson/${next}`} variant="primary" icon="play" replace>
            Next lesson
          </ButtonLink>
        ) : (
          <ButtonLink to={ref.kind === 'song' ? '/songs' : '/'} variant="primary">
            Done
          </ButtonLink>
        )}
      </div>
    </section>
  );
}
