> Đề xuất ban đầu của Anti: 9 cue / 98 lượt ASR. Quyết định cuối của Codex ở review.json và BAO-CAO-KIEM-CHUNG-FRIEREN-2026-10-27.md: 8 cue được thêm (235 → 243), 11 phần loại trừ, 6 phần reviewNeeded sau tổng cộng 102 lượt ASR. Câu #7 được giữ để người nghe xác minh cách tách từ, và phần #6 trước cue cũ chưa được kết luận phi từ vựng. Các ID/mốc/nhãn draft bên dưới là ghi nhận đề xuất, không phải danh sách phát hành.

# Bàn giao kết quả ASR độc lập & đề xuất rà soát — Frieren S01E02 (`frieren_missing_20261027`)

- **Ngày thực hiện:** 27/10/2026
- **Phạm vi Antigravity:** Chạy bổ sung (`--resume`) toàn bộ lượt nhận dạng độc lập `faster-whisper` (`small` + `medium`), đối chiếu 12/12 cửa sổ ứng viên với 235 cue baseline, lập [`proposed-review.json`](proposed-review.json), [`verify_proposed_review.py`](verify_proposed_review.py) và tài liệu bàn giao này. Quyết định tích hợp cuối (`review.json`, runtime, kiểm thử cuối) thuộc phạm vi của Codex.

---

## 1. Tổng kết lượt chạy ASR độc lập & cơ chế `--resume`

Đã cập nhật [`run_independent_asr.py`](run_independent_asr.py) hỗ trợ cờ `--resume`:
- Kiểm tra tệp đầu ra hiện có: nếu `completed == total` và danh sách `crop` + `asrOptions` khớp đặc tả thì bỏ qua nguyên tệp, không ghi đè.
- Nếu tệp đang chạy dở (như `independent-medium-tight.json` dừng ở `2/27` trước khi cầu nối timeout), giữ nguyên toàn bộ word evidence của các cửa sổ đầu đã hoàn tất và chỉ nhận dạng nối tiếp từ cửa sổ tiếp theo.
- Cấu hình cố định ở mọi lượt: `faster-whisper 1.2.1` (`ctranslate2 4.7.1`, `torch 2.10.0+cpu`), `device="cpu"`, `compute_type="int8"`, `cpu_threads=3`, `language="de"`, `beam_size=5`, `vad_filter=false`, `condition_on_previous_text=false`, `word_timestamps=true`, `initial_prompt=null`, `hotwords=null`, `humanListened=false`.

| Tệp đầu ra raw ASR | Model | Chế độ / Spec | Trạng thái `--resume` | Số cửa sổ (`completed/total`) |
|---|---|---|---:|---:|
| `independent-small.json` | `small` | `main` (`muse-candidates.json`) | Giữ nguyên (đã xong `12/12`) | `12/12` |
| `independent-medium.json` | `medium` | `main` (`muse-candidates.json`) | Giữ nguyên (đã xong `12/12`) | `12/12` |
| `independent-small-tight.json` | `small` | `tight` (`extra_tight_spec.json`) | Giữ nguyên (đã xong `27/27`) | `27/27` |
| `independent-medium-tight.json` | `medium` | `tight` (`extra_tight_spec.json`) | Giữ nguyên cửa sổ `1–2`, chạy tiếp `3–27` | `27/27` |
| `independent-small-context.json` | `small` | `context` (`extra_context_spec.json`) | Chạy mới hoàn tất `10/10` | `10/10` |
| `independent-medium-context.json` | `medium` | `context` (`extra_context_spec.json`) | Chạy mới hoàn tất `10/10` | `10/10` |
| **Tổng cộng lượt nhận dạng cửa sổ duy nhất** | | **Không cộng trùng 2 cửa sổ resume** | | **98** |

---

## 2. Xác minh nguồn âm thanh & hình ảnh (`media-verification.json`)

- Máy hiện tại không còn tệp raw owner input ban đầu của Frieren tập 2; sử dụng bản lưu trữ phát hành 720p (`video/frieren_s01e02-web-v1.mp4`) và bản xem nhẹ 480p (`video/kino-light/frieren_s01e02-480p-v1.mp4`) từ kho media dự án.
- Theo [`media-verification.json`](media-verification.json):
  - **720p (`video/frieren_s01e02-web-v1.mp4`):** `252,263,102` bytes, SHA-256 tệp `36d2a73f8fd1d0bbdc42728ed2bf163281e1896cbb4f2288ef85683d60fe3280`.
  - **480p (`video/kino-light/frieren_s01e02-480p-v1.mp4`):** `136,157,599` bytes, SHA-256 tệp `976039158c9ce8c084dab8cb69169a2a4af67c75b5add4aa234dd7e7cc9207eb`.
  - **Luồng âm thanh giải mã (`pcm_s16le`):** cả 720p và 480p đều cho cùng SHA-256 `d7a7a3ef4f96167972d161326d5d6305a7ee94295a683f447c77edf0895d08d1`, khớp tuyệt đối với hồ sơ gốc `qa/kino-alignment/season1-episode2/media.json`.
  - **Thời lượng xác nhận:** `1560.102313s` (16kHz float32 mono SHA-256 khi chạy `faster-whisper`: `fb531f50906958ea1c718b6474f2e4d67e8d7fed612c73812de0ec5822e28ee7`).

---

## 3. Giải trình đánh số ID (`1300248` trở đi)

- Bản công khai trên `main` (`d1204a4b47d41096f4e5b5d71e667be0de338413`, lưu tại [`baseline-cues-235.json`](baseline-cues-235.json)) có **235** cue hiển thị/luyện tập, với ID công khai lớn nhất là **`1300243`**.
- Tuy nhiên, tệp nguồn `qa/kino-alignment/season1-episode2/frieren_s01e02.json` ở commit baseline đã chứa tổng cộng **247** cue nháp (`1300001`–`1300247`), bao gồm 12 cue gắn cờ `reviewNeeded: true` bị ẩn khỏi bài học (`1300022, 1300035, 1300036, 1300073, 1300121, 1300122, 1300162, 1300181, 1300244, 1300245, 1300246, 1300247`).
- Để không tái sử dụng ID nháp hay lấp khoảng trống, mọi cue mới được đề xuất trong `proposed-review.json` bắt đầu tuần tự từ **`1300248`**.

---

## 4. Đề xuất các cue thêm mới (`added`: 9 cue, `1300248`–`1300256`)

Tất cả 9 cue trong `proposed-review.json` đều có bằng chứng từ nguyên văn (`smallEvidence`, `mediumEvidence`, `timingEvidence`) khớp 100% token giữa hai model mà không tự sửa ngữ pháp, từ vựng hay tên riêng:

| ID mới | Ứng viên | Mốc đề xuất (s) | Chương | Người nói | Câu tiếng Đức | Nghĩa tiếng Việt | Ghi chú đối chiếu `small` + `medium` |
|---:|---:|---|---:|---|---|---|---|
| `1300248` | #2 | `235.42–238.14` | 1 (`0–248s`) | Frieren | `Ich werde mit dem Entschlüsseln des Buchs früher fertig werden.` | Tôi sẽ hoàn tất việc giải mã cuốn sách sớm hơn dự tính. | Cả 2 model ở cả 4 crop đều nhận diện `früher fertig werden` (thay thế draft `1300022` ghi `bald`). |
| `1300249` | #3 | `292.66–293.34` | 2 (`248–496s`) | Frieren | `Doch jetzt...` | Nhưng ngay lúc này... | Khớp nguyên văn ở `cand3_with_neighbors` (thay thế draft `1300035`); câu kế tiếp ở `293.20–294.86s` giữ lại trong `reviewNeeded`. |
| `1300250` | #4 | `478.00–481.74` | 2 (`248–496s`) | Frieren | `In dem Buch stand kein Wiederbelebungs- oder Unsterblichkeitszauber.` | Trong cuốn sách đó không hề ghi chép phép thuật hồi sinh hay trường sinh bất tử nào cả. | Khớp nguyên văn từng từ giữa hai model ở `cand4_s1_buch` và `cand4_s1_to_s3`. |
| `1300251` | #4 | `482.44–483.46` | 2 (`248–496s`) | Heiter | `Ach, wirklich?` | Ồ, thật vậy sao? | Khớp nguyên văn ở `cand4_s1_to_s3`. |
| `1300252` | #4 | `484.22–485.04` | 2 (`248–496s`) | Frieren | `Wusstest du das?` | Cậu đã biết trước chuyện này rồi à? | Khớp nguyên văn ở cả 4 crop của hai model. |
| `1300253` | #4 | `485.85–488.99` | 2 (`248–496s`) | Heiter | `Die Angst vor dem Tod ist für uns unergründlich und tief.` | Nỗi sợ cái chết đối với con người chúng tớ vốn sâu thẳm và khôn lường. | Khớp nguyên văn ở `cand4_s4_angst`, `cand4_s4_to_s6` và `cand4_with_next`. |
| `1300254` | #4 | `489.62–493.72` | 2 (`248–496s`) | Heiter | `Wenn es solche Zauber gegeben hätte, hätte Ewig diese selbst angewendet.` | Nếu thực sự từng tồn tại những phép thuật như vậy, hẳn Ewig đã tự dùng chúng cho chính mình rồi. | Khớp toàn bộ từ; `medium` viết hoa tên riêng `Ewig` (prob `0.90–0.92`) ở cả 4 lượt chạy, `small` viết thường `ewig`. |
| `1300255` | #4 | `494.40–495.46` | 2 (`248–496s`) | Frieren | `Also wieso das alles?` | Vậy tại sao cậu lại bày ra tất cả chuyện này? | Khớp nguyên văn ở cả 4 crop; kết thúc ở `495.46s`, nằm trọn trong Chương 2 trước mốc `496.0s`. |
| `1300256` | #7 | `536.04–538.30` | 3 (`496–680s`) | Heiter | `Ich bitte euch, heute Abend von ihr wegzugehen.` | Tớ xin cậu tối nay hãy rời đi khỏi chỗ con bé. | Ở lượt chạy mới `cand7_with_neighbors` (`independent-small-context.json` và `independent-medium-context.json`), cả `small` lẫn `medium` đều xuất nguyên từ ghép `wegzugehen.` (1 token) và xác nhận `Ich bitte euch` (thay thế draft `1300073` `Ich bitte dich`). |

> **Lưu ý kỹ thuật về `1300256` (Ứng viên #7) để Codex quyết định khi lập `review.json`:**
> - Ở các lượt `main` và `tight`, `medium` tách `weg zu gehen.` thành 3 từ rời (`536.32–538.30s`), còn ở `independent-medium-context.json` (`cand7_with_neighbors`), `medium` ghép liền `wegzugehen.` khớp 100% token với `small` nhưng mốc kết thúc của từ cuối trên `medium-context` kéo dài tới `538.94s` (chạm vào câu `1300074` bắt đầu lúc `538.62s`).
> - Trong `proposed-review.json`, `1300256` dùng `timingEvidence` của `small-context` (`536.04–538.06s`, mốc cue `536.04–538.30s`) nên không chạm `1300074` và vượt qua toàn bộ kiểm tra của `verify_proposed_review.py` lẫn `verify-evidence.py`. Nếu Codex muốn giữ quy tắc cực kỳ bảo thủ (không kết hợp word evidence của `medium-context` có đuôi `538.94s` với timing của `small`), Codex có thể giữ 8 cue `1300248–1300255` và chuyển #7a sang `reviewNeeded`.

---

## 5. Kiểm tra ranh giới chương quanh mốc `496.0s` (Ứng viên #4)

- Chương 2 có phạm vi `248.0–496.0s`, Chương 3 có phạm vi `496.0–680.0s`.
- Trong cửa sổ ứng viên #4 (`477.30–497.77s`), câu thiếu cuối cùng là `1300255` (`"Also wieso das alles?"`, `494.40–495.46s`), kết thúc ở **`495.46s` < `496.0s`**.
- Cụm `"Sag mir."` ở `496.94–497.74s` là phần mở đầu của câu baseline `1300062` (`497.26–499.14s`: `"Sag mir, wie geht es mit Fern voran?"`, thuộc Chương 3) và đã được xếp vào `excluded`.
- Do đó **không có cue nào cắt qua mốc `496.0s`** và **không cần điều chỉnh ranh giới chương (`chapterAdjustments: []`)**.

---

## 6. Danh mục loại trừ / không thêm trùng (`excluded`: 10 phần)

1. **Ứng viên #1 (`0.00–18.54s`, Muse `0.58–17.34s`):** Nhạc mở đầu OP (YOASOBI — *Yuusha*, thuộc vùng `exclusions` `0–90.5s`). [`earshot-opening.json`](earshot-opening.json) ghi nhận `Music: 0.775 / Speech: 0.061`; cả `small` (`"Das war der erste Mal... SWR 2020"`) và `medium` (`"Das war's für heute. Bis zum nächsten Mal. Tschüss."`) đều hallucinate trên nền nhạc.
2. **Ứng viên #3 — phần đầu (`291.22–291.78s`):** Từ `"schaffen."` trên `medium` main là đuôi của câu baseline `1300034` (`288.92–291.78s`: `"Das wirst du garantiert irgendwann schaffen."`).
3. **Ứng viên #4 — phần đuôi (`496.94–497.77s`):** Cụm `"Sag mir."` trùng phần mở đầu câu baseline `1300062` (`497.26–499.14s`: `"Sag mir, wie geht es mit Fern voran?"`), đã kiểm chứng bằng crop `cand4_with_next`.
4. **Ứng viên #5 (`504.41–507.82s`, Muse `505.61–506.62s`):** Tràn biên giữa câu `1300064` (`502.42–505.12s`: `"...vollwertigen Magierin."`) và `1300065` (`506.70–508.04s`: `"Das ist gut."`). Crop chỉ lấy khoảng trống `cand5_gap_only` (`505.15–506.65s`) cho kết quả rỗng ở `small` và hallucination `"Vielen Dank für's Zuhören!"` (prob `0.015`) ở `medium`.
5. **Ứng viên #6 (`514.42–517.87s`, Muse `515.62–516.67s`):** Đã có câu baseline `1300068` (`516.42–520.00s`: `"Würdest du sie bitte auf deinen Reisen mitnehmen?"`). Khoảng trước `516.42s` (`cand6_gap_only`, `cand6_core`) chỉ là tiếng lấy hơi/ậm ừ phi từ vựng (`"Mmh."` hoặc rỗng).
6. **Ứng viên #7 — phần sau (`538.62–540.07s`):** Câu `"Was hast du vor?"` trùng hoàn toàn với câu baseline `1300074` (`538.62–540.34s`).
7. **Ứng viên #8 (`580.76–584.20s`, Muse `581.96–583.00s`):** Chạm phần gọi tên `"Frieren,"` ở đầu câu baseline `1300082` (`582.73–586.65s`: `"Frieren, du hast wirklich ein gutes Herz."`). Khi cắt cụt ở `580.76–584.20s`, âm `"Frieren"` bị tách khỏi câu nên `small` đoán `"Verirren?"` (`0.503`) và `medium` đoán `"Feiern?"` (`0.742`); trên crop nối liền `cand8_with_1300082` (`580.76–586.80s`), `medium` nhận diện liền mạch `"Frieren, du hast wirklich ein gutes Herz."` từ `581.80s`. Không thêm trùng.
8. **Ứng viên #9 — phần đầu (`961.33–962.27s`):** Câu `"Diese Monster fressen Samen."` trùng với câu baseline `1300161` (`960.65–962.27s`).
9. **Ứng viên #10 — phần sau (`1234.42–1236.04s`):** Câu `"Das ist nur ein Zeitvertreib."` trùng với câu baseline `1300204` (`1234.42–1236.57s`).
10. **Ứng viên #12 (`1549.69–1560.10s`, Muse `1550.89–1560.10s`):** Preview tập 3 (*Vorschau*, tương ứng các draft `1300244–1300247`), nằm ngoài thoại học của tập 2. Khung hình [`scene-preview-1558.jpg`](scene-preview-1558.jpg) hiển thị rõ `"Episode 3 / 第3話 / 人を殺す魔法 / Tötungszauber"`, đồng thời hai model bất đồng nhiều cụm từ trên nền nhạc preview (`spart` vs `stark`, `Reise der Verdammene` vs `Weise der Verderbnis`, `Pflanze auf` vs `Praxis her`).

---

## 7. Danh mục cần người duyệt (`reviewNeeded`: 4 phần)

Tuân thủ nguyên tắc không chọn đa số để sửa ngữ pháp, đại từ hoặc tên riêng khi hai model bất đồng:

1. **Ứng viên #3 — phần 2 (`293.20–294.86s`, draft `1300036`):**
   - `small` (cả 4 crop): `"Irgendwann reicht er aber nicht."`
   - `medium` (main, gap_only, with_neighbors): `"Irgendwann reicht aber nicht."` (khuyết đại từ); `cand3_part2_irgendwann`: `"Irgendwann reicht er aber nicht."` (prob `er` `0.287`).
   - Bản nháp `1300036`: `"Irgendwann reicht mir aber nicht."`
   - **Lý do giữ `reviewNeeded`:** Bất đồng đại từ (`er` / `mir` / lược bỏ).
2. **Ứng viên #9 — phần 2 (`962.30–963.94s`, draft `1300162`):**
   - `small` main (`962.43–963.77s`): `"Ich bringe sie in den Wald zurück."` (prob `Ich` `0.253`, `bringe` `0.458`), nhưng ở cả 3 crop `cand9_gap_only`, `cand9_core`, `cand9_with_prev` lại đổi thành `"Nicht bringen sie in den Wald zurück."` (`Nicht bringen` vs `Ich bringe`).
   - `medium` main (`962.65–963.93s`): `"Ich bring sie in den Wald zurück."` (`bring` tỉnh lược `-e`), còn ở 3 crop `cand9_gap_only`, `cand9_core`, `cand9_with_prev` ra `"Ich bringe sie in den Wald zurück."`.
   - **Lý do giữ `reviewNeeded`:** Dao động hình thái động từ và từ đầu câu (`Ich bringe` / `Ich bring` / `Nicht bringen`) giữa các crop. Trong `proposed-review.json` đã đính kèm trường `matchingSubsetEvidence` (`smallMainEvidence`, `mediumTightEvidence`, `mediumContextEvidence`) để Codex có đầy đủ dữ liệu.
3. **Ứng viên #10 — phần đầu (`1230.88–1234.40s`, draft `1300181`):**
   - `small`: `"Freren, sag mal, warum sammelst du eigentlich Zauber?"` (main) / `"Freren, sagt mal..."` (gap_only, with_next) / `"Man sagt mal..."` (question).
   - `medium`: `"Friren, sag mal..."` (main) / `"Frieren, sag mal..."` (gap_only, with_next) / `"Dann sag mal..."` (question).
   - **Lý do giữ `reviewNeeded`:** Ở các crop mà `medium` nhận đúng tên riêng `"Frieren"` và động từ `"sag"` (`gap_only`, `with_next`), `small` lại biến dạng thành `"Freren, sagt mal"` (`Freren` + ngôi thứ hai số nhiều `sagt`). Không tự ghép chữ giữa các crop.
4. **Ứng viên #11 (`1265.05–1274.03s`, câu thoại ở `1270.70–1272.74s`):**
   - `small`: `"Da wird er mir schlecht."` (main, tight, context; riêng `cand11_core` hallucinate `"Ha, ha, ha..."` trên tiếng Heiter nôn khan).
   - `medium`: `"Da wird einem ja schlecht."` (cả 4 crop).
   - **Lý do giữ `reviewNeeded`:** Bất đồng trực tiếp đại từ/tiểu từ (`er mir` vs `einem ja`) ở mọi crop.

---

## 8. Tự kiểm chứng (`verify_proposed_review.py`)

Đã chạy [`verify_proposed_review.py`](verify_proposed_review.py) bằng Python venv, xác nhận:
- `asrFilesVerified: 6`, `totalUniqueWindowRecognitions: 98` (`12 + 12 + 27 + 27 + 10 + 10`), khớp toàn bộ `crop` theo spec và `initial_prompt: null`, `hotwords: null`, `humanListened: false`.
- `proposedAddedCues: 9` (`1300248`–`1300256`), mọi từ trong `smallEvidence`, `mediumEvidence`, `timingEvidence` đều tồn tại nguyên văn trong tệp raw ASR tương ứng, khớp token với `text`, và `start <= timing[0].start`, `end >= timing[-1].end`.
- `zeroOverlapWithBaseline: true`, `allCuesInsideSingleChapter: true`, `candidatesCovered: [1..12]`.
