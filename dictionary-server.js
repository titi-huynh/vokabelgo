// VokabelGo — tra từ điển phía máy chủ (bản thử cho Kino).
// Cổng trung thực logic của dictionary.py ở Trạm Đọc: de.wiktionary (mục từ,
// ngữ pháp, IPA, định nghĩa, ví dụ, gloss Việt khi có) + vi.wiktionary +
// MyMemory làm gloss dự phòng — mọi gloss dự phòng đều bị đánh dấu nguồn để
// phía client ghi nhãn "chưa kiểm chứng". Không AI, không dịch máy cho định nghĩa.
'use strict';

const POS = {
  Substantiv: 'Danh từ', Verb: 'Động từ', Adjektiv: 'Tính từ', Adverb: 'Trạng từ',
  Pronomen: 'Đại từ', 'Präposition': 'Giới từ', Konjunktion: 'Liên từ',
  Artikel: 'Mạo từ', Numerale: 'Số từ', 'Deklinierte Form': 'Dạng biến cách',
  'Konjugierte Form': 'Dạng chia động từ',
};
const UA = { 'User-Agent': 'VokabelGoLocal/1.0 (personal German-Vietnamese learner)', Accept: 'application/json' };

function templateText(content) {
  const parts = content.split('|');
  const name = parts[0].trim();
  if (['K', 'lb', 'qualifier'].includes(name)) {
    const labels = parts.slice(1).filter(p => !p.includes('=') && p !== 'de' && p !== 'ft');
    return labels.length ? '(' + labels.join(', ') + ') ' : '';
  }
  if (['L', 'l', 'Ü', 'Üt', 'Üxx', 'm'].includes(name) && parts.length > 2) return parts[2];
  return '';
}

function cleanWiki(value) {
  value = String(value || '');
  value = value.replace(/<ref\b[^>]*>[\s\S]*?<\/ref>|<ref\b[^>]*\/>/g, '');
  value = value.replace(/<!--[\s\S]*?-->/g, '');
  value = value.replace(/\[\[([^\[\]]+)\]\]/g, (_, g) => g.split('|').pop().split('#')[0]);
  for (let i = 0; i < 8; i++) {
    const next = value.replace(/\{\{([^{}]+)\}\}/g, (_, g) => templateText(g));
    if (next === value) break;
    value = next;
  }
  value = value.replace(/<[^>]+>/g, '').replace(/'''/g, '').replace(/''/g, '');
  return value.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, ' ').trim();
}

function germanSection(raw) {
  const re = /^==([^=\n].*?)==\s*$/gm;
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (/\{\{Sprache\|Deutsch\}\}/.test(m[1])) {
      const rest = raw.slice(re.lastIndex);
      const end = rest.search(/^==[^=\n].*?==\s*$/m);
      return end >= 0 ? rest.slice(0, end) : rest;
    }
  }
  return '';
}

function parseEntry(title, raw, revision) {
  const section = germanSection(raw || '');
  if (!section) return null;
  const field = (name) => {
    const m = section.match(new RegExp('^\\|' + name + '\\s*=\\s*([^\\n|}]+)', 'm'));
    return m ? cleanWiki(m[1]) : '';
  };
  const linesUnder = (name, limit) => {
    const m = section.match(new RegExp('\\{\\{' + name + '\\}\\}\\s*\\n([\\s\\S]*?)(?=^\\{\\{|^====|$(?![\\s\\S]))', 'm'));
    if (!m) return [];
    const out = [];
    for (const lm of m[1].matchAll(/^:\s*\[[^\]]+\]\s*(.+)$/gm)) out.push(cleanWiki(lm[1]));
    return out.slice(0, limit);
  };
  const base = section.match(/\{\{Grundformverweis(?:\s+(?:Dekl|Konj))?\|([^|}\n]+)/);
  const definitions = linesUnder('Bedeutungen', 4).filter(Boolean);
  const classes = [...new Set([...section.matchAll(/\{\{Wortart\|([^|}]+)\|Deutsch/g)].map(x => POS[x[1]] || x[1]))];
  const ipa = [...section.matchAll(/\{\{Lautschrift\|([^|}]+)/g)].map(x => x[1]);
  const vi = [];
  for (const line of section.split('\n')) {
    if (/^\*\s*\{\{vi\}\}/.test(line)) {
      for (const mm of line.matchAll(/\{\{Ü(?:t|xx)?\|vi\|([^|}]+)/g)) vi.push(cleanWiki(mm[1]));
    }
  }
  return {
    title, lemma: base && !definitions.length ? base[1].trim() : title,
    wordClass: classes.slice(0, 1).join(' · '),
    article: { m: 'der', f: 'die', n: 'das' }[field('Genus')] || '',
    plural: field('Nominativ Plural') || field('Nominativ Plural 1'),
    ipa: ipa[0] || '', vietnamese: [...new Set(vi)].slice(0, 6),
    definitions, examples: linesUnder('Beispiele', 2).filter(Boolean),
    sourceUrl: 'https://de.wiktionary.org/wiki/' + encodeURIComponent(title),
    revision,
  };
}

const pageCache = new Map();
async function wikiPages(host, titles, day) {
  const key = host + '|' + day + '|' + titles.join('|');
  if (pageCache.has(key)) return pageCache.get(key);
  const params = new URLSearchParams({
    action: 'query', prop: 'revisions', rvprop: 'ids|content', rvslots: 'main',
    format: 'json', formatversion: '2', redirects: '1', titles: titles.join('|'),
  });
  const res = await fetch('https://' + host + '/w/api.php?' + params, { headers: UA, signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error('Wiktionary đang bận. Thử lại sau ít giây.');
  const data = await res.json();
  if (data.error) throw new Error('Wiktionary đang bận. Thử lại sau ít giây.');
  const pages = (data.query && data.query.pages) || [];
  pageCache.set(key, pages);
  return pages;
}

function pageContent(page) {
  const rev = (page.revisions || [{}])[0];
  return { content: (((rev.slots || {}).main || {}).content || ''), revid: rev.revid };
}

async function lookupEntry(term, day) {
  const variants = [...new Set([term, term.charAt(0).toUpperCase() + term.slice(1), term.toLowerCase()])];
  const pages = await wikiPages('de.wiktionary.org', variants, day);
  let entry = null;
  for (const cand of variants) {
    for (const page of pages) {
      if (page.missing || page.title !== cand) continue;
      const { content, revid } = pageContent(page);
      const parsed = parseEntry(page.title, content, revid);
      if (parsed) { entry = parsed; break; }
    }
    if (entry) break;
  }
  if (!entry) {
    for (const page of pages) {
      if (page.missing) continue;
      const { content, revid } = pageContent(page);
      const parsed = parseEntry(page.title, content, revid);
      if (parsed) { entry = parsed; break; }
    }
  }
  if (entry && entry.lemma !== entry.title) {
    for (const page of await wikiPages('de.wiktionary.org', [entry.lemma], day)) {
      if (page.missing) continue;
      const { content, revid } = pageContent(page);
      const parsedBase = parseEntry(page.title, content, revid);
      if (parsedBase) { parsedBase.formIpa = entry.ipa; entry = parsedBase; break; }
    }
  }
  return entry;
}

const FUGEN = ['en', 'er', 's', 'n', 'e'];
function splitCandidates(term) {
  const out = [];
  for (let i = 4; i < term.length - 2; i++) {
    const left = term.slice(0, i), right = term.slice(i);
    const lefts = new Set([left]);
    for (const f of FUGEN) if (left.endsWith(f) && left.length > f.length + 2) lefts.add(left.slice(0, -f.length));
    for (const l of lefts) out.push([l, right]);
  }
  return out;
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

async function compoundFallback(term, day) {
  if (term.length < 8 || term.includes(' ')) return null;
  const titles = new Set();
  for (const [l, r] of splitCandidates(term)) { titles.add(cap(l)); titles.add(cap(r)); }
  if (!titles.size) return null;
  const entries = {};
  const ordered = [...titles].sort();
  try {
    for (let s = 0; s < ordered.length; s += 50) {
      for (const page of await wikiPages('de.wiktionary.org', ordered.slice(s, s + 50), day)) {
        if (page.missing) continue;
        const { content, revid } = pageContent(page);
        const parsed = parseEntry(page.title, content, revid);
        if (parsed) entries[page.title] = parsed;
      }
    }
  } catch (e) { return null; }
  let best = null;
  for (const [l, r] of splitCandidates(term)) {
    const le = entries[cap(l)], re2 = entries[cap(r)];
    if (!le || !re2) continue;
    const canonical = [le, re2].filter(e => (e.lemma || e.title) === e.title).length;
    const score = [r.length, canonical, l.length];
    if (!best || score.join() > best[0].join()) best = [score, le, re2];
  }
  if (!best) return null;
  const parts = [best[1], best[2]].map(e => ({
    de: e.title, vi: e.vietnamese[0] || '', article: e.article,
    definition: e.definitions[0] || '',
  }));
  for (const p of parts) if (!p.vi) { const [g] = await glossFallback(p.de); if (g) p.vi = g; }
  const gloss = parts.every(p => p.vi) ? parts[1].vi + ' (' + parts[0].vi + ')' : '';
  return { parts, gloss, unverified: true };
}

function parseViGlosses(raw) {
  const start = (raw || '').search(/^==\s*.*(Tiếng Đức|\{\{-de-\}\}|\{\{langname\|de\}\}).*==\s*$/m);
  if (start < 0) return [];
  const rest = raw.slice(start);
  const nl = rest.indexOf('\n');
  const body = rest.slice(nl + 1);
  const end = body.search(/^==[^=\n].*==\s*$/m);
  const section = end >= 0 ? body.slice(0, end) : body;
  const glosses = [];
  for (const line of section.split('\n')) {
    if (!line.startsWith('#') || line.startsWith('#:') || line.startsWith('#*')) continue;
    const text = cleanWiki(line.replace(/^#+/, '').trim());
    if (text && !text.startsWith('{{')) glosses.push(text);
  }
  return [...new Set(glosses)].slice(0, 3);
}

async function viWikiGloss(term) {
  const day = Math.floor(Date.now() / 86400000);
  const variants = [...new Set([term, cap(term), term.toLowerCase()])];
  try {
    const pages = await wikiPages('vi.wiktionary.org', variants, day);
    for (const cand of variants) {
      for (const page of pages) {
        if (page.missing || page.title !== cand) continue;
        const { content } = pageContent(page);
        const glosses = parseViGlosses(content);
        if (glosses.length) return glosses;
      }
    }
  } catch (e) { /* fall through */ }
  return [];
}

const mmCache = new Map();
async function mymemoryGloss(term, day) {
  const key = term + '@' + day;
  if (mmCache.has(key)) return mmCache.get(key);
  const url = 'https://api.mymemory.translated.net/get?' + new URLSearchParams({ q: term, langpair: 'de|vi' });
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(10000) });
  const body = await res.json();
  let out = '';
  if (Number(body.responseStatus || 200) === 200) {
    const text = ((body.responseData || {}).translatedText || '').trim();
    if (text && text.length <= 60 && !/MYMEMORY WARNING/i.test(text) && text.toLowerCase() !== term.toLowerCase()) out = text;
  }
  mmCache.set(key, out);
  return out;
}

async function glossFallback(term) {
  const glosses = await viWikiGloss(term);
  if (glosses.length) return [glosses[0], 'vi.wiktionary'];
  let text = '';
  try { text = await mymemoryGloss(term, Math.floor(Date.now() / 86400000)); } catch (e) { text = ''; }
  return text ? [text, 'mymemory'] : ['', ''];
}

function fixMojibake(text) {
  if (typeof text !== 'string' || !text.includes('Ã')) return text;
  try {
    const fixed = Buffer.from(text, 'latin1').toString('utf8');
    const count = (s) => (s.match(/Ã/g) || []).length;
    return count(fixed) < count(text) ? fixed : text;
  } catch (e) { return text; }
}
function repair(value) {
  if (typeof value === 'string') return fixMojibake(value);
  if (Array.isArray(value)) return value.map(repair);
  if (value && typeof value === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(value)) o[k] = repair(v);
    return o;
  }
  return value;
}

async function lookup(rawTerm) {
  const term = String(rawTerm || '').replace(/\s+/g, ' ').trim();
  if (!term || term.length > 80 || !/^[\p{L}\p{M}0-9_ '\-’]+$/u.test(term)) {
    const err = new Error('Nhập một từ hoặc cụm từ tiếng Đức, tối đa 80 ký tự.');
    err.status = 400;
    throw err;
  }
  const day = Math.floor(Date.now() / 86400000);
  const entry = await lookupEntry(term, day);
  if (!entry) {
    const result = { found: false, term, sourceUrl: 'https://de.wiktionary.org/wiki/' + encodeURIComponent(term) };
    const glosses = await viWikiGloss(term);
    if (glosses.length) { result.viGloss = glosses; result.viGlossUrl = 'https://vi.wiktionary.org/wiki/' + encodeURIComponent(term); }
    const compound = await compoundFallback(term, day);
    if (compound) result.compound = compound;
    return repair(result);
  }
  const result = Object.assign({ found: true, term }, entry, { licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' });
  if (!entry.vietnamese.length) {
    const [gloss, source] = await glossFallback(entry.lemma || entry.title);
    if (gloss) { result.vietnamese = [gloss]; result.vietnameseSource = source; }
    else {
      const compound = await compoundFallback(term, day);
      if (compound) result.compound = compound;
    }
  }
  return repair(result);
}

module.exports = { lookup };
