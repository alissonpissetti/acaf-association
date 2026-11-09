import { useId, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { MOVLY_DISPLAY_NAME, MOVLY_WORDMARK } from '../brand/displayName';
import { PasswordInput } from '../components/PasswordInput';
import { getToken } from '../api/auth';
import { useAssociation } from '../associationContext';
import './LoginPage.css';

export function LoginPage() {
  const { login, loading, user } = useAssociation();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && user && getToken()) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="assoc-login-shell">
      <section className="assoc-login-brand movly-grain" aria-hidden="true">
        <div className="assoc-login-lockup">
          <BrandLogo variant="lime" noFixedDimensions className="assoc-login-brand-wordmark" />
          <p className="assoc-login-tagline">
            Parceiros associados <span className="assoc-login-tagline-highlight">{MOVLY_WORDMARK}</span>
          </p>
        </div>
        <p className="assoc-login-foot">
          Acesso restrito. Somente academias com cadastro de associado na rede {MOVLY_DISPLAY_NAME} aparecem após o
          login.
        </p>
      </section>

      <div className="assoc-login-panel">
        <div className="assoc-login-panel-inner">
          <BrandLogo variant="purple" height={30} className="brand-logo--login" />
          <h1 className="assoc-login-panel-title">Entrar</h1>
          <p className="assoc-login-panel-lead">
            Use o mesmo e-mail e senha do console admin. É necessária a permissão de parceiros associados no seu grupo.
          </p>

          <form className="assoc-login-form" onSubmit={(ev) => void onSubmit(ev)} autoComplete="on">
            {error ? (
              <p className="assoc-login-form-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="field">
              <label htmlFor={emailId}>E-mail</label>
              <input
                id={emailId}
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
                disabled={busy}
              />
            </div>
            <div className="field">
              <label htmlFor={passwordId}>Senha</label>
              <PasswordInput
                id={passwordId}
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                disabled={busy}
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary assoc-login-submit" disabled={busy}>
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="assoc-login-foot-panel muted">
            Permissão <strong>Parceiros associados</strong> (<code>associacao.acaf.parceiros</code>) no grupo de acesso.
          </p>
        </div>
      </div>
    </div>
  );
}
