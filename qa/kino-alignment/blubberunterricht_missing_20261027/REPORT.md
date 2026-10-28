# Blubberunterricht — bản chờ Muse kiểm tra

- Nhánh: `codex/kino-spongebob-blubberunterricht-missing-lines`.
- Base main: `09f3b78c619b47961024396b02564c3005542012`.
- Đã xét **6/6 cửa sổ**, thêm **5 cue → 24 caption / 24 practice**, giữ nguyên tuyệt đối **19 caption + 19 practice cũ từng trường**.
- ID nối tiếp **1600120–1600124**; không tái sử dụng ID. Giữ **2 chương / 14 picks / 12 thẻ**, nguồn video, dữ liệu bài học và các phim khác. Không chồng mốc/trùng ID.
- **9 phần reviewNeeded**, **13 phần loại trừ**. Đây là số phần, không phải số cửa sổ; một cửa sổ có thể chứa nhiều quyết định.
- Chưa merge, chưa deploy. `vercel.json` chặn tự deploy đúng nhánh mới. Chờ Muse kiểm độc lập và chị duyệt.

## Năm câu bổ sung

Mốc giây tuyệt đối trong video. Mỗi cue có tham chiếu trực tiếp tới toàn bộ word timestamps của cả small và medium trong `review.json`; chỉ chuẩn hóa hoa/thường và dấu câu.

| ID | Mốc giây | Người nói | Đức | Việt |
|---|---|---|---|---|
| 1600120 | 39.29–43.15 | SpongeBob | Du hast nicht die richtige Technik. | Cậu chưa dùng đúng kỹ thuật. |
| 1600121 | 51.30–52.62 | Thaddäus | Dreimal nach rechts gucken. | Nhìn sang phải ba lần. |
| 1600122 | 53.18–55.50 | Thaddäus | Und jetzt geht's los, der Beckenstoß. | Và giờ bắt đầu nào, đẩy hông! |
| 1600123 | 65.19–67.91 | Thaddäus | Und dies und dies und dies und das und das und das. | Rồi thế này, thế này, thế này, và thế kia, thế kia, thế kia. |
| 1600124 | 117.02–118.50 | Thaddäus | Danke, danke, danke! | Cảm ơn, cảm ơn, cảm ơn! |

`Und dies...und das...` là một câu hướng dẫn liên tục gồm 12 từ đã khớp, không tách thành nhiều cue một từ. `Danke` được chọn từ hai lượt full độc lập đều có đúng ba từ; medium crop hẹp xác nhận ba, small crop hẹp thêm một từ ở vị trí còn thuộc tiếng hô trước đó. Biến thể bốn từ vẫn giữ nguyên trong raw JSON.

## Các phần chờ review

| Phần | Cửa sổ | Mốc giây | Lý do giữ lại |
|---|---|---|---|
| 1 | 1 | 13.68–18.08 | Technique/name tail and following instruction vary across full and bounded crops; do not select the phrase from the package or correct names using context. |
| 2 | 2 | 31.40–33.50 | Warning/name ending remains unstable across independent crops. Keep the whole short exchange outside captions. |
| 3 | 2 | 48.17–51.30 | First instruction alternates Erst/Schwer/Schweres and the next verb Sprehen/Prähen/Drehen. Two tight crops agree on Drehen but broader neutral outputs differ; do not resolve solely from the displayed turn. Ends at the first selected word of the separately confirmed Dreimal sentence. |
| 4 | 2 | 61.06–65.19 | Hip instruction and following deictic clause remain crop dependent, despite Hüftschwung agreeing in both main crops. Do not repair using the displayed action. |
| 5 | 2 | 67.91–69.94 | After the separately confirmed twelve-word dies/das instruction, outputs vary between repeated da, bababam and an unfinished und dann. No further lexical cue selected. |
| 6 | 3 | 112.56–117.02 | Name-and-Gene chant differs across models/crops; do not change Gene to Genie to fit the later joke. Separate confirmed thanks starts at117.02. |
| 7 | 4 | 133.00–138.50 | Possible Das ruft! now matches both tight models and medium context, but is absent from broader medium/name-chant output and is embedded in strongly repetitive low-confidence audio. Retain for human review rather than treating tight agreement as definitive. |
| 8 | 5 | 174.78–179.99 | Greeting1600119 already exists. Remaining introduction has predominantly Vor but tight small Für and an unresolved final name/call. Keep the whole incomplete introduction for review rather than publishing an isolated fragment or guessing the name. |
| 9 | 6 | 179.99–183.47 | Short call is distinct in time from old1600119, but small/medium and context disagree on the actual words; not a verified new Ein Genie cue. |

13 phần loại trừ được liệt kê đầy đủ trong `review.json`: 7 phần thuộc cue cũ, 4 phần hô lặp thuần túy, 2 phần tiếng kêu/thổi bong bóng. Không đưa những phần này vào phụ đề hay học liệu. Gói Muse nói cửa sổ2 chưa có cue/covered=0, nhưng thực tế có sẵn1600106,1600107,1600108; đã sửa cách phân loại và giữ cả ba cue nguyên vẹn.

## Bằng chứng và giới hạn

- Đúng video gốc **12,325,458 bytes**, **222.841905 giây**, SHA256 `0e1ec80278f70b49d352a6ec31d760f610f72be2e204984a9aa0f8e39b32a42e`; không đổi media. `media-source-verification.json` và raw ASR lưu provenance.
- Anti nhận dạng độc lập **8 crop full** (4 small +4 medium). Codex **44 crop** (6 main +16 recheck mỗi model). Tổng **52/52 hoàn tất**. CPU int8, tiếng Đức, beam5, temperature0, word timestamps, không initial_prompt/hotwords, không lấy câu trong gói Muse làm mồi.
- Earshot chỉ hỗ trợ phân loại âm thanh tổng quát ở tiếng hô kỹ thuật/tên; không xác nhận từ tiếng Đức hay người nói.
- **humanListened=false**. Nhãn người nói suy ra từ chuỗi hình ảnh và ngữ cảnh. Anti sửa nhãn tạm ban đầu trong `SPEAKER-FOLLOWUP.md`; Codex kiểm thêm các frame51.4/51.9/52.3/53.3/54.3/55.2. **Đề nghị Muse đặc biệt kiểm nhãn Thaddäus ở1600121/1600122**, vì Anti vẫn lưu khả năng SpongeBob nói ngoài khung hình. Không tuyên bố đã nghe giọng để xác nhận.
- Không tự sửa Gene→Genie, tên cuối lời giới thiệu hoặc Die Technik theo ngữ cảnh. `Das ruft!` đã khớp cả hai model ở crop hẹp mới nhất nhưng vẫn giữ reviewNeeded vì phụ thuộc crop và tiếng hô nền.
- Hồ sơ nguồn cũ và văn bản19 cue cũ được giữ; chỉ bổ sung5 cue và thông tin phương pháp kiểm chứng. Các bản nhận dạng cũ trong thư mục20261026 là bằng chứng lịch sử, không bị viết lại.

## Kiểm tra đã qua

- `node .../audit-final.cjs`: 19 caption/practice cũ deep-equal; 2 chương/14 picks/12 thẻ và video giữ nguyên; **32 file aligned khác không đổi**; metadata chỉ đổi cueCount của Blubberunterricht19→24; VTT24cue mỗi ngôn ngữ; mọi cue nằm trọn trong đúng chương; không trùng ID/chồng mốc/lọt reviewNeeded.
- `python .../verify-evidence.py`: cả hai model cho từng câu, raw word/timing không cắt;52 crop hoàn tất, đúng SHA256, nguồn19 cue và vocabulary giữ nguyên.
- `npm run test:unit`: **21/21 suite qua** (`unit-test.log`).
- `npx playwright test e2e/kino-next-cartoons.spec.js --grep 'spongebob-blubberunterricht:'`: **3/3 qua** (`e2e-test.log`), gồm video đầy đủ/tua gần cuối, hai chương, phụ đề Đức–Việt/CC, ranh giới chương, timeline24cue, luyện nghe và lưu tiến độ trên màn hình320/390/768.
- Kiểm trực tiếp UI bằng nút phát/thanh tua: **22 mốc**: 15 mốc trước/trong/sau cả5 câu mới và7 mốc đại diện reviewNeeded; bật/tắt CC; video640×360 tải/phát được; không có console error. Xem `browser-player-verification.json`, `player-danke-desktop.png`, `e2e-overview-desktop.png`, `e2e-dictation-mobile.png`.
- Dựng lại có cùng hash từng file (`build-determinism.json`). Không sửa builder, UI hay thuật toán player.

## Tái kiểm

Từ root repo: chạy `python qa/kino-alignment/blubberunterricht_missing_20261027/finalize-review.py`, `python qa/kino-alignment/blubberunterricht_missing_20261027/integrate-review.py`, `node qa/kino-alignment/blubberunterricht_missing_20261027/audit-final.cjs`, `python qa/kino-alignment/blubberunterricht_missing_20261027/verify-evidence.py`. Hai lệnh đầu tái tạo dữ liệu từ base bất biến và quyết định đã lưu, không chạy ASR. Nếu chạy ASR phải dùng runtime local đã ghi trong `WORK-NOTES.md` và video gốc, không truyền lời thoại vào prompt.
