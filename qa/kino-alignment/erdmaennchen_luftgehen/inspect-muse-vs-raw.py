import json

lesson = json.load(open('qa/kino-alignment/erdmaennchen_luftgehen/muse-lesson.json', encoding='utf-8'))
asr = json.load(open('qa/kino-alignment/erdmaennchen_luftgehen/muse-asr-medium.json', encoding='utf-8'))
words = [w for s in asr['segments'] for w in s.get('words', [])]
pick_ids = {p['id'] for ch in lesson['chapters'] for p in ch['picks']}

for c in lesson['cues']:
    cid = c['id']
    w_in = [w for w in words if w['end'] > c['start'] + 0.01 and w['start'] < c['end'] - 0.01]
    raw_text = ''.join(w['word'] for w in w_in).strip()
    if raw_text != c['text'] or c.get('reviewNeeded'):
        print(f"{cid} [{c['start']}-{c['end']}] pick={cid in pick_ids} reviewNeeded={c.get('reviewNeeded', False)}")
        print(f"  LESSON: {c['text']}")
        print(f"  RAW   : {raw_text}")
        print(f"  WORDS : {[(w['word'], round(w['start'],2), round(w['end'],2), round(w['probability'],3)) for w in w_in]}")
