/* MufrodatScreen — Vocabulary grid (الْمُفْرَدَات) */

function useMufrodatContent() {
  const { useState, useEffect } = React;
  const [words, setWords] = useState(null);
  useEffect(() => {
    fbDb.collection('content').doc('mufrodat').get()
      .then(doc => {
        if (doc.exists && doc.data().words && doc.data().words.length > 0) {
          setWords(doc.data().words);
        }
      })
      .catch(() => {});
  }, []);
  return words ? words.map(w => ({
    ar: w.arabic,
    meaning_id: w.meaning,
    example_ar: w.example,
    image_ref: w.image_url || null,
    audio_text: w.arabic,
    audio_ref: null,
    transliteration: '',
  })) : DATA.mufrodat;
}

function MufrodatScreen({ navigate, progress }) {
  const { useState, useEffect } = React;
  const mufrodat = useMufrodatContent();
  const { mufrodat_extra } = DATA;

  const [flipped,     setFlipped]     = useState(() => new Set());
  const [playingKey,  setPlayingKey]  = useState(null);
  const [showExtra,   setShowExtra]   = useState(false);

  const toggle = (i) => setFlipped(prev => {
    const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s;
  });

  const flipAll = (state) => setFlipped(state ? new Set(mufrodat.map((_, i) => i)) : new Set());

  const speakWord = (e, key, text, audioRef) => {
    e.stopPropagation();
    if (window.stopSpeech) window.stopSpeech();
    if (playingKey === key) { setPlayingKey(null); return; }
    setPlayingKey(key);
    window.speakArabic(text, audioRef, () => setPlayingKey(null));
  };

  /* Mark mufrodat complete when all cards flipped */
  useEffect(() => {
    if (flipped.size === mufrodat.length && progress && progress.completeSection) {
      progress.completeSection('3', 'mufrodat', mufrodat.length, mufrodat.length);
    }
  }, [flipped.size]);

  return (
    <div className="page anim-in">
      <a onClick={() => navigate('chapter/3')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 16 }}>
        <Icon name="chevron-left" size={16} /> Bab 3 — Menjenguk Orang Sakit
      </a>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 lang="ar" style={{ fontFamily: 'var(--font-arabic)', color: 'var(--color-primary)', fontSize: 40, fontWeight: 600, direction: 'rtl', textAlign: 'right', margin: 0 }}>الْمُفْرَدَات</h1>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>Kosakata · Mufrodat</div>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>
            Tap kartu untuk melihat artinya. Tekan 🔊 untuk mendengar pengucapan. {mufrodat.length} kosakata bab ini.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon="rotate" onClick={() => flipAll(true)}>Balik Semua</Button>
          <Button variant="ghost" onClick={() => flipAll(false)}>Reset</Button>
        </div>
      </div>

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {mufrodat.map((card, i) => {
          const isFlipped    = flipped.has(i);
          const wordKey      = `word-${i}`;
          const exampleKey   = `ex-${i}`;
          const isPlayingW   = playingKey === wordKey;
          const isPlayingEx  = playingKey === exampleKey;

          return (
            <div key={i} onClick={() => toggle(i)}
              style={{ perspective: 1200, cursor: 'pointer', width: '100%', aspectRatio: '1 / 1.1' }}
            >
              <div style={{
                position: 'relative', width: '100%', height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 500ms var(--ease-out)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
              }}>

                {/* FRONT — Arabic word */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--color-surface)', borderRadius: 20, padding: 18,
                  boxShadow: 'var(--shadow-card)', backfaceVisibility: 'hidden',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Badge tone="primary">{i + 1}</Badge>
                    <button onClick={e => speakWord(e, wordKey, card.audio_text, card.audio_ref)}
                      aria-label="Putar audio"
                      style={{
                        width: 36, height: 36, borderRadius: 999, border: 'none', cursor: 'pointer',
                        background: isPlayingW ? 'var(--color-primary)' : 'linear-gradient(180deg, #F0FDFA, #CCFBF1)',
                        color: isPlayingW ? '#fff' : 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <Icon name={isPlayingW ? 'pause' : 'volume-2'} size={14} />
                    </button>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 40, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center', lineHeight: 1.6, direction: 'rtl' }}>{card.ar}</div>
                    <div style={{ fontFamily: 'var(--font-latin)', fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6, fontStyle: 'italic' }}>{card.transliteration}</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Icon name="rotate" size={12} /> Tap untuk arti
                  </div>
                </div>

                {/* BACK — Meaning + image placeholder + example */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--color-surface)', borderRadius: 20,
                  boxShadow: 'var(--shadow-card)', backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                  border: '2px solid var(--color-primary)',
                }}>
                  {/* Image / icon area */}
                  <div style={{ flex: 1, background: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 8, position: 'relative', minHeight: 80 }}>
                    <img
                      src={card.image_ref}
                      alt={card.meaning_id}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `<div style="color:var(--color-primary);font-size:40px;text-align:center">💊</div>`;
                      }}
                    />
                  </div>

                  {/* Meaning + word */}
                  <div style={{ padding: '10px 14px', background: 'var(--color-primary)', color: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 20, direction: 'rtl' }}>{card.ar}</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{card.meaning_id}</div>
                    </div>
                  </div>

                  {/* Example sentence */}
                  <div style={{ padding: '8px 12px', background: '#FAFFFE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 14, color: 'var(--color-text-primary)', direction: 'rtl', lineHeight: 1.7 }}>{card.example_ar}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{card.example_id}</div>
                      </div>
                      <button onClick={e => speakWord(e, exampleKey, card.example_ar, null)}
                        aria-label="Putar contoh"
                        style={{
                          width: 28, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
                          background: isPlayingEx ? 'var(--color-primary)' : '#E2E8F0',
                          color: isPlayingEx ? '#fff' : 'var(--color-text-secondary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                        <Icon name={isPlayingEx ? 'pause' : 'volume-2'} size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tahukah Kamu? — extra vocab */}
      <div style={{ marginTop: 32 }}>
        <button onClick={() => setShowExtra(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '14px 18px', borderRadius: 14, border: '1.5px solid var(--color-border)',
            background: showExtra ? '#F0FDFA' : 'var(--color-surface)',
            cursor: 'pointer', textAlign: 'left', fontWeight: 700, fontSize: 16,
          }}>
          <Icon name="help-circle" size={20} color="var(--color-accent)" />
          <span>Tahukah Kamu? — Kosakata Pelengkap</span>
          <Icon name={showExtra ? 'chevron-up' : 'chevron-down'} size={18} style={{ marginLeft: 'auto' }} />
        </button>
        {showExtra && (
          <div className="anim-in" style={{
            marginTop: 8, padding: '16px 20px', borderRadius: 14,
            background: '#FFFBEB', border: '1px solid #FDE68A',
          }}>
            <p style={{ fontSize: 13, color: '#92400E', marginBottom: 12, fontWeight: 600 }}>
              Kosakata tambahan seputar penyakit — untuk referensi, tidak masuk kuis.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {mufrodat_extra.map((w, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 999,
                  background: '#fff', border: '1px solid #FDE68A',
                }}>
                  <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 18, fontWeight: 600, color: '#92400E', direction: 'rtl' }}>{w.ar}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{w.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, maxWidth: 480 }}>
          <ProgressBar value={flipped.size} max={mufrodat.length} label="Sudah dibalik" color="gradient" />
        </div>
        <Button variant="primary" iconRight="chevron-right" onClick={() => navigate('chapter/3/tadribat-1')}>
          Lanjut ke Tadribat 1
        </Button>
      </div>
    </div>
  );
}

window.MufrodatScreen = MufrodatScreen;
