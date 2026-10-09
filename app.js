// 入口：载入预录音档清单，启动首页。另开 window.__train 给 gen-voice.py 与端到端测试用。
window.__train = {
  allVoiceLines() { return [...new Set(Levels.flatMap(L => L.voiceLines(BANK)))].map(text => ({ text, voice: Voice.VOICE, key: Voice.key(text) })); },
  engine: Engine,
  bank: BANK,
};
Engine.boot();
