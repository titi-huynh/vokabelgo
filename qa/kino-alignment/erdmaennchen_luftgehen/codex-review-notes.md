# Ghi chú Codex trước nghiệm thu

Đã rà toàn bộ41picks và22cards bằng văn bản/ngữ cảnh; đã kiểm tra cấu trúc182cues. Xem anti-integration-brief.md để xử lý bản dịch, từ vựng, reviewNeeded và biên phần.

Điểm mới cần kiểm chứng audio độc lập: **cue3100120** ghi "Hast du was gesehen?" nhưng span478.12–479.40 trong raw chỉ chứa "du was gesehen?". Từ "Hast" của raw đặt tại457.70–458.22, cách các từ còn lại20giây. Muse không có bằng chứng raw để khẳng định đầy đủ câu ở478.12. Rà cửa sổ khoảng474–483s bằng model khác; nếu lời hỏi đầy đủ ởđó thì căn lại từđầu. Nếu không xác minhđược thì loại cảcâu khỏi runtime/đápán, giữ ghi chú. Không ghép một từ ở457s với câu478s thành đápán cóspan478s.

codex-raw-consistency.json chỉ là đối chiếu với CÙNG model Muse, không phải xác minh độc lập. Các edgeWords có thể đơn thuần là từ của cue bên cạnh chạm biên (điều kiện chọn window bao gồm mốc bằng nhau), không tự động là lỗi. Chỉ dùng để định vị đoạn cần rà; không tự sửa toàn bộ40flag. Các biến thể gibst/gib's cần nhận dạng lại, không suy tỷ lệ chính xác từ tokenSupport.

Codex chưa nghe duyệt bằng tai người hoặc xác nhận audiohoànchỉnh. Không gọi đếm cues/validatorpass là nghiệmthu nội dung.
