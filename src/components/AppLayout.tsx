import { NavLink, Outlet } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { getToken } from '../api/auth';
import { useAssociation } from '../associationContext';
import { FlashViewport } from './FlashMessage';
import './AppLayout.css';

function userInitials(name?: string | null) {
  if (!name) return '·';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1]![0] : '')).toUpperCase();
}

export function AppLayout() {
  const { user, logout } = useAssociation();

  return (
    <div className="assoc-app-shell">
      <aside className="assoc-sidebar movly-grain" aria-label="Menu principal">
        <div className="assoc-sidebar-brand">
          <BrandLogo variant="lime" height={28} className="brand-logo--sidebar" />
        </div>

        <nav className="assoc-sidebar-nav" aria-label="Navegação">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'assoc-nav-link active' : 'assoc-nav-link')} end>
            Lista de parceiros
          </NavLink>
        </nav>

        <div className="assoc-sidebar-footer">
          {user && getToken() ? (
            <div className="assoc-sidebar-user">
              <span className="assoc-sidebar-user-avatar" aria-hidden="true">
                {userInitials(user.name)}
              </span>
              <span className="assoc-sidebar-user-text">
                <span className="assoc-sidebar-user-name">{user.name}</span>
                <span className="assoc-sidebar-user-email">{user.email}</span>
              </span>
            </div>
          ) : null}
          <button type="button" className="assoc-sidebar-logout" onClick={() => logout()}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      <main className="assoc-main">
        <div className="assoc-main-inner">
          <FlashViewport />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
