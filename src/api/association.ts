import { getToken } from './auth';
import { apiUrl, parseApiError } from './http';

export type AcafAssociateMetaDto = {
  cnpj: string;
  legalName: string;
  association: string;
  signedAt: string;
  contactEmail: string;
  contactPhone?: string;
  complement?: string;
  listed?: boolean;
  importSource?: string;
};

export type AssociatePartnerUnit = {
  id: string;
  networkId: string;
  networkName?: string;
  unitName: string;
  neighborhood?: string;
  city?: string;
  acafAssociate?: AcafAssociateMetaDto;
  primaryMemberCount?: number;
};

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('Sessão expirada.');

  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    throw new Error('Sessão expirada.');
  }
  if (!res.ok) {
    throw new Error(await parseApiError(res, 'Erro na requisição.'));
  }
  return res.json() as Promise<T>;
}

export function listAcafAssociateUnits(): Promise<AssociatePartnerUnit[]> {
  return authFetch('/api/acaf-association/units');
}

export function getAcafAssociateUnit(id: string): Promise<AssociatePartnerUnit> {
  return authFetch(`/api/acaf-association/units/${encodeURIComponent(id)}`);
}

export function patchAcafAssociateUnit(
  id: string,
  body: {
    acafAssociate: Partial<
      Pick<
        AcafAssociateMetaDto,
        'legalName' | 'association' | 'signedAt' | 'contactEmail' | 'contactPhone' | 'complement' | 'listed'
      >
    >;
  },
): Promise<AssociatePartnerUnit> {
  return authFetch(`/api/acaf-association/units/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
