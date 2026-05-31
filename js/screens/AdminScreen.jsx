/* AdminScreen — 4-tab admin dashboard + CMS */

function AdminScreen({ user, logout, darkMode, onToggleDark }) {
  const { useState, useEffect } = React;
  const [tab, setTab] = useState('ringkasan');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    sbClient.from('users').select('*').eq('role', 'student')
      .then(({ data }) => {
        setStudents(data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingStudents(false));
  }, []);

  const SECTIONS = [
    { id: 'hiwar',      label: 'Hiwar' },
    { id: 'mufrodat',   label: 'Mufrodat' },
    { id: 'tadribat_1', label: 'Tadribat 1' },
    { id: 'qawaid',     label: 'Qawaid' },
    { id: 'tadribat_2', label: 'Tadribat 2' },
  ];

  const getOverall = (student) => {
    const ch = student.progress?.chapters?.['3'];
    if (!ch) return 0;
    const done = SECTIONS.filter(s => ch[s.id]?.completed).length;
    return Math.round((done / SECTIONS.length) * 100);
  };

  const today = new Date().toISOString().slice(0, 10);
  const activeToday = students.filter(s => s.progress?.lastActiveDate === today).length;
  const finishedAll = students.filter(s => getOverall(s) === 100).length;
  const notStarted  = students.filter(s => !s.progress?.xp || s.progress.xp === 0).length;

  const atRisk = students.filter(s => {
    const xp = s.progress?.xp || 0;
    const overall = getOverall(s);
    const lastDate = s.progress?.lastActiveDate || '2000-01-01';
    const daysSince = (new Date(today) - new Date(lastDate)) / 86400000;
    return xp === 0 || overall < 20 || daysSince > 3;
  });

  const TABS = [
    { id: 'ringkasan', label: '📊 Ringkasan' },
    { id: 'siswa', label: '👥 Semua Siswa' },
    { id: 'perhatian', label: '⚠️ Perlu Perhatian' },
    { id: 'konten', label: '✏️ Kelola Konten' },
  ];

  const tabStyle = (id) => ({
    padding: '12px 18px', border: 'none', cursor: 'pointer',
    background: 'transparent', fontFamily: 'var(--font-latin)',
    fontWeight: tab === id ? 600 : 500, fontSize: 14,
    color: tab === id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    borderBottom: tab === id ? '2px solid var(--color-primary)' : '2px solid transparent',
    transition: 'all 150ms', whiteSpace: 'nowrap',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'var(--font-latin)' }}>
      <div style={{ background: 'var(--color-primary)', color: '#fff', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="assets/images/logo-mark.svg" width="36" height="36" alt="" style={{ borderRadius: 10 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>العربية التفاعلية — Admin</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Dashboard Guru</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
          <button onClick={onToggleDark} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: 16 }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <span style={{ opacity: 0.85 }}>{user.email}</span>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
        {TABS.map(t => <button key={t.id} style={tabStyle(t.id)} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 80px' }}>

        {tab === 'ringkasan' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Siswa', value: students.length, color: 'var(--color-primary)' },
                { label: 'Aktif Hari Ini', value: activeToday, color: 'var(--color-accent)' },
                { label: 'Selesai Semua', value: finishedAll, color: 'var(--color-success)' },
                { label: 'Belum Mulai', value: notStarted, color: 'var(--color-error)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', padding: '20px 16px', textAlign: 'center', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', padding: 24, border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>Penyelesaian Per Bagian — Kelas</h3>
              {SECTIONS.map(s => {
                const pct = students.length === 0 ? 0 :
                  Math.round(students.filter(st => st.progress?.chapters?.['3']?.[s.id]?.completed).length / students.length * 100);
                const colors = { hiwar:'#0f766e', mufrodat:'#14b8a6', tadribat_1:'#f59e0b', qawaid:'#7c3aed', tadribat_2:'#ef4444' };
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 100, fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0 }}>{s.label}</div>
                    <div style={{ flex: 1, background: 'var(--color-border)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                      <div style={{ background: colors[s.id], height: '100%', width: pct + '%', transition: 'width 600ms' }} />
                    </div>
                    <div style={{ width: 40, textAlign: 'right', fontWeight: 600, color: colors[s.id], fontSize: 14 }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'siswa' && (
          <div className="admin-table-wrap">
            {loadingStudents ? <p style={{ color: 'var(--color-text-secondary)' }}>Memuat data siswa…</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                <thead>
                  <tr style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Nickname</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>XP</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>Streak</th>
                    {SECTIONS.map(s => <th key={s.id} style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</th>)}
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr><td colSpan={10} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-light)' }}>Belum ada siswa terdaftar.</td></tr>
                  )}
                  {students.map((s, i) => (
                    <tr key={s.uid} style={{ borderTop: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.nickname}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--color-text-secondary)', fontSize: 12 }}>{s.email}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 700 }}>{s.progress?.xp || 0}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>🔥 {s.progress?.streak || 0}</td>
                      {SECTIONS.map(sec => {
                        const done = s.progress?.chapters?.['3']?.[sec.id]?.completed;
                        return <td key={sec.id} style={{ padding: '10px 8px', textAlign: 'center' }}>{done ? '✅' : '—'}</td>;
                      })}
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: getOverall(s) >= 80 ? 'var(--color-success)' : getOverall(s) >= 40 ? 'var(--color-accent)' : 'var(--color-error)' }}>{getOverall(s)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'perhatian' && (
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 16 }}>
              Siswa yang belum mulai, progress &lt; 20%, atau tidak aktif lebih dari 3 hari.
            </p>
            {atRisk.length === 0
              ? <div style={{ background: 'var(--color-success-50)', borderRadius: 12, padding: 24, textAlign: 'center', color: 'var(--color-success)' }}>🎉 Semua siswa aktif!</div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {atRisk.map(s => (
                    <div key={s.uid} style={{ background: 'var(--color-surface)', borderRadius: 12, padding: '14px 18px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.nickname}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{s.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <span style={{ background: 'var(--color-error-50)', color: 'var(--color-error)', borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 600 }}>{getOverall(s)}%</span>
                        <span style={{ background: 'var(--color-accent-50)', color: 'var(--color-accent)', borderRadius: 6, padding: '3px 8px', fontSize: 12 }}>⚡{s.progress?.xp || 0} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {tab === 'konten' && <AdminCMSPanel />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── CMS Panel ── */

function AdminCMSPanel() {
  const { useState, useEffect } = React;
  const [cmsTab, setCmsTab] = useState('mufrodat');
  const [words, setWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [editWord, setEditWord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const loadWords = () => {
    setLoadingWords(true);
    sbClient.from('content').select('data').eq('id', 'mufrodat').maybeSingle()
      .then(({ data }) => setWords(data?.data?.words || []))
      .catch(() => setWords([]))
      .finally(() => setLoadingWords(false));
  };
  useEffect(loadWords, []);

  const saveWords = async (newWords) => {
    setSaving(true);
    try {
      await sbClient.from('content').upsert({ id: 'mufrodat', data: { words: newWords } });
      setWords(newWords);
    } catch { alert('Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  const handleImageUpload = async (file, wordId) => {
    if (!file) return null;
    setUploadProgress(0);
    const ext = file.name.split('.').pop();
    const path = `${wordId}_${Date.now()}.${ext}`;
    const { error } = await sbClient.storage.from('mufrodat').upload(path, file, { upsert: true });
    if (error) { setUploadProgress(null); throw error; }
    setUploadProgress(100);
    const { data: { publicUrl } } = sbClient.storage.from('mufrodat').getPublicUrl(path);
    setUploadProgress(null);
    return publicUrl;
  };

  const handleSaveWord = async (formData) => {
    setSaving(true);
    try {
      let imageUrl = formData.image_url;
      if (formData._imageFile) {
        const id = formData.id || Date.now().toString();
        imageUrl = await handleImageUpload(formData._imageFile, id);
      }
      const wordId = formData.id || Date.now().toString();
      const cleanWord = { id: wordId, arabic: formData.arabic, meaning: formData.meaning,
        example: formData.example, image_url: imageUrl || null };
      let newWords;
      if (formData.id) {
        newWords = words.map(w => w.id === formData.id ? cleanWord : w);
      } else {
        newWords = [...words, cleanWord];
      }
      await saveWords(newWords);
      setEditWord(null);
    } catch { alert('Gagal menyimpan. Coba lagi.'); }
    finally { setSaving(false); }
  };

  const handleDeleteWord = async (id) => {
    if (!confirm('Hapus kosakata ini?')) return;
    await saveWords(words.filter(w => w.id !== id));
  };

  const CMS_TABS = [
    { id: 'mufrodat', label: '📚 Mufrodat (' + words.length + ')' },
    { id: 'tadribat1', label: '✏️ Tadribat 1' },
    { id: 'tadribat2', label: '📝 Tadribat 2' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CMS_TABS.map(t => (
          <button key={t.id} onClick={() => setCmsTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              background: cmsTab === t.id ? 'var(--color-primary)' : 'var(--color-surface)',
              color: cmsTab === t.id ? '#fff' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 13,
              border: cmsTab !== t.id ? '1px solid var(--color-border)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {cmsTab === 'mufrodat' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => setEditWord({ id: null, arabic: '', meaning: '', example: '', image_url: null })}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-latin)' }}>
              + Tambah Kosakata
            </button>
          </div>
          {loadingWords ? <p style={{ color: 'var(--color-text-secondary)' }}>Memuat…</p> : (
            <div className="admin-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'var(--color-surface)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                <thead>
                  <tr style={{ background: 'var(--color-primary-50)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-primary)', fontWeight: 700 }}>#</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-primary)', fontWeight: 700 }}>Arab</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-primary)', fontWeight: 700 }}>Arti</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-primary)', fontWeight: 700 }}>Contoh</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 700 }}>Gambar</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 700 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((w, i) => (
                    <tr key={w.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 16px', color: 'var(--color-text-light)' }}>{i + 1}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-arabic)', fontSize: 20, direction: 'rtl', textAlign: 'right', color: 'var(--color-text-primary)' }}>{w.arabic}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--color-text-primary)', fontWeight: 500 }}>{w.meaning}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--color-text-secondary)', fontSize: 12, maxWidth: 200 }}>{w.example}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        {w.image_url
                          ? <img src={w.image_url} width="40" height="40" style={{ borderRadius: 6, objectFit: 'cover' }} alt="" />
                          : <span style={{ color: 'var(--color-text-light)', fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button onClick={() => setEditWord({ ...w })}
                            style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: 'var(--color-primary-50)', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteWord(w.id)}
                            style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'var(--color-error-50)', color: 'var(--color-error)', cursor: 'pointer', fontSize: 12 }}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {words.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-light)' }}>Belum ada kosakata. Tambahkan atau lakukan seed data.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {editWord !== null && (
            <WordEditModal word={editWord} saving={saving} uploadProgress={uploadProgress}
              onSave={handleSaveWord} onClose={() => setEditWord(null)} />
          )}
        </div>
      )}

      {cmsTab === 'tadribat1' && <TadribatCMSPanel key="t1" collectionId="tadribat1" title="Tadribat 1" />}
      {cmsTab === 'tadribat2' && <TadribatCMSPanel key="t2" collectionId="tadribat2" title="Tadribat 2" />}
    </div>
  );
}

/* ─────────────────────────────────────────── Word Edit Modal ── */

function WordEditModal({ word, saving, uploadProgress, onSave, onClose }) {
  const { useState } = React;
  const [form, setForm] = useState({ ...word, _imageFile: null });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-modal)', padding: 32, maxWidth: 480, width: '100%', boxShadow: 'var(--shadow-modal)' }}>
        <h3 style={{ fontFamily: 'var(--font-latin)', fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--color-text-primary)' }}>
          {form.id ? 'Edit Kosakata' : 'Tambah Kosakata Baru'}
        </h3>
        {[
          { key: 'arabic', label: 'Arab', placeholder: 'الطَّبِيب', dir: 'rtl', font: 'var(--font-arabic)', size: 20 },
          { key: 'meaning', label: 'Arti (Indonesia)', placeholder: 'Dokter', dir: 'ltr', font: 'var(--font-latin)', size: 15 },
          { key: 'example', label: 'Contoh kalimat (Arab)', placeholder: 'فَحَصَ الطَّبِيبُ الْمَرِيضَ', dir: 'rtl', font: 'var(--font-arabic)', size: 18 },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{f.label}</label>
            <input value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder} dir={f.dir}
              style={{ width: '100%', height: 44, border: '1px solid var(--color-border)', borderRadius: 8, padding: '0 12px', fontSize: f.size, fontFamily: f.font, background: 'var(--color-bg)', color: 'var(--color-text-primary)', boxSizing: 'border-box', textAlign: f.dir === 'rtl' ? 'right' : 'left' }} />
          </div>
        ))}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Gambar</label>
          {form.image_url && !form._imageFile && (
            <img src={form.image_url} width="60" height="60" style={{ borderRadius: 8, objectFit: 'cover', marginBottom: 8, display: 'block' }} alt="" />
          )}
          <input type="file" accept="image/*" onChange={e => set('_imageFile', e.target.files[0] || null)}
            style={{ fontSize: 13, color: 'var(--color-text-primary)' }} />
          {uploadProgress !== null && (
            <div style={{ marginTop: 6, background: 'var(--color-border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{ background: 'var(--color-primary)', height: '100%', width: uploadProgress + '%', transition: 'width 200ms' }} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving}
            style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Batal
          </button>
          <button onClick={() => onSave(form)} disabled={saving || !form.arabic || !form.meaning}
            style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── Tadribat CMS ── */

function TadribatCMSPanel({ collectionId, title }) {
  const { useState, useEffect } = React;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editQ, setEditQ] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadQuestions = () => {
    setLoading(true);
    sbClient.from('content').select('data').eq('id', collectionId).maybeSingle()
      .then(({ data }) => setQuestions(data?.data?.questions || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  };
  useEffect(loadQuestions, [collectionId]);

  const saveQuestions = async (newQs) => {
    setSaving(true);
    try {
      await sbClient.from('content').upsert({ id: collectionId, data: { questions: newQs } });
      setQuestions(newQs);
    } catch { alert('Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  const handleSaveQ = async (form) => {
    const clean = { ...form };
    delete clean._isNew;
    delete clean._idx;
    let newQs;
    if (form._isNew) {
      newQs = [...questions, clean];
    } else {
      newQs = questions.map((q, i) => i === form._idx ? clean : q);
    }
    await saveQuestions(newQs);
    setEditQ(null);
  };

  const handleDelete = async (idx) => {
    if (!confirm('Hapus soal ini?')) return;
    await saveQuestions(questions.filter((_, i) => i !== idx));
  };

  const TYPE_LABELS = { audio: 'Audio', text: 'Teks', mcq: 'MCQ', identify: 'Identifikasi', transform: 'Transformasi', order: 'Urutan' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-latin)', fontSize: 16, color: 'var(--color-text-primary)', margin: 0 }}>{title} — {questions.length} soal</h3>
        <button onClick={() => setEditQ({ _isNew: true, type: 'mcq', prompt: '', arabic_display: null, options: ['','','',''], correct_index: 0, explanation: '' })}
          style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-latin)' }}>
          + Tambah Soal
        </button>
      </div>
      {loading ? <p style={{ color: 'var(--color-text-secondary)' }}>Memuat…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {questions.map((q, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)', borderRadius: 6, padding: '3px 8px', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ background: 'var(--color-accent-100)', color: 'var(--color-accent)', borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 600 }}>{TYPE_LABELS[q.type] || q.type}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>{q.prompt}</div>
                {q.arabic_display && (
                  <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 18, direction: 'rtl', color: 'var(--color-primary)', marginTop: 4 }}>{q.arabic_display}</div>
                )}
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  Jawaban benar: <strong style={{ color: 'var(--color-success)' }}>{q.options?.[q.correct_index]}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => setEditQ({ ...q, _idx: i })}
                  style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: 'var(--color-primary-50)', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                <button onClick={() => handleDelete(i)}
                  style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'var(--color-error-50)', color: 'var(--color-error)', cursor: 'pointer', fontSize: 12 }}>🗑</button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-light)', background: 'var(--color-surface)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
              Belum ada soal. Tambahkan atau lakukan seed data.
            </div>
          )}
        </div>
      )}
      {editQ !== null && (
        <QuestionEditModal q={editQ} saving={saving} onSave={handleSaveQ} onClose={() => setEditQ(null)} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────── Question Edit Modal ── */

function QuestionEditModal({ q, saving, onSave, onClose }) {
  const { useState } = React;
  const [form, setForm] = useState({ ...q });
  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setOption = (i, val) => setForm(f => { const opts = [...(f.options||[])]; opts[i] = val; return { ...f, options: opts }; });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-modal)', padding: 32, maxWidth: 520, width: '100%', boxShadow: 'var(--shadow-modal)', margin: 'auto' }}>
        <h3 style={{ fontFamily: 'var(--font-latin)', fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--color-text-primary)' }}>
          {q._isNew ? 'Tambah Soal' : 'Edit Soal'}
        </h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Tipe Soal</label>
          <select value={form.type} onChange={e => setF('type', e.target.value)}
            style={{ width: '100%', height: 40, border: '1px solid var(--color-border)', borderRadius: 8, padding: '0 12px', fontSize: 14, fontFamily: 'var(--font-latin)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
            {['audio','text','mcq','identify','transform','order'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Pertanyaan / Prompt</label>
          <textarea value={form.prompt || ''} onChange={e => setF('prompt', e.target.value)} rows={2}
            style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'var(--font-latin)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Tampilan Arab (opsional)</label>
          <input value={form.arabic_display || ''} onChange={e => setF('arabic_display', e.target.value || null)}
            placeholder="Teks Arab (kosongkan jika tidak ada)" dir="rtl"
            style={{ width: '100%', height: 40, border: '1px solid var(--color-border)', borderRadius: 8, padding: '0 12px', fontSize: 18, fontFamily: 'var(--font-arabic)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', textAlign: 'right', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Pilihan Jawaban (4 opsi) — pilih radio = jawaban benar</label>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <input type="radio" name="correct" checked={form.correct_index === i} onChange={() => setF('correct_index', i)} style={{ width: 16, height: 16, flexShrink: 0 }} />
              <input value={(form.options||[])[i] || ''} onChange={e => setOption(i, e.target.value)}
                placeholder={`Opsi ${i+1}`}
                style={{ flex: 1, height: 36, border: `1px solid ${form.correct_index === i ? 'var(--color-success)' : 'var(--color-border)'}`, borderRadius: 6, padding: '0 10px', fontSize: 14, fontFamily: 'var(--font-latin)', background: form.correct_index === i ? 'var(--color-success-50)' : 'var(--color-bg)', color: 'var(--color-text-primary)' }} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Penjelasan</label>
          <textarea value={form.explanation || ''} onChange={e => setF('explanation', e.target.value)} rows={2}
            style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'var(--font-latin)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving}
            style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Batal</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.prompt}
            style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

window.AdminScreen = AdminScreen;
window.AdminCMSPanel = AdminCMSPanel;
window.WordEditModal = WordEditModal;
window.TadribatCMSPanel = TadribatCMSPanel;
window.QuestionEditModal = QuestionEditModal;
