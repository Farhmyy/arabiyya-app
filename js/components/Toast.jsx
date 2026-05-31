/* Toast — Global feedback notification */

const ToastContext = React.createContext();

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const show = React.useCallback((message, type = 'success', duration = 2800) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, duration);
  }, []);

  React.useEffect(() => { window.showToast = show; }, [show]);

  const styles = {
    success: { bg: 'var(--color-success-50)', border: 'var(--color-success-border)', color: 'var(--color-success-text)', icon: 'check-circle', iconColor: 'var(--color-success)' },
    error:   { bg: 'var(--color-error-50)',   border: 'var(--color-error-border)', color: 'var(--color-error-text)', icon: 'x-circle',     iconColor: 'var(--color-error)' },
    info:    { bg: 'var(--color-primary-50)', border: '#99F6E4', color: 'var(--color-primary)', icon: 'info', iconColor: 'var(--color-primary)' },
    gold:    { bg: 'var(--color-accent-50)',  border: 'var(--color-accent-100)', color: 'var(--color-amber-text)', icon: 'trophy',  iconColor: 'var(--color-accent)' },
  };

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const s = styles[t.type] || styles.info;
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 14,
              background: s.bg, border: `1px solid ${s.border}`, color: s.color,
              fontWeight: 600, fontSize: 15, fontFamily: 'var(--font-latin)',
              boxShadow: 'var(--shadow-hover)',
              animation: t.exiting ? 'toast-out 300ms var(--ease-out) forwards' : 'toast-in 300ms var(--ease-out) forwards',
              pointerEvents: 'auto',
            }}>
              <Icon name={s.icon} size={20} color={s.iconColor} />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

window.ToastProvider = ToastProvider;
window.ToastContext = ToastContext;
