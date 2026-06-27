/* ImtihanScreen — Ujian Akhir BAB 3 (Comprehensive Final Exam) */

const IMTIHAN_KEY      = 'arabiyya_quiz_imtihan';
const IMTIHAN_DURATION = 1800; // 30 minutes
const MAX_ATTEMPTS     = 3;

function ImtihanScreen({ navigate, progress }) {
  const { useState, useEffect, useCallback, useRef } = React;
  const { imtihan, ui } = DATA;
  const questions = imtihan?.questions ?? [];

  const [savedSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(IMTIHAN_KEY)) || {}; }
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
  const imtihanData  = progress?.chapters?.['3']?.imtihan;
  const attemptsUsed = imtihanData?.attempts ?? 0;
  const blocked      = attemptsUsed >= MAX_ATTEMPTS;

  const q             = questions[currentIdx] || null;
  const currentAnswer = answeredMap[currentIdx];
  const revealed      = currentAnswer != null;
  const allAnswered   = questions.length > 0 && Object.keys(answeredMap).length >= questions.length;
  const score         = Object.values(answeredMap).filter(a => a.isCorrect).length;

  /* ── Timer ── */
  const handleTimeUp = useCallback(() => {
    window.showToast && window.showToast('⏰ Waktu ujian habis!', 'error');
    setShowResults(true);
  }, []);

  const { timeLeft, formattedTime, isWarning, isUrgent, reset: resetTimer } = useQuizTimer({
    durationSeconds: IMTIHAN_DURATION,
    active: started && !showResults,
    initialTimeLeft: savedSession.timeLeft,
    onTimeUp: handleTimeUp,
  });

  /* ── Session persistence ── */
  useEffect(() => {
    if (!started || questions.length === 0 || showResults) return;
    try {
      sessionStorage.setItem(IMTIHAN_KEY, JSON.stringify({ currentIdx, tempSelected, answeredMap, timeLeft }));
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
    if (correct && attemptsUsed === 0 && progress?.addXP) progress.addXP(imtihan.xp_per_correct);
    window.showToast && window.showToast(correct ? ui.feedback.correct : ui.feedback.wrong, correct ? 'success' : 'error');
    setAnsweredMap(prev => ({ ...prev, [currentIdx]: { selected: tempSelected, isCorrect: correct } }));
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

  /* ── Guard: data.js not yet updated in cache ── */
  if (!imtihan) {
    return (
      <div className="page anim-in" style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Data ujian tidak ditemukan. Silakan{' '}
          <a onClick={() => window.location.reload()} style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>
            muat ulang halaman
          </a>.
        </p>
      </div>
    );
  }

  /* ── Intro screen ── */
  if (!started) {
    const hasSession = Object.keys(savedSession.answeredMap || {}).length > 0 && (savedSession.timeLeft ?? 0) > 0;

    const startExam = () => {
      completedRef.current = false;
      sessionStorage.removeItem(IMTIHAN_KEY);
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
          <div style={{ width: 88, height: 88, borderRadius: 999, background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary-bg) 100%)', color: '#fff', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="award" size={44} />
          </div>

          <Badge tone="gold" style={{ marginBottom: 12 }}>الامْتِحَان · Ujian Akhir</Badge>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '10px 0 8px' }}>Ujian Akhir BAB 3</h1>
          <p lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 26, color: 'var(--color-primary)', margin: '4px 0 16px', direction: 'rtl' }}>
            عِيَادَةُ الْمَرِيضِ
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            Ujian komprehensif mencakup seluruh materi BAB 3:<br />
            <strong>Hiwar</strong>, <strong>Mufrodat</strong>, dan <strong>Qawaid</strong>.<br />
            Kamu bisa <strong>melompat antar soal</strong> sesuai keinginan.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Jumlah Soal',      value: `${questions.length} soal`,                   icon: 'edit'         },
              { label: 'XP per Soal',      value: `+${imtihan.xp_per_correct} XP`,              icon: 'star'         },
              { label: 'Nilai Lulus',      value: '≥ 60%',                                        icon: 'check-circle' },
              { label: 'Waktu Pengerjaan', value: `${Math.round(IMTIHAN_DURATION / 60)} menit`, icon: 'clock'        },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--color-primary-50)', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                <Icon name={s.icon} size={20} color="var(--color-primary)" />
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)', margin: '6px 0 2px' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Attempt counter */}
          <div style={{ background: blocked ? 'var(--color-error-50)' : 'var(--color-accent-50)', border: `1px solid ${blocked ? 'var(--color-error-border)' : 'var(--color-accent-100)'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: blocked ? 'var(--color-error-text)' : 'var(--color-amber-text)', fontWeight: 600 }}>
            {blocked
              ? `❌ Percobaan habis (${attemptsUsed}/${MAX_ATTEMPTS}). Hubungi guru untuk reset.`
              : `Percobaan ke-${attemptsUsed + 1} dari ${MAX_ATTEMPTS}`
            }
          </div>

          {/* Previous best */}
          {imtihanData?.bestScore != null && (
            <div style={{ background: 'var(--color-success-50)', border: '1px solid var(--color-success-border)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: 'var(--color-success-text)' }}>
              Skor terbaik: <strong>{imtihanData.bestScore}/{imtihanData.maxScore}</strong>
              {imtihanData.score !== imtihanData.bestScore && <> · Terakhir: <strong>{imtihanData.score}/{imtihanData.maxScore}</strong></>}
            </div>
          )}

          <div style={{ background: 'var(--color-accent-50)', border: '1px solid var(--color-accent-100)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--color-amber-text)', textAlign: 'left' }}>
            ⚠️ <strong>Perhatian:</strong> Waktu berjalan sejak kamu mulai ujian.
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {hasSession && !blocked && (
              <Button variant="secondary" icon="play" onClick={() => setStarted(true)}>
                Lanjutkan (Soal {(savedSession.currentIdx ?? 0) + 1})
              </Button>
            )}
            <Button variant="primary" iconRight="chevron-right" onClick={startExam} disabled={blocked}>
              Mulai Ujian
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Results screen ── */
  if (showResults) {
    const prevBest    = imtihanData?.bestScore ?? imtihanData?.score ?? 0;
    const displayBest = Math.max(score, prevBest);
    const isNewBest   = score > (imtihanData?.bestScore ?? imtihanData?.score ?? 0);
    const passing     = score >= Math.ceil(questions.length * 0.6);
    const perfectScore = score === questions.length;
    const finalAttempts = Math.min(attemptsUsed + 1, MAX_ATTEMPTS);

    return (
      <div className="page anim-in">
        <a onClick={() => navigate('chapter/3')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 16 }}>
          <Icon name="chevron-left" size={16} /> Bab 3
        </a>
        <Card padding={36} style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
          <div className="pulse" style={{ width: 80, height: 80, borderRadius: 999, background: perfectScore ? 'var(--color-accent)' : passing ? 'var(--color-primary-bg)' : 'var(--color-error)', color: '#fff', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={perfectScore ? 'trophy' : passing ? 'award' : 'star'} size={40} />
          </div>

          <Badge tone={perfectScore ? 'gold' : passing ? 'primary' : 'neutral'} style={{ marginBottom: 10 }}>
            {perfectScore ? '🏆 Nilai Sempurna!' : passing ? '✅ Lulus!' : '💪 Coba Lagi'}
          </Badge>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 0' }}>Ujian Selesai!</h2>

          {/* Score cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '20px 0' }}>
            <div style={{ background: 'var(--color-primary-50)', borderRadius: 14, padding: '16px 12px' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Skor Ini</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary)' }}>{score}<span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-light)' }}>/{questions.length}</span></div>
              {attemptsUsed === 0 && <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 2 }}>+{score * imtihan.xp_per_correct} XP</div>}
            </div>
            <div style={{ background: 'var(--color-accent-50)', borderRadius: 14, padding: '16px 12px' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Skor Terbaik</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-accent)' }}>{displayBest}<span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-light)' }}>/{questions.length}</span></div>
              {isNewBest && <div style={{ fontSize: 10, color: 'var(--color-success)', fontWeight: 700, marginTop: 2 }}>🆕 Rekor Baru!</div>}
            </div>
          </div>

          {/* Remaining attempts */}
          {finalAttempts < MAX_ATTEMPTS && (
            <div style={{ background: 'var(--color-accent-50)', border: '1px solid var(--color-accent-100)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--color-amber-text)' }}>
              Sisa percobaan: <strong>{MAX_ATTEMPTS - finalAttempts}</strong> dari {MAX_ATTEMPTS}
            </div>
          )}
          {finalAttempts >= MAX_ATTEMPTS && (
            <div style={{ background: 'var(--color-error-50)', border: '1px solid var(--color-error-border)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--color-error-text)' }}>
              Percobaan habis. Hubungi guru untuk reset.
            </div>
          )}

          {/* Answer recap */}
          <div style={{ textAlign: 'left', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {questions.map((oq, i) => {
              const a = answeredMap[i];
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
                  <span style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}>Soal {i + 1}</span>
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
            <Button variant="primary" iconRight="home" onClick={() => navigate('chapter/3')}>Kembali ke Beranda Bab</Button>
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
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Imtihan · Ujian Akhir BAB 3</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>Hiwar, Mufrodat, dan Qawaid</div>
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
            <Badge tone="gold" icon="award">Ujian Akhir</Badge>
          </div>

          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 18, lineHeight: 1.4 }}>{q.prompt}</div>

          {q.arabic_display && (
            <div style={{ background: 'var(--color-accent-50)', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'center', border: '1px solid var(--color-accent-100)' }}>
              <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 40, fontWeight: 700, color: 'var(--color-amber-text)', textAlign: 'center', direction: 'rtl', lineHeight: 1.6 }}>
                {q.arabic_display}
              </div>
            </div>
          )}

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }} className="quiz-grid">
            {q.options.map((opt, oi) => {
              const sel     = revealed ? currentAnswer.selected : tempSelected;
              const isSel   = sel === oi;
              const isRight = revealed && oi === q.correct_index;
              const isWrong = revealed && isSel && oi !== q.correct_index;
              const isAr    = /[؀-ۿ]/.test(opt);
              return (
                <button key={oi} onClick={() => !revealed && setTempSelected(oi)} disabled={revealed}
                  style={{ padding: '16px 18px', borderRadius: 14, border: `2px solid ${isRight ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : isSel ? 'var(--color-primary)' : 'var(--color-border)'}`, background: isRight ? 'var(--color-success-50)' : isWrong ? 'var(--color-error-50)' : isSel ? 'var(--color-primary-50)' : 'var(--color-surface)', color: isRight ? 'var(--color-success-text)' : isWrong ? 'var(--color-error-text)' : 'var(--color-text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-latin)', fontSize: isAr ? 22 : 15, fontWeight: 600, textAlign: isAr ? 'right' : 'left', cursor: revealed ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all var(--dur-med) var(--ease-out)', direction: isAr ? 'rtl' : 'ltr' }}>
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
              {isCorrect && attemptsUsed === 0 && <span style={{ background: 'var(--color-accent)', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 13, flexShrink: 0 }}>+{imtihan.xp_per_correct} XP</span>}
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

window.ImtihanScreen = ImtihanScreen;
