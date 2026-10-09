"""句子小火车 端到端测试：两关 × 两模式从头走到尾，答错/答对都走，控制台不能有红字。截图存 .playwright-output/。
用法：先 `python3 -m http.server 8791 --bind 127.0.0.1`，再 `python3 test-e2e.py`。TARGET 可改成线上网址。"""
import os, re, json
from playwright.sync_api import sync_playwright

URL = os.environ.get('TARGET', 'http://127.0.0.1:8791/index.html')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.playwright-output')
os.makedirs(OUT, exist_ok=True)
fails = 0
def check(name, ok, extra=''):
    global fails
    print(('  ✅ ' if ok else '  ❌ ') + name + (f' — {extra}' if extra else ''))
    if not ok: fails += 1

def tail_attached(pg):
    # 车尾标点不能单独在新的一行：它和前一节车厢同一行
    return pg.evaluate('''() => { const t = document.querySelector('.stage .train > .last-group'); if (!t) return false;
      const cars = t.querySelectorAll('.car'); return cars.length === 2 && Math.abs(cars[0].getBoundingClientRect().top - cars[1].getBoundingClientRect().top) < 2; }''')

def run(p, w, h, tag):
    errs = []
    br = p.chromium.launch(); pg = br.new_page(viewport={'width': w, 'height': h})
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    check(f'[{tag}] 首页有两个关卡', pg.locator('.level-card').count() == 2)
    check(f'[{tag}] 统计脚本 track-use 在页面里', 'track-use.js' in pg.content() and 'data-slug="tahun2-bi-punctuation"' in pg.content())
    pg.screenshot(path=f'{OUT}/{tag}-home.png')

    for mode in ('class', 'solo'):
        # ── 关 1：故意全答对前 5 题、后 5 题答错 ──
        pg.click('#btn-home') if pg.locator('#btn-home').is_visible() else None
        pg.click(f'.seg button[data-mode="{mode}"]')
        pg.click('.level-card >> nth=0'); pg.wait_for_timeout(300)
        seen = []
        for k in range(10):
            it = pg.evaluate('__train.engine.S.current')
            seen.append(it['sentence'])
            check(f'[{tag}/{mode}] L1 第{k+1}题以全小写、无标点出现', pg.locator('.stage .car .w').all_inner_texts() == [w.lower() for w in it['sentence'].rstrip('.?').split(' ')])
            right = k < 5
            pick = it['answer'] if right else ('?' if it['answer'] == '.' else '.')
            check(f'[{tag}/{mode}] L1 第{k+1}题车尾与最后一个词同一行', tail_attached(pg))
            pg.click('.btn.ask' if pick == '?' else '.btn.tell'); pg.wait_for_timeout(1200 if not right else 400)
            mid = [x for x in it['sentence'].rstrip('.?').split(' ')[1:] if x[0].isupper()]
            check(f'[{tag}/{mode}] L1 第{k+1}题句中大写词 {mid} 全部亮起', pg.locator('.stage > .train .car.proper').count() == len(mid))
            if not right and pg.locator('.demo').count():
                check(f'[{tag}/{mode}] L1 演示车尾同行', pg.evaluate('''() => { const g = document.querySelector('.demo .last-group'); const c = g.querySelectorAll('.car'); return Math.abs(c[0].getBoundingClientRect().top - c[1].getBoundingClientRect().top) < 2; }'''))
            fb = pg.locator('.feedback').first
            check(f'[{tag}/{mode}] L1 第{k+1}题回馈 {"Yes" if right else "Not quite"}', ('Yes!' if right else 'Not quite') in fb.inner_text())
            if k == 5: pg.screenshot(path=f'{OUT}/{tag}-{mode}-l1-wrong.png')
            if k == 0: pg.screenshot(path=f'{OUT}/{tag}-{mode}-l1-right.png')
            # 问句与陈述句一定都出现过：到最后检查
            pg.click('.btn.next'); pg.wait_for_timeout(150)
        check(f'[{tag}/{mode}] L1 10 题互不相同', len(set(seen)) == 10)
        pg.wait_for_timeout(300)
        check(f'[{tag}/{mode}] 结果页：5 句错题列表', pg.locator('.review li').count() == 5)
        if mode == 'class': pg.screenshot(path=f'{OUT}/{tag}-{mode}-result.png')
        pg.click('.btn.ask'); pg.wait_for_timeout(300)   # 错题再练
        check(f'[{tag}/{mode}] 错题再练 5 题', pg.evaluate('__train.engine.S.items.length') == 5)
        pg.click('#btn-home')

        # ── 关 2 ──
        pg.click('.level-card >> nth=1'); pg.wait_for_timeout(300)
        for k in range(6):
            it = pg.evaluate('__train.engine.S.current')
            target = it['sentence']; ws = target.rstrip('.?').split(' ')
            if k == 0: pg.screenshot(path=f'{OUT}/{tag}-{mode}-l2-start.png')
            check(f'[{tag}/{mode}] L2 第{k+1}题车尾与最后一个词同一行', tail_attached(pg))
            # 先故意不做就检查 → 必须有红车厢，且不会过关
            pg.click('.btn.go'); pg.wait_for_timeout(250)
            check(f'[{tag}/{mode}] L2 第{k+1}题没做就检查：不过关', pg.locator('.btn.next').count() == 0 and pg.locator('.car.wrong').count() >= 1)
            if k == 0: pg.screenshot(path=f'{OUT}/{tag}-{mode}-l2-wrong.png')
            for i, w in enumerate(ws):
                if w[0].isupper(): pg.locator('.stage .car .cap').nth(i).click()
            for _ in range(1 if it['answer'] == '.' else 2): pg.click('.car.tail')
            pg.click('.btn.go'); pg.wait_for_timeout(300)
            nmid = len([x for x in ws[1:] if x[0].isupper()])
            check(f'[{tag}/{mode}] L2 第{k+1}题句中大写词亮起 {nmid}', pg.locator('.stage .car.proper').count() == nmid)
            check(f'[{tag}/{mode}] L2 第{k+1}题修好过关（{target}）', pg.locator('.btn.next').count() == 1 and 'All aboard' in pg.locator('.feedback').inner_text())
            if k == 0: pg.screenshot(path=f'{OUT}/{tag}-{mode}-l2-done.png')
            pg.click('.btn.next'); pg.wait_for_timeout(150)
        # 第一次就检查过（故意）→ 每题都算错，结果页应列出 6 句
        check(f'[{tag}/{mode}] L2 结果页列出 6 句首次未过', pg.locator('.review li').count() == 6)
        pg.click('#btn-home')
    check(f'[{tag}] 控制台无红字', not errs, '; '.join(errs)[:200])
    br.close()

with sync_playwright() as p:
    run(p, 1366, 768, 'desktop')
    run(p, 390, 844, 'phone')
print('FAILS:', fails)
raise SystemExit(1 if fails else 0)
