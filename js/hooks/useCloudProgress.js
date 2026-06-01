/* useCloudProgress — Supabase PostgreSQL progress for logged-in students */

function useCloudProgress(uid) {
  const { useState, useEffect, useCallback, useRef } = React;

  const DEFAULT = {
    xp: 0, streak: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    chapters: window.DEFAULT_PROGRESS || { '3': {
      hiwar:      { completed: false, score: 0, maxScore: 6 },
      mufrodat:   { completed: false, score: 0, maxScore: 6 },
      tadribat_1: { completed: false, score: 0, maxScore: 5 },
      qawaid:     { completed: false, score: 0, maxScore: 6 },
      tadribat_2: { completed: false, score: 0, maxScore: 5 },
    }},
  };

  const [state, setState] = useState(DEFAULT);
  const saveTimeout = useRef(null);

  /* Load from Supabase on mount */
  useEffect(() => {
    if (!uid) return;
    sbClient.from('users').select('progress').eq('id', uid).maybeSingle()
      .then(({ data }) => {
        if (data?.progress && Object.keys(data.progress).length > 0) {
          const saved = data.progress;
          const today = new Date().toISOString().slice(0, 10);
          const diff = (new Date(today) - new Date(saved.lastActiveDate || today)) / 86400000;
          if (diff > 1) saved.streak = 0;
          setState(saved);
        }
      })
      .catch(() => {});
  }, [uid]);

  /* Debounced save (500ms) */
  const persist = useCallback((updater) => {
    setState(prev => {
      const next = updater(prev);
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        sbClient.from('users').update({ progress: next }).eq('id', uid)
          .then(({ error }) => { if (error) console.error('[Progress] save failed:', error.message); });
      }, 500);
      return next;
    });
  }, [uid]);

  const addXP = useCallback((amount = 10) => {
    persist(prev => {
      const today = new Date().toISOString().slice(0, 10);
      const isNewDay = prev.lastActiveDate !== today;
      return { ...prev, xp: prev.xp + amount,
        streak: isNewDay ? prev.streak + 1 : prev.streak,
        lastActiveDate: today };
    });
  }, [persist]);

  const completeSection = useCallback((chapterId, sectionId, score, maxScore) => {
    persist(prev => {
      const chapters = { ...prev.chapters };
      if (!chapters[chapterId]) chapters[chapterId] = {};
      chapters[chapterId] = { ...chapters[chapterId], [sectionId]: { completed: true, score, maxScore } };
      return { ...prev, chapters };
    });
  }, [persist]);

  const chapterProgress = useCallback((chapterId) => {
    const ch = state.chapters?.[chapterId];
    if (!ch) return 0;
    const sections = Object.values(ch);
    return sections.length ? Math.round(sections.filter(s => s.completed).length / sections.length * 100) : 0;
  }, [state]);

  const sectionStatus = useCallback((chapterId, sectionId) => {
    const ch = state.chapters?.[chapterId];
    if (!ch || !ch[sectionId]) return 'open';
    return ch[sectionId].completed ? 'done' : 'open';
  }, [state]);

  const resetProgress = useCallback(() => persist(() => ({ ...DEFAULT })), [persist]);

  return { xp: state.xp, streak: state.streak, chapters: state.chapters,
    addXP, completeSection, chapterProgress, sectionStatus, resetProgress };
}

window.useCloudProgress = useCloudProgress;
