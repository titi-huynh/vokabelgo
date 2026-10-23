# VokabelGo

Web học tiếng Đức qua flashcard, trò chơi và Kino với bài học, phụ đề Đức–Việt.

## Lấy đầy đủ dự án sang máy khác

Cài **Git**, **Git LFS** và **Node.js 20 trở lên**, rồi chạy:

```sh
git lfs install
git clone https://github.com/titi-huynh/vokabelgo.git
cd vokabelgo
git lfs pull
npm ci
npm start
```

Mở <http://localhost:3000/>. Bài We Bare Bears: <http://localhost:3000/?kino=bears>.

Video, âm thanh và tệp thiết kế lớn được lưu bằng **Git LFS**. Bước `git lfs pull` cần chạy thành công để có tệp thật; tệp con trỏ LFS chỉ chứa vài dòng văn bản và không phát được. Khi lấy dự án bằng Download ZIP hoặc công cụ nhập GitHub, kiểm tra công cụ đó có tải cả dữ liệu LFS. Xem [hướng dẫn GitHub về LFS](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage).

## Nội dung bản bàn giao

- Mã nguồn ứng dụng, dữ liệu từ vựng và bài học Kino, phụ đề, video, nhạc, hình ảnh.
- Các bản thử trò chơi, tài liệu, thiết kế, mã nguồn đồ họa, công cụ xử lý nội dung và kết quả kiểm tra trong `design/`, `scripts/`, `qa/`, `review-assets/`.
- Video nháp trong `video/` cũng được giữ để có thể tiếp tục biên tập.

Không đưa lên Git các thư mục cài đặt, bộ nhớ đệm, dữ liệu tạm, bản sao dự phòng (`node_modules/`, `tmp/`, `tmp_model/`, `video_archive/`, `_backup_video_full_phase1/`, `artifacts_video/`, `preview_wortregen/`), cấu hình `.vercel/` và bí mật trong `.env`. Cài lại thư viện bằng `npm ci`. Các công cụ Python biên tập nội dung có thể cần môi trường/thư viện riêng theo hướng dẫn tương ứng; không cần để chạy web.

Tiến độ học lưu trong trình duyệt và dữ liệu tài khoản trên dịch vụ bên ngoài không được chuyển chỉ bằng cách sao chép kho Git. Các cấu hình Firebase/Supabase phía client vẫn trỏ tới dịch vụ đang dùng; khi chuyển sang backend riêng cần cập nhật cấu hình tương ứng.

## Kiểm tra và chạy trên máy chủ

```sh
npm run test:unit
npx playwright install chromium
npm run test:e2e
```

Đặt biến môi trường `VOKABELGO_NO_OPEN=1` khi chạy server trên máy chủ để tắt tự mở trình duyệt. Máy chủ phát web trên cổng 3000, đồng thời hỗ trợ cổng 3001. Khi đưa lên nền tảng khác, giữ nguyên đường dẫn tương đối và bảo đảm nơi lưu trữ nhận được các tệp LFS thật.

Các lệnh kiểm tra từ vựng và tài liệu chi tiết khác nằm trong `LEXICON_PIPELINE.md`, `LEXICON_REVIEW_GUIDE.md`, `LEXICON_SOURCES.md` và `README_DAU_TU*.md`.
