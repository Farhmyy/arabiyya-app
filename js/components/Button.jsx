/* Button — Primary / Secondary / Ghost / Gold / Danger */

function Button({ variant = 'primary', size = 'md', children, icon, iconRight, onClick, disabled, style, type = 'button' }) {
  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    border: 'none', borderRadius: 'var(--radius-button)',
    fontFamily: 'var(--font-latin)', fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background var(--dur-med), transform var(--dur-fast)',
    whiteSpace: 'nowrap', opacity: disabled ? 0.45 : 1,
  };

  const sizes = {
    sm: { padding: '8px 14px',  fontSize: 14 },
    md: { padding: '12px 22px', fontSize: 15 },
    lg: { padding: '14px 28px', fontSize: 17 },
  };

  const variants = {
    primary:   { background: 'var(--color-primary)',  color: '#fff', boxShadow: '0 4px 12px rgba(15,118,110,.22)' },
    secondary: { background: 'var(--color-surface)',  color: 'var(--color-primary)', border: '2px solid var(--color-secondary)' },
    ghost:     { background: 'transparent',           color: 'var(--color-primary)' },
    gold:      { background: 'var(--color-accent)',   color: '#fff', boxShadow: '0 4px 12px rgba(245,158,11,.25)' },
    danger:    { background: 'var(--color-error)',    color: '#fff' },
  };

  const hoverBg = { primary: 'var(--color-primary-hover)', gold: '#D97706', danger: '#DC2626' };
  const iconSize = size === 'lg' ? 20 : 18;

  return (
    <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ ...btnBase, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled && hoverBg[variant]) e.currentTarget.style.background = hoverBg[variant]; }}
      onMouseLeave={e => { if (!disabled && hoverBg[variant]) e.currentTarget.style.background = variants[variant].background; }}
      onMouseDown={e =>  { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e =>    { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}

window.Button = Button;
