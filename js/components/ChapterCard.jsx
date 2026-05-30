/* ChapterCard — Big tile for the homepage chapter list */

function ChapterCard({ num, status, titleAr, titleId, summary, progress = 0, onClick }) {
  const numAr = ['١', '٢', '٣', '٤', '٥', '٦'][num - 1] || num;
  const locked = status === 'locked';
  const soon   = status === 'soon';
  const avail  = status === 'available';

  return (
    <Card hover={avail} onClick={avail ? onClick : undefined} padding={0} radius={20}
          style={{ opacity: locked || soon ? 0.78 : 1 }}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 240 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: avail ? 'linear-gradient(180deg, var(--color-primary), var(--color-primary-hover))' : '#F1F5F9',
            color: avail ? '#fff' : '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-arabic)', fontSize: 36, fontWeight: 700,
          }}>
            {numAr}
          </div>
          {avail  && <Badge tone="gold">Tersedia</Badge>}
          {soon   && <Badge tone="neutral">Segera Hadir</Badge>}
          {locked && <Badge tone="locked" icon="lock">Terkunci</Badge>}
        </div>

        <div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '.04em' }}>
            BAB {num}
          </div>
          <div className="ar-title" style={{ fontSize: 30, color: 'var(--color-primary)', marginTop: 2 }}>{titleAr}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 4 }}>{titleId}</div>
        </div>

        {summary && <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{summary}</div>}

        <div style={{ flex: 1 }} />

        {avail && <ProgressBar value={progress} label="Progress" />}
      </div>
    </Card>
  );
}

window.ChapterCard = ChapterCard;
