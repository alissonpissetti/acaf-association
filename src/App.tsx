import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getToken } from './api/auth';
import { useAssociation } from './associationContext';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { PartnersPage } from './pages/PartnersPage';
import { PartnerDetailPage } from './pages/PartnerDetailPage';

const PERM = 'associacao.acaf.parceiros';

function Protected({ children }: { children: ReactNode }) {
  const { user, loading, hasPermission } = useAssociation();

  if (loading && getToken()) {
    return (
      <div className="assoc-loading-screen">
        <p>Carregando sessão…</p>
      </div>
    );
  }

  if (!getToken() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(PERM)) {
    return (
      <div className="assoc-forbidden-page">
        <h1>Acesso restrito</h1>
        <p>Peça ao administrador a permissão «Parceiros associados» (associacao.acaf.parceiros) para o seu grupo.</p>
        <button type="button" className="btn btn-primary" onClick={() => (window.location.href = '/login')}>
          Sair e tentar outra conta
        </button>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<PartnersPage />} />
        <Route path="unidades/:id" element={<PartnerDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
