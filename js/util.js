// 小工具：洗牌、FNV 档名、句子拆解、localStorage 安全读写
window.U = {
  shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  fnv(s) { let h = 0x811c9dc5; for (const b of new TextEncoder().encode(s)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); },
  words(sentence) { return sentence.replace(/[.?]$/, '').split(' '); },
  mark(sentence) { return sentence.slice(-1); },
  sortedKey(sentence) { return U.words(sentence).map(w => w.toLowerCase()).sort().join(' '); },
  get(k, d) { try { const v = localStorage.getItem('sentence-train:' + k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sentence-train:' + k, v); } catch (e) { /* 无痕模式等：忽略 */ } },
  el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; },
  wait(ms) { return new Promise(r => setTimeout(r, ms)); },
  reduced: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
  ICON: {
    speaker: '<svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden="true"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>',
    replay: '<svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.6 4.7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M4 4v6h6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
};
