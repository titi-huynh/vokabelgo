/* Import reviewed dialogue JSON; media stays in the separate media release. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const definitions = [
  { key: 'k_on_s01e01', stem: 'k-on-s01e01', symbol: 'K_ON_S01E01', alias: 'kon', name: 'K-On!', icon: '🎸', level: 'Gợi ý A2–B1', duration: 1451.744, episode: 1, sourceDir: 'qa/kino-alignment/muse-two-films' },
  { key: 'delicious_in_dungeon_s01e01', stem: 'delicious-in-dungeon-s01e01', symbol: 'DELICIOUS_IN_DUNGEON_S01E01', alias: 'dungeon', name: 'Delicious in Dungeon', icon: '🍲', level: 'Gợi ý B1–B2', duration: 1607.488, episode: 1, sourceDir: 'qa/kino-alignment/muse-two-films' },
  { key: 'frieren_s01e02', stem: 'frieren-s01e02', symbol: 'FRIEREN_S01E02', alias: 'frieren2', name: 'Frieren', icon: '🪄', level: 'Gợi ý B1–B2', duration: 1560.102313, episode: 2, sourceDir: 'qa/kino-alignment/season1-episode2' },
  { key: 'sakura_s01e02', stem: 'sakura-s01e02', symbol: 'SAKURA_S01E02', alias: 'sakura2', name: 'Cardcaptor Sakura', icon: '🌸', level: 'Gợi ý A2–B1', duration: 1507.160816, episode: 2, sourceDir: 'qa/kino-alignment/season1-episode2' },
];
function ensure(condition, message) { if (!condition) throw new Error(message); }
function text(value, label) {
  ensure(typeof value === 'string' && value.trim() && !/[<>\u0000-\u0008]/.test(value), `Invalid ${label}`);
  return value.trim();
}
function build(source, definition) {
  const { key, symbol, duration, name, alias, icon } = definition;
  const ep = definition.episode || 1;
  const sourceDir = (definition.sourceDir || 'qa/kino-alignment/muse-two-films').replace(/\\/g, '/').replace(/\/$/, '');
  ensure(source.videoKey === key, `Wrong movie key: ${source.videoKey}`);
  ensure(source.complete !== false && source.partial !== true && source.draft !== true, `${key}: partial/draft inputs cannot become a lesson`);
  ensure(['de', 'German', 'Deutsch'].includes(source.language), `${key}: verify German speech before import`);
  ensure(Math.abs(Number(source.duration) - duration) < .5, `${key}: duration differs from the supplied video`);
  ensure(Array.isArray(source.cues) && source.cues.length > 100, `${key}: need full dialogue, not just a shortlist`);
  const ids = new Set();
  const exclusions = source.exclusions || [];
  for (const range of exclusions) ensure(Number.isFinite(range.start) && Number.isFinite(range.end) && range.start >= 0 && range.end > range.start && range.end <= duration + .02, `${key}: invalid excluded interval`);
  const captions = source.cues.map((cue, index) => {
    ensure(Number.isInteger(cue.id) && !ids.has(cue.id), `${key}: invalid/duplicate cue ID`);
    ids.add(cue.id);
    ensure(Number.isFinite(cue.start) && Number.isFinite(cue.end) && cue.start >= 0 && cue.end > cue.start && cue.end <= duration + .02, `${key}/${cue.id}: invalid timing`);
    ensure(!index || cue.start >= source.cues[index - 1].end - .02, `${key}/${cue.id}: overlapping/out-of-order captions need review`);
    const reviewNeeded = cue.reviewNeeded || (source.uncertain || []).some(item =>
      item.id === cue.id || item.cueId === cue.id || (Number.isFinite(item.start) && Number.isFinite(item.end) && item.start < cue.end && item.end > cue.start));
    const excluded = cue.practiceExcluded || exclusions.some(range => range.start < cue.end && range.end > cue.start);
    return { id: cue.id, parentId: cue.id, start: cue.start, end: cue.end,
      speaker: cue.speaker?.trim() || 'Nhân vật', text: text(cue.text, 'German dialogue'), vi: text(cue.vi, 'Vietnamese dialogue'),
      sourceEvidence: `${sourceDir}/${key}.json`,
      ...(reviewNeeded ? { reviewNeeded: true, practiceExcluded: true } : excluded ? { practiceExcluded: true } : {}),
    };
  });
  const units = captions.filter(cue => !cue.practiceExcluded).map(cue => ({ ...cue, legacyIds: [cue.id] }));
  const byId = new Map(units.map(cue => [cue.id, cue]));
  ensure(source.chapters?.length >= 5 && source.chapters.length <= 10, `${key}: meaningful chapter boundaries required`);
  const chapters = source.chapters.map((chapter, index) => {
    const start = index === 0 ? 0 : chapter.start;
    const end = index === source.chapters.length - 1 ? duration : chapter.end;
    ensure(Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end > start && end <= duration, `${key}: invalid chapter ${index + 1}`);
    ensure(!index || start >= source.chapters[index - 1].end, `${key}: overlapping chapters`);
    ensure(chapter.picks?.length >= 3 && chapter.picks.length <= 7, `${key}: shortlist must have 3–7 useful lines`);
    const picks = chapter.picks.map(pick => pick.id);
    ensure(new Set(picks).size === picks.length, `${key}: duplicate shortlisted line`);
    for (const pick of chapter.picks) {
      const cue = byId.get(pick.id);
      ensure(cue && cue.start >= start && cue.end <= end, `${key}/${pick.id}: pick outside its chapter or unreviewed`);
      text(pick.usage, 'usage note');
    }
    picks.sort((a, b) => byId.get(a).start - byId.get(b).start);
    return { title: text(chapter.title, 'chapter title'), icon: chapter.icon || icon, start, end, picks,
      goal: text(chapter.goal, 'communication goal'),
      practiceUsage: Object.fromEntries(chapter.picks.map(p => [p.id, p.usage.trim()])),
    };
  });
  for (const cue of units) ensure(chapters.filter(c => cue.start >= c.start && cue.end <= c.end).length === 1, `${key}/${cue.id}: dialogue must belong to exactly one chapter`);
  ensure(units[0].start < duration * .2 && units.at(-1).end > duration * .8, `${key}: dialogue must cover the episode`);
  const deck = `🎬 Video: ${name} – Tập ${ep}`;
  const slugs = new Set();
  ensure(source.flashcards?.length >= 12, `${key}: missing vocabulary selection`);
  const flashcards = source.flashcards.map((card, index) => {
    const cue = byId.get(card.cueId);
    ensure(cue, `${key}: flashcard must refer to reviewed dialogue`);
    const term = text(card.term, 'vocabulary term');
    const slug = term.normalize('NFD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || String(index + 1);
    ensure(!slugs.has(slug), `${key}: duplicate vocabulary term`); slugs.add(slug);
    const part = chapters.findIndex(c => cue.start >= c.start && cue.end <= c.end) + 1;
    return { id: `vk_${key}_${slug}`, term, meaning: text(card.meaning, 'vocabulary meaning'),
      grammar: card.grammar || '', example: cue.text, exampleVi: cue.vi, note: card.note || '',
      deck, tags: ['Video', name], videoKey: key, cueId: cue.id, sourceUrl: `?kino=${alias}&part=${part}`,
    };
  });
  const clock = seconds => `${Math.floor(Math.round(seconds) / 60)}:${String(Math.round(seconds) % 60).padStart(2, '0')}`;
  const lesson = {
    video: { key, series: name, seriesIcon: icon, episodeTitle: `${name} · Tập ${ep}`, icon, title: `${icon} ${name} · Tập ${ep}`,
      src: `video/${key}-web-v1.mp4`, storageKey: `kino_calibrated_${key}_v1`, syncKey: `vokabelgo_kino_perfected_${key}`,
      progressKey: `vokabelgo_kino_progress_${key}`, fullDurationStr: clock(duration), flashcardDeck: deck },
    chapterData: { title: `${name} · Tập ${ep}`, catalogTitle: `${name} · Tập ${ep}`, series: `${name.toUpperCase()} · TẬP ${ep}`,
      summary: text(source.summary || `${name} tập ${ep} · Xem phim, nghe hội thoại Đức và luyện những câu dùng được trong từng tình huống.`, 'film summary')
        + (captions.some(cue => cue.reviewNeeded) ? ' Những đoạn chưa rõ lời thoại sẽ tạm để trống phụ đề.' : ''),
      levelLabel: definition.level, defaultMode: 'light', practiceModeVersion: 1, contentVersion: 1,
      storageKey: `vokabelgo_kino_chapters_v1_${key}`, legacyKey: `vokabelgo_kino_progress_${key}`, legacyCount: 0,
      cueCount: units.length, vocabularyCount: flashcards.length, chapters }, flashcards,
  };
  return { definition, captions: captions.filter(cue => !cue.practiceExcluded), units, lesson, practice: chapters.map((chapter, index) => ({ part: index + 1,
    picks: chapter.picks.map(id => ({ id, usage: chapter.practiceUsage[id] })) })) };
}
function main() {
  const argDir = process.argv[2];
  const selected = argDir
    ? definitions.filter(def => fs.existsSync(path.join(path.resolve(root, argDir), `${def.key}.json`)))
    : definitions;
  ensure(selected.length > 0, `No matching lesson JSONs found for ${argDir || 'default definitions'}`);
  // Validate imports before touching any generated files.
  const results = selected.map(def => {
    const dir = path.resolve(root, argDir || def.sourceDir || 'qa/kino-alignment/muse-two-films');
    const relDir = path.relative(root, dir).replace(/\\/g, '/');
    return build(JSON.parse(fs.readFileSync(path.join(dir, `${def.key}.json`), 'utf8')), { ...def, sourceDir: relDir });
  });
  for (const { definition: def, captions, units, lesson } of results) {
    fs.writeFileSync(path.join(root, `${def.stem}-aligned.js`),
      `/* Reviewed owner-supplied dialogue; original video timestamps. */\nconst ${def.symbol}_CAPTION_CUES = ${JSON.stringify(captions, null, 2)};\nconst ${def.symbol}_ALIGNED_UTTERANCES = ${JSON.stringify(units, null, 2)};\n`);
    fs.writeFileSync(path.join(root, `${def.stem}-lesson.js`),
      `const ${def.symbol}_LESSON = (() => {\n  const lesson = ${JSON.stringify(lesson, null, 2)};\n  lesson.chapterData.captionCues = ${def.symbol}_CAPTION_CUES;\n  return lesson;\n})();\n`);
  }
  const practiceFile = path.join(root, 'kino-practice-data.js');
  const existing = fs.readFileSync(practiceFile, 'utf8');
  const marker = 'const KINO_PRACTICE_DATA = ';
  ensure(existing.includes(marker), 'Cannot locate the practice data declaration');
  const start = existing.indexOf(marker) + marker.length;
  const end = existing.lastIndexOf(';', existing.indexOf('\nfor (const [key, parts]'));
  ensure(start >= 0 && end > start, 'Cannot locate the practice data object');
  const practice = JSON.parse(existing.slice(start, end));
  for (const result of results) practice[result.definition.key] = result.practice;
  fs.writeFileSync(practiceFile, existing.slice(0, start) + JSON.stringify(practice, null, 2) + existing.slice(end));
  console.log(results.map(r => ({ key: r.definition.key, captions: r.captions.length, practice: r.units.length,
    chapters: r.lesson.chapterData.chapters.length, flashcards: r.lesson.flashcards.length })));
}
if (require.main === module) main();
module.exports = { build, definitions };
