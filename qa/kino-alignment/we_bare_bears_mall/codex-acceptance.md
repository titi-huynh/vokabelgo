# Bàn giao bài We Bare Bears — Codex đã nghiệm thu

**Đã hoàn tất trong bản chạy cục bộ:** [Mở bài Kino](http://localhost:3000/?kino=bears).

- Bài: **Wir und die Mall (Đoạn trích)**, nguồn chính thức Cartoon Network Deutschland: https://www.youtube.com/watch?v=9vTRSk7Xunc . Đây là đoạn trích dài **04:34**, không trình bày thành tập đầy đủ.
- Đã xác nhận tiếng Đức bằng nhận dạng tự động không ép ngôn ngữ, ở đầu/giữa/cuối video; Codex kiểm tra độc lập với một mô hình khác.
- **3 phần học, 57 câu phụ đề Đức–Việt chọn lọc, 21 câu trọng tâm và 18 thẻ từ** có ví dụ và liên kết về đúng phần.
- Có ảnh bìa, xem toàn video, phụ đề/CC, Nghe–Viết–Nói và tiến độ lưu riêng. Âm thanh nguồn được giữ nguyên.
- Antigravity triển khai; Codex rà lại, loại câu 1100133 có nghĩa Đức–Việt chưa chắc chắn và bỏ thông tin số mùa chưa được xác minh.

## Kiểm tra bản chốt

- **18/18 bộ kiểm thử đơn vị đạt**.
- **9/9 kiểm thử trình duyệt của bản sửa 2 đạt**, gồm bài mới và catalog. Hồi quy Der Nudeltrick đã đạt ở lượt trước; bản sửa 2 không thay đổi bài đó.
- Đã kiểm tra phát/seek video, từng ranh giới phần, phụ đề Đức–Việt, CC, chấm viết, tiến độ riêng, thẻ từ và liên kết, điều hướng, điện thoại và ghi âm với micro giả lập.
- Đã xem ảnh máy tính và điện thoại; dữ liệu 8 bài có từ lúc bắt đầu không bị đổi. Cue ID toàn kho không trùng; SHA-256 video không đổi.

## File chính

- `we-bare-bears-mall-aligned.js`, `we-bare-bears-mall-lesson.js`: dữ liệu phụ đề và bài học.
- `video/we_bare_bears_mall.mp4`, `assets/kino-posters/we_bare_bears_mall-{1..3}.jpg`: video và ảnh bìa.
- `kino-data.js`, `kino-chapter-data.js`, `kino-metadata.js`, `index.html`: đăng ký bài vào luồng học hiện có.
- `scripts/build-we-bare-bears-mall.py`, `scripts/review-we-bare-bears-mall.py`: pipeline phụ đề; các script metadata/poster có thêm bài mới.
- `e2e/kino-we-bare-bears.spec.js` và cập nhật catalog test: kiểm thử bài và kho.
- Thư mục QA này có nguồn/hash, bằng chứng ngôn ngữ, ASR và đối chiếu, TSV đã duyệt, DE/VI VTT, audit và log kiểm thử. Xem `codex-review.md` để biết chi tiết nghiệm thu.

Phụ đề là lời thoại chọn lọc; nhạc, tiếng hô chồng lấn và câu chưa chắc chắn được bỏ. Chưa có người bản ngữ duyệt toàn bộ lời thoại. Chưa triển khai lên máy chủ công khai.

Rà lại lần hai: đã sửa chính tả Esteller, người nói và mốc/câu hỏi còn thiếu; xem codex-second-review.md. Bài giữ 57 câu và tiến độ cũ.

