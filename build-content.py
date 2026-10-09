"""从 content/pairs.json（唯一来源）生成 js/bank.js 与 content/sentences.md（给 Irene 老师过目的清单）。
改题库只改 pairs.json，再跑 python3 build-content.py，然后重跑 gen-voice.py。"""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
pairs = json.load(open(os.path.join(H, 'content/pairs.json'), encoding='utf-8'))
NAMES = ['Ali', 'Mei Ling', 'Siti']
for p in pairs:
    assert p['tell'].endswith('.') and p['ask'].endswith('?'), p
    assert p['tell'][0].isupper() and p['ask'][0].isupper(), p
    if p['kind'] == 'aux':   # 助动词问句：词集合相同（允许人称代词 I↔you 的差异），只是词序不同
        a = sorted(w.strip('.?').lower() for w in p['tell'].split())
        b = sorted(w.strip('.?').lower() for w in p['ask'].split())
        print(p['id'], 'ok' if a == b else f'词不同(允许): {set(a) ^ set(b)}')
with open(os.path.join(H, 'js/bank.js'), 'w', encoding='utf-8') as f:
    f.write('// 由 build-content.py 从 content/pairs.json 生成，不要手改\n')
    f.write('window.BANK = ' + json.dumps({'names': NAMES, 'pairs': pairs}, ensure_ascii=False, indent=1) + ';\n')
with open(os.path.join(H, 'content/sentences.md'), 'w', encoding='utf-8') as f:
    f.write('# 句子小火车 · 题库清单（请 Irene 老师过目）\n\n')
    f.write(f'共 {len(pairs)} 对，{len(pairs)*2} 句。前 4 对是 Irene 老师给的真实错题；p18–p24 按 Irene 老师 10-10 的建议加（I 在句中、星期、国家）；其余对照 DSKP 附录 Unit 6–9 主题补写（无 Superminds 课本，**请老师核对用词与难度**）。\n\n')
    f.write('- 助动词类（aux）：陈述句与问句只差词序；个别换人称（I→you）或需加 do/does（has→does have）\n- 疑问词类（wh）：问句以 Where/What/Who 开头，配同主题陈述句\n\n')
    f.write('| # | 主题 | 类型 | Telling `.` | Asking `?` |\n|---|---|---|---|---|\n')
    for i, p in enumerate(pairs, 1):
        f.write(f"| {i} | {p['topic']} | {p['kind']} | {p['tell']} | {p['ask']} |\n")
print('pairs', len(pairs))
