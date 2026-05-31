/* Tadribat2Screen — Practice: Qawaid (final exercise) */

function useTadribat2Content() {
  const { useState, useEffect } = React;
  const [questions, setQuestions] = useState(null);
  useEffect(() => {
    fbDb.collection('content').doc('tadribat2').get()
      .then(doc => {
        if (doc.exists && doc.data().questions && doc.data().questions.length > 0) {
          setQuestions(doc.data().questions);
        }
      })
      .catch(() => {});
  }, []);
  return questions || DATA.tadribat2.questions;
}

function Tadribat2Screen({ navigate, progress }) {
  const { useState } = React;
  const { tadribat2, ui } = DATA;
  const questions = useTadribat2Content();

  const [idx,      setIdx]      = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score,    setScore]    = useState(0);
  const [answers,  setAnswers]  = useState([]);

  const finished  = idx >= questions.length;
  const q         = !finished ? questions[idx] : null;
  const isCorrect = q ? selected === q.correct_index : false;

  const typeMeta = {
    mcq:       { label: 'Pilihan Ganda', tone: 'primary',  icon: 'edit'       },
    identify:  { label: 'Identifikasi',  tone: 'gold',     icon: 'search'     },
    transform: { label: 'Transformasi',  tone: 'primary',  icon: 'refresh-cw' },
    order:     { label: 'Susun Kalimat', tone: 'neutral',  icon: 'list'       },
  };

  const check = () => {
    if (selected == null || !q) return;
    const correct = selected === q.correct_index;
    setRevealed(true);
    if (correct) {
      setScore(s => s + 1);
      if (progress && progress.addXP) progress.addXP(tadribat2.xp_per_correct);
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

  React.useEffect(() => {
    if (finished && progress && progress.completeSection) {
      progress.completeSection('3', 'tadribat_2', score, questions.length);
    }
  }, [finished]);

  const perfectScore = score === questions.length;
  const passing      = score >= Math.ceil(questions.length * 0.6);

  return (
    <div className="page anim-in">
      <a onClick={() => navigate('chapter/3')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 16 }}>
        <Icon name="chevron-left" size={16} /> Bab 3 — Menjenguk Orang Sakit
      </a>

      {/* Step progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Tadribat 2 · Latihan Qawaid</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 2 }}>Uji pemahaman tata bahasa (fi'il mādhī, mudhāri', & jumlah fi'liyyah)</div>
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
          {/* Type badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Pertanyaan {idx + 1}</div>
            {(() => {
              const m = typeMeta[q.type] || typeMeta.mcq;
              return <Badge tone={m.tone} icon={m.icon}>{m.label}</Badge>;
            })()}
          </div>

          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 18, lineHeight: 1.4 }}>
            {q.prompt}
          </div>

          {/* Order type: show token chips as hint */}
          {q.type === 'order' && q.tokens && (
            <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '14px 16px', marginBottom: 20, border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: 12, color: '#92400E', fontWeight: 600, marginBottom: 8 }}>Kata-kata yang harus disusun:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', direction: 'rtl', justifyContent: 'flex-end' }}>
                {q.tokens.map((token, i) => (
                  <div key={i} style={{
                    padding: '8px 14px', borderRadius: 999,
                    background: '#fff', border: '1.5px solid #FDE68A',
                    fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 20, color: '#92400E',
                  }}>{token}</div>
                ))}
              </div>
            </div>
          )}

          {/* Arabic display (for identify, transform, mcq with arabic) */}
          {q.arabic_display && q.type !== 'order' && (
            <div style={{ background: '#FFFBEB', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'center', border: '1px solid #FDE68A' }}>
              <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 40, fontWeight: 700, color: '#92400E', textAlign: 'center', direction: 'rtl', lineHeight: 1.6 }}>
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
              /* Order type: options are full sentences, so larger Arabic display */
              const isOrderOpt = q.type === 'order' && isAr;
              return (
                <button key={oi} onClick={() => !revealed && setSelected(oi)} disabled={revealed}
                  style={{
                    padding: isOrderOpt ? '14px 16px' : '16px 18px',
                    borderRadius: 14,
                    border: `2px solid ${isRight ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : isSel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: isRight ? '#F0FDF4' : isWrong ? '#FEF2F2' : isSel ? '#F0FDFA' : 'var(--color-surface)',
                    color: isRight ? '#15803D' : isWrong ? '#B91C1C' : 'var(--color-text-primary)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-latin)',
                    fontSize: isOrderOpt ? 16 : isAr ? 22 : 15,
                    fontWeight: 600,
                    textAlign: isAr ? 'right' : 'left',
                    cursor: revealed ? 'default' : 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all var(--dur-med) var(--ease-out)',
                    direction: isAr ? 'rtl' : 'ltr',
                    wordBreak: isOrderOpt ? 'keep-all' : 'normal',
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
              background: isCorrect ? '#F0FDF4' : '#FEF2F2',
              color: isCorrect ? '#15803D' : '#B91C1C', fontWeight: 600,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            }}>
              <div>
                <div>{isCorrect ? ui.feedback.correct : ui.feedback.wrong}</div>
                <div style={{ fontSize: 13, fontWeight: 400, marginTop: 4, opacity: 0.85 }}>{q.explanation}</div>
              </div>
              {isCorrect && (
                <span style={{ background: 'var(--color-accent)', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 13, flexShrink: 0 }}>
                  +{tadribat2.xp_per_correct} XP
                </span>
              )}
            </div>
          )}

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
            width: 96, height: 96, borderRadius: 999,
            background: perfectScore ? 'var(--color-accent)' : passing ? 'var(--color-primary)' : 'var(--color-error)',
            color: '#fff', margin: '0 auto 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={perfectScore ? 'trophy' : passing ? 'award' : 'star'} size={48} />
          </div>

          <Badge tone={perfectScore ? 'gold' : passing ? 'primary' : 'neutral'} style={{ marginBottom: 12 }}>
            {perfectScore ? '🏆 Nilai Sempurna!' : passing ? '✅ Lulus!' : '💪 Coba Lagi'}
          </Badge>

          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 0' }}>{ui.feedback.quiz_complete}</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>
            Skor kamu: <strong style={{ color: 'var(--color-primary)', fontSize: 22 }}>{score} / {questions.length}</strong>
          </p>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Total XP: <strong>+{score * tadribat2.xp_per_correct} XP</strong>
          </p>

          {/* Answer recap */}
          <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
            {answers.map((a, i) => {
              const m = typeMeta[questions[i].type] || typeMeta.mcq;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12,
                  background: a.isCorrect ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${a.isCorrect ? '#BBF7D0' : '#FECACA'}`,
                }}>
                  <Icon name={a.isCorrect ? 'check-circle' : 'x-circle'} size={18} color={a.isCorrect ? 'var(--color-success)' : 'var(--color-error)'} />
                  <Badge tone={m.tone} style={{ flexShrink: 0 }}>{m.label.slice(0, 4)}</Badge>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Soal {i + 1}</span>
                  <span style={{
                    fontSize: 13, color: 'var(--color-text-secondary)', flex: 1,
                    fontFamily: /[؀-ۿ]/.test(questions[i].options[a.selectedOption]) ? 'var(--font-arabic)' : 'inherit',
                    direction: /[؀-ۿ]/.test(questions[i].options[a.selectedOption]) ? 'rtl' : 'ltr',
                  }}>
                    {questions[i].options[a.selectedOption]}
                  </span>
                  {!a.isCorrect && (
                    <span style={{
                      fontSize: 12, color: '#15803D',
                      fontFamily: /[؀-ۿ]/.test(questions[i].options[a.correctOption]) ? 'var(--font-arabic)' : 'inherit',
                    }}>
                      ✓ {questions[i].options[a.correctOption]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ margin: '24px 0' }}>
            <ProgressBar value={score} max={questions.length} color="gradient" showPct={false} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="secondary" icon="rotate" onClick={restart}>Ulangi</Button>
            <Button variant="primary" iconRight="home" onClick={() => navigate('chapter/3')}>
              Selesai · Ke Beranda Bab
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

window.Tadribat2Screen = Tadribat2Screen;
