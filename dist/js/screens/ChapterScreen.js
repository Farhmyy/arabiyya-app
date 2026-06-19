/* ChapterScreen — Chapter 3 overview with sequential progress lock */

function ChapterScreen({
  navigate,
  progress
}) {
  const {
    chapter3
  } = DATA;
  const ch = progress ? progress.chapters?.['3'] : {};

  /* Sequential unlock: each section requires the previous to be completed.
     imtihan unlocks only after all 5 learning sections are done. */
  const SECTION_ORDER = ['hiwar', 'mufrodat', 'tadribat_1', 'qawaid', 'tadribat_2'];
  const getSectionStatus = id => {
    if (!ch) return id === 'hiwar' ? 'open' : 'locked';
    const data = ch[id];
    if (data?.completed) return 'done';
    if (id === 'hiwar') return 'open';
    if (id === 'imtihan') {
      const allDone = SECTION_ORDER.every(s => ch[s]?.completed);
      return allDone ? 'open' : 'locked';
    }
    const prevId = SECTION_ORDER[SECTION_ORDER.indexOf(id) - 1];
    return ch[prevId]?.completed ? 'open' : 'locked';
  };
  const getScoreBadge = id => {
    if (!ch?.[id]?.completed) return null;
    const {
      score,
      maxScore
    } = ch[id];
    if (maxScore && (id === 'tadribat_1' || id === 'tadribat_2' || id === 'imtihan')) {
      return `${score}/${maxScore}`;
    }
    return null;
  };
  const sections = [{
    id: 'hiwar',
    icon: 'message',
    titleAr: 'الْحِوَار',
    titleId: 'Hiwar · Dialog',
    subtitle: '6 adegan · TTS Audio · toggle terjemahan',
    accent: 'primary',
    route: 'chapter/3/hiwar'
  }, {
    id: 'mufrodat',
    icon: 'layers',
    titleAr: 'الْمُفْرَدَات',
    titleId: 'Mufrodat · Kosakata',
    subtitle: '12 kata · flashcard + contoh kalimat',
    accent: 'secondary',
    route: 'chapter/3/mufrodat'
  }, {
    id: 'tadribat_1',
    icon: 'edit',
    titleAr: 'تَدْرِيبَات ١',
    titleId: 'Tadribat 1 · Latihan Hiwar & Mufrodat',
    subtitle: '10 soal · 5 audio + 5 teks · +XP',
    accent: 'gold',
    route: 'chapter/3/tadribat-1'
  }, {
    id: 'qawaid',
    icon: 'book',
    titleAr: 'التَّرْكِيب',
    titleId: 'Qawaid · Tata Bahasa',
    subtitle: "3 topik: mādhī · mudhāri' · jumlah fi'liyyah",
    accent: 'purple',
    route: 'chapter/3/qawaid'
  }, {
    id: 'tadribat_2',
    icon: 'edit',
    titleAr: 'تَدْرِيبَات ٢',
    titleId: 'Tadribat 2 · Latihan Qawaid',
    subtitle: '10 soal interaktif · skor akhir & badge',
    accent: 'teal',
    route: 'chapter/3/tadribat-2'
  }, {
    id: 'imtihan',
    icon: 'award',
    titleAr: 'الامْتِحَان',
    titleId: 'Imtihan · Ujian Akhir',
    subtitle: '15 soal komprehensif · buka setelah semua selesai',
    accent: 'gold',
    route: 'chapter/3/imtihan'
  }];
  const chapterPct = progress ? progress.chapterProgress('3') : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "page anim-in"
  }, /*#__PURE__*/React.createElement("section", {
    className: "chapter-banner-section",
    style: {
      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
      borderRadius: 24,
      padding: '32px 32px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -50,
      right: -50,
      width: 220,
      height: 220,
      borderRadius: 999,
      background: 'rgba(255,255,255,.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: -40,
      right: 120,
      width: 120,
      height: 120,
      borderRadius: 999,
      background: 'rgba(245,158,11,.18)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate('home'),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 14,
      color: '#CCFBF1',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 16
  }), " Kembali ke beranda"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "gold"
  }, "BAB 3 \xB7 Tersedia"))), /*#__PURE__*/React.createElement("div", {
    className: "chapter-num-box",
    style: {
      width: 80,
      height: 80,
      borderRadius: 20,
      background: 'rgba(255,255,255,.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-arabic)',
      fontSize: 52,
      fontWeight: 700,
      color: '#fff',
      flexShrink: 0
    }
  }, "\u0663")), /*#__PURE__*/React.createElement("h1", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      color: '#fff',
      fontSize: 52,
      fontWeight: 700,
      direction: 'rtl',
      textAlign: 'right',
      lineHeight: 1.4,
      margin: '0 0 8px'
    }
  }, chapter3.title_ar), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      marginBottom: 8
    }
  }, chapter3.title_id), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#CCFBF1',
      fontSize: 15,
      maxWidth: 540,
      marginBottom: 16
    }
  }, chapter3.description), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 480
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: chapterPct,
    label: /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#fff'
      }
    }, "Progress kamu")
  })))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: 24
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 20,
    color: "var(--color-accent)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 700
    }
  }, "Tujuan Pembelajaran")), /*#__PURE__*/React.createElement("ul", {
    className: "objectives-grid",
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, chapter3.objectives.map((o, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      borderRadius: 999,
      background: 'var(--color-primary-50)',
      color: 'var(--color-primary)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: 'var(--color-text-primary)'
    }
  }, o)))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      margin: '0 0 16px'
    }
  }, "Bagian Pembelajaran"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 16
    },
    className: "section-grid"
  }, sections.map(s => {
    const status = getSectionStatus(s.id);
    const locked = status === 'locked';
    const scoreBadge = getScoreBadge(s.id);
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(SectionCard, {
      icon: s.icon,
      titleAr: s.titleAr,
      titleId: s.titleId,
      subtitle: locked ? 'Selesaikan bagian sebelumnya terlebih dahulu' : s.subtitle,
      status: status,
      accent: locked ? 'neutral' : s.accent,
      onClick: locked ? undefined : () => navigate(s.route)
    }), scoreBadge && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'var(--color-success)',
        color: '#fff',
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 700,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      }
    }, scoreBadge));
  }))));
}
window.ChapterScreen = ChapterScreen;