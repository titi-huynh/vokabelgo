# Prompt đưa Codex — Kiểm chứng câu thiếu: SpongeBob Blubberunterricht

```
Tiếp tục hàng chờ bổ sung câu thiếu Kino, phim tiếp theo: SpongeBob
Blubberunterricht (bài học thổi bong bóng). Muse gửi kèm file JSON quét riêng
(quet-cau-thieu--spongebob-blubberunterricht.json): 6 cửa sổ ứng viên kèm lời
ASR và cue trước/sau từng đoạn. KHÔNG dùng lời ASR của Muse làm prompt/hotwords
— chỉ là danh sách cửa sổ để kiểm chứng độc lập.

SỐ LIỆU BASE (main hiện tại: 09f3b78c619b47961024396b02564c3005542012, đã gồm
Frieren 243, Dungeon 372, SpongeBob Pizza 63):
- lessonId/key: spongebob_blubberunterricht
- File trong repo: spongebob-blubberunterricht-aligned.js,
  spongebob-blubberunterricht-lesson.js (biến SPONGEBOB_BLUBBERUNTERRICHT_*)
- Phụ đề hiện có: CHỈ 19 cue, 2 chương, 14 picks, 12 thẻ; thời lượng 222,8 giây.
  Đây là đoạn trích thoại chọn lọc (độ phủ ~18%) — giữ đúng chuẩn biên tập đó:
  chỉ bổ sung thoại thật đã xác nhận, không lấp kín mọi tiếng động.
- Dãy ID công khai: 1600101–1600119, LIỀN MẠCH không khoảng trống. Hồ sơ nguồn
  ở qa/kino-alignment/spongebob_blubberunterricht_20261026/ — Muse đã rà:
  max ID kể cả draft nguồn cũng là 1600119. → Cue mới nối TIẾP SAU 1600119
  (từ 1600120), không tái sử dụng ID nào.
- Nguồn video/audio: video đang phục vụ trên web là
  spongebob_blubberunterricht.mp4 (qua release media-v1 của repo
  vokabelgo-media). Bản quét của Muse chạy trên audio trích từ chính bản
  web-v1 này.

Làm đúng chuẩn các lượt trước (K-On!, Nudeltrick, Dungeon, Frieren, SpongeBob
Pizza):
1. Kiểm chứng độc lập từng ứng viên bằng small + medium trên video gốc; mốc câu
   mới theo word timestamps, tuyệt đối không chồng mốc; giữ nguyên tuyệt đối
   19 cue cũ từng trường.
2. Thoại thật → chép chính xác, dịch Việt theo văn phong của tập này, ID tiếp nối
   sau 1600119. Nghe không rõ → reviewNeeded trong review.json, không bịa từ,
   không vào phụ đề/picks/flashcards.
3. LƯU Ý RIÊNG CỦA TẬP NÀY (từ bản quét của Muse):
   - Cửa sổ 2 (~0:28–1:14, KHỐI ~45 GIÂY): nguyên một cảnh chưa có câu nào —
     nhưng phần lớn là tiếng hô lặp đi lặp lại "Die Technik! Die Technik!"
     (trò đùa chạy của cảnh). Cần tách rõ: câu thoại thật riêng lẻ (ví dụ lời
     dặn/cảnh báo đầu khối) thì xét thêm; riêng tiếng hô lặp thuần túy thì xử
     như hát/hò reo — loại trừ kèm lý do hoặc reviewNeeded, KHÔNG biến thành
     hàng loạt cue một từ và không bịa lời vào chỗ ASR cắt dở ("Du hast nicht
     die richti..." bị cắt giữa từ).
   - Cửa sổ 4 (~2:07–2:50, ~43 giây): độ tin cậy ASR RẤT thấp (−1,71), gần như
     toàn tiếng hô tên "Tadeus! Tadeus!" lặp lại — nhiều khả năng là hò reo/
     hô tên, ít thoại ổn định. Nghe kỹ; chỉ lấy câu nào có bằng chứng từ rõ
     ràng, còn lại loại trừ/reviewNeeded kèm lý do.
   - Cửa sổ 3 (~1:53–1:59): ASR ghi "Tadeus hat Gene!" — nghi nghe nhầm
     "Genie" (khớp ngữ cảnh cửa sổ 5–6 có "Ein Genie!"). Không tự sửa theo
     đoán; xác nhận bằng bằng chứng từ hoặc giữ reviewNeeded.
   - Cửa sổ 5 (~2:53–2:58): lời giới thiệu "Hallo meine Freunde, vor euch
     steht in der Tat... Madeo!" — từ cuối là TÊN RIÊNG chưa rõ ("Madeo?"
     hay dạng khác); không đoán tên khi ASR chưa xác nhận âm, theo đúng quy
     ước các lượt trước.
   - Cửa sổ 6 (~3:01–3:02, 1 giây): "Ein Genie!" rất ngắn — kiểm tra quan hệ
     với cue kề bên, tránh thêm bản sao nếu là đuôi câu đã có.
   - Tên nhân vật trong ASR của Muse ("Tadeus") là dạng nghe máy; bản chuẩn
     trong dữ liệu của tập là "Thaddäus" — lấy theo dữ liệu đã duyệt khi chép
     câu đã xác nhận.
4. Xong thì chạy test liên quan + kiểm player như các lượt trước, đẩy lên nhánh
   MỚI codex/kino-spongebob-blubberunterricht-missing-lines (từ main hiện tại
   09f3b78), rồi DỪNG báo cáo chờ duyệt: số ứng viên đã xét / số cue thêm
   (mốc + câu Đức) / số loại trừ kèm lý do / số reviewNeeded / hash commit.
   Không merge vào main, không deploy.
```
