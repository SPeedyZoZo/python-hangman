import { NavLink, Outlet } from 'react-router-dom';
import { Icon, type IconName } from './Icon.tsx';

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Learn', icon: 'learn' },
  { to: '/songs', label: 'Songs', icon: 'songs' },
  { to: '/chords', label: 'Chords', icon: 'chords' },
  { to: '/tuner', label: 'Tuner', icon: 'tuner' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export function TabLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="page with-nav" tabIndex={-1}>
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Main">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className="nav-item">
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function FullLayout() {
  return (
    <div className="app-shell">
      <main id="main" className="page" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
