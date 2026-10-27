# Prompt đưa Codex — Kiểm chứng câu thiếu: SpongeBob Pizza

```
Tiếp tục hàng chờ bổ sung câu thiếu Kino, phim tiếp theo: SpongeBob Pizza
(SpongeBob Schwammkopf — đoạn giao pizza). Muse gửi kèm file JSON quét riêng
(quet-cau-thieu--spongebob-pizza.json): 7 cửa sổ ứng viên kèm lời ASR và cue
trước/sau từng đoạn.

SỐ LIỆU BASE (main hiện tại: 20ce104c034033f47852a6e4c1c7c82f0cd6c85b, đã gồm
Dungeon 372 cue và Frieren 243 cue):
- lessonId/key: spongebob_pizza
- File trong repo: spongebob-pizza-aligned.js, spongebob-pizza-lesson.js
  (biến SPONGEBOB_PIZZA_CAPTION_CUES / SPONGEBOB_PIZZA_LESSON)
- Phụ đề hiện có: 60 cue, 3 chương, 21 picks, 18 thẻ; thời lượng 301,1 giây.
- Dãy ID công khai: 1200101–1200162, có 2 khoảng trống 1200120 và 1200134
  (câu bị giữ lại từ bản dựng gốc). Hồ sơ nguồn ở
  qa/kino-alignment/spongebob_source_20261024/ — Muse đã rà: max ID kể cả
  draft nguồn cũng là 1200162, KHÔNG có draft ẩn sau max công khai như Frieren.
  → Cue mới nối TIẾP SAU 1200162 (từ 1200163), không lấp 2 khoảng trống,
  không tái sử dụng bất kỳ ID nào đã dùng hoặc đã giữ lại.
- Nguồn video/audio: video đang phục vụ trên web là spongebob_pizza.mp4
  (qua release media-v1 của repo vokabelgo-media). Bản quét của Muse chạy
  trên audio trích từ chính bản web-v1 này.

Làm đúng chuẩn các lượt K-On!, Nudeltrick, Dungeon và Frieren vừa rồi:
1. Kiểm chứng độc lập từng ứng viên bằng small + medium trên video gốc, KHÔNG dùng
   transcript của Muse làm prompt/hotwords; mốc câu mới theo word timestamps,
   tuyệt đối không chồng mốc; giữ nguyên tuyệt đối 60 cue cũ.
2. Thoại thật → chép chính xác, dịch Việt theo văn phong của chính tập này, ID tiếp
   nối sau 1200162. Nghe không rõ → reviewNeeded trong review.json, không bịa từ,
   không vào phụ đề/picks/flashcards.
3. LƯU Ý RIÊNG CỦA TẬP NÀY (từ bản quét của Muse):
   - Cửa sổ 5 (~2:49–3:16, dài ~27 giây): đây là BÀI HÁT "Krosse Krabbe Pizza"
     (ASR toàn "Die große Krabbe Pizza ist die Pizza super knusperig! P-P-P-Pizza!"
     lặp lại) → theo quy ước các lượt trước, bài hát loại trừ kèm lý do, không đưa
     vào thoại học.
   - Cửa sổ 4 (~1:28–1:43, ~15 giây): thoại dẫn vào bài hát, câu cuối ASR đã bắt
     đầu lẫn lời hát ("Die große Krabbe Pizza ist die Pizza...") — tách kỹ phần
     thoại thật khỏi phần hát, chỉ lấy phần xác nhận được.
   - Cửa sổ 1–3 (~0:52–1:17): cụm câu ngắn quanh trò đùa "Auspacken/ausparken"
     (dỡ đồ/đỗ xe) — nhiều tiếng hô chồng nhau trong xe; kiểm tra kỹ quan hệ với
     cue kề bên, tránh thêm bản sao của câu đã có.
   - Cửa sổ 6 (~4:21–4:28): độ tin cậy ASR thấp (−0,98), lời mơ hồ "Komm drüber!
     Sponge!" — không chắc thì reviewNeeded.
   - Cửa sổ 7 (~4:32–4:33, 1 giây): có tiếng người nhưng ASR không chép được chữ
     nào — nghe kỹ bằng cửa sổ hẹp/rộng trước khi kết luận, như cửa sổ 2 của
     Dungeon.
4. Xong thì chạy test liên quan + kiểm player như các lượt trước, đẩy lên nhánh MỚI
   codex/kino-spongebob-pizza-missing-lines (từ main hiện tại 20ce104), rồi DỪNG
   báo cáo chờ duyệt: số ứng viên đã xét / số cue thêm (mốc + câu Đức) / số loại
   trừ kèm lý do / số reviewNeeded / hash commit. Không merge vào main, không
   deploy.
```
