import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useSettings } from '../settings/store.ts';
import { FullLayout, TabLayout } from '../ui/Layout.tsx';
import { ChordDetailScreen } from '../screens/ChordDetailScreen.tsx';
import { ChordsScreen } from '../screens/ChordsScreen.tsx';
import { CoachScreen } from '../screens/CoachScreen.tsx';
import { HomeScreen } from '../screens/HomeScreen.tsx';
import { OnboardingScreen } from '../screens/OnboardingScreen.tsx';
import { Placeholder } from '../screens/Placeholder.tsx';
import { PlayerScreen } from '../screens/PlayerScreen.tsx';
import { ResultsScreen } from '../screens/ResultsScreen.tsx';
import { SettingsScreen } from '../screens/SettingsScreen.tsx';
import { SongsScreen } from '../screens/SongsScreen.tsx';
import { TunerScreen } from '../screens/TunerScreen.tsx';

function useThemeAttribute() {
  const theme = useSettings((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
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
  return (
    <HashRouter>
      <OnboardingGate>
        <Routes>
          <Route element={<TabLayout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/songs" element={<SongsScreen />} />
            <Route path="/chords" element={<ChordsScreen />} />
            <Route path="/chords/:id" element={<ChordDetailScreen />} />
            <Route path="/tuner" element={<TunerScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Route>
          <Route element={<FullLayout />}>
            <Route path="/play/:kind/:id/:arr?" element={<PlayerScreen />} />
            <Route path="/results" element={<ResultsScreen />} />
            <Route path="/coach" element={<CoachScreen />} />
            <Route path="/welcome" element={<OnboardingScreen />} />
            <Route path="*" element={<Placeholder title="Not found" />} />
          </Route>
        </Routes>
      </OnboardingGate>
    </HashRouter>
  );
}
