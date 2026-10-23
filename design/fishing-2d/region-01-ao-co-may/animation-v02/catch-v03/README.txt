MÈO CHỢ KÉO CÁ — BẢN DỰNG 2D v03
Ngày 2026-10-21. Trạng thái: đã dựng để xem, chưa có phản hồi duyệt của chị.

NÉT VẼ NƯỚC v04 — 2026-10-21
Chị muốn nền, đặc biệt là nước, sinh động như catfishing.mp4. Đã vẽ lại
lớp nền bằng built-in image_gen: assets/pond-water-v04.png. Tăng các mảng
đậm–nhạt hữu cơ, nét sóng cong thuôn, dải nước nông sáng, rong và đá chìm
thưa ở hai góc dưới. Giữ bố cục mặt ao rộng, mèo và bè đã có.
Prompt và nguồn: assets/pond-water-v04-prompt.txt. Nền cũ giữ nguyên
tại ../assets/pond.png và vẫn phục vụ cảnh chờ v02.
Trong cảnh động, gợn quanh bè đổi sang các cung cong đứt quãng, rõ hơn;
thêm bọt nhỏ nổi chậm và nét sáng động nhạt dần ở hai đầu. Giữ nhịp bè,
điểm chân mèo, đoạn kéo cá và bờ đứng yên trong lúc nước chuyển động.
Clip hiện tại: meo-cho-ao-co-may-water-v04.mp4, 12 giây, 30fps, không tiếng.
Các tên clip v03 bên dưới là những bản cũ được giữ để đối chiếu.

CẬP NHẬT DẬP DỀNH — 2026-10-21
Theo yêu cầu mới, mặt nước có sóng chậm và các vệt sáng trôi nhẹ.
Mặt ao dùng shader dịch chuyển rất nhỏ, giảm dần về 0 trước mép bờ;
bờ cỏ/đá/cây đứng yên. Bè nhô lên/hạ xuống khoảng 7 pixel nguồn và
nghiêng khoảng 0.7 độ, trôi ngang khoảng 3 pixel, nhiều nhịp chậm lệch pha.
Mèo, cần, sọt và lon mồi cùng theo một chuyển động gốc. Phao treo theo
cần sau khi câu; điểm cá rơi và mặt phẳng che phía trước sọt theo bè.
Sau mốc 7.6 giây, mèo giữ tư thế cuối nhưng nước/bè tiếp tục chuyển động.
Tạm dừng dừng cả hai đồng hồ; tua cho kết quả cố định. Giảm chuyển động
dừng sóng và bè. Không tạo hình hoặc đổi tài sản ảnh trong lượt này.
Clip mới: meo-cho-keo-ca-v03-water.mp4 — 12.000 giây / 360 frame /
30fps / 1280×720 / H.264 / không âm thanh; có thêm 4.4 giây xem bè nổi.
Clip 7.6 giây bên dưới là bản trước khi thêm sóng; giữ nguyên để đối chiếu.
Kiểm tra mới trong review/verification.json: ambientAfterCatch=true,
shorelineFixed=true; pause, tua, các nút và màn hình 390px đều qua.

XEM
http://127.0.0.1:3012/
meo-cho-keo-ca-v03.mp4 — 7.600 giây, 1280×720, H.264, 30fps,
228 frame, không âm thanh. Đây là clip xuất từ cảnh mới, không phải video mẫu.
Trang có phát lại, cá cắn câu, tạm dừng, tua và năm mốc tư thế để kiểm tra.
Cảnh chờ cũ được giữ tại ../idle-v02.html.

CHUYỂN ĐỘNG
0.00–1.12: mèo đợi, bè và phao nhấp nhô nhẹ; chuồn chuồn xa ghé ngang.
1.12–1.75: phao động, mèo nhìn xuống và cúi người lấy đà.
1.75–2.53: thân, vai và hai tay cùng tham gia kéo; chân giữ trên bè.
2.08–3.60: cá bật lên với nước bắn, đi một đường cong liên tục vào sọt.
3.06–4.00: dây rời cá; phao theo quán tính trở về cạnh cần, không đổi vị trí tức thì.
3.50–4.70: sọt nảy nhẹ, mèo nhìn sang và chớp mắt hài lòng.
4.70–5.16: quay về người chơi; giữ nụ cười tới cuối.

TẠO HÌNH VÀ CÁCH DỰNG
12 hình mèo liền thân mới, bám mẫu kem/caramel đã chốt: một mảng trên
tai phải nhân vật (trái người nhìn), đuôi caramel, khăn vàng, tạp dề sage.
Giữ bè khởi đầu, nhánh cây, sọt tre, lon giun; mặt ao rộng như cảnh v02.
Video chị cung cấp chỉ dùng tham khảo nhịp diễn; không đổi mèo sang nhân vật
trắng trong clip, không thêm buồm/cờ vào bè ban đầu.
Tài sản vẽ bằng built-in image_gen, prompt nguyên văn và nguồn ở
assets/generation-prompts.txt. Sheet giữ nguyên RGBA do công cụ trả về.

Runtime chọn từng cel liền thân, chuẩn hóa theo hai bàn chân. Mesh liên tục
dịch và xoay đầu như một khối; trọng số giảm qua khăn/thân. Không warp
từng mắt/miệng, không hòa mờ hai khuôn mặt, không dùng rig tay/chân v01.
Điểm cầm cần dùng cùng phép biến đổi với bàn tay; cá, phao, nước và sọt
cùng chạy theo một đồng hồ, tua lùi không làm sai trạng thái.

Đây là hoạt ảnh web 2D bằng tranh và mã, không phải file Rive/Spine/Blender.
Các nét biểu cảm thay theo cel, chưa phải rig cho mọi tư thế hoặc mọi góc
nhìn. Chưa ghép trò ôn từ vựng, phần thưởng, kinh tế cá hoặc âm thanh.
Chất lượng diễn xuất cần chị xem trên clip; kiểm tra kỹ thuật không thay
thế đánh giá thẩm mỹ của chị.

KIỂM TRA
verify-catch.cjs --video: qua. 23 mốc có ảnh review/frame-*.png.
Không lỗi JS, không lỗi tải tài sản; bỏ qua yêu cầu media bị trình duyệt
hủy bình thường (ERR_ABORTED), không bỏ qua lỗi mạng khác.
Pause giữ ảnh ổn định; tua tới cùng thời điểm cho cùng ảnh.
Nút cá cắn câu, tạm dừng, mốc tư thế hoạt động.
390px không tràn ngang; chế độ giảm chuyển động dừng ở hình cuối.
Đã xem ảnh trung gian, sửa hòa mờ hai hình và méo mặt trước khi xuất cuối.
FFprobe xác nhận 7.600 giây / 228 frame / 30fps / 1280×720 / chỉ video.
Bằng chứng: review/verification.json, desktop-pull.png, desktop-smile.png,
mobile.png, reduced.png và các frame rời.

CHẠY LẠI TỪ THƯ MỤC FLASH
python design/fishing-2d/region-01-ao-co-may/animation-v02/preview-server.py
node design/fishing-2d/region-01-ao-co-may/animation-v02/catch-v03/verify-catch.cjs --video
