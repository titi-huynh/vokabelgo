# BRIEF — May_clean_may_board_v15c (2026-10-23)

## Phạm vi chị chốt
- CHỈ làm sạch nét **Mây ngồi** và **bảng táo** trong ảnh đã duyệt
  `May_home_original_viewer_left_clean_v15b.png`.
- KHÔNG thay bè/ghế/bàn/nhà/đệm/nền, KHÔNG đụng hộp phim sạch v15b.
- Tổng 3 lượt Muse Image: Mây (1), bảng (1), edit nền B xóa 2 vật (1). Không biến thể thêm.

## Nguồn
- Crop EDIT TARGET cắt trực tiếp từ ảnh v15b: Mây x740..920,y785..960; bảng x1045..840..1160,840..960
  (lưu tại work/may_crop_target.png, work/board_crop_target.png).
- Nền canvas: `May_home_original_without_viewer_v15.png` (nền B của v15).

## Thành phẩm
1. `may-sitting-clean-v15c.png` — RGBA 1584×1440, alpha thật, nội dung 1334×1229.
2. `apple-board-clean-v15c.png` — RGBA 1600×1600, alpha thật, nội dung 1116×1234.
3. `May_home_background_clean_may_board_v15c.png` — nền B + 2 miếng vá cỏ trong đúng 2 bbox;
   VẪN KHÔNG CÓ HỘP PHIM (Codex vẽ lớp hộp v15b lên như hiện tại).
4. `May_home_clean_may_board_v15c.png` — ảnh cuối: nền trên + hộp v15b (không đổi, bbox 565,800–695,900)
   + Mây sạch (bbox 750,795–910,945) + bảng sạch (bbox 1053,848–1152,950).

## Chứng cứ pixel (manifest.json)
- Nền sạch so với B: diff ngoài 2 bbox vá = 0.
- Ảnh cuối so với ảnh cuối v15b: diff ngoài 2 vùng Mây/bảng = 0.
- Diff riêng vùng bè+cầu, ghế+sách, bàn tròn, nhà+đệm, hộp sạch v15b: đều = 0.

## Kiểm tra thiết kế Mây (báo thật)
- ĐẠT: mắt hai chấm bầu dục nâu nhỏ, không lòng trắng/điểm sáng/lông mi; mảng cam trái người xem,
  mảng than phải + sườn phải, đuôi sọc cong phải; khăn tam giác xanh ở trước, không nơ/nút/lục lạc;
  tư thế ngồi, ria/má xiên giữ đúng crop.
- LỆCH NHỎ: đầu hơi tròn/to hơn crop nhỏ trong cảnh; khăn tam giác nổi rõ hơn; chân vẽ dạng ngón scallop.
  Đây là nét VẼ MỚI sạch, không phải pixel gốc v13c.

## Kiểm tra bảng
- ĐẠT: khung gần vuông nhỏ, chân thấp, một táo cam đỏ + lá xanh trên giấy kem, không chữ.
- LỆCH NHỎ: thêm một quai xách nhỏ ở đỉnh khung và thanh đáy dày hơn bảng trong cảnh gốc.

## Raw giữ kèm
- may-sitting-clean_raw.png, apple-board-clean_raw.png (magenta), background_patch_raw.png (bản edit nền B).
