import { useEffect, useState } from 'react';
import { coach } from '../coach/index.ts';
import type { CoachTip } from '../coach/types.ts';
import type { SessionSummary } from '../practice/scoring.ts';

/** Tips for a finished session from the active CoachProvider (ADR-0006). */
export function useCoachTips(summary: SessionSummary | null): CoachTip[] {
  const [tips, setTips] = useState<CoachTip[]>([]);
  useEffect(() => {
    let alive = true;
    if (summary) void coach.getTips(summary).then((t) => alive && setTips(t));
    return () => {
      alive = false;
    };
  }, [summary]);
  return tips;
}
