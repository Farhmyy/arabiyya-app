/* speechRecognition.js -- Arabic speech input helper
   Wraps Web Speech API SpeechRecognition for Arabic pronunciation practice.
   Supported: Chrome, Edge. Not supported: Firefox (isSpeechInputSupported -> false). */

(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function isSpeechInputSupported() {
    return !!SR;
  }

  /* Uses charCodeAt to avoid ambiguous regex ranges over the Arabic Unicode block.
     Strips: U+0610-U+061A (signs), U+064B-U+065F (harakat), U+0670 (superscript alef), U+0640 (tatweel).
     Normalizes alef variants (U+0623, U+0625, U+0622, U+0671) to bare alef (U+0627). */
  function normalizeArabic(text) {
    if (!text) return '';
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var cp = text.charCodeAt(i);
      if ((cp >= 0x0610 && cp <= 0x061A) ||
          (cp >= 0x064B && cp <= 0x065F) ||
          cp === 0x0670 || cp === 0x0640) continue;
      if (cp === 0x0623 || cp === 0x0625 || cp === 0x0622 || cp === 0x0671) {
        out += 'ا'; continue;
      }
      out += text[i];
    }
    return out.trim();
  }

  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    var dp = Array.from({length: m + 1}, function (_, i) {
      return Array.from({length: n + 1}, function (_, j) {
        return i === 0 ? j : j === 0 ? i : 0;
      });
    });
    for (var i = 1; i <= m; i++) {
      for (var j = 1; j <= n; j++) {
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[m][n];
  }

  function checkArabicPronunciation(expected, heard) {
    var ne = normalizeArabic(expected);
    var nh = normalizeArabic(heard);
    if (!ne || !nh) return { correct: false, heard: heard };
    // Fast path: exact / inclusive match (handles article differences)
    if (nh.includes(ne) || ne.includes(nh)) return { correct: true, heard: heard };
    // Fuzzy: 1 edit per 4 chars, min 1, max 3
    var threshold = Math.min(3, Math.max(1, Math.floor(ne.length / 4)));
    return { correct: levenshtein(ne, nh) <= threshold, heard: heard };
  }

  var _recognition = null;
  var _stopped = false; // flag: recognition dihentikan secara sengaja

  function startListeningArabic(onResult, onError) {
    if (!SR) { if (onError) onError('not_supported'); return; }
    stopListeningArabic();
    _stopped = false;
    _recognition = new SR();
    _recognition.lang            = 'ar-SA';
    _recognition.interimResults  = false;
    _recognition.maxAlternatives = 3;
    _recognition.continuous      = false;
    var _gotResult = false;
    _recognition.onresult = function (e) {
      _gotResult = true;
      var results = Array.from(e.results[0]).map(function (r) { return r.transcript; });
      if (onResult) onResult(results);
    };
    _recognition.onerror = function (e) {
      _gotResult = true; // prevent onend double-firing
      if (onError) onError(e.error);
    };
    _recognition.onend = function () {
      _recognition = null;
      // Jangan trigger no-speech jika dihentikan secara sengaja (stopListeningArabic)
      if (!_gotResult && !_stopped && onError) onError('no-speech');
    };
    try {
      _recognition.start();
    } catch (err) {
      _recognition = null;
      if (onError) onError('start_failed');
    }
  }

  function stopListeningArabic() {
    if (_recognition) {
      _stopped = true;
      try { _recognition.stop(); } catch (_) {}
      _recognition = null;
    }
  }

  window.isSpeechInputSupported   = isSpeechInputSupported;
  window.startListeningArabic     = startListeningArabic;
  window.stopListeningArabic      = stopListeningArabic;
  window.normalizeArabic          = normalizeArabic;
  window.checkArabicPronunciation = checkArabicPronunciation;
})();
