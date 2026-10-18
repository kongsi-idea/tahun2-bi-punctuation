# 句子小火车 Sentence Train · 交接

## ⏯️ 目前做到哪
**v1.2 已上线** https://tahun2-bi-punctuation.vercel.app（Hub v1.2，changelog 记「感谢 Ming Zhu 老师发现」）。10-18 按 Ming Zhu 老师截图：p20 改 `On Fridays, I ride my bike.`（补逗号）；p21 改 `We have Art on Tuesdays.`／`When do we have Art?`（科目名大写）；大写提示语加 school subjects；补录 3 句朗读；Hub 关 2 缩图换成 `v1-2-fix-art.png`。全题库 48 句复查过，没发现别的错。

## 🚦 目前状态
- 关 1 Asking or Telling?（10 句）、关 2 Fix the train（6 句）；题库 24 对＝48 句，`content/pairs.json` 唯一来源
- e2e `python3 test-e2e.py` FAILS 0；`npm run check -- tahun2-bi-punctuation` 全过
- 视觉全 CSS（无生图角色）；字体暂用 Andika

## ➡️ 下一步
1. 等老师决定：Art 是否维持大写（标准语法科目名小写，只有语言科目必大写）；要零争议可把 p21 换成 English。
2. Irene 老师挑字体（`fonts/compare.html`）、过目 `content/sentences.md`。
3. 改题库流程：pairs.json → `build-content.py` → `gen-voice.py`（要先开 8791 本机服务）→ push 自动部署 → Hub 升版＋changelog。

## ⚠️ 注意事项
- 本机：`python3 -m http.server 8791 --bind 127.0.0.1`；`gen-voice.py` 与 e2e 合跑超过 2 分钟，放背景跑
- 旧版 p20／p21 的 3 个 mp3 还在 `audio/`（manifest 已不引用），无害，未清
- 截 Hub 缩图可在正式网址用 `Engine.start(Levels[1], [item])` 直接指定题目，不必随机翻题
- 「第 2 关」第一次检查就过才算对

## 🕐 最后更新
2026-10-19 · Claude Opus 5.5 @ mr007's Macbook Air · Git ✅ 已推
