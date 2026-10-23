TEACH ME — DEMO BẤM THỬ v0.1
Ngày 22/10/2026

Cập nhật lời thoại v0.2: Zehn xưng Zehn, gọi người học là bạn; hỏi từng điều,
phản hồi theo ý vừa nghe, hỏi gợi mở trước khi cho mẫu. Xem GIONG-NOI-MAY.txt.

Mở thử trên máy này:
http://127.0.0.1:3000/design/teach-me-v01/demo/index.html

Có thể mở index.html trực tiếp bằng trình duyệt nếu máy không chạy server.
Giữ nguyên vị trí thư mục để hình Zehn tại assets/may-home/may-original.png tải được.

PHẠM VI
- Hai bài mẫu: giải thích và dùng weil; đọc hiểu Thứ Bảy của Lena.
- Đọc bài và bật/tắt bản dịch, dạy Zehn hai bước, gợi ý hai mức.
- Tối đa hai câu trả lời mỗi bước; xem mẫu và chuyển bước khi cần.
- Có câu mẫu để khám phá nhanh các nhánh, tính là có hỗ trợ.
- Để sau, giữ bản nháp và lịch sử gợi ý sau khi tải lại trang.
- Kết quả, lịch ôn đề xuất, lượt ôn bằng tình huống mới và nhật ký.
- Góp ý được lưu tại máy; không gửi cho giáo viên.

Đây là mô phỏng tương tác theo kịch bản, không kết nối AI hoặc chấm năng lực thật.
Chỉ một số cách diễn đạt được nhận diện. Câu ngoài phạm vi có thể được ghi
“chưa đủ cơ sở”, ngay cả khi người học đã trả lời đúng.
Học liệu minh họa chưa được duyệt cho sử dụng đánh giá thật.
Chưa có thu âm, chấm phát âm, đăng nhập hay đồng bộ nhiều thiết bị.

DỮ LIỆU
Chỉ dùng localStorage key may_teachme_demo_v1.
Không ghi vào tiến độ, streak hoặc lịch SRS của web chính.
Làm mới bản demo chỉ xóa dữ liệu của riêng demo trên trình duyệt này.
Các khoảng ôn 1/3/7 ngày là đề xuất thử nghiệm, chưa được kiểm chứng cho sản phẩm.
Nút thử lượt ôn mở ngay để xem workflow, không giả vờ thời gian đã trôi qua.

KIỂM TRA
Chạy: node design/teach-me-v01/demo/verify.cjs
Cần server của workspace trên cổng 3000 và Playwright đã cài.
Đã kiểm tra 1440x1000 và 390x844, các luồng chính, lưu/mở lại, giới hạn lượt,
kết quả có hỗ trợ, trạng thái chưa đủ cơ sở, lỗi lưu và không đổi tiến độ từ vựng.
Ảnh chụp trình duyệt thật nằm trong screenshots/.

Nguồn workflow: ../WORKFLOW.md
Không sửa trang chính hoặc tự triển khai lên web công khai trong lượt làm demo này.
