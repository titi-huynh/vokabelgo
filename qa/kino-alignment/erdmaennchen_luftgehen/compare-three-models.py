import json

lesson = json.load(open('qa/kino-alignment/erdmaennchen_luftgehen/muse-lesson.json', encoding='utf-8'))
med = json.load(open('qa/kino-alignment/erdmaennchen_luftgehen/muse-asr-medium.json', encoding='utf-8'))
sma = json.load(open('qa/kino-alignment/erdmaennchen_luftgehen/anti-asr-small-windows.json', encoding='utf-8'))
bas = json.load(open('qa/kino-alignment/erdmaennchen_luftgehen/anti-asr-base-windows.json', encoding='utf-8'))

med_words = [w for s in med['segments'] for w in s.get('words', [])]
sma_words = [w for win in sma['windows'] for s in win['segments'] for w in s.get('words', [])]
bas_words = [w for win in bas['windows'] for s in win['segments'] for w in s.get('words', [])]

def get_span_words(words, start, end, pad=0.6):
    return [(w['word'], round(w['start'], 2), round(w['end'], 2), round(w['probability'], 3))
            for w in words if w['end'] > start - pad and w['start'] < end + pad]

check_cues = [3100021, 3100029, 3100035, 3100052, 3100058, 3100061, 3100062, 3100066, 3100067,
              3100074, 3100078, 3100100, 3100102, 3100120, 3100128, 3100131, 3100135, 3100140,
              3100141, 3100143, 3100158, 3100170, 3100171, 3100172, 3100173]

cue_map = {c['id']: c for c in lesson['cues']}
for cid in check_cues:
    c = cue_map[cid]
    print(f"\n--- {cid} [{c['start']}-{c['end']}] ({c['speaker']}): {c['text']} ---")
    print("  MED:", get_span_words(med_words, c['start'], c['end'], 0.4))
    print("  SMA:", get_span_words(sma_words, c['start'], c['end'], 0.4))
    print("  BAS:", get_span_words(bas_words, c['start'], c['end'], 0.4))
