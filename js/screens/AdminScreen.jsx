/* AdminScreen — 4-tab admin dashboard + CMS */

function AdminScreen({ user, logout, darkMode, onToggleDark }) {
  const { useState, useEffect, useCallback } = React;
  const [tab, setTab] = useState('ringkasan');
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [wrongSec, setWrongSec] = useState('tadribat_1');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [resettingId, setResettingId] = useState(null);

  const loadStudents = useCallback(() => {
    setLoadingStudents(true);
    setLoadError(null);
    sbClient.from('users').select('*').eq('role', 'student')
      .then(({ data, error }) => {
        if (error) {
          console.error('[AdminScreen] Gagal memuat data siswa:', error);
          setLoadError(error.message);
          setStudents([]);
        } else {
          setStudents(data || []);
        }
      })
      .catch(err => {
        console.error('[AdminScreen] Gagal memuat data siswa:', err);
        setLoadError(err.message || 'Gagal memuat data siswa');
        setStudents([]);
      })
      .finally(() => setLoadingStudents(false));
  }, []);

  useEffect(loadStudents, [loadStudents]);

  const resetStudentProgress = useCallback(async (studentId, studentName) => {
    if (!confirm(`Reset seluruh progress ${studentName}?\n\nSemua XP, streak, dan penyelesaian akan dihapus.`)) return;
    setResettingId(studentId);
    try {
      const { error } = await sbClient.from('users').update({ progress: {} }).eq('id', studentId);
      if (error) throw error;
      window.showToast && window.showToast(`Progress ${studentName} berhasil direset.`, 'success');
      loadStudents();
    } catch (err) {
      window.showToast && window.showToast(`Gagal reset: ${err.message}`, 'error');
    } finally {
      setResettingId(null);
    }
  }, [loadStudents]);

  const SECTIONS = [
    { id: 'hiwar',      label: 'Hiwar',      scored: false },
    { id: 'mufrodat',   label: 'Mufrodat',   scored: false },
    { id: 'tadribat_1', label: 'Tadribat 1', scored: true  },
    { id: 'qawaid',     label: 'Qawaid',     scored: false },
    { id: 'tadribat_2', label: 'Tadribat 2', scored: true  },
    { id: 'imtihan',    label: 'Imtihan',    scored: true  },
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
    { id: 'analitik', label: '📈 Analitik' },
    { id: 'konten', label: '✏️ Kelola Konten' },
  ];

  /* ── Analytics helpers ─────────────────────────────────────────────────── */

  const exportCSV = () => {
    try {
      const header = ['No','Nama','Email','XP','Streak','Terakhir Aktif',
        'Hiwar','Mufrodat','Tadribat 1','Qawaid','Tadribat 2','Imtihan','Best Imtihan','% Selesai'];
      const rows = students.map((s, i) => {
        const p  = s.progress || {};
        const ch = p.chapters?.['3'] || {};
        const fmt = (sec, scored) => scored
          ? (sec?.completed ? `${sec.score}/${sec.maxScore}` : '-')
          : (sec?.completed ? 'Selesai' : '-');
        return [
          i + 1, s.nickname || '-', s.email || '-',
          p.xp || 0, p.streak || 0, p.lastActiveDate || '-',
          fmt(ch.hiwar, false), fmt(ch.mufrodat, false),
          fmt(ch.tadribat_1, true), fmt(ch.qawaid, false),
          fmt(ch.tadribat_2, true), fmt(ch.imtihan, true),
          ch.imtihan?.bestScore ?? '-',
          getOverall(s) + '%',
        ];
      });
      const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `arabiyya-siswa-${today}.csv`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      window.showToast && window.showToast('Gagal export CSV: ' + err.message, 'error');
    }
  };

  const getDistribution = (sectionId, maxScore) => {
    const bins = maxScore === 10
      ? [{ label: '9–10', min: 9 }, { label: '7–8', min: 7 }, { label: '5–6', min: 5 }, { label: '3–4', min: 3 }, { label: '0–2', min: 0 }]
      : [{ label: '13–15', min: 13 }, { label: '10–12', min: 10 }, { label: '7–9', min: 7 }, { label: '4–6', min: 4 }, { label: '0–3', min: 0 }];
    return bins.map((bin, i) => ({
      label: bin.label,
      count: students.filter(s => {
        const sec = s.progress?.chapters?.['3']?.[sectionId];
        if (!sec?.completed) return false;
        const score    = sec.bestScore ?? sec.score ?? 0;
        const nextMin  = bins[i - 1]?.min ?? (maxScore + 1);
        return score >= bin.min && score < nextMin;
      }).length,
    }));
  };

  const WRONG_QUESTIONS = {
    tadribat_1: DATA.tadribat1?.questions || [],
    tadribat_2: DATA.tadribat2?.questions || [],
    imtihan:    DATA.imtihan?.questions   || [],
  };

  const getWrongStats = (sectionId) => {
    const qs = WRONG_QUESTIONS[sectionId] || [];
    const withData = students.filter(s => Array.isArray(s.progress?.chapters?.['3']?.[sectionId]?.lastWrong));
    if (withData.length === 0 || qs.length === 0) return { stats: [], total: 0 };
    const stats = qs.map((q, idx) => ({
      idx,
      prompt: q.prompt || '',
      wrongCount: withData.filter(s => s.progress.chapters['3'][sectionId].lastWrong.includes(idx)).length,
      total: withData.length,
    })).filter(x => x.wrongCount > 0).sort((a, b) => b.wrongCount - a.wrongCount);
    return { stats, total: withData.length };
  };

  const inactiveList = students.filter(s => {
    const lastDate = s.progress?.lastActiveDate || '2000-01-01';
    return (new Date(today) - new Date(lastDate)) / 86400000 > 7;
  }).sort((a, b) => {
    const da = new Date(a.progress?.lastActiveDate || '2000-01-01');
    const db = new Date(b.progress?.lastActiveDate || '2000-01-01');
    return da - db;
  });

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
      {/* Logout confirmation dialog */}
      {confirmLogout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 20, padding: 28, maxWidth: 320, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Keluar dari Admin?</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Sesi admin akan berakhir. Masuk lagi untuk mengakses dashboard.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmLogout(false)} style={{ padding: '10px 20px', borderRadius: 12, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Batal</button>
              <button onClick={() => { setConfirmLogout(false); logout(); }} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: 'var(--color-error)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-header" style={{ background: 'var(--color-primary)', color: '#fff', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="assets/images/logo-mark.svg" width="36" height="36" alt="" style={{ borderRadius: 10 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>العربية التفاعلية</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Admin · Dashboard Guru</div>
          </div>
        </div>
        <div className="admin-header-right" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <button onClick={onToggleDark} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: 16 }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={loadStudents} disabled={loadingStudents} title="Perbarui data siswa"
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: loadingStudents ? 'wait' : 'pointer', color: '#fff', fontSize: 16 }}>
            🔄
          </button>
          <span className="admin-header-email" style={{ opacity: 0.85, fontSize: 12 }}>{user.email}</span>
          <button onClick={() => setConfirmLogout(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <Icon name="log-out" size={14} /> Logout
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
        {TABS.map(t => <button key={t.id} style={tabStyle(t.id)} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 80px' }}>

        {loadError && (
          <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: 'var(--color-error-50)', border: '1px solid var(--color-error-border)', color: 'var(--color-error)', fontSize: 13, fontWeight: 500 }}>
            ⚠ Gagal memuat data siswa: {loadError}
          </div>
        )}

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
                const colors = { hiwar:'#0f766e', mufrodat:'#14b8a6', tadribat_1:'#f59e0b', qawaid:'#7c3aed', tadribat_2:'#ef4444', imtihan:'#d97706' };
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
            {loadingStudents ? (
              <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                {/* Skeleton header */}
                <div style={{ display: 'flex', gap: 16, padding: '12px 16px', background: 'var(--color-primary-50)', borderBottom: '1px solid var(--color-border)' }}>
                  {[90, 140, 48, 48, 60, 60, 60, 60, 60, 48].map((w, i) => (
                    <div key={i} style={{ height: 12, width: w, background: 'var(--color-primary)', borderRadius: 4, opacity: 0.25, flexShrink: 0 }} />
                  ))}
                </div>
                {/* Skeleton rows */}
                {[1, 0.85, 0.7, 0.55, 0.4].map((opacity, ri) => (
                  <div key={ri} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--color-border)', background: ri % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)', opacity }}>
                    {[90, 140, 48, 48, 60, 60, 60, 60, 60, 48].map((w, i) => (
                      <div key={i} style={{ height: 12, width: w, background: 'var(--color-border)', borderRadius: 4, flexShrink: 0 }} />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                <thead>
                  <tr style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Nickname</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>XP</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>Streak</th>
                    {SECTIONS.map(s => <th key={s.id} style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, whiteSpace: 'nowrap' }}>{s.label}</th>)}
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>%</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700 }}>Reset</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr><td colSpan={11} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-light)' }}>Belum ada siswa terdaftar.</td></tr>
                  )}
                  {students.map((s, i) => (
                    <tr key={s.id} style={{ borderTop: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.nickname}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--color-text-secondary)', fontSize: 12 }}>{s.email}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 700 }}>{s.progress?.xp || 0}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>🔥 {s.progress?.streak || 0}</td>
                      {SECTIONS.map(sec => {
                        const secData = s.progress?.chapters?.['3']?.[sec.id];
                        const done = secData?.completed;
                        if (!done) return <td key={sec.id} style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--color-text-light)' }}>—</td>;
                        if (!sec.scored) return <td key={sec.id} style={{ padding: '10px 8px', textAlign: 'center' }}>✅</td>;
                        const best     = secData.bestScore ?? secData.score;
                        const attempts = secData.attempts ?? 1;
                        const pct      = secData.maxScore ? Math.round(secData.score / secData.maxScore * 100) : 0;
                        const color    = pct >= 80 ? 'var(--color-success)' : pct >= 60 ? 'var(--color-primary)' : 'var(--color-error)';
                        return (
                          <td key={sec.id} style={{ padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 700, color, fontSize: 13 }}>{secData.score}/{secData.maxScore}</div>
                            {best !== secData.score && <div style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 600 }}>↑{best}</div>}
                            <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 1 }}>{attempts}×</div>
                          </td>
                        );
                      })}
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: getOverall(s) >= 80 ? 'var(--color-success)' : getOverall(s) >= 40 ? 'var(--color-accent)' : 'var(--color-error)' }}>{getOverall(s)}%</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          onClick={() => resetStudentProgress(s.id, s.nickname || s.email)}
                          disabled={resettingId === s.id}
                          style={{
                            padding: '4px 10px', borderRadius: 7, border: 'none',
                            background: 'var(--color-error-50)', color: 'var(--color-error)',
                            cursor: resettingId === s.id ? 'wait' : 'pointer',
                            fontSize: 12, fontWeight: 600,
                          }}>
                          {resettingId === s.id ? '…' : '🔄 Reset'}
                        </button>
                      </td>
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
                    <div key={s.id} style={{ background: 'var(--color-surface)', borderRadius: 12, padding: '14px 18px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
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

        {tab === 'analitik' && (() => {
          const { stats: wrongStats, total: wrongTotal } = getWrongStats(wrongSec);
          const WRONG_SEC_OPTIONS = [
            { id: 'tadribat_1', label: 'Tadribat 1' },
            { id: 'tadribat_2', label: 'Tadribat 2' },
            { id: 'imtihan',    label: 'Imtihan' },
          ];
          return (
            <div>
              {/* Export CSV */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <button onClick={exportCSV} style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: 'var(--color-primary)', color: '#fff', cursor: 'pointer',
                  fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-latin)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}>
                  ⬇ Export CSV ({students.length} siswa)
                </button>
              </div>

              {/* Wrong stats */}
              <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', padding: 24, border: '1px solid var(--color-border)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Soal Paling Banyak Salah</h3>
                  <select value={wrongSec} onChange={e => setWrongSec(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-latin)', fontSize: 13, cursor: 'pointer' }}>
                    {WRONG_SEC_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>

                {wrongTotal === 0 ? (
                  <div style={{ padding: '20px 16px', borderRadius: 10, background: 'var(--color-bg)', border: '1px dashed var(--color-border)', textAlign: 'center', color: 'var(--color-text-light)', fontSize: 14 }}>
                    Belum ada data — siswa perlu mengerjakan ulang setelah update ini untuk memunculkan analitik per-soal.
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                      Berdasarkan {wrongTotal} siswa yang memiliki data. Menampilkan soal yang pernah salah saja.
                    </div>
                    <div className="admin-table-wrap">
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: 'var(--color-primary-50)' }}>
                            <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 700, width: 48 }}>#</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--color-primary)', fontWeight: 700 }}>Pertanyaan</th>
                            <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 700, whiteSpace: 'nowrap', width: 100 }}>Salah</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--color-primary)', fontWeight: 700 }}>Proporsi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wrongStats.map((row, ri) => {
                            const pct = Math.round(row.wrongCount / row.total * 100);
                            const barColor = pct >= 70 ? 'var(--color-error)' : pct >= 40 ? 'var(--color-accent)' : 'var(--color-primary)';
                            return (
                              <tr key={row.idx} style={{ borderTop: '1px solid var(--color-border)', background: ri % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)' }}>
                                <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--color-text-light)', fontSize: 12 }}>#{row.idx + 1}</td>
                                <td style={{ padding: '10px 12px', color: 'var(--color-text-primary)', maxWidth: 320 }}>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.prompt}>{row.prompt}</div>
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: barColor }}>{row.wrongCount}/{row.total}</td>
                                <td style={{ padding: '10px 12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ flex: 1, background: 'var(--color-border)', borderRadius: 4, height: 10, overflow: 'hidden', minWidth: 80 }}>
                                      <div style={{ background: barColor, height: '100%', width: pct + '%', transition: 'width 600ms' }} />
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: barColor, width: 36, textAlign: 'right' }}>{pct}%</div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Score distribution */}
              <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', padding: 24, border: '1px solid var(--color-border)', marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 20px' }}>Distribusi Skor</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
                  {[
                    { id: 'imtihan',    label: 'Imtihan',    max: 15 },
                    { id: 'tadribat_1', label: 'Tadribat 1', max: 15 },
                    { id: 'tadribat_2', label: 'Tadribat 2', max: 10 },
                  ].map(({ id, label, max }) => {
                    const dist     = getDistribution(id, max);
                    const maxCount = Math.max(...dist.map(d => d.count), 1);
                    const total    = dist.reduce((s, d) => s + d.count, 0);
                    return (
                      <div key={id}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)', marginBottom: 12 }}>
                          {label} <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)', fontSize: 12 }}>maks {max} · {total} siswa</span>
                        </div>
                        {dist.map(bin => (
                          <div key={bin.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 40, fontSize: 11, textAlign: 'right', color: 'var(--color-text-secondary)', flexShrink: 0 }}>{bin.label}</div>
                            <div style={{ flex: 1, background: 'var(--color-border)', borderRadius: 4, height: 16, overflow: 'hidden' }}>
                              <div style={{ background: 'var(--color-primary)', height: '100%', width: (bin.count / maxCount * 100) + '%', transition: 'width 600ms', opacity: bin.count === 0 ? 0.1 : 1 }} />
                            </div>
                            <div style={{ width: 20, fontSize: 13, fontWeight: 700, color: bin.count > 0 ? 'var(--color-primary)' : 'var(--color-text-light)', flexShrink: 0 }}>{bin.count}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inactive > 7 days */}
              <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-card)', padding: 24, border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
                  Siswa Tidak Aktif &gt; 7 Hari
                  {inactiveList.length > 0 && <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: 'var(--color-error)' }}>({inactiveList.length} siswa)</span>}
                </h3>
                {inactiveList.length === 0
                  ? <div style={{ padding: '20px 16px', borderRadius: 10, background: 'var(--color-success-50)', border: '1px solid var(--color-success-border)', textAlign: 'center', color: 'var(--color-success-text)', fontSize: 14 }}>
                      🎉 Semua siswa aktif dalam 7 hari terakhir!
                    </div>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {inactiveList.map(s => {
                        const lastDate   = s.progress?.lastActiveDate || null;
                        const daysSince  = lastDate ? Math.floor((new Date(today) - new Date(lastDate)) / 86400000) : null;
                        const overall    = getOverall(s);
                        return (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)', flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.nickname || '—'}</div>
                              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{s.email}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                              <span style={{ background: 'var(--color-error-50)', color: 'var(--color-error-text)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, border: '1px solid var(--color-error-border)' }}>
                                {daysSince === null ? 'Belum pernah aktif' : `${daysSince} hari lalu`}
                              </span>
                              <span style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                                {overall}% selesai
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                }
              </div>
            </div>
          );
        })()}

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
        example: formData.example, example_id: formData.example_id || null, image_url: imageUrl || null };
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
            <button onClick={() => setEditWord({ id: null, arabic: '', meaning: '', example: '', example_id: '', image_url: null })}
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
          { key: 'arabic',     label: 'Arab',                      placeholder: 'الطَّبِيب',                  dir: 'rtl', font: 'var(--font-arabic)', size: 20 },
          { key: 'meaning',    label: 'Arti (Indonesia)',           placeholder: 'Dokter',                    dir: 'ltr', font: 'var(--font-latin)',  size: 15 },
          { key: 'example',    label: 'Contoh kalimat (Arab)',      placeholder: 'فَحَصَ الطَّبِيبُ الْمَرِيضَ', dir: 'rtl', font: 'var(--font-arabic)', size: 18 },
          { key: 'example_id', label: 'Contoh kalimat (Indonesia)', placeholder: 'Dokter memeriksa si sakit', dir: 'ltr', font: 'var(--font-latin)',  size: 15 },
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

  /* data.js = sumber kebenaran. Admin selalu mulai dari soal data.js.
     Jika sudah pernah disimpan ke Supabase (struktur sama = prompt[0] cocok),
     tampilkan versi Supabase agar edit sebelumnya tidak hilang. */
  const localQs = collectionId === 'tadribat1' ? DATA.tadribat1.questions : DATA.tadribat2.questions;

  const loadQuestions = () => {
    setLoading(true);
    sbClient.from('content').select('data').eq('id', collectionId).maybeSingle()
      .then(({ data }) => {
        const cloudQs = data?.data?.questions || [];
        /* Cek apakah SETIAP soal Supabase cocok dengan data.js (berdasarkan prompt + urutan) */
        const fullySync =
          cloudQs.length === localQs.length &&
          cloudQs.length > 0 &&
          localQs.every((lq, i) => cloudQs[i]?.prompt === lq.prompt);

        if (fullySync) {
          setQuestions(cloudQs);            /* Supabase sudah sesuai data.js */
        } else {
          /* Supabase beda / lama → tampilkan data.js DAN otomatis push ke Supabase */
          setQuestions(localQs);
          sbClient.from('content')
            .upsert({ id: collectionId, data: { questions: localQs } })
            .then(() => {})
            .catch(() => {});
        }
      })
      .catch(() => setQuestions(localQs))
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontFamily: 'var(--font-latin)', fontSize: 16, color: 'var(--color-text-primary)', margin: 0 }}>{title} — {questions.length} soal</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              if (!confirm(`Reset seluruh soal ${title} ke data.js? Perubahan yang tersimpan di cloud akan tertimpa.`)) return;
              await saveQuestions(localQs);
            }}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-secondary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-latin)', fontSize: 13 }}>
            ↺ Sinkronkan dari data.js
          </button>
          <button onClick={() => setEditQ({ _isNew: true, type: 'mcq', prompt: '', arabic_display: null, options: ['','','',''], correct_index: 0, explanation: '' })}
            style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-latin)', fontSize: 13 }}>
            + Tambah Soal
          </button>
        </div>
      </div>
      {/* Status sinkronisasi */}
      {!loading && (() => {
        const synced = questions.length === localQs.length &&
          localQs.every((lq, i) => questions[i]?.prompt === lq.prompt);
        return (
          <div style={{
            marginBottom: 12, padding: '8px 14px', borderRadius: 10, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8,
            background: synced ? 'var(--color-success-50)' : 'var(--color-accent-50)',
            color: synced ? 'var(--color-success-text)' : 'var(--color-amber-text)',
            border: `1px solid ${synced ? 'var(--color-success-border)' : 'var(--color-accent-100)'}`,
          }}>
            {synced
              ? '✅ Sinkron dengan web materi — edit soal di sini langsung terlihat oleh siswa.'
              : '🔄 Soal cloud berbeda — sedang menyinkronkan otomatis dari data.js, tunggu sebentar lalu refresh.'}
          </div>
        );
      })()}

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
        {/* Teks audio untuk soal tipe 'audio' */}
        {form.type === 'audio' && (
          <div style={{ marginBottom: 14, padding: '12px 14px', background: 'var(--color-accent-50)', borderRadius: 10, border: '1px solid var(--color-accent-100)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-amber-text)', marginBottom: 4 }}>Teks Audio (diputar saat soal) 🔊</label>
            <input value={form.audio_text || ''} onChange={e => setF('audio_text', e.target.value || null)}
              placeholder="النص العربي الذي يُقرأ" dir="rtl"
              style={{ width: '100%', height: 40, border: '1px solid var(--color-accent-100)', borderRadius: 8, padding: '0 12px', fontSize: 18, fontFamily: 'var(--font-arabic)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', textAlign: 'right', boxSizing: 'border-box' }} />
            <div style={{ fontSize: 11, color: 'var(--color-amber-text)', marginTop: 4 }}>audio_ref file sudah tersimpan di data.js dan tidak diubah di sini.</div>
          </div>
        )}
        {/* Token kata untuk soal tipe 'order' */}
        {form.type === 'order' && (
          <div style={{ marginBottom: 14, padding: '12px 14px', background: 'var(--color-primary-50)', borderRadius: 10, border: '1px solid var(--color-primary-100)' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4 }}>Token kata (pisah spasi, RTL) 🧩</label>
            <input value={(form.tokens || []).join(' ')} onChange={e => setF('tokens', e.target.value.trim().split(/\s+/).filter(Boolean))}
              placeholder="كَتَبَ الطَّالِبُ الدَّرْسَ" dir="rtl"
              style={{ width: '100%', height: 40, border: '1px solid var(--color-primary-100)', borderRadius: 8, padding: '0 12px', fontSize: 18, fontFamily: 'var(--font-arabic)', background: 'var(--color-surface)', color: 'var(--color-text-primary)', textAlign: 'right', boxSizing: 'border-box' }} />
            <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 4 }}>Kata-kata yang akan diacak dan disusun oleh siswa.</div>
          </div>
        )}
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
