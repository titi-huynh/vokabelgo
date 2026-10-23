"""Compact local ASR evidence for editorial comparison; never edits lesson text."""
import csv
import json
from pathlib import Path

folder = Path(__file__).resolve().parents[1] / 'qa/kino-alignment/frieren_s01e01'
for source, target, kind in [
    ('recognized-words.json', 'medium-segments.tsv', 'medium'),
    ('independent-small-windows.json', 'independent-small-summary.tsv', 'small'),
]:
    data = json.loads((folder / source).read_text(encoding='utf-8'))
    rows = []
    if kind == 'medium':
        rows = [['', 'de-forced', s['start'], s['end'], s['text'].strip(),
                 round(s['avg_logprob'], 3)] for s in data]
    else:
        rows = [[w['windowStart'], w['language'], s['start'], s['end'], s['text'],
                 round(s['avg_logprob'], 3)] for w in data for s in w['segments']]
    with (folder / target).open('w', encoding='utf-8', newline='') as handle:
        writer = csv.writer(handle, delimiter='\t')
        writer.writerow(['window', 'language', 'start', 'end', 'text', 'avgLogProb'])
        writer.writerows(rows)
    print(f'{target}: {len(rows)} rows, through {max(r[3] for r in rows):.2f}s')
