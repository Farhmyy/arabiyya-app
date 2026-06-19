/* useQuizTimer — countdown timer hook for quiz/exam screens */

function useQuizTimer({ durationSeconds, active, initialTimeLeft, onTimeUp }) {
  const { useState, useEffect, useRef, useCallback } = React;

  const [timeLeft, setTimeLeft] = useState(
    initialTimeLeft != null && initialTimeLeft > 0 ? initialTimeLeft : durationSeconds
  );
  const [resetCount, setResetCount] = useState(0);

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  /* Start interval when active; clear when inactive or done */
  useEffect(() => {
    if (!active || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [active, resetCount]);

  /* Fire onTimeUp when timeLeft hits zero */
  useEffect(() => {
    if (active && timeLeft === 0) {
      onTimeUpRef.current && onTimeUpRef.current();
    }
  }, [timeLeft, active]);

  /* Reset to full duration (call on restart) */
  const reset = useCallback(() => {
    setTimeLeft(durationSeconds);
    setResetCount(c => c + 1);
  }, [durationSeconds]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = timeLeft > 0 && timeLeft <= 120; // last 2 minutes
  const isUrgent  = timeLeft > 0 && timeLeft <= 30;  // last 30 seconds

  return { timeLeft, formattedTime, isWarning, isUrgent, reset };
}

window.useQuizTimer = useQuizTimer;
