# Prompt đưa Codex — Kiểm chứng câu thiếu: DRUCK S07E01

```
Tiếp tục hàng chờ bổ sung câu thiếu Kino, phim tiếp theo: DRUCK Mùa 7 Tập 1
"Alles ist verzaubert". Muse gửi kèm file JSON quét riêng
(quet-cau-thieu--druck-s07e01.json): 8 cửa sổ ứng viên kèm lời ASR và cue
trước/sau từng đoạn. KHÔNG dùng lời ASR của Muse làm prompt/hotwords — chỉ là
danh sách cửa sổ để kiểm chứng độc lập.

SỐ LIỆU BASE (main hiện tại: 215992fdb9663e7410b6e58ea8a7c2ee29c7ef9d, đã gồm
Blubberunterricht 24, SpongeBob Pizza 63, Frieren 243, Dungeon 372):
- lessonId/key: druck_s07e01
- File dữ liệu: druck_s07e01-aligned.js (biến DRUCK_S07E01_ALIGNED_UTTERANCES).
  Tập này KHÔNG có file lesson riêng và KHÔNG có trường speaker — chương/picks
  nằm ở file dùng chung kino-chapter-data.js / kino-practice-data.js.
- Phụ đề hiện có: 268 utterance, 7 chương, 45 picks. Nguồn Đức là PHỤ ĐỀ
  CHÍNH THỨC của ARD Mediathek (EBU-TT, đã lọc dòng mô tả âm thanh); tiếng
  Việt là bản dịch của dự án. Vì nguồn là phụ đề chính thức nên các khoảng
  trống phần lớn là đoạn nhạc/tiệc mà phụ đề gốc chủ ý không chép — kỳ vọng
  số câu thêm được sẽ ÍT, kết quả ít hoặc bằng không là hoàn toàn bình thường.
- Dãy ID: 500001–500268 LIỀN MẠCH, parentId chạy theo thứ tự 1–268. Muse đã
  rà repo: không có thư mục hồ sơ nguồn riêng cho DRUCK trong
  qa/kino-alignment/, max ID kể cả draft = 500268. → Cue mới nối TIẾP SAU
  500268 (từ 500269). CHÚ Ý parentId: giữ nguyên tuyệt đối 268 mục cũ kể cả
  parentId; mục mới dùng parentId không trùng và nêu rõ cách gán trong báo
  cáo, không đánh lại parentId của mục cũ.
- Nguồn video/audio: video/druck-s07e01.mp4 (phục vụ qua release media-v1 của
  repo vokabelgo-media). Bản quét của Muse chạy trên audio trích từ chính
  bản web này.

Làm đúng chuẩn các lượt trước:
1. Kiểm chứng độc lập từng ứng viên bằng small + medium trên video gốc; mốc câu
   mới theo word timestamps, tuyệt đối không chồng mốc; giữ nguyên tuyệt đối
   268 utterance cũ từng trường.
2. Thoại thật → chép chính xác, dịch Việt theo văn phong của tập, ID tiếp nối
   sau 500268, đúng định dạng utterance hiện hữu (không thêm trường speaker).
   Nghe không rõ → reviewNeeded trong review.json, không bịa từ, không vào
   phụ đề/picks.
3. LƯU Ý RIÊNG CỦA TẬP NÀY (từ bản quét của Muse — tập này khác hẳn các phim
   trước, đa số cửa sổ là NHẠC và tiệc):
   - Cửa sổ 1 (~0:16–0:40): lời ASR là LỜI RAP/hát ("Inception, ruf mich an,
     ich bin in 5 Minuten ready..."); utterance đầu tiên của tập còn mang dấu
     # của nhạc. → Bài hát: loại trừ kèm lý do, không đưa vào thoại học.
   - Cửa sổ 4 (~6:45–7:00): ASR chỉ ra "SWR 2020" — đây là ASR ảo giác trên
     nền nhạc/hình, không phải thoại. Cửa sổ 6 (~12:45) tương tự: "Copyright
     WDR 2021" là ảo giác ASR ở đoạn lặng. Không kết luận có thoại từ các
     chuỗi này.
   - Cửa sổ 2 (~2:23–2:36) và 5 (~8:03–8:09): cảnh tiệc, lẫn tiếng hò reo
     ("Wuuuh!", "Geil, okay.") với vài câu ngắn có thể là thoại thật ("Wollt
     ihr noch...?", "Komm doch auch mal."). Chỉ lấy câu nào có bằng chứng từ
     rõ ràng ở cả hai model/crop; tiếng reo hò loại trừ, phần lưng chừng giữ
     reviewNeeded.
   - Cửa sổ 3 (~3:37, 1 giây): có tiếng nhưng ASR không ra chữ — nghe kỹ cửa
     sổ hẹp/rộng trước khi kết luận.
   - Cửa sổ 7 (~14:26, 1 giây): "Das war's für heute." độ tin cậy rất thấp
     (−1,1) — có thể là thoại thật ngắn hoặc ảo giác; không chắc thì
     reviewNeeded.
   - Cửa sổ 8 (~18:53): "Uuuuuh!" là tiếng kêu/hò, không phải thoại.
4. Xong thì chạy test liên quan + kiểm player như các lượt trước, đẩy lên nhánh
   MỚI codex/kino-druck-s07e01-missing-lines (từ main hiện tại 215992f), rồi
   DỪNG báo cáo chờ duyệt: số ứng viên đã xét / số cue thêm (mốc + câu Đức) /
   số loại trừ kèm lý do / số reviewNeeded / hash commit. Không merge vào
   main, không deploy.
```
