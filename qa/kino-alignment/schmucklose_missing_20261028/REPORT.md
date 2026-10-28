# Die schmucklose Gräfin — kiểm chứng câu thiếu, 28/10/2026

**Kết quả: xét 7/7 cửa sổ, thêm 5 cue, 166 → 171 caption/practice; 3 phần reviewNeeded, 12 phần loại trừ.**

Nhánh `codex/kino-schmucklose-missing-lines`, base main `215992fdb9663e7410b6e58ea8a7c2ee29c7ef9d`. Đây là bản chờ chị/Muse kiểm; chưa merge, chưa deploy. DRUCK vẫn ở nhánh riêng `88f7ae2`, không được đưa vào base lần này.

166 caption và 166 practice cũ giữ nguyên **từng trường**, kể cả ID/parentId, Đức/Việt, speaker và mốc. Giữ **7 chương / 49 picks / 24 thẻ**, 32 file aligned phim khác, dữ liệu chương/picks dùng chung. Metadata chỉ đổi cueCount của phim này. Không sửa player, cơ chế ghi âm, bảo mật hoặc media.

## Năm câu bổ sung

| ID / parentId | Giây tuyệt đối | Người nói | Đức | Việt |
|---|---|---|---|---|
|1000280|92.30–93.24|Gräfin|Ja, natürlich.|Vâng, tất nhiên rồi.|
|1000281|94.18–94.76|Gräfin|Hier.|Đây này.|
|1000282|95.52–97.30|Gräfin|6,38 Meter.|6,38 mét.|
|1000283|532.61–533.99|Hannelore Elster|Ihr Schmuck?|Đồ trang sức của bà sao?|
|1000284|534.19–536.43|Gräfin|Ja, mein Schmuck.|Vâng, đồ trang sức của tôi.|

`review.json` là quyết định cuối, có tham chiếu file/crop/segment/wordRange và đầy đủ từ/mốc/probability đã chọn. Chỉ chuẩn hóa hoa/thường/dấu câu ở năm câu trên; không sửa từ theo ngữ pháp. Mốc là bao hợp các từ được chọn, không cắt/clamp để tránh cue cũ. Không có chồng mốc hoặc trùng ID/parentId; mỗi cue nằm trọn đúng một chương.

Các giới hạn cụ thể vẫn được lưu:

- **Ja, natürlich:** Ja có xác suất thấp (~0.21) ở small main; các crop rộng của cả hai model cùng nhận đúng. Crop chỉ lấy khoảng trống lại ra Die war(en) natürlich; không xóa biến thể đó.
- **Hier:** Anti medium crop rộng bỏ từ này. Cả hai model main của Codex và medium recheck mới đều nhận literal Hier; vì thế Codex bổ sung, khác đề xuất giữ treo ban đầu của Anti. Không dựa vào medium cũ để bù model thiếu.
- **6,38 Meter:** giữ đúng con số. Small main viết m.; bằng chứng literal Meter được lấy từ small độc lập của Anti và medium main. Mốc riêng từ Meter của medium dài 0 giây; giữ raw nguyên vẹn, không giả tạo khoảng từ. Bao câu chứa cả mốc số medium và từ Meter có độ dài dương của small.
- **Ihr Schmuck:** medium main sinh thêm Schmuck ở trước Ihr; hai crop rộng và hai gap recheck đều chỉ có Ihr Schmuck. Không thêm một lượt Schmuck giả. Ảnh `anti-frame-533.4s.jpg` cho thấy Hannelore mở mỏ, Wilhelm bên cạnh ngậm miệng. Đây là bằng chứng hình ảnh/ngữ cảnh, không phải nghe giọng xác nhận.
- Câu cuối giữ cả khoảng dừng trước mein; kết thúc536.43, trước cue cũ1000222 bắt đầu536.46. Không thêm etwa/gestohlen thành câu mới hoặc sửa câu hỏi cũ.

## ID và hồ sơ nháp

Các ID **thực sự quan sát được** trong file nguồn còn lưu có max1000266; dãy công khai1000101–1000266 liền mạch. Tuy nhiên README nguồn ghi có một **bản nháp179cue trước khi đánh số lại**. Toàn bộ bản nháp không còn trong file được lưu; lịch sử Git của bộ nguồn chỉ có commit nhập kho `dace3128`.

Nếu bản nháp đó chạy liền từ1000101 thì có thể tới1000279. Đây là **suy luận để dự phòng**, không phải bằng chứng đã nhìn thấy từng ID1000267–1000279. Codex dự phòng qua1000279 và dùng1000280–1000284, thay vì mặc định các số267–279 chưa từng dùng. Không lấp hoặc đổi bất kỳ ID cũ. `source-id-audit.json` tách maxRetainedSourceId và conservativeReservedThroughId rõ ràng. Anti trình bày dãy nháp như chắc chắn hơn mức bằng chứng cho phép; báo cáo gốc của Anti được giữ nguyên để đối chiếu.

## Ba phần reviewNeeded — ngoài toàn bộ học liệu

| Cửa sổ | Khoảng trống | Lý do giữ treo |
|---|---|---|
|3|202.28–207.82|Das ist… lặp; small Papalapap/Pappalapap, medium Pappalapapp. Small main sinh4lượt, trong đó lượt4 gần0giây; các crop khác3lượt. Medium main căn Das đầu sớm vào cue1000143. Hình có cả Gräfin và Wilhelm, chưa có xác nhận giọng. Không tự chốt chính tả/số lượt/người nói.|
|4|257.04–258.98|Und là phần dẫn vào câu Wie kann man… đã có1000154, mốc đổi từ ngoài sang trong cue cũ giữa các crop. Không thêm một mảnh liên từ hoặc retime câu cũ.|
|5|391.22–399.54|Các crop Codex thiên Augen wachen; small rộng Anti ra Augen machen. Không thay theo thành ngữ. Ja đầu chạm cue1000191; các tiếng gọi sau còn Steh mal/Stehen bleiben, einhechten/einhalten. Raw rộng kéo đến400.12 và chạm cue1000192; giữ raw đầy đủ, không cắt từ để tạo cue mới.|

Anti đề xuất thêm khối lặp#3 và giữ Hier#2; quyết định Codex cuối **giữ#3, thêm Hier** nhờ crop mới, đồng thời bảo lưu gap#4. Cùng con số5đề xuất không có nghĩa cùng5câu. `ANTIGRAVITY-HANDOFF.md` là đề xuất độc lập, **không** phải danh sách171cue cuối.

## Mười hai phần loại trừ

Chi tiết từng mốc/ID ở `review.json`. Gồm **10 phần thuộc câu cũ**, **1 phần nhạc hiệu**, **1 phần thán âm/hesitation**:

- #1: nhạc hiệu1.78–26.12. Earshot Music0.580; chính sách không bổ sung bài hát, không suy lời từ nhãn âm thanh.
- #2: câu hỏi1000120; Fein/Feins ở mép crop là đầu Feinste Strickware1000121 trong crop rộng, không thêm một lời khen riêng.
- #3: đuôi1000143 và đầu Hier drin war… của1000144.
- #4: Köstlich1000153 và phần câu cũ1000154.
- #6: đuôi1000221 và câu hỏi1000222. gestört trong quét Muse được crop rộng nhận lại gestohlen, nhưng câu đó đã có, không thêm trùng.
- #7: Dick thuộc1000247; Oh/äh thay đổi theo crop, không thành câu chọn lọc; Hier/bitte/danke thuộc1000248. JSON Muse liệt kê cue trước247/sau249 và bỏ qua248, nên không được coi toàn khoảng này là trống.

Số phần không cộng thành số cửa sổ. Khoảng loại trừ có thể chạm mốc cue cũ vì mục đích ghi nguồn trùng, không phải cue học mới.

## Nguồn và cách kiểm

Video local nguyên bản `video/erdmaennchen_schmucklose.mp4`: **269,615,835byte,722.48giây,1280×720**; SHA256 `037acc3d885e731b24cc18649599191f55c1a184ba1627fb85562e8fd52b944a`, khớp LFS/source-info. Dùng bản sẵn có ở checkout chính, không tải một bản thay thế/recode/upload media. Audio giải mã16k mono f32 dài722.496giây, SHA256 `007f9066021b6efb2554026087699969c5caff004549b11bce5db37b9b096572`; mọi lượt cùng hash.

**48/48 crop hoàn tất:** Codex34 (7main+10recheck mỗi model), Anti14 (7crop rộng±5giây mỗi model). small+medium local CPUint8/threads3, de/beam5/temp0/word timestamps, không initial_prompt/hotwords/condition previous text/VAD; model cache local. Anti khai nhận dạng cả14crop xong trước khi đọc gói/cue cũ. Không dùng lời ASR Muse làm mồi. Runtime có sẵn CT2 4.6.0; không thay môi trường toàn máy.

Earshot7đoạn đã lưu: chỉ phân loại âm tổng quát, không xác nhận chữ Đức hay người nói. **humanListened=false**; đây chưa phải người nghe tiếng Đức duyệt. Ảnh nguồn và12ảnh Codex/11ảnh Anti được lưu cùng QA.

## Tích hợp và kiểm tra

- Builder cũ chạy thử trước bổ sung tái tạo đúng166cue. Thêm nguồn `qa/kino-alignment/erdmaennchen_schmucklose/missing-dialogue-20261028.json`; builder chỉ chèn năm cue với mốc đã kiểm **sau** quy trình căn mốc cũ và assert toàn bộ166đối tượng bất biến. TSV/recognized words/rechecks cũ giữ nguyên. Không căn lại cue mới theo ASR lịch sử.
- Chạy lại builder và metadata builder: **8/8 file đầu ra byte-identical** (`build-determinism.json`). Chạy builder cần hydrate video gốc; LFS pointer vẫn được giữ khi commit. Bản media local kiểm nằm ở ignored `tmp/source-cache/erdmaennchen_schmucklose.mp4`.
- `audit-final.cjs`:171captions/practice/VTT/metadata,166đối tượng cũ và audit cũ bất biến,7chương/49picks/24thẻ bất biến,32aligned khác và shared chương/practice nguyên vẹn;0trùngID/parentId,0overlap,3phần review ngoài học liệu. `verify-evidence.py`:48crop hoàn tất/cùngvideoPCM,5/5cue literal khớp cảmodel và mốc bao đầy đủ từ đã chọn.
- **21/21 unit suite đạt** (`unit-test.log`).
- **5/5 E2E chuyên biệt Schmucklose đạt** (`e2e-test.log`): catalog,7phần/playback/CC/biên chương/171cue,dictation/lưu tiến độ,24thẻ,mobile320/390/768và thu-phát lại microphone giả. Byte range206 và full video cũng đạt.
- Lần E2E đầu3/5đạt: hai test cũ lỗi cả trên base. (1) Mong đợi1000130 mặc dù practice shortlist đã có1000131. (2) fetch(blob:) bị connect-src của CSP chặn, trong khi phát audio qua media-src được phép. Sửa **test** sang đúng ID và kiểm URLblob/readyState≥2/duration>0 của bản phát lại thật. Không sửa player/ghi âm/CSP. Log ban đầu và đối chứng giữ ở `e2e-initial.log`, `e2e-baseline.log`, `e2e-baseline-media.log`. Lượt baseline đầu thiếu fixturemedia; đã hydrate cùng video rồi xác nhận lại lỗi fetch trên base. Media fixture ở worktree đối chứng đã trả lại LFS pointer.
- Trình duyệt thật local3131: **23 điểm kiểm đạt**, gồm trước/giữa/sau cả5câu, câu cũ lân cận và các vùng chờ duyệt trống; video play/seek722.48s1280×720,CCtắt/bật,**0consoleerror** (`browser-player-verification.json`, `player-new-cue-desktop.png`). E2E có mobile; không gọi các ảnh nguồn là kiểm player.
- `vercel.json` chỉ chặn tự deploy đúng nhánh Schmucklose. Main/các nhánh khác không đổi. Chưa tạoPR, merge hay deploy.

## Nhờ Muse kiểm độc lập

Kiểm đúng commit nhánh bàn giao so với base;5câu mới và3review, đặc biệt Hier, số6,38/Meter, nhãnHannelore/Gräfin, chênh mốc với cue cũ, dự phòngID280+. Đối chiếu literal/raw và giải trình khác Anti. Chạy test/player trong khả năng, khai rõ giới hạn; không chốt phần treo hoặc merge/deploy khi chưa có chị duyệt riêng.
