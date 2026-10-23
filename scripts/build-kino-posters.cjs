// Extract chapter covers from the existing films; never rewrites the source media.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const context = {};
vm.createContext(context);
// Use the same data script order as the app, including newly added episodes.
const alignedFiles = fs.readdirSync(root).filter(f => f.endsWith('-aligned.js'));
const lessonFiles = ['kino-metadata.js', ...alignedFiles, ...[...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"/]+(?:-aligned|-lesson)\.js)"><\/script>/g)].map(match => match[1])];
for (const file of [...new Set(lessonFiles), 'kino-chapter-data.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
const movies = vm.runInContext('KINO_CHAPTER_DATA', context);
const destination = path.join(root, 'assets', 'kino-posters');
fs.mkdirSync(destination, { recursive: true });
const requested = process.argv[2];
if (requested && !movies[requested]) throw new Error(`Unknown movie: ${requested}`);
let count = 0;
for (const [key, movie] of Object.entries(movies)) {
  if (requested && requested !== key) continue;
  const source = path.join(root, 'video', key === 'peppa_supermarkt' ? 'Peppa_Wutz_Supermarkt.mp4' : `${key}.mp4`);
  movie.chapters.forEach((chapter, i) => {
    const cue = movie.cues.find(c => c.id === chapter.picks[0]);
    const time = key === 'hans' ? [105, 180, 285, 480][i] : key === 'trudes_fahrstuhl' ? [40, 142, 190, 309, 346][i] : key === 'erdmaennchen_nudeltrick' ? [40, 166, 347, 395, 472, 615, 700][i] : key === 'erdmaennchen_schmucklose' ? [74, 218, 306, 333, 507, 597, 685][i] : key === 'we_bare_bears_mall' ? [15, 166, 235][i] : key === 'frieren_s01e01' ? [131, 380, 608, 845, 936, 1159, 1448][i] : cue.start + .4;
    const filter = key === 'hans' ? 'scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2' : 'scale=w=min(960\\,iw):h=-2';
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(time), '-i', source, '-frames:v', '1', '-vf', filter, '-q:v', '3', path.join(destination, `${key}-${i + 1}.jpg`)]);
    count++;
  });
}
console.log(`Extracted ${count} chapter covers${requested ? ` for ${requested}` : ''} from original media.`);
