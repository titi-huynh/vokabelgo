import json
from pathlib import Path

qa=Path(__file__).resolve().parent
review=json.loads((qa/'review.json').read_text(encoding='utf-8'))
def stamp(seconds):
    ms=round(seconds*1000)
    return f'{ms//60000:02}:{ms//1000%60:02}.{ms%1000:03}'
counts=review['counts']
lines=['# Delicious in Dungeon S01E01 — kiểm chứng câu thiếu, 27/10/2026','',
    f'Đã xét **10/10 cửa sổ** bằng small + medium độc lập trên video gốc; tổng cộng {review["method"]["totalRecognitionWindows"]} lượt nhận dạng gồm cửa sổ chính, hẹp và rộng. Không dùng lời Muse làm prompt/hotwords.', '',
    f'**Thêm {counts["addedCues"]} cue; 367 → {counts["newCueCount"]} cue**, ID 1200385–1200390. Giữ nguyên tuyệt đối 367 caption và 367 practice cue cũ (ID, parentId, mốc, speaker, Đức/Việt, sourceEvidence, legacyIds). Không đổi chương, picks, thẻ từ hay mã player.', '',
    'Đây là bằng chứng máy, chưa phải bản chép được người nghe duyệt từng từ. Không đổi các âm tên riêng chưa chốt thành Falin/Marcille để chấm chính tả: ba đề xuất như vậy nằm ở reviewNeeded. Tiếng Ja. được tách riêng sau phần ngập ngừng, lấy trọn từ ở 324.09–324.43s và không cắt từ để vừa chương.', '',
    '| ID | Ứng viên | Mốc | Câu Đức | Bản dịch Việt |','|---|---:|---|---|---|']
for cue in review['added']:
    lines.append(f'| {cue["id"]} | {cue["candidate"]} | {stamp(cue["start"])}–{stamp(cue["end"])} | {cue["text"]} | {cue["vi"]} |')
lines += ['', 'Ở ứng viên #9, cửa sổ rộng khôi phục thêm Die ist echt gut. trước cửa sổ Muse gốc; cả small và medium cùng xác nhận trong đúng khoảng trống giữa hai cue cũ. Phần gọi tên trong Probier doch mal… không được tự hoàn thiện.', '',
    f'**Loại trừ/không thêm trùng: {counts["excludedParts"]} phần.** Một cửa sổ có thể vừa chứa câu thêm, phần loại trừ và reviewNeeded. Không cộng các số phần để suy ra số cửa sổ.', '']
for part in review['excluded']:
    span=part.get('museRange',part['window'])
    lines.append(f'- Ứng viên #{part["candidate"]}, {stamp(span[0])}–{stamp(span[1])}: {part["reason"]}')
lines += ['',f'**reviewNeeded: {counts["reviewNeededParts"]} phần**, không nằm trong captions/practice cues/picks/flashcards.', '']
for part in review['reviewNeeded']:
    span=part.get('museRange',part['window'])
    lines.append(f'- Ứng viên #{part["candidate"]}, {stamp(span[0])}–{stamp(span[1])}: {part["reason"]}')
lines += ['', '**Nguồn và căn giờ:** video gốc có container MPEG-TS dù mang đuôi .mp4. Bản MP4 720p remux giữ nguyên audio; bản 480p tải từ release media của dự án. Hai bản player khớp SHA-256 đã công bố trong hồ sơ media và cả ba tệp khớp SHA-256 PCM giải mã (media-verification.json). Mốc nhận dạng tính từ đầu luồng audio, không dịch mốc cue cũ.', '',
    'Niệm chú không được đổi thành tiếng Đức chuẩn. Earshot chỉ phân loại âm thanh, không chép hoặc xác nhận tiếng Đức: đoạn kết có Music 0,73; cửa sổ #2 có Music 0,48 / Speech 0,33 nên chưa đủ cơ sở kết luận hoàn toàn là tiếng hét phi từ vựng. Đoạn #2 vẫn cần duyệt dù đã thử nhiều crop.', '',
    '**Dữ liệu nguồn:** chỉ khoét các đoạn đã xác nhận khỏi exclusions. Hai draft 1200308 và 1200356 được lưu nguyên bản trong missingDialogueReview.supersededDrafts khi phần thoại khôi phục chuyển sang ID mới; các ID cũ không được tái sử dụng. Các phần chưa rõ của draft vẫn ở reviewNeeded. Builder hiện hữu tái tạo đúng dữ liệu cuối; integrate-review.cjs tái tạo riêng Dungeon từ baseline main cố định.', '',
    '**Giới hạn phát hành:** nhánh codex/kino-dungeon-missing-lines xuất phát từ main eed6b2dee89d7abcdcdab2285e1abfcab6ce9a79. vercel.json chỉ tắt tự triển khai đối với đúng nhánh này (git.deploymentEnabled), không tắt nhánh khác. Cấu hình theo https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled. Không merge, không gọi deploy, không chuyển phim tiếp theo. Hash commit được báo trong tin bàn giao.', '']
checks=[]
unit=qa/'unit-test-results.txt'
if unit.exists() and 'ALL 21 SUITES PASSED' in unit.read_text(encoding='utf-8'): checks.append('21/21 bộ unit đạt (unit-test-results.txt).')
e2e=qa/'e2e-test-results.txt'
if e2e.exists() and '4 passed' in e2e.read_text(encoding='utf-8'): checks.append('4/4 E2E Dungeon đạt: từ vựng/tiến độ độc lập, viết-nghe-nói cùng cue, phụ đề/chuyển chất lượng, byte range và seek cả 720p/480p (e2e-test-results.txt).')
player=qa/'player-verification.json'
if player.exists():
    data=json.loads(player.read_text(encoding='utf-8'))
    checks.append(f'{data["checked"]}/{data["total"]} cue mới đạt player video thật; {sum(len(c["boundaries"]) for c in data["results"])} lượt seek trước/giữa/sau, mobile 390 px, lỗi JavaScript: {len(data["errors"])} (player-verification.json và ảnh player-*.png).')
checks.append('Audit giữ nguyên 367 cue cũ ở cả captions và practice, không chồng mốc, đủ một chương/cue, giữ picks/flashcards, 32 tệp aligned phim khác không đổi, builder tái tạo đúng (final-data-verification.json).')
checks.append('6/6 cue mới có đầy đủ từ khớp literal với small và medium; trích dẫn timingEvidence tồn tại trong raw và không bị mốc hiển thị cắt mất (evidence-verification.json).')
lines += ['**Kiểm tra cuối:**', '',*['- '+s for s in checks], '',
    'Bằng chứng: review.json chứa smallEvidence/mediumEvidence/timingEvidence theo từng từ; independent-*.json là raw outputs, extra_*_spec.json giữ crop tái chạy. ANTIGRAVITY-HANDOFF.md và proposed-review.json là đề xuất ban đầu, không phải quyết định cuối.']
(qa/'BAO-CAO-KIEM-CHUNG-DUNGEON-2026-10-27.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('Report updated')
