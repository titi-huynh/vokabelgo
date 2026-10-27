# Platte Reifen

Nghiệm thu Codex ngày 26/10/2026: **223 câu thoại Đức–Việt chọn lọc, 7 phần, 36 câu trọng tâm, 22 thẻ từ**. Mở local: http://localhost:3000/?kino=plattereifen .

Muse biên tập bản đầu 241 câu. Anti đối chiếu ASR small/base và khung hình, loại 18 câu chưa đủ chắc, sửa xưng hô/người nói và nghĩa theo cảnh rồi tích hợp. Codex đã rà các câu trọng tâm, thẻ từ, bằng chứng, ảnh desktop/mobile và log kiểm thử; chạy lại validator, kiểm tra hash video và bảo toàn dữ liệu cũ trước khi nghiệm thu.

## Bằng chứng

- Video NDR gốc: `video/erdmaennchen_platte_reifen.mp4`, 267.747.631 byte, 750 giây, H.264 720p/AAC.
- SHA256: `4fb2d58c1c2d3a8b1141e0a5b5ca1cf96e964795ed133972ad8dcbcc62c8cdb5`.
- `muse-lesson.json`, `muse-asr-medium.json`: giữ nguyên đầu vào.
- `reviewed-lesson.json`, `changelog.json`, `independent-picks-audit.json`: quyết định giữ/loại câu, sửa nội dung và các lượt đối chiếu.
- `anti-asr-small-windows.json`, `anti-asr-base-windows.json`, `frames/`: chứng cứ ASR và hình ảnh. Câu có từ chưa xác minh được bị loại cả câu khỏi runtime, không lược từ để biến phỏng đoán thành đáp án.
- `validator-output.json`: Codex chạy lại đạt 223 câu, 7 phần, 36 picks, 22 thẻ và 55/55 tệp phim cũ giữ nguyên hash.
- `unit-test.log`, `e2e-browser.log`: đã đọc kết quả thực tế 21/21 bộ unit và 8/8 kiểm tra trình duyệt do Anti chạy trên bản này.
- `screenshots/`: ảnh desktop và điện thoại 320/390/768 px; Codex đã xem ảnh tổng quan và bài phần 6 trên điện thoại.

Các sửa đáng chú ý: `Halteverbot` dịch rõ cấm dừng xe; câu trả thuyền 3200200 xác định lại người nói/xưng hô; thành ngữ `ins Wasser fallen` dịch theo nghĩa kế hoạch suýt đổ bể. Những câu ASR bất đồng về giới từ, đuôi từ, đại từ/người nói hoặc dưới nhạc kết đã loại khỏi đáp án thay vì tự bổ sung.

## Dựng lại

Chạy từ thư mục gốc dự án theo các script đã bàn giao. Không sửa tay metadata được sinh tự động.

```powershell
python qa/kino-alignment/erdmaennchen_platte_reifen/build_reviewed_and_runtime.py
python qa/kino-alignment/erdmaennchen_platte_reifen/generate_runtime_files.py
node scripts/build-kino-metadata.cjs
node qa/kino-alignment/erdmaennchen_platte_reifen/validate_integration.js
```

Dữ liệu luyện của mọi phim trong baseline giữ nguyên ngữ nghĩa; riêng Zum in die Luft gehen vẫn 179 câu, 7 phần, 40 picks, 21 thẻ. Khóa tiến độ và ID của bài mới độc lập.

Giới hạn: lời thoại chọn lọc, không phải bản chép đầy đủ từng chữ; đối chiếu ASR không thay thế lượt nghe duyệt toàn tập của người bản ngữ. Micro giả lập chỉ kiểm tra luồng ghi âm UI. Ba Shorts chỉ lưu đề xuất trong QA. Tích hợp local, không commit/push/deploy trong lượt này.
