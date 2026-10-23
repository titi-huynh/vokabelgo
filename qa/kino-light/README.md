# Kino nhẹ hơn — 23/10/2026

Kino tải lời thoại của phim được chọn, giữ các thẻ từ vựng sẵn có, và mặc định phát bản 480p với âm thanh gốc. Người học có thể đổi sang bản gốc; vị trí, tốc độ phát, phụ đề, bản nháp và tiến độ được giữ lại.

## Số đo

- Dữ liệu bài học khi mở danh sách: **637.860 → 79.533 byte**, giảm **87,5%**. Chưa bấm phát: **0 byte video**. Đây là phần dữ liệu Kino, không phải toàn bộ trang.
- Tổng dung lượng 8 bản phát mặc định: **1.015,9 → 536,2 MB**, giảm **47,2%**. So với cả 8 tệp gốc: giảm **53,1%**. Các tệp gốc vẫn giữ riêng để chọn xem; dung lượng ổ đĩa không giảm vì có thêm bản phục vụ.
- Khung hình mốc: khoảng **1 giây**, khoảng cách lớn nhất kiểm tra được **1,001 giây**. Thời lượng bản xem lệch dưới 0,05 giây so với nguồn.
- **8/8 luồng âm thanh có SHA-256 khớp nguồn**; không mã hóa lại, lọc âm hoặc giảm bitrate tiếng.
- Đối chiếu earshot trên Frieren 123,58–139,58 giây: trước/sau cùng **−25,5 LUFS**, **−6,4 dBTP**, **0 mẫu clipping**. Đây là đối chiếu mức âm, không phải nhận định chủ quan về độ rõ lời của mọi cảnh.

## Tua câu ở mạng giả lập

Chromium cục bộ, phiên mới, 5 Mbps tải xuống / 1 Mbps tải lên, độ trễ 100 ms; một lượt trước và sau, không phải cam kết tốc độ trên điện thoại hoặc máy chủ thật.

| Phim / thao tác | Trước | Sau |
|---|---:|---:|
| Frieren, tua xa trong phần 1 | 1.351 ms | 291 ms |
| Frieren, tua đến câu giữa | 954 ms | 309 ms |
| Sakura, tua xa trong phần 1 | 347 ms | 288 ms |
| Peppa, tua đến câu giữa | 938 ms | 337 ms |

Không phải mọi thao tác đều nhanh hơn: một lượt tua xa Peppa đo 248 → 398 ms. Dữ liệu đã đệm, mạng và tải máy ảnh hưởng kết quả. Thời gian mở toàn trang vẫn khoảng 9 giây trong phép đo này; những phần khác của ứng dụng còn được tải cùng trang.

## Tệp và tái tạo

- `encodes.json`: kích thước, thời lượng, đối chiếu tiếng và khung hình mốc của từng phim.
- `browser-before.json`, `browser-after.json`: số đo mạng và thời gian tua.
- `audio-check.json`: đối chiếu mức âm bằng earshot.
- `visual-comparison.jpg`: mỗi phim một khung hình nguồn/bản nhẹ ở mốc 125 giây, đã kiểm tra tỷ lệ và bố cục; không thay cho kiểm tra mọi cảnh chuyển động.
- `unit-tests.txt`: kết quả các bộ kiểm tra Node.

Chạy `node scripts/build-kino-metadata.cjs` sau khi cập nhật bài học hoặc thẻ từ vựng. Chạy `python scripts/build-kino-light.py` để tạo các bản xem chưa có và kiểm tra lại tất cả tệp. Không ghi đè phim gốc. Khi thay nguồn phim, cần dựng lại bản xem tương ứng; script sẽ từ chối nếu âm thanh nguồn và bản xem không còn khớp.

Bộ kiểm tra form đã được cập nhật để đọc tệp metadata mới. Trong khi chạy kiểm tra Kino, sửa thêm ranh giới từ Unicode ở bộ chuẩn hóa số: tránh hiểu nhầm phần `drei` trong `dreißig`, giữ bài viết số bằng chữ và số bằng chữ số tương đương.

Kiểm tra toàn bộ 80 tình huống Kino: lượt đầu 77 đạt, 3 cần chạy lại. Đã sửa lỗi số tiếng Đức và vị trí menu tùy chọn sau khi đổi thứ tự tải; một lỗi ghi tệp trace do hai lượt kiểm tra cùng dùng thư mục đầu ra cũng đã được chạy lại riêng và đạt. Lượt xác nhận cuối nằm trong `final-checks.txt`; toàn bộ 18 bộ kiểm tra Node đạt trong `unit-tests.txt`.
