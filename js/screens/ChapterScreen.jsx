/* ChapterScreen — Chapter 3 overview */

function ChapterScreen({ navigate, progress }) {
  const { chapter3 } = DATA;

  const sectionProgress = progress ? progress.sectionStatus : () => 'open';

  const sections = [
    { id: 'hiwar',      icon: 'message', titleAr: 'الْحِوَار',      titleId: 'Hiwar · Dialog',                subtitle: '6 adegan · TTS Audio · toggle terjemahan', accent: 'primary',   route: 'chapter/3/hiwar' },
    { id: 'mufrodat',   icon: 'layers',  titleAr: 'الْمُفْرَدَات',  titleId: 'Mufrodat · Kosakata',            subtitle: '12 kata · flashcard + contoh kalimat',     accent: 'secondary', route: 'chapter/3/mufrodat' },
    { id: 'tadribat_1', icon: 'edit',    titleAr: 'تَدْرِيبَات ١',  titleId: 'Tadribat 1 · Latihan Hiwar & Mufrodat', subtitle: '10 soal · 5 audio + 5 teks · +XP',  accent: 'gold',      route: 'chapter/3/tadribat-1' },
    { id: 'qawaid',     icon: 'book',    titleAr: 'التَّرْكِيب',    titleId: 'Qawaid · Tata Bahasa',           subtitle: "3 topik: mādhī · mudhāri' · jumlah fi'liyyah", accent: 'purple', route: 'chapter/3/qawaid' },
    { id: 'tadribat_2', icon: 'edit',    titleAr: 'تَدْرِيبَات ٢',  titleId: 'Tadribat 2 · Latihan Qawaid',   subtitle: '10 soal interaktif · skor akhir & badge',  accent: 'teal',      route: 'chapter/3/tadribat-2' },
  ];

  const chapterPct = progress ? progress.chapterProgress('3') : 0;

  return (
    <div className="page anim-in">

      {/* ── BANNER ── */}
      <section className="chapter-banner-section" style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
        borderRadius: 24, padding: '32px 32px', color: '#fff',
        position: 'relative', overflow: 'hidden', marginBottom: 32,
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: 999, background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 120, width: 120, height: 120, borderRadius: 999, background: 'rgba(245,158,11,.18)' }} />

        <div style={{ position: 'relative' }}>
          {/* Row 1: back link + badge (left) | nomor bab (right) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <a onClick={() => navigate('home')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#CCFBF1', cursor: 'pointer' }}>
                <Icon name="chevron-left" size={16} /> Kembali ke beranda
              </a>
              <div style={{ marginTop: 10 }}>
                <Badge tone="gold">BAB 3 · Tersedia</Badge>
              </div>
            </div>
            <div className="chapter-num-box" style={{
              width: 80, height: 80, borderRadius: 20,
              background: 'rgba(255,255,255,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-arabic)', fontSize: 52, fontWeight: 700, color: '#fff',
              flexShrink: 0,
            }}>٣</div>
          </div>

          {/* Arabic title — full width, no competition with the number box */}
          <h1 lang="ar" style={{ fontFamily: 'var(--font-arabic)', color: '#fff', fontSize: 52, fontWeight: 700, direction: 'rtl', textAlign: 'right', lineHeight: 1.4, margin: '0 0 8px' }}>
            {chapter3.title_ar}
          </h1>
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{chapter3.title_id}</div>
          <div style={{ color: '#CCFBF1', fontSize: 15, maxWidth: 540, marginBottom: 16 }}>{chapter3.description}</div>
          <div style={{ width: '100%', maxWidth: 480 }}>
            <ProgressBar value={chapterPct} label={<span style={{ color: '#fff' }}>Progress kamu</span>} />
          </div>
        </div>
      </section>

      {/* ── LEARNING OBJECTIVES ── */}
      <section style={{ marginBottom: 32 }}>
        <Card padding={24}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Icon name="star" size={20} color="var(--color-accent)" />
            <div style={{ fontSize: 20, fontWeight: 700 }}>Tujuan Pembelajaran</div>
          </div>
          <ul className="objectives-grid" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {chapter3.objectives.map((o, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 999,
                  background: 'var(--color-primary-50)', color: 'var(--color-primary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 2,
                }}>
                  <Icon name="check" size={14} />
                </span>
                <span style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>{o}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* ── SECTION NAVIGATION ── */}
      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 16px' }}>Bagian Pembelajaran</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="section-grid">
          {sections.map(s => (
            <SectionCard
              key={s.id}
              icon={s.icon}
              titleAr={s.titleAr}
              titleId={s.titleId}
              subtitle={s.subtitle}
              status={sectionProgress('3', s.id)}
              accent={s.accent}
              onClick={() => navigate(s.route)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

window.ChapterScreen = ChapterScreen;
