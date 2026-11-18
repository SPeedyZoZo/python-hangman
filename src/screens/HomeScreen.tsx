import { Link } from 'react-router-dom';
import { getLesson, LESSONS, lessonNumber, UNITS } from '../content/index.ts';
import { currentStreak, isLessonUnlocked, localDay, nextUpLessonId } from '../progress/logic.ts';
import { useProgress } from '../progress/store.ts';
import { ButtonLink } from '../ui/Button.tsx';
import { Icon } from '../ui/Icon.tsx';
import { Stars } from '../ui/Stars.tsx';

export function HomeScreen() {
  const bests = useProgress((s) => s.bests);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => currentStreak(s.streak, localDay()));
  const nextId = nextUpLessonId(bests);
  const next = getLesson(nextId)!;
  const done = LESSONS.filter((l) => (bests[l.id]?.stars ?? 0) > 0).length;

  return (
    <section className="stack" aria-labelledby="home-title">
      <header className="row spread">
        <h1 id="home-title" className="brand">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width={32} height={32} /> Strumly
        </h1>
        <div className="row">
          <span className="pill" title="Day streak">
            <Icon name="flame" size={16} /> <span className="visually-hidden">Streak:</span>{' '}
            {streak}
          </span>
          <span className="pill" title="Experience points">
            <Icon name="star" size={16} /> {xp} XP
          </span>
        </div>
      </header>

      <div className="card continue-card stack">
        <p className="eyebrow">{done === 0 ? 'Start here' : 'Continue'}</p>
        <h2>
          Lesson {lessonNumber(nextId)} · {next.title}
        </h2>
        <p className="muted">{next.summary}</p>
        <div>
          <ButtonLink to={`/play/lesson/${nextId}`} variant="primary" size="lg" icon="play">
            {done === 0 ? 'Start' : 'Continue'}
          </ButtonLink>
        </div>
      </div>

      <p className="small muted">
        {done} of {LESSONS.length} lessons complete
      </p>

      {UNITS.map((u, ui) => {
        const unitDone = u.lessonIds.every((id) => (bests[id]?.stars ?? 0) > 0);
        return (
          <section key={u.id} className="unit" aria-labelledby={`unit-${u.id}`}>
            <h2 id={`unit-${u.id}`} className="h3">
              Unit {ui + 1} · {u.title}{' '}
              {unitDone && <Icon name="check" size={18} aria-label="complete" />}
            </h2>
            <p className="small muted">{u.description}</p>
            <ol className="lesson-list">
              {u.lessonIds.map((id) => {
                const l = getLesson(id)!;
                const unlocked = isLessonUnlocked(id, bests);
                const stars = bests[id]?.stars ?? 0;
                const content = (
                  <>
                    <span
                      className={`lesson-node ${stars ? 'done' : ''} ${id === nextId ? 'current' : ''}`}
                      aria-hidden="true"
                    >
                      {unlocked ? lessonNumber(id) : <Icon name="lock" size={16} />}
                    </span>
                    <span className="lesson-text">
                      <span className="lesson-title">{l.title}</span>
                      <span className="small muted">{l.summary}</span>
                    </span>
                    {unlocked && <Stars count={stars} size={16} />}
                  </>
                );
                return (
                  <li key={id}>
                    {unlocked ? (
                      <Link className="lesson-row" to={`/play/lesson/${id}`}>
                        {content}
                      </Link>
                    ) : (
                      <span
                        className="lesson-row locked"
                        aria-label={`${l.title}: locked. Earn a star on the previous lesson to unlock it.`}
                      >
                        {content}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </section>
  );
}
