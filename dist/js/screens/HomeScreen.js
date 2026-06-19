/* HomeScreen — Landing page */

function HomeScreen({
  navigate,
  xp,
  streak,
  isGuest,
  onSwitchToLogin
}) {
  const {
    chapters,
    ui
  } = DATA;
  const progress = window._progress || {};
  const scrollToChapters = () => {
    const el = document.getElementById('chapter-list');
    if (el) {
      const rect = el.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + rect.top - 24,
        behavior: 'smooth'
      });
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "page anim-in",
    style: {
      paddingTop: 96
    }
  }, isGuest && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10,
      padding: '12px 18px',
      borderRadius: 14,
      marginBottom: 20,
      background: 'var(--color-accent-50)',
      border: '1.5px solid var(--color-accent-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "\uD83D\uDC64"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--color-amber-text)'
    }
  }, "Kamu belajar sebagai Tamu"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)',
      marginTop: 1
    }
  }, "Progress tersimpan di perangkat ini saja \u2014 masuk untuk sync ke semua perangkat."))), /*#__PURE__*/React.createElement("button", {
    onClick: onSwitchToLogin,
    style: {
      padding: '7px 16px',
      borderRadius: 10,
      border: 'none',
      background: 'var(--color-accent)',
      color: '#fff',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      flexShrink: 0,
      fontFamily: 'var(--font-latin)'
    }
  }, "Masuk / Daftar")), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-surface) 60%, var(--color-accent-50) 100%)',
      borderRadius: 28,
      padding: '48px 48px',
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: 32,
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 64
    },
    className: "hero-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 200,
      height: 200,
      borderRadius: 999,
      background: 'var(--color-secondary-glow, rgba(20,184,166,.08))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: -30,
      left: 200,
      width: 80,
      height: 80,
      borderRadius: 999,
      background: 'var(--color-accent-glow, rgba(245,158,11,.12))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "primary",
    icon: "sparkles"
  }, ui.hero.badge), /*#__PURE__*/React.createElement("h1", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      color: 'var(--color-primary)',
      fontSize: 64,
      fontWeight: 800,
      direction: 'rtl',
      textAlign: 'right',
      lineHeight: 1.3,
      margin: 0
    }
  }, ui.hero.title_ar), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 22,
      color: 'var(--color-text-secondary)',
      maxWidth: 480
    }
  }, ui.hero.subtitle), /*#__PURE__*/React.createElement("p", {
    lang: "ar",
    style: {
      fontSize: 22,
      color: 'var(--color-text-primary)',
      fontFamily: 'var(--font-arabic)',
      direction: 'rtl',
      textAlign: 'right'
    }
  }, ui.hero.subtitle_ar), /*#__PURE__*/React.createElement("div", {
    className: "hero-cta-row",
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    iconRight: "chevron-right",
    onClick: scrollToChapters
  }, ui.hero.cta_primary), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    icon: "book",
    onClick: scrollToChapters
  }, ui.hero.cta_secondary))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -10,
      borderRadius: 34,
      background: 'linear-gradient(135deg, rgba(20,184,166,.18) 0%, rgba(245,158,11,.12) 100%)',
      filter: 'blur(12px)',
      zIndex: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      padding: 4,
      borderRadius: 28,
      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent))',
      boxShadow: '0 24px 56px -12px rgba(15,118,110,.35), 0 4px 16px rgba(0,0,0,.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 24,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/images/illustrasion-hero.webp",
    alt: "",
    className: "hero-illustration",
    style: {
      width: '100%',
      display: 'block'
    }
  }))))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginBottom: 64
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20
    },
    className: "feature-grid"
  }, ui.features.map((f, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    padding: 24
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 14,
      background: 'linear-gradient(180deg, var(--color-primary), var(--color-primary-hover))',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: f.icon,
    size: 24
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 18,
      fontWeight: 700
    }
  }, f.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--color-text-secondary)',
      lineHeight: 1.6
    }
  }, f.desc)))))), /*#__PURE__*/React.createElement("section", {
    id: "chapter-list",
    style: {
      scrollMarginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 24,
      flexWrap: 'wrap',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 32,
      fontWeight: 700
    }
  }, "Pilih Bab"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--color-text-secondary)',
      marginTop: 6
    }
  }, "Tiga bab tersedia \xB7 selesaikan untuk membuka yang berikutnya")), /*#__PURE__*/React.createElement(Badge, {
    tone: "gold",
    icon: "trophy"
  }, xp, " XP \xB7 Streak ", streak, " hari")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 24
    },
    className: "chapter-grid"
  }, chapters.map(c => /*#__PURE__*/React.createElement(ChapterCard, {
    key: c.number,
    num: c.number,
    status: c.status,
    titleAr: c.title_ar,
    titleId: c.title_id,
    summary: c.summary,
    progress: c.status === 'available' ? progress.chapterProgress ? progress.chapterProgress('3') : 0 : 0,
    onClick: () => navigate('chapter/3')
  })))));
}
window.HomeScreen = HomeScreen;