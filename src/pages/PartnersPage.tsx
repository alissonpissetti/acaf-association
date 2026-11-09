import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listAcafAssociateUnits,
  patchAcafAssociateUnit,
  type AssociatePartnerUnit,
} from '../api/association';
import { useAssociation } from '../associationContext';
import { useFlash } from '../flashContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatCnpjDigits } from '../utils/cnpj';
import { MOVLY_WORDMARK } from '../brand/displayName';
import './PartnersPage.css';

const PERM = 'associacao.acaf.parceiros';

function compareByNetworkName(a: AssociatePartnerUnit, b: AssociatePartnerUnit): number {
  const nameA = (a.networkName ?? a.networkId ?? '').trim();
  const nameB = (b.networkName ?? b.networkId ?? '').trim();
  return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
}

export function PartnersPage() {
  const { hasPermission } = useAssociation();
  const flash = useFlash();
  const canToggleCatalog = hasPermission(PERM);

  const [rows, setRows] = useState<AssociatePartnerUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    row: AssociatePartnerUnit;
    nextListed: boolean;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAcafAssociateUnits();
      setRows([...data].sort(compareByNetworkName));
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : 'Erro ao carregar parceiros.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openToggleConfirm = (row: AssociatePartnerUnit) => {
    if (!canToggleCatalog || togglingId) return;
    const a = row.acafAssociate;
    const listed = a?.listed !== false;
    setConfirmState({ row, nextListed: !listed });
  };

  const applyToggleListed = async () => {
    if (!confirmState || togglingId) return;
    const { row, nextListed } = confirmState;
    setTogglingId(row.id);
    setError(null);
    try {
      const updated = await patchAcafAssociateUnit(row.id, {
        acafAssociate: { listed: nextListed },
      });
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? updated : r)).sort(compareByNetworkName),
      );
      setConfirmState(null);
      const label = row.unitName.trim() || 'Unidade';
      flash.success(
        nextListed ? `«${label}» ativada no catálogo.` : `«${label}» inativada no catálogo.`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível atualizar a situação.';
      setError(msg);
      flash.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const confirmCopy =
    confirmState == null
      ? null
      : confirmState.nextListed === false
        ? {
            title: 'Inativar no catálogo?',
            message: `A unidade «${confirmState.row.unitName.trim() || 'esta unidade'}» deixa de aparecer no catálogo para os alunos.`,
            confirmLabel: 'Inativar',
            tone: 'danger' as const,
          }
        : {
            title: 'Ativar no catálogo?',
            message: `A unidade «${confirmState.row.unitName.trim() || 'esta unidade'}» voltará a aparecer no catálogo para os alunos.`,
            confirmLabel: 'Ativar',
            tone: 'default' as const,
          };

  return (
    <div className="page-stack">
      <header className="page-header">
        <h1>Parceiros associados {MOVLY_WORDMARK}</h1>
      </header>

      {error ? <p className="page-error">{error}</p> : null}

      <section className="panel">
        <div className="panel-body panel-body-flush">
          {loading ? (
            <p className="empty-state">Carregando…</p>
          ) : rows.length === 0 ? (
            <p className="empty-state">Nenhum parceiro associado encontrado.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Unidade</th>
                    <th>Rede</th>
                    <th>Razão social ({MOVLY_WORDMARK})</th>
                    <th>CNPJ</th>
                    <th>Situação</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const a = row.acafAssociate;
                    const listed = a?.listed !== false;
                    const busy = togglingId === row.id;
                    return (
                      <tr key={row.id}>
                        <td>
                          <strong>{row.unitName}</strong>
                          <div className="muted assoc-sub">
                            {[row.neighborhood, row.city].filter(Boolean).join(' · ') || '—'}
                          </div>
                        </td>
                        <td>{row.networkName ?? row.networkId}</td>
                        <td>{a?.legalName ?? '—'}</td>
                        <td>
                          <code>{a?.cnpj ? formatCnpjDigits(a.cnpj) : '—'}</code>
                        </td>
                        <td className="assoc-situacao-cell">
                          {canToggleCatalog ? (
                            <button
                              type="button"
                              className={
                                listed
                                  ? 'assoc-situacao-toggle assoc-situacao-toggle--active'
                                  : 'assoc-situacao-toggle assoc-situacao-toggle--inactive'
                              }
                              disabled={busy}
                              onClick={() => openToggleConfirm(row)}
                              title={listed ? 'Clique para inativar no catálogo' : 'Clique para ativar no catálogo'}
                            >
                              {busy ? 'Salvando…' : listed ? 'Ativa' : 'Inativa'}
                            </button>
                          ) : (
                            <span className={listed ? 'badge badge-active' : 'badge badge-inactive'}>
                              {listed ? 'Ativa' : 'Inativa'}
                            </span>
                          )}
                        </td>
                        <td className="table-actions">
                          <Link to={`/unidades/${row.id}`} className="btn btn-ghost btn-sm">
                            Detalhes
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {confirmState && confirmCopy ? (
        <ConfirmDialog
          open
          title={confirmCopy.title}
          message={confirmCopy.message}
          confirmLabel={confirmCopy.confirmLabel}
          tone={confirmCopy.tone}
          busy={Boolean(togglingId)}
          onConfirm={() => void applyToggleListed()}
          onCancel={() => {
            if (togglingId) return;
            setConfirmState(null);
          }}
        />
      ) : null}
    </div>
  );
}
