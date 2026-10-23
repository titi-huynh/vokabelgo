# Mây — sửa chuyển động, 2026-10-23

Trang thử: http://127.0.0.1:3000/

Phạm vi: may-home-engine.js, may-home-game.js và test-may-home-engine.js. Không đổi index.html, file ảnh, CSS, bài học hoặc dữ liệu thưởng. Bản trước được sao lưu trong qa/may-movement-before-2026-10-23/.

Thay đổi:
- Lối đi nối ghế nghe-xem với bến qua khoảng đất bên phải, không vòng qua hiên. Dịch điểm dừng ra trước vật thể và chọn đường vào cầu tránh các cọc. Đường bến → ghế từ1027px còn305px.
- Tốc độ tối đa210px/s; tăng tốc và hãm trước khi đến đích; giảm tốc ở góc rẽ. Đổi đích giữ nguyên vị trí, dừng/hủy xóa hành động cũ.
- Chuỗi đi dùng hai pose bước sẵn có, không xen khung đứng. Chân neo tại mặt đất; nhún thân nhẹ thay cho nâng cả nhân vật. Đi ngang dùng lật pose; dừng quay về pose nhìn trước.
- Camera có vùng giữa để Mây di chuyển mà cảnh không kéo theo từng bước. Kéo ngắm vườn hủy bước đi, Hôm nay/Tìm Mây đưa khung hình về bé.
- Nhãn địa điểm không biến mất khi bé tới gần và được né sang bên nếu đè lên nhân vật.
- Cọc trước cầu được vẽ lại từ chính pixel nền để có che khuất chân khi bé đi phía sau. Đây là một vùng che khuất cục bộ, không phải toàn cảnh đã được tách lớp.
- Thanh điều hướng mở mục ngay; chỉ chạm địa điểm trong cảnh mới bắt đầu đi. Không còn yêu cầu đi xong mới vào mục bằng thanh điều hướng.

Kiểm tra:
- node test-may-home-engine.js:11 kiểm tra đạt, gồm đường liên thông, không đi vào vật thể tại vị trí bàn chân, không vòng nhà, tăng tốc/hãm, đổi hướng, đổi đích, hủy đích, đến đúng một lần, giảm chuyển động và click nước.
- node --check may-home-game.js đạt.
- Trình duyệt thực: chạm ghế từ bến → Mây đi rồi vào Kino; kéo cảnh giữa lúc đi → dừng và không mở mục cũ; thanh điều hướng vào Kino ngay; quay Hôm nay → bé đứng yên nhìn trước.
- Điện thoại390×844: không tràn ngang; nhãn Nghe&xem/Hồ cá không giao với vùng chạm Mây; hủy bằng Hôm nay rồi chờ vẫn ở today/idle/front. Khôi phục viewport mặc định sau kiểm tra.
- Không có browser error khi kiểm tra.
- SHA256 hai ảnh garden-background-flat-v3.png và may-sprites.png giống trước sửa.

Giới hạn:
- Atlas chỉ có pose nhìn phía trước; lật pose hỗ trợ trái/phải nhưng chưa có hoạt họa đi ngang/quay lưng đủ4hướng.
- Chưa phải điều hướng tự do trên toàn mặt đất. Các hành lang đi bộ được hiệu chỉnh theo ảnh hiện tại; camera chỉ theo ngang.
- Nhiều vật thể vẫn nằm trong ảnh nền. Che khuất cọc cầu không đồng nghĩa mọi cây/ghế đều là lớp riêng.
- Có lỗi URL cũ của Kino còn ?hub=kino sau khi bấm Hôm nay, quan sát trước khi thay đổi; không sửa hệ thống URL trong lượt chuyển động này. Dùng đường dẫn gốc / để mở vườn theo mục đã chọn.

Ảnh đối chiếu: qa/may-movement-mobile-2026-10-23.png và qa/may-movement-after-2026-10-23.png. Ảnh chỉ chứng minh bố cục/tư thế; chuyển động cần thử trên trang.
