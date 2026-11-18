import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useSettings } from '../settings/store.ts';
import { FullLayout, TabLayout } from '../ui/Layout.tsx';
import { ChordDetailScreen } from '../screens/ChordDetailScreen.tsx';
import { ChordsScreen } from '../screens/ChordsScreen.tsx';
import { HomeScreen } from '../screens/HomeScreen.tsx';
import { Placeholder } from '../screens/Placeholder.tsx';
import { PlayerScreen } from '../screens/PlayerScreen.tsx';
import { ResultsScreen } from '../screens/ResultsScreen.tsx';
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

export function App() {
  useThemeAttribute();
  return (
    <HashRouter>
      <Routes>
        <Route element={<TabLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/songs" element={<SongsScreen />} />
          <Route path="/chords" element={<ChordsScreen />} />
          <Route path="/chords/:id" element={<ChordDetailScreen />} />
          <Route path="/tuner" element={<TunerScreen />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
        <Route element={<FullLayout />}>
          <Route path="/play/:kind/:id/:arr?" element={<PlayerScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="*" element={<Placeholder title="Not found" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
