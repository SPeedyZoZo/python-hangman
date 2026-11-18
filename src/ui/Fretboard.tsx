import {
  fretToMidi,
  noteName,
  STRING_LABELS,
  STRINGS,
  type StringNumber,
} from '../music/theory.ts';

const MARKERS = new Set([3, 5, 7, 9, 12]);

/**
 * On-screen fretboard (virtual input, FR-ONB-4). String 1 on top to match the tab highway.
 * Mirrored for left-handed players.
 */
export function Fretboard({
  onPlay,
  lefty,
  hint,
  maxFret = 12,
}: {
  onPlay: (string: StringNumber, fret: number) => void;
  lefty: boolean;
  hint?: { string: StringNumber; fret: number } | null;
  maxFret?: number;
}) {
  const frets = Array.from({ length: maxFret + 1 }, (_, i) => i);
  return (
    <div
      className="fretboard-wrap"
      role="group"
      aria-label="On-screen guitar: tap a string and fret to play it"
    >
      <div
        className={`fretboard ${lefty ? 'lefty' : ''}`}
        style={{ gridTemplateColumns: `repeat(${maxFret + 1}, minmax(40px, 1fr))` }}
      >
        {STRINGS.map((s) =>
          frets.map((f) => {
            const isHint = hint?.string === s && hint.fret === f;
            return (
              <button
                key={`${s}-${f}`}
                type="button"
                className={`fret-cell ${f === 0 ? 'open' : ''} ${isHint ? 'hint' : ''}`}
                style={{
                  gridRow: s,
                  gridColumn: lefty ? maxFret + 1 - f : f + 1,
                  ['--sc' as string]: `var(--string-${s})`,
                }}
                aria-label={`String ${s} (${STRING_LABELS[s]}), ${f === 0 ? 'open' : `fret ${f}`}: ${noteName(fretToMidi(s, f))}`}
                onClick={() => onPlay(s, f)}
              >
                <span className="fret-string" aria-hidden="true" />
                {s === 1 && (
                  <span className="fret-num" aria-hidden="true">
                    {f}
                  </span>
                )}
                {s === 6 && MARKERS.has(f) && <span className="fret-dot" aria-hidden="true" />}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
