/* tts.js — Text-to-Speech helper for Arabic
   Priority: real audio file → Web Speech API fallback
   Browser support: Chrome, Edge, Safari, Opera, Samsung Internet
   Not supported: Firefox for Android (falls back to file if audio_ref provided) */

(function () {
  // Wait for voices to be ready (Chrome fires 'voiceschanged' asynchronously)
  let _voices = [];
  function loadVoices() {
    _voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  }
  loadVoices();
  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }

  function ttsFallback(text, onEnd) {
    if (!('speechSynthesis' in window)) {
      console.warn('[TTS] Browser tidak mendukung Web Speech API');
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    u.rate = 0.85;
    const voices = _voices.length ? _voices : window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arVoice) u.voice = arVoice;
    if (onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  }

  /* Public API
     text     — Arabic text string (audio_text field)
     audioRef — path to audio file, or null to go straight to TTS
     onEnd    — optional callback fired when playback ends              */
  function speakArabic(text, audioRef, onEnd) {
    if (audioRef) {
      const a = new Audio(audioRef);
      a.onended = onEnd || null;
      a.onerror = () => ttsFallback(text, onEnd);
      a.play().catch(() => ttsFallback(text, onEnd));
      return;
    }
    ttsFallback(text, onEnd);
  }

  function stopSpeech() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  window.speakArabic = speakArabic;
  window.stopSpeech  = stopSpeech;
})();
