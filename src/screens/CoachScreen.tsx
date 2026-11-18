import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { coach } from '../coach/index.ts';
import { FAQ } from '../coach/faq.ts';
import type { CoachAnswer } from '../coach/types.ts';
import { Button, ButtonLink } from '../ui/Button.tsx';

interface Turn {
  q: string;
  a: CoachAnswer;
}

const SUGGESTED = [
  'My fingers hurt',
  'Why does my note buzz?',
  'How do I change chords faster?',
  "The app isn't hearing me",
];

export function CoachScreen() {
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [turns]);

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text) return;
    setQuestion('');
    const a = await coach.ask(text);
    setTurns((t) => [...t, { q: text, a }]);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(question);
  };

  return (
    <section className="stack" aria-labelledby="coach-title">
      <div className="row title-row">
        <ButtonLink to="/" variant="ghost" icon="back" aria-label="Back" />
        <div>
          <h1 id="coach-title">Ask the coach</h1>
          <p className="small muted">Offline answers to common beginner questions.</p>
        </div>
      </div>

      <div className="stack chat" aria-live="polite">
        {turns.length === 0 && (
          <div className="card stack">
            <p>Stuck? Ask me about technique, practice or the app. Try one of these:</p>
            <div className="row">
              {SUGGESTED.map((s) => (
                <Button key={s} size="sm" onClick={() => ask(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className="stack" style={{ gap: 'var(--s2)' }}>
            <p className="bubble bubble-me">{t.q}</p>
            <div className="bubble bubble-coach">
              <p>{t.a.answer}</p>
              {t.a.links && (
                <p className="row" style={{ marginTop: 'var(--s2)' }}>
                  {t.a.links.map((l) => (
                    <Link key={l.to} to={l.to}>
                      {l.label} →
                    </Link>
                  ))}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form className="row ask-form" onSubmit={onSubmit}>
        <label htmlFor="coach-q" className="visually-hidden">
          Your question
        </label>
        <input
          id="coach-q"
          className="text-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type a question…"
          autoComplete="off"
          maxLength={200}
        />
        <Button type="submit" variant="primary" disabled={!question.trim()}>
          Ask
        </Button>
      </form>

      <details className="card">
        <summary>All topics ({FAQ.length})</summary>
        <ul className="faq-list">
          {FAQ.map((f) => (
            <li key={f.id}>
              <button type="button" className="link-button" onClick={() => ask(f.question)}>
                {f.question}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
