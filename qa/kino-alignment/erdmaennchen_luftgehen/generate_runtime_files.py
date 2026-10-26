import json
from pathlib import Path

root = Path(".")
qa_dir = root / "qa" / "kino-alignment" / "erdmaennchen_luftgehen"
reviewed = json.loads((qa_dir / "reviewed-lesson.json").read_text(encoding="utf-8"))

# 1. Generate erdmaennchen-luftgehen-aligned.js
aligned_items = []
for c in reviewed["cues"]:
    aligned_items.append({
        "id": c["id"],
        "parentId": c["id"],
        "start": c["start"],
        "end": c["end"],
        "speaker": c["speaker"],
        "text": c["text"],
        "vi": c["vi"],
    })

aligned_json = json.dumps(aligned_items, ensure_ascii=False, indent=2)
aligned_js = (
    "// Selected dialogue from the unchanged local NDR/KiKA source; songs and uncertain speech are omitted.\n"
    f"const ERDMAENNCHEN_LUFTGEHEN_CAPTION_CUES = {aligned_json};\n"
    "const ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES = ERDMAENNCHEN_LUFTGEHEN_CAPTION_CUES;\n"
)
(root / "erdmaennchen-luftgehen-aligned.js").write_text(aligned_js, encoding="utf-8")

# 2. Generate erdmaennchen-luftgehen-lesson.js following erdmaennchen-schmucklose-lesson.js pattern
CARD_SPECS = [
    ("luftballon", "der Luftballon", "quả bóng bay", "der Luftballon, die Luftballons (m.).", 3100012, ["bunte Luftballons", "Luftballons aufpusten"], "Đồ vật trung tâm của vụ án trong tập phim."),
    ("verschwunden", "verschwunden", "đã biến mất", "Phân từ II của verschwinden; Perfekt đi với sein: ist verschwunden.", 3100012, ["spurlos verschwunden sein", "Alle Ballons sind verschwunden."], "Dùng để báo tin đồ vật không còn ở chỗ cũ."),
    ("geburtstag", "der Geburtstag", "ngày sinh nhật", "der Geburtstag, die Geburtstage (m.). Cụm cố định: Geburtstag haben.", 3100010, ["heute Geburtstag haben", "zum Geburtstag gratulieren"], "Ich hab heute Geburtstag: Hôm nay là sinh nhật của em."),
    ("spurensuche", "die Spurensuche", "việc tìm dấu vết, manh mối", "die Spurensuche, die Spurensuchen (f.). Đi với anfangen mit + Dativ.", 3100021, ["mit der Spurensuche anfangen", "auf Spurensuche gehen"], "Bước đầu tiên trong mọi vụ án của hai thám tử Jan & Henry."),
    ("fischstaebchen", "das Fischstäbchen", "que cá tẩm bột chiên", "das Fischstäbchen, die Fischstäbchen (n.). Danh từ ghép: Fisch + Stäbchen.", 3100023, ["knusprige Fischstäbchen", "ein Fischstäbchen finden"], "Trong tập này còn là món ăn khoái khẩu mà chú chim cánh cụt để lại."),
    ("dieb", "der Dieb", "kẻ trộm", "der Dieb, die Diebe (m.); nữ: die Diebin.", 3100074, ["einen Dieb suchen", "den Dieb fangen"], "Jan và Henry giải thích với hai cô chim rằng mình đang tìm kẻ trộm."),
    ("im-auge-behalten", "im Auge behalten", "để mắt tới, trông chừng", "Thành ngữ: etwas/jemanden im Auge behalten; behält; behielt; hat behalten.", 3100067, ["alles im Auge behalten", "den Ausgang im Auge behalten"], "Jan & Henry dặn đôi chuột mới cưới trông chừng hiện trường."),
    ("ueberblicken", "überblicken", "nhìn bao quát, quan sát toàn cảnh", "Động từ tiền tố über- không tách: überblickt; überblickte; hat überblickt.", 3100071, ["den ganzen Freizeitpark überblicken", "die Lage überblicken"], "Từ điểm cao có thể quan sát toàn bộ công viên giải trí."),
    ("fliegen-koennen", "fliegen können", "biết bay; có thể bay", "Động từ khuyết thiếu können + động từ nguyên mẫu fliegen ở cuối câu.", 3100078, ["hoch fliegen können", "nicht fliegen können"], "Khả năng mà hai cô chim đem ra khoe và chú chim cánh cụt ao ước."),
    ("sich-schnappen", "sich schnappen", "tóm lấy, bắt gọn", "Cấu trúc phản thân thông tục: sich (Dat.) jemanden/etwas schnappen.", 3100087, ["den Dieb schnappen", "Komm, den schnappen wir uns!"], "Cách nói sinh động khi hai thám tử lao tới bắt nghi phạm."),
    ("klauen", "klauen", "ăn trộm, lấy cắp (thông tục)", "Động từ yếu khẩu ngữ: klaut; klaute; hat geklaut. Danh từ hóa: das Klauen.", 3100091, ["Ballons klauen", "ohne zu fragen klauen"], "Thông tục và hay dùng trong hội thoại hàng ngày hơn stehlen."),
    ("verkaufen", "verkaufen", "bán", "Động từ yếu không tách: verkauft; verkaufte; hat verkauft.", 3100102, ["wunderschöne Ballons verkaufen", "etwas im Park verkaufen"], "Lời người bán bóng bay giới thiệu những chùm bóng trong công viên."),
    ("absuchen", "absuchen", "lục soát, tìm khắp một khu vực", "Động từ tách: sucht ab; suchte ab; hat abgesucht.", 3100108, ["den ganzen Park absuchen", "alles gründlich absuchen"], "wir suchen den ganzen Park ab: chúng ta lục soát khắp công viên."),
    ("achterbahn", "die Achterbahn", "tàu lượn siêu tốc", "die Achterbahn, die Achterbahnen (f.). Cụm: mit der Achterbahn fahren.", 3100046, ["mit der Achterbahn fahren", "in die Achterbahn dürfen"], "Quy định trong công viên: chuột đất phải đi tàu lượn cùng người lớn."),
    ("notfall", "der Notfall", "trường hợp khẩn cấp", "der Notfall, die Notfälle (m.).", 3100117, ["Das ist ein Notfall!", "im Notfall helfen"], "Câu nói ngắn gọn để thuyết phục người lớn cho đi nhờ tàu lượn."),
    ("zugeben", "zugeben", "thú nhận, nhận lỗi", "Động từ tách: gibt zu; gab zu; hat zugegeben. Mệnh lệnh: gib's zu!", 3100128, ["einen Fehler zugeben", "gib's zu!"], "gib's zu (= gib es zu): mau thú nhận đi!"),
    ("leibgericht", "das Leibgericht", "món ăn yêu thích nhất", "das Leibgericht, die Leibgerichte (n.). Ghép: Leib- + das Gericht.", 3100135, ["mein Leibgericht sein", "Fischstäbchen als Leibgericht"], "Lý do vì sao que cá tẩm bột xuất hiện ở mọi hiện trường."),
    ("halskette", "die Halskette", "vòng cổ, dây chuyền", "die Halskette, die Halsketten (f.). Ghép: der Hals + die Kette.", 3100151, ["eine schöne Halskette", "in den See fallen"], "Món đồ quý của cô chim bị rơi xuống hồ nước."),
    ("tauchen", "tauchen", "lặn", "Động từ yếu: taucht; tauchte; hat/ist getaucht.", 3100158, ["tief tauchen", "besser tauchen als fliegen"], "Tài năng thực sự của chú chim cánh cụt khi giúp vớt chiếc vòng cổ."),
    ("lustig-machen", "sich über jdn. lustig machen", "chế giễu, cười nhạo ai", "Cụm phản thân: sich (Akk.) über jemanden (Akk.) lustig machen.", 3100167, ["sich über andere lustig machen", "Es tut uns leid, dass wir uns über dich lustig gemacht haben."], "Đi cùng lời xin lỗi chân thành của hai cô chim ở cuối tập."),
    ("wieder-gutmachen", "wieder gutmachen", "bù đắp, chuộc lỗi", "Động từ tách: macht wieder gut; hat wieder gutgemacht.", 3100169, ["einen Fehler wieder gutmachen", "Wie kann ich das wieder gutmachen?"], "Câu hỏi khi muốn đền đáp người đã giúp đỡ mình."),
    ("aufpusten", "aufpusten", "thổi phồng lên (bóng bay)", "Động từ tách: pustet auf; pustete auf; hat aufgepustet.", 3100172, ["einen Luftballon aufpusten", "neu aufgepustete Ballons"], "Người bán bóng hỏi khách có lấy luôn những quả bóng vừa mới thổi không."),
]

chapters_js_lines = []
for ch in reviewed["chapters"]:
    pick_ids = [p["id"] for p in ch["picks"]]
    chapters_js_lines.append(
        f"      {{ title: {json.dumps(ch['title'], ensure_ascii=False)}, icon: {json.dumps(ch['icon'], ensure_ascii=False)}, "
        f"start: {ch['start']}, end: {ch['end']},\n"
        f"        picks: {json.dumps(pick_ids)},\n"
        f"        goal: {json.dumps(ch['goal'], ensure_ascii=False)} }}"
    )

CARD_SPECS = [spec for spec in CARD_SPECS if spec[4] in {c['id'] for c in reviewed['cues']}]

entries_js_lines = []
for spec in CARD_SPECS:
    entries_js_lines.append("    " + json.dumps(list(spec), ensure_ascii=False))

lesson_js = f"""/* Original NDR/KiKA episode, selected bilingual dialogue and independent progress. */
const ERDMAENNCHEN_LUFTGEHEN_LESSON = (() => {{
  const deck = '🎬 Video: Jan & Henry – Zum in die Luft gehen';
  const video = {{
    key: 'erdmaennchen_luftgehen', series: 'Ein Fall für die Erdmännchen', seriesIcon: '🔎', episodeTitle: 'Zum in die Luft gehen',
    icon: '🎈', title: '🎈 Jan & Henry – Zum in die Luft gehen', src: 'video/erdmaennchen_luftgehen.mp4',
    storageKey: 'kino_calibrated_erdmaennchen_luftgehen_v1', syncKey: 'vokabelgo_kino_perfected_erdmaennchen_luftgehen',
    progressKey: 'vokabelgo_kino_progress_erdmaennchen_luftgehen', fullDurationStr: '11:32', flashcardDeck: deck,
    sourceUrl: 'https://www.kika.de/ein-fall-fuer-die-erdmaennchen/videos/zum-in-die-luft-gehen-s-e-100?videoType=mainContent'
  }};
  const chapterData = {{
    title: 'Zum in die Luft gehen', series: 'EIN FALL FÜR DIE ERDMÄNNCHEN',
    summary: 'Những chùm bóng bay biến mất · Jan và Henry lần theo dấu vết que cá tẩm bột chiên trong công viên giải trí tới chú chim cánh cụt mơ được bay lên bầu trời.',
    levelLabel: 'Gợi ý A2–B1', defaultMode: 'all', practiceModeVersion: 1,
    allLabel: 'Các câu trong bài',
    allDescription: 'Lời thoại chọn lọc · Có thể chuyển sang câu trọng tâm của từng phần',
    captionCues: ERDMAENNCHEN_LUFTGEHEN_CAPTION_CUES,
    storageKey: 'vokabelgo_kino_chapters_v1_erdmaennchen_luftgehen',
    legacyKey: video.progressKey, legacyCount: 0,
    chapters: [
{",\n".join(chapters_js_lines)}
    ]
  }};
  const entries = [
{",\n".join(entries_js_lines)}
  ];
  const flashcards = entries.map(([id, term, meaning, grammar, cueId, collocations, note]) => {{
    const cue = ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES.find(item => item.id === cueId);
    if (!cue) throw new Error(`Luftgehen vocabulary refers to missing cue ${{cueId}}`);
    const chapter = chapterData.chapters.findIndex(c => cue.start >= c.start && cue.end <= c.end);
    if (chapter < 0) throw new Error(`Luftgehen vocabulary falls outside chapters: ${{cueId}}`);
    return {{ id: `vk_erdmaennchen_luftgehen_${{id}}`, term, meaning, grammar, example: cue.text,
      collocations, note, deck, tags: ['Video', 'Jan & Henry', 'Alltag'],
      videoKey: video.key, cueId, sourceUrl: `?kino=luftgehen&part=${{chapter + 1}}` }};
  }});
  chapterData.vocabularyCount = flashcards.length;
  return {{ video, chapterData, flashcards }};
}})();
"""
(root / "erdmaennchen-luftgehen-lesson.js").write_text(lesson_js, encoding="utf-8")
print("Generated erdmaennchen-luftgehen-aligned.js and erdmaennchen-luftgehen-lesson.js")
