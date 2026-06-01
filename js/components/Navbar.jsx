/* Navbar — Adaptive top navigation */

function LogoMenu({ navigate, route, variant = 'inline' }) {
  const { useState, useEffect, useRef } = React;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const chapters = [
    { id: 'soon-1',    num: 1, ar: 'الرِّيَاضَة',           idLabel: 'Olahraga',             status: 'soon' },
    { id: 'soon-2',    num: 2, ar: 'أَصْحَابُ الْمِهْنَة',  idLabel: 'Para Pekerja Profesi', status: 'soon' },
    { id: 'chapter/3', num: 3, ar: 'عِيَادَةُ الْمَرِيضِ', idLabel: 'Menjenguk Orang Sakit', status: 'available' },
  ];

  const isFloating = variant === 'floating';

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Menu bab"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          height: 48, padding: '0 14px 0 6px',
          background: isFloating ? 'var(--color-surface)' : 'transparent',
          border: isFloating ? '1px solid var(--color-border)' : 'none',
          borderRadius: 14, cursor: 'pointer',
          boxShadow: isFloating ? '0 8px 22px -8px rgba(15,118,110,.25)' : 'none',
          transition: 'background 160ms, box-shadow 160ms',
        }}
        onMouseEnter={e => { if (!isFloating) e.currentTarget.style.background = 'var(--color-primary-50)'; }}
        onMouseLeave={e => { if (!isFloating) e.currentTarget.style.background = 'transparent'; }}
      >
        <img src="assets/images/logo-mark.svg" width="40" height="40" alt="" style={{ display: 'block', borderRadius: 10 }} />
        <span className="nav-logo-text" style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 19, color: 'var(--color-primary)', lineHeight: 1 }}>
          العربية التفاعلية
        </span>
        <Icon name="chevron-right" size={16} color="var(--color-text-light)" style={{ transform: open ? 'rotate(270deg)' : 'rotate(90deg)', transition: 'transform 200ms' }} />
      </button>

      {open && (
        <div className="anim-in" style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          minWidth: 'min(360px, calc(100vw - 32px))', background: 'var(--color-surface)', borderRadius: 16,
          boxShadow: 'var(--shadow-modal)', border: '1px solid var(--color-border)',
          padding: 8, zIndex: 40,
        }}>
          <button onClick={() => { setOpen(false); navigate('home'); }}
            style={{
              width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
              background: route === 'home' ? 'var(--color-primary-50)' : 'transparent',
              padding: '12px 14px', borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 14,
              color: route === 'home' ? 'var(--color-primary)' : 'var(--color-text-primary)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-50)'}
            onMouseLeave={e => e.currentTarget.style.background = route === 'home' ? 'var(--color-primary-50)' : 'transparent'}
          >
            <Icon name="home" size={18} /><span>Beranda</span>
          </button>

          <div style={{ height: 1, background: 'var(--color-border)', margin: '6px 8px' }} />
          <div style={{ padding: '4px 14px 6px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-light)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Daftar Bab
          </div>

          {chapters.map(c => {
            const active = route.startsWith(c.id) && c.status === 'available';
            const locked = c.status !== 'available';
            return (
              <button key={c.id} disabled={locked}
                onClick={() => { setOpen(false); if (!locked) navigate(c.id); }}
                style={{
                  width: '100%', textAlign: 'left', border: 'none',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  background: active ? 'var(--color-primary-50)' : 'transparent',
                  padding: '10px 14px', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 12,
                  opacity: locked ? 0.55 : 1, fontFamily: 'var(--font-latin)',
                }}
                onMouseEnter={e => { if (!locked) e.currentTarget.style.background = 'var(--color-primary-50)'; }}
                onMouseLeave={e => { if (!locked) e.currentTarget.style.background = active ? 'var(--color-primary-50)' : 'transparent'; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: active ? 'linear-gradient(180deg, var(--color-primary), var(--color-primary-hover))' : 'var(--color-bg)',
                  color: active ? '#fff' : 'var(--color-text-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 18, flexShrink: 0,
                }}>
                  {['١', '٢', '٣'][c.num - 1]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 18, color: active ? 'var(--color-primary)' : 'var(--color-text-primary)', lineHeight: 1.2 }}>{c.ar}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Bab {c.num} · {c.idLabel}</div>
                </div>
                {locked ? <Badge tone="locked" icon="lock">Soon</Badge>
                  : active ? <Icon name="check-circle" size={18} color="var(--color-success)" />
                  : <Icon name="chevron-right" size={16} color="var(--color-text-light)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatChips({ xp, streak, floating = false, darkMode = false, onToggleDark = null, user = null, nickname = null, onLogout = null }) {
  const { useState, useRef, useEffect } = React;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNickPopup,  setShowNickPopup]  = useState(false);
  const [showXpPopup,   setShowXpPopup]    = useState(false);
  const [showStrPopup,  setShowStrPopup]   = useState(false);
  const nickRef = useRef(null);
  const xpRef   = useRef(null);
  const strRef  = useRef(null);

  /* Tutup semua popup saat klik di luar */
  useEffect(() => {
    const anyOpen = showNickPopup || showXpPopup || showStrPopup;
    if (!anyOpen) return;
    const close = (e) => {
      if (nickRef.current && !nickRef.current.contains(e.target)) setShowNickPopup(false);
      if (xpRef.current  && !xpRef.current.contains(e.target))   setShowXpPopup(false);
      if (strRef.current && !strRef.current.contains(e.target))   setShowStrPopup(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); };
  }, [showNickPopup, showXpPopup, showStrPopup]);

  const chipStyle = floating
    ? { height: 40, padding: '0 14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px -3px rgba(0,0,0,.06)' }
    : { height: 36, padding: '0 10px' };

  const popupStyle = {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 14, padding: '12px 16px', minWidth: 180,
    boxShadow: 'var(--shadow-modal)', zIndex: 50, whiteSpace: 'nowrap',
  };

  return (
    <>
      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 20, padding: 28, maxWidth: 320, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)' }}>Keluar dari akun?</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Progress belajarmu tersimpan. Kamu bisa masuk kembali kapan saja.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ padding: '10px 20px', borderRadius: 12, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>Batal</button>
              <button onClick={() => { setShowLogoutConfirm(false); onLogout(); }} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: 'var(--color-error)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}

      <div className="stat-chips" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* XP chip */}
        <div ref={xpRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowXpPopup(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 999,
              ...chipStyle, background: floating ? 'var(--color-surface)' : 'var(--color-accent-50)', color: 'var(--color-amber-text)',
              fontFamily: 'var(--font-latin)', fontWeight: 700, fontSize: floating ? 14 : 13,
              border: floating ? '1px solid var(--color-border)' : 'none', cursor: 'pointer',
            }}>
            <Icon name="trophy" size={floating ? 15 : 14} color="var(--color-accent)" />
            <span className="stat-chip-val">{xp}&nbsp;XP</span>
          </button>
          {showXpPopup && (
            <div className="anim-in" style={popupStyle}>
              <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 4 }}>Total XP kamu</div>
              <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--color-amber-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="trophy" size={20} color="var(--color-accent)" /> {xp} XP
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>Kumpulkan lebih banyak XP dengan menjawab soal dengan benar.</div>
            </div>
          )}
        </div>

        {/* Streak chip */}
        <div ref={strRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowStrPopup(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 999,
              ...chipStyle, background: floating ? 'var(--color-surface)' : 'var(--color-accent-50)', color: 'var(--color-amber-text)',
              fontFamily: 'var(--font-latin)', fontWeight: 700, fontSize: floating ? 14 : 13,
              border: floating ? '1px solid var(--color-border)' : 'none', cursor: 'pointer',
            }}>
            <Icon name="flame" size={floating ? 15 : 14} color="#F97316" />
            <span className="stat-chip-val">{streak}</span>
          </button>
          {showStrPopup && (
            <div className="anim-in" style={popupStyle}>
              <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 4 }}>Streak belajar</div>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#F97316', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="flame" size={20} color="#F97316" /> {streak} hari
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>Buka aplikasi setiap hari untuk menjaga streak-mu!</div>
            </div>
          )}
        </div>

        {onToggleDark && (
          <button onClick={onToggleDark} aria-label="Toggle dark mode"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: floating ? 40 : 36, height: floating ? 40 : 36,
              borderRadius: 999, border: '1px solid var(--color-border)',
              background: 'var(--color-surface)', cursor: 'pointer', fontSize: 16,
              color: 'var(--color-text-secondary)',
            }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        )}
        {user && nickname && (
          <div ref={nickRef} style={{ position: 'relative' }}>
            <button onClick={() => setShowNickPopup(v => !v)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                height: floating ? 40 : 36, padding: '0 10px',
                borderRadius: 999, background: floating ? 'var(--color-surface)' : 'var(--color-primary-50)',
                border: floating ? '1px solid var(--color-border)' : 'none',
                color: 'var(--color-primary)', fontFamily: 'var(--font-latin)',
                fontWeight: 600, fontSize: floating ? 14 : 13, cursor: 'pointer',
              }}>
              {user.photoURL
                ? <img src={user.photoURL} width="24" height="24" style={{ borderRadius: '50%', flexShrink: 0 }} alt="" />
                : <span style={{ fontSize: 16 }}>👤</span>}
              <span className="nav-nickname-text">{nickname}</span>
            </button>
            {/* Popup username — muncul saat avatar diklik di mobile */}
            {showNickPopup && (
              <div className="anim-in" style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 14, padding: '12px 16px', minWidth: 200,
                boxShadow: 'var(--shadow-modal)', zIndex: 50, whiteSpace: 'nowrap',
              }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 4 }}>Masuk sebagai</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-primary)' }}>{nickname}</div>
                {user.email && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{user.email}</div>}
              </div>
            )}
          </div>
        )}
        {!user && onLogout && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="nav-guest-text" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: floating ? 40 : 36, padding: '0 12px',
              borderRadius: 999, background: floating ? 'var(--color-surface)' : 'var(--color-border)',
              border: floating ? '1px solid var(--color-border)' : 'none',
              color: 'var(--color-text-secondary)', fontFamily: 'var(--font-latin)',
              fontWeight: 600, fontSize: floating ? 13 : 12,
            }}>
              👤 Mode Tamu
            </span>
            <button onClick={onLogout} title="Masuk dengan akun"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: floating ? 40 : 36, padding: '0 12px',
                borderRadius: 999, border: '1px solid var(--color-primary)',
                background: 'var(--color-primary)', cursor: 'pointer',
                fontFamily: 'var(--font-latin)', fontWeight: 600,
                fontSize: floating ? 13 : 12, color: '#fff',
              }}>
              Masuk
            </button>
          </div>
        )}
        {onLogout && user && (
          <button onClick={() => setShowLogoutConfirm(true)} title="Keluar"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              height: floating ? 40 : 36, padding: '0 10px',
              borderRadius: 999, border: '1px solid var(--color-border)',
              background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 13,
              color: 'var(--color-text-secondary)',
            }}>
            <Icon name="log-out" size={15} />
            <span className="nav-logout-text">Keluar</span>
          </button>
        )}
      </div>
    </>
  );
}

function ChapterNav({ route, navigate, xp, streak, darkMode, onToggleDark, user, nickname, onLogout }) {
  const m = route.match(/^chapter\/(\d+)(?:\/(.+))?$/);
  if (!m) return null;
  const chapterNum = m[1];
  const sectionId = m[2] || 'index';

  const sections = [
    { id: 'index',      label: `Bab ${chapterNum}`,  icon: 'home',    to: `chapter/${chapterNum}` },
    { id: 'hiwar',      label: 'Hiwar',              icon: 'message', to: `chapter/${chapterNum}/hiwar` },
    { id: 'mufrodat',   label: 'Mufrodat',           icon: 'layers',  to: `chapter/${chapterNum}/mufrodat` },
    { id: 'tadribat-1', label: 'Tadribat 1',         icon: 'edit',    to: `chapter/${chapterNum}/tadribat-1` },
    { id: 'qawaid',     label: 'Qawaid',             icon: 'book',    to: `chapter/${chapterNum}/qawaid` },
    { id: 'tadribat-2', label: 'Tadribat 2',         icon: 'edit',    to: `chapter/${chapterNum}/tadribat-2` },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      {/* Row 1: logo + stat chips */}
      <div className="nav-row1" style={{
        maxWidth: 'var(--layout-max)', margin: '0 auto', padding: '0 24px',
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <LogoMenu navigate={navigate} route={route} />
        <StatChips xp={xp} streak={streak} darkMode={darkMode} onToggleDark={onToggleDark} user={user} nickname={nickname} onLogout={onLogout} />
      </div>

      {/* Row 2: section nav — full width, always visible */}
      <div className="nav-row2" style={{ maxWidth: 'var(--layout-max)', margin: '0 auto', padding: '0 24px' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 2,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {sections.map(s => {
            const active = s.id === sectionId;
            return (
              <a key={s.id} onClick={() => navigate(s.to)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  height: 40, padding: '0 12px', borderRadius: 10,
                  fontFamily: 'var(--font-latin)', fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  background: active ? 'var(--color-primary-50)' : 'transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 160ms', flexShrink: 0,
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-primary)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}}
              >
                <Icon name={s.icon} size={16} />
                <span className="nav-section-label">{s.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function FloatingTop({ route, navigate, xp, streak, darkMode, onToggleDark, user, nickname, onLogout }) {
  return (
    <div style={{ position: 'fixed', top: 20, left: 0, right: 0, zIndex: 30, pointerEvents: 'none' }}>
      <div style={{
        maxWidth: 'var(--layout-max)', margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <LogoMenu navigate={navigate} route={route} variant="floating" />
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <StatChips xp={xp} streak={streak} floating darkMode={darkMode} onToggleDark={onToggleDark} user={user} nickname={nickname} onLogout={onLogout} />
        </div>
      </div>
    </div>
  );
}

function Navbar({ route, navigate, xp = 0, streak = 1, darkMode = false, onToggleDark, user = null, nickname = null, onLogout }) {
  if (route === 'home') return <FloatingTop route={route} navigate={navigate} xp={xp} streak={streak} darkMode={darkMode} onToggleDark={onToggleDark} user={user} nickname={nickname} onLogout={onLogout} />;
  if (route.startsWith('chapter/')) return <ChapterNav route={route} navigate={navigate} xp={xp} streak={streak} darkMode={darkMode} onToggleDark={onToggleDark} user={user} nickname={nickname} onLogout={onLogout} />;
  return null;
}

window.LogoMenu = LogoMenu;
window.StatChips = StatChips;
window.Navbar = Navbar;
