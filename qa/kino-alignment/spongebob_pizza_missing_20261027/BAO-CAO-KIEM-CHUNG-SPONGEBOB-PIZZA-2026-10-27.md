# Kiểm chứng bổ sung câu thiếu — SpongeBob Pizza — 27/10/2026

Đã nhận trực tiếp từ Muse: `PROMPT-CODEX-SPONGEBOB-PIZZA.md` và `quet-cau-thieu--spongebob-pizza.json`. Phạm vi chị giao: Anti hỗ trợ, giữ nguyên cue cũ, push nhánh mới và gửi Muse kiểm tra; chưa merge hay deploy.

- Base: `20ce104c034033f47852a6e4c1c7c82f0cd6c85b` (main đã gồm Frieren 243 và Dungeon 372).
- Nhánh: `codex/kino-spongebob-pizza-missing-lines`.
- Xét 7/7 cửa sổ: thêm **3 cue**, **60 → 63** ở cả captions và practice; 6 phần loại trừ/không thêm trùng, 9 phần `reviewNeeded`. Số phần không cộng thành số cửa sổ.
- Giữ nguyên từng trường của 60 caption và 60 practice cue cũ, toàn bộ 3 chương / 21 picks / 18 thẻ; 32 file aligned phim khác không đổi (so nội dung chuẩn LF vì Windows checkout dùng CRLF).
- Max ID công khai và mọi JSON nguồn của phim: 1200162. ID mới 1200163–1200165, không dùng lại khoảng trống 1200120/1200134. `source-id-audit.json` lưu phép rà.

## Ba cue được thêm

| ID | Mốc giây | Người nói | Đức | Việt |
|---|---|---|---|---|
| 1200163 | 54.11–54.57 | SpongeBob | Hä? | Hả? |
| 1200164 | 75.54–75.96 | Thaddäus | Schön. | Hay lắm. |
| 1200165 | 90.28–92.09 | SpongeBob | Ich glaube fast, die Pizza wird kalt. | Tôi nghĩ bánh pizza sắp nguội mất rồi. |

Mốc bao trọn các từ bằng chứng được chọn của cả small và medium; không cắt timingEvidence và không chỉnh cue cũ. `Hä?` có ở cả main và các lượt rộng, tuy xác suất của small chỉ ~0,43; không coi đây là người nghe duyệt. `Schön.` được tách riêng khỏi câu sau còn bất đồng. Câu `Ich glaube fast, die Pizza wird kalt.` khớp nguyên từ ở cửa sổ hẹp của cả hai model, và medium còn khớp ở main/full. Small main/full ra `kalten`, cửa sổ rộng cắt sát lời hát ra `kal-`/`kein...`; giữ nguyên toàn bộ biến thể thô để Muse kiểm lại. Chỉ chuẩn hóa hoa/thường và dấu câu (dấu phẩy sau `fast`), không sửa từ để khớp ngữ pháp.

Ảnh `frame-54.4.jpg`, `frame-75.8.jpg`, `frame-90.5.jpg` hỗ trợ quy người nói; ảnh không xác nhận lời Đức.

## Phần còn chờ nghe duyệt

1. Cửa sổ #1, 52.10–54.11s: Auspacken/Ausparken remains crop/model dependent; do not choose the parking spelling from context. Biến thể: Auspacken! / Ausparken!
2. Cửa sổ #1, 54.57–56.58s: Second short request in wider exchange before old cue 1200116; repeated Auspacken/Ausparken disagreement. Keep outside captions. Biến thể: Auspacken. / Ausparken!
3. Cửa sổ #2, 60.92–65.94s: Pack/park and presence of Ich vary, with Perfekt hallucinations in wider small crop; no stable exact wording. Biến thể: Pack aus! / Park aus! / Ich pack aus! / Ich park aus! / Mich pack aus! / Perfekt!
4. Cửa sổ #3, 65.94–68.72s: Shout differs between ans Steuer/ansteuern/ans Feuer; SpongeBob name distorted. Grammar/context is not sufficient to choose exact words. Biến thể: Lass mich an, Stöberspund! / Lass mich ans Steuerspunk! / Lass mich ans Feuer! / Lass mich ansteuern, Spongebob!
5. Cửa sổ #3, 68.86–70.26s: Repeated Ich pack/park aus calls remain lexically unstable across full-context medium and small/targeted medium. Biến thể: Ich pack' aus! / Ich park aus!
6. Cửa sổ #3, 73.70–75.46s: Resolution before Schön disagrees on ausgepackt/ausgeparkt; do not repair from the visual parking joke. Biến thể: Ich hab' ausgepackt. / Ich hab ausgeparkt.
7. Cửa sổ #3, 76.34–77.72s: Reply after Schön has ausgepackt/ausgeparkt disagreement; only the separately stable Schön is accepted. Biến thể: Du hast ausgepackt. / Du hast ausgeparkt.
8. Cửa sổ #6, 261.22–269.29s: Name/call varies (Spanisch/Sponge/Spongi/SpongeBob); some output includes the already-published Schwamm drüber tail. Earshot Speech 0.656/Music 0.677 does not verify exact German words. Biến thể: Kommt rüber, Spanisch! / Komm drüber, Spongebob! / Spongi? / Sponge?
9. Cửa sổ #7, 270.90–274.41s: Main/tight/context ASR yields nonlexical Ha/Ah, prolonged HÄ or no stable words. Earshot Music 0.433/Speech 0.252 cannot settle whether it is a lexical call, sob or effect. Retain for human listening; do not declare absence of speech. Biến thể: Ha ha ha... / HÄÄÄ... / Ah, ah...

Tất cả 9 phần ở riêng `review.json`, ngoài captions/practice/VTT/picks/flashcards. Không suy ra `park` hay `ans Steuer` chỉ từ cảnh lái xe. Không kết luận chắc tiếng người #7 chỉ là tiếng cười hoặc không có thoại.

## Phần loại trừ/không thêm bản sao

- #1, 51.57–52.10s: Tail of existing 1200115; do not duplicate or adjust old timestamps.
- #3, 77.92–79.18s: Existing 1200117; contextual ASR phrase overlaps the published question.
- #4, 87.78–89.70s: Existing 1200119; only the following independent sentence is newly accepted.
- #4, 92.66–104.30s: Song following the accepted spoken sentence; excluded under the package song policy, regardless of ASR lyric variants.
- #5, 168.18–197.83s: Krosse Krabbe Pizza singing/beatboxing performance; outside selected spoken dialogue per Muse package. Earshot gives singing hint z3.38 (unvalidated), Speech0.417/Groan0.449/Music0.334; classification is mixed and does not verify lyrics.
- #6, 260.60–261.22s: Tail of existing 1200154 Ach, Schwamm drüber.; no duplicate cue or timing change.

Vùng hát được loại theo quy ước gói Muse và chuỗi biểu diễn trong audio/ASR. Earshot chỉ cho phân loại rộng: vùng #5 có gợi ý singing z3,38 nhưng là gợi ý chưa hiệu chuẩn, Speech0,417/Groan0,449/Music0,334; không được dùng nó để xác nhận lời hát hay lời Đức.

## Nguồn và nhận dạng độc lập

- Video gốc `video/spongebob_pizza.mp4`, 17.860.400 byte, SHA-256 `241c5cf57f3e8fe37942d779591275629bd3674669d733d63b8348027e6b0b98`, thời lượng 301,139592s, 640×360. Khớp hồ sơ nguồn và LFS pointer. Đúng đoạn trích 5 phút của Nickelodeon Deutschland, không phải toàn tập phát sóng. Dùng tệp có sẵn, không recode, không upload hay phát hành media mới.
- Audio 16k mono float32: 4.818.234 mẫu, SHA-256 `a98be2abb37b95caededb954cc7ab49fb0fccde3a133b79a03b12990c8b58c02`. Tất cả lượt chạy dùng cùng nguồn.
- Anti: **10 lượt** blind ASR trên 5 khối chồng lấn × small/medium, `independent-*-full.json`; không dùng cue cũ/ASR Muse làm prompt.
- Codex: **38 lượt** = 7 cửa sổ chính × 2 model + 12 cửa sổ hẹp/rộng × 2 model, `codex-*-main.json`, `codex-*-recheck.json`. Tổng **48/48 lượt hoàn tất**.
- CPU int8, 3 threads, tiếng Đức, beam5, temperature0, word_timestamps=true, condition_on_previous_text=false, VAD=false; không initial_prompt hay hotwords. Raw giữ nguyên segment/word/probability/crop.
- Python mặc định với CTranslate2 4.8.2 bị native access violation lúc nạp model. Chuyển sang môi trường cô lập có sẵn `tmp/peppa-align-venv` (CTranslate2 4.6.0) và chạy thành công; không cài/thay package toàn máy. `RUNTIME-NOTE.md` ghi rõ. Lượt Anti debug đầu dừng sau khi đã tìm được runtime hoạt động; toàn bộ bằng chứng thành công ở tệp raw trên.
- Đây là nhận dạng máy + kiểm kỹ thuật, `humanListened=false`; chưa có người nghe duyệt từng từ. `review.json` là quyết định cuối của Codex, `ANTIGRAVITY-HANDOFF.md` nếu có là ý kiến kiểm tra phụ.

## Kiểm tra

- `npm run test:unit`: **21/21 bộ đạt** (`unit-test.log`).
- E2E sẵn có của SpongeBob: **3/3 đạt** (`e2e-test.log`: catalog/video/CC/từng chương/luyện tập/mobile/lưu tiến độ). Lần lọc đầu dùng regex quá chặt không chọn test nào; giữ log riêng `e2e-initial-selector.log`, rồi chạy đúng ba test của phim.
- Player Chrome thật bằng CUA: **14/14 mốc seek đạt**, gồm 9 mốc trước/giữa/sau 3 cue mới và 5 mốc kiểm âm tính ở phần review. Đức/Việt khớp, video phát/seek được, duration đúng, readyState4, video.error=null, console error=0. Ảnh `player-new-cue-desktop.png`; `player-verification.json` ghi rõ lượt này tự kiểm desktop, mobile được kiểm ở E2E.
- Audit: cue cũ bất biến, không overlap/trùng ID, cue mới thuộc đúng một chương, chương/picks/cards bất biến, metadata/JSON/VTT 63 đồng bộ. `verify-evidence.py`: cả 3 cue có literal small/medium, từ evidence đúng raw/crop và không bị mốc chọn cắt mất; toàn bộ 60 cue nguồn và vocabulary giữ nguyên.
- Builder hiện hữu `scripts/build-kino-short-lessons.py` tái tạo từ `qa/kino-alignment/spongebob_source_20261024/lesson-content.json`; không sửa builder/player dùng chung. Bản lesson JS không cần đổi vì nội dung chương/picks/cards giữ nguyên.
- `vercel.json` chỉ thêm chặn tự deploy nhánh SpongeBob hiện tại, giữ nguyên cấu hình mọi nhánh khác. Chưa merge, chưa chạy deploy; nhánh dừng để Muse kiểm tra và chị duyệt.

## Tái kiểm

```powershell
node qa/kino-alignment/spongebob_pizza_missing_20261027/capture-baseline.cjs
python qa/kino-alignment/spongebob_pizza_missing_20261027/finalize-review.py
python qa/kino-alignment/spongebob_pizza_missing_20261027/integrate-review.py
node qa/kino-alignment/spongebob_pizza_missing_20261027/audit-final.cjs
python qa/kino-alignment/spongebob_pizza_missing_20261027/verify-evidence.py
npm run test:unit
npx playwright test e2e/kino-familiar-animation.spec.js --grep "spongebob:"
```
Nhận dạng lại bằng Python của runtime đã kiểm ở RUNTIME-NOTE.md, với `run-targeted-asr.py` và `run_independent_asr.py`, tệp numeric spec đi kèm. Cần có đúng video gốc (LFS pointer không đủ).
