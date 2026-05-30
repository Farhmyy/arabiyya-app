/* App — Root shell: router + dark mode (auth will be added in Task 8) */

function App() {
  const { useState, useEffect } = React;
  const [route, setRoute] = useState('home');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('arabiyya_theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('arabiyya_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const progress = useProgress();

  const navigate = (r) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window._progress = progress;

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
        <Navbar route={route} navigate={navigate} xp={progress.xp} streak={progress.streak}
                darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
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
