import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useSettings } from '../settings/store.ts';
import { FullLayout, TabLayout } from '../ui/Layout.tsx';
import { Placeholder } from '../screens/Placeholder.tsx';
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
          <Route path="/" element={<Placeholder title="Learn" />} />
          <Route path="/songs" element={<Placeholder title="Songs" />} />
          <Route path="/chords" element={<Placeholder title="Chords" />} />
          <Route path="/tuner" element={<TunerScreen />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
        <Route element={<FullLayout />}>
          <Route path="*" element={<Placeholder title="Not found" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
