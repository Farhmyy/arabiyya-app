/* App — Root shell: router + providers + progress */

function App() {
  const { useState } = React;
  const [route, setRoute] = useState('home');

  /* Progress tracking */
  const progress = useProgress();

  const navigate = (r) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Expose progress globally so screens can access it */
  window._progress = progress;

  /* Common props for all screens */
  const screenProps = { navigate, progress };

  const screens = {
    'home':                   <HomeScreen     {...screenProps} xp={progress.xp} streak={progress.streak} />,
    'chapter/3':              <ChapterScreen  {...screenProps} />,
    'chapter/3/hiwar':        <HiwarScreen    {...screenProps} />,
    'chapter/3/mufrodat':     <MufrodatScreen {...screenProps} />,
    'chapter/3/tadribat-1':   <Tadribat1Screen {...screenProps} />,
    'chapter/3/qawaid':       <QawaidScreen   {...screenProps} />,
    'chapter/3/tadribat-2':   <Tadribat2Screen {...screenProps} />,
  };

  const screen = screens[route] || <HomeScreen {...screenProps} xp={progress.xp} streak={progress.streak} />;

  return (
    <ToastProvider>
      <div className="app">
        <Navbar route={route} navigate={navigate} xp={progress.xp} streak={progress.streak} />

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
