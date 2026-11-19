import { useCallback, useEffect, useState } from 'react';
import { useSettings } from '../settings/store.ts';

/** True when running as an installed app (already full-screen, no browser UI to hide). */
function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Fullscreen toggle for the player (FR-MOB-8). Hides the browser bars on Android and desktop.
 * Not offered where unsupported (iPhone Safari) or when already installed as an app.
 * Leaves fullscreen when the component using it unmounts.
 */
export function useFullscreen() {
  const supported =
    typeof document !== 'undefined' && document.fullscreenEnabled === true && !isStandalone();
  const [active, setActive] = useState(
    () => typeof document !== 'undefined' && !!document.fullscreenElement,
  );

  useEffect(() => {
    if (!supported) return;
    const onChange = () => setActive(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined);
    };
  }, [supported]);

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    } catch {
      /* the browser refused (e.g. no user gesture); nothing to do */
    }
  }, []);

  return { supported, active, toggle };
}

export const HAPTIC = {
  tap: 12,
  wrong: [25, 60, 25],
} as const;

/**
 * Short vibration for on-screen-guitar input (FR-MOB-9). Only call this in on-screen-guitar
 * mode: in microphone mode the buzz would be picked up as noise. No-op where unsupported (iOS).
 */
export function haptic(pattern: number | readonly number[]): void {
  if (!useSettings.getState().haptics) return;
  try {
    navigator.vibrate?.(pattern as number | number[]);
  } catch {
    /* ignore */
  }
}
