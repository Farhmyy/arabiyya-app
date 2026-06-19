/* useCloudProgress — Supabase PostgreSQL progress for logged-in students */

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function useCloudProgress(uid) {
  const { useState, useEffect, useCallback, useRef } = React;

  const DEFAULT = {
    xp: 0, streak: 1,
    lastActiveDate: localDateStr(),
    chapters: window.DEFAULT_PROGRESS || { '3': {
      hiwar:      { completed: false, score: 0, maxScore: 6 },
      mufrodat:   { completed: false, score: 0, maxScore: 6 },
      tadribat_1: { completed: false, score: 0, maxScore: 15, bestScore: 0, attempts: 0 },
      qawaid:     { completed: false, score: 0, maxScore: 6 },
      tadribat_2: { completed: false, score: 0, maxScore: 10, bestScore: 0, attempts: 0 },
      imtihan:    { completed: false, score: 0, maxScore: 15, bestScore: 0, attempts: 0 },
    }},
  };

  const [state, setState] = useState(DEFAULT);
  const saveTimeout = useRef(null);

  /* Load from Supabase on mount */
  useEffect(() => {
    if (!uid || typeof sbClient === 'undefined' || !sbClient) return;
    sbClient.from('users').select('progress').eq('id', uid).maybeSingle()
      .then(({ data }) => {
        if (data?.progress && Object.keys(data.progress).length > 0) {
          const saved = data.progress;
          const today = localDateStr();
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
      if (uid && typeof sbClient !== 'undefined' && sbClient) {
        clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
          sbClient.from('users').update({ progress: next }).eq('id', uid)
            .then(({ error }) => { if (error) console.error('[Progress] save failed:', error.message); })
            .catch(() => {});
        }, 500);
      }
      return next;
    });
  }, [uid]);

  const addXP = useCallback((amount = 10) => {
    persist(prev => {
      const today = localDateStr();
      const isNewDay = prev.lastActiveDate !== today;
      return { ...prev, xp: prev.xp + amount,
        streak: isNewDay ? prev.streak + 1 : prev.streak,
        lastActiveDate: today };
    });
  }, [persist]);

  const completeSection = useCallback((chapterId, sectionId, score, maxScore, wrongIndices) => {
    persist(prev => {
      const chapters = { ...prev.chapters };
      if (!chapters[chapterId]) chapters[chapterId] = {};
      const prev_sec = chapters[chapterId][sectionId] || {};
      const srsCards = prev_sec.srsCards
        || (sectionId === 'mufrodat' && window.SRS ? window.SRS.initSrsCards(maxScore) : null);
      chapters[chapterId] = {
        ...chapters[chapterId],
        [sectionId]: {
          completed: true,
          score,
          maxScore,
          bestScore: Math.max(prev_sec.bestScore ?? prev_sec.score ?? 0, score),
          attempts: (prev_sec.attempts || 0) + 1,
          ...(srsCards ? { srsCards } : {}),
          ...(wrongIndices ? { lastWrong: wrongIndices } : {}),
        },
      };
      return { ...prev, chapters };
    });
  }, [persist]);

  const updateSrsCard = useCallback((chapterId, sectionId, cardIndex, newCardData) => {
    persist(prev => {
      const sec = prev.chapters?.[chapterId]?.[sectionId] || {};
      const srsCards = { ...(sec.srsCards || {}), [cardIndex]: newCardData };
      return {
        ...prev,
        chapters: {
          ...prev.chapters,
          [chapterId]: {
            ...prev.chapters[chapterId],
            [sectionId]: { ...sec, srsCards },
          },
        },
      };
    });
  }, [persist]);

  const setSrsCards = useCallback((chapterId, sectionId, cards) => {
    persist(prev => {
      const sec = prev.chapters?.[chapterId]?.[sectionId] || {};
      return {
        ...prev,
        chapters: {
          ...prev.chapters,
          [chapterId]: {
            ...prev.chapters[chapterId],
            [sectionId]: { ...sec, srsCards: cards },
          },
        },
      };
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
    addXP, completeSection, updateSrsCard, setSrsCards,
    chapterProgress, sectionStatus, resetProgress };
}

window.useCloudProgress = useCloudProgress;
