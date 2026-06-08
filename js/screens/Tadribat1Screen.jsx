/* Tadribat1Screen — Practice: Hiwar & Mufrodat */

function useTadribat1Content() {
  /* Baca dari Supabase hanya jika strukturnya cocok dengan data.js (prompt & jumlah sama).
     Speak questions (type:'speak') hanya ada di data.js — cloud hanya menyimpan 10 soal lama.
     audio_ref selalu diambil dari data.js agar audio tetap bekerja. */
  const local = DATA.tadribat1.questions;
  const transform = (raw) => {
    const cloudQs = raw.questions || [];
    const localMC  = local.filter(q => q.type !== 'speak');
    const compatible =
      cloudQs.length === localMC.length &&
      localMC.every((lq, i) => cloudQs[i]?.prompt === lq.prompt);
    if (!compatible) return local;
    return [
      ...cloudQs.map((q, i) => ({ ...localMC[i], ...q, audio_ref: localMC[i]?.audio_ref || null })),
      ...local.filter(q => q.type === 'speak'),
    ];
  };
  return useCloudContent('tadribat1', local, transform);
}

/* Fisher-Yates shuffle — returns new shuffled array */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

const T1_KEY = 'arabiyya_quiz_t1';

function Tadribat1Screen({ navigate, progress }) {
  const { useState, useEffect, useRef } = React;
  const { tadribat1, ui } = DATA;
  const questions = useTadribat1Content();

  const [savedSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(T1_KEY)) || {}; }
    catch { return {}; }
  });

  const [idx,           setIdx]          = useState(savedSession.idx ?? 0);
  const [selected,      setSelected]     = useState(savedSession.selected ?? null);
  const [revealed,      setRevealed]     = useState(savedSession.revealed ?? false);
  const [score,         setScore]        = useState(savedSession.score ?? 0);
  const [answers,       setAnswers]      = useState(savedSession.answers ?? []);
  const [playing,       setPlaying]      = useState(false);
  const playingRef = useRef(false);
  const [questionOrder, setQuestionOrder]= useState(savedSession.questionOrder ?? null);

  /* Per-question speak state — NOT persisted (resets on idx change) */
  const [speakResult,   setSpeakResult]  = useState(null); // null | 'correct' | 'wrong'
  const [speakAttempts, setSpeakAttempts]= useState(0);
  const speakXpGiven = useRef(false); // prevent double XP on repeat visit

  /* Shuffle once after questions load */
  useEffect(() => {
    if (questions.length > 0 && (!questionOrder || questionOrder.length !== questions.length)) {
      setQuestionOrder(shuffleArray(questions.map((_, i) => i)));
    }
  }, [questions.length]);

  const orderedQuestions = (questionOrder && questionOrder.length === questions.length)
    ? questionOrder.map(i => questions[i])
    : questions;

  const finished  = idx >= orderedQuestions.length;
  const q         = !finished ? orderedQuestions[idx] : null;
  const isCorrect = q && q.type !== 'speak' ? selected === q.correct_index : false;

  /* Reset speak state when moving to a new question */
  useEffect(() => {
    setSpeakResult(null);
    setSpeakAttempts(0);
    speakXpGiven.current = false;
    if (window.stopSpeech) window.stopSpeech();
    playingRef.current = false;
    setPlaying(false);
  }, [idx]);

  useEffect(() => () => { playingRef.current = false; if (window.stopSpeech) window.stopSpeech(); }, []);

  /* Persist session */
  useEffect(() => {
    if (orderedQuestions.length === 0) return;
    if (idx >= orderedQuestions.length) {
      sessionStorage.removeItem(T1_KEY);
    } else {
      try {
        sessionStorage.setItem(T1_KEY, JSON.stringify(
          { idx, score, answers, revealed, selected, questionOrder }
        ));
      } catch {}
    }
  }, [idx, score, answers, revealed, selected, questionOrder, orderedQuestions.length]);

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

  const playRef = (audioText, audioRef) => {
    if (window.stopSpeech) window.stopSpeech();
    window.speakArabic(audioText, audioRef || null, () => {});
  };

  const check = () => {
    if (selected == null || !q || q.type === 'speak') return;
    const correct = selected === q.correct_index;
    setRevealed(true);
    if (correct) {
      setScore(s => s + 1);
      const alreadyDone = progress && progress.sectionStatus('3', 'tadribat_1') === 'done';
      if (!alreadyDone && progress && progress.addXP) progress.addXP(tadribat1.xp_per_correct);
      window.showToast && window.showToast(ui.feedback.correct, 'success');
    } else {
      window.showToast && window.showToast(ui.feedback.wrong, 'error');
    }
    setAnswers(prev => [...prev, {
      isCorrect: correct, type: q.type,
      selectedOption: selected, correctOption: q.correct_index,
    }]);
  };

  const handleSpeakResult = (correct) => {
    const isFirst = speakAttempts === 0;
    setSpeakAttempts(prev => prev + 1);
    if (correct) {
      setSpeakResult('correct');
      setScore(s => s + 1);
      if (isFirst && !speakXpGiven.current) {
        speakXpGiven.current = true;
        const alreadyDone = progress && progress.sectionStatus('3', 'tadribat_1') === 'done';
        if (!alreadyDone && progress && progress.addXP) progress.addXP(tadribat1.xp_per_correct);
      }
      window.showToast && window.showToast(ui.feedback.correct, 'success');
      setAnswers(prev => [...prev, { isCorrect: true, type: 'speak', skipped: false }]);
    } else {
      setSpeakResult('wrong');
    }
  };

  const retrySpeak = () => setSpeakResult(null);

  const skipSpeak = () => {
    setAnswers(prev => [...prev, { isCorrect: false, type: 'speak', skipped: true }]);
    nextQuestion();
  };

  const nextQuestion = () => {
    setRevealed(false); setSelected(null); setIdx(idx + 1);
  };

  const restart = () => {
    sessionStorage.removeItem(T1_KEY);
    setIdx(0); setScore(0); setRevealed(false); setSelected(null); setAnswers([]);
    setSpeakResult(null); setSpeakAttempts(0);
    setQuestionOrder(shuffleArray(questions.map((_, i) => i)));
  };

  useEffect(() => {
    if (finished && progress && progress.completeSection) {
      progress.completeSection('3', 'tadribat_1', score, orderedQuestions.length);
      sessionStorage.removeItem(T1_KEY);
    }
  }, [finished]);

  /* ── Badge config per question type ── */
  const typeBadge = {
    audio: { tone: 'gold',    icon: 'volume-2', label: 'Mendengar' },
    text:  { tone: 'primary', icon: 'edit',     label: 'Teks'      },
    speak: { tone: 'neutral', icon: 'mic',      label: 'Ucapkan'   },
  };

  return (
    <div className="page anim-in">
      <a onClick={() => navigate('chapter/3')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 16 }}>
        <Icon name="chevron-left" size={16} /> Bab 3 — Menjenguk Orang Sakit
      </a>

      {/* Step progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Tadribat 1 · Latihan Hiwar & Mufrodat</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>Uji pemahamanmu tentang dialog dan kosakata</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {finished ? orderedQuestions.length : idx + 1} <span style={{ color: 'var(--color-text-light)' }}>dari {orderedQuestions.length}</span>
          </div>
        </div>
        <StepProgress current={finished ? orderedQuestions.length : idx} total={orderedQuestions.length} />
      </div>

      {/* Question card */}
      {!finished ? (
        <Card padding={36} style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Type badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Pertanyaan {idx + 1}</div>
            {q && (() => { const b = typeBadge[q.type] || typeBadge.text; return (
              <Badge tone={b.tone} icon={b.icon}>{b.label}</Badge>
            ); })()}
          </div>

          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 18, lineHeight: 1.4 }}>
            {q.prompt}
          </div>

          {/* ── Audio question ── */}
          {q.type === 'audio' && (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                background: 'var(--color-primary-50)', borderRadius: 20, padding: '28px 20px',
                border: '2px dashed var(--color-secondary)',
              }}>
                <button onClick={speakQuestion}
                  style={{
                    width: 80, height: 80, borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: playing ? 'var(--color-primary)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(15,118,110,.4)', transition: 'all var(--dur-fast)',
                  }}>
                  <Icon name={playing ? 'pause' : 'volume-2'} size={36} />
                </button>
                <div style={{ marginTop: 12, fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {playing ? 'Memutar…' : 'Tekan untuk mendengar'}
                </div>
                {revealed && q.audio_text && (
                  <div className="anim-in" style={{ marginTop: 14 }}>
                    <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 40, fontWeight: 700, color: 'var(--color-primary)', direction: 'rtl', lineHeight: 1.6 }}>
                      {q.audio_text}
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <SpeakButton expectedText={q.audio_text} size="md" />
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Coba ucapkan!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Text question ── */}
          {q.type === 'text' && q.arabic_display && (
            <div style={{ background: 'var(--color-primary-50)', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'center' }}>
              <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 56, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center', direction: 'rtl' }}>
                {q.arabic_display}
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <SpeakButton expectedText={q.arabic_display} size="md" />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Coba ucapkan!</span>
              </div>
            </div>
          )}

          {/* ── Speak question ── */}
          {q.type === 'speak' && (
            <div style={{ marginBottom: 24 }}>
              {/* Word display */}
              <div style={{ background: 'var(--color-primary-50)', borderRadius: 16, padding: '20px 24px', textAlign: 'center', marginBottom: 20 }}>
                <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 60, fontWeight: 700, color: 'var(--color-primary)', direction: 'rtl', lineHeight: 1.5 }}>
                  {q.arabic_display}
                </div>
                {q.transliteration && (
                  <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: 4 }}>
                    {q.transliteration}
                  </div>
                )}
                <button
                  onClick={() => playRef(q.audio_text, q.audio_ref)}
                  style={{
                    marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 16px', borderRadius: 999, cursor: 'pointer',
                    border: '1.5px solid var(--color-primary)',
                    background: 'transparent', color: 'var(--color-primary)',
                    fontSize: 13, fontWeight: 600,
                  }}>
                  <Icon name="volume-2" size={14} color="var(--color-primary)" /> Dengar contoh
                </button>
              </div>

              {/* Mic area */}
              {speakResult === null && (
                <div className="anim-in" style={{ textAlign: 'center', padding: '24px 0' }}>
                  <SpeakButton expectedText={q.audio_text} size="md" onResult={handleSpeakResult} key={speakAttempts} />
                  <div style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 10 }}>
                    Tekan tombol mikrofon lalu ucapkan kata di atas
                  </div>
                </div>
              )}

              {/* Speak feedback */}
              {speakResult === 'correct' && (
                <div className="anim-in" style={{
                  padding: 16, borderRadius: 12,
                  background: 'var(--color-success-50)', color: 'var(--color-success-text)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Pengucapan benar!</div>
                    <div style={{ fontSize: 13, fontWeight: 400, marginTop: 4, opacity: 0.85 }}>{q.explanation}</div>
                  </div>
                  <span style={{ background: 'var(--color-accent)', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 13, flexShrink: 0 }}>
                    +{tadribat1.xp_per_correct} XP
                  </span>
                </div>
              )}

              {speakResult === 'wrong' && (
                <div className="anim-in" style={{
                  padding: 16, borderRadius: 12,
                  background: 'var(--color-error-50)', color: 'var(--color-error-text)',
                }}>
                  <div style={{ fontWeight: 700 }}>Kurang tepat, coba lagi.</div>
                  <div style={{ fontSize: 13, fontWeight: 400, marginTop: 4, opacity: 0.85 }}>{q.explanation}</div>
                </div>
              )}
            </div>
          )}

          {/* ── Options (audio & text only) ── */}
          {q.type !== 'speak' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }} className="quiz-grid">
              {q.options.map((opt, oi) => {
                const isSel   = selected === oi;
                const isRight = revealed && oi === q.correct_index;
                const isWrong = revealed && isSel && oi !== q.correct_index;
                const isAr    = /[؀-ۿ]/.test(opt);
                return (
                  <button key={oi} onClick={() => !revealed && setSelected(oi)} disabled={revealed}
                    style={{
                      padding: '16px 18px', borderRadius: 14,
                      border: `2px solid ${isRight ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : isSel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: isRight ? 'var(--color-success-50)' : isWrong ? 'var(--color-error-50)' : isSel ? 'var(--color-primary-50)' : 'var(--color-surface)',
                      color: isRight ? 'var(--color-success-text)' : isWrong ? 'var(--color-error-text)' : 'var(--color-text-primary)',
                      fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-latin)',
                      fontSize: isAr ? 22 : 16,
                      fontWeight: 600, textAlign: 'left', cursor: revealed ? 'default' : 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all var(--dur-med) var(--ease-out)', direction: isAr ? 'rtl' : 'ltr',
                    }}>
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
          )}

          {/* ── Feedback (audio & text) ── */}
          {q.type !== 'speak' && revealed && (
            <div className="anim-in" style={{
              padding: 16, borderRadius: 12, marginBottom: 16,
              background: isCorrect ? 'var(--color-success-50)' : 'var(--color-error-50)',
              color: isCorrect ? 'var(--color-success-text)' : 'var(--color-error-text)', fontWeight: 600,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            }}>
              <div>
                <div>{isCorrect ? ui.feedback.correct : ui.feedback.wrong}</div>
                <div style={{ fontSize: 13, fontWeight: 400, marginTop: 4, opacity: 0.85 }}>{q.explanation}</div>
              </div>
              {isCorrect && (
                <span style={{ background: 'var(--color-accent)', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 13, flexShrink: 0 }}>
                  +{tadribat1.xp_per_correct} XP
                </span>
              )}
            </div>
          )}

          {/* ── Actions ── */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
            {q.type === 'speak' ? (
              <>
                {speakResult === null && speakAttempts > 0 && (
                  <Button variant="ghost" onClick={skipSpeak}>Lewati</Button>
                )}
                {speakResult === 'wrong' && (
                  <>
                    <Button variant="ghost" onClick={skipSpeak}>Lewati</Button>
                    <Button variant="secondary" onClick={retrySpeak}>Coba Lagi</Button>
                  </>
                )}
                {speakResult === 'correct' && (
                  <Button variant="primary" onClick={nextQuestion} iconRight="chevron-right">
                    {idx + 1 === orderedQuestions.length ? 'Lihat Hasil' : 'Lanjut'}
                  </Button>
                )}
              </>
            ) : (
              !revealed
                ? <Button variant="primary" onClick={check} disabled={selected == null} iconRight="chevron-right">Periksa</Button>
                : <Button variant="primary" onClick={nextQuestion} iconRight="chevron-right">
                    {idx + 1 === orderedQuestions.length ? 'Lihat Hasil' : 'Soal Berikutnya'}
                  </Button>
            )}
          </div>
        </Card>
      ) : (
        /* ── Score summary ── */
        <Card padding={36} style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div className="pulse" style={{
            width: 80, height: 80, borderRadius: 999,
            background: score >= Math.ceil(orderedQuestions.length * 0.6) ? 'var(--color-accent)' : 'var(--color-error)',
            color: '#fff', margin: '0 auto 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="award" size={40} />
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{ui.feedback.quiz_complete}</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>
            Skor kamu: <strong style={{ color: 'var(--color-primary)', fontSize: 20 }}>{score} / {orderedQuestions.length}</strong>
          </p>

          <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
            {answers.map((a, i) => {
              const oq = orderedQuestions[i];
              if (!oq) return null;
              const b = typeBadge[oq.type] || typeBadge.text;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12,
                  background: a.isCorrect ? 'var(--color-success-50)' : 'var(--color-error-50)',
                  border: `1px solid ${a.isCorrect ? 'var(--color-success-border)' : 'var(--color-error-border)'}`,
                }}>
                  <Icon name={a.isCorrect ? 'check-circle' : 'x-circle'} size={18} color={a.isCorrect ? 'var(--color-success)' : 'var(--color-error)'} />
                  <Badge tone={b.tone} style={{ flexShrink: 0 }}>
                    {oq.type === 'audio' ? '🔊' : oq.type === 'speak' ? '🎤' : 'T'}
                  </Badge>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Soal {i + 1}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flex: 1 }}>
                    {oq.type === 'speak'
                      ? <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 16 }}>{oq.arabic_display}</span>
                      : oq.options[a.selectedOption]
                    }
                  </span>
                  {!a.isCorrect && oq.type !== 'speak' && (
                    <span style={{ fontSize: 12, color: 'var(--color-success-text)' }}>✓ {oq.options[a.correctOption]}</span>
                  )}
                  {!a.isCorrect && oq.type === 'speak' && a.skipped && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>dilewati</span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ margin: '24px 0' }}>
            <ProgressBar value={score} max={orderedQuestions.length} color={score >= Math.ceil(orderedQuestions.length * 0.6) ? 'gradient' : 'primary'} showPct={false} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="secondary" icon="rotate" onClick={restart}>Ulangi</Button>
            <Button variant="primary" iconRight="chevron-right" onClick={() => navigate('chapter/3/qawaid')}>
              Lanjut ke Qawaid
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

window.Tadribat1Screen = Tadribat1Screen;
