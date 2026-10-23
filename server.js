const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
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
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wav': 'audio/wav',
  '.vtt': 'text/vtt; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.ico': 'image/x-icon'
};

// Các đuôi file media hỗ trợ Range request (nghe/xem trực tuyến, tua)
const RANGE_EXTS = new Set(['.mp4', '.webm', '.mp3', '.m4a', '.ogg', '.wav']);

// Không bao giờ phục vụ qua web: thư mục/file ẩn (.git, .env, .github...)
// và các file nhạy cảm của repo.
const BLOCKED_BASENAMES = new Set(['server.js', 'package.json', 'package-lock.json']);

// Trang dev, bản trùng và phòng chờ (prototype chưa qua cổng hoàn thiện):
// chỉ mở từ chính máy này (localhost) hoặc khi đặt VOKABELGO_DEV_PAGES=1.
// Người học truy cập từ xa nhận 404 như trang không tồn tại.
// Gỡ một trang khỏi danh sách này khi nó đã sẵn sàng ra mắt.
const DEV_ONLY_PATHS = new Set([
  '/CHOI-THU.html',                       // Đấu Từ bản thử 0.2, trùng dau-tu.html 0.6
  '/DMF German Flashcard Library.html',   // bản sao cũ của thư viện trong index.html
  '/kino_studio.html',                    // studio soạn phụ đề — công cụ sản xuất
  '/dau-tu-lexicon-review.html',          // workbench thẩm định — công cụ dev
  '/dau-tu-lexicon-review.js',
  '/dau-tu-lexicon-review.css',
  '/dau-tu-cards.html',                   // trang mẫu component lá bài (đã có gallery trong dau-tu)
  '/cat-island-boat-study.html',          // trang nghiên cứu thuyền/nước — công cụ dev
  '/cat-island-boat-study.js',
  '/cat-island-boat-study.css',
  '/kino_v2_template.html',
  '/kino_v3_html.html',
  '/wortturm.html',                       // phòng chờ: prototype, chờ tân trang vào hub Trò chơi
  '/wortcrush.html'                       // phòng chờ: prototype, chờ tân trang vào hub Trò chơi
]);

function devPagesAllowed(req) {
  return process.env.VOKABELGO_DEV_PAGES === '1' || isLoopback(req);
}

// Header bảo mật cho mọi phản hồi (kể cả API, 403, 404).
// CSP: cho phép đúng các nguồn app đang dùng (Firebase/gstatic, jsdelivr cho
// Supabase khi người dùng tự cấu hình, Google Fonts). iframe xác thực của
// Firebase (firebaseapp.com / accounts.google.com) được phép; popup đăng nhập
// Google cần COOP ở chế độ allow-popups.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.gstatic.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: data:",
    "connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.supabase.co wss://*.supabase.co https://cdn.jsdelivr.net https://www.gstatic.com",
    "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://*.web.app",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
};

// Các loại nội dung văn bản được nén gzip khi trình duyệt hỗ trợ.
const GZIP_TYPES = new Set([
  'text/html', 'text/css', 'text/javascript', 'application/javascript',
  'application/json', 'image/svg+xml', 'text/plain', 'text/vtt'
]);

function cacheControlFor(ext, contentType) {
  if (ext === '.html') return 'no-cache';
  if (RANGE_EXTS.has(ext)) return 'public, max-age=86400';
  return 'public, max-age=3600';
}

const MAX_API_BODY = 1024 * 1024; // 1 MB cho API lexicon

function isLoopback(req) {
  const addr = (req.socket && req.socket.remoteAddress) || '';
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

// API lexicon là công cụ dev: chỉ cho phép từ chính máy này (localhost),
// hoặc từ xa khi có token đặt qua biến môi trường LEXICON_API_TOKEN.
function lexiconAuthorized(req) {
  if (isLoopback(req)) return true;
  const token = process.env.LEXICON_API_TOKEN;
  return Boolean(token) && req.headers['x-lexicon-token'] === token;
}

function sendText(res, code, text) {
  if (!res.headersSent) {
    res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
  }
  res.end(text);
}

// Gửi file kèm xử lý lỗi stream: lỗi đọc file không bao giờ làm sập server.
function pipeFile(res, filePath, options) {
  const stream = fs.createReadStream(filePath, options);
  stream.on('error', (err) => {
    console.error('Loi doc file:', filePath, err.message);
    if (!res.headersSent) {
      sendText(res, 500, '500 Internal Server Error');
    } else {
      res.destroy();
    }
  });
  res.on('close', () => stream.destroy());
  stream.pipe(res);
}

// Phân tích header Range theo RFC 7233 (một khoảng duy nhất).
// Trả về: null = bỏ qua Range (gửi toàn bộ), 'invalid' = 416, {start, end} = khoảng đã clamp.
function parseRange(header, size) {
  if (!header || typeof header !== 'string') return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null; // Range lạ (kể cả multi-range): bỏ qua, gửi 200 toàn bộ
  const [, first, last] = m;
  if (first === '' && last === '') return null;
  if (size === 0) return 'invalid';
  let start;
  let end;
  if (first === '') {
    // Dạng hậu tố: bytes=-N  => N byte cuối
    const suffix = parseInt(last, 10);
    if (!Number.isFinite(suffix) || suffix <= 0) return 'invalid';
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = parseInt(first, 10);
    if (!Number.isFinite(start)) return null;
    if (start >= size) return 'invalid';
    end = last === '' ? size - 1 : Math.min(parseInt(last, 10), size - 1);
    if (!Number.isFinite(end) || end < start) return 'invalid';
  }
  return { start, end };
}

const requestHandler = (req, res) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(name, value);
  }
  let reqUrl;
  try {
    reqUrl = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    sendText(res, 400, '400 Bad Request');
    return;
  }
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
  if (reqUrl === '/preview/dau-tu-lexicon-review' || reqUrl === '/preview/dau-tu-lexicon-review/' || reqUrl === '/dau-tu-lexicon-review/' || reqUrl === '/dau-tu-lexicon-review/') {
    reqUrl = '/dau-tu-lexicon-review.html';
  }

  // Lexicon Review Dev API — chỉ localhost hoặc có token (xem lexiconAuthorized)
  if (reqUrl === '/api/lexicon/data') {
    if (!lexiconAuthorized(req)) {
      sendText(res, 403, '403 Forbidden');
      return;
    }
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

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ candidates, approved, runtime }));
    return;
  }

  if (reqUrl === '/api/lexicon/action' && req.method === 'POST') {
    if (!lexiconAuthorized(req)) {
      sendText(res, 403, '403 Forbidden');
      return;
    }
    let body = '';
    let bodySize = 0;
    let tooLarge = false;
    req.on('data', chunk => {
      bodySize += chunk.length;
      if (bodySize > MAX_API_BODY) {
        tooLarge = true;
        sendText(res, 413, '413 Payload Too Large');
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('error', () => {});
    req.on('end', () => {
      if (tooLarge) return;
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
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, stats: store.getDashboardStats() }));
      } catch (err) {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        }
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Cổng dev/phòng chờ: trang chưa ra mắt chỉ xem được từ localhost
  if (DEV_ONLY_PATHS.has(reqUrl) && !devPagesAllowed(req)) {
    sendText(res, 404, '404 Not Found');
    return;
  }

  // Chặn file/thư mục ẩn (.git, .env, .github...) và file nhạy cảm
  const segments = reqUrl.split('/').filter(Boolean);
  if (segments.some(seg => seg.startsWith('.')) || BLOCKED_BASENAMES.has(path.basename(reqUrl))) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  const filePath = path.resolve(__dirname, '.' + reqUrl);

  // An toàn đường dẫn: file phải nằm bên trong thư mục dự án
  if (filePath !== __dirname && !filePath.startsWith(__dirname + path.sep)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendText(res, 404, '404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
    const cacheControl = cacheControlFor(ext, contentType);

    // Hỗ trợ Range request cho Audio / Video
    if (req.headers.range && RANGE_EXTS.has(ext)) {
      const range = parseRange(req.headers.range, stats.size);
      if (range === 'invalid') {
        res.writeHead(416, {
          'Content-Range': `bytes */${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Type': contentType
        });
        res.end();
        return;
      }
      if (range) {
        res.writeHead(206, {
          'Content-Range': `bytes ${range.start}-${range.end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': range.end - range.start + 1,
          'Content-Type': contentType,
          'Cache-Control': cacheControl,
          'ETag': etag
        });
        pipeFile(res, filePath, { start: range.start, end: range.end });
        return;
      }
      // Range không hợp lệ cú pháp: bỏ qua, gửi toàn bộ file ở dưới
    }

    // Tài nguyên tĩnh không đổi: cho trình duyệt dùng bản cache khi ETag khớp
    const ifNoneMatch = req.headers['if-none-match'];
    const ifModifiedSince = req.headers['if-modified-since'];
    const etagMatches = ifNoneMatch && ifNoneMatch.split(',').map(v => v.trim().replace(/^W\//, '')).includes(etag.replace(/^W\//, ''));
    const freshByDate = !ifNoneMatch && ifModifiedSince && Math.floor(stats.mtimeMs / 1000) <= Math.floor(Date.parse(ifModifiedSince) / 1000);
    if (etagMatches || freshByDate) {
      res.writeHead(304, { 'ETag': etag, 'Cache-Control': cacheControl });
      res.end();
      return;
    }

    const baseHeaders = {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'ETag': etag,
      'Last-Modified': stats.mtime.toUTCString()
    };

    // Nén gzip cho nội dung văn bản (HTML/CSS/JS/JSON...) khi được hỗ trợ
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (stats.size >= 1024 && GZIP_TYPES.has(contentType.split(';')[0].trim()) && /\bgzip\b/.test(acceptEncoding)) {
      res.writeHead(200, {
        ...baseHeaders,
        'Content-Encoding': 'gzip',
        'Vary': 'Accept-Encoding'
      });
      const raw = fs.createReadStream(filePath);
      const gz = zlib.createGzip();
      raw.on('error', () => { if (!res.headersSent) sendText(res, 500, '500 Internal Server Error'); else res.destroy(); });
      gz.on('error', () => res.destroy());
      res.on('close', () => { raw.destroy(); gz.destroy(); });
      raw.pipe(gz).pipe(res);
      return;
    }

    res.writeHead(200, {
      ...baseHeaders,
      'Content-Length': stats.size
    });
    pipeFile(res, filePath);
  });
};

const server = http.createServer(requestHandler);

server.on('error', (err) => {
  console.error('Loi server cong', PORT + ':', err.message);
});

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
