/* App — Root shell: auth + router + dark mode + progress */

function App() {
  const { useState, useEffect } = React;

  /* Dark mode */
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('arabiyya_theme') === 'dark'
  );
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('arabiyya_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  /* Auth */
  const { user, role, loading: authLoading, loginWithGoogle, logout } = useAuth();

  /* Guest mode flag */
  const [guestMode, setGuestMode] = useState(() =>
    localStorage.getItem('arabiyya_guest') === 'true'
  );

  /* Progress: cloud for students, localStorage for guests */
  const cloudProgress = useCloudProgress(user ? user.uid : null);
  const localProgress = useProgress();
  const progress = (user && role === 'student') ? cloudProgress : localProgress;

  /* Nickname check */
  const [nickname, setNickname] = useState(null);
  const [nicknameLoading, setNicknameLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setNicknameLoading(true);
    fbDb.collection('users').doc(user.uid).get().then(doc => {
      setNickname(doc.exists ? doc.data().nickname : null);
    }).catch(() => setNickname(null))
      .finally(() => setNicknameLoading(false));
  }, [user]);

  /* Routing */
  const [route, setRoute] = useState('home');
  const navigate = (r) => { setRoute(r); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  window._progress = progress;

  /* ── Loading splash ── */
  if (authLoading || nicknameLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="assets/images/logo-mark.svg" width="56" height="56" alt="" style={{ borderRadius: 14, marginBottom: 16 }} />
          <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-latin)' }}>Memuat…</p>
        </div>
      </div>
    );
  }

  /* ── Login gate ── */
  if (!user && !guestMode) {
    return (
      <LoginScreen
        onLogin={async () => { await loginWithGoogle(); }}
        onGuest={() => { localStorage.setItem('arabiyya_guest', 'true'); setGuestMode(true); }}
      />
    );
  }

  /* ── Nickname setup (first-time login) ── */
  if (user && !nickname) {
    return (
      <NicknameScreen
        user={user}
        onComplete={(name) => setNickname(name)}
      />
    );
  }

  /* ── Admin dashboard ── */
  if (user && role === 'admin') {
    return (
      <ToastProvider>
        <AdminScreen user={user} logout={logout} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
      </ToastProvider>
    );
  }

  /* ── Student / guest app ── */
  const screenProps = { navigate, progress, darkMode };
  const screens = {
    'home':                  <HomeScreen     {...screenProps} xp={progress.xp} streak={progress.streak} />,
    'chapter/3':             <ChapterScreen  {...screenProps} />,
    'chapter/3/hiwar':       <HiwarScreen    {...screenProps} />,
    'chapter/3/mufrodat':    <MufrodatScreen {...screenProps} />,
    'chapter/3/tadribat-1':  <Tadribat1Screen {...screenProps} />,
    'chapter/3/qawaid':      <QawaidScreen   {...screenProps} />,
    'chapter/3/tadribat-2':  <Tadribat2Screen {...screenProps} />,
  };
  const screen = screens[route] || <HomeScreen {...screenProps} xp={progress.xp} streak={progress.streak} />;

  return (
    <ToastProvider>
      <div className="app">
        <Navbar route={route} navigate={navigate}
                xp={progress.xp} streak={progress.streak}
                darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)}
                user={user} nickname={nickname}
                onLogout={() => { logout(); setGuestMode(false); localStorage.removeItem('arabiyya_guest'); }} />
        {screen}
        <footer style={{
          borderTop: '1px solid var(--color-border)',
          padding: '24px', textAlign: 'center',
          color: 'var(--color-text-light)', fontSize: 13,
        }}>
          {DATA.ui.footer}
        </footer>
      </div>
    </ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
