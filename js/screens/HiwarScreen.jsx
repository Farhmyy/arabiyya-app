/* HiwarScreen — Dialog / Conversation (الْحِوَار) */

function HiwarScreen({ navigate, progress }) {
  const { useState, useEffect, useRef } = React;
  const { hiwar } = DATA;

  const [showTranslation, setShowTranslation] = useState(true);
  const [playingKey, setPlayingKey]           = useState(null);
  const [activeScene, setActiveScene]         = useState(0);
  const playAllRef = useRef(false); // tracks whether "Putar Semua" is running

  const allLines = hiwar.scenes.flatMap((scene, si) =>
    scene.lines.map((line, li) => ({ ...line, key: `${si}-${li}` }))
  );

  const playLine = (key, audioText, audioRef) => {
    if (window.stopSpeech) window.stopSpeech();
    if (playingKey === key) { setPlayingKey(null); return; }
    setPlayingKey(key);
    window.speakArabic(audioText, audioRef, () => setPlayingKey(null));
  };

  const playAll = () => {
    if (playAllRef.current) {
      playAllRef.current = false;
      if (window.stopSpeech) window.stopSpeech();
      setPlayingKey(null);
      return;
    }
    playAllRef.current = true;

    const playNext = (i) => {
      if (!playAllRef.current || i >= allLines.length) {
        playAllRef.current = false;
        setPlayingKey(null);
        return;
      }
      const line = allLines[i];
      setPlayingKey(line.key);
      window.speakArabic(line.audio_text, line.audio_ref, () => {
        setTimeout(() => playNext(i + 1), 400);
      });
    };
    playNext(0);
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
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 lang="ar" style={{ fontFamily: 'var(--font-arabic)', color: 'var(--color-primary)', fontSize: 40, fontWeight: 600, direction: 'rtl', textAlign: 'right', margin: 0 }}>الْحِوَار</h1>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>Dialog · Hiwar</div>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>
            Dengarkan percakapan antara Umar dan Ahmad. Tekan 🔊 untuk mendengar setiap kalimat.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
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

      {/* Layout: scenes + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }} className="hiwar-layout">

        {/* LEFT: Scene cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {hiwar.scenes.map((scene, si) => {
            const isActive = activeScene === si;
            return (
              <div key={scene.id} onClick={() => setActiveScene(si)}>
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
                      ? 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)'
                      : 'linear-gradient(135deg, #F0FDFA 0%, #E2E8F0 100%)',
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

                  {/* Dialogue bubbles */}
                  <div style={{
                    padding: '20px 22px',
                    background: isActive ? '#FAFFFE' : 'var(--color-surface)',
                    transition: 'background var(--dur-med) var(--ease-out)',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {scene.lines.map((line, li) => {
                        const lineKey = `${si}-${li}`;
                        const isLeft  = line.side === 'left';
                        const isPlaying = playingKey === lineKey;

                        return (
                          <div key={lineKey} style={{
                            display: 'flex',
                            flexDirection: isLeft ? 'row' : 'row-reverse',
                            gap: 10, alignItems: 'flex-start',
                          }}>
                            {/* Speaker avatar */}
                            <div style={{
                              width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                              background: isLeft ? 'var(--color-primary)' : 'var(--color-accent)',
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 16,
                              marginTop: 4,
                            }}>{line.speaker}</div>

                            {/* Bubble */}
                            <div style={{
                              background: isPlaying
                                ? (isLeft ? '#CCFBF1' : '#FEF3C7')
                                : (isLeft ? '#F0FDFA'  : '#FFFBEB'),
                              border: `1.5px solid ${isPlaying ? (isLeft ? 'var(--color-secondary)' : 'var(--color-accent)') : 'var(--color-border)'}`,
                              borderRadius: isLeft ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
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
                                background: isPlaying ? 'var(--color-primary)' : '#E2E8F0',
                                color: isPlaying ? '#fff' : 'var(--color-text-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all var(--dur-fast)',
                                marginTop: 10,
                              }}>
                              <Icon name={isPlaying ? 'pause' : 'volume-2'} size={16} />
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
                <button key={si} onClick={() => setActiveScene(si)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 10, border: 'none',
                    background: activeScene === si ? '#F0FDFA' : 'transparent',
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
    </div>
  );
}

window.HiwarScreen = HiwarScreen;
