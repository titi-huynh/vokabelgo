# Mây và bảng táo — bản thử nét sạch v15c

Xem: http://127.0.0.1:3000/design/may-clean-may-board-v15c/index.html
Bản trước giữ riêng: http://127.0.0.1:3000/design/may-original-restore-v15/index.html

## Phạm vi
Làm sạch riêng Mây ngồi và bảng táo, tiếp theo hộp/kệ v15b. Nguồn trực tiếp là crop từ v15b, không dùng sprite Mây đứng hay bảng cao của v14. Bè/cầu, nhà/đệm, ghế/sách, bàn và hộp/kệ giữ nguyên.

Muse Image tạo hai PNG alpha lớn và một lượt vá cỏ ở vị trí hai vật cũ; canvas cuối được ghép bằng code trên pixel cũ, chỉ lấy hai miếng vá cục bộ. Muse báo một lần gọi vá bị dịch vụ gián đoạn không ra file, sau đó thử lại. ZIP raw và báo cáo gốc được giữ nguyên.

## Kiểm tra
- PIXEL_VALIDATION.json xác minh mọi pixel ngoài hai vùng Mây/bảng không đổi so v15b. Bè/cầu, ghế/sách, bàn, nhà/đệm và hộp/kệ đều trùng pixel.
- PNG Mây RGBA1584×1440, bảng RGBA1600×1600; đã kiểm tra alpha thật0–255.
- Đã xem toàn cảnh, xem cận nét, thử dịch Mây/bảng và đặt lại. Bè vẫn khóa vị trí. Browser không báo lỗi.
- Màn hình kiểm tra rộng726px, document711px: không tràn ngang. Không đổi kích thước trình duyệt để chụp đẹp.
- Node syntax check đạt. PREVIEW_v15c.png là screenshot trình duyệt.

## Giới hạn mỹ thuật
Đây là bản THỬ, chưa gọi là nét gốc đã được duyệt. Mây còn hơi tròn/to đầu hơn crop cũ, khăn rõ hơn, chân khác nhẹ. Bảng có quai nhỏ rõ hơn và thanh đáy dày hơn. Mắt vẫn bầu dục nâu nhỏ không điểm sáng/lòng trắng, đúng mảng lông trái cam/phải than, khăn xanh trước và dáng ngồi. Các thay đổi hình dáng này cần được xem cùng độ nét, không thể tuyên bố là giữ nguyên từng pixel của hai vật.

Bản trước không bị ghi đè hoặc đổi hướng sang bản thử này. Chưa thay trang chủ gốc hay kết nối bài học. Mây, bảng và hộp là các lớp tương tác; các chi tiết còn lại nằm cố định trong nền để giữ hình đã chốt.

## Nguồn và prompt
Muse/Toto; MUSE_MAY_BOARD_CLEAN_BRIEF_v15c.txt là yêu cầu thực tế. MUSE_MAY_BOARD_manifest_v15c.json và MUSE_MAY_BOARD_BRIEF_v15c.md là báo cáo gốc. May_clean_may_board_v15c.zip có raw, sprite, nền, ảnh cuối và manifest. Không dùng built-in ImageGen cho lượt này.
