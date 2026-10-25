const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({});
const run = file => vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context, { filename: file });
for (const file of fs.readdirSync(__dirname).filter(file => file.endsWith('-aligned.js'))) run(file);
run('kino-metadata.js');
run('kino-chapter-data.js');
const configs = vm.runInContext('KINO_CHAPTER_DATA', context);
const original = Object.fromEntries(Object.entries(configs).map(([key, conf]) => [key, {
  storageKey: conf.storageKey, cues: JSON.stringify(conf.cues), chapters: conf.chapters.map(c => [c.start, c.end]),
}]));
run('kino-practice-data.js');
const curated = vm.runInContext('KINO_PRACTICE_DATA', context);
assert.equal(Object.keys(curated).length, Object.keys(configs).length, 'Every built-in movie has a reviewed shortlist');
let chapters = 0, picks = 0;
for (const [key, config] of Object.entries(configs)) {
  assert.equal(config.storageKey, original[key].storageKey);
  assert.equal(JSON.stringify(config.cues), original[key].cues, `${key}: source cues/IDs must remain intact`);
  assert.equal(curated[key].length, config.chapters.length, `${key}: cover all chapters`);
  for (const [index, chapter] of config.chapters.entries()) {
    assert.deepEqual([chapter.start, chapter.end], original[key].chapters[index]);
    assert.equal(curated[key][index].part, index + 1);
    assert(chapter.picks.length >= 3 && chapter.picks.length <= 7, `${key}/${index + 1}: use only available useful cues`);
    assert.equal(new Set(chapter.picks).size, chapter.picks.length);
    const texts = new Set();
    let previousStart = -1;
    for (const id of chapter.picks) {
      const cue = config.cues.find(cue => cue.id === id);
      assert(cue, `${key}/${index + 1}: original ID ${id} exists`);
      assert(cue.start >= chapter.start && cue.end <= chapter.end, `${key}/${id}: within chapter`);
      assert(cue.start >= previousStart, `${key}/${id}: chronological`);
      previousStart = cue.start;
      const text = cue.text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
      assert(!texts.has(text), `${key}/${index + 1}: no repeated practice lines`);
      texts.add(text);
      assert(typeof chapter.practiceUsage[id] === 'string' && chapter.practiceUsage[id].trim().length > 15, `${key}/${id}: meaningful usage note`);
      picks++;
    }
    chapters++;
  }
}
const demon = configs.demon_slayer_s01e01;
assert(demon.chapters[4].picks.some(id => demon.cues.find(c => c.id === id).text === 'Du musst durchhalten.'));
assert(!demon.chapters[4].picks.some(id => /^Nezuko[.!]?$/.test(demon.cues.find(c => c.id === id).text)));
console.log(`Kino practice data: ${Object.keys(configs).length} films, ${chapters} chapters, ${picks} reviewed lines passed.`);
