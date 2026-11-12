import { useId, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { MOVLY_DISPLAY_NAME, MOVLY_WORDMARK } from '../brand/displayName';
import { PasswordInput } from '../components/PasswordInput';
import { getToken } from '../api/auth';
import { useAssociation } from '../associationContext';
import './LoginPage.css';

const MODES = {
  CREDENTIALS: 'credentials',
  TOKEN: 'token',
  FORGOT: 'forgot',
} as const;

type LoginMode = (typeof MODES)[keyof typeof MODES];

function normalizePhoneInput(value: string): string {
  return String(value ?? '').replace(/\D/g, '').slice(0, 11);
}

function formatPhoneDisplay(digits: string): string {
  const value = normalizePhoneInput(digits);
  if (value.length <= 2) return value;
  if (value.length <= 7) return `(${value.slice(0, 2)}) ${value.slice(2)}`;
  return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
}

export function LoginPage() {
  const { login, loginWithOtp, requestOtp, resetPasswordWithOtp, loading, user } = useAssociation();
  const emailId = useId();
  const passwordId = useId();
  const phoneId = useId();
  const codeId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();

  const [mode, setMode] = useState<LoginMode>(MODES.CREDENTIALS);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!loading && user && getToken()) {
    return <Navigate to="/" replace />;
  }

  const resetMessages = () => {
    setError(null);
    setInfo(null);
  };

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setStep(1);
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    resetMessages();
  };

  const onSubmitCredentials = async (ev: FormEvent) => {
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

  const otpPurpose = () => (mode === MODES.FORGOT ? 'password_reset' : 'login');

  const sendOtp = async (advanceToValidateStep: boolean) => {
    resetMessages();
    setBusy(true);
    try {
      const result = await requestOtp(mobilePhone, otpPurpose());
      setInfo(result.message ?? 'Código enviado para o celular.');
      if (advanceToValidateStep) setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar o código.');
    } finally {
      setBusy(false);
    }
  };

  const onRequestOtp = async (ev: FormEvent) => {
    ev.preventDefault();
    await sendOtp(true);
  };

  const backToPhoneStep = () => {
    setStep(1);
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    resetMessages();
  };

  const onSubmitTokenLogin = async (ev: FormEvent) => {
    ev.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      await loginWithOtp(mobilePhone, code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Código inválido ou expirado.');
    } finally {
      setBusy(false);
    }
  };

  const onSubmitResetPassword = async (ev: FormEvent) => {
    ev.preventDefault();
    resetMessages();
    if (newPassword.length < 6) {
      setError('Informe uma senha com ao menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    setBusy(true);
    try {
      const result = await resetPasswordWithOtp(mobilePhone, code, newPassword);
      const message = result.message ?? 'Senha alterada com sucesso. Faça login com a nova senha.';
      switchMode(MODES.CREDENTIALS);
      setInfo(message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível redefinir a senha.');
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<LoginMode, { title: string; lead: string }> = {
    [MODES.CREDENTIALS]: {
      title: 'Entrar',
      lead: 'E-mail e senha do console admin, ou código no celular.',
    },
    [MODES.TOKEN]: {
      title: step === 1 ? 'Entrar com código no celular' : 'Validar código',
      lead:
        step === 1
          ? 'Informe o celular cadastrado para receber um código de acesso.'
          : 'Digite o código de 6 dígitos enviado para o seu celular.',
    },
    [MODES.FORGOT]: {
      title: step === 1 ? 'Recuperar senha' : 'Nova senha',
      lead:
        step === 1
          ? 'Informe o celular cadastrado para receber um código de verificação.'
          : 'Informe o código recebido e escolha uma nova senha.',
    },
  };

  const copy = titles[mode];

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
          <h1 className="assoc-login-panel-title">{copy.title}</h1>
          <p className="assoc-login-panel-lead">{copy.lead}</p>

          {mode === MODES.CREDENTIALS ? (
            <form className="assoc-login-form" onSubmit={(ev) => void onSubmitCredentials(ev)} autoComplete="on">
              {error ? (
                <p className="assoc-login-form-error" role="alert">
                  {error}
                </p>
              ) : null}
              {info ? (
                <p className="assoc-login-form-info" role="status">
                  {info}
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

              <div className="assoc-login-links">
                <button type="button" className="assoc-login-link" onClick={() => switchMode(MODES.FORGOT)}>
                  Esqueci minha senha
                </button>
                <button type="button" className="assoc-login-link" onClick={() => switchMode(MODES.TOKEN)}>
                  Entrar com código no celular
                </button>
              </div>

              <button type="submit" className="btn btn-primary assoc-login-submit" disabled={busy}>
                {busy ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          ) : null}

          {mode === MODES.TOKEN ? (
            step === 1 ? (
              <form className="assoc-login-form" onSubmit={(ev) => void onRequestOtp(ev)}>
                {error ? (
                  <p className="assoc-login-form-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="field">
                  <label htmlFor={phoneId}>Celular</label>
                  <input
                    id={phoneId}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={formatPhoneDisplay(mobilePhone)}
                    onChange={(ev) => setMobilePhone(normalizePhoneInput(ev.target.value))}
                    placeholder="(11) 99999-9999"
                    required
                    disabled={busy}
                  />
                </div>
                <button type="submit" className="btn btn-primary assoc-login-submit" disabled={busy}>
                  {busy ? 'Enviando…' : 'Enviar código'}
                </button>
                <button type="button" className="assoc-login-back" onClick={() => switchMode(MODES.CREDENTIALS)}>
                  Voltar ao login
                </button>
              </form>
            ) : (
              <form className="assoc-login-form" onSubmit={(ev) => void onSubmitTokenLogin(ev)}>
                {error ? (
                  <p className="assoc-login-form-error" role="alert">
                    {error}
                  </p>
                ) : null}
                {info ? (
                  <p className="assoc-login-form-info" role="status">
                    {info}
                  </p>
                ) : null}
                <div className="field">
                  <label htmlFor={codeId}>Código no celular</label>
                  <input
                    id={codeId}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={6}
                    value={code}
                    onChange={(ev) => setCode(ev.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    disabled={busy}
                  />
                </div>
                <button type="submit" className="btn btn-primary assoc-login-submit" disabled={busy}>
                  {busy ? 'Validando…' : 'Entrar'}
                </button>
                <div className="assoc-login-links" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="assoc-login-link"
                    disabled={busy}
                    onClick={() => void sendOtp(false)}
                  >
                    Reenviar código
                  </button>
                  <button type="button" className="assoc-login-link" disabled={busy} onClick={backToPhoneStep}>
                    Voltar
                  </button>
                </div>
                <button
                  type="button"
                  className="assoc-login-back"
                  disabled={busy}
                  onClick={() => switchMode(MODES.CREDENTIALS)}
                >
                  Voltar ao login
                </button>
              </form>
            )
          ) : null}

          {mode === MODES.FORGOT ? (
            step === 1 ? (
              <form className="assoc-login-form" onSubmit={(ev) => void onRequestOtp(ev)}>
                {error ? (
                  <p className="assoc-login-form-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="field">
                  <label htmlFor={`${phoneId}-forgot`}>Celular</label>
                  <input
                    id={`${phoneId}-forgot`}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={formatPhoneDisplay(mobilePhone)}
                    onChange={(ev) => setMobilePhone(normalizePhoneInput(ev.target.value))}
                    placeholder="(11) 99999-9999"
                    required
                    disabled={busy}
                  />
                </div>
                <button type="submit" className="btn btn-primary assoc-login-submit" disabled={busy}>
                  {busy ? 'Enviando…' : 'Enviar código'}
                </button>
                <button type="button" className="assoc-login-back" onClick={() => switchMode(MODES.CREDENTIALS)}>
                  Voltar ao login
                </button>
              </form>
            ) : (
              <form className="assoc-login-form" onSubmit={(ev) => void onSubmitResetPassword(ev)}>
                {error ? (
                  <p className="assoc-login-form-error" role="alert">
                    {error}
                  </p>
                ) : null}
                {info ? (
                  <p className="assoc-login-form-info" role="status">
                    {info}
                  </p>
                ) : null}
                <div className="field">
                  <label htmlFor={`${codeId}-forgot`}>Código no celular</label>
                  <input
                    id={`${codeId}-forgot`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={6}
                    value={code}
                    onChange={(ev) => setCode(ev.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    disabled={busy}
                  />
                </div>
                <div className="field">
                  <label htmlFor={newPasswordId}>Nova senha</label>
                  <PasswordInput
                    id={newPasswordId}
                    value={newPassword}
                    onChange={setNewPassword}
                    autoComplete="new-password"
                    required
                    disabled={busy}
                    minLength={6}
                  />
                </div>
                <div className="field">
                  <label htmlFor={confirmPasswordId}>Confirmar senha</label>
                  <PasswordInput
                    id={confirmPasswordId}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                    required
                    disabled={busy}
                    minLength={6}
                  />
                </div>
                <button type="submit" className="btn btn-primary assoc-login-submit" disabled={busy}>
                  {busy ? 'Salvando…' : 'Redefinir senha'}
                </button>
                <div className="assoc-login-links" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="assoc-login-link"
                    disabled={busy}
                    onClick={() => void sendOtp(false)}
                  >
                    Reenviar código
                  </button>
                  <button type="button" className="assoc-login-link" disabled={busy} onClick={backToPhoneStep}>
                    Voltar
                  </button>
                </div>
                <button
                  type="button"
                  className="assoc-login-back"
                  disabled={busy}
                  onClick={() => switchMode(MODES.CREDENTIALS)}
                >
                  Voltar ao login
                </button>
              </form>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
