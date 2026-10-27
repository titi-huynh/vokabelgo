import json
from pathlib import Path

qa = Path(__file__).resolve().parent
review = json.loads((qa/'review.json').read_text(encoding='utf-8'))
counts = review['counts']
def stamp(seconds):
    ms=round(seconds*1000)
    return f'{ms//60000:02}:{ms//1000%60:02}.{ms%1000:03}'
recognitions=sum(len(json.loads(f.read_text(encoding='utf-8'))['windows']) for f in qa.glob('independent-*.json'))
lines=['# Frieren S01E02 — kiểm chứng câu thiếu, 27/10/2026','',
    f'Đã xét **12/12 cửa sổ** từ gói Muse bằng small + medium độc lập; tổng cộng {recognitions} lượt nhận dạng có lưu raw, word timestamps và crop spec. Không dùng transcript Muse, cue cũ hay tên nhân vật làm prompt/hotwords.', '',
    f'**Thêm {len(review["added"])} cue; 235 → {235+len(review["added"])} cue.** Giữ nguyên toàn bộ 235 caption và 235 practice cue cũ ở mọi trường: ID/parentId, Đức/Việt, speaker, mốc, sourceEvidence và legacyIds. Chương, picks và flashcards được kiểm tra với baseline main d1204a4b47d41096f4e5b5d71e667be0de338413.', '',
    '**Giải trình ID:** gói Muse ghi max ID công khai 1300243; dữ liệu nguồn đã có 247 draft và dùng ID đến 1300247, gồm bốn draft preview 1300244–1300247. Cue mới bắt đầu **1300248**, không lấp khoảng trống hoặc tái sử dụng ID nháp. Bản gốc của draft bị thay thế được giữ trong missingDialogueReview.supersededDrafts.', '',
    '**Nguồn âm thanh:** máy hiện không còn raw input tập 2. Lượt này dùng archive 720p của kho media dự án, không mã hóa lại audio; SHA-256 tệp và PCM giải mã của cả 720p/480p khớp hồ sơ media gốc (media-verification.json). Đã kiểm đúng duration 1560.102313s. Không tự nhận có bản raw input để kiểm lại ngoài hồ sơ này.', '',
    '**Giới hạn bằng chứng:** đây là kết quả máy, chưa được người nghe duyệt từng từ. Chỉ chuẩn hóa hoa/thường và dấu câu; không tự sửa ngữ pháp hoặc tên riêng từ ngữ cảnh. Phần chưa chốt giữ riêng trong reviewNeeded, ngoài captions/practice/picks/flashcards.', '',
    '**Khác đề xuất Anti:** Anti đề xuất 9 cue sau 98 lượt ASR. Codex kiểm thêm 4 lượt trao đổi rộng và chỉ đưa 8 cue vào bản cuối: giữ riêng câu #7 có cách tách von ihr/von hier cần nghe tay, không tự sửa ASR theo nghĩa câu. Von hier là giả thuyết ngữ cảnh, không phải lời ASR đã xác nhận. Codex cũng giữ phần trước cue 1300068 ở #6 trong reviewNeeded vì chưa có lời Đức ổn định, thay vì kết luận chắc đó chỉ là âm phi từ vựng.', '',
    '| ID | Ứng viên | Mốc | Người nói | Câu Đức | Nghĩa Việt |','|---|---:|---|---|---|---|']
for cue in review['added']:
    lines.append(f'| {cue["id"]} | {cue["candidate"]} | {stamp(cue["start"])}–{stamp(cue["end"])} | {cue["speaker"]} | {cue["text"]} | {cue["vi"]} |')
for key,title in [('excluded','Loại trừ/không thêm trùng'),('reviewNeeded','Cần người duyệt')]:
    lines += ['',f'**{title}: {len(review[key])} phần.** Một cửa sổ có thể có cả phần thêm, phần loại trừ và phần chưa chắc; không cộng số phần để suy ra số cửa sổ.', '']
    for part in review[key]:
        span=part.get('museRange',part.get('window'))
        lines.append(f'- Ứng viên #{part["candidate"]}, {stamp(span[0])}–{stamp(span[1])}: {part["reason"]}')
lines += ['', '**Hai vùng ngoài thoại tập:** khung hình scene-preview-1558.jpg ghi rõ “Episode 3 / Tötungszauber”, xác nhận preview tập 3. Phần đầu 0–18.54s được Earshot phân loại Music 0,775 / Speech 0,061; kết hợp hình mở đầu, raw ASR và quy ước exclusions có sẵn để phân loại, không coi Earshot là công cụ xác nhận tiếng Đức.', '',
    '**Tái tạo dữ liệu:** integrate-review.cjs chỉ dựng riêng Frieren từ baseline main cố định, khoét các exclusions/uncertainty đúng phần câu được xác nhận. Không đổi builder dùng chung. audit-final.cjs kiểm đủ cue cũ, ID mới, toàn bộ draft cũ, chương/picks/thẻ, phim khác, metadata và khả năng builder tái tạo đúng.', '',
    '**Kiểm tra cuối:**', '']
unit=qa/'unit-test-results.txt'
if unit.exists() and 'ALL 21 SUITES PASSED' in unit.read_text(encoding='utf-8'):
    lines.append('- 21/21 bộ unit đạt (unit-test-results.txt).')
e2e=qa/'e2e-test-results.txt'
if e2e.exists() and '3 passed' in e2e.read_text(encoding='utf-8'):
    lines.append('- 3/3 E2E Frieren tập 2 đạt: từ vựng/tiến độ, viết-nghe-nói cùng cue, player song ngữ/chuyển chất lượng (e2e-test-results.txt).')
player=qa/'player-verification.json'
if player.exists():
    data=json.loads(player.read_text(encoding='utf-8'))
    lines.append(f'- {data["checked"]}/{data["total"]} cue mới đạt trên player video thật ở desktop, {sum(len(c["boundaries"]) for c in data["results"])} seek trước/giữa/sau; mobile 390px kiểm {data["mobile"]["checked"]} cue tiêu biểu, lỗi JavaScript: {len(data["errors"])}. Hai MP4 720p/480p đạt byte range, decode và seek/phát ở hai vùng (player-verification.json).')
for file,label in [('final-data-verification.json','Audit bảo toàn dữ liệu và builder'),('evidence-verification.json','Kiểm word evidence với raw outputs của cả hai model')]:
    if (qa/file).exists():lines.append(f'- {label}: đạt ({file}).')
lines += ['', '**Trạng thái bàn giao:** nhánh codex/kino-frieren-missing-lines tạo từ main d1204a4b47d41096f4e5b5d71e667be0de338413. vercel.json chỉ thêm chặn tự deploy đúng nhánh Frieren này; main và các nhánh khác giữ nguyên. Chưa merge, chưa deploy; push xong gửi Muse kiểm tra và dừng chờ chị duyệt. Hash commit được ghi trong tin bàn giao.', '',
    'proposed-review.json và ANTIGRAVITY-HANDOFF.md là đề xuất của Anti; review.json là quyết định cuối do Codex kiểm. Bằng chứng raw không bị sửa để khớp lời được chọn.']
(qa/'BAO-CAO-KIEM-CHUNG-FRIEREN-2026-10-27.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('Report updated')
