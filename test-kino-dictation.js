const assert = require('node:assert/strict');
const { align, normalize } = require('./kino-dictation');
const target = 'Ähm, wir haben Kartoffeln, Milch, Brot.';
const kinds = (user, original) => align(user, original).map(op => op.type);

assert.deepEqual(kinds('wir haben Kartoffeln, Milch, Brot.', target), ['missing', ...Array(5).fill('correct')]);
assert.deepEqual(kinds('Ähm wir Kartoffeln Milch Brot', target), ['correct', 'correct', 'missing', 'correct', 'correct', 'correct']);
assert.deepEqual(kinds('Ähm wir haben Kartoffeln Milch', target), [...Array(5).fill('correct'), 'missing']);
assert.deepEqual(kinds('Ähm wir haben heute Kartoffeln Milch Brot extra', target), ['correct', 'correct', 'correct', 'extra', 'correct', 'correct', 'correct', 'extra']);
assert.deepEqual(kinds('Ähm wir haben Kartoffeln Milh Brot', target), ['correct', 'correct', 'correct', 'correct', 'replace', 'correct']);
assert.deepEqual(kinds('Ich weiß dass du kommst', 'Ich weiß, dass du das weißt.'), ['correct', 'correct', 'correct', 'correct', 'missing', 'replace']);
assert.deepEqual(kinds('ja ja bitte', 'Ja, ja, ja, bitte.'), ['missing', 'correct', 'correct', 'correct']);
assert.deepEqual(kinds('', 'Guten Morgen!'), ['missing', 'missing']);
assert.deepEqual(kinds('Guten Morgen!', ''), ['extra', 'extra']);
assert.deepEqual(kinds('', ''), []);
assert.deepEqual(kinds('guten... MORGEN?!', 'Guten Morgen.'), ['correct', 'correct']);
assert.deepEqual(kinds('Wir sind zwölf Jahre alt', 'Wir sind 12 Jahre alt.'), Array(5).fill('correct'));
assert.equal(normalize('Diese Uniform ist langärmelig.'), normalize('Diese Uniform ist langärmlig.'));
assert.equal(normalize('A\u0308pfel'), normalize('Äpfel'));
assert.notEqual(normalize('schon'), normalize('schön'));
assert.notEqual(normalize('zehn Jahre'), normalize('zwölf Jahre'));
assert.notEqual(normalize('Ich gehe'), normalize('Ich gehe nicht'));

// All input and target words survive the alignment, even with repeated words,
// punctuation, or HTML-looking text. Rendering decides how to display them.
for (const [user, original] of [
  ['Ich ich gehe jetzt', 'Ich gehe jetzt'],
  ['Hallo <img src=x onerror=alert(1)>', 'Hallo Welt'],
  ['Nein '.repeat(1000), 'Ja, nein.'],
]) {
  const operations = align(user, original);
  const words = value => value.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'…!–—]/g, ' ').split(/\s+/).filter(Boolean);
  assert.deepEqual(operations.filter(op => op.user).map(op => op.user.text), words(user));
  assert.deepEqual(operations.filter(op => op.target).map(op => op.target.text), words(original));
}
console.log('Kino dictation alignment: all regression cases passed.');
