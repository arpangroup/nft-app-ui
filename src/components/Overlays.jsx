import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

/** Renders into the phone frame (not <body>) so overlays stay inside the mobile shell. */
export function Portal({ children }) {
  const host = document.getElementById('app-shell') || document.body;
  return createPortal(children, host);
}

function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

/** Bottom sheet: <Sheet open title onClose footer>…</Sheet> */
export function Sheet({ open, title, onClose, children, footer }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <Portal>
      <div className="overlay" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grip" />
        {title && (
          <div className="sheet-head">
            <h3>{title}</h3>
            <button className="icon-btn sm" onClick={onClose} aria-label="Close">
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </Portal>
  );
}

/** Centered result dialog: tone = success | error | info */
export function Dialog({ open, tone = 'success', title, children, actions, onClose }) {
  useEscape(open, onClose);
  if (!open) return null;
  const icon = { success: 'check', error: 'x', info: 'info' }[tone];
  return (
    <Portal>
      <div className="overlay center" onClick={onClose} />
      <div className={`dialog dialog-${tone}`} role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="dialog-badge">
          <Icon name={icon} size={30} stroke={3} />
        </div>
        <h3>{title}</h3>
        <div className="dialog-body">{children}</div>
        <div className="dialog-actions">{actions}</div>
      </div>
    </Portal>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <Portal>
      <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
        <Icon name={toast.type === 'error' ? 'info' : 'check'} size={18} />
        <span>{toast.message}</span>
      </div>
    </Portal>
  );
}
