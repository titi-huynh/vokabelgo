# Năm bộ A1–A2 bổ sung cho Kino — 26/10/2026

Mỗi bộ có **một tập/bài đầu tiên**, tổng cộng **160 câu Đức–Việt, 69 thẻ từ, 15 phần học và 97 câu trọng tâm có tình huống sử dụng**.

| Bộ | Tập/bài | Link trong web | Video | Phần | Câu | Thẻ |
| --- | --- | --- | --- | --- | --- | --- |
| Bobo Siebenschläfer | Bobo im Bad | `/?kino=bobo-im-bad` | 7:00 | 3 | 35 | 16 |
| Meine Freundin Conni | Conni hilft Papa im Garten | `/?kino=conni-garten` | 11:30 | 4 | 52 | 16 |
| Meine Schmusedecke | Der Bär | `/?kino=schmusedecke-baer` | 3:21 | 2 | 22 | 12 |
| Nicos Weg | Hallo! · Bài 1 | `/?kino=nicos-hallo` | 1:37 | 3 | 18 | 10 |
| Erste Wege in Deutschland | Im Bus | `/?kino=goethe-bus` | 7:40 | 3 | 33 | 15 |

Các video là bản đầy đủ của **tập/clip bài học mà nhà phát hành đăng**, không phải toàn bộ mùa phim hoặc toàn bộ phim Nicos Weg. Lời thoại dùng cho Kino được chọn lọc; không gắn nhãn là phụ đề toàn tập. Mức A1–A2 của hoạt hình là đề xuất biên tập; Nicos Weg/Goethe có định hướng trình độ từ nguồn giáo dục.

## Nguồn và kiểm tra nội dung

- [Bobo im Bad — KiKA/WDR](https://www.kika.de/kikaninchen/bobo-siebenschlaefer/videos/bobo-im-bad-110): video Đức gốc, KiKA không cung cấp tệp phụ đề có nội dung. Đối chiếu ASR small/medium, kiểm tra base theo đoạn và khung hình. Bỏ lời chưa chắc và nhạc. Bài luyện ưu tiên sinh hoạt, đánh răng, rửa tay; thay hai câu có từ ghép/từ tưởng tượng dài bằng câu trả lời ngắn.
- [Conni hilft Papa im Garten — KiKA/ZDF](https://www.kika.de/kikaninchen/meine-freundin-conni/videos/conni-hilft-papa-im-garten-104): 52 lượt thoại chọn từ 191 cue phụ đề Đức chính thức, giữ mốc gốc và bản đồ cue. ASR chỉ kiểm tra chéo bốn đoạn ngắn. Shortlist ưu tiên câu hỏi, lời nhờ và phản hồi ngắn; các câu giải thích dài vẫn có thể xem trong danh sách lời thoại.
- [Der Bär — KiKA/rbb](https://www.kika.de/kikaninchen/unser-sandmaennchen/videos/extras/schmusedecke/meine-schmusedecke-der-baer--unser-sandmaennchen-100): không có phụ đề chính thức; đối chiếu small/base/medium và hình ảnh. Giữ lời kể rõ, bỏ bài hát và lời chưa chắc.
- [Hallo! — DW](https://www.youtube.com/watch?v=dC6ZGLzdaTs): dùng phụ đề Đức do nhà phát hành tạo; giữ các lời chào lặp lại ở đúng vị trí, nhưng không chọn chúng hai lần trong shortlist. Bỏ phản ứng phi từ vựng, không luyện tên đường. Nhận dạng tự động cục bộ xác nhận tiếng Đức `de`, xác suất `0.998908`.
- [Im Bus — Goethe-Institut](https://www.youtube.com/watch?v=PMj9kUPrnBk): nguồn kênh Goethe-Institut đã xác minh, video unlisted được phát hành qua liên kết. Dùng phụ đề Đức có sẵn và đối chiếu hai PDF transcript chính thức. Không dùng hai bản reupload tìm thấy trong bước nghiên cứu. Khoảng không có thoại trong PDF không được điền thêm lời hoặc đoán mốc thời gian.

Mỗi thư mục `qa/kino-alignment/{key}_20261026/` có `lesson-content.json` làm đầu vào biên tập chính thức, `source.json`, bằng chứng ngôn ngữ/phụ đề, khung hình và quyết định biên tập. Không dùng đầu ra ASR hoặc bản xem trước ghi đè bản duyệt. Chưa có người bản ngữ duyệt nghe toàn bộ; không coi số đo âm lượng/xác suất ngôn ngữ là xác nhận chính tả tuyệt đối.

## Tích hợp và media

- MP4 thật được lưu bằng Git LFS và thêm thành **năm asset mới** vào `titi-huynh/vokabelgo-media`, release `media-v1`, theo redirect hiện hành. `published-media.json` ghi ID, số byte, SHA-256 và kiểm tra HTTP 206; không thay thế asset cũ.
- Builder hỗ trợ `isExcerpt:false` cho video bài học/tập đầy đủ; mặc định của các clip cũ vẫn là `true`.
- Đăng ký alias, metadata, lazy captions, dropdown, flashcard deck, tình huống luyện tập và cache URL cùng nhau. Các bài có ID và khóa tiến độ riêng.
- Có công việc **Erdmännchen – Luftgehen** đang được làm song song trong workspace. Phần đó được giữ nguyên. Bản thay đổi của năm bộ này được chuẩn bị riêng từ `da45a8f4`, không gom các thay đổi dở dang hoặc file untracked khác vào commit. Vì vậy workspace kiểm thử có thể có 32 bài; riêng bản commit năm bộ này có 31 bài.

## Phân công

Ba tác vụ riêng chuẩn bị Bobo, Conni và Schmusedecke. Antigravity lấy được nguồn video/phụ đề Goethe nhưng cầu nối CLI hết thời gian chờ 600 giây; một tác vụ đã hoàn thành tiếp tục biên tập từ đúng dữ liệu có sẵn, không tải lại. Codex làm Nicos Weg, duyệt shortlist, tích hợp, xuất bản media và kiểm tra cuối.

## Dựng và kiểm thử

```powershell
python scripts/build-kino-short-lessons.py qa/kino-alignment/bobo_im_bad_20261026/lesson-content.json qa/kino-alignment/conni_garten_20261026/lesson-content.json qa/kino-alignment/schmusedecke_baer_20261026/lesson-content.json qa/kino-alignment/nicos_hallo_20261026/lesson-content.json qa/kino-alignment/goethe_im_bus_20261026/lesson-content.json
node scripts/build-kino-metadata.cjs
npm run test:unit
npx playwright test e2e/kino-beginner-series.spec.js e2e/kino-catalog.spec.js --trace off
```

Kết quả cuối cùng ghi ở `verification.json` cạnh báo cáo này. Kiểm thử trình duyệt cục bộ dùng cổng riêng khi máy chủ dùng chung bị gián đoạn bởi tác vụ khác; không sửa cổng chạy web của chị.
