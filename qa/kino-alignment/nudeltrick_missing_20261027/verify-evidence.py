"""Check selected words against raw independent recognition and final display cues."""
import json
from pathlib import Path
import re

root = Path(__file__).resolve().parents[3]
qa = Path(__file__).resolve().parent
review = json.loads((qa / 'review.json').read_text(encoding='utf-8'))
cues = {c['id']: c for c in json.loads((root / 'qa/kino-alignment/erdmaennchen_nudeltrick/caption-cues.json').read_text(encoding='utf-8'))}
def tokens(text):
    text = text.lower().replace('’', "'").replace("kommt's", 'kommt es').replace("geht's", 'geht es').replace('gehts', 'geht es')
    return ['habe' if t == 'hab' else t for t in re.findall(r'\w+', text)]

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
        raw_words = [w for win in payload['windows'] if win['candidate'] == evidence['candidate'] for seg in win['segments'] for w in seg['words']]
        for w in evidence['words']:
            assert any(all(w[k] == raw[k] for k in ['word', 'start', 'end']) for raw in raw_words), (entry['id'], label, w)
        assert tokens(' '.join(w['word'] for w in evidence['words'])) == tokens(entry['text']), (entry['id'], label, 'word mismatch')
    timing = entry['timingEvidence']['words']
    assert cue['start'] <= timing[0]['start'] and cue['end'] >= timing[-1]['end'], (entry['id'], 'cut model words')
    checks.append({'id': entry['id'], 'rawWordsMatch': True, 'bothModelsSupportNormalizedText': True, 'chosenTimingWordsNotCut': True})
report = {'checked': len(checks), 'normalization': "Case, punctuation, hab/habe and kommt's/kommt es or geht's/geht es; no content-word or grammatical repair", 'checks': checks}
(qa / 'evidence-verification.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'checked': len(checks), 'pass': True}))
