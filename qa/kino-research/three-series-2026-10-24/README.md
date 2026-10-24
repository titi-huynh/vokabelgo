# Kino: SpongeBob, Pinguine và Courage — đã tích hợp

Ngày hoàn tất: 24/10/2026, Asia/Saigon.

Đã bổ sung ba bài từ **clip chính thức của nhà phát hành**, thay cho các mục catalog s.to/serienstream.to chưa có media được xác minh. Đây là đoạn trích, không trình bày như các tập phát sóng đầy đủ. Mỗi bài có phụ đề Đức–Việt chọn lọc, các câu luyện, flashcard có liên kết về cảnh, poster, video cục bộ và khóa tiến độ riêng.

| Bài / nguồn chính thức | Đường vào Kino | Thời lượng | Phần | Câu | Thẻ |
|---|---|---|---:|---:|---:|
| [SpongeBob — Krosse Krabbe Pizza, Nickelodeon Deutschland](https://www.youtube.com/watch?v=wxJnojpxPe8) | `/?kino=spongebob` | 05:01 | 3 | 60 | 18 |
| [Die Pinguine aus Madagascar — Popcorn Panik!, Nickelodeon Deutschland](https://www.youtube.com/watch?v=ONRyWXIGWQI) | `/?kino=pinguine` | 02:20 | 3 | 21 | 12 |
| [Courage — Diamantraub, Cartoon Network Deutschland](https://www.youtube.com/watch?v=QVVX49ssitY) | `/?kino=courage` | 02:32 | 2 | 11 | 12 |

Tổng: **8 phần, 92 câu và 42 thẻ**. Catalog Kino tăng từ 10 lên 13 bài.

## Nguồn và biên tập

- Các mẫu nhận dạng ngôn ngữ tự động đều xác nhận `de`; không suy từ nhãn audio container (một số file mang nhãn `eng`). Nguồn, hash SHA-256, ffprobe, mẫu ngôn ngữ, ASR và khung hình nằm ở ba thư mục `qa/kino-alignment/{spongebob,pinguine,courage}_source_20261024/`.
- Antigravity chuẩn bị media/ASR và bản nháp SpongeBob; hai agent độc lập chuẩn bị Pinguine và Courage. Codex nhận bàn giao, đối chiếu nhận dạng độc lập/khung hình, duyệt bản Việt, dựng bài và kiểm tra tích hợp. Không có tỷ lệ tiết kiệm token nào được đo.
- Các bài là **lời thoại chọn lọc**. Đoạn hát, tiếng nền và câu chưa chắc được giữ ngoài bộ luyện. Một số nhãn người nói của Pinguine được ghi theo nhóm thay vì đoán nhân vật.
- Codex bỏ thêm câu về rêu ở SpongeBob và câu có đuôi từ `Diamant(en)` chưa chắc ở Courage; giữ hồ sơ quyết định trong `codex-editorial-decisions.json`. Courage có đoạn đuổi bắt dài không lời; không tự tạo câu cho các khoảng đó.
- UI hiển thị số câu trọng tâm thực tế: phần đầu Courage có **3 câu**, không còn nhãn cứng 7 câu.
- Kiểm âm thanh cục bộ bằng earshot: SpongeBob −14,6 LUFS/−3,2 dBTP; Pinguine −19,2 LUFS/−6,4 dBTP; Courage −19 LUFS/−8,9 dBTP. Không có mẫu bị clipping trong các phép đo. Những số đo này không xác nhận độ chính xác của lời thoại.
- Biên tập dựa trên ASR và hình ảnh; chưa có lượt nghe duyệt toàn bộ bởi người bản ngữ. Ghi âm thử bằng micro giả lập chỉ xác minh luồng thao tác.

## Cấu trúc và tái dựng

Đầu vào hiện hành là `lesson-content.json` trong mỗi thư mục QA nêu trên. `content-draft.json`, bản TSV và raw ASR được giữ làm lịch sử; không dùng bản nháp để ghi đè phần duyệt.

```sh
python scripts/build-kino-short-lessons.py qa/kino-alignment/spongebob_source_20261024/lesson-content.json qa/kino-alignment/pinguine_source_20261024/lesson-content.json qa/kino-alignment/courage_source_20261024/lesson-content.json
node scripts/build-kino-metadata.cjs
```

Script sinh các file `*-aligned.js`, `*-lesson.js`, VTT Đức/Việt và build summary. Media nguồn không bị cắt hoặc ghi đè. Bộ thẻ lấy ví dụ trực tiếp từ cue đã duyệt; từ thẻ có thể mở đúng phần phim.

## Kiểm tra bản hoàn tất

- `npm run test:unit`: **18/18 bộ đạt**.
- `npx playwright test e2e/kino-familiar-animation.spec.js e2e/kino-catalog.spec.js e2e/kino-we-bare-bears.spec.js`: **18/18 kiểm tra đạt** (1,3 phút).
- Đã kiểm tra không có ID mới trùng với dữ liệu cũ hoặc giữa ba bài mới; 10 file phụ đề cũ giữ nguyên nội dung, metadata của 7 lesson sinh sẵn trước đây giữ nguyên.
- Kiểm tra trình duyệt bao gồm catalog, phát/tua/range HTTP 206, từng phần dừng đúng biên, phụ đề/CC, flashcard/backlink, viết và lưu tiến độ riêng, màn hình điện thoại, cùng hồi quy We Bare Bears v2.

## Để Muse tiếp tục

Kho GitHub: https://github.com/titi-huynh/vokabelgo, nhánh `main`. Sau khi lấy bản cập nhật phải chạy `git lfs pull` để tải MP4 thật; có code hoặc con trỏ LFS không đồng nghĩa đã có video.

```sh
git pull --ff-only
git lfs pull
npm ci
npm start
```

Nếu Muse có thay đổi chưa commit hoặc đang ở nhánh riêng, giữ các thay đổi đó và hợp nhất theo quy trình của nhánh; không reset hay ghi đè để lấy bản này. Tiếp tục bài mới bằng key/ID/khóa tiến độ mới, giữ nguyên các bài và tiến độ hiện có. Báo cáo khảo sát trước khi tích hợp chỉ là hồ sơ lịch sử; trạng thái ba bài đã được cập nhật ở tài liệu này.
