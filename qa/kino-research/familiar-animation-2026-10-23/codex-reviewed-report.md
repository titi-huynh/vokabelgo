# Nguồn phim quen thuộc để bổ sung Kino — Codex đã duyệt

Ngày kiểm tra: **23/10/2026**, múi giờ Asia/Saigon. Antigravity tổng hợp hồ sơ; Codex mở và kiểm tra chéo các trang nguồn.

Đã tìm được **8 trang bộ phim**, gồm đủ **4 bộ chị yêu cầu**. Đây là hồ sơ nguồn chờ biên tập, **chưa thêm bài học phát được vào Kino**. s.to trả 502 ở lần thử; serienstream.to mở được.

| Ưu tiên biên tập | Bộ phim / trang nguồn đã mở | Tập đề xuất kiểm tra tiếp |
|---|---|---|
| 1 | [We Bare Bears – Bären wie wir](https://serienstream.to/serie/we-bare-bears-bren-wie-wir) | S1 mục 3: Wir und der Imbisswagen / Food Truck |
| 2 | [SpongeBob Schwammkopf](https://serienstream.to/serie/spongebob) | S1 mục 1 gộp Aushilfe gesucht / Meeresbodenpflege / Experten |
| 3 | [Die Pinguine aus Madagascar](https://serienstream.to/serie/pinguine-aus-madagascar) | S1 mục 1 gộp Popcorn-Panik / Blitz und weg |
| 4 | [Courage der feige Hund](https://serienstream.to/serie/courage-der-feige-hund) | S1 mục 1 gộp Eine Nacht im Katz Motel / Oma-Eintopf |
| 5 | [Die fantastische Welt von Gumball](https://serienstream.to/serie/die-fantastische-welt-von-gumball) | Chưa chọn tập |
| 6 | [Disney Phineas und Ferb](https://serienstream.to/serie/disney-phineas-und-ferb) | S1 mục 1: Die Achterbahn + Geburtstags(alb)träume |
| 7 | [Kim Possible](https://serienstream.to/serie/kim-possible) | S1 mục 1: Schwer verknallt / Crush |
| 8 | [Avatar - Der Herr der Elemente](https://serienstream.to/serie/avatar) | Chưa chọn tập |

Thứ tự 1–4 là đề xuất của Codex theo gu chị chọn và khả năng chuẩn bị bài; không phải xếp hạng chất lượng đã xem/nghe. Mức A2/B1 trong JSON là ước lượng biên tập, chưa đánh giá bằng âm thanh thực tế.

## Nguồn chính thức đối chiếu

- [We Bare Bears — Wir und die Mall](https://www.youtube.com/watch?v=9vTRSk7Xunc), kênh Cartoon Network Deutschland được xác minh trong kết quả web. Có thể kiểm tra trước cho chủ đề mua sắm/gặp gỡ; chưa đo thời lượng hay thử nhúng.
- [We Bare Bears — Eine exklusive Tour](https://www.youtube.com/watch?v=5IOr1S1rQJE), cùng kênh chính thức; chưa kiểm tra phát/nhúng.
- [Pinguine — Paramount+ Đức](https://www.intl.paramountplus.com/de/shows/the-penguins-of-madagascar/episodes/2/): danh sách tập đối chiếu tên; trang xem yêu cầu đăng nhập/thuê bao.
- Chưa xác minh nguồn chính thức cho SpongeBob và Courage trong đợt này. Việc có trang catalog không xác nhận quyền tải, lưu hay nhúng video.

## Điểm cần xử lý trước khi nhập kho

Các trang có tên tập tiếng Đức và biểu tượng host, nhưng phần ngôn ngữ trích xuất trống. Chưa xác nhận audio tiếng Đức, phụ đề hoặc khả năng phát. SpongeBob/Pinguine có mục gộp; Courage có mục `[In Episode before]`; Phineas und Ferb có mục `Dito`, nên phải kiểm tra tập trùng và ranh giới trên video thực.

Đợt nhập bài đầu tiên đề xuất We Bare Bears — **Wir und der Imbisswagen**, với clip chính thức **Wir und die Mall** là ứng viên kiểm tra khả dụng trước. Tiếp theo là SpongeBob — **Aushilfe gesucht**. Chỉ nhập khi có nguồn video phù hợp, nghe kiểm tra, lời thoại Đức–Việt căn giờ và duyệt, chia phần theo cảnh, từ vựng và poster.

Tích hợp theo cấu trúc hiện có: file `*-aligned.js` và lesson metadata; đăng ký `kino-data.js`, `KINO_VIDEOS`, `KINO_ALIASES`, `KINO_CHAPTER_DATA`, flashcards và media; kiểm tra catalog, video, phụ đề, tiến độ riêng và màn hình điện thoại. Chưa sửa runtime hoặc triển khai website trong đợt tìm nguồn này.

## Hồ sơ và kiểm tra

- `codex-reviewed-sources.json`: 8 bộ, đánh dấu 4 bộ được yêu cầu, thứ tự ưu tiên và trạng thái nguồn.
- `codex-verification.md`: bằng chứng Codex đọc trực tiếp trên web.
- `cli-draft/`: bản tổng hợp của Antigravity CLI.
- Đã kiểm tra JSON đọc lại được, đủ 8 ID/URL riêng, đúng 4 mục được yêu cầu và không đánh dấu nhầm video đã phát. Không chạy kiểm thử app vì không thay đổi runtime.
