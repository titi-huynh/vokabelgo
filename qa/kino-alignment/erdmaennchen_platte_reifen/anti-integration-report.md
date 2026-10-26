# Báo cáo tích hợp & Rà soát độc lập — *Ein Fall für die Erdmännchen: Platte Reifen*

- **Movie key**: `erdmaennchen_platte_reifen`
- **Alias**: `plattereifen`
- **JS symbol**: `ERDMAENNCHEN_PLATTE_REIFEN`
- **File stem**: `erdmaennchen-platte-reifen`
- **Link local nghiệm thu**: `http://localhost:3000/?kino=plattereifen`
- **Trạng thái**: `completed`

---

## 1. Xác minh nguồn media & thông số kỹ thuật (`ffprobe`, SHA256, `earshot.measure`)

- **URL nguồn chính thức**: `https://ndr-progressive.ard-mcdn.de/progressive/2025/1013/TV-20251013-2036-2800.hd.mp4`
- **Tệp đích**: `video/erdmaennchen_platte_reifen.mp4`
- **Kích thước**: `267,747,631` bytes (khớp tuyệt đối kỳ vọng `267,747,631` bytes)
- **SHA256**: `4FB2D58C1C2D3A8B1141E0A5B5CA1CF96E964795ED133972AD8DCBCC62C8CDB5`
- **Thông số `ffprobe`** (`qa/kino-alignment/erdmaennchen_platte_reifen/ffprobe-source.json`):
  - Thời lượng container: `750.000000` giây (`12:30`)
  - Video: `H.264 (High)`, `1280x720`, `50 fps`, `2593.5 kbps`
  - Audio: `AAC (LC)`, `48000 Hz`, `stereo`, `256.0 kbps`
- **Thông số `earshot.measure` (`light: true`)** (`qa/kino-alignment/erdmaennchen_platte_reifen/earshot-measure.json`):
  - Thời lượng: `750.016s`
  - Integrated loudness: `-16.0 LUFS`
  - True peak: `-0.7 dBTP` (`0` mẫu clipped)
  - Loudness range (LRA): `7.3 LU`
  - Noise floor: `-40.4 dBFS`

---

## 2. Kết quả rà soát nội dung độc lập (3 model ASR `medium` / `small` / `base` + khung hình thực)

Đầu vào `qa/kino-alignment/erdmaennchen_platte_reifen/muse-lesson.json`, `muse-asr-medium.json`, `codex-structure-audit.json`, `baseline-source-hashes.json`, `baseline-practice-data.json` được giữ nguyên 100% để truy vết. Kết quả rà soát độc lập được ghi vào `reviewed-lesson.json`, `changelog.json`, `independent-picks-audit.json`, `anti-asr-small-windows.json`, và `anti-asr-base-windows.json`.

### 2.1. Loại bỏ 18 câu không xác minh chắc chắn khỏi mọi bề mặt runtime (`caption`, `all`, `focus`, `cards`)
Áp dụng nghiêm ngặt quy tắc từ `codex-finalize.py` trong QA `erdmaennchen_luftgehen` (*không sửa theo ngữ pháp rồi coi là audio gốc; toàn bộ câu có từ chưa chắc không được làm đáp án luyện*), giữ nguyên ID gốc của **223 runtime cues còn lại** (`3200001..3200238`), không đánh số lại:

1. **5 câu `reviewNeeded: true` (`3200030`, `3200039`, `3200091`, `3200214`, `3200237`)**:
   - `3200030` (`116.99–119.45`, `"Ich krieg doch schon so schnell ich kann in die Pedale."`): Động từ `'krieg'` có độ tin cậy thấp (`small` p=0.512, `base` p=0.466; `base` mất `'schon'`), nhiều khả năng nhận diện nhầm từ *in die Pedale treten*. Đã loại khỏi runtime.
   - `3200039` (`142.67–145.71`, `"Weil kann es nicht sein. Ich bin schon nass geworden."`): Từ đầu `'Weil'` chỉ đạt `p=0.126` (`medium`), `p=0.264` (`small`), và `base` chép thành `"Weil kannst du dich sein!"`. Đã loại khỏi runtime, không tự đoán thành `'Weit'`.
   - `3200091` (`305.28–306.90`, `"Ich schreibe einen Straf."`): Danh từ cuối câu bị cụt và bất đồng trên cả 3 model (`medium`: `'Straf.'` p=0.847; `small`: `'Straftat.'` p=0.830; `base`: `'Strafzett!'` p=0.679). Đã loại khỏi runtime.
   - `3200214` (`666.42–669.42`, `"Kann mit der Luftpumpe lustige Blasen machen."`): Thiếu chủ ngữ ở `medium` (`'Kann'` p=0.602), trong khi `small` có `'ich kann'` và `base` chép `"Ich kann mit der Luft voll lustigen Blasen machen!"`. Đã loại khỏi runtime.
   - `3200237` (`723.60–729.12`, `"Ja, das würde ich auch gerne tun, aber mit den platten Reifen und der vollen Scheibe ist das etwas schwierig."`): Bất đồng giữa `'mit den platten Reifen'` (`medium` p=0.577), `'mit dem Plattenreifen'` (`small` p=0.509) và `'mit dem Platten reifen'` (`base`), kèm `'ist'` p=0.392. Đã loại khỏi runtime.
2. **Mục `uncertain` thứ 6 quanh `709.82s` (`3200228`: `"Dann war es ihr."`)**:
   - Khung hình `frames/cue_3200228_710_1.jpg` cho thấy ngài ủy viên chỉ tay thẳng vào Jan & Henry (đoán chính hai cậu là thủ phạm, không phải `"bọn họ"` như bản dịch cũ). Tuy nhiên cả 3 model ASR đều bất đồng với xác suất thấp (`medium`: `"Dann war es ihr."` p=0.557; `small`: `"Dann wart ihr's!"` p=0.531/0.475; `base`: `"Dann war dir's?"` p=0.645/0.448). Đã loại `3200228` (cùng câu đệm `3200227` `"Nein."` có `p=0.219` ở `medium`) khỏi runtime, không đoán đại từ/động từ.
3. **Các câu/picks có từ ASR bất thường được yêu cầu rà soát đặc biệt**:
   - `3200116` (`396.31–398.53`, `"Die Reifen in Ihrem Auto sind auch platt."` — pick ở Phần 3): `medium` có `'Die'` (p=0.248) trong khi `small` (p=0.122) và `base` (p=0.153) thêm `'Na, die'` ở đầu, và cả 3 model đều chép giới từ `'in Ihrem Auto'` thay vì `'an Ihrem Auto'`. Không sửa theo ngữ pháp; đã loại `3200116` khỏi runtime và khỏi picks Phần 3.
   - `3200124` (`414.58–416.20`, `"Für jeden Plattenreifen ein."`): Dạng nuốt âm khẩu ngữ của `"Für jeden platten Reifen einen"` (`'ein'` đạt p=0.676 ở `medium`, p=0.699 ở `small`, p=0.540 ở `base`). Không sửa ngữ pháp; đã loại `3200124` khỏi runtime.
   - `3200134` (`437.52–441.16`, `"Der Igel hat so scharfe und spitze Stachel."` — pick ở Phần 4): `medium` bỏ sót tiểu từ `'doch'` (`'so'` p=0.218) trong khi cả `small` (p=0.966) và `base` (p=0.922) đều nhận diện `'hat doch so'`, đồng thời danh từ số nhiều bị chép thành số ít `'Stachel.'` (`medium`/`small`) hoặc `'Stache.'` (`base`) thay vì `'Stacheln'`. Đã loại `3200134` khỏi runtime và khỏi picks Phần 4.
   - `3200161` (`504.25–506.59`, `"Jetzt kann ich niemanden mehr piekeln."`): Bất đồng giữa biến thể khẩu ngữ `'piekeln'` (`medium` p=0.781, `small` p=0.599 kèm `'Jetzt'` p=0.412) và `'pieken'` (`base` p=0.663). Đã loại `3200161` khỏi runtime.
   - `3200186` (`569.64–570.84`, `"Ich zeig's Ihnen."` — pick ở Phần 5): Khung hình `frames/cue_3200186_570_2.jpg` chứng minh hai chú chuột hamster đang quay sang nhìn nhau (không phải xưng `Sie` lịch sự với Jan & Henry vì câu trước `3200175` và câu sau `3200187` đều gọi `ihr`), và cả 3 model ASR đều bất đồng ở xác suất thấp (`medium`: `"Ich zeig's Ihnen."` với `'Ich'` p=0.237; `small`: `"Zeig sie den."` với `'den.'` p=0.237; `base`: `"Zeig sie dir!"` với `'dir!'` p=0.226). Đã loại `3200186` khỏi runtime và khỏi picks Phần 5.
   - `3200212` (`654.70–656.96`, `"Damit geht ihr gleich baden."` — pick ở Phần 6): Khung hình `frames/cue_3200212_655_8.jpg` cho thấy **chuột hamster** đang nói (theo nghĩa đen là có bơm hơi để sấy lông thì đi tắm hồ ngay được, tiếp nối bằng tiếng reo `"Ja!"` ở `3200213` và cảnh chuột tắm hồ ở `666.4s`, không phải nghĩa bóng "thất bại"), nhưng cả 3 model ASR đều bất đồng nặng với xác suất rất thấp (`medium`: `'geht'` p=0.080; `small`: `"Damit ihr gleich badet!"` với `'Damit'` p=0.141; `base`: `"Da bin ich nicht gleich paddend!"` với `'bin'` p=0.159). Đã loại `3200212` khỏi runtime và khỏi picks Phần 6.
   - Ngoài ra đã loại thêm `3200033` (`'wollen'` p=0.008 ở `medium`, p=0.016 ở `small`), `3200220` (`'den Hamster'` p=0.491 thiếu đuôi Dativ số nhiều `-n`), và 3 câu cuối phim đè lên nhạc kết/credits `3200239`, `3200240`, `3200241` (`738.82–749.02`).

### 2.2. Hiệu đính người nói, xưng hô và nghĩa câu theo khung hình thực & audio
- **`3200200` (`622.94–625.68`, `"Du kannst es natürlich sofort wiederhaben."` — pick Phần 6)**:
  - Khung hình `frames/cue_3200200_624_2.jpg` và mạch thoại `3200196–3200201` chứng minh **chú chuột hamster** (`Hamster`) đang nói với **anh nhím** (`Igel`) để trả lại chiếc thuyền hơi (`Schlauchboot`) mà nhóm chuột đã lấy làm máy sấy (`Föhn`), không phải `"Jan & Henry"` nói.
  - Đã cập nhật `speaker: "Hamster"` và `vi: "Dĩ nhiên anh có thể nhận lại nó ngay."`.
- **`3200215` (`671.92–673.82`, `"Das kann ich auch ohne."` — pick Phần 7)**:
  - Các khung hình `frames/cue_3200215_671_5.jpg`..`673_4.jpg` chứng minh chú **chuột hamster** đang bơi dưới hồ khoe tự thổi bong bóng nước không cần bơm hơi, không phải `"Jan & Henry"`. Đã cập nhật `speaker: "Hamster"`.
- **`3200216` (`679.54–685.16`, `"Ach, das war ein richtig toller Tag am See. Ja, und das, obwohl er fast ins Wasser gefallen wäre."` — pick Phần 7)**:
  - Làm rõ thành ngữ *ins Wasser fallen* (kế hoạch/ngày đi chơi bị đổ bể, hỏng bét, đồng thời chơi chữ với cơn mưa và hồ nước): `"Ôi, hôm nay thật là một ngày tuyệt vời bên hồ. Đúng vậy, mặc dù suýt nữa là cả ngày đã bị đổ bể rồi."`.
- **`Halteverbot` (`3200092`, `3200093`, `3200106`, `3200107`, flashcard `#11` `das Halteverbot`, short đề xuất `#1`)**:
  - Khung hình `frames/part3_halteverbot_309_0.jpg` hiển thị biển báo *Absolutes Halteverbot* (cấm dừng xe). Đã cập nhật toàn bộ bản dịch câu thoại, nghĩa thẻ từ vựng (`"lệnh cấm dừng xe; khu vực cấm dừng xe"`) và ghi chú để nói rõ **cấm dừng xe** thay vì chỉ nói cấm đỗ xe.
- **`3200032` (`"Platz da!"`), `3200037` (`"Mach doch mal Platz, ihr lahmen Erdmännchen."`), `3200226` (`"Natürlich, der Igel."`), `3200232` (`"die Hamster."`)**:
  - Đối chiếu các khung hình `cue_3200032_122_5.jpg`, `cue_3200037_135_0.jpg`, `c226_706_3.jpg`, `c226_707_5.jpg`, `c232_713_4.jpg`: cập nhật chính xác người nói lần lượt là `"Hamster"`, `"Schnecke"` (ốc sên bò vượt qua sau câu `3200036`), `"Kommissar"` (tự đoán là con nhím), và `"Jan & Henry"`.
- **Ranh giới 7 chương liên tục & tách mốc chạm**:
  - Áp dụng ranh giới chương liên tục phủ kín `0.00–750.00s`: `0.0 / 105.0 / 262.0 / 426.5 / 537.0 / 622.9 / 662.0 / 750.0`. Mọi runtime cue (223/223) và mọi pick (36/36, phân bổ `[6, 6, 5, 5, 5, 4, 5]`) đều thuộc đúng 1 chương duy nhất.
  - Tách `0.01s` tại 21 cặp cue chạm mốc liền kề (`end == next.start`) để chống tràn từ biên.
  - Không đăng ký 3 Shorts đề xuất vào feed runtime (`kino-short-scenes.js` / `kino-shorts-feed.js`); giữ nguyên trong hồ sơ QA (`reviewed-lesson.json`).

---

## 3. Các tệp đã tạo / cập nhật & Bảo toàn kho phim

- **Tệp dữ liệu & runtime mới**:
  - [`video/erdmaennchen_platte_reifen.mp4`](file:///C:/Users/huynh/OneDrive/Desktop/flash/video/erdmaennchen_platte_reifen.mp4) (`267,747,631` bytes)
  - [`erdmaennchen-platte-reifen-aligned.js`](file:///C:/Users/huynh/OneDrive/Desktop/flash/erdmaennchen-platte-reifen-aligned.js) (`223` cues, giữ nguyên ID `3200001..3200238`)
  - [`erdmaennchen-platte-reifen-lesson.js`](file:///C:/Users/huynh/OneDrive/Desktop/flash/erdmaennchen-platte-reifen-lesson.js) (`7` chapters, `36` picks `[6, 6, 5, 5, 5, 4, 5]`, `22` flashcards, khóa tiến độ độc lập `vokabelgo_kino_chapters_v1_erdmaennchen_platte_reifen`)
  - `assets/kino-posters/erdmaennchen_platte_reifen-1.jpg` .. `erdmaennchen_platte_reifen-7.jpg`
  - [`e2e/kino-erdmaennchen-platte-reifen.spec.js`](file:///C:/Users/huynh/OneDrive/Desktop/flash/e2e/kino-erdmaennchen-platte-reifen.spec.js)
- **Tệp đăng ký dùng chung (chỉ chèn mục mới, bảo toàn 100% 55 tệp baseline và `KINO_PRACTICE_DATA` của mọi phim khác)**:
  - [`kino-data.js`](file:///C:/Users/huynh/OneDrive/Desktop/flash/kino-data.js)
  - [`kino-chapter-data.js`](file:///C:/Users/huynh/OneDrive/Desktop/flash/kino-chapter-data.js)
  - [`kino-practice-data.js`](file:///C:/Users/huynh/OneDrive/Desktop/flash/kino-practice-data.js) (ghép hẹp bằng `JSONDecoder.raw_decode`, bảo toàn byte-for-byte các phim khác kể cả `erdmaennchen_luftgehen` 179/7/40/21)
  - [`index.html`](file:///C:/Users/huynh/OneDrive/Desktop/flash/index.html)
  - [`scripts/build-kino-metadata.cjs`](file:///C:/Users/huynh/OneDrive/Desktop/flash/scripts/build-kino-metadata.cjs) & [`kino-metadata.js`](file:///C:/Users/huynh/OneDrive/Desktop/flash/kino-metadata.js)
  - [`scripts/build-kino-posters.cjs`](file:///C:/Users/huynh/OneDrive/Desktop/flash/scripts/build-kino-posters.cjs)
  - [`e2e/kino-catalog.spec.js`](file:///C:/Users/huynh/OneDrive/Desktop/flash/e2e/kino-catalog.spec.js)
- **Hồ sơ QA, scripts tái lập & bằng chứng nghiệm thu trong `qa/kino-alignment/erdmaennchen_platte_reifen/`**:
  - [`reviewed-lesson.json`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/reviewed-lesson.json) & [`changelog.json`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/changelog.json)
  - [`independent-picks-audit.json`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/independent-picks-audit.json)
  - [`anti-asr-small-windows.json`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/anti-asr-small-windows.json) & [`anti-asr-base-windows.json`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/anti-asr-base-windows.json)
  - [`ffprobe-source.json`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/ffprobe-source.json) & [`earshot-measure.json`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/earshot-measure.json)
  - [`build_reviewed_and_runtime.py`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/build_reviewed_and_runtime.py), [`generate_runtime_files.py`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/generate_runtime_files.py), [`register_app_files.py`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/register_app_files.py), [`validate_integration.js`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/validate_integration.js), [`validator-output.json`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/validator-output.json)
  - [`unit-test.log`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/unit-test.log) & [`e2e-browser.log`](file:///C:/Users/huynh/OneDrive/Desktop/flash/qa/kino-alignment/erdmaennchen_platte_reifen/e2e-browser.log)
  - `frames/` (40 khung hình trích xuất từ video gốc) & `screenshots/` (8 ảnh chụp giao diện desktop/mobile)

---

## 4. Kết quả kiểm thử thực tế & Giới hạn

1. **Validator cấu trúc, nội dung & bảo toàn baseline**:
   - Lệnh: `node qa/kino-alignment/erdmaennchen_platte_reifen/validate_integration.js`
   - Kết quả: **PASS** (`223` runtime cues, `18` cues chưa chắc đã loại khỏi runtime, `7` chapters, `36` picks `[6, 6, 5, 5, 5, 4, 5]`, `22` flashcards, `7` posters, `55/55` tệp `baseline-source-hashes.json` khớp SHA256 tuyệt đối, `baseline-practice-data.json` và `erdmaennchen_luftgehen` `179/7/40/21` được bảo toàn 100%).
2. **Unit tests**:
   - Lệnh: `npm run test:unit` (log lưu tại `qa/kino-alignment/erdmaennchen_platte_reifen/unit-test.log`)
   - Kết quả: **21/21 suites PASS** (`test-kino-practice-data.js`: 33 films, 162 chapters, 1057 reviewed lines passed).
3. **Playwright E2E trên trình duyệt thật (`http://localhost:3000`)**:
   - Lệnh: `npx playwright test e2e/kino-erdmaennchen-platte-reifen.spec.js e2e/kino-catalog.spec.js` (log lưu tại `qa/kino-alignment/erdmaennchen_platte_reifen/e2e-browser.log`)
   - Kết quả: **8/8 tests PASS** (`kino-catalog.spec.js`: 3/3 PASS; `kino-erdmaennchen-platte-reifen.spec.js`: 5/5 PASS trong `59.0s`).
   - Đã kiểm chứng: HTTP 206 byte-range seek, phụ đề Đức–Việt & nút CC, cả 7 phần tự dừng đúng mốc cuối chương và tổng hợp đủ 223 cues, chuyển chế độ `all`/`focus`, nghe–viết đúng/sai, lưu & khôi phục tiến độ độc lập, 22 flashcards liên kết nguồn nhảy về đúng phần phim, chuyển phim sang *Zum in die Luft gehen* và Back/Forward không dính dữ liệu cũ, responsive `320px`/`390px`/`768px`/`1440px` không tràn ngang.
4. **Giới hạn báo cáo trung thực (Limitations)**:
   - Không tuyên bố đã nghe bằng tai người; toàn bộ quyết định giữ/loại câu thoại, mốc thời gian và người nói đều dựa trên kiểm chứng máy (đối chiếu 3 model ASR nội bộ `medium`/`small`/`base`, `earshot.measure`, và trích xuất khung hình thực bằng `ffmpeg`).
   - Kiểm thử ghi âm giọng nói trong Playwright sử dụng luồng thiết bị giả lập của Chromium (`--use-fake-device-for-media-stream`), chỉ kiểm chứng luồng UI/MediaRecorder/`blob:` chứ không thay thế thu âm bằng micro vật lý của người thật.
