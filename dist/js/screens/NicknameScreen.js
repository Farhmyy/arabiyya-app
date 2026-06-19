/* NicknameScreen — first-time nickname setup after login */

function NicknameScreen({
  user,
  onComplete
}) {
  const {
    useState
  } = React;
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async e => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setError('Nickname minimal 2 karakter.');
      return;
    }
    if (trimmed.length > 30) {
      setError('Nickname maksimal 30 karakter.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const {
        error: insertError
      } = await sbClient.from('users').upsert({
        id: user.id,
        email: user.email,
        nickname: trimmed,
        role: 'student',
        last_active_date: new Date().toISOString().slice(0, 10),
        progress: {
          xp: 0,
          streak: 1,
          chapters: window.DEFAULT_PROGRESS
        }
      }, {
        onConflict: 'id'
      });
      if (insertError) throw insertError;
      onComplete(trimmed);
    } catch {
      setError('Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-modal)',
      padding: '40px 36px',
      maxWidth: 400,
      width: '100%',
      boxShadow: 'var(--shadow-modal)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 48,
      marginBottom: 16
    }
  }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 8,
      color: 'var(--color-text-primary)'
    }
  }, "Halo, ", user.displayName ? user.displayName.split(' ')[0] : 'teman', "!"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--color-text-secondary)',
      fontSize: 14,
      marginBottom: 28,
      lineHeight: 1.6
    }
  }, "Pilih nama panggilan yang akan ditampilkan kepada gurumu."), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: nickname,
    onChange: e => setNickname(e.target.value),
    placeholder: "Contoh: Ahmad Rajin",
    maxLength: 30,
    autoFocus: true,
    style: {
      width: '100%',
      height: 48,
      borderRadius: 12,
      border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
      padding: '0 16px',
      fontSize: 16,
      fontFamily: 'var(--font-latin)',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      outline: 'none',
      boxSizing: 'border-box',
      marginBottom: 8
    }
  }), error && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--color-error)',
      fontSize: 13,
      marginBottom: 8
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: saving || nickname.trim().length < 2,
    style: {
      width: '100%',
      height: 48,
      borderRadius: 12,
      border: 'none',
      background: 'var(--color-primary)',
      color: '#fff',
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 15,
      cursor: saving || nickname.trim().length < 2 ? 'not-allowed' : 'pointer',
      opacity: saving || nickname.trim().length < 2 ? 0.6 : 1,
      marginTop: 4
    }
  }, saving ? 'Menyimpan…' : 'Mulai Belajar →'))));
}
window.NicknameScreen = NicknameScreen;