function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* App — Root shell: auth + router + dark mode + progress */

function App() {
  const {
    useState,
    useEffect
  } = React;

  /* Dark mode */
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('arabiyya_theme') === 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('arabiyya_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  /* Auth */
  const {
    user,
    role,
    loading: authLoading,
    loginWithGoogle,
    logout
  } = useAuth();

  /* Guest mode flag */
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('arabiyya_guest') === 'true');

  /* Progress: cloud for students, localStorage for guests */
  const cloudProgress = useCloudProgress(user ? user.id : null);
  const localProgress = useProgress();
  const progress = user && role === 'student' ? cloudProgress : localProgress;

  /* Nickname check */
  const [nickname, setNickname] = useState(null);
  const [nicknameLoading, setNicknameLoading] = useState(true);
  useEffect(() => {
    if (!user) {
      setNicknameLoading(false); // tidak ada user, tidak perlu loading
      return;
    }
    setNicknameLoading(true);
    sbClient.from('users').select('nickname').eq('id', user.id).maybeSingle().then(({
      data
    }) => setNickname(data?.nickname || null)).catch(() => setNickname(null)).finally(() => setNicknameLoading(false));
  }, [user]);

  /* Routing — route dipersist ke sessionStorage agar tidak hilang saat pindah tab */
  const [route, setRoute] = useState(() => {
    try {
      return sessionStorage.getItem('arabiyya_route') || 'home';
    } catch {
      return 'home';
    }
  });
  const navigate = r => {
    setRoute(r);
    try {
      sessionStorage.setItem('arabiyya_route', r);
    } catch {}
    window.history.pushState({
      route: r
    }, '');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  /* Sinkronkan browser back button dengan router internal */
  useEffect(() => {
    window.history.replaceState({
      route
    }, '');
    const onPop = e => {
      const r = e.state && e.state.route || 'home';
      setRoute(r);
      try {
        sessionStorage.setItem('arabiyya_route', r);
      } catch {}
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* Simpan & pulihkan posisi scroll saat user pindah tab lalu kembali */
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        try {
          sessionStorage.setItem('arabiyya_scrollY', String(window.scrollY));
        } catch {}
      } else {
        try {
          const y = parseInt(sessionStorage.getItem('arabiyya_scrollY') || '0', 10);
          if (y > 0) requestAnimationFrame(() => window.scrollTo({
            top: y
          }));
        } catch {}
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  const [swUpdate, setSwUpdate] = useState(false);
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onControllerChange = () => setSwUpdate(true);
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, []);
  window._progress = progress;

  /* ── Loading splash ── */
  if (authLoading || nicknameLoading) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "assets/images/logo-mark.svg",
      width: "56",
      height: "56",
      alt: "",
      style: {
        borderRadius: 14,
        marginBottom: 16
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--color-text-secondary)',
        fontFamily: 'var(--font-latin)'
      }
    }, "Memuat\u2026")));
  }

  /* ── Login gate ── */
  if (!user && !guestMode) {
    return /*#__PURE__*/React.createElement(LoginScreen, {
      onLogin: async () => {
        await loginWithGoogle();
      },
      onGuest: () => {
        localStorage.setItem('arabiyya_guest', 'true');
        setGuestMode(true);
      }
    });
  }

  /* ── Nickname setup (first-time login) ── */
  if (user && !nickname) {
    return /*#__PURE__*/React.createElement(NicknameScreen, {
      user: user,
      onComplete: name => setNickname(name)
    });
  }

  /* ── Admin dashboard ── */
  if (user && role === 'admin') {
    return /*#__PURE__*/React.createElement(ToastProvider, null, swUpdate && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'var(--color-primary)',
        color: '#fff',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        fontFamily: 'var(--font-latin)',
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,.25)'
      }
    }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDD95 Ada pembaruan tersedia."), /*#__PURE__*/React.createElement("button", {
      onClick: () => window.location.reload(),
      style: {
        background: '#fff',
        color: 'var(--color-primary)',
        border: 'none',
        borderRadius: 8,
        padding: '6px 14px',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'var(--font-latin)'
      }
    }, "Muat Ulang")), /*#__PURE__*/React.createElement(AdminScreen, {
      user: user,
      logout: logout,
      darkMode: darkMode,
      onToggleDark: () => setDarkMode(d => !d)
    }));
  }

  /* ── Student / guest app ── */
  const isGuest = !user && guestMode;
  const onSwitchToLogin = () => {
    setGuestMode(false);
    localStorage.removeItem('arabiyya_guest');
  };
  const screenProps = {
    navigate,
    progress,
    darkMode
  };
  const screens = {
    'home': /*#__PURE__*/React.createElement(HomeScreen, _extends({}, screenProps, {
      xp: progress.xp,
      streak: progress.streak,
      isGuest: isGuest,
      onSwitchToLogin: onSwitchToLogin
    })),
    'chapter/3': /*#__PURE__*/React.createElement(ChapterScreen, screenProps),
    'chapter/3/hiwar': /*#__PURE__*/React.createElement(HiwarScreen, screenProps),
    'chapter/3/mufrodat': /*#__PURE__*/React.createElement(MufrodatScreen, screenProps),
    'chapter/3/tadribat-1': /*#__PURE__*/React.createElement(Tadribat1Screen, screenProps),
    'chapter/3/qawaid': /*#__PURE__*/React.createElement(QawaidScreen, screenProps),
    'chapter/3/tadribat-2': /*#__PURE__*/React.createElement(Tadribat2Screen, screenProps),
    'chapter/3/imtihan': /*#__PURE__*/React.createElement(ImtihanScreen, screenProps)
  };
  const screen = screens[route] || /*#__PURE__*/React.createElement(HomeScreen, _extends({}, screenProps, {
    xp: progress.xp,
    streak: progress.streak,
    isGuest: isGuest,
    onSwitchToLogin: onSwitchToLogin
  }));
  return /*#__PURE__*/React.createElement(ToastProvider, null, swUpdate && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'var(--color-primary)',
      color: '#fff',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      fontFamily: 'var(--font-latin)',
      fontSize: 14,
      fontWeight: 500,
      boxShadow: '0 2px 8px rgba(0,0,0,.25)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDD95 Ada pembaruan tersedia."), /*#__PURE__*/React.createElement("button", {
    onClick: () => window.location.reload(),
    style: {
      background: '#fff',
      color: 'var(--color-primary)',
      border: 'none',
      borderRadius: 8,
      padding: '6px 14px',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'var(--font-latin)'
    }
  }, "Muat Ulang")), /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(Navbar, {
    route: route,
    navigate: navigate,
    xp: progress.xp,
    streak: progress.streak,
    progress: progress,
    darkMode: darkMode,
    onToggleDark: () => setDarkMode(d => !d),
    user: user,
    nickname: nickname,
    onLogout: () => {
      logout();
      setGuestMode(false);
      localStorage.removeItem('arabiyya_guest');
    }
  }), screen, /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--color-border)',
      padding: '24px',
      textAlign: 'center',
      color: 'var(--color-text-light)',
      fontSize: 13
    }
  }, DATA.ui.footer)));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));