'use client';

// Branded toast notifications and confirm dialogs to replace native browser
// alert()/confirm() popups. Imperative DOM API so any client component can
// call toast.success(...) / await confirmDialog(...) without provider wiring.
// Inline styles only - no dependency on Tailwind class scanning.

const BRAND = '#713900';

type ToastType = 'success' | 'error' | 'warning' | 'info';

const TOAST_COLORS: Record<ToastType, { accent: string; iconBg: string; icon: string }> = {
  success: { accent: '#16a34a', iconBg: '#dcfce7', icon: '✓' },
  error: { accent: '#dc2626', iconBg: '#fee2e2', icon: '✕' },
  warning: { accent: '#d97706', iconBg: '#fef3c7', icon: '!' },
  info: { accent: BRAND, iconBg: '#f5ebe0', icon: 'i' },
};

let stylesInjected = false;

function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes iroto-toast-in {
      from { opacity: 0; transform: translateX(24px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes iroto-toast-out {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(24px); }
    }
    @keyframes iroto-dialog-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes iroto-backdrop-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

function getToastContainer(): HTMLElement {
  let container = document.getElementById('iroto-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'iroto-toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: '99999',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: 'calc(100vw - 32px)',
      width: '380px',
      pointerEvents: 'none',
    });
    document.body.appendChild(container);
  }
  return container;
}

function showToast(type: ToastType, message: string) {
  if (typeof document === 'undefined') return;
  injectStyles();

  const { accent, iconBg, icon } = TOAST_COLORS[type];
  const container = getToastContainer();

  const el = document.createElement('div');
  Object.assign(el.style, {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    background: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 4px 10px -6px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${accent}`,
    pointerEvents: 'auto',
    animation: 'iroto-toast-in 0.25s ease-out',
    fontFamily: 'inherit',
  });

  const iconEl = document.createElement('div');
  iconEl.textContent = icon;
  Object.assign(iconEl.style, {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    borderRadius: '50%',
    background: iconBg,
    color: accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    marginTop: '1px',
  });

  const textEl = document.createElement('div');
  textEl.textContent = message;
  Object.assign(textEl.style, {
    flex: '1',
    fontSize: '14px',
    lineHeight: '1.45',
    color: '#1f2937',
    whiteSpace: 'pre-line',
    wordBreak: 'break-word',
  });

  const closeEl = document.createElement('button');
  closeEl.textContent = '×';
  closeEl.setAttribute('aria-label', 'Dismiss');
  Object.assign(closeEl.style, {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '18px',
    lineHeight: '1',
    cursor: 'pointer',
    padding: '0 2px',
    marginTop: '1px',
  });

  el.appendChild(iconEl);
  el.appendChild(textEl);
  el.appendChild(closeEl);
  container.appendChild(el);

  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    el.style.animation = 'iroto-toast-out 0.2s ease-in forwards';
    setTimeout(() => el.remove(), 200);
  };

  closeEl.onclick = remove;
  // Errors and warnings stick around a bit longer
  const duration = type === 'success' || type === 'info' ? 4500 : 7000;
  setTimeout(remove, duration);
}

export const toast = {
  success: (message: string) => showToast('success', message),
  error: (message: string) => showToast('error', message),
  warning: (message: string) => showToast('warning', message),
  info: (message: string) => showToast('info', message),
};

export interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function confirmDialog(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  if (typeof document === 'undefined') return Promise.resolve(false);
  injectStyles();

  const { title = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = options;
  const accent = danger ? '#dc2626' : BRAND;

  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    Object.assign(backdrop.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,0.5)',
      zIndex: '99998',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'iroto-backdrop-in 0.15s ease-out',
    });

    const dialog = document.createElement('div');
    Object.assign(dialog.style, {
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
      maxWidth: '420px',
      width: '100%',
      padding: '24px',
      animation: 'iroto-dialog-in 0.18s ease-out',
      fontFamily: 'inherit',
    });

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    Object.assign(titleEl.style, {
      margin: '0 0 8px',
      fontSize: '17px',
      fontWeight: '700',
      color: '#111827',
    });

    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    Object.assign(messageEl.style, {
      margin: '0 0 20px',
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#4b5563',
      whiteSpace: 'pre-line',
    });

    const buttons = document.createElement('div');
    Object.assign(buttons.style, {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = cancelText;
    Object.assign(cancelBtn.style, {
      padding: '9px 18px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      background: '#ffffff',
      color: '#374151',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: 'inherit',
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = confirmText;
    Object.assign(confirmBtn.style, {
      padding: '9px 18px',
      borderRadius: '8px',
      border: 'none',
      background: accent,
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: 'inherit',
    });

    const cleanup = (result: boolean) => {
      document.removeEventListener('keydown', onKey);
      backdrop.remove();
      resolve(result);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cleanup(false);
      if (e.key === 'Enter') cleanup(true);
    };

    cancelBtn.onclick = () => cleanup(false);
    confirmBtn.onclick = () => cleanup(true);
    backdrop.onclick = (e) => {
      if (e.target === backdrop) cleanup(false);
    };
    document.addEventListener('keydown', onKey);

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(messageEl);
    dialog.appendChild(buttons);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    confirmBtn.focus();
  });
}
