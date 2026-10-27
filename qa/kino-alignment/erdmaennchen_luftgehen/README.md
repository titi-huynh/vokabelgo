# Zum in die Luft gehen

Nghiệm thu Codex ngày 26/10/2026: **179 câu thoại Đức–Việt chọn lọc, 7 phần, 40 câu trọng tâm, 21 thẻ từ**. Mở local: http://localhost:3000/?kino=luftgehen .

Muse biên tập bản đầu 182 câu; Antigravity rà với ASR small/base, tích hợp và kiểm thử. Codex kiểm tra đầu ra, loại thêm câu 3100067 vì từ chưa chắc đã bị lược đi chỉ để hợp ngữ pháp. Quyết định cuối có trong `codex-acceptance.json`; số liệu 180/41/22 của báo cáo Anti là bản trước lượt duyệt cuối.

## Nguồn và bằng chứng

- Video gốc NDR/KiKA: `video/erdmaennchen_luftgehen.mp4`, 269.446.928 byte, 692,44 giây; SHA256 `5e037e81b804487f054052b88d3c8adad9af8b92aa3ea0aaf3e036bc80d28278`.
- `muse-lesson.json`, `muse-asr-medium.json`: đầu vào gốc, giữ nguyên.
- `reviewed-lesson.json`, `changelog.json`: dữ liệu sau rà soát và lịch sử sửa.
- `anti-asr-small-windows.json`, `anti-asr-base-windows.json`, `independent-picks-audit.json`: 32 cửa sổ đối chiếu cho 41 câu trọng tâm ban đầu và các câu đặc biệt. Đối chiếu ASR không phải tỷ lệ chính xác do người bản ngữ xác nhận.
- Loại khỏi runtime: 3100055 (tên riêng chưa chắc), 3100182 (từ đầu thiếu dưới nhạc), 3100067 (zwar/zwei chưa xác định). Giữ ID các câu còn lại; không đánh số lại.
- Câu 3100120 đã được đối chiếu small/base để giữ từ đầu `Hast`, bắt đầu 478,06 giây; không ghép từ ở 457 giây vào câu ở 478 giây.
- Đã sửa cách dịch cô chim khoe khả năng bay, câu người bán bóng hỏi trực tiếp và thẻ `verkaufen` bám đúng ví dụ nguồn.

## Dựng lại và kiểm tra

Chạy tại thư mục gốc dự án. Các script dùng đầu vào ASR đã lưu; không cần nhận dạng lại chỉ để build runtime.

```powershell
python qa/kino-alignment/erdmaennchen_luftgehen/build_reviewed_and_runtime.py
python qa/kino-alignment/erdmaennchen_luftgehen/codex-finalize.py
node qa/kino-alignment/erdmaennchen_luftgehen/validate_integration.js
```

Luôn chạy `codex-finalize.py` sau builder của Anti để giữ quyết định loại câu chưa chắc. Script sinh lại aligned/lesson/metadata và chỉ cập nhật mục luyện của bài này; bảo toàn dữ liệu phim khác.

Codex đã chạy lại trên bản cuối: **21/21 bộ unit** và **8/8 bài trình duyệt** (bài mới + catalog). Kết quả thực nằm trong `codex-unit.log`, `codex-browser.log`, `validator-output.json`. Ảnh desktop/mobile ở `screenshots/`. Bao gồm phát/tua HTTP206, 7 phần, caption/CC, nghe–viết đúng/sai, từ vựng nguồn, lưu tiến độ và màn hình 320/390/768 px.

Hai spec Erdmännchen cũ có một số giả định ID chọn sẵn và thao tác `fetch(blob:)` không còn khớp cơ chế hiện tại; Anti ghi nhận lỗi ở nhóm đó. Không tuyên bố toàn bộ E2E dự án đã đạt. Codex đã xác minh dữ liệu luyện của mọi phim cũ giữ nguyên ngữ nghĩa so với HEAD và sáu tệp aligned/lesson của Fahrstuhl, Nudeltrick, Schmucklose giữ nguyên hash Git.

Không có lượt nghe duyệt toàn tập bằng tai người. Ghi âm trình duyệt được kiểm tra với micro giả lập, không chứng minh thu âm vật lý. Ba đề xuất Shorts giữ trong QA, chưa đăng vào feed. Bài được tích hợp local; lượt này không commit, push hoặc deploy.
