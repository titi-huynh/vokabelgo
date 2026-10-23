# Hồ sơ nguồn phim hoạt hình quen thuộc cho Kino Vokabelngo (23/10/2026)

> Hồ sơ tổng hợp độc lập từ kết quả xác minh của Codex (`codex-verification.md`). Đây là danh sách nguồn chờ kiểm tra media và biên tập tiếp, **chưa phải bài học hoàn chỉnh** (chưa nghe audio, chưa xác nhận player, chưa có transcript được duyệt).

## 1. Bảng 4 bộ đã xác minh metadata & thứ tự ưu tiên đề xuất

Thứ tự ưu tiên biên tập: **We Bare Bears → SpongeBob → Pinguine → Courage**.

| Ưu tiên | Bộ phim (Tên Đức / Gốc) | Link catalog đã mở | Nguồn chính thức trong ghi chú | Tập chốt đề xuất kiểm tra trước | Trạng thái nhập kho |
|---|---|---|---|---|---|
| 1 | **We Bare Bears – Bären wie wir** (*We Bare Bears*) | https://serienstream.to/serie/we-bare-bears-bren-wie-wir | YouTube Cartoon Network Deutschland (Verified):<br>• *Wir und die Mall*: https://www.youtube.com/watch?v=9vTRSk7Xunc<br>• *Eine exklusive Tour*: https://www.youtube.com/watch?v=5IOr1S1rQJE | **S1 mục 3: Wir und der Imbisswagen / Food Truck** *(kèm kiểm tra song song clip chính thức `Wir und die Mall`)* | `needs-media-and-reviewed-captions` |
| 2 | **SpongeBob Schwammkopf** (*SpongeBob SquarePants*) | https://serienstream.to/serie/spongebob | *(Chưa có trong ghi chú)* | **S1 mục 1 gộp Aushilfe gesucht / Meeresbodenpflege / Experten** *(dự phòng: S1 mục 5 gộp Pizza-Heimservice / Heimat, süße Ananas)* | `needs-media-and-reviewed-captions` |
| 3 | **Die Pinguine aus Madagascar** (*The Penguins of Madagascar*) | https://serienstream.to/serie/pinguine-aus-madagascar | Paramount+ Đức (cần đăng nhập/thuê bao):<br>https://www.intl.paramountplus.com/de/shows/the-penguins-of-madagascar/episodes/2/ | **S1 mục 1 gộp Popcorn-Panik / Blitz und weg** | `needs-media-and-reviewed-captions` |
| 4 | **Courage der feige Hund** (*Courage the Cowardly Dog*) | https://serienstream.to/serie/courage-der-feige-hund | *(Chưa có trong ghi chú)* | **S1 mục 1 gộp Eine Nacht im Katz Motel / Oma-Eintopf** | `needs-media-and-reviewed-captions` |

*(Ghi chú: Trong đợt kiểm tra của Codex, domain rút gọn `s.to` trả lỗi `502`, chỉ các URL `serienstream.to` ở bảng trên mở thành công).*

## 2. Giải thích mục gộp, host và transcript chưa có

- **Chưa xác nhận được tiếng Đức và phụ đề (`Sprache` trống):** Các trang catalog trên `serienstream.to` hiển thị host **VOE**, nhưng cột `Sprache` trong bản trích xuất bị trống. Do đó chưa đủ bằng chứng xác nhận bản phát có audio tiếng Đức chuẩn hay phụ đề đi kèm.
- **Vấn đề tập gộp & đánh số mục:**
  - *SpongeBob*, *Pinguine* và *Courage* đều gộp 2–3 tập ngắn trong một mục (ví dụ S1 mục 1). Khi lấy được video thực tế cần kiểm tra ranh giới thời gian giữa các tập con để cắt hoặc gắn chapter chuẩn.
  - Riêng *Courage der feige Hund* xuất hiện các mục ghi `[In Episode before]`, nghĩa là số thứ tự mục trên trang không đồng nghĩa với một file video độc lập.
- **Chưa có transcript & chưa kiểm tra phát/nhúng:** Các nguồn hiện mới dừng ở metadata. Hai clip YouTube của *We Bare Bears* chưa kiểm tra độ dài và khả năng nhúng tại Việt Nam; trang *Paramount+ Đức* của *Pinguine* khóa sau đăng nhập/thuê bao. Vì chưa có video thực và lời thoại được duyệt nên chưa đưa vào catalog học.

## 3. Chốt 1 tập đề xuất mỗi bộ để kiểm tra bước tiếp theo

1. **We Bare Bears – Bären wie wir:** Chốt **S1 mục 3: Wir und der Imbisswagen / Food Truck** trên catalog (hoặc ưu tiên thử nhúng trước clip chính thức **Wir und die Mall** — `https://www.youtube.com/watch?v=9vTRSk7Xunc` vì đã rõ mô tả chủ đề đi trung tâm mua sắm/gặp gỡ).
2. **SpongeBob Schwammkopf:** Chốt **S1 mục 1 gộp Aushilfe gesucht / Meeresbodenpflege / Experten**.
3. **Die Pinguine aus Madagascar:** Chốt **S1 mục 1 gộp Popcorn-Panik / Blitz und weg**.
4. **Courage der feige Hund:** Chốt **S1 mục 1 gộp Eine Nacht im Katz Motel / Oma-Eintopf**.

## 4. Danh sách gợi ý mở rộng (CHƯA XÁC MINH — Tách riêng)

Các bộ dưới đây chỉ nằm trong nhóm gợi ý tiềm năng, **chưa được kiểm tra link catalog, nguồn phát hay metadata tiếng Đức** trong đợt ngày 23/10/2026:
- **Gumball** (*Die fantastische Welt von Gumball*) — Chưa xác minh.
- **Phineas und Ferb** — Chưa xác minh.
- **Kim Possible** — Chưa xác minh.
- **Avatar** (*Avatar – Der Herr der Elemente*) — Chưa xác minh.

## 5. Hướng dẫn bước nhập kho theo kiến trúc `kino-data.js` hiện có

- **Chuẩn bị media & tách tập:** Xác nhận nguồn phát thực tế có audio tiếng Đức rõ ràng, tách ranh giới nếu là tập gộp và cấu hình nguồn video cho player của Kino.
- **Tạo file dữ liệu lời thoại `*-aligned.js`:** Biên tập lời thoại đã kiểm duyệt thành file script riêng theo mẫu hiện có (chứa mảng `*_ALIGNED_UTTERANCES` và `*_CAPTION_CUES` nếu tách riêng phụ đề hiển thị).
- **Đăng ký khóa phim trong `kino-data.js`:** Thêm `key: '<ten-file>-aligned.js'` vào object `files`, đồng thời bổ sung `case '<key>':` tương ứng trong hàm `cues(key)` (và `captions(key)` nếu dùng bộ caption cues riêng).
- **Gắn thẻ phim vào giao diện & kiểm thử:** Thêm mục chọn phim/chapter vào catalog UI để gọi `KinoData.select(key)` và kiểm tra tải lười (`load(key)`) kèm đồng bộ lời thoại.
