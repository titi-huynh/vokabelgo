AO CỎ MAY — THỬ DÁNG NGỒI VÀ NHỊP CHỜ v02
Ngày: 2026-10-21, Asia/Saigon.

CẬP NHẬT: CHUỖI KÉO CÁ v03
Chị đã yêu cầu dựng tiếp theo clip mẫu và giữ tạo hình mèo của mình.
Trang chính hiện mở bản kéo cá mới, hồ sơ: catch-v03/README.txt.
Bản chờ v02 nguyên trạng được giữ tại idle-v02.html.
Các giới hạn về cảnh chờ dưới đây mô tả v02, không thay thế hồ sơ v03.

MẪU CHUYỂN ĐỘNG MỚI CHỊ CUNG CẤP
catfishing/catfishing.mp4 (6.8 giây) đã được khảo sát và gắn vào mục
Video mẫu chị chọn trên trang. Nguồn và sáu tư thế được lưu ở
../reference-catfishing/MOTION_REFERENCE.txt và six-keyposes.jpg.
Video trong mục tham khảo là nguồn chị đưa, không phải hoạt ảnh mới
đã dựng. V02 phía trên vẫn là thử idle; chuỗi kéo cá theo mẫu chưa xong.

MỤC TIÊU ĐƯỢC CHỊ ĐỒNG Ý
Sau khi từ chối bản v01 vì dáng/chuyển động thiếu tự nhiên, chị đồng ý
làm một đoạn 5 giây ngồi chờ–nhìn chuồn chuồn trước khi mở rộng.
Đây là bản thử tư thế và nhịp, chưa coi là chị đã duyệt chất lượng cuối.

XEM
http://127.0.0.1:3012/ — tab kết quả đã mở và giữ trong in-app browser.
ao-co-may-idle-v02.mp4 — 5 giây, 1280×720, H.264, 30 fps, 150 frame,
không âm thanh. Nút Xem lại phát một lần 5 giây, không lặp khách ghé liên tục.

KHÁC VỚI BẢN BỊ TỪ CHỐI
- Master pose bám cảnh v02 gốc: thân ngồi gọn, đầu sát khăn, hai tay ngắn
  ôm cần, chân đặt trên bè; hình vẽ giữ liền mạch.
- Không dùng các mảnh tay/chân rời kéo dài từ bản v01.
- Đầu nghiêng tối đa khoảng 1.3 độ qua mesh có trọng số, nối mềm vùng cổ;
  nhịp thân dưới một pixel nguồn. Tay, chân và cần không bị kéo tách khớp.
- Mắt dùng hình vẽ gốc. Keyframe mắt nhắm được đăng ký theo hai tâm mắt,
  chỉ thay vùng mắt bằng shader feather mask; các vùng khác luôn từ master.
- Mắt nhìn trước, đầu theo sau một nhịp ngắn, rồi trở về khi chuồn chuồn đi.
- Bè và phao dao động riêng nhẹ; dây nối đúng đầu cần. Đặt phao ngoài mép
  bè để dây không xuyên khúc gỗ. Chuồn chuồn nhỏ, đường bay cong và dừng
  lơ lửng ngắn gần ngọn cần.

PHƯƠNG PHÁP VÀ GIỚI HẠN
Đây là bản nghiên cứu WebGL với tranh raster, mesh liên tục và shader;
không phải tệp .riv hay dự án Spine. Chưa tạo rig Rive/Spine hoàn chỉnh.
Chưa có rig độc lập cho mọi khớp, thay góc nhìn lớn, giật cá, đứng dậy,
ngáp dài hoặc hệ thống từ vựng. Không dùng bản thử này làm bằng chứng rằng
đã hoàn thành chất lượng hoạt hình thương mại.
PNG nền sạch tái sử dụng từ bản trước; master pose và mắt nhắm tạo bằng
built-in image_gen. assets/generation-prompts.txt giữ nguyên prompt và
nguồn. Bản mắt nhắm bị công cụ đổi tỷ lệ toàn ảnh; chỉ vùng mắt đã được
căn theo hai điểm và dùng trong chuyển động, không thay toàn thân gây giật.
Không dùng Python để vẽ sửa/inpaint ảnh; Python chỉ dùng đo vùng mắt.

KIỂM TRA THỰC TẾ
- node --check scene.js: qua.
- verify-study.cjs: không lỗi JS/failed requests, 7 mốc thời gian desktop,
  mobile 390×844 không tràn ngang, pause giữ nguyên ảnh, tua tới cùng thời
  điểm cho cùng ảnh, OS giảm chuyển động ẩn đường bay và dừng bob/đầu.
- Đã xem ảnh neutral, mắt nhắm, nhìn khách ghé và bản điện thoại.
- Đã mở trong in-app browser thật và bấm Xem lại: đồng hồ chạy lại,
  nút đổi sang Tạm dừng và cảnh hiển thị bình thường.
- FFprobe xác nhận video 5.000 giây / 150 frame / 30fps / 1280×720,
  chỉ có stream video.
- Bằng chứng ở review/verification.json, scene-*.png, desktop-*.png,
  mobile.png, reduced.png.

CHẠY LẠI
python "design/fishing-2d/region-01-ao-co-may/animation-v02/preview-server.py"
Server hỗ trợ HTTP Range để tua video đến từng tư thế đúng thời điểm.
Kiểm tra video mẫu: node design/fishing-2d/region-01-ao-co-may/reference-catfishing/verify-reference.cjs
Đã xác nhận tua đến 3.2 giây, video dừng đúng mốc, không lỗi JavaScript.
Xuất clip: node design/fishing-2d/region-01-ao-co-may/animation-v02/verify-study.cjs --video
