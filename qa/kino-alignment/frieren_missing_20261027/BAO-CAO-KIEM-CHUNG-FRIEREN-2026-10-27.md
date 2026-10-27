# Frieren S01E02 — kiểm chứng câu thiếu, 27/10/2026

Đã xét **12/12 cửa sổ** từ gói Muse bằng small + medium độc lập; tổng cộng 102 lượt nhận dạng có lưu raw, word timestamps và crop spec. Không dùng transcript Muse, cue cũ hay tên nhân vật làm prompt/hotwords.

**Thêm 8 cue; 235 → 243 cue.** Giữ nguyên toàn bộ 235 caption và 235 practice cue cũ ở mọi trường: ID/parentId, Đức/Việt, speaker, mốc, sourceEvidence và legacyIds. Chương, picks và flashcards được kiểm tra với baseline main d1204a4b47d41096f4e5b5d71e667be0de338413.

**Giải trình ID:** gói Muse ghi max ID công khai 1300243; dữ liệu nguồn đã có 247 draft và dùng ID đến 1300247, gồm bốn draft preview 1300244–1300247. Cue mới bắt đầu **1300248**, không lấp khoảng trống hoặc tái sử dụng ID nháp. Bản gốc của draft bị thay thế được giữ trong missingDialogueReview.supersededDrafts.

**Nguồn âm thanh:** máy hiện không còn raw input tập 2. Lượt này dùng archive 720p của kho media dự án, không mã hóa lại audio; SHA-256 tệp và PCM giải mã của cả 720p/480p khớp hồ sơ media gốc (media-verification.json). Đã kiểm đúng duration 1560.102313s. Không tự nhận có bản raw input để kiểm lại ngoài hồ sơ này.

**Giới hạn bằng chứng:** đây là kết quả máy, chưa được người nghe duyệt từng từ. Chỉ chuẩn hóa hoa/thường và dấu câu; không tự sửa ngữ pháp hoặc tên riêng từ ngữ cảnh. Phần chưa chốt giữ riêng trong reviewNeeded, ngoài captions/practice/picks/flashcards.

**Khác đề xuất Anti:** Anti đề xuất 9 cue sau 98 lượt ASR. Codex kiểm thêm 4 lượt trao đổi rộng và chỉ đưa 8 cue vào bản cuối: giữ riêng câu #7 có cách tách von ihr/von hier cần nghe tay, không tự sửa ASR theo nghĩa câu. Von hier là giả thuyết ngữ cảnh, không phải lời ASR đã xác nhận. Codex cũng giữ phần trước cue 1300068 ở #6 trong reviewNeeded vì chưa có lời Đức ổn định, thay vì kết luận chắc đó chỉ là âm phi từ vựng.

| ID | Ứng viên | Mốc | Người nói | Câu Đức | Nghĩa Việt |
|---|---:|---|---|---|---|
| 1300248 | 2 | 03:54.960–03:58.140 | Frieren | Ich werde mit dem Entschlüsseln des Buchs früher fertig werden. | Tôi sẽ hoàn tất việc giải mã cuốn sách sớm hơn. |
| 1300249 | 3 | 04:52.120–04:53.040 | Frieren | Doch jetzt... | Nhưng bây giờ... |
| 1300250 | 4 | 07:58.380–08:01.860 | Frieren | In dem Buch stand kein Wiederbelebungs- oder Unsterblichkeitszauber. | Trong cuốn sách không có phép hồi sinh hay phép bất tử nào cả. |
| 1300251 | 4 | 08:02.520–08:03.500 | Heiter | Ach, wirklich? | Ồ, thật vậy sao? |
| 1300252 | 4 | 08:04.200–08:05.080 | Frieren | Wusstest du das? | Cậu biết chuyện đó rồi sao? |
| 1300253 | 4 | 08:06.120–08:09.020 | Heiter | Die Angst vor dem Tod ist für uns unergründlich und tief. | Nỗi sợ cái chết trong chúng ta vừa sâu thẳm vừa khó thấu hiểu. |
| 1300254 | 4 | 08:09.620–08:13.720 | Heiter | Wenn es solche Zauber gegeben hätte, hätte Ewig diese selbst angewendet. | Nếu có những phép thuật như thế, hẳn Ewig đã tự dùng chúng cho mình rồi. |
| 1300255 | 4 | 08:14.400–08:15.460 | Frieren | Also wieso das alles? | Vậy thì tất cả chuyện này là vì sao? |

**Loại trừ/không thêm trùng: 11 phần.** Một cửa sổ có thể có cả phần thêm, phần loại trừ và phần chưa chắc; không cộng số phần để suy ra số cửa sổ.

- Ứng viên #1, 00:00.000–00:18.540: Giữ ngoài thoại học theo exclusions mở đầu có sẵn. Hình mở đầu và Earshot Music 0,775 / Speech 0,061 phù hợp nhạc; small lặp câu và SWR 2020, medium sinh lời chào kết thúc. Không dùng các chuỗi ASR bất ổn này làm lời Đức. Earshot không xác nhận ngôn ngữ hoặc từng từ.
- Ứng viên #2, 03:54.040–03:59.560: Đuôi cue 1300021 (231.88–234.56s) và đầu 1300023 (239.08–240.00s) đã có; chỉ câu ở khoảng trống được thêm với ID mới.
- Ứng viên #3, 04:51.220–04:51.780: schaffen. là đuôi cue 1300034 (288.92–291.78s), không thêm trùng hoặc đổi mốc cue cũ.
- Ứng viên #4, 08:16.940–08:17.940: Sag mir. là đầu cue 1300062 (497.26–499.14s: Sag mir, wie geht es mit Fern voran?), không tách lại thành cue mới; mốc cue cũ giữ nguyên.
- Ứng viên #5, 08:24.410–08:27.820: Magierin. thuộc đuôi câu đã có trong cue 1300064 (502.42–505.12s); crop rộng hai model nhận cả câu đó rồi Das ist gut. của cue 1300065 (506.70–508.04s). Không thêm một Magierin. trùng hoặc sửa mốc cũ dù crop cho đuôi từ lệch mốc.
- Ứng viên #6, 08:36.420–08:37.870: Würdest du sie… thuộc cue 1300068 (516.42–520.00s), được hai model xác nhận đủ câu trong crop rộng. Phần trước 516.42s cần duyệt riêng.
- Ứng viên #7, 08:58.620–09:00.340: Was hast du vor? đã có ở cue 1300074 (538.62–540.34s), không thêm trùng; câu xin rời đi trước đó giữ reviewNeeded riêng.
- Ứng viên #8, 09:40.760–09:46.800: Crop rộng cả hai model nhận Frieren, du hast wirklich ein gutes Herz., chính là cue 1300082 (582.73–586.65s). Các từ Feiern?/Verirren? ở crop hẹp không được tự sửa thành một câu mới. Giữ nguyên cue cũ, không thêm bản sao tên gọi.
- Ứng viên #9, 16:00.650–16:02.270: Diese Monster fressen Samen. đã có trong cue 1300161, không thêm trùng; phát ngôn sau đó vẫn cần duyệt.
- Ứng viên #10, 20:34.420–20:36.570: Das ist nur ein Zeitvertreib. đã có ở cue 1300204 (1234.42–1236.57s). Câu hỏi trước đó giữ riêng để duyệt từ và mốc, không chép lại phần trả lời.
- Ứng viên #12, 25:49.690–26:00.100: Khung scene-preview-1558.jpg ghi rõ Episode 3 / Tötungszauber, xác nhận Vorschau tập 3 sau nhạc kết. Giữ ngoài thoại học tập 2; không chuẩn hóa các chuỗi ASR không ổn định hoặc tái dùng bốn ID draft 1300244–1300247.

**Cần người duyệt: 6 phần.** Một cửa sổ có thể có cả phần thêm, phần loại trừ và phần chưa chắc; không cộng số phần để suy ra số cửa sổ.

- Ứng viên #3, 04:53.260–04:54.860: Sau Doch jetzt…, small ghi Irgendwann reicht er aber nicht.; medium main/context bỏ er, medium crop hẹp có er. Bản draft có mir nhưng không được tự dùng draft để sửa. Giữ cả câu để người nghe xác nhận, không chốt dạng câu bằng ngữ pháp hoặc chọn một crop thuận ý.
- Ứng viên #6, 08:34.660–08:36.420: Small không có từ ở khe hẹp; medium khi có ngữ cảnh bỏ phần Mh, ở main chỉ có Mh trước đầu câu đã có. Chưa đủ xác nhận đây là một phát ngôn Đức riêng; giữ reviewNeeded, không suy diễn toàn vùng chỉ là tiếng hét/tiếng thở.
- Ứng viên #7, 08:56.000–08:58.940: Các lượt ASR, kể cả trao đổi đầy đủ 527–545.5s, đều chép euch… von ihr wegzugehen (medium crop ngắn tách weg zu gehen). Việc phân tách von ihr / von hier và đối tượng của lời xin cần người nghe kiểm; von hier chỉ là giả thuyết ngữ cảnh của Codex, KHÔNG phải lời ASR đã xác nhận. Không tự sửa hoặc đưa cách đọc chưa chốt vào chấm chính tả; bản timing medium context còn chạm cue cũ 1300074 nên không cắt từ để ép vừa.
- Ứng viên #9, 16:02.300–16:03.940: Small main có Ich bringe… với xác suất Ich chỉ 0,253, nhưng các crop hẹp/rộng và crop trao đổi đầy đủ 958–967.5s cho Nicht bringen…; medium cho Ich bring(e)… ở các lượt. Chưa phân xử được đầu câu giữa hai model, không chọn nghĩa thuận ngữ cảnh hoặc chuẩn hóa Ich/Nicht, bringe/bringen. Giữ nguyên draft 1300162 ở trạng thái chưa chắc, không đưa câu vào runtime.
- Ứng viên #10, 20:30.880–20:34.790: Small main/context ghi Freren/Friren và sag/sagt; crop chỉ tên có Frieren nhưng tiếp tục sagt, trong khi medium ghi Frieren… sag mal. Không ghép tên từ một crop với dạng động từ của crop khác để chế tạo đồng thuận. Một số word spans đến 1234.71–1234.79s còn chạm cue cũ 1300204 bắt đầu1234.42s. Giữ cả câu hỏi reviewNeeded, không sửa tên hoặc cắt từ để vừa cue cũ.
- Ứng viên #11, 21:10.700–21:12.740: Small main/tight/context đều cho Da wird er mir schlecht. (một crop sinh Ha lặp), medium cho Da wird einem ja schlecht. Hai model bất đồng từ nội dung; không sửa bằng thành ngữ quen thuộc hoặc ngữ cảnh hồi tưởng. Giữ reviewNeeded, không coi toàn phân cảnh là không có lời chỉ vì exclusions cũ ghi vậy.

**Hai vùng ngoài thoại tập:** khung hình scene-preview-1558.jpg ghi rõ “Episode 3 / Tötungszauber”, xác nhận preview tập 3. Phần đầu 0–18.54s được Earshot phân loại Music 0,775 / Speech 0,061; kết hợp hình mở đầu, raw ASR và quy ước exclusions có sẵn để phân loại, không coi Earshot là công cụ xác nhận tiếng Đức.

**Tái tạo dữ liệu:** integrate-review.cjs chỉ dựng riêng Frieren từ baseline main cố định, khoét các exclusions/uncertainty đúng phần câu được xác nhận. Không đổi builder dùng chung. audit-final.cjs kiểm đủ cue cũ, ID mới, toàn bộ draft cũ, chương/picks/thẻ, phim khác, metadata và khả năng builder tái tạo đúng.

**Kiểm tra cuối:**

- 21/21 bộ unit đạt (unit-test-results.txt).
- 3/3 E2E Frieren tập 2 đạt: từ vựng/tiến độ, viết-nghe-nói cùng cue, player song ngữ/chuyển chất lượng (e2e-test-results.txt).
- 8/8 cue mới đạt trên player video thật ở desktop, 24 seek trước/giữa/sau; mobile 390px kiểm 1 cue tiêu biểu, lỗi JavaScript: 0. Hai MP4 720p/480p đạt byte range, decode và seek/phát ở hai vùng (player-verification.json).
- Audit bảo toàn dữ liệu và builder: đạt (final-data-verification.json).
- Kiểm word evidence với raw outputs của cả hai model: đạt (evidence-verification.json).

**Trạng thái bàn giao:** nhánh codex/kino-frieren-missing-lines tạo từ main d1204a4b47d41096f4e5b5d71e667be0de338413. vercel.json chỉ thêm chặn tự deploy đúng nhánh Frieren này; main và các nhánh khác giữ nguyên. Chưa merge, chưa deploy; push xong gửi Muse kiểm tra và dừng chờ chị duyệt. Hash commit được ghi trong tin bàn giao.

proposed-review.json và ANTIGRAVITY-HANDOFF.md là đề xuất của Anti; review.json là quyết định cuối do Codex kiểm. Bằng chứng raw không bị sửa để khớp lời được chọn.
