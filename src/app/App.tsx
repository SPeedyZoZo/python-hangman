import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useSettings } from '../settings/store.ts';
import { FullLayout, TabLayout } from '../ui/Layout.tsx';
import { HomeScreen } from '../screens/HomeScreen.tsx';
import { Placeholder } from '../screens/Placeholder.tsx';
import { lazyScreen } from './lazyScreen.ts';

/*
 * Code splitting (ADR-0009): Home ships in the first download; every other screen, and with them
 * the audio engine, DSP and synth, loads on demand. That keeps the first load small on mobile data.
 */
const Player = lazyScreen(() => import('../screens/PlayerScreen.tsx'), 'PlayerScreen');
const Results = lazyScreen(() => import('../screens/ResultsScreen.tsx'), 'ResultsScreen');
const Tuner = lazyScreen(() => import('../screens/TunerScreen.tsx'), 'TunerScreen');
const Songs = lazyScreen(() => import('../screens/SongsScreen.tsx'), 'SongsScreen');
const Chords = lazyScreen(() => import('../screens/ChordsScreen.tsx'), 'ChordsScreen');
const ChordDetail = lazyScreen(
  () => import('../screens/ChordDetailScreen.tsx'),
  'ChordDetailScreen',
);
const Settings = lazyScreen(() => import('../screens/SettingsScreen.tsx'), 'SettingsScreen');
const Coach = lazyScreen(() => import('../screens/CoachScreen.tsx'), 'CoachScreen');
const Onboarding = lazyScreen(() => import('../screens/OnboardingScreen.tsx'), 'OnboardingScreen');

/** Once the first screen has painted, fetch the most likely next screens in the background. */
function usePrefetch() {
  useEffect(() => {
    const run = () => {
      void Player.preload();
      void Tuner.preload();
      void Results.preload();
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 3000 });
      return () =>
        (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const t = setTimeout(run, 1500);
    return () => clearTimeout(t);
  }, []);
}

function useThemeAttribute() {
  const theme = useSettings((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    // Match the phone's browser/status bar to the chosen theme.
    const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
    metas.forEach((m) => {
      const media = m.getAttribute('media') ?? '';
      const own = media.includes('light') ? '#fbf7f2' : '#14110f';
      m.content = theme === 'system' ? own : theme === 'light' ? '#fbf7f2' : '#14110f';
    });
  }, [theme]);
}

/** First launch goes through onboarding (FR-ONB-1). */
function OnboardingGate({ children }: { children: ReactNode }) {
  const onboarded = useSettings((s) => s.onboarded);
  const location = useLocation();
  if (!onboarded && location.pathname !== '/welcome') return <Navigate to="/welcome" replace />;
  return children;
}

export function App() {
  useThemeAttribute();
  usePrefetch();
  return (
    <HashRouter>
      <OnboardingGate>
        <Routes>
          <Route element={<TabLayout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/songs" element={<Songs.Component />} />
            <Route path="/chords" element={<Chords.Component />} />
            <Route path="/chords/:id" element={<ChordDetail.Component />} />
            <Route path="/tuner" element={<Tuner.Component />} />
            <Route path="/settings" element={<Settings.Component />} />
          </Route>
          <Route element={<FullLayout />}>
            <Route path="/play/:kind/:id/:arr?" element={<Player.Component />} />
            <Route path="/results" element={<Results.Component />} />
            <Route path="/coach" element={<Coach.Component />} />
            <Route path="/welcome" element={<Onboarding.Component />} />
            <Route path="*" element={<Placeholder title="Not found" />} />
          </Route>
        </Routes>
      </OnboardingGate>
    </HashRouter>
  );
}
