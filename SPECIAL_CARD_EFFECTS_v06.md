# VOKABELGO — ĐẤU TỪ v0.6
## SPECIAL CARD EFFECTS & GAME FEEL SPECIFICATION

---

## 1. Mục tiêu & Triết lý Thiết kế

Phiên bản **Đấu từ v0.6** nâng cấp toàn diện hiệu ứng hình ảnh, âm thanh và cảm giác chơi (game feel) khi các lá bài chức năng hoặc các nước đi đặc biệt xuất hiện trên bàn 4 người (1 người + 3 bot):

1. **Hiệu ứng có cảm nhận vật lý, không biến mất âm thầm**: Người chơi lập tức nhận diện được hành động vừa diễn ra trên bàn thông qua quỹ đạo hình học, sự thay đổi độ sáng và huy hiệu nổi.
2. **German-Word-First & Anti-Casino**:
   - Từ tiếng Đức và ngữ cảnh câu mẫu luôn là tâm điểm thị giác.
   - Tuyệt đối không sử dụng hiệu ứng quay số, số sát thương nổ, pháo hoa dày đặc, rung lắc toàn màn hình, hay âm thanh xèng/tiền xu.
   - Thời lượng mọi hiệu ứng được khống chế ngắn (200ms – 800ms) để không làm đứt đoạn nhịp độ trận đấu.
3. **Turn Locking & An toàn luồng sự kiện**:
   - Cờ `isEffectRunning` bảo vệ tuyệt đối: người chơi không thể bấm đánh hay rút bài khi hoạt họa đang diễn ra.
   - Khi dọn dẹp bàn hoặc thoát ván (`clearTimers`), toàn bộ setTimeout và các DOM node bay (`.flying-draw-card`, `.cut-skip-beam`, v.v.) được triệt tiêu tức thì.

---

## 2. Hệ phân cấp Hiệu ứng (Effect Hierarchy)

| Cấp độ | Phân loại | Hiệu ứng hình ảnh | Hiệu ứng âm thanh | Thời lượng |
| :--- | :--- | :--- | :--- | :--- |
| **Cấp 1** (Nhẹ) | Đánh lá cùng màu / Đánh cùng từ thường | Lá bay vào discard pile; card scale nhẹ | `normal-card-place` (click 440Hz $\to$ 220Hz) | 240ms |
| **Cấp 1** (Nhẹ) | Khớp ngữ nghĩa cùng màu | Viền sáng nhẹ quanh discard | `semantic-match` (chime hài âm 523Hz $\to$ 659Hz) | 300ms |
| **Cấp 2** (Vừa) | **Aussetzen** (Bỏ lượt) | Chùm tia cắt (`cut-skip-beam`) hướng về vị trí nạn nhân; ghế nạn nhân tối mờ và hiện huy hiệu 🚫 | `skip` (woosh swoosh tần số quét xuống) | 550ms |
| **Cấp 2** (Vừa) | **Zieh Zwei** (+2) | Huy hiệu nổi `+2` bật nảy tại ghế nạn nhân; hai lưng bài thật (`.flying-draw-card`) lần lượt bay từ draw pile sang nạn nhân | `plus-two` (chord đôi cảnh báo + 2 tiếng `draw`) | 720ms |
| **Cấp 2** (Vừa) | **Farbenwahl** (Đổi màu) | Bảng chọn 4 ô màu hình học (♥ Đỏ, ● Xanh lam, ▲ Xanh lục, ◆ Vàng); màu chọn phóng to phát sáng, 3 màu còn lại mờ đi | `color-change` (arpeggio 3 nốt vui tươi 440 $\to$ 554 $\to$ 659Hz) | 380ms |
| **Cấp 3** (Signature) | **GEGENTEIL** (Đảo nghĩa) | Lá bài tại trung tâm thực hiện hoạt họa chuyển đổi từ vựng `TỪ_CŨ ⇄ TỪ_MỚI`; câu ví dụ crossfade từ vựng tương ứng; giữ nguyên màu bàn | `gegenteil` (harmonic sweep 2 tầng đảo chiều) | 800ms |
| **Cấp 3** (Signature) | **WORT-KETTE** (Xích từ) | Banner vàng phát sáng hiển thị `LEMMA1 ↔ LEMMA2` cùng icon dây xích; toàn bộ tay bài người chơi phát xung (pulse); kích hoạt quyền đánh thêm 1 lá | `wort-kette` (hợp âm chiến thắng cộng hưởng 3 nốt đồng điệu) | 1100ms |
| **Cấp 4** (Kết thúc) | **Chiến thắng** (Win state) | Viền ánh sáng ấm quanh ghế người chiến thắng; các hạt ánh sáng (`.win-particle`) nhẹ nhàng bay lên; modal tổng kết hiển thị | `win` (hợp âm major hân hoan) | 1200ms |

---

## 3. Hệ thống Âm thanh Thủ tục (Procedural Web Audio API)

Hệ thống âm thanh được xây dựng 100% bằng **Web Audio API tiêu chuẩn**, không cần tải bất kỳ tệp MP3/WAV ngoại vi nào, đảm bảo khả năng hoạt động offline hoàn toàn và độ trễ gần bằng 0:

- **Khởi tạo trễ (Lazy Init)**: AudioContext được khởi tạo tự động ở lần tương tác đầu tiên của người dùng để tuân thủ chính sách Autoplay của các trình duyệt hiện đại.
- **Synthesizer Profiles**:
  1. `normal-card-place`: Triangle/sine wave 440Hz $\to$ 220Hz trong 60ms, mô phỏng tiếng đặt lá bài xuống mặt nỉ.
  2. `semantic-match`: Hài âm đôi 523.25Hz (C5) và 659.25Hz (E5) trong 140ms.
  3. `shuffle`: Chuỗi 5 nhấp âm tần số cao xen kẽ mô phỏng tiếng xào bài.
  4. `deal`: Tiếng vút nhẹ 800Hz $\to$ 200ms mô phỏng bài chia trên không.
  5. `draw`: Tiếng rút bài từ chồng bài 350Hz $\to$ 500Hz trong 90ms.
  6. `skip`: Tiếng swoosh cắt ngang băng tần thấp 300Hz $\to$ 80Hz.
  7. `plus-two`: Hợp âm tăng dần 2 bước (220Hz + 330Hz) cảnh báo nguy hiểm.
  8. `color-change`: 3 nốt arpeggio ngân vang thanh thoát (A4 $\to$ C#5 $\to$ E5).
  9. `gegenteil`: Lượn sóng tần số kép đảo chiều thể hiện sự hoán đổi mặt đối lập.
  10. `wort-kette`: Hợp âm cộng hưởng kích hoạt xích từ (C5 $\to$ G5 $\to$ C6).
  11. `win`: Hợp âm C Major 4 nốt vút cao chào mừng chiến thắng.

---

## 4. Quản lý Trạng thái & Khóa Lượt (Turn Locking)

1. **`isEffectRunning` Guard**:
   ```javascript
   function isHumanTurn() {
     return state && state.activePlayer === 'player'
       && state.turnState === 'waiting_human'
       && !isEffectRunning;
   }
   ```
2. **Timer Registry & Dọn dẹp (`clearTimers`)**:
   - Tất cả timeout cho hiệu ứng đều được đăng ký qua `registerTimeout(fn, ms)` đẩy vào mảng `activeEffectTimeouts`.
   - Hàm `clearTimers()` hủy toàn bộ timer, dọn dẹp các phần tử bay `.cut-skip-beam`, `.plus2-target-badge`, `.flying-draw-card`, `.color-pulse-ripple`, gỡ bỏ class `.skipped`, và đặt lại cờ `isEffectRunning = false`.
3. **Xử lý chuỗi liên tiếp (Wort-Kette $\to$ Bonus Special Card)**:
   - Khi người chơi kích hoạt Wort-Kette và đánh tiếp một lá chức năng (ví dụ lá `+2`), hiệu ứng Wort-Kette kết thúc trước, mở khóa tay bài để người chơi chọn lá bài thưởng, sau đó hiệu ứng của lá `+2` được thực thi tuần tự, không xảy ra xung đột hoạt họa hay chồng chéo trạng thái.

---

## 5. Kết quả Kiểm thử Tự động (Acceptance Test Suite)

Tập test chấp nhận chuyên biệt `test-dau-tu-v06.js` gồm 14 ca kiểm thử chi tiết và toàn bộ 18 test suite trong hệ thống (`node test-all.js`) đều đạt **100% PASS**:

- **Aussetzen**: Bỏ qua chính xác người kế tiếp, chuyển lượt cho người sau nữa ở bàn 4 người theo chiều kim đồng hồ.
- **Zieh Zwei (+2)**: Nạn nhân rút đúng 2 lá và mất lượt; bảo toàn tuyệt đối tổng 60 lá bài ngay cả khi chồng bài rút cạn kiệt (tái sử dụng discard pile).
- **Farbenwahl**: Yêu cầu lựa chọn màu rõ ràng, cập nhật `activeColor` chính xác, AI bot chọn màu theo chiến lược tối ưu nhất trên tay.
- **GEGENTEIL**: Chuyển đổi từ vựng sang từ trái nghĩa chuẩn xác (cả Adjektive và Verben), bảo toàn màu bài hiện tại, cập nhật câu ví dụ và từ khóa highlight tương ứng.
- **WORT-KETTE**: Nhận diện nước đi xích từ không trợ giúp, thưởng 1 lượt đánh tiếp, chặn kích hoạt xích từ lần hai trong cùng chuỗi thưởng.
- **Special Card as Final Card**: Khi đánh lá chức năng làm lá bài cuối cùng trên tay, người chơi giành chiến thắng ngay lập tức mà không sinh lượt ma (ghost turn).

---

## 6. Danh mục 12 Ảnh Chụp Màn hình QA (Artifacts)

Tất cả 12 ảnh chụp màn hình kiểm định chất lượng hiển thị đã được ghi nhận:

1. `FX01_Aussetzen.png`: Chùm tia cắt đỏ hướng đến ghế đối thủ bị bỏ lượt kèm icon 🚫.
2. `FX02_Plus2_FirstCard.png`: Lá bài thứ nhất bay từ chồng bài rút sang ghế nạn nhân.
3. `FX03_Plus2_SecondCard.png`: Lá bài thứ hai tiếp đất kèm huy hiệu nổi `+2`.
4. `FX04_FarbenwahlSelector.png`: Bộ chọn 4 màu hình học (♥, ●, ▲, ◆) hiển thị trực tiếp trên bàn.
5. `FX05_FarbenwahlSelected.png`: Màu đã chọn phát xung to, 3 màu còn lại mờ đi.
6. `FX06_GegenteilBefore.png`: Thẻ bài trung tâm trước khi thực hiện đảo nghĩa.
7. `FX07_GegenteilTransition.png`: Hoạt họa chữ `SCHWER ⇄ LEICHT` hoán đổi ngay trên mặt bài trung tâm.
8. `FX08_GegenteilAfter.png`: Thẻ bài mới `LEICHT`, giữ nguyên màu đỏ, câu ví dụ đã crossfade và highlight từ mới.
9. `FX09_WortKette.png`: Banner xích từ vàng phát quang `SCHWER ↔ SCHWIERIG · WORT-KETTE · +1 nước`.
10. `FX10_WortKetteBonusReady.png`: Tay bài người chơi phát xung sẵn sàng cho lượt đánh thưởng kèm thanh hướng dẫn ở dock.
11. `FX11_WinState.png`: Ghế người chiến thắng phát sáng ánh vàng kèm các hạt ánh sáng bay lơ lửng.
12. `FX12_MobileSpecial.png`: Giao diện dọc mobile (390×844) hiển thị lưới 2×2 chọn màu cân đối trên bàn cờ.
