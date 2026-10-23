# Trang chủ Đảo Nhà Mây tương tác — 22/10/2026

## Bản đang dùng: nét phẳng v3

Nền mới `garden-background-flat-v3.png` vẽ lại theo ảnh tham khảo 2D của chị: viền nâu, giấy kem, màu olive/jade, cảnh sân vườn đơn giản. Không còn toàn cảnh biển/đảo nổi hoặc công trình tạo khối. Nút giao diện cũng đổi sang màu giấy và nét viền. Giữ atlas gốc, thu chiều cao sprite từ 178 xuống 150 world px; đường đi và cửa nhà căn lại theo nền. Tắt sóng trang trí tự động ở các vị trí cũ. Các chức năng học tiếp tục dùng controller hiện có. Built-in image_gen; prompt nguyên văn ở `FLAT_V3_PROMPT.txt`. Các nền trước vẫn giữ riêng.

## Cập nhật mỹ thuật mềm và đơn giản v2

Theo hai ảnh tham khảo mới, nền đang dùng là `island-background-soft-v2.png`: một căn nhà nhỏ mái lá, màu mềm, sân/lối thoáng, giảm chi tiết gỗ đá và quầy cá. Nền cũ được giữ lại. Ba nhãn chính còn Học từ / Nghe & xem / Hồ cá; Nhà Mây và bảng hôm nay vẫn bấm được trong cảnh. Dừng chuyển động và Tìm Mây nằm trong menu dấu ba chấm. Nhân vật, tìm đường và các chức năng học giữ nguyên. Prompt tạo bằng built-in image_gen ở `SOFT_V2_PROMPT.txt`.

Địa chỉ chạy cùng ứng dụng: http://127.0.0.1:3000/

Trang chủ đã thay banner video bằng cảnh 2D có nhân vật độc lập. Canvas vẽ cảnh và sprite Mây; engine tìm đường trên các lối nối nhà, hiên, bến và sân. Có thể chạm đường để đi, kéo camera, chạm công trình/nhãn để đi tới và mở chức năng thật. Phím mũi tên/WASD dùng khi canvas có focus; Enter/Space chào Mây. Thanh điều hướng ở đảo cũng chọn điểm đến; nút học chính vào bài ngay.

Các điểm đến dùng controller hiện có:

- Nhà Mây → hồ sơ/biệt danh/người bạn đồng hành.
- Bến học từ → bắt đầu hoặc tiếp tục buổi học thật (`handleTodayPrimaryAction`).
- Vườn nghe xem → Kino.
- Bến cá → thư viện, tab hồ cá.
- Bảng hôm nay → dialog chứa tiến độ, chỉ số và các đường học hiện có.

Khi chuyển hub, dialog đóng và vòng vẽ dừng. Nền chuyển động có nút dừng; giảm chuyển động dùng chuyển vị trí tức thời cho tương tác. Ẩn tab reset mốc thời gian, tránh cộng bù thời gian khi quay lại. Nhấn điểm khác khi đang đi thay thế hành trình cũ. Nhãn gần Mây được ẩn để tránh che mặt; vẫn bấm được công trình hoặc dùng thanh điều hướng.

Chỉ vị trí, các điểm đã ghé và tùy chọn chuyển động được lưu trong `vokabelgo_may_home_v1`. Không cấp điểm học/cá/xu từ thao tác đi lại. Các hệ thống học, SRS, hồ cá tiếp tục thuộc app hiện có.

Tệp:

- `../../may-home-engine.js`: đường đi, phép chiếu vào lối, chuyển động theo delta thời gian.
- `../../may-home-game.js`: canvas, sprite, camera, input và các điểm mở hoạt động.
- `../../may-home-game.css`: giao diện đảo và dialog tiến độ; chỉ đổi bố cục chính ở hub hôm nay.
- `island-background.png`: nền đảo đã bỏ nhân vật, tạo bằng built-in image_gen từ concept trước.
- `may-sprites.png`: atlas PNG RGBA nền trong suốt 2×2, tạo bằng built-in image_gen dựa trên ảnh chuẩn. Các khung cắt được định nghĩa trong renderer để căn chân; đây là hoạt ảnh sprite đơn giản, chưa phải rig xoay nhiều hướng.
- `GENERATION_PROMPTS.txt`: prompt nguyên văn cho hai tài sản mới.

Nguồn tạo hình chuẩn vẫn là `../../artifacts_video/may-original-style-memory/May_original_reference.png`. Không đổi sang mẫu Muse A/B/C. Các pose chuyển động mới vẫn là chuyển thể từ ảnh gốc, không bảo đảm trùng từng nét.

Bản thiết kế cũ trong `design/may-world-v01-20261022/` vẫn là tài liệu tham khảo; game trang chủ mới chạy ở đường dẫn gốc `/`.
