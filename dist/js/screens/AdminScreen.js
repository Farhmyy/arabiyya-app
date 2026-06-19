/* AdminScreen — 4-tab admin dashboard + CMS */

function AdminScreen({
  user,
  logout,
  darkMode,
  onToggleDark
}) {
  const {
    useState,
    useEffect,
    useCallback
  } = React;
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
    sbClient.from('users').select('*').eq('role', 'student').then(({
      data,
      error
    }) => {
      if (error) {
        console.error('[AdminScreen] Gagal memuat data siswa:', error);
        setLoadError(error.message);
        setStudents([]);
      } else {
        setStudents(data || []);
      }
    }).catch(err => {
      console.error('[AdminScreen] Gagal memuat data siswa:', err);
      setLoadError(err.message || 'Gagal memuat data siswa');
      setStudents([]);
    }).finally(() => setLoadingStudents(false));
  }, []);
  useEffect(loadStudents, [loadStudents]);
  const resetStudentProgress = useCallback(async (studentId, studentName) => {
    if (!confirm(`Reset seluruh progress ${studentName}?\n\nSemua XP, streak, dan penyelesaian akan dihapus.`)) return;
    setResettingId(studentId);
    try {
      const {
        error
      } = await sbClient.from('users').update({
        progress: {}
      }).eq('id', studentId);
      if (error) throw error;
      window.showToast && window.showToast(`Progress ${studentName} berhasil direset.`, 'success');
      loadStudents();
    } catch (err) {
      window.showToast && window.showToast(`Gagal reset: ${err.message}`, 'error');
    } finally {
      setResettingId(null);
    }
  }, [loadStudents]);
  const SECTIONS = [{
    id: 'hiwar',
    label: 'Hiwar',
    scored: false
  }, {
    id: 'mufrodat',
    label: 'Mufrodat',
    scored: false
  }, {
    id: 'tadribat_1',
    label: 'Tadribat 1',
    scored: true
  }, {
    id: 'qawaid',
    label: 'Qawaid',
    scored: false
  }, {
    id: 'tadribat_2',
    label: 'Tadribat 2',
    scored: true
  }, {
    id: 'imtihan',
    label: 'Imtihan',
    scored: true
  }];
  const getOverall = student => {
    const ch = student.progress?.chapters?.['3'];
    if (!ch) return 0;
    const done = SECTIONS.filter(s => ch[s.id]?.completed).length;
    return Math.round(done / SECTIONS.length * 100);
  };
  const today = new Date().toISOString().slice(0, 10);
  const activeToday = students.filter(s => s.progress?.lastActiveDate === today).length;
  const finishedAll = students.filter(s => getOverall(s) === 100).length;
  const notStarted = students.filter(s => !s.progress?.xp || s.progress.xp === 0).length;
  const atRisk = students.filter(s => {
    const xp = s.progress?.xp || 0;
    const overall = getOverall(s);
    const lastDate = s.progress?.lastActiveDate || '2000-01-01';
    const daysSince = (new Date(today) - new Date(lastDate)) / 86400000;
    return xp === 0 || overall < 20 || daysSince > 3;
  });
  const TABS = [{
    id: 'ringkasan',
    label: '📊 Ringkasan'
  }, {
    id: 'siswa',
    label: '👥 Semua Siswa'
  }, {
    id: 'perhatian',
    label: '⚠️ Perlu Perhatian'
  }, {
    id: 'analitik',
    label: '📈 Analitik'
  }, {
    id: 'konten',
    label: '✏️ Kelola Konten'
  }];

  /* ── Analytics helpers ─────────────────────────────────────────────────── */

  const exportCSV = () => {
    try {
      const header = ['No', 'Nama', 'Email', 'XP', 'Streak', 'Terakhir Aktif', 'Hiwar', 'Mufrodat', 'Tadribat 1', 'Qawaid', 'Tadribat 2', 'Imtihan', 'Best Imtihan', '% Selesai'];
      const rows = students.map((s, i) => {
        const p = s.progress || {};
        const ch = p.chapters?.['3'] || {};
        const fmt = (sec, scored) => scored ? sec?.completed ? `${sec.score}/${sec.maxScore}` : '-' : sec?.completed ? 'Selesai' : '-';
        return [i + 1, s.nickname || '-', s.email || '-', p.xp || 0, p.streak || 0, p.lastActiveDate || '-', fmt(ch.hiwar, false), fmt(ch.mufrodat, false), fmt(ch.tadribat_1, true), fmt(ch.qawaid, false), fmt(ch.tadribat_2, true), fmt(ch.imtihan, true), ch.imtihan?.bestScore ?? '-', getOverall(s) + '%'];
      });
      const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['﻿' + csv], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arabiyya-siswa-${today}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      window.showToast && window.showToast('Gagal export CSV: ' + err.message, 'error');
    }
  };
  const getDistribution = (sectionId, maxScore) => {
    const bins = maxScore === 10 ? [{
      label: '9–10',
      min: 9
    }, {
      label: '7–8',
      min: 7
    }, {
      label: '5–6',
      min: 5
    }, {
      label: '3–4',
      min: 3
    }, {
      label: '0–2',
      min: 0
    }] : [{
      label: '13–15',
      min: 13
    }, {
      label: '10–12',
      min: 10
    }, {
      label: '7–9',
      min: 7
    }, {
      label: '4–6',
      min: 4
    }, {
      label: '0–3',
      min: 0
    }];
    return bins.map((bin, i) => ({
      label: bin.label,
      count: students.filter(s => {
        const sec = s.progress?.chapters?.['3']?.[sectionId];
        if (!sec?.completed) return false;
        const score = sec.bestScore ?? sec.score ?? 0;
        const nextMin = bins[i - 1]?.min ?? maxScore + 1;
        return score >= bin.min && score < nextMin;
      }).length
    }));
  };
  const WRONG_QUESTIONS = {
    tadribat_1: DATA.tadribat1?.questions || [],
    tadribat_2: DATA.tadribat2?.questions || [],
    imtihan: DATA.imtihan?.questions || []
  };
  const getWrongStats = sectionId => {
    const qs = WRONG_QUESTIONS[sectionId] || [];
    const withData = students.filter(s => Array.isArray(s.progress?.chapters?.['3']?.[sectionId]?.lastWrong));
    if (withData.length === 0 || qs.length === 0) return {
      stats: [],
      total: 0
    };
    const stats = qs.map((q, idx) => ({
      idx,
      prompt: q.prompt || '',
      wrongCount: withData.filter(s => s.progress.chapters['3'][sectionId].lastWrong.includes(idx)).length,
      total: withData.length
    })).filter(x => x.wrongCount > 0).sort((a, b) => b.wrongCount - a.wrongCount);
    return {
      stats,
      total: withData.length
    };
  };
  const inactiveList = students.filter(s => {
    const lastDate = s.progress?.lastActiveDate || '2000-01-01';
    return (new Date(today) - new Date(lastDate)) / 86400000 > 7;
  }).sort((a, b) => {
    const da = new Date(a.progress?.lastActiveDate || '2000-01-01');
    const db = new Date(b.progress?.lastActiveDate || '2000-01-01');
    return da - db;
  });
  const tabStyle = id => ({
    padding: '12px 18px',
    border: 'none',
    cursor: 'pointer',
    background: 'transparent',
    fontFamily: 'var(--font-latin)',
    fontWeight: tab === id ? 600 : 500,
    fontSize: 14,
    color: tab === id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    borderBottom: tab === id ? '2px solid var(--color-primary)' : '2px solid transparent',
    transition: 'all 150ms',
    whiteSpace: 'nowrap'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'var(--color-bg)',
      fontFamily: 'var(--font-latin)'
    }
  }, confirmLogout && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.5)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 20,
      padding: 28,
      maxWidth: 320,
      width: '100%',
      textAlign: 'center',
      boxShadow: 'var(--shadow-modal)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 12
    }
  }, "\uD83D\uDC4B"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Keluar dari Admin?"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--color-text-secondary)',
      fontSize: 14,
      marginBottom: 24,
      lineHeight: 1.6
    }
  }, "Sesi admin akan berakhir. Masuk lagi untuk mengakses dashboard."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmLogout(false),
    style: {
      padding: '10px 20px',
      borderRadius: 12,
      border: '1.5px solid var(--color-border)',
      background: 'var(--color-surface)',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: 14
    }
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setConfirmLogout(false);
      logout();
    },
    style: {
      padding: '10px 20px',
      borderRadius: 12,
      border: 'none',
      background: 'var(--color-error)',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: 14
    }
  }, "Ya, Keluar")))), /*#__PURE__*/React.createElement("div", {
    className: "admin-header",
    style: {
      background: 'var(--color-primary)',
      color: '#fff',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/images/logo-mark.svg",
    width: "36",
    height: "36",
    alt: "",
    style: {
      borderRadius: 10
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 16
    }
  }, "\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      opacity: 0.8
    }
  }, "Admin \xB7 Dashboard Guru"))), /*#__PURE__*/React.createElement("div", {
    className: "admin-header-right",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onToggleDark,
    style: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      borderRadius: 8,
      padding: '6px 10px',
      cursor: 'pointer',
      color: '#fff',
      fontSize: 16
    }
  }, darkMode ? '☀️' : '🌙'), /*#__PURE__*/React.createElement("button", {
    onClick: loadStudents,
    disabled: loadingStudents,
    title: "Perbarui data siswa",
    style: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      borderRadius: 8,
      padding: '6px 10px',
      cursor: loadingStudents ? 'wait' : 'pointer',
      color: '#fff',
      fontSize: 16
    }
  }, "\uD83D\uDD04"), /*#__PURE__*/React.createElement("span", {
    className: "admin-header-email",
    style: {
      opacity: 0.85,
      fontSize: 12
    }
  }, user.email), /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmLogout(true),
    style: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      borderRadius: 8,
      padding: '6px 12px',
      cursor: 'pointer',
      color: '#fff',
      fontSize: 13,
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "log-out",
    size: 14
  }), " Logout"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 24px',
      display: 'flex',
      overflowX: 'auto'
    }
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    style: tabStyle(t.id),
    onClick: () => setTab(t.id)
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: '0 auto',
      padding: '24px 24px 80px'
    }
  }, loadError && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      padding: '10px 16px',
      borderRadius: 10,
      background: 'var(--color-error-50)',
      border: '1px solid var(--color-error-border)',
      color: 'var(--color-error)',
      fontSize: 13,
      fontWeight: 500
    }
  }, "\u26A0 Gagal memuat data siswa: ", loadError), tab === 'ringkasan' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 16,
      marginBottom: 24
    }
  }, [{
    label: 'Total Siswa',
    value: students.length,
    color: 'var(--color-primary)'
  }, {
    label: 'Aktif Hari Ini',
    value: activeToday,
    color: 'var(--color-accent)'
  }, {
    label: 'Selesai Semua',
    value: finishedAll,
    color: 'var(--color-success)'
  }, {
    label: 'Belum Mulai',
    value: notStarted,
    color: 'var(--color-error)'
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      padding: '20px 16px',
      textAlign: 'center',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32,
      fontWeight: 700,
      color: s.color
    }
  }, s.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-secondary)',
      marginTop: 4
    }
  }, s.label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      padding: 24,
      border: '1px solid var(--color-border)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: 'var(--color-text-primary)',
      marginBottom: 16
    }
  }, "Penyelesaian Per Bagian \u2014 Kelas"), SECTIONS.map(s => {
    const pct = students.length === 0 ? 0 : Math.round(students.filter(st => st.progress?.chapters?.['3']?.[s.id]?.completed).length / students.length * 100);
    const colors = {
      hiwar: '#0f766e',
      mufrodat: '#14b8a6',
      tadribat_1: '#f59e0b',
      qawaid: '#7c3aed',
      tadribat_2: '#ef4444',
      imtihan: '#d97706'
    };
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 100,
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        flexShrink: 0
      }
    }, s.label), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        background: 'var(--color-border)',
        borderRadius: 4,
        height: 10,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: colors[s.id],
        height: '100%',
        width: pct + '%',
        transition: 'width 600ms'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        textAlign: 'right',
        fontWeight: 600,
        color: colors[s.id],
        fontSize: 14
      }
    }, pct, "%"));
  }))), tab === 'siswa' && /*#__PURE__*/React.createElement("div", {
    className: "admin-table-wrap"
  }, loadingStudents ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      border: '1px solid var(--color-border)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      padding: '12px 16px',
      background: 'var(--color-primary-50)',
      borderBottom: '1px solid var(--color-border)'
    }
  }, [90, 140, 48, 48, 60, 60, 60, 60, 60, 48].map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: 12,
      width: w,
      background: 'var(--color-primary)',
      borderRadius: 4,
      opacity: 0.25,
      flexShrink: 0
    }
  }))), [1, 0.85, 0.7, 0.55, 0.4].map((opacity, ri) => /*#__PURE__*/React.createElement("div", {
    key: ri,
    style: {
      display: 'flex',
      gap: 16,
      padding: '14px 16px',
      borderBottom: '1px solid var(--color-border)',
      background: ri % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)',
      opacity
    }
  }, [90, 140, 48, 48, 60, 60, 60, 60, 60, 48].map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: 12,
      width: w,
      background: 'var(--color-border)',
      borderRadius: 4,
      flexShrink: 0
    }
  }))))) : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13,
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--color-primary-50)',
      color: 'var(--color-primary)'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'left',
      fontWeight: 700
    }
  }, "Nickname"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'left',
      fontWeight: 700
    }
  }, "Email"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'center',
      fontWeight: 700
    }
  }, "XP"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'center',
      fontWeight: 700
    }
  }, "Streak"), SECTIONS.map(s => /*#__PURE__*/React.createElement("th", {
    key: s.id,
    style: {
      padding: '12px 8px',
      textAlign: 'center',
      fontWeight: 700,
      whiteSpace: 'nowrap'
    }
  }, s.label)), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'center',
      fontWeight: 700
    }
  }, "%"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 8px',
      textAlign: 'center',
      fontWeight: 700
    }
  }, "Reset"))), /*#__PURE__*/React.createElement("tbody", null, students.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 12,
    style: {
      padding: 24,
      textAlign: 'center',
      color: 'var(--color-text-light)'
    }
  }, "Belum ada siswa terdaftar.")), students.map((s, i) => /*#__PURE__*/React.createElement("tr", {
    key: s.id,
    style: {
      borderTop: '1px solid var(--color-border)',
      background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      fontWeight: 600,
      color: 'var(--color-text-primary)'
    }
  }, s.nickname), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      color: 'var(--color-text-secondary)',
      fontSize: 12
    }
  }, s.email), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      textAlign: 'center',
      color: 'var(--color-primary)',
      fontWeight: 700
    }
  }, s.progress?.xp || 0), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      textAlign: 'center'
    }
  }, "\uD83D\uDD25 ", s.progress?.streak || 0), SECTIONS.map(sec => {
    const secData = s.progress?.chapters?.['3']?.[sec.id];
    const done = secData?.completed;
    if (!done) return /*#__PURE__*/React.createElement("td", {
      key: sec.id,
      style: {
        padding: '10px 8px',
        textAlign: 'center',
        color: 'var(--color-text-light)'
      }
    }, "\u2014");
    if (!sec.scored) return /*#__PURE__*/React.createElement("td", {
      key: sec.id,
      style: {
        padding: '10px 8px',
        textAlign: 'center'
      }
    }, "\u2705");
    const best = secData.bestScore ?? secData.score;
    const attempts = secData.attempts ?? 1;
    const pct = secData.maxScore ? Math.round(secData.score / secData.maxScore * 100) : 0;
    const color = pct >= 80 ? 'var(--color-success)' : pct >= 60 ? 'var(--color-primary)' : 'var(--color-error)';
    return /*#__PURE__*/React.createElement("td", {
      key: sec.id,
      style: {
        padding: '8px',
        textAlign: 'center',
        verticalAlign: 'middle'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color,
        fontSize: 13
      }
    }, secData.score, "/", secData.maxScore), best !== secData.score && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--color-accent)',
        fontWeight: 600
      }
    }, "\u2191", best), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--color-text-light)',
        marginTop: 1
      }
    }, attempts, "\xD7"));
  }), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      textAlign: 'center',
      fontWeight: 700,
      color: getOverall(s) >= 80 ? 'var(--color-success)' : getOverall(s) >= 40 ? 'var(--color-accent)' : 'var(--color-error)'
    }
  }, getOverall(s), "%"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '8px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => resetStudentProgress(s.id, s.nickname || s.email),
    disabled: resettingId === s.id,
    style: {
      padding: '4px 10px',
      borderRadius: 7,
      border: 'none',
      background: 'var(--color-error-50)',
      color: 'var(--color-error)',
      cursor: resettingId === s.id ? 'wait' : 'pointer',
      fontSize: 12,
      fontWeight: 600
    }
  }, resettingId === s.id ? '…' : '🔄 Reset'))))))), tab === 'perhatian' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--color-text-secondary)',
      fontSize: 14,
      marginBottom: 16
    }
  }, "Siswa yang belum mulai, progress < 20%, atau tidak aktif lebih dari 3 hari."), atRisk.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-success-50)',
      borderRadius: 12,
      padding: 24,
      textAlign: 'center',
      color: 'var(--color-success)'
    }
  }, "\uD83C\uDF89 Semua siswa aktif!") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, atRisk.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    style: {
      background: 'var(--color-surface)',
      borderRadius: 12,
      padding: '14px 18px',
      border: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--color-text-primary)'
    }
  }, s.nickname), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)',
      marginTop: 2
    }
  }, s.email)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--color-error-50)',
      color: 'var(--color-error)',
      borderRadius: 6,
      padding: '3px 8px',
      fontSize: 12,
      fontWeight: 600
    }
  }, getOverall(s), "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--color-accent-50)',
      color: 'var(--color-accent)',
      borderRadius: 6,
      padding: '3px 8px',
      fontSize: 12
    }
  }, "\u26A1", s.progress?.xp || 0, " XP")))))), tab === 'analitik' && (() => {
    const {
      stats: wrongStats,
      total: wrongTotal
    } = getWrongStats(wrongSec);
    const WRONG_SEC_OPTIONS = [{
      id: 'tadribat_1',
      label: 'Tadribat 1'
    }, {
      id: 'tadribat_2',
      label: 'Tadribat 2'
    }, {
      id: 'imtihan',
      label: 'Imtihan'
    }];
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: exportCSV,
      style: {
        padding: '10px 20px',
        borderRadius: 10,
        border: 'none',
        background: 'var(--color-primary)',
        color: '#fff',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 14,
        fontFamily: 'var(--font-latin)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8
      }
    }, "\u2B07 Export CSV (", students.length, " siswa)")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        padding: 24,
        border: '1px solid var(--color-border)',
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        margin: 0
      }
    }, "Soal Paling Banyak Salah"), /*#__PURE__*/React.createElement("select", {
      value: wrongSec,
      onChange: e => setWrongSec(e.target.value),
      style: {
        padding: '6px 12px',
        borderRadius: 8,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-latin)',
        fontSize: 13,
        cursor: 'pointer'
      }
    }, WRONG_SEC_OPTIONS.map(o => /*#__PURE__*/React.createElement("option", {
      key: o.id,
      value: o.id
    }, o.label)))), wrongTotal === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px 16px',
        borderRadius: 10,
        background: 'var(--color-bg)',
        border: '1px dashed var(--color-border)',
        textAlign: 'center',
        color: 'var(--color-text-light)',
        fontSize: 14
      }
    }, "Belum ada data \u2014 siswa perlu mengerjakan ulang setelah update ini untuk memunculkan analitik per-soal.") : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        marginBottom: 12
      }
    }, "Berdasarkan ", wrongTotal, " siswa yang memiliki data. Menampilkan soal yang pernah salah saja."), /*#__PURE__*/React.createElement("div", {
      className: "admin-table-wrap"
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        background: 'var(--color-primary-50)'
      }
    }, /*#__PURE__*/React.createElement("th", {
      style: {
        padding: '10px 12px',
        textAlign: 'center',
        color: 'var(--color-primary)',
        fontWeight: 700,
        width: 48
      }
    }, "#"), /*#__PURE__*/React.createElement("th", {
      style: {
        padding: '10px 12px',
        textAlign: 'left',
        color: 'var(--color-primary)',
        fontWeight: 700
      }
    }, "Pertanyaan"), /*#__PURE__*/React.createElement("th", {
      style: {
        padding: '10px 12px',
        textAlign: 'center',
        color: 'var(--color-primary)',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        width: 100
      }
    }, "Salah"), /*#__PURE__*/React.createElement("th", {
      style: {
        padding: '10px 12px',
        textAlign: 'left',
        color: 'var(--color-primary)',
        fontWeight: 700
      }
    }, "Proporsi"))), /*#__PURE__*/React.createElement("tbody", null, wrongStats.map((row, ri) => {
      const pct = Math.round(row.wrongCount / row.total * 100);
      const barColor = pct >= 70 ? 'var(--color-error)' : pct >= 40 ? 'var(--color-accent)' : 'var(--color-primary)';
      return /*#__PURE__*/React.createElement("tr", {
        key: row.idx,
        style: {
          borderTop: '1px solid var(--color-border)',
          background: ri % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)'
        }
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '10px 12px',
          textAlign: 'center',
          color: 'var(--color-text-light)',
          fontSize: 12
        }
      }, "#", row.idx + 1), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '10px 12px',
          color: 'var(--color-text-primary)',
          maxWidth: 320
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        },
        title: row.prompt
      }, row.prompt)), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '10px 12px',
          textAlign: 'center',
          fontWeight: 700,
          color: barColor
        }
      }, row.wrongCount, "/", row.total), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '10px 12px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          background: 'var(--color-border)',
          borderRadius: 4,
          height: 10,
          overflow: 'hidden',
          minWidth: 80
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          background: barColor,
          height: '100%',
          width: pct + '%',
          transition: 'width 600ms'
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          fontWeight: 700,
          color: barColor,
          width: 36,
          textAlign: 'right'
        }
      }, pct, "%"))));
    })))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        padding: 24,
        border: '1px solid var(--color-border)',
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        margin: '0 0 20px'
      }
    }, "Distribusi Skor"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 28
      }
    }, [{
      id: 'imtihan',
      label: 'Imtihan',
      max: 15
    }, {
      id: 'tadribat_1',
      label: 'Tadribat 1',
      max: 15
    }, {
      id: 'tadribat_2',
      label: 'Tadribat 2',
      max: 10
    }].map(({
      id,
      label,
      max
    }) => {
      const dist = getDistribution(id, max);
      const maxCount = Math.max(...dist.map(d => d.count), 1);
      const total = dist.reduce((s, d) => s + d.count, 0);
      return /*#__PURE__*/React.createElement("div", {
        key: id
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: 14,
          color: 'var(--color-text-primary)',
          marginBottom: 12
        }
      }, label, " ", /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 400,
          color: 'var(--color-text-secondary)',
          fontSize: 12
        }
      }, "maks ", max, " \xB7 ", total, " siswa")), dist.map(bin => /*#__PURE__*/React.createElement("div", {
        key: bin.label,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 40,
          fontSize: 11,
          textAlign: 'right',
          color: 'var(--color-text-secondary)',
          flexShrink: 0
        }
      }, bin.label), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          background: 'var(--color-border)',
          borderRadius: 4,
          height: 16,
          overflow: 'hidden'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'var(--color-primary)',
          height: '100%',
          width: bin.count / maxCount * 100 + '%',
          transition: 'width 600ms',
          opacity: bin.count === 0 ? 0.1 : 1
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 20,
          fontSize: 13,
          fontWeight: 700,
          color: bin.count > 0 ? 'var(--color-primary)' : 'var(--color-text-light)',
          flexShrink: 0
        }
      }, bin.count))));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        padding: 24,
        border: '1px solid var(--color-border)'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        margin: '0 0 16px'
      }
    }, "Siswa Tidak Aktif > 7 Hari", inactiveList.length > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 8,
        fontSize: 13,
        fontWeight: 400,
        color: 'var(--color-error)'
      }
    }, "(", inactiveList.length, " siswa)")), inactiveList.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px 16px',
        borderRadius: 10,
        background: 'var(--color-success-50)',
        border: '1px solid var(--color-success-border)',
        textAlign: 'center',
        color: 'var(--color-success-text)',
        fontSize: 14
      }
    }, "\uD83C\uDF89 Semua siswa aktif dalam 7 hari terakhir!") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, inactiveList.map(s => {
      const lastDate = s.progress?.lastActiveDate || null;
      const daysSince = lastDate ? Math.floor((new Date(today) - new Date(lastDate)) / 86400000) : null;
      const overall = getOverall(s);
      return /*#__PURE__*/React.createElement("div", {
        key: s.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 16px',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          color: 'var(--color-text-primary)'
        }
      }, s.nickname || '—'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          marginTop: 2
        }
      }, s.email)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 8,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          background: 'var(--color-error-50)',
          color: 'var(--color-error-text)',
          borderRadius: 6,
          padding: '3px 10px',
          fontSize: 12,
          fontWeight: 600,
          border: '1px solid var(--color-error-border)'
        }
      }, daysSince === null ? 'Belum pernah aktif' : `${daysSince} hari lalu`), /*#__PURE__*/React.createElement("span", {
        style: {
          background: 'var(--color-primary-50)',
          color: 'var(--color-primary)',
          borderRadius: 6,
          padding: '3px 10px',
          fontSize: 12,
          fontWeight: 600
        }
      }, overall, "% selesai")));
    }))));
  })(), tab === 'konten' && /*#__PURE__*/React.createElement(AdminCMSPanel, null)));
}

/* ─────────────────────────────────────────────── CMS Panel ── */

function AdminCMSPanel() {
  const {
    useState,
    useEffect
  } = React;
  const [cmsTab, setCmsTab] = useState('mufrodat');
  const [words, setWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [editWord, setEditWord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const loadWords = () => {
    setLoadingWords(true);
    sbClient.from('content').select('data').eq('id', 'mufrodat').maybeSingle().then(({
      data
    }) => setWords(data?.data?.words || [])).catch(() => setWords([])).finally(() => setLoadingWords(false));
  };
  useEffect(loadWords, []);
  const saveWords = async newWords => {
    setSaving(true);
    try {
      await sbClient.from('content').upsert({
        id: 'mufrodat',
        data: {
          words: newWords
        }
      });
      setWords(newWords);
    } catch {
      alert('Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };
  const handleImageUpload = async (file, wordId) => {
    if (!file) return null;
    setUploadProgress(0);
    const ext = file.name.split('.').pop();
    const path = `${wordId}_${Date.now()}.${ext}`;
    const {
      error
    } = await sbClient.storage.from('mufrodat').upload(path, file, {
      upsert: true
    });
    if (error) {
      setUploadProgress(null);
      throw error;
    }
    setUploadProgress(100);
    const {
      data: {
        publicUrl
      }
    } = sbClient.storage.from('mufrodat').getPublicUrl(path);
    setUploadProgress(null);
    return publicUrl;
  };
  const handleSaveWord = async formData => {
    setSaving(true);
    try {
      let imageUrl = formData.image_url;
      if (formData._imageFile) {
        const id = formData.id || Date.now().toString();
        imageUrl = await handleImageUpload(formData._imageFile, id);
      }
      const wordId = formData.id || Date.now().toString();
      const cleanWord = {
        id: wordId,
        arabic: formData.arabic,
        meaning: formData.meaning,
        example: formData.example,
        example_id: formData.example_id || null,
        image_url: imageUrl || null
      };
      let newWords;
      if (formData.id) {
        newWords = words.map(w => w.id === formData.id ? cleanWord : w);
      } else {
        newWords = [...words, cleanWord];
      }
      await saveWords(newWords);
      setEditWord(null);
    } catch {
      alert('Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteWord = async id => {
    if (!confirm('Hapus kosakata ini?')) return;
    await saveWords(words.filter(w => w.id !== id));
  };
  const CMS_TABS = [{
    id: 'mufrodat',
    label: '📚 Mufrodat (' + words.length + ')'
  }, {
    id: 'tadribat1',
    label: '✏️ Tadribat 1'
  }, {
    id: 'tadribat2',
    label: '📝 Tadribat 2'
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 20,
      flexWrap: 'wrap'
    }
  }, CMS_TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => setCmsTab(t.id),
    style: {
      padding: '8px 16px',
      borderRadius: 8,
      cursor: 'pointer',
      background: cmsTab === t.id ? 'var(--color-primary)' : 'var(--color-surface)',
      color: cmsTab === t.id ? '#fff' : 'var(--color-text-secondary)',
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 13,
      border: cmsTab !== t.id ? '1px solid var(--color-border)' : 'none'
    }
  }, t.label))), cmsTab === 'mufrodat' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditWord({
      id: null,
      arabic: '',
      meaning: '',
      example: '',
      example_id: '',
      image_url: null
    }),
    style: {
      padding: '10px 20px',
      borderRadius: 10,
      border: 'none',
      background: 'var(--color-primary)',
      color: '#fff',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'var(--font-latin)'
    }
  }, "+ Tambah Kosakata")), loadingWords ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--color-text-secondary)'
    }
  }, "Memuat\u2026") : /*#__PURE__*/React.createElement("div", {
    className: "admin-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13,
      background: 'var(--color-surface)',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--color-primary-50)'
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'left',
      color: 'var(--color-primary)',
      fontWeight: 700
    }
  }, "#"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'right',
      color: 'var(--color-primary)',
      fontWeight: 700
    }
  }, "Arab"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'left',
      color: 'var(--color-primary)',
      fontWeight: 700
    }
  }, "Arti"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'left',
      color: 'var(--color-primary)',
      fontWeight: 700
    }
  }, "Contoh"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'center',
      color: 'var(--color-primary)',
      fontWeight: 700
    }
  }, "Gambar"), /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '12px 16px',
      textAlign: 'center',
      color: 'var(--color-primary)',
      fontWeight: 700
    }
  }, "Aksi"))), /*#__PURE__*/React.createElement("tbody", null, words.map((w, i) => /*#__PURE__*/React.createElement("tr", {
    key: w.id,
    style: {
      borderTop: '1px solid var(--color-border)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      color: 'var(--color-text-light)'
    }
  }, i + 1), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      fontFamily: 'var(--font-arabic)',
      fontSize: 20,
      direction: 'rtl',
      textAlign: 'right',
      color: 'var(--color-text-primary)'
    }
  }, w.arabic), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      color: 'var(--color-text-primary)',
      fontWeight: 500
    }
  }, w.meaning), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      color: 'var(--color-text-secondary)',
      fontSize: 12,
      maxWidth: 200
    }
  }, w.example), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      textAlign: 'center'
    }
  }, w.image_url ? /*#__PURE__*/React.createElement("img", {
    src: w.image_url,
    width: "40",
    height: "40",
    style: {
      borderRadius: 6,
      objectFit: 'cover'
    },
    alt: ""
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-text-light)',
      fontSize: 12
    }
  }, "\u2014")), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 16px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditWord({
      ...w
    }),
    style: {
      padding: '5px 12px',
      borderRadius: 7,
      border: 'none',
      background: 'var(--color-primary-50)',
      color: 'var(--color-primary)',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: 12
    }
  }, "Edit"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeleteWord(w.id),
    style: {
      padding: '5px 10px',
      borderRadius: 7,
      border: 'none',
      background: 'var(--color-error-50)',
      color: 'var(--color-error)',
      cursor: 'pointer',
      fontSize: 12
    }
  }, "\uD83D\uDDD1"))))), words.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 6,
    style: {
      padding: 24,
      textAlign: 'center',
      color: 'var(--color-text-light)'
    }
  }, "Belum ada kosakata. Tambahkan atau lakukan seed data."))))), editWord !== null && /*#__PURE__*/React.createElement(WordEditModal, {
    word: editWord,
    saving: saving,
    uploadProgress: uploadProgress,
    onSave: handleSaveWord,
    onClose: () => setEditWord(null)
  })), cmsTab === 'tadribat1' && /*#__PURE__*/React.createElement(TadribatCMSPanel, {
    key: "t1",
    collectionId: "tadribat1",
    title: "Tadribat 1"
  }), cmsTab === 'tadribat2' && /*#__PURE__*/React.createElement(TadribatCMSPanel, {
    key: "t2",
    collectionId: "tadribat2",
    title: "Tadribat 2"
  }));
}

/* ─────────────────────────────────────────── Word Edit Modal ── */

function WordEditModal({
  word,
  saving,
  uploadProgress,
  onSave,
  onClose
}) {
  const {
    useState
  } = React;
  const [form, setForm] = useState({
    ...word,
    _imageFile: null
  });
  const set = (key, val) => setForm(f => ({
    ...f,
    [key]: val
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-modal)',
      padding: 32,
      maxWidth: 480,
      width: '100%',
      boxShadow: 'var(--shadow-modal)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 20,
      color: 'var(--color-text-primary)'
    }
  }, form.id ? 'Edit Kosakata' : 'Tambah Kosakata Baru'), [{
    key: 'arabic',
    label: 'Arab',
    placeholder: 'الطَّبِيب',
    dir: 'rtl',
    font: 'var(--font-arabic)',
    size: 20
  }, {
    key: 'meaning',
    label: 'Arti (Indonesia)',
    placeholder: 'Dokter',
    dir: 'ltr',
    font: 'var(--font-latin)',
    size: 15
  }, {
    key: 'example',
    label: 'Contoh kalimat (Arab)',
    placeholder: 'فَحَصَ الطَّبِيبُ الْمَرِيضَ',
    dir: 'rtl',
    font: 'var(--font-arabic)',
    size: 18
  }, {
    key: 'example_id',
    label: 'Contoh kalimat (Indonesia)',
    placeholder: 'Dokter memeriksa si sakit',
    dir: 'ltr',
    font: 'var(--font-latin)',
    size: 15
  }].map(f => /*#__PURE__*/React.createElement("div", {
    key: f.key,
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
      marginBottom: 4
    }
  }, f.label), /*#__PURE__*/React.createElement("input", {
    value: form[f.key] || '',
    onChange: e => set(f.key, e.target.value),
    placeholder: f.placeholder,
    dir: f.dir,
    style: {
      width: '100%',
      height: 44,
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '0 12px',
      fontSize: f.size,
      fontFamily: f.font,
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      boxSizing: 'border-box',
      textAlign: f.dir === 'rtl' ? 'right' : 'left'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
      marginBottom: 4
    }
  }, "Gambar"), form.image_url && !form._imageFile && /*#__PURE__*/React.createElement("img", {
    src: form.image_url,
    width: "60",
    height: "60",
    style: {
      borderRadius: 8,
      objectFit: 'cover',
      marginBottom: 8,
      display: 'block'
    },
    alt: ""
  }), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: e => set('_imageFile', e.target.files[0] || null),
    style: {
      fontSize: 13,
      color: 'var(--color-text-primary)'
    }
  }), uploadProgress !== null && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      background: 'var(--color-border)',
      borderRadius: 4,
      height: 6,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-primary)',
      height: '100%',
      width: uploadProgress + '%',
      transition: 'width 200ms'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    disabled: saving,
    style: {
      padding: '10px 20px',
      borderRadius: 10,
      border: '1px solid var(--color-border)',
      background: 'transparent',
      cursor: 'pointer',
      fontWeight: 600,
      color: 'var(--color-text-secondary)'
    }
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onSave(form),
    disabled: saving || !form.arabic || !form.meaning,
    style: {
      padding: '10px 20px',
      borderRadius: 10,
      border: 'none',
      background: 'var(--color-primary)',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: 600,
      opacity: saving ? 0.6 : 1
    }
  }, saving ? 'Menyimpan…' : 'Simpan'))));
}

/* ─────────────────────────────────────────── Tadribat CMS ── */

function TadribatCMSPanel({
  collectionId,
  title
}) {
  const {
    useState,
    useEffect
  } = React;
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
    sbClient.from('content').select('data').eq('id', collectionId).maybeSingle().then(({
      data
    }) => {
      const cloudQs = data?.data?.questions || [];
      /* Cek apakah SETIAP soal Supabase cocok dengan data.js (berdasarkan prompt + urutan) */
      const fullySync = cloudQs.length === localQs.length && cloudQs.length > 0 && localQs.every((lq, i) => cloudQs[i]?.prompt === lq.prompt);
      if (fullySync) {
        setQuestions(cloudQs); /* Supabase sudah sesuai data.js */
      } else {
        /* Supabase beda / lama → tampilkan data.js DAN otomatis push ke Supabase */
        setQuestions(localQs);
        sbClient.from('content').upsert({
          id: collectionId,
          data: {
            questions: localQs
          }
        }).then(() => {}).catch(() => {});
      }
    }).catch(() => setQuestions(localQs)).finally(() => setLoading(false));
  };
  useEffect(loadQuestions, [collectionId]);
  const saveQuestions = async newQs => {
    setSaving(true);
    try {
      await sbClient.from('content').upsert({
        id: collectionId,
        data: {
          questions: newQs
        }
      });
      setQuestions(newQs);
    } catch {
      alert('Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };
  const handleSaveQ = async form => {
    const clean = {
      ...form
    };
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
  const handleDelete = async idx => {
    if (!confirm('Hapus soal ini?')) return;
    await saveQuestions(questions.filter((_, i) => i !== idx));
  };
  const TYPE_LABELS = {
    audio: 'Audio',
    text: 'Teks',
    mcq: 'MCQ',
    identify: 'Identifikasi',
    transform: 'Transformasi',
    order: 'Urutan'
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      flexWrap: 'wrap',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontSize: 16,
      color: 'var(--color-text-primary)',
      margin: 0
    }
  }, title, " \u2014 ", questions.length, " soal"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      if (!confirm(`Reset seluruh soal ${title} ke data.js? Perubahan yang tersimpan di cloud akan tertimpa.`)) return;
      await saveQuestions(localQs);
    },
    style: {
      padding: '8px 14px',
      borderRadius: 10,
      border: '1.5px solid var(--color-border)',
      background: 'var(--color-surface)',
      color: 'var(--color-text-secondary)',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'var(--font-latin)',
      fontSize: 13
    }
  }, "\u21BA Sinkronkan dari data.js"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditQ({
      _isNew: true,
      type: 'mcq',
      prompt: '',
      arabic_display: null,
      options: ['', '', '', ''],
      correct_index: 0,
      explanation: ''
    }),
    style: {
      padding: '8px 14px',
      borderRadius: 10,
      border: 'none',
      background: 'var(--color-primary)',
      color: '#fff',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'var(--font-latin)',
      fontSize: 13
    }
  }, "+ Tambah Soal"))), !loading && (() => {
    const synced = questions.length === localQs.length && localQs.every((lq, i) => questions[i]?.prompt === lq.prompt);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 12,
        padding: '8px 14px',
        borderRadius: 10,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: synced ? 'var(--color-success-50)' : 'var(--color-accent-50)',
        color: synced ? 'var(--color-success-text)' : 'var(--color-amber-text)',
        border: `1px solid ${synced ? 'var(--color-success-border)' : 'var(--color-accent-100)'}`
      }
    }, synced ? '✅ Sinkron dengan web materi — edit soal di sini langsung terlihat oleh siswa.' : '🔄 Soal cloud berbeda — sedang menyinkronkan otomatis dari data.js, tunggu sebentar lalu refresh.');
  })(), loading ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--color-text-secondary)'
    }
  }, "Memuat\u2026") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, questions.map((q, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      padding: '12px 16px',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-primary-50)',
      color: 'var(--color-primary)',
      borderRadius: 6,
      padding: '3px 8px',
      fontWeight: 700,
      fontSize: 12,
      flexShrink: 0
    }
  }, i + 1), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--color-accent-100)',
      color: 'var(--color-accent)',
      borderRadius: 4,
      padding: '2px 6px',
      fontSize: 11,
      fontWeight: 600
    }
  }, TYPE_LABELS[q.type] || q.type)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-primary)',
      fontWeight: 500
    }
  }, q.prompt), q.arabic_display && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-arabic)',
      fontSize: 18,
      direction: 'rtl',
      color: 'var(--color-primary)',
      marginTop: 4
    }
  }, q.arabic_display), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-text-secondary)',
      marginTop: 4
    }
  }, "Jawaban benar: ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--color-success)'
    }
  }, q.options?.[q.correct_index]))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditQ({
      ...q,
      _idx: i
    }),
    style: {
      padding: '5px 12px',
      borderRadius: 7,
      border: 'none',
      background: 'var(--color-primary-50)',
      color: 'var(--color-primary)',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: 12
    }
  }, "Edit"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDelete(i),
    style: {
      padding: '5px 10px',
      borderRadius: 7,
      border: 'none',
      background: 'var(--color-error-50)',
      color: 'var(--color-error)',
      cursor: 'pointer',
      fontSize: 12
    }
  }, "\uD83D\uDDD1")))), questions.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 32,
      color: 'var(--color-text-light)',
      background: 'var(--color-surface)',
      borderRadius: 10,
      border: '1px solid var(--color-border)'
    }
  }, "Belum ada soal. Tambahkan atau lakukan seed data.")), editQ !== null && /*#__PURE__*/React.createElement(QuestionEditModal, {
    q: editQ,
    saving: saving,
    onSave: handleSaveQ,
    onClose: () => setEditQ(null)
  }));
}

/* ─────────────────────────────────────── Question Edit Modal ── */

function QuestionEditModal({
  q,
  saving,
  onSave,
  onClose
}) {
  const {
    useState
  } = React;
  const [form, setForm] = useState({
    ...q
  });
  const setF = (key, val) => setForm(f => ({
    ...f,
    [key]: val
  }));
  const setOption = (i, val) => setForm(f => {
    const opts = [...(f.options || [])];
    opts[i] = val;
    return {
      ...f,
      options: opts
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: 24,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-modal)',
      padding: 32,
      maxWidth: 520,
      width: '100%',
      boxShadow: 'var(--shadow-modal)',
      margin: 'auto'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 20,
      color: 'var(--color-text-primary)'
    }
  }, q._isNew ? 'Tambah Soal' : 'Edit Soal'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
      marginBottom: 4
    }
  }, "Tipe Soal"), /*#__PURE__*/React.createElement("select", {
    value: form.type,
    onChange: e => setF('type', e.target.value),
    style: {
      width: '100%',
      height: 40,
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '0 12px',
      fontSize: 14,
      fontFamily: 'var(--font-latin)',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)'
    }
  }, ['audio', 'text', 'mcq', 'identify', 'transform', 'order'].map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
      marginBottom: 4
    }
  }, "Pertanyaan / Prompt"), /*#__PURE__*/React.createElement("textarea", {
    value: form.prompt || '',
    onChange: e => setF('prompt', e.target.value),
    rows: 2,
    style: {
      width: '100%',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '10px 12px',
      fontSize: 14,
      fontFamily: 'var(--font-latin)',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      resize: 'vertical',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
      marginBottom: 4
    }
  }, "Tampilan Arab (opsional)"), /*#__PURE__*/React.createElement("input", {
    value: form.arabic_display || '',
    onChange: e => setF('arabic_display', e.target.value || null),
    placeholder: "Teks Arab (kosongkan jika tidak ada)",
    dir: "rtl",
    style: {
      width: '100%',
      height: 40,
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '0 12px',
      fontSize: 18,
      fontFamily: 'var(--font-arabic)',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      textAlign: 'right',
      boxSizing: 'border-box'
    }
  })), form.type === 'audio' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      padding: '12px 14px',
      background: 'var(--color-accent-50)',
      borderRadius: 10,
      border: '1px solid var(--color-accent-100)'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-amber-text)',
      marginBottom: 4
    }
  }, "Teks Audio (diputar saat soal) \uD83D\uDD0A"), /*#__PURE__*/React.createElement("input", {
    value: form.audio_text || '',
    onChange: e => setF('audio_text', e.target.value || null),
    placeholder: "\u0627\u0644\u0646\u0635 \u0627\u0644\u0639\u0631\u0628\u064A \u0627\u0644\u0630\u064A \u064A\u064F\u0642\u0631\u0623",
    dir: "rtl",
    style: {
      width: '100%',
      height: 40,
      border: '1px solid var(--color-accent-100)',
      borderRadius: 8,
      padding: '0 12px',
      fontSize: 18,
      fontFamily: 'var(--font-arabic)',
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      textAlign: 'right',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--color-amber-text)',
      marginTop: 4
    }
  }, "audio_ref file sudah tersimpan di data.js dan tidak diubah di sini.")), form.type === 'order' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14,
      padding: '12px 14px',
      background: 'var(--color-primary-50)',
      borderRadius: 10,
      border: '1px solid var(--color-primary-100)'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-primary)',
      marginBottom: 4
    }
  }, "Token kata (pisah spasi, RTL) \uD83E\uDDE9"), /*#__PURE__*/React.createElement("input", {
    value: (form.tokens || []).join(' '),
    onChange: e => setF('tokens', e.target.value.trim().split(/\s+/).filter(Boolean)),
    placeholder: "\u0643\u064E\u062A\u064E\u0628\u064E \u0627\u0644\u0637\u064E\u0651\u0627\u0644\u0650\u0628\u064F \u0627\u0644\u062F\u064E\u0651\u0631\u0652\u0633\u064E",
    dir: "rtl",
    style: {
      width: '100%',
      height: 40,
      border: '1px solid var(--color-primary-100)',
      borderRadius: 8,
      padding: '0 12px',
      fontSize: 18,
      fontFamily: 'var(--font-arabic)',
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      textAlign: 'right',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--color-primary)',
      marginTop: 4
    }
  }, "Kata-kata yang akan diacak dan disusun oleh siswa.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
      marginBottom: 4
    }
  }, "Pilihan Jawaban (4 opsi) \u2014 pilih radio = jawaban benar"), [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "correct",
    checked: form.correct_index === i,
    onChange: () => setF('correct_index', i),
    style: {
      width: 16,
      height: 16,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: (form.options || [])[i] || '',
    onChange: e => setOption(i, e.target.value),
    placeholder: `Opsi ${i + 1}`,
    style: {
      flex: 1,
      height: 36,
      border: `1px solid ${form.correct_index === i ? 'var(--color-success)' : 'var(--color-border)'}`,
      borderRadius: 6,
      padding: '0 10px',
      fontSize: 14,
      fontFamily: 'var(--font-latin)',
      background: form.correct_index === i ? 'var(--color-success-50)' : 'var(--color-bg)',
      color: 'var(--color-text-primary)'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
      marginBottom: 4
    }
  }, "Penjelasan"), /*#__PURE__*/React.createElement("textarea", {
    value: form.explanation || '',
    onChange: e => setF('explanation', e.target.value),
    rows: 2,
    style: {
      width: '100%',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '10px 12px',
      fontSize: 13,
      fontFamily: 'var(--font-latin)',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      resize: 'vertical',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    disabled: saving,
    style: {
      padding: '10px 20px',
      borderRadius: 10,
      border: '1px solid var(--color-border)',
      background: 'transparent',
      cursor: 'pointer',
      fontWeight: 600,
      color: 'var(--color-text-secondary)'
    }
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onSave(form),
    disabled: saving || !form.prompt,
    style: {
      padding: '10px 20px',
      borderRadius: 10,
      border: 'none',
      background: 'var(--color-primary)',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: 600,
      opacity: saving ? 0.6 : 1
    }
  }, saving ? 'Menyimpan…' : 'Simpan'))));
}
window.AdminScreen = AdminScreen;
window.AdminCMSPanel = AdminCMSPanel;
window.WordEditModal = WordEditModal;
window.TadribatCMSPanel = TadribatCMSPanel;
window.QuestionEditModal = QuestionEditModal;