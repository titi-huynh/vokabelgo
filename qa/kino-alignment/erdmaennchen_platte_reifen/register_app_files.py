import json
from pathlib import Path

root = Path(".")
qa_dir = root / "qa" / "kino-alignment" / "erdmaennchen_platte_reifen"
reviewed = json.loads((qa_dir / "reviewed-lesson.json").read_text(encoding="utf-8"))

# 1. Update kino-data.js
kd_path = root / "kino-data.js"
kd = kd_path.read_text(encoding="utf-8")
if "erdmaennchen_platte_reifen:" not in kd:
    kd = kd.replace(
        "    erdmaennchen_luftgehen: 'erdmaennchen-luftgehen-aligned.js',",
        "    erdmaennchen_luftgehen: 'erdmaennchen-luftgehen-aligned.js',\n    erdmaennchen_platte_reifen: 'erdmaennchen-platte-reifen-aligned.js',",
        1
    )
if "case 'erdmaennchen_platte_reifen': return ERDMAENNCHEN_PLATTE_REIFEN_CAPTION_CUES;" not in kd:
    kd = kd.replace(
        "      case 'erdmaennchen_luftgehen': return ERDMAENNCHEN_LUFTGEHEN_CAPTION_CUES;",
        "      case 'erdmaennchen_luftgehen': return ERDMAENNCHEN_LUFTGEHEN_CAPTION_CUES;\n      case 'erdmaennchen_platte_reifen': return ERDMAENNCHEN_PLATTE_REIFEN_CAPTION_CUES;",
        1
    )
if "case 'erdmaennchen_platte_reifen': return ERDMAENNCHEN_PLATTE_REIFEN_ALIGNED_UTTERANCES;" not in kd:
    kd = kd.replace(
        "      case 'erdmaennchen_luftgehen': return ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES;",
        "      case 'erdmaennchen_luftgehen': return ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES;\n      case 'erdmaennchen_platte_reifen': return ERDMAENNCHEN_PLATTE_REIFEN_ALIGNED_UTTERANCES;",
        1
    )
kd_path.write_text(kd, encoding="utf-8")

# 2. Update kino-chapter-data.js
kcd_path = root / "kino-chapter-data.js"
kcd = kcd_path.read_text(encoding="utf-8")
if "erdmaennchen_platte_reifen: 'plattereifen'" not in kcd:
    kcd = kcd.replace(
        "erdmaennchen_luftgehen: 'luftgehen'",
        "erdmaennchen_luftgehen: 'luftgehen', erdmaennchen_platte_reifen: 'plattereifen'",
        1
    )
if "erdmaennchen_platte_reifen: { ...ERDMAENNCHEN_PLATTE_REIFEN_LESSON.chapterData" not in kcd:
    kcd = kcd.replace(
        "  erdmaennchen_luftgehen: { ...ERDMAENNCHEN_LUFTGEHEN_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('erdmaennchen_luftgehen'); } },",
        "  erdmaennchen_luftgehen: { ...ERDMAENNCHEN_LUFTGEHEN_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('erdmaennchen_luftgehen'); } },\n  erdmaennchen_platte_reifen: { ...ERDMAENNCHEN_PLATTE_REIFEN_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return ERDMAENNCHEN_PLATTE_REIFEN_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('erdmaennchen_platte_reifen'); } },",
        1
    )
kcd_path.write_text(kcd, encoding="utf-8")

# 3. Narrowly update kino-practice-data.js preserving all existing films byte-for-byte
kpd_path = root / "kino-practice-data.js"
current = kpd_path.read_text(encoding="utf-8")
decoder = json.JSONDecoder()
start = current.index("{", current.index("const KINO_PRACTICE_DATA ="))
data, consumed = decoder.raw_decode(current[start:])
end = start + consumed
entry = [
    {
        "part": idx + 1,
        "picks": [{"id": p["id"], "usage": p["usage"]} for p in ch["picks"]]
    }
    for idx, ch in enumerate(reviewed["chapters"])
]
if "erdmaennchen_platte_reifen" not in data:
    insertion = ',\n  "erdmaennchen_platte_reifen": ' + json.dumps(entry, ensure_ascii=False, indent=2) + "\n"
    result = current[:end - 1].rstrip() + insertion + current[end - 1:]
else:
    field = current.index('"erdmaennchen_platte_reifen":', start, end) + len('"erdmaennchen_platte_reifen":')
    value_start = field + len(current[field:]) - len(current[field:].lstrip())
    _, count = decoder.raw_decode(current[value_start:])
    result = current[:value_start] + json.dumps(entry, ensure_ascii=False, indent=2) + current[value_start + count:]
kpd_path.write_text(result, encoding="utf-8")

# 4. Update index.html
idx_path = root / "index.html"
idx_html = idx_path.read_text(encoding="utf-8")
dd_block = """                <button type="button" class="kino-dropdown-item" id="kinoDD_erdmaennchen_luftgehen" data-key="erdmaennchen_luftgehen" onclick="selectKinoMovie('erdmaennchen_luftgehen')">
                  <span class="kino-dd-item-icon">🎈</span>
                  <div class="kino-dd-item-info">
                    <span class="kino-dd-item-name">Zum in die Luft gehen</span>
                    <span class="kino-dd-item-sub">7 phần · Những chùm bóng bay biến mất</span>
                  </div>
                  <span class="kino-dd-item-badge" id="kinoBadge_erdmaennchen_luftgehen">7 phần</span>
                  <span class="kino-dd-item-check">✓</span>
                </button>"""
dd_new = dd_block + """
                <button type="button" class="kino-dropdown-item" id="kinoDD_erdmaennchen_platte_reifen" data-key="erdmaennchen_platte_reifen" onclick="selectKinoMovie('erdmaennchen_platte_reifen')">
                  <span class="kino-dd-item-icon">🚲</span>
                  <div class="kino-dd-item-info">
                    <span class="kino-dd-item-name">Platte Reifen</span>
                    <span class="kino-dd-item-sub">7 phần · Lốp xe xẹp lép sau cơn mưa</span>
                  </div>
                  <span class="kino-dd-item-badge" id="kinoBadge_erdmaennchen_platte_reifen">7 phần</span>
                  <span class="kino-dd-item-check">✓</span>
                </button>"""
if 'id="kinoDD_erdmaennchen_platte_reifen"' not in idx_html:
    assert dd_block in idx_html, "Dropdown target not found in index.html"
    idx_html = idx_html.replace(dd_block, dd_new, 1)

fc_target = "VIDEO_FLASHCARDS.push(...ERDMAENNCHEN_LUFTGEHEN_LESSON.flashcards);"
fc_new = fc_target + "\nVIDEO_FLASHCARDS.push(...ERDMAENNCHEN_PLATTE_REIFEN_LESSON.flashcards);"
if "ERDMAENNCHEN_PLATTE_REIFEN_LESSON.flashcards" not in idx_html:
    assert fc_target in idx_html, "Flashcards push target not found in index.html"
    idx_html = idx_html.replace(fc_target, fc_new, 1)

kv_target = "  erdmaennchen_luftgehen: { ...ERDMAENNCHEN_LUFTGEHEN_LESSON.video, get defaultSegs() { return ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES; } },"
kv_new = kv_target + "\n  erdmaennchen_platte_reifen: { ...ERDMAENNCHEN_PLATTE_REIFEN_LESSON.video, get defaultSegs() { return ERDMAENNCHEN_PLATTE_REIFEN_ALIGNED_UTTERANCES; } },"
if "erdmaennchen_platte_reifen: { ...ERDMAENNCHEN_PLATTE_REIFEN_LESSON.video" not in idx_html:
    assert kv_target in idx_html, "KINO_VIDEOS target not found in index.html"
    idx_html = idx_html.replace(kv_target, kv_new, 1)

idx_path.write_text(idx_html, encoding="utf-8")

# 5. Update scripts/build-kino-metadata.cjs
bkm_path = root / "scripts" / "build-kino-metadata.cjs"
bkm = bkm_path.read_text(encoding="utf-8")
bkm_target = "  ['erdmaennchen-luftgehen', 'ERDMAENNCHEN_LUFTGEHEN', 'erdmaennchen_luftgehen'],"
bkm_new = bkm_target + "\n  ['erdmaennchen-platte-reifen', 'ERDMAENNCHEN_PLATTE_REIFEN', 'erdmaennchen_platte_reifen'],"
if "'erdmaennchen-platte-reifen'" not in bkm:
    assert bkm_target in bkm, "build-kino-metadata target not found"
    bkm = bkm.replace(bkm_target, bkm_new, 1)
bkm_path.write_text(bkm, encoding="utf-8")

# 6. Update scripts/build-kino-posters.cjs with representative timestamps for erdmaennchen_platte_reifen
bkp_path = root / "scripts" / "build-kino-posters.cjs"
bkp = bkp_path.read_text(encoding="utf-8")
bkp_target = "key === 'erdmaennchen_luftgehen' ? [63, 195, 293, 373, 519, 580, 647][i] :"
bkp_new = bkp_target + " key === 'erdmaennchen_platte_reifen' ? [45, 175, 309, 495, 586, 644, 681][i] :"
if "key === 'erdmaennchen_platte_reifen'" not in bkp:
    assert bkp_target in bkp, "build-kino-posters target not found"
    bkp = bkp.replace(bkp_target, bkp_new, 1)
bkp_path.write_text(bkp, encoding="utf-8")

print("Updated kino-data.js, kino-chapter-data.js, kino-practice-data.js, index.html, scripts/build-kino-metadata.cjs, and scripts/build-kino-posters.cjs")
