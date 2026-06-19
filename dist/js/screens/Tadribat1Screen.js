/* Tadribat1Screen — Practice: Hiwar & Mufrodat */

function useTadribat1Content() {
  const local = DATA.tadribat1.questions;
  const transform = raw => {
    const cloudQs = raw.questions || [];
    const localMC = local.filter(q => q.type !== 'speak');
    const compatible = cloudQs.length === localMC.length && localMC.every((lq, i) => cloudQs[i]?.prompt === lq.prompt);
    if (!compatible) return local;
    return [...cloudQs.map((q, i) => ({
      ...localMC[i],
      ...q,
      audio_ref: localMC[i]?.audio_ref || null
    })), ...local.filter(q => q.type === 'speak')];
  };
  return useCloudContent('tadribat1', local, transform);
}
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const T1_KEY = 'arabiyya_quiz_t1';
const T1_DURATION = 1200; // 20 minutes

function Tadribat1Screen({
  navigate,
  progress
}) {
  const {
    useState,
    useEffect,
    useRef,
    useCallback
  } = React;
  const {
    tadribat1,
    ui
  } = DATA;
  const questions = useTadribat1Content();
  const [savedSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(T1_KEY)) || {};
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
  const [questionOrder, setQuestionOrder] = useState(savedSession.questionOrder ?? null);

  /* ── Audio/speak state ── */
  const [playing, setPlaying] = useState(false);
  const [contohPlaying, setContohPlaying] = useState(false);
  const playingRef = useRef(false);
  const contohRef = useRef(false);
  const [speakResult, setSpeakResult] = useState(null);
  const [speakAttempts, setSpeakAttempts] = useState(0);
  const speakXpGiven = useRef(false);
  const completedRef = useRef(false);

  /* ── Derived ── */
  const orderedQuestions = questionOrder && questionOrder.length === questions.length ? questionOrder.map(i => questions[i]) : questions;
  const q = orderedQuestions[currentIdx] || null;
  const currentAnswer = answeredMap[currentIdx];
  const revealed = currentAnswer != null;
  const allAnswered = questions.length > 0 && Object.keys(answeredMap).length >= orderedQuestions.length;
  const score = Object.values(answeredMap).filter(a => a.isCorrect).length;

  /* ── Timer ── */
  const handleTimeUp = useCallback(() => {
    window.showToast && window.showToast('⏰ Waktu latihan habis!', 'error');
    setShowResults(true);
  }, []);
  const {
    timeLeft,
    formattedTime,
    isWarning,
    isUrgent,
    reset: resetTimer
  } = useQuizTimer({
    durationSeconds: T1_DURATION,
    active: started && !showResults,
    initialTimeLeft: savedSession.timeLeft,
    onTimeUp: handleTimeUp
  });

  /* ── Shuffle on load ── */
  useEffect(() => {
    if (questions.length > 0 && (!questionOrder || questionOrder.length !== questions.length)) {
      setQuestionOrder(shuffleArray(questions.map((_, i) => i)));
    }
  }, [questions.length]);

  /* ── Reset speak state when navigating to different question ── */
  useEffect(() => {
    setSpeakResult(null);
    setSpeakAttempts(0);
    speakXpGiven.current = false;
    setContohPlaying(false);
    contohRef.current = false;
    if (window.stopSpeech) window.stopSpeech();
    playingRef.current = false;
    setPlaying(false);
  }, [currentIdx]);
  useEffect(() => () => {
    playingRef.current = false;
    contohRef.current = false;
    if (window.stopSpeech) window.stopSpeech();
  }, []);

  /* ── Session persistence ── */
  useEffect(() => {
    if (!started || orderedQuestions.length === 0 || showResults) return;
    try {
      sessionStorage.setItem(T1_KEY, JSON.stringify({
        currentIdx,
        tempSelected,
        answeredMap,
        questionOrder,
        timeLeft
      }));
    } catch {}
  }, [currentIdx, tempSelected, answeredMap, questionOrder, timeLeft, started, showResults]);

  /* ── Complete section when results shown ── */
  useEffect(() => {
    if (!showResults || !started || completedRef.current) return;
    completedRef.current = true;
    const finalScore = Object.values(answeredMap).filter(a => a.isCorrect).length;
    const wrongIndices = Object.entries(answeredMap).filter(([, v]) => !v.isCorrect).map(([displayIdx]) => questionOrder[Number(displayIdx)]);
    progress?.completeSection?.('3', 'tadribat_1', finalScore, orderedQuestions.length, wrongIndices);
    sessionStorage.removeItem(T1_KEY);
  }, [showResults, progress]);

  /* ── Navigation ── */
  const jumpTo = useCallback(i => {
    setCurrentIdx(i);
    setTempSelected(null);
  }, []);
  const goNext = useCallback(() => {
    const total = orderedQuestions.length;
    // Find next unanswered after current
    for (let i = currentIdx + 1; i < total; i++) {
      if (!answeredMap[i]) {
        jumpTo(i);
        return;
      }
    }
    // Wrap from beginning
    for (let i = 0; i < currentIdx; i++) {
      if (!answeredMap[i]) {
        jumpTo(i);
        return;
      }
    }
    // All answered
    setShowResults(true);
  }, [currentIdx, answeredMap, orderedQuestions.length, jumpTo]);

  /* ── Handlers ── */
  const speakQuestion = () => {
    if (!q || q.type !== 'audio') return;
    if (playingRef.current) {
      playingRef.current = false;
      setPlaying(false);
      if (window.stopSpeech) window.stopSpeech();
      return;
    }
    playingRef.current = true;
    setPlaying(true);
    window.speakArabic(q.audio_text, q.audio_ref || null, () => {
      playingRef.current = false;
      setPlaying(false);
    });
  };
  const playContoh = (audioText, audioRef) => {
    if (contohRef.current) {
      contohRef.current = false;
      setContohPlaying(false);
      if (window.stopSpeech) window.stopSpeech();
      return;
    }
    if (window.stopSpeech) window.stopSpeech();
    contohRef.current = true;
    setContohPlaying(true);
    window.speakArabic(audioText, audioRef || null, () => {
      contohRef.current = false;
      setContohPlaying(false);
    });
  };
  const check = () => {
    if (tempSelected == null || !q || revealed) return;
    const correct = tempSelected === q.correct_index;
    const alreadyDone = progress && progress.sectionStatus('3', 'tadribat_1') === 'done';
    if (correct && !alreadyDone && progress?.addXP) progress.addXP(tadribat1.xp_per_correct);
    window.showToast && window.showToast(correct ? ui.feedback.correct : ui.feedback.wrong, correct ? 'success' : 'error');
    setAnsweredMap(prev => ({
      ...prev,
      [currentIdx]: {
        selected: tempSelected,
        isCorrect: correct,
        type: q.type
      }
    }));
  };
  const handleSpeakResult = correct => {
    const isFirst = speakAttempts === 0;
    setSpeakAttempts(prev => prev + 1);
    if (correct) {
      setSpeakResult('correct');
      const alreadyDone = progress && progress.sectionStatus('3', 'tadribat_1') === 'done';
      if (isFirst && !speakXpGiven.current && !alreadyDone && progress?.addXP) {
        speakXpGiven.current = true;
        progress.addXP(tadribat1.xp_per_correct);
      }
      window.showToast && window.showToast(ui.feedback.correct, 'success');
      setAnsweredMap(prev => ({
        ...prev,
        [currentIdx]: {
          isCorrect: true,
          type: 'speak',
          skipped: false
        }
      }));
    } else {
      setSpeakResult('wrong');
    }
  };
  const skipSpeak = () => {
    setAnsweredMap(prev => ({
      ...prev,
      [currentIdx]: {
        isCorrect: false,
        type: 'speak',
        skipped: true
      }
    }));
    goNext();
  };
  const restart = () => {
    completedRef.current = false;
    sessionStorage.removeItem(T1_KEY);
    resetTimer();
    setCurrentIdx(0);
    setTempSelected(null);
    setAnsweredMap({});
    setSpeakResult(null);
    setSpeakAttempts(0);
    setQuestionOrder(shuffleArray(questions.map((_, i) => i)));
    setShowResults(false);
    setStarted(true);
  };

  /* ── Badge config ── */
  const typeBadge = {
    audio: {
      tone: 'gold',
      icon: 'volume-2',
      label: 'Mendengar'
    },
    text: {
      tone: 'primary',
      icon: 'edit',
      label: 'Teks'
    },
    speak: {
      tone: 'neutral',
      icon: 'mic',
      label: 'Ucapkan'
    }
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

  /* ── Intro screen ── */
  if (!started) {
    const hasSession = Object.keys(savedSession.answeredMap || {}).length > 0 && (savedSession.timeLeft ?? 0) > 0;
    const prevDone = progress && progress.sectionStatus('3', 'tadribat_1') === 'done';
    const prevData = progress?.chapters?.['3']?.tadribat_1;
    const startFresh = () => {
      completedRef.current = false;
      sessionStorage.removeItem(T1_KEY);
      resetTimer();
      setCurrentIdx(0);
      setTempSelected(null);
      setAnsweredMap({});
      setSpeakResult(null);
      setSpeakAttempts(0);
      setQuestionOrder(shuffleArray(questions.map((_, i) => i)));
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
      className: "quiz-intro-icon",
      style: {
        width: 80,
        height: 80,
        borderRadius: 999,
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
        color: '#fff',
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "book-open",
      size: 40
    })), /*#__PURE__*/React.createElement(Badge, {
      tone: "gold",
      style: {
        marginBottom: 12
      }
    }, "\u0627\u0644\u062A\u064E\u0651\u062F\u0652\u0631\u0650\u064A\u0628\u064E\u0627\u062A\u064F \u0661 \xB7 Latihan 1"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 26,
        fontWeight: 700,
        margin: '10px 0 8px'
      }
    }, "Latihan Hiwar & Mufrodat"), /*#__PURE__*/React.createElement("p", {
      lang: "ar",
      style: {
        fontFamily: 'var(--font-arabic)',
        fontSize: 24,
        color: 'var(--color-primary)',
        margin: '4px 0 16px',
        direction: 'rtl'
      }
    }, "\u0627\u0644\u0652\u062D\u0650\u0648\u064E\u0627\u0631\u064F \u0648\u064E\u0627\u0644\u0652\u0645\u064F\u0641\u0652\u0631\u064E\u062F\u064E\u0627\u062A\u064F"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--color-text-secondary)',
        fontSize: 15,
        lineHeight: 1.7,
        marginBottom: 24
      }
    }, "Uji pemahaman dialog dan kosakata Bab 3.", /*#__PURE__*/React.createElement("br", null), "Kamu bisa ", /*#__PURE__*/React.createElement("strong", null, "melompat antar soal"), " sesuai keinginan."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 28
      }
    }, [{
      label: 'Jumlah Soal',
      value: `${questions.length || 15} soal`,
      icon: 'edit'
    }, {
      label: 'XP per Soal',
      value: `+${tadribat1.xp_per_correct} XP`,
      icon: 'star'
    }, {
      label: 'Waktu',
      value: `${Math.round(T1_DURATION / 60)} menit`,
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
        fontSize: 15,
        fontWeight: 700,
        color: 'var(--color-primary)',
        margin: '6px 0 2px'
      }
    }, s.value), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--color-text-secondary)'
      }
    }, s.label)))), prevDone && prevData && /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-success-50)',
        border: '1px solid var(--color-success-border)',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 20,
        fontSize: 14,
        color: 'var(--color-success-text)'
      }
    }, "Skor terakhir: ", /*#__PURE__*/React.createElement("strong", null, prevData.score, "/", prevData.maxScore), prevData.bestScore > prevData.score && /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 Terbaik: ", /*#__PURE__*/React.createElement("strong", null, prevData.bestScore, "/", prevData.maxScore)), prevData.attempts > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 ", prevData.attempts, "\xD7 percobaan")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-primary-50)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 24,
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        textAlign: 'left'
      }
    }, "\u23F1\uFE0F Waktu berjalan otomatis. Soal diacak setiap sesi baru. Bisa dicoba berkali-kali."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        flexWrap: 'wrap'
      }
    }, hasSession && /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: "play",
      onClick: () => setStarted(true)
    }, "Lanjutkan (Soal ", (savedSession.currentIdx ?? 0) + 1, ")"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconRight: "chevron-right",
      onClick: startFresh
    }, hasSession ? 'Mulai Ulang' : 'Mulai Latihan'))));
  }

  /* ── Results screen ── */
  if (showResults) {
    const prevData = progress?.chapters?.['3']?.tadribat_1;
    const prevBest = prevData?.bestScore ?? prevData?.score ?? 0;
    const displayBest = Math.max(score, prevBest);
    const isNewBest = score > (prevData?.bestScore ?? prevData?.score ?? 0);
    const total = orderedQuestions.length;
    const passing = score >= Math.ceil(total * 0.6);
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
        background: passing ? 'var(--color-accent)' : 'var(--color-error)',
        color: '#fff',
        margin: '0 auto 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "award",
      size: 40
    })), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 28,
        fontWeight: 700,
        margin: 0
      }
    }, ui.feedback.quiz_complete), /*#__PURE__*/React.createElement("div", {
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
    }, "/", total))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-accent-50)',
        borderRadius: 14,
        padding: '16px 12px',
        position: 'relative'
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
    }, "/", total)), isNewBest && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--color-success)',
        fontWeight: 700,
        marginTop: 2
      }
    }, "\uD83C\uDD95 Rekor Baru!"))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'left',
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, orderedQuestions.map((oq, i) => {
      const a = answeredMap[i];
      const b = typeBadge[oq?.type] || typeBadge.text;
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
      }), /*#__PURE__*/React.createElement(Badge, {
        tone: b.tone,
        style: {
          flexShrink: 0
        }
      }, oq.type === 'audio' ? '🔊' : oq.type === 'speak' ? '🎤' : 'T'), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          fontWeight: 600
        }
      }, "Soal ", i + 1), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          flex: 1
        }
      }, oq.type === 'speak' ? /*#__PURE__*/React.createElement("span", {
        lang: "ar",
        style: {
          fontFamily: 'var(--font-arabic)',
          fontSize: 15
        }
      }, oq.arabic_display) : a.selected != null ? oq.options?.[a.selected] : '—'), !a.isCorrect && oq.type !== 'speak' && a.selected != null && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: 'var(--color-success-text)'
        }
      }, "\u2713 ", oq.options?.[oq.correct_index]), oq.type === 'speak' && a.skipped && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: 'var(--color-text-light)'
        }
      }, "dilewati"));
    })), /*#__PURE__*/React.createElement(ProgressBar, {
      value: score,
      max: orderedQuestions.length,
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
      variant: "secondary",
      icon: "rotate",
      onClick: restart
    }, "Ulangi Latihan"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconRight: "chevron-right",
      onClick: () => navigate('chapter/3/qawaid')
    }, "Lanjut ke Qawaid"))));
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
  }, "Tadribat 1 \xB7 Hiwar & Mufrodat"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-light)',
      marginTop: 2
    }
  }, "Uji pemahaman dialog dan kosakata")), /*#__PURE__*/React.createElement(TimerChip, null)), /*#__PURE__*/React.createElement(StepProgress, {
    current: Object.keys(answeredMap).length,
    total: orderedQuestions.length,
    style: {
      marginBottom: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "quiz-with-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "quiz-main-col"
  }, q && /*#__PURE__*/React.createElement(Card, {
    padding: 32,
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
  }, "Pertanyaan ", currentIdx + 1), (() => {
    const b = typeBadge[q.type] || typeBadge.text;
    return /*#__PURE__*/React.createElement(Badge, {
      tone: b.tone,
      icon: b.icon
    }, b.label);
  })()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 21,
      fontWeight: 600,
      marginBottom: 18,
      lineHeight: 1.4
    }
  }, q.prompt), q.type === 'audio' && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-primary-50)',
      borderRadius: 20,
      padding: '28px 20px',
      border: '2px dashed var(--color-secondary)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: speakQuestion,
    style: {
      width: 80,
      height: 80,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: playing ? 'var(--color-primary)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 20px rgba(15,118,110,.4)',
      transition: 'all var(--dur-fast)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: playing ? 'pause' : 'volume-2',
    size: 36
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontSize: 14,
      color: 'var(--color-text-secondary)',
      fontWeight: 600
    }
  }, playing ? 'Memutar…' : 'Tekan untuk mendengar'), revealed && q.audio_text && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 38,
      fontWeight: 700,
      color: 'var(--color-primary)',
      direction: 'rtl',
      lineHeight: 1.6
    }
  }, q.audio_text), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SpeakButton, {
    expectedText: q.audio_text,
    size: "md"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)'
    }
  }, "Coba ucapkan!"))))), q.type === 'text' && q.arabic_display && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-primary-50)',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 52,
      fontWeight: 700,
      color: 'var(--color-primary)',
      direction: 'rtl'
    }
  }, q.arabic_display), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SpeakButton, {
    expectedText: q.arabic_display,
    size: "md"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)'
    }
  }, "Coba ucapkan!"))), q.type === 'speak' && !revealed && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-primary-50)',
      borderRadius: 16,
      padding: '20px 24px',
      textAlign: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 56,
      fontWeight: 700,
      color: 'var(--color-primary)',
      direction: 'rtl',
      lineHeight: 1.5
    }
  }, q.arabic_display), q.transliteration && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--color-text-secondary)',
      fontStyle: 'italic',
      marginTop: 4
    }
  }, q.transliteration), /*#__PURE__*/React.createElement("button", {
    onClick: () => playContoh(q.audio_text, q.audio_ref),
    style: {
      marginTop: 12,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 16px',
      borderRadius: 999,
      cursor: 'pointer',
      border: '1.5px solid var(--color-primary)',
      background: contohPlaying ? 'var(--color-primary)' : 'transparent',
      color: contohPlaying ? '#fff' : 'var(--color-primary)',
      fontSize: 13,
      fontWeight: 600,
      transition: 'all var(--dur-fast)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: contohPlaying ? 'pause' : 'volume-2',
    size: 14,
    color: contohPlaying ? '#fff' : 'var(--color-primary)'
  }), contohPlaying ? 'Memutar…' : 'Dengar contoh')), speakResult === null && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: {
      textAlign: 'center',
      padding: '24px 0'
    }
  }, /*#__PURE__*/React.createElement(SpeakButton, {
    expectedText: q.audio_text,
    size: "md",
    onResult: handleSpeakResult,
    key: speakAttempts
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-light)',
      marginTop: 10
    }
  }, "Tekan mikrofon lalu ucapkan kata di atas")), speakResult === 'correct' && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: {
      padding: 16,
      borderRadius: 12,
      background: 'var(--color-success-50)',
      color: 'var(--color-success-text)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700
    }
  }, "Pengucapan benar!"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 400,
      marginTop: 4,
      opacity: 0.85
    }
  }, q.explanation)), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--color-accent)',
      color: '#fff',
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 13
    }
  }, "+", tadribat1.xp_per_correct, " XP")), speakResult === 'wrong' && /*#__PURE__*/React.createElement("div", {
    className: "anim-in",
    style: {
      padding: 16,
      borderRadius: 12,
      background: 'var(--color-error-50)',
      color: 'var(--color-error-text)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700
    }
  }, "Kurang tepat, coba lagi."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 400,
      marginTop: 4,
      opacity: 0.85
    }
  }, q.explanation))), q.type === 'speak' && revealed && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24,
      padding: 16,
      borderRadius: 12,
      background: currentAnswer.isCorrect ? 'var(--color-success-50)' : 'var(--color-error-50)',
      color: currentAnswer.isCorrect ? 'var(--color-success-text)' : 'var(--color-error-text)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700
    }
  }, currentAnswer.isCorrect ? 'Pengucapan benar!' : currentAnswer.skipped ? 'Soal dilewati.' : 'Kurang tepat.'), /*#__PURE__*/React.createElement("div", {
    lang: "ar",
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 28,
      marginTop: 8,
      direction: 'rtl'
    }
  }, q.arabic_display)), q.type !== 'speak' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 20
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
        fontSize: isAr ? 22 : 16,
        fontWeight: 600,
        textAlign: 'left',
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
  })), q.type !== 'speak' && revealed && /*#__PURE__*/React.createElement("div", {
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
  }, q.explanation)), isCorrect && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--color-accent)',
      color: '#fff',
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 13,
      flexShrink: 0
    }
  }, "+", tadribat1.xp_per_correct, " XP")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end',
      alignItems: 'center'
    }
  }, q.type === 'speak' && !revealed ? /*#__PURE__*/React.createElement(React.Fragment, null, speakResult === null && speakAttempts > 0 && /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: skipSpeak
  }, "Lewati"), speakResult === 'wrong' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: skipSpeak
  }, "Lewati"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setSpeakResult(null)
  }, "Coba Lagi")), speakResult === 'correct' && /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: goNext,
    iconRight: "chevron-right"
  }, allAnswered ? 'Lihat Hasil' : 'Lanjut')) : revealed ? /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: allAnswered ? () => setShowResults(true) : goNext,
    iconRight: allAnswered ? 'check' : 'chevron-right'
  }, allAnswered ? 'Lihat Hasil' : 'Lanjut →') : /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: check,
    disabled: tempSelected == null,
    iconRight: "chevron-right"
  }, "Periksa")))), /*#__PURE__*/React.createElement("div", {
    className: "quiz-nav-col"
  }, /*#__PURE__*/React.createElement(QuizNavigator, {
    count: orderedQuestions.length,
    currentIdx: currentIdx,
    answeredMap: answeredMap,
    onJump: jumpTo,
    allAnswered: allAnswered,
    onFinish: () => setShowResults(true)
  })))));
}
window.Tadribat1Screen = Tadribat1Screen;