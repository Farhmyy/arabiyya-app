/* Navbar — Adaptive top navigation */

function LogoMenu({
  navigate,
  route,
  variant = 'inline'
}) {
  const {
    useState,
    useEffect,
    useRef
  } = React;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const chapters = [{
    id: 'soon-1',
    num: 1,
    ar: 'الرِّيَاضَة',
    idLabel: 'Olahraga',
    status: 'soon'
  }, {
    id: 'soon-2',
    num: 2,
    ar: 'أَصْحَابُ الْمِهْنَة',
    idLabel: 'Para Pekerja Profesi',
    status: 'soon'
  }, {
    id: 'chapter/3',
    num: 3,
    ar: 'عِيَادَةُ الْمَرِيضِ',
    idLabel: 'Menjenguk Orang Sakit',
    status: 'available'
  }];
  const isFloating = variant === 'floating';
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      position: 'relative',
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    "aria-expanded": open,
    "aria-label": "Menu bab",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      height: 48,
      padding: '0 14px 0 6px',
      background: isFloating ? 'var(--color-surface)' : 'transparent',
      border: isFloating ? '1px solid var(--color-border)' : 'none',
      borderRadius: 14,
      cursor: 'pointer',
      boxShadow: isFloating ? '0 8px 22px -8px rgba(15,118,110,.25)' : 'none',
      transition: 'background 160ms, box-shadow 160ms'
    },
    onMouseEnter: e => {
      if (!isFloating) e.currentTarget.style.background = 'var(--color-primary-50)';
    },
    onMouseLeave: e => {
      if (!isFloating) e.currentTarget.style.background = 'transparent';
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/images/logo-mark.svg",
    width: "40",
    height: "40",
    alt: "",
    style: {
      display: 'block',
      borderRadius: 10
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-logo-text",
    style: {
      fontFamily: 'var(--font-arabic)',
      fontWeight: 700,
      fontSize: 19,
      color: 'var(--color-primary)',
      lineHeight: 1
    }
  }, "\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629"), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16,
    color: "var(--color-text-light)",
    style: {
      transform: open ? 'rotate(270deg)' : 'rotate(90deg)',
      transition: 'transform 200ms'
    }
  })), open && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      minWidth: 'min(360px, calc(100vw - 32px))',
      background: 'var(--color-surface)',
      borderRadius: 16,
      boxShadow: 'var(--shadow-modal)',
      border: '1px solid var(--color-border)',
      padding: 8,
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setOpen(false);
      navigate('home');
    },
    style: {
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: route === 'home' ? 'var(--color-primary-50)' : 'transparent',
      padding: '12px 14px',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 14,
      color: route === 'home' ? 'var(--color-primary)' : 'var(--color-text-primary)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--color-primary-50)',
    onMouseLeave: e => e.currentTarget.style.background = route === 'home' ? 'var(--color-primary-50)' : 'transparent'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "home",
    size: 18
  }), /*#__PURE__*/React.createElement("span", null, "Beranda")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--color-border)',
      margin: '6px 8px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 14px 6px',
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--color-text-light)',
      letterSpacing: '.08em',
      textTransform: 'uppercase'
    }
  }, "Daftar Bab"), chapters.map(c => {
    const active = route.startsWith(c.id) && c.status === 'available';
    const locked = c.status !== 'available';
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      disabled: locked,
      onClick: () => {
        setOpen(false);
        if (!locked) navigate(c.id);
      },
      style: {
        width: '100%',
        textAlign: 'left',
        border: 'none',
        cursor: locked ? 'not-allowed' : 'pointer',
        background: active ? 'var(--color-primary-50)' : 'transparent',
        padding: '10px 14px',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: locked ? 0.55 : 1,
        fontFamily: 'var(--font-latin)'
      },
      onMouseEnter: e => {
        if (!locked) e.currentTarget.style.background = 'var(--color-primary-50)';
      },
      onMouseLeave: e => {
        if (!locked) e.currentTarget.style.background = active ? 'var(--color-primary-50)' : 'transparent';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: active ? 'linear-gradient(180deg, var(--color-primary-bg), var(--color-primary-hover))' : 'var(--color-bg)',
        color: active ? '#fff' : 'var(--color-text-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-arabic)',
        fontWeight: 700,
        fontSize: 18,
        flexShrink: 0
      }
    }, ['١', '٢', '٣'][c.num - 1]), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-arabic)',
        fontWeight: 700,
        fontSize: 18,
        color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
        lineHeight: 1.2
      }
    }, c.ar), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        marginTop: 2
      }
    }, "Bab ", c.num, " \xB7 ", c.idLabel)), locked ? /*#__PURE__*/React.createElement(Badge, {
      tone: "locked",
      icon: "lock"
    }, "Soon") : active ? /*#__PURE__*/React.createElement(Icon, {
      name: "check-circle",
      size: 18,
      color: "var(--color-success)"
    }) : /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 16,
      color: "var(--color-text-light)"
    }));
  })));
}
function StatChips({
  xp,
  streak,
  floating = false,
  darkMode = false,
  onToggleDark = null,
  user = null,
  nickname = null,
  onLogout = null
}) {
  const {
    useState,
    useRef,
    useEffect
  } = React;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNickPopup, setShowNickPopup] = useState(false);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [showStrPopup, setShowStrPopup] = useState(false);
  const nickRef = useRef(null);
  const xpRef = useRef(null);
  const strRef = useRef(null);

  /* Tutup semua popup saat klik di luar */
  useEffect(() => {
    const anyOpen = showNickPopup || showXpPopup || showStrPopup;
    if (!anyOpen) return;
    const close = e => {
      if (nickRef.current && !nickRef.current.contains(e.target)) setShowNickPopup(false);
      if (xpRef.current && !xpRef.current.contains(e.target)) setShowXpPopup(false);
      if (strRef.current && !strRef.current.contains(e.target)) setShowStrPopup(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [showNickPopup, showXpPopup, showStrPopup]);
  const chipStyle = floating ? {
    height: 40,
    padding: '0 14px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 12px -3px rgba(0,0,0,.06)'
  } : {
    height: 36,
    padding: '0 10px'
  };
  const popupStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
    padding: '12px 16px',
    minWidth: 180,
    boxShadow: 'var(--shadow-modal)',
    zIndex: 50,
    whiteSpace: 'nowrap'
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, showLogoutConfirm && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.5)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 20,
      padding: 28,
      maxWidth: 320,
      width: '100%',
      textAlign: 'center',
      boxShadow: 'var(--shadow-modal)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 12
    }
  }, "\uD83D\uDC4B"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 8,
      color: 'var(--color-text-primary)'
    }
  }, "Keluar dari akun?"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--color-text-secondary)',
      fontSize: 14,
      marginBottom: 24,
      lineHeight: 1.6
    }
  }, "Progress belajarmu tersimpan. Kamu bisa masuk kembali kapan saja."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowLogoutConfirm(false),
    style: {
      padding: '10px 20px',
      borderRadius: 12,
      border: '1.5px solid var(--color-border)',
      background: 'var(--color-surface)',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--color-text-primary)'
    }
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowLogoutConfirm(false);
      onLogout();
    },
    style: {
      padding: '10px 20px',
      borderRadius: 12,
      border: 'none',
      background: 'var(--color-error)',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: 14
    }
  }, "Ya, Keluar")))), /*#__PURE__*/React.createElement("div", {
    className: "stat-chips",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: xpRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowXpPopup(v => !v),
    "aria-label": `${xp} XP — lihat detail`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      borderRadius: 999,
      ...chipStyle,
      background: floating ? 'var(--color-surface)' : 'var(--color-accent-50)',
      color: 'var(--color-amber-text)',
      fontFamily: 'var(--font-latin)',
      fontWeight: 700,
      fontSize: floating ? 14 : 13,
      border: floating ? '1px solid var(--color-border)' : 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trophy",
    size: floating ? 15 : 14,
    color: "var(--color-accent)"
  }), /*#__PURE__*/React.createElement("span", {
    className: "stat-chip-val"
  }, xp, "\xA0XP")), showXpPopup && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: popupStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-light)',
      marginBottom: 4
    }
  }, "Total XP kamu"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 22,
      color: 'var(--color-amber-text)',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trophy",
    size: 20,
    color: "var(--color-accent)"
  }), " ", xp, " XP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)',
      marginTop: 6
    }
  }, "Kumpulkan lebih banyak XP dengan menjawab soal dengan benar."))), /*#__PURE__*/React.createElement("div", {
    ref: strRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowStrPopup(v => !v),
    "aria-label": `Streak ${streak} hari — lihat detail`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      borderRadius: 999,
      ...chipStyle,
      background: floating ? 'var(--color-surface)' : 'var(--color-accent-50)',
      color: 'var(--color-amber-text)',
      fontFamily: 'var(--font-latin)',
      fontWeight: 700,
      fontSize: floating ? 14 : 13,
      border: floating ? '1px solid var(--color-border)' : 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "flame",
    size: floating ? 15 : 14,
    color: "#F97316"
  }), /*#__PURE__*/React.createElement("span", {
    className: "stat-chip-val"
  }, streak)), showStrPopup && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: popupStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-light)',
      marginBottom: 4
    }
  }, "Streak belajar"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 22,
      color: '#F97316',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "flame",
    size: 20,
    color: "#F97316"
  }), " ", streak, " hari"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)',
      marginTop: 6
    }
  }, "Buka aplikasi setiap hari untuk menjaga streak-mu!"))), onToggleDark && /*#__PURE__*/React.createElement("button", {
    onClick: onToggleDark,
    "aria-label": "Toggle dark mode",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: floating ? 40 : 36,
      height: floating ? 40 : 36,
      borderRadius: 999,
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      cursor: 'pointer',
      fontSize: 16,
      color: 'var(--color-text-secondary)'
    }
  }, darkMode ? '☀️' : '🌙'), user && nickname && /*#__PURE__*/React.createElement("div", {
    ref: nickRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowNickPopup(v => !v),
    "aria-label": `Profil ${nickname}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      height: floating ? 40 : 36,
      padding: '0 10px',
      borderRadius: 999,
      background: floating ? 'var(--color-surface)' : 'var(--color-primary-50)',
      border: floating ? '1px solid var(--color-border)' : 'none',
      color: 'var(--color-primary)',
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: floating ? 14 : 13,
      cursor: 'pointer'
    }
  }, user.photoURL ? /*#__PURE__*/React.createElement("img", {
    src: user.photoURL,
    width: "24",
    height: "24",
    style: {
      borderRadius: '50%',
      flexShrink: 0
    },
    alt: ""
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, "\uD83D\uDC64"), /*#__PURE__*/React.createElement("span", {
    className: "nav-nickname-text"
  }, nickname)), showNickPopup && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      padding: '12px 16px',
      minWidth: 200,
      boxShadow: 'var(--shadow-modal)',
      zIndex: 50,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-light)',
      marginBottom: 4
    }
  }, "Masuk sebagai"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--color-primary)'
    }
  }, nickname), user.email && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)',
      marginTop: 2
    }
  }, user.email))), !user && onLogout && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "nav-guest-text",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: floating ? 40 : 36,
      padding: '0 12px',
      borderRadius: 999,
      background: floating ? 'var(--color-surface)' : 'var(--color-border)',
      border: floating ? '1px solid var(--color-border)' : 'none',
      color: 'var(--color-text-secondary)',
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: floating ? 13 : 12
    }
  }, "\uD83D\uDC64 Mode Tamu"), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    title: "Masuk dengan akun",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: floating ? 40 : 36,
      padding: '0 12px',
      borderRadius: 999,
      border: '1px solid var(--color-primary)',
      background: 'var(--color-primary-bg)',
      cursor: 'pointer',
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: floating ? 13 : 12,
      color: '#fff'
    }
  }, "Masuk")), onLogout && user && /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowLogoutConfirm(true),
    title: "Keluar",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: floating ? 40 : 36,
      padding: '0 10px',
      borderRadius: 999,
      border: '1px solid var(--color-border)',
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 13,
      color: 'var(--color-text-secondary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "log-out",
    size: 15
  }), /*#__PURE__*/React.createElement("span", {
    className: "nav-logout-text"
  }, "Keluar"))));
}
function ChapterNav({
  route,
  navigate,
  xp,
  streak,
  darkMode,
  onToggleDark,
  user,
  nickname,
  onLogout,
  progress
}) {
  const m = route.match(/^chapter\/(\d+)(?:\/(.+))?$/);
  if (!m) return null;
  const chapterNum = m[1];
  const sectionId = m[2] || 'index';
  const sections = [{
    id: 'index',
    label: `Bab ${chapterNum}`,
    icon: 'home',
    to: `chapter/${chapterNum}`
  }, {
    id: 'hiwar',
    label: 'Hiwar',
    icon: 'message',
    to: `chapter/${chapterNum}/hiwar`
  }, {
    id: 'mufrodat',
    label: 'Mufrodat',
    icon: 'layers',
    to: `chapter/${chapterNum}/mufrodat`
  }, {
    id: 'tadribat-1',
    label: 'Tadribat 1',
    icon: 'edit',
    to: `chapter/${chapterNum}/tadribat-1`
  }, {
    id: 'qawaid',
    label: 'Qawaid',
    icon: 'book',
    to: `chapter/${chapterNum}/qawaid`
  }, {
    id: 'tadribat-2',
    label: 'Tadribat 2',
    icon: 'edit',
    to: `chapter/${chapterNum}/tadribat-2`
  }, {
    id: 'imtihan',
    label: 'Imtihan',
    icon: 'award',
    to: `chapter/${chapterNum}/imtihan`
  }];

  /* Sequential lock — same logic as ChapterScreen */
  const SECTION_ORDER = ['hiwar', 'mufrodat', 'tadribat_1', 'qawaid', 'tadribat_2'];
  const ch = progress?.chapters?.[chapterNum] || {};
  const isSectionLocked = id => {
    if (id === 'index' || id === 'hiwar') return false;
    if (id === 'imtihan') {
      return !SECTION_ORDER.every(s => ch[s]?.completed);
    }
    const pk = id.replace('-', '_');
    const idx = SECTION_ORDER.indexOf(pk);
    if (idx <= 0) return false;
    return !ch[SECTION_ORDER[idx - 1]]?.completed;
  };
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgba(255,255,255,.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--color-border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-row1",
    style: {
      maxWidth: 'var(--layout-max)',
      margin: '0 auto',
      padding: '0 24px',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--color-border)'
    }
  }, /*#__PURE__*/React.createElement(LogoMenu, {
    navigate: navigate,
    route: route
  }), /*#__PURE__*/React.createElement(StatChips, {
    xp: xp,
    streak: streak,
    darkMode: darkMode,
    onToggleDark: onToggleDark,
    user: user,
    nickname: nickname,
    onLogout: onLogout
  })), /*#__PURE__*/React.createElement("div", {
    className: "nav-row2",
    style: {
      maxWidth: 'var(--layout-max)',
      margin: '0 auto',
      padding: '0 24px'
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      overflowX: 'auto',
      scrollbarWidth: 'none'
    }
  }, sections.map(s => {
    const active = s.id === sectionId;
    const locked = isSectionLocked(s.id);
    return /*#__PURE__*/React.createElement("a", {
      key: s.id,
      onClick: locked ? undefined : () => navigate(s.to),
      title: locked ? 'Selesaikan bagian sebelumnya terlebih dahulu' : undefined,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 40,
        padding: '0 12px',
        borderRadius: 10,
        fontFamily: 'var(--font-latin)',
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: locked ? 'var(--color-text-light)' : active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        background: active ? 'var(--color-primary-50)' : 'transparent',
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.55 : 1,
        whiteSpace: 'nowrap',
        transition: 'all 160ms',
        flexShrink: 0
      },
      onMouseEnter: e => {
        if (!active && !locked) {
          e.currentTarget.style.background = 'var(--color-bg)';
          e.currentTarget.style.color = 'var(--color-primary)';
        }
      },
      onMouseLeave: e => {
        if (!active && !locked) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: locked ? 'lock' : s.icon,
      size: 16
    }), /*#__PURE__*/React.createElement("span", {
      className: "nav-section-label"
    }, s.label));
  }))));
}
function FloatingTop({
  route,
  navigate,
  xp,
  streak,
  darkMode,
  onToggleDark,
  user,
  nickname,
  onLogout
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 20,
      left: 0,
      right: 0,
      zIndex: 30,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--layout-max)',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      pointerEvents: 'auto'
    }
  }, /*#__PURE__*/React.createElement(LogoMenu, {
    navigate: navigate,
    route: route,
    variant: "floating"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      pointerEvents: 'auto'
    }
  }, /*#__PURE__*/React.createElement(StatChips, {
    xp: xp,
    streak: streak,
    floating: true,
    darkMode: darkMode,
    onToggleDark: onToggleDark,
    user: user,
    nickname: nickname,
    onLogout: onLogout
  }))));
}
function Navbar({
  route,
  navigate,
  xp = 0,
  streak = 1,
  progress = null,
  darkMode = false,
  onToggleDark,
  user = null,
  nickname = null,
  onLogout
}) {
  if (route === 'home') return /*#__PURE__*/React.createElement(FloatingTop, {
    route: route,
    navigate: navigate,
    xp: xp,
    streak: streak,
    darkMode: darkMode,
    onToggleDark: onToggleDark,
    user: user,
    nickname: nickname,
    onLogout: onLogout
  });
  if (route.startsWith('chapter/')) return /*#__PURE__*/React.createElement(ChapterNav, {
    route: route,
    navigate: navigate,
    xp: xp,
    streak: streak,
    progress: progress,
    darkMode: darkMode,
    onToggleDark: onToggleDark,
    user: user,
    nickname: nickname,
    onLogout: onLogout
  });
  return null;
}
window.LogoMenu = LogoMenu;
window.StatChips = StatChips;
window.Navbar = Navbar;