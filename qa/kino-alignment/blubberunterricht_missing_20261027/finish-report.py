"""Write a compact review report from the actual final data and evidence."""
import hashlib,json,pathlib,shutil,subprocess
qa=pathlib.Path(__file__).resolve().parent;root=qa.parents[2]
read=lambda f:json.loads((qa/f).read_text(encoding='utf8'))
review=read('review.json');verification=read('final-data-verification.json')
assert verification['pass'] and read('evidence-verification.json')['pass']
video=root/'video/spongebob_blubberunterricht.mp4'
media=dict(path='video/spongebob_blubberunterricht.mp4',bytes=video.stat().st_size,sha256=hashlib.sha256(video.read_bytes()).hexdigest(),duration=222.841905,source='Existing unchanged original local source, same SHA256 as published release media-v1; no download/recode/upload',humanListened=False)
assert media['bytes']==12325458 and media['sha256']=='0e1ec80278f70b49d352a6ec31d760f610f72be2e204984a9aa0f8e39b32a42e'
(qa/'media-source-verification.json').write_text(json.dumps(media,indent=2)+'\n',encoding='utf8')
for kind in ['overview-desktop','dictation-mobile']:
    shutil.copyfile(root/f'review-assets/kino-next-spongebob-blubberunterricht-{kind}.png',qa/f'e2e-{kind}.png')
files=['spongebob-blubberunterricht-aligned.js','spongebob-blubberunterricht-lesson.js','kino-metadata.js','qa/kino-alignment/spongebob_blubberunterricht_20261026/lesson-content.json','qa/kino-alignment/spongebob_blubberunterricht_20261026/build-summary.json','qa/kino-alignment/spongebob_blubberunterricht_20261026/spongebob_blubberunterricht.de.vtt','qa/kino-alignment/spongebob_blubberunterricht_20261026/spongebob_blubberunterricht.vi.vtt']
digest=lambda:{f:hashlib.sha256((root/f).read_bytes()).hexdigest()for f in files}
before=digest();subprocess.check_call(['python',str(qa/'integrate-review.py')],cwd=root);after=digest();assert before==after
(qa/'build-determinism.json').write_text(json.dumps(dict(files=after,**{'pass':True},method='Regenerated from immutable base plus review.json; every generated file byte-identical before/after'),indent=2)+'\n',encoding='utf8')
rows='\n'.join(f"| {c['id']} | {c['start']:.2f}–{c['end']:.2f} | {c['speaker']} | {c['text']} | {c['vi']} |"for c in review['added'])
held='\n'.join(f"| {i} | {p['candidate']} | {p['start']:.2f}–{p['end']:.2f} | {p['reason']} |"for i,p in enumerate(review['reviewNeeded'],1))
out=f'''# Blubberunterricht — bản chờ Muse kiểm tra

- Nhánh: `codex/kino-spongebob-blubberunterricht-missing-lines`.
- Base main: `{review['baseRevision']}`.
- Đã xét **6/6 cửa sổ**, thêm **5 cue → 24 caption / 24 practice**, giữ nguyên tuyệt đối **19 caption + 19 practice cũ từng trường**.
- ID nối tiếp **1600120–1600124**; không tái sử dụng ID. Giữ **2 chương / 14 picks / 12 thẻ**, nguồn video, dữ liệu bài học và các phim khác. Không chồng mốc/trùng ID.
- **9 phần reviewNeeded**, **13 phần loại trừ**. Đây là số phần, không phải số cửa sổ; một cửa sổ có thể chứa nhiều quyết định.
- Chưa merge, chưa deploy. `vercel.json` chặn tự deploy đúng nhánh mới. Chờ Muse kiểm độc lập và chị duyệt.

## Năm câu bổ sung

Mốc giây tuyệt đối trong video. Mỗi cue có tham chiếu trực tiếp tới toàn bộ word timestamps của cả small và medium trong `review.json`; chỉ chuẩn hóa hoa/thường và dấu câu.

| ID | Mốc giây | Người nói | Đức | Việt |
|---|---|---|---|---|
{rows}

`Und dies...und das...` là một câu hướng dẫn liên tục gồm 12 từ đã khớp, không tách thành nhiều cue một từ. `Danke` được chọn từ hai lượt full độc lập đều có đúng ba từ; medium crop hẹp xác nhận ba, small crop hẹp thêm một từ ở vị trí còn thuộc tiếng hô trước đó. Biến thể bốn từ vẫn giữ nguyên trong raw JSON.

## Các phần chờ review

| Phần | Cửa sổ | Mốc giây | Lý do giữ lại |
|---|---|---|---|
{held}

13 phần loại trừ được liệt kê đầy đủ trong `review.json`: 7 phần thuộc cue cũ, 4 phần hô lặp thuần túy, 2 phần tiếng kêu/thổi bong bóng. Không đưa những phần này vào phụ đề hay học liệu. Gói Muse nói cửa sổ2 chưa có cue/covered=0, nhưng thực tế có sẵn1600106,1600107,1600108; đã sửa cách phân loại và giữ cả ba cue nguyên vẹn.

## Bằng chứng và giới hạn

- Đúng video gốc **12,325,458 bytes**, **222.841905 giây**, SHA256 `{media['sha256']}`; không đổi media. `media-source-verification.json` và raw ASR lưu provenance.
- Anti nhận dạng độc lập **8 crop full** (4 small +4 medium). Codex **44 crop** (6 main +16 recheck mỗi model). Tổng **52/52 hoàn tất**. CPU int8, tiếng Đức, beam5, temperature0, word timestamps, không initial_prompt/hotwords, không lấy câu trong gói Muse làm mồi.
- Earshot chỉ hỗ trợ phân loại âm thanh tổng quát ở tiếng hô kỹ thuật/tên; không xác nhận từ tiếng Đức hay người nói.
- **humanListened=false**. Nhãn người nói suy ra từ chuỗi hình ảnh và ngữ cảnh. Anti sửa nhãn tạm ban đầu trong `SPEAKER-FOLLOWUP.md`; Codex kiểm thêm các frame51.4/51.9/52.3/53.3/54.3/55.2. **Đề nghị Muse đặc biệt kiểm nhãn Thaddäus ở1600121/1600122**, vì Anti vẫn lưu khả năng SpongeBob nói ngoài khung hình. Không tuyên bố đã nghe giọng để xác nhận.
- Không tự sửa Gene→Genie, tên cuối lời giới thiệu hoặc Die Technik theo ngữ cảnh. `Das ruft!` đã khớp cả hai model ở crop hẹp mới nhất nhưng vẫn giữ reviewNeeded vì phụ thuộc crop và tiếng hô nền.
- Hồ sơ nguồn cũ và văn bản19 cue cũ được giữ; chỉ bổ sung5 cue và thông tin phương pháp kiểm chứng. Các bản nhận dạng cũ trong thư mục20261026 là bằng chứng lịch sử, không bị viết lại.

## Kiểm tra đã qua

- `node .../audit-final.cjs`: 19 caption/practice cũ deep-equal; 2 chương/14 picks/12 thẻ và video giữ nguyên; **32 file aligned khác không đổi**; metadata chỉ đổi cueCount của Blubberunterricht19→24; VTT24cue mỗi ngôn ngữ; mọi cue nằm trọn trong đúng chương; không trùng ID/chồng mốc/lọt reviewNeeded.
- `python .../verify-evidence.py`: cả hai model cho từng câu, raw word/timing không cắt;52 crop hoàn tất, đúng SHA256, nguồn19 cue và vocabulary giữ nguyên.
- `npm run test:unit`: **21/21 suite qua** (`unit-test.log`).
- `npx playwright test e2e/kino-next-cartoons.spec.js --grep 'spongebob-blubberunterricht:'`: **3/3 qua** (`e2e-test.log`), gồm video đầy đủ/tua gần cuối, hai chương, phụ đề Đức–Việt/CC, ranh giới chương, timeline24cue, luyện nghe và lưu tiến độ trên màn hình320/390/768.
- Kiểm trực tiếp UI bằng nút phát/thanh tua: **22 mốc**: 15 mốc trước/trong/sau cả5 câu mới và7 mốc đại diện reviewNeeded; bật/tắt CC; video640×360 tải/phát được; không có console error. Xem `browser-player-verification.json`, `player-danke-desktop.png`, `e2e-overview-desktop.png`, `e2e-dictation-mobile.png`.
- Dựng lại có cùng hash từng file (`build-determinism.json`). Không sửa builder, UI hay thuật toán player.

## Tái kiểm

Từ root repo: chạy `python qa/kino-alignment/blubberunterricht_missing_20261027/finalize-review.py`, `python qa/kino-alignment/blubberunterricht_missing_20261027/integrate-review.py`, `node qa/kino-alignment/blubberunterricht_missing_20261027/audit-final.cjs`, `python qa/kino-alignment/blubberunterricht_missing_20261027/verify-evidence.py`. Hai lệnh đầu tái tạo dữ liệu từ base bất biến và quyết định đã lưu, không chạy ASR. Nếu chạy ASR phải dùng runtime local đã ghi trong `WORK-NOTES.md` và video gốc, không truyền lời thoại vào prompt.
'''
(qa/'REPORT.md').write_text(out,encoding='utf8')
print(json.dumps(dict(report='REPORT.md',newCues=5,finalCues=24,reviewNeeded=9,excludedParts=13,deterministic=True)))
