"""Compare lesson times against raw local primary speech evidence."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parents[1] / 'qa/kino-alignment/frieren_s01e01'
primary = json.loads((folder/'recognized-words.json').read_text(encoding='utf-8'))
captions = json.loads((folder/'caption-cues.json').read_text(encoding='utf-8'))
missing = []
long_word_timings = []
checked = 0
excluded = []
for segment in primary:
    if segment['end'] < 120 or (1460 <= segment['start'] < 1547) or 'Untertitel im Auftrag' in segment['text']:
        excluded.append({'start':segment['start'],'end':segment['end'],
                         'reason':'Opening/ending song or stock ASR subtitle hallucination'})
        continue
    for word in segment['words']:
        if word['probability'] < .5:
            continue
        checked += 1
        midpoint = (word['start']+word['end'])/2
        covered = any(c['start']-.4 <= midpoint <= c['end']+.4 for c in captions)
        if not covered and word['end']-word['start'] > 1.5:
            # Whisper can stretch a final word across the following silence.
            matching = [c for c in captions if c['end'] > word['start'] and c['start'] < word['end']
                        and word['word'].strip().lower() in c['text'].lower().split()]
            if matching:
                covered = True
                long_word_timings.append({'word':word,'captionIds':[c['id'] for c in matching]})
        if not covered:
            missing.append(word)
report = {'checkedPrimaryWords':checked,'uncoveredPrimaryWords':missing,
          'stretchedSourceWordTimings':long_word_timings,
          'excludedRawSegments':excluded,
          'forestSpeechRecovered':all(any(c['text'].startswith(text) for c in captions) for text in
              ['Schon wieder derselbe Baum','Andauernd verlaufe ich mich','Wo bin ich hier']),
          'briefReplyRecovered':any(c['text']=='Nein.' and 310<c['start']<320 for c in captions),
          'note':'Time coverage checks omissions; they do not certify exact German wording or speaker identity.'}
(folder/'codex-source-coverage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='excludedRawSegments'},ensure_ascii=True,indent=2))
assert not missing and report['forestSpeechRecovered'] and report['briefReplyRecovered']
