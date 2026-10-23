"""Build local Sakura lesson from the owner's paired SRT files and local audio checks.

The 20-second trim is independently checked across the recording. No third-party
transcript is fetched. Keep the raw SRTs, captions and practice grouping auditable.
"""
import json
import re
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / 'qa/kino-alignment/sakura_s01e01'
FULL_SOURCE_OFFSET = 139.12  # Seven independent 10 ms audio-envelope anchors: 139.11–139.12 s.
FULL_DURATION = 1500.456875
source = json.loads((QA / 'source-subtitles.json').read_text(encoding='utf-8'))

def clean(text):
    return re.sub(r'\s+', ' ', re.sub(r'(?m)^-\s*', '', text)).strip()

# Ranges are scene/voice annotations, not inferred from an ASR diarization model.
roles = [
    (1,1,'Sakura'),(2,2,'Toya'),(3,3,'Toya / Sakura'),(4,10,'Sakura'),
    (11,11,'Toya'),(12,12,'Sakura'),(13,14,'Toya'),(15,15,'Sakura'),
    (16,18,'Toya'),(19,29,'Sakura'),(30,30,'Fujitaka'),(31,33,'Sakura'),
    (34,34,'Sakura / Fujitaka'),(35,44,'Sakura'),(45,45,'Fujitaka / Sakura'),
    (46,46,'Toya'),(47,47,'Fujitaka'),(48,49,'Toya / Sakura'),(50,50,'Sakura'),
    (51,52,'Fujitaka'),(53,55,'Sakura / Fujitaka'),(56,56,'Fujitaka'),(57,59,'Sakura'),
    (60,61,'Toya'),(62,65,'Sakura'),(66,66,'Yukito'),(67,67,'Yukito / Toya'),
    (68,69,'Yukito / Sakura'),(70,72,'Toya'),(73,73,'Yukito'),(74,80,'Sakura'),
    (81,81,'Yukito'),(82,82,'Sakura'),(83,83,'Yukito'),(84,84,'Sakura'),
    (85,85,'Tomoyo'),(86,86,'Sakura'),(87,88,'Tomoyo'),(89,89,'Sakura'),
    (90,90,'Tomoyo / Sakura'),(91,96,'Sakura'),(97,97,'Tomoyo'),
    (98,99,'Sakura / Tomoyo'),(100,100,'Sakura'),(101,102,'Tomoyo'),(103,107,'Sakura'),
    (108,110,'Tomoyo'),(111,113,'Sakura'),(114,118,'Tomoyo'),(119,120,'Sakura'),
    (121,124,'Lehrerin'),(125,125,'Sakura'),(126,127,'Lehrerin'),
    (128,130,'Sakura / Lehrerin / Mitschülerin'),(131,133,'Sakura'),
    (134,134,'Mitschülerin'),(135,138,'Sportlehrerin'),(139,140,'Sakura'),
    (141,143,'Mitschülerin'),(144,163,'Sakura'),(164,165,'Kero'),(166,166,'Sakura'),
    (167,171,'Kero'),(172,172,'Sakura'),(173,175,'Kero'),(176,176,'Sakura'),
    (177,182,'Kero'),(183,183,'Sakura'),(184,185,'Kero'),(186,189,'Sakura / Kero'),
    (190,190,'Sakura'),(191,191,'Người nhà'),(192,193,'Sakura'),(194,195,'Kero'),
    (196,196,'Sakura / Kero'),(197,198,'Kero / Sakura'),(199,211,'Kero'),
    (212,212,'Sakura'),(213,214,'Kero'),(215,219,'Kero / Sakura'),
    (220,220,'Sakura / Kero'),(221,221,'Sakura'),(222,223,'Kero'),(224,224,'Sakura'),
    (225,229,'Kero'),(230,231,'Sakura / Kero'),(232,238,'Kero'),(239,240,'Sakura'),
    (241,241,'Sakura / Kero'),(242,243,'Sakura'),(244,247,'Kero'),
    (248,249,'Sakura'),(250,251,'Kero'),(252,254,'Sakura'),(255,255,'Kero'),
    (256,256,'Sakura / Kero'),(257,257,'Kero'),(258,258,'Kero / Sakura'),
    (259,259,'Sakura'),(260,260,'Kero / Sakura'),(261,262,'Sakura / Kero'),
    (263,263,'Kero'),(264,264,'Sakura'),(265,266,'Kero'),(267,268,'Sakura / Kero'),
    (269,272,'Sakura'),(273,273,'Sakura / Kero'),(274,276,'Kero'),
    (277,278,'Sakura / Kero'),(279,279,'Sakura'),(280,280,'Kero'),
    (281,281,'Sakura'),(282,282,'Kero'),(283,284,'Sakura / Kero'),(285,285,'Kero'),
    (286,286,'Sakura'),(287,287,'Sakura / Kero'),(288,288,'Kero'),
    (289,294,'Sakura'),(295,295,'Kero'),(296,297,'Sakura'),(298,299,'Kero / Sakura'),
    (300,300,'Sakura'),(301,302,'Kero / Sakura'),(303,305,'Kero'),
    (306,306,'Sakura'),(307,307,'Kero'),(308,308,'Kero / Sakura'),
    (309,309,'Kero'),(310,315,'Sakura')
]
vi_fixes = {
    22:'Có lẽ là vì anh ấy lớn tuổi hơn mình.',
    54:'Bố cũng vậy ạ. Con thực sự định đuổi kịp Toya',
    55:'sao? Con làm được mà.',
    85:'Ước gì chuyện đó cũng xảy ra với tớ.',
    114:'Tớ có mà ngốc nếu quay một ai khác',
    118:'Tớ sẽ làm một video thật đỉnh!',
    120:'Cô bạn này cần được giúp đỡ rồi.',
    190:'Để tôi dọn cho.',
    191:'Con định mang cái đó đi đâu vậy?',
    192:'Bánh pudding thì tôi sẽ ăn trong phòng mình.',
    196:'Đây, mời ngươi. Cảm ơn, ta thích pudding.',
    241:'Không! Ta thích chiếc giường này, nó nhún êm thật.',
    258:'Đừng phí thời gian nữa! Làm gì đó đi!',
    284:'Thẻ bài không giúp được! Nhóc là Thủ lĩnh Thẻ bài mà!',
    285:'Nhóc mà không nghĩ ra cách thì cả hai tiêu mất.',
    287:'Được rồi, tôi có một ý tưởng. Cũng đến lúc rồi đấy.',
    303:'Nhân tiện, nhóc vẫn phải chạm vào Fly',
    304:'bằng chiếc chìa khóa',
    305:'để lấy đi sức mạnh của nó.'
}
captions = []
for de, vi in zip(source['de'],source['vi'],strict=True):
    assert de['number'] == vi['number'] and de['start'] == vi['start'] and de['end'] == vi['end']
    n=de['number']
    text=clean(de['text'])
    # Render the spoken ordinals as words, retaining the German dub's age of 12.
    text=text.replace('4. Klasse','vierte Klasse').replace('3. Klasse','dritten Klasse').replace('3. Absatz','dritter Absatz')
    speaker=next(role for a,b,role in roles if a<=n<=b)
    c=dict(id=800000+n*10,parentId=800000+n*10,start=round(de['start'],3),end=round(de['end'],3),
           speaker=speaker,text=text,vi=vi_fixes.get(n,clean(vi['text'])),sourceSrtNumber=n)
    if n==55:
        c['text']=c['text'].replace('Das schaff ich schon.','Klar, das schaff ich schon.')
    if n==258:
        c['text']='Verlier keine Zeit und unternimm was!'
        c['speaker']='Kero'
        c['acceptedTexts']=['Verlier keine Zeit! Unternimm was!']
        c['sourceReview']='SRT cũ tách sai unternimm thành dann nimm. Đối chiếu các cửa sổ medium 944–953 và 945–951: Unternimm was. Chấp nhận cả cách viết không nối bằng und.'
    captions.append(c)

# The source SRT omitted the greeting after Kero awakens. Two independent models
# agree about the greeting; its romanization is explicitly marked for review.
captions.append(dict(id=803161,parentId=803161,start=652.92,end=657.46,speaker='Kero',
    text='Hi! Di-hau! Di-hau!',vi='Chào! Di-hau! Di-hau! [Kero chào vui nhộn]',
    sourceReview='Sửa Nihao: medium trên bản đầy đủ 791–798 nghe Hi, di hao, di hao; đây là phiên âm lời chào cách điệu, không phải từ tiếng Đức có chính tả chuẩn.',
    practiceExcluded='Lời chào cách điệu: giữ âm thanh và phụ đề khi xem, không chấm chính tả Đức.'))

# German speech following the Japanese ED. Source recording cuts off the final
# clause; keep that caption for watching but do not make an incomplete dictation.
bonus = [
 (1290.98,1292.34,'Konyanyachiwa!','Xin chào mọi người!'),
 (1293.12,1296.90,'Hier ist euer Kero mit dem allerneuesten Klatsch und Tratsch.','Kero đây, mang đến cho các bạn những chuyện mới nhất!'),
 (1297.06,1297.86,'Schön, dass ihr da seid.','Rất vui vì các bạn đã đến.'),
 (1298.08,1301.58,'Bei mir könnt ihr Dinge erfahren, die ihr von Sakura wahrscheinlich nicht erfahren werdet.','Ở đây các bạn sẽ biết những điều có lẽ Sakura sẽ không kể.'),
 (1301.82,1303.76,'Interessante Dinge, also passt auf!','Toàn chuyện thú vị đấy, chú ý nhé!'),
 (1304.32,1309.72,'Heute sehen wir uns mal, tada, die Schuluniform der Tomoeda-Grundschule näher an.','Hôm nay, ta-da, chúng ta sẽ xem kỹ đồng phục trường tiểu học Tomoeda.'),
 (1311.48,1314.44,'Diese Uniform gibt es langärmlig und kurzärmlig.','Đồng phục này có loại tay dài và tay ngắn.'),
 (1314.56,1316.92,'Wie ihr seht, trägt Sakura hier die langärmlige Variante.','Như các bạn thấy, Sakura đang mặc loại tay dài.'),
 (1317.06,1319.00,'Die Hauptfarben sind Marineblau und Weiß.','Hai màu chủ đạo là xanh hải quân và trắng.'),
 (1319.24,1321.20,'Und mit den roten Streifen sieht sie echt cool aus.','Thêm các sọc đỏ nữa, trông thật đẹp phải không.'),
 (1321.58,1326.94,'Aber gerade die Details wie das Schulabzeichen auf dem linken Ärmel und die Mütze mit den Bändern kommen super.','Đặc biệt những chi tiết như phù hiệu ở tay áo trái và chiếc mũ có dải ruy băng trông rất đẹp.'),
 (1327.34,1330.24,'Und hier haben wir jetzt Keros Schnappschuss!','Và đây là ảnh chụp nhanh của Kero!'),
 (1330.56,1331.68,'Der ist gelungen, nicht?','Ảnh đẹp đấy chứ?'),
 (1332.14,1333.60,'Das ist Sakuras Rock.','Đây là váy của Sakura.'),
 (1333.60,1336.52,'Ein weißer Faltenrock, der ihr wahnsinnig gut steht, oder?','Một chiếc váy xếp ly trắng rất hợp với cô bé, phải không?'),
 (1336.96,1338.92,'Und hier übrigens die Uniform der Jungs.','Nhân tiện, đây là đồng phục của các bạn nam.'),
 (1339.38,1340.66,"Na gut, das war’s für heute.",'Được rồi, hôm nay đến đây thôi.'),
 (1340.82,1342.76,'Ihr habt eine Menge gelernt und wenn es euch interessiert…','Các bạn đã học được nhiều điều, và nếu các bạn thấy hứng thú… [bản ghi dừng tại đây]')
]
for i,(a,b,de,vi) in enumerate(bonus):
    if i==17:continue  # Superseded by the complete closing speech below.
    c=dict(id=804000+i,parentId=804000+i,start=round(a-20,3),end=round(b-20,3),speaker='Kero',text=de,vi=vi)
    if i==0:
        c['sourceReview']='Chuẩn hóa lời chào riêng của Kero thành Konyanyachiwa; cách ghi cũng xuất hiện trong sự kiện Cardcaptor Sakura chính thức của Nexon. Không phải câu từ vựng Đức.'
        c['practiceExcluded']='Lời chào Nhật cách điệu: giữ khi xem, không chấm chính tả Đức.'
    if i in [6,7]:c['sourceReview']='Âm cuối -ig bị nhận dạng thành -ich; viết langärmlig / kurzärmlig theo Duden. Cũng chấp nhận langärmelig / kurzärmelig.'
    if i==10:c['sourceReview']='Bản nguồn đầy đủ, medium 1400–1500 xác nhận Bändern; khớp dải ruy băng trên mũ trong hình.'
    if i==14:c['sourceReview']='Cửa sổ medium riêng 1451–1458 xác nhận gut steht; dùng đại từ Dativ ihr. Bản nhận dạng dài bị nhầm thành schlägt.'
    captions.append(c)
captions.sort(key=lambda c:c['start'])

# Preserve each caption exactly once. Merge SRT fragments into complete sentences.
# Speaker changes inside a complete exchange remain visible in the speaker label.
units=[]
pending=[]
def flush():
    if not pending:return
    first,last=pending[0],pending[-1]
    speakers=[]
    for c in pending:
        for s in c['speaker'].split(' / '):
            if s not in speakers:speakers.append(s)
    u=dict(id=first['id'],parentId=first['id'],start=first['start'],end=last['end'],
        speaker=' / '.join(speakers),text=' '.join(c['text'] for c in pending),
        vi=' '.join(c['vi'] for c in pending),legacyIds=[c['id'] for c in pending])
    reviews=[c['reviewNeeded'] for c in pending if c.get('reviewNeeded')]
    if reviews:u['reviewNeeded']=' '.join(dict.fromkeys(reviews))
    if len(pending)==1 and pending[0].get('acceptedTexts'):u['acceptedTexts']=pending[0]['acceptedTexts']
    units.append(u)
    pending.clear()
for c in captions:
    if c.get('practiceExcluded'):
        flush();continue
    pending.append(c)
    # All authentic interrupted turns also terminate on ellipsis.
    if re.search(r'[.!?…]$',c['text']) and not re.search(r'\d\.$',c['text']):flush()
flush()

# Protect the first/last spoken words when a source SRT cue is slightly late.
# Only extend the outside of a complete practice unit, on matching ASR anchors;
# do not replace the owner's transcript with model output or move cuts inward.
recognized=json.loads((ROOT/'qa/kino-alignment/sakura_s01e01_recording/recognized-words.json').read_text(encoding='utf-8'))
def tokens(s):
    table={'zwölf':'12','vierte':'4','drei':'3','dritten':'3','dritter':'3','neun':'9','vierzehn':'14','sechzehn':'16','dreissig':'30'}
    return [table.get(x,x) for x in re.findall(r'\w+',s.lower().replace('ß','ss'))]
words=[]
for segment in recognized:
    for word in segment.get('words',[]):
        for token in tokens(word['word']):
            words.append(dict(token=token,start=round(word['start']-20,3),end=round(word['end']-20,3)))
by_id={c['id']:c for c in captions}
timing_changes=[]
for u in units:
    first,last=by_id[u['legacyIds'][0]],by_id[u['legacyIds'][-1]]
    if not first.get('sourceSrtNumber'):continue
    expected=tokens(u['text'])
    local=[w for w in words if u['start']-1<=w['start'] and w['end']<=u['end']+1]
    matcher=SequenceMatcher(None,expected,[w['token'] for w in local],autojunk=False)
    mapping={a+i:b+i for a,b,size in matcher.get_matching_blocks() for i in range(size)}
    old=(u['start'],u['end'])
    if len(expected)>=2 and 0 in mapping and 1 in mapping and mapping[1]==mapping[0]+1:
        candidate=local[mapping[0]]['start']-.10
        if u['start']-.9<=candidate<u['start']:first['start']=round(max(0,candidate),3)
    elif len(expected)==1 and 0 in mapping:
        candidate=local[mapping[0]]['start']-.10
        if u['start']-.4<=candidate<u['start']:first['start']=round(max(0,candidate),3)
    n=len(expected)
    if n>=2 and n-1 in mapping and n-2 in mapping and mapping[n-1]==mapping[n-2]+1:
        candidate=local[mapping[n-1]]['end']+.10
        if u['end']<candidate<=u['end']+.6:last['end']=round(candidate,3)
    u['start'],u['end']=first['start'],last['end']
    if old!=(u['start'],u['end']):timing_changes.append(dict(id=u['id'],before=old,after=[u['start'],u['end']]))
# Adjacent captions may share a quiet boundary; keep them in chronological order.
for a,b in zip(captions,captions[1:]):
    if a['end']>b['start']:
        boundary=round((a['end']+b['start'])/2,3)
        a['end']=b['start']=boundary
for u in units:
    u['start']=by_id[u['legacyIds'][0]]['start']
    u['end']=by_id[u['legacyIds'][-1]]['end']
write_timing_path=QA/'practice-boundary-alignment.json'
write_timing_path.write_text(json.dumps(dict(method='Matching local ASR word anchors; extend only, 100 ms padding; cap start correction 900 ms, end 600 ms.',changes=timing_changes),ensure_ascii=False,indent=2),encoding='utf-8')

# Use the full downloaded source, keeping its OP, dream, complete Kero ending,
# preview and final slate. Source audio matches the old recording (r >= .974 at
# all seven anchors); no speed adjustment is needed.
for c in captions:
    c['start']=round(c['start']+FULL_SOURCE_OFFSET,3)
    c['end']=round(c['end']+FULL_SOURCE_OFFSET,3)
for u in units:
    u['start']=round(u['start']+FULL_SOURCE_OFFSET,3)
    u['end']=round(u['end']+FULL_SOURCE_OFFSET,3)
extras=[
 (805000,96.42,98.54,'Sakura','Wer ist da?','Ai ở đó vậy?'),
 (805001,98.66,100.08,'Sakura','Wer ruft mich?','Ai đang gọi mình vậy?'),
 (805002,117.28,119.30,'Stimme im Traum','Cardcaptor!','Thủ lĩnh Thẻ bài!'),
 (804017,1459.84,1461.04,'Kero','Ihr habt eine Menge gelernt.','Các bạn đã học được nhiều điều.'),
 (804018,1461.06,1465.10,'Kero','Und wenn es euch interessiert, könnt ihr ja auch beim nächsten Mal bei Keros Klatsch und Tratsch dabei sein.','Nếu thấy hứng thú, lần sau các bạn lại đến với mục Chuyện trò cùng Kero nhé.'),
 (804019,1465.10,1467.86,'Kero','Dann werde ich euch wieder eine Menge Zusatzinformationen geben.','Khi đó ta sẽ lại kể cho các bạn nhiều thông tin bổ sung.'),
 (804020,1468.04,1469.34,'Kero','Tschüss, bis dann!','Tạm biệt, hẹn gặp lại nhé!'),
 (806000,1471.26,1474.04,'Giới thiệu tập sau','Welche Abenteuer erwarten euch bei Cardcaptor Sakura?','Những cuộc phiêu lưu nào đang chờ các bạn trong Cardcaptor Sakura?'),
 (806001,1474.36,1476.86,'Sakura','Ich habe Fly, die erste Clow Card, gefangen.','Mình đã bắt được Fly, thẻ bài Clow đầu tiên.'),
 (806002,1476.98,1478.56,'Sakura','Aber wie kann ich Cardcaptor sein?','Nhưng làm sao mình có thể làm Thủ lĩnh Thẻ bài đây?'),
 (806003,1478.62,1480.08,'Sakura','Immerhin gehe ich noch zur Schule.','Dù sao mình vẫn còn đi học mà.'),
 (806004,1480.26,1482.42,'Sakura','Stellt euch vor, meine Freunde würden davon erfahren.','Thử tưởng tượng các bạn của mình biết được chuyện này xem.'),
 (806005,1482.64,1487.40,'Sakura','Sie verlieren ihre Schatten und ohne Keros Hilfe wüsste ich nicht, was ich gegen so eine Gefahr machen kann.','Họ bị mất bóng, và nếu không có Kero giúp đỡ thì mình chẳng biết phải làm gì trước mối nguy như thế.'),
 (806006,1487.60,1492.74,'Sakura','Aber am meisten gespannt bin ich auf Tomoyos Videokamera, mit der sie etwas ganz Besonderes aufgenommen hat.','Nhưng điều mình tò mò nhất là máy quay của Tomoyo: cậu ấy đã quay được một thứ rất đặc biệt.'),
 (806007,1493.20,1496.12,'Giới thiệu tập sau','Cardcaptor Sakura. Sakura und Tomoyo.','Cardcaptor Sakura. Sakura và Tomoyo.')
]
for id,a,b,speaker,de,vi in extras:
    c=dict(id=id,parentId=id,start=a,end=b,speaker=speaker,text=de,vi=vi,sourceEvidence='full-source-medium-review.json; full-source-final-review.json; full-source-small-review.json')
    captions.append(c)
    units.append(dict(**c,legacyIds=[id]))
captions.sort(key=lambda c:c['start'])
units.sort(key=lambda u:u['start'])

# Place scene boundaries in the gaps between complete practice units.
proposed=[0]+[round(t+FULL_SOURCE_OFFSET,3) for t in [153,256.5,413,658,834,960,1193]]+[FULL_DURATION]
bounds=[0]
for b in proposed[1:-1]:
    cross=next((u for u in units if u['start']<b<u['end']),None)
    bounds.append(round(cross['end']+.01,3) if cross else b)
bounds.append(proposed[-1])
titles=['Giấc mơ và buổi sáng của Sakura','Đường đến trường và anh Yukito','Tomoyo, lớp học và giờ thể dục','Cuốn sách bí ẩn trong thư viện','Kero và bí mật những thẻ bài Clow','Giao ước và Thủ lĩnh Thẻ bài đầu tiên','Thu phục Fly – thẻ bài Bay','Nhạc kết, Góc Kero và giới thiệu tập sau']
goals=['Giới thiệu bản thân và gia đình, chào buổi sáng và nói về bữa ăn.',
 'Trò chuyện trên đường đến trường, nói về tình bạn và người mình thích.',
 'Hỏi thăm bạn bè, nói về sở thích quay phim và làm theo hướng dẫn trong lớp.',
 'Mô tả điều kỳ lạ, bày tỏ lo lắng và quyết định đi kiểm tra.',
 'Hỏi danh tính, giải thích nguyên nhân và kể về sức mạnh của thẻ bài.',
 'Nghe lời giao ước, từ chối nhiệm vụ và phản ứng khi gặp nguy hiểm.',
 'Nhờ hướng dẫn, ra quyết định, dùng thần chú và kể lại việc vừa làm được.',
 'Mô tả đồng phục, chào tạm biệt và nghe giới thiệu cuộc phiêu lưu tiếp theo.']
icons=['🏠','🌸','🎥','📖','🦁','🗝️','🪽','👕']
preferred=[[1,4,12,19,30,36,52],[58,60,73,75,78,81,84],[92,93,103,111,117,125,135],
 [144,147,149,151,153,157,158],[166,173,176,180,191,203,221],
 [237,238,240,244,247,254,265],[266,272,279,281,286,297,309],[]]
chapters=[]
for i in range(8):
    own=[u for u in units if u['start']>=bounds[i] and u['end']<=bounds[i+1]]
    picks=[]
    for n in preferred[i]:
        u=next((u for u in own if 800000+n*10 in u['legacyIds']),None)
        if u and u['id'] not in picks and not u.get('reviewNeeded'):picks.append(u['id'])
    for u in own:
        if len(picks)>=7:break
        if u['id'] not in picks and not u.get('reviewNeeded'):picks.append(u['id'])
    chapters.append(dict(title=titles[i],icon=icons[i],start=bounds[i],end=bounds[i+1],picks=picks[:7],goal=goals[i]))

vocab=[
 ('traum','der Traum','giấc mơ','der Traum, die Träume (m.).',1,['einen komischen Traum haben','von etwas träumen']),
 ('fruehstueck','das Frühstück','bữa sáng','das Frühstück (n.); frühstücken: ăn sáng.',3,['Frühstück machen','zum Frühstück']),
 ('familie','die Familie','gia đình','die Familie, die Familien (f.).',10,['meine Familie','eine Familie kennenlernen']),
 ('gemein','gemein','xấu tính; đáng ghét','Tính từ: gemein – gemeiner – am gemeinsten.',20,['gemein zu jemandem sein','ein gemeiner Bruder']),
 ('lieb','lieb','hiền; đáng yêu; thân thương','Tính từ; jemanden lieb haben: yêu thương ai.',33,['sehr lieb sein','jemanden lieb haben']),
 ('hunger','Hunger haben','đói bụng','der Hunger (m.); không dùng mạo từ trong Hunger haben.',36,['großen Hunger haben','keinen Hunger haben']),
 ('kirschbaum','der Kirschbaum','cây anh đào','der Kirschbaum, die Kirschbäume (m.).',58,['Die Kirschbäume blühen.','ein blühender Kirschbaum']),
 ('verlieben','sich verlieben','phải lòng; yêu ai','Phản thân; sich in jemanden (Akk.) verlieben.',79,['sich in jemanden verlieben','verliebt sein']),
 ('bonbon','das Bonbon','kẹo viên','das Bonbon, die Bonbons (n.).',84,['ein Bonbon schenken','ein Bonbon fangen']),
 ('freundin','die Freundin','bạn nữ; bạn gái','die Freundin, die Freundinnen (f.).',92,['meine beste Freundin','eine gute Freundin']),
 ('kennen','sich kennen','quen biết nhau','kennen – kannte – hat gekannt.',93,['sich seit der Schule kennen','jemanden gut kennen']),
 ('videokamera','die Videokamera','máy quay video','die Videokamera, die Videokameras (f.).',104,['mit der Videokamera filmen','eine neue Videokamera']),
 ('aufladen','aufladen','sạc; nạp điện','Động từ tách: lädt auf; hat aufgeladen.',117,['die Akkus aufladen','das Handy aufladen']),
 ('heft','das Heft','quyển vở','das Heft, die Hefte (n.).',126,['in ein Heft schreiben','die Zeichnung auf dem Heft']),
 ('ueben','üben','luyện tập','üben – übte – hat geübt.',136,['mit den Stäben üben','jeden Tag üben']),
 ('zu-hause','zu Hause','ở nhà','Cụm chỉ nơi chốn; nach Hause: về nhà.',150,['zu Hause sein','zu Hause bleiben']),
 ('bibliothek','die Bibliothek','thư viện','die Bibliothek, die Bibliotheken (f.).',151,['aus der Bibliothek','in die Bibliothek gehen']),
 ('nachsehen','nachsehen','xem thử; kiểm tra','Động từ tách: sieht nach; hat nachgesehen.',153,['Ich muss nachsehen.','im Zimmer nachsehen']),
 ('polizei','die Polizei','cảnh sát','die Polizei (f.); gọi cảnh sát: die Polizei rufen.',154,['die Polizei rufen','zur Polizei gehen']),
 ('wind','der Wind','gió','der Wind, die Winde (m.).',162,['die Karte des Windes','ein starker Wind']),
 ('respekt','der Respekt','sự tôn trọng','der Respekt (m.); Respekt vor jemandem (Dat.).',173,['mehr Respekt','Respekt haben']),
 ('langschlaefer','der Langschläfer','người ngủ nướng','der Langschläfer, die Langschläfer (m.).',221,['ein Langschläfer sein','lange schlafen']),
 ('schaffen','schaffen','làm được; thành công','schaffen – schaffte – hat geschafft (với nghĩa làm được).',295,['Du hast es geschafft!','Das schaffe ich schon.']),
 ('glauben','glauben','tin; cho rằng','jemandem (Dat.) glauben; glauben, dass …',297,['Ich hätte nie geglaubt, dass …','Das kannst du mir glauben.'])
]
cards=[]
for slug,term,meaning,grammar,n,collocations in vocab:
    c=next(c for c in captions if c.get('sourceSrtNumber')==n)
    # Use the whole practice sentence as an example rather than a cut SRT fragment.
    u=next(u for u in units if c['id'] in u['legacyIds'])
    part=next(i for i,p in enumerate(chapters) if p['start']<=u['start'] and u['end']<=p['end'])
    cards.append(dict(id='vk_sakura_s01e01_'+slug,term=term,meaning=meaning,grammar=grammar,
       example=u['text'],collocations=collocations,note='Ví dụ lấy từ lời thoại tập 1, bản lồng tiếng Đức.',
       deck='🎬 Video: Sakura – Das geheimnisvolle Buch',tags=['Video','Sakura','Fantasy'],
       videoKey='sakura_s01e01',cueId=u['id'],sourceUrl=f'?kino=sakura&part={part+1}'))

video=dict(key='sakura_s01e01',series='Cardcaptor Sakura',seriesIcon='🌸',episodeTitle='Das geheimnisvolle Buch',
    icon='🌸',title='🌸 Sakura – Das geheimnisvolle Buch',src='video/sakura_s01e01.mp4?v=2',
    storageKey='kino_calibrated_sakura_s01e01_v1',syncKey='vokabelgo_kino_perfected_sakura_s01e01',
    progressKey='vokabelgo_kino_progress_sakura_s01e01',fullDurationStr='25:00',flashcardDeck=cards[0]['deck'])
chapterData=dict(title='Das geheimnisvolle Buch',catalogTitle='Sakura · Tập 1',series='SAKURA · TẬP 1',
    summary='Cuốn sách bí ẩn · Sakura mở sách Clow và gặp Kero. Bản 25 phút có trọn giấc mơ đầu tập, lời kết Góc Kero và giới thiệu tập sau. Nhạc Nhật và hai lời chào cách điệu chỉ giữ khi xem, không chấm chính tả Đức.',
    levelLabel='Gợi ý A2–B1',defaultMode='all',practiceModeVersion=1,
    contentVersion=2,storageKey='vokabelgo_kino_chapters_v1_sakura_s01e01',
    legacyKey=video['progressKey'],legacyCount=0,chapters=chapters,vocabularyCount=len(cards))

def write_json(path,value):path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
write_json(ROOT/'sakura-s01e01-aligned.json',dict(captions=captions,utterances=units))
(ROOT/'sakura-s01e01-aligned.js').write_text('// Local owner-supplied subtitles; rebuild with scripts/build-sakura-lesson.py.\nconst SAKURA_S01E01_CAPTION_CUES = '+json.dumps(captions,ensure_ascii=False,indent=2)+';\nconst SAKURA_S01E01_ALIGNED_UTTERANCES = '+json.dumps(units,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
lesson=dict(video=video,chapterData=chapterData,flashcards=cards)
(ROOT/'sakura-s01e01-lesson.js').write_text('const SAKURA_S01E01_LESSON = (() => {\n  const lesson = '+json.dumps(lesson,ensure_ascii=False,indent=2)+';\n  lesson.chapterData.captionCues = SAKURA_S01E01_CAPTION_CUES;\n  return lesson;\n})();\n',encoding='utf-8')

def timestamp(s):
    ms=round(s*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);sec,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{sec:02}.{ms:03}'
for lang,key in [('de','text'),('vi','vi')]:
    (QA/f'sakura-s01e01.{lang}.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f"{c['id']}\n{timestamp(c['start'])} --> {timestamp(c['end'])}\n{c[key]}" for c in captions)+'\n',encoding='utf-8')
report=dict(source='Full German 720p source + owner paired German/Vietnamese SRTs; local preview',trimSeconds=0,oldPreviewOffset=FULL_SOURCE_OFFSET,
    mainStoryEndsAt=max(c['end'] for c in captions if c.get('sourceSrtNumber')),videoDuration=FULL_DURATION,sourceEndTruncated=False,
    excludedPracticeIds=[c['id'] for c in captions if c.get('practiceExcluded')],
    captionCount=len(captions),practiceUnitCount=len(units),partUnitCounts=[sum(p['start']<=u['start'] and u['end']<=p['end'] for u in units) for p in chapters],
    reviewNeeded=[dict(id=u['id'],text=u['text'],reason=u['reviewNeeded']) for u in units if u.get('reviewNeeded')])
write_json(QA/'build-report.json',report)
write_json(QA/'seven-reviewed-lines.json',[dict(id=c['id'],start=c['start'],end=c['end'],text=c['text'],vi=c['vi'],decision=c['sourceReview'],practiceExcluded=c.get('practiceExcluded')) for c in captions if c.get('sourceReview')])
print(json.dumps(report,ensure_ascii=True))
