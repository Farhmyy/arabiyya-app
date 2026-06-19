/* HiwarScreen — Dialog / Conversation (الْحِوَار) */

function HiwarScreen({
  navigate,
  progress
}) {
  const {
    useState,
    useEffect,
    useRef
  } = React;
  const {
    hiwar
  } = DATA;
  const [showTranslation, setShowTranslation] = useState(true);
  const [playingKey, setPlayingKey] = useState(null);
  const [activeScene, setActiveScene] = useState(() => {
    try {
      return parseInt(sessionStorage.getItem('arabiyya_hiwar_scene') || '0', 10);
    } catch {
      return 0;
    }
  });
  const playAllRef = useRef(false);
  const playingKeyRef = useRef(null);
  const allLines = hiwar.scenes.flatMap((scene, si) => scene.lines.map((line, li) => ({
    ...line,
    key: `${si}-${li}`
  })));
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
    const playNext = i => {
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
        if (el) el.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      });
      window.speakArabic(line.audio_text, line.audio_ref, () => {
        setTimeout(() => playNext(i + 1), 400);
      });
    };
    playNext(0);
  };

  /* Persist active scene across in-app navigation */
  useEffect(() => {
    try {
      sessionStorage.setItem('arabiyya_hiwar_scene', activeScene);
    } catch {}
  }, [activeScene]);

  /* Save scroll on unmount, restore on mount */
  useEffect(() => {
    const saved = (() => {
      try {
        return parseInt(sessionStorage.getItem('arabiyya_hiwar_scroll') || '0', 10);
      } catch {
        return 0;
      }
    })();
    if (saved > 0) {
      /* rAF runs after navigate's scrollTo, overriding it with instant scroll */
      requestAnimationFrame(() => window.scrollTo({
        top: saved
      }));
    }
    return () => {
      try {
        sessionStorage.setItem('arabiyya_hiwar_scroll', window.scrollY);
      } catch {}
    };
  }, []);

  /* Scroll to a scene card + set active */
  const scrollToScene = si => {
    setActiveScene(si);
    requestAnimationFrame(() => {
      const el = document.getElementById(`hiwar-scene-${si}`);
      if (el) window.scrollTo({
        top: window.scrollY + el.getBoundingClientRect().top - 96,
        behavior: 'smooth'
      });
    });
  };

  /* Stop speech on unmount */
  useEffect(() => () => {
    playAllRef.current = false;
    if (window.stopSpeech) window.stopSpeech();
  }, []);

  /* Mark hiwar complete — re-runs when progress becomes ready */
  const hiwarCompletedRef = useRef(false);
  useEffect(() => {
    if (hiwarCompletedRef.current || !progress?.completeSection) return;
    hiwarCompletedRef.current = true;
    progress.completeSection('3', 'hiwar', hiwar.scenes.length, hiwar.scenes.length);
  }, [progress]);
  const isPlayingAll = playingKey !== null && allLines.some(l => l.key === playingKey && playAllRef.current);
  return /*#__PURE__*/React.createElement("div", {
    className: "page anim-in"
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate('chapter/3'),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 14,
      color: 'var(--color-text-secondary)',
      cursor: 'pointer',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 16
  }), " Bab 3 \u2014 Menjenguk Orang Sakit"), /*#__PURE__*/React.createElement("div", {
    className: "page-header-flex",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 28,
      gap: 32,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 260
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "primary",
    icon: "book"
  }, "\u0639\u0650\u064A\u064E\u0627\u062F\u064E\u0629\u064F \u0627\u0644\u0652\u0645\u064E\u0631\u0650\u064A\u0636\u0650"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Bab 3")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'var(--color-text-secondary)',
      lineHeight: 1.75,
      margin: 0
    }
  }, "Percakapan ini menggambarkan adegan ", /*#__PURE__*/React.createElement("strong", null, "menjenguk orang sakit"), ". Umar ", /*#__PURE__*/React.createElement("span", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 17
    }
  }, "(\u0623)"), " mengunjungi sahabatnya Ahmad ", /*#__PURE__*/React.createElement("span", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 17
    }
  }, "(\u0628)"), " yang sedang sakit \u2014 dimulai dari salam pembuka, menanyakan kabar dan keluhan, memberi saran ke dokter, hingga mendoakan kesembuhan dan berpamitan."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-light)',
      marginTop: 10
    }
  }, "Tekan ", /*#__PURE__*/React.createElement("strong", null, "\uD83D\uDD0A"), " pada setiap baris untuk mendengar pengucapannya.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 14,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      color: 'var(--color-primary)',
      fontSize: 44,
      fontWeight: 700,
      direction: 'rtl',
      margin: 0,
      lineHeight: 1.2
    }
  }, "\u0627\u0644\u0652\u062D\u0650\u0648\u064E\u0627\u0631"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
      marginTop: 2
    }
  }, "Dialog \xB7 Hiwar")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showTranslation,
    onChange: e => setShowTranslation(e.target.checked),
    style: {
      width: 16,
      height: 16,
      accentColor: 'var(--color-primary)'
    }
  }), "Terjemahan"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: playAllRef.current ? 'pause' : 'play',
    size: "sm",
    onClick: playAll
  }, playAllRef.current ? 'Stop' : 'Putar Semua')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: 24,
      alignItems: 'flex-start'
    },
    className: "hiwar-layout"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }
  }, hiwar.scenes.map((scene, si) => {
    const isActive = activeScene === si;
    return /*#__PURE__*/React.createElement("div", {
      key: scene.id,
      id: `hiwar-scene-${si}`,
      onClick: () => setActiveScene(si)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 22,
        overflow: 'hidden',
        background: 'var(--color-surface)',
        boxShadow: isActive ? 'var(--shadow-hover)' : 'var(--shadow-card)',
        border: isActive ? '2px solid var(--color-secondary)' : '2px solid transparent',
        transition: 'all var(--dur-med) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: isActive ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)' : 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-border) 100%)',
        padding: '16px 20px',
        transition: 'background var(--dur-med) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 999,
        background: isActive ? 'rgba(255,255,255,.2)' : 'var(--color-border)',
        color: isActive ? '#fff' : 'var(--color-text-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 14
      }
    }, si + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: isActive ? '#fff' : 'var(--color-text-primary)'
      }
    }, scene.label), /*#__PURE__*/React.createElement("div", {
      lang: "ar",
      style: {
        fontFamily: 'var(--font-arabic)',
        fontSize: 15,
        color: isActive ? 'rgba(255,255,255,.75)' : 'var(--color-text-light)',
        direction: 'rtl'
      }
    }, scene.label_ar))), /*#__PURE__*/React.createElement(Badge, {
      tone: isActive ? 'gold' : 'neutral',
      icon: "message"
    }, scene.lines.length, " dialog"))), scene.illustration_ref && /*#__PURE__*/React.createElement("div", {
      style: {
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        padding: '12px 16px'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: scene.illustration_ref,
      alt: scene.label,
      loading: "lazy",
      style: {
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: 10
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px 22px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, scene.lines.map((line, li) => {
      const lineKey = `${si}-${li}`;
      /* أ = kanan (RTL convention), ب = kiri */
      const isRight = line.speaker === 'أ';
      const isPlaying = playingKey === lineKey;
      return /*#__PURE__*/React.createElement("div", {
        key: lineKey,
        id: `hiwar-line-${lineKey}`,
        style: {
          display: 'flex',
          flexDirection: isRight ? 'row-reverse' : 'row',
          gap: 10,
          alignItems: 'flex-start'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 36,
          height: 36,
          borderRadius: 999,
          flexShrink: 0,
          background: isRight ? 'var(--color-primary)' : 'var(--color-accent)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-arabic)',
          fontWeight: 700,
          fontSize: 16,
          marginTop: 4
        }
      }, line.speaker), /*#__PURE__*/React.createElement("div", {
        style: {
          background: isPlaying ? isRight ? 'var(--color-primary-100)' : 'var(--color-accent-100)' : isRight ? 'var(--color-primary-50)' : 'var(--color-accent-50)',
          border: `1.5px solid ${isPlaying ? isRight ? 'var(--color-secondary)' : 'var(--color-accent)' : 'var(--color-border)'}`,
          borderRadius: isRight ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
          padding: '12px 14px',
          maxWidth: '80%',
          transition: 'all var(--dur-med) var(--ease-out)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        lang: "ar",
        style: {
          fontFamily: 'var(--font-arabic)',
          fontSize: 20,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          direction: 'rtl',
          textAlign: 'right',
          lineHeight: 1.9,
          marginBottom: showTranslation ? 6 : 0
        }
      }, line.ar), showTranslation && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          marginTop: 4
        }
      }, line.id)), /*#__PURE__*/React.createElement("button", {
        onClick: e => {
          e.stopPropagation();
          playLine(lineKey, line.audio_text, line.audio_ref);
        },
        "aria-label": "Putar audio",
        style: {
          width: 34,
          height: 34,
          borderRadius: 999,
          flexShrink: 0,
          border: 'none',
          cursor: 'pointer',
          background: isPlaying ? 'var(--color-primary)' : 'transparent',
          color: isPlaying ? '#fff' : 'var(--color-primary)',
          border: isPlaying ? 'none' : '1.5px solid var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--dur-fast)',
          marginTop: 10
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: isPlaying ? 'pause' : 'play',
        size: 16
      })));
    })))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "hiwar-sidebar",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      position: 'sticky',
      top: 88
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 10,
      color: 'var(--color-text-secondary)'
    }
  }, "Adegan"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, hiwar.scenes.map((s, si) => /*#__PURE__*/React.createElement("button", {
    key: si,
    onClick: () => scrollToScene(si),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      borderRadius: 10,
      border: 'none',
      background: activeScene === si ? 'var(--color-primary-50)' : 'transparent',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 24,
      height: 24,
      borderRadius: 999,
      background: activeScene === si ? 'var(--color-primary)' : 'var(--color-border)',
      color: activeScene === si ? '#fff' : 'var(--color-text-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 12,
      flexShrink: 0
    }
  }, si + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: activeScene === si ? 700 : 500,
      color: activeScene === si ? 'var(--color-primary)' : 'var(--color-text-secondary)'
    }
  }, s.label))))), /*#__PURE__*/React.createElement(Card, {
    padding: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "Kosakata Kunci"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, hiwar.vocab.map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px 0',
      borderBottom: i < hiwar.vocab.length - 1 ? '1px solid var(--color-border)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 18,
      fontWeight: 600,
      color: 'var(--color-primary)',
      direction: 'rtl'
    }
  }, w.ar), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)',
      textAlign: 'right',
      flex: 1,
      marginLeft: 8
    }
  }, w.id))))), /*#__PURE__*/React.createElement(Card, {
    padding: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "Progress"), /*#__PURE__*/React.createElement(ProgressBar, {
    value: 100,
    label: "Dialog ini",
    color: "success",
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconRight: "chevron-right",
    onClick: () => navigate('chapter/3/mufrodat'),
    size: "sm",
    style: {
      width: '100%',
      justifyContent: 'center'
    }
  }, "Lanjut ke Mufrodat"))))), /*#__PURE__*/React.createElement("div", {
    className: "hiwar-mobile-footer",
    style: {
      display: 'none',
      marginTop: 24,
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      borderRadius: 16,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 100,
    label: "Dialog ini",
    color: "success",
    size: "sm"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconRight: "chevron-right",
    onClick: () => navigate('chapter/3/mufrodat')
  }, "Lanjut ke Mufrodat")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-text-secondary)',
      marginBottom: 8
    }
  }, "Adegan"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, hiwar.scenes.map((s, si) => /*#__PURE__*/React.createElement("button", {
    key: si,
    onClick: () => scrollToScene(si),
    style: {
      padding: '8px 14px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: activeScene === si ? 'var(--color-primary)' : 'var(--color-border)',
      color: activeScene === si ? '#fff' : 'var(--color-text-secondary)',
      fontWeight: activeScene === si ? 700 : 500,
      fontSize: 13
    }
  }, si + 1, ". ", s.label))))));
}
window.HiwarScreen = HiwarScreen;