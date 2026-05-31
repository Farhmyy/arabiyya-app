/* Tadribat1Screen — Practice: Hiwar & Mufrodat */

function useTadribat1Content() {
  return useCloudContent('tadribat1', DATA.tadribat1.questions, raw => raw.questions || []);
}

function Tadribat1Screen({ navigate, progress }) {
  const { useState, useEffect } = React;
  const { tadribat1, ui } = DATA;
  const questions = useTadribat1Content();

  const [idx,      setIdx]      = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score,    setScore]    = useState(0);
  const [answers,  setAnswers]  = useState([]);
  const [playing,  setPlaying]  = useState(false);

  const finished = idx >= questions.length;
  const q        = !finished ? questions[idx] : null;
  const isCorrect = q ? selected === q.correct_index : false;

  /* Stop TTS when moving between questions */
  useEffect(() => {
    if (window.stopSpeech) window.stopSpeech();
    setPlaying(false);
  }, [idx]);

  useEffect(() => () => { if (window.stopSpeech) window.stopSpeech(); }, []);

  const speakQuestion = () => {
    if (!q || q.type !== 'audio') return;
    if (playing) { if (window.stopSpeech) window.stopSpeech(); setPlaying(false); return; }
    setPlaying(true);
    window.speakArabic(q.audio_text, null, () => setPlaying(false));
  };

  const check = () => {
    if (selected == null || !q) return;
    const correct = selected === q.correct_index;
    setRevealed(true);
    if (correct) {
      setScore(s => s + 1);
      if (progress && progress.addXP) progress.addXP(tadribat1.xp_per_correct);
      window.showToast && window.showToast(ui.feedback.correct, 'success');
    } else {
      window.showToast && window.showToast(ui.feedback.wrong, 'error');
    }
    setAnswers(prev => [...prev, { questionIndex: idx, selectedOption: selected, correctOption: q.correct_index, isCorrect: correct }]);
  };

  const nextQuestion = () => {
    setRevealed(false); setSelected(null); setIdx(idx + 1);
  };

  const restart = () => {
    setIdx(0); setScore(0); setRevealed(false); setSelected(null); setAnswers([]);
  };

  useEffect(() => {
    if (finished && progress && progress.completeSection) {
      progress.completeSection('3', 'tadribat_1', score, questions.length);
    }
  }, [finished]);

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
            {finished ? questions.length : idx + 1} <span style={{ color: 'var(--color-text-light)' }}>dari {questions.length}</span>
          </div>
        </div>
        <StepProgress current={finished ? questions.length : idx} total={questions.length} />
      </div>

      {/* Question card */}
      {!finished ? (
        <Card padding={36} style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Question type badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Pertanyaan {idx + 1}</div>
            <Badge tone={q.type === 'audio' ? 'gold' : 'primary'} icon={q.type === 'audio' ? 'volume-2' : 'edit'}>
              {q.type === 'audio' ? 'Mendengar' : 'Teks'}
            </Badge>
          </div>

          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 18, lineHeight: 1.4 }}>
            {q.prompt}
          </div>

          {/* Audio question: big play button (hide Arabic until revealed) */}
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
                    boxShadow: '0 6px 20px rgba(15,118,110,.4)',
                    transition: 'all var(--dur-fast)',
                  }}>
                  <Icon name={playing ? 'pause' : 'volume-2'} size={36} />
                </button>
                <div style={{ marginTop: 12, fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {playing ? 'Memutar…' : 'Tekan untuk mendengar'}
                </div>
                {revealed && q.audio_text && (
                  <div className="anim-in" style={{ marginTop: 14 }}>
                    <div lang="ar" style={{
                      fontFamily: 'var(--font-arabic)', fontSize: 40, fontWeight: 700,
                      color: 'var(--color-primary)', direction: 'rtl', lineHeight: 1.6,
                    }}>{q.audio_text}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text question: show Arabic display */}
          {q.type === 'text' && q.arabic_display && (
            <div style={{ background: 'var(--color-primary-50)', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'center' }}>
              <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 56, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center', direction: 'rtl' }}>
                {q.arabic_display}
              </div>
            </div>
          )}

          {/* Options */}
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
                    color: isRight ? '#15803D' : isWrong ? '#B91C1C' : 'var(--color-text-primary)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-latin)',
                    fontSize: isAr ? 22 : 16,
                    fontWeight: 600, textAlign: 'left', cursor: revealed ? 'default' : 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all var(--dur-med) var(--ease-out)',
                    direction: isAr ? 'rtl' : 'ltr',
                  }}
                >
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
            <div className="anim-in" style={{
              padding: 16, borderRadius: 12, marginBottom: 16,
              background: isCorrect ? 'var(--color-success-50)' : 'var(--color-error-50)',
              color: isCorrect ? '#15803D' : '#B91C1C', fontWeight: 600,
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

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {!revealed
              ? <Button variant="primary" onClick={check} disabled={selected == null} iconRight="chevron-right">Periksa</Button>
              : <Button variant="primary" onClick={nextQuestion} iconRight="chevron-right">
                  {idx + 1 === questions.length ? 'Lihat Hasil' : 'Soal Berikutnya'}
                </Button>
            }
          </div>
        </Card>
      ) : (
        /* Score summary */
        <Card padding={36} style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div className="pulse" style={{
            width: 80, height: 80, borderRadius: 999,
            background: score >= Math.ceil(questions.length * 0.6) ? 'var(--color-accent)' : 'var(--color-error)',
            color: '#fff', margin: '0 auto 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="award" size={40} />
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{ui.feedback.quiz_complete}</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>
            Skor kamu: <strong style={{ color: 'var(--color-primary)', fontSize: 20 }}>{score} / {questions.length}</strong>
          </p>

          <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12,
                background: a.isCorrect ? 'var(--color-success-50)' : 'var(--color-error-50)',
                border: `1px solid ${a.isCorrect ? '#BBF7D0' : '#FECACA'}`,
              }}>
                <Icon name={a.isCorrect ? 'check-circle' : 'x-circle'} size={18} color={a.isCorrect ? 'var(--color-success)' : 'var(--color-error)'} />
                <Badge tone={questions[i].type === 'audio' ? 'gold' : 'primary'} style={{ flexShrink: 0 }}>
                  {questions[i].type === 'audio' ? '🔊' : 'T'}
                </Badge>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Soal {i + 1}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flex: 1 }}>
                  {questions[i].options[a.selectedOption]}
                </span>
                {!a.isCorrect && <span style={{ fontSize: 12, color: '#15803D' }}>✓ {questions[i].options[a.correctOption]}</span>}
              </div>
            ))}
          </div>

          <div style={{ margin: '24px 0' }}>
            <ProgressBar value={score} max={questions.length} color={score >= Math.ceil(questions.length * 0.6) ? 'gradient' : 'primary'} showPct={false} />
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
