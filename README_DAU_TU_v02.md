# Đấu từ — bản sửa thử 0.2

Bản sao chỉnh từ `dau-tu-review.zip` do người dùng gửi ngày 08/10/2026. Không triển khai lên Vercel, không sửa repo từ xa và không thay bản đang chạy trên máy người dùng.

## Chơi thử nhanh

**Cách 1 — không cần Node:** mở `CHOI-THU.html` bằng trình duyệt trên máy tính. Đây là một tệp tự chứa, có đầy đủ CSS, dữ liệu và JavaScript, không gọi dịch vụ chấm nghĩa.

**Cách 2 — chạy mã nguồn:** mở terminal trong thư mục này và chạy:

```sh
node server.js
```

Mở `http://127.0.0.1:3001/dau-tu.html`. Cổng mặc định **3001**, không trùng cổng 3000 của bản trước. Dừng bằng Ctrl+C. Không cần `npm install`.

Bảng mẫu: `http://127.0.0.1:3001/dau-tu-cards.html` hoặc bấm “Xem mẫu lá bài” ở màn chọn bộ.

Mở `CHOI-THU.html` trong cửa sổ xem trước của một ứng dụng chat/Drive có thể bị chặn JavaScript. Khi đó cần mở tệp đã lưu bằng trình duyệt hoặc dùng cách 2, không phải trò chơi đã chạy trên website chính.

## Đã đổi những gì

- Thu gọn khu đối thủ; đưa điều kiện đánh ngay trên bàn.
- Gom lá mục tiêu và câu vào một vùng. Sau GEGENTEIL, hiển thị **từ mục tiêu mới**; nhãn riêng giải thích nghĩa đã đổi, không giả tạo thêm lá vật lý.
- Nút Đánh/Rút/Giữ đặt sát hàng bài. Không phải cuộn xuống tìm nút sau khi mở gợi ý.
- Thông báo nằm trong hàng riêng, không nổi đè lên bài.
- Chọn một lá → nút xác nhận ghi “Đánh [từ]”. Giữ hai bước để tránh đánh nhầm khi vuốt.
- Gợi ý vẫn hai bước; cửa sổ có chiều cao giới hạn nên không kéo dài bàn. Chỉ một lá được chỉ khi người dùng yêu cầu, không tự đánh.
- Bấm “Xem lá” hiện nghĩa ngay; bỏ nút xác nhận xem nghĩa thừa.
- Hiện tác dụng lá đặc biệt bằng tiếng Việt, giữ tên Đức bên dưới.
- Bỏ font tải qua mạng, dùng chữ hệ thống. Sửa tô sáng từ mở đầu bằng ö/ä/ü và động từ tách.
- Máy tạm dừng khi người dùng mở cửa sổ; hủy tác vụ cũ khi thoát/chơi lại.

### Thay đổi luật có chủ đích, không thay âm thầm

**Làm quen** được chọn sẵn: người dùng đi trước, đánh sai được chọn lại, không rút phạt. Lần chọn lại được ghi nhận trong ván, không coi là tự nhớ đúng.

**Ván thường** giữ hình phạt bản trước: xác nhận lá không hợp lệ thì rút tối đa một lá trong lượt rồi chuyển lượt. Bên đi trước ngẫu nhiên.

Hai chế độ này là **cách hỗ trợ chơi**, không phải hai mức độ từ vựng. Cả hai vẫn dùng cùng các bộ 60 lá của nguồn, 5 lá khởi đầu và bốn loại chức năng. Chưa làm Dễ–Trung bình–Khó đầy đủ, multiplayer hoặc phân hạng.

## Học liệu được giữ nguyên

`dau-tu-data.js` và `dau-tu-bot.js` giữ nguyên nội dung từ gói đầu vào (có SHA-256 trong `qa/source-integrity.json`). Không âm thầm bổ sung, thay hoặc xác nhận lại nguồn từ điển.

Bản này **sửa trải nghiệm và lỗi trạng thái**, chưa phải kiểm duyệt học liệu hoàn chỉnh. Các nhãn mức Cơ bản và ghi chú “Duden” trong dữ liệu gốc không tự trở thành xác nhận CEFR hoặc chứng nhận của giáo viên. Cần người phụ trách học thuật kiểm tra lại câu, sắc thái và cặp trái nghĩa trước khi dùng để chấm việc học thật.

Lưu ý cụ thể từ dữ liệu gốc: nhóm mở/đóng cửa sổ dùng buổi sáng ở một phía và buổi tối ở phía kia. Vì vậy GEGENTEIL đang đổi cả thời điểm trong cặp đó, không chỉ động từ. Bản sửa không âm thầm đổi các câu này; xem `NHAN-XET-VA-THAY-DOI.md`.

## Kiểm thử

```sh
npm test
```

Gồm 21 kiểm tra nền và 15 kiểm tra bổ sung. Ba tình huống giả lập trong bộ test cũ đã được chỉnh để không tạo trùng ID hoặc cố phạt một lá thực tế hợp lệ. Bản test cũ nguyên văn nằm ở `qa/test-v01-original.txt` để đối chiếu.

`test-dau-tu-v02.js` chạy thêm 200 ván bằng thuật toán (100 mỗi bộ), kiểm tra bảo toàn ID và câu sau từng hành động. Đây không phải 200 người chơi, không đo hiệu quả học hay độ cuốn.

Thư mục `qa/` chứa JSON/log, ảnh chụp và các script kiểm tra giao diện. Python Playwright chỉ cần khi chạy lại kiểm tra giao diện; **không phải phụ thuộc để chơi game**. Đặt `CHROMIUM_PATH` nếu đường dẫn Chromium trên máy khác.

### Cách kiểm tra đã thực hiện và giới hạn

Môi trường kiểm tra chặn trình duyệt điều hướng `localhost` và `file://`. Vì vậy mã HTML/CSS/JS thực tế được nhúng nguyên vào một trang `about:blank` trong Chromium headless để chạy và kiểm tra thao tác. Server HTTP được kiểm tra riêng. Ảnh là ảnh chụp phần mềm chạy trong trình duyệt, không phải ảnh tạo bằng AI; một số ảnh sử dụng tình huống bài cố định và có ghi rõ.

Đã kiểm tra các khung 360×800, 390×844, 768×1024, 1280×720, 1440×900 với tay bài 5/8/12 lá. Kiểm tra vuốt là mô phỏng sự kiện chạm, **chưa thử trên điện thoại thật, Safari hoặc Firefox**. Không tuyên bố đạt toàn bộ WCAG. Hai ván giao diện hoàn tất có đẩy nhanh nhịp bot qua hook kiểm tra; bài và luật không bị thay trong lúc chơi.

## An toàn và tích hợp

- Không có .env, token, tài khoản hoặc dữ liệu học viên.
- Không kết nối Supabase/analytics/FSRS/thưởng/streak.
- Tùy chọn lưu trong tiền tố `vokabelgo:dautu:preview:v2:*`; không đụng khóa bản cũ.
- Máy chỉ nhận bài của nó và thông tin bàn công khai, không được truyền tay người chơi hoặc thứ tự chồng rút.
- Hook kiểm tra chỉ xuất hiện khi bật rõ `?qa=1` hoặc cờ test. Không bật trong lần chơi bình thường.
- CSS của gói này dành cho **trang preview độc lập**, không nhập thẳng vào stylesheet toàn web.
- `BAN-GIAO-ANTI.md` chỉ dẫn cách thử lại và nhận thay đổi trên nhánh riêng. Chưa đưa production.
