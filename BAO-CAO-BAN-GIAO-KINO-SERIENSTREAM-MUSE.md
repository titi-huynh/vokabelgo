# Báo cáo bàn giao cho Muse: s.to / serienstream.to và mở rộng kho Kino

Ngày tổng hợp: **24/10/2026 — Asia/Saigon**.

**Cập nhật sau triển khai ngày 24/10:** SpongeBob, Pinguine và Courage đã được tích hợp bằng clip chính thức, tổng 8 phần, 92 câu và 42 thẻ. Xem trạng thái và kết quả mới nhất tại `qa/kino-research/three-series-2026-10-24/README.md`. Các mục “chưa có bài” bên dưới mô tả trạng thái ở thời điểm lập báo cáo khảo sát, trước lần triển khai này.

## 1. Mục tiêu và phạm vi

Tiếp tục bổ sung phim hoạt hình quen thuộc bằng tiếng Đức cho kho Kino của VokabelGo. Bốn bộ chị ưu tiên: **We Bare Bears, SpongeBob, Die Pinguine aus Madagascar và Courage der feige Hund**. Chị đã yêu cầu làm **We Bare Bears trước**, kiểm tra tiếng Đức, biên tập phụ đề Đức–Việt và tích hợp thành bài học.

Đây là báo cáo tiếp nối công việc đã có, không phải yêu cầu xây lại website. Vai trò của s.to / serienstream.to trong đợt khảo sát là tra cứu bộ phim, tên Đức, mùa và mục tập. Có trang danh mục không đồng nghĩa đã có video phát được, audio Đức, phụ đề hay điều kiện sử dụng media phù hợp.

## 2. Tình trạng truy cập và giới hạn bằng chứng

| Hạng mục | Kết quả đã ghi nhận |
|---|---|
| `https://s.to/` | Công cụ web trả HTTP 502 trong lần kiểm tra ngày 23/10 và lần kiểm tra lại ngày 24/10. Không kết luận website ngừng hoạt động với mọi người dùng. |
| [serienstream.to](https://serienstream.to/) | Đọc được trang chủ trong lần kiểm tra ngày 24/10. |
| [SpongeBob](https://serienstream.to/serie/spongebob) | Ngày 24/10 đọc được danh sách mùa 1, gồm mục gộp nhiều tập con; cột ngôn ngữ trong phần trích xuất trống, có biểu tượng VOE. |
| [Pinguine](https://serienstream.to/serie/pinguine-aus-madagascar) | Ngày 24/10 đọc được danh sách mùa 1, gồm mục gộp nhiều tập con; cột ngôn ngữ trong phần trích xuất trống, có biểu tượng VOE. |
| We Bare Bears và Courage trên catalog | Hồ sơ ngày 23/10 đã xác nhận được trang danh mục; công cụ web không truy cập được hai URL này trong lần kiểm tra lại ngày 24/10. Chưa kết luận URL hỏng hay phim bị gỡ. |

Không suy ra ngôn ngữ audio từ tên tập tiếng Đức, biểu tượng host hoặc nhãn ngôn ngữ trong container. Hồ sơ We Bare Bears cho thấy container có nhãn `eng`, nhưng âm thanh đã được nhận dạng độc lập là tiếng Đức.

Với **We Bare Bears — Food Truck**, hồ sơ thực hiện trước đây ghi nhận trang tập dẫn qua `frameBridge` tới host bên thứ ba và chưa lấy được media trực tiếp. Nhóm đã chuyển sang clip chính thức để làm bài. Đây là kết quả khảo sát ở thời điểm đó, không phải xác nhận tình trạng player hiện nay. Báo cáo này không kiểm tra lại phát video hay âm thanh trên các host đó.

## 3. Danh sách phim và thứ tự tiếp tục

Các mục mùa/tập dưới đây là cách catalog liệt kê, chưa phải ánh xạ đã xác nhận tới một file video riêng. Những mức A2/B1 trong hồ sơ cũ chỉ là ước lượng biên tập, không dùng như kết quả đánh giá bằng âm thanh.

| Ưu tiên | Bộ phim / nguồn danh mục | Việc tiếp tục |
|---|---|---|
| 1 | [We Bare Bears – Bären wie wir](https://serienstream.to/serie/we-bare-bears-bren-wie-wir) | **Đã có bài Wir und die Mall trong Kino.** Nhập và kiểm tra bài hiện có trước; sau đó mới chọn clip/tập tiếp theo. Food Truck là ứng viên cũ, chưa được tích hợp. |
| 2 | [SpongeBob Schwammkopf](https://serienstream.to/serie/spongebob) | Ứng viên: mục 1 mùa 1, gồm Aushilfe gesucht / Meeresbodenpflege / Experten; hoặc mục 5 gồm Pizza-Heimservice / Heimat, süße Ananas. Chưa có bài học. |
| 3 | [Die Pinguine aus Madagascar](https://serienstream.to/serie/pinguine-aus-madagascar) | Ứng viên: mục 1 mùa 1, gồm Popcorn-Panik / Blitz und weg. Chưa có bài học. |
| 4 | [Courage der feige Hund](https://serienstream.to/serie/courage-der-feige-hund) | Ứng viên: mục 1 mùa 1, gồm Eine Nacht im Katz Motel / Oma-Eintopf. Hồ sơ cũ có mục đánh dấu `[In Episode before]`, cần tránh nhập trùng. Chưa có bài học. |
| 5 | [Die fantastische Welt von Gumball](https://serienstream.to/serie/die-fantastische-welt-von-gumball) | Đã có URL trong hồ sơ ngày 23/10; chưa chọn tập và chưa xác minh audio. |
| 6 | [Disney Phineas und Ferb](https://serienstream.to/serie/disney-phineas-und-ferb) | Ứng viên cũ: Die Achterbahn + Geburtstags(alb)träume; lưu ý các mục `Dito` có thể không là file độc lập. |
| 7 | [Kim Possible](https://serienstream.to/serie/kim-possible) | Ứng viên cũ: Schwer verknallt / Crush; chưa có media được kiểm tra. |
| 8 | [Avatar – Der Herr der Elemente](https://serienstream.to/serie/avatar) | Hồ sơ cũ xác định bản hoạt hình; chưa chọn tập. |

Thứ tự 5–8 là hướng mở rộng sau bốn bộ chị yêu cầu. Không coi tất cả tám bộ là đã sẵn sàng nhập Kino.

## 4. We Bare Bears đã làm đến đâu?

### Nguồn và sản phẩm hiện có

- Bài: **Wir und die Mall — Đoạn trích**, từ [clip Cartoon Network Deutschland](https://www.youtube.com/watch?v=9vTRSk7Xunc). Hồ sơ nguồn ghi nhận kênh được xác minh.
- Đây là clip khoảng **4 phút 34 giây**, không trình bày như một tập đầy đủ 11 phút; không khẳng định số mùa/tập của clip.
- Media: `video/we_bare_bears_mall.mp4`, 16.310.477 byte, 640×360, H.264/AAC, thời lượng 274,041905 giây.
- SHA-256: `ed020f3851523a1f9846f4a92339d7b4f38cec89608b9996da770376bc51b217`.
- Audio đã được kiểm tra bằng các mẫu đầu/giữa/cuối; kết quả nhận dạng ngôn ngữ đều là `de`. Xem hồ sơ QA để biết phương pháp và giới hạn.
- Đường vào bài: `/?kino=bears`; khóa nội bộ: `we_bare_bears_mall`.
- **3 phần, 57 câu chọn lọc Đức–Việt, 21 câu trọng tâm và 18 flashcard**; có ảnh bìa từng phần và liên kết từ thẻ về cảnh nguồn.
- Các chức năng đã được kiểm thử: phát/tua, phụ đề, chọn phần, nghe–viết, từ vựng, lưu tiến độ, giao diện điện thoại và luồng ghi âm với micro giả lập.

### Hai lượt rà soát và các điểm phải giữ

- Tên trên áo/túi đã sửa thành **Esteller** theo khung hình, thay cho kết quả ASR ban đầu `Estella`.
- Đã sửa nhãn người nói ở một số câu; khôi phục câu hỏi **“Wo ist die ganze Action?”** và căn lại các mốc quanh 70,42 giây và 83,98 giây.
- Cue mới **1100166 thay cho 1100112**, tổng vẫn 57 câu. Không dùng lại ID cũ cho nội dung mới vì có thể làm tiến độ cũ đánh dấu nhầm câu mới là đã học.
- Giữ `contentVersion: 2` và khóa căn giờ phiên bản v2; tránh để draft v1 ghi đè bản sửa. Khóa tiến độ học được giữ riêng cho bài.
- Mốc đã duyệt nằm trong `editorial-timing-overrides.json`; giữ các mốc này khi build lại.
- Bỏ những câu ASR mơ hồ hoặc lẫn âm nhạc/tiếng nền. Đây là **lời thoại chọn lọc**, không phải phụ đề đầy đủ cho mọi âm thanh trong clip.
- Việc biên tập dựa vào ASR, nhận dạng lại các đoạn ngắn và khung hình. Chưa có một lượt nghe duyệt toàn bộ bởi người bản ngữ; không mô tả bài là chính xác tuyệt đối.

Kiểm tra đã ghi nhận: lượt rà thứ hai đạt **18 bộ unit và 9 kiểm tra trình duyệt**; lúc bàn giao GitHub đạt **18 bộ unit và 14 kiểm tra trình duyệt** trên nhóm kiểm tra đã chọn. Đây là kết quả trước đó, không phải một lần chạy mới trong ngày viết báo cáo.

## 5. Kho GitHub và hồ sơ Muse cần đọc

Kho dự án: **https://github.com/titi-huynh/vokabelgo**, nhánh **main**. Commit bàn giao đã xác nhận: **`dace3128f4f726b75ee0413735dae499a0747d8d`**. Khi tiếp nhận, kiểm tra HEAD hiện tại; nếu có commit mới hơn thì ghi rõ thay vì tự lùi về bản cũ.

```sh
git lfs install
git clone https://github.com/titi-huynh/vokabelgo.git
cd vokabelgo
git lfs pull
npm ci
npm start
```

Dự án khoảng 3,4 GB ở lần đóng gói; video, nhạc và một số tệp thiết kế dùng Git LFS. Kiểm tra đã tải tệp thật, không chỉ con trỏ vài dòng. Nếu môi trường Muse thiếu Git LFS, dung lượng hoặc không thực thi được lệnh, báo đúng giới hạn và danh sách phần còn thiếu; không coi việc đọc được README là đã nhập xong dự án.

Các hồ sơ đã nằm trong commit bàn giao:

- `README.md`: lấy và chạy dự án trên máy khác.
- `qa/kino-research/familiar-animation-2026-10-23/codex-reviewed-report.md`: báo cáo khảo sát ban đầu. **Trạng thái We Bare Bears “chưa có bài” ở tài liệu này đã được cập nhật bởi các hồ sơ làm bài sau đó.**
- `qa/kino-research/familiar-animation-2026-10-23/codex-reviewed-sources.json`: danh sách tám bộ, URL, ứng viên tập và điểm vướng ở thời điểm khảo sát.
- `qa/kino-research/familiar-animation-2026-10-23/codex-verification.md`: bằng chứng catalog đã đọc.
- `qa/kino-alignment/we_bare_bears_mall/README.md`, `source.json`, `codex-review.md`, **`codex-second-review.md`**: nguồn, phạm vi bài và kết quả duyệt.
- `qa/kino-alignment/we_bare_bears_mall/reviewed-lines.tsv`, `editorial-timing-overrides.json`: đầu vào biên tập và mốc giờ đã sửa.
- `scripts/build-we-bare-bears-mall.py`: script build bài; có thể cần Python và các đầu vào QA tương ứng. Không cần chạy lại để mở web.
- `we-bare-bears-mall-aligned.js`, `we-bare-bears-mall-lesson.js`: dữ liệu runtime.
- `e2e/kino-we-bare-bears.spec.js`, `e2e/kino-catalog.spec.js`: kiểm tra hồi quy để tham khảo khi thêm bài mới.

## 6. Quy trình làm tiếp

1. **Tiếp nhận bản đang có:** chạy web, mở `/?kino=bears`, xác nhận ba phần, 57 câu và 18 thẻ; giữ nguyên ID, tiến độ và các sửa v2.
2. **Chọn một bài tiếp theo:** tiếp tục We Bare Bears theo ưu tiên của chị. Chọn nguồn có thể xem/nghe và sử dụng phù hợp; có thể đối chiếu [Eine exklusive Tour](https://www.youtube.com/watch?v=5IOr1S1rQJE), nhưng link này mới là ứng viên từ khảo sát trước, chưa xác nhận phát hiện tại. Nếu không có nguồn phù hợp, báo cụ thể rồi đề xuất SpongeBob.
3. **Xác minh media:** ghi URL, nhà phát hành, tên clip/tập, thời lượng, ngôn ngữ thực tế, phạm vi clip hay cả tập và điều kiện sử dụng. Với tập gộp, xác định ranh giới trên video thực trước khi gán tên bài.
4. **Biên tập lời thoại:** nhận dạng tiếng Đức, rà câu mơ hồ, dịch Việt theo ngữ cảnh, xác nhận người nói và căn giờ. Không tự sáng tác lời thoại hoặc biến điểm ASR thành điểm chính xác của phụ đề.
5. **Dựng bài:** chia theo cảnh; mỗi phần có mục tiêu học, câu trọng tâm, poster, từ vựng có ví dụ từ cảnh nguồn. Số câu và số thẻ phải phù hợp nội dung, không sao chép cứng số lượng của bài Mall.
6. **Tích hợp theo kiến trúc hiện có:** thêm dữ liệu `*-aligned.js`, lesson metadata, đăng ký loader `kino-data.js`; kiểm tra `KINO_VIDEOS`, `KINO_ALIASES`, `KINO_CHAPTER_DATA`, metadata, flashcards, catalog và media. Đọc `scripts/build-kino-metadata.cjs` trước khi thay đổi file metadata được sinh tự động. Chỉ cập nhật `kino-media-manifest.js` khi thực sự có bản media tương ứng.
7. **Kiểm tra và bàn giao:** xác nhận nguồn, phụ đề, ID, khóa tiến độ và liên kết; chạy unit cùng các kiểm tra trình duyệt liên quan. Báo tệp đã đổi, lệnh đã chạy, kết quả thực tế và điểm chưa kiểm chứng.

Nguồn chính thức đối chiếu đã tìm trong hồ sơ cũ: [Paramount+ Đức — Pinguine](https://www.intl.paramountplus.com/de/shows/the-penguins-of-madagascar/episodes/2/). Trước đây trang xem yêu cầu đăng nhập/thuê bao; có danh sách tên tập không có nghĩa đã có media để nhập. Chưa xác minh nguồn chính thức cho SpongeBob và Courage trong đợt khảo sát này.

## 7. Điều kiện nghiệm thu bài mới

- Bài phát được trên trình duyệt thực và màn hình điện thoại; tua/đổi phần hoạt động, không tràn ngang.
- Audio đã kiểm tra là tiếng Đức; lời Đức và nghĩa Việt khớp cảnh. Ghi rõ nếu chỉ dùng lời thoại chọn lọc.
- Các câu luyện có ID riêng, không trùng kho; một bài mới không dùng chung khóa tiến độ với bài khác.
- Phụ đề và mốc câu không bị cắt đầu/cuối hay lấy lẫn câu trước; các câu chưa chắc được loại hoặc ghi nhận để duyệt tiếp.
- Flashcard có nghĩa, ngữ pháp/ví dụ thích hợp và liên kết đúng phần phim.
- Chuyển phim, Back/Forward, tải lại và tiếp tục học hoạt động; các bài cũ giữ tiến độ.
- Ghi âm được kiểm tra theo khả năng môi trường; micro giả lập chỉ chứng minh luồng thao tác, không chứng minh chất lượng âm thanh thu thật.
- Có hồ sơ nguồn, giới hạn sử dụng/khả dụng, bằng chứng kiểm tra và danh sách việc còn thiếu. Không thêm vào catalog học như bài hoàn chỉnh khi mới có link hoặc bản chép lời chưa duyệt.

## 8. Yêu cầu ngắn để giao Muse

> Tiếp tục mở rộng Kino cho VokabelGo theo báo cáo này. Lấy nhánh main từ https://github.com/titi-huynh/vokabelgo bằng Git và Git LFS; đọc README cùng hồ sơ QA. We Bare Bears — Wir und die Mall đã có bài hoàn chỉnh ở /?kino=bears: 3 phần, 57 câu chọn lọc, 18 thẻ, bản biên tập v2; hãy kiểm tra và giữ các sửa đã duyệt. Ưu tiên làm tiếp We Bare Bears bằng một clip/tập khác, sau đó SpongeBob, Pinguine và Courage. s.to / serienstream.to hiện là nguồn khảo sát danh mục; phải kiểm tra video và audio thực trước khi dùng. Với từng bài, xác minh nguồn và tiếng Đức, biên tập lời Đức–Việt có mốc giờ, chia phần, tạo từ vựng và tích hợp vào cấu trúc Kino hiện có. Báo rõ phần đã kiểm chứng, phần còn thiếu và kết quả kiểm thử; không ghi “đã thêm bài” khi mới tìm được đường link.

---

Báo cáo này tổng hợp bằng chứng trong kho dự án và lần đọc web ngày 24/10/2026. Không có video mới được tải, bài Kino mới được thêm hoặc lệnh kiểm thử app nào được chạy trong lượt viết báo cáo.
