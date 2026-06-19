/* MufrodatScreen — Vocabulary grid (الْمُفْرَدَات) */

function useMufrodatContent() {
  const transform = raw => (raw.words || []).map(w => {
    const local = DATA.mufrodat.find(m => m.ar === w.arabic) || {};
    return {
      ar: w.arabic,
      meaning_id: w.meaning,
      example_ar: w.example,
      image_ref: w.image_url || local.image_ref || null,
      audio_text: w.arabic,
      audio_ref: local.audio_ref || null,
      example_ref: local.example_ref || null,
      transliteration: local.transliteration || ''
    };
  });
  return useCloudContent('mufrodat', DATA.mufrodat, transform);
}
function MufrodatScreen({
  navigate,
  progress
}) {
  const {
    useState,
    useEffect,
    useRef,
    useCallback
  } = React;
  const mufrodat = useMufrodatContent();
  const {
    mufrodat_extra
  } = DATA;

  // ── Normal mode state ──────────────────────────────────────────────────────
  const [flipped, setFlipped] = useState(() => new Set());
  const [playingKey, setPlayingKey] = useState(null);
  const [showExtra, setShowExtra] = useState(false);
  const playingKeyRef = useRef(null);

  // ── SRS review state ────────────────────────────────────────────────────────
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewTally, setReviewTally] = useState({
    easy: 0,
    good: 0,
    hard: 0
  });

  // ── SRS derived values ──────────────────────────────────────────────────────
  const mufrodatProgress = progress?.chapters?.['3']?.mufrodat;
  const srsCards = mufrodatProgress?.srsCards || null;
  const dueCardIndices = srsCards && window.SRS ? window.SRS.getDueCards(srsCards) : [];

  // Migration: initialize srsCards for users who completed mufrodat before this feature
  useEffect(() => {
    if (!window.SRS || !mufrodat.length || !mufrodatProgress?.completed) return;
    if (mufrodatProgress.srsCards) return;
    const cards = window.SRS.initSrsCards(mufrodat.length);
    const today = window.SRS.localDateStr();
    Object.values(cards).forEach(c => {
      c.nextReview = today;
    });
    progress?.setSrsCards?.('3', 'mufrodat', cards);
  }, [mufrodat.length, mufrodatProgress?.completed, mufrodatProgress?.srsCards]);

  // ── Normal mode handlers ────────────────────────────────────────────────────
  const toggle = i => setFlipped(prev => {
    const s = new Set(prev);
    s.has(i) ? s.delete(i) : s.add(i);
    return s;
  });
  const flipAll = state => setFlipped(state ? new Set(mufrodat.map((_, i) => i)) : new Set());
  const speakWord = (e, key, text, audioRef) => {
    e.stopPropagation();
    if (playingKeyRef.current === key) {
      playingKeyRef.current = null;
      setPlayingKey(null);
      if (window.stopSpeech) window.stopSpeech();
      return;
    }
    if (window.stopSpeech) window.stopSpeech();
    playingKeyRef.current = key;
    setPlayingKey(key);
    window.speakArabic(text, audioRef, () => {
      playingKeyRef.current = null;
      setPlayingKey(null);
    });
  };

  /* Mark mufrodat complete when all cards flipped (guard: data must be loaded) */
  useEffect(() => {
    if (mufrodat.length > 0 && flipped.size === mufrodat.length && progress?.completeSection) {
      progress.completeSection('3', 'mufrodat', mufrodat.length, mufrodat.length);
    }
  }, [flipped.size, mufrodat.length]);

  // ── SRS review handlers ─────────────────────────────────────────────────────
  const startReview = useCallback(() => {
    if (!srsCards || !window.SRS || dueCardIndices.length === 0) return;
    setReviewQueue(dueCardIndices);
    setReviewIdx(0);
    setReviewFlipped(false);
    setReviewDone(false);
    setReviewTally({
      easy: 0,
      good: 0,
      hard: 0
    });
    setReviewMode(true);
  }, [srsCards, dueCardIndices]);
  const rateCard = useCallback(rating => {
    const cardIndex = reviewQueue[reviewIdx];
    const existing = srsCards?.[cardIndex] || {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      lapses: 0
    };
    const newCardData = window.SRS.scheduleCard(existing, rating);
    progress?.updateSrsCard?.('3', 'mufrodat', cardIndex, newCardData);
    setReviewTally(prev => ({
      ...prev,
      [rating]: prev[rating] + 1
    }));
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
    return /*#__PURE__*/React.createElement("div", {
      className: "page anim-in"
    }, /*#__PURE__*/React.createElement("a", {
      onClick: () => setReviewMode(false),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 14,
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-left",
      size: 16
    }), " Kembali ke Mufrodat"), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 480,
        margin: '0 auto'
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 40,
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 56,
        marginBottom: 16,
        lineHeight: 1
      }
    }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("h2", {
      style: {
        marginBottom: 8
      }
    }, "Review Selesai!"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--color-text-secondary)',
        marginBottom: 24
      }
    }, "Kamu telah mereview ", /*#__PURE__*/React.createElement("strong", null, total, " kata"), " hari ini. Bagus!"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 32
      }
    }, [{
      key: 'hard',
      emoji: '😅',
      label: 'Susah',
      bg: 'var(--color-error-50)',
      border: 'var(--color-error-border)',
      text: 'var(--color-error-text)'
    }, {
      key: 'good',
      emoji: '🙂',
      label: 'Biasa',
      bg: 'var(--color-primary-50)',
      border: 'var(--color-border)',
      text: 'var(--color-text-secondary)'
    }, {
      key: 'easy',
      emoji: '😊',
      label: 'Mudah',
      bg: 'var(--color-success-50)',
      border: 'var(--color-success-border)',
      text: 'var(--color-success-text)'
    }].map(({
      key,
      emoji,
      label,
      bg,
      border,
      text
    }) => /*#__PURE__*/React.createElement("div", {
      key: key,
      style: {
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: '14px 8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        marginBottom: 4
      }
    }, emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 700,
        color: text
      }
    }, reviewTally[key]), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        marginTop: 2
      }
    }, label)))), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: () => setReviewMode(false),
      style: {
        width: '100%'
      }
    }, "Kembali ke Kosakata"))));
  }

  // ── RENDER: Review card-by-card ─────────────────────────────────────────────
  if (reviewMode) {
    const cardIndex = reviewQueue[reviewIdx];
    const card = mufrodat[cardIndex];
    const wordKey = `rev-word-${reviewIdx}`;
    const exKey = `rev-ex-${reviewIdx}`;
    const isPlayingW = playingKey === wordKey;
    const isPlayingEx = playingKey === exKey;
    if (!card) {
      setReviewMode(false);
      return null;
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "page anim-in"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("a", {
      onClick: () => setReviewMode(false),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 14,
        color: 'var(--color-text-secondary)',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 16
    }), " Batalkan Review"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--color-text-secondary)'
      }
    }, reviewIdx + 1, " / ", reviewQueue.length)), /*#__PURE__*/React.createElement(StepProgress, {
      current: reviewIdx,
      total: reviewQueue.length,
      style: {
        marginBottom: 28
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 440,
        margin: '0 auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        perspective: 1200,
        width: '100%',
        aspectRatio: '3 / 3.6',
        cursor: reviewFlipped ? 'default' : 'pointer',
        marginBottom: 20
      },
      onClick: () => !reviewFlipped && setReviewFlipped(true)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 500ms var(--ease-out)',
        transform: reviewFlipped ? 'rotateY(180deg)' : 'rotateY(0)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        background: 'var(--color-surface)',
        borderRadius: 24,
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "primary"
    }, cardIndex + 1), /*#__PURE__*/React.createElement("button", {
      onClick: e => speakWord(e, wordKey, card.audio_text, card.audio_ref),
      "aria-label": "Putar audio",
      style: {
        width: 38,
        height: 38,
        borderRadius: 999,
        cursor: 'pointer',
        border: '1.5px solid var(--color-primary)',
        background: isPlayingW ? 'var(--color-primary)' : 'transparent',
        color: isPlayingW ? '#fff' : 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: isPlayingW ? 'pause' : 'play',
      size: 17
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      lang: "ar",
      style: {
        fontFamily: 'var(--font-arabic)',
        fontSize: 52,
        fontWeight: 700,
        color: 'var(--color-primary)',
        textAlign: 'center',
        lineHeight: 1.5,
        direction: 'rtl'
      }
    }, card.ar), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-latin)',
        fontSize: 14,
        color: 'var(--color-text-secondary)',
        fontStyle: 'italic'
      }
    }, card.transliteration)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--color-text-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "rotate",
      size: 13
    }), " Tap untuk lihat arti")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        background: 'var(--color-surface)',
        borderRadius: 24,
        border: '2px solid var(--color-primary)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 80
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: card.image_ref,
      alt: card.meaning_id,
      loading: "lazy",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block'
      },
      onError: e => {
        e.target.style.display = 'none';
        e.target.parentNode.style.background = 'var(--color-primary-50)';
        e.target.parentNode.innerHTML = `<div style="color:var(--color-primary);font-size:48px;text-align:center;padding:24px">💊</div>`;
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 16px',
        background: 'var(--color-primary)',
        color: '#fff'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      lang: "ar",
      style: {
        fontFamily: 'var(--font-arabic)',
        fontWeight: 700,
        fontSize: 22,
        direction: 'rtl'
      }
    }, card.ar), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 15
      }
    }, card.meaning_id))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 14px',
        background: 'var(--color-surface)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      lang: "ar",
      style: {
        fontFamily: 'var(--font-arabic)',
        fontSize: 13,
        color: 'var(--color-text-primary)',
        direction: 'rtl',
        lineHeight: 1.7
      }
    }, card.example_ar)), /*#__PURE__*/React.createElement("button", {
      onClick: e => speakWord(e, exKey, card.example_ar, card.example_ref || null),
      "aria-label": "Putar contoh",
      style: {
        width: 28,
        height: 28,
        borderRadius: 999,
        cursor: 'pointer',
        flexShrink: 0,
        border: '1.5px solid var(--color-text-secondary)',
        background: isPlayingEx ? 'var(--color-primary)' : 'transparent',
        color: isPlayingEx ? '#fff' : 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: isPlayingEx ? 'pause' : 'play',
      size: 13
    }))))))), !reviewFlipped ? /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: "rotate",
      onClick: () => setReviewFlipped(true)
    }, "Balik Kartu")) : /*#__PURE__*/React.createElement("div", {
      className: "anim-in",
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => rateCard('hard'),
      style: {
        padding: '12px 8px',
        borderRadius: 14,
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 14,
        border: '2px solid var(--color-error-border)',
        background: 'var(--color-error-50)',
        color: 'var(--color-error-text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, "\uD83D\uDE05"), "Susah"), /*#__PURE__*/React.createElement("button", {
      onClick: () => rateCard('good'),
      style: {
        padding: '12px 8px',
        borderRadius: 14,
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 14,
        border: '2px solid var(--color-border)',
        background: 'var(--color-primary-50)',
        color: 'var(--color-text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, "\uD83D\uDE42"), "Biasa"), /*#__PURE__*/React.createElement("button", {
      onClick: () => rateCard('easy'),
      style: {
        padding: '12px 8px',
        borderRadius: 14,
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 14,
        border: '2px solid var(--color-success-border)',
        background: 'var(--color-success-50)',
        color: 'var(--color-success-text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, "\uD83D\uDE0A"), "Mudah"))));
  }

  // ── RENDER: Normal grid mode ────────────────────────────────────────────────
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
      marginBottom: 24,
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
    icon: "layers"
  }, "\u0639\u0650\u064A\u064E\u0627\u062F\u064E\u0629\u064F \u0627\u0644\u0652\u0645\u064E\u0631\u0650\u064A\u0636\u0650"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Bab 3")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'var(--color-text-secondary)',
      lineHeight: 1.75,
      margin: 0
    }
  }, "Pelajari ", /*#__PURE__*/React.createElement("strong", null, mufrodat.length, " kosakata"), " seputar tema menjenguk orang sakit \u2014 mulai dari nama penyakit, gejala, hingga tempat dan orang yang terlibat dalam dunia kesehatan. Setiap kartu dilengkapi gambar, contoh kalimat, dan audio pengucapan."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-light)',
      marginTop: 10
    }
  }, "Tap kartu untuk membalik dan melihat artinya. Tekan ", /*#__PURE__*/React.createElement("strong", null, "\uD83D\uDD0A"), " untuk mendengar, lalu tekan ", /*#__PURE__*/React.createElement("strong", null, "\uD83C\uDFA4"), " untuk melatih pengucapanmu.")), /*#__PURE__*/React.createElement("div", {
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
  }, "\u0627\u0644\u0652\u0645\u064F\u0641\u0652\u0631\u064E\u062F\u064E\u0627\u062A"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
      marginTop: 2
    }
  }, "Kosakata \xB7 Mufrodat")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "rotate",
    onClick: () => flipAll(true)
  }, "Balik Semua"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => flipAll(false)
  }, "Reset")))), mufrodatProgress?.completed && dueCardIndices.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
      padding: '14px 20px',
      borderRadius: 16,
      marginBottom: 24,
      background: 'var(--color-accent-50)',
      border: '1.5px solid var(--color-accent-100)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--color-amber-text)',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, "\uD83D\uDD14 ", dueCardIndices.length, " kata siap direview hari ini"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-secondary)',
      marginTop: 3
    }
  }, "Ulangi sebelum kamu lupa \u2014 hanya butuh beberapa menit!")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: startReview
  }, "Mulai Review (", dueCardIndices.length, ")")), /*#__PURE__*/React.createElement("div", {
    className: "mufrodat-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20
    }
  }, mufrodat.map((card, i) => {
    const isFlipped = flipped.has(i);
    const wordKey = `word-${i}`;
    const exampleKey = `ex-${i}`;
    const isPlayingW = playingKey === wordKey;
    const isPlayingEx = playingKey === exampleKey;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      onClick: () => toggle(i),
      style: {
        perspective: 1200,
        cursor: 'pointer',
        width: '100%',
        aspectRatio: '1 / 1.1'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 500ms var(--ease-out)',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'var(--color-surface)',
        borderRadius: 20,
        padding: 18,
        boxShadow: 'var(--shadow-card)',
        backfaceVisibility: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "primary"
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: e => speakWord(e, wordKey, card.audio_text, card.audio_ref),
      "aria-label": "Putar audio",
      style: {
        width: 36,
        height: 36,
        borderRadius: 999,
        cursor: 'pointer',
        border: '1.5px solid var(--color-primary)',
        background: isPlayingW ? 'var(--color-primary)' : 'transparent',
        color: isPlayingW ? '#fff' : 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: isPlayingW ? 'pause' : 'play',
      size: 16
    })), /*#__PURE__*/React.createElement(SpeakButton, {
      expectedText: card.audio_text,
      size: "md"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      lang: "ar",
      style: {
        fontFamily: 'var(--font-arabic)',
        fontSize: 40,
        fontWeight: 700,
        color: 'var(--color-primary)',
        textAlign: 'center',
        lineHeight: 1.6,
        direction: 'rtl'
      }
    }, card.ar), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-latin)',
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        marginTop: 6,
        fontStyle: 'italic'
      }
    }, card.transliteration)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontSize: 11,
        color: 'var(--color-text-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "rotate",
      size: 12
    }), " Tap untuk arti")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'var(--color-surface)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-card)',
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '2px solid var(--color-primary)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 80
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: card.image_ref,
      alt: card.meaning_id,
      loading: "lazy",
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block'
      },
      onError: e => {
        e.target.style.display = 'none';
        e.target.parentNode.style.background = 'var(--color-primary-50)';
        e.target.parentNode.innerHTML = `<div style="color:var(--color-primary);font-size:40px;text-align:center;padding:20px">💊</div>`;
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 14px',
        background: 'var(--color-primary)',
        color: '#fff'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      lang: "ar",
      style: {
        fontFamily: 'var(--font-arabic)',
        fontWeight: 700,
        fontSize: 20,
        direction: 'rtl'
      }
    }, card.ar), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, card.meaning_id))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 12px',
        background: 'var(--color-surface)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      lang: "ar",
      style: {
        fontFamily: 'var(--font-arabic)',
        fontSize: 14,
        color: 'var(--color-text-primary)',
        direction: 'rtl',
        lineHeight: 1.7
      }
    }, card.example_ar), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--color-text-secondary)',
        marginTop: 2
      }
    }, card.example_id)), /*#__PURE__*/React.createElement("button", {
      onClick: e => speakWord(e, exampleKey, card.example_ar, card.example_ref || null),
      "aria-label": "Putar contoh",
      style: {
        width: 28,
        height: 28,
        borderRadius: 999,
        cursor: 'pointer',
        flexShrink: 0,
        border: '1.5px solid var(--color-text-secondary)',
        background: isPlayingEx ? 'var(--color-primary)' : 'transparent',
        color: isPlayingEx ? '#fff' : 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: isPlayingEx ? 'pause' : 'play',
      size: 14
    })))))));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowExtra(v => !v),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: '14px 18px',
      borderRadius: 14,
      border: '1.5px solid var(--color-border)',
      background: showExtra ? 'var(--color-primary-50)' : 'var(--color-surface)',
      cursor: 'pointer',
      textAlign: 'left',
      fontWeight: 700,
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "help-circle",
    size: 20,
    color: "var(--color-accent)"
  }), /*#__PURE__*/React.createElement("span", null, "Tahukah Kamu? \u2014 Kosakata Pelengkap"), /*#__PURE__*/React.createElement(Icon, {
    name: showExtra ? 'chevron-up' : 'chevron-down',
    size: 18,
    style: {
      marginLeft: 'auto'
    }
  })), showExtra && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: {
      marginTop: 8,
      padding: '16px 20px',
      borderRadius: 14,
      background: 'var(--color-accent-50)',
      border: '1px solid var(--color-accent-100)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--color-amber-text)',
      marginBottom: 12,
      fontWeight: 600
    }
  }, "Kosakata tambahan seputar penyakit \u2014 untuk referensi, tidak masuk kuis."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10
    }
  }, mufrodat_extra.map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 999,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-accent-100)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 18,
      fontWeight: 600,
      color: 'var(--color-amber-text)',
      direction: 'rtl'
    }
  }, w.ar), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)'
    }
  }, w.id)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      maxWidth: 480
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: flipped.size,
    max: mufrodat.length,
    label: "Sudah dibalik",
    color: "gradient"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconRight: "chevron-right",
    onClick: () => navigate('chapter/3/tadribat-1')
  }, "Lanjut ke Tadribat 1")));
}
window.MufrodatScreen = MufrodatScreen;