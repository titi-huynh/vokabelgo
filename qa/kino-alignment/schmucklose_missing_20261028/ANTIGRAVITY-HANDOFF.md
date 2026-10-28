# BÀN GIAO KIỂM CHỨNG ĐỘC LẬP (ANTIGRAVITY HANDOFF)
## Phim: *Ein Fall für die Erdmännchen — Die schmucklose Gräfin* (`erdmaennchen_schmucklose`)

- **Ngày thực hiện:** 2026-10-28
- **Người thực hiện kiểm chứng độc lập:** Antigravity
- **Người nhận bàn giao & quyết định cuối:** Codex
- **Base commit / Branch:** `215992fdb9663e7410b6e58ea8a7c2ee29c7ef9d` (`codex/kino-schmucklose-missing-lines`)
- **Trạng thái hoàn thành ASR độc lập:** **14/14 crop hoàn thành** (`small`: 7/7 cửa sổ; `medium`: 7/7 cửa sổ) trước khi đọc bất kỳ tài liệu đối chiếu nào.
- **Tuyên bố trung thực (`humanListened`):** `false` (Antigravity hoàn toàn không có khả năng nghe âm thanh bằng tai người; toàn bộ nhận định dưới đây dựa trên dữ liệu máy từ `faster-whisper` local `small` + `medium` và kiểm tra hình ảnh qua khung hình trích xuất bằng `ffmpeg`).

---

## 1. Nguồn dữ liệu, Cấu hình & Bằng chứng chạy BLIND ASR

### 1.1. Xác thực nguồn Media & Giải mã PCM
- **File video gốc:** `video/erdmaennchen_schmucklose.mp4` (không recode, không chỉnh sửa, không upload âm thanh).
- **Kích thước:** `269,615,835` bytes.
- **SHA-256 Video:** `037acc3d885e731b24cc18649599191f55c1a184ba1627fb85562e8fd52b944a` (khớp tuyệt đối).
- **SHA-256 PCM (`f32le` 16 kHz mono từ `decode_audio`):** `007f9066021b6efb2554026087699969c5caff004549b11bce5db37b9b096572`.
- **Thời lượng giải mã:** `722.496` giây (metadata container `722.48` giây).

### 1.2. Cấu hình chạy `faster-whisper` (Quy trình BLIND)
- **Python / CTranslate2:** `C:/Users/huynh/OneDrive/Desktop/flash/tmp/peppa-align-venv/Scripts/python.exe` (CTranslate2 `4.6.0`).
- **Tham số cố định:** `device="cpu"`, `compute_type="int8"`, `cpu_threads=3`, `language="de"`, `beam_size=5`, `temperature=0`, `word_timestamps=True`, `condition_on_previous_text=False`, `vad_filter=False`, `initial_prompt=None`, `hotwords=None`, `local_files_only=True`.
- **Tính độc lập (BLIND):** Chỉ truyền danh sách toạ độ số (`start`, `end`) mở rộng ±5 giây trong `anti-context-spec.json`. Không nạp bất kỳ câu chữ nào từ Muse hay phụ đề cũ làm mồi, và chỉ đọc `baseline-cues-166.json`, `PROMPT-CODEX-SCHMUCKLOSE.md`, `quet-cau-thieu--erdmaennchen-schmucklose.json` sau khi cả 14/14 crop (`small` 7/7 + `medium` 7/7) đã ghi xong đĩa.

### 1.3. Danh mục file do Antigravity tạo trong `qa/kino-alignment/schmucklose_missing_20261028/`
1. `anti-context-spec.json` — Đặc tả 7 cửa sổ số học (`candidate 1..7`).
2. `run-independent-asr.py` — Script chạy nhận dạng độc lập.
3. `independent-small-context.json` — Kết quả raw `small` (`completed: 7, total: 7`).
4. `independent-medium-context.json` — Kết quả raw `medium` (`completed: 7, total: 7`).
5. `anti-progress.txt` — Nhật ký tiến độ từng cửa sổ và thời gian xử lý.
6. `anti-frame-092.6s.jpg`, `anti-frame-094.3s.jpg`, `anti-frame-096.2s.jpg`, `anti-frame-203.4s.jpg`, `anti-frame-205.2s.jpg`, `anti-frame-206.7s.jpg`, `anti-frame-394.5s.jpg`, `anti-frame-398.7s.jpg`, `anti-frame-399.6s.jpg`, `anti-frame-533.4s.jpg`, `anti-frame-535.0s.jpg` — Các khung hình trích xuất bằng `ffmpeg` để đối chứng bối cảnh và người nói.
7. `ANTIGRAVITY-HANDOFF.md` — Tài liệu bàn giao này.

*(Không chỉnh sửa bất kỳ file dữ liệu bài học, runtime, builder, hay file của Codex).*

---

## 2. Kiểm tra quy tắc cấp phát ID & Lịch sử Draft 179 Cues

Thực hiện yêu cầu *"Quét nguồn maxID đúng lesson gồm draft, không tin số Muse. Public max 1000266. Chú ý có discarded 179 draft với ID cũ, không tái sử dụng số đã dùng"*:

1. **Dãy ID công khai hiện tại (`baseline-cues-166.json`, `reviewed-lines.tsv`, `erdmaennchen-schmucklose-aligned.js`):**
   - Có đúng **166 cues**, đánh số liền mạch từ **`1000101` đến `1000266`**.
2. **Hồ sơ bản nháp 179 cues bị loại bỏ (`qa/kino-alignment/erdmaennchen_schmucklose/README.md`, dòng 27–34):**
   - `README.md` ghi rõ: *"Excluded/adjusted cues from the discarded 179-cue draft (IDs below are draft IDs, before renumbering, not final runtime IDs)"*.
   - Bản nháp ban đầu có **179 cues**, đánh số từ `1000101` đến **`1000279`** trước khi loại bớt 13 câu và đánh số lại thành `1000101–1000266`.
   - Do đó, các số ID từ **`1000267` đến `1000279`** **đã từng được gán trong bản nháp 179-cue (`discarded 179-cue draft`)** trước khi renumber!
3. **Khuyến nghị cấp ID an toàn tuyệt đối cho Codex:**
   - **Phương án A (Tránh tuyệt đối cả dãy ID nháp 179-cue):** Bắt đầu cấp từ **`1000280`** trở đi (`1000280`, `1000281`, ...) để không trùng bất kỳ ID nào trong lịch sử draft `1000101–1000279`.
   - **Phương án B (Nếu Codex chỉ tính ID đã commit vào file JSON/TSV của repo):** Nối tiếp từ **`1000267`** trở đi.
   - Trong bảng đề xuất dưới đây, Antigravity ghi rõ cả **ID tránh draft (`1000280+`)** và **ID nối tiếp public (`1000267+`)** để Codex quyết định theo chuẩn hệ thống.

---

## 3. Phân tích chi tiết 7 Cửa sổ Ứng viên (So sánh Raw ASR, Baseline 166 & Hình ảnh)

### Cửa sổ 1 (`candidate 1`: crop `0.00–31.12s`, vùng Muse `1.78–26.12s`)
- **Cue kề trước:** *(không có — đầu video)*
- **Cue kề sau:** `1000101` (`26.56–29.74s`): *"Du, Henry, hast du auch so einen Hunger wie ich?"* / `1000102` (`29.74–32.22s`): *"Wir haben doch gerade eben erst gegessen."*
- **Kết quả BLIND ASR của Antigravity:**
  - `small` (`independent-small-context.json`):
    - `2.36–7.74s`: `" Ein Erdmännchen als Detektiv, das gibt's nicht überall"`
    - `7.74–13.42s`: `" Mit diesen beiden geht nicht schief, sie lösen jeden Fall"`
    - `14.00–19.18s`: `" Schneller als die Polizei macht euch auf was gefasst"`
    - `20.00–24.86s`: `" Jan und Henry sind die zwei Verbrecher aufgefasst"`
    - `26.72–29.58s`: `" Du, Henry, hast du auch so einen Hunger wie ich?"` *(thuộc cue `1000101`)*
    - `29.78–31.10s`: `" Wir haben doch gerade ihm..."` *(thuộc cue `1000102`, bị cắt bởi ranh giới crop 31.12s)*
  - `medium` (`independent-medium-context.json`):
    - `3.00–8.08s`: `" Ein Erdmännchen als Detektiv, das gibt's nicht überall."`
    - `9.02–13.92s`: `" Mit diesen beiden geht nicht schief, sie lösen jeden Fall."`
    - `14.96–19.38s`: `" Schneller als die Polizei, macht euch auch was gefasst."`
    - `20.68–25.08s`: `" Jan und Henry sind die zwei Verbrecher aufgepasst."`
    - `26.98–29.66s`: `" Du, Henry, hast du auch so einen Hunger wie ich?"` *(thuộc cue `1000101`)*
    - `29.66–31.10s`: `" Aber wir haben doch gerade eben..."` *(thuộc cue `1000102`, bị cắt bởi ranh giới crop 31.12s)*
- **Đối chiếu & Đề xuất:** **LOẠI TRỪ (`exclude` — `song` / `duplicate_of_existing_cue`)**.
  - Đoạn `2.36–25.08s` là bài hát nhạc hiệu mở đầu (*Intro-Lied* của loạt phim *Ein Fall für die Erdmännchen*), ngoài ra giữa 2 model còn bất đồng từ (`auf was` vs `auch was`, `aufgefasst` vs `aufgepasst`). Theo quy chuẩn Kino, loại trừ bài hát mở đầu.
  - Đoạn từ `26.56s` trở đi đã có trong `1000101` và `1000102`.

---

### Cửa sổ 2 (`candidate 2`: crop `85.90–104.69s`, vùng Muse `90.90–99.69s`)
- **Cue kề trước:**
  - `1000118` (`81.38–88.08s`, `Gräfin`): *"Die Ohrringe, die schöne Kette, alles weg, während ich bei der Strickweltmeisterschaft war."*
  - `1000119` (`88.08–90.60s`, `Kommissar`): *"Strickweltmeisterschaft?"*
  - `1000120` (`90.60–91.82s`, `Kommissar`): *"Können Sie das beweisen?"*
- **Cue kề sau:**
  - `1000121` (`98.92–103.90s`, `Gräfin`): *"Feinste Strickware, dafür habe ich die Goldmedaille bekommen."*
- **Khoảng trống chưa có phụ đề:** **`91.82s – 98.92s`** (7.10 giây).
- **Kết quả BLIND ASR của Antigravity trong khoảng `91.82–98.92s`:**
  - `small` (`independent-small-context.json`):
    - Seg 4 (`92.30–92.88s`): `" Ja, natürlich."` — Words: `Ja,` (`92.30–92.42`, p=0.323), `natürlich.` (`92.44–92.88`, p=0.918).
    - Seg 5 (`94.20–94.44s`): `" Hier."` — Words: `Hier.` (`94.20–94.44`, p=0.965).
    - Seg 6 (`95.52–96.92s`): `" 6,38 Meter."` — Words: `6` (`95.52–96.20`, p=0.783), `,38` (`96.20–96.88`, p=0.960), `Meter.` (`96.88–96.92`, p=0.649).
  - `medium` (`independent-medium-context.json`):
    - Seg 4 (`92.38–93.12s`): `" Ja natürlich!"` — Words: `Ja` (`92.38–92.48`, p=0.368), `natürlich!` (`92.48–93.12`, p=0.595).
    - *(Lưu ý: Trong `independent-medium-context.json` crop `85.90–104.69s`, `medium` không tách thành segment riêng cho từ `"Hier."` ở `94.20–94.44s`, mặc dù trong `qa/kino-alignment/erdmaennchen_schmucklose/medium-rechecks.json` cửa sổ `70–125s` dòng 959–969 thì `medium` lại nhận ra `"Hier."` tại `94.32–94.66s` với p=0.976).*
    - Seg 5 (`95.58–97.24s`): `" 6,38 Meter!"` — Words: `6` (`95.58–96.08`, p=0.852), `,38` (`96.08–97.24`, p=0.843), `Meter!` (`97.24–97.24`, p=0.747).
  - *(Ghi chú thêm về từ `"Fein!"` của Muse ở `96.9–98.9s`: Cả `small` và `medium` trong lần chạy độc lập này đều KHÔNG nhận ra từ `"Fein!"` ở `97–98.9s`. Trong `medium-rechecks.json` cũ dòng 1001 có ghi `"Weiß ich,"` ở `97.22–98.22s` nhưng `small` không có. Vì vậy đoạn `97.24–98.92s` không có sự đồng thuận, không đưa vào cue).*
- **Kiểm tra hình ảnh (`ffmpeg` frames):**
  - `anti-frame-092.6s.jpg`: Cận cảnh `Gräfin` đang mở miệng trả lời `Kommissar`.
  - `anti-frame-094.3s.jpg`: `Gräfin` quay người bước lại bàn lấy chiếc khăn len màu vàng.
  - `anti-frame-096.2s.jpg`: `Gräfin` giơ chiếc khăn quàng cổ đan len màu vàng dài ra trước mặt `Kommissar` và `Jan & Henry` (cậu quản gia `Wilhelm` cũng đứng cạnh).
- **Đối chiếu & Đề xuất:**
  1. **ĐỀ XUẤT THÊM CUE MỚI 1 (`Ja, natürlich.`):**
     - Cả `small` (`"Ja, natürlich."`) và `medium` (`"Ja natürlich!"`) trong lần chạy BLIND đều khớp hoàn toàn từng từ (chỉ khác dấu câu).
     - **Mốc word envelope:** `small` `92.30–92.88s`, `medium` `92.38–93.12s` → hợp nhất word timestamps: **`92.30–93.12s`** (hoặc kèm đệm chuẩn builder: `92.20–93.26s`), hoàn toàn nằm gọn trong khoảng trống sau `1000120` (`end: 91.82s`).
     - **Người nói (`speaker`):** `Gräfin` (xác nhận trực tiếp qua hình `anti-frame-092.6s.jpg` và mạch đối thoại đáp lại câu hỏi *"Können Sie das beweisen?"* của `Kommissar`).
  2. **ĐỀ XUẤT THÊM CUE MỚI 2 (`6,38 Meter.`):**
     - Cả `small` (`"6,38 Meter."`) và `medium` (`"6,38 Meter!"`) trong lần chạy BLIND đều khớp chính xác con số và đơn vị `"6,38 Meter"`.
     - **Mốc word envelope:** `small` `95.52–96.92s`, `medium` `95.58–97.24s` → hợp nhất word timestamps: **`95.52–97.24s`** (hoặc kèm đệm chuẩn builder: `95.42–97.38s`), hoàn toàn không chồng lấn với `1000121` (`start: 98.92s`).
     - **Người nói (`speaker`):** `Gräfin` (xác nhận trực tiếp qua hình `anti-frame-096.2s.jpg` khi bà giơ chiếc khăn len vàng lên khoe số đo).
  3. **ĐÁNH DẤU `reviewNeeded` (`94.20–94.66s` — `"Hier."`):**
     - Trong lần chạy BLIND `independent-*-context.json`, `small` nhận ra `"Hier."` (`94.20–94.44s`, p=0.965) nhưng `medium` bỏ qua từ này (dù `medium-rechecks.json` cửa sổ `70–125s` trước đây có nhận ra `"Hier."` ở `94.32–94.66s`, p=0.976). Theo nguyên tắc nghiêm ngặt *"chỉ đề xuất thêm câu literal có cả 2 model khớp"*, Antigravity tách riêng từ `"Hier."` vào diện **`reviewNeeded` / tuỳ Codex quyết định** (không tự ý gộp vào câu `"Ja, natürlich."` hay `"6,38 Meter."`).
     - Phần `97.24–98.92s` (Muse ghi `"Fein!"`, `medium-rechecks.json` cũ ghi `"Weiß ich"`, nhưng cả `small` và `medium` BLIND đều không có) → **`reviewNeeded` / loại trừ**.

---

### Cửa sổ 3 (`candidate 3`: crop `196.72–213.68s`, vùng Muse `201.72–208.68s`)
- **Cue kề trước:** `1000143` (`196.98–202.28s`, `Gräfin`): *"Wilhelm, Sie wollen nicht schon wieder behaupten, ich wäre vergesslich."*
- **Cue kề sau:** `1000144` (`207.82–210.98s`, `Gräfin`): *"Hier drin war mein gesamter Schmuck und jetzt ist alles verschwunden."*
- **Khoảng trống chưa có phụ đề:** **`202.28s – 207.82s`** (5.54 giây).
- **Kết quả BLIND ASR của Antigravity trong khoảng `202.28–207.82s`:**
  - `small` (`independent-small-context.json`, Seg 2 `202.74–207.12s`):
    - Text: `" Das ist Pappalapap, das ist Pappalapap, das ist Pappalapap."`
    - Words:
      1. `Das` (`202.74–203.18`, p=0.981) `ist` (`203.18–203.28`, p=0.989) `Pappalapap,` (`203.28–203.82`, p=0.607)
      2. `das` (`204.18–204.34`, p=0.956) `ist` (`204.34–204.60`, p=0.978) `Pappalapap,` (`204.60–206.20`, p=0.902)
      3. `das` (`206.28–206.36`, p=0.945) `ist` (`206.36–206.52`, p=0.993) `Pappalapap.` (`206.52–207.12`, p=0.970)
  - `medium` (`independent-medium-context.json`, Seg 3 `203.18–207.18s`):
    - Text: `" Das ist Pappalapapp. Das ist Pappalapapp. Das ist Pappalapapp."`
    - Words:
      1. `Das` (`203.18–203.24`, p=0.992) `ist` (`203.24–203.44`, p=0.990) `Pappalapapp.` (`203.44–203.88`, p=0.725)
      2. `Das` (`204.30–204.44`, p=0.990) `ist` (`204.44–205.04`, p=0.989) `Pappalapapp.` (`205.04–206.24`, p=0.931)
      3. `Das` (`206.36–206.42`, p=0.947) `ist` (`206.42–206.66`, p=0.997) `Pappalapapp.` (`206.66–207.18`, p=0.990)
- **Kiểm tra câu bị cắt dở trong Muse (`"Hier drin war ..."`):**
  - Trong cả `small` (`207.92–210.88s`) và `medium` (`208.22–211.04s`), câu `"Hier drin war mein gesamter Schmuck und jetzt ist alles verschwunden."` chính là cue `1000144` (`207.82–210.98s`) đã có đầy đủ trong bài học! Sở dĩ Muse thấy `"Hier drin war ..."` bị cắt dở là do cửa sổ quét của Muse cắt ngang ở `208.68s`. Vậy phần `"Hier drin war ..."` là **bản sao một phần của cue `1000144`** → loại trừ.
- **Kiểm tra hình ảnh & Giới hạn nhãn người nói (`ffmpeg` frames):**
  - `anti-frame-203.4s.jpg` và `anti-frame-205.2s.jpg`: Khung hình quay cả `Wilhelm` (con rối quản gia bên trái, mỏ mở hé) và `Gräfin` (bên phải, đang giơ ngón tay trỏ cảnh cáo `Wilhelm` sau câu *"Sie wollen nicht schon wieder behaupten, ich wäre vergesslich"*).
  - `anti-frame-206.7s.jpg`: Chuyển cảnh sang hai chiếc hộp đựng trang sức trống rỗng trên bàn (ngay trước khi `Gräfin` nói *"Hier drin war mein gesamter Schmuck..."*).
  - **Giới hạn xác định người nói (Speaker Label Limitation):** Vì Antigravity không nghe được giọng (`humanListened=false`), chỉ nhìn khung hình tĩnh và văn bản thì có hai khả năng ngữ cảnh:
    - *Khả năng 1 (`Gräfin`):* Bà bá tước tiếp tục bác bỏ lời `Wilhelm` (*"Đó là lời nhảm nhí! Nhảm nhí! Nhảm nhí!"* — phù hợp với `PROMPT-CODEX-SCHMUCKLOSE.md` mô tả câu cửa miệng lặp lại 3 lần rồi nối tiếp sang câu *"Hier drin war mein gesamter Schmuck..."* của chính bà).
    - *Khả năng 2 (`Wilhelm` hoặc đối đáp):* Trong ảnh `203.4s`, mỏ của con rối `Wilhelm` đang mở trong khi miệng `Gräfin` khép, hoặc đây là câu cửa miệng lắp bắp của nhân vật.
    - Antigravity ghi nhận rõ giới hạn này để Codex kiểm tra và chốt nhãn `speaker` (gợi ý mặc định theo mạch thoại trước/sau là `Gräfin`, hoặc tách 1 cue gộp vs 3 cue rời tuỳ chuẩn trình bày của Codex).
- **Đối chiếu & Đề xuất:**
  - Cả `small` và `medium` trong lần chạy BLIND đều khớp tuyệt đối cả 3 lần lặp `"Das ist Pappalapapp."` (chính tả chuẩn tiếng Đức là `Pappalapapp` với hai chữ `p` ở cuối như `medium` ghi nhận; `small` viết `Pappalapap` 1 chữ `p` cuối).
  - **Phương án 1 cue gộp (khớp 1 segment của cả `small` và `medium`):**
    - Mốc word timestamps hợp nhất: **`202.74–207.18s`** (`small` `202.74–207.12s`, `medium` `203.18–207.18s`). Không chồng lấn với `1000143` (`end: 202.28s`) và `1000144` (`start: 207.82s`).
    - Text tiếng Đức: `"Das ist Pappalapapp. Das ist Pappalapapp. Das ist Pappalapapp."`
    - Dịch tiếng Việt đề xuất: `"Đó là chuyện nhảm nhí. Chuyện nhảm nhí. Toàn chuyện nhảm nhí."` (hoặc `"Vớ vẩn nào. Vớ vẩn hết sức. Toàn nói vớ vẩn."`).
  - **Phương án tách 3 cues theo 3 cụm word timestamps (nếu Codex muốn tách từng câu lặp như gợi ý của Muse):**
    - Lần 1: `202.74–203.88s` (`small` `202.74–203.82s`, `medium` `203.18–203.88s`) — `"Das ist Pappalapapp."`
    - Lần 2: `204.18–206.24s` (`small` `204.18–206.20s`, `medium` `204.30–206.24s`) — `"Das ist Pappalapapp."`
    - Lần 3: `206.28–207.18s` (`small` `206.28–207.12s`, `medium` `206.36–207.18s`) — `"Das ist Pappalapapp."`

---

### Cửa sổ 4 (`candidate 4`: crop `250.89–264.85s`, vùng Muse `255.89–259.85s`)
- **Cue kề trước:** `1000153` (`255.88–257.04s`, `Jan & Henry`): *"Hm, köstlich."*
- **Cue kề sau:** `1000154` (`258.98–261.58s`, `Jan & Henry`): *"Wie kann man nur so leckere Nüsse hier rumliegen lassen?"*
- **Kết quả BLIND ASR của Antigravity:**
  - `small` (`independent-small-context.json`):
    - *(Không có segment nào ở `255.88–257.04s`)*
    - `258.31–261.09s`: `" Und wie kann man nur so leckere Nüsse hier rum jagen?"` (Từ `"Und"` ở `258.31–258.75s` có xác suất cực thấp `p=0.060`).
    - `262.51–264.83s`: `" Vielleicht ist der Dieb sie auch so gerne wie..."` *(thuộc cue `1000155` `262.46–265.18s`)*.
  - `medium` (`independent-medium-context.json`):
    - `256.11–257.07s`: `" Mh, köstlich!"` *(chính là cue `1000153` `255.88–257.04s`)*.
    - `258.91–261.59s`: `" Und wie kann man nur so leckere Nüsse hier rumliegen lassen?"` *(chính là cue `1000154` `258.98–261.58s`, với từ `"Und"` ở `258.91–259.15s` chồng trực tiếp vào ranh giới `258.98s` của `1000154`)*.
    - `262.75–264.83s`: `" Vielleicht isst der Dieb sie auch so gerne wie die anderen."` *(thuộc cue `1000155` `262.46–265.18s`)*.
- **Đối chiếu & Đề xuất:** **LOẠI TRỪ (`exclude` — `duplicate_of_existing_cue`)**.
  - Khoảng giữa `1000153` (`end: 257.04s`) và `1000154` (`start: 258.98s`) hoàn toàn không có câu thoại độc lập nào. Bản quét của Muse chỉ bắt lại chính câu `"Köstlich!"` (đã là `1000153`) và phần mở đầu bị cắt dở `"Und wie kann man nur so le..."` (đã là `1000154`). Không được sửa `1000154` và không thêm bản sao.

---

### Cửa sổ 5 (`candidate 5`: crop `386.16–403.19s`, vùng Muse `391.16–398.19s`)
- **Cue kề trước:** `1000191` (`387.26–391.22s`, `Jan & Henry`): *"Mann, Jan, das ist es! Nichts wie los, schnappen wir uns die Diebin!"*
- **Cue kề sau:** `1000192` (`399.54–403.70s`, `Jan & Henry`): *"Du meine Güte! Du bist eine Diebin!"*
- **Khoảng trống chưa có phụ đề:** **`391.22s – 399.54s`** (8.32 giây).
- **Kết quả BLIND ASR của Antigravity trong khoảng `391.22–399.54s`:**
  - `small` (`independent-small-context.json`):
    - Seg 3 (`392.60–396.12s`): `" Da wird mein Flauschehäschen aber Augen machen!"`
      - Words: `Da` (`392.60–393.16`, p=0.890), `wird` (`393.16–393.72`, p=0.979), `mein` (`393.72–393.90`, p=0.988), `Flauschehäschen` (`393.90–394.80`, p=0.806), `aber` (`394.80–395.08`, p=0.956), `Augen` (`395.08–395.68`, p=0.993), **`machen!`** (`395.68–396.12`, p=0.949).
    - Seg 4 (`398.20–399.00s`): `" Steh mal!"` (`Steh` p=0.304, `mal!` p=0.272).
    - Seg 5 (`399.32–400.04s`): `" Ich muss sofort einhechten!"` (`Ich` p=0.131, `muss` p=0.679, `sofort` p=0.974, `einhechten!` p=0.488 — chồng vào `1000192` start `399.54s`).
  - `medium` (`independent-medium-context.json`):
    - Seg 3 (`392.64–396.32s`): `" Ja, da wird mein Flauschehäschen aber Augen wachen!"`
      - Words: **`Ja,`** (`392.64–392.86`, p=0.236), `da` (`393.40–393.62`, p=0.939), `wird` (`393.62–393.80`, p=0.962), `mein` (`393.80–394.02`, p=0.986), `Flauschehäschen` (`394.02–394.96`, p=0.862), `aber` (`394.96–395.42`, p=0.920), `Augen` (`395.42–395.80`, p=0.981), **`wachen!`** (`395.80–396.32`, p=0.959).
    - Seg 4 (`398.48–399.10s`): `" Stehen bleiben!"` (`Stehen` p=0.464, `bleiben!` p=0.962).
    - Seg 5 (`399.24–400.12s`): `" Sofort einhalten!"` (`Sofort` p=0.812, `einhalten!` p=0.904 — chồng vào `1000192` start `399.54s`).
- **Kiểm tra hình ảnh (`ffmpeg` frames):**
  - `anti-frame-394.5s.jpg`: Cận cảnh cô chim ác là `Hannelore Elster` vừa bước ra khỏi tiệm làm tóc, đang ngắm mình trong gương kính và tự nói một mình.
  - `anti-frame-398.7s.jpg` và `anti-frame-399.6s.jpg`: `Jan & Henry` chạy tới chặn trước mặt `Hannelore Elster` trên vỉa hè.
- **Đối chiếu & Đề xuất:** **ĐÁNH DẤU `reviewNeeded` (Bất đồng giữa `small` và `medium`)**.
  - Ở câu `392.60–396.32s`: `small` nhận ra `"Da wird mein Flauschehäschen aber Augen machen!"` (`machen!` p=0.949), trong khi `medium` nhận ra `"Ja, da wird mein Flauschehäschen aber Augen wachen!"` (thêm `"Ja,"` p=0.236 ở đầu và từ cuối là `"wachen!"` p=0.959; ngoài ra trong `medium-rechecks.json` cũ dòng 4919 câu này còn bị đứt ở `"ab..."`). Đúng như lưu ý trong `PROMPT-CODEX-SCHMUCKLOSE.md`: *"wachen/machen là điểm dễ bất đồng giữa các model. Chỉ chốt khi bằng chứng từ rõ; bất đồng thì reviewNeeded, không tự chuẩn hoá theo thành ngữ"*.
  - Ở đoạn `398.20–400.12s`: Hai model bất đồng nặng (`"Steh mal! Ich muss sofort einhechten!"` vs `"Stehen bleiben! Sofort einhalten!"`, trong khi `transcript-compact.txt` dòng 131 lại ra `"Ich bin hier zufrieden."`), đồng thời mốc kết thúc `400.04s / 400.12s` chồng vào cue `1000192` (`399.54s`).
  - Do đó, toàn bộ cửa sổ 5 phải đưa vào **`reviewNeeded`**, không thêm vào phụ đề học tập.

---

### Cửa sổ 6 (`candidate 6`: crop `526.51–542.42s`, vùng Muse `531.51–537.42s`)
- **Cue kề trước:** `1000221` (`530.44–532.22s`, `Gräfin`): *"Das ist ja mein Schmuck!"*
- **Cue kề sau:** `1000222` (`536.46–537.60s`, `Jan & Henry`): *"Haben Sie den gestohlen?"*
- **Khoảng trống chưa có phụ đề:** **`532.22s – 536.46s`** (4.24 giây).
- **Kết quả BLIND ASR của Antigravity trong khoảng `532.22–536.46s`:**
  - `small` (`independent-small-context.json`):
    - Seg 3 (`532.81–533.89s`): `" Ihr Schmuck?"` — Words: `Ihr` (`532.81–533.31`, p=0.508), `Schmuck?` (`533.31–533.89`, p=0.988).
    - Seg 4 (`534.21–535.89s`): `" Ja, mein Schmuck."` — Words: `Ja,` (`534.21–534.39`, p=0.965), `mein` (`535.07–535.37`, p=0.893), `Schmuck.` (`535.37–535.89`, p=0.998).
    - *(Lưu ý: Seg 5 `536.55–537.61s` `"Haben Sie den etwa gestohlen?"` thuộc về khoảng thời gian của cue `1000222` `536.46–537.60s` đã có trong baseline. Việc Muse ghi `"gestört"` là lỗi ASR riêng của Muse; cả `small` và `medium` của Antigravity đều nhận ra `"gestohlen?"` với p > 0.99, nhưng câu đó đã là cue `1000222` nên không đụng vào).*
  - `medium` (`independent-medium-context.json`):
    - Seg 3 (`533.21–533.97s`): `" Ihr Schmuck?"` — Words: `Ihr` (`533.21–533.47`, p=0.928), `Schmuck?` (`533.47–533.97`, p=0.999).
    - Seg 4 (`534.25–536.23s`): `" Ja, mein Schmuck."` — Words: `Ja,` (`534.25–534.65`, p=0.921), `mein` (`535.29–535.51`, p=0.925), `Schmuck.` (`535.51–536.23`, p=1.000).
- **Kiểm tra hình ảnh (`ffmpeg` frames):**
  - `anti-frame-533.4s.jpg`: Cận cảnh `Hannelore Elster` (đứng cạnh `Wilhelm` đang ôm gói lạc) há mỏ quay sang hỏi ngược lại `Gräfin`: *"Ihr Schmuck?"*.
  - `anti-frame-535.0s.jpg`: Khung hình toàn cảnh chân cầu thang: `Gräfin` đứng bên trái nhìn thẳng xuống `Hannelore Elster` và `Wilhelm` xác nhận: *"Ja, mein Schmuck."* (trước khi `Jan & Henry` ở góc phải hỏi câu `1000222` *"Haben Sie den gestohlen?"*).
- **Đối chiếu & Đề xuất:**
  1. **ĐỀ XUẤT THÊM CUE MỚI 3 (`Ihr Schmuck?`):**
     - Cả `small` và `medium` trong lần chạy BLIND (cũng như `medium-rechecks.json` cũ dòng 6409) đều khớp tuyệt đối từng chữ `"Ihr Schmuck?"`.
     - **Mốc word envelope:** `small` `532.81–533.89s`, `medium` `533.21–533.97s` → hợp nhất word timestamps: **`532.81–533.97s`** (hoặc kèm đệm chuẩn builder: `532.71–534.11s`), nằm hoàn toàn sau `1000221` (`end: 532.22s`).
     - **Người nói (`speaker`):** `Hannelore Elster` (xác nhận trực tiếp qua hình `anti-frame-533.4s.jpg`: mỏ của `Hannelore Elster` mở rộng khi hỏi lại nữ bá tước).
  2. **ĐỀ XUẤT THÊM CUE MỚI 4 (`Ja, mein Schmuck.`):**
     - Cả `small` và `medium` trong lần chạy BLIND (cũng như `medium-rechecks.json` cũ dòng 6429) đều khớp tuyệt đối từng chữ `"Ja, mein Schmuck."`.
     - **Mốc word envelope:** `small` `534.21–535.89s`, `medium` `534.25–536.23s` → hợp nhất word timestamps: **`534.21–536.23s`** (hoặc kèm đệm chuẩn builder: `534.11–536.37s`), kết thúc trước `1000222` (`start: 536.46s`), không chồng mốc.
     - **Người nói (`speaker`):** `Gräfin` (xác nhận qua ngữ cảnh trực tiếp đáp lại câu hỏi *"Ihr Schmuck?"* và khung hình `anti-frame-535.0s.jpg`).

---

### Cửa sổ 7 (`candidate 7`: crop `654.13–668.88s`, vùng Muse `659.13–663.88s`)
- **Cue kề trước:**
  - `1000246` (`652.70–657.96s`, `Jan & Henry`): *"Nicht alle Elstern klauen. Und nicht alle Elstern mögen Erdnüsse."*
  - `1000247` (`657.96–659.80s`, `Hannelore Elster`): *"Die machen nämlich dick."*
- **Cue kề sau:**
  - `1000248` (`662.02–665.10s`, `Hannelore Elster`): *"Hier, bitte schön. – Oh, danke schön."*
  - `1000249` (`665.58–668.16s`, `Kommissar`): *"Da bin ich schon wieder! Jetzt können wir den Fall untersuchen."*
- **Kết quả BLIND ASR của Antigravity:**
  - `small` (`independent-small-context.json`):
    - `654.13–659.49s`: `" und nicht alle Älz, dann mögen Erdnüsse, die machen nämlich dick."` (Từ `"dick."` nằm ở `658.97–659.49s`).
    - *(Khoảng `659.49–661.71s`: Hoàn toàn trống, không có từ nào).*
    - `661.71–664.19s`: `" Hier, bitte schön."` + `664.31–664.95s`: `" Oh, danke schön."` *(chính là cue `1000248` `662.02–665.10s`)*.
  - `medium` (`independent-medium-context.json`):
    - `658.21–659.65s`: `" Die machen nämlich dick."` (Từ `"dick."` nằm ở `659.19–659.65s`).
    - *(Khoảng `659.65–663.41s`: Hoàn toàn trống, không có từ nào).*
    - `663.41–664.23s`: `" Hier, bitteschön."` + `664.37–665.21s`: `" Oh, dankeschön."` *(chính là cue `1000248` `662.02–665.10s`)*.
- **Đối chiếu & Đề xuất:** **LOẠI TRỪ (`exclude` — `duplicate_of_existing_cue`)**.
  - Đúng như dự báo trong `PROMPT-CODEX-SCHMUCKLOSE.md`, từ `"Dick!"` (`659.13–660.13s`) trong bản quét của Muse chỉ là âm cuối của câu `"Die machen nämlich dick."` đã có ở cue `1000247` (`657.96–659.80s`). Giữa `1000247` và `1000248` không có bất kỳ lời thoại nào khác.

---

## 4. Tổng hợp Đề xuất Bàn giao cho Codex

### 4.1. Bảng các câu đề xuất THÊM MỚI (Cả `small` và `medium` BLIND đều khớp 100% từ vựng, không chồng 166 cues cũ)

> **Lưu ý về cách tách câu ở Cửa sổ 3 (`Pappalapapp`):**
> - Nếu giữ nguyên 1 segment như cả `small` và `medium` xuất ra → **Tổng cộng thêm 5 cues** (3 câu ở Cửa sổ 2 & 6 + 1 câu ở Cửa sổ 3; hoặc 2 câu ở Cửa sổ 2 + 1 câu ở Cửa sổ 3 + 2 câu ở Cửa sổ 6 = **5 cues**).
> - Nếu tách 3 lần lặp `"Das ist Pappalapapp."` thành 3 cues riêng → **Tổng cộng thêm 7 cues**.

| TT | Cửa sổ | ID đề xuất (Tránh draft `1000279`) | ID đề xuất (Nối tiếp `1000266`) | Word Envelope (`start` – `end`) | Kèm đệm Builder (`-0.10s` / `+0.14s`) | Nhãn `speaker` đề xuất | Câu tiếng Đức (`text`) | Dịch tiếng Việt đề xuất (`vi`) | Bằng chứng Word Reference (`independent-*-context.json`) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | --- | --- | --- |
| **1** | #2 | `1000280` | `1000267` | `92.30 – 93.12` | `92.20 – 93.26` | `Gräfin` | `Ja, natürlich.` | `Vâng, tất nhiên rồi.` | `small` w2.s4 (`92.30–92.88`: `Ja,` `92.30–92.42`, `natürlich.` `92.44–92.88`); `medium` w2.s4 (`92.38–93.12`: `Ja` `92.38–92.48`, `natürlich!` `92.48–93.12`); `anti-frame-092.6s.jpg` |
| **2** | #2 | `1000281` | `1000268` | `95.52 – 97.24` | `95.42 – 97.38` | `Gräfin` | `6,38 Meter.` | `Dài 6,38 mét đấy.` | `small` w2.s6 (`95.52–96.92`: `6` `95.52–96.20`, `,38` `96.20–96.88`, `Meter.` `96.88–96.92`); `medium` w2.s5 (`95.58–97.24`: `6` `95.58–96.08`, `,38` `96.08–97.24`, `Meter!` `97.24–97.24`); `anti-frame-096.2s.jpg` |
| **3** | #3 | `1000282` | `1000269` | `202.74 – 207.18` *(hoặc tách 3: `202.74–203.88`, `204.18–206.24`, `206.28–207.18`)* | `202.64 – 207.32` | `Gräfin` *(xem giới hạn mục 3)* | `Das ist Pappalapapp. Das ist Pappalapapp. Das ist Pappalapapp.` | `Đó là chuyện nhảm nhí. Chuyện nhảm nhí. Toàn chuyện nhảm nhí.` | `small` w3.s2 (`202.74–207.12`, 9 words); `medium` w3.s3 (`203.18–207.18`, 9 words); `anti-frame-203.4s.jpg`, `anti-frame-205.2s.jpg` |
| **4** | #6 | `1000283` *(hoặc `285`)* | `1000270` *(hoặc `272`)* | `532.81 – 533.97` | `532.71 – 534.11` | `Hannelore Elster` | `Ihr Schmuck?` | `Trang sức của bà ư?` | `small` w6.s3 (`532.81–533.89`: `Ihr` `532.81–533.31`, `Schmuck?` `533.31–533.89`); `medium` w6.s3 (`533.21–533.97`: `Ihr` `533.21–533.47`, `Schmuck?` `533.47–533.97`); `anti-frame-533.4s.jpg` |
| **5** | #6 | `1000284` *(hoặc `286`)* | `1000271` *(hoặc `273`)* | `534.21 – 536.23` | `534.11 – 536.37` | `Gräfin` | `Ja, mein Schmuck.` | `Đúng vậy, trang sức của tôi.` | `small` w6.s4 (`534.21–535.89`: `Ja,` `534.21–534.39`, `mein` `535.07–535.37`, `Schmuck.` `535.37–535.89`); `medium` w6.s4 (`534.25–536.23`: `Ja,` `534.25–534.65`, `mein` `535.29–535.51`, `Schmuck.` `535.51–536.23`); `anti-frame-535.0s.jpg` |

### 4.2. Bảng các đoạn `reviewNeeded` (Bất đồng giữa `small` và `medium` trong lần chạy BLIND)

| Cửa sổ | Mốc thời gian (`start` – `end`) | Kết quả `small` (`independent-small-context.json`) | Kết quả `medium` (`independent-medium-context.json`) | Lý do đưa vào `reviewNeeded` |
| :---: | :---: | --- | --- | --- |
| **#2** | `94.20 – 94.66` | `"Hier."` (`94.20–94.44s`, p=0.965) | *(Không xuất hiện trong `independent-medium-context.json`, dù có trong `medium-rechecks.json` cũ tại `94.32–94.66s`, p=0.976)* | Chỉ 1/2 model BLIND bắt được từ đơn `"Hier."` khi `Gräfin` quay lưng lấy khăn (`anti-frame-094.3s.jpg`). Để Codex quyết định có dùng `medium-rechecks.json` làm bằng chứng bổ trợ hay giữ `reviewNeeded`. |
| **#5** | `392.60 – 396.32` | `"Da wird mein Flauschehäschen aber Augen machen!"` (`machen!` p=0.949) | `"Ja, da wird mein Flauschehäschen aber Augen wachen!"` (`Ja,` p=0.236; `wachen!` p=0.959) | Bất đồng trực tiếp ở động từ cuối câu (`machen` vs `wachen`) và thán từ đầu câu (`Da` vs `Ja, da`). Đúng điểm cảnh báo trong `PROMPT-CODEX-SCHMUCKLOSE.md`, không tự chuẩn hoá theo thành ngữ. |
| **#5** | `398.20 – 400.12` | `"Steh mal!"` (`398.20–399.00s`) + `"Ich muss sofort einhechten!"` (`399.32–400.04s`) | `"Stehen bleiben!"` (`398.48–399.10s`) + `"Sofort einhalten!"` (`399.24–400.12s`) | Bất đồng từ vựng nặng giữa hai model và chồng mốc sang cue `1000192` (`start: 399.54s`). |

### 4.3. Bảng các cửa sổ / mảnh LOẠI TRỪ (`exclude`)

| Cửa sổ | Mốc thời gian | Phân loại loại trừ | Lý do chi tiết |
| :---: | :---: | :---: | --- |
| **#1** | `2.36 – 25.08` | `song` | Nhạc hiệu mở đầu loạt phim (*Ein Erdmännchen als Detektiv...*). Phần thoại từ `26.56s` trở đi đã thuộc `1000101` và `1000102`. |
| **#2** | `96.90 – 98.90` | `no_evidence` / `noise` | Muse ghi `"Fein!"`, nhưng cả `small` và `medium` BLIND đều không nhận ra từ nào ở `97.24–98.92s`. |
| **#3** | `207.72 – 209.72` | `duplicate_of_existing_cue` | Mảnh cắt dở `"Hier drin war ..."` của Muse thực chất là phần đầu của cue `1000144` (`207.82–210.98s`: *"Hier drin war mein gesamter Schmuck und jetzt ist alles verschwunden."*). |
| **#4** | `255.89 – 259.85` | `duplicate_of_existing_cue` | `"Köstlich!"` đã là cue `1000153` (`255.88–257.04s`); `"Und wie kann man nur so le..."` là phần đầu bị cắt dở của cue `1000154` (`258.98–261.58s`). |
| **#6** | `536.55 – 537.65` | `duplicate_of_existing_cue` | Câu `"Haben Sie den (etwa) gestohlen?"` (Muse nghe nhầm thành `"gestört"`) đã thuộc cue `1000222` (`536.46–537.60s`). |
| **#7** | `659.13 – 663.88` | `duplicate_of_existing_cue` | Từ `"Dick!"` của Muse tại `659.13–660.13s` là đuôi của cue `1000247` (`657.96–659.80s`: *"Die machen nämlich dick."*). Câu kế tiếp từ `662.02s` đã thuộc cue `1000248`. |

---

## 5. Giới hạn & Cam kết Tuân thủ

1. **`humanListened = false`:** Antigravity không nghe âm thanh; mọi kết luận về nội dung lời thoại và ranh giới từ đều trích xuất nguyên trạng từ output của `faster-whisper` (`small` + `medium`), giữ nguyên mọi khác biệt raw trong `independent-small-context.json` và `independent-medium-context.json`.
2. **Giới hạn gán nhãn người nói (`speaker`):** Nhãn người nói được xác minh qua khung hình `ffmpeg` (`anti-frame-*.jpg`) và ngữ cảnh đối thoại. Riêng ở Cửa sổ 3 (`202.74–207.18s`, `"Das ist Pappalapapp..."`), khung hình `anti-frame-203.4s.jpg` có cả `Wilhelm` (mỏ hé mở) và `Gräfin` (đang giơ ngón trỏ trách mắng `Wilhelm`); vì không nghe được âm sắc giọng nói, Antigravity đã nêu rõ cả 2 khả năng để Codex chốt.
3. **An toàn Worktree:** Không sửa bất kỳ cue cũ nào trong 166 cues, không sửa file bài học hay builder, không ghi đè file của Codex, và không thực hiện `git commit` / `push` / `merge` / `deploy`.
