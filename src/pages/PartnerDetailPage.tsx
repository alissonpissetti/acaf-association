import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAcafAssociateUnit, type AssociatePartnerUnit } from '../api/association';
import { useAssociation } from '../associationContext';
import { formatCnpjDigits } from '../utils/cnpj';
import './PartnerDetailPage.css';

const PERM = 'associacao.acaf.parceiros';

function formatDateDisplay(value: string | undefined): string {
  if (!value?.trim()) return '—';
  const s = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    if (y && m && d) {
      try {
        return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
      } catch {
        /* fallthrough */
      }
    }
  }
  return s;
}

export function PartnerDetailPage() {
  const { id } = useParams();
  const { hasPermission } = useAssociation();

  const [row, setRow] = useState<AssociatePartnerUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canView = hasPermission(PERM);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAcafAssociateUnit(id);
      setRow(data);
    } catch (e) {
      setRow(null);
      setError(e instanceof Error ? e.message : 'Parceiro não encontrado.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canView) {
    return (
      <div className="assoc-forbidden">
        <h1>Acesso negado</h1>
        <p>Sua conta não tem permissão para ver parceiros associados.</p>
        <Link to="/" className="btn btn-primary">
          Voltar à lista
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="empty-state">Carregando…</p>;
  }

  if (!row || error) {
    return (
      <div className="page-stack">
        <p className="page-error">{error ?? 'Parceiro não encontrado.'}</p>
        <Link to="/" className="btn btn-ghost">
          ← Voltar
        </Link>
      </div>
    );
  }

  const a = row.acafAssociate;
  const cnpj = a?.cnpj;
  const listed = a?.listed !== false;

  return (
    <div className="page-stack">
      <div className="assoc-detail-header">
        <Link to="/" className="assoc-back">
          ← Lista
        </Link>
        <header>
          <h1>{row.unitName}</h1>
          <p className="page-lead">
            Rede: <strong>{row.networkName ?? row.networkId}</strong>
            {cnpj ? (
              <>
                {' · '}
                CNPJ <code>{formatCnpjDigits(cnpj)}</code>
              </>
            ) : null}
          </p>
        </header>
      </div>

      <section className="panel">
        <div className="panel-body">
          <div className="assoc-detail-readonly">
            <h2 className="assoc-form-title">Dados do associado</h2>
            <p className="muted assoc-form-hint">
              Consulta somente leitura. Para alterar estes dados, use o console admin.
            </p>

            <dl className="assoc-readonly-grid">
              <div className="assoc-readonly-item">
                <dt>Razão social</dt>
                <dd>{a?.legalName?.trim() || '—'}</dd>
              </div>
              <div className="assoc-readonly-item">
                <dt>Associação</dt>
                <dd>{a?.association?.trim() || '—'}</dd>
              </div>
              <div className="assoc-readonly-item">
                <dt>Assinatura (data)</dt>
                <dd>{formatDateDisplay(a?.signedAt)}</dd>
              </div>
              <div className="assoc-readonly-item">
                <dt>E-mail de contato</dt>
                <dd>{a?.contactEmail?.trim() || '—'}</dd>
              </div>
              <div className="assoc-readonly-item">
                <dt>Telefone</dt>
                <dd>{a?.contactPhone?.trim() || '—'}</dd>
              </div>
              <div className="assoc-readonly-item field-span-2">
                <dt>Complemento / observações</dt>
                <dd className="assoc-readonly-multiline">{a?.complement?.trim() || '—'}</dd>
              </div>
            </dl>

            <div className="assoc-readonly-listed">
              <span className="assoc-readonly-listed-label">Visibilidade no app</span>
              <span className={listed ? 'badge badge-active' : 'badge badge-inactive'}>
                {listed ? 'Listada no catálogo' : 'Oculta (não aparece para alunos)'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
