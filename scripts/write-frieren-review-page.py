"""A small local review page for the five explicitly uncertain practice units."""
import html
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
folder = root/'qa/kino-alignment/frieren_s01e01'
units = json.loads((root/'frieren-s01e01-aligned.json').read_text(encoding='utf-8'))
reasons = {
    700225: (4, 'Câu xoa đầu được khôi phục theo âm gần đúng và ngữ cảnh; cần nghe lại từng chữ.'),
    700257: (5, 'Tiếng người dự tang lễ nói nhanh; từ xưng hô và động từ chưa chắc hoàn toàn.'),
    700341: (7, 'Hai lượt nhận diện cho hai cấu trúc khác nhau ở câu nói về sự bất tử.'),
    700372: (7, 'Câu hỏi ở đoạn giới thiệu cuối tập được khôi phục theo âm và ngữ cảnh.'),
    700373: (7, 'Bản nhận diện và chữ hiện trên hình khác nhau ở cụm nói về điều đáng tiếc.'),
}
cards = []
for unit in units:
    if unit['id'] not in reasons:
        continue
    part, reason = reasons[unit['id']]
    start, end = max(0, unit['start']-.25), unit['end']+.35
    minutes, seconds = divmod(unit['start'],60)
    cards.append(f'''<article><p class="meta">PHẦN {part} · {int(minutes):02}:{seconds:04.1f} · Câu {unit['id']}</p>
<h2 lang="de">{html.escape(unit['text'])}</h2><p>{html.escape(unit['vi'])}</p>
<p class="note">{reason}</p><button data-start="{start}" data-end="{end}">▶ Nghe đoạn gốc</button>
<a href="/?kino=frieren&amp;part={part}">Mở phần học →</a></article>''')
document = '''<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Frieren tập 1 · Những câu cần rà lời</title><style>
*{box-sizing:border-box}body{margin:0;background:#f7f7f2;color:#253826;font:16px/1.6 system-ui,sans-serif}main{max-width:900px;margin:35px auto;padding:0 22px}h1{line-height:1.2}h2{font-size:21px}.intro{max-width:760px}.player{position:sticky;top:10px;background:#edf1e8;padding:16px;border:1px solid #d4decd;border-radius:14px;z-index:1}video{display:block;width:100%;max-height:290px;background:#101710;border-radius:8px}article{background:white;border:1px solid #dce2d6;border-radius:14px;padding:24px;margin:18px 0}.meta{font-size:12px;letter-spacing:.08em;color:#64725c}.note{color:#725d2e}button,a{font:inherit}button{border:0;border-radius:7px;background:#536c42;color:white;padding:10px 16px;cursor:pointer}a{color:#456033;margin-left:15px}label{display:inline-block;margin-top:10px}select{font:inherit}footer{font-size:14px;color:#687261;margin:30px 0}
</style><main><a href="/?kino=frieren">← Bài học Frieren tập 1</a><h1>5 câu cần rà lại lời</h1>
<p class="intro">Đây là các câu còn khác nhau giữa những lượt nhận diện. Bản ghi hiện dùng là bản tạm; cần nghe đối chiếu trước khi coi là đáp án chắc chắn từng chữ. Chữ tiếng Đức hiện trên hình có thể khác lời lồng tiếng.</p>
<div class="player"><video id="source" controls preload="metadata" src="/video/frieren_s01e01.mp4"></video><label>Tốc độ nghe <select id="speed"><option value="1">1×</option><option value="0.75">0,75×</option><option value="0.5">0,5×</option></select></label><span id="status" aria-live="polite"></span></div>
''' + '\n'.join(cards) + '''<footer>Trang rà nội dung trên máy chị. Các ghi chú này giữ riêng với tiến độ học.</footer></main><script>
const video=document.getElementById('source');let stopAt=null;
document.querySelectorAll('[data-start]').forEach(button=>button.onclick=async()=>{video.pause();video.currentTime=Number(button.dataset.start);stopAt=Number(button.dataset.end);try{await video.play();document.getElementById('status').textContent=' · Đang nghe đoạn gốc';}catch(error){document.getElementById('status').textContent=' · Bấm nút phát trên video để nghe';}});
video.ontimeupdate=()=>{if(stopAt!==null&&video.currentTime>=stopAt){video.pause();stopAt=null;document.getElementById('status').textContent=' · Đã hết câu';}};
document.getElementById('speed').onchange=event=>{video.playbackRate=Number(event.target.value);};
</script></html>'''
(folder/'codex-review-needed.html').write_text(document, encoding='utf-8')
print(f'Wrote {len(cards)} review cards')
