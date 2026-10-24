// test-all.js
// Runs all acceptance test suites sequentially and exits non-zero if any fails
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Cách ly dữ liệu: các suite ghi vào BẢN SAO tạm của dữ liệu lexicon thật
// (và báo cáo audit tạm) thay vì sửa trực tiếp file trong repo.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vokabelgo-test-'));
const seedCopy = (rel) => {
  const dest = path.join(tmpDir, path.basename(rel));
  fs.copyFileSync(path.join(__dirname, rel), dest);
  return dest;
};
process.env.VOKABELGO_CANDIDATES_FILE = seedCopy('data/lexicon/candidates/candidates.json');
process.env.VOKABELGO_APPROVED_FILE = seedCopy('data/lexicon/approved/approved.json');
process.env.VOKABELGO_AUDIT_REPORT = path.join(tmpDir, 'audit-vocabulary-report.json');

const suites = [
  'test-security-auth-acceptance.js',
  'test-pedagogical-ux-acceptance.js',
  'test-phase1-acceptance.js',
  'test-core-learning-loop-acceptance.js',
  'test-fsrs-srs-acceptance.js',
  'test-phase3-typing-acceptance.js',
  'test-phase4a-schema-acceptance.js',
  'test-phase4b-progress-acceptance.js',
  'test-phase5-listening-acceptance.js',
  'test-wortturm-evaluator.js',
  'test-wortcrush-evaluator.js',
  'test-dau-tu-evaluator.js',
  'test-dau-tu-v02.js',
  'test-dau-tu-v03.js',
  'test-dau-tu-v05.js',
  'test-lexicon-pipeline.js',
  'test-vocabulary-rotation.js',
  'test-dau-tu-v06.js',
  'test-srt-align.js'
];

let failedSuites = [];

console.log('====================================================');
console.log('RUNNING ALL ACCEPTANCE TEST SUITES SEQUENTIALLY');
console.log('====================================================\n');

for (const suite of suites) {
  console.log(`\n====================================================`);
  console.log(`>>> EXECUTING: ${suite}`);
  console.log(`====================================================`);
  const res = spawnSync(process.execPath, [path.join(__dirname, suite)], {
    stdio: 'inherit',
    cwd: __dirname
  });

  if (res.status !== 0) {
    console.error(`\n❌ FAILED SUITE: ${suite} (exit code ${res.status})\n`);
    failedSuites.push(suite);
  } else {
    console.log(`\n✅ COMPLETED SUITE: ${suite} (PASS)\n`);
  }
}

console.log('====================================================');
console.log('ALL SUITES EXECUTION SUMMARY');
console.log('====================================================');
if (failedSuites.length === 0) {
  console.log(`🎉 ALL ${suites.length} SUITES PASSED CLEANLY! ZERO REGRESSIONS.`);
  console.log('====================================================\n');
  process.exit(0);
} else {
  console.error(`⚠️ ${failedSuites.length} / ${suites.length} SUITES FAILED: ${failedSuites.join(', ')}`);
  console.log('====================================================\n');
  process.exit(1);
}
