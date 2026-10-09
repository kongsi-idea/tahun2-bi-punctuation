# tahun2-bi-punctuation · 句子小火车 Sentence Train — 派工规格

> 关口① 已过（2026-10-09 老师确认：方案「做」、视觉 A、署名 Teacher Irene Wong）。
> 本档是给实作者（xx 或 cc）的完整派工包；实作者不需要重新调研，照本档做，有冲突以 `../agents.md` 与 newtool skill 为准。

## 1. 来源
- 点子许愿池需求（2026-10-09，国光华小（二）校 Irene Wong 老师，Tahun 2 BI，Superminds Unit 6–9）。
- 老师补充：问题是 **A 型** —— 加标点时，问句也放句号（不是答非所问）。要「全班投影」和「学生自己练」两者，让使用者选。
- 老师提供的真实错题：`Is there a cat?`／`Where is the cat?`／`Do you like this skirt?`／`Is he playing the guitar?`

## 2. 教学目标与困难假设
- DSKP Y2 Writing **4.3.1**：引导写作中，在句子层面正确使用大写字母与句号；问号为延伸，对应 **4.2.1**（用问句询问）。DSKP 摘要：`../../kongsi-idea/docs/dskp/tahun2/bahasa-inggeris.md`。
- 假设：「开头大写＋结尾句号」已成为自动反应，学生不读句子是在问还是在说。
- 问句线索有两种，**都要教**：① 句首 wh- 词（What/Where/Who/How many…）② 句首助动词（Is/Are/Do/Does/Can）。老师的 4 句中 3 句是第 ② 种。

## 3. 玩法
**成对的句子**：每个问句都配一个只差词序的陈述句，混在一起出题，光靠反射只能对一半。

| Telling `.` | Asking `?` |
|---|---|
| There is a cat. | Is there a cat? |
| The cat is under the bed. | Where is the cat? |
| I like this skirt. | Do you like this skirt? |
| He is playing the guitar. | Is he playing the guitar? |

- **关 1 · Asking or Telling?**：句子以全小写、无结尾标点出现（像学生自己写的），选 `?` 或 `.`。答错时句首线索词亮起，并以火车车厢互换动画演示 `he is → is he`。每句有英文朗读（问句语调上扬也是线索）。
- **关 2 · Fix the sentence**：整句修好——句首大写、句中 `I`、人名大写、结尾标点；点字母切换大小写、点车尾选标点。
- **开场选模式**：
  - 全班投影：大字、一次一句、老师点；10 句约 8 分钟。
  - 自己练：学生操作；结束列出错句，可再练一次。
- 题库：老师 4 对为核心，按 DSKP 附录 Unit 6–9 主题（clothes、the home、the body、holiday activities、habitats 等）补到约 15 对。**无 Superminds 课本**：补写句子要简单（A1 low、5–8 词、常用词），清单单独列成 `content/sentences.md`，上线前请 Irene 老师过目。

## 4. 视觉：A 句子小火车（STYLES.md §03 Duolingo 起点）
- 每个词＝一节车厢；**大写字母＝火车头**；**结尾标点＝车尾那节车厢**；问句＝助动词车厢开到最前面。玩法本身要演出这个概念。
- 基底：`_style-lab/STYLES.md` §03（厚下沿按钮、三层卡片阴影、圆角 28/20/14），并遵守「通用技法」表。主题皮肤自己抽，要和近期清单（memory `design-aesthetic-preferences.md`）不撞；定案后回填那份清单。
- 不用 CSS/SVG 拼角色；需要角色或火车插画用 `draw` 生图。
- **字体**：第一步先做对照图（HTML→PNG，放 `~/Documents/my-agent/playwright-to-delete/`）：Andika／Atkinson Hyperlegible／Edu NSW ACT Foundation，各示范 `I like it. Is he playing? yes y I l`，给 Irene 老师挑大写 I 与小写 y 的形状。挑定前先用 Andika。
- 界面用简单英文；1366×768 投影与手机直立都要可用；触控可操作，不靠 hover。

## 5. 技术
- 纯静态单页（参考 `../tahun1-mt-pecahan`：`gen-voice.py` 用 edge-tts 预录英文 mp3、`test-e2e.py`）。
- `index.html` `</head>` 前必须有：`<script src="https://kongsi-idea.vercel.app/data/track-use.js" data-slug="tahun2-bi-punctuation" defer></script>`
- 不接班级名单。
- **结构要可抽成共用骨架**：模式选择（投影／自练）、出题循环、对错回馈、错题复习、朗读，放在与题型无关的模块；题型逻辑与题库独立。之后其他句子类工具会复用。

## 6. 验收（交付证据）
- 像学生一样走完两关两种模式，控制台无红字；1366×768 与 390px 直立各截图。
- 题库全部列出通读（不只抽查）：每对问句／陈述句只差词序与标点，没有语法错误。
- `handoff.md` 更新。
- **停在关口②**：本机做完交老师在自己电脑点过，不部署、不上架 Hub。

## 7. 范围外
- 答非所问（B 型）、造问句写作、班级排行榜。
