// 火车组件：每个词一节车厢；首字母大写＝火车头；结尾标点＝车尾那节。
// 与题型无关，关卡只管喂词和标点。
window.Train = {
  // words: 要显示的词（已定好大小写）；opts.mark: 车尾标点（''＝空位）；opts.engine: 第一节是否火车头；opts.letters: 首字母做成可点按钮（第 2 关）
  build(words, opts = {}) {
    const root = U.el('div', 'train');
    const cars = words.map(w => Train.car(w, opts.letters));
    const tail = U.el('div', 'car tail');
    tail.innerHTML = '<div class="car-body"><span class="mark"></span></div><i class="wheel"></i><i class="wheel"></i>';
    const t = { root, cars, tail };
    Train.layout(t, cars);
    Train.setMark(t, opts.mark || '');
    Train.setEngine(t, !!opts.engine);
    return t;
  },
  // 摆车厢：最后一节词车厢与车尾标点装进同一个不换行的组，标点不会单独掉到下一行
  layout(t, ordered) {
    const group = U.el('div', 'last-group');
    group.append(ordered[ordered.length - 1], t.tail);
    t.root.replaceChildren(...ordered.slice(0, -1), group);
  },
  // 句中的大写词（人名、星期、国家、I）整节车厢亮金色；第一节是火车头，不算
  refreshProper(t) {
    [...t.root.querySelectorAll('.car:not(.tail)')].forEach((c, i) => {
      const txt = (c.querySelector('.w') || c.querySelector('.cap')).textContent;
      c.classList.toggle('proper', i > 0 && txt[0] !== txt[0].toLowerCase());
    });
  },
  car(text, letters) {
    const car = U.el('div', 'car');
    const body = U.el('div', 'car-body');
    if (letters) {
      const b = U.el('button', 'cap'); b.type = 'button'; b.textContent = text[0];
      b.setAttribute('aria-label', 'letter ' + text[0] + ', tap to change between small and big');
      body.append(b, U.el('span', 'rest', text.slice(1)));
    } else body.append(U.el('span', 'w', text));
    car.append(body, U.el('i', 'wheel'), U.el('i', 'wheel'), U.el('i', 'chimney', '<b class="smoke"></b>'));
    return car;
  },
  setMark(t, mark) {
    t.tail.dataset.mark = mark;
    t.tail.querySelector('.mark').textContent = mark;
    t.tail.classList.toggle('empty', !mark);
    t.tail.classList.toggle('is-ask', mark === '?');
    t.tail.classList.toggle('is-tell', mark === '.');
  },
  setEngine(t, on) { t.cars[0] && t.cars[0].classList.toggle('engine', on); },
  // 车厢依序跳一下（答对）
  hop(t) {
    if (U.reduced) return;
    [...t.cars, t.tail].forEach((c, i) => { c.style.animation = 'none'; void c.offsetWidth; c.style.animation = `hop .5s ${i * 70}ms cubic-bezier(.3,1.6,.5,1)`; });
  },
  shake(el) { if (U.reduced) return; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = 'shake .45s'; },

  // 陈述句 → 问句：车厢用 FLIP 换位，演示 he is → is he。只在「同一批词」的句对上用
  demo(tell, ask) {
    const box = U.el('div', 'demo');
    const tw = U.words(tell), aw = U.words(ask);
    const used = new Set();
    const order = aw.map(w => { const i = tw.findIndex((x, k) => !used.has(k) && x.toLowerCase() === w.toLowerCase()); used.add(i); return i; });
    const head = U.el('div', 'demo-head');
    head.innerHTML = '<span class="demo-label">Telling</span><span class="demo-arrow">→</span><span class="demo-label ask">Asking</span>';
    const t = Train.build(tw, { mark: '.', engine: true });
    t.root.classList.add('mini');
    const again = U.el('button', 'chip', U.ICON.replay + ' Watch again'); again.type = 'button';
    box.append(head, t.root, again);
    async function play() {
      // 回到陈述句
      tw.forEach((w, i) => { t.cars[i].querySelector('.w').textContent = w; });
      Train.layout(t, t.cars);
      t.cars.forEach(c => c.classList.remove('engine')); t.cars[0].classList.add('engine');
      Train.refreshProper(t);
      Train.setMark(t, '.'); t.root.classList.remove('asking');
      await U.wait(U.reduced ? 100 : 900);
      const first = new Map(t.cars.map(c => [c, c.getBoundingClientRect()]));
      order.forEach((i, k) => { t.cars[i].querySelector('.w').textContent = aw[k]; });
      Train.layout(t, order.map(i => t.cars[i]));
      Train.refreshProper(t);
      t.cars.forEach(c => c.classList.remove('engine'));
      t.cars[order[0]].classList.add('engine');
      Train.setMark(t, '?'); t.root.classList.add('asking');
      if (U.reduced) return;
      t.cars.forEach(c => {
        const a = first.get(c), b = c.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (!dx && !dy) return;
        c.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'translate(0,0)' }], { duration: 750, easing: 'cubic-bezier(.3,1.2,.4,1)' });
      });
    }
    again.addEventListener('click', play);
    box.play = play;
    return box;
  },
};
