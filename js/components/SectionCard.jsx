/* SectionCard — Navigation tile for chapter sections */

function SectionCard({ icon, titleAr, titleId, subtitle, status = 'open', accent = 'primary', onClick }) {
  const gradients = {
    primary:   'linear-gradient(180deg, #0F766E, #115E59)',
    secondary: 'linear-gradient(180deg, #14B8A6, #0D9488)',
    gold:      'linear-gradient(180deg, #F59E0B, #D97706)',
    purple:    'linear-gradient(180deg, #8B5CF6, #7C3AED)',
    teal:      'linear-gradient(180deg, #06B6D4, #0891B2)',
  };

  return (
    <Card hover onClick={onClick} padding={20}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: gradients[accent] || gradients.primary,
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name={icon} size={26} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 24, fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.3 }}>{titleAr}</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 2 }}>{titleId}</div>
          {subtitle && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>{subtitle}</div>}
        </div>

        {status === 'done' && <Icon name="check-circle" size={22} color="var(--color-success)" />}
        {status === 'open' && <Icon name="chevron-right" size={22} color="var(--color-text-light)" />}
      </div>
    </Card>
  );
}

window.SectionCard = SectionCard;
