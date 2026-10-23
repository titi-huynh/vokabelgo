# Đấu từ — VokabelGo (Gameplay Preview v0.1)

Game đánh bài từ vựng tiếng Đức lấy cảm hứng từ UNO dành cho nền tảng VokabelGo.

---

## 1. Thông tin nhánh và môi trường thực thi

- **Nhánh preview thực tế**: `preview/dau-tu-v01`
- **Nhánh nền (Base branch)**: `prototype/wortturm`
- **Commit nền (Base commit)**: `8288ae95bf1e25bcb99769645e2cf040381e383a feat(wortcrush): implement high-fidelity gameplay preview for WortCrush`
- **Bảo toàn workspace**: Toàn bộ thay đổi chưa commit của người dùng (`audit-vocabulary-report.json`, các file screenshot trước đó, `design/rive-source/`, `user_master_prompt.txt`) được giữ nguyên vẹn 100%.

---

## 2. Cách khởi động và đường dẫn kiểm tra cục bộ

Khởi động server nội bộ:
```bash
node server.js
```

Các đường dẫn truy cập (mở trên trình duyệt):
- **Bàn chơi Đấu từ**:
  - `http://localhost:3000/preview/dau-tu` (hoặc `http://localhost:3000/dau-tu.html` / `http://localhost:3000/dau-tu`)
- **Bảng mẫu 10 lá component đại diện + 1 mặt sau**:
  - `http://localhost:3000/preview/dau-tu-cards` (hoặc `http://localhost:3000/dau-tu-cards.html` / `http://localhost:3000/dau-tu-cards`)

---

## 3. Các điểm khác biệt đã chuẩn hóa so với ảnh tham chiếu

1. **Tách biệt hai bộ từ**: Ảnh tham chiếu trộn lẫn tính từ (`schwierig`, `freundlich`) và động từ (`anfangen`, `schließen`) trong cùng một tay bài. Bản triển khai tách biệt hoàn toàn thành 2 bộ độc lập: "Tính từ · Adjektive" (60 lá) và "Động từ · Verben" (60 lá).
2. **Khớp trạng thái câu và gợi ý**: Ảnh tham chiếu hiện gợi ý "bắt đầu" trong khi câu trên bàn nói về "leise". Bản triển khai liên kết gợi ý trực tiếp với câu và từ mục tiêu đang có hiệu lực.
3. **Bỏ lá minh họa không rõ luật**: Ảnh tham chiếu có 1 lá minh họa núi/đường mòn không rõ chức năng. Bản triển khai chỉ sử dụng đúng 4 loại lá chức năng chuẩn đã quy định: `Aussetzen`, `Zieh Zwei (+2)`, `Farbenwahl`, và `GEGENTEIL!`.
4. **Không làm lộ đáp án trong cửa sổ xem lá**: Ảnh tham chiếu mở sẵn từ đồng nghĩa và trái nghĩa nối được trong cửa sổ xem chi tiết lá bài. Bản triển khai chỉ hiển thị từ vựng, loại từ, phát âm tiếng Đức và cho phép mở nghĩa tiếng Việt theo yêu cầu (có ghi nhận dùng trợ giúp); không tiết lộ trước các từ nối được trên tay.
5. **Màu sắc cho lá Aussetzen và Zieh Zwei**: Không làm thành các lá đen trung tính vô màu như ảnh tham chiếu, mà có 4 màu xác định (Đỏ, Xanh dương, Xanh lá, Vàng) để luật cùng màu hoạt động chuẩn xác.
6. **Tiêu đề bảng mẫu**: Chuẩn hóa chính xác thành "10 lá đại diện + 1 mặt sau riêng biệt" thay vì gộp chung mặt sau vào số đếm lá bài.

---

## 4. Dữ liệu hai bộ từ và nguồn đối chiếu ngữ pháp

Mỗi bộ gồm đúng **60 lá vật lý** (48 lá từ + 12 lá chức năng).

### Bộ 1: Tính từ · Adjektive (60 lá)
Nguồn tham chiếu: Từ điển Duden và IDS (Leibniz-Institut für Deutsche Sprache).
- **Nhóm 1 (Độ khó bài tập - ctx_adj_difficulty_hard ↔ ctx_adj_difficulty_easy)**:
  - `schwer` ("Die Aufgabe ist heute sehr schwer.") ↔ `schwierig` ("Die Aufgabe ist heute sehr schwierig.")
  - `[GEGENTEIL]` ↔ `leicht` ("Die Aufgabe ist heute sehr leicht.") ↔ `einfach` ("Die Aufgabe ist heute rất đơn giản.")
  - *Lưu ý ngữ pháp*: Diễn giải trong ngữ cảnh bài tập/nhiệm vụ (khó/dễ); không dùng nghĩa khối lượng vật lý (nặng/nhẹ).
- **Nhóm 2 (Mức giá khách sạn - ctx_adj_price_expensive ↔ ctx_adj_price_cheap)**:
  - `teuer` ("Das Hotel ist heute sehr teuer.") ↔ `kostspielig` ("Das Hotel ist heute sehr kostspielig.")
  - `[GEGENTEIL]` ↔ `billig` ("Das Hotel ist heute sehr billig.") ↔ `günstig` ("Das Hotel ist heute sehr günstig.")
  - *Lưu ý*: Giới hạn trong ngữ cảnh chi phí/giá cả; không đồng nhất trong mọi ngữ cảnh trừu tượng khác.
- **Nhóm 3 (Âm lượng tiếng ồn - ctx_adj_volume_quiet ↔ ctx_adj_volume_loud)**:
  - `leise` ("Die Kinder sind heute sehr leise.") ↔ `ruhig` ("Die Kinder sind heute sehr ruhig.")
  - `[GEGENTEIL]` ↔ `laut` ("Die Kinder sind heute sehr laut.") ↔ `lärmend` ("Die Kinder sind heute sehr lärmend.")
- **12 lá chức năng**: 4 Aussetzen (Đỏ, Xanh dương, Xanh lá, Vàng), 4 Zieh Zwei (+2) (Đỏ, Xanh dương, Xanh lá, Vàng), 2 Farbenwahl (Trung tính), 2 GEGENTEIL! (Trung tính).

### Bộ 2: Động từ · Verben (60 lá)
- **Nhóm 1 (Bắt đầu / Kết thúc buổi học - ctx_verb_timing_start ↔ ctx_verb_timing_end)**:
  - `beginnen` ("Der Kurs beginnt um acht Uhr.") ↔ `anfangen` ("Der Kurs fängt um acht Uhr an." - Động từ tách: highlight `fängt` và `an`)
  - `[GEGENTEIL]` ↔ `enden` ("Der Kurs endet um acht Uhr.") ↔ `aufhören` ("Der Kurs hört um acht Uhr auf." - highlight `hört` và `auf`)
- **Nhóm 2 (Mở / Đóng cửa sổ - ctx_verb_window_open ↔ ctx_verb_window_close)**:
  - `öffnen` ("Ich öffne das Fenster am Morgen.") ↔ `aufmachen` ("Ich mache das Fenster am Morgen auf." - highlight `mache` và `auf`)
  - `[GEGENTEIL]` ↔ `schließen` ("Ich schließe das Fenster am Abend.") ↔ `zumachen` ("Ich mache das Fenster am Abend zu." - highlight `mache` và `zu`)
- **Nhóm 3 (Vội vã / Lề mề trên đường - ctx_verb_haste_fast ↔ ctx_verb_haste_slow)**:
  - `sich beeilen` ("Die Schülerin beeilt sich auf dem Weg." - highlight `beeilt` và `sich`) ↔ `eilen` ("Die Schülerin eilt auf dem Weg.")
  - `[GEGENTEIL]` ↔ `trödeln` ("Die Schülerin trödelt auf dem Weg.") ↔ `bummeln` ("Die Schülerin bummelt auf dem Weg.")

---

## 5. Tóm tắt luật chơi cải biên chốt cho Preview

1. **Bắt đầu**: Chia 5 lá mỗi bên. Lá mở bàn bắt buộc là lá từ vựng bình thường.
2. **Đánh lá từ**:
   - Cùng màu: hợp lệ, đổi ngữ cảnh sang câu nền của từ mới.
   - Nối nghĩa đồng nghĩa: hợp lệ, giữ nguyên ngữ cảnh câu trên bàn, đổi màu sang màu của lá vừa đánh.
   - Cùng từ: trùng chính từ đó nhưng khác màu (ghi nhận "Cùng từ").
   - Vừa cùng màu vừa đồng nghĩa: ghi nhận đồng thời cả hai điều kiện (`both`).
3. **Lá chức năng**:
   - `Aussetzen`: Đi khi cùng màu hoặc cùng biểu tượng Aussetzen. Đối thủ mất lượt, người đánh đi tiếp lượt mới. Xóa từ mục tiêu cũ.
   - `Zieh Zwei (+2)`: Đi khi cùng màu hoặc cùng biểu tượng +2. Đối thủ rút 2 lá và mất lượt. Không cộng dồn, không GEGENTEIL né phạt.
   - `Farbenwahl`: Đi tự do ở lượt thường. Chọn 1 trong 4 màu. Có thể bấm Hủy mà không mất lá/lượt.
   - `GEGENTEIL!`: Đi khi bàn đang có từ mục tiêu hiệu lực. Giữ nguyên màu bàn chơi, đổi nghĩa sang từ đối lập theo dữ liệu đã lưu. Đối thủ tiếp tục bằng đồng nghĩa của từ mới hoặc đánh theo màu.
4. **Rút bài & Đánh sai**:
   - Nếu không có bài hoặc muốn giữ bài: bấm rút 1 lá. Chỉ được đánh chính lá vừa rút nếu hợp lệ; hoặc bấm Giữ bài để hết lượt.
   - Đánh sai: lá ở lại tay, hiện lý do ngắn, bị phạt rút 1 lá nếu chưa rút trong lượt, rồi hết lượt.
5. **Hết bài & Tái trộn**:
   - Còn 1 lá: Hiện huy hiệu "Noch eine!".
   - Hết bài: Thắng ván. Nếu lá cuối là +2, đối thủ vẫn phải nhận phạt 2 lá rồi ván kết thúc.
   - Hết chồng rút: Tự động tái trộn chồng bỏ (giữ lại lá trên cùng). Bảo toàn chính xác 60 lá ở mọi thời điểm.

---

## 6. Kết quả kiểm thử tự động (Unit Tests & Playwright E2E)

### Unit Acceptance Tests (`test-dau-tu-evaluator.js`):
Chạy qua: `npm run test:unit`
- **Kết quả**: 21 / 21 bài kiểm thử vượt qua tuyệt đối (100% PASS).
- **Bộ tổng hợp**: Cả 12/12 test suites của toàn dự án VokabelGo đều PASS sạch, 0 regression.

### Playwright E2E Tests (`e2e/dau-tu-preview.spec.js`):
Chạy qua: `npx playwright test e2e/dau-tu-preview.spec.js`
- **Kết quả**: 9 / 9 scenarios PASS (100%).
- **Bộ ảnh chụp thực tế đã tạo**:
  1. `screenshot_dautu_sample_cards.png`: Bảng 10 lá đại diện + 1 mặt sau.
  2. `screenshot_dautu_adjektive_desktop.png`: Bàn chơi Tính từ trên desktop (1280x720).
  3. `screenshot_dautu_verben_desktop.png`: Bàn chơi Động từ với từ tách highlight trên desktop.
  4. `screenshot_dautu_hint_twostep.png`: Hệ thống gợi ý 2 bước hoạt động thực tế.
  5. `screenshot_dautu_gegenteil.png`: Hộp thoại xem trước và thực thi phép GEGENTEIL.
  6. `screenshot_dautu_gameover.png`: Màn hình tổng kết ván chơi kèm chỉ số thống kê trung thực.
  7. `screenshot_dautu_mobile.png`: Giao diện di động (390x844) cuộn ngang bài mượt mà, không tràn ngang trang web.

---

## 7. Ranh giới an toàn

- Không chỉnh sửa Supabase, Authentication, FSRS, hay database thật.
- Không chạm vào menu production, Wortturm, WortCrush, Wortregen, hay Mèo câu cá.
- Toàn bộ dữ liệu preview độc lập, tùy chọn giao diện dùng riêng prefix `vokabelgo:dautu:preview:v1:*`.
