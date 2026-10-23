const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.wav': 'audio/wav',
  '.ico': 'image/x-icon'
};

const requestHandler = (req, res) => {
  let reqUrl = decodeURI(req.url.split('?')[0]);
  if (reqUrl === '/') reqUrl = '/index.html';
  if (reqUrl === '/preview/wortturm' || reqUrl === '/preview/wortturm/' || reqUrl === '/wortturm' || reqUrl === '/wortturm/') {
    reqUrl = '/wortturm.html';
  }
  if (reqUrl === '/preview/wortcrush' || reqUrl === '/preview/wortcrush/' || reqUrl === '/wortcrush' || reqUrl === '/wortcrush/') {
    reqUrl = '/wortcrush.html';
  }
  if (reqUrl === '/preview/dau-tu' || reqUrl === '/preview/dau-tu/' || reqUrl === '/dau-tu' || reqUrl === '/dau-tu/') {
    reqUrl = '/dau-tu.html';
  }
  if (reqUrl === '/preview/dau-tu-cards' || reqUrl === '/preview/dau-tu-cards/' || reqUrl === '/dau-tu-cards' || reqUrl === '/dau-tu-cards/') {
    reqUrl = '/dau-tu-cards.html';
  }
  if (reqUrl === '/preview/dau-tu-lexicon-review' || reqUrl === '/preview/dau-tu-lexicon-review/' || reqUrl === '/dau-tu-lexicon-review' || reqUrl === '/dau-tu-lexicon-review/') {
    reqUrl = '/dau-tu-lexicon-review.html';
  }

  // Lexicon Review Dev API
  if (reqUrl === '/api/lexicon/data') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
    const candidatesPath = path.join(__dirname, 'data/lexicon/candidates/candidates.json');
    const approvedPath = path.join(__dirname, 'data/lexicon/approved/approved.json');
    const runtimePath = path.join(__dirname, 'data/lexicon/runtime/dau-tu-approved-runtime.json');
    
    let candidates = { entries: {}, relations: {} };
    let approved = { entries: {}, relations: {}, contexts: {}, antonyms: {} };
    let runtime = null;
    
    if (fs.existsSync(candidatesPath)) {
      try { candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8')); } catch(e) {}
    }
    if (fs.existsSync(approvedPath)) {
      try { approved = JSON.parse(fs.readFileSync(approvedPath, 'utf8')); } catch(e) {}
    }
    if (fs.existsSync(runtimePath)) {
      try { runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8')); } catch(e) {}
    }
    
    res.end(JSON.stringify({ candidates, approved, runtime }));
    return;
  }

  if (reqUrl === '/api/lexicon/action' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { CandidateStore } = require('./src/lexicon/candidate-store');
        const { RuntimeExporter } = require('./src/lexicon/runtime-exporter');
        const store = new CandidateStore();
        
        if (payload.action === 'set_relation_status') {
          store.setRelationStatus(payload.relationId, payload.status, payload.notes || '', payload.reviewer || 'lead-reviewer');
          const exporter = new RuntimeExporter(store);
          exporter.exportRuntime();
        } else if (payload.action === 'rebuild') {
          const exporter = new RuntimeExporter(store);
          exporter.exportRuntime();
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, stats: store.getDashboardStats() }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  const filePath = path.join(__dirname, reqUrl);

  // An toàn đường dẫn
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Hỗ trợ Range request cho Audio / Video
    const range = req.headers.range;
    if (range && (ext === '.mp4' || ext === '.mp3')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
};

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  VokabelGo Web Server dang chay tai:`);
  console.log(`  >> http://localhost:${PORT}`);
  console.log(`  >> http://127.0.0.1:${PORT}`);
  console.log(`======================================================\n`);
  
  // Tự động mở trình duyệt nếu không ở chế độ CI hoặc NO_OPEN
  const SHOULD_OPEN_BROWSER = !process.env.CI && process.env.VOKABELGO_NO_OPEN !== '1';
  if (SHOULD_OPEN_BROWSER) {
    const url = `http://localhost:${PORT}/dau-tu.html`;
    const startCmd = process.platform === 'win32' ? `start ${url}` : `open ${url}`;
    exec(startCmd);
  }
});

// Đồng thời hỗ trợ cổng 3001 nếu người dùng mở theo hướng dẫn README
if (PORT !== 3001) {
  const altServer = http.createServer(requestHandler);
  altServer.on('error', () => {});
  altServer.listen(3001, () => {
    console.log(`  >> Ho tro them cong phu: http://localhost:3001/dau-tu.html`);
  });
}
