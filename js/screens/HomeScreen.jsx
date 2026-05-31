/* HomeScreen — Landing page */

function HomeScreen({ navigate, xp, streak }) {
  const { chapters, ui } = DATA;
  const progress = window._progress || {};

  const scrollToChapters = () => {
    const el = document.getElementById('chapter-list');
    if (el) {
      const rect = el.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + rect.top - 24, behavior: 'smooth' });
    }
  };

  return (
    <div className="page anim-in" style={{ paddingTop: 96 }}>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-surface) 60%, var(--color-accent-50) 100%)',
        borderRadius: 28, padding: '48px 48px',
        display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32,
        alignItems: 'center', position: 'relative', overflow: 'hidden',
        marginBottom: 64,
      }} className="hero-grid">
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: 999, background: 'var(--color-secondary-glow, rgba(20,184,166,.08))' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 200, width: 80, height: 80, borderRadius: 999, background: 'var(--color-accent-glow, rgba(245,158,11,.12))' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Badge tone="primary" icon="sparkles">{ui.hero.badge}</Badge>

          <h1 lang="ar" style={{
            fontFamily: 'var(--font-arabic)', color: 'var(--color-primary)',
            fontSize: 64, fontWeight: 800, direction: 'rtl', textAlign: 'right', lineHeight: 1.3, margin: 0,
          }}>
            {ui.hero.title_ar}
          </h1>

          <p style={{ fontSize: 22, color: 'var(--color-text-secondary)', maxWidth: 480 }}>
            {ui.hero.subtitle}
          </p>

          <p lang="ar" style={{ fontSize: 22, color: 'var(--color-text-primary)', fontFamily: 'var(--font-arabic)', direction: 'rtl', textAlign: 'right' }}>
            {ui.hero.subtitle_ar}
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button variant="primary" size="lg" iconRight="chevron-right" onClick={scrollToChapters}>
              {ui.hero.cta_primary}
            </Button>
            <Button variant="secondary" size="lg" icon="book" onClick={scrollToChapters}>
              {ui.hero.cta_secondary}
            </Button>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <img src="assets/images/illustration-hero.svg" alt="" className="hero-illustration" style={{ width: '100%', display: 'block' }} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ marginBottom: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="feature-grid">
          {ui.features.map((f, i) => (
            <Card key={i} padding={24}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'linear-gradient(180deg, var(--color-primary), var(--color-primary-hover))',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={f.icon} size={24} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CHAPTER LIST ── */}
      <section id="chapter-list" style={{ scrollMarginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Pilih Bab</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>Tiga bab tersedia · selesaikan untuk membuka yang berikutnya</p>
          </div>
          <Badge tone="gold" icon="trophy">{xp} XP · Streak {streak} hari</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="chapter-grid">
          {chapters.map(c => (
            <ChapterCard
              key={c.number}
              num={c.number}
              status={c.status}
              titleAr={c.title_ar}
              titleId={c.title_id}
              summary={c.summary}
              progress={c.status === 'available' ? (progress.chapterProgress ? progress.chapterProgress('3') : 0) : 0}
              onClick={() => navigate('chapter/3')}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

window.HomeScreen = HomeScreen;
