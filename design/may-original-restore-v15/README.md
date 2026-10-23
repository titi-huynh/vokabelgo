# Mây v15 — sửa đúng trên bản chị duyệt

Bản xem: http://127.0.0.1:3000/design/may-original-restore-v15/index.html

Ảnh chuẩn duy nhất: ../may-muse-red-viewer-v13/May_home_red_viewer_v13c.png.
SOURCE_CHECK.json xác nhận ảnh này trùng từng pixel với file chị gửi lại codex-clipboard-5291d753-48aa-4b96-9f5e-6f0f41102b3c.png (1600×1600).

## Thay đổi
- Muse Image sửa vùng hộp cũ và tạo kệ thấp riêng; Muse ghép cục bộ bằng code lên ảnh gốc.
- Hộp vuông cũ được trích từ ảnh chuẩn, không thay bằng hộp bo tròn của v14.
- Nhóm hộp+kệ đặt tâm x630, chân y900, rộng130px. Không di chuyển Mây hoặc đồ khác.
- Ngoài vùng vá [998,538,1112,642] và vùng đặt mới [565,798,695,900], ảnh cuối giữ nguyên pixel gốc.
- Bản xem dùng ảnh gốc chỉ xóa hộp cũ và một lớp hộp+kệ. Có thể kéo hộp+kệ; các món khác chỉ xem cận cảnh, không kéo hay vẽ lại.
- Link bản v14 cũ chuyển tới v15 để không tiếp tục hiển thị bộ đồ chưa được duyệt. index-rejected-v14b.html giữ bản cũ để đối chiếu.

## Xác minh độc lập của Codex
- PIXEL_VALIDATION.json: bè/cầu, Mây, ghế/sách, bảng, bàn và phần nhà ngoài vùng vá đều trùng pixel ảnh chuẩn.
- Nền ngoài vùng vá và ảnh ghép ngoài hai vùng đều không khác ảnh chuẩn.
- Đã thử dịch chuyển/đặt lại hộp, ẩn/hiện hộp, kiểm tra bè không thể bị di chuyển; trình duyệt không ghi lỗi.
- Node syntax check đạt. PREVIEW_DESKTOP.png là ảnh chụp trình duyệt.

## File và giới hạn
- assets/May_home_original_viewer_left_v15.png: ảnh cuối 1600×1600.
- assets/May_home_original_without_viewer_v15.png: ảnh chuẩn chỉ vá hộp cũ.
- assets/original-viewer-stand-v15.png: nhóm hộp+kệ alpha, 150×122, giữ chi tiết từ ảnh gốc nên không phải asset được vẽ mới độ phân giải cao.
- May_original_restore_v15.zip: gói Muse gốc, có raw và manifest.
- MUSE_BRIEF.txt: yêu cầu gửi Muse; MUSE_manifest.json: báo cáo Muse; PIXEL_VALIDATION.json: kiểm tra thật tại máy.
- Trong vùng vá, sàn lấy từ một lượt edit. Kệ là chi tiết mới, texture hơi khác; mask hộp còn vài pixel nền cạnh tay quay. Không tuyên bố những phần đó hoàn hảo.
- Chưa nối bài học, chưa thay trang chủ gốc của ứng dụng.

## Cập nhật v15b: làm sạch riêng nhóm hộp–kệ
- Chị chọn rõ “Hộp phim và kệ mới trước”; các chi tiết khác tiếp tục giữ nguyên.
- Muse vẽ sạch lại nhóm này một lượt theo thiết kế v15, xuất PNG alpha 1728×1344: assets/original-viewer-stand-clean-v15b.png. Mặt kệ màu phẳng, bỏ vân màu nước; không tiếp tục phóng crop150×122 làm asset cuối.
- Ảnh ghép: assets/May_home_original_viewer_left_clean_v15b.png. Bbox cho phép vẫn [565,798,695,900]; tâm630 chân900, không đổi vị trí.
- CLEAN_VALIDATION_v15b.json xác minh mọi pixel ngoài bbox hộp–kệ trùng v15, riêng Mây/bè/ghế/bảng/bàn cũng trùng. Nền B không được sửa lại.
- Đã xem trong cảnh và trên nền tối: nét viền sạch hơn, không thấy vệt nền quanh tay quay ở kích thước hiển thị. Node syntax đạt; trình duyệt không báo lỗi. PREVIEW_CLEAN_v15b.png và VIEWER_CLOSEUP_v15b.png là screenshot thực.
- Hộp–kệ có nét vẽ mới theo lựa chọn làm sạch của chị; không tuyên bố phần này còn nguyên pixel gốc. Kệ rộng hơn thân hộp khoảng1.5×, có chấm sáng nhỏ trên ống nhìn. Tất cả bản cũ được giữ lại.
- Nguồn: Muse Image; prompt MUSE_VIEWER_CLEAN_BRIEF_v15b.txt; gói raw/manifest: May_viewer_clean_v15b.zip và MUSE_CLEAN_manifest_v15b.json.
