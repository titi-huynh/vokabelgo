# Kiểm tra trang chủ game Mây

## Cập nhật nét 2D phẳng v3

- Nền `garden-background-flat-v3.png` và UI màu giấy/viền nâu đã hiển thị trên Chrome desktop và 390×844.
- Chạm giữa canvas: Mây đi từ ghế sang đường giữa (quan sát vị trí nút nhân vật và ảnh cuối); đồ thị đường đã căn lại theo nhà/sân mới.
- Bảng tiến độ mở/đóng đúng dữ liệu hiện có. Không trả lời bài hoặc ghi điểm trong kiểm tra.
- Mobile không tràn ngang: documentWidth = innerWidth = 390. Viewport đã reset.
- Cú pháp may-home-game.js, 7/7 kiểm tra engine và whitespace các file code sửa đều đạt. Không chạy lại bộ học cho lượt này.
- Ảnh: `flat-v3-desktop.png`, `flat-v3-mobile.png`. Nền và prompt lưu trong assets/may-home-game, các nền trước giữ riêng.

## Cập nhật nền mềm v2

- Đã gắn `island-background-soft-v2.png`, giữ nền cũ riêng; chỉ đổi hình và làm gọn nhãn/menu, giữ atlas Mây.
- Kiểm tra Chrome desktop và viewport 390×844: nền mới hiển thị, Mây hiện rõ, không tràn ngang (documentWidth = innerWidth = 390).
- Menu dấu ba chấm mở được; dừng/bật chuyển động cập nhật aria-pressed và tự đóng menu. Trạng thái cuối là bật chuyển động.
- Nút tiến độ mở đúng bảng hôm nay, đóng về cảnh game được. Đã trả viewport về mặc định.
- `node --check may-home-game.js` và 7/7 kiểm tra engine đạt; kiểm tra whitespace riêng index.html đạt. Không chạy lại các bộ học bên dưới cho thay đổi hình/CSS này.
- Ảnh kiểm tra: `soft-v2-desktop.png`, `soft-v2-mobile.png`.

Ngày 22/10/2026. Kiểm tra trên Chrome qua cua_repl và Node.

## Kiểm tra đã chạy

- 7 kiểm tra engine: mọi cặp điểm đi trên đường nối hợp lệ, đường cùng cạnh không đi vòng, mở điểm đến một lần, đổi đích không gọi đích cũ, giới hạn delta, dừng/giảm chuyển động, không coi mặt nước là đường đi.
- Bộ kiểm tra vòng học hiện có: 163/163 đạt.
- Bộ kiểm tra cấu trúc UX học hiện có: 31/31 đạt.
- Kiểm tra cú pháp các module mới và kiểm tra whitespace riêng `index.html`.
- Mây đi tới nhà, mở được hộp hồ sơ hiện có; đóng được mà không sửa hồ sơ.
- Mây đi tới bến, mở/tiếp tục đúng buổi học hiện có, thấy từ `die Körpersprache` và trạng thái 0/5; không tự trả lời hoặc ghi điểm học.
- Điểm nghe xem mở được Kino với bài thật; bến cá mở thư viện/hồ cá thực tế.
- Dialog hôm nay mở đúng dữ liệu hiện có và tự đóng khi chuyển từ đường dẫn trong dialog sang Kino.
- Nút dừng/phát hoạt động; trong chế độ dừng, chọn điểm đến vẫn mở chức năng tức thời.
- Bấm trực tiếp phần công trình trong canvas trên viewport điện thoại mở được Kino, không chỉ nhãn HTML.
- Điều khiển bằng phím và nút chào Mây phản hồi; camera theo nhân vật.
- Viewport 390×844 không tràn ngang trang; sau kiểm tra đã trả kích thước trình duyệt về mặc định.
- Không thấy lỗi console trong phạm vi quan sát các luồng trên.

## Phạm vi

Đây là trang chủ game 2D kết nối các module thật, chưa phải toàn bộ game 20 vùng. Tư thế đi dùng atlas 4 khung, góc nhìn cố định; chưa có rig bước chân/đổi hướng đầy đủ. Thao tác kéo camera đã triển khai bằng Pointer Events và được đọc soát; chưa thử cử chỉ kéo trên thiết bị cảm ứng vật lý. Chưa kiểm tra screen reader hoặc Safari.

Hai file smoke E2E đã điều chỉnh thao tác mở bảng hôm nay trước khi kiểm tra chỉ số. Không chạy bộ browser E2E bằng CLI trong lượt này; luồng giao diện được kiểm tra trực tiếp bằng cua_repl. Không coi việc sửa test là bằng chứng test đã chạy.
