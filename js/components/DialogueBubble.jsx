/* DialogueBubble — WhatsApp-style hiwar bubble */

function DialogueBubble({ side = 'left', speaker, ar, id, playing, highlighted, onPlay, showTranslation }) {
  const isLeft = side === 'left';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isLeft ? 'row' : 'row-reverse',
      gap: 12, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 999, flexShrink: 0,
        background: isLeft ? '#CCFBF1' : 'var(--color-primary-hover)',
        color: isLeft ? 'var(--color-primary)' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 18,
      }}>
        {speaker}
      </div>

      <div style={{
        background: isLeft ? 'var(--color-surface)' : 'var(--color-primary)',
        color: isLeft ? 'var(--color-text-primary)' : '#fff',
        border: isLeft ? '1px solid var(--color-border)' : 'none',
        borderRadius: isLeft ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
        padding: '14px 18px', maxWidth: 500,
        boxShadow: highlighted
          ? '0 0 0 3px rgba(245,158,11,.4), 0 4px 12px rgba(0,0,0,.08)'
          : 'var(--shadow-card)',
        transition: 'box-shadow var(--dur-med)',
      }}>
        <div lang="ar" style={{
          fontFamily: 'var(--font-arabic)',
          fontSize: 24, fontWeight: 600, lineHeight: 1.7,
          direction: 'rtl', textAlign: 'right',
        }}>{ar}</div>

        {showTranslation && id && (
          <div style={{
            fontSize: 13, marginTop: 6, fontFamily: 'var(--font-latin)',
            color: isLeft ? 'var(--color-text-secondary)' : 'rgba(255,255,255,.85)',
          }}>{id}</div>
        )}
      </div>

      <AudioButton playing={playing} onClick={onPlay} size="sm"
                   variant={isLeft ? 'secondary' : 'on-primary'} />
    </div>
  );
}

window.DialogueBubble = DialogueBubble;
