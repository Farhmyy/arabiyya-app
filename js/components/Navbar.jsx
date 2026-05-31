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
          background: isFloating ? '#fff' : 'transparent',
          border: isFloating ? '1px solid var(--color-border)' : 'none',
          borderRadius: 14, cursor: 'pointer',
          boxShadow: isFloating ? '0 8px 22px -8px rgba(15,118,110,.25)' : 'none',
          transition: 'background 160ms, box-shadow 160ms',
        }}
        onMouseEnter={e => { if (!isFloating) e.currentTarget.style.background = '#F0FDFA'; }}
        onMouseLeave={e => { if (!isFloating) e.currentTarget.style.background = 'transparent'; }}
      >
        <img src="assets/images/logo-mark.svg" width="40" height="40" alt="" style={{ display: 'block', borderRadius: 10 }} />
        <span style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 19, color: 'var(--color-primary)', lineHeight: 1 }}>
          العربية التفاعلية
        </span>
        <Icon name="chevron-right" size={16} color="#94A3B8" style={{ transform: open ? 'rotate(270deg)' : 'rotate(90deg)', transition: 'transform 200ms' }} />
      </button>

      {open && (
        <div className="anim-in" style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          minWidth: 360, background: '#fff', borderRadius: 16,
          boxShadow: 'var(--shadow-modal)', border: '1px solid var(--color-border)',
          padding: 8, zIndex: 40,
        }}>
          <button onClick={() => { setOpen(false); navigate('home'); }}
            style={{
              width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
              background: route === 'home' ? '#F0FDFA' : 'transparent',
              padding: '12px 14px', borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 14,
              color: route === 'home' ? 'var(--color-primary)' : 'var(--color-text-primary)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F0FDFA'}
            onMouseLeave={e => e.currentTarget.style.background = route === 'home' ? '#F0FDFA' : 'transparent'}
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
                  background: active ? '#F0FDFA' : 'transparent',
                  padding: '10px 14px', borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 12,
                  opacity: locked ? 0.55 : 1, fontFamily: 'var(--font-latin)',
                }}
                onMouseEnter={e => { if (!locked) e.currentTarget.style.background = '#F0FDFA'; }}
                onMouseLeave={e => { if (!locked) e.currentTarget.style.background = active ? '#F0FDFA' : 'transparent'; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: active ? 'linear-gradient(180deg, var(--color-primary), var(--color-primary-hover))' : '#F1F5F9',
                  color: active ? '#fff' : '#94A3B8',
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
                  : <Icon name="chevron-right" size={16} color="#94A3B8" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatChips({ xp, streak, floating = false, darkMode = false, onToggleDark = null, user = null, nickname = null, onLogout = null }) {
  const chipStyle = floating
    ? { height: 40, padding: '0 14px', background: '#fff', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px -3px rgba(0,0,0,.06)' }
    : { height: 36, padding: '0 12px' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999,
        ...chipStyle, background: floating ? '#fff' : '#FFFBEB', color: '#92400E',
        fontFamily: 'var(--font-latin)', fontWeight: 700, fontSize: floating ? 14 : 13,
      }}>
        <Icon name="trophy" size={floating ? 15 : 14} color="#F59E0B" /> {xp}&nbsp;XP
      </span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999,
        ...chipStyle, background: floating ? '#fff' : '#FFF7ED', color: '#9A3412',
        fontFamily: 'var(--font-latin)', fontWeight: 700, fontSize: floating ? 14 : 13,
      }}>
        <Icon name="flame" size={floating ? 15 : 14} color="#F97316" /> {streak}
      </span>
      {onToggleDark && (
        <button onClick={onToggleDark} aria-label="Toggle dark mode"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: floating ? 40 : 36, height: floating ? 40 : 36,
            borderRadius: 999, border: '1px solid var(--color-border)',
            background: floating ? '#fff' : 'var(--color-surface)',
            cursor: 'pointer', fontSize: 16,
            color: 'var(--color-text-secondary)',
          }}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      )}
      {user && nickname && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: floating ? 40 : 36, padding: '0 12px',
          borderRadius: 999, background: floating ? '#fff' : 'var(--color-primary-50)',
          border: floating ? '1px solid var(--color-border)' : 'none',
          color: 'var(--color-primary)', fontFamily: 'var(--font-latin)',
          fontWeight: 600, fontSize: floating ? 14 : 13,
        }}>
          {user.photoURL
            ? <img src={user.photoURL} width="22" height="22" style={{ borderRadius: '50%' }} alt="" />
            : <span style={{ fontSize: 16 }}>👤</span>}
          {nickname}
        </div>
      )}
      {onLogout && user && (
        <button onClick={onLogout} title="Logout"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: floating ? 40 : 36, height: floating ? 40 : 36,
            borderRadius: 999, border: '1px solid var(--color-border)',
            background: 'transparent', cursor: 'pointer', fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}>
          ⏏️
        </button>
      )}
    </div>
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
    { id: 'tadribat-2', label: 'Tadribat 2',         icon: 'target',  to: `chapter/${chapterNum}/tadribat-2` },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        maxWidth: 'var(--layout-max)', margin: '0 auto', padding: '0 24px',
        height: 72, display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <LogoMenu navigate={navigate} route={route} />
        <div style={{ width: 1, height: 32, background: 'var(--color-border)', flexShrink: 0 }} />

        <nav style={{
          flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4,
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
                  background: active ? '#F0FDFA' : 'transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 160ms', flexShrink: 0,
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = 'var(--color-primary)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}}
              >
                <Icon name={s.icon} size={16} />{s.label}
              </a>
            );
          })}
        </nav>

        <StatChips xp={xp} streak={streak} darkMode={darkMode} onToggleDark={onToggleDark} user={user} nickname={nickname} onLogout={onLogout} />
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
