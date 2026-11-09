import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ConfirmDialog.css';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** 'danger' destaca o botão de confirmação (ex.: inativar) */
  tone?: 'default' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'default',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="assoc-confirm-backdrop"
      role="presentation"
      onClick={(e) => {
        if (busy) return;
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="assoc-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assoc-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="assoc-confirm-title" className="assoc-confirm-title">
          {title}
        </h2>
        <p className="assoc-confirm-message">{message}</p>
        <div className="assoc-confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn btn-primary${tone === 'danger' ? ' assoc-confirm-btn-danger' : ''}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Salvando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
