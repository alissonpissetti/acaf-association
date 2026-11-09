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

export async function getMe(token: string): Promise<AssociationAdminUser> {
  const res = await fetch(apiUrl('/api/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, 'Sessão inválida.'));
  }
  return res.json() as Promise<AssociationAdminUser>;
}
