import { useEffect } from 'react';

interface WakeLockSentinelLike {
  released: boolean;
  release(): Promise<void>;
}

/**
 * Keeps the screen awake while `active` (FR-MOB-1): learners have both hands on the guitar, so a
 * phone that dims or locks mid-lesson breaks practice. Re-acquires the lock when the page becomes
 * visible again (browsers drop it when the tab is hidden). Silently does nothing if unsupported.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const wl = (
      navigator as Navigator & {
        wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinelLike> };
      }
    ).wakeLock;
    if (!wl) return;
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const acquire = async () => {
      if (document.visibilityState !== 'visible' || (sentinel && !sentinel.released)) return;
      try {
        const s = await wl.request('screen');
        if (cancelled) void s.release();
        else sentinel = s;
      } catch {
        /* denied (e.g. battery saver): practice still works */
      }
    };
    const onVisibility = () => void acquire();
    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void sentinel?.release().catch(() => undefined);
    };
  }, [active]);
}

/** Calls `onHidden` when the page is hidden (phone locked, app switched) (FR-MOB-2). */
export function useOnHidden(onHidden: () => void): void {
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'hidden') onHidden();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [onHidden]);
}
