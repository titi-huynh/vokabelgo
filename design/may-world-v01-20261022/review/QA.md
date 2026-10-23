# Kiểm tra bản concept — 22/10/2026

Thực hiện bằng trình duyệt Chrome qua cua_repl và kiểm tra cú pháp Node, không dùng screenshot hoặc báo cáo cũ thay cho lần kiểm tra này.

- `node --check design/may-world-v01-20261022/world.js`: đạt.
- Máy tính: mở được cả 4 tab; cảnh và Mây hiện trên màn hình đầu; không tràn ngang trang.
- Bấm Nhà Mây → hộp chi tiết → Hồ sơ Mây: đạt.
- Đối chiếu ảnh gốc: mở/đóng dialog hoạt động.
- Tab Hải trình và Hồ Trăng Rơi: hiển thị đúng mô tả vùng 18.
- Luồng đúng ngay lần đầu: kết quả độc lập 1, trợ giúp 0.
- Luồng chọn sai → xem sửa → thử lại đúng: kết quả độc lập 0, trợ giúp 1.
- Luồng dùng gợi ý → chọn đúng trên điện thoại: độc lập 0, trợ giúp 1.
- Điện thoại 390×844: trang không tràn ngang; khung đảo cuộn ngang nội bộ, canh Mây gần giữa; Mây nhìn thấy ngay trong màn hình đầu. Nút Gặp Mây mở được dialog.
- Ảnh hiển thị trong luồng học tải hoàn tất; không có log lỗi trình duyệt trong phạm vi quan sát.
- Đã trả viewport về mặc định và để tab ở Đảo nhà.

Ảnh chụp: `home-desktop.png`, `home-mobile.png`, `world-desktop.png`, `flow-assisted-desktop.png`.

Giới hạn: kiểm tra prototype tĩnh; chưa kiểm tra ngôn ngữ đầy đủ với người biên tập Đức, screen reader, animation thật, SRS, backend, thưởng game hoặc triển khai công khai. Không có nội dung học hoặc phần thưởng thật được ghi bởi prototype này.
