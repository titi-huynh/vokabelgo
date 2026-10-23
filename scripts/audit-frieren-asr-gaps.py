"""Flag alternate ASR speech in primary gaps for human/editorial review."""
import json
from pathlib import Path
import sys

sys.stdout.reconfigure(encoding='utf-8')

folder = Path(__file__).resolve().parents[1] / 'qa/kino-alignment/frieren_s01e01'
primary = json.loads((folder / 'recognized-words.json').read_text(encoding='utf-8'))
alternate = json.loads((folder / 'independent-small-windows.json').read_text(encoding='utf-8'))
findings = []
for window in alternate:
    for seg in window['segments']:
        if seg['end'] < 95:
            continue
        missing = [w for w in seg['words'] if not any(
            p['start']-.35 <= (w['start']+w['end'])/2 <= p['end']+.35
            for p in primary)]
        if len(missing) < 2:
            continue
        row = {'start':missing[0]['start'], 'end':missing[-1]['end'],
               'language':window['language'], 'text':' '.join(w['word'] for w in missing),
               'segment':seg['text'], 'reviewRequired':True}
        findings.append(row)
(folder / 'primary-gap-candidates.json').write_text(
    json.dumps(findings, ensure_ascii=False, indent=2), encoding='utf-8')
for row in findings:
    print(f"{row['start']:.2f}-{row['end']:.2f} [{row['language']}]: {row['text']}")
