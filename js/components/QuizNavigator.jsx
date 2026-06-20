/* QuizNavigator — right-sidebar question number panel */

function QuizNavigator({ count, currentIdx, answeredMap, onJump, allAnswered, onFinish }) {
  const { useState } = React;
  const [collapsed, setCollapsed] = useState(false);

  const answeredCount = Object.keys(answeredMap).length;

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 14,
      border: '1px solid var(--color-border)',
      padding: '10px 14px',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            Navigasi Soal
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
            {answeredCount}/{count} dijawab
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {allAnswered && onFinish && (
            <button onClick={onFinish} style={{
              padding: '5px 14px', borderRadius: 999, border: 'none',
              background: 'var(--color-primary-bg)', color: '#fff',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              Lihat Hasil <Icon name="chevron-right" size={12} />
            </button>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-light)', padding: '2px 4px',
              fontSize: 11, fontWeight: 600,
            }}>
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Number buttons */}
      {!collapsed && (
        <div className="quiz-nav-numbers">
          {Array.from({ length: count }, (_, i) => {
            const ans = answeredMap[i];
            const isCurrent = i === currentIdx;

            /* background: current-unanswered=primary, correct=success, wrong=error, other=bg */
            const bg = (isCurrent && !ans)
              ? 'var(--color-primary)'
              : ans?.isCorrect
                ? 'var(--color-success)'
                : ans
                  ? 'var(--color-error)'
                  : 'var(--color-bg)';

            const textColor = (isCurrent || ans) ? '#fff' : 'var(--color-text-secondary)';

            /* extra ring when current question is already answered */
            const boxShadow = (isCurrent && ans)
              ? '0 0 0 2px var(--color-primary)'
              : 'none';

            return (
              <button
                key={i}
                onClick={() => onJump(i)}
                title={`Soal ${i + 1}${ans ? (ans.isCorrect ? ' ✓ Benar' : ' ✗ Salah') : ' (belum dijawab)'}`}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: '1.5px solid var(--color-border)',
                  background: bg, color: textColor,
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  transition: 'all 120ms',
                  boxShadow,
                }}>
                {i + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {!collapsed && (
        <div className="quiz-nav-legend" style={{ marginTop: 8, fontSize: 11, color: 'var(--color-text-light)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-primary-bg)', display: 'inline-block' }} /> Sedang dikerjakan
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-success)', display: 'inline-block' }} /> Benar
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-error)', display: 'inline-block' }} /> Salah
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', display: 'inline-block' }} /> Belum dijawab
          </span>
        </div>
      )}
    </div>
  );
}

window.QuizNavigator = QuizNavigator;
