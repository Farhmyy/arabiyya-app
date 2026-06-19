/* MufrodatScreen — Vocabulary grid (الْمُفْرَدَات) */

function useMufrodatContent() {
  const transform = (raw) => (raw.words || []).map(w => {
    const local = DATA.mufrodat.find(m => m.ar === w.arabic) || {};
    return {
      ar: w.arabic, meaning_id: w.meaning, example_ar: w.example,
      image_ref: w.image_url || local.image_ref || null, audio_text: w.arabic,
      audio_ref: local.audio_ref || null,
      example_ref: local.example_ref || null,
      transliteration: local.transliteration || '',
    };
  });
  return useCloudContent('mufrodat', DATA.mufrodat, transform);
}

function MufrodatScreen({ navigate, progress }) {
  const { useState, useEffect, useRef, useCallback } = React;
  const mufrodat = useMufrodatContent();
  const { mufrodat_extra } = DATA;

  // ── Normal mode state ──────────────────────────────────────────────────────
  const [flipped,    setFlipped]    = useState(() => new Set());
  const [playingKey, setPlayingKey] = useState(null);
  const [showExtra,  setShowExtra]  = useState(false);
  const playingKeyRef = useRef(null);

  // ── SRS review state ────────────────────────────────────────────────────────
  const [reviewMode,    setReviewMode]    = useState(false);
  const [reviewQueue,   setReviewQueue]   = useState([]);
  const [reviewIdx,     setReviewIdx]     = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [reviewDone,    setReviewDone]    = useState(false);
  const [reviewTally,   setReviewTally]   = useState({ easy: 0, good: 0, hard: 0 });

  // ── SRS derived values ──────────────────────────────────────────────────────
  const mufrodatProgress = progress?.chapters?.['3']?.mufrodat;
  const srsCards         = mufrodatProgress?.srsCards || null;
  const dueCardIndices   = (srsCards && window.SRS) ? window.SRS.getDueCards(srsCards) : [];

  // Migration: initialize srsCards for users who completed mufrodat before this feature
  useEffect(() => {
    if (!window.SRS || !mufrodat.length || !mufrodatProgress?.completed) return;
    if (mufrodatProgress.srsCards) return;
    const cards = window.SRS.initSrsCards(mufrodat.length);
    const today = window.SRS.localDateStr();
    Object.values(cards).forEach(c => { c.nextReview = today; });
    progress?.setSrsCards?.('3', 'mufrodat', cards);
  }, [mufrodat.length, mufrodatProgress?.completed, mufrodatProgress?.srsCards]);

  // ── Normal mode handlers ────────────────────────────────────────────────────
  const toggle  = (i) => setFlipped(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  const flipAll = (state) => setFlipped(state ? new Set(mufrodat.map((_, i) => i)) : new Set());

  const speakWord = (e, key, text, audioRef) => {
    e.stopPropagation();
    if (playingKeyRef.current === key) {
      playingKeyRef.current = null; setPlayingKey(null);
      if (window.stopSpeech) window.stopSpeech();
      return;
    }
    if (window.stopSpeech) window.stopSpeech();
    playingKeyRef.current = key; setPlayingKey(key);
    window.speakArabic(text, audioRef, () => { playingKeyRef.current = null; setPlayingKey(null); });
  };

  /* Mark mufrodat complete when all cards flipped */
  useEffect(() => {
    if (flipped.size === mufrodat.length && progress?.completeSection) {
      progress.completeSection('3', 'mufrodat', mufrodat.length, mufrodat.length);
    }
  }, [flipped.size]);

  // ── SRS review handlers ─────────────────────────────────────────────────────
  const startReview = useCallback(() => {
    if (!srsCards || !window.SRS || dueCardIndices.length === 0) return;
    setReviewQueue(dueCardIndices);
    setReviewIdx(0);
    setReviewFlipped(false);
    setReviewDone(false);
    setReviewTally({ easy: 0, good: 0, hard: 0 });
    setReviewMode(true);
  }, [srsCards, dueCardIndices]);

  const rateCard = useCallback((rating) => {
    const cardIndex   = reviewQueue[reviewIdx];
    const existing    = srsCards?.[cardIndex] || { interval: 1, repetitions: 0, easeFactor: 2.5, lapses: 0 };
    const newCardData = window.SRS.scheduleCard(existing, rating);
    progress?.updateSrsCard?.('3', 'mufrodat', cardIndex, newCardData);
    setReviewTally(prev => ({ ...prev, [rating]: prev[rating] + 1 }));
    if (reviewIdx + 1 >= reviewQueue.length) {
      setReviewDone(true);
    } else {
      setReviewIdx(i => i + 1);
      setReviewFlipped(false);
    }
  }, [reviewQueue, reviewIdx, srsCards, progress]);

  // ── RENDER: Review done summary ─────────────────────────────────────────────
  if (reviewMode && reviewDone) {
    const total = reviewQueue.length;
    return (
      <div className="page anim-in">
        <a onClick={() => setReviewMode(false)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 24 }}>
          <Icon name="chevron-left" size={16} /> Kembali ke Mufrodat
        </a>

        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <Card padding={40} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>🎉</div>
            <h2 style={{ marginBottom: 8 }}>Review Selesai!</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              Kamu telah mereview <strong>{total} kata</strong> hari ini. Bagus!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
              {[
                { key: 'hard', emoji: '😅', label: 'Susah',  bg: 'var(--color-error-50)',   border: 'var(--color-error-border)',   text: 'var(--color-error-text)' },
                { key: 'good', emoji: '🙂', label: 'Biasa',  bg: 'var(--color-primary-50)', border: 'var(--color-border)',         text: 'var(--color-text-secondary)' },
                { key: 'easy', emoji: '😊', label: 'Mudah',  bg: 'var(--color-success-50)', border: 'var(--color-success-border)', text: 'var(--color-success-text)' },
              ].map(({ key, emoji, label, bg, border, text }) => (
                <div key={key} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '14px 8px' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: text }}>{reviewTally[key]}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            <Button variant="primary" onClick={() => setReviewMode(false)} style={{ width: '100%' }}>
              Kembali ke Kosakata
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // ── RENDER: Review card-by-card ─────────────────────────────────────────────
  if (reviewMode) {
    const cardIndex  = reviewQueue[reviewIdx];
    const card       = mufrodat[cardIndex];
    const wordKey    = `rev-word-${reviewIdx}`;
    const exKey      = `rev-ex-${reviewIdx}`;
    const isPlayingW = playingKey === wordKey;
    const isPlayingEx = playingKey === exKey;

    if (!card) { setReviewMode(false); return null; }

    return (
      <div className="page anim-in">
        {/* Top row: exit + counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <a onClick={() => setReviewMode(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <Icon name="x" size={16} /> Batalkan Review
          </a>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            {reviewIdx + 1} / {reviewQueue.length}
          </div>
        </div>

        {/* Progress bar */}
        <StepProgress current={reviewIdx} total={reviewQueue.length} style={{ marginBottom: 28 }} />

        {/* Card */}
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={{ perspective: 1200, width: '100%', aspectRatio: '3 / 3.6', cursor: reviewFlipped ? 'default' : 'pointer', marginBottom: 20 }}
            onClick={() => !reviewFlipped && setReviewFlipped(true)}>
            <div style={{
              position: 'relative', width: '100%', height: '100%',
              transformStyle: 'preserve-3d',
              transition: 'transform 500ms var(--ease-out)',
              transform: reviewFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
            }}>

              {/* FRONT */}
              <div style={{
                position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                background: 'var(--color-surface)', borderRadius: 24,
                boxShadow: 'var(--shadow-card)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge tone="primary">{cardIndex + 1}</Badge>
                  <button onClick={e => speakWord(e, wordKey, card.audio_text, card.audio_ref)}
                    aria-label="Putar audio"
                    style={{
                      width: 38, height: 38, borderRadius: 999, cursor: 'pointer',
                      border: '1.5px solid var(--color-primary)',
                      background: isPlayingW ? 'var(--color-primary)' : 'transparent',
                      color: isPlayingW ? '#fff' : 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <Icon name={isPlayingW ? 'pause' : 'play'} size={17} />
                  </button>
                </div>

                <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
                  <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 52, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center', lineHeight: 1.5, direction: 'rtl' }}>
                    {card.ar}
                  </div>
                  <div style={{ fontFamily: 'var(--font-latin)', fontSize: 14, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    {card.transliteration}
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Icon name="rotate" size={13} /> Tap untuk lihat arti
                </div>
              </div>

              {/* BACK */}
              <div style={{
                position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'var(--color-surface)', borderRadius: 24,
                border: '2px solid var(--color-primary)',
                boxShadow: 'var(--shadow-card)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                {/* Image */}
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 80 }}>
                  <img
                    src={card.image_ref}
                    alt={card.meaning_id}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.background = 'var(--color-primary-50)';
                      e.target.parentNode.innerHTML = `<div style="color:var(--color-primary);font-size:48px;text-align:center;padding:24px">💊</div>`;
                    }}
                  />
                </div>
                {/* Meaning bar */}
                <div style={{ padding: '10px 16px', background: 'var(--color-primary)', color: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 22, direction: 'rtl' }}>{card.ar}</div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{card.meaning_id}</div>
                  </div>
                </div>
                {/* Example */}
                <div style={{ padding: '8px 14px', background: 'var(--color-surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 13, color: 'var(--color-text-primary)', direction: 'rtl', lineHeight: 1.7 }}>{card.example_ar}</div>
                    </div>
                    <button onClick={e => speakWord(e, exKey, card.example_ar, card.example_ref || null)}
                      aria-label="Putar contoh"
                      style={{
                        width: 28, height: 28, borderRadius: 999, cursor: 'pointer', flexShrink: 0,
                        border: '1.5px solid var(--color-text-secondary)',
                        background: isPlayingEx ? 'var(--color-primary)' : 'transparent',
                        color: isPlayingEx ? '#fff' : 'var(--color-text-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <Icon name={isPlayingEx ? 'pause' : 'play'} size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {!reviewFlipped ? (
            <div style={{ textAlign: 'center' }}>
              <Button variant="primary" icon="rotate" onClick={() => setReviewFlipped(true)}>
                Balik Kartu
              </Button>
            </div>
          ) : (
            <div className="anim-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <button onClick={() => rateCard('hard')} style={{
                padding: '12px 8px', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                border: '2px solid var(--color-error-border)',
                background: 'var(--color-error-50)', color: 'var(--color-error-text)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontSize: 22 }}>😅</span>Susah
              </button>
              <button onClick={() => rateCard('good')} style={{
                padding: '12px 8px', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                border: '2px solid var(--color-border)',
                background: 'var(--color-primary-50)', color: 'var(--color-text-secondary)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontSize: 22 }}>🙂</span>Biasa
              </button>
              <button onClick={() => rateCard('easy')} style={{
                padding: '12px 8px', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                border: '2px solid var(--color-success-border)',
                background: 'var(--color-success-50)', color: 'var(--color-success-text)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontSize: 22 }}>😊</span>Mudah
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RENDER: Normal grid mode ────────────────────────────────────────────────
  return (
    <div className="page anim-in">
      <a onClick={() => navigate('chapter/3')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 16 }}>
        <Icon name="chevron-left" size={16} /> Bab 3 — Menjenguk Orang Sakit
      </a>

      {/* Header */}
      <div className="page-header-flex" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Badge tone="primary" icon="layers">عِيَادَةُ الْمَرِيضِ</Badge>
            <Badge tone="neutral">Bab 3</Badge>
          </div>
          <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.75, margin: 0 }}>
            Pelajari <strong>{mufrodat.length} kosakata</strong> seputar tema menjenguk orang sakit —
            mulai dari nama penyakit, gejala, hingga tempat dan orang yang terlibat dalam dunia kesehatan.
            Setiap kartu dilengkapi gambar, contoh kalimat, dan audio pengucapan.
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 10 }}>
            Tap kartu untuk membalik dan melihat artinya. Tekan <strong>🔊</strong> untuk mendengar, lalu tekan <strong>🎤</strong> untuk melatih pengucapanmu.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <h1 lang="ar" style={{ fontFamily: 'var(--font-arabic)', color: 'var(--color-primary)', fontSize: 44, fontWeight: 700, direction: 'rtl', margin: 0, lineHeight: 1.2 }}>الْمُفْرَدَات</h1>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 2 }}>Kosakata · Mufrodat</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" icon="rotate" onClick={() => flipAll(true)}>Balik Semua</Button>
            <Button variant="ghost" onClick={() => flipAll(false)}>Reset</Button>
          </div>
        </div>
      </div>

      {/* SRS review banner */}
      {mufrodatProgress?.completed && dueCardIndices.length > 0 && (
        <div className="anim-in" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          padding: '14px 20px', borderRadius: 16, marginBottom: 24,
          background: 'var(--color-accent-50)', border: '1.5px solid var(--color-accent-100)',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-amber-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              🔔 {dueCardIndices.length} kata siap direview hari ini
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 3 }}>
              Ulangi sebelum kamu lupa — hanya butuh beberapa menit!
            </div>
          </div>
          <Button variant="primary" onClick={startReview}>
            Mulai Review ({dueCardIndices.length})
          </Button>
        </div>
      )}

      {/* Card grid */}
      <div className="mufrodat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {mufrodat.map((card, i) => {
          const isFlipped   = flipped.has(i);
          const wordKey     = `word-${i}`;
          const exampleKey  = `ex-${i}`;
          const isPlayingW  = playingKey === wordKey;
          const isPlayingEx = playingKey === exampleKey;

          return (
            <div key={i} onClick={() => toggle(i)}
              style={{ perspective: 1200, cursor: 'pointer', width: '100%', aspectRatio: '1 / 1.1' }}>
              <div style={{
                position: 'relative', width: '100%', height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 500ms var(--ease-out)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
              }}>

                {/* FRONT */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--color-surface)', borderRadius: 20, padding: 18,
                  boxShadow: 'var(--shadow-card)', backfaceVisibility: 'hidden',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Badge tone="primary">{i + 1}</Badge>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={e => speakWord(e, wordKey, card.audio_text, card.audio_ref)}
                        aria-label="Putar audio"
                        style={{
                          width: 36, height: 36, borderRadius: 999, cursor: 'pointer',
                          border: '1.5px solid var(--color-primary)',
                          background: isPlayingW ? 'var(--color-primary)' : 'transparent',
                          color: isPlayingW ? '#fff' : 'var(--color-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                        <Icon name={isPlayingW ? 'pause' : 'play'} size={16} />
                      </button>
                      <SpeakButton expectedText={card.audio_text} size="md" />
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 40, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center', lineHeight: 1.6, direction: 'rtl' }}>{card.ar}</div>
                    <div style={{ fontFamily: 'var(--font-latin)', fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6, fontStyle: 'italic' }}>{card.transliteration}</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Icon name="rotate" size={12} /> Tap untuk arti
                  </div>
                </div>

                {/* BACK */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--color-surface)', borderRadius: 20,
                  boxShadow: 'var(--shadow-card)', backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                  border: '2px solid var(--color-primary)',
                }}>
                  <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 80 }}>
                    <img
                      src={card.image_ref}
                      alt={card.meaning_id}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.parentNode.style.background = 'var(--color-primary-50)';
                        e.target.parentNode.innerHTML = `<div style="color:var(--color-primary);font-size:40px;text-align:center;padding:20px">💊</div>`;
                      }}
                    />
                  </div>
                  <div style={{ padding: '10px 14px', background: 'var(--color-primary)', color: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 20, direction: 'rtl' }}>{card.ar}</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{card.meaning_id}</div>
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'var(--color-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 14, color: 'var(--color-text-primary)', direction: 'rtl', lineHeight: 1.7 }}>{card.example_ar}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{card.example_id}</div>
                      </div>
                      <button onClick={e => speakWord(e, exampleKey, card.example_ar, card.example_ref || null)}
                        aria-label="Putar contoh"
                        style={{
                          width: 28, height: 28, borderRadius: 999, cursor: 'pointer', flexShrink: 0,
                          border: '1.5px solid var(--color-text-secondary)',
                          background: isPlayingEx ? 'var(--color-primary)' : 'transparent',
                          color: isPlayingEx ? '#fff' : 'var(--color-text-secondary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                        <Icon name={isPlayingEx ? 'pause' : 'play'} size={14} />
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
            background: showExtra ? 'var(--color-primary-50)' : 'var(--color-surface)',
            cursor: 'pointer', textAlign: 'left', fontWeight: 700, fontSize: 16,
          }}>
          <Icon name="help-circle" size={20} color="var(--color-accent)" />
          <span>Tahukah Kamu? — Kosakata Pelengkap</span>
          <Icon name={showExtra ? 'chevron-up' : 'chevron-down'} size={18} style={{ marginLeft: 'auto' }} />
        </button>
        {showExtra && (
          <div className="anim-in" style={{
            marginTop: 8, padding: '16px 20px', borderRadius: 14,
            background: 'var(--color-accent-50)', border: '1px solid var(--color-accent-100)',
          }}>
            <p style={{ fontSize: 13, color: 'var(--color-amber-text)', marginBottom: 12, fontWeight: 600 }}>
              Kosakata tambahan seputar penyakit — untuk referensi, tidak masuk kuis.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {mufrodat_extra.map((w, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 999,
                  background: 'var(--color-surface)', border: '1px solid var(--color-accent-100)',
                }}>
                  <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 18, fontWeight: 600, color: 'var(--color-amber-text)', direction: 'rtl' }}>{w.ar}</span>
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
