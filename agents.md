# 句子小火车 Sentence Train（tahun2-bi-punctuation）

Tahun 2 英文标点／大写练习，Teacher Irene Wong 的点子（点子铺许愿池）。线上 https://tahun2-bi-punctuation.vercel.app ，push main 即自动部署。流程与规格见 `SPEC.md`，现况见 `handoff.md`，共用规则见 `../agents.md`。

## 关键决定（代码看不出来的）
- **题库唯一来源 `content/pairs.json`**：改完跑 `build-content.py`（生成 `js/bank.js`、`content/sentences.md`）再跑 `gen-voice.py` 补录音；不要手改 `bank.js`。
- **句对不一定纯换词序**：I→you、has→does have、wh 问句配同主题陈述句；只有「词集合相同」的 aux 对才做车厢换位演示（`Train.demo`）。
- **避免全大写词（如 PE）**：第 2 关只能切换首字母，`PE` 无法判对，已改成 `art`。
- **不用 `It's` 缩写**：Irene 老师例句原是 `It's raining…`，改成 `It is…`，因为换位演示按整词拆；如要保留缩写需先改演示逻辑。
- **标点车厢必须与最后一个词同行**（`.last-group`）；句中大写词（人名、星期、国家、I）整节亮金色（`Train.refreshProper`）。老师 10-10 反馈，别改回平铺。
- **每回合保证 ≥2 对带句中大写**、≥1 对 wh、≥2 对 aux（`pickPairs`）。
- **没有火车头插画**：车厢全 CSS；`draw` 的 OpenAI key 额度 10-09 用完。补额度前不要用 CSS／SVG 拼角色。
- **字体暂用 Andika**，Irene 老师尚未在 Atkinson／Edu NSW ACT 间挑定（`fonts/compare.html`）。
- **界面全英文**（二年级英文课）；不接班级名单；不保存进度。
- 范围外：答非所问（B 型）、造问句写作、排行榜。
