# VOKABELGO — SỔ TAY HƯỚNG DẪN THẨM ĐỊNH TỪ VỰNG (LEXICON REVIEW GUIDE)

Tài liệu hướng dẫn dành cho Chuyên gia Ngôn ngữ học (Linguist Curators) và Giảng viên tiếng Đức tham gia xét duyệt kho từ ứng viên cho game bài **Đấu Từ** trên giao diện Workbench (`/preview/dau-tu-lexicon-review`).

---

## 1. NGUYÊN TẮC THẨM ĐỊNH CỐT LÕI (CORE PRINCIPLES)

1. **Từ điển ngoài chỉ là gợi ý ứng viên (Candidate Only)**:
   - Dữ liệu thô từ OpenThesaurus chỉ mang tính chất phát hiện tiềm năng.
   - Không mặc định hai từ cùng một nhóm đồng nghĩa (synset) là có thể hoán đổi cho nhau trong mọi câu.
2. **Khung tham chiếu trình độ A1 – B1**:
   - Ưu tiên từ vựng đời sống, học thuật cơ bản và giao tiếp hàng ngày phù hợp với đối tượng học viên VokabelGo.
3. **Mỗi lá bài là một mục tiêu học tập chính xác**:
   - Khi người chơi liên kết hai lá bài trên bàn, họ đang học một mối quan hệ ngữ nghĩa thực tế có thể dùng được ngoài đời.

---

## 2. QUY TRÌNH KIỂM TRA 5 BƯỚC (5-STEP REVIEW CHECKLIST)

### Bước 1: Kiểm tra Sắc thái Văn phong (Register & Usage)
- **Chuẩn phổ thông (Standard / Alltagssprache)**: Phù hợp đưa vào bộ bài cốt lõi (Core Deck). Ví dụ: `schwer`, `schwierig`, `beginnen`, `anfangen`.
- **Khẩu ngữ / Thân mật (Umgangssprachlich / Salopp)**:
  - Ví dụ: `kinderleicht` (dễ ợt), `flott` (mau lẹ).
  - **Hành động**: `Reject` khỏi bộ bài chuẩn, hoặc gắn cờ `Needs Review` cho các gói bài mở rộng chuyên đề.
- **Văn chương / Cổ kính (Gehoben / Veraltet)**:
  - Ví dụ: `gewichtig` (trọng đại / nặng nề), `anheben` (bắt đầu - văn cổ).
  - **Hành động**: Cân nhắc cẩn trọng. Chỉ duyệt nếu có giải thích ngữ cảnh rõ ràng.
- **Mang tính miệt thị / Tiêu cực (Pejorativ / Schimpfwort)**:
  - Ví dụ: `billig` có nghĩa phụ là `minderwertig` (kém cỏi / rẻ tiền theo nghĩa xấu).
  - **Hành động**: `Reject` ngay lập tức đối với ngữ cảnh giá cả lành mạnh.

### Bước 2: Bài Kiểm tra Thay thế Ngữ cảnh (Context Substitution Test)
Đặt câu hỏi:
> *"Trong một câu giao tiếp chuẩn A1-B1 cụ thể, khi thay thế Từ A bằng Từ B, câu có còn tự nhiên và giữ nguyên nghĩa chính hay không?"*

- **Ví dụ Hợp lệ**:
  - Câu gốc: *„Der Deutschkurs **beginnt** um acht Uhr.“*
  - Thay thế: *„Der Deutschkurs **fängt** um acht Uhr **an**.“*
  - **Kết luận**: Hợp lệ 100% -> `Approve` với ngữ cảnh `ctx_verb_start`.
- **Ví dụ Không hợp lệ**:
  - Câu gốc: *„Ich habe viel **schwere** Arbeit.“* (nhiều việc nặng/khó)
  - Thay thế: *„Ich habe viel **gewichtige** Arbeit.“* (sai tự nhiên trong văn nói hàng ngày)
  - **Kết luận**: `Reject` quan hệ trong ngữ cảnh này.

### Bước 3: Kiểm tra Hình thái & Động từ tách / Phản thân (Morphology Check)
- **Động từ tách (Trennbare Verben)**:
  - Phải tách đúng tiền tố trong câu thì hiện tại (Präsens):
    - *aufhören* -> *„Der Kurs **hört** um zehn Uhr **auf**.“*
    - Highlight tokens: `['hört', 'auf']` (2 đoạn riêng biệt).
- **Động từ phản thân (Reflexive Verben)**:
  - Phải giữ nguyên đại từ phản thân trong câu:
    - *sich beeilen* -> *„Er **beeilt sich** sehr vor der Prüfung.“*
    - Highlight tokens: `['beeilt', 'sich']`.
- **Bảo toàn ký tự đặc biệt**:
  - Tuyệt đối giữ `ä, ö, ü, ß` (ví dụ: `schließen`, không được chuyển thành `schliessen`).

### Bước 4: Kiểm tra Cặp Trái nghĩa GEGENTEIL (Antonym Consistency)
- Cặp trái nghĩa phải mang tính hai chiều đối xứng (Bidirectional):
  - Nếu `beginnen → enden` trong ngữ cảnh `ctx_verb_start:ctx_verb_stop`, thì chiều ngược lại `enden → beginnen` cũng phải được định nghĩa.
  - `anfangen → aufhören` tương ứng với `aufhören → anfangen`.
- Không gán trái nghĩa chéo ngữ cảnh (ví dụ: không nối `schwer_heavy` với `einfach_easy`).

### Bước 5: Phân tách Đa nghĩa (Polysemy Guard)
- Nếu từ có từ 2 nét nghĩa độc lập trở lên:
  - Bắt buộc tạo 2 `entryId` riêng biệt với hậu tố `senseId` tương ứng.
  - Ví dụ:
    - `adj_schwer_difficult` (nghĩa khó) đi với ngữ cảnh bài tập / bài thi.
    - `adj_schwer_heavy` (nghĩa nặng) đi với ngữ cảnh cân nặng / hành lý / vali.
  - Không bao giờ gộp 2 nét nghĩa này vào cùng một lá bài trong bàn chơi.

---

## 3. THAO TÁC TRÊN WORKBENCH REVIEW (`/preview/dau-tu-lexicon-review`)

1. **Bộ lọc (Filter)**:
   - Sử dụng thanh tìm kiếm để lọc nhanh theo từ gốc (Lemma) hoặc nghĩa tiếng Việt.
   - Lọc theo từ loại: `Adjektiv` hoặc `Verb`.
   - Lọc theo trạng thái: `Candidate`, `Needs Review`, `Approved`, `Rejected`.
2. **Nút bấm Duyệt (Approve)**:
   - Chỉ bấm duyệt khi quan hệ đã có câu ví dụ ngữ cảnh chuẩn xác.
3. **Nút bấm Cần xem xét (Needs Review)**:
   - Bấm khi nghi ngờ về sắc thái văn phong, cần hội ý với giảng viên bản ngữ khác. Nhập ghi chú giải thích lý do vào hộp thoại.
4. **Nút bấm Từ chối (Reject)**:
   - Nhập lý do từ chối (ví dụ: khẩu ngữ, nghĩa bóng không phổ biến, sai lệch ngữ cảnh). Hệ thống sẽ lưu lý do này vào nhật ký thẩm định (Audit Trail).
5. **Nút Xuất Runtime (Re-export & Validate Runtime)**:
   - Sau khi hoàn thành phiên thẩm định, bấm nút trên thanh Header để hệ thống chạy toàn bộ các cửa kiểm định Section 30 và xuất bản bộ bài mới cho game.
