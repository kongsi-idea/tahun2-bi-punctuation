// 与题型无关的骨架：首页（选模式、选关卡）、出题循环、进度点、回馈后的「下一题」、结果页与错题再练。
// 题型只在 levels.js；以后其他句子类工具抄 util／voice／engine 三个档就能复用。
window.Engine = {
  S: { mode: U.get('mode', 'class'), level: null, items: [], i: 0, results: [], current: null },
  $: id => document.getElementById(id),

  boot() {
    const sound = Engine.$('btn-sound');
    const paintSound = () => { sound.setAttribute('aria-pressed', Voice.enabled); sound.querySelector('span').textContent = Voice.enabled ? 'Sound on' : 'Sound off'; };
    sound.addEventListener('click', () => { Voice.enabled = !Voice.enabled; U.set('sound', Voice.enabled ? 'on' : 'off'); paintSound(); });
    Engine.$('btn-home').addEventListener('click', Engine.home);
    paintSound();
    Engine.home();
  },

  screen(cls) {
    const s = Engine.$('screen');
    s.className = cls + ' mode-' + Engine.S.mode;
    s.replaceChildren();
    document.body.dataset.mode = Engine.S.mode;
    return s;
  },
  topbar(title, dots) {
    Engine.$('bar-title').textContent = title || '';
    const d = Engine.$('dots'); d.replaceChildren();
    if (dots) for (let k = 0; k < dots; k++) d.append(U.el('i', 'dot'));
    Engine.$('btn-home').hidden = !title;
  },

  // ───────── 首页 ─────────
  home() {
    Engine.topbar('', 0);
    const s = Engine.screen('home');
    s.innerHTML = `
      <div class="hero">
        <h1>Sentence Train</h1>
        <p class="lead">A big letter is the <b class="eng">engine</b>. The mark at the end is the <b class="caboose">last car</b>.</p>
        <div id="hero-train"></div>
      </div>
      <div class="seg" role="group" aria-label="Who is playing?">
        <button type="button" data-mode="class" aria-pressed="false"><b>Whole class</b><small>Big screen, teacher taps</small></button>
        <button type="button" data-mode="solo" aria-pressed="false"><b>On my own</b><small>I play by myself</small></button>
      </div>
      <div class="levels" id="levels"></div>
      <p class="credit">Made with Teacher Irene Wong</p>`;
    const hero = Train.build(['i', 'like', 'trains'], { mark: '', engine: false });
    Engine.$('hero-train').append(hero.root);
    Engine.heroLoop(hero);
    s.querySelectorAll('.seg button').forEach(b => {
      const set = () => s.querySelectorAll('.seg button').forEach(x => x.setAttribute('aria-pressed', x.dataset.mode === Engine.S.mode));
      b.addEventListener('click', () => { Engine.S.mode = b.dataset.mode; U.set('mode', Engine.S.mode); document.body.dataset.mode = Engine.S.mode; s.className = 'home mode-' + Engine.S.mode; set(); });
      set();
    });
    const box = Engine.$('levels');
    Levels.forEach((L, n) => {
      const b = U.el('button', 'level-card', `<span class="num">${n + 1}</span><span class="lv-text"><b>${L.name}</b><small>${L.blurb}</small></span><span class="go">${U.ICON.play}</span>`);
      b.type = 'button';
      b.addEventListener('click', () => Engine.start(L, L.makeItems(BANK)));
      box.append(b);
    });
  },
  // 首页小火车：大写 I 变火车头、句点接上车尾，反复演一遍，让孩子一眼懂概念
  async heroLoop(h) {
    if (U.reduced) { Train.setEngine(h, true); h.cars[0].querySelector('.w').textContent = 'I'; Train.setMark(h, '.'); return; }
    while (document.body.contains(h.root)) {
      h.cars[0].querySelector('.w').textContent = 'i'; Train.setEngine(h, false); Train.setMark(h, '');
      await U.wait(1400); if (!document.body.contains(h.root)) return;
      h.cars[0].querySelector('.w').textContent = 'I'; Train.setEngine(h, true); Sfx.click();
      await U.wait(1300); if (!document.body.contains(h.root)) return;
      Train.setMark(h, '.'); Sfx.couple(); Train.hop(h);
      await U.wait(2600);
    }
  },

  // ───────── 出题循环 ─────────
  start(level, items) {
    Object.assign(Engine.S, { level, items, i: 0, results: [] });
    Engine.question();
  },
  question() {
    const { level, items, i } = Engine.S;
    Engine.topbar(level.name, items.length);
    [...Engine.$('dots').children].forEach((d, k) => { d.className = 'dot' + (k < i ? (Engine.S.results[k] ? ' ok' : ' bad') : k === i ? ' now' : ''); });
    const s = Engine.screen('play');
    const item = Engine.S.current = items[i];
    const stage = U.el('section', 'stage'), dock = U.el('section', 'dock');
    s.append(stage, dock);
    level.mount(stage, dock, item, {
      mode: Engine.S.mode,
      finish(correct) {
        Engine.S.results[i] = correct;
        const dot = Engine.$('dots').children[i]; if (dot) dot.className = 'dot ' + (correct ? 'ok' : 'bad');
        const last = i === items.length - 1;
        const next = U.el('button', 'btn next', `<span>${last ? 'Finish' : 'Next'}</span>${U.ICON.play}`);
        next.type = 'button';
        next.addEventListener('click', () => { Engine.S.i++; last ? Engine.result() : Engine.question(); });
        dock.append(next);
        next.focus({ preventScroll: true });
      },
    });
  },

  // ───────── 结果与错题 ─────────
  result() {
    const { level, items, results, mode } = Engine.S;
    const wrong = items.filter((_, k) => !results[k]);
    Engine.topbar(level.name, 0);
    const s = Engine.screen('result');
    const right = items.length - wrong.length;
    const stars = Array.from({ length: items.length }, (_, k) => `<i class="star ${results[k] ? 'on' : ''}"></i>`).join('');
    s.innerHTML = `
      <div class="res-card">
        <h2>${wrong.length === 0 ? 'Perfect trip!' : 'Trip finished!'}</h2>
        <div class="stars" aria-hidden="true">${stars}</div>
        <p class="score"><b>${right}</b> of ${items.length} right the first time</p>
        ${wrong.length ? `<h3>Let’s look again</h3><ul class="review">${wrong.map(it => `<li>${level.reviewRow(it)}</li>`).join('')}</ul>` : '<p class="lead">Every train arrived on time.</p>'}
        <div class="res-actions"></div>
      </div>`;
    const act = s.querySelector('.res-actions');
    const mk = (cls, html, fn) => { const b = U.el('button', 'btn ' + cls, html); b.type = 'button'; b.addEventListener('click', fn); act.append(b); };
    if (wrong.length) mk('ask', `<span>${mode === 'class' ? 'Practise these again' : 'Try my mistakes again'}</span>`, () => Engine.start(level, U.shuffle(wrong)));
    mk('tell', '<span>New trip</span>', () => Engine.start(level, level.makeItems(BANK)));
    mk('quiet', '<span>Home</span>', Engine.home);
    if (!U.reduced && wrong.length === 0) Sfx.good();
  },
};
