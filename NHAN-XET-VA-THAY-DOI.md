# Nhận xét bản 0.1 và bản sửa 0.2

**Nguồn:** `dau-tu-review.zip` người dùng gửi, gồm mã chạy, README, 10 ảnh và một video. Phân tích dưới đây dựa trên việc đọc mã, xem ảnh và thực thi bản đóng gói, không phải truy cập máy localhost của người dùng. Bản 0.2 nằm ở một thư mục khác; không thay production.

## Kết luận

Bản đầu có một số luật hoạt động đúng, nhưng đường thao tác còn bị bố cục cản trở: vùng đối thủ/chồng rút chiếm nhiều chỗ; gợi ý làm trang dài thêm; nút đánh có thể rơi xuống dưới; thông báo nổi che bài. GEGENTEIL còn khiến hình lá vật lý trên bàn khác từ mục tiêu mà người chơi cần nối, nhưng giao diện chưa nhấn đủ sự khác nhau đó.

Đây không chỉ là lỗi người triển khai. Đặc tả ban đầu cũng yêu cầu nhiều thành phần và nhiều xác nhận cùng lúc, kèm rút phạt ngay khi chưa hiểu luật. Vì vậy bản sửa có cả sửa mã và một lựa chọn hỗ trợ mới được ghi rõ.

## 1. Những gì đã kiểm tra được ở nguồn

### Bố cục kéo nút khỏi màn hình

Ở lượt cố định seed 20, người dùng đi trước:

| Khung thử | Bản đầu | Bản sửa |
|---|---|---|
| 1280×720 | Nút đánh bắt đầu ở khoảng y=715, kết thúc ở y=763; phần lớn nằm dưới khung nhìn. | Nút đánh nằm trong khoảng y=661–707. |
| 1280×720, mở gợi ý | Vị trí đầu nút xuống khoảng y=832. | Gợi ý mở trong cửa sổ giới hạn chiều cao, không thay bố cục bàn. |
| 390×844, mở gợi ý | Vị trí đầu nút xuống khoảng y=897. | Nút đánh vẫn nằm trong khung màn hình sau khi đóng trợ giúp. |

Số đo là kết quả một tình huống kiểm thử, không phải mọi độ phân giải hoặc mọi thiết bị. Chi tiết: `qa/original-audit.json`, `qa/browser-v02-results.json`. Ảnh đầu vào cũng cho thấy phần dưới của bàn/nút bị thiếu và thông báo che bài.

### GEGENTEIL chưa hiện đúng ưu tiên thị giác

`dau-tu.js` nguồn dựng giữa bàn từ `state.physicalTopCard`. Engine thay `activeEntryId` khi dùng GEGENTEIL, nhưng lá giữa bàn vẫn chỉ là lá chức năng. Bản sửa giữ lá vật lý trong engine, còn vùng **Từ đang nối** thể hiện mục tiêu hiệu lực mới và nhãn “GEGENTEIL · Đã đổi nghĩa”. Không thêm lá thứ 61 vào ván.

### Mở cửa sổ không tạm dừng máy

`openModal` nguồn chỉ sửa class/aria. `scheduleBotTurn` không kiểm tra cửa sổ đang mở; một số callback chờ trong xử lý sai còn không được quản lý cùng timer của bot. Bản sửa dùng một lịch bot có kiểm tra ván/lượt, dừng khi dialog mở và khi tab ẩn; thoát/restart tăng ID phiên và hủy tác vụ.

### Lệnh Đổi màu chưa hoàn tất làm hỏng trạng thái

Hàm validate cho phép lá Đổi màu mở bộ chọn mà chưa có màu. `executePlayCard` nguồn vẫn lấy lá khỏi tay trước khi truy cập tên màu, gây lỗi và để lại màu không xác định nếu được gọi lúc chưa chọn.

Đã tái hiện ở mức gọi engine, không khẳng định người dùng đã gặp lỗi này qua nút bình thường. Bản sửa chặn trước mọi thay đổi; hủy bộ chọn không làm mất bài. Chi tiết nằm trong `qa/original-audit.json` và test bổ sung.

### Tô sáng chữ Đức dùng ranh giới ASCII

Nguồn dùng `\b` để tô từng token. Bản sửa phân tách theo chữ Unicode rồi dùng token có sẵn trong nguồn, nên có thể tô `öffne` và hai phần `mache … auf` đúng vị trí. Không viết lại câu bằng thay thế chuỗi.

## 2. Các thay đổi trải nghiệm đã làm

1. Thu gọn phía đối thủ; một hướng dẫn theo lượt cho biết màu/từ mục tiêu.
2. Câu, nghĩa theo yêu cầu và mục tiêu đặt cạnh nhau; chồng rút lớn được thay bằng nút Rút 1 lá cạnh nút đánh.
3. Hàng phản hồi riêng không đè lên thẻ. Màu hợp lệ không được gắn nhãn đồng nghĩa.
4. Tay bài cuộn ngang, chữ không bị bóp nhỏ để nhét 12 lá cùng lúc.
5. Nút ghi rõ từ đang đánh. Vẫn cần chọn rồi xác nhận, tránh đánh nhầm khi vuốt.
6. Gợi ý hai bước giữ nguyên tinh thần; xem lá hiện nghĩa ngay khi được yêu cầu, không thêm bước mở nghĩa thừa.
7. Nhãn chức năng ưu tiên tác dụng tiếng Việt, giữ tên Đức; không thêm lá mới.
8. Thêm **Làm quen**: người dùng đi trước, sai được thử lại. **Ván thường** giữ hình phạt nguồn. Đây là lựa chọn cách hỗ trợ, không phải Dễ–Trung bình–Khó về từ vựng.
9. Bỏ tải font từ mạng; chữ hệ thống rõ, không phụ thuộc font ngoài để chơi.

## 3. Những gì chưa đổi hoặc chưa được xác nhận

- Bộ từ, cạnh đồng nghĩa/trái nghĩa và chính sách bot giữ nguyên từ nguồn (đối chiếu SHA-256).
- Dữ liệu nguồn ở `dau-tu-data.js` dòng 496–518 có cặp mở cửa sổ “am Morgen” và đóng “am Abend”. Đảo nghĩa ở đây thay cả thời điểm. Việc này cần học thuật xem lại; không âm thầm thay nguồn khi đang sửa UI.
- Chưa kiểm chứng toàn bộ ghi chú từ điển, sắc thái, độ tự nhiên hoặc mức CEFR của từng từ.
- Chưa chứng minh luật đủ hấp dẫn. Trong 200 ván thuật toán, số nước đi chỉ dựa vào màu còn cao; đó là tín hiệu để thử với người thật, không phải bằng chứng game thất bại hoặc hiệu quả.
- Mô phỏng bot-vs-bot không tương đương trải nghiệm người học. Bộ 60 lá và luật chính chưa được cân bằng bằng nghiên cứu người dùng.
- Chưa kiểm trên thiết bị thật của người dùng, Safari/Firefox, hoặc website production.

## 4. Bằng chứng kiểm tra bản 0.2

- 21 kiểm tra nền chạy đạt sau khi sửa 3 tình huống test không hợp lệ (hai tình huống tạo trùng ID và một tình huống cố phạt lá có thể hợp lệ).
- 15 kiểm tra bổ sung, trong đó có 200 ván mô phỏng hoàn tất; không coi ván vượt giới hạn là hoàn tất.
- 30 tình huống thao tác/bố cục Chromium đạt trong lần chạy ghi log: 15 thao tác và 15 tổ hợp kích thước/tay bài.
- Hai ván giao diện hoàn tất, mỗi bộ một ván, với nhịp bot được đẩy nhanh bằng hook QA; không đổi bài/luật trong ván.
- Vuốt bằng sự kiện chạm giả lập cuộn được tay bài mà không chọn nhầm lá.
- Bản một-file chạy được trong trang Chromium, không export QA mặc định, không gọi tài nguyên mạng; bảng mẫu có 10 mặt trước và một mặt sau.
- Server cục bộ trả đúng HTML/CSS/JS và chuyển route /preview/dau-tu sang URL chuẩn.

**Giới hạn phương pháp:** trình duyệt môi trường này bị chặn điều hướng localhost/file. Do đó phần mềm được chạy từ cùng mã HTML/CSS/JS nhúng nguyên vào about:blank; không phải kiểm điều hướng HTTP đầu-cuối. HTTP đã được kiểm riêng. Không gọi đây là chứng nhận khả năng truy cập, kiểm tra độc lập hoặc sẵn sàng production.

## 5. Cách quyết định tiếp

Cho người dùng thử bản **Làm quen** trước. Ưu tiên kiểm xem họ có nhận ra màu/từ đang nối, chọn/đánh không phải tìm nút, dùng GEGENTEIL vẫn biết nước tiếp theo, và khi sai không thấy bị phạt trước khi hiểu.

Chưa thêm hiệu ứng hoặc luật nếu những thao tác nền còn gây lúng túng. Khi trải nghiệm được chấp nhận, xử lý riêng chất lượng bộ từ và phân loại Dễ–Trung bình–Khó.
