// 朗读：优先用预录 mp3（audio/<fnv>.mp3，由 gen-voice.py 生成）；没有音档才用浏览器 speechSynthesis（排除搞怪声音）
(function () {
  const VOICE = 'en-US-AnaNeural';
  const SILLY = /Eddy|Grandpa|Grandma|Flo|Reed|Rocko|Sandy|Shelley|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Albert|Fred|Junior|Kathy|Ralph/i;
  let current = null;
  function key(text) { return U.fnv(VOICE + '|' + text); }
  function fallback(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.85;
    const v = speechSynthesis.getVoices().find(v => /^en/i.test(v.lang) && !SILLY.test(v.name));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  window.Voice = {
    VOICE, key,
    enabled: U.get('sound', 'on') === 'on',
    say(text) {
      if (!Voice.enabled) return;
      if (current) { current.pause(); current = null; }
      if (window.VOICE_CLIPS && window.VOICE_CLIPS[key(text)]) {
        current = new Audio('audio/' + key(text) + '.mp3'); current.play().catch(() => fallback(text));
      } else fallback(text);
    },
  };
  // 音效：WebAudio 合成，不需要音档
  let ctx = null;
  function tone(freq, t0, dur, type = 'sine', vol = 0.18) {
    if (!Voice.enabled) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq; o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + t0;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { /* 没有音频设备：忽略 */ }
  }
  window.Sfx = {
    good() { tone(660, 0, 0.18); tone(880, 0.12, 0.3); tone(1320, 0.26, 0.4, 'triangle', 0.1); },
    bad() { tone(220, 0, 0.28, 'sawtooth', 0.09); tone(165, 0.14, 0.34, 'sawtooth', 0.09); },
    click() { tone(520, 0, 0.07, 'square', 0.06); },
    couple() { tone(300, 0, 0.08, 'square', 0.1); tone(450, 0.07, 0.1, 'square', 0.1); },
  };
})();
