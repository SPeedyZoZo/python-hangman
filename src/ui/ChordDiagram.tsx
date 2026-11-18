import { CHORDS, stringForIndex, type ChordId } from '../music/chords.ts';

/**
 * Chord box diagram (FR-CHD-1): strings vertical (low E on the left for right-handed players),
 * nut at the top, ○ open, × muted, finger numbers in the dots. Mirrored when `lefty`.
 */
export function ChordDiagram({
  id,
  lefty = false,
  size = 140,
  showName = true,
}: {
  id: ChordId;
  lefty?: boolean;
  size?: number;
  showName?: boolean;
}) {
  const shape = CHORDS[id];
  const fretted = shape.frets.filter((f): f is number => f !== null && f > 0);
  const nFrets = Math.max(4, ...fretted.map((f) => f));
  const W = 120;
  const H = 150;
  const left = 18;
  const right = W - 18;
  const top = 36;
  const bottom = H - 10;
  const sx = (i: number) => {
    const col = lefty ? 5 - i : i;
    return left + (col * (right - left)) / 5;
  };
  const fy = (f: number) => top + ((f - 0.5) * (bottom - top)) / nFrets;
  const desc = shape.frets
    .map((f, i) => {
      const s = stringForIndex(i);
      if (f === null) return `string ${s} muted`;
      if (f === 0) return `string ${s} open`;
      return `string ${s} fret ${f} finger ${shape.fingers[i]}`;
    })
    .join(', ');
  return (
    <figure className="chord-diagram" style={{ width: size }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={size}
        height={(size * H) / W}
        role="img"
        aria-label={`${shape.name} chord: ${desc}`}
      >
        {showName && (
          <text x={W / 2} y={14} className="cd-name">
            {id}
          </text>
        )}
        {Array.from({ length: nFrets + 1 }, (_, f) => (
          <line
            key={f}
            x1={left}
            x2={right}
            y1={top + (f * (bottom - top)) / nFrets}
            y2={top + (f * (bottom - top)) / nFrets}
            className={f === 0 ? 'cd-nut' : 'cd-fret'}
          />
        ))}
        {shape.frets.map((_, i) => (
          <line key={i} x1={sx(i)} x2={sx(i)} y1={top} y2={bottom} className="cd-string" />
        ))}
        {shape.frets.map((f, i) =>
          f === null ? (
            <text key={i} x={sx(i)} y={top - 8} className="cd-mark">
              ×
            </text>
          ) : f === 0 ? (
            <circle key={i} cx={sx(i)} cy={top - 12} r={5} className="cd-open" />
          ) : (
            <g key={i}>
              <circle cx={sx(i)} cy={fy(f)} r={8.5} className="cd-dot" />
              <text x={sx(i)} y={fy(f) + 4} className="cd-finger">
                {shape.fingers[i]}
              </text>
            </g>
          ),
        )}
      </svg>
    </figure>
  );
}
