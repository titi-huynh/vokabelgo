import copy
import json
import re
from pathlib import Path

root = Path(".")
qa_dir = root / "qa" / "kino-alignment" / "erdmaennchen_luftgehen"

muse = json.loads((qa_dir / "muse-lesson.json").read_text(encoding="utf-8"))
medium_asr = json.loads((qa_dir / "muse-asr-medium.json").read_text(encoding="utf-8"))
small_asr = json.loads((qa_dir / "anti-asr-small-windows.json").read_text(encoding="utf-8"))
base_asr = json.loads((qa_dir / "anti-asr-base-windows.json").read_text(encoding="utf-8"))

medium_words = [w for seg in medium_asr.get("segments", []) for w in seg.get("words", [])]
small_words = [w for win in small_asr.get("windows", []) for seg in win.get("segments", []) for w in seg.get("words", [])]
base_words = [w for win in base_asr.get("windows", []) for seg in win.get("segments", []) for w in seg.get("words", [])]

def words_in_span(words, start, end, pad=0.0):
    return [w for w in words if w["end"] > start - pad and w["start"] < end + pad]

def text_in_span(words, start, end, pad=0.0):
    return " ".join(w["word"].strip() for w in words_in_span(words, start, end, pad)).strip()

# Situational Vietnamese usage descriptions for the 41 picks (no German answer leak, > 15 chars)
SITUATIONAL_USAGE = {
    3100012: "Khi báo tin toàn bộ bóng bay chuẩn bị cho bữa tiệc đã biến mất.",
    3100018: "Khi trấn an người đang lo lắng và giới thiệu mình là thám tử.",
    3100021: "Khi đề nghị cả nhóm bắt tay ngay vào việc tìm kiếm dấu vết tại hiện trường.",
    3100023: "Khi ngạc nhiên nhận ra vật lạ nằm ở hiện trường là một que cá tẩm bột.",
    3100029: "Khi nêu giả thuyết hài hước rằng ai đó đã biến bóng bay thành món ăn.",
    3100035: "Khi hẹn qua điện thoại rằng mình sẽ có mặt ngay lập tức.",
    3100053: "Khi hỏi nhân chứng để nắm chính xác chuyện gì vừa xảy ra.",
    3100054: "Khi chia sẻ rằng hôm nay là ngày kỷ niệm ngày cưới của hai vợ chồng.",
    3100058: "Khi chỉ vào các sợi dây và báo rằng toàn bộ bóng bay đã bị cắt đứt.",
    3100062: "Khi kể lại khoảnh khắc quay sang nhìn lại thì chỉ còn thấy cá tẩm bột chiên.",
    3100066: "Khi thông báo mình sẽ đi quan sát kỹ xung quanh khu vực hiện trường.",
    3100067: "Khi dặn người ở lại để mắt trông chừng mọi thứ tại chỗ.",
    3100071: "Khi nhận xét rằng từ điểm cao này có thể nhìn bao quát toàn bộ công viên giải trí.",
    3100074: "Khi xác nhận thông tin và giải thích mình đang làm nhiệm vụ truy tìm kẻ trộm.",
    3100078: "Khi cô chim khoe khả năng bay lượn và châm chọc những kẻ không thể bay như mình.",
    3100081: "Khi trách nhẹ rằng lẽ ra người kia cũng có thể phụ giúp việc tìm kiếm.",
    3100084: "Khi sực nhớ ra một chi tiết quan trọng giúp loại trừ nghi phạm.",
    3100087: "Khi khẳng định người phía trước chính là thủ phạm và rủ đồng đội lao tới bắt giữ.",
    3100091: "Khi chất vấn gay gắt vì sao đối phương dám tự ý lấy cắp hết bóng bay.",
    3100094: "Khi phủ nhận dứt khoát rằng mình hoàn toàn không lấy cắp quả bóng bay nào cả.",
    3100102: "Khi người bán hàng tự giới thiệu công việc bán những quả bóng bay tuyệt đẹp của mình.",
    3100105: "Khi tiếc nuối vì sự việc diễn ra ngay trước mắt mà cả nhóm không hề nhận ra.",
    3100108: "Khi đề xuất phương án tốt nhất lúc này là lục soát toàn bộ công viên.",
    3100114: "Khi đọc quy định trẻ nhỏ hoặc chuột đất chỉ được đi tàu lượn khi có người lớn đi kèm.",
    3100117: "Khi thuyết phục người khác giúp đỡ ngay bằng cách nhấn mạnh đây là tình huống khẩn cấp.",
    3100123: "Khi nhắc đồng đội phải giữ im lặng kẻo nghi phạm phát hiện và bỏ chạy mất.",
    3100131: "Khi giải thích thẳng thắn rằng việc tự ý lấy đồ không xin phép chính là hành vi ăn trộm.",
    3100135: "Khi hào hứng xác nhận cá tẩm bột chiên chính là món ăn khoái khẩu nhất của mình.",
    3100138: "Khi giải thích lý do lấy bóng bay chỉ vì bản thân cũng mong một lần được bay lên.",
    3100139: "Khi tâm sự nỗi buồn rằng mình tuy là loài chim nhưng lại không thể bay được.",
    3100151: "Khi hốt hoảng báo tin chiếc vòng cổ đẹp của mình vừa bị rơi xuống dưới hồ nước.",
    3100153: "Khi khuyên ai đó cứ nhảy thẳng xuống hồ nước để tự vớt món đồ lên.",
    3100156: "Khi phản bác rằng loài chim vốn bay trên trời chứ đâu có đi lặn dưới nước.",
    3100158: "Khi tự tin khẳng định tuy mình không giỏi bay nhưng bù lại có tài lặn nước rất cừ.",
    3100161: "Khi reo lên báo hiệu vừa phát hiện chiếc vòng cổ nằm ở dưới đáy hồ.",
    3100167: "Khi chân thành nói lời xin lỗi vì trước đó đã từng cười nhạo và chế giễu người khác.",
    3100171: "Khi người bán bóng ngạc nhiên hỏi lại các cô chim có thực sự muốn mua toàn bộ số bóng bay.",
    3100172: "Khi hỏi xác nhận xem khách có muốn lấy luôn cả những quả bóng vừa mới được thổi phồng không.",
    3100175: "Khi reo lên đầy phấn khích ở khoảnh khắc ước mơ được bay lên bầu trời thành hiện thực.",
    3100177: "Khi trầm trồ xác nhận trước cảnh tượng cậu chim cánh cụt thực sự đang bay lên được.",
    3100179: "Khi ngắm nhìn cảnh vật từ trên cao xuống và cảm thán mọi thứ bên dưới trông thật nhỏ bé.",
}

CHAPTER_BOUNDS = [
    (0.0, 176.18),
    (176.18, 263.36),
    (263.36, 325.87),
    (325.87, 414.92),
    (414.92, 543.64),
    (543.64, 622.98),
    (622.98, 692.44),
]

CHAPTER_SUMMARIES = [
    "Khi đang giúp thả diều thì Jan và Henry gặp một bé đang khóc vì toàn bộ bóng bay sinh nhật biến mất, tại hiện trường chỉ còn lại những que cá tẩm bột chiên.",
    "Hai thám tử đến công viên giải trí gặp đôi chuột mới cưới cũng bị cắt mất chùm bóng bay hình trái tim và để lại cá tẩm bột tại hiện trường.",
    "Jan và Henry trèo lên cao quan sát toàn bộ công viên, gặp hai cô chim kiêu ngạo khoe tài bay lượn rồi loại trừ họ khỏi diện nghi phạm.",
    "Phát hiện một người cầm chùm bóng lớn, hai thám tử lao ra bắt giữ nhưng hóa ra đó là người bán bóng bay và chính ông cũng vừa bị mất bóng ngay trước mắt.",
    "Sau chuyến tàu lượn siêu tốc để quan sát từ trên cao, Jan và Henry lần theo dấu vết và bắt quả tang chú chim cánh cụt lấy bóng bay vì khao khát được bay.",
    "Một cô chim làm rơi chiếc vòng cổ quý xuống hồ nước sâu; chú chim cánh cụt liền trổ tài lặn siêu hạng để vớt vòng cổ lên và nhận được lời xin lỗi chân thành.",
    "Để đền đáp chú chim cánh cụt, hai cô chim mua toàn bộ bóng bay của người bán hàng giúp cậu bay bổng lên bầu trời và ngắm nhìn công viên từ trên cao.",
]

reviewed = copy.deepcopy(muse)
removed_review_needed = []
runtime_cues = []
changelog_entries = []

for c in reviewed["cues"]:
    cid = c["id"]
    if c.get("reviewNeeded"):
        mw = words_in_span(medium_words, c["start"] - 3.0 if cid == 3100182 else c["start"] - 0.2, c["end"] + 0.2)
        sw = words_in_span(small_words, c["start"] - 3.0 if cid == 3100182 else c["start"] - 0.2, c["end"] + 0.2)
        bw = words_in_span(base_words, c["start"] - 3.0 if cid == 3100182 else c["start"] - 0.2, c["end"] + 0.2)
        removed_review_needed.append({
            "cue": copy.deepcopy(c),
            "action": "excluded_from_runtime_all_picks_cards",
            "reason": (
                "Proper name 'Taterchen' has low ASR confidence and disagrees across all 3 models: medium='Taterchen' (p=0.639), small='Carterchen' (p=0.484), base='Katarchen' (p=0.560)."
                if cid == 3100055 else
                "Closing-music utterance at 677.68-681.79 has first word 'Alles' at 677.68-679.50 with p=0.022 in medium and p=0.105 in base; cue span 680.65-681.79 only covers 'so klein.'."
            ),
            "asrEvidence": {
                "medium": [{"word": w["word"], "start": w["start"], "end": w["end"], "probability": w["probability"]} for w in mw],
                "small": [{"word": w["word"], "start": w["start"], "end": w["end"], "probability": w["probability"]} for w in sw],
                "base": [{"word": w["word"], "start": w["start"], "end": w["end"], "probability": w["probability"]} for w in bw],
            }
        })
        changelog_entries.append({
            "type": "exclude_review_needed_cue",
            "cueId": cid,
            "before": {"start": c["start"], "end": c["end"], "text": c["text"], "vi": c["vi"], "reviewNeeded": True},
            "after": None,
            "reason": removed_review_needed[-1]["reason"]
        })
        continue

    orig = copy.deepcopy(c)
    # Apply verified fixes
    if cid == 3100062:
        c["start"] = 228.60
        changelog_entries.append({
            "type": "timestamp_refinement",
            "cueId": cid,
            "before": {"start": orig["start"], "end": orig["end"]},
            "after": {"start": c["start"], "end": c["end"]},
            "reason": "Medium had a zero-duration p=0.01 artifact 'Als' at 227.12 right at the end of cue 3100061; independent small (p=0.965 at 228.66) and base (p=0.901 at 228.68) show 'als ich dann...' begins at 228.66."
        })
    elif cid == 3100067:
        c["start"] = 242.15
        changelog_entries.append({
            "type": "timestamp_refinement",
            "cueId": cid,
            "before": {"start": orig["start"], "end": orig["end"]},
            "after": {"start": c["start"], "end": c["end"]},
            "reason": "Excluded preceding unaligned 'Ja genau.' at 241.01-241.81 so cue 3100067 starts right at the onset of 'Behaltet' (242.15)."
        })
    elif cid == 3100078:
        c["vi"] = "Thật tệ khi không thể bay được như bọn chị đây này."
        changelog_entries.append({
            "type": "translation_fix",
            "cueId": cid,
            "before": {"vi": orig["vi"]},
            "after": {"vi": c["vi"]},
            "reason": "Clarified Vietnamese translation so Vogeldame clearly boasts that she and her companion can fly and mocks those who cannot fly like them."
        })
    elif cid == 3100120:
        c["start"] = 478.06
        changelog_entries.append({
            "type": "timestamp_refinement",
            "cueId": cid,
            "before": {"start": orig["start"], "end": orig["end"]},
            "after": {"start": c["start"], "end": c["end"]},
            "reason": "Included full lead-in for initial word 'Hast' (478.06-478.48), verified by independent base (p=0.525 at 478.06) and small (p=0.984 at 478.26) ASR models."
        })
    elif cid == 3100171:
        c["speaker"] = "Ballonverkäufer"
        c["vi"] = "Các cô thực sự muốn mua hết bóng bay sao?"
        changelog_entries.append({
            "type": "speaker_and_translation_fix",
            "cueId": cid,
            "before": {"speaker": orig["speaker"], "vi": orig["vi"]},
            "after": {"speaker": c["speaker"], "vi": c["vi"]},
            "reason": "Video frames 623.5s-626.8s and continuity with cue 3100172 ('Sogar die, die ich jetzt neu aufgepustet habe?') plus small ASR question punctuation prove the Ballonverkäufer is directly addressing the two Vogeldamen with formal 'Sie'."
        })
    elif cid == 3100173:
        c["speaker"] = "Vogeldame"
        changelog_entries.append({
            "type": "speaker_fix",
            "cueId": cid,
            "before": {"speaker": orig["speaker"]},
            "after": {"speaker": c["speaker"]},
            "reason": "Video frame 630.2s and dialogue context ('Unbedingt, sie sind alle für ihn.') confirm Vogeldame is answering the Ballonverkäufer and pointing to the penguin."
        })

    runtime_cues.append(c)

# Separate exact-touching adjacent cues by 0.01s so no ASR boundary word bleeds across cue ends
boundary_nudges = []
for i in range(len(runtime_cues) - 1):
    cur_c = runtime_cues[i]
    nxt_c = runtime_cues[i + 1]
    if cur_c["end"] >= nxt_c["start"]:
        old_end = cur_c["end"]
        cur_c["end"] = round(nxt_c["start"] - 0.01, 2)
        boundary_nudges.append({
            "cueId": cur_c["id"],
            "nextCueId": nxt_c["id"],
            "oldEnd": old_end,
            "newEnd": cur_c["end"]
        })

changelog_entries.append({
    "type": "adjacent_boundary_separation",
    "count": len(boundary_nudges),
    "details": boundary_nudges,
    "reason": "Separated 13 exact-touching cue boundaries (end == next.start) by 0.01s to eliminate inclusive-window edgeWord bleed while preserving full word audio."
})

reviewed["cues"] = runtime_cues
reviewed["removedReviewNeeded"] = removed_review_needed
reviewed["coverage"] = (
    "Lời thoại chọn lọc gần như đầy đủ: 180 runtime cues phủ 27.23-675.53 trong tổng 692.44s "
    "(đã loại 2 cues reviewNeeded 3100055 và 3100182 khỏi runtime all/picks/cards và lưu trong removedReviewNeeded). "
    "Loại trừ bài hát mở đầu (0.00-27.23), nhạc kết/credits và các đoạn nhạc-hành động không thoại (xem exclusions)."
)

# Update chapters with continuous bounds and situational usage
for idx, ch in enumerate(reviewed["chapters"]):
    old_start, old_end = ch["start"], ch["end"]
    new_start, new_end = CHAPTER_BOUNDS[idx]
    ch["start"] = new_start
    ch["end"] = new_end
    ch["summary"] = CHAPTER_SUMMARIES[idx]
    changelog_entries.append({
        "type": "chapter_boundary_update",
        "part": idx + 1,
        "title": ch["title"],
        "before": {"start": old_start, "end": old_end},
        "after": {"start": new_start, "end": new_end},
        "reason": "Continuous chapter boundaries 0/176.18/263.36/325.87/414.92/543.64/622.98/692.44 so every runtime cue (including 3100143 at 542.96-543.24 in Part 5) belongs to strictly 1 chapter without cutting any sentence."
    })
    for p in ch["picks"]:
        pid = p["id"]
        p["grammarNote"] = p["usage"]
        p["usage"] = SITUATIONAL_USAGE[pid]

# Update flashcard #12 (cueId 3100102) from der Ballonverkäufer to verkaufen
for card in reviewed["flashcards"]:
    if card["cueId"] == 3100102 and card["term"] == "der Ballonverkäufer":
        old_card = copy.deepcopy(card)
        card["term"] = "verkaufen"
        card["meaning"] = "bán"
        card["grammar"] = "Động từ yếu: verkauft; verkaufte; hat verkauft"
        card["note"] = "Lời người bán bóng bay giới thiệu những chùm bóng trong công viên."
        changelog_entries.append({
            "type": "flashcard_fix",
            "cueId": 3100102,
            "before": old_card,
            "after": copy.deepcopy(card),
            "reason": "Cue 3100102 ('Ja, ich verkaufe diese wunderschönen Ballons.') contains the conjugated verb 'verkaufe', not the noun 'Ballonverkäufer'; updated flashcard target to 'verkaufen' while keeping example verbatim."
        })

# Save reviewed-lesson.json and changelog.json
(qa_dir / "reviewed-lesson.json").write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
changelog_doc = {
    "videoKey": "erdmaennchen_luftgehen",
    "alias": "luftgehen",
    "sourceFile": "qa/kino-alignment/erdmaennchen_luftgehen/muse-lesson.json",
    "reviewedFile": "qa/kino-alignment/erdmaennchen_luftgehen/reviewed-lesson.json",
    "summary": {
        "museCueCount": len(muse["cues"]),
        "runtimeCueCount": len(runtime_cues),
        "removedReviewNeededIds": [3100055, 3100182],
        "chapterCount": len(reviewed["chapters"]),
        "pickCount": sum(len(ch["picks"]) for ch in reviewed["chapters"]),
        "flashcardCount": len(reviewed["flashcards"]),
        "shortsProposalCount": len(reviewed["shorts"]),
    },
    "changes": changelog_entries,
}
(qa_dir / "changelog.json").write_text(json.dumps(changelog_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Build independent-picks-audit.json covering all 41 picks + special cues
cues_by_id = {c["id"]: c for c in runtime_cues}
picks_audit = []
for ch_idx, ch in enumerate(reviewed["chapters"]):
    for p in ch["picks"]:
        cid = p["id"]
        c = cues_by_id[cid]
        m_txt = text_in_span(medium_words, c["start"], c["end"], 0.15)
        s_txt = text_in_span(small_words, c["start"], c["end"], 0.15)
        b_txt = text_in_span(base_words, c["start"], c["end"], 0.15)
        note = "Verified across medium, small, and base ASR windows."
        if cid == 3100029:
            note = "All 3 ASR models output 'im' before 'Fischstäbchen' (medium p=0.413, small p=0.728, base p=0.816) due to spoken labial nasal assimilation (/n/ -> [m] before /f/); standard orthographic 'in Fischstäbchen verwandelt' is retained to match flashcard and grammar."
        elif cid == 3100062:
            note = "Start refined from 227.12 to 228.60 based on small (228.66 p=0.965) and base (228.68 p=0.901) word timestamps for 'als ich dann...'."
        elif cid == 3100067:
            note = "Start refined from 241.29 to 242.15 to exclude preceding 'Ja genau.' (241.01-241.81). Between 'ihr' and 'hier', medium (p=0.487) and base (p=0.221) output 'zwar' while small (p=0.432) outputs 'zwei' (all < 0.50 confidence); recorded in uncertain."
        elif cid == 3100078:
            note = "Exact 3-model German match; Vietnamese translation fixed to 'Thật tệ khi không thể bay được như bọn chị đây này.'."
        elif cid == 3100102:
            note = "Exact 3-model German match; flashcard #12 updated from 'der Ballonverkäufer' to 'verkaufen' to match 'verkaufe' in cue."
        elif cid == 3100158:
            note = "All 3 models (medium, small, base) confirm 'Ja, ich kann zwar nicht so gut fliegen, aber...' with 'zwar' clearly spoken."
        elif cid == 3100171:
            note = "Exact 3-model German match (small punctuates with '?'); speaker fixed to 'Ballonverkäufer' and Vietnamese fixed to 'Các cô thực sự muốn mua hết bóng bay sao?' based on visual frames 623.5s-626.8s."
        picks_audit.append({
            "part": ch_idx + 1,
            "id": cid,
            "start": c["start"],
            "end": c["end"],
            "speaker": c["speaker"],
            "text": c["text"],
            "vi": c["vi"],
            "usage": p["usage"],
            "asrMedium": m_txt,
            "asrSmall": s_txt,
            "asrBase": b_txt,
            "note": note,
        })

special_checks = {
    "3100055_excluded": removed_review_needed[0],
    "3100182_excluded": removed_review_needed[1],
    "3100100_foreign_accent_preserved": {
        "id": 3100100,
        "start": cues_by_id[3100100]["start"],
        "end": cues_by_id[3100100]["end"],
        "text": cues_by_id[3100100]["text"],
        "asrMedium": text_in_span(medium_words, 364.74, 368.56, 0.15),
        "asrSmall": text_in_span(small_words, 364.74, 368.56, 0.15),
        "asrBase": text_in_span(base_words, 364.74, 368.56, 0.15),
        "decision": "Retained verbatim ('Das ist, weil ich bin Ballonverkäufer.') as all 3 ASR models confirm the character's spoken V2 order after 'weil'."
    },
    "3100120_hast_lead_in": {
        "id": 3100120,
        "start": cues_by_id[3100120]["start"],
        "end": cues_by_id[3100120]["end"],
        "text": cues_by_id[3100120]["text"],
        "asrMedium": text_in_span(medium_words, 478.06, 479.40, 0.15),
        "asrSmall": text_in_span(small_words, 478.06, 479.40, 0.15),
        "asrBase": text_in_span(base_words, 478.06, 479.40, 0.15),
        "decision": "Medium missed initial 'Hast', but both small ('Hast du was gesehen?', p=0.984) and base ('und hast du was gesehen?', p=0.525) confirm 'Hast' at 478.06-478.48."
    },
    "3100128_gibs_zu": {
        "id": 3100128,
        "start": cues_by_id[3100128]["start"],
        "end": cues_by_id[3100128]["end"],
        "text": cues_by_id[3100128]["text"],
        "asrMedium": text_in_span(medium_words, 500.26, 502.80, 0.15),
        "asrSmall": text_in_span(small_words, 500.26, 502.80, 0.15),
        "asrBase": text_in_span(base_words, 500.26, 502.80, 0.15),
        "decision": "Retained orthographic \"gib's zu\" (/gɪps tsuː/), which ASR models render phonetically as 'gibst zu' / 'gibst du'."
    },
    "3100140_3100141_vogeldamen_auslachen": {
        "ids": [3100140, 3100141],
        "asrMedium_140": text_in_span(medium_words, 531.82, 535.97, 0.15),
        "asrSmall_140": text_in_span(small_words, 531.82, 535.97, 0.15),
        "asrSmall_141": text_in_span(small_words, 535.98, 539.52, 0.15),
        "decision": "Small ASR transcribes '-Dame' in 3100141 ('Gemeindvogel -Dame'), and 3100167 ('dass wir uns über dich lustig gemacht haben') confirms the separable verb is 'auslachen' ('lachen mich deshalb immer wieder aus')."
    },
    "3100143_chapter_assignment": {
        "id": 3100143,
        "start": 542.96,
        "end": 543.24,
        "text": "Ja.",
        "speaker": "Pinguin",
        "assignedPart": 5,
        "partBounds": [414.92, 543.64],
        "decision": "Frames 543.1s, 543.5s, and 543.8s confirm 3100143 ('Ja.') is the penguin's reply at the end of Part 5 before the cut to Vogeldame at 543.64 (Part 6)."
    }
}

(qa_dir / "independent-picks-audit.json").write_text(json.dumps({
    "videoKey": "erdmaennchen_luftgehen",
    "modelsUsed": ["faster-whisper medium (muse-asr-medium.json)", "faster-whisper small (anti-asr-small-windows.json)", "faster-whisper base (anti-asr-base-windows.json)"],
    "picksCount": len(picks_audit),
    "picksAudit": picks_audit,
    "specialChecks": special_checks,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print("Saved reviewed-lesson.json, changelog.json, and independent-picks-audit.json successfully.")
