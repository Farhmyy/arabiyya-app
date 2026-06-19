/* srs.js — SM-2 Spaced Repetition algorithm */

const SRS = (function () {
  function localDateStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function addDays(dateStr, n) {
    // Use noon to avoid DST edge cases
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + n);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // rating: 'hard' | 'good' | 'easy'
  function scheduleCard(card, rating) {
    const qMap = { hard: 2, good: 3, easy: 5 };
    const q = qMap[rating] || 3;

    let { interval = 1, repetitions = 0, easeFactor = 2.5, lapses = 0 } = card;
    let newInterval, newRepetitions, newLapses;

    if (q < 3) {
      newInterval = 1;
      newRepetitions = 0;
      newLapses = lapses + 1;
    } else {
      if (repetitions === 0)      newInterval = 1;
      else if (repetitions === 1) newInterval = 6;
      else                        newInterval = Math.round(interval * easeFactor);
      newRepetitions = repetitions + 1;
      newLapses = lapses;
    }

    const newEF = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

    return {
      interval:    newInterval,
      repetitions: newRepetitions,
      easeFactor:  parseFloat(newEF.toFixed(3)),
      nextReview:  addDays(localDateStr(), newInterval),
      lapses:      newLapses,
    };
  }

  // Returns sorted array of card indices that are due today or overdue
  function getDueCards(srsCards) {
    if (!srsCards) return [];
    const today = localDateStr();
    return Object.keys(srsCards)
      .map(Number)
      .filter(i => {
        const c = srsCards[i];
        return c && c.nextReview && c.nextReview <= today;
      })
      .sort((a, b) => a - b);
  }

  // Initialize a fresh srsCards object for `count` words, all due tomorrow
  function initSrsCards(count) {
    const tomorrow = addDays(localDateStr(), 1);
    const cards = {};
    for (let i = 0; i < count; i++) {
      cards[i] = { interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: tomorrow, lapses: 0 };
    }
    return cards;
  }

  return { scheduleCard, getDueCards, initSrsCards, localDateStr, addDays };
})();

window.SRS = SRS;
