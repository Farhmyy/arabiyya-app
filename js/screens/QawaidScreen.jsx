/* QawaidScreen — Grammar lesson (التَّرْكِيب) — 3 topics */

/* ── Conjugation Explorer (Penjelajah Tashrif) ── */
function ConjugationExplorer({ topic }) {
  const { useState } = React;
  const [active, setActive] = useState(null);
  const rows = topic.conjugation.rows;

  const pick = (i) => {
    if (window.stopSpeech) window.stopSpeech();
    setActive(i);
    window.speakArabic(rows[i].audio_text, null, null);
  };

  const randomPick = () => pick(Math.floor(Math.random() * rows.length));

  const row = active !== null ? rows[active] : null;

  return (
    <div style={{ background: 'var(--color-primary-50)', borderRadius: 16, padding: '18px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
        🕹️ Penjelajah Tashrif — klik dhamir untuk lihat bentuknya
      </div>

      {/* Pronoun buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
        {rows.map((r, i) => (
          <button key={i} onClick={() => pick(i)}
            style={{
              padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 700,
              background: active === i ? 'var(--color-primary)' : 'var(--color-surface)',
              color: active === i ? '#fff' : 'var(--color-primary)',
              border: `1.5px solid ${active === i ? 'var(--color-primary)' : 'var(--color-primary-100)'}`,
              fontFamily: 'var(--font-arabic)', fontSize: 18,
              transition: 'all var(--dur-fast)',
            }}>
            {r.pronoun_ar}
          </button>
        ))}
        <button onClick={randomPick}
          style={{
            padding: '8px 14px', borderRadius: 999, border: '1.5px solid var(--color-border)',
            background: 'var(--color-surface)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}>
          Acak 🎲
        </button>
      </div>

      {/* Display area */}
      <div style={{
        background: 'var(--color-surface)', borderRadius: 14, padding: '18px 16px', textAlign: 'center',
        border: '1.5px solid var(--color-primary-100)', minHeight: 110,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {row ? (
          <div className="anim-in">
            <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 52, fontWeight: 700, color: 'var(--color-primary)', direction: 'rtl', lineHeight: 1.4 }}>
              {row.verb_form}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              <Badge tone="primary">
                <span lang="ar" style={{ fontFamily: 'var(--font-arabic)' }}>{row.pronoun_ar}</span>
                &nbsp;({row.pronoun_id})
              </Badge>
              <Badge tone="gold">
                akhiran: <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', marginLeft: 4 }}>{row.suffix}</span>
              </Badge>
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 8, fontStyle: 'italic' }}>
              {row.meaning}
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--color-text-light)', fontSize: 14 }}>
            ← Pilih dhamir di atas untuk melihat bentuk kata kerjanya
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Verb Transformer (Mesin Waktu Mādhī ↔ Mudhāri') ── */
function VerbTransformer({ topic }) {
  const { useState } = React;
  const [pairIdx, setPairIdx] = useState(0);
  const [mode,    setMode]    = useState('madhi');

  const pair        = topic.verb_pairs[pairIdx];
  const displayForm = mode === 'madhi' ? pair.madhi : pair.mudhari;

  const speak = () => {
    if (window.stopSpeech) window.stopSpeech();
    window.speakArabic(displayForm, null, null);
  };

  const toggleMode = (m) => {
    setMode(m);
    if (window.stopSpeech) window.stopSpeech();
  };

  return (
    <div style={{ background: 'var(--color-primary-50)', borderRadius: 16, padding: '18px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        ⏱️ Mesin Waktu — pilih kata kerja & toggle waktu
      </div>

      {/* Verb selector */}
      <div style={{ marginBottom: 14 }}>
        <select value={pairIdx} onChange={e => setPairIdx(Number(e.target.value))}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 12,
            border: '1.5px solid var(--color-border)', fontSize: 15, fontWeight: 600,
            background: 'var(--color-surface)', cursor: 'pointer', fontFamily: 'var(--font-arabic)',
            direction: 'rtl',
          }}>
          {topic.verb_pairs.map((p, i) => (
            <option key={i} value={i}>{p.madhi} ← {p.meaning}</option>
          ))}
        </select>
      </div>

      {/* Toggle buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => toggleMode('madhi')}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: mode === 'madhi' ? '#92400E' : 'var(--color-surface)',
            color: mode === 'madhi' ? '#fff' : '#92400E',
            border: `1.5px solid ${mode === 'madhi' ? '#92400E' : 'var(--color-accent-100)'}`,
            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          ⏪ مَاضِي <span style={{ fontSize: 12, opacity: 0.8 }}>(sudah)</span>
        </button>
        <button onClick={() => toggleMode('mudhari')}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: mode === 'mudhari' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: mode === 'mudhari' ? '#fff' : 'var(--color-primary)',
            border: `1.5px solid ${mode === 'mudhari' ? 'var(--color-primary)' : 'var(--color-primary-100)'}`,
            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          ▶️ مُضَارِع <span style={{ fontSize: 12, opacity: 0.8 }}>(sedang/akan)</span>
        </button>
      </div>

      {/* Display form */}
      <div style={{
        background: 'var(--color-surface)', borderRadius: 14, padding: '20px 16px', textAlign: 'center',
        border: `2px solid ${mode === 'madhi' ? 'var(--color-accent-100)' : 'var(--color-primary-100)'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div className="anim-in" key={displayForm} lang="ar" style={{
          fontFamily: 'var(--font-arabic)', fontSize: 52, fontWeight: 700,
          color: mode === 'madhi' ? '#92400E' : 'var(--color-primary)',
          direction: 'rtl', lineHeight: 1.4,
        }}>
          {displayForm}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Badge tone={mode === 'madhi' ? 'gold' : 'primary'}>
            {mode === 'madhi' ? '⏪ Sudah terjadi' : '▶ Sedang / akan'}
          </Badge>
          <Badge tone="neutral">{pair.meaning}</Badge>
        </div>
        <button onClick={speak}
          style={{
            padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'var(--color-secondary)', color: '#fff', fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          <Icon name="volume-2" size={16} /> Dengar
        </button>
      </div>
    </div>
  );
}

/* ── Sentence Builder (Bina Jumlah) ── */
function SentenceBuilder({ topic }) {
  const { useState } = React;
  const [setIdx,   setBuildSetIdx] = useState(0);
  const [placed,   setPlaced]      = useState([]);
  const [result,   setResult]      = useState(null); // null | 'correct' | 'wrong'

  const buildSet  = topic.builder_sets[setIdx];
  /* Tokens NOT yet placed */
  const remaining = buildSet.tokens.filter(t => !placed.includes(t));

  const placeToken = (token) => {
    if (result) return;
    setPlaced(prev => [...prev, token]);
    setResult(null);
  };

  const removeToken = (i) => {
    if (result) return;
    setPlaced(prev => prev.filter((_, idx) => idx !== i));
    setResult(null);
  };

  const check = () => {
    const sentence = placed.join(' ');
    const isOk = sentence === buildSet.answer;
    setResult(isOk ? 'correct' : 'wrong');
    if (isOk) {
      if (window.stopSpeech) window.stopSpeech();
      window.speakArabic(buildSet.answer, null, null);
    }
  };

  const reset = () => { setPlaced([]); setResult(null); };

  const nextSet = () => {
    setBuildSetIdx((setIdx + 1) % topic.builder_sets.length);
    setPlaced([]); setResult(null);
  };

  const roleColors = { fiil: '#34A853', fail: '#4285F4', maful: '#F9A825', jar: '#7C3AED' };
  /* Determine token role for color */
  const getColor = (token) => {
    for (const ex of topic.examples) {
      const part = ex.parts.find(p => p.text === token);
      if (part) return roleColors[part.role] || '#64748B';
    }
    return '#64748B';
  };

  return (
    <div style={{ background: 'var(--color-primary-50)', borderRadius: 16, padding: '18px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        🧩 Bina Jumlah — susun kata menjadi kalimat (RTL: fi'il di sebelah kanan)
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 14 }}>
        Set {setIdx + 1} dari {topic.builder_sets.length}
      </div>

      {/* Available tokens */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 6 }}>Kata tersedia (klik untuk menempatkan):</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, direction: 'rtl', justifyContent: 'flex-end' }}>
          {remaining.length > 0 ? remaining.map((token, i) => (
            <button key={i} onClick={() => placeToken(token)}
              style={{
                padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: getColor(token) + '22',
                color: getColor(token), border: `1.5px solid ${getColor(token)}55`,
                fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 20,
                transition: 'all var(--dur-fast)',
              }}>
              {token}
            </button>
          )) : (
            <div style={{ color: 'var(--color-text-light)', fontSize: 13 }}>— semua kata sudah ditempatkan —</div>
          )}
        </div>
      </div>

      {/* Drop zone — placed tokens (RTL sentence) */}
      <div style={{
        minHeight: 60, background: 'var(--color-surface)', borderRadius: 14, padding: '12px 14px',
        border: `2px dashed ${result === 'correct' ? 'var(--color-success)' : result === 'wrong' ? 'var(--color-error)' : 'var(--color-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        flexWrap: 'wrap', gap: 8, direction: 'rtl',
        marginBottom: 12,
      }}>
        {placed.length > 0 ? placed.map((token, i) => (
          <button key={i} onClick={() => removeToken(i)}
            style={{
              padding: '8px 16px', borderRadius: 999, border: 'none', cursor: result ? 'default' : 'pointer',
              background: getColor(token), color: '#fff',
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 20,
              transition: 'all var(--dur-fast)',
            }}>
            {token}
          </button>
        )) : (
          <div style={{ color: 'var(--color-text-light)', fontSize: 13, width: '100%', textAlign: 'center' }}>
            Klik kata di atas untuk menyusun kalimat…
          </div>
        )}
      </div>

      {/* Feedback */}
      {result && (
        <div className="anim-in" style={{
          padding: '10px 14px', borderRadius: 12, marginBottom: 12,
          background: result === 'correct' ? 'var(--color-success-50)' : 'var(--color-error-50)',
          color: result === 'correct' ? '#15803D' : '#B91C1C', fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name={result === 'correct' ? 'check-circle' : 'x-circle'} size={20} />
          {result === 'correct' ? 'Benar! 🎉 fi\'il → fā\'il → maf\'ūl' : (
            <span>Belum tepat. Jawaban: <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', direction: 'rtl' }}>{buildSet.answer}</span></span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={check} disabled={placed.length < buildSet.tokens.length}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12, border: 'none',
            background: placed.length < buildSet.tokens.length ? 'var(--color-border)' : 'var(--color-primary)',
            color: placed.length < buildSet.tokens.length ? 'var(--color-text-light)' : '#fff',
            fontWeight: 700, fontSize: 14, cursor: placed.length < buildSet.tokens.length ? 'not-allowed' : 'pointer',
          }}>
          Periksa
        </button>
        <button onClick={reset}
          style={{
            padding: '10px 16px', borderRadius: 12, border: '1.5px solid var(--color-border)',
            background: 'var(--color-surface)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
          Reset
        </button>
        <button onClick={nextSet}
          style={{
            padding: '10px 16px', borderRadius: 12, border: '1.5px solid var(--color-border)',
            background: 'var(--color-surface)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
          Set Baru →
        </button>
      </div>
    </div>
  );
}

/* ── Main QawaidScreen ── */
function QawaidScreen({ navigate, progress }) {
  const { useState } = React;
  const { qawaid } = DATA;

  const [activeTab,      setActiveTab]      = useState(0);
  const [understoodTabs, setUnderstoodTabs] = useState(new Set());
  const [showIntro,      setShowIntro]      = useState(true);

  const topic = qawaid.topics[activeTab];

  const markUnderstood = () => {
    const next = new Set(understoodTabs);
    next.add(activeTab);
    setUnderstoodTabs(next);
    if (activeTab < qawaid.topics.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const goToTadribat = () => {
    if (progress && progress.completeSection) {
      progress.completeSection('3', 'qawaid', 3, 3);
    }
    navigate('chapter/3/tadribat-2');
  };

  const allUnderstood = understoodTabs.size === qawaid.topics.length;

  const tabIcons = ['history', 'play', 'layout'];
  const tabColors = ['#92400E', '#0F766E', '#4338CA'];

  return (
    <div className="page anim-in">
      <a onClick={() => navigate('chapter/3')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer', marginBottom: 16 }}>
        <Icon name="chevron-left" size={16} /> Bab 3 — Menjenguk Orang Sakit
      </a>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 lang="ar" style={{ fontFamily: 'var(--font-arabic)', color: 'var(--color-primary)', fontSize: 40, fontWeight: 600, direction: 'rtl', textAlign: 'right', margin: 0 }}>التَّرْكِيب</h1>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>Tata Bahasa · Qawaid</div>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>
          Pelajari fi'il mādhī, fi'il mudhāri', dan jumlah fi'liyyah melalui penjelasan dan latihan interaktif.
        </p>
      </div>

      {/* Intro card */}
      {showIntro && (
        <Card padding={24} accent="gold" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(180deg, var(--color-accent), #D97706)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 24 }}>⏰</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Analogi: Mesin Waktu Kata Kerja</div>
              <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                {qawaid.intro.hook}
              </p>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {qawaid.intro.summary}
              </p>
            </div>
            <button onClick={() => setShowIntro(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', flexShrink: 0 }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </Card>
      )}

      {/* Topic tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--color-border)', borderRadius: 14, padding: 4 }}>
        {qawaid.topics.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activeTab === i ? 'var(--color-surface)' : 'transparent',
              boxShadow: activeTab === i ? 'var(--shadow-card)' : 'none',
              transition: 'all var(--dur-med) var(--ease-out)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name={tabIcons[i]} size={16} color={activeTab === i ? tabColors[i] : 'var(--color-text-light)'} />
              {understoodTabs.has(i) && <Icon name="check-circle" size={14} color="var(--color-success)" />}
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: activeTab === i ? tabColors[i] : 'var(--color-text-light)',
            }}>
              {['Fi\'il Mādhī', 'Fi\'il Mudhāri\'', 'Jumlah Fi\'liyyah'][i]}
            </span>
          </button>
        ))}
      </div>

      {/* Active topic */}
      <div className="anim-in" key={activeTab}>
        {/* Topic header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${tabColors[activeTab]}22`,
              color: tabColors[activeTab],
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name={tabIcons[activeTab]} size={20} />
            </div>
            <div>
              <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 24, fontWeight: 700, color: tabColors[activeTab], direction: 'rtl' }}>
                {topic.title_ar}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text-primary)' }}>{topic.title_id}</div>
            </div>
          </div>
          <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 12, borderLeft: `4px solid ${tabColors[activeTab]}` }}>
            {topic.explanation}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'flex-start' }} className="conjugation-grid">

          {/* LEFT: conjugation table OR structure */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {topic.conjugation && (
              <Card padding={20}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="layers" size={18} color="var(--color-primary)" />
                  Tashrif — <span lang="ar" style={{ fontFamily: 'var(--font-arabic)' }}>{topic.conjugation.root_verb}</span>
                </h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                  "{topic.conjugation.root_meaning}" — 7 dhamir
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {topic.conjugation.rows.map((row, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '72px 1fr auto',
                      gap: 10, alignItems: 'center',
                      padding: '10px 12px', borderRadius: 10,
                      background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)',
                    }}>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 18, fontWeight: 700, color: 'var(--color-text-secondary)', direction: 'rtl', textAlign: 'center' }}>
                        {row.pronoun_ar}
                      </div>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 22, fontWeight: 700, color: 'var(--color-primary)', direction: 'rtl', textAlign: 'center' }}>
                        {row.verb_form}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', minWidth: 100 }}>
                        {row.meaning}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Mudharaah table for topic B */}
            {topic.mudharaah && (
              <Card padding={20}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="key" size={18} color="var(--color-primary)" />
                  Huruf Mudhāra'ah — أَنَيْتُ
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {topic.mudharaah.map((m, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', borderRadius: 10,
                      background: 'var(--color-accent-50)', border: '1px solid var(--color-accent-100)',
                      textAlign: 'center',
                    }}>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 28, fontWeight: 700, color: '#92400E' }}>{m.huruf}</div>
                      <div style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>untuk <span lang="ar" style={{ fontFamily: 'var(--font-arabic)' }}>{m.for}</span></div>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 18, color: 'var(--color-primary)', marginTop: 4 }}>{m.example}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Structure for topic C */}
            {topic.structure && (
              <Card padding={20}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="layout" size={18} color="var(--color-primary)" />
                  Pola Kalimat
                </h3>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14, direction: 'rtl' }}>
                  {topic.structure.map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{
                        padding: '10px 16px', borderRadius: 10,
                        background: s.color + '22', color: s.color,
                        border: `1.5px solid ${s.color}55`,
                        fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 20,
                      }}>{s.role_ar}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>{s.role_id}</div>
                    </div>
                  ))}
                </div>
                {topic.rule_note && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--color-error-50)', border: '1px solid #FECACA', fontSize: 13, color: '#B91C1C', fontWeight: 600 }}>
                    ⚠️ {topic.rule_note}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* RIGHT: examples + interactive */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card padding={20}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="message" size={18} color="var(--color-primary)" />
                Contoh Kalimat
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topic.examples.map((ex, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)' }}>
                    {topic.structure ? (
                      /* Colored parts for jumlah filiyyah */
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 20, fontWeight: 600, direction: 'rtl', textAlign: 'right', lineHeight: 1.8, marginBottom: 4 }}>
                        {ex.parts.map((p, pi) => {
                          const roleColors2 = { fiil: '#34A853', fail: '#4285F4', maful: '#F9A825', jar: '#7C3AED' };
                          return (
                            <span key={pi} style={{ color: roleColors2[p.role] || 'var(--color-text-primary)', marginLeft: pi > 0 ? '0.25em' : 0 }}>
                              {p.text}{' '}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', direction: 'rtl', textAlign: 'right', lineHeight: 1.8, marginBottom: 4 }}>
                        {ex.ar}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{ex.id}</div>
                    {ex.grammar_note && (
                      <Badge tone="primary" style={{ marginTop: 6 }}>{ex.grammar_note}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Key points */}
            {topic.key_points && (
              <Card padding={20}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="zap" size={16} color="var(--color-accent)" />
                  Jembatan Keledai
                </h3>
                {topic.key_points.map((kp, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', borderRadius: 10, background: 'var(--color-accent-50)', border: '1px solid var(--color-accent-100)',
                    fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: i < topic.key_points.length - 1 ? 8 : 0,
                  }}>
                    {kp}
                  </div>
                ))}
              </Card>
            )}

            {/* Interactive component */}
            {topic.interactive.type === 'conjugation_explorer' && <ConjugationExplorer topic={topic} />}
            {topic.interactive.type === 'verb_transformer'      && <VerbTransformer     topic={topic} />}
            {topic.interactive.type === 'sentence_builder'      && <SentenceBuilder     topic={topic} />}
          </div>
        </div>

        {/* Understood / Next topic button */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {!understoodTabs.has(activeTab) && (
            <Button variant="secondary" icon="check" onClick={markUnderstood}>
              {activeTab < qawaid.topics.length - 1 ? 'Sudah Paham — Topik Berikutnya' : 'Sudah Paham'}
            </Button>
          )}
          {(allUnderstood || understoodTabs.has(activeTab)) && activeTab === qawaid.topics.length - 1 && (
            <Button variant="primary" iconRight="chevron-right" onClick={goToTadribat}>
              Lanjut ke Tadribat 2
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

window.QawaidScreen = QawaidScreen;
