/** Mic input level meter. `rms` is linear RMS (0–1); displayed on a log scale. */
export function LevelMeter({ rms, label = 'Input level' }: { rms: number; label?: string }) {
  const db = 20 * Math.log10(Math.max(rms, 1e-5));
  const pct = Math.round(Math.max(0, Math.min(1, (db + 60) / 54)) * 100);
  return (
    <div
      className="level-meter"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="level-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
