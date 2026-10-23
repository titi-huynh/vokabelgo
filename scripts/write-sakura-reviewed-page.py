"""Show the seven reviewed decisions and restored ending against the full video."""
from pathlib import Path
import json,html
root=Path(__file__).resolve().parents[1]
q=root/'qa/kino-alignment/sakura_s01e01'
reviews=json.loads((q/'seven-reviewed-lines.json').read_text(encoding='utf8'))
cs=json.loads((root/'sakura-s01e01-aligned.json').read_text(encoding='utf8'))['captions']
def card(c,review=False):
    return f'''<article class="{'reviewed' if review else 'restored'}"><button onclick="play({c['start']},{c['end']})">Nghe {c['start']:.2f}–{c['end']:.2f}</button><p lang="de">{html.escape(c['text'])}</p><p>{html.escape(c['vi'])}</p><small>{html.escape(c.get('decision','Đoạn được bổ sung từ bản video đầy đủ.'))}</small></article>'''
page='''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sakura tập 1 – 7 điểm đã rà và lời kết đầy đủ</title><style>body{font:18px/1.6 system-ui;max-width:900px;margin:auto;padding:24px;background:#fcf7f9;color:#392d38}video{width:100%;max-height:50vh;position:sticky;top:0;background:#111;z-index:1}article{background:white;padding:20px;margin:16px 0;border-radius:12px}button{font:inherit;cursor:pointer;padding:10px}small{color:#75546c}a{color:#68425f}</style><h1>Sakura tập 1: đã rà 7 điểm thoại</h1><p>Bản 25:00 có trọn giấc mơ đầu tập, Góc Kero và giới thiệu tập sau. Đối chiếu tại máy bằng hai mô hình nhận dạng, các cửa sổ độc lập và từ điển. Hai câu chào cách điệu có trong phụ đề xem, không chấm chính tả Đức.</p><p><a href="../../../?kino=sakura">Mở bài học 8 phần</a> · <a href="https://www.duden.de/rechtschreibung/langaermlig">Duden: langärmlig</a> · <a href="https://www.duden.de/rechtschreibung/kurzaermelig">Duden: kurzärmelig</a></p><video id="v" controls preload="metadata" src="../../../video/sakura_s01e01.mp4?v=2"></video><h2 id="ending">Lời kết Góc Kero đã khôi phục</h2><button onclick="play(1458.3,1469.34)">▶ Nghe trọn lời kết và câu chào tạm biệt</button>'''
page+=''.join(card(c) for c in cs if 804017<=c['id']<=804020)
page+='<h2>Bảy điểm đã đối chiếu</h2>'+''.join(card(c,True) for c in reviews)
page+='''<script>let end=0;const v=document.getElementById('v');function play(a,b){end=b;v.currentTime=a;v.play()}v.ontimeupdate=()=>{if(end&&v.currentTime>=end){v.pause();end=0}}</script></html>'''
(q/'review-needed.html').write_text(page,encoding='utf8')
