# DRUCK S07E01 — kiểm chứng 8 cửa sổ, không thêm cue

- Phim: **DRUCK mùa 7 tập 1 — Alles ist verzaubert**, key `druck_s07e01`, alias `druck`.
- Nhánh: `codex/kino-druck-s07e01-missing-lines`; base main `215992fdb9663e7410b6e58ea8a7c2ee29c7ef9d`.
- Kết quả cuối: xét **8/8 cửa sổ**, **0 cue mới**, giữ đúng **268 utterance / 268 caption / 268 practice**; **7 chương / 45 picks** nguyên vẹn.
- **5 phần reviewNeeded**, **16 phần loại trừ/đã được phủ**. Số phần không phải số cửa sổ; một cửa sổ có thể có cả phần đã có, phần loại trừ và phần chờ nghe lại.
- **Không merge, không deploy.** Chặn tự deploy đúng nhánh này trong `vercel.json`; các nhánh khác và main giữ nguyên cấu hình. Đẩy hồ sơ để Muse kiểm độc lập trước khi chị quyết định bước tiếp theo.

## Vì sao không thêm câu

Không có đoạn thoại mới nào đồng thời khớp từ giữa small và medium, có mốc đáng tin và tách khỏi 268 cue cũ. Phần tiếng Đức rõ trong các cảnh tiệc đã có trong bản hiện hữu; phần mở đầu là rap/nhạc theo gói hướng dẫn, các đoạn khác chứa nhạc, tiếng hô hoặc lời nhận dạng phụ thuộc crop. Đây là kết quả đã hoàn thành kiểm chứng, không phải bỏ dở tích hợp. Danh sách thêm câu và cấp ID mới đều rỗng.

Giữ nguyên từng trường của 268 đối tượng cũ, gồm `id`, `parentId`, `start`, `end`, `text`, `vi`. File `druck_s07e01-aligned.js` có cùng SHA-256 với base sau chuẩn hóa LF/CRLF. Không thêm trường `speaker`; tập này dùng một mảng utterance cho cả phụ đề và luyện nghe. Không dựng VTT hay file lesson riêng vốn không có trong kiến trúc hiện tại.

## Quyết định theo cửa sổ

Mốc giây tuyệt đối. `review.json` là quyết định cuối của Codex, raw ASR giữ nguyên để kiểm lại.

| Cửa sổ | Gói Muse | Kết quả |
|---|---|---|
| 1 | 15.61–42.19 | 15.61–38.64 là rap/nhạc, loại theo chính sách tập. Từ38.64 chồng cue500002 và500003; không thêm lại hay sửa các tên ASR đoán sai. Earshot Music0.79. |
| 2 | 142.68–157.51 | Cụm Oh/Whoo/geil/Okay đã có trong500038. Lời chụp ảnh đã có trong500039. Khoảng149.16–156.44 giữ review: các crop nhận được Leute ở các mốc rất khác nhau, crop rộng trả lại cả câu cũ. Không biến sai lệch mốc của ASR thành cue mới. |
| 3 | 216.60–220.07 | Giữ review toàn khoảng: small hẹp không ra chữ, medium hẹp sinh câu chào kết video; hai crop rộng chỉ nhận lời đếm/Cheese ở trước. Earshot Music0.52/Speech0.14 và gợi ý âm giống còi z3.59 không đủ để xác nhận hay phủ định từ. |
| 4 | 404.44–421.55 | Mở rộng kiểm đầu khoảng403.48–405.84, giữ review vì lời lớp học chỉ xuất hiện không ổn định. Phần405.84–421.55 loại theo chính sách nhạc; Anti medium nhận lời hát tiếng Anh, các lượt khác sinh credit hoặc không ra chữ. Earshot Music0.54/Speech0.34. |
| 5 | 482.58–490.67 | What?/Safe haben die Style./Komm doch auch mal mit. đã nằm trong500108–500110. Khoảng485.24–489.92 giữ review: Jo/de/Oh/damn hoặc Oh, der ist hier không khớp hai model. Earshot Music0.42/Speech0.31. |
| 6 | 764.37–769.07 | Không thêm các chuỗi credit WDR2020/2021 hoặc câu lặp do máy sinh. Anti medium rộng không có segment; small rộng lặp một câu nhiều lần rồi credit. Earshot Music0.49/Speech0.31; phân loại chỉ hỗ trợ, không chứng minh credit đã được đọc. |
| 7 | 865.40–869.07 | Giữ nguyên đuôi500187 và đầu500188. Khoảng866.40–868.60 giữ review: Das war ein/Das wars/Wow/Tschüss/Lass uns rein bất đồng. Earshot Speech0.56/Music0.36 không cho biết từ nào đúng. |
| 8 | 1132.53–1136.33 | Cue500259 Buh! và500260 Buuuh! đã có; phần giữa là tiếng hô/kêu theo gói hướng dẫn, không nhận được câu mới ổn định. Không đổi chuỗi O dài của medium thành thoại. Earshot Music0.52/Speech0.42. |

## Năm phần reviewNeeded

1. Cửa sổ2: **149.16–156.44** — lời gọi trước câu chụp ảnh đã có; mốc/quan hệ lặp chưa chốt.
2. Cửa sổ3: **216.60–220.07** — câu kết video chỉ xuất hiện ở một crop/model; chưa chốt âm/từ.
3. Cửa sổ4: **403.48–405.84** — `Kommt mit nach vorn.` / `Ja, das war's` / `Dann kommen wir in den Empfang.` / credit. Các tiếng Ja trong crop rộng còn chạm đuôi cue500089, không cắt từ để tạo cue mới.
4. Cửa sổ5: **485.24–489.92** — âm chen trong cảnh tiệc, từ và số lần lặp chưa ổn định.
5. Cửa sổ7: **866.40–868.60** — các câu ngắn bất đồng nêu ở bảng.

Cả5 khoảng đều không chồng lên bất kỳ cue cũ nào và không được đưa vào học liệu. Không tự sửa lời ARD hiện hữu bằng bản ASR, kể cả `Safe haben die Style.` hoặc các câu có mốc ASR ước lượng sớm hơn mốc đã duyệt.

16 phần loại trừ có đầy đủ mốc và lý do trong `review.json`: 11 phần thuộc cue đã có, 2 phần rap/nhạc hoặc nhạc kèm sai lệch mốc câu đã có, 2 phần nhạc/chuỗi nhận dạng chưa được chứng thực, 1 phần tiếng hô. Giữ nguyên cue hát có dấu# đã tồn tại ở500001 theo yêu cầu bảo toàn cue cũ; chính sách không thêm lời hát không cho phép xóa cue này.

## Bằng chứng độc lập

- Video gốc từ đúng release `media-v1`: **92,708,650 byte**, **1278.08 giây**, **854×480**; SHA-256 `c2433e3cc318bfe477b85392446bb56c8568a2faa4f39eea15c98d0361aa1774`, khớp con trỏ LFS. Không recode, không upload hay đưa media mới vào commit.
- Audio giải mã16kHz float32: **20,447,232 sample / 1277.952 giây**, SHA-256 `3c5233fe4caecf54d8a00cc80c40c2af9606b8e11f942d1e4eae8fb0498c240c`. Chênh0.128giây với container do độ dài stream audio; không dịch mốc hoặc đổi tốc độ.
- Anti: **16 crop**, 8 cửa sổ rộng hơn ở cả small và medium. Anti khai đã hoàn tất pha nhận dạng trước khi đọc baseline/Muse/Codex. Hội thoại `d6517f45-91b0-4e0d-95b7-b9e392999670`; runner và báo cáo riêng được lưu cùng hồ sơ.
- Codex: **34 crop** — mỗi model8 main +7 recheck +2 recheck2. Tổng **50/50 crop hoàn tất**, kèm từng segment, word timestamp và xác suất nguyên bản.
- Tất cả dùng local CPU int8, 3 luồng, model có sẵn, `de`, beam5, temperature0, word timestamps; không `initial_prompt`, không `hotwords`, `condition_on_previous_text=false`. Runtime có sẵn CT2 4.6.0; không sửa môi trường toàn máy.
- Earshot chạy local trên8 đoạn, chỉ dùng phân loại âm thanh tổng quát. Không coi các nhãn Music/Speech hoặc gợi ý âm thanh là bằng chứng xác nhận một câu Đức, cũng không dùng mô hình audio LLM tải âm thanh lên dịch vụ ngoài.
- **humanListened=false**. Không tuyên bố đã nghe giọng hoặc có người nghe bản ngữ duyệt. Nguồn Đức chính thức ARD EBU-TT là thông tin ghi trong file nguồn hiện hữu, không phải một lần kiểm chứng mới với ARD.
- Anti cũng đề nghị **0 câu thêm**. Tóm tắt Anti chia3 cửa sổ treo, còn phần lớp học ở4 được nêu là tùy giữ treo. Codex lưu5 phần treo cuối cùng: giữ thêm đầu4 sau các retake và giữ cả3 thay vì kết luận chắc không có thoại từ phân loại nhạc. Không sửa báo cáo Anti để làm giống quyết định cuối.

## ID và parentId

Published ID500001–500268, parentId1–268 giữ nguyên. `source-id-audit.json` rà tham chiếu JSON có phân biệt lesson: snapshot hỗn hợp còn chứa ID500xxx cũ của Spy Family, không phải draft DRUCK. Trong phạm vi DRUCK, max published/draft vẫn500268. Nếu sau này có câu được xác nhận thì ID tiếp theo500269, parentId tiếp theo269; **lượt này không cấp ID hay parentId nào**.

## Kiểm tra đã qua

- `audit-final.cjs`:268 đối tượng deep-equal với base; không trùng ID/parentId, không chồng mốc; file aligned không đổi; shared chapter/practice/metadata giữ cùng hash; **32 aligned của phim khác không đổi**;5 vùng treo ngoài học liệu; chặn tự deploy đúng nhánh mới.
- `verify-evidence.py`:50 raw crop hoàn tất, đúng nguồn/PCM hash, prompt/hotwords rỗng,8 kết quả Earshot được lưu; audit ID theo lesson; không có câu mới lén thêm.
- `npm run test:unit`: **21/21 suite đạt**, xem `unit-test.log`.
- E2E có sẵn `kino-catalog.spec.js`, bài `Kino starts with a grid...`: **1/1 đạt**; mở các phim trong catalog, trong đó DRUCK có đúng7 phần. Dùng cấu hình test tạm ở port3130 để không đụng server đang dùng của chị; không sửa config test hay server sản phẩm.
- Chrome local: **20 mốc** qua5 phần, bao phủ8 cửa sổ; cue cũ Đức–Việt hiện đúng, khoảng treo/nhạc không tự có phụ đề; video phát/tua được, duration1278.08 và854×480; bật/tắt CC đạt; **0 console error**. Xem `browser-player-verification.json` và `player-existing-cue.png`.

## Tái kiểm

Từ root repo: `python qa/kino-alignment/druck_s07e01_missing_20261028/finalize-review.py`, `node qa/kino-alignment/druck_s07e01_missing_20261028/audit-final.cjs`, `python qa/kino-alignment/druck_s07e01_missing_20261028/verify-evidence.py`. Không lệnh nào sửa dữ liệu phụ đề; lệnh đầu chỉ tạo lại quyết định biên tập đã lưu. Nếu chạy lại ASR, dùng đúng runtime/video gốc và spec số, không truyền lời thoại từ gói Muse làm prompt.
