import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { Step } from '../music/tab.ts';
import { noteName, STRING_LABELS, STRINGS, type StringNumber } from '../music/theory.ts';
import type { StepStatus } from '../practice/session.ts';

const TOP = 30;
const BOTTOM = 12;
const GUTTER = 30;
/** Lanes grow with the space available (phones on a music stand need big targets), within limits. */
const MIN_LANE = 28;
const MAX_LANE = 48;

const GLYPH: Partial<Record<StepStatus, string>> = {
  hit: '✓',
  perfect: '✓',
  good: '✓',
  early: '◷',
  late: '◷',
  miss: '✗',
};

function tone(status: StepStatus): string {
  if (status === 'hit' || status === 'perfect' || status === 'good') return 'good';
  if (status === 'early' || status === 'late') return 'warn';
  if (status === 'miss') return 'bad';
  return status;
}

export interface TabHighwayProps {
  steps: Step[];
  barStarts: number[];
  totalBeats: number;
  /** Current song position in beats, updated by the caller every animation frame. */
  positionRef: RefObject<number>;
  statusOf: (index: number) => StepStatus;
  /** Bumped whenever a status changes, to re-render gems. */
  version: number;
  labels: 'fret' | 'note';
  loop?: { startBeat: number; endBeat: number } | null;
  pxPerBeat?: number;
}

/** Scrolling tab highway (ADR-0007): string 1 on top, notes as fret-numbered gems. */
export function TabHighway({
  steps,
  barStarts,
  totalBeats,
  positionRef,
  statusOf,
  version,
  labels,
  loop,
  pxPerBeat = 84,
}: TabHighwayProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const [size, setSize] = useState({ width: 360, height: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setSize({
        width: Math.max(280, entry!.contentRect.width),
        height: entry!.contentRect.height,
      }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { width } = size;
  const LANE_H = Math.round(
    Math.min(MAX_LANE, Math.max(MIN_LANE, (size.height - TOP - BOTTOM) / 6 || MIN_LANE)),
  );
  const HEIGHT = TOP + LANE_H * 6 + BOTTOM;
  const laneY = (s: StringNumber) => TOP + (s - 1) * LANE_H + LANE_H / 2;
  const R = Math.round(LANE_H * 0.46);
  const ppb = Math.max(pxPerBeat, Math.round(LANE_H * 2.7));
  const hitX = Math.max(GUTTER + R + 30, width * 0.24);

  useEffect(() => {
    let raf = 0;
    const loopFn = () => {
      const x = hitX - (positionRef.current ?? 0) * ppb;
      groupRef.current?.setAttribute('transform', `translate(${x.toFixed(1)} 0)`);
      raf = requestAnimationFrame(loopFn);
    };
    raf = requestAnimationFrame(loopFn);
    return () => cancelAnimationFrame(raf);
  }, [hitX, positionRef, ppb]);

  const end = totalBeats * ppb;
  void version; // statuses are read through statusOf on each render

  return (
    <div className="highway" ref={wrapRef}>
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label="Tab highway: notes scroll towards the hit line on the left"
      >
        {STRINGS.map((s) => (
          <line
            key={s}
            x1={GUTTER}
            x2={width}
            y1={laneY(s)}
            y2={laneY(s)}
            className="lane"
            style={{ stroke: `var(--string-${s})` }}
          />
        ))}
        <g ref={groupRef}>
          {loop && (
            <rect
              x={loop.startBeat * ppb - 20}
              y={TOP - 4}
              width={(loop.endBeat - loop.startBeat) * ppb}
              height={LANE_H * 6 + 8}
              className="loop-zone"
              rx={10}
            />
          )}
          {barStarts.map((b, i) => (
            <g key={`bar${i}`}>
              <line
                x1={b * ppb - 20}
                x2={b * ppb - 20}
                y1={TOP}
                y2={TOP + LANE_H * 6}
                className="barline"
              />
              <text x={b * ppb - 16} y={HEIGHT - 1} className="bar-number">
                {i + 1}
              </text>
            </g>
          ))}
          <line x1={end} x2={end} y1={TOP} y2={TOP + LANE_H * 6} className="barline end" />
          {steps.map((st) => {
            const status = statusOf(st.index);
            const x = st.beat * ppb;
            const cls = `gem tone-${tone(status)}`;
            if (st.target.kind === 'note') {
              const y = laneY(st.target.string);
              const label =
                labels === 'note' ? noteName(st.target.midi, false) : String(st.target.fret);
              const tail = Math.max(0, st.beats * ppb - R * 2 - 8);
              return (
                <g key={st.index} className={cls}>
                  {tail > 0 && (
                    <rect
                      x={x + R - 3}
                      y={y - 3}
                      width={tail}
                      height={6}
                      rx={3}
                      className="tail"
                      style={{ fill: `var(--string-${st.target.string})` }}
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={R}
                    className="gem-body"
                    style={{ stroke: `var(--string-${st.target.string})` }}
                  />
                  <text
                    x={x}
                    y={y + R * 0.38}
                    className="gem-label"
                    style={{ fontSize: Math.round(R * 1.05) }}
                  >
                    {label}
                  </text>
                  {GLYPH[status] && (
                    <text x={x} y={y - R - 3} className="gem-glyph">
                      {GLYPH[status]}
                    </text>
                  )}
                </g>
              );
            }
            const top = TOP + 2;
            const h = LANE_H * 6 - 4;
            return (
              <g key={st.index} className={cls}>
                <rect
                  x={x - R}
                  y={top}
                  width={R * 2}
                  height={h}
                  rx={R}
                  className="gem-body chord-bar"
                />
                <text x={x} y={top + 20} className="strum-arrow">
                  {st.target.strum === 'up' ? '↑' : '↓'}
                </text>
                <text x={x} y={TOP - 10} className="chord-label">
                  {st.target.chord}
                  {GLYPH[status] ? ` ${GLYPH[status]}` : ''}
                </text>
              </g>
            );
          })}
        </g>
        <rect x={0} y={0} width={GUTTER} height={HEIGHT} className="gutter" />
        {STRINGS.map((s) => (
          <text key={s} x={GUTTER / 2} y={laneY(s) + 5} className="lane-label">
            {STRING_LABELS[s]}
          </text>
        ))}
        <line x1={hitX} x2={hitX} y1={TOP - 6} y2={TOP + LANE_H * 6 + 6} className="hitline" />
      </svg>
    </div>
  );
}
