/* LoginScreen — Hero (left) + Panel (right) layout */

function LoginScreen({ onLogin, onGuest }) {
  const { useState } = React;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await onLogin();
    } catch (e) {
      setError('Login gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout" style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--color-bg)',
    }}>
      {/* Hero side */}
      <div className="login-hero" style={{
        flex: 1, minHeight: 300,
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 40px', color: '#fff', textAlign: 'center',
      }}>
        <img src="assets/images/logo-mark.svg" width="72" height="72" alt=""
          style={{ marginBottom: 24, borderRadius: 18, background: 'rgba(255,255,255,0.15)', padding: 8 }} />
        <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 'var(--fs-arabic-title)', fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>
          العربية التفاعلية
        </div>
        <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 32 }}>
          Media Pembelajaran Bahasa Arab Interaktif
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '20px 24px', maxWidth: 320 }}>
          <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            عِيَادَةُ الْمَرِيضِ
          </div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>BAB 3 — Menjenguk Orang Sakit</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, fontSize: 24 }}>
            <span>💬</span><span>📚</span><span>✏️</span><span>📖</span>
          </div>
        </div>
      </div>

      {/* Panel side */}
      <div style={{
        width: 400, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 40px',
        background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
      }}>
        <div style={{ width: '100%', maxWidth: 320 }}>
          <h2 style={{ fontFamily: 'var(--font-latin)', fontWeight: 700, fontSize: 24, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            Selamat datang!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
            Masuk untuk menyimpan progress belajarmu dan agar gurumu bisa memantau perkembanganmu.
          </p>

          <button onClick={handleGoogle} disabled={loading}
            style={{
              width: '100%', height: 48, borderRadius: 12,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 15,
              color: 'var(--color-text-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: 'var(--shadow-card)',
              marginBottom: 12,
              transition: 'box-shadow 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {loading ? 'Memuat…' : 'Masuk dengan Google'}
          </button>

          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span style={{ color: 'var(--color-text-light)', fontSize: 13 }}>atau</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          <button onClick={onGuest}
            style={{
              width: '100%', height: 44, borderRadius: 12, border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-latin)', fontSize: 14,
              color: 'var(--color-text-secondary)', textDecoration: 'underline',
            }}>
            Lanjut tanpa akun
          </button>

          <p style={{ fontSize: 12, color: 'var(--color-text-light)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
            Mode tamu: progress tersimpan di perangkat ini saja dan tidak terlacak guru.
          </p>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
