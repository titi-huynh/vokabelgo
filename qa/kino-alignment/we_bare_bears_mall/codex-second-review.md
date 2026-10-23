# Rà lại video We Bare Bears — bản sửa 2

Ngày 23/10/2026. Codex mở bài trong trình duyệt thật, phát/tạm dừng/tua video và xem phụ đề; đối chiếu thêm khung hình, dữ liệu ASR cũ và bốn cửa sổ nhận dạng ngắn bằng mô hình medium cục bộ. Video gốc không bị thay đổi.

## Lỗi đã sửa

1. **Sai chính tả tên trên áo và đồ lưu niệm.** Khung hình 219.4s ghi rõ `ESTELLER` trên túi. Chuẩn hóa `Estella` thành **Esteller** trong phụ đề, bản dịch, tên người nói, mô tả bài và ví dụ từ vựng. Bằng chứng: `codex-speaker-review-sheet-2.jpg`.
2. **Gán nhầm người nói.** Câu ở 202–205s do Grizz nói, không phải fan; câu kêu bảo vệ quần áo ở 219s là fan đội mũ đỏ; câu “Lass mich los!” ở 240s là Tom; tiếng gọi Panda ở 249s thuộc nhóm Grizz/Griff. Các nhãn đã được sửa theo khung hình đang nói; xem hai contact sheet kiểm tra người nói và `codex-speaker-240-2.jpg`.
3. **Gộp sai lượt thoại và thiếu câu hỏi.** Bản trước ghép lời gọi của Griff với câu hỏi kế tiếp, bỏ “Wo ist die ganze Action?”, rồi cho câu “Wir sollten…” bắt đầu quá sớm. Đã thay cue 1100112 bằng cue mới 1100166 cho lượt nói của Grizz ở 68.04–70.38s, khôi phục câu hỏi và bản Việt; đưa cue 1100113 về sau 70.42s. Câu gọi ngắn trước đó không còn thuộc bộ lời thoại chọn lọc.
4. **Câu luyện bắt đầu trong lời trước.** “Die Woche davor…” được căn lại từ 83.98s theo đối chiếu ngắn; tránh lấy lẫn đuôi cụm Food Court trước nó.

Các mốc được duyệt lưu trong `editorial-timing-overrides.json`, có lý do. Script build dùng các mốc này thay vì để kết quả small thiếu câu kéo phụ đề trở lại vị trí cũ. Kết quả medium/base/raw ASR được giữ nguyên làm bằng chứng; không sửa dữ liệu nhận dạng để khớp bài.

## Tiến độ và số lượng

- Vẫn **3 phần, 57 câu chọn lọc, 21 câu trọng tâm, 18 thẻ từ**.
- Cue được thay nội dung nhận ID mới để không tự đánh dấu câu hỏi mới là đã học từ ID cũ.
- Tiến độ học cũ được giữ. Bản căn giờ/draft dùng khóa v2 để dữ liệu v1 không ghi đè bản sửa; bản v1 không bị xóa.

## Kiểm tra bản sửa

- `npm run test:unit`: **18/18 bộ đạt**, log `codex-second-review-unit.log`.
- `npx playwright test e2e/kino-we-bare-bears.spec.js e2e/kino-catalog.spec.js --config=tmp/kino-local.config.cjs`: **9/9 bài đạt**, log `codex-second-review-browser.log`.
- Thêm hồi quy riêng cho câu hỏi được khôi phục, thời điểm chuyển sang câu tiếp, người nói, chính tả, tránh draft v1 và giữ tiến độ cũ.
- Kiểm thử đã xem cả ba phần, phụ đề/CC, chấm viết, từ vựng, liên kết, giao diện điện thoại và luồng ghi âm bằng micro giả lập.
- Audit xác nhận 8 bài có từ lúc bắt đầu không bị đổi, ID không trùng toàn kho, hash video gốc không đổi.
- Đã nạp và kiểm tra trực tiếp bản mới trong tab của chị, dừng ở 69.8s; câu hỏi và bản dịch hiện trên hình Grizz. Ảnh minh họa bản sửa: `review-assets/kino-we-bare-bears-reviewed-question-mobile.png`.

Đây vẫn là phụ đề chọn lọc. Việc kiểm lời thoại dựa vào nhiều lần nhận dạng và hình ảnh, chưa phải một lượt nghe duyệt toàn bộ bởi người bản ngữ.
