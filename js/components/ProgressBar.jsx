/* ProgressBar + StepProgress */

function ProgressBar({ value = 0, max = 100, label, showPct = true, color = 'gradient', size = 'md' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const h = { sm: 6, md: 10, lg: 14 }[size] || 10;

  const fills = {
    gradient: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
    success:  'var(--color-success)',
    gold:     'var(--color-accent)',
    primary:  'var(--color-primary)',
  };

  return (
    <div style={{ width: '100%' }}>
      {(label || showPct) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          {label && <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>{label}</div>}
          {showPct && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'ui-monospace, monospace' }}>{Math.round(pct)}%</div>}
        </div>
      )}
      <div style={{ height: h, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}
           role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div style={{
          width: pct + '%', height: '100%',
          background: fills[color] || fills.gradient,
          borderRadius: 999,
          transition: 'width var(--dur-slow) var(--ease-out)',
        }} />
      </div>
    </div>
  );
}

function StepProgress({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 8, width: '100%' }} role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 6, borderRadius: 999,
          background: i < current ? 'var(--color-primary)'
                    : i === current ? 'var(--color-secondary)'
                    : 'var(--color-border)',
          transition: 'background var(--dur-med) var(--ease-out)',
        }} />
      ))}
    </div>
  );
}

window.ProgressBar = ProgressBar;
window.StepProgress = StepProgress;
