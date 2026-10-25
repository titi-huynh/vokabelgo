/* Word alignment for Kino: a missing word must not shift the rest of the answer. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KinoDictation = api;
})(globalThis, function () {
  const punctuation = /[.,/#!$%^&*;:{}=\-_`~()?"'…!–—]/g;
  const numbers = { drei: '3', neun: '9', zehn: '10', zwölf: '12', vierzehn: '14', sechzehn: '16',
    dreißig: '30', fünfzig: '50', einhundert: '100', hundert: '100', dritten: '3', dritter: '3', vierte: '4' };
  function normalize(value) {
    return String(value || '').normalize('NFC').toLowerCase()
      .replace(/\b(lang|kurz)ärmelig(e[nmrs]?)?\b/g, (_word, prefix, ending = '') => `${prefix}ärmlig${ending}`)
      .replace(punctuation, ' ')
      .replace(/(?<![\p{L}\p{N}_])(?:drei|neun|zehn|zwölf|vierzehn|sechzehn|dreißig|fünfzig|einhundert|hundert|dritten|dritter|vierte)(?![\p{L}\p{N}_])/gu, word => numbers[word])
      .replace(/\s+/g, ' ').trim();
  }
  function tokens(value) {
    const text = String(value || '');
    return [...text.replace(punctuation, ' ').matchAll(/\S+/gu)].map(match => ({
      text: match[0], start: match.index, end: match.index + match[0].length, clean: normalize(match[0]),
    }));
  }
  function align(userValue, targetValue) {
    const user = tokens(userValue), target = tokens(targetValue);
    const width = user.length + 1;
    const steps = new Uint8Array((target.length + 1) * width);
    let costs = new Uint32Array(width), matches = new Uint32Array(width);
    for (let j = 1; j < width; j++) { costs[j] = j; steps[j] = 3; }
    for (let i = 1; i <= target.length; i++) {
      const nextCosts = new Uint32Array(width), nextMatches = new Uint32Array(width);
      nextCosts[0] = i;
      steps[i * width] = 2;
      for (let j = 1; j < width; j++) {
        const same = target[i - 1].clean === user[j - 1].clean;
        let cost = costs[j - 1] + (same ? 0 : 1);
        let matched = matches[j - 1] + (same ? 1 : 0);
        let step = 1;
        // Break edit-distance ties by retaining more correctly heard words.
        for (const [candidate, kept, direction] of [[costs[j] + 1, matches[j], 2], [nextCosts[j - 1] + 1, nextMatches[j - 1], 3]]) {
          if (candidate < cost || (candidate === cost && kept > matched)) {
            cost = candidate; matched = kept; step = direction;
          }
        }
        nextCosts[j] = cost; nextMatches[j] = matched; steps[i * width + j] = step;
      }
      costs = nextCosts; matches = nextMatches;
    }
    const operations = [];
    let i = target.length, j = user.length;
    while (i || j) {
      const step = steps[i * width + j];
      if (step === 1) {
        operations.push({ type: target[i - 1].clean === user[j - 1].clean ? 'correct' : 'replace', target: target[i - 1], user: user[j - 1] });
        i--; j--;
      } else if (step === 2) {
        operations.push({ type: 'missing', target: target[i - 1] }); i--;
      } else {
        operations.push({ type: 'extra', user: user[j - 1] }); j--;
      }
    }
    operations.reverse();
    return operations;
  }
  return Object.freeze({ normalize, align });
});
