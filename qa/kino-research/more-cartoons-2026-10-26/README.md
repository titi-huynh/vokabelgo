# Bổ sung ba clip Kino — 26/10/2026

Đã đồng bộ bản hiện hành từ `origin/main` (`c60fb083`) trước khi bổ sung. Giữ toàn bộ 23 bài có sẵn, bao gồm Das Spukschloss, Bagger, Frieren và Sakura tập 2. Kho sau đợt này có 26 bài.

| Bài | Link trong web | Thời lượng | Phần | Câu Đức–Việt | Thẻ từ |
| --- | --- | --- | --- | --- | --- |
| SpongeBob — Blubberunterricht | `/?kino=spongebob-blubberunterricht` | 3:43 | 2 | 19 | 12 |
| Pinguine — Operation Quietschsauber | `/?kino=pinguine-quietschsauber` | 2:07 | 2 | 21 | 13 |
| Courage — Fischverfolgungsjagd | `/?kino=courage-fischverfolgungsjagd` | 2:23 | 2 | 6 | 8 |

Tổng cộng 46 câu, 33 thẻ và 34 câu trọng tâm với tình huống sử dụng. Đây là **clip/đoạn trích chính thức với lời thoại chọn lọc**, không phải các tập phát sóng đầy đủ. Courage chủ yếu là rượt đuổi; phần thoại được giữ bắt đầu ở khoảng 98 giây. Không tự thêm lời cho các cảnh hành động.

## Nguồn và biên tập

- SpongeBob: [Nickelodeon Deutschland](https://www.youtube.com/watch?v=aCUB_Kxlu2Q).
- Pinguine: [Nickelodeon Deutschland](https://www.youtube.com/watch?v=_6qcFEES_yc).
- Courage: [Cartoon Network Deutschland](https://www.youtube.com/watch?v=ek35w-oEB48).
- Ba thư mục `qa/kino-alignment/{key}_20261026/` chứa `source.json`, `lesson-content.json`, nhận dạng cục bộ, bằng chứng ngôn ngữ, quyết định biên tập và phụ đề VTT Đức–Việt.
- `lesson-content.json` là bản biên tập dùng để dựng bài; không dùng đầu ra ASR hoặc bản xem trước ghi đè nó. Root đã thống nhất alias của Pinguine/Courage và sửa ghi chú biến cách của **der Gedanke**.
- Chỉ giữ lời thoại đủ rõ qua đối chiếu small/base và medium theo đoạn, cùng khung hình. Bỏ tiếng hét, đoạn nhạc, câu không thống nhất giữa các lần nhận dạng. Chưa có người bản ngữ duyệt nghe toàn bộ; không coi số đo âm lượng hoặc xác suất ngôn ngữ là bằng chứng chính tả hoàn hảo.
- Không gửi audio ra ngoài, không dùng tài khoản/API trả phí hoặc vượt hạn chế truy cập.

## Media và dựng lại

Ba MP4 thật có trong `video/`, quản lý qua Git LFS. Đồng thời đã xuất bản thành asset **mới** ở `titi-huynh/vokabelgo-media`, release `media-v1`, theo quy tắc redirect hiện hành của web. Không thay thế hay xóa asset cũ. Mỗi thư mục QA có `published-media.json`: ID, URL, số byte, SHA-256 và kết quả HTTP 206 đối chiếu 64 byte đầu.

```powershell
git lfs pull --include="video/spongebob_blubberunterricht.mp4,video/pinguine_quietschsauber.mp4,video/courage_fischverfolgungsjagd.mp4"
python scripts/build-kino-short-lessons.py qa/kino-alignment/spongebob_blubberunterricht_20261026/lesson-content.json qa/kino-alignment/pinguine_quietschsauber_20261026/lesson-content.json qa/kino-alignment/courage_fischverfolgungsjagd_20261026/lesson-content.json
node scripts/build-kino-metadata.cjs
node scripts/build-kino-posters.cjs spongebob_blubberunterricht
node scripts/build-kino-posters.cjs pinguine_quietschsauber
node scripts/build-kino-posters.cjs courage_fischverfolgungsjagd
```

Registry, alias, dropdown, flashcards, cue loading, tình huống luyện tập và cache URL đã được cập nhật cùng nhau. Các bài có khóa tiến độ và ID riêng. Không đổi lời thoại, ID hoặc tiến độ của các bài cũ.

## Phân công và xác minh

Ba tác vụ chuẩn bị nội dung độc lập, Antigravity viết `e2e/kino-next-cartoons.spec.js`; Codex quản lý phạm vi, duyệt nội dung, tích hợp, xuất bản media và chạy kiểm thử.

- `npm run test:unit`: **21/21 suite đạt**, dữ liệu 26 bài, 133 phần, 884 câu trọng tâm.
- 46 ID mới không trùng nhau và không trùng ID bài cũ.
- Video giải mã FFmpeg thành công; số byte và SHA-256 được đối chiếu trước khi xuất bản.
- Kết quả kiểm thử trình duyệt cuối cùng được lưu trong `verification.json` cạnh báo cáo này sau khi chạy.

Các file untracked khác có sẵn trên máy của chị được giữ riêng, không đưa vào commit của đợt bổ sung này.
