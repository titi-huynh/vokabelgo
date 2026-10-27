# Tích hợp Kino Zum in die Luft gehen

Chị giao Codex quản lý Muse/Anti để giảm token. Muse đã hoàn thành phần biên tập; Anti nhận tích hợp local + rà chất lượng + kiểm thử, Codex nghiệm thu sau. Chỉ làm tập này, không triển khai các tập khác.

Workspace C:/Users/huynh/OneDrive/Desktop/flash. Đọc AGENTS nếu có. Đầu vào trong qa/kino-alignment/erdmaennchen_luftgehen/: muse-lesson.json (182cues/7ch/41picks/22cards), muse-asr-medium.json (words), codex-structure-audit.json. Giữ nguyên bản Muse gốc để truy vết, lưu bản đã sửa riêng reviewed-lesson.json và ghi changelog.

Nguồn video thật: https://ndr-progressive.ard-mcdn.de/progressive/2026/0423/TV-20260423-2133-5400.hd.mp4 . Tải vào video/erdmaennchen_luftgehen.mp4 nếu chưa có; xác minh ffprobe khoảng692.44s/720p/AAC và SHA256. Có thể dựng bản480p audio copy theo cơ chế kino-light hiện tại nếu phù hợp, không đăng ký đường dẫn chưa có file. Không tải lại media đã có đúng hash/thông số.

Các điểm Codex đã phát hiện cần xử lý:
- Muse có2cues reviewNeeded:3100055 tên Taterchen,3100182 câu cuối thiếu từ đầu. Loại khỏi caption/đáp án runtime nếu không thể xác minh; giữ trong hồ sơ QA. Không đưa reviewNeeded vào chế độ all, picks hoặc cards.
- Cue3100143 tại542.96–543.24 nằm ngoài mọi chapter Muse. Rà lại ranh giới để mọi runtime cue thuộc đúng1phần. Có thể ghép ranh giới liên tục0/176.18/263.36/325.87/414.92/543.64/622.98/692.44 nếu khớp cảnh; không cắt câu.
- Cue3100078 "Schön blöd, wenn man nicht fliegen kann, so wie wir." do cô chim nói; bản Việt "không biết bay, như bọn chị đây này" có thể đảo nghĩa thành chim không biết bay. Đối chiếu ngữ cảnh và sửa rõ cô chim khoe mình bay được, chế giễu kẻ không bay được.
- Cue3100171 "Sie wollen wirklich alle Ballons kaufen." đang dịch "Họ thật sự muốn mua...". Rà câu trước/sau, người bán hỏi trực tiếp các cô chim thì Sie là xưng hô lịch sự, cần bản Việt dạng hỏi "Các cô thực sự muốn mua hết bóng bay sao?". Chỉ chốt theo bằng chứng, đừng tự đoán.
- Card "der Ballonverkäufer" dùng example3100102 "Ja, ich verkaufe diese wunderschönen Ballons." không có danh từ đó; nên đổi card thành verkaufen với grammar/meaning đúng, hoặc tìm cue danh từ thật có ví dụ phù hợp học giao tiếp. Giữ tất cả ví dụ nguyên văn cue runtime.
- Giữ lời Đức của nhân vật nói giọng nước ngoài nếu nghe/ASR chứng minh, không sửa ngữ pháp rồi coi là audio gốc. Không dùng grammar đơn thuần để thêm/bớt từ. Các sửa Muse in->im,zwar,Vogeldamen,auslachen cần rà bằng mẫu ASR độc lập khi có thể.

Rà độc lập các41picks và điểm trên bằng video/word timestamps và một model ASR khác đã cache (small/base), ưu tiên cửa sổ ngắn; không download model/dùng API trả phí/cài dịch vụ mới. Không gọi token coverage là tỷ lệ chính xác. Chỉ báo bằng chứng thực; không tuyên bố đã nghe bằng tai người. Lưu kết quả kiểm tra/các đoạn bỏ trong QA; dùng earshot measure nếu đánh giá thông số âm thanh.

Tích hợp theo mẫu erdmaennchen-schmucklose-lesson.js/-aligned.js nhưng đọc mã mới nhất: key erdmaennchen_luftgehen, alias luftgehen, ID3100001... giữ ID của cues còn lại không renumber, khóa tiến độ riêng. Đăng ký kino-data.js map + cues/captions, kino-chapter-data.js alias/getters, index.html dropdown/badge/KINO_VIDEOS/flashcards getter, scripts/build-kino-metadata.cjs rồi build metadata; poster script thêm key/chapter times khi cần. Kiến trúc lazy load, không eager-load mọi aligned. Giữ all/focus luyện, captionĐức–Việt, thẻnguồn về đúngcảnh. Build bằng script tái lập; không sửa generatedmetadata tay. Đọc cơ chế media manifest hiện tại để bản local phát được. Không tự đăng3shorts vào feed nếu phải thay cấu trúc hiện có; có thể giữ đề xuất trong QA.

Kho đang có thay đổi từ công việc khác, tuyệt đối giữ nguyên. Không reset/checkout/commit/push/deploy/đổi nhánh, không ghi đè tệp dùng chung từ snapshot cũ. Bảo toàn nội dung bài Nudeltrick/Schmucklose/Fahrstuhl/Bagger/Spukschloss và bài khác.

Kiểm tra meaningful: validator toànbộcuemốc/ID/chapter/picks/cards, npm run test:unit; thêm spec e2e riêng cho tập mới và chạy các regression Kino catalog + hai Erdmännchen cũ phù hợp. Browser thật localhost dùng server sẵn có, không kill tiến trình khác: video tải/tua (HTTP206), caption/CC,7phần, chế độall/focus,nghe–viết đúng/sai, thẻ nguồn, lưu/khôi phục tiến độ, chuyển phim/back khôngdata stale, mobile320/390/768. Kiểm tra ghi âm nếu môi trườngcho phép nhưng fake mic không chứng minh thu thật. Lưu ảnh desktop/mobile và lệnh + kết quả thực tế vào QA, không chỉ nói đã pass.

Kết thúc ghi qa/kino-alignment/erdmaennchen_luftgehen/anti-integration-report.md và integration-status.json gồm status,filesChanged,counts,checks,sourcehash,limitations; linklocal http://localhost:3000/?kino=luftgehen. Nếu cònchạyASR/test thì status=in_progress, không báo completed sớm. Bàn giao gọn để Codex xem tệp/ảnh/output nghiệm thu, không bắt chị copy hay chạy lệnh.
