/* Badge — Status / category chip */

function Badge({ tone = 'neutral', children, icon, style }) {
  const palettes = {
    neutral: { bg: 'var(--color-border)', fg: '#475569' },
    primary: { bg: 'var(--color-primary-100)', fg: 'var(--color-primary)' },
    gold:    { bg: 'var(--color-accent-100)', fg: 'var(--color-amber-text)' },
    success: { bg: 'var(--color-success)', fg: '#fff' },
    warning: { bg: 'var(--color-warning)', fg: '#fff' },
    error:   { bg: 'var(--color-error)',   fg: '#fff' },
    locked:  { bg: 'var(--color-bg)', fg: 'var(--color-text-light)' },
  };
  const p = palettes[tone] || palettes.neutral;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: p.bg, color: p.fg,
      padding: '5px 12px', borderRadius: 999,
      fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-latin)',
      whiteSpace: 'nowrap', ...style,
    }}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}

window.Badge = Badge;
