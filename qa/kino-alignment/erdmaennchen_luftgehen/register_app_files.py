import json
from pathlib import Path

root = Path(".")
qa_dir = root / "qa" / "kino-alignment" / "erdmaennchen_luftgehen"
reviewed = json.loads((qa_dir / "reviewed-lesson.json").read_text(encoding="utf-8"))

# 1. Update kino-data.js
kd_path = root / "kino-data.js"
kd = kd_path.read_text(encoding="utf-8")
if "erdmaennchen_luftgehen:" not in kd:
    kd = kd.replace(
        "    erdmaennchen_schmucklose: 'erdmaennchen-schmucklose-aligned.js',",
        "    erdmaennchen_schmucklose: 'erdmaennchen-schmucklose-aligned.js',\n    erdmaennchen_luftgehen: 'erdmaennchen-luftgehen-aligned.js',",
        1
    )
if "case 'erdmaennchen_luftgehen': return ERDMAENNCHEN_LUFTGEHEN_CAPTION_CUES;" not in kd:
    kd = kd.replace(
        "      case 'erdmaennchen_schmucklose': return ERDMAENNCHEN_SCHMUCKLOSE_CAPTION_CUES;",
        "      case 'erdmaennchen_schmucklose': return ERDMAENNCHEN_SCHMUCKLOSE_CAPTION_CUES;\n      case 'erdmaennchen_luftgehen': return ERDMAENNCHEN_LUFTGEHEN_CAPTION_CUES;",
        1
    )
if "case 'erdmaennchen_luftgehen': return ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES;" not in kd:
    kd = kd.replace(
        "      case 'erdmaennchen_schmucklose': return ERDMAENNCHEN_SCHMUCKLOSE_ALIGNED_UTTERANCES;",
        "      case 'erdmaennchen_schmucklose': return ERDMAENNCHEN_SCHMUCKLOSE_ALIGNED_UTTERANCES;\n      case 'erdmaennchen_luftgehen': return ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES;",
        1
    )
kd_path.write_text(kd, encoding="utf-8")

# 2. Update kino-chapter-data.js
kcd_path = root / "kino-chapter-data.js"
kcd = kcd_path.read_text(encoding="utf-8")
if "erdmaennchen_luftgehen: 'luftgehen'" not in kcd:
    kcd = kcd.replace(
        "erdmaennchen_schmucklose: 'schmucklose'",
        "erdmaennchen_schmucklose: 'schmucklose', erdmaennchen_luftgehen: 'luftgehen'",
        1
    )
if "erdmaennchen_luftgehen: { ...ERDMAENNCHEN_LUFTGEHEN_LESSON.chapterData" not in kcd:
    kcd = kcd.replace(
        "  erdmaennchen_schmucklose: { ...ERDMAENNCHEN_SCHMUCKLOSE_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return ERDMAENNCHEN_SCHMUCKLOSE_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('erdmaennchen_schmucklose'); } },",
        "  erdmaennchen_schmucklose: { ...ERDMAENNCHEN_SCHMUCKLOSE_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return ERDMAENNCHEN_SCHMUCKLOSE_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('erdmaennchen_schmucklose'); } },\n  erdmaennchen_luftgehen: { ...ERDMAENNCHEN_LUFTGEHEN_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('erdmaennchen_luftgehen'); } },",
        1
    )
kcd_path.write_text(kcd, encoding="utf-8")

# 3. Update kino-practice-data.js
kpd_path = root / "kino-practice-data.js"
kpd = kpd_path.read_text(encoding="utf-8")
marker = "const KINO_PRACTICE_DATA = "
start_idx = kpd.find(marker)
assert start_idx >= 0, "KINO_PRACTICE_DATA marker not found"
header = kpd[:start_idx + len(marker)]
suffix_idx = kpd.rfind("};")
kpd_obj = json.loads(kpd[start_idx + len(marker):suffix_idx + 1])
kpd_obj["erdmaennchen_luftgehen"] = [
    {
        "part": idx + 1,
        "picks": [{"id": p["id"], "usage": p["usage"]} for p in ch["picks"]]
    }
    for idx, ch in enumerate(reviewed["chapters"])
]
kpd_footer = """
for (const [key, parts] of Object.entries(KINO_PRACTICE_DATA)) {
  for (const part of parts) {
    const chapter = KINO_CHAPTER_DATA[key].chapters[part.part - 1];
    chapter.picks = part.picks.map(pick => pick.id);
    chapter.practiceUsage = Object.fromEntries(part.picks.map(pick => [pick.id, pick.usage]));
  }
}
"""
kpd_new = header + json.dumps(kpd_obj, ensure_ascii=False, indent=2) + ";\n" + kpd_footer
kpd_path.write_text(kpd_new, encoding="utf-8")

# 4. Update index.html
idx_path = root / "index.html"
idx_html = idx_path.read_text(encoding="utf-8")
dd_block = """                <button type="button" class="kino-dropdown-item" id="kinoDD_erdmaennchen_schmucklose" data-key="erdmaennchen_schmucklose" onclick="selectKinoMovie('erdmaennchen_schmucklose')">
                  <span class="kino-dd-item-icon">👑</span>
                  <div class="kino-dd-item-info">
                    <span class="kino-dd-item-name">Die schmucklose Gräfin</span>
                    <span class="kino-dd-item-sub">7 phần · Nữ bá tước mất trang sức</span>
                  </div>
                  <span class="kino-dd-item-badge" id="kinoBadge_erdmaennchen_schmucklose">7 phần</span>
                  <span class="kino-dd-item-check">✓</span>
                </button>"""
dd_new = dd_block + """
                <button type="button" class="kino-dropdown-item" id="kinoDD_erdmaennchen_luftgehen" data-key="erdmaennchen_luftgehen" onclick="selectKinoMovie('erdmaennchen_luftgehen')">
                  <span class="kino-dd-item-icon">🎈</span>
                  <div class="kino-dd-item-info">
                    <span class="kino-dd-item-name">Zum in die Luft gehen</span>
                    <span class="kino-dd-item-sub">7 phần · Những chùm bóng bay biến mất</span>
                  </div>
                  <span class="kino-dd-item-badge" id="kinoBadge_erdmaennchen_luftgehen">7 phần</span>
                  <span class="kino-dd-item-check">✓</span>
                </button>"""
if 'id="kinoDD_erdmaennchen_luftgehen"' not in idx_html:
    assert dd_block in idx_html, "Dropdown target not found in index.html"
    idx_html = idx_html.replace(dd_block, dd_new, 1)

fc_target = "VIDEO_FLASHCARDS.push(...ERDMAENNCHEN_SCHMUCKLOSE_LESSON.flashcards);"
fc_new = fc_target + "\nVIDEO_FLASHCARDS.push(...ERDMAENNCHEN_LUFTGEHEN_LESSON.flashcards);"
if "ERDMAENNCHEN_LUFTGEHEN_LESSON.flashcards" not in idx_html:
    assert fc_target in idx_html, "Flashcards push target not found in index.html"
    idx_html = idx_html.replace(fc_target, fc_new, 1)

kv_target = "  erdmaennchen_schmucklose: { ...ERDMAENNCHEN_SCHMUCKLOSE_LESSON.video, get defaultSegs() { return ERDMAENNCHEN_SCHMUCKLOSE_ALIGNED_UTTERANCES; } },"
kv_new = kv_target + "\n  erdmaennchen_luftgehen: { ...ERDMAENNCHEN_LUFTGEHEN_LESSON.video, get defaultSegs() { return ERDMAENNCHEN_LUFTGEHEN_ALIGNED_UTTERANCES; } },"
if "erdmaennchen_luftgehen: { ...ERDMAENNCHEN_LUFTGEHEN_LESSON.video" not in idx_html:
    assert kv_target in idx_html, "KINO_VIDEOS target not found in index.html"
    idx_html = idx_html.replace(kv_target, kv_new, 1)

idx_path.write_text(idx_html, encoding="utf-8")

# 5. Update scripts/build-kino-metadata.cjs
bkm_path = root / "scripts" / "build-kino-metadata.cjs"
bkm = bkm_path.read_text(encoding="utf-8")
bkm_target = "  ['erdmaennchen-schmucklose', 'ERDMAENNCHEN_SCHMUCKLOSE', 'erdmaennchen_schmucklose'],"
bkm_new = bkm_target + "\n  ['erdmaennchen-luftgehen', 'ERDMAENNCHEN_LUFTGEHEN', 'erdmaennchen_luftgehen'],"
if "'erdmaennchen-luftgehen'" not in bkm:
    assert bkm_target in bkm, "build-kino-metadata target not found"
    bkm = bkm.replace(bkm_target, bkm_new, 1)
bkm_path.write_text(bkm, encoding="utf-8")

# 6. Update scripts/build-kino-posters.cjs with representative timestamps for erdmaennchen_luftgehen
bkp_path = root / "scripts" / "build-kino-posters.cjs"
bkp = bkp_path.read_text(encoding="utf-8")
bkp_target = "key === 'erdmaennchen_schmucklose' ? [74, 218, 306, 333, 507, 597, 685][i] :"
bkp_new = bkp_target + " key === 'erdmaennchen_luftgehen' ? [63, 195, 293, 373, 519, 580, 647][i] :"
if "key === 'erdmaennchen_luftgehen'" not in bkp:
    assert bkp_target in bkp, "build-kino-posters target not found"
    bkp = bkp.replace(bkp_target, bkp_new, 1)
bkp_path.write_text(bkp, encoding="utf-8")

print("Updated kino-data.js, kino-chapter-data.js, kino-practice-data.js, index.html, scripts/build-kino-metadata.cjs, and scripts/build-kino-posters.cjs")
