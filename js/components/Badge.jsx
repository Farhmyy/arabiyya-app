/* Badge — Status / category chip */

function Badge({ tone = 'neutral', children, icon, style }) {
  const palettes = {
    neutral: { bg: '#E2E8F0', fg: '#475569' },
    primary: { bg: '#CCFBF1', fg: 'var(--color-primary)' },
    gold:    { bg: '#FEF3C7', fg: '#92400E' },
    success: { bg: 'var(--color-success)', fg: '#fff' },
    warning: { bg: 'var(--color-warning)', fg: '#fff' },
    error:   { bg: 'var(--color-error)',   fg: '#fff' },
    locked:  { bg: '#F1F5F9', fg: '#94A3B8' },
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
