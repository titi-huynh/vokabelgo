import copy
import json
from pathlib import Path

root = Path(".")
qa_dir = root / "qa" / "kino-alignment" / "erdmaennchen_platte_reifen"

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


# Excluded cues: 5 reviewNeeded + 6th uncertain (3200228) + 12 unverified/disagreed ASR cues = 18 excluded -> 223 runtime cues
EXCLUDED_REASONS = {
    3200030: (
        "reviewNeeded cue #1: Verb 'krieg' has low confidence across models (medium p=0.815, small p=0.512, base p=0.466; base drops 'schon') "
        "and is likely a misrecognition of 'tret(e)' ('in die Pedale treten'). Excluded from runtime without grammatical guessing."
    ),
    3200033: (
        "Unverified ASR word: 'wollen' has p=0.008 in medium and p=0.016 in small while base transcribes 'Wir haben da alle!' "
        "over overlapping hamster voices rushing past in frame cue_3200033_124_0.jpg. Excluded from runtime."
    ),
    3200039: (
        "reviewNeeded cue #2: Initial word 'Weil' has p=0.126 in medium and p=0.264 in small, while base outputs 'Weil kannst du dich sein!'. "
        "Excluded from runtime without guessing 'Weit'."
    ),
    3200091: (
        "reviewNeeded cue #3: Final noun is truncated/disagreed across all 3 models (medium: 'Straf.' p=0.847, small: 'Straftat.' p=0.830, base: 'Strafzett!' p=0.679). "
        "Excluded from runtime."
    ),
    3200116: (
        "Flagged pick in Part 3 ('Die Reifen in Ihrem Auto sind auch platt.'): Initial 'Die' has p=0.248 in medium while small (p=0.122) and base (p=0.153) "
        "prefix 'Na, die', and all 3 models transcribe 'in Ihrem Auto' instead of standard 'an Ihrem Auto'. Excluded from runtime and Part 3 picks rather than grammatically rewriting."
    ),
    3200124: (
        "Flagged cue ('Für jeden Plattenreifen ein.'): Colloquial reduction of 'Für jeden platten Reifen einen' with 'ein' at p=0.676 (medium), "
        "p=0.699 (small), p=0.540 (base). Excluded from runtime rather than grammatically rewriting."
    ),
    3200134: (
        "Flagged pick in Part 4 ('Der Igel hat so scharfe und spitze Stachel.'): Medium omits 'doch' ('so' p=0.218) whereas both small (p=0.966) and base (p=0.922) "
        "transcribe 'hat doch so', and the plural noun is transcribed as singular 'Stachel.' (medium/small) or 'Stache.' (base) instead of 'Stacheln'. "
        "Excluded from runtime and Part 4 picks."
    ),
    3200161: (
        "Flagged cue ('Jetzt kann ich niemanden mehr piekeln.'): ASR models disagree between 'piekeln' (medium p=0.781, small p=0.599 with 'Jetzt' p=0.412) "
        "and 'pieken' (base p=0.663). Excluded from runtime."
    ),
    3200186: (
        "Flagged pick in Part 5 ('Ich zeig\\'s Ihnen.'): Video frame cue_3200186_570_2.jpg shows the two hamsters turning to each other (not addressing Jan & Henry with formal Sie, "
        "as they use 'ihr' in 3200175 and 3200187), and all 3 ASR models disagree with low probability (medium: 'Ich zeig\\'s Ihnen.' with 'Ich' p=0.237; "
        "small: 'Zeig sie den.' with 'den.' p=0.237; base: 'Zeig sie dir!' with 'dir!' p=0.226). Excluded from runtime and Part 5 picks."
    ),
    3200212: (
        "Flagged pick in Part 6 ('Damit geht ihr gleich baden.'): Video frame cue_3200212_655_8.jpg shows the Hamster speaking (about literally going bathing in the lake right away), "
        "not Jan & Henry, and all 3 ASR models disagree with very low probability (medium: 'geht' p=0.080; small: 'Damit ihr gleich badet!' with 'Damit' p=0.141; "
        "base: 'Da bin ich nicht gleich paddend!' with 'bin' p=0.159). Excluded from runtime and Part 6 picks."
    ),
    3200214: (
        "reviewNeeded cue #4: Missing subject in medium ('Kann' p=0.602) while small transcribes 'ich kann' and base transcribes 'Ich kann mit der Luft voll lustigen Blasen machen!'. "
        "Excluded from runtime."
    ),
    3200220: (
        "Unverified dative plural inflection ('Wir waren mit dem Igel und den Hamster am See.'): 'Hamster' has p=0.491 in medium and lacks the required dative plural '-n' ('den Hamstern'). "
        "Excluded from runtime rather than grammatically rewriting."
    ),
    3200227: (
        "Low-confidence utterance ('Nein.' at 708.82-709.30): 'Nein.' has p=0.219 in medium and p=0.313 in small while base transcribes 'Äh, nein...' across 708.00-709.76. "
        "Excluded from runtime."
    ),
    3200228: (
        "6th uncertain item ('Dann war es ihr.' at 709.82-710.54): All 3 ASR models disagree with low confidence (medium: 'Dann war es ihr.' p=0.557; "
        "small: 'Dann wart ihr\\'s!' p=0.531/0.475; base: 'Dann war dir\\'s?' p=0.645/0.448). Frame cue_3200228_710_1.jpg shows the Kommissar pointing at Jan & Henry ('ihr' = các cậu), "
        "not 'bọn họ'. Excluded from runtime without guessing the German verb/pronoun."
    ),
    3200237: (
        "reviewNeeded cue #5: Models disagree on 'mit den platten Reifen' (medium p=0.577) vs 'mit dem Plattenreifen' (small p=0.509) vs 'mit dem Platten reifen' (base), "
        "with 'ist' at p=0.392 in medium and 'Das' at p=0.143 in base. Excluded from runtime."
    ),
    3200239: (
        "Closing-credits utterance over music (738.82-740.10): 'Ja,' has p=0.247 in medium while small and base reverse the word order ('lustig. Ja!'). Excluded from runtime."
    ),
    3200240: (
        "Closing-credits utterance over music (740.84-743.38): 'ja,' has p=0.029 in small and 'schneller' has p=0.393 in medium / p=0.145 in base. Excluded from runtime."
    ),
    3200241: (
        "Closing-credits utterance over music (746.38-749.02): 'Herr' has p=0.053 and 'andere' has p=0.431 in medium, completely missed by small and garbled as "
        "'Verkommelt\\'s ab, wir haben jetzt unsere Mehrheit vergesst!' by base. Excluded from runtime."
    ),
}

# Situational Vietnamese usage descriptions (> 15 chars, no German leak) for all 36 verified picks
SITUATIONAL_USAGE = {
    3200004: "Khi liệt kê toàn bộ những thứ đã ghi ra danh sách cho chuyến đi chơi ra hồ tắm.",
    3200013: "Khi kiểm tra xong xuôi mọi thứ và hào hứng tuyên bố đã sẵn sàng lên đường.",
    3200019: "Khi đồng tình rằng trời rất đẹp và nhắc bạn chỉ còn thiếu đúng một mục duy nhất.",
    3200021: "Khi nêu tên mục còn thiếu trong danh sách một cách hài hước là khởi hành ngay.",
    3200024: "Khi phát thanh viên thông báo thời tiết ngày hè tuyệt đẹp với nhiệt độ cao.",
    3200026: "Khi phát thanh viên dùng ngôi xưng lịch sự khuyên người nghe nên mang theo ô.",
    3200044: "Khi chỉ về phía mái hiên đằng xa và rủ bạn vào đó để trú cơn mưa bất chợt.",
    3200046: "Khi tiếc nuối than thở rằng cả hai vốn định đạp xe ra hồ để bơi lội.",
    3200052: "Khi gợi ý đùa rằng hãy trồng chuối để bụng không bị ướt lúc trời đang mưa.",
    3200061: "Khi trấn an người đối diện sau va chạm nhẹ rằng mình chỉ bị chích hơi nhói chút thôi.",
    3200067: "Khi vui mừng gọi bạn nhìn ra ngoài và báo tin cơn mưa rào đã tạnh hẳn.",
    3200076: "Khi thốt lên đầy kinh ngạc vì phát hiện toàn bộ lốp xe đạp đều đã xẹp lép.",
    3200078: "Khi nhận định sự cố bí ẩn này chính là một vụ án mới dành cho hai thám tử.",
    3200093: "Khi ngài ủy viên nghiêm túc giải thích quy định cấm dừng xe ở khu vực có biển cấm.",
    3200096: "Khi tự hào khẳng định bản thân lúc nào cũng quan sát và để mắt tới mọi thứ.",
    3200105: "Khi trả lời dứt khoát rằng mọi quy định đều phải được tuân thủ nghiêm ngặt.",
    3200126: "Khi xâu chuỗi manh mối và nhận ra quy luật cứ sau mỗi cơn mưa lại có lốp xe bị xẹp.",
    3200141: "Khi quyết định hành động ngay và rủ đồng đội đi tóm gọn nghi phạm.",
    3200147: "Khi đặt câu hỏi chất vấn trực tiếp xem đối phương có phải là người làm xẹp lốp xe không.",
    3200155: "Khi đưa ra bằng chứng ngoại phạm rằng những chiếc gai của mình giờ không còn nhọn nữa.",
    3200157: "Khi giải thích cách khắc phục đơn giản là gắn những chiếc nút bần lên đầu gai nhọn.",
    3200165: "Khi khoe rằng nhờ gắn nút bần nên giờ có thể chèo thuyền hơi mà không sợ thuyền thủng.",
    3200177: "Khi bác bỏ suy đoán của người khác và khẳng định vật đó là máy sấy của nhóm mình.",
    3200180: "Khi than phiền rằng trên đời không có cảm giác nào khó chịu hơn một bộ lông bị ướt.",
    3200192: "Khi vỡ lẽ và nhận ra chính những người trước mặt là thủ phạm suốt thời gian qua.",
    3200193: "Khi thuật lại toàn bộ quá trình các chú chuột dùng hơi từ lốp xe để sấy khô bộ lông.",
    3200198: "Khi nói lời xin lỗi ngắn gọn và chân thành sau khi biết mình đã lấy nhầm đồ của người khác.",
    3200200: "Khi chú chuột hamster lịch sự hứa trả lại ngay chiếc thuyền hơi cho chủ nhân là anh nhím.",
    3200204: "Khi ngỏ ý tặng một món đồ hữu ích giúp giải quyết nỗi lo bị ướt lông mỗi lúc trời mưa.",
    3200207: "Khi giới thiệu ngắn gọn món đồ giải cứu cho cả nhóm chính là một chiếc bơm hơi.",
    3200210: "Khi giải thích rằng chiếc bơm còn lại sẽ được dùng để bơm căng lại các lốp xe bị xẹp.",
    3200215: "Khi chú chuột hamster tự tin khoe tài tạo bong bóng dưới nước mà không cần dùng tới bơm.",
    3200216: "Khi tổng kết một ngày đi chơi tuyệt vời bên hồ dù kế hoạch ban đầu suýt nữa bị đổ bể.",
    3200223: "Khi lễ phép báo tin cho ngài ủy viên yên tâm rằng vụ án xẹp lốp xe đã được phá xong.",
    3200233: "Khi ngài ủy viên lập tức tự nhận rằng mình đã biết rõ kết quả đó ngay từ đầu.",
    3200238: "Khi lễ phép ngỏ ý cho ngài ủy viên đi nhờ một đoạn vì xe của ngài đang bị xẹp lốp.",
}

CHAPTER_BOUNDS = [
    (0.0, 105.0),
    (105.0, 262.0),
    (262.0, 426.5),
    (426.5, 537.0),
    (537.0, 622.9),
    (622.9, 662.0),
    (662.0, 750.0),
]

CHAPTER_SUMMARIES = [
    "Jan sốt ruột muốn ra hồ tắm trong khi Henry cẩn thận kiểm tra từng mục trong danh sách và bật nghe dự báo thời tiết trước khi khởi hành.",
    "Hai anh em đạp xe chậm rãi ra hồ, phải dừng lại trú cơn mưa rào bất chợt, gặp chú nhím cuộn tròn và phát hiện lốp xe đạp đều xẹp lép.",
    "Jan và Henry mở vụ án mới, gặp ngài ủy viên đang tự viết phiếu phạt cho chính xe của mình ở khu vực cấm dừng xe và phát hiện lốp ô tô của ngài cũng bị xẹp.",
    "Hai thám tử nghi ngờ chú nhím gai làm thủng lốp xe khi lăn trong mưa, nhưng chú nhím đưa ra bằng chứng ngoại phạm là những chiếc nút bần gắn trên đầu gai.",
    "Đuổi theo chiếc thuyền hơi biết đi của anh nhím, cả nhóm phát hiện các chú chuột hamster đã lấy hơi từ lốp xe và thuyền phao làm máy sấy khô bộ lông ướt.",
    "Các chú chuột hamster xin lỗi và trả lại thuyền hơi cho anh nhím; Jan và Henry tặng chuột hamster một chiếc bơm hơi để sấy lông và dùng chiếc còn lại bơm lốp xe.",
    "Sau buổi chiều vui chơi bên hồ, Jan và Henry báo tin đã phá xong vụ án cho ngài ủy viên và dùng xe đạp kéo chiếc ô tô xẹp lốp của ngài về nhà.",
]

reviewed = copy.deepcopy(muse)
removed_review_needed = []
runtime_cues = []
changelog_entries = []

for c in reviewed["cues"]:
    cid = c["id"]
    if cid in EXCLUDED_REASONS:
        mw = words_in_span(medium_words, c["start"] - 0.3, c["end"] + 0.3)
        sw = words_in_span(small_words, c["start"] - 0.3, c["end"] + 0.3)
        bw = words_in_span(base_words, c["start"] - 0.3, c["end"] + 0.3)
        reason = EXCLUDED_REASONS[cid]
        removed_review_needed.append({
            "cue": copy.deepcopy(c),
            "action": "excluded_from_runtime_all_picks_cards",
            "reason": reason,
            "asrEvidence": {
                "medium": [{"word": w["word"], "start": w["start"], "end": w["end"], "probability": w["probability"]} for w in mw],
                "small": [{"word": w["word"], "start": w["start"], "end": w["end"], "probability": w["probability"]} for w in sw],
                "base": [{"word": w["word"], "start": w["start"], "end": w["end"], "probability": w["probability"]} for w in bw],
            }
        })
        changelog_entries.append({
            "type": "exclude_unverified_cue",
            "cueId": cid,
            "before": {"start": c["start"], "end": c["end"], "text": c["text"], "vi": c["vi"], "speaker": c["speaker"], "reviewNeeded": c.get("reviewNeeded", False)},
            "after": None,
            "reason": reason,
        })
        continue

    orig = copy.deepcopy(c)
    if cid == 3200032:
        c["speaker"] = "Hamster"
        changelog_entries.append({
            "type": "speaker_fix",
            "cueId": cid,
            "before": {"speaker": orig["speaker"]},
            "after": {"speaker": c["speaker"]},
            "reason": "Video frame cue_3200032_122_5.jpg shows the hamsters rushing past Jan & Henry's bicycle shouting 'Platz da!'."
        })
    elif cid == 3200037:
        c["speaker"] = "Schnecke"
        changelog_entries.append({
            "type": "speaker_fix",
            "cueId": cid,
            "before": {"speaker": orig["speaker"]},
            "after": {"speaker": c["speaker"]},
            "reason": "Video frame cue_3200037_135_0.jpg and dialogue continuity after 3200036 ('So lange uns keine Schnecke überholt.') confirm the speaker overtaking Jan & Henry is a snail ('Schnecke')."
        })
    elif cid == 3200092:
        c["vi"] = "Chiếc xe này đang dừng ở khu vực cấm dừng xe."
        changelog_entries.append({
            "type": "translation_fix",
            "cueId": cid,
            "before": {"vi": orig["vi"]},
            "after": {"vi": c["vi"]},
            "reason": "Clarified 'Halteverbot' / 'hält im Halteverbot' as 'dừng ở khu vực cấm dừng xe' (not merely 'cấm đỗ'), matching the Absolutes Halteverbot sign in frame part3_halteverbot_309_0.jpg."
        })
    elif cid == 3200093:
        c["vi"] = "Mà dừng xe ở khu vực cấm dừng xe là bị cấm."
        changelog_entries.append({
            "type": "translation_fix",
            "cueId": cid,
            "before": {"vi": orig["vi"]},
            "after": {"vi": c["vi"]},
            "reason": "Clarified 'im Halteverbot halten' as 'dừng xe ở khu vực cấm dừng xe'."
        })
    elif cid == 3200106:
        c["vi"] = "Sao ngài không lái xe ra khỏi khu vực cấm dừng xe ạ?"
        changelog_entries.append({
            "type": "translation_fix",
            "cueId": cid,
            "before": {"vi": orig["vi"]},
            "after": {"vi": c["vi"]},
            "reason": "Clarified 'aus dem Halteverbot' as 'khỏi khu vực cấm dừng xe'."
        })
    elif cid == 3200107:
        c["vi"] = "Vì tôi đã dừng xe ở khu vực cấm dừng xe rồi. Chỉ sau khi phiếu phạt được gửi đi đúng quy cách, chiếc xe cơ giới mới được đỗ sang chỗ khác."
        changelog_entries.append({
            "type": "translation_fix",
            "cueId": cid,
            "before": {"vi": orig["vi"]},
            "after": {"vi": c["vi"]},
            "reason": "Clarified 'im Halteverbot gehalten habe' as 'đã dừng xe ở khu vực cấm dừng xe rồi'."
        })
    elif cid == 3200200:
        c["speaker"] = "Hamster"
        c["vi"] = "Dĩ nhiên anh có thể nhận lại nó ngay."
        changelog_entries.append({
            "type": "speaker_and_translation_fix",
            "cueId": cid,
            "before": {"speaker": orig["speaker"], "vi": orig["vi"]},
            "after": {"speaker": c["speaker"], "vi": c["vi"]},
            "reason": "Video frame cue_3200200_624_2.jpg and dialogue continuity (3200196-3200201) prove the Hamster is returning the inflatable boat ('Föhn'/'Schlauchboot') to the Igel ('Du kannst es natürlich sofort wiederhaben.'), not Jan & Henry."
        })
    elif cid == 3200215:
        c["speaker"] = "Hamster"
        changelog_entries.append({
            "type": "speaker_fix",
            "cueId": cid,
            "before": {"speaker": orig["speaker"]},
            "after": {"speaker": c["speaker"]},
            "reason": "Video frames cue_3200215_671_5.jpg through cue_3200215_673_4.jpg show the two hamsters in the lake making water bubbles without the air pump ('Das kann ich auch ohne.'), not Jan & Henry."
        })
    elif cid == 3200216:
        c["vi"] = "Ôi, hôm nay thật là một ngày tuyệt vời bên hồ. Đúng vậy, mặc dù suýt nữa là cả ngày đã bị đổ bể rồi."
        changelog_entries.append({
            "type": "translation_fix",
            "cueId": cid,
            "before": {"vi": orig["vi"]},
            "after": {"vi": c["vi"]},
            "reason": "Clarified the German idiom 'ins Wasser fallen' (kế hoạch/buổi đi chơi bị đổ bể, hỏng bét, đồng thời chơi chữ với cơn mưa và hồ tắm)."
        })
    elif cid == 3200226:
        c["speaker"] = "Kommissar"
        c["vi"] = "Tất nhiên rồi, là con nhím."
        changelog_entries.append({
            "type": "speaker_and_translation_fix",
            "cueId": cid,
            "before": {"speaker": orig["speaker"], "vi": orig["vi"]},
            "after": {"speaker": c["speaker"], "vi": c["vi"]},
            "reason": "Video frames c226_706_3.jpg and c226_707_5.jpg prove the Kommissar himself guesses 'Natürlich, der Igel.' right after asking 'Wissen Sie, wer es war?'."
        })
    elif cid == 3200232:
        c["speaker"] = "Jan & Henry"
        changelog_entries.append({
            "type": "speaker_fix",
            "cueId": cid,
            "before": {"speaker": orig["speaker"]},
            "after": {"speaker": c["speaker"]},
            "reason": "Video frame c232_713_4.jpg proves Jan & Henry finish their answer 'Nein, die Hamster.' (3200231-3200232) while the Kommissar's mouth is closed."
        })

    runtime_cues.append(c)

# Separate exact-touching adjacent cues by 0.01s so no edge word bleeds across cue ends
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
    "reason": "Separated exact-touching cue boundaries (end == next.start) by 0.01s so no ASR boundary word bleeds across adjacent cues."
})

reviewed["cues"] = runtime_cues
reviewed["removedReviewNeeded"] = removed_review_needed
reviewed["coverage"] = (
    f"{len(runtime_cues)} câu thoại chọn lọc (26.89–732.68s trên tổng 750.00s); đã loại 5 câu reviewNeeded "
    "(3200030, 3200039, 3200091, 3200214, 3200237), mục uncertain thứ 6 (3200228) và 12 câu có từ ASR bất thường/độ tin cậy thấp "
    "(3200033, 3200116, 3200124, 3200134, 3200161, 3200186, 3200212, 3200220, 3200227, 3200239, 3200240, 3200241) khỏi mọi bề mặt runtime. "
    "Không phải bản chép đầy đủ từng chữ."
)

# Update exclusions to include closing credits/music (732.68 - 750.0)
reviewed["exclusions"].append({
    "start": 732.68,
    "end": 750.0,
    "reason": "Cảnh kéo xe kết phim và nhạc kết/credits (các câu thoại đè lên nhạc nền có độ tin cậy ASR thấp đã được loại khỏi runtime)."
})

# Record runtime decisions on all uncertain items
for u in reviewed["uncertain"]:
    u["runtimeDecision"] = "Excluded from runtime (caption/all/focus/cards) so no unverified ASR word or pronoun is graded."

reviewed["reviewNotes"].append(
    "Anti/Codex QA: Đối chiếu độc lập 3 model ASR nội bộ (medium, small, base) và khung hình thực từ video gốc. "
    "Loại toàn bộ 5 câu reviewNeeded (3200030, 3200039, 3200091, 3200214, 3200237), câu uncertain 3200228 ('Dann war es ihr.') "
    "và 12 câu/picks có từ chưa chắc chắn (3200033, 3200116 'Die Reifen in Ihrem Auto...', 3200124 'Für jeden Plattenreifen ein.', "
    "3200134 '...spitze Stachel.', 3200161 '...piekeln.', 3200186 'Ich zeig\\'s Ihnen.', 3200212 'Damit geht ihr gleich baden.', "
    "3200220 '...den Hamster...', 3200227, 3200239–3200241). Sửa người nói theo frame hình ảnh ở 3200032 (Hamster), 3200037 (Schnecke), "
    "3200200 (Hamster trả thuyền phao cho Igel), 3200215 (Hamster), 3200226 (Kommissar), 3200232 (Jan & Henry); làm rõ nghĩa Halteverbot "
    "(khu vực cấm dừng xe) và thành ngữ ins Wasser fallen (bị đổ bể)."
)

# Update chapters with continuous bounds, filtered verified picks, and situational usage
runtime_id_set = {c["id"] for c in runtime_cues}
for idx, ch in enumerate(reviewed["chapters"]):
    old_start, old_end = ch["start"], ch["end"]
    new_start, new_end = CHAPTER_BOUNDS[idx]
    ch["start"] = new_start
    ch["end"] = new_end
    ch["summary"] = CHAPTER_SUMMARIES[idx]
    ch["picks"] = [p for p in ch["picks"] if p["id"] in runtime_id_set]
    changelog_entries.append({
        "type": "chapter_boundary_and_picks_update",
        "part": idx + 1,
        "title": ch["title"],
        "before": {"start": old_start, "end": old_end},
        "after": {"start": new_start, "end": new_end, "picks": [p["id"] for p in ch["picks"]]},
        "reason": "Continuous chapter boundaries covering 0.0-750.0 so every runtime cue belongs to strictly 1 chapter, with unverified picks removed."
    })
    for p in ch["picks"]:
        pid = p["id"]
        p["grammarNote"] = p["usage"]
        p["usage"] = SITUATIONAL_USAGE[pid]

# Update flashcard #11 (cueId 3200093, das Halteverbot) to clarify cấm dừng xe
for card in reviewed["flashcards"]:
    if card["cueId"] == 3200093 and card["term"] == "das Halteverbot":
        old_card = copy.deepcopy(card)
        card["meaning"] = "lệnh cấm dừng xe; khu vực cấm dừng xe"
        card["note"] = "Dừng xe ở khu vực cấm dừng xe (Halteverbot) là bị cấm — câu nói nghiêm túc hài hước của ngài ủy viên."
        changelog_entries.append({
            "type": "flashcard_meaning_clarification",
            "cueId": 3200093,
            "before": old_card,
            "after": copy.deepcopy(card),
            "reason": "Clarified 'das Halteverbot' as 'lệnh cấm dừng xe; khu vực cấm dừng xe' rather than only 'cấm đỗ xe'."
        })

# Update short #1 (cueId 3200093, das Halteverbot) in QA proposal
for sh in reviewed["shorts"]:
    if sh["cueId"] == 3200093:
        sh["hook"] = "Ngài ủy viên nghiêm túc viết phiếu phạt cho chiếc xe dừng ở khu vực cấm dừng xe — và đó là xe của chính ngài"
        sh["meaning"] = "khu vực cấm dừng xe"

# Save reviewed-lesson.json and changelog.json
(qa_dir / "reviewed-lesson.json").write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

changelog_doc = {
    "videoKey": "erdmaennchen_platte_reifen",
    "alias": "plattereifen",
    "sourceFile": "qa/kino-alignment/erdmaennchen_platte_reifen/muse-lesson.json",
    "reviewedFile": "qa/kino-alignment/erdmaennchen_platte_reifen/reviewed-lesson.json",
    "summary": {
        "museCueCount": len(muse["cues"]),
        "runtimeCueCount": len(runtime_cues),
        "removedReviewNeededIds": sorted(EXCLUDED_REASONS.keys()),
        "chapterCount": len(reviewed["chapters"]),
        "pickCount": sum(len(ch["picks"]) for ch in reviewed["chapters"]),
        "picksPerChapter": [len(ch["picks"]) for ch in reviewed["chapters"]],
        "flashcardCount": len(reviewed["flashcards"]),
        "shortsProposalCount": len(reviewed["shorts"]),
    },
    "changes": changelog_entries,
}
(qa_dir / "changelog.json").write_text(json.dumps(changelog_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Build independent-picks-audit.json covering all 40 original picks + special checks
muse_cues_by_id = {c["id"]: c for c in muse["cues"]}
runtime_cues_by_id = {c["id"]: c for c in runtime_cues}
picks_audit = []
for ch_idx, ch in enumerate(muse["chapters"]):
    for p in ch["picks"]:
        cid = p["id"]
        mc = muse_cues_by_id[cid]
        rc = runtime_cues_by_id.get(cid)
        m_txt = text_in_span(medium_words, mc["start"], mc["end"], 0.15)
        s_txt = text_in_span(small_words, mc["start"], mc["end"], 0.15)
        b_txt = text_in_span(base_words, mc["start"], mc["end"], 0.15)
        if cid in EXCLUDED_REASONS:
            status = "excluded_from_runtime_and_picks"
            note = EXCLUDED_REASONS[cid]
        else:
            status = "verified_retained"
            note = "Verified across medium, small, and base ASR windows."
            if cid == 3200093:
                note = "Exact German match across medium and small; Vietnamese updated to clarify 'khu vực cấm dừng xe' (Halteverbot)."
            elif cid == 3200200:
                note = "Exact 3-model German match; speaker fixed from 'Jan & Henry' to 'Hamster' (returning the inflatable boat to the Igel) and Vietnamese updated to 'Dĩ nhiên anh có thể nhận lại nó ngay.' based on frame cue_3200200_624_2.jpg."
            elif cid == 3200215:
                note = "Exact 3-model German match; speaker fixed from 'Jan & Henry' to 'Hamster' based on lake frames cue_3200215_671_5.jpg..673_4.jpg."
            elif cid == 3200216:
                note = "Verified across all 3 ASR models; Vietnamese updated to clarify idiom 'ins Wasser fallen' (kế hoạch/ngày đi chơi bị đổ bể)."
        picks_audit.append({
            "part": ch_idx + 1,
            "id": cid,
            "status": status,
            "start": (rc or mc)["start"],
            "end": (rc or mc)["end"],
            "speaker": (rc or mc)["speaker"],
            "text": (rc or mc)["text"],
            "vi": (rc or mc)["vi"],
            "asrMedium": m_txt,
            "asrSmall": s_txt,
            "asrBase": b_txt,
            "note": note,
        })

(qa_dir / "independent-picks-audit.json").write_text(json.dumps({
    "videoKey": "erdmaennchen_platte_reifen",
    "modelsUsed": [
        "faster-whisper medium (muse-asr-medium.json)",
        "faster-whisper small (anti-asr-small-windows.json)",
        "faster-whisper base (anti-asr-base-windows.json)"
    ],
    "originalMusePicksCount": len(picks_audit),
    "retainedRuntimePicksCount": sum(len(ch["picks"]) for ch in reviewed["chapters"]),
    "excludedPickIds": [3200116, 3200134, 3200186, 3200212],
    "picksAudit": picks_audit,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(json.dumps(changelog_doc["summary"], ensure_ascii=False))
