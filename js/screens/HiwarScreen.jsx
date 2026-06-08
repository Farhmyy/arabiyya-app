/* HiwarScreen — Dialog / Conversation (الْحِوَار) */

function HiwarScreen({ navigate, progress }) {
  const { useState, useEffect, useRef } = React;
  const { hiwar } = DATA;

  const [showTranslation, setShowTranslation] = useState(true);
  const [playingKey, setPlayingKey]           = useState(null);
  const [activeScene, setActiveScene]         = useState(() => {
    try { return parseInt(sessionStorage.getItem('arabiyya_hiwar_scene') || '0', 10); }
    catch { return 0; }
  });
  const playAllRef    = useRef(false);
  const playingKeyRef = useRef(null);

  const allLines = hiwar.scenes.flatMap((scene, si) =>
    scene.lines.map((line, li) => ({ ...line, key: `${si}-${li}` }))
  );

  const playLine = (key, audioText, audioRef) => {
    if (playingKeyRef.current === key) {
      playingKeyRef.current = null;
      setPlayingKey(null);
      playAllRef.current = false;
      if (window.stopSpeech) window.stopSpeech();
      return;
    }
    if (window.stopSpeech) window.stopSpeech();
    playAllRef.current = false;
    playingKeyRef.current = key;
    setPlayingKey(key);
    window.speakArabic(audioText, audioRef, () => {
      playingKeyRef.current = null;
      setPlayingKey(null);
    });
  };

  const playAll = () => {
    if (playAllRef.current) {
      playAllRef.current = false;
      playingKeyRef.current = null;
      if (window.stopSpeech) window.stopSpeech();
      setPlayingKey(null);
      return;
    }
    playAllRef.current = true;

    const playNext = (i) => {
      if (!playAllRef.current || i >= allLines.length) {
        playAllRef.current = false;
        playingKeyRef.current = null;
        setPlayingKey(null);
        return;
      }
      const line = allLines[i];
      playingKeyRef.current = line.key;
      setPlayingKey(line.key);
      /* Tandai scene yang sedang diputar sebagai aktif */
      const si = parseInt(line.key.split('-')[0], 10);
      setActiveScene(si);
      /* Auto-scroll ke baris yang sedang diputar */
      requestAnimationFrame(() => {
        const el = document.getElementById(`hiwar-line-${line.key}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      window.speakArabic(line.audio_text, line.audio_ref, () => {
        setTimeout(() => playNext(i + 1), 400);
      });
    };
    playNext(0);
  };

  /* Persist active scene across in-app navigation */
  useEffect(() => {
    try { sessionStorage.setItem('arabiyya_hiwar_scene', activeScene); }
    catch {}
  }, [activeScene]);

  /* Save scroll on unmount, restore on mount */
  useEffect(() => {
    const saved = (() => {
      try { return parseInt(sessionStorage.getItem('arabiyya_hiwar_scroll') || '0', 10); }
      catch { return 0; }
    })();
    if (saved > 0) {
      /* rAF runs after navigate's scrollTo, overriding it with instant scroll */
      requestAnimationFrame(() => window.scrollTo({ top: saved }));
    }
    return () => {
      try { sessionStorage.setItem('arabiyya_hiwar_scroll', window.scrollY); }
      catch {}
    };
  }, []);

  /* Scroll to a scene card + set active */
  const scrollToScene = (si) => {
    setActiveScene(si);
    requestAnimationFrame(() => {
      const el = document.getElementById(`hiwar-scene-${si}`);
      if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 96, behavior: 'smooth' });
    });
  };

  /* Stop speech on unmount */
  useEffect(() => () => {
    playAllRef.current = false;
    if (window.stopSpeech) window.stopSpeech();
  }, []);

  /* Mark hiwar complete when page mounts */
  useEffect(() => {
    if (progress && progress.completeSection) {
      progress.completeSection('3', 'hiwar', hiwar.scenes.length, hiwar.scenes.length);
    }
  }, []);

  const isPlayingAll = playingKey !== null && allLines.some(l => l.key === playingKey && playAllRef.current);

  return (
    <div className="page anim-in">
      <a onClick={() => navigate('chapter/3')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 16 }}>
        <Icon name="chevron-left" size={16} /> Bab 3 — Menjenguk Orang Sakit
      </a>

      {/* Header */}
      <div className="page-header-flex" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 32, flexWrap: 'wrap' }}>

        {/* LEFT: keterangan */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Badge tone="primary" icon="book">عِيَادَةُ الْمَرِيضِ</Badge>
            <Badge tone="neutral">Bab 3</Badge>
          </div>
          <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.75, margin: 0 }}>
            Percakapan ini menggambarkan adegan <strong>menjenguk orang sakit</strong>.
            Umar <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 17 }}>(أ)</span> mengunjungi
            sahabatnya Ahmad <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 17 }}>(ب)</span> yang
            sedang sakit — dimulai dari salam pembuka, menanyakan kabar dan keluhan, memberi saran ke dokter,
            hingga mendoakan kesembuhan dan berpamitan.
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 10 }}>
            Tekan <strong>🔊</strong> pada setiap baris untuk mendengar pengucapannya.
          </p>
        </div>

        {/* RIGHT: judul + kontrol */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <h1 lang="ar" style={{ fontFamily: 'var(--font-arabic)', color: 'var(--color-primary)', fontSize: 44, fontWeight: 700, direction: 'rtl', margin: 0, lineHeight: 1.2 }}>الْحِوَار</h1>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 2 }}>Dialog · Hiwar</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={showTranslation} onChange={e => setShowTranslation(e.target.checked)}
                     style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }} />
              Terjemahan
            </label>
            <Button variant="primary" icon={playAllRef.current ? 'pause' : 'play'} size="sm" onClick={playAll}>
              {playAllRef.current ? 'Stop' : 'Putar Semua'}
            </Button>
          </div>
        </div>
      </div>

      {/* Layout: scenes + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }} className="hiwar-layout">

        {/* LEFT: Scene cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {hiwar.scenes.map((scene, si) => {
            const isActive = activeScene === si;
            return (
              <div key={scene.id} id={`hiwar-scene-${si}`} onClick={() => setActiveScene(si)}>
                <div style={{
                  borderRadius: 22, overflow: 'hidden',
                  background: 'var(--color-surface)',
                  boxShadow: isActive ? 'var(--shadow-hover)' : 'var(--shadow-card)',
                  border: isActive ? '2px solid var(--color-secondary)' : '2px solid transparent',
                  transition: 'all var(--dur-med) var(--ease-out)',
                }}>

                  {/* Top: header band */}
                  <div style={{
                    background: isActive
                      ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)'
                      : 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-border) 100%)',
                    padding: '16px 20px',
                    transition: 'background var(--dur-med) var(--ease-out)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 999,
                          background: isActive ? 'rgba(255,255,255,.2)' : 'var(--color-border)',
                          color: isActive ? '#fff' : 'var(--color-text-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 14,
                        }}>{si + 1}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: isActive ? '#fff' : 'var(--color-text-primary)' }}>{scene.label}</div>
                          <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 15, color: isActive ? 'rgba(255,255,255,.75)' : 'var(--color-text-light)', direction: 'rtl' }}>{scene.label_ar}</div>
                        </div>
                      </div>
                      <Badge tone={isActive ? 'gold' : 'neutral'} icon="message">{scene.lines.length} dialog</Badge>
                    </div>
                  </div>

                  {/* Scene illustration */}
                  {scene.illustration_ref && (
                    <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)', padding: '12px 16px' }}>
                      <img
                        src={scene.illustration_ref}
                        alt={scene.label}
                        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 10 }}
                      />
                    </div>
                  )}

                  {/* Dialogue bubbles */}
                  <div style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {scene.lines.map((line, li) => {
                        const lineKey = `${si}-${li}`;
                        /* أ = kanan (RTL convention), ب = kiri */
                        const isRight   = line.speaker === 'أ';
                        const isPlaying = playingKey === lineKey;

                        return (
                          <div key={lineKey} id={`hiwar-line-${lineKey}`} style={{
                            display: 'flex',
                            flexDirection: isRight ? 'row-reverse' : 'row',
                            gap: 10, alignItems: 'flex-start',
                          }}>
                            {/* Speaker avatar */}
                            <div style={{
                              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                              background: isRight ? 'var(--color-primary)' : 'var(--color-accent)',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 16,
                              marginTop: 4,
                            }}>{line.speaker}</div>

                            {/* Bubble */}
                            <div style={{
                              background: isPlaying
                                ? (isRight ? 'var(--color-primary-100)' : 'var(--color-accent-100)')
                                : (isRight ? 'var(--color-primary-50)'  : 'var(--color-accent-50)'),
                              border: `1.5px solid ${isPlaying ? (isRight ? 'var(--color-secondary)' : 'var(--color-accent)') : 'var(--color-border)'}`,
                              borderRadius: isRight ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                              padding: '12px 14px', maxWidth: '80%',
                              transition: 'all var(--dur-med) var(--ease-out)',
                            }}>
                              <div lang="ar" style={{
                                fontFamily: 'var(--font-arabic)', fontSize: 20, fontWeight: 600,
                                color: 'var(--color-text-primary)', direction: 'rtl', textAlign: 'right',
                                lineHeight: 1.9, marginBottom: showTranslation ? 6 : 0,
                              }}>{line.ar}</div>
                              {showTranslation && (
                                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                  {line.id}
                                </div>
                              )}
                            </div>

                            {/* Audio button */}
                            <button onClick={e => { e.stopPropagation(); playLine(lineKey, line.audio_text, line.audio_ref); }}
                              aria-label="Putar audio"
                              style={{
                                width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                                border: 'none', cursor: 'pointer',
                                background: isPlaying ? 'var(--color-primary)' : 'transparent',
                                color: isPlaying ? '#fff' : 'var(--color-primary)',
                                border: isPlaying ? 'none' : '1.5px solid var(--color-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all var(--dur-fast)',
                                marginTop: 10,
                              }}>
                              <Icon name={isPlaying ? 'pause' : 'play'} size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="hiwar-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>

          <Card padding={16}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--color-text-secondary)' }}>Adegan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hiwar.scenes.map((s, si) => (
                <button key={si} onClick={() => scrollToScene(si)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 10, border: 'none',
                    background: activeScene === si ? 'var(--color-primary-50)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 999,
                    background: activeScene === si ? 'var(--color-primary)' : 'var(--color-border)',
                    color: activeScene === si ? '#fff' : 'var(--color-text-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 12, flexShrink: 0,
                  }}>{si + 1}</div>
                  <span style={{ fontSize: 13, fontWeight: activeScene === si ? 700 : 500, color: activeScene === si ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card padding={16}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Kosakata Kunci</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hiwar.vocab.map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < hiwar.vocab.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 18, fontWeight: 600, color: 'var(--color-primary)', direction: 'rtl' }}>{w.ar}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'right', flex: 1, marginLeft: 8 }}>{w.id}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding={16}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Progress</div>
            <ProgressBar value={100} label="Dialog ini" color="success" size="sm" />
            <div style={{ marginTop: 14 }}>
              <Button variant="secondary" iconRight="chevron-right"
                onClick={() => navigate('chapter/3/mufrodat')}
                size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                Lanjut ke Mufrodat
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile-only footer: lanjut button + scene nav (sidebar hidden at ≤640px) */}
      <div className="hiwar-mobile-footer" style={{ display: 'none', marginTop: 24, flexDirection: 'column', gap: 16 }}>

        {/* Lanjut button — tampil dulu sebelum scene pills */}
        <div style={{
          padding: '14px 16px', borderRadius: 16,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}>
          <div>
            <ProgressBar value={100} label="Dialog ini" color="success" size="sm" />
          </div>
          <Button variant="primary" iconRight="chevron-right" onClick={() => navigate('chapter/3/mufrodat')}>
            Lanjut ke Mufrodat
          </Button>
        </div>

        {/* Scene jump pills */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Adegan</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hiwar.scenes.map((s, si) => (
              <button key={si} onClick={() => scrollToScene(si)}
                style={{
                  padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: activeScene === si ? 'var(--color-primary)' : 'var(--color-border)',
                  color: activeScene === si ? '#fff' : 'var(--color-text-secondary)',
                  fontWeight: activeScene === si ? 700 : 500, fontSize: 13,
                }}>
                {si + 1}. {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.HiwarScreen = HiwarScreen;
