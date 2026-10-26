// Vercel serverless function cho bản thử tra từ điển trong Kino.
// GET /api/dictionary?term=<từ Đức> — dùng chung logic với server local
// trong dictionary-server.js (Wiktionary; gloss dự phòng có nhãn nguồn).
const { lookup } = require('../dictionary-server');

module.exports = async (req, res) => {
  const term = (req.query && req.query.term) || '';
  try {
    const result = await lookup(term);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    res.status(err.status || 502).json({
      ok: false,
      error: err.status ? err.message : 'Chưa kết nối được Wiktionary. Kiểm tra mạng rồi thử lại.',
    });
  }
};
module.exports.config = { maxDuration: 60 };
