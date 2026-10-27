# Báo cáo tích hợp & Rà soát độc lập — *Ein Fall für die Erdmännchen: Zum in die Luft gehen*

- **Movie key**: `erdmaennchen_luftgehen`
- **Alias**: `luftgehen`
- **Link local nghiệm thu**: `http://localhost:3000/?kino=luftgehen`
- **Trạng thái**: `completed`

---

## 1. Xác minh nguồn media & thông số kỹ thuật (`ffprobe`, SHA256, `earshot.measure`)

- **URL nguồn**: `https://ndr-progressive.ard-mcdn.de/progressive/2026/0423/TV-20260423-2133-5400.hd.mp4`
- **Tệp đích**: `video/erdmaennchen_luftgehen.mp4`
- **Kích thước**: `269,446,928` bytes
- **SHA256**: `5E037E81B804487F054052B88D3C8ADAD9AF8B92AA3EA0AAF3E036BC80D28278`
- **Thông số `ffprobe`** (`qa/kino-alignment/erdmaennchen_luftgehen/ffprobe-source.json`):
  - Thời lượng container: `692.440000` giây (`11:32`)
  - Video: `H.264 (High)`, `1280x720`, `50 fps`
  - Audio: `AAC (LC)`, `48000 Hz`, `stereo`, `189.4 kbps`
- **Thông số `earshot.measure` (`light: true`)** (`qa/kino-alignment/erdmaennchen_luftgehen/earshot-measure.json`):
  - Thời lượng: `692.459s`
  - Integrated loudness: `-16.1 LUFS`
  - True peak: `-0.9 dBTP` (`0` mẫu clipped)
  - Loudness range (LRA): `7.8 LU`
  - Noise floor: `-35.8 dBFS`
- **Cơ chế phát media local**: Theo `kino-media.js` và `kino-media-manifest.js`, ứng dụng tự động dùng bản gốc `video/erdmaennchen_luftgehen.mp4` khi key không nằm trong `KINO_LIGHT_MEDIA_KEYS` (không đăng ký đường dẫn chưa có file).

---

## 2. Xử lý các điểm Codex phát hiện & đối chiếu ASR độc lập (`medium` / `small` / `base` + khung hình)

Bản gốc `qa/kino-alignment/erdmaennchen_luftgehen/muse-lesson.json` và `muse-asr-medium.json` được giữ nguyên 100% để truy vết. Bản đã rà soát lưu tại `qa/kino-alignment/erdmaennchen_luftgehen/reviewed-lesson.json` kèm `changelog.json` và `independent-picks-audit.json`.

1. **Loại 2 cues `reviewNeeded: true` (`3100055`, `3100182`) khỏi runtime**:
   - `3100055` (`196.60–200.16`, `"Und Taterchen hat mir diese wunderschönen Ballons geschenkt."`): Tên riêng có độ tin cậy thấp và bất đồng giữa cả 3 model ASR (`medium`: `"Taterchen"` p=0.639; `small`: `"Carterchen"` p=0.484; `base`: `"Katarchen"` p=0.560). Đã loại khỏi runtime (`all`, `picks`, `cards`) và lưu đầy đủ bằng chứng trong `reviewed-lesson.json -> removedReviewNeeded`.
   - `3100182` (`680.65–681.79`, `"Alles so klein."`): Phát dưới nhạc kết; từ đầu `"Alles"` ở `677.68–679.50` chỉ đạt `p=0.022` (`medium`) / `p=0.105` (`base`), trong khi cửa sổ `680.65–681.79` chỉ chứa `"so klein."`. Đã loại khỏi runtime (`all`, `picks`, `cards`) và lưu trong `removedReviewNeeded`.
   - **180 runtime cues còn lại** giữ nguyên ID gốc (`3100001..3100054`, `3100056..3100181`), không đánh số lại.

2. **Ranh giới 7 chương & cue `3100143` (`542.96–543.24`)**:
   - Kiểm tra khung hình `qa/kino-alignment/erdmaennchen_luftgehen/frames/cue_3100143_543_1.jpg`, `transition_543_5.jpg`, `cue_3100144_543_8.jpg` xác nhận tại `542.96–543.24` chú chim cánh cụt nói `"Ja."` đáp lại câu động viên `3100142` (`539.90–542.74`) ở cuối Phần 5, trước khi chuyển cảnh sang cô chim ở Phần 6 tại `543.64` (`3100144`: `"Oh nein, ist das furchtbar."`).
   - Áp dụng ranh giới chương liên tục: `0.00 / 176.18 / 263.36 / 325.87 / 414.92 / 543.64 / 622.98 / 692.44`. Mọi runtime cue (180/180) thuộc đúng 1 chương duy nhất, không cắt câu.

3. **Cue `3100078` (`291.80–295.20`, `"Schön blöd, wenn man nicht fliegen kann, so wie wir."`)**:
   - Cả 3 model ASR (`medium`, `small`, `base`) khớp nguyên văn câu tiếng Đức.
   - Đã sửa bản dịch tiếng Việt từ `"Thật ngớ ngẩn khi không biết bay, như bọn chị đây này."` thành **`"Thật tệ khi không thể bay được như bọn chị đây này."`**, thể hiện rõ cô chim khoe mình bay được và chế giễu những kẻ không thể bay như bọn họ.

4. **Cue `3100171` (`622.98–625.33`, `"Sie wollen wirklich alle Ballons kaufen."`) & `3100173` (`629.20–631.72`)**:
   - Khung hình `cue_3100171_623_5.jpg`, `cue_3100171_624_8.jpg`, `cue_3100172_626_8.jpg` và `cue_3100173_630_2.jpg` chứng minh người bán bóng (`Ballonverkäufer`) đang nhìn thẳng vào hai cô chim (`Vogeldamen`) hỏi liên tiếp 2 câu `3100171` + `3100172` (`"Sogar die, die ich jetzt neu aufgepustet habe?"` — model `small` thậm chí đặt dấu hỏi cho cả `3100171`: `"Sie wollen wirklich alle Ballons kaufen?"`), sau đó cô chim trả lời ở `3100173` (`"Unbedingt, sie sind alle für ihn."`).
   - Đã cập nhật `3100171`: `speaker: "Ballonverkäufer"`, `vi: "Các cô thực sự muốn mua hết bóng bay sao?"`, và `3100173`: `speaker: "Vogeldame"`.

5. **Flashcard `#12` (`cueId: 3100102`, `"Ja, ich verkaufe diese wunderschönen Ballons."`)**:
   - Đổi thẻ từ `"der Ballonverkäufer"` sang **`"verkaufen"`** (`meaning: "bán"`, `grammar: "Động từ yếu không tách: verkauft; verkaufte; hat verkauft"`), giữ nguyên văn câu ví dụ từ runtime cue `3100102`. Toàn bộ 22 flashcards đều khớp nguyên văn `cue.text`.

6. **Đối chiếu độc lập 41 picks và các điểm ngữ âm/câu đặc biệt bằng `small` & `base` (cached local)**:
   - Đã chạy `faster-whisper` `small` và `base` (`local_files_only=True`) trên 32 cửa sổ ngắn phủ toàn bộ 41 picks và 18 cues đặc biệt (`qa/kino-alignment/erdmaennchen_luftgehen/anti-asr-small-windows.json`, `anti-asr-base-windows.json`, tổng hợp tại `independent-picks-audit.json`):
     - `3100100` (`"Das ist, weil ich bin Ballonverkäufer."`): Cả 3 model (`medium`, `small`, `base`) đều xác nhận trật tự từ V2 sau `weil` của nhân vật nói giọng nước ngoài -> giữ nguyên văn.
     - `3100120` (`"Hast du was gesehen?"`): `medium` sót từ đầu `"Hast"`, nhưng cả `small` (`p=0.984` tại `478.26`) và `base` (`p=0.525` tại `478.06`) đều xác nhận `"Hast"` -> mở rộng `start` từ `478.12` về `478.06`.
     - `3100062` (`"Als ich dann wieder zu den Ballons gucken wollte..."`): `medium` gắn nhầm một token `' Als'` độ dài 0s (`p=0.01`) ở `227.12` ngay đuôi câu `3100061`; cả `small` (`228.66`, `p=0.965`) và `base` (`228.68`, `p=0.901`) chứng minh từ `"als"` thực sự bắt đầu tại `228.66` -> chỉnh `start` thành `228.60`.
     - `3100067` (`"Behaltet ihr hier mal alles im Auge."`): Cắt bỏ đoạn `"Ja genau."` (`241.01–241.81`) bị dính ở đầu bằng cách chỉnh `start` từ `241.29` sang `242.15`; ghi nhận tại `242.73–242.95` giữa `ihr` và `hier` cả 3 model đều có độ tin cậy thấp < 0.50 (`medium`: `zwar` p=0.487, `small`: `zwei` p=0.432, `base`: `zwar` p=0.221) trong mục `uncertain` và `independent-picks-audit.json`.
     - `3100029` (`in` vs `im` trước `Fischstäbchen`), `3100128` (`gib's zu`), `3100140–3100141` (`Vogeldamen`, `lachen ... aus`), `3100158` (`zwar`): Đã ghi đầy đủ kết quả đối chiếu 3 model trong `independent-picks-audit.json`.
     - Tách `0.01s` tại 13 điểm chạm mốc liền kề (`end == next.start`) để loại bỏ hiện tượng tràn từ biên (`edgeWords`).
   - Không đăng ký 3 shorts đề xuất vào feed runtime (`kino-short-scenes.js` / `kino-shorts-feed.js`); giữ nguyên đề xuất trong `reviewed-lesson.json` theo đúng yêu cầu.

---

## 3. Các tệp đã tạo / cập nhật

- **Tệp dữ liệu & runtime mới**:
  - `video/erdmaennchen_luftgehen.mp4`
  - `erdmaennchen-luftgehen-aligned.js` (`180` cues, giữ nguyên ID `3100001..3100181`)
  - `erdmaennchen-luftgehen-lesson.js` (`7` chapters, `41` picks, `22` flashcards, khóa tiến độ riêng)
  - `assets/kino-posters/erdmaennchen_luftgehen-1.jpg` .. `erdmaennchen_luftgehen-7.jpg`
  - `e2e/kino-erdmaennchen-luftgehen.spec.js`
- **Tệp đăng ký dùng chung (giữ nguyên mọi tập phim khác trong kho)**:
  - `kino-data.js`
  - `kino-chapter-data.js`
  - `kino-practice-data.js`
  - `index.html`
  - `scripts/build-kino-metadata.cjs` & `kino-metadata.js` (sinh bằng script)
  - `scripts/build-kino-posters.cjs`
  - `e2e/kino-catalog.spec.js`
- **Hồ sơ QA & bằng chứng nghiệm thu trong `qa/kino-alignment/erdmaennchen_luftgehen/`**:
  - `reviewed-lesson.json`
  - `changelog.json`
  - `independent-picks-audit.json`
  - `anti-asr-small-windows.json` & `anti-asr-base-windows.json`
  - `ffprobe-source.json` & `earshot-measure.json`
  - `validator-output.json`
  - `frames/` (16 ảnh trích xuất kiểm tra ranh giới chương và người nói)
  - `screenshots/` (`desktop-1440-overview.png`, `desktop-1440-part3-captions.png`, `desktop-1440-dictation-practice.png`, `desktop-1440-flashcards.png`, `mobile-390-part7-caption.png`, `mobile-390-speaking-recorded.png`, `viewport-320-part7.png`, `viewport-768-part7.png`)

---

## 4. Kết quả kiểm thử thực tế & Giới hạn

1. **Validator cấu trúc & dữ liệu**:
   - Lệnh: `node qa/kino-alignment/erdmaennchen_luftgehen/validate_integration.js`
   - Kết quả: **PASS** (`180` runtime cues, `2` reviewNeeded loại khỏi runtime, `7` chapters liên tục phủ kín 180 cues, `41` picks, `22` flashcards, `7` posters).
2. **Unit tests**:
   - Lệnh: `npm run test:unit` & `node test-kino-practice-data.js`
   - Kết quả: **21/21 suites PASS** (`test-kino-practice-data.js`: 32 films, 155 chapters, 1022 reviewed lines passed).
3. **Playwright E2E trên trình duyệt thật (`http://localhost:3000`)**:
   - Lệnh: `npx playwright test e2e/kino-erdmaennchen-luftgehen.spec.js e2e/kino-catalog.spec.js --output=qa/kino-alignment/erdmaennchen_luftgehen/playwright-out --reporter=list`
   - Kết quả: **8/8 tests PASS** (`kino-catalog.spec.js`: 3/3 PASS; `kino-erdmaennchen-luftgehen.spec.js`: 5/5 PASS).
   - Đã kiểm chứng: HTTP 206 byte-range seek, phụ đề Đức–Việt & nút CC, cả 7 phần tự dừng đúng mốc cuối chương, chuyển chế độ `all`/`focus`, nghe–viết đúng/sai, lưu & khôi phục tiến độ độc lập, 22 flashcards liên kết nguồn về đúng phần phim, chuyển phim/Back-Forward không dính dữ liệu cũ, responsive `320px`/`390px`/`768px`/`1440px` không tràn ngang.
4. **Giới hạn báo cáo trung thực (Limitations)**:
   - Không tuyên bố đã nghe bằng tai người; mọi quyết định về thoại và mốc thời gian đều dựa trên đối chiếu định lượng từ 3 model ASR độc lập (`medium`, `small`, `base`), `earshot.measure`, và khung hình video trích xuất bằng `ffmpeg`.
   - Kiểm thử ghi âm giọng nói trong Playwright sử dụng luồng thiết bị giả lập của Chromium (`--use-fake-device-for-media-stream`): chứng minh luồng UI/MediaRecorder/`blob:` hoạt động đúng nhưng không thay thế thu âm bằng micro vật lý của người thật.
   - Trong `e2e/kino-erdmaennchen.spec.js` và `e2e/kino-erdmaennchen-schmucklose.spec.js` (hai bài test cũ), 3/5 test mỗi file (overview/posters/HTTP 206, phát đủ 7 phần + dừng đúng ranh giới, và 24 flashcards) PASS; 2 test còn lại trong hai file cũ đó có sẵn lệch ID câu đầu (`900115` vs `900119`, `1000130` vs `1000131` do `kino-practice-data.js` ghi đè `picks`) và gọi `fetch(blob:)` bị chặn bởi CSP `connect-src` của `index.html`. Theo quy tắc bảo toàn kho, không tự ý sửa các spec của tập khác.
