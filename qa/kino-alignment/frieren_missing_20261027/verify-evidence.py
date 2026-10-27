"""Check selected words against raw independent recognition and final display cues."""
import json
from pathlib import Path
import re

root = Path(__file__).resolve().parents[3]
qa = Path(__file__).resolve().parent
review = json.loads((qa / 'review.json').read_text(encoding='utf-8'))
cues = {c['id']: c for c in json.loads((qa / 'caption-cues.json').read_text(encoding='utf-8'))}
def tokens(text):
    return re.findall(r'\w+', text.lower().replace('’', "'"))

checks = []
for entry in review['added']:
    cue = cues[entry['id']]
    for key, value in cue.items():
        assert entry[key] == value, (entry['id'], key)
    for label in ['smallEvidence', 'mediumEvidence', 'timingEvidence']:
        evidence = entry[label]
        file = (root / evidence['file']).resolve()
        assert file.is_relative_to(root)
        payload = json.loads(file.read_text(encoding='utf-8'))
        windows = [win for win in payload['windows'] if win['candidate'] == evidence['candidate'] and [win['start'],win['end']] == evidence['crop']]
        assert len(windows) == 1, (entry['id'], label, 'exact crop not found')
        raw_words = [w for win in windows for seg in win['segments'] for w in seg['words']]
        for w in evidence['words']:
            assert any(all(w[k] == raw[k] for k in ['word', 'start', 'end', 'probability']) for raw in raw_words), (entry['id'], label, w)
        assert tokens(' '.join(w['word'] for w in evidence['words'])) == tokens(entry['text']), (entry['id'], label, 'word mismatch')
    timing = entry['timingEvidence']['words']
    assert cue['start'] <= timing[0]['start'] and cue['end'] >= timing[-1]['end'], (entry['id'], 'cut model words')
    checks.append({'id': entry['id'], 'rawWordsMatch': True, 'bothModelsSupportNormalizedText': True, 'chosenTimingWordsNotCut': True})
report = {'checked': len(checks), 'normalization': 'Case and punctuation only; no name, content-word or grammatical repair', 'checks': checks}
(qa / 'evidence-verification.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'checked': len(checks), 'pass': True}))
