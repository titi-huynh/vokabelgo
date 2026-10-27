# Prompt đưa Codex — Kiểm chứng câu thiếu: Frieren S01E02

```
Tiếp tục hàng chờ bổ sung câu thiếu Kino, phim tiếp theo: Frieren S01E02.
Muse gửi kèm file JSON quét riêng (quet-cau-thieu--frieren-s01e02.json):
12 cửa sổ ứng viên, phụ đề hiện có 235 cue (8 chương, 56 picks, 18 thẻ),
dãy ID hiện tại 1300001–1300243 (235 cue nhưng ID chạy tới 1300243 vì có
khoảng trống từ bản dựng gốc — cue mới nối TIẾP SAU ID lớn nhất 1300243,
không lấp khoảng trống, không tái sử dụng ID cũ).

Làm đúng chuẩn các lượt K-On!, Nudeltrick và Dungeon vừa rồi:
1. Kiểm chứng độc lập từng ứng viên bằng small + medium trên video gốc, KHÔNG dùng
   transcript của Muse làm prompt/hotwords; mốc câu mới theo word timestamps,
   tuyệt đối không chồng mốc; giữ nguyên tuyệt đối 235 cue cũ.
2. Thoại thật → chép chính xác, dịch Việt theo văn phong của chính tập này, ID tiếp
   nối sau 1300243. Nghe không rõ → reviewNeeded trong review.json, không bịa từ,
   không vào phụ đề/picks/flashcards.
3. LƯU Ý RIÊNG CỦA TẬP NÀY (từ bản quét của Muse):
   - Cửa sổ 1 (0:00–0:17, ngay đầu tập, trước cue đầu tiên ở 1:31): lời ASR độ tin
     cậy rất thấp và nội dung nghe như câu chào kết thúc ("Das war's für heute...
     Bis zum nächsten Mal.") — nghi là âm thanh ngoài nội dung tập (xem trước/giới
     thiệu của bản web) hoặc ASR nghe nhầm dưới nhạc mở đầu. Nghe kỹ trước khi kết
     luận; không chắc thì loại trừ kèm lý do hoặc reviewNeeded, đừng vội thêm.
   - Cửa sổ 4 (~7:58–8:16, dài ~18 giây): khối thoại nhiều câu liền nhau về cuốn
     sách không có phép hồi sinh/bất tử, độ tin cậy ASR cao — đây là ứng viên nặng
     nhất của tập, khả năng tách thành nhiều cue.
   - Cửa sổ 6 (~8:35–8:36, 1 giây): có tiếng người nhưng ASR không chép được chữ
     nào — nghe kỹ bằng cửa sổ hẹp/rộng trước khi kết luận, như cửa sổ 2 của
     Dungeon.
   - Cửa sổ 5 (~8:25, "Magierin.") và cửa sổ 8 (~9:41, "Feiern?"): chỉ một từ ngắn
     — kiểm tra xem có phải phần đuôi của cue kề bên đã có sẵn không; nếu là đuôi
     câu cũ thì ghi rõ trong báo cáo, không thêm cue trùng.
   - Cửa sổ 12 (~25:50–26:00, sát cuối file): nội dung nhắc "Weise der Verderbnis"
     — kiểm tra ngữ cảnh xem đây là thoại trong tập hay đoạn xem trước tập sau
     (Vorschau); nếu là xem trước thì ghi rõ phân loại trong báo cáo kèm quyết
     định giữ/loại có lý do.
4. Xong thì chạy test liên quan + kiểm player như các lượt trước, đẩy lên nhánh MỚI
   codex/kino-frieren-missing-lines (từ main hiện tại), rồi DỪNG báo cáo chờ duyệt:
   số ứng viên đã xét / số cue thêm (mốc + câu Đức) / số loại trừ kèm lý do / số
   reviewNeeded / hash commit. Không merge vào main, không deploy.
```
