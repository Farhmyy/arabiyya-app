/* ==========================================================================
   useProgress — localStorage-based progress + XP + streak tracking
   ========================================================================== */

const STORAGE_KEY = 'arabiyya_progress';

const DEFAULT_STATE = {
  xp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  chapters: {
    '3': {
      hiwar:      { completed: false, score: 0, maxScore: 6 },
      mufrodat:   { completed: false, score: 0, maxScore: 6 },
      tadribat_1: { completed: false, score: 0, maxScore: 5 },
      qawaid:     { completed: false, score: 0, maxScore: 6 },
      tadribat_2: { completed: false, score: 0, maxScore: 5 },
    },
  },
};

window.DEFAULT_PROGRESS = DEFAULT_STATE.chapters;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const saved = JSON.parse(raw);

    /* validate streak */
    const today = new Date().toISOString().slice(0, 10);
    const last  = saved.lastActiveDate || today;
    const diff  = (new Date(today) - new Date(last)) / 86400000;
    if (diff > 1) saved.streak = 0;

    return saved;
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

/* --------------------------------------------------------------------------
   useProgress hook — returns state + mutators
   -------------------------------------------------------------------------- */
function useProgress() {
  const { useState, useCallback } = React;
  const [state, setState] = useState(() => loadState());

  const persist = useCallback((updater) => {
    setState(prev => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const addXP = useCallback((amount = 10) => {
    persist(prev => {
      const today = new Date().toISOString().slice(0, 10);
      const isNewDay = prev.lastActiveDate !== today;
      return {
        ...prev,
        xp: prev.xp + amount,
        streak: isNewDay ? prev.streak + 1 : prev.streak,
        lastActiveDate: today,
      };
    });
  }, [persist]);

  const completeSection = useCallback((chapterId, sectionId, score, maxScore) => {
    persist(prev => {
      const chapters = { ...prev.chapters };
      if (!chapters[chapterId]) chapters[chapterId] = {};
      chapters[chapterId] = {
        ...chapters[chapterId],
        [sectionId]: { completed: true, score, maxScore },
      };
      return { ...prev, chapters };
    });
  }, [persist]);

  const chapterProgress = useCallback((chapterId) => {
    const ch = state.chapters[chapterId];
    if (!ch) return 0;
    const sections = Object.values(ch);
    if (!sections.length) return 0;
    return Math.round((sections.filter(s => s.completed).length / sections.length) * 100);
  }, [state]);

  const sectionStatus = useCallback((chapterId, sectionId) => {
    const ch = state.chapters[chapterId];
    if (!ch || !ch[sectionId]) return 'open';
    return ch[sectionId].completed ? 'done' : 'open';
  }, [state]);

  const resetProgress = useCallback(() => {
    persist(() => ({ ...DEFAULT_STATE }));
  }, [persist]);

  return {
    xp: state.xp,
    streak: state.streak,
    chapters: state.chapters,
    addXP,
    completeSection,
    chapterProgress,
    sectionStatus,
    resetProgress,
  };
}

window.useProgress = useProgress;
