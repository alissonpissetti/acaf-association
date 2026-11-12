import { apiUrl, parseApiError } from './http';

const TOKEN_KEY = 'acaf_association_admin_token';

export type AssociationAdminUser = {
  id: string;
  name: string;
  email: string;
  permissions?: string[];
  [key: string]: unknown;
};

export type LoginResult = {
  accessToken: string;
  user: AssociationAdminUser;
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export type OtpPurpose = 'login' | 'password_reset';

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, 'Falha no login.'));
  }
  return res.json() as Promise<LoginResult>;
}

export async function requestOtp(
  mobilePhone: string,
  purpose: OtpPurpose,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(apiUrl('/api/auth/otp/request'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobilePhone, purpose }),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, 'Não foi possível enviar o código.'));
  }
  return res.json() as Promise<{ ok: boolean; message?: string }>;
}

export async function loginWithOtp(mobilePhone: string, code: string): Promise<LoginResult> {
  const res = await fetch(apiUrl('/api/auth/otp/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobilePhone, code }),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, 'Código inválido ou expirado.'));
  }
  return res.json() as Promise<LoginResult>;
}

export async function resetPasswordWithOtp(
  mobilePhone: string,
  code: string,
  newPassword: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(apiUrl('/api/auth/password/reset'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobilePhone, code, newPassword }),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, 'Não foi possível redefinir a senha.'));
  }
  return res.json() as Promise<{ ok: boolean; message?: string }>;
}

export async function getMe(token: string): Promise<AssociationAdminUser> {
  const res = await fetch(apiUrl('/api/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, 'Sessão inválida.'));
  }
  return res.json() as Promise<AssociationAdminUser>;
}
