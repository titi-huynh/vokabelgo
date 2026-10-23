THỬ TÁCH NỀN PEPPA BẰNG MÔ HÌNH UVR

Nguồn: video/Peppa_Wutz_Supermarkt.mp4, từ 00:11.000 đến 00:42.600.
Độ dài: 31,6 giây. Video gốc không bị sửa.

NGHE SO SÁNH
01-original.mp3: âm thanh gốc của cảnh.
02-background-listen-plus9db.mp3: nền UVR, tăng cố định 9 dB để dễ nghe.
04-scene-background-listen.mp4: hình cảnh gốc đi cùng bản nền tăng 9 dB.

BẢN CHƯA TĂNG ÂM LƯỢNG
02-background-uvr.wav và 02-background-uvr.mp3: nền do mô hình tạo ra.
03-removed-voice-uvr.wav: phần giọng và các âm thanh mô hình đã lấy ra.
01-original.wav: cảnh nguồn để tái lập thử nghiệm.
04-scene-background.mp4: cảnh với nền chưa tăng âm lượng.
scene-picture.mp4: hình cảnh không có âm thanh, dùng để ghép bản nghe thử.

PHƯƠNG PHÁP
Mô hình UVR-MDX-NET-Inst_HQ_4.onnx chính thức, chạy qua audio-separator
0.47.1 (dùng mô hình UVR và mã MDX kế thừa UVR; không điều khiển ứng dụng GUI).
Chạy tại máy bằng CPU, overlap 0.25, denoise bật. Tách mất 71,4 giây;
nạp mô hình và tách tổng 77,29 giây, không tính cài thư viện lần đầu.
Không tải cảnh phim lên dịch vụ. Không phát sinh phí API.
Không thêm nhạc/hiệu ứng mới hoặc ghép giọng AI.
Mã thử: scripts/try-peppa-uvr.py; môi trường: tmp/uvr-peppa-venv.
requirements-uvr-trial.txt ghi lại các phiên bản đã chạy.

KIỂM TRA
earshot chạy tại máy. Cùng đoạn 10 giây đầu, điểm nhận diện lời nói:
gốc 0.641, nền UVR 0.058. Điểm nhận diện nhạc: 0.579 -> 0.764.
Ở giây 10-20: điểm lời nói 0.64 -> 0.17 (số đầy đủ trong JSON).
Ở giây 20-31.6: điểm lời nói 0.94 -> 0.10.
Đây là điểm phân loại âm thanh, KHÔNG phải phần trăm lời thoại đã loại bỏ.
Kết quả gợi ý giảm được lời thoại; không chứng minh giữ đủ hiệu ứng,
không còn tiếng lọt, hoặc âm thanh đạt chất lượng lồng tiếng chuyên nghiệp.
Đặc biệt nhạc/hiệu ứng vốn nhỏ hơn lời thoại nên bản nền thô khá nhỏ.
Bản nghe tăng 9 dB chỉ thay âm lượng; vẫn giữ bản thô để đối chiếu.

GIỚI HẠN
Thử nghiệm tách hai phần giọng/nền, chưa tách riêng từng nhân vật.
Tiếng cười, tiếng kêu và một số hiệu ứng có thể bị đưa vào phần giọng.
Chưa tích hợp vào web. Chưa thu giọng học viên hoặc tạo video lồng tiếng.

processing-report.json: mô hình, hash, thời gian và đầu ra.
earshot-review.json: bằng chứng kiểm tra âm thanh tự động.
