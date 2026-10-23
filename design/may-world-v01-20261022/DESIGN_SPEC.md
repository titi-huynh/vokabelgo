# Thế giới của Mây — Bộ hồ sơ thiết kế v01

Ngày: 22/10/2026. Trạng thái: concept mỹ thuật và prototype tương tác để chị duyệt. Đây chưa phải trang chủ sản phẩm đã tích hợp, game hoàn chỉnh, rig nhân vật hoặc bộ background tách lớp.

## 1. Ý định thiết kế

Mở trang là vào thế giới của Mây: Mây đứng trên đường trước nhà trên đảo, nhà có bến nước và bè, các địa điểm là lối vào hoạt động học. Các vùng nước tạo hành trình khám phá dài hạn. Ảnh Fuxie chị gửi là tham khảo cách dùng cảnh vật làm điều hướng. Các ảnh bổ sung làm rõ cabin gỗ, mái ngói xanh, đảo có sinh cảnh riêng và quầy cá. Tất cả được chuyển sang minh họa 2D theo nét Mây gốc.

Hai cấp không gian:

- **Đảo nhà:** nơi bắt đầu, quay về, xem hồ sơ và mở hoạt động học. Có thể vào bài ngay, không cần đi qua chuỗi thao tác du lịch.
- **Hải trình:** chọn cảnh quan/vùng nước và gặp câu chuyện mới. Trình độ, bộ từ và lịch ôn được chọn riêng; mở vùng là tiến trình thế giới, không tự chứng minh trình độ tiếng Đức.

## 2. Hồ sơ Mây

Chuẩn duy nhất: `art/may-canonical-reference.png`, bản sao ảnh chuẩn của dự án. Không dùng các thiết kế Muse A/B/C đã bị từ chối hoặc các mèo khăn vàng/tạp dề trong hồ sơ cũ làm chuẩn mới.

Nhận diện: mèo tam thể kem–cam–xám đậm, đầu bo rộng, chân tay ngắn; cam ở trái ảnh gốc, xám ở phải và sườn; đuôi cong có mảng cam/đậm; mắt oval/chấm nâu nhỏ không lòng trắng, không điểm sáng/lông mi; mỗi má hai nét xiên coral; mũi nhỏ và miệng cong; khăn xanh tam giác nhỏ ở trước cổ, không nơ hoặc tạp dề. Đường viền nâu mềm và chất liệu/chuyển sắc ấm của ảnh gốc.

Tính cách: hiền, tò mò, hơi lười, thích cá và nghịch nước; hài qua hành động vụng về nhỏ. Mây là bạn đồng hành; không mắng, mất cá hoặc trách người học vì sai/nghỉ.

Giọng nói: ngắn, ấm, cụ thể. Ví dụ “Bạn đến rồi”, “Mình thử lại nhé”, “Mình nghỉ một chút cũng được”. Tiếng Đức: “Hallo, du!”, “Versuchen wir es noch einmal.” Nội dung học chính thức cần biên tập và kiểm tra phát âm riêng.

Sheet mới: 3 tư thế (đứng chào, ngồi, câu cá) và 6 biểu cảm (bình thường, vui, tò mò, suy nghĩ, buồn ngủ, động viên). Đây là pose/biểu cảm đề xuất, chưa có thiết kế mặt sau được chốt, chưa phải sprite/rig đã cử động được. Các pose mới cần đối chiếu tỷ lệ đầu/thân và mảng lông với ảnh gốc trước khi khóa sản xuất.

Hồ sơ người học trong nhà: tên gọi, ngôn ngữ giao diện, bộ từ/trình độ chọn, mục tiêu vừa sức, lịch ôn, vùng đã ghé, vật kỷ niệm. Bằng chứng học và đồ trang trí hiển thị riêng.

## 3. Đảo nhà và công năng

| Địa điểm | Công năng | Trạng thái Mây |
|---|---|---|
| Nhà mái xanh | Hồ sơ, tiến độ, lịch ôn, góc trang trí | Đứng chào, quay ra khi người học trở lại |
| Hiên vườn đọc | Đọc truyện, nghe từng câu, Kino/phụ đề | Ngồi xem/nghe, chuyển động rất nhẹ |
| Bè học từ | Buổi ôn đến hạn, từ mới, gõ đáp án | Chờ phao, nhìn người học, câu cá sau tổng kết |
| Bến chợ/quầy cá | Hội thoại theo ngữ cảnh, đơn hàng, đổi đồ | Giao tiếp và bưng giỏ; động tác cần dựng sau |
| Bảng hải trình | Chọn vùng nước, xem sổ khám phá | Chỉ đường hoặc lên bè |
| Góc sửa đồ (mở rộng) | Đồ nhặt, vật liệu và vật trang trí | Tò mò xem đồ; có thể gặp bạn gấu mèo |

Phương án làng học `may-village-hub.png` bố trí sáu công năng trên một đảo. Cảnh chính `may-home-island.png` được tạo sau ảnh bổ sung, ưu tiên một nhà, hiên, bến và mặt nước thoáng. Chị có thể duyệt hướng này trước khi phát triển các địa điểm độc lập.

Nguyên tắc UI: chữ/nút là HTML, không dính vào tranh; vùng bấm đủ rộng và có bàn phím; luôn có danh sách địa điểm tương đương bên dưới bản đồ. Điện thoại dùng khung kéo ngang giữ kích thước cảnh đọc được, canh Mây gần giữa khi mở lần đầu. Trong sản phẩm thật có chế độ danh sách để vào bài nhanh. Background có chuyển động phải dừng được và tôn trọng giảm chuyển động.

## 4. Cảnh quan và hải trình

Phong cách: 2D vẽ tay, góc 3/4 nhẹ, khối đọc rõ nhưng phối cảnh nông; viền nền mảnh/nhẹ hơn nhân vật, ít vật nhỏ trong vùng câu hỏi. Nước là mảng xanh ngọc có nét sóng cong; cây thành cụm, mái nhà/gỗ có vài dấu chất liệu. Màu dự kiến: kem giấy #FFF6E6, nước #29B8BD, cỏ #9FC55A, khăn #4E6BC6, gỗ #D7954F, viền #493120. Đây là bảng màu đề xuất, không phải màu lấy mẫu kỹ thuật tuyệt đối từ mọi pixel ảnh gốc.

Sáu vùng được minh họa trong bản đồ:

| Vùng theo kế hoạch cũ | Đặc điểm riêng | Kỷ niệm dự kiến |
|---|---|---|
| 01 Ao Cỏ May | Nước ngọc, bờ lau, chuồn chuồn, bè ban đầu | Ủng trồng hoa |
| 02 Đầm Sen Ngủ Gật | Lá sen lớn, hoa hồng, ếch và giọt nước | Lá sen làm ô |
| 04 Bến Chợ Nổi | Thuyền rau/cá, mái vải, bạn hàng và sửa đồ | Giỏ và đồ sửa |
| 08 Vịnh Vỏ Sò | Cát kem, vỏ ốc, sóng thấp | Vỏ sò |
| 15 Vịnh Đèn Lồng | Nhà ven bờ, đèn vàng, nước chàm | Đèn treo bè |
| 18 Hồ Trăng Rơi | Tím bạc, trăng phản chiếu, đom đóm | Kỷ niệm Cá Trăng hư cấu |

Hải trình đầy đủ 20 vùng vẫn giữ theo tài liệu `../ke-hoach-da-chot-2026-10-21/02-so-kham-pha-va-vung-nuoc.txt`. Sáu vùng trên là tuyển chọn minh họa, không thay đổi thứ tự lịch sử hay coi 14 vùng còn lại đã có tranh/game.

Vòng khám phá: học → nhận kỷ niệm/vật liệu hợp lệ → sổ khám phá → làm đẹp nhà/bè → chọn vùng tiếp theo. Cảnh đêm/mưa có thể chọn theo sở thích, không đòi người học phải online đúng giờ. Chưa chốt ngưỡng mở vùng, tỷ lệ cá hiếm, quy đổi xu hay kinh tế game.

## 5. Workflow trải nghiệm học

1. **Đến đảo:** Mây chào, hiện lời mời ngắn và buổi học đang dở. Có thể tiếp tục đúng chỗ hoặc đổi hoạt động.
2. **Chọn buổi học:** bộ từ, kỹ năng, lượng vừa sức; ưu tiên các từ đến hạn. Vùng nước là bối cảnh, không đổi dữ liệu học khi chuyển cảnh.
3. **Tự trả lời:** nghĩa/gõ từ/nghe/ngữ cảnh theo kỹ năng. Chưa mở đáp án trước khi thử. Nền chuyển động ít; bài nghe được ưu tiên âm thanh.
4. **Phản hồi:** đúng → ghi bằng chứng đúng loại; sai → lý do, gợi ý và thử lại; đã xem đáp án/gợi ý phải được ghi là có trợ giúp. Từ khó được gặp lại sau một khoảng, không chỉ đo việc chép lại ngay.
5. **Tổng kết:** số từ khác nhau, trả lời độc lập, có trợ giúp và từ cần ôn; nhận diện một lần không đồng nghĩa nhớ vững.
6. **Kỷ niệm:** sau kết quả mới chạy hoạt cảnh Mây kéo cá/nhặt đồ; có thể bỏ qua. Mỗi phần thưởng có mã lượt, ghi một lần; không thưởng lặp qua nút phát lại.
7. **Về đảo:** lưu kết quả học, cảnh/vùng và đồ trang trí theo các miền riêng. Người học có thể nghỉ hoặc học thêm.

Prototype trong tab Luồng học chỉ minh họa 1 câu chọn nghĩa “die Insel”. Có đường đúng lần đầu và sai → xem sửa → thử lại; gợi ý được đánh dấu trợ giúp. Không ghi localStorage, không gọi backend, không phát âm giả, không cấp SRS/xu/cá thật.

Trạng thái nhân vật dự kiến: `home_idle → route_select → study_wait → feedback_success / gentle_retry → summary → reward_optional → return_home`. Thời gian nhàn rỗi mới kích hoạt nghịch nước/ngáp; đang nhập hoặc nghe chỉ có chuyển động nhỏ. Pause/ẩn tab/giảm chuyển động áp dụng toàn cảnh khi triển khai animation thật.

## 6. Workflow sản xuất asset và video

1. Khóa tạo hình bằng ảnh gốc + sheet được duyệt. Khóa một góc máy và tỷ lệ nhân vật so với nhà/bè.
2. Từ key art được chọn, tạo asset sạch theo lớp: nền nước, bờ/đảo, nhà/hiên, cầu tàu, bè/đồ dùng, nhân vật, tiền cảnh, bóng và hiệu ứng. PNG hiện có là ảnh gộp; chưa có các lớp này.
3. Dựng state/animation nhỏ: đứng chào 3–5 giây, chờ 5–8 giây, phản hồi 1–2 giây. Chỉ thêm kéo cá sau khi tư thế cầm cần và tiếp xúc chân đạt.
4. Nếu dùng Muse: mỗi shot đưa đúng ảnh nhân vật/cảnh làm tham chiếu; một hành động mỗi shot; kiểm tra mắt, má, khăn, mảng lông, viền và đồ vật ở đầu/giữa/cuối. Bộ nhớ hướng dẫn không phải fine-tune hoặc bảo đảm giữ nét.
5. Nội dung Đức: xác định mục tiêu ngôn ngữ → kịch bản Đức → biên tập → giọng đọc → dựng cảnh → phụ đề Đức/Việt → bài tập web. Cảnh minh họa không tự thay vai trò nội dung/bằng chứng học.
6. Ghép UI bằng HTML/CSS, xử lý thao tác/bàn phím/âm thanh và dữ liệu học bằng code. Giữ chữ ngoài video/ảnh; có chế độ chuyển động thấp.
7. Kiểm tra máy tính/điện thoại, hitbox, bộ từ thật, tiến độ, phát lại, âm thanh và lượt thưởng trước khi tích hợp trang chủ.

## 7. Asset và nguồn

Bốn ảnh mới tạo bằng built-in image_gen, prompt nguyên văn trong `GENERATION_PROMPTS.txt`:

- `art/may-home-island.png`: cảnh chính sau bộ tham khảo bổ sung.
- `art/may-character-profile.png`: 3 pose và 6 biểu cảm đề xuất.
- `art/may-world-map.png`: concept 6 vùng nước.
- `art/may-village-hub.png`: phương án mở rộng làng học.

`art/may-canonical-reference.png` là bản sao nguồn đã có, không phải ảnh mới. Danh sách nguồn và vai trò trong `REFERENCES.md`. Tất cả bản mới đang chờ duyệt; không gọi là nét gốc giữ nguyên 100% hay bộ asset sản xuất hoàn chỉnh.
