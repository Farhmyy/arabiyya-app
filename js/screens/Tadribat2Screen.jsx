/* Tadribat2Screen — Practice: Qawaid */

function useTadribat2Content() {
  const local = DATA.tadribat2.questions;
  const transform = (raw) => {
    const cloudQs = raw.questions || [];
    const compatible =
      cloudQs.length === local.length &&
      local.every((lq, i) => cloudQs[i]?.prompt === lq.prompt);
    if (!compatible) return local;
    return cloudQs.map((q, i) => ({ ...local[i], ...q }));
  };
  return useCloudContent('tadribat2', local, transform);
}

const T2_KEY      = 'arabiyya_quiz_t2';
const T2_DURATION = 900; // 15 minutes

function Tadribat2Screen({ navigate, progress }) {
  const { useState, useEffect, useCallback, useRef } = React;
  const { tadribat2, ui } = DATA;
  const questions = useTadribat2Content();

  const [savedSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(T2_KEY)) || {}; }
    catch { return {}; }
  });

  /* ── Core state ── */
  const [started,      setStarted]      = useState(false);
  const [showResults,  setShowResults]  = useState(false);
  const [currentIdx,   setCurrentIdx]   = useState(savedSession.currentIdx ?? 0);
  const [tempSelected, setTempSelected] = useState(savedSession.tempSelected ?? null);
  const [answeredMap,  setAnsweredMap]  = useState(savedSession.answeredMap ?? {});
  const completedRef = useRef(false);

  /* ── Derived ── */
  const q             = questions[currentIdx] || null;
  const currentAnswer = answeredMap[currentIdx];
  const revealed      = currentAnswer != null;
  const allAnswered   = questions.length > 0 && Object.keys(answeredMap).length >= questions.length;
  const score         = Object.values(answeredMap).filter(a => a.isCorrect).length;

  const typeMeta = {
    mcq:       { label: 'Pilihan Ganda', tone: 'primary',  icon: 'edit'       },
    identify:  { label: 'Identifikasi',  tone: 'gold',     icon: 'search'     },
    transform: { label: 'Transformasi',  tone: 'primary',  icon: 'refresh-cw' },
    order:     { label: 'Susun Kalimat', tone: 'neutral',  icon: 'list'       },
  };

  /* ── Timer ── */
  const handleTimeUp = useCallback(() => {
    window.showToast && window.showToast('⏰ Waktu latihan habis!', 'error');
    setShowResults(true);
  }, []);

  const { timeLeft, formattedTime, isWarning, isUrgent, reset: resetTimer } = useQuizTimer({
    durationSeconds: T2_DURATION,
    active: started && !showResults,
    initialTimeLeft: savedSession.timeLeft,
    onTimeUp: handleTimeUp,
  });

  /* ── Session persistence ── */
  useEffect(() => {
    if (!started || questions.length === 0 || showResults) return;
    try {
      sessionStorage.setItem(T2_KEY, JSON.stringify({ currentIdx, tempSelected, answeredMap, timeLeft }));
    } catch {}
  }, [currentIdx, tempSelected, answeredMap, timeLeft, started, showResults]);

  /* ── Complete section when results shown ── */
  useEffect(() => {
    if (!showResults || !started || completedRef.current) return;
    completedRef.current = true;
    const finalScore = Object.values(answeredMap).filter(a => a.isCorrect).length;
    const wrongIndices = Object.keys(answeredMap).filter(k => !answeredMap[k].isCorrect).map(Number);
    progress?.completeSection?.('3', 'tadribat_2', finalScore, questions.length, wrongIndices);
    sessionStorage.removeItem(T2_KEY);
  }, [showResults]);

  /* ── Navigation ── */
  const jumpTo = useCallback((i) => {
    setCurrentIdx(i);
    setTempSelected(null);
  }, []);

  const goNext = useCallback(() => {
    const total = questions.length;
    for (let i = currentIdx + 1; i < total; i++) {
      if (!answeredMap[i]) { jumpTo(i); return; }
    }
    for (let i = 0; i < currentIdx; i++) {
      if (!answeredMap[i]) { jumpTo(i); return; }
    }
    setShowResults(true);
  }, [currentIdx, answeredMap, questions.length, jumpTo]);

  /* ── Check ── */
  const check = () => {
    if (tempSelected == null || !q || revealed) return;
    const correct = tempSelected === q.correct_index;
    const alreadyDone = progress && progress.sectionStatus('3', 'tadribat_2') === 'done';
    if (correct && !alreadyDone && progress?.addXP) progress.addXP(tadribat2.xp_per_correct);
    window.showToast && window.showToast(correct ? ui.feedback.correct : ui.feedback.wrong, correct ? 'success' : 'error');
    setAnsweredMap(prev => ({ ...prev, [currentIdx]: { selected: tempSelected, isCorrect: correct } }));
  };

  const restart = () => {
    completedRef.current = false;
    sessionStorage.removeItem(T2_KEY);
    resetTimer();
    setCurrentIdx(0); setTempSelected(null); setAnsweredMap({});
    setShowResults(false);
    setStarted(true);
  };

  /* ── Timer chip ── */
  const TimerChip = () => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      color: isUrgent ? 'var(--color-error)' : isWarning ? 'var(--color-accent)' : 'var(--color-text-secondary)',
      fontWeight: isWarning ? 700 : 600, fontSize: 14,
    }}>
      <Icon name="clock" size={15} color={isUrgent ? 'var(--color-error)' : isWarning ? 'var(--color-accent)' : 'var(--color-text-light)'} />
      <span className={isUrgent ? 'pulse' : ''}>{formattedTime}</span>
    </div>
  );

  /* ── Intro screen ── */
  if (!started) {
    const hasSession = Object.keys(savedSession.answeredMap || {}).length > 0 && (savedSession.timeLeft ?? 0) > 0;
    const prevDone   = progress && progress.sectionStatus('3', 'tadribat_2') === 'done';
    const prevData   = progress?.chapters?.['3']?.tadribat_2;

    const startFresh = () => {
      completedRef.current = false;
      sessionStorage.removeItem(T2_KEY);
      resetTimer();
      setCurrentIdx(0); setTempSelected(null); setAnsweredMap({});
      setShowResults(false);
      setStarted(true);
    };

    return (
      <div className="page anim-in">
        <a onClick={() => navigate('chapter/3')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 24 }}>
          <Icon name="chevron-left" size={16} /> Bab 3 — Menjenguk Orang Sakit
        </a>
        <Card padding={40} style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 999, background: 'linear-gradient(135deg, var(--color-secondary) 0%, #7c3aed 100%)', color: '#fff', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="list" size={40} />
          </div>
          <Badge tone="primary" style={{ marginBottom: 12 }}>التَّدْرِيبَاتُ ٢ · Latihan 2</Badge>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: '10px 0 8px' }}>Latihan Qawaid</h1>
          <p lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 24, color: 'var(--color-primary)', margin: '4px 0 16px', direction: 'rtl' }}>الْقَوَاعِدُ</p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            Uji pemahaman tata bahasa: fi'il mādhī, mudhāri', dan jumlah fi'liyyah.<br />
            Kamu bisa <strong>melompat antar soal</strong> sesuai keinginan.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Jumlah Soal', value: `${questions.length} soal`,              icon: 'edit'  },
              { label: 'XP per Soal', value: `+${tadribat2.xp_per_correct} XP`,       icon: 'star'  },
              { label: 'Waktu',       value: `${Math.round(T2_DURATION / 60)} menit`, icon: 'clock' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--color-primary-50)', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                <Icon name={s.icon} size={20} color="var(--color-primary)" />
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary)', margin: '6px 0 2px' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {prevDone && prevData && (
            <div style={{ background: 'var(--color-success-50)', border: '1px solid var(--color-success-border)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: 'var(--color-success-text)' }}>
              Skor terakhir: <strong>{prevData.score}/{prevData.maxScore}</strong>
              {prevData.bestScore > prevData.score && <> · Terbaik: <strong>{prevData.bestScore}/{prevData.maxScore}</strong></>}
              {prevData.attempts > 0 && <> · {prevData.attempts}× percobaan</>}
            </div>
          )}
          <div style={{ background: 'var(--color-primary-50)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'left' }}>
            ⏱️ Waktu berjalan otomatis. Bisa dicoba berkali-kali.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {hasSession && (
              <Button variant="secondary" icon="play" onClick={() => setStarted(true)}>
                Lanjutkan (Soal {(savedSession.currentIdx ?? 0) + 1})
              </Button>
            )}
            <Button variant="primary" iconRight="chevron-right" onClick={startFresh}>
              {hasSession ? 'Mulai Ulang' : 'Mulai Latihan'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Results screen ── */
  if (showResults) {
    const prevData    = progress?.chapters?.['3']?.tadribat_2;
    const prevBest    = prevData?.bestScore ?? prevData?.score ?? 0;
    const displayBest = Math.max(score, prevBest);
    const isNewBest   = score > (prevData?.bestScore ?? prevData?.score ?? 0);
    const passing     = score >= Math.ceil(questions.length * 0.6);
    const perfectScore = score === questions.length;

    return (
      <div className="page anim-in">
        <a onClick={() => navigate('chapter/3')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 16 }}>
          <Icon name="chevron-left" size={16} /> Bab 3
        </a>
        <Card padding={36} style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
          <div className="pulse" style={{ width: 80, height: 80, borderRadius: 999, background: perfectScore ? 'var(--color-accent)' : passing ? 'var(--color-primary-bg)' : 'var(--color-error)', color: '#fff', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={perfectScore ? 'trophy' : 'award'} size={40} />
          </div>

          <Badge tone={perfectScore ? 'gold' : passing ? 'primary' : 'neutral'} style={{ marginBottom: 10 }}>
            {perfectScore ? '🏆 Nilai Sempurna!' : passing ? '✅ Lulus!' : '💪 Coba Lagi'}
          </Badge>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 0' }}>{ui.feedback.quiz_complete}</h2>

          {/* Score cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '20px 0' }}>
            <div style={{ background: 'var(--color-primary-50)', borderRadius: 14, padding: '16px 12px' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Skor Ini</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)' }}>{score}<span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-light)' }}>/{questions.length}</span></div>
            </div>
            <div style={{ background: 'var(--color-accent-50)', borderRadius: 14, padding: '16px 12px' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Skor Terbaik</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-accent)' }}>{displayBest}<span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-light)' }}>/{questions.length}</span></div>
              {isNewBest && <div style={{ fontSize: 10, color: 'var(--color-success)', fontWeight: 700, marginTop: 2 }}>🆕 Rekor Baru!</div>}
            </div>
          </div>

          {/* Answer recap */}
          <div style={{ textAlign: 'left', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {questions.map((oq, i) => {
              const a = answeredMap[i];
              const m = typeMeta[oq?.type] || typeMeta.mcq;
              if (!a) return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <Icon name="minus-circle" size={16} color="var(--color-text-light)" />
                  <span style={{ fontSize: 13, color: 'var(--color-text-light)' }}>Soal {i + 1} — tidak dijawab</span>
                </div>
              );
              const optText = a.selected != null ? oq.options?.[a.selected] : '—';
              const isAr = optText && /[؀-ۿ]/.test(optText);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: a.isCorrect ? 'var(--color-success-50)' : 'var(--color-error-50)', border: `1px solid ${a.isCorrect ? 'var(--color-success-border)' : 'var(--color-error-border)'}` }}>
                  <Icon name={a.isCorrect ? 'check-circle' : 'x-circle'} size={16} color={a.isCorrect ? 'var(--color-success)' : 'var(--color-error)'} />
                  <Badge tone={m.tone} style={{ flexShrink: 0 }}>{m.label.slice(0, 4)}</Badge>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Soal {i + 1}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flex: 1, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', direction: isAr ? 'rtl' : 'ltr' }}>
                    {optText}
                  </span>
                  {!a.isCorrect && a.selected != null && (() => {
                    const corrText = oq.options?.[oq.correct_index];
                    const isCAr = corrText && /[؀-ۿ]/.test(corrText);
                    return <span style={{ fontSize: 11, color: 'var(--color-success-text)', fontFamily: isCAr ? 'var(--font-arabic)' : 'inherit' }}>✓ {corrText}</span>;
                  })()}
                </div>
              );
            })}
          </div>

          <ProgressBar value={score} max={questions.length} color={passing ? 'gradient' : 'primary'} showPct={false} />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
            <Button variant="secondary" icon="rotate" onClick={restart}>Ulangi Latihan</Button>
            <Button variant="primary" iconRight="home" onClick={() => navigate('chapter/3')}>Selesai</Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Question screen ── */
  const isCorrect = currentAnswer ? currentAnswer.isCorrect : false;

  return (
    <div className="page anim-in">
      <a onClick={() => navigate('chapter/3')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 16 }}>
        <Icon name="chevron-left" size={16} /> Bab 3 — Menjenguk Orang Sakit
      </a>

      {/* Centered quiz content area */}
      <div style={{ maxWidth: 940, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Tadribat 2 · Latihan Qawaid</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>Fi'il mādhī, mudhāri', & jumlah fi'liyyah</div>
        </div>
        <TimerChip />
      </div>

      {/* Progress */}
      <StepProgress current={Object.keys(answeredMap).length} total={questions.length} style={{ marginBottom: 0 }} />

      {/* Two-column: question left, navigator right */}
      <div className="quiz-with-sidebar">
        <div className="quiz-main-col">
          {/* Question card */}
          {q && (
            <Card padding={36} style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Pertanyaan {currentIdx + 1}</div>
            {(() => { const m = typeMeta[q.type] || typeMeta.mcq; return <Badge tone={m.tone} icon={m.icon}>{m.label}</Badge>; })()}
          </div>

          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 18, lineHeight: 1.4 }}>{q.prompt}</div>

          {/* Order type: token chips */}
          {q.type === 'order' && q.tokens && (
            <div style={{ background: 'var(--color-accent-50)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, border: '1px solid var(--color-accent-100)' }}>
              <div style={{ fontSize: 12, color: 'var(--color-amber-text)', fontWeight: 600, marginBottom: 8 }}>Kata-kata yang harus disusun:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', direction: 'rtl', justifyContent: 'flex-end' }}>
                {q.tokens.map((token, i) => (
                  <div key={i} style={{ padding: '8px 14px', borderRadius: 999, background: 'var(--color-surface)', border: '1.5px solid var(--color-accent-100)', fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 20, color: 'var(--color-amber-text)' }}>
                    {token}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arabic display */}
          {q.arabic_display && q.type !== 'order' && (
            <div style={{ background: 'var(--color-accent-50)', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'center', border: '1px solid var(--color-accent-100)' }}>
              <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 40, fontWeight: 700, color: 'var(--color-amber-text)', textAlign: 'center', direction: 'rtl', lineHeight: 1.6 }}>
                {q.arabic_display}
              </div>
            </div>
          )}

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }} className="quiz-grid">
            {q.options.map((opt, oi) => {
              const sel      = revealed ? currentAnswer.selected : tempSelected;
              const isSel    = sel === oi;
              const isRight  = revealed && oi === q.correct_index;
              const isWrong  = revealed && isSel && oi !== q.correct_index;
              const isAr     = /[؀-ۿ]/.test(opt);
              const isOrder  = q.type === 'order' && isAr;
              return (
                <button key={oi} onClick={() => !revealed && setTempSelected(oi)} disabled={revealed}
                  style={{ padding: isOrder ? '14px 16px' : '16px 18px', borderRadius: 14, border: `2px solid ${isRight ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : isSel ? 'var(--color-primary)' : 'var(--color-border)'}`, background: isRight ? 'var(--color-success-50)' : isWrong ? 'var(--color-error-50)' : isSel ? 'var(--color-primary-50)' : 'var(--color-surface)', color: isRight ? 'var(--color-success-text)' : isWrong ? 'var(--color-error-text)' : 'var(--color-text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-latin)', fontSize: isOrder ? 16 : isAr ? 22 : 15, fontWeight: 600, textAlign: isAr ? 'right' : 'left', cursor: revealed ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all var(--dur-med) var(--ease-out)', direction: isAr ? 'rtl' : 'ltr', wordBreak: isOrder ? 'keep-all' : 'normal' }}>
                  <span>
                    {!isAr && <span style={{ color: 'var(--color-text-light)', marginRight: 8 }}>{String.fromCharCode(65 + oi)}.</span>}
                    {opt}
                  </span>
                  {isRight && <Icon name="check-circle" size={20} color="var(--color-success)" />}
                  {isWrong && <Icon name="x-circle"     size={20} color="var(--color-error)"   />}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {revealed && (
            <div className="anim-in" style={{ padding: 16, borderRadius: 12, marginBottom: 16, background: isCorrect ? 'var(--color-success-50)' : 'var(--color-error-50)', color: isCorrect ? 'var(--color-success-text)' : 'var(--color-error-text)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div>{isCorrect ? ui.feedback.correct : ui.feedback.wrong}</div>
                <div style={{ fontSize: 13, fontWeight: 400, marginTop: 4, opacity: 0.85 }}>{q.explanation}</div>
              </div>
              {isCorrect && <span style={{ background: 'var(--color-accent)', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 13, flexShrink: 0 }}>+{tadribat2.xp_per_correct} XP</span>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {!revealed
              ? <Button variant="primary" onClick={check} disabled={tempSelected == null} iconRight="chevron-right">Periksa</Button>
              : <Button variant="primary" onClick={allAnswered ? () => setShowResults(true) : goNext} iconRight={allAnswered ? 'check' : 'chevron-right'}>
                  {allAnswered ? 'Lihat Hasil' : 'Lanjut →'}
                </Button>
            }
          </div>
            </Card>
          )}
        </div>
        <div className="quiz-nav-col">
          <QuizNavigator
            count={questions.length}
            currentIdx={currentIdx}
            answeredMap={answeredMap}
            onJump={jumpTo}
            allAnswered={allAnswered}
            onFinish={() => setShowResults(true)}
          />
        </div>
      </div>

      </div>{/* end centered wrapper */}
    </div>
  );
}

window.Tadribat2Screen = Tadribat2Screen;
