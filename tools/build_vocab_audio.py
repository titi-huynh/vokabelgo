#!/usr/bin/env python3
# Sinh audio phat am chuan cho tu vung VokabelGo bang Muse TTS (Aria, de).
# Nguon: the BASE + VIDEO_FLASHCARDS trong index.html va lemma cua lexicon runtime Dau Tu.
# Dau ra: assets/vocab-audio/<file>.mp3 + assets/vocab-audio/manifest.json
# Cache ngoai repo de chay lai re: ~/workspace/vokabelgo-audio-cache/
import json, os, re, subprocess, sys, hashlib, unicodedata
from concurrent.futures import ThreadPoolExecutor

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, 'assets', 'vocab-audio')
CACHE = os.path.expanduser('~/workspace/vokabelgo-audio-cache')
TTS = '/opt/hatch/bin/tts'
VOICE = 'avocado_v2:MAI_01'
os.makedirs(OUT, exist_ok=True); os.makedirs(CACHE, exist_ok=True)

def spoken_of(term):
    """Chuan hoa dang doc: bo hau to so nhieu sau dau phay (nhu getListeningText),
    '+' doc 'plus', bo '...' va '|'."""
    t = (term or '').strip()
    t = re.sub(r',\s*(-[^\s,]*|pl\.?|Pl\.?|die\s+[^,]+)$', '', t, flags=re.I).strip()
    t = t.replace('|', ' ').replace('…', ' ').replace('...', ' ')
    t = re.sub(r'\s*\+\s*', ' plus ', t)
    return re.sub(r'\s+', ' ', t).strip()

def slug_of(spoken):
    s = unicodedata.normalize('NFKD', spoken.lower())
    s = s.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:48].strip('-') or 'wort'
    return s + '-' + hashlib.sha1(spoken.encode('utf-8')).hexdigest()[:8]

def extract_cards():
    src = open(os.path.join(REPO, 'index.html'), encoding='utf-8').read()
    cards = []
    for name in ['BASE', 'VIDEO_FLASHCARDS']:
        m = re.search(name + r'\s*=\s*\[', src)
        i = m.end(); depth = 1; j = i
        while depth and j < len(src):
            if src[j] == '[': depth += 1
            elif src[j] == ']': depth -= 1
            j += 1
        cards += json.loads(src[m.start():j][src[m.start():j].index('['):])
    return cards

def extract_lemmas():
    p = os.path.join(REPO, 'data/lexicon/runtime/dau-tu-approved-runtime.json')
    d = json.load(open(p, encoding='utf-8'))
    out = {}
    for eid, e in d.get('approvedPool', {}).get('entries', {}).items():
        lemma = (e.get('lemma') or '').strip()
        if lemma: out[eid] = lemma
    return out

def render_one(item):
    spoken, fname = item
    final = os.path.join(OUT, fname)
    if os.path.exists(final) and os.path.getsize(final) > 2000:
        return spoken, True, 'cached-file'
    key = hashlib.sha1(f'{VOICE}|de|88|{spoken}'.encode('utf-8')).hexdigest()
    raw = os.path.join(CACHE, key + '.mp3')
    if not (os.path.exists(raw) and os.path.getsize(raw) > 1000):
        err = None
        for attempt in range(3):
            r = subprocess.run([TTS, 'speak', '--output', raw, '--voice', VOICE,
                                '--language', 'de', '--speed', '88', '--text-stdin'],
                               input=spoken, capture_output=True, text=True, timeout=180)
            if r.returncode == 0 and os.path.exists(raw) and os.path.getsize(raw) > 1000:
                err = None; break
            err = (r.stdout + r.stderr)[-200:]
        if err is not None:
            return spoken, False, err
    r = subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-ar', '44100',
                        '-ac', '1', '-b:a', '128k', final], capture_output=True, text=True)
    if r.returncode != 0:
        return spoken, False, r.stderr[-200:]
    return spoken, True, 'ok'

def main():
    jobs = {}   # spoken -> {'file':..., 'card_ids':[], 'entry_ids':[]}
    for c in extract_cards():
        sp = spoken_of(c.get('term', ''))
        if not sp: continue
        e = jobs.setdefault(sp, {'file': slug_of(sp) + '.mp3', 'card_ids': [], 'entry_ids': []})
        e['card_ids'].append(c['id'])
    for eid, lemma in extract_lemmas().items():
        sp = spoken_of(lemma)
        if not sp: continue
        e = jobs.setdefault(sp, {'file': slug_of(sp) + '.mp3', 'card_ids': [], 'entry_ids': []})
        e['entry_ids'].append(eid)
    items = sorted((sp, e['file']) for sp, e in jobs.items())
    print(f'{len(items)} cum doc duy nhat tu {sum(len(e["card_ids"]) for e in jobs.values())} the + '
          f'{sum(len(e["entry_ids"]) for e in jobs.values())} muc lexicon', flush=True)
    fails = []
    with ThreadPoolExecutor(max_workers=4) as ex:
        for sp, ok, msg in ex.map(render_one, items):
            if not ok: fails.append((sp, msg))
    print('that bai:', len(fails))
    for f in fails: print('  FAIL', f)
    entries = {}
    by_term = {}
    for sp, e in sorted(jobs.items()):
        entries[sp] = {'spoken': sp, 'file': e['file'], 'card_ids': e['card_ids'],
                       'lexicon_entry_ids': e['entry_ids']}
        by_term[sp.lower()] = e['file']
    manifest = {'version': 1, 'voice': VOICE, 'language': 'de-DE', 'speed': 88,
                'note': 'Audio thu san cho tu vung loi; the nguoi dung tu them dung TTS du phong trong vocab-audio.js.',
                'count': len(entries), 'entries': entries, 'byTerm': by_term}
    json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print('manifest:', len(entries), 'muc ->', os.path.join(OUT, 'manifest.json'))
    return 1 if fails else 0

if __name__ == '__main__':
    sys.exit(main())
