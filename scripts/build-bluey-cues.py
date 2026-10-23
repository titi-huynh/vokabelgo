"""Align the reviewed bilingual script to local audio with Whisper cross-attention."""
import difflib
import json
import pathlib
import re
import sys
import numpy as np
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio, pad_or_trim
from faster_whisper.tokenizer import Tokenizer

sys.stdout.reconfigure(encoding='utf-8')
root = pathlib.Path(__file__).resolve().parents[1]
key = sys.argv[1]
assert key in ['pizzaschwester', 'babysitter']
folder = root / 'qa' / 'kino-alignment' / key
import subprocess
duration = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(root/'video'/f'{key}.mp4')]))
reference = json.loads((folder / 'reference.json').read_text(encoding='utf-8'))
recognized = json.loads((folder / 'recognized-words.json').read_text(encoding='utf-8'))
assert (folder/'recognition-complete.json').exists(), 'Wait for recognition to finish.'
split = r'(?<=[.!?])\s+(?=[A-ZÄÖÜÀ-Ỹ])'
translations = {int(k):v for k,v in json.loads((folder/'translations-overrides.json').read_text(encoding='utf-8')).items()}

aliases = {'pippa': 'peppa', 'pepper': 'peppa', 'peppers': 'peppas', 'dinosauria': 'dinosaurier', 'dinesaurier': 'dinosaurier', '10': 'zehn', '60': 'sechzig'}
def tokens(text):
    return [aliases.get(w, w) for w in re.findall(r'\w+', text.lower().replace('ß', 'ss'))]

atoms, reference_words = [], []
for parent in reference:
    de = re.split(split, parent['text'])
    vi = translations.get(parent['id'], re.split(split, parent['vi']))
    assert len(de) == len(vi), (parent['id'], de, vi)
    for i, (text, meaning) in enumerate(zip(de, vi)):
        atom = {'id': (200000 if key == 'pizzaschwester' else 300000) + parent['id'] * 100 + i + 1, 'parentId': parent['id'], 'text': text, 'vi': meaning,
                'oldStart': parent['start'], 'oldEnd': parent['end'], '_begin': len(reference_words)}
        reference_words.extend(tokens(text))
        atom['_end'] = len(reference_words)
        atoms.append(atom)

heard = []
for segment in recognized:
    for word in segment['words']:
        for token in tokens(word['word']):
            heard.append({**word, 'token': token})
mapping = {}
for a, b, size in difflib.SequenceMatcher(None, reference_words, [w['token'] for w in heard], autojunk=False).get_matching_blocks():
    mapping.update({a + i: b + i for i in range(size)})
for atom in atoms:
    match = [mapping[i] for i in range(atom['_begin'], atom['_end']) if i in mapping]
    atom['matchCoverage'] = round(len(match) / max(1, atom['_end'] - atom['_begin']), 3)
    if match:
        atom['start'], atom['end'] = heard[min(match)]['start'], heard[max(match)]['end']
    else:
        before = next((mapping[i] for i in range(atom['_begin'] - 1, -1, -1) if i in mapping), None)
        after = next((mapping[i] for i in range(atom['_end'], len(reference_words)) if i in mapping), None)
        atom['start'] = heard[before]['end'] if before is not None else atom['oldStart']
        atom['end'] = heard[after]['start'] if after is not None else atom['oldEnd']
        atom['end'] = max(atom['start'] + 0.12, atom['end'])
    atom['roughStart'], atom['roughEnd'] = atom['start'], atom['end']
    atom['firstMatched'] = atom['_begin'] in mapping
    atom['lastMatched'] = atom['_end'] - 1 in mapping

print(f'{len(atoms)} bilingual utterances; reference word coverage {len(mapping)/len(reference_words):.1%}', flush=True)
model = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4, local_files_only=True)
tokenizer = Tokenizer(model.hf_tokenizer, model.model.is_multilingual, task='transcribe', language='de')
audio = decode_audio(str(root / 'video' / f'{key}.mp4'), sampling_rate=16000)
i = 0
while i < len(atoms):
    j = i + 1
    while j < len(atoms) and atoms[j]['roughEnd'] - atoms[i]['roughStart'] < 20:
        j += 1
    group = atoms[i:j]
    # Recognized words before/after the target block prevent first/last words
    # from stretching into speech belonging to a neighbouring block.
    left = i - 1 if i and atoms[i]['roughStart'] - atoms[i-1]['roughEnd'] < 3 and atoms[i]['roughStart'] - atoms[i-1]['roughStart'] < 5 else i
    right = j + 1 if j < len(atoms) and atoms[j]['roughStart'] - group[-1]['roughEnd'] < 3 and atoms[j]['roughEnd'] - group[-1]['roughEnd'] < 6 else j
    context = atoms[left:right]
    if max(a['roughEnd'] for a in context) - context[0]['roughStart'] > 29:
        context = group
    begin = max(0, context[0]['roughStart'] - 0.4)
    finish = min(duration, max(a['roughEnd'] for a in context) + 0.4, begin + 29.9)
    features = model.feature_extractor(audio[int(begin*16000):int(finish*16000)])
    encoded = model.encode(pad_or_trim(features))
    text = ' ' + ' '.join(a['text'] for a in context)
    aligned = model.find_alignment(tokenizer, [tokenizer.encode(text)], encoded, int((finish-begin)*100))[0]
    flattened = []
    for w in aligned:
        for token in tokens(w['word']):
            flattened.append({**w, 'token': token})
    offset = 0
    for atom in context:
        length = len(tokens(atom['text']))
        words = flattened[offset:offset+length]
        offset += length
        assert [w['token'] for w in words] == tokens(atom['text']), atom
        if atom not in group:
            continue
        nonzero = [w for w in words if w['end'] > w['start']]
        probability = float(np.mean([w['probability'] for w in words])) if words else 0
        atom['alignmentProbability'] = round(probability, 3)
        if nonzero:
            atom['forcedStart'] = round(begin+nonzero[0]['start'],3)
            atom['forcedEnd'] = round(begin+nonzero[-1]['end'],3)
        if nonzero and probability >= 0.18:
            start = begin + nonzero[0]['start']
            end = begin + nonzero[-1]['end']
            # A missed interjection must not drag an entire utterance into another scene.
            if atom['matchCoverage'] == 0 or (abs(start - atom['start']) < 4.5 and abs(end - atom['end']) < 4.5):
                atom['start'], atom['end'] = start, end
        if atom['firstMatched'] and atom['matchCoverage'] >= .7:
            atom['start'] = max(atom['start'], atom['roughStart'] - .12)
        if atom['lastMatched'] and atom['matchCoverage'] >= .7:
            atom['end'] = max(atom['end'], atom['roughEnd'] - .04)
        atom.pop('_begin', None)
        atom.pop('_end', None)
    print(f'Aligned {i+1}-{j}/{len(atoms)} at {begin:.2f}-{finish:.2f}', flush=True)
    (folder / 'aligned-utterances-audit.json').write_text(json.dumps(atoms, ensure_ascii=False, indent=2), encoding='utf-8')
    i = j

# Reproducible review corrections for short calls masked by effects.
overrides_path = folder / 'timing-overrides.json'
overrides = json.loads(overrides_path.read_text(encoding='utf-8')) if overrides_path.exists() else {}
for atom in atoms:
    override = overrides.get(str(atom['id']))
    if override:
        atom.update({k: override[k] for k in ['start', 'end']})
        atom['reviewEvidence'] = override['evidence']
# Preserve a small lead/tail and divide shared pauses, never overlapping another utterance.
for i, atom in enumerate(atoms):
    if i and atom['start'] < atoms[i-1]['end']:
        boundary = (atom['start'] + atoms[i-1]['end']) / 2
        atoms[i-1]['end'] = max(atoms[i-1]['start'] + .08, boundary)
        atom['start'] = atoms[i-1]['end']
for i, atom in enumerate(atoms):
    previous_end = atoms[i-1]['end'] if i else 0
    atom['start'] = max(previous_end, atom['start'] - 0.06)
    next_start = atoms[i+1]['start'] if i+1 < len(atoms) else duration
    atom['end'] = min(max(atom['start'] + 0.08, atom['end'] + 0.08), max(atom['start'] + 0.08, next_start))
    atom['start'], atom['end'] = round(atom['start'], 3), round(atom['end'], 3)
    assert atom['end'] > atom['start'], atom
(folder / 'aligned-utterances-audit.json').write_text(json.dumps(atoms, ensure_ascii=False, indent=2), encoding='utf-8')
runtime = [{k: a[k] for k in ['id', 'parentId', 'start', 'end', 'text', 'vi']} for a in atoms]
(root / f'{key}-aligned.js').write_text('// Local audio-aligned bilingual utterances. Original movie is unchanged.\nconst ' + ('PIZZA_ALIGNED_UTTERANCES' if key == 'pizzaschwester' else 'BABYSITTER_ALIGNED_UTTERANCES') + ' = ' + json.dumps(runtime, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(f'Wrote {key}-aligned.js', flush=True)
