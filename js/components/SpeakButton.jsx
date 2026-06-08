/* SpeakButton — Mic button for Arabic pronunciation practice.
   Shows feedback (correct/wrong) after user speaks the expected word.
   Returns null silently if SpeechRecognition is not supported by the browser. */

function SpeakButton({ expectedText, size = 'md', onResult }) {
  const { useState, useEffect, useRef } = React;

  if (!window.isSpeechInputSupported || !window.isSpeechInputSupported()) return null;

  const dim = size === 'sm' ? 28 : 36;
  const iconSize = size === 'sm' ? 13 : 16;

  // state: 'idle' | 'listening' | 'correct' | 'wrong'
  const [phase, setPhase]   = useState('idle');
  const [heard,  setHeard]  = useState('');
  const resetTimer = useRef(null);

  useEffect(() => () => {
    clearTimeout(resetTimer.current);
    if (window.stopListeningArabic) window.stopListeningArabic();
  }, []);

  const scheduleReset = () => {
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setPhase('idle'), 3000);
  };

  const handleClick = (e) => {
    e.stopPropagation();

    if (phase === 'listening') {
      window.stopListeningArabic();
      clearTimeout(resetTimer.current);
      setPhase('idle');
      return;
    }

    clearTimeout(resetTimer.current); // batalkan timer reset dari sesi sebelumnya
    setPhase('listening');
    setHeard('');

    window.startListeningArabic(
      (transcripts) => {
        // Try all alternatives; use first one that matches, or fall back to first
        let best = { correct: false, heard: transcripts[0] || '' };
        for (const t of transcripts) {
          const result = window.checkArabicPronunciation(expectedText, t);
          if (result.correct) { best = result; break; }
        }
        setHeard(best.heard);
        setPhase(best.correct ? 'correct' : 'wrong');
        scheduleReset();
        if (onResult) onResult(best.correct);
      },
      (err) => {
        if (err === 'aborted') { setPhase('idle'); return; }
        if (err === 'no-speech') {
          setPhase('wrong'); // tampilkan "Tidak terdengar" bukan diam-diam reset
          scheduleReset();
          return;
        }
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          setPhase('idle');
          window.showToast && window.showToast('Izinkan akses mikrofon di browser untuk fitur pengucapan.', 'error');
          return;
        }
        setPhase('wrong');
        scheduleReset();
      }
    );
  };

  /* Visual config per phase */
  const cfg = {
    idle:      { bg: 'transparent', border: 'var(--color-primary)',        color: 'var(--color-primary)',        icon: 'mic',          title: 'Latihan ucap' },
    listening: { bg: 'var(--color-primary)',  border: 'var(--color-primary)',   color: '#fff',                       icon: 'mic',          title: 'Mendengarkan…' },
    correct:   { bg: 'var(--color-success)',  border: 'var(--color-success)',   color: '#fff',                       icon: 'check-circle', title: 'Benar!' },
    wrong:     { bg: 'var(--color-error)',    border: 'var(--color-error)',     color: '#fff',                       icon: 'x-circle',     title: heard ? `Terdengar: ${heard}` : 'Tidak terdengar' },
  }[phase];

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <button
        onClick={handleClick}
        title={cfg.title}
        aria-label={cfg.title}
        style={{
          width: dim, height: dim, borderRadius: 999, cursor: 'pointer',
          border: `1.5px solid ${cfg.border}`,
          background: cfg.bg,
          color: cfg.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all var(--dur-fast)',
          outline: phase === 'listening' ? `3px solid var(--color-primary-50)` : 'none',
          animation: phase === 'listening' ? 'pulse 1.2s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }}
      >
        {(phase === 'idle' || phase === 'listening') ? (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24"
               fill="none" stroke={cfg.color} strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ) : (
          <Icon name={cfg.icon} size={iconSize} color={cfg.color} />
        )}
      </button>

      {/* Inline label shown only on correct/wrong — fades in */}
      {(phase === 'correct' || phase === 'wrong') && (
        <div className="anim-in" style={{
          position: 'absolute', top: dim + 4,
          background: phase === 'correct' ? 'var(--color-success)' : 'var(--color-error)',
          color: '#fff', borderRadius: 8, padding: '3px 8px',
          fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
          zIndex: 10, pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,.18)',
        }}>
          {phase === 'correct' ? 'Benar!' : heard ? 'Coba lagi' : 'Tidak terdengar'}
        </div>
      )}
    </div>
  );
}

window.SpeakButton = SpeakButton;
