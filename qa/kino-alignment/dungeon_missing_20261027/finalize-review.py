"""Conservative final decisions; never normalize uncertain names into graded words."""
import copy
import json
from pathlib import Path
import re

qa = Path(__file__).resolve().parent
root = qa.parents[2]
proposal = json.loads((qa / 'proposed-review.json').read_text(encoding='utf-8'))
review = copy.deepcopy(proposal)
review['status'] = 'verified_for_branch_review_machine_evidence'
review['baseRevision'] = 'eed6b2dee89d7abcdcdab2285e1abfcab6ce9a79'
review['proposalDisposition'] = 'Four proposed utterances retained; three proposed canonical-name repairs withheld; independently confirmed Ja. added; former cue 1200388 withheld after Geht/Geh recheck.'
accepted = [copy.deepcopy(e) for e in proposal['added'] if e['id'] not in [1200387, 1200388, 1200391]]
accepted.append({'candidate':4,'text':'Ja.','vi':'Ừ.','speaker':'Nhóm thám hiểm','rawStart':324.09,'rawEnd':324.43,'sourceDraftIds':[]})

def tokens(text):
    return re.findall(r'\w+', text.lower().replace('’', "'"))

def find_evidence(entry, model):
    target = tokens(entry['text'])
    for suffix in ['', '-context', '-tight']:
        name = f'independent-{model}{suffix}.json'
        payload = json.loads((qa / name).read_text(encoding='utf-8'))
        matches = []
        for win in payload['windows']:
            if win['candidate'] != entry['candidate']: continue
            words = [w for s in win['segments'] for w in s['words']]
            expanded = [(t,i) for i,w in enumerate(words) for t in tokens(w['word'])]
            heard = [t for t,_ in expanded]
            for i in range(len(heard)-len(target)+1):
                if heard[i:i+len(target)] != target: continue
                indices = list(dict.fromkeys(idx for _,idx in expanded[i:i+len(target)]))
                selected = [words[idx] for idx in indices]
                distance = abs(selected[0]['start']-entry['rawStart'])
                if distance > 2: continue
                matches.append((distance, {'file':f'qa/kino-alignment/dungeon_missing_20261027/{name}','candidate':entry['candidate'],'words':selected}))
        if matches: return min(matches,key=lambda item:item[0])[1]
    raise AssertionError((entry['text'],model,'No full literal token match'))

for entry in accepted:
    for model in ['small','medium']:
        evidence = find_evidence(entry,model)
        entry[model+'Evidence'] = evidence
        entry[model+'Text'] = ''.join(w['word'] for w in evidence['words']).strip()
    entry['timingEvidence'] = copy.deepcopy(entry['mediumEvidence'])
    entry['start'] = min(entry[m+'Evidence']['words'][0]['start'] for m in ['small','medium'])
    entry['end'] = max(entry[m+'Evidence']['words'][-1]['end'] for m in ['small','medium'])
    entry['rawStart'],entry['rawEnd'] = entry['start'],entry['end']
    entry['normalization'] = 'Chỉ chuẩn hóa hoa/thường và dấu câu; không đổi từ, tên riêng hoặc ngữ pháp.'
    entry['sourceEvidence'] = 'qa/kino-alignment/muse-two-films/delicious_in_dungeon_s01e01.json'
    entry['note'] = 'Mốc bao phủ các từ của hai lượt nhận dạng được dẫn nguồn, không thêm khoảng đệm hoặc cắt từ để vừa cue/chương.'
accepted.sort(key=lambda e:e['start'])
for i,entry in enumerate(accepted,1200385): entry['id']=entry['parentId']=i
# Retain IDs already pushed at 927ac53; do not renumber later cues after withholding one.
withdrawn = next(e for e in accepted if e['id'] == 1200388)
recheck = []
for model in ['small', 'medium']:
    filename = f'independent-{model}-cue1200388-recheck.json'
    payload = json.loads((qa / filename).read_text(encoding='utf-8'))
    assert payload['humanListened'] is False and payload['completed'] == payload['total'] == 2
    for window in payload['windows']:
        segment = next(s for s in window['segments'] if tokens(s['text']) in [tokens('Geht mal zur Seite!'), tokens('Geh mal zur Seite!')])
        recheck.append({'model': model, 'file': f'qa/kino-alignment/dungeon_missing_20261027/{filename}',
            'label': window['label'], 'crop': [window['start'], window['end']], 'segment': segment})
assert {tokens(item['segment']['text'])[0] for item in recheck} == {'geh', 'geht'}
reason = ('Kiểm lại cue 1200388 sau phản biện của Muse: trên cùng crop hẹp 1154.70–1157.10s, small ghi “Geht mal zur Seite!”, medium ghi “Geh mal zur Seite!”. '
    'Crop có ngữ cảnh 1151.30–1160.10s cho “Geht” ở cả hai model. Như vậy dạng động từ đổi theo crop; ngữ cảnh nói với nhóm không chứng minh được âm /t/. '
    'Chưa có người nghe duyệt; không sửa Geht thành Geh hoặc chốt bằng đa số ASR. Rút toàn bộ cue khỏi captions/practice/picks/flashcards, giữ ID 1200388 để duyệt, không tái sử dụng hoặc đổi ID 1200389/1200390.')
review['reviewNeeded'].append({'candidate': 7, 'window': json.loads((qa / 'muse-candidates.json').read_text(encoding='utf-8'))['candidates'][6]['window'], 'museRange': [withdrawn['start'],withdrawn['end']],
    'reservedCueId': 1200388, 'suggestedAlternatives': ['Geht mal zur Seite!', 'Geh mal zur Seite!'],
    'classification': 'review_needed_verb_inflection_disagrees_on_isolated_crop', 'reason': reason,
    'previousBranchCue': copy.deepcopy(withdrawn), 'recheckEvidence': recheck})
accepted = [e for e in accepted if e['id'] != 1200388]
review['withdrawnCueIds'] = [1200388]
review['recheck'] = {'date': '2026-10-27', 'previousRevision': '927ac53f740fff83501cffc8d1e0105e38668db6',
    'cueId': 1200388, 'decision': 'reviewNeeded', 'reason': reason, 'humanListened': False,
    'museFinding': {'source': 'https://muse.ai/thread/8c2d286e-9472-4a7f-8d8f-1f32fa68b43e',
        'reportedAtLocal': '2026-10-27 17:21', 'asReported': 'Muse reported Geh in its new ASR, versus Geht in its prior scan and Codex evidence; no human adjudication.'},
    'earshotClassificationOnly': {'crop': [1154.7,1157.1], 'speechProbability': 0.556,
        'limitation': 'Local describe classifies audio; it cannot transcribe German or adjudicate Geh versus Geht.'},
    'recognitionWindows': recheck}
for name in ['independent-small-cue1200388-recheck.json','independent-medium-cue1200388-recheck.json','extra_cue1200388_spec.json']:
    review['independentEvidence'].append(f'qa/kino-alignment/dungeon_missing_20261027/{name}')
review['added'] = accepted

# Keep all uncertain name-bearing utterances outside runtime rather than reconstructing their names.
for entry in proposal['added']:
    if entry['id'] not in [1200387,1200388,1200391]: continue
    review['reviewNeeded'].append({'candidate':entry['candidate'],'window':next(c['window'] for i,c in enumerate(json.loads((qa/'muse-candidates.json').read_text(encoding='utf-8'))['candidates'],1) if i==entry['candidate']),
        'museRange':[entry['rawStart'],entry['rawEnd']],'suggestedText':entry['text'],'smallText':entry['smallText'],'mediumText':entry['mediumText'],
        'classification':'review_needed_uncertain_name_not_repaired',
        'reason':f'Các lượt độc lập chỉ cho biến thể tên trong “{entry["smallText"]}” / “{entry["mediumText"]}”. Biết tên nhân vật trong cue cũ chưa đủ chứng minh âm cuối ở phát ngôn này. Không tự đổi thành Falin/Marcille để chấm chính tả; giữ toàn bộ câu này chờ người nghe duyệt.'})
for entry in review['reviewNeeded']:
    if entry['candidate']==4:
        entry['museRange']=[322.12,323.94]
        entry['reason']='Giữ riêng các tiếng ngập ngừng 322.12–323.94s: small chép Äh/Äh, medium chép Uhh/Uh hoặc Ah, độ tin cậy thấp. Từ Ja. ở 324.09–324.43s đã khớp literal small và medium, được tách thành cue mới nằm trọn sau ranh giới chương 324.0s; không cắt bất kỳ từ nào.'
    if entry['candidate']==6:
        entry['reason']='Phản ứng giật mình 983.70–985.02s không ra chữ ở các lượt chính; khi cắt hẹp small cho Nein!, medium cho Ah!/Hm? với độ tin cậy thấp. Giữ reviewNeeded; cả câu hỏi có tên nhân vật sau đó cũng được giữ riêng để duyệt.'

review['excluded'] = [e for e in review['excluded'] if e['candidate']!=2]
review['reviewNeeded'].append({'candidate':2,'window':[79.09,83.91],'museRange':[80.29,82.71],
    'classification':'review_needed_no_stable_lexical_recognition',
    'reason':'Đã kiểm cả cửa sổ chính, bốn cửa sổ hẹp và hai cửa sổ rộng. Small không xác nhận được lời Đức ở khe; medium sinh câu kết video không phù hợp hoặc Ah/Hää kéo dài, hay không có segment. Earshot Music 0,48 / Speech 0,33 chỉ là phân loại âm thanh, chưa đủ kết luận đây hoàn toàn là tiếng hét phi từ vựng. Giữ reviewNeeded, không thêm cue.'})
duplicate_reasons={3:'Không thêm trùng đầu cue 1200016 (114.00–115.78s). Câu hỏi có tên Falin phía trước vẫn cần duyệt.',4:'Không thêm trùng đuôi cue 1200078 (316.66–322.08s). Tiếng ngập ngừng và Ja. được xét riêng.',5:'Không thêm trùng cue 1200097 (395.98–396.86s) và đầu cue 1200098 (398.32–400.80s). Tiếng hô ở khe còn reviewNeeded.',6:'Không thêm trùng đuôi cue 1200252 (981.40–983.66s) và đầu cue 1200254 (987.64–989.98s). Phản ứng và câu hỏi có tên ở giữa vẫn cần duyệt.',7:'Không thêm trùng đuôi cue 1200307 (1151.56–1154.24s) và đầu cue 1200309 (1157.66–1159.88s). Geht mal zur Seite! được thêm riêng theo từ nhận dạng.',9:'Không thêm trùng đầu cue 1200357 (1342.38–1345.74s). Hai câu được khôi phục trong khoảng trống phía trước nằm ngoài cue này.'}
for entry in review['excluded']:
    if entry['candidate'] in duplicate_reasons: entry['reason']=duplicate_reasons[entry['candidate']]
    if entry['candidate']==7: entry['reason']='Không thêm trùng đuôi cue 1200307 (1151.56–1154.24s) và đầu cue 1200309 (1157.66–1159.88s). Phát ngôn ở giữa được giữ reviewNeeded vì Geht/Geh bất đồng khi đổi crop.'
    if entry['candidate']==8:
        entry['reason'] = ('Giữ ngoài phụ đề học phần niệm chú 1159.88–1168.60s theo quy ước sẵn có của tập. Hai model cho các chuỗi âm khác nhau, không có lời Đức đáng tin cậy; không sửa thần chú thành tiếng Đức chuẩn. Câu quát sau đó xét reviewNeeded riêng.' if 'incantation' in entry['classification'] else 'Không thêm trùng đầu cue 1200311 (1170.98–1171.88s); câu quát phía trước chưa chốt được từ cuối.')
    if entry['candidate']==10: entry['reason']='Nhạc kết/credit: earshot-ending.json cho Music 0,73; medium không có segment, small sinh chuỗi lời không ổn định. Giữ ngoài phụ đề theo quy ước không thêm lời bài hát; không coi chuỗi ASR vô nghĩa là thoại Đức.'

review['reviewNeeded'].sort(key=lambda e:(e['candidate'],e['museRange'][0]))
review['counts']={'candidates':10,'previousCueCount':367,'newCueCount':367+len(accepted),'addedCues':len(accepted),'adjustedExistingCues':0,
    'excludedParts':len(review['excluded']),'reviewNeededParts':len(review['reviewNeeded']),
    'windowsWithAddedCues':len({e['candidate'] for e in accepted}),'windowsWithExcludedParts':len({e['candidate'] for e in review['excluded']}),
    'windowsWithReviewNeededParts':len({e['candidate'] for e in review['reviewNeeded']})}
review['method']['idPolicy']='Giữ nguyên 367 cue cũ và các ID dự thảo <=1200384. Giữ ID mới 1200385–1200387, 1200389–1200390; ID 1200388 dành riêng cho reviewNeeded, không tái sử dụng hay đánh lại ID các câu đã push.'
review['method']['normalizationPolicy']='Chỉ chuẩn hóa dấu câu và hoa/thường cho cue thêm. Không dùng tên chuẩn để sửa các âm tên riêng chưa chốt; ba đề xuất như vậy được chuyển sang reviewNeeded.'
review['method']['totalRecognitionWindows']=sum(len(json.loads(f.read_text(encoding='utf-8'))['windows']) for f in qa.glob('independent-*.json'))
review['chapterAdjustments']=[]
(qa/'review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(review['counts'],ensure_ascii=False))
