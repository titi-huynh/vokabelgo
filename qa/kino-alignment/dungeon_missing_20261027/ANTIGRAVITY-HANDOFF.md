# Bàn giao Nhận dạng & Đề xuất (Antigravity → Codex) — Delicious in Dungeon S01E01

> Đây là đề xuất ban đầu 8 cue, trước khi Codex tích hợp. Kết quả cuối ở `review.json` và `BAO-CAO-KIEM-CHUNG-DUNGEON-2026-10-27.md`: 6 cue được thêm; ba câu phải sửa tên riêng được giữ để người nghe duyệt, còn Ja. được tách khỏi các âm ngập ngừng. Kiểm định đề xuất ban đầu lưu riêng ở `proposal-evidence-verification.json`; `evidence-verification.json` kiểm 6 cue cuối cùng. Không dùng các con số đề xuất bên dưới làm số nghiệm thu.

- **Phạm vi thực hiện**: Chỉ thực hiện phần nhận dạng ASR độc lập và lập đề xuất trong `qa/kino-alignment/dungeon_missing_20261027/`. Tuyệt đối không sửa dữ liệu runtime (`*-aligned.js`, `*-lesson.js`, metadata, builder, e2e).
- **Bằng chứng máy (`humanListened: false`)**: Chạy độc lập `faster-whisper` (`small` + `medium`, `int8` CPU, `cpu_threads=3`, `language="de"`, `beam_size=5`, `temperature=0.0`, `word_timestamps=True`, `condition_on_previous_text=False`, `local_files_only=True`, `initial_prompt=None`, `hotwords=None`) trên video gốc `C:\Users\huynh\OneDrive\Desktop\flash\video\delicious_in_dungeon_s01e01.mp4` (`sha256: 26caef638d8ece51c536ab109adbd0bb5640e998644d58db77ba59846f08832f`). Không tự nhận nghe bằng tai, không tải âm thanh ra ngoài.

## 1. Thống kê tổng hợp (`proposed-review.json`)

- **Tổng số cửa sổ ứng viên (`candidates`)**: **10** (cửa sổ `#1`..`#10`, đã xét đủ 10/10 cửa sổ)
- **Số cue hiện hữu giữ nguyên tuyệt đối**: **367** (`1200001`..`1200384`, `MAX source reservation = 1200384`)
- **Số câu đề xuất thêm (`added`)**: **8 câu** (từ 5 cửa sổ: `#1`, `#3`, `#6`, `#7`, `#9`; dãy ID đề xuất sau MAX reservation: `1200385`..`1200392`)
  - Trong đó **6 câu** nằm trọn trong biên cửa sổ gốc của `muse-candidates.json` (`1200385`..`1200389`, `1200392`) và **2 câu** (`1200390`, `1200391`) khôi phục từ phần đầu khoảng trống `#9` (`1336.25–1340.37s`, thuộc bản nháp `1200356`) bị biên `1339.06s` của Muse cắt ngang.
- **Số phần loại trừ (`excluded`)**: **10 mục** (trên 8 cửa sổ: `#2`, `#3`, `#4`, `#5`, `#6`, `#7`, `#8`, `#9`, `#10` — gồm 7 phần trùng/chồng biên cue hiện hữu, 1 đoạn thần chú ngôn ngữ giả tưởng ở `#8`, 1 đoạn nhạc kết tập + ảo giác lặp ở `#10`, và 1 cửa sổ tiếng hét phi từ vựng/ảo giác ở `#2`).
- **Số phần cần duyệt (`reviewNeeded`)**: **5 mục** (trên 5 cửa sổ: `#1`, `#4`, `#5`, `#6`, `#8`).

## 2. Danh sách 8 câu đề xuất thêm (`added`)

| ID đề xuất | Cửa sổ | Mốc `rawStart–rawEnd` (s) | Chapter | Nhân vật | Câu tiếng Đức (`text`) | Dịch tiếng Việt (`vi`) | Chuẩn hóa có căn cứ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `1200385` | `#1` | `71.17–73.05` | Ch.1 (`0–148`) | Laios | `Wenn wir ihn besiegt haben, können wir verschnaufen!` | Hạ xong nó rồi, chúng ta có thể nghỉ lấy hơi! | Dấu chấm than theo `medium` |
| `1200386` | `#1` | `73.91–74.33` | Ch.1 (`0–148`) | Laios | `Na los!` | Tiến lên nào! | Giữ nguyên |
| `1200387` | `#3` | `112.49–113.47` | Ch.1 (`0–148`) | Laios | `Was ist los, Falin?` | Có chuyện gì vậy, Falin? | Tên riêng `Falin` (từ ASR `Falli`/`Vali`/`Fallen`/`Fali`, khớp cue `1200024`, `1200072`, bản nháp `1200015`) |
| `1200388` | `#6` | `985.82–987.02` | Ch.6 (`958–1155`) | Laios | `Alles in Ordnung, Marcille?` | Cậu không sao chứ, Marcille? | Tên riêng `Marcille` (từ ASR `Masse`/`Marcel`, khớp cue `1200018`, `1200227`, bản nháp `1200253`) |
| `1200389` | `#7` | `1155.03–1156.33` | Ch.7 (`1155–1270`) | Marcille | `Geht mal zur Seite!` | Mọi người lùi sang một bên đi! | Dấu chấm than theo `tight`; mốc `1155.03s` từ `small` main nằm trọn sau mốc Chapter 7 (`1155.0s`) |
| `1200390` | `#9` | `1336.81–1338.29` | Ch.8 (`1270–1607.488`) | Chilchuck | `Die ist echt gut.` | Món này ngon thật đấy. | Giữ nguyên (từ `cand9_full_gap`, đầu bản nháp `1200356`) |
| `1200391` | `#9` | `1338.49–1339.61` | Ch.8 (`1270–1607.488`) | Chilchuck | `Probier doch mal, Marcille.` | Nếm thử một miếng đi, Marcille. | Dấu phẩy + tên riêng `Marcille` (từ ASR `Masse`, khớp bản nháp `1200356`) |
| `1200392` | `#9` | `1340.42–1341.18` | Ch.8 (`1270–1607.488`) | Chilchuck | `Könnte dir schmecken.` | Biết đâu lại hợp khẩu vị của cô. | Chữ hoa đầu câu + dấu chấm theo `medium-tight`/`medium-context` |

## 3. Các điểm chưa chắc & Lưu ý cho Codex khi tích hợp

1. **Cửa sổ `#1` (`69.79–70.89s` — giữ `reviewNeeded`)**: Câu hô đầu của Laios bất đồng hình thái chia động từ mệnh lệnh giữa `small` (`Halte durch, Freunde.` / `Halte Durchfreunde!` / `Ah, der Deutschmann!`) và `medium` (`Haltet durch, Freunde!` ở `main`/`context`, nhưng `Halte durch, Freude!` ở `tight`). Không tự sửa ngữ pháp `Halte` → `Haltet`; đã tách 2 câu sau (`1200385`, `1200386`) vào `added` và giữ phần đầu `69.79–70.89s` ở `reviewNeeded`.
2. **Cửa sổ `#2` (`79.09–83.91s` — đưa vào `excluded`, lưu ý kiểm tra)**: Đã quét 7 cửa sổ hẹp/rộng (`main`, `cand2_gap`, `cand2_core`, `cand2_part1`, `cand2_part2`, `cand2_with_neighbors`, `cand2_with_prev`). Khi neo với câu thoại thật kề bên (`cand2_with_neighbors`, `cand2_with_prev`), cả `small` và `medium` đều không nhận ra bất kỳ từ nào trong khoảng `78.82–84.10s`. Trên cửa sổ cắt rời, `medium` main sinh ảo giác kết video (`Das war's für heute. Bis zum nächsten Mal.`, `no_speech_prob=0.784`), `medium` tight chỉ nhận tiếng hét chiến đấu phi từ vựng (`HÄÄÄÄÄH!`, `Ahhhh...`, `no_speech_prob=0.735–0.780`), và `small` trống ở 5/6 lần chạy (chỉ có 1 từ `Ja` xác suất rất thấp `0.057` ở `cand2_part2`).
3. **Cửa sổ `#4` (`322.12–324.74s` — giữ `reviewNeeded` do vắt qua ranh giới Chapter 2/3 tại `324.0s`)**: Phần ngập ngừng `Äh... | Äh, ja.` (`small`) / `Uhh... | Uh, ja.` (`medium`) có thán từ nằm ở `322.12–323.94s` (Chapter 2: `148–324s`) nhưng từ `ja.` nằm ở `324.04–324.74s` (Chapter 3: `324–571.9s`). Không cắt từ để ép vừa chapter, giữ ở `reviewNeeded`.
4. **Cửa sổ `#5` (`396.88–398.30s` — giữ `reviewNeeded`)**: Khe 1.46s giữa cue `1200097` và `1200098` trống trên `small` main và cả hai model ở `cand5_with_neighbors`; trên `tight` thì bất đồng với xác suất thấp (`small`: `Ja!` prob `0.329`; `medium`: `Hier!` prob `0.104–0.120`, `no_speech_prob=0.644–0.833`).
5. **Cửa sổ `#8` (`1159.70–1171.53s`)**:
   - Đoạn thần chú giả tưởng của Marcille (`1159.70–1168.64s`: `Späler e Jepton Lufelsk...`) → `excluded`.
   - Câu quát của Senshi (`1168.80–1170.16s`: `small` nhận `Rauf zu nägeln!` / `Aufzunaggen!`, `medium` nhận `Hör auf, du Nergel!` / `Hör auf zu nageln!`, bản nháp `1200310` là `Hör auf, du Närrin!`) → giữ `reviewNeeded` do hai model bất đồng và không nhận ra `Närrin`.
   - Đoạn `1170.36–1171.44s` (`Äh, wieso?`) chồng trực tiếp lên cue hiện hữu `1200311` (`1170.98–1171.88s`: `Wieso denn?`) → `excluded`.
6. **Cửa sổ `#9` (`1336.25–1342.30s`)**:
   - Đã tách lượt thoại bản nháp `1200356` của Chilchuck thành 3 câu ngắn (`1200390` `Die ist echt gut.`, `1200391` `Probier doch mal, Marcille.`, `1200392` `Könnte dir schmecken.`). Nếu Codex chỉ muốn tích hợp câu nằm trong biên `window` gốc `[1339.06, 1342.95]` của Muse thì chỉ lấy `1200392` (`1340.42–1341.18s`); nếu lấy trọn lượt thoại trong gap `1336.20–1342.38s` thì dùng cả 3 câu `1200390..1200392`.
   - Riêng câu `1200392` (`Könnte dir schmecken.`), cả `small` và `medium` đồng thuận trên `main` và `tight`, nhưng trên `cand9_full_gap`/`cand9_probier_schmecken` thì `small` biến thiên thành `Könntet ihr schmecken?` (do ghép ngữ cảnh với từ `Masse` phía trước).

## 4. Hồ sơ bàn giao trong `qa/kino-alignment/dungeon_missing_20261027/`

- `baseline-aligned-sha256.json`, `baseline-cues-367.json`: Snapshot 367 cue gốc và SHA256 nguồn.
- `run_independent_asr.py`, `extra_tight_spec.json`, `extra_context_spec.json`, `progress.txt`: Script tái chạy và thông số cắt cửa sổ.
- `independent-small.json`, `independent-medium.json`, `independent-small-tight.json`, `independent-medium-tight.json`, `independent-small-context.json`, `independent-medium-context.json`: Kết quả ASR raw độc lập.
- `proposed-review.json`, `build_proposed_review.py`, `verify_proposed_review.py`, `proposal-evidence-verification.json`: Đề xuất chi tiết và kiểm định tự động.
