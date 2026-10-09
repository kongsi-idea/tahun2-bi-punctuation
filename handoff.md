# 句子小火车 Sentence Train · 交接

## ⏯️ 目前做到哪
**v1.1 已上线** https://tahun2-bi-punctuation.vercel.app（Hub v1.1，署名 Teacher Irene Wong）。10-10 按 Irene 老师反馈：① 句中大写词（Mei Ling 两个词、星期、国家、句中 I）整节车厢亮金色 ② 车尾标点与最后一个词装进同一不换行组 ③④ 题库 17→24 对（I 在句中、星期、国家），每回合保证至少 2 对带句中大写。等 Irene 老师继续试用。

## 🚦 目前状态
- 关 1 Asking or Telling?（10 句＝5 对混出，问句／陈述句不相邻；答错→首词亮起＋车厢换位动画 he is → is he；每句预录英文朗读）
- 关 2 Fix the train（6 句＝3 对；点首字母变大写＝火车头亮起、点车尾切 . ?；检查标出红车厢）
- 题库 24 对＝48 句：`content/pairs.json` 唯一来源 → `python3 build-content.py` 生成 `js/bank.js` 与 `content/sentences.md` → 再跑 `gen-voice.py` 补录音
- 视觉：STYLES.md §03 骨架＋铁道皮肤（珊瑚红火车头＝问／天蓝＝陈述、奶油车厢、浅绿山丘）。**车厢全是 CSS，没有生图角色**：10-09 晚 `draw` 的 OpenAI key 额度用完（429 insufficient_quota）。想要火车头插画要等补额度
- 字体：Andika（暂用）。`fonts/compare.html`／`~/Documents/my-agent/playwright-to-delete/sentence-train-fonts.png` 是给 Irene 老师挑的对照图（Andika／Atkinson／Edu NSW ACT）
- 结构：`js/util|voice|train|engine.js` 与题型无关，可抽成共用骨架；题型只在 `js/levels.js`
- 统计脚本 track-use 已在 `index.html`；DSKP Y2 BI 4.3.1（延伸 4.2.1）

## ➡️ 下一步
1. Irene 老师继续试用：挑字体（对照图在 fonts/compare.html）；过目 `content/sentences.md`（20 对是补写的，无 Superminds 课本）。
2. push 即自动部署（GitHub Actions）；改题库流程：pairs.json → build-content.py → gen-voice.py。Hub 改版要同步 version／changelog／缩图。

## ⚠️ 注意事项
- 本机：`python3 -m http.server 8791 --bind 127.0.0.1`，开 http://127.0.0.1:8791；测试 `python3 test-e2e.py`
- 「第 2 关」第一次检查就过才算对；先点检查再修好会进错题列表
- 部分句对不是纯换词序（I→you、has→does have、wh 问句配同主题陈述句），清单里已标 aux／wh

## 🕐 最后更新
2026-10-10
