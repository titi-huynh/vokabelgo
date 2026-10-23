# Anti — nhận bản sửa 0.2

Hãy dùng thư mục này như **bản sửa thử trên mã được xuất**, không phải lệnh ghi đè toàn bộ VokabelGo.

1. Giữ nguyên bản 0.1 và mọi thay đổi chưa commit. So sánh `changes.diff` với bản mới nhất đang có; nếu mã nguồn đã thay đổi, đối chiếu thủ công thay vì ghi đè.
2. Chạy thư mục bản sao bằng `node server.js`, cổng 3001. Không push, deploy, merge, seed DB hoặc thay menu thật.
3. Mở trên trình duyệt thực của chị: kiểm tra Tính từ/Động từ, Làm quen/Ván thường, gợi ý, GEGENTEIL và tay bài nhiều lá. Mục tiêu chính là thấy câu + bài + nút đánh cùng lúc, không bị thông báo che.
4. Chạy `npm test`, kiểm tra console/network. `package.json` trong gói chỉ dành cho preview độc lập, **không thay package.json của repo chính**. Tương tự với `server.js` và README.
5. Nếu đưa về nhánh preview trong repo, nhận các thay đổi giao diện/engine có chủ đích; giữ routing/asset tương thích với bản hiện tại. Không import CSS toàn cục này vào trang chính.
6. Hai bộ dữ liệu và chính sách bot được giữ nguyên. Không tự tuyên bố học liệu đã chuẩn hoặc thêm AI chấm nghĩa. Cần kiểm tra câu/độ khó riêng trước khi mở cho học viên.
7. Bản 0.2 thêm chế độ Làm quen; đây là thay đổi được ghi rõ, không đổi quy tắc Ván thường. Không thêm chỉ sẵn mọi lá hợp lệ, thưởng, tiền tệ hoặc màu nhận diện nhóm đồng nghĩa.
8. Gửi ảnh và kết quả kiểm tra **từ môi trường chạy của chị**. Gói hiện đã thử trên Chromium headless; chưa kiểm trên thiết bị của chị hoặc production.

## Chỗ cần đặc biệt giữ

- GEGENTEIL: mục tiêu hiệu lực khác lá vật lý trên cùng, hiển thị đúng từ mới và vẫn giữ tổng 60 lá.
- Chọn màu: hủy không mất lá; chưa chọn màu thì engine không được mutate ván.
- Mở luật/gợi ý/xem từ: thật sự tạm dừng bot, không chỉ che UI.
- Restart/exit: hủy timer, callback và âm thanh cũ.
- Giữ nghĩa trợ giúp riêng với kết luận nhớ từ. Thống kê thắng/thua không chấm trình độ.
- Kiểm vuốt thực tế trên điện thoại và màn hình nhỏ: không vuốt thành đánh bài.

Chưa triển khai website chính cho đến khi chị thử và xác nhận trải nghiệm mới ổn hơn.
