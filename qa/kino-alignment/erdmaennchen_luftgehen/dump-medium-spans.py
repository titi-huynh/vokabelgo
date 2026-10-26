import json

asr = json.load(open('qa/kino-alignment/erdmaennchen_luftgehen/muse-asr-medium.json', encoding='utf-8'))
spans = [
    (21, 100, 125),
    (52, 188, 248),
    (78, 290, 299),
    (100, 360, 385),
    (120, 476, 483),
    (128, 499, 504),
    (140, 531, 548),
    (158, 576, 583),
    (171, 616, 633),
    (182, 670, 685)
]

for label, s_min, s_max in spans:
    print(f"=== SPAN {label}: {s_min}-{s_max} ===")
    for seg in asr['segments']:
        if seg['end'] > s_min and seg['start'] < s_max:
            print(f"  SEG [{seg['start']}-{seg['end']}] logprob={seg['avg_logprob']}: {seg['text']}")
            for w in seg.get('words', []):
                print(f"    {w['start']:6.2f}-{w['end']:6.2f} p={w['probability']:.3f} {w['word']!r}")
