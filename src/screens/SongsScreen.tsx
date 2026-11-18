import { SONGS, playableKey } from '../content/index.ts';
import { useProgress } from '../progress/store.ts';
import { ButtonLink } from '../ui/Button.tsx';
import { Stars } from '../ui/Stars.tsx';

const LEVEL = ['', 'Beginner', 'Easy', 'Intermediate'];

export function SongsScreen() {
  const bests = useProgress((s) => s.bests);
  return (
    <section className="stack" aria-labelledby="songs-title">
      <h1 id="songs-title">Songs</h1>
      <p className="muted">
        Public-domain classics arranged for beginners: melody, chords, or both.
      </p>
      <ul className="song-list">
        {SONGS.map((s) => (
          <li key={s.id} className="card stack">
            <div className="row spread">
              <div>
                <h2 className="h3">{s.title}</h2>
                <p className="small muted">{s.credit}</p>
              </div>
              <span className={`pill level-${s.difficulty}`}>{LEVEL[s.difficulty]}</span>
            </div>
            <div className="row">
              {s.arrangements.map((a) => {
                const best = bests[playableKey({ kind: 'song', id: s.id, arrangementId: a.id })];
                return (
                  <ButtonLink key={a.id} to={`/play/song/${s.id}/${a.id}`} icon="play" size="sm">
                    {a.label} {best && <Stars count={best.stars} size={14} />}
                  </ButtonLink>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
