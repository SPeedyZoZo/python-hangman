import { Link } from 'react-router-dom';
import { CHORD_IDS, CHORDS } from '../music/chords.ts';
import { useSettings } from '../settings/store.ts';
import { ChordDiagram } from '../ui/ChordDiagram.tsx';

export function ChordsScreen() {
  const lefty = useSettings((s) => s.handedness === 'left');
  return (
    <section className="stack" aria-labelledby="chords-title">
      <h1 id="chords-title">Chords</h1>
      <p className="muted">Tap a chord to hear it and check your shape.</p>
      <ul className="chord-grid">
        {CHORD_IDS.map((id) => (
          <li key={id}>
            <Link
              to={`/chords/${id}`}
              className="chord-tile"
              aria-label={`${CHORDS[id].name}: open chord details`}
            >
              <ChordDiagram id={id} lefty={lefty} size={110} />
              <span className="small muted">{CHORDS[id].name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
