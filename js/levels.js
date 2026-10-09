// 两个关卡。接口（engine.js 只认这个）：
//   id, name, blurb, count, makeItems(bank) → items, mount(stage, dock, item, ctx), reviewRow(item) → html, voiceLines(bank) → [text]
// ctx.finish(correct) 记一题并显示 Next；ctx.mode = 'class' | 'solo'
(function () {
  // 句对 → 句子；每句记下所属的 pair，方便解释
  function sentencesOf(pair) {
    return [
      { sentence: pair.tell, answer: '.', pair },
      { sentence: pair.ask, answer: '?', pair },
    ];
  }
  // 洗牌后让同一对的两句不要相邻（光靠反射答不了）
  function mixed(items) {
    let best = items;
    for (let t = 0; t < 60; t++) {
      const a = U.shuffle(items);
      if (a.every((x, i) => i === 0 || a[i - 1].pair !== x.pair)) return a;
      best = a;
    }
    return best;
  }
  // 句中（第一个词之后）有大写：人名、星期、国家、I
  const midCaps = sentence => U.words(sentence).slice(1).filter(w => w[0] !== w[0].toLowerCase());
  const capsPair = p => midCaps(p.tell).length > 0 || midCaps(p.ask).length > 0;
  // 每回合：至少 minCaps 对带句中大写、至少 1 对 wh、至少 2 对 aux，两种问句线索与大写规则都练到
  function pickPairs(bank, n, minCaps) {
    const chosen = U.shuffle(bank.pairs.filter(capsPair)).slice(0, minCaps);
    const pool = U.shuffle(bank.pairs.filter(p => !chosen.includes(p)));
    const take = (pred, need) => { while (chosen.filter(pred).length < need) { const k = pool.findIndex(pred); if (k < 0) break; chosen.push(pool.splice(k, 1)[0]); } };
    take(p => p.kind === 'wh', 1); take(p => p.kind === 'aux', 2);
    while (chosen.length < n) chosen.push(pool.shift());
    return U.shuffle(chosen);
  }
  const lower = s => U.words(s).map(w => w.toLowerCase());
  const canDemo = p => p.kind === 'aux' && U.sortedKey(p.tell) === U.sortedKey(p.ask);

  // ───────── 关 1 · Asking or Telling? ─────────
  const askTell = {
    id: 'ask-tell',
    name: 'Asking or Telling?',
    blurb: 'Read the train. Is it asking, or telling?',
    count: 10,
    makeItems(bank) {
      return mixed(pickPairs(bank, 5, 2).flatMap(sentencesOf));
    },
    voiceLines(bank) { return bank.pairs.flatMap(p => [p.tell, p.ask]); },
    mount(stage, dock, item, ctx) {
      const ws = lower(item.sentence).map((w) => w);
      const t = Train.build(ws, { mark: '' });
      const task = U.el('p', 'task', 'Is this train <b class="ask">asking</b> or <b class="tell">telling</b>?');
      const listen = U.el('button', 'chip listen', U.ICON.speaker + ' Listen');
      listen.type = 'button';
      listen.addEventListener('click', () => Voice.say(item.sentence));
      stage.append(t.root, task, listen);

      const bAsk = U.el('button', 'btn ask', '<span class="sym">?</span><span>Asking</span>');
      const bTell = U.el('button', 'btn tell', '<span class="sym">.</span><span>Telling</span>');
      [bAsk, bTell].forEach(b => b.type = 'button');
      dock.append(bAsk, bTell);

      let answered = false;
      function answer(pick) {
        if (answered) return; answered = true;
        const ok = pick === item.answer;
        bAsk.disabled = bTell.disabled = true;
        dock.replaceChildren(); task.remove(); listen.remove();
        // 车头拿到大写、车尾接上标点：把句子写对
        U.words(item.sentence).forEach((w, i) => { t.cars[i].querySelector('.w').textContent = w; });
        Train.setEngine(t, true); Train.refreshProper(t);
        if (ok) {
          Sfx.good(); Train.setMark(t, item.answer); Sfx.couple(); Train.hop(t);
        } else {
          Sfx.bad(); Train.setMark(t, pick); t.tail.classList.add('wrong'); Train.shake(t.tail);
          setTimeout(() => { t.tail.classList.remove('wrong'); Train.setMark(t, item.answer); Sfx.couple(); }, 900);
          t.cars[0].classList.add('look');
        }
        Voice.say(item.sentence);
        const fb = U.el('div', 'feedback ' + (ok ? 'ok' : 'bad'));
        fb.innerHTML = `<div class="badge">${ok ? U.ICON.check : '!'}</div><div class="fb-text"><b>${ok ? 'Yes!' : 'Not quite.'}</b> ${askTell.explain(item, ok, pick)}</div>`;
        dock.append(fb);
        if (!ok && canDemo(item.pair)) {
          const demo = Train.demo(item.pair.tell, item.pair.ask);
          stage.classList.add('compact'); stage.append(demo); demo.play();
        }
        ctx.finish(ok);
      }
      bAsk.addEventListener('click', () => answer('?'));
      bTell.addEventListener('click', () => answer('.'));
    },
    explain(item, ok, pick) {
      const caps = midCaps(item.sentence);
      const note = caps.length ? ` <span class="bignote">Big letters in the middle: ${caps.map(w => '“' + w + '”').join(', ')}. Names, days, countries and “I” always start big.</span>` : '';
      return askTell.explainCore(item, ok, pick) + note;
    },
    explainCore(item, ok, pick) {
      const p = item.pair, first = U.words(item.sentence)[0];
      if (item.answer === '?') {
        if (p.kind === 'wh') return `“${first}” at the start is a question word. This train is <b class="ask">asking</b>.`;
        return `It starts with “${first}”. A helper word at the front means <b class="ask">asking</b>.` +
          (canDemo(p) ? ' Telling goes the other way: the helper word comes after who or what.' : '');
      }
      return `This one is <b class="tell">telling</b> us something.` +
        (canDemo(p) ? ` To ask, the helper word “${lower(p.ask)[0]}” would jump to the front.` : ' It does not start with a question word.');
    },
    reviewRow(item) {
      return `<span class="rv-s">${item.sentence}</span><span class="rv-note">${item.answer === '?' ? 'asking' : 'telling'}</span>`;
    },
  };

  // ───────── 关 2 · Fix the train ─────────
  const fixTrain = {
    id: 'fix-train',
    name: 'Fix the train',
    blurb: 'Make big letters for the engine, names and “I”. Then pick the last car.',
    count: 6,
    makeItems(bank) {
      return mixed(pickPairs(bank, 3, 2).flatMap(sentencesOf));
    },
    voiceLines(bank) { return bank.pairs.flatMap(p => [p.tell, p.ask]); },
    mount(stage, dock, item, ctx) {
      const target = U.words(item.sentence);
      const isBig = w => w[0] !== w[0].toLowerCase();
      const t = Train.build(target.map(w => w.toLowerCase()), { letters: true, mark: '' });
      const caps = target.map(() => false);
      let mark = '';
      const task = U.el('p', 'task', 'Fix the train. <span class="sub">Tap a letter to make it big. Tap the last car to add <b class="tell">.</b> or <b class="ask">?</b></span>');
      const listen = U.el('button', 'chip listen', U.ICON.speaker + ' Listen');
      listen.type = 'button';
      listen.addEventListener('click', () => Voice.say(item.sentence));
      stage.append(t.root, task, listen);

      const refresh = () => {
        t.cars.forEach((c, i) => {
          const cap = c.querySelector('.cap'), w = target[i].toLowerCase();
          cap.textContent = caps[i] ? w[0].toUpperCase() : w[0];
          c.classList.toggle('is-big', caps[i]);
          c.classList.toggle('proper', caps[i] && i > 0);
        });
        Train.setEngine(t, caps[0]);
        Train.setMark(t, mark);
      };
      t.cars.forEach((c, i) => c.querySelector('.cap').addEventListener('click', () => {
        if (locked) return; caps[i] = !caps[i]; Sfx.click(); c.classList.remove('wrong'); refresh();
      }));
      t.tail.addEventListener('click', () => {
        if (locked) return; mark = mark === '' ? '.' : mark === '.' ? '?' : ''; Sfx.click(); t.tail.classList.remove('wrong'); refresh();
      });
      t.tail.setAttribute('role', 'button'); t.tail.tabIndex = 0;
      t.tail.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.tail.click(); } });

      let locked = false, firstTry = true;
      const check = U.el('button', 'btn go', U.ICON.check + '<span>Check the train</span>');
      check.type = 'button';
      const msg = U.el('div', 'feedback hidden');
      dock.append(check, msg);
      check.addEventListener('click', () => {
        if (locked) return;
        const badCars = target.map((w, i) => caps[i] !== isBig(w));
        const badTail = mark !== item.answer;
        t.cars.forEach((c, i) => c.classList.toggle('wrong', badCars[i]));
        t.tail.classList.toggle('wrong', badTail);
        const nBad = badCars.filter(Boolean).length + (badTail ? 1 : 0);
        msg.classList.remove('hidden', 'ok', 'bad');
        if (nBad === 0) {
          locked = true; Sfx.good(); Train.hop(t); Voice.say(item.sentence);
          check.remove();
          msg.classList.add('ok');
          msg.innerHTML = `<div class="badge">${U.ICON.check}</div><div class="fb-text"><b>All aboard!</b> The engine has a big letter and the last car has the right mark.</div>`;
          ctx.finish(firstTry);
        } else {
          Sfx.bad(); firstTry = false;
          [...t.cars, t.tail].filter(c => c.classList.contains('wrong')).forEach(Train.shake);
          msg.classList.add('bad');
          const tips = [];
          if (badCars[0]) tips.push('The first word needs a big letter.');
          if (badCars.slice(1).some(Boolean)) tips.push('Names, days, countries and “I” have big letters. Other words stay small.');
          if (badTail) tips.push('Read it. Is it asking or telling?');
          msg.innerHTML = `<div class="badge">!</div><div class="fb-text"><b>${nBad} red ${nBad === 1 ? 'car' : 'cars'}.</b> ${tips.join(' ')}</div>`;
        }
      });
    },
    reviewRow(item) {
      return `<span class="rv-s">${item.sentence}</span><span class="rv-note">fix</span>`;
    },
  };

  window.Levels = [askTell, fixTrain];
})();
