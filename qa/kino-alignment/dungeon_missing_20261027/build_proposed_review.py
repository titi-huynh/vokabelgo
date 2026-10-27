"""Generate and verify proposed-review.json for Delicious in Dungeon S01E01 missing-line candidates."""
import json
import pathlib
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

root = pathlib.Path(__file__).resolve().parents[3]
qa_dir = pathlib.Path(__file__).resolve().parent

baseline = json.loads((qa_dir / "baseline-cues-367.json").read_text(encoding="utf-8"))
existing_cues = baseline["cues"]
cands = json.loads((qa_dir / "muse-candidates.json").read_text(encoding="utf-8"))["candidates"]

lesson_text = (root / "delicious-in-dungeon-s01e01-lesson.js").read_text(encoding="utf-8")
m_ch = re.search(r'"chapters"\s*:\s*(\[\s*\{.*?\}\s*\])\s*\}\s*,\s*"flashcards"', lesson_text, re.S)
chapters = json.loads(m_ch.group(1))

raw_files = {
    "qa/kino-alignment/dungeon_missing_20261027/independent-small.json": json.loads((qa_dir / "independent-small.json").read_text(encoding="utf-8")),
    "qa/kino-alignment/dungeon_missing_20261027/independent-medium.json": json.loads((qa_dir / "independent-medium.json").read_text(encoding="utf-8")),
    "qa/kino-alignment/dungeon_missing_20261027/independent-small-tight.json": json.loads((qa_dir / "independent-small-tight.json").read_text(encoding="utf-8")),
    "qa/kino-alignment/dungeon_missing_20261027/independent-medium-tight.json": json.loads((qa_dir / "independent-medium-tight.json").read_text(encoding="utf-8")),
    "qa/kino-alignment/dungeon_missing_20261027/independent-small-context.json": json.loads((qa_dir / "independent-small-context.json").read_text(encoding="utf-8")),
    "qa/kino-alignment/dungeon_missing_20261027/independent-medium-context.json": json.loads((qa_dir / "independent-medium-context.json").read_text(encoding="utf-8")),
}


def get_words(rel_file: str, candidate: int, start_min: float, end_max: float, label: str = None):
    payload = raw_files[rel_file]
    matched_words = []
    for win in payload["windows"]:
        if win["candidate"] != candidate:
            continue
        if label is not None and win.get("label") != label:
            continue
        for seg in win["segments"]:
            for w in seg["words"]:
                if w["start"] >= start_min - 1e-6 and w["end"] <= end_max + 1e-6:
                    matched_words.append(w)
    assert matched_words, f"No words found in {rel_file} cand={candidate} label={label} [{start_min}, {end_max}]"
    ev = {
        "file": rel_file,
        "candidate": candidate,
        "words": matched_words,
    }
    if label is not None:
        ev["label"] = label
    return ev


def join_words(ev):
    return "".join(w["word"] for w in ev["words"]).strip()


added_specs = [
    {
        "id": 1200385,
        "candidate": 1,
        "speaker": "Laios",
        "text": "Wenn wir ihn besiegt haben, können wir verschnaufen!",
        "vi": "Hạ xong nó rồi, chúng ta có thể nghỉ lấy hơi!",
        "sourceDraftIds": [],
        "smallEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-small.json", 1, 71.1, 73.1),
        "mediumEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-medium.json", 1, 71.1, 73.1),
        "timingFrom": "medium",
        "normalization": "Chuẩn hóa dấu chấm than cuối câu khích lệ theo medium ('verschnaufen!'). Toàn bộ 8 từ khớp tuyệt đối giữa small và medium.",
        "note": "Tách riêng câu khích lệ thứ hai trong cửa sổ #1 (câu đầu 69.79-70.89s bất đồng chia thức mệnh lệnh 'Halte' vs 'Haltet' nên giữ ở reviewNeeded). Nằm trọn trong khoảng trống 49.78-75.20s (Chapter 1: 0-148s).",
    },
    {
        "id": 1200386,
        "candidate": 1,
        "speaker": "Laios",
        "text": "Na los!",
        "vi": "Tiến lên nào!",
        "sourceDraftIds": [],
        "smallEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-small.json", 1, 73.6, 74.5),
        "mediumEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-medium.json", 1, 73.6, 74.5),
        "timingFrom": "medium",
        "normalization": "Không cần chuẩn hóa từ; cả small và medium đều chép chính xác 'Na los!'.",
        "note": "Tách riêng câu hô ngắn cuối cửa sổ #1 trước cue 1200008 (75.20-77.20s). Nằm trọn trong khoảng trống 49.78-75.20s (Chapter 1: 0-148s).",
    },
    {
        "id": 1200387,
        "candidate": 3,
        "speaker": "Laios",
        "text": "Was ist los, Falin?",
        "vi": "Có chuyện gì vậy, Falin?",
        "sourceDraftIds": [1200015],
        "smallEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-small.json", 3, 112.4, 113.6),
        "mediumEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-medium.json", 3, 112.4, 113.6),
        "timingFrom": "medium",
        "normalization": "Chuẩn hóa tên riêng nhân vật có căn cứ: ASR phiên âm ngữ âm thành 'Falli?' (small main), 'Fallen?' (small tight), 'Vali?' (medium main), 'Fali?' (medium tight) -> chuẩn hóa thành 'Falin' theo đúng tên em gái của Laios trong các cue hiện hữu (1200024, 1200072, 1200075) và bản nháp 1200015.",
        "note": "Khớp câu hỏi của Laios trước cue 1200016 (114.00-115.78s: 'Wurde sie mit einem Verwirrzauber belegt?'). Nằm trọn trong khoảng trống 110.56-114.00s (Chapter 1: 0-148s). Phần 113.93-114.99s là đầu cue 1200016 đã có sẵn nên đưa vào excluded.",
    },
    {
        "id": 1200388,
        "candidate": 6,
        "speaker": "Laios",
        "text": "Alles in Ordnung, Marcille?",
        "vi": "Cậu không sao chứ, Marcille?",
        "sourceDraftIds": [1200253],
        "smallEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-small-tight.json", 6, 985.7, 987.1, label="cand6_tight"),
        "mediumEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-medium.json", 6, 985.7, 987.1),
        "timingFrom": "medium",
        "normalization": "Chuẩn hóa tên riêng nhân vật có căn cứ: ASR phiên âm ngữ âm thành 'Masse?' (small tight/gap, medium tight/gap) và 'Marcel?' (medium main) -> chuẩn hóa thành 'Marcille' theo đúng tên pháp sư Marcille trong các cue hiện hữu (1200018, 1200083, 1200227) và bản nháp 1200253.",
        "note": "Laios hỏi thăm sau khi Marcille vấp tấm ván, trước câu trả lời ở cue 1200254 (987.64-989.98s: 'Ich bin über ein loses Brett gestolpert.'). Nằm trọn trong khoảng trống 983.66-987.64s (Chapter 6: 958-1155s).",
    },
    {
        "id": 1200389,
        "candidate": 7,
        "speaker": "Marcille",
        "text": "Geht mal zur Seite!",
        "vi": "Mọi người lùi sang một bên đi!",
        "sourceDraftIds": [1200308],
        "smallEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-small.json", 7, 1155.0, 1156.4),
        "mediumEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-medium-tight.json", 7, 1155.0, 1156.5, label="cand7_gap_ch7"),
        "timingFrom": "small",
        "normalization": "Chuẩn hóa dấu câu cuối câu ('Geht mal zur Seite!' theo small-tight và medium-tight). Cả 4 từ khớp tuyệt đối giữa small và medium.",
        "note": "Marcille bảo cả nhóm lùi ra trước khi đọc chú ở cue 1200309 (1157.66-1159.88s: 'Ich werde sie alle auf einmal erledigen.'). Word bounds từ small main (1155.03-1156.33s) nằm trọn sau ranh giới Chapter 7 (1155.00s) và sau cue 1200307 (1151.56-1154.24s).",
    },
    {
        "id": 1200390,
        "candidate": 9,
        "speaker": "Chilchuck",
        "text": "Die ist echt gut.",
        "vi": "Món này ngon thật đấy.",
        "sourceDraftIds": [1200356],
        "smallEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-small-context.json", 9, 1336.24, 1338.0, label="cand9_full_gap"),
        "mediumEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-medium-context.json", 9, 1336.7, 1338.35, label="cand9_full_gap"),
        "timingFrom": "medium",
        "normalization": "Không cần chuẩn hóa từ; cả small và medium trên cửa sổ mở rộng toàn khoảng trống (cand9_full_gap: 1336.25-1342.30s) đều nhận dạng chính xác 'Die ist echt gut.'.",
        "note": "Câu đầu trong lượt thoại của Chilchuck (bản nháp 1200356: 1337.28-1341.26s) nằm trong khoảng trống 1336.20-1342.38s giữa cue 1200355 và 1200357. Cửa sổ gốc của Muse (1339.06-1342.95s) bắt đầu từ 1339.06s nên cắt mất câu này; cửa sổ mở rộng cand9_full_gap khôi phục trọn vẹn.",
    },
    {
        "id": 1200391,
        "candidate": 9,
        "speaker": "Chilchuck",
        "text": "Probier doch mal, Marcille.",
        "vi": "Nếm thử một miếng đi, Marcille.",
        "sourceDraftIds": [1200356],
        "smallEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-small-context.json", 9, 1338.4, 1339.7, label="cand9_full_gap"),
        "mediumEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-medium-context.json", 9, 1338.8, 1340.4, label="cand9_full_gap"),
        "timingFrom": "small",
        "normalization": "Chuẩn hóa dấu phẩy trước tên gọi và tên riêng nhân vật có căn cứ: ASR phiên âm ngữ âm thành 'Masse.'/'Masse,' -> chuẩn hóa thành 'Marcille' theo đúng tên nhân vật trong các cue hiện hữu (1200018, 1200083, 1200227) và bản nháp 1200356.",
        "note": "Câu thứ hai trong lượt thoại của Chilchuck (bản nháp 1200356). Cửa sổ gốc của Muse bắt đầu tại 1339.06s đúng giữa từ 'Probier' (1338.49-1338.97s) khiến main chỉ nhận được '...doch mal Masse'; khi mở rộng về đầu khoảng trống (cand9_full_gap và cand9_probier_schmecken), cả small và medium đều nhận đủ 4 từ 'Probier doch mal Masse.'.",
    },
    {
        "id": 1200392,
        "candidate": 9,
        "speaker": "Chilchuck",
        "text": "Könnte dir schmecken.",
        "vi": "Biết đâu lại hợp khẩu vị của cô.",
        "sourceDraftIds": [1200356],
        "smallEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-small.json", 9, 1340.3, 1341.2),
        "mediumEvidence": get_words("qa/kino-alignment/dungeon_missing_20261027/independent-medium.json", 9, 1340.4, 1341.2),
        "timingFrom": "medium",
        "normalization": "Chuẩn hóa chữ hoa đầu câu và dấu chấm cuối câu ('Könnte dir schmecken.' khớp trực tiếp với medium-tight và medium-context). Lưu ý: trên cand9_full_gap, small đổi sang 'Könntet ihr schmecken?' do hiểu 'Masse' phía trước là danh từ số nhiều, nhưng trên cả main và tight độc lập, small và medium đều đồng thuận 'Könnte dir schmecken'.",
        "note": "Câu thứ ba trong lượt thoại của Chilchuck (bản nháp 1200356), nằm trọn trong khoảng trống trước cue 1200357 (1342.38-1345.74s). Phần 1341.94-1342.72s ('Die f...') ở small main là đầu cue 1200357 nên đưa vào excluded.",
    },
]

added_entries = []
for spec in added_specs:
    s_ev = spec["smallEvidence"]
    m_ev = spec["mediumEvidence"]
    t_ev = s_ev if spec["timingFrom"] == "small" else m_ev
    raw_start = t_ev["words"][0]["start"]
    raw_end = t_ev["words"][-1]["end"]
    added_entries.append({
        "id": spec["id"],
        "parentId": spec["id"],
        "candidate": spec["candidate"],
        "start": raw_start,
        "end": raw_end,
        "rawStart": raw_start,
        "rawEnd": raw_end,
        "speaker": spec["speaker"],
        "text": spec["text"],
        "vi": spec["vi"],
        "sourceDraftIds": spec["sourceDraftIds"],
        "smallText": join_words(s_ev),
        "mediumText": join_words(m_ev),
        "timingEvidence": t_ev,
        "smallEvidence": s_ev,
        "mediumEvidence": m_ev,
        "normalization": spec["normalization"],
        "note": spec["note"],
    })

excluded_entries = [
    {
        "candidate": 2,
        "window": [79.09, 83.91],
        "museRange": [80.29, 82.71],
        "smallText": "(no segments on main/gap/core/part1/with_neighbors/with_prev) | Ja (cand2_part2: 81.20-82.14s, prob=0.057, no_speech_prob=0.778)",
        "mediumText": "Das war's für heute. | Bis zum nächsten Mal. (main, no_speech_prob=0.784) | Ahhhh... (cand2_gap: 82.63-84.03s, no_speech_prob=0.780) | HÄÄÄÄÄH! (cand2_core: 80.00-81.74s, no_speech_prob=0.735) | (no segments in 78.82-84.10s on cand2_part1, cand2_part2, cand2_with_neighbors, cand2_with_prev)",
        "classification": "excluded_non_lexical_battle_vocalization_and_asr_hallucination",
        "reason": "Đã kiểm tra kỹ bằng 7 cửa sổ hẹp và rộng (main, cand2_gap, cand2_core, cand2_part1, cand2_part2, cand2_with_neighbors, cand2_with_prev) giữa cue 1200009 (77.76-78.82s: 'Wir haben keine Schwächen.') và cue 1200010 (84.10-88.60s: 'Bis auf einen Riesenhunger.'). Khi neo ngữ cảnh với các câu thoại thật kề bên (cand2_with_neighbors, cand2_with_prev), cả small và medium đều xác nhận 0 từ thoại trong khoảng 78.82-84.10s. Trên các cửa sổ cắt rời, medium main sinh câu ảo giác kết video điển hình của Whisper ('Das war's für heute. Bis zum nächsten Mal.', no_speech_prob=0.784), còn medium tight chỉ ghi nhận tiếng hét/gồng chiến đấu phi từ vựng ('HÄÄÄÄÄH!', 'Ahhhh...', no_speech_prob=0.735-0.780). Không có câu thoại tiếng Đức để thêm.",
        "sourceCandidateAsr": [],
    },
    {
        "candidate": 3,
        "window": [111.41, 115.02],
        "museRange": [113.93, 115.02],
        "smallText": "Wurde sie mit einem Pevel... (113.93-114.99s)",
        "mediumText": "Wurde sie mit einem Pfeffer? (114.03-114.97s)",
        "classification": "excluded_duplicate_existing_cue",
        "reason": "Phần cuối cửa sổ #3 (từ 113.93s) tràn vào nửa đầu của cue hiện hữu 1200016 (114.00-115.78s: 'Wurde sie mit einem Verwirrzauber belegt?'). Riêng câu hỏi trước đó (112.47-113.49s: 'Was ist los, Falin?') đã được tách và đề xuất thêm thành cue 1200387.",
        "sourceCandidateAsr": [
            "Was ist los, Vali?",
            "Wurde sie mit einem verwirrten..."
        ],
    },
    {
        "candidate": 4,
        "window": [321.17, 325.93],
        "museRange": [321.17, 321.95],
        "smallText": "Passieren mag? (321.17-321.79s)",
        "mediumText": "Passieren mag? (321.17-321.95s)",
        "classification": "excluded_duplicate_existing_cue",
        "reason": "Phần đầu cửa sổ #4 (321.17-321.95s: 'Passieren mag?') trùng với đuôi của cue hiện hữu 1200078 (316.66-322.08s: 'Ihr wollt wirklich alle beide mit mir in den Dungeon kommen? Egal, was dort passieren mag?'). Phần ngập ngừng sau đó (322.12-324.74s) được phân loại vào reviewNeeded do vắt ngang ranh giới Chapter 2/3 tại 324.0s.",
        "sourceCandidateAsr": [
            "Passieren mag?",
            "Äh...",
            "Äh... ja."
        ],
    },
    {
        "candidate": 5,
        "window": [395.77, 399.24],
        "museRange": [395.77, 399.24],
        "smallText": "(no segments on main; cand5_with_neighbors nhận câu 398.06-400.56s: 'Die sind noch nicht lange im Dungeon, oder?')",
        "mediumText": "NOOOOOBS! (396.61-397.03s) ... Die sind noch- (398.69-399.21s)",
        "classification": "excluded_duplicate_existing_cues",
        "reason": "Hai đầu biên của cửa sổ #5 chồng lên cue hiện hữu 1200097 (395.98-396.86s: 'Rettet uns!') và đầu cue hiện hữu 1200098 (398.32-400.80s: 'Die sind noch nicht lange im Dungeon, oder?'). Riêng tiếng hô ngắn ở khe 396.88-398.30s ('Ja!' vs 'Hier!') được giữ trong reviewNeeded.",
        "sourceCandidateAsr": [
            "Hier!",
            "Die sind noch..."
        ],
    },
    {
        "candidate": 6,
        "window": [982.84, 988.59],
        "museRange": [982.84, 988.59],
        "smallText": "dann schon erst (982.84-983.46s) ... ich bin über ein (987.80-988.56s)",
        "mediumText": "Dungeon Nest. (982.84-983.72s) ... Ich bin über ein... (987.88-988.56s)",
        "classification": "excluded_duplicate_existing_cues",
        "reason": "Hai đầu biên của cửa sổ #6 trùng với đuôi cue hiện hữu 1200252 (981.40-983.66s: 'Vielleicht, weil das ein verfluchter Dungeon ist.') và đầu cue hiện hữu 1200254 (987.64-989.98s: 'Ich bin über ein loses Brett gestolpert.'). Câu hỏi ở giữa (985.76-987.06s: 'Alles in Ordnung, Marcille?') đã được tách và đề xuất thêm thành cue 1200388.",
        "sourceCandidateAsr": [
            "Dungeon Nest. Alles in Ordnung, Marcel? Ich bin über ein..."
        ],
    },
    {
        "candidate": 7,
        "window": [1152.79, 1158.47],
        "museRange": [1152.79, 1158.47],
        "smallText": "kämpfen (1152.79-1153.39s)",
        "mediumText": "kämpfen (1154.41-1155.19s) ... ich werde sie (1156.65-1158.37s)",
        "classification": "excluded_duplicate_existing_cues",
        "reason": "Biên đầu ('kämpfen') trùng với đuôi cue hiện hữu 1200307 (1151.56-1154.24s: 'Dann müssen wir eben kämpfen.') và biên cuối ('ich werde sie') trùng với đầu cue hiện hữu 1200309 (1157.66-1159.88s: 'Ich werde sie alle auf einmal erledigen.'). Câu mệnh lệnh nằm trọn giữa hai cue và sau mốc Chapter 7 (1155.03-1156.33s: 'Geht mal zur Seite!') đã được tách và đề xuất thêm thành cue 1200389.",
        "sourceCandidateAsr": [
            "Kämpfen.",
            "Geht mal zur Seite.",
            "Hm?",
            "Ich werde sie..."
        ],
    },
    {
        "candidate": 8,
        "window": [1159.7, 1171.53],
        "museRange": [1159.7, 1168.64],
        "smallText": "Spiele E. Jepton Lufens. | Alamando Aspojo. | Nexanto Aslas! (1159.70-1168.28s)",
        "mediumText": "Späler e Jepton Lufelsk, Halaman Doas Fodju, Hextanto Aslas! (1160.82-1168.64s)",
        "classification": "excluded_fictional_magic_incantation",
        "reason": "Đoạn 1159.70-1168.64s là lời niệm thần chú phép thuật bằng ngôn ngữ giả tưởng của Marcille (đã được ghi nhận trong danh mục exclusions của hồ sơ gốc muse-two-films/delicious_in_dungeon_s01e01.json: 1159.88-1168.60s). Theo đúng yêu cầu, không cố sửa hay ép thành câu tiếng Đức.",
        "sourceCandidateAsr": [
            "Späler e Jepton Lufels.",
            "Halaman Doas Hojo.",
            "Hexan Tor Aslas!",
            "Hör auf du Nergl!",
            "Äh, wieso?"
        ],
    },
    {
        "candidate": 8,
        "window": [1159.7, 1171.53],
        "museRange": [1170.36, 1171.53],
        "smallText": "Äh, wieso? (1170.36-1171.34s)",
        "mediumText": "Äh, wieso? (1170.38-1171.44s)",
        "classification": "excluded_duplicate_existing_cue",
        "reason": "Phần cuối cửa sổ #8 (1170.36-1171.44s: 'Äh, wieso?') chồng trực tiếp lên cue hiện hữu 1200311 (1170.98-1171.88s: 'Wieso denn?'; thậm chí từ 'Äh,' ở medium kéo tới 1171.02s vượt qua mốc 1170.98s của cue 1200311). Giữ nguyên tuyệt đối cue 1200311 hiện hữu.",
        "sourceCandidateAsr": [
            "Späler e Jepton Lufels.",
            "Halaman Doas Hojo.",
            "Hexan Tor Aslas!",
            "Hör auf du Nergl!",
            "Äh, wieso?"
        ],
    },
    {
        "candidate": 9,
        "window": [1339.06, 1342.95],
        "museRange": [1341.94, 1342.95],
        "smallText": "Die f... (1341.94-1342.72s)",
        "mediumText": "(no segment after 1341.18s)",
        "classification": "excluded_duplicate_existing_cue",
        "reason": "Mảnh 'Die f...' (1341.94-1342.72s) ở cuối cửa sổ #9 là phần đầu bị cắt ngang của cue hiện hữu 1200357 (1342.38-1345.74s: 'Die Früchte sind doch nicht von der Pflanze, in der die Leiche war, oder?').",
        "sourceCandidateAsr": [
            "Mal Masse könnte dir schmecken"
        ],
    },
    {
        "candidate": 10,
        "window": [1454.26, 1502.76],
        "museRange": [1455.46, 1501.56],
        "smallText": "Ja, ich glaube, das ist das, was wir hier haben. | Das ist das, was wir hier haben. (x8, 1484.26-1502.66s, no_speech_prob=0.779)",
        "mediumText": "(no segments across entire 1454.26-1502.76s window)",
        "classification": "excluded_ending_theme_song_and_asr_hallucination",
        "reason": "Cửa sổ #10 (1454.26-1502.76s, sau câu kết tập 1200384 tại 1445.96-1449.52s) nằm trong phần bài hát kết thúc tiếng Nhật ('Sleep Walking Orchestra') và credit cuối tập (đã ghi nhận trong exclusions 1449.52-1607.488s của hồ sơ gốc). Mô hình medium độc lập trả về 0 segment trên toàn bộ 48.5 giây; mô hình small độc lập trống suốt 30 giây đầu và bị lặp ảo giác 9 lần câu 'Das ist das, was wir hier haben.' (no_speech_prob=0.779). Loại trừ hoàn toàn.",
        "sourceCandidateAsr": [
            "Die Lichter, die sich von der Tür aus aus der Wand ausklappen, sind die ersten Freunde, die sich die Klappen von den Händen von der Erde ausklappen.",
            "Sie wurden dann in der Träume geführt.",
            "Einige Verständnisse sind auf die Klappen gesiedelt.",
            "Manchmal ist es so, dass der Maul sich im Boden befindet.",
            "Die Regen sind so leise, dass man sich nicht mehr wachsend fühlt.",
            "Das war's für heute.",
            "Bis zum nächsten Mal.",
            "Tschüss."
        ],
    },
]

review_needed_entries = [
    {
        "candidate": 1,
        "window": [68.85, 75.91],
        "museRange": [69.79, 70.89],
        "smallText": "Halte durch, Freunde. (main: 69.79-70.79s) | Ah, der Deutschmann! (cand1_haltet: 69.82-70.72s) | Halte Durchfreunde! (cand1_full_gap: 69.90-70.86s)",
        "mediumText": "Haltet durch, Freunde! (main: 69.91-70.89s; cand1_full_gap: 69.88-70.90s) | Halte durch, Freude! (cand1_haltet: 69.92-70.92s)",
        "classification": "review_needed_asr_grammar_disagreement",
        "reason": "Câu đầu của cửa sổ #1 (69.79-70.89s) bất đồng hình thái chia động từ mệnh lệnh giữa small ('Halte durch, Freunde.' / 'Halte Durchfreunde!' / 'Ah, der Deutschmann!') và medium ('Haltet durch, Freunde!' ở main/context, nhưng 'Halte durch, Freude!' ở tight). Theo quy tắc không âm thầm sửa ngữ pháp của ASR khi small không xác nhận hình thái số nhiều 'Haltet', giữ câu ngắn đầu này ở reviewNeeded (hai câu tiếp theo trong cùng cửa sổ là 'Wenn wir ihn besiegt haben, können wir verschnaufen!' và 'Na los!' đã được cả hai model xác nhận tuyệt đối và tách vào added).",
        "sourceCandidateAsr": [
            "Haltet durch, Freunde! Wenn wir ihn besiegt haben, können wir verschnaufen!",
            "Na los!"
        ],
    },
    {
        "candidate": 4,
        "window": [321.17, 325.93],
        "museRange": [322.37, 324.73],
        "smallText": "Äh... (322.65-323.45s) | Äh, ja. (323.45-324.31s; cand4_gap: 'Äh, äh, ja.' 322.12-324.30s)",
        "mediumText": "Uhh... (323.17-323.61s) | Uh, ja. (323.61-324.43s; cand4_gap: 'Ah... | Ah, ja...' 322.12-324.74s)",
        "classification": "review_needed_crosses_chapter_boundary_and_hesitation_disagreement",
        "reason": "Lượt đáp ngập ngừng ở 322.12-324.74s vắt trực tiếp qua ranh giới giữa Chapter 2 (148.0-324.0s) và Chapter 3 (324.0-571.9s) trong delicious-in-dungeon-s01e01-lesson.js: các thán từ ngập ngừng ('Äh... Äh,' / 'Uhh... Uh,' / 'Ah... Ah,', prob thấp 0.17-0.38) nằm trước 323.94s (Chapter 2), còn từ 'ja' nằm tại 324.04-324.74s (Chapter 3). Theo quy tắc chỉ đề xuất câu có word bounds nằm trọn trong gap giữa cue cũ và chapter, tuyệt đối không cắt từ để ép vừa, giữ phần này ở reviewNeeded.",
        "sourceCandidateAsr": [
            "Passieren mag?",
            "Äh...",
            "Äh... ja."
        ],
    },
    {
        "candidate": 5,
        "window": [395.77, 399.24],
        "museRange": [396.97, 398.04],
        "smallText": "(no segments on main and cand5_with_neighbors) | Ja! (cand5_gap: 396.88-397.32s, prob=0.329, no_speech_prob=0.470)",
        "mediumText": "Hier! (main: 397.21-397.43s, prob=0.104, no_speech_prob=0.833; cand5_gap: 396.88-397.42s, prob=0.120, no_speech_prob=0.644; cand5_with_neighbors: không ghi nhận)",
        "classification": "review_needed_model_disagreement_and_low_confidence",
        "reason": "Trong khe hẹp 1.46s giữa cue 1200097 (395.98-396.86s: 'Rettet uns!') và cue 1200098 (398.32-400.80s: 'Die sind noch nicht lange im Dungeon, oder?'), cả hai model đều không nhận được từ nào khi chạy kèm ngữ cảnh hai bên (cand5_with_neighbors), còn khi cắt hẹp thì bất đồng và độ tự tin rất thấp (small: trống ở main, 'Ja!' prob=0.329 ở tight; medium: 'Hier!' prob=0.104-0.120, no_speech_prob=0.644-0.833). Giữ reviewNeeded.",
        "sourceCandidateAsr": [
            "Hier!",
            "Die sind noch..."
        ],
    },
    {
        "candidate": 6,
        "window": [982.84, 988.59],
        "museRange": [983.7, 985.02],
        "smallText": "(no segments in 983.70-985.60s on main) | Nein! (cand6_gap: 983.70-984.06s, prob=0.172)",
        "mediumText": "(no segments in 983.72-985.82s on main) | Ah! (983.70-984.20s, prob=0.153) | Hm? (984.80-985.02s, prob=0.184) on cand6_gap",
        "classification": "review_needed_low_confidence_exclamation_disagreement",
        "reason": "Tiếng kêu/giật mình lúc Marcille vấp tấm ván (983.70-985.02s, ngay trước câu hỏi 'Alles in Ordnung, Marcille?' tại 985.76-987.06s) không xuất hiện trên main của cả hai model, và khi cắt hẹp khoảng trống (cand6_gap) thì bất đồng với xác suất rất thấp (small: 'Nein!' prob=0.172; medium: 'Ah! | Hm?' prob=0.153-0.184). Đã tách riêng câu hỏi 'Alles in Ordnung, Marcille?' vào added (1200388) và giữ phần thán từ 983.70-985.02s ở reviewNeeded.",
        "sourceCandidateAsr": [
            "Dungeon Nest. Alles in Ordnung, Marcel? Ich bin über ein..."
        ],
    },
    {
        "candidate": 8,
        "window": [1159.7, 1171.53],
        "museRange": [1168.68, 1170.16],
        "smallText": "Rauf zu nägeln! (main: 1168.80-1169.98s) | Aufzunaggen! (cand8_post_spell: 1168.50-1170.00s)",
        "mediumText": "Hör auf, du Nergel! (main: 1169.08-1170.06s) | Hör auf zu nageln! (cand8_post_spell: 1168.50-1170.16s)",
        "classification": "review_needed_model_disagreement",
        "reason": "Câu quát của Senshi cắt ngang thần chú của Marcille (1168.80-1170.16s, tương ứng bản nháp 1200310 'Hör auf, du Närrin!' từng gắn cờ uncertain trong muse-two-films) bất đồng mạnh giữa small ('Rauf zu nägeln!' / 'Aufzunaggen!') và medium ('Hör auf, du Nergel!' / 'Hör auf zu nageln!'), và không model nào nhận ra từ 'Närrin'. Không tự sửa bằng chứng máy, giữ reviewNeeded.",
        "sourceCandidateAsr": [
            "Späler e Jepton Lufels.",
            "Halaman Doas Hojo.",
            "Hexan Tor Aslas!",
            "Hör auf du Nergl!",
            "Äh, wieso?"
        ],
    },
]

proposed_review = {
    "movieId": "delicious_in_dungeon_s01e01",
    "title": "Delicious in Dungeon — Tập 1 (S01E01)",
    "date": "2026-10-27",
    "status": "proposed_for_codex_integration",
    "sourceVideo": baseline["sourceVideo"],
    "sourceVideoSha256": baseline["sourceVideoSha256"],
    "alignedJs": baseline["alignedJs"],
    "alignedJsSha256": baseline["alignedJsSha256"],
    "lessonJs": baseline["lessonJs"],
    "lessonJsSha256": baseline["lessonJsSha256"],
    "candidateFile": baseline["candidateFile"],
    "candidateSha256": baseline["candidateSha256"],
    "sourceDraftFile": baseline["sourceDraftFile"],
    "sourceDraftSha256": baseline["sourceDraftSha256"],
    "baselineSnapshotFile": "qa/kino-alignment/dungeon_missing_20261027/baseline-cues-367.json",
    "independentEvidence": [
        "qa/kino-alignment/dungeon_missing_20261027/independent-small.json",
        "qa/kino-alignment/dungeon_missing_20261027/independent-medium.json",
        "qa/kino-alignment/dungeon_missing_20261027/independent-small-tight.json",
        "qa/kino-alignment/dungeon_missing_20261027/independent-medium-tight.json",
        "qa/kino-alignment/dungeon_missing_20261027/independent-small-context.json",
        "qa/kino-alignment/dungeon_missing_20261027/independent-medium-context.json",
        "qa/kino-alignment/dungeon_missing_20261027/extra_tight_spec.json",
        "qa/kino-alignment/dungeon_missing_20261027/extra_context_spec.json",
    ],
    "method": {
        "humanListened": False,
        "externalAudioUpload": False,
        "asrModels": [
            "faster-whisper small (int8, CPU)",
            "faster-whisper medium (int8, CPU)",
        ],
        "asrOptions": {
            "language": "de",
            "beam_size": 5,
            "temperature": 0.0,
            "word_timestamps": True,
            "condition_on_previous_text": False,
            "vad_filter": False,
            "local_files_only": True,
            "cpu_threads": 3,
            "initial_prompt": None,
            "hotwords": None,
        },
        "idPolicy": "Giữ nguyên tuyệt đối 367 cue hiện tại (1200001..1200384) và 17 ID bản nháp đã bảo lưu trong muse-two-films/delicious_in_dungeon_s01e01.json (MAX source reservation = 1200384). ID đề xuất mới bắt đầu từ 1200385..1200392 (Codex sẽ cấp/duyệt khi tích hợp).",
        "normalizationPolicy": "Không âm thầm sửa ngữ pháp sai của ASR (ví dụ: giữ 'Halte durch, Freunde' vs 'Haltet durch, Freunde!' ở reviewNeeded). Chỉ chuẩn hóa dấu câu, chữ hoa đầu câu và 2 tên riêng nhân vật có căn cứ trực tiếp trong 367 cue hiện hữu của tập phim ('Falin' từ ASR ngữ âm Falli/Vali/Fallen/Fali; 'Marcille' từ ASR ngữ âm Masse/Marcel), có ghi chú rõ ở từng mục.",
        "countingMethod": "Xét đầy đủ cả 10 cửa sổ ứng viên (1..10). Các lượt thoại ngắn được tách thành từng câu độc lập. Một cửa sổ ứng viên có thể vừa chứa câu được đề xuất thêm (added), phần bị loại trừ (excluded - trùng cue kề, thần chú ngôn ngữ hư cấu, nhạc kết tập, tiếng hét phi từ vựng/ảo giác ASR) và phần cần người duyệt thêm (reviewNeeded).",
    },
    "counts": {
        "candidates": 10,
        "previousCueCount": 367,
        "maxExistingCueId": 1200384,
        "maxSourceReservationId": 1200384,
        "proposedNewIdRange": [1200385, 1200392],
        "proposedAddedCues": len(added_entries),
        "proposedAddedCuesWithinOriginalMuseWindow": 6,
        "proposedAddedCuesFromExpandedCandidate9Gap": 2,
        "adjustedExistingCues": 0,
        "excludedParts": len(excluded_entries),
        "reviewNeededParts": len(review_needed_entries),
        "windowsWithAddedCues": len({x["candidate"] for x in added_entries}),
        "windowsWithExcludedParts": len({x["candidate"] for x in excluded_entries}),
        "windowsWithReviewNeededParts": len({x["candidate"] for x in review_needed_entries}),
        "allTenWindowsAccountedFor": sorted(list({x["candidate"] for x in added_entries} | {x["candidate"] for x in excluded_entries} | {x["candidate"] for x in review_needed_entries})) == list(range(1, 11)),
    },
    "added": added_entries,
    "excluded": excluded_entries,
    "reviewNeeded": review_needed_entries,
}

out_path = qa_dir / "proposed-review.json"
out_path.write_text(json.dumps(proposed_review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Wrote proposed-review.json successfully.")
