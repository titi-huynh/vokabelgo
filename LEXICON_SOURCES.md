# VOKABELGO — NGUỒN TỪ ĐIỂN MỞ RỘNG & BẢN QUYỀN (LEXICON SOURCES)

Tài liệu này ghi nhận thông tin nguồn dữ liệu, đặc tả API, chính sách lưu trữ bộ đệm và điều khoản bản quyền của các nhà cung cấp từ điển được tích hợp vào game **Đấu Từ** trong VokabelGo.

---

## 1. NGUỒN ĐẦU TIÊN: OPENTHESAURUS (TIẾNG ĐỨC)

### Thông tin chung
- **Tên dịch vụ**: OpenThesaurus — Deutscher Thesaurus / Synonymwörterbuch
- **Trang chủ**: [https://www.openthesaurus.de](https://www.openthesaurus.de)
- **Tài liệu API**: [https://www.openthesaurus.de/about/api](https://www.openthesaurus.de/about/api)
- **Tác giả / Duy trì**: Daniel Naber và cộng đồng mã nguồn mở OpenThesaurus.

### Giấy phép Bản quyền (License)
Dữ liệu của OpenThesaurus được phân phối dưới các giấy phép nguồn mở sau:
1. **Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0)**
   - [https://creativecommons.org/licenses/by-sa/4.0/](https://creativecommons.org/licenses/by-sa/4.0/)
2. **GNU Lesser General Public License (LGPL)**
   - [https://www.gnu.org/licenses/lgpl-3.0.html](https://www.gnu.org/licenses/lgpl-3.0.html)

### Đoạn ghi nhận quyền tác giả bắt buộc (Mandatory Attribution Text)
Tại mọi màn hình xem xét dữ liệu (`/preview/dau-tu-lexicon-review`), chân trang hoặc tài liệu dự án, đoạn văn bản ghi nhận quyền tác giả sau được hiển thị rõ ràng:

> **Attribution**: *Daten von OpenThesaurus (www.openthesaurus.de), lizenziert unter CC-BY-SA 4.0 / GNU LGPL.*
> *Dữ liệu từ điển ứng viên được cung cấp bởi OpenThesaurus. Dữ liệu trò chơi Đấu Từ đã qua tinh tuyển, xác thực ngữ cảnh và thích ứng giáo dục bởi đội ngũ VokabelGo.*

---

## 2. ĐẶC TẢ GIAO DIỆN API (OPENTHESAURUS HTTP REST API)

### Endpoint tìm kiếm từ đồng nghĩa
- **URL**: `https://api.openthesaurus.de/synonyme/search`
- **Phương thức**: `GET`
- **Các tham số truy vấn (Query Parameters)**:
  - `q`: Từ khóa tiếng Đức cần tra cứu (ví dụ: `schwer`, `beginnen`). Bắt buộc mã hóa URL UTF-8.
  - `format`: Định dạng trả lời. Giá trị bắt buộc: `application/json`.
  - `similar`: (boolean, tùy chọn) Tìm kiếm từ gần đúng nếu từ chính xác không có trong cơ sở dữ liệu (`true`/`false`).

### Cấu trúc phản hồi JSON mẫu từ OpenThesaurus
```json
{
  "synsets": [
    {
      "id": 14210,
      "categories": ["Bildung/Wissenschaft"],
      "terms": [
        { "term": "schwer", "level": "standard" },
        { "term": "schwierig", "level": "standard" },
        { "term": "kompliziert", "level": "standard" }
      ]
    },
    {
      "id": 3589,
      "categories": ["Physik/Gewicht"],
      "terms": [
        { "term": "schwer", "level": "standard" },
        { "term": "gewichtig", "level": "gehoben" },
        { "term": "wuchtig", "level": "standard" }
      ]
    }
  ]
}
```

---

## 3. CHÍNH SÁCH BỘ ĐỆM & GIỚI HẠN TRUY CẬP (FAIR USE & CACHING POLICY)

1. **Bộ đệm đĩa bắt buộc (Disk Cache First)**:
   - Tất cả các yêu cầu gửi đến OpenThesaurus được lưu cục bộ dưới định dạng JSON tại `data/lexicon/raw/openthesaurus/<encoded-lemma>.json`.
   - `OpenThesaurusAdapter` luôn kiểm tra file đĩa trước. Nếu file tồn tại, adapter lập tức đọc từ đĩa mà không phát sinh bất kỳ yêu cầu mạng nào.
2. **Rate Limiting & Tôn trọng máy chủ cộng đồng**:
   - Khi chạy script đồng bộ hàng loạt (Bulk Import), hệ thống áp dụng khoảng nghỉ trễ (Rate-limiting delay) tối thiểu 500ms giữa các yêu cầu.
   - Thiết lập `User-Agent` tường minh: `VokabelGo-DauTu-Lexicon/0.1 (Educational Game Project)`.
   - Timeout mạng nghiêm ngặt: tối đa 6000ms.
3. **Cách ly Runtime (Zero Network Call in Gameplay)**:
   - Trò chơi không gửi bất kỳ request nào đến máy chủ OpenThesaurus trong suốt quá trình người chơi đánh bài.
