/* Card — Signature surface (white, 20px radius, soft shadow) */

function Card({ children, padding = 24, radius = 20, hover = false, accent, onClick, style }) {
  const accentColors = {
    primary:   'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    gold:      'var(--color-accent)',
    success:   'var(--color-success)',
  };

  return (
    <div onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        borderRadius: radius,
        padding,
        boxShadow: 'var(--shadow-card)',
        transition: 'box-shadow var(--dur-med) var(--ease-out), transform var(--dur-med) var(--ease-out)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...(accentColors[accent] ? { borderLeft: `4px solid ${accentColors[accent]}` } : {}),
        ...style,
      }}
      onMouseEnter={e => { if (hover) { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { if (hover) { e.currentTarget.style.boxShadow = 'var(--shadow-card)';  e.currentTarget.style.transform = 'translateY(0)'; } }}
    >
      {children}
    </div>
  );
}

window.Card = Card;
