# Tích hợp Kino Platte Reifen

Chị giao Codex quản lý, Muse làm nội dung, Anti tích hợp/QA để giảm token. Chỉ làm Platte Reifen; giữ mọi công việc khác, không reset/commit/push/deploy/đổi nhánh. Workspace C:/Users/huynh/OneDrive/Desktop/flash.

Đầu vào: qa/kino-alignment/erdmaennchen_platte_reifen/muse-lesson.json, muse-asr-medium.json, codex-structure-audit.json. Bản Muse241cues/7phần/40picks/22cards đã qua kiểm tra cấu trúc cơ bản; chưa nghiệm thu nội dung. Giữ nguyên đầu vào, sửa vào reviewed-lesson.json + changelog.json.

Tải media chính thức https://ndr-progressive.ard-mcdn.de/progressive/2025/1013/TV-20251013-2036-2800.hd.mp4 vào video/erdmaennchen_platte_reifen.mp4 nếu chưa có; kỳ vọng267747631byte,750s,720p/AAC. Xác minh hash/ffprobe.

Rà nội dung:
- Loại5cues reviewNeeded3200030/39/91/214/237 khỏi mọi runtime (caption/all/focus/cards) nếu không xác minh được. Giữ ID còn lại, không renumber. uncertain thứ6 quanh709.82 “Dann war es ihr.” cũng cần kiểm chứng hoặc loại, không đoán đại từ.
- Rà lời ASR bất thường/picks như “Die Reifen in Ihrem Auto”, “spitze Stachel”, “piekeln”, “Für jeden Plattenreifen ein.” bằng model khác đã cache; không sửa theo ngữ pháp rồi coi là audio gốc. Toàn bộ câu có từ chưa chắc không được làm đáp án luyện. Xem bài học codex-finalize.py/README trong QA Luftgehen: câu3100067 đã phải loại dù validator và3model đã chạy.
- Rà xưng hô/người nói và nghĩa ở3200186 “Ich zeig's Ihnen.”,3200200 “Du kannst es natürlich sofort wiederhaben.” (ai trả máy sấy cho ai),3200212 “Damit geht ihr gleich baden.” (câu nói thật/nói đùa/nghĩa bóng theo cảnh),3200216 thành ngữinsWasserfallen. Halteverbot nên dịch rõ cấm dừng xe, tránh chỉ nói cấm đỗ. Chỉ chốt theo audio/ngữ cảnh/frame thật, không suy cốt truyện.
- Đối chiếu ASR small/base đã cache cho các đoạn mơ hồ và câu trọng tâm; dùng word timing để chống mất từ đầu/cuối. Không tải model mới hoặc API trả phí. Báo kiểm chứng máy, không giả vờ đã nghe bằng tai người.

Tái sử dụng kiến trúc/scripts của erdmaennchen_luftgehen sau khi đổi đúng key/title/IDs; không sao chép giữ nguyên dữ liệu của tập trước. Key erdmaennchen_platte_reifen,alias plattereifen,IDs3200001...,JSsymbolERDMAENNCHEN_PLATTE_REIFEN,stem erdmaennchen-platte-reifen. Lazy loader map/cues/captions; alias/chaptergetters; KINO_PRACTICE_DATA; dropdown/video/flashcards; metadata builder+generatedmetadata; posters. Khóa tiến độ riêng. Mỗi runtimecue thuộc đúng1chapter. Ví dụ thẻ nguyên văn nguồn, từ thẻ phải hiện trong ví dụ/dạng biến tố. Chỉ sửa mục mới, tránh reformat tệp dùng chung/đổi dữ liệu phim khác. Bảo toàn Luftgehen179/7/40/21 và các phim khác. Đọc baseline-source-hashes.json/baseline-practice-data.json để so sánh, không phục hồi toàn bộ tệp snapshot đè thay đổi mới.

Viết builder/validator tái lập; meaningful e2e mới và chạyunit+newmovie/catalog phù hợp. Test phát/tua206,caption/CC,7phần/all-focus,nghe–viết đúng/sai,cardsđúngcảnh,tiếnđộriêng,chuyểnphim/back,mobile320/390/768. Lưu log raw và ảnh desktop/mobile. Fake mic chỉ kiểm tra luồng UI. Ghi integration-status.json ngay từ đầu, cập nhật stage; xong ghi anti-integration-report.md + statuscompleted với số liệu thực/hạn chế/filesChanged/logpaths/hash. Không coi cầu nốiSUCCESS hay validatorpass là lời thoại chính xác. Không đăng3Shorts vào feed; giữ đề xuất trong QA.
