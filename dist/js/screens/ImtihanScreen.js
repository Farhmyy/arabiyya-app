/* ImtihanScreen — Ujian Akhir BAB 3 (Comprehensive Final Exam) */

const IMTIHAN_KEY = 'arabiyya_quiz_imtihan';
const IMTIHAN_DURATION = 1800; // 30 minutes
const MAX_ATTEMPTS = 3;
function ImtihanScreen({
  navigate,
  progress
}) {
  const {
    useState,
    useEffect,
    useCallback,
    useRef
  } = React;
  const {
    imtihan,
    ui
  } = DATA;
  const questions = imtihan?.questions ?? [];
  const [savedSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(IMTIHAN_KEY)) || {};
    } catch {
      return {};
    }
  });

  /* ── Core state ── */
  const [started, setStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(savedSession.currentIdx ?? 0);
  const [tempSelected, setTempSelected] = useState(savedSession.tempSelected ?? null);
  const [answeredMap, setAnsweredMap] = useState(savedSession.answeredMap ?? {});
  const completedRef = useRef(false);

  /* ── Derived ── */
  const imtihanData = progress?.chapters?.['3']?.imtihan;
  const attemptsUsed = imtihanData?.attempts ?? 0;
  const blocked = attemptsUsed >= MAX_ATTEMPTS;
  const q = questions[currentIdx] || null;
  const currentAnswer = answeredMap[currentIdx];
  const revealed = currentAnswer != null;
  const allAnswered = questions.length > 0 && Object.keys(answeredMap).length >= questions.length;
  const score = Object.values(answeredMap).filter(a => a.isCorrect).length;

  /* ── Timer ── */
  const handleTimeUp = useCallback(() => {
    window.showToast && window.showToast('⏰ Waktu ujian habis!', 'error');
    setShowResults(true);
  }, []);
  const {
    timeLeft,
    formattedTime,
    isWarning,
    isUrgent,
    reset: resetTimer
  } = useQuizTimer({
    durationSeconds: IMTIHAN_DURATION,
    active: started && !showResults,
    initialTimeLeft: savedSession.timeLeft,
    onTimeUp: handleTimeUp
  });

  /* ── Session persistence ── */
  useEffect(() => {
    if (!started || questions.length === 0 || showResults) return;
    try {
      sessionStorage.setItem(IMTIHAN_KEY, JSON.stringify({
        currentIdx,
        tempSelected,
        answeredMap,
        timeLeft
      }));
    } catch {}
  }, [currentIdx, tempSelected, answeredMap, timeLeft, started, showResults]);

  /* ── Complete section when results shown ── */
  useEffect(() => {
    if (!showResults || !started || completedRef.current) return;
    completedRef.current = true;
    const finalScore = Object.values(answeredMap).filter(a => a.isCorrect).length;
    const wrongIndices = Object.keys(answeredMap).filter(k => !answeredMap[k].isCorrect).map(Number);
    progress?.completeSection?.('3', 'imtihan', finalScore, questions.length, wrongIndices);
    sessionStorage.removeItem(IMTIHAN_KEY);
  }, [showResults, progress]);

  /* ── Navigation ── */
  const jumpTo = useCallback(i => {
    setCurrentIdx(i);
    setTempSelected(null);
  }, []);
  const goNext = useCallback(() => {
    const total = questions.length;
    for (let i = currentIdx + 1; i < total; i++) {
      if (!answeredMap[i]) {
        jumpTo(i);
        return;
      }
    }
    for (let i = 0; i < currentIdx; i++) {
      if (!answeredMap[i]) {
        jumpTo(i);
        return;
      }
    }
    setShowResults(true);
  }, [currentIdx, answeredMap, questions.length, jumpTo]);

  /* ── Check ── */
  const check = () => {
    if (tempSelected == null || !q || revealed) return;
    const correct = tempSelected === q.correct_index;
    if (correct && attemptsUsed === 0 && progress?.addXP) progress.addXP(imtihan.xp_per_correct);
    window.showToast && window.showToast(correct ? ui.feedback.correct : ui.feedback.wrong, correct ? 'success' : 'error');
    setAnsweredMap(prev => ({
      ...prev,
      [currentIdx]: {
        selected: tempSelected,
        isCorrect: correct
      }
    }));
  };

  /* ── Timer chip ── */
  const TimerChip = () => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      color: isUrgent ? 'var(--color-error)' : isWarning ? 'var(--color-accent)' : 'var(--color-text-secondary)',
      fontWeight: isWarning ? 700 : 600,
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 15,
    color: isUrgent ? 'var(--color-error)' : isWarning ? 'var(--color-accent)' : 'var(--color-text-light)'
  }), /*#__PURE__*/React.createElement("span", {
    className: isUrgent ? 'pulse' : ''
  }, formattedTime));

  /* ── Guard: data.js not yet updated in cache ── */
  if (!imtihan) {
    return /*#__PURE__*/React.createElement("div", {
      className: "page anim-in",
      style: {
        textAlign: 'center',
        padding: 40
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--color-text-secondary)'
      }
    }, "Data ujian tidak ditemukan. Silakan", ' ', /*#__PURE__*/React.createElement("a", {
      onClick: () => window.location.reload(),
      style: {
        color: 'var(--color-primary)',
        cursor: 'pointer'
      }
    }, "muat ulang halaman"), "."));
  }

  /* ── Intro screen ── */
  if (!started) {
    const hasSession = Object.keys(savedSession.answeredMap || {}).length > 0 && (savedSession.timeLeft ?? 0) > 0;
    const startExam = () => {
      completedRef.current = false;
      sessionStorage.removeItem(IMTIHAN_KEY);
      resetTimer();
      setCurrentIdx(0);
      setTempSelected(null);
      setAnsweredMap({});
      setShowResults(false);
      setStarted(true);
    };
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
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-left",
      size: 16
    }), " Bab 3 \u2014 Menjenguk Orang Sakit"), /*#__PURE__*/React.createElement(Card, {
      padding: 40,
      style: {
        maxWidth: 600,
        margin: '0 auto',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 88,
        height: 88,
        borderRadius: 999,
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary-bg) 100%)',
        color: '#fff',
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "award",
      size: 44
    })), /*#__PURE__*/React.createElement(Badge, {
      tone: "gold",
      style: {
        marginBottom: 12
      }
    }, "\u0627\u0644\u0627\u0645\u0652\u062A\u0650\u062D\u064E\u0627\u0646 \xB7 Ujian Akhir"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 28,
        fontWeight: 700,
        margin: '10px 0 8px'
      }
    }, "Ujian Akhir BAB 3"), /*#__PURE__*/React.createElement("p", {
      lang: "ar",
      style: {
        fontFamily: 'var(--font-arabic)',
        fontSize: 26,
        color: 'var(--color-primary)',
        margin: '4px 0 16px',
        direction: 'rtl'
      }
    }, "\u0639\u0650\u064A\u064E\u0627\u062F\u064E\u0629\u064F \u0627\u0644\u0652\u0645\u064E\u0631\u0650\u064A\u0636\u0650"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--color-text-secondary)',
        fontSize: 15,
        lineHeight: 1.7,
        marginBottom: 24
      }
    }, "Ujian komprehensif mencakup seluruh materi BAB 3:", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "Hiwar"), ", ", /*#__PURE__*/React.createElement("strong", null, "Mufrodat"), ", dan ", /*#__PURE__*/React.createElement("strong", null, "Qawaid"), ".", /*#__PURE__*/React.createElement("br", null), "Kamu bisa ", /*#__PURE__*/React.createElement("strong", null, "melompat antar soal"), " sesuai keinginan."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        marginBottom: 20
      }
    }, [{
      label: 'Jumlah Soal',
      value: `${questions.length} soal`,
      icon: 'edit'
    }, {
      label: 'XP per Soal',
      value: `+${imtihan.xp_per_correct} XP`,
      icon: 'star'
    }, {
      label: 'Nilai Lulus',
      value: '≥ 60%',
      icon: 'check-circle'
    }, {
      label: 'Waktu Pengerjaan',
      value: `${Math.round(IMTIHAN_DURATION / 60)} menit`,
      icon: 'clock'
    }].map(s => /*#__PURE__*/React.createElement("div", {
      key: s.label,
      style: {
        background: 'var(--color-primary-50)',
        borderRadius: 12,
        padding: '14px 10px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: s.icon,
      size: 20,
      color: "var(--color-primary)"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: 'var(--color-primary)',
        margin: '6px 0 2px'
      }
    }, s.value), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--color-text-secondary)'
      }
    }, s.label)))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: blocked ? 'var(--color-error-50)' : 'var(--color-accent-50)',
        border: `1px solid ${blocked ? 'var(--color-error-border)' : 'var(--color-accent-100)'}`,
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 16,
        fontSize: 14,
        color: blocked ? 'var(--color-error-text)' : 'var(--color-amber-text)',
        fontWeight: 600
      }
    }, blocked ? `❌ Percobaan habis (${attemptsUsed}/${MAX_ATTEMPTS}). Hubungi guru untuk reset.` : `Percobaan ke-${attemptsUsed + 1} dari ${MAX_ATTEMPTS}`), imtihanData?.bestScore != null && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-success-50)',
        border: '1px solid var(--color-success-border)',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 16,
        fontSize: 14,
        color: 'var(--color-success-text)'
      }
    }, "Skor terbaik: ", /*#__PURE__*/React.createElement("strong", null, imtihanData.bestScore, "/", imtihanData.maxScore), imtihanData.score !== imtihanData.bestScore && /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 Terakhir: ", /*#__PURE__*/React.createElement("strong", null, imtihanData.score, "/", imtihanData.maxScore))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-accent-50)',
        border: '1px solid var(--color-accent-100)',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 24,
        fontSize: 13,
        color: 'var(--color-amber-text)',
        textAlign: 'left'
      }
    }, "\u26A0\uFE0F ", /*#__PURE__*/React.createElement("strong", null, "Perhatian:"), " Waktu berjalan sejak kamu mulai ujian."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        flexWrap: 'wrap'
      }
    }, hasSession && !blocked && /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: "play",
      onClick: () => setStarted(true)
    }, "Lanjutkan (Soal ", (savedSession.currentIdx ?? 0) + 1, ")"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconRight: "chevron-right",
      onClick: startExam,
      disabled: blocked
    }, "Mulai Ujian"))));
  }

  /* ── Results screen ── */
  if (showResults) {
    const prevBest = imtihanData?.bestScore ?? imtihanData?.score ?? 0;
    const displayBest = Math.max(score, prevBest);
    const isNewBest = score > (imtihanData?.bestScore ?? imtihanData?.score ?? 0);
    const passing = score >= Math.ceil(questions.length * 0.6);
    const perfectScore = score === questions.length;
    const finalAttempts = Math.min(attemptsUsed + 1, MAX_ATTEMPTS);
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
    }), " Bab 3"), /*#__PURE__*/React.createElement(Card, {
      padding: 36,
      style: {
        maxWidth: 580,
        margin: '0 auto',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "pulse",
      style: {
        width: 80,
        height: 80,
        borderRadius: 999,
        background: perfectScore ? 'var(--color-accent)' : passing ? 'var(--color-primary-bg)' : 'var(--color-error)',
        color: '#fff',
        margin: '0 auto 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: perfectScore ? 'trophy' : passing ? 'award' : 'star',
      size: 40
    })), /*#__PURE__*/React.createElement(Badge, {
      tone: perfectScore ? 'gold' : passing ? 'primary' : 'neutral',
      style: {
        marginBottom: 10
      }
    }, perfectScore ? '🏆 Nilai Sempurna!' : passing ? '✅ Lulus!' : '💪 Coba Lagi'), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 28,
        fontWeight: 700,
        margin: '8px 0 0'
      }
    }, "Ujian Selesai!"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        margin: '20px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-primary-50)',
        borderRadius: 14,
        padding: '16px 12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        marginBottom: 4
      }
    }, "Skor Ini"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 28,
        fontWeight: 800,
        color: 'var(--color-primary)'
      }
    }, score, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--color-text-light)'
      }
    }, "/", questions.length)), attemptsUsed === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--color-text-light)',
        marginTop: 2
      }
    }, "+", score * imtihan.xp_per_correct, " XP")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-accent-50)',
        borderRadius: 14,
        padding: '16px 12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        marginBottom: 4
      }
    }, "Skor Terbaik"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 28,
        fontWeight: 800,
        color: 'var(--color-accent)'
      }
    }, displayBest, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--color-text-light)'
      }
    }, "/", questions.length)), isNewBest && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--color-success)',
        fontWeight: 700,
        marginTop: 2
      }
    }, "\uD83C\uDD95 Rekor Baru!"))), finalAttempts < MAX_ATTEMPTS && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-accent-50)',
        border: '1px solid var(--color-accent-100)',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 14,
        fontSize: 13,
        color: 'var(--color-amber-text)'
      }
    }, "Sisa percobaan: ", /*#__PURE__*/React.createElement("strong", null, MAX_ATTEMPTS - finalAttempts), " dari ", MAX_ATTEMPTS), finalAttempts >= MAX_ATTEMPTS && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-error-50)',
        border: '1px solid var(--color-error-border)',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 14,
        fontSize: 13,
        color: 'var(--color-error-text)'
      }
    }, "Percobaan habis. Hubungi guru untuk reset."), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'left',
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, questions.map((oq, i) => {
      const a = answeredMap[i];
      if (!a) return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          borderRadius: 10,
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "minus-circle",
        size: 16,
        color: "var(--color-text-light)"
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          color: 'var(--color-text-light)'
        }
      }, "Soal ", i + 1, " \u2014 tidak dijawab"));
      const optText = a.selected != null ? oq.options?.[a.selected] : '—';
      const isAr = optText && /[؀-ۿ]/.test(optText);
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 10,
          background: a.isCorrect ? 'var(--color-success-50)' : 'var(--color-error-50)',
          border: `1px solid ${a.isCorrect ? 'var(--color-success-border)' : 'var(--color-error-border)'}`
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: a.isCorrect ? 'check-circle' : 'x-circle',
        size: 16,
        color: a.isCorrect ? 'var(--color-success)' : 'var(--color-error)'
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0
        }
      }, "Soal ", i + 1), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          flex: 1,
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          direction: isAr ? 'rtl' : 'ltr'
        }
      }, optText), !a.isCorrect && a.selected != null && (() => {
        const corrText = oq.options?.[oq.correct_index];
        const isCAr = corrText && /[؀-ۿ]/.test(corrText);
        return /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 11,
            color: 'var(--color-success-text)',
            fontFamily: isCAr ? 'var(--font-arabic)' : 'inherit'
          }
        }, "\u2713 ", corrText);
      })());
    })), /*#__PURE__*/React.createElement(ProgressBar, {
      value: score,
      max: questions.length,
      color: passing ? 'gradient' : 'primary',
      showPct: false
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 24
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconRight: "home",
      onClick: () => navigate('chapter/3')
    }, "Kembali ke Beranda Bab"))));
  }

  /* ── Question screen ── */
  const isCorrect = currentAnswer ? currentAnswer.isCorrect : false;
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
    style: {
      maxWidth: 940,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--color-text-secondary)'
    }
  }, "Imtihan \xB7 Ujian Akhir BAB 3"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-light)',
      marginTop: 2
    }
  }, "Hiwar, Mufrodat, dan Qawaid")), /*#__PURE__*/React.createElement(TimerChip, null)), /*#__PURE__*/React.createElement(StepProgress, {
    current: Object.keys(answeredMap).length,
    total: questions.length,
    style: {
      marginBottom: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "quiz-with-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "quiz-main-col"
  }, q && /*#__PURE__*/React.createElement(Card, {
    padding: 36,
    style: {
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--color-text-secondary)',
      fontWeight: 600
    }
  }, "Pertanyaan ", currentIdx + 1), /*#__PURE__*/React.createElement(Badge, {
    tone: "gold",
    icon: "award"
  }, "Ujian Akhir")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 600,
      marginBottom: 18,
      lineHeight: 1.4
    }
  }, q.prompt), q.arabic_display && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-accent-50)',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      textAlign: 'center',
      border: '1px solid var(--color-accent-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 40,
      fontWeight: 700,
      color: 'var(--color-amber-text)',
      textAlign: 'center',
      direction: 'rtl',
      lineHeight: 1.6
    }
  }, q.arabic_display)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 24
    },
    className: "quiz-grid"
  }, q.options.map((opt, oi) => {
    const sel = revealed ? currentAnswer.selected : tempSelected;
    const isSel = sel === oi;
    const isRight = revealed && oi === q.correct_index;
    const isWrong = revealed && isSel && oi !== q.correct_index;
    const isAr = /[؀-ۿ]/.test(opt);
    return /*#__PURE__*/React.createElement("button", {
      key: oi,
      onClick: () => !revealed && setTempSelected(oi),
      disabled: revealed,
      style: {
        padding: '16px 18px',
        borderRadius: 14,
        border: `2px solid ${isRight ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : isSel ? 'var(--color-primary)' : 'var(--color-border)'}`,
        background: isRight ? 'var(--color-success-50)' : isWrong ? 'var(--color-error-50)' : isSel ? 'var(--color-primary-50)' : 'var(--color-surface)',
        color: isRight ? 'var(--color-success-text)' : isWrong ? 'var(--color-error-text)' : 'var(--color-text-primary)',
        fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-latin)',
        fontSize: isAr ? 22 : 15,
        fontWeight: 600,
        textAlign: isAr ? 'right' : 'left',
        cursor: revealed ? 'default' : 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all var(--dur-med) var(--ease-out)',
        direction: isAr ? 'rtl' : 'ltr'
      }
    }, /*#__PURE__*/React.createElement("span", null, !isAr && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--color-text-light)',
        marginRight: 8
      }
    }, String.fromCharCode(65 + oi), "."), opt), isRight && /*#__PURE__*/React.createElement(Icon, {
      name: "check-circle",
      size: 20,
      color: "var(--color-success)"
    }), isWrong && /*#__PURE__*/React.createElement(Icon, {
      name: "x-circle",
      size: 20,
      color: "var(--color-error)"
    }));
  })), revealed && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      background: isCorrect ? 'var(--color-success-50)' : 'var(--color-error-50)',
      color: isCorrect ? 'var(--color-success-text)' : 'var(--color-error-text)',
      fontWeight: 600,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, isCorrect ? ui.feedback.correct : ui.feedback.wrong), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 400,
      marginTop: 4,
      opacity: 0.85
    }
  }, q.explanation)), isCorrect && attemptsUsed === 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--color-accent)',
      color: '#fff',
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 13,
      flexShrink: 0
    }
  }, "+", imtihan.xp_per_correct, " XP")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end'
    }
  }, !revealed ? /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: check,
    disabled: tempSelected == null,
    iconRight: "chevron-right"
  }, "Periksa") : /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: allAnswered ? () => setShowResults(true) : goNext,
    iconRight: allAnswered ? 'check' : 'chevron-right'
  }, allAnswered ? 'Lihat Hasil' : 'Lanjut →')))), /*#__PURE__*/React.createElement("div", {
    className: "quiz-nav-col"
  }, /*#__PURE__*/React.createElement(QuizNavigator, {
    count: questions.length,
    currentIdx: currentIdx,
    answeredMap: answeredMap,
    onJump: jumpTo,
    allAnswered: allAnswered,
    onFinish: () => setShowResults(true)
  })))));
}
window.ImtihanScreen = ImtihanScreen;