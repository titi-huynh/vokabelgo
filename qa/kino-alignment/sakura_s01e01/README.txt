SAKURA – TẬP 1 – BẢN ĐẦY ĐỦ, ĐỐI CHIẾU TẠI MÁY

Mở bài: http://localhost:3000/?kino=sakura
Xem 7 điểm đã rà và nghe trọn lời kết: /qa/kino-alignment/sakura_s01e01/review-needed.html

Nguồn video: Cardcaptor_S01E01_German_720p_AAC_WebRip_x264-TSP.mp4.
Trang nguồn đã kiểm tra: https://aniworld.to/anime/stream/cardcaptors/staffel-1/episode-1
Tệp tải từ trang Byse/Filemoon sau khi chị cho phép hoàn thành reCAPTCHA mới.
Phụ đề nội dung chính: hai tệp SRT Đức/Việt chị đã lưu trên máy.
Không tải transcript bên thứ ba. Không tải lại/đăng video lên dịch vụ công khai.
Tên tập bản Đức: Das geheimnisvolle Buch (bộ cũ Cardcaptor Sakura).

Video: H264/AAC, 960x720, 24000/1001 fps, 25:00.456875, 242449971 byte.
Giữ trọn OP, giấc mơ, nội dung chính, nhạc kết, Góc Kero và giới thiệu tập sau.
Remux faststart, không mã hóa lại hình/tiếng; giữ tệp gốc trong Downloads.
Bản ghi thử cũ lưu dự phòng tại tmp/sakura-source-check/recording-preview.mp4.
Lời kết Góc Kero: 24:18–24:29; có câu chào Tschüss, bis dann!
Không còn câu bị cắt giữa chừng ở cuối video bài học.

8 phần, 348 đoạn phụ đề, 258 đơn vị luyện nghe/viết, 24 thẻ từ vựng.
Giữ toàn bộ 315 mục SRT gốc trong dữ liệu bài học; ghép đoạn bị cắt giữa câu.
Bổ sung giấc mơ đầu tập, lời kết Góc Kero và toàn bộ lời giới thiệu tập sau.
Sửa các bản dịch nhầm người nói: dọn bát, mang pudding, lời cảm ơn và câu điều kiện.
7 điểm đã xử lý: phiên âm lời chào Hi / Di-hau thay Nihao; Unternimm was;
Konyanyachiwa; langärmlig / kurzärmlig; langärmlige; Bändern; ihr gut steht.
Hai câu chào cách điệu không phải câu tiếng Đức chuẩn vẫn giữ trong phụ đề xem,
không dùng để chấm chính tả. Nhạc Nhật cũng không đưa vào bài viết Đức.
Chấp nhận cả dạng từ điển langärmelig / kurzärmelig và biến thể không nối und
trong câu Verlier keine Zeit! Unternimm was!; các từ sai vẫn bị từ chối.
Chi tiết từng quyết định: seven-reviewed-lines.json; review-needed.html.

Đối chiếu ngôn ngữ và mốc hình/tiếng bằng faster-whisper small; dùng medium
kiểm tra độc lập các đoạn khó. Đây là đối chiếu bằng mô hình, chưa phải nghe
duyệt của người. Không gửi âm thanh lên dịch vụ AI ngoài máy.

188 đơn vị luyện được nới mốc ngoài theo từ khớp trong nhận dạng tại máy để
tránh hụt đầu/cuối câu. Toàn bộ mốc được chuyển sang video đầy đủ bằng +139.12s.
Đối chiếu 7 đoạn tiếng xuyên suốt video ở độ phân giải 10 ms: chênh lệch
139.11–139.12s, hệ số tương quan 0.974–0.997. Không cần đổi tốc độ.
Chi tiết: full-source-audio-alignment.json; full-source-frame-alignment.json.
Chi tiết: practice-boundary-alignment.json, recording-speech-samples.json,
focused-medium-review.json, additional-medium-review.json.

Âm thanh lời kết bản đầy đủ đo bằng earshot: -14.8 LUFS, đỉnh thực -3.2 dBTP,
0 mẫu clipping. Các số đo này không kiểm chứng nội dung lời nói.
full-source-medium-review.json, full-source-small-review.json và
full-source-final-review.json lưu đối chiếu các đoạn đầu/cuối, không thay nguồn
SRT của chị bằng các câu nhận dạng sai trong nhạc.

Tái tạo dữ liệu: python scripts/build-sakura-lesson.py
Tái tạo ảnh bìa: python scripts/build-sakura-posters.py
Tái tạo trang đối chiếu: python scripts/write-sakura-reviewed-page.py
Kiểm tra: npx playwright test e2e/kino-sakura.spec.js e2e/kino-frieren.spec.js e2e/kino-hans.spec.js e2e/kino-catalog.spec.js
