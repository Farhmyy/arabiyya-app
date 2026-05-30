/* AudioButton — Circular play/pause toggle */

function AudioButton({ playing = false, onClick, size = 'md', variant = 'primary' }) {
  const dims = { sm: 36, md: 48, lg: 64 }[size] || 48;
  const iconSize = { sm: 14, md: 18, lg: 24 }[size] || 18;

  const palettes = {
    primary:      { bg: 'var(--color-secondary)', fg: '#fff',                 shadow: '0 4px 12px rgba(20,184,166,.35)' },
    secondary:    { bg: '#F0FDFA',                fg: 'var(--color-primary)', shadow: 'none' },
    'on-primary': { bg: '#fff',                   fg: 'var(--color-primary)', shadow: 'none' },
  };
  const p = palettes[variant] || palettes.primary;

  return (
    <button onClick={onClick} aria-label={playing ? 'Pause' : 'Play'}
      style={{
        width: dims, height: dims, borderRadius: 999, border: 'none',
        background: p.bg, color: p.fg, boxShadow: p.shadow,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-med)',
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
      onMouseUp={e =>   e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Icon name={playing ? 'pause' : 'play'} size={iconSize} />
    </button>
  );
}

window.AudioButton = AudioButton;
