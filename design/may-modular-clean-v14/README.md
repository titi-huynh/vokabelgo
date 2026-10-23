# Mây v14 — bộ ảnh tách lớp và bản xem tương tác

Mở bản xem: http://127.0.0.1:3000/design/may-modular-clean-v14/index.html

## Nguồn và cách tạo
- Nền và sáu đồ vật do Muse/Toto tạo. Nền là một lượt edit từ v10; sáu món tạo độc lập, không cắt lại phần bị lem ở v13c.
- Muse dùng PIL/NumPy có sẵn để tách nền magenta thành alpha thật. Không cài lại rembg. Bản raw và script của Muse nằm trong ZIP gốc; Codex không chạy script từ ZIP.
- Mây dùng lại nguyên file assets/may-home-game/may-sprites.png của dự án. Đọc đúng ô trên trái theo nửa kích thước atlas thực 1254×1254, không tạo Mây mới.
- Prompt đầu: MUSE_BRIEF.txt. Các yêu cầu tiếp: MUSE_CONTINUATION.txt. Báo cáo và brief của Muse giữ ở MUSE_manifest.json, MUSE_BRIEF.md.
- May_modular_clean_v14.zip là gói gốc tải từ Muse, gồm 7 PNG, raw, manifest, brief và keyout.py; không chứa bản xem web hay sprite Mây.

## Kiểm tra đã thực hiện
- prepare_assets.py xác minh đủ 7 ảnh Muse và sprite dùng lại; sáu đồ vật là PNG RGBA với 62–83% pixel trong suốt, không phải nền ô vuông vẽ vào ảnh.
- Đã mở kiểm tra các vật và xem bảng/đệm trên nền tối, sáng. Không chỉnh sửa hay tái mã hóa các PNG sau khi nhận.
- Đã thử kéo đệm bằng con trỏ, dịch bảng bằng nút và phím mũi tên, đặt lại, đổi nền kiểm tra, phóng to và bật/tắt lớp nền.
- Kiểm tra responsive 390×844: không tràn ngang. Đã khôi phục kích thước trình duyệt mặc định.
- Node syntax check đạt. Trình duyệt không báo lỗi/warning lúc kiểm tra.
- Nền giữ nguyên SHA256: 65204b716f0ce089fc6df8c98700693ed150dcc1ce2bd9596e0151f402e78d48.
- PREVIEW_DESKTOP.png, PREVIEW_MOBILE.png là ảnh chụp bằng trình duyệt, không phải hình minh họa thay thế.

## Giới hạn
- Đây là bản duyệt mỹ thuật/bố trí, chưa nối tới các bài học, chưa thay trang chủ.
- Nền vẫn có chất giấy nhẹ từ phong cách v10; không tuyên bố toàn cảnh đã thành vector hoặc sắc nét ở mọi mức phóng.
- Bè có bảy thanh tre, lá ở nhánh phụ gần giữa cần; hình dáng một số món được vẽ mới nên không trùng từng pixel với v13c.
- Mỗi PNG chỉ được vẽ lên canvas khi hiển thị. Di chuyển không đưa nền qua AI và không ghi lại ảnh nền. Vị trí trở về mặc định khi tải lại trang.
- Bè đã được đặt trên nước bên trái cầu, không có ván nối; bảng nằm bên phải Mây và tách khoảng rõ.
