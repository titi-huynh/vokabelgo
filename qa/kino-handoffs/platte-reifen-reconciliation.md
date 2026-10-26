# Giải trình số cue: Platte Reifen và Luftgehen

Nhánh gốc: main tại ab589604ed8348ee626fe8758c32272ed7664364. Nội dung được chụp nguyên trạng từ bản local đã nghiệm thu. Không biên tập thêm trong lượt đẩy.

## erdmaennchen_platte_reifen

241 cue Muse − 18 cue bị loại = 223 cue phát hành. 7 phần, 36 picks, 22 thẻ. **Không gộp, không tách, không thêm ID mới.**

| Cue ID | Mốc bản Muse | Câu bản Muse | Lý do loại đã ghi lúc nghiệm thu |
|---|---|---|---|
| 3200030 | 01:56.99–01:59.45 | Ich krieg doch schon so schnell ich kann in die Pedale. | reviewNeeded cue #1: Verb 'krieg' has low confidence across models (medium p=0.815, small p=0.512, base p=0.466; base drops 'schon') and is likely a misrecognition of 'tret(e)' ('in die Pedale treten'). Excluded from runtime without grammatical guessing. |
| 3200033 | 02:02.85–02:05.15 | Wir wollen zum Badesee. | Unverified ASR word: 'wollen' has p=0.008 in medium and p=0.016 in small while base transcribes 'Wir haben da alle!' over overlapping hamster voices rushing past in frame cue_3200033_124_0.jpg. Excluded from runtime. |
| 3200039 | 02:22.67–02:25.71 | Weil kann es nicht sein. Ich bin schon nass geworden. | reviewNeeded cue #2: Initial word 'Weil' has p=0.126 in medium and p=0.264 in small, while base outputs 'Weil kannst du dich sein!'. Excluded from runtime without guessing 'Weit'. |
| 3200091 | 05:05.28–05:06.90 | Ich schreibe einen Straf. | reviewNeeded cue #3: Final noun is truncated/disagreed across all 3 models (medium: 'Straf.' p=0.847, small: 'Straftat.' p=0.830, base: 'Strafzett!' p=0.679). Excluded from runtime. |
| 3200116 | 06:36.31–06:38.53 | Die Reifen in Ihrem Auto sind auch platt. | Flagged pick in Part 3 ('Die Reifen in Ihrem Auto sind auch platt.'): Initial 'Die' has p=0.248 in medium while small (p=0.122) and base (p=0.153) prefix 'Na, die', and all 3 models transcribe 'in Ihrem Auto' instead of standard 'an Ihrem Auto'. Excluded from runtime and Part 3 picks rather than grammatically rewriting. |
| 3200124 | 06:54.58–06:56.20 | Für jeden Plattenreifen ein. | Flagged cue ('Für jeden Plattenreifen ein.'): Colloquial reduction of 'Für jeden platten Reifen einen' with 'ein' at p=0.676 (medium), p=0.699 (small), p=0.540 (base). Excluded from runtime rather than grammatically rewriting. |
| 3200134 | 07:17.52–07:21.16 | Der Igel hat so scharfe und spitze Stachel. | Flagged pick in Part 4 ('Der Igel hat so scharfe und spitze Stachel.'): Medium omits 'doch' ('so' p=0.218) whereas both small (p=0.966) and base (p=0.922) transcribe 'hat doch so', and the plural noun is transcribed as singular 'Stachel.' (medium/small) or 'Stache.' (base) instead of 'Stacheln'. Excluded from runtime and Part 4 picks. |
| 3200161 | 08:24.25–08:26.59 | Jetzt kann ich niemanden mehr piekeln. | Flagged cue ('Jetzt kann ich niemanden mehr piekeln.'): ASR models disagree between 'piekeln' (medium p=0.781, small p=0.599 with 'Jetzt' p=0.412) and 'pieken' (base p=0.663). Excluded from runtime. |
| 3200186 | 09:29.64–09:30.84 | Ich zeig's Ihnen. | Flagged pick in Part 5 ('Ich zeig\'s Ihnen.'): Video frame cue_3200186_570_2.jpg shows the two hamsters turning to each other (not addressing Jan & Henry with formal Sie, as they use 'ihr' in 3200175 and 3200187), and all 3 ASR models disagree with low probability (medium: 'Ich zeig\'s Ihnen.' with 'Ich' p=0.237; small: 'Zeig sie den.' with 'den.' p=0.237; base: 'Zeig sie dir!' with 'dir!' p=0.226). Excluded from runtime and Part 5 picks. |
| 3200212 | 10:54.70–10:56.96 | Damit geht ihr gleich baden. | Flagged pick in Part 6 ('Damit geht ihr gleich baden.'): Video frame cue_3200212_655_8.jpg shows the Hamster speaking (about literally going bathing in the lake right away), not Jan & Henry, and all 3 ASR models disagree with very low probability (medium: 'geht' p=0.080; small: 'Damit ihr gleich badet!' with 'Damit' p=0.141; base: 'Da bin ich nicht gleich paddend!' with 'bin' p=0.159). Excluded from runtime and Part 6 picks. |
| 3200214 | 11:06.42–11:09.42 | Kann mit der Luftpumpe lustige Blasen machen. | reviewNeeded cue #4: Missing subject in medium ('Kann' p=0.602) while small transcribes 'ich kann' and base transcribes 'Ich kann mit der Luft voll lustigen Blasen machen!'. Excluded from runtime. |
| 3200220 | 11:34.50–11:37.38 | Wir waren mit dem Igel und den Hamster am See. | Unverified dative plural inflection ('Wir waren mit dem Igel und den Hamster am See.'): 'Hamster' has p=0.491 in medium and lacks the required dative plural '-n' ('den Hamstern'). Excluded from runtime rather than grammatically rewriting. |
| 3200227 | 11:48.82–11:49.30 | Nein. | Low-confidence utterance ('Nein.' at 708.82-709.30): 'Nein.' has p=0.219 in medium and p=0.313 in small while base transcribes 'Äh, nein...' across 708.00-709.76. Excluded from runtime. |
| 3200228 | 11:49.82–11:50.54 | Dann war es ihr. | 6th uncertain item ('Dann war es ihr.' at 709.82-710.54): All 3 ASR models disagree with low confidence (medium: 'Dann war es ihr.' p=0.557; small: 'Dann wart ihr\'s!' p=0.531/0.475; base: 'Dann war dir\'s?' p=0.645/0.448). Frame cue_3200228_710_1.jpg shows the Kommissar pointing at Jan & Henry ('ihr' = các cậu), not 'bọn họ'. Excluded from runtime without guessing the German verb/pronoun. |
| 3200237 | 12:03.60–12:09.12 | Ja, das würde ich auch gerne tun, aber mit den platten Reifen und der vollen Scheibe ist das etwas schwierig. | reviewNeeded cue #5: Models disagree on 'mit den platten Reifen' (medium p=0.577) vs 'mit dem Plattenreifen' (small p=0.509) vs 'mit dem Platten reifen' (base), with 'ist' at p=0.392 in medium and 'Das' at p=0.143 in base. Excluded from runtime. |
| 3200239 | 12:18.82–12:20.10 | Ja, lustig. | Closing-credits utterance over music (738.82-740.10): 'Ja,' has p=0.247 in medium while small and base reverse the word order ('lustig. Ja!'). Excluded from runtime. |
| 3200240 | 12:20.84–12:23.38 | Ja, ja, schneller. | Closing-credits utterance over music (740.84-743.38): 'ja,' has p=0.029 in small and 'schneller' has p=0.393 in medium / p=0.145 in base. Excluded from runtime. |
| 3200241 | 12:26.38–12:29.02 | Herr Kommissar, wir haben das andere Fahrrad vergessen. | Closing-credits utterance over music (746.38-749.02): 'Herr' has p=0.053 and 'andere' has p=0.431 in medium, completely missed by small and garbled as 'Verkommelt\'s ab, wir haben jetzt unsere Mehrheit vergesst!' by base. Excluded from runtime. |

Đối chiếu: `qa/kino-alignment/erdmaennchen_platte_reifen/changelog.json`, `muse-lesson.json`, `reviewed-lesson.json`, `codex-acceptance.json`. Các sửa người nói/bản dịch/mốc/chương/thẻ đã có trong changelog không phải gộp/tách cue và không làm thay đổi phép tính trên.

## erdmaennchen_luftgehen

182 cue Muse − 3 cue bị loại = 179 cue phát hành. 7 phần, 40 picks, 21 thẻ. **Không gộp, không tách, không thêm ID mới.**

| Cue ID | Mốc bản Muse | Câu bản Muse | Lý do loại đã ghi lúc nghiệm thu |
|---|---|---|---|
| 3100055 | 03:16.60–03:20.16 | Und Taterchen hat mir diese wunderschönen Ballons geschenkt. | Proper name 'Taterchen' has low ASR confidence and disagrees across all 3 models: medium='Taterchen' (p=0.639), small='Carterchen' (p=0.484), base='Katarchen' (p=0.560). |
| 3100067 | 04:01.29–04:03.91 | Behaltet ihr hier mal alles im Auge. | All three ASR models disagree on a low-confidence word between 'ihr' and 'hier' (zwar/zwei). Omitting that word for grammatical convenience does not establish the exact spoken answer. Exclude the cue, its focus pick and its vocabulary card. |
| 3100182 | 11:20.65–11:21.79 | Alles so klein. | Closing-music utterance at 677.68-681.79 has first word 'Alles' at 677.68-679.50 with p=0.022 in medium and p=0.105 in base; cue span 680.65-681.79 only covers 'so klein.'. |

Đối chiếu: `qa/kino-alignment/erdmaennchen_luftgehen/changelog.json`, `muse-lesson.json`, `reviewed-lesson.json`, `codex-acceptance.json`. Các sửa người nói/bản dịch/mốc/chương/thẻ đã có trong changelog không phải gộp/tách cue và không làm thay đổi phép tính trên.

Các cue bị loại giữ trong hồ sơ QA và bản Muse, không đưa vào mảng cue phát hành, picks hoặc flashcards. Hai video nguồn được đưa lên Git LFS nguyên byte; không tải lên kho media khác, không deploy.
