# VOKABELGO — ĐẤU TỪ: VOCABULARY ROTATION & MATCH DIVERSITY

Tài liệu thiết kế kỹ thuật và báo cáo kiểm định hệ thống **Xoay vòng Từ vựng và Đa dạng hóa Trận đấu (Vocabulary Rotation & Match Diversity)** cho game "Đấu từ" trong nền tảng VokabelGo.

---

## 1. Mục tiêu và Nguyên tắc Cốt lõi

Trong các phiên bản trước, việc xáo trộn thứ tự lá bài (shuffle card order) chỉ thay đổi trình tự rút bài nhưng **vẫn giữ nguyên 12 mục từ (lemmas)** lặp đi lặp lại qua mọi ván chơi.

Hệ thống **Vocabulary Rotation v0.1** giải quyết triệt để vấn đề này theo chuỗi kiến trúc:

$$\text{APPROVED VOCABULARY POOL} \longrightarrow \text{MATCH DECK BUILDER} \longrightarrow \text{SELECTED SEMANTIC UNITS} \longrightarrow \text{PHYSICAL COLOR CARDS} \longrightarrow \text{SHUFFLE} \longrightarrow \text{DEAL}$$

### Nguyên tắc bắt buộc:
1. **Không xáo bài đơn thuần:** Mỗi ván chơi phải rút ra một tập hợp 12 mục từ (semantic units) mới từ kho từ đã thẩm định (Approved Pool).
2. **Chọn theo Cụm Ngữ nghĩa (Semantic Clusters):** Không bao giờ chọn ngẫu nhiên 12 lemmas rời rạc; luôn chọn các cụm 4 từ có liên kết chặt chẽ (2 cặp đồng nghĩa $\times$ 2 chiều trái nghĩa).
3. **0 Đỉnh cô lập (Zero Isolated Nodes):** 100% các từ trong ván đấu đều có ít nhất 1 lá đồng nghĩa khác màu và 1 lá trái nghĩa làm mục tiêu hợp lệ cho GEGENTEIL, đảm bảo tính khả thi tuyệt đối cho cơ chế xích bài **Wort-Kette**.
4. **Bảo toàn số lượng 60 lá:** 12 từ $\times$ 4 màu = 48 lá từ vựng + 12 lá chức năng đặc biệt (+2, Aussetzen, Farbenwahl, GEGENTEIL).
5. **Chống trùng lặp tuyệt đối giữa 2 ván liên tiếp:** Đạt **0% trùng lặp** giữa Ván $N$ và Ván $N+1$ khi quy mô kho từ cho phép.

---

## 2. Kho Cụm Ngữ nghĩa (Semantic Clusters Pool)

Dữ liệu được tổ chức thành các cụm 4 từ hoàn chỉnh trong `src/lexicon/semantic-clusters.js`:

### A. Bộ Tính từ (Adjektive) — 9 Cụm (36 mục từ chuẩn A1–B1)
1. **Độ khó (Difficulty):** `schwer_difficult`, `schwierig_difficult` $\leftrightarrow$ `leicht_easy`, `einfach_easy`
2. **Giá cả (Price):** `teuer_expensive`, `kostspielig_expensive` $\leftrightarrow$ `billig_cheap`, `günstig_cheap`
3. **Âm lượng (Volume):** `laut_loud`, `lärmend_loud` $\leftrightarrow$ `leise_quiet`, `ruhig_quiet`
4. **Tốc độ (Speed):** `schnell_fast`, `rasch_fast` $\leftrightarrow$ `langsam_slow`, `gemächlich_slow`
5. **Kích thước (Size):** `groß_big`, `riesig_big` $\leftrightarrow$ `klein_small`, `winzig_small`
6. **Sức mạnh (Strength):** `stark_strong`, `kräftig_strong` $\leftrightarrow$ `schwach_weak`, `kraftlos_weak`
7. **Lòng dũng cảm (Courage):** `mutig_brave`, `tapfer_brave` $\leftrightarrow$ `ängstlich_fearful`, `furchtsam_fearful`
8. **Trí tuệ (Smartness):** `klug_smart`, `schlau_smart` $\leftrightarrow$ `dumm_foolish`, `töricht_foolish`
9. **Tuổi thọ & Trạng thái (Age):** `alt_old_object`, `antik_old_object` $\leftrightarrow$ `neu_new_object`, `frisch_new_object`

### B. Bộ Động từ (Verben) — 8 Cụm (32 mục từ chuẩn A1–B1)
1. **Khởi đầu & Kết thúc (Time):** `beginnen_start`, `anfangen_start` $\leftrightarrow$ `enden_end`, `aufhören_end`
2. **Đóng & Mở (Door/Aperture):** `öffnen_open`, `aufmachen_open` $\leftrightarrow$ `schließen_close`, `zumachen_close`
3. **Tốc độ di chuyển (Pace):** `rennen_run`, `laufen_run` $\leftrightarrow$ `schleichen_creep`, `bummeln_stroll`
4. **Tương tác xã hội (Social):** `sprechen_talk`, `reden_talk` $\leftrightarrow$ `schweigen_silent`, `verstummen_silent`
5. **Sở hữu (Possession):** `bekommen_receive`, `erhalten_receive` $\leftrightarrow$ `verlieren_lose`, `einbüßen_lose`
6. **Thương mại (Commerce):** `kaufen_buy`, `erwerben_buy` $\leftrightarrow$ `verkaufen_sell`, `veräußern_sell`
7. **Hành trình (Travel):** `ankommen_arrive`, `eintreffen_arrive` $\leftrightarrow$ `abfahren_depart`, `abreisen_depart`
8. **Nhận thức & Hiểu biết (Cognition):** `verstehen_understand`, `begreifen_understand` $\leftrightarrow$ `missverstehen_misunderstand`, `fehldeuten_misunderstand`

---

## 3. Thuật toán Lựa chọn Cụm & Điều tiết Trùng lặp (Selection & Anti-Repeat Algorithm)

Mô-đun `MatchDeckBuilder` (`src/lexicon/match-deck-builder.js`) phối hợp cùng `VocabularyHistory` (`src/lexicon/vocabulary-history.js`):

```
                        [Approved Cluster Pool]
                                   │
                                   ▼
                  [Lọc Anti-Repeat Ván N-1]
           (Loại bỏ tất cả cụm đã xuất hiện ở Ván N-1)
                                   │
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
        [Đủ >= 3 cụm khả dụng]              [Không đủ cụm khả dụng]
               │                                       │
               │                                       ▼
               │                            [Fallback Relaxation]
               │                         (Bỏ lọc N-1, dựa vào Recency Penalty)
               └───────────────────┬───────────────────┘
                                   │
                                   ▼
                        [Chấm điểm Cụm (Cluster Scoring)]
                 Score = Base Random + Recency Penalty (Rolling 3)
                                   │
                                   ▼
                      [Chọn 3 Cụm điểm số thấp nhất]
                                   │
                                   ▼
                     [12 Đơn vị Ngữ nghĩa (Units)]
                                   │
                                   ▼
                     [Sinh 48 Lá Màu + 12 Lá Chức năng]
                                   │
                                   ▼
                     [Kiểm định Graph & Xuất Match Deck]
```

### Quy tắc Chấm điểm Lịch sử:
- **Trọng số Recency (Rolling 3):**
  - Xuất hiện ở Ván $N-1$: Điểm phạt $+100$
  - Xuất hiện ở Ván $N-2$: Điểm phạt $+50$
  - Xuất hiện ở Ván $N-3$: Điểm phạt $+25$
- **Hồi phục (Cooldown & Spaced Review):** Sau 3 ván không gặp, điểm phạt trở về $0$, từ vựng quay trở lại nhóm ưu tiên để ôn tập ngắt quãng tự nhiên.
- **Nới lỏng an toàn (Graceful Fallback):** Nếu số cụm chưa dùng không đủ 3 cụm (ví dụ kho từ nhỏ), hệ thống tự động nới lỏng bộ lọc ván liền kề nhưng vẫn ưu tiên cụm có điểm phạt thấp nhất.

---

## 4. Kết quả Kiểm định Thực tế (QA Audit Results)

### Bảng Mô phỏng 10 Ván Liên tiếp Bộ Tính từ (Adjektive)

| Ván | Bộ | Cụm Ngữ nghĩa (Clusters) | Trùng N-1 | Trùng R3 | Tích lũy Từ mới | Syn / Ant Edges | Isolated | Kết quả |
|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **#1** | Tính từ | Sức mạnh, Trí tuệ, Tốc độ | **0% (Gốc)** | 0% | 12 | 22 / 10 | 0 | **PASS ✓** |
| **#2** | Tính từ | Tuổi thọ, Giá cả, Âm lượng | **0%** | 0% | 24 | 22 / 10 | 0 | **PASS ✓** |
| **#3** | Tính từ | Độ khó, Dũng cảm, Kích thước | **0%** | 0% | 36 | 22 / 10 | 0 | **PASS ✓** |
| **#4** | Tính từ | Sức mạnh, Trí tuệ, Tốc độ | **0%** | 100% | 36 | 22 / 10 | 0 | **PASS ✓** |
| **#5** | Tính từ | Tuổi thọ, Giá cả, Âm lượng | **0%** | 100% | 36 | 22 / 10 | 0 | **PASS ✓** |
| **#6** | Tính từ | Độ khó, Dũng cảm, Kích thước | **0%** | 100% | 36 | 22 / 10 | 0 | **PASS ✓** |
| **#7** | Tính từ | Sức mạnh, Trí tuệ, Tốc độ | **0%** | 100% | 36 | 22 / 10 | 0 | **PASS ✓** |
| **#8** | Tính từ | Tuổi thọ, Giá cả, Âm lượng | **0%** | 100% | 36 | 22 / 10 | 0 | **PASS ✓** |
| **#9** | Tính từ | Độ khó, Dũng cảm, Kích thước | **0%** | 100% | 36 | 22 / 10 | 0 | **PASS ✓** |
| **#10** | Tính từ | Sức mạnh, Trí tuệ, Tốc độ | **0%** | 100% | 36 | 22 / 10 | 0 | **PASS ✓** |

> **Chỉ số Đạt được:**
> - **Trùng lặp Ván $N$ vs $N-1$:** $0.0\%$ (100% các ván kế tiếp nhau không có bất kỳ từ nào lặp lại).
> - **Độ phủ Kho từ:** Gặp toàn bộ 36/36 mục từ sau 3 ván đầu tiên.
> - **Đỉnh cô lập (Isolated Nodes):** $0$ qua mọi ván.
> - **Hệ số Wort-Kette Viability:** $100\%$ A+.

---

## 5. Tích hợp Giao diện Người dùng (UI Integration)

1. **Header Badge (`#match-rotation-tag`):**
   - Hiển thị số thứ tự ván và tỷ lệ trùng lặp: `Ván #1 · 12 từ (0% trùng)` hoặc `Ván #2 · 12 từ mới`.
2. **Setup Screen Rotation Status (`#setup-rotation-status`):**
   - Huy hiệu màu xanh ngọc hiển thị trạng thái xoay vòng hiện tại kèm nút bấm `Reset lịch sử` để người dùng/QA dễ dàng kiểm tra từ đầu.
3. **Workbench Thẩm định Lexicon (`/preview/dau-tu-lexicon-review`):**
   - Tab 5: **Mô phỏng Xoay vòng (Rotation Simulator)** cho phép chạy mô phỏng tức thì 10 ván Tính từ hoặc Động từ với bảng kiểm toán chi tiết và biểu đồ số liệu thời gian thực.
4. **Hộp thoại Luật chơi (Rules Modal):**
   - Bổ sung **Mục 06: Cơ chế Xoay vòng Từ vựng & Đa dạng hóa Ván đấu**, giải thích tính năng ôn tập ngắt quãng và tính công bằng trong phân bổ bài.

---

## 6. Kiểm thử Tự động & Bảo đảm An toàn

Hệ thống đi kèm bộ kiểm thử tự động toàn diện:
- `test-vocabulary-rotation.js`: 8/8 tests PASS (Kiểm tra cụm ngữ nghĩa, nhân bội lá bài, 10 ván mô phỏng Adjektive/Verben, tích hợp Game Engine, Reset History).
- `test-all.js`: **17/17 test suites PASS CLEANLY** (Bao gồm toàn bộ test hồi quy của VokabelGo, FSRS SRS, Evaluator, và Đấu từ v0.2, v0.3, v0.5).
- `e2e/capture-vocabulary-rotation.spec.js`: 3/3 tests PASS (Chụp màn hình Playwright tự động).
