# Prompt đưa Codex — Kiểm chứng câu thiếu: Erdmännchen — Die Schmucklose

```
Tiếp tục hàng chờ bổ sung câu thiếu Kino, phim tiếp theo: Erdmännchen —
Die Schmucklose (tập thám tử). Muse gửi kèm file JSON quét riêng
(quet-cau-thieu--erdmaennchen-schmucklose.json): 7 cửa sổ ứng viên kèm lời
ASR và cue trước/sau từng đoạn. KHÔNG dùng lời ASR của Muse làm
prompt/hotwords — chỉ là danh sách cửa sổ để kiểm chứng độc lập.

SỐ LIỆU BASE (main hiện tại: 215992fdb9663e7410b6e58ea8a7c2ee29c7ef9d, đã gồm
Blubberunterricht 24; DRUCK đã xét xong 0 cue thêm, vẫn nằm ở nhánh riêng
chưa gộp, KHÔNG thuộc base này):
- lessonId/key: erdmaennchen_schmucklose
- File trong repo: erdmaennchen-schmucklose-aligned.js,
  erdmaennchen-schmucklose-lesson.js (biến ERDMAENNCHEN_SCHMUCKLOSE_*)
- Phụ đề hiện có: 166 cue, 7 chương, 49 picks, 24 thẻ; thời lượng 722,5 giây.
- Dãy ID công khai: 1000101–1000266 LIỀN MẠCH không khoảng trống. Hồ sơ nguồn
  ở qa/kino-alignment/erdmaennchen_schmucklose/ — Muse đã rà: max ID kể cả
  draft nguồn cũng là 1000266. → Cue mới nối TIẾP SAU 1000266 (từ 1000267),
  không tái sử dụng ID nào.
- Nguồn video/audio: video đang phục vụ trên web là
  erdmaennchen_schmucklose.mp4 (qua release media-v1 của repo
  vokabelgo-media). Bản quét của Muse chạy trên audio trích từ chính bản
  web-v1 này.

Làm đúng chuẩn các lượt trước:
1. Kiểm chứng độc lập từng ứng viên bằng small + medium trên video gốc; mốc
   câu mới theo word timestamps, tuyệt đối không chồng mốc; giữ nguyên tuyệt
   đối 166 cue cũ từng trường.
2. Thoại thật → chép chính xác, dịch Việt theo văn phong của tập (loạt
   Erdmännchen nói năng ngắn, hài), ID tiếp nối sau 1000266. Nghe không rõ →
   reviewNeeded trong review.json, không bịa từ, không vào phụ đề/picks/thẻ.
3. LƯU Ý RIÊNG CỦA TẬP NÀY (từ bản quét của Muse):
   - Cửa sổ 1 (~0:03–0:25): đây là NHẠC HIỆU MỞ ĐẦU của loạt phim ("Ein
     Erdmännchen als Detektiv, das gibt's nicht überall...") → bài hát, loại
     trừ kèm lý do như các lượt trước.
   - Cửa sổ 2 (~1:32–1:38): đoạn đối đáp ngắn nhiều câu ("Können Sie das
     beweisen? — Ja natürlich. — Hier. — 6,38 Meter. — Fein!") — ứng viên
     thoại thật rõ nhất của tập; chú ý số đo "6,38 Meter" phải khớp bằng
     chứng từ, không tự sửa số.
   - Cửa sổ 3 (~3:22–3:27): câu cửa miệng "Das ist pappalapapp" lặp lại
     nhiều lần rồi một câu bị cắt dở "Hier drin war..." — phần lặp là sắc
     thái diễn xuất, tách câu theo bằng chứng; không bịa phần kết cho câu
     cắt dở.
   - Cửa sổ 5 (~6:32–6:37): ASR ghi "...wird mein Flauschehäschen aber Augen
     wachen" — thành ngữ chuẩn là "Augen machen"; wachen/machen là điểm dễ
     bất đồng giữa các model. Chỉ chốt khi bằng chứng từ rõ; bất đồng thì
     reviewNeeded, không tự chuẩn hoá theo thành ngữ.
   - Cửa sổ 6 (~8:52–8:56): đoạn hỏi đáp về "Schmuck", nhưng động từ cuối
     ASR ghi "gestört" nghe không hợp nghĩa (có thể là từ khác bị nghe
     nhầm) — kiểm kỹ từ cuối; không chắc thì giữ reviewNeeded cả câu, không
     tự thay bằng từ hợp nghĩa.
   - Cửa sổ 4 (~4:17, 1,6 giây) và 7 (~11:00, 2,3 giây): mảnh rất ngắn
     ("Köstlich! Und wie kann man nur so le..." bị cắt; "Dick!" một từ) —
     kiểm tra quan hệ với cue kề bên, tránh thêm bản sao của đuôi câu đã có;
     câu cắt dở không tự hoàn thiện.
4. Xong thì chạy test liên quan + kiểm player như các lượt trước, đẩy lên
   nhánh MỚI codex/kino-schmucklose-missing-lines (từ main hiện tại 215992f),
   rồi DỪNG báo cáo chờ duyệt: số ứng viên đã xét / số cue thêm (mốc + câu
   Đức) / số loại trừ kèm lý do / số reviewNeeded / hash commit. Không merge
   vào main, không deploy.
```
