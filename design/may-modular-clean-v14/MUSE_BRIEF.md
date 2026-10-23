# May_modular_clean_v14 — Bộ tài nguyên tách lớp cho game Mây

Mục đích: dừng chuỗi sửa toàn cảnh (ảnh bị lem/xước sau nhiều lượt edit). Từ bộ này, Codex ghép các lớp bằng code và di chuyển vật bằng code, không qua AI nữa.

## Thành phần (7 ảnh)

1. `May_modular_background_v14.png` — nền ĐÓNG BĂNG, 1600×1600, RGB.
   - Tạo bằng đúng 1 lượt EDIT từ `May_home_soul_house_v10.png`: bỏ mèo giữa sân, bỏ ghế trên đảo phụ trái, bỏ đệm + sách ở hiên (khôi phục cỏ/sàn).
   - Giữ: nhà kem mái lá, hiên/cửa/rèm/hoa/đèn, cây/bụi/đá, nước mint/bờ đảo, cầu gỗ và giỏ tre trên cầu.
   - Không chứa: bảng táo, hộp phim, bàn chơi, bè, ghế, đệm, mèo.
   - Nền này không được đưa qua bất kỳ lượt edit AI nào nữa.
2. `apple-board.png` — giá bảng gỗ, mặt giấy kem, một quả táo cam đỏ + lá xanh, đủ hai chân. Khu Học từ.
3. `porch-cushion.png` — đệm xanh mint hình thoi theo phối cảnh hiên, mặt TRỐNG, không sách.
4. `vintage-viewer.png` — hộp xem phim quay tay ĐỎ ĐẤT, viền kem, ống nhìn đồng tâm tối, tay quay đồng bên hông. Bấm hộp sẽ mở khu Nghe & xem khi làm code.
5. `reading-chair.png` — ghế gỗ đệm kem với đúng MỘT sách mở. Khu Thư viện.
6. `play-table.png` — bàn tròn gỗ thấp, thẻ úp trơn + hai quân gỗ. Khu Chơi & Ôn.
7. `fishing-raft.png` — bè tre + cần cành cây một lá, dây và phao. Ghép nổi trên nước cạnh hông trái cầu trong nền.

Không có nhân vật Mây trong bộ này — Codex dùng sprite độc lập từ ảnh chuẩn `May_original_reference.png`.

## Cách tạo alpha (minh bạch nguồn)

- Muse Image không xuất alpha trực tiếp. Mỗi vật được tạo mới (1 lượt/vật) trên nền magenta trơn #FF00FF; file gốc giữ ở thư mục `raw/`.
- Tách nền bằng `keyout.py` (đi kèm trong ZIP) dùng PIL/NumPy sẵn có trong môi trường Muse: alpha theo khoảng cách màu tới key, despill giảm sắc hồng ở mép, co alpha 1px chống rèm nền.
- Không dùng rembg, không gửi dữ liệu ra dịch vụ ngoài.
- Mọi file vật đều là PNG RGBA có kênh alpha thật (đã kiểm tra alpha min 0 / max 255 và mở ghép thử trên nền tối + nền sáng).

## Vị trí gợi ý khi ghép (theo bố cục v13c, chỉ tham khảo)

- porch-cushion: trên sàn hiên, vị trí đệm cũ của v10.
- vintage-viewer: trên sàn hiên, cạnh cột trước, tách khỏi đệm.
- reading-chair: đất chính sát rìa sân phía trái nhà.
- apple-board: bên phải Mây ở giữa sân (theo v13b/v13c — cách Mây một khoảng thở rõ, chân bảng ngang hàng chân Mây).
- play-table: dưới sân lệch phải, chừa lối ra cầu.
- fishing-raft: nổi trên nước sát hông trái cầu gỗ, cách cầu một khe nước nhỏ.

## Lệch đã biết (báo trung thực)

- fishing-raft: bè có 7 thanh tre (brief ghi 5–6); lá nằm trên nhánh phụ gần giữa cần thay vì sát đầu cần.
- porch-cushion, play-table, fishing-raft: công cụ trả khung ngang 1920×1280 thay vì vuông; các file còn lại 1600×1600. Nội dung vật đầy đủ, không bị cắt.
