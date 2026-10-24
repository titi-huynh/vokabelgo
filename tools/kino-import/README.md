# Kino Import — thêm phim bán tự động

Sinh bản nháp dữ liệu cho một phim Kino mới từ phụ đề SRT song ngữ.

```bash
node tools/kino-import/import.js --de film.de.srt --vi film.vi.srt \
  --key mein_film --title "Tên phim" --part-seconds 150 --out thu-muc-ra
```

Đầu ra trong thư mục đích:

- `<key>-aligned.draft.js` — mảng `*_ALIGNED_UTTERANCES` đúng định dạng repo
  (`{id, parentId, start, end, text, vi}`), ghép DE–VI theo mốc bắt đầu gần nhất
  (dung sai mặc định 1,6s, đổi bằng `--tolerance`).
- `chapterdata.draft.json` — khung `chapterData`: phần cắt theo độ dài mục tiêu
  + khoảng lặng, `picks` nháp = 7 câu đầu mỗi phần, kèm `cueCount` và thời lượng.
- `import-report.md` — số câu ghép được/chưa có dịch, bảng ứng viên từ vựng theo
  tần suất (nghĩa để trống), và danh sách việc còn phải làm tay.

Mọi đầu ra đều là **nháp** — phim chỉ lên app sau khi biên tập viên rà bản dịch,
đặt tên phần/mục tiêu, chọn lại picks và soạn flashcards (xem mục cuối của
`import-report.md`).
