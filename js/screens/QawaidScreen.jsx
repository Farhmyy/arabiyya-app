/* QawaidScreen — Grammar lesson (التَّرْكِيب) — 3 topics */

/* ── Shared display area for both explorers ── */
function ExplorerDisplay({ form, badges, hint }) {
  return (
    <div style={{
      background: 'var(--color-surface)', borderRadius: 14, padding: '20px 16px',
      border: '2px solid var(--color-primary-100)', minHeight: 120,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', width: '100%', boxSizing: 'border-box',
    }}>
      {form ? (
        <div className="anim-in" style={{ width: '100%' }}>
          <div lang="ar" style={{
            fontFamily: 'var(--font-arabic)', fontSize: 52, fontWeight: 700,
            color: 'var(--color-primary)', lineHeight: 1.4,
            textAlign: 'center', display: 'block',
          }}>
            {form}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            {badges}
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--color-text-light)', fontSize: 14 }}>{hint}</div>
      )}
    </div>
  );
}

/* ── Conjugation Explorer (Penjelajah Tashrif Fi'il Mādhī) ── */
function ConjugationExplorer({ topic }) {
  const { useState } = React;
  const DHOMIR = [
    { ar: 'هُوَ',  id: 'Dia (lk)' },
    { ar: 'هِيَ',  id: 'Dia (pr)' },
    { ar: 'أَنَا', id: 'Saya' },
    { ar: 'أَنْتَ', id: 'Kamu (lk)' },
    { ar: 'أَنْتِ', id: 'Kamu (pr)' },
    { ar: 'نَحْنُ', id: 'Kami' },
  ];
  const verbs = topic.madhi_verbs || [];
  const [verbIdx, setVerbIdx] = useState(0);
  const [dhoIdx,  setDhoIdx]  = useState(null);

  const randomPick = () => {
    setVerbIdx(Math.floor(Math.random() * verbs.length));
    setDhoIdx(Math.floor(Math.random() * DHOMIR.length));
  };

  const verb = verbs[verbIdx];
  const form    = dhoIdx !== null && verb ? verb.forms[dhoIdx]    : null;
  const suffix  = dhoIdx !== null && verb ? verb.suffixes[dhoIdx] : null;

  return (
    <div style={{ background: 'var(--color-primary-50)', borderRadius: 16, padding: '18px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        🕹️ Penjelajah Tashrif Mādhī — pilih fi'il &amp; dhamir
      </div>

      {/* Verb selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 5 }}>Pilih Fi'il Mādhī:</div>
        <select value={verbIdx} onChange={e => { setVerbIdx(Number(e.target.value)); setDhoIdx(null); }}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 12,
            border: '1.5px solid var(--color-primary-100)', fontSize: 16, fontWeight: 600,
            background: 'var(--color-surface)', cursor: 'pointer', fontFamily: 'var(--font-arabic)',
            direction: 'rtl', color: 'var(--color-text-primary)',
          }}>
          {verbs.map((v, i) => <option key={i} value={i}>{v.madhi} — {v.meaning}</option>)}
        </select>
      </div>

      {/* Dhomir buttons */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 8 }}>Pilih Dhamir:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {DHOMIR.map((d, i) => (
            <button key={i} onClick={() => setDhoIdx(i)}
              style={{
                padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700,
                background: dhoIdx === i ? 'var(--color-primary)' : 'var(--color-surface)',
                color: dhoIdx === i ? '#fff' : 'var(--color-primary)',
                border: `1.5px solid ${dhoIdx === i ? 'var(--color-primary)' : 'var(--color-primary-100)'}`,
                fontFamily: 'var(--font-arabic)', fontSize: 18, transition: 'all var(--dur-fast)',
              }}>
              {d.ar}
            </button>
          ))}
          <button onClick={randomPick}
            style={{ padding: '8px 14px', borderRadius: 999, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Acak 🎲
          </button>
        </div>
      </div>

      <ExplorerDisplay
        form={form}
        hint="Pilih fi'il & dhamir di atas, atau tekan 🎲 untuk acak"
        badges={dhoIdx !== null && verb ? [
          <Badge key="d" tone="primary"><span lang="ar" style={{ fontFamily: 'var(--font-arabic)' }}>{DHOMIR[dhoIdx].ar}</span>&nbsp;({DHOMIR[dhoIdx].id})</Badge>,
          <Badge key="s" tone="gold">akhiran: <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 16, marginRight: 4 }}>{suffix}</span></Badge>,
          <Badge key="m" tone="neutral">{verb.meaning}</Badge>,
        ] : []}
      />
    </div>
  );
}

/* ── Mudhari Explorer (Penjelajah Tashrif Fi'il Mudhāri') ── task 6 */
function MudhariExplorer({ topic }) {
  const { useState } = React;
  const DHOMIR = [
    { ar: 'هُوَ',  id: 'Dia (lk)',   prefix: 'يـ' },
    { ar: 'هِيَ',  id: 'Dia (pr)',   prefix: 'تـ' },
    { ar: 'أَنَا', id: 'Saya',       prefix: 'أـ' },
    { ar: 'أَنْتَ', id: 'Kamu (lk)', prefix: 'تـ' },
    { ar: 'أَنْتِ', id: 'Kamu (pr)', prefix: 'تـ' },
    { ar: 'نَحْنُ', id: 'Kami',      prefix: 'نـ' },
  ];
  const verbs = topic.mudhari_verbs || [];
  const [verbIdx, setVerbIdx] = useState(0);
  const [dhoIdx,  setDhoIdx]  = useState(null);

  const randomPick = () => {
    setVerbIdx(Math.floor(Math.random() * verbs.length));
    setDhoIdx(Math.floor(Math.random() * DHOMIR.length));
  };

  const verb = verbs[verbIdx];
  const form = dhoIdx !== null && verb ? verb.forms[dhoIdx] : null;

  return (
    <div style={{ background: 'var(--color-primary-50)', borderRadius: 16, padding: '18px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        🕹️ Penjelajah Tashrif Mudhāri' — pilih fi'il & dhamir
      </div>

      {/* Verb selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 5 }}>Pilih Fi'il Mādhī:</div>
        <select value={verbIdx} onChange={e => { setVerbIdx(Number(e.target.value)); setDhoIdx(null); }}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 12,
            border: '1.5px solid var(--color-primary-100)', fontSize: 16, fontWeight: 600,
            background: 'var(--color-surface)', cursor: 'pointer', fontFamily: 'var(--font-arabic)',
            direction: 'rtl', color: 'var(--color-text-primary)',
          }}>
          {verbs.map((v, i) => (
            <option key={i} value={i}>{v.madhi} — {v.meaning}</option>
          ))}
        </select>
      </div>

      {/* Dhomir buttons */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 8 }}>Pilih Dhamir:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {DHOMIR.map((d, i) => (
            <button key={i} onClick={() => setDhoIdx(i)}
              style={{
                padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700,
                background: dhoIdx === i ? 'var(--color-primary)' : 'var(--color-surface)',
                color: dhoIdx === i ? '#fff' : 'var(--color-primary)',
                border: `1.5px solid ${dhoIdx === i ? 'var(--color-primary)' : 'var(--color-primary-100)'}`,
                fontFamily: 'var(--font-arabic)', fontSize: 18,
                transition: 'all var(--dur-fast)',
              }}>
              {d.ar}
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
      </div>

      <ExplorerDisplay
        form={form}
        hint="Pilih fi'il & dhamir di atas, atau tekan 🎲 untuk acak"
        badges={dhoIdx !== null && verb ? [
          <Badge key="d" tone="primary"><span lang="ar" style={{ fontFamily: 'var(--font-arabic)' }}>{DHOMIR[dhoIdx].ar}</span>&nbsp;({DHOMIR[dhoIdx].id})</Badge>,
          <Badge key="p" tone="neutral">huruf: <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 16, marginRight: 4 }}>{DHOMIR[dhoIdx].prefix}</span></Badge>,
          <Badge key="m" tone="gold">{verb.meaning}</Badge>,
        ] : []}
      />
    </div>
  );
}

/* ── Sentence Builder (Bina Jumlah) ── */
function SentenceBuilder({ topic }) {
  const { useState } = React;
  const [setIdx,   setBuildSetIdx] = useState(0);
  const [placed,   setPlaced]      = useState([]);
  const [result,   setResult]      = useState(null);

  const buildSet  = topic.builder_sets[setIdx];
  const remaining = buildSet.tokens.filter(t => !placed.includes(t));

  const placeToken = (token) => { if (result) return; setPlaced(prev => [...prev, token]); };
  const removeToken = (i)    => { if (result) return; setPlaced(prev => prev.filter((_, idx) => idx !== i)); setResult(null); };

  const check = () => {
    const isOk = placed.join(' ') === buildSet.answer;
    setResult(isOk ? 'correct' : 'wrong');
    /* task 9: no audio */
  };

  const reset   = () => { setPlaced([]); setResult(null); };
  const nextSet = () => { setBuildSetIdx((setIdx + 1) % topic.builder_sets.length); setPlaced([]); setResult(null); };
  const prevSet = () => { setBuildSetIdx((setIdx - 1 + topic.builder_sets.length) % topic.builder_sets.length); setPlaced([]); setResult(null); };

  const roleColors = { fiil: '#34A853', fail: '#4285F4', maful: '#F9A825', jar: '#7C3AED' };
  const getColor = (token) => {
    for (const ex of topic.examples) {
      const part = ex.parts?.find(p => p.text === token);
      if (part) return roleColors[part.role] || '#64748B';
    }
    return '#64748B';
  };

  return (
    <div style={{ background: 'var(--color-primary-50)', borderRadius: 16, padding: '18px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        🧩 Bina Jumlah — susun kata menjadi kalimat (fi'il paling kanan)
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={prevSet}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="chevron-left" size={14} /> Sebelumnya
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
          Set {setIdx + 1} dari {topic.builder_sets.length}
        </div>
        <button onClick={nextSet}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          Berikutnya <Icon name="chevron-right" size={14} />
        </button>
      </div>

      {/* Available tokens */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 6 }}>Kata tersedia (klik untuk menempatkan):</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, direction: 'rtl', justifyContent: 'flex-end' }}>
          {remaining.length > 0 ? remaining.map((token, i) => (
            <button key={i} onClick={() => placeToken(token)}
              style={{
                padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
                background: getColor(token) + '22', color: getColor(token),
                border: `1.5px solid ${getColor(token)}55`,
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

      {/* Drop zone */}
      <div style={{
        minHeight: 60, background: 'var(--color-surface)', borderRadius: 14, padding: '12px 14px',
        border: `2px dashed ${result === 'correct' ? 'var(--color-success)' : result === 'wrong' ? 'var(--color-error)' : 'var(--color-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        flexWrap: 'wrap', gap: 8, direction: 'rtl', marginBottom: 12,
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
          color: result === 'correct' ? 'var(--color-success-text)' : 'var(--color-error-text)', fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name={result === 'correct' ? 'check-circle' : 'x-circle'} size={20} />
          {result === 'correct' ? "Benar! 🎉 fi'il → fā'il → maf'ūl" : (
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
          style={{ padding: '10px 16px', borderRadius: 12, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Reset
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToTadribat = () => {
    if (progress && progress.completeSection) progress.completeSection('3', 'qawaid', 3, 3);
    navigate('chapter/3/tadribat-2');
  };

  const allUnderstood = understoodTabs.size === qawaid.topics.length;
  const tabIcons  = ['history', 'zap', 'layout'];
  const tabColors = ['var(--color-amber-text)', 'var(--color-primary)', 'var(--color-purple-text, #7C3AED)'];

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
            <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: 'linear-gradient(180deg, var(--color-accent), #D97706)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24 }}>⏰</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Analogi: Mesin Waktu Kata Kerja</div>
              <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{qawaid.intro.hook}</p>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{qawaid.intro.summary}</p>
            </div>
            <button onClick={() => setShowIntro(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', flexShrink: 0 }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        </Card>
      )}

      {/* Topic tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--color-border)', borderRadius: 14, padding: 4 }}>
        {qawaid.topics.map((t, i) => (
          <button key={i} onClick={() => { setActiveTab(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
            <span style={{ fontSize: 12, fontWeight: 700, color: activeTab === i ? tabColors[i] : 'var(--color-text-light)' }}>
              {["Fi'il Mādhī", "Fi'il Mudhāri'", "Jumlah Fi'liyyah"][i]}
            </span>
          </button>
        ))}
      </div>

      {/* Active topic */}
      <div className="anim-in" key={activeTab}>

        {/* Topic header — task 4: judul di kanan */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, direction: 'rtl' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${tabColors[activeTab]}22`, color: tabColors[activeTab], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={tabIcons[activeTab]} size={20} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 26, fontWeight: 700, color: tabColors[activeTab], direction: 'rtl' }}>
                {topic.title_ar}
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>{topic.title_id}</div>
            </div>
          </div>
          <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 12, borderRight: `4px solid ${tabColors[activeTab]}`, textAlign: 'right' }}>
            {topic.explanation}
          </p>
        </div>

        {/* task 4: RIGHT=materi, LEFT=contoh — grid column order swapped */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'flex-start' }} className="conjugation-grid">

          {/* LEFT: contoh kalimat + key_points + interactive */}
          <div className="qawaid-examples-col" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Contoh kalimat */}
            <Card padding={20}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, direction: 'rtl' }}>
                <span lang="ar">مثال</span><span style={{ fontSize: 11, fontWeight: 400, fontFamily: 'var(--font-latin)', color: 'var(--color-text-secondary)', marginRight: 4 }}> / Contoh</span>
                <Icon name="message" size={18} color="var(--color-primary)" />
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topic.examples.map((ex, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)' }}>
                    {topic.structure ? (
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 20, fontWeight: 600, direction: 'rtl', textAlign: 'right', lineHeight: 1.8, marginBottom: 4 }}>
                        {ex.parts.map((p, pi) => {
                          const rc = { fiil: '#34A853', fail: '#4285F4', maful: '#F9A825', jar: '#7C3AED' };
                          return <span key={pi} style={{ color: rc[p.role] || 'var(--color-text-primary)', marginLeft: pi > 0 ? '0.25em' : 0 }}>{p.text}{' '}</span>;
                        })}
                      </div>
                    ) : (
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', direction: 'rtl', textAlign: 'right', lineHeight: 1.8, marginBottom: 4 }}>
                        {ex.ar}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'right' }}>{ex.id}</div>
                    {ex.grammar_note && <Badge tone="primary" style={{ marginTop: 6, float: 'right' }}>{ex.grammar_note}</Badge>}
                  </div>
                ))}
              </div>
            </Card>

            {/* Jembatan keledai — task 5: lebih besar & jelas */}
            {topic.key_points && (
              <Card padding={20}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, direction: 'rtl' }}>
                  <span lang="ar">تقنية سريعة</span><span style={{ fontSize: 11, fontWeight: 400, fontFamily: 'var(--font-latin)', color: 'var(--color-text-secondary)', marginRight: 4 }}> / Trik Kilat</span>
                  <Icon name="zap" size={16} color="var(--color-accent)" />
                </h3>
                <div style={{ fontSize: 13, color: 'var(--color-text-light)', marginBottom: 10, textAlign: 'right' }}>Trik kilat menghafal akhiran fi'il mādhī</div>
                {topic.key_points.map((kp, i) => (
                  <div key={i} style={{
                    padding: '14px 16px', borderRadius: 12,
                    background: 'var(--color-accent-50)', border: '2px solid var(--color-accent-100)',
                    marginBottom: i < topic.key_points.length - 1 ? 10 : 0,
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>⚡</span>
                    <div lang="ar" style={{
                      fontFamily: 'var(--font-arabic)', fontSize: 17, fontWeight: 700,
                      color: 'var(--color-amber-text)', direction: 'rtl', textAlign: 'right', lineHeight: 1.8,
                    }}>{kp}</div>
                  </div>
                ))}
              </Card>
            )}

            {/* Interactive */}
            {topic.interactive.type === 'conjugation_explorer' && <ConjugationExplorer topic={topic} />}
            {topic.interactive.type === 'mudhari_explorer'      && <MudhariExplorer     topic={topic} />}
            {topic.interactive.type === 'sentence_builder'      && <SentenceBuilder     topic={topic} />}
          </div>

          {/* RIGHT: materi (tashrif, mudharaah, struktur) — task 4 */}
          <div className="qawaid-materi-col" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Tashrif table */}
            {topic.conjugation && (
              <Card padding={20}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, direction: 'rtl' }}>
                  <span lang="ar">تصريف</span><span style={{ fontSize: 11, fontWeight: 400, fontFamily: 'var(--font-latin)', color: 'var(--color-text-secondary)', marginRight: 4 }}> / Tashrif</span>
                  <Icon name="layers" size={18} color="var(--color-primary)" />
                </h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12, textAlign: 'right' }}>
                  <span lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 16 }}>{topic.conjugation.root_verb}</span>
                  &nbsp;({topic.conjugation.root_meaning}) — 6 dhamir
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {topic.conjugation.rows.map((row, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: 'auto 1fr auto',
                      gap: 10, alignItems: 'center', direction: 'rtl',
                      padding: '10px 14px', borderRadius: 10,
                      background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)',
                    }}>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 17, fontWeight: 700, color: 'var(--color-text-secondary)', minWidth: 60, textAlign: 'right' }}>
                        {row.pronoun_ar}
                      </div>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 22, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center' }}>
                        {row.verb_form}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'left', direction: 'ltr', minWidth: 80 }}>
                        {row.meaning}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Huruf Mudharaah — task 8: lebih jelas & simetris */}
            {topic.mudharaah && (
              <Card padding={20}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, direction: 'rtl' }}>
                  <span lang="ar">حروف المضارعة</span><span style={{ fontSize: 11, fontWeight: 400, fontFamily: 'var(--font-latin)', color: 'var(--color-text-secondary)', marginRight: 4 }}> / Huruf Mudhāra'ah</span>
                  <Icon name="key" size={18} color="var(--color-primary)" />
                </h3>
                <div style={{ background: 'var(--color-accent-50)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, textAlign: 'center', fontWeight: 700, fontSize: 13, color: 'var(--color-amber-text)', letterSpacing: 2 }}>
                  أَ — نَ — يَ — تَ &nbsp;←&nbsp; أَنَيْتُ
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topic.mudharaah.map((m, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '52px 1fr auto',
                      alignItems: 'center', gap: 12, direction: 'rtl',
                      padding: '12px 16px', borderRadius: 12,
                      background: 'var(--color-surface)', border: '2px solid var(--color-accent-100)',
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 36, fontWeight: 800, color: 'var(--color-amber-text)', lineHeight: 1 }}>{m.huruf}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 2 }}>untuk dhamir:</div>
                        <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{m.for}</div>
                      </div>
                      <div lang="ar" style={{ fontFamily: 'var(--font-arabic)', fontSize: 22, fontWeight: 700, color: 'var(--color-primary)', textAlign: 'left', direction: 'ltr' }}>
                        {m.example}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Pola Kalimat (jumlah filiyyah) */}
            {topic.structure && (
              <Card padding={20}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, direction: 'rtl' }}>
                  <span lang="ar">نمط الجملة</span><span style={{ fontSize: 11, fontWeight: 400, fontFamily: 'var(--font-latin)', color: 'var(--color-text-secondary)', marginRight: 4 }}> / Pola Kalimat</span>
                  <Icon name="layout" size={18} color="var(--color-primary)" />
                </h3>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14, direction: 'rtl' }}>
                  {topic.structure.map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ padding: '10px 16px', borderRadius: 10, background: s.color + '22', color: s.color, border: `1.5px solid ${s.color}55`, fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 20 }}>{s.role_ar}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>{s.role_id}</div>
                    </div>
                  ))}
                </div>
                {topic.rule_note && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--color-error-50)', border: '1px solid var(--color-error-border)', fontSize: 13, color: 'var(--color-error-text)', fontWeight: 600, textAlign: 'right' }}>
                    ⚠️ {topic.rule_note}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Footer buttons */}
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

window.ExplorerDisplay     = ExplorerDisplay;
window.ConjugationExplorer = ConjugationExplorer;
window.MudhariExplorer     = MudhariExplorer;
window.SentenceBuilder     = SentenceBuilder;
window.QawaidScreen        = QawaidScreen;
