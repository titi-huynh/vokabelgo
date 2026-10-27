"""Codex decisions from unprompted raw outputs; uncertain words stay outside runtime."""
import copy
import hashlib
import json
from pathlib import Path
import re
import subprocess

qa=Path(__file__).resolve().parent
root=qa.parents[2]
muse=json.loads((qa/'muse-candidates.json').read_text(encoding='utf-8'))
baseline=json.loads((qa/'baseline-cues-235.json').read_text(encoding='utf-8'))
raw_files=sorted(qa.glob('independent-*.json'))
raw={f.name:json.loads(f.read_text(encoding='utf-8')) for f in raw_files}
assert all(p['completed']==p['total']==len(p['windows']) for p in raw.values())
assert all(p['asrOptions']['initial_prompt'] is None and p['asrOptions']['hotwords'] is None and p['asrOptions']['condition_on_previous_text'] is False and p['humanListened'] is False for p in raw.values())
def tokens(text):return re.findall(r'\w+',text.lower().replace('’',"'"))
def evidence(candidate,text,model,suffix=''):
    filename=f'independent-{model}{suffix}.json'
    wanted=tokens(text)
    for window in raw[filename]['windows']:
        if window['candidate']!=candidate:continue
        words=[w for segment in window['segments'] for w in segment['words']]
        expanded=[(token,i) for i,w in enumerate(words) for token in tokens(w['word'])]
        heard=[token for token,_ in expanded]
        for i in range(len(heard)-len(wanted)+1):
            if heard[i:i+len(wanted)]!=wanted:continue
            indices=list(dict.fromkeys(index for _,index in expanded[i:i+len(wanted)]))
            return {'file':f'qa/kino-alignment/frieren_missing_20261027/{filename}','candidate':candidate,
                'crop':[window['start'],window['end']],'words':[copy.deepcopy(words[index]) for index in indices]}
    raise AssertionError((candidate,text,filename,'No complete literal match'))

spec=[
 (2,'Ich werde mit dem Entschlüsseln des Buchs früher fertig werden.','Tôi sẽ hoàn tất việc giải mã cuốn sách sớm hơn.','Frieren','-context',None),
 (3,'Doch jetzt...','Nhưng bây giờ...','Frieren','','small'),
 (4,'In dem Buch stand kein Wiederbelebungs- oder Unsterblichkeitszauber.','Trong cuốn sách không có phép hồi sinh hay phép bất tử nào cả.','Frieren','-context',None),
 (4,'Ach, wirklich?','Ồ, thật vậy sao?','Heiter','',None),
 (4,'Wusstest du das?','Cậu biết chuyện đó rồi sao?','Frieren','',None),
 (4,'Die Angst vor dem Tod ist für uns unergründlich und tief.','Nỗi sợ cái chết trong chúng ta vừa sâu thẳm vừa khó thấu hiểu.','Heiter','-context',None),
 (4,'Wenn es solche Zauber gegeben hätte, hätte Ewig diese selbst angewendet.','Nếu có những phép thuật như thế, hẳn Ewig đã tự dùng chúng cho mình rồi.','Heiter','',None),
 (4,'Also wieso das alles?','Vậy thì tất cả chuyện này là vì sao?','Frieren','',None),
]
added=[]
source_file='qa/kino-alignment/season1-episode2/frieren_s01e02.json'
source=json.loads(subprocess.check_output(['git','show',baseline['baseRevision']+':'+source_file],cwd=root).decode('utf-8'))
for candidate,text,vi,speaker,medium_suffix,timing_model in spec:
    small=evidence(candidate,text,'small')
    medium=evidence(candidate,text,'medium',medium_suffix)
    timing=copy.deepcopy(small if timing_model=='small' else medium)
    start=timing['words'][0]['start'] if timing_model else min(small['words'][0]['start'],medium['words'][0]['start'])
    end=timing['words'][-1]['end'] if timing_model else max(small['words'][-1]['end'],medium['words'][-1]['end'])
    assert not any(start<c['end'] and end>c['start'] for c in baseline['captions'])
    assert sum(start>=c['start'] and end<=c['end'] for c in baseline['lesson']['chapterData']['chapters'])==1
    entry={'candidate':candidate,'start':start,'end':end,'rawStart':start,'rawEnd':end,'speaker':speaker,'text':text,'vi':vi,
        'sourceDraftIds':[c['id'] for c in source['cues'] if start<c['end'] and end>c['start']],
        'smallText':''.join(w['word'] for w in small['words']).strip(),'mediumText':''.join(w['word'] for w in medium['words']).strip(),
        'smallEvidence':small,'mediumEvidence':medium,'timingEvidence':timing,'sourceEvidence':source_file,
        'normalization':'Chỉ hoa/thường và dấu câu; không sửa từ, tên riêng hoặc ngữ pháp.',
        'note':('Mốc theo trọn word span small main cho đoạn bị ngắt lời; không cắt/nắn từ.' if timing_model else 'Mốc bao phủ trọn hai word spans được dẫn nguồn; không cắt hoặc nắn mốc để vừa cue/chương.')}
    added.append(entry)
added.sort(key=lambda c:c['start'])
for cue_id,entry in enumerate(added,1300248):entry['id']=entry['parentId']=cue_id

def part(candidate,span,classification,reason):
    windows=[{'file':f'qa/kino-alignment/frieren_missing_20261027/{filename}','labels':[w.get('label','main') for w in payload['windows'] if w['candidate']==candidate]}
        for filename,payload in raw.items() if any(w['candidate']==candidate for w in payload['windows'])]
    return {'candidate':candidate,'window':muse['candidates'][candidate-1]['window'],'museRange':span,'classification':classification,'reason':reason,'evidenceWindows':windows}
excluded=[
 part(1,[0,18.54],'opening_music_unstable_asr','Giữ ngoài thoại học theo exclusions mở đầu có sẵn. Hình mở đầu và Earshot Music 0,775 / Speech 0,061 phù hợp nhạc; small lặp câu và SWR 2020, medium sinh lời chào kết thúc. Không dùng các chuỗi ASR bất ổn này làm lời Đức. Earshot không xác nhận ngôn ngữ hoặc từng từ.'),
 part(2,[234.04,239.56],'existing_neighbors_not_duplicated','Đuôi cue 1300021 (231.88–234.56s) và đầu 1300023 (239.08–240.00s) đã có; chỉ câu ở khoảng trống được thêm với ID mới.'),
 part(3,[291.22,291.78],'existing_cue_tail','schaffen. là đuôi cue 1300034 (288.92–291.78s), không thêm trùng hoặc đổi mốc cue cũ.'),
 part(4,[496.94,497.94],'existing_next_cue_head','Sag mir. là đầu cue 1300062 (497.26–499.14s: Sag mir, wie geht es mit Fern voran?), không tách lại thành cue mới; mốc cue cũ giữ nguyên.'),
 part(5,[504.41,507.82],'existing_word_tail_and_next_cue','Magierin. thuộc đuôi câu đã có trong cue 1300064 (502.42–505.12s); crop rộng hai model nhận cả câu đó rồi Das ist gut. của cue 1300065 (506.70–508.04s). Không thêm một Magierin. trùng hoặc sửa mốc cũ dù crop cho đuôi từ lệch mốc.'),
 part(6,[516.42,517.87],'existing_cue_head','Würdest du sie… thuộc cue 1300068 (516.42–520.00s), được hai model xác nhận đủ câu trong crop rộng. Phần trước 516.42s cần duyệt riêng.'),
 part(7,[538.62,540.34],'existing_next_cue','Was hast du vor? đã có ở cue 1300074 (538.62–540.34s), không thêm trùng; câu xin rời đi trước đó giữ reviewNeeded riêng.'),
 part(8,[580.76,586.8],'existing_vocative_not_repaired','Crop rộng cả hai model nhận Frieren, du hast wirklich ein gutes Herz., chính là cue 1300082 (582.73–586.65s). Các từ Feiern?/Verirren? ở crop hẹp không được tự sửa thành một câu mới. Giữ nguyên cue cũ, không thêm bản sao tên gọi.'),
 part(9,[960.65,962.27],'existing_previous_cue','Diese Monster fressen Samen. đã có trong cue 1300161, không thêm trùng; phát ngôn sau đó vẫn cần duyệt.'),
 part(10,[1234.42,1236.57],'existing_next_cue','Das ist nur ein Zeitvertreib. đã có ở cue 1300204 (1234.42–1236.57s). Câu hỏi trước đó giữ riêng để duyệt từ và mốc, không chép lại phần trả lời.'),
 part(12,[1549.69,1560.1],'next_episode_preview','Khung scene-preview-1558.jpg ghi rõ Episode 3 / Tötungszauber, xác nhận Vorschau tập 3 sau nhạc kết. Giữ ngoài thoại học tập 2; không chuẩn hóa các chuỗi ASR không ổn định hoặc tái dùng bốn ID draft 1300244–1300247.'),
]
review_needed=[
 part(3,[293.26,294.86],'unstable_pronoun_or_omission','Sau Doch jetzt…, small ghi Irgendwann reicht er aber nicht.; medium main/context bỏ er, medium crop hẹp có er. Bản draft có mir nhưng không được tự dùng draft để sửa. Giữ cả câu để người nghe xác nhận, không chốt dạng câu bằng ngữ pháp hoặc chọn một crop thuận ý.'),
 part(6,[514.66,516.42],'no_stable_words_before_existing_cue','Small không có từ ở khe hẹp; medium khi có ngữ cảnh bỏ phần Mh, ở main chỉ có Mh trước đầu câu đã có. Chưa đủ xác nhận đây là một phát ngôn Đức riêng; giữ reviewNeeded, không suy diễn toàn vùng chỉ là tiếng hét/tiếng thở.'),
 part(7,[536,538.94],'pronoun_or_word_boundary_needs_human_adjudication','Các lượt ASR, kể cả trao đổi đầy đủ 527–545.5s, đều chép euch… von ihr wegzugehen (medium crop ngắn tách weg zu gehen). Việc phân tách von ihr / von hier và đối tượng của lời xin cần người nghe kiểm; von hier chỉ là giả thuyết ngữ cảnh của Codex, KHÔNG phải lời ASR đã xác nhận. Không tự sửa hoặc đưa cách đọc chưa chốt vào chấm chính tả; bản timing medium context còn chạm cue cũ 1300074 nên không cắt từ để ép vừa.'),
 part(9,[962.3,963.94],'models_disagree_on_subject_and_verb','Small main có Ich bringe… với xác suất Ich chỉ 0,253, nhưng các crop hẹp/rộng và crop trao đổi đầy đủ 958–967.5s cho Nicht bringen…; medium cho Ich bring(e)… ở các lượt. Chưa phân xử được đầu câu giữa hai model, không chọn nghĩa thuận ngữ cảnh hoặc chuẩn hóa Ich/Nicht, bringe/bringen. Giữ nguyên draft 1300162 ở trạng thái chưa chắc, không đưa câu vào runtime.'),
 part(10,[1230.88,1234.79],'uncertain_name_inflection_and_boundary','Small main/context ghi Freren/Friren và sag/sagt; crop chỉ tên có Frieren nhưng tiếp tục sagt, trong khi medium ghi Frieren… sag mal. Không ghép tên từ một crop với dạng động từ của crop khác để chế tạo đồng thuận. Một số word spans đến 1234.71–1234.79s còn chạm cue cũ 1300204 bắt đầu1234.42s. Giữ cả câu hỏi reviewNeeded, không sửa tên hoặc cắt từ để vừa cue cũ.'),
 part(11,[1270.7,1272.74],'persistent_model_disagreement','Small main/tight/context đều cho Da wird er mir schlecht. (một crop sinh Ha lặp), medium cho Da wird einem ja schlecht. Hai model bất đồng từ nội dung; không sửa bằng thành ngữ quen thuộc hoặc ngữ cảnh hồi tưởng. Giữ reviewNeeded, không coi toàn phân cảnh là không có lời chỉ vì exclusions cũ ghi vậy.'),
]
counts={'candidates':12,'previousCueCount':235,'newCueCount':235+len(added),'addedCues':len(added),'adjustedExistingCues':0,
    'excludedParts':len(excluded),'reviewNeededParts':len(review_needed),
    'windowsWithAddedCues':len({c['candidate'] for c in added}),'windowsWithExcludedParts':len({c['candidate'] for c in excluded}),'windowsWithReviewNeededParts':len({c['candidate'] for c in review_needed})}
review={'movieId':'frieren_s01e02','title':'Frieren S01E02','date':'2026-10-27','status':'machine_evidence_for_branch_review',
    'baseRevision':baseline['baseRevision'],'sourceVideo':'video/frieren_s01e02-web-v1.mp4','sourceVideoSha256':'36d2a73f8fd1d0bbdc42728ed2bf163281e1896cbb4f2288ef85683d60fe3280',
    'sourceNote':'Archive720p/audio gốc khớp hồ sơ media; máy không còn raw owner input.',
    'method':{'humanListened':False,'externalAudioUpload':False,'asrModels':['small','medium'],'initialPrompt':None,'hotwords':None,
        'totalRecognitionWindows':sum(len(p['windows']) for p in raw.values()),'idPolicy':'Published max1300243; source draft max1300247. New IDs start1300248, no gap reuse.',
        'normalizationPolicy':'Case and punctuation only; no name or grammar repair.'},
    'independentEvidence':[f'qa/kino-alignment/frieren_missing_20261027/{f.name}' for f in raw_files],
    'candidateSha256':hashlib.sha256((qa/'muse-candidates.json').read_bytes()).hexdigest(),
    'counts':counts,'added':added,'excluded':excluded,'reviewNeeded':review_needed,'chapterAdjustments':[],'withdrawnCueIds':[],
    'proposalDisposition':'Codex chose final cues independently from raw evidence; Anti proposal remains preliminary and is not a publication list.'}
(qa/'review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(counts,ensure_ascii=False))
