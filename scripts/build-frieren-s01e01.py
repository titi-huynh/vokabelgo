"""Build the complete reviewed Frieren S01E01 bilingual script, VTTs, and runtime cues.

Cross-checks local medium word timestamps (`recognized-words.json`) with independent
small auto-language windows (`independent-small-summary.tsv`, `focused-small-review.json`)
and targeted medium windows (`focused-medium-review.json`, `focused-medium-late-review.json`,
`focused-medium-preview-review.json`). Excludes Japanese OP/ED sung lyrics and stock
ZDF/WDR hallucinations while preserving all spoken German dialogue, narration, short
exclamations, and post-credits preview speech through 1559.986009s.
"""
import csv
import hashlib
import json
import pathlib
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "qa/kino-alignment/frieren_s01e01"
duration = 1559.986009

def tokens(text):
    return re.findall(r"[\w]+", text.lower().replace("ß", "ss"), flags=re.UNICODE)

# Complete reviewed caption cues: (start, end, speaker, de, vi, review_note, group_with_prev)
RAW_CUES = [
    # Part 1: 0.0 - 274.5 (Khải hoàn trở về kinh đô)
    (123.58, 124.06, "Himmel", "Frieren?", "Frieren?", "", False),
    (128.74, 130.16, "Himmel", "Seht mal, da ist die Hauptstadt.", "Nhìn kìa, kinh đô ở đằng kia rồi.", "", False),
    (130.66, 133.42, "Heiter", "Wir sind die Heldentruppe auf ihrer triumphalen Heimkehr.", "Chúng ta là nhóm anh hùng trên đường khải hoàn trở về.", "", False),
    (133.58, 135.32, "Heiter", "Es wird sicher eine große Feier geben.", "Chắc chắn sẽ có một bữa tiệc lớn.", "Primary medium heard 'sich'; focused-medium-review confirmed 'sicher' (prob 0.91).", False),
    (137.98, 140.20, "Eisen", "Wenn wir zurück sind, muss ich mir eine Arbeit suchen.", "Khi chúng ta trở về, tôi phải tìm một công việc.", "", False),
    (140.98, 143.16, "Himmel", "Du denkst bereits jetzt über solche Sachen nach?", "Cậu đã nghĩ đến mấy chuyện như vậy ngay từ bây giờ rồi sao?", "", False),
    (143.64, 144.82, "Eisen", "Weil es wichtig ist.", "Vì chuyện đó quan trọng mà.", "", False),
    (145.12, 147.92, "Eisen", "Wir haben zwar den Dämonenkönig geschlagen, doch es geht weiter.", "Tuy chúng ta đã đánh bại Ma Vương, nhưng cuộc sống vẫn tiếp diễn.", "", False),
    (148.64, 150.92, "Eisen", "Wir haben noch ein langes Leben vor uns.", "Chúng ta vẫn còn cả một cuộc đời dài phía trước.", "", False),
    (152.54, 153.10, "Heiter", "Arbeit also.", "Công việc à.", "", False),
    (153.86, 156.14, "Heiter", "Also ich würde gerne während der Arbeit trinken können.", "Vậy thì tôi muốn có thể vừa làm việc vừa uống rượu.", "", False),
    (156.34, 157.74, "Eisen", "Aber du bist doch ein Kleriker.", "Nhưng cậu là một giáo sĩ cơ mà.", "", False),
    (160.24, 161.92, "Frieren", "Ein Leben nach den Abenteuern.", "Một cuộc sống sau những chuyến phiêu lưu.", "", False),
    (164.36, 164.80, "Himmel", "Frieren.", "Frieren.", "", False),
    (165.74, 171.52, "Himmel", "Der Rest deines Lebens wird sicher sehr viel länger sein, als wir Menschen es uns jemals ausmalen könnten.", "Phần đời còn lại của cậu chắc chắn sẽ dài hơn rất nhiều so với những gì loài người chúng tớ có thể hình dung.", "", False),
    (172.48, 172.92, "Frieren", "Ja, wahrscheinlich.", "Ừ, có lẽ vậy.", "", False),
    (210.88, 217.92, "König", "Himmel der Held, Eisen der Krieger, Heiter der Kleriker und Frieren die Magierin.", "Anh hùng Himmel, chiến binh Eisen, giáo sĩ Heiter và pháp sư Frieren.", "Corrected ASR proper noun 'Heisen' -> 'Eisen' and 'Kläriker' -> 'Kleriker' (supported by focused-medium and small pass).", False),
    (219.50, 223.98, "König", "Ich danke euch, dass ihr auf eurer Reise den Dämonenkönig besiegt habt.", "Ta cảm ơn các ngươi vì đã đánh bại Ma Vương trong chuyến hành trình của mình.", "", False),
    (224.38, 228.06, "König", "Damit wird auf der Welt ein Zeitalter des Friedens anbrechen.", "Nhờ đó, một kỷ nguyên hòa bình sẽ mở ra trên thế giới.", "", False),
    (242.86, 246.94, "Heiter", "Der König will angeblich Statuen von uns auf dem großen Platz aufstellen.", "Nghe nói nhà vua muốn dựng tượng của chúng ta ở quảng trường lớn.", "", False),
    (247.94, 251.98, "Himmel", "Na ja, obwohl ich mir schlecht vorstellen kann, dass sie mein einzigartiges, edles", "Chà, dù tớ khó mà tưởng tượng được rằng họ có thể khắc họa thật chuẩn", "Primary ASR heard 'idles'; focused-medium confirmed 'edles' (prob 0.93).", False),
    (251.98, 254.10, "Himmel", "Antlitz richtig gut nachbilden können.", "dung mạo cao quý độc nhất vô nhị của tớ.", "Primary ASR heard 'Ansitz', focused-medium heard 'Anlitz'; standardized to 'Antlitz'.", True),
    (255.26, 256.72, "Frieren", "Wie großzügig von ihm.", "Ông ấy hào phóng thật đấy.", "", False),
    (257.02, 260.26, "Frieren", "Er hatte uns nur 10 Kupfermünzen gegeben, als wir aufgebrochen sind.", "Ông ấy chỉ cho chúng ta đúng 10 đồng xu đồng khi chúng ta lên đường.", "", False),
    (261.76, 263.70, "Himmel", "Ach, jetzt komm schon, Frieren.", "Thôi nào, Frieren.", "", False),
    (264.22, 266.60, "Himmel", "Heute Abend trinken wir so viel wir wollen.", "Tối nay chúng ta cứ uống thỏa thích.", "", False),
    (266.80, 268.50, "Himmel", "Mehr brauchen wir doch nicht, oder?", "Chúng ta đâu cần gì hơn thế, đúng không?", "Primary medium attached 'Mehr' to end of prior segment and inserted low-confidence 'Das' (0.14); independent small window 240 confirmed 'Mehr brauchen wir doch nicht, oder?'.", False),
    (269.28, 270.72, "Frieren", "Oh, du Scheinheiliger!", "Ồ, đồ đạo đức giả!", "", False),

    # Part 2: 274.5 - 440.0 (Đêm tiệc chia tay và mưa sao băng)
    (278.34, 280.40, "Himmel", "Es ist tatsächlich vorbei.", "Thực sự kết thúc rồi.", "", False),
    (281.20, 282.18, "Heiter", "So ist es.", "Đúng vậy.", "", False),
    (283.28, 285.42, "Eisen", "Das ist nun das Ende unserer Reise.", "Đây là điểm kết thúc chuyến hành trình của chúng ta.", "", False),
    (286.44, 288.02, "Himmel", "Das waren zehn Jahre, oder?", "Vậy là đã mười năm rồi nhỉ?", "", False),
    (288.70, 290.88, "Heiter", "Es ist so viel passiert in dieser Zeit.", "Đã có biết bao chuyện xảy ra trong khoảng thời gian đó.", "", False),
    (292.32, 294.26, "Frieren", "An dem Tag unserer Abreise", "Vào ngày chúng tôi khởi hành,", "", False),
    (294.26, 299.02, "Frieren", "wurden Himmel und Eisen fast hingerichtet, weil sie unverschämt zum König waren.", "Himmel và Eisen suýt nữa bị xử tử vì ăn nói vô lễ với nhà vua.", "Restored capitalization and sentence boundary across unpunctuated medium segments 51-53.", True),
    (299.02, 302.10, "Frieren", "Ein Fehler, und das wäre das Ende unserer Reise gewesen.", "Chỉ một sai lầm thôi là chuyến hành trình của chúng tôi đã kết thúc ngay tại đó.", "", False),
    (302.84, 306.22, "Frieren", "Und Heiter war manchmal so besoffen, dass er zu nichts nutze war.", "Còn Heiter thì đôi khi say xỉn đến mức chẳng làm được tích sự gì.", "Primary medium heard 'zunächst nutze'; independent small and focused-small confirmed 'zu nichts nutze'.", False),
    (310.46, 313.46, "Himmel", "Du siehst ja aus wie eine wandelnde Leiche.", "Trông cậu cứ như một cái xác biết đi vậy.", "", False),
    (313.46, 314.44, "Himmel", "Alles okay bei dir?", "Cậu có ổn không đấy?", "", False),
    (314.80, 315.02, "Heiter", "Nein.", "Không.", "Short reply omitted by primary medium pass; independently confirmed by small window 300 (prob 0.90) and focused-small-review (prob 0.82).", False),
    (315.10, 316.78, "Eisen", "Woran kann das nur liegen?", "Rốt cuộc là tại sao chứ?", "", False),
    (316.78, 319.72, "Frieren", "Das kam einmal die Woche vor.", "Chuyện đó xảy ra mỗi tuần một lần.", "", False),
    (319.72, 321.84, "Frieren", "Ich hingegen war immer vorbildlich.", "Ngược lại, tôi thì lúc nào cũng gương mẫu.", "", False),
    (321.84, 325.70, "Himmel", "Wir haben drüber nachgedacht, dich zurückzulassen, als die Mimik dich fressen wollte.", "Bọn tớ đã nghĩ đến chuyện bỏ cậu lại khi con Mimik định nuốt chửng cậu đấy.", "Primary medium split 'zurückzulassen' as 'zur / zu lassen' and wrote 'Memek'; independent small confirmed 'zurückzulassen' (0.97), monster name standardized to 'Mimik'.", False),
    (325.96, 328.48, "Heiter", "Oh Mann, wir haben ihr doch gesagt, dass das eine Falle sein kann.", "Trời đất, chúng ta đã bảo cô ấy đó có thể là bẫy rồi mà.", "", False),
    (328.60, 330.20, "Eisen", "Lassen wir die Elfe doch zurück.", "Hay là cứ bỏ cô nàng tinh linh này lại đi.", "Primary medium heard 'Elfen', focused-small heard singular 'Elfe' (referring to Frieren).", False),
    (334.54, 338.72, "Himmel", "Wir haben 'ne Menge von diesen echt schrecklichen Erinnerungen.", "Chúng ta có cả đống những kỷ niệm thật sự kinh khủng như thế.", "", False),
    (339.84, 341.24, "Himmel", "Aber ich hatte Spaß.", "Nhưng tớ đã rất vui.", "", False),
    (342.00, 344.94, "Himmel", "Und ich bin froh, dass ich diese Abenteuer mit euch erleben konnte.", "Và tớ rất mừng vì đã có thể cùng mọi người trải qua những chuyến phiêu lưu này.", "", False),
    (345.92, 347.12, "Frieren", "Das geht mir genauso.", "Tôi cũng thấy vậy.", "", False),
    (347.80, 349.60, "Frieren", "Auch wenn es nur für eine kurze Zeit war.", "Dù đó chỉ là một khoảng thời gian ngắn ngủi.", "", False),
    (350.38, 351.44, "Heiter", "Äh, wie war das?", "Hả, cậu vừa nói sao cơ?", "", False),
    (351.68, 352.90, "Eisen", "Was redest du denn da?", "Cậu đang nói cái gì thế?", "", False),
    (352.90, 354.20, "Eisen", "Das waren zehn Jahre.", "Đó là mười năm trời đấy.", "", False),
    (354.56, 357.96, "Eisen", "Schau dir Heiter an, er ist inzwischen ein grauer alter Mann geworden.", "Nhìn Heiter mà xem, giờ cậu ta đã thành một ông già tóc bạc rồi.", "Corrected ASR 'Heide' -> 'Heiter'.", False),
    (358.04, 359.20, "Heiter", "Das ist nicht sehr nett.", "Nói thế chẳng tử tế chút nào.", "", False),
    (359.70, 361.00, "Frieren", "Das war er doch schon vorher.", "Trước đó anh ta vốn đã vậy rồi mà.", "", False),
    (361.30, 362.72, "Heiter", "Das ist auch nicht nett.", "Câu đó cũng chẳng tử tế đâu.", "", False),
    (369.66, 371.08, "Himmel", "Ist es nun bald so weit?", "Sắp đến lúc rồi nhỉ?", "", False),
    (379.18, 381.84, "Himmel", "Das ist der Ära-Meteorschauer. Stimmt doch?", "Đó là trận mưa sao băng Thời Đại. Đúng không?", "Corrected ASR 'Ehre, Meteorschauer' -> 'Ära-Meteorschauer'.", False),
    (382.52, 385.58, "Heiter", "Diese Meteore sieht man nur einmal alle 50 Jahre.", "Những ngôi sao băng này cứ 50 năm mới nhìn thấy được một lần.", "", False),
    (386.66, 390.00, "Eisen", "Der perfekte Moment, um in eine Ära des Friedens überzugehen.", "Khoảnh khắc hoàn hảo để bước sang một kỷ nguyên hòa bình.", "Corrected ASR 'Ehre des Friedens' -> 'Ära des Friedens'.", False),
    (392.76, 393.52, "Frieren", "Wie schön.", "Đẹp quá.", "", False),
    (394.48, 396.50, "Frieren", "Hier in der Stadt sieht man sie aber nicht so gut.", "Nhưng ở trong thành phố thế này thì nhìn không rõ lắm.", "", False),
    (396.70, 399.22, "Himmel", "Nimm mal Rücksicht, ich versuch das gerade zu genießen.", "Tâm lý một chút đi, tớ đang cố tận hưởng khoảnh khắc này đấy.", "Primary medium heard colloquial 'Nehm', independent small heard 'Nimm'.", False),
    (402.06, 403.36, "Frieren", "Dann halt nächstes Mal.", "Vậy thì để lần sau vậy.", "", False),
    (404.98, 408.02, "Frieren", "Ich kenne einen Platz, wo man sie noch viel klarer sehen kann.", "Tôi biết một nơi có thể ngắm chúng rõ hơn nhiều.", "", False),
    (408.18, 409.42, "Frieren", "Zeig ich euch dann in 50 Jahren.", "50 năm nữa tôi sẽ dẫn mọi người tới đó.", "", False),
    (412.94, 413.90, "Frieren", "Was denn?", "Sao thế?", "", False),
    (413.94, 415.46, "Himmel", "Ach, es ist nichts.", "À, không có gì đâu.", "", False),
    (416.28, 416.80, "Himmel", "Frieren.", "Frieren.", "", False),
    (418.60, 419.88, "Himmel", "So machen wir das.", "Cứ quyết định vậy nhé.", "", False),
    (420.46, 421.72, "Himmel", "Wir werden sie uns ansehen.", "Chúng ta sẽ cùng nhau ngắm chúng.", "", False),

    # Part 3: 440.0 - 680.0 (Năm mươi năm trôi qua và cuộc hội ngộ với Himmel)
    (444.32, 446.34, "Frieren", "Also, ich muss jetzt gehen.", "Vậy, giờ tôi phải đi đây.", "", False),
    (446.82, 448.48, "Himmel", "Was hast du denn von nun an vor?", "Từ giờ trở đi cậu định làm gì?", "", False),
    (448.88, 451.10, "Frieren", "Ich möchte weitere Zaubersprüche erlernen.", "Tôi muốn học thêm các phép thuật khác.", "", False),
    (451.40, 454.50, "Frieren", "Dafür werde ich die nächsten 100 Jahre die zentralen Länder bereisen.", "Để làm việc đó, tôi sẽ đi khắp các vùng đất trung tâm trong 100 năm tới.", "", False),
    (455.10, 457.08, "Frieren", "Aber ich werde ab und zu mal vorbeischauen.", "Nhưng thỉnh thoảng tôi sẽ ghé thăm mọi người.", "", False),
    (462.32, 464.90, "Eisen", "Die Welt der Elfen ist wirklich schwer zu verstehen.", "Thế giới của tộc tinh linh thật sự khó mà hiểu nổi.", "", False),
    (465.08, 467.84, "Heiter", "Würde mich echt mal interessieren, wie lange sie schon lebt.", "Tôi thực sự tò mò không biết cô ấy đã sống bao lâu rồi.", "", False),
    (468.60, 472.80, "Himmel", "Selbst fünfzig oder hundert Jahre sind für sie wohl nur wie ein kurzer Augenblick.", "Ngay cả năm mươi hay một trăm năm đối với cậu ấy chắc cũng chỉ như một thoáng chốc.", "", False),
    (523.82, 526.22, "Händler", "Das Horn eines Schattendrachen?", "Sừng của rồng bóng tối sao?", "", False),
    (526.46, 527.20, "Händler", "Tut mir leid.", "Tôi rất tiếc.", "", False),
    (527.20, 528.74, "Händler", "So etwas habe ich hier nicht.", "Ở đây tôi không có thứ như vậy.", "", False),
    (529.06, 532.58, "Händler", "Ich habe auch seit ungefähr 30 Jahren keinen Schattendrachen mehr gesehen.", "Khoảng 30 năm nay tôi cũng không còn thấy con rồng bóng tối nào nữa.", "ASR heard 'kein Schattendrachen', normalized to accusative 'keinen Schattendrachen'.", False),
    (533.26, 535.00, "Frieren", "Verstehe, das ist nicht gut.", "Ra vậy, thế thì gay rồi.", "", False),
    (535.22, 536.86, "Frieren", "Ich brauche eines für eine Beschwörung.", "Tôi cần một chiếc để thực hiện phép triệu hồi.", "", False),
    (539.82, 542.70, "Frieren", "Wir hatten doch eines im Schloss des Dämonenkönigs gefunden.", "Chẳng phải chúng tôi đã tìm thấy một chiếc trong lâu đài Ma Vương sao.", "", False),
    (543.24, 544.86, "Frieren", "Ich glaube, ich habe es Himmel gegeben.", "Hình như tôi đã đưa nó cho Himmel.", "", False),
    (545.70, 548.44, "Frieren", "Es verströmt irgendwie eine negative Aura.", "Nó tỏa ra một luồng khí tiêu cực nào đó.", "", False),
    (548.48, 550.56, "Frieren", "Ist das wirklich nicht gefährlich für Menschen?", "Thứ này thực sự không nguy hiểm cho con người chứ?", "", False),
    (550.94, 551.88, "Frieren", "Das weiß ich nicht.", "Tôi không biết nữa.", "", False),
    (552.20, 553.64, "Himmel", "Sie weiß es also nicht.", "Vậy là cậu ấy cũng không biết.", "", False),
    (554.68, 556.88, "Frieren", "Bald kommt wieder der Ära-Meteorschauer.", "Sắp tới lại có mưa sao băng Thời Đại rồi.", "", False),
    (557.02, 558.64, "Frieren", "Vielleicht sollte ich das Horn bei ihm abholen.", "Có lẽ tôi nên đến chỗ anh ấy lấy lại chiếc sừng.", "", False),
    (565.20, 568.00, "Frieren", "Die Stadt hat sich seit dem letzten Mal ganz schön verändert.", "Thành phố đã thay đổi khá nhiều kể từ lần trước.", "", False),
    (582.28, 584.66, "Frieren", "Sag mal, hab ich mich etwa verlaufen?", "Này, chẳng lẽ mình bị lạc rồi sao?", "", False),
    (585.90, 586.46, "Himmel", "Frieren?", "Frieren?", "", False),
    (587.88, 588.72, "Frieren", "Himmel!", "Himmel!", "", False),
    (594.92, 596.70, "Frieren", "Du bist alt geworden.", "Cậu già đi rồi.", "", False),
    (596.70, 598.58, "Himmel", "Kannst du das nicht netter sagen?", "Cậu không thể nói nhẹ nhàng hơn được sao?", "", False),
    (600.96, 604.54, "Himmel", "Auch im hohen Alter bin ich doch noch ein ganz hübsches Kerlchen.", "Dù đã cao tuổi nhưng tớ vẫn là một ông lão khá bảnh bao đấy chứ.", "", False),
    (606.10, 610.68, "Himmel", "Es ist schon 50 Jahre her, du siehst noch genauso aus wie damals.", "Đã 50 năm trôi qua rồi mà trông cậu vẫn y hệt như ngày ấy.", "", False),
    (611.82, 615.20, "Himmel", "Ich hab schon befürchtet, dass ich dich nie mehr wiedersehen würde.", "Tớ đã lo rằng mình sẽ chẳng bao giờ còn được gặp lại cậu nữa.", "", False),
    (617.72, 621.36, "Himmel", "Der Ära-Meteorschauer, das weckt Erinnerungen.", "Mưa sao băng Thời Đại, điều đó gợi lại bao kỷ niệm.", "Primary medium heard singular 'Erinnerung'; independent small heard plural 'Erinnerungen'.", False),
    (621.82, 624.60, "Frieren", "Außerdem suche ich noch nach dem, was wir im Schloss gefunden haben.", "Ngoài ra tôi còn đang tìm thứ mà chúng ta đã nhặt được trong lâu đài.", "", False),
    (624.60, 627.02, "Himmel", "Du meinst wohl das Horn des Schattendrachen.", "Ý cậu chắc là chiếc sừng của rồng bóng tối chứ gì.", "", False),
    (627.40, 629.60, "Himmel", "Ich hab das nicht einen Augenblick vergessen.", "Tớ chưa từng quên nó dù chỉ một giây.", "", False),
    (630.14, 633.76, "Himmel", "Denn von meinem Schrank geht seitdem eine düstere Aura aus.", "Bởi từ đó đến nay, tủ đồ của tớ lúc nào cũng tỏa ra một luồng hắc khí u ám.", "Corrected ASR 'Aure' -> 'Aura'.", False),
    (634.38, 636.26, "Frieren", "Das tut mir wirklich leid.", "Tôi thực sự xin lỗi.", "", False),
    (636.62, 639.82, "Frieren", "Du hättest es doch auch einfach in einem Schuppen oder so aufbewahren können.", "Lẽ ra cậu cứ cất đại nó trong nhà kho hay đâu đó cũng được mà.", "", False),
    (642.22, 643.58, "Himmel", "Auf gar keinen Fall.", "Tuyệt đối không đời nào.", "", False),
    (647.34, 651.72, "Himmel", "Vielleicht hast du es mir übergeben, ohne dir groß Gedanken darüber zu machen.", "Có lẽ cậu đã giao nó cho tớ mà chẳng suy nghĩ gì nhiều.", "", False),
    (651.72, 656.44, "Himmel", "Aber für mich war es ein sehr wertvolles Geschenk von einer geliebten Gefährtin.", "Nhưng đối với tớ, đó là một món quà vô cùng quý giá từ người bạn đồng hành thân yêu.", "", False),
    (657.14, 660.72, "Himmel", "Ich hatte gehofft, dass ich es dir eines Tages zurückgeben könnte.", "Tớ đã luôn hy vọng một ngày nào đó có thể trao trả nó lại cho cậu.", "Primary medium heard 'ihr', independent small heard 'dir' (flagged pronoun ambiguity in direct address).", False),
    (669.84, 672.80, "Frieren", "Dabei hatte es im Grunde gar keine große Bedeutung.", "Vậy mà thực ra nó chẳng có ý nghĩa gì to tát cả.", "", False),

    # Part 4: 680.0 - 870.0 (Chuyến phiêu lưu cuối cùng của nhóm anh hùng)
    (692.64, 694.08, "Frieren", "Bist du noch nicht fertig?", "Cậu vẫn chưa chuẩn bị xong sao?", "", False),
    (694.84, 695.98, "Frieren", "Wieso machst du dich so zurecht?", "Sao cậu lại chải chuốt kỹ thế?", "", False),
    (696.04, 697.12, "Frieren", "Du hast doch eine Glatze.", "Đầu cậu hói rồi cơ mà.", "", False),
    (698.58, 701.28, "Himmel", "Ein gepflegtes Äußeres ist immer wichtig.", "Vẻ ngoài chỉn chu lúc nào cũng quan trọng.", "", False),
    (708.08, 711.30, "Himmel", "Also dann, wollen wir uns den Ära-Meteorschauer ansehen?", "Vậy thì, chúng ta cùng đi ngắm mưa sao băng Thời Đại chứ?", "Corrected ASR 'Meteorshower' -> 'Ära-Meteorschauer'.", False),
    (719.62, 722.40, "Frieren", "Du siehst mittlerweile recht würdevoll aus, Heiter.", "Giờ trông cậu khá đạo mạo đấy, Heiter.", "", False),
    (722.50, 724.54, "Heiter", "Ich bin nun der Bischof der Heiligen Stadt.", "Giờ tôi đã là Giám mục của Thánh Đô rồi.", "", False),
    (724.72, 727.24, "Heiter", "Du hingegen hast dich überhaupt nicht verändert.", "Còn cậu thì chẳng thay đổi chút nào cả.", "", False),
    (728.24, 729.60, "Frieren", "Tätschel mir nicht so den Kopf.", "Đừng có xoa đầu tôi như thế.", "Editorial phonetic/context reconstruction: primary medium heard 'Tetschel, mir nicht zu den Kopf', focused-medium heard 'Der chillt mir nicht so den Kopf', independent small heard 'Er tötet mich nicht zu dem Kopf'. Not manually heard.", False),
    (731.48, 733.56, "Frieren", "Eisen, du hast dich nicht wirklich verändert.", "Eisen, cậu thực sự không thay đổi mấy.", "", False),
    (734.70, 736.36, "Eisen", "Verstehe, wenn du das meinst.", "Ra vậy, nếu cậu thấy thế.", "", False),
    (736.60, 738.22, "Frieren", "Wie ich es von einem Zwerg erwarte.", "Đúng như tôi mong đợi ở người lùn.", "", False),
    (738.52, 739.66, "Eisen", "Wo ist nun dieser Ort,", "Vậy nơi đó ở đâu,", "", False),
    (739.66, 741.36, "Eisen", "von dem aus wir den Schauer gut sehen?", "nơi mà chúng ta có thể ngắm rõ mưa sao băng ấy?", "", True),
    (742.50, 744.32, "Heiter", "Wollen wir jetzt schon aufbrechen?", "Chúng ta định khởi hành ngay bây giờ sao?", "", False),
    (744.68, 747.70, "Heiter", "Für den Ära-Meteorschauer ist es noch etwas zu früh.", "Vẫn còn hơi sớm để ngắm mưa sao băng Thời Đại mà.", "", False),
    (748.66, 749.32, "Frieren", "Das stimmt.", "Đúng vậy.", "", False),
    (749.56, 752.50, "Frieren", "Wir brauchen von hier aber ungefähr eine Woche zu Fuß.", "Nhưng đi bộ từ đây tới đó phải mất khoảng một tuần.", "", False),
    (752.88, 754.42, "Heiter", "So weit weg ist dieser Ort?", "Nơi đó ở xa đến vậy sao?", "", False),
    (755.40, 756.38, "Heiter", "Meine Güte!", "Trời đất ơi!", "", False),
    (756.86, 759.02, "Heiter", "Sie verlangt sehr viel von uns alten Leuten.", "Cô ấy đòi hỏi quá nhiều ở mấy ông già chúng ta rồi.", "", False),
    (762.10, 763.58, "Himmel", "Es ist wie früher.", "Cứ như ngày xưa vậy.", "", False),
    (764.20, 767.78, "Himmel", "Diese Reise versetzt mich geradezu in die Zeit von damals zurück.", "Chuyến đi này thực sự đưa tớ trở về những ngày tháng năm xưa.", "", False),
    (772.14, 775.34, "Himmel", "Wir haben alle möglichen Orte bereist,", "Chúng ta đã đi qua đủ mọi miền đất,", "", False),
    (776.44, 781.26, "Himmel", "zu der Zeit war alles noch neu, und es schien mir so wundervoll.", "vào thời điểm đó mọi thứ đều mới mẻ và dường như thật tuyệt diệu đối với tớ.", "", True),
    (805.72, 810.62, "Himmel", "Ihr seid immer ein wichtiger Teil dieser wunderschönen Erinnerungen gewesen.", "Các cậu luôn là một phần quan trọng trong những ký ức tươi đẹp ấy.", "", False),
    (814.24, 819.08, "Himmel", "Weißt du, ich hab sehnsüchtig auf den Tag gewartet, an dem wir alle wieder zusammen", "Cậu biết không, tớ đã luôn khắc khoải chờ đợi ngày mà tất cả chúng ta lại được", "", False),
    (819.08, 819.66, "Himmel", "sein werden.", "ở bên nhau.", "", True),
    (821.00, 822.46, "Himmel", "Ich danke dir, Frieren.", "Cảm ơn cậu, Frieren.", "", False),
    (822.46, 825.42, "Himmel", "Deinetwegen konnte ich zum Schluss", "Nhờ có cậu mà vào lúc cuối đời,", "", False),
    (825.42, 828.66, "Himmel", "noch ein letztes großes Abenteuer erleben.", "tớ vẫn có thể trải nghiệm thêm một chuyến phiêu lưu lớn cuối cùng.", "", True),
    (852.46, 854.18, "Frieren", "Wie schön!", "Đẹp quá!", "", False),

    # Part 5: 870.0 - 1120.0 (Lời tiễn biệt Himmel và nỗi day dứt của Frieren)
    (881.26, 885.90, "Heiter", "Ich bin mir sicher, dass unser Himmel ein sehr glücklicher Mensch war.", "Tôi chắc chắn rằng Himmel của chúng ta đã là một người rất hạnh phúc.", "Primary medium duplicated boundary words across 884.16s ('Mensch ist. / Mensch war.'); independent small window 870 confirmed single sentence.", False),
    (886.56, 887.66, "Eisen", "Glaubst du wirklich?", "Cậu thực sự nghĩ vậy sao?", "", False),
    (895.14, 897.86, "Trauergast", "War dieses Mädchen da nicht eine Gefährtin von Himmel?", "Cô gái đằng kia chẳng phải là bạn đồng hành của ngài Himmel sao?", "", False),
    (898.16, 900.22, "Trauergast", "Sie sieht kein bisschen traurig aus.", "Trông cô ta chẳng có chút gì là buồn bã cả.", "", False),
    (901.00, 901.78, "Trauergast", "Keine Regung.", "Chẳng mảy may xúc động.", "", False),
    (902.06, 902.96, "Trauergast", "Wie schrecklich von ihr.", "Thật quá đáng.", "", False),
    (903.72, 904.84, "Heiter", "Nun mal langsam.", "Xin hãy bình tĩnh nào.", "", False),
    (905.04, 907.28, "Heiter", "Wir sind nämlich auch nicht wirklich traurig.", "Thực ra chúng tôi cũng không hẳn là buồn bã đâu.", "", False),
    (907.44, 908.74, "Trauergast", "Nimm das gefälligst ernst, Bischof!", "Xin hãy nghiêm túc đi, thưa Giám mục!", "Uncertain funeral crowd exclamation: primary medium heard 'Nimm das Gefährlichste ernst, Mischung!', focused-medium heard 'Nimm das Gefährlichste ernst, Mischer!', focused-small heard 'Nehmt das gefährlichst ernst, Anschlusser!'. Reconstructed in context as 'Nimm das gefälligst ernst, Bischof!'; not manually heard.", False),
    (909.02, 910.62, "Trauergast", "Ihr seid kaltherzige Monster!", "Các người là lũ quái vật máu lạnh!", "Corrected ASR 'kaltarzige' -> 'kaltherzige'.", False),
    (911.34, 912.76, "Heiter", "Das ist aber nicht nett.", "Nói thế thì thật chẳng tử tế chút nào.", "", False),
    (938.08, 941.28, "Frieren", "Ich... ich weiß wirklich so gut wie nichts über ihn.", "Tôi... tôi thực sự hầu như chẳng biết gì về anh ấy cả.", "", False),
    (952.92, 957.28, "Frieren", "Wir sind gerade einmal zehn Jahre miteinander gereist.", "Chúng tôi mới chỉ cùng nhau đồng hành vỏn vẹn mười năm.", "", False),
    (964.78, 969.38, "Frieren", "Die menschliche Lebensspanne ist so kurz, das wusste ich doch eigentlich.", "Tuổi thọ của con người ngắn ngủi đến thế, lẽ ra tôi vốn đã biết điều đó rồi.", "", False),
    (970.28, 971.56, "Frieren", "Also wieso?", "Vậy thì tại sao chứ?", "", False),
    (972.18, 975.16, "Frieren", "Habe ich nicht versucht, ihn besser kennenzulernen?", "Tại sao tôi đã không cố gắng tìm hiểu anh ấy nhiều hơn?", "", False),
    (984.24, 986.92, "Frieren", "Hör auf, meinen Kopf zu tätscheln.", "Đừng xoa đầu tôi nữa.", "", False),
    (994.94, 997.92, "Heiter", "Dann werde ich auch mal in die Heilige Stadt zurückkehren.", "Vậy tôi cũng xin trở về Thánh Đô đây.", "", False),
    (1001.08, 1006.72, "Heiter", "Lasst mich euch noch mal genauer ansehen, denn das wird jetzt wohl zum letzten Mal sein.", "Hãy để tôi ngắm nhìn hai người thật kỹ thêm lần nữa, vì có lẽ đây sẽ là lần cuối cùng rồi.", "", False),
    (1007.24, 1008.42, "Frieren", "Geht es dir nicht so gut?", "Cậu thấy trong người không khỏe sao?", "", False),
    (1008.68, 1011.44, "Heiter", "Der jahrelange Alkoholkonsum hat seine Folgen.", "Việc uống rượu suốt bao năm qua đã để lại hậu quả rồi.", "", False),
    (1011.54, 1013.00, "Eisen", "Das ist die gerechte Strafe.", "Đó là cái giá thích đáng đấy.", "", False),
    (1014.48, 1018.62, "Heiter", "Solltet ihr mal in die Heilige Stadt kommen, dann vergießt einen guten Tropfen an meinem Grab.", "Nếu hai người có dịp ghé qua Thánh Đô, hãy tưới một chén rượu ngon lên mộ tôi nhé.", "", False),
    (1021.08, 1023.34, "Frieren", "Hast du denn gar keine Angst vor dem Sterben, Heiter?", "Cậu hoàn toàn không sợ cái chết sao, Heiter?", "Corrected ASR 'Hiter' -> 'Heiter'.", False),
    (1025.20, 1028.66, "Heiter", "Ich bin Teil der Heldentruppe, die diese Welt gerettet hat.", "Tôi là một thành viên của nhóm anh hùng đã giải cứu thế giới này.", "", False),
    (1029.90, 1034.24, "Heiter", "Nach meinem Tod werde ich im Paradies garantiert im größten Luxus schwelgen.", "Sau khi qua đời, chắc chắn tôi sẽ được tận hưởng sự xa hoa bậc nhất trên thiên đường.", "", False),
    (1034.64, 1037.86, "Heiter", "Das ist der Grund, weshalb ich mit euch Seite an Seite gekämpft habe.", "Đó chính là lý do tôi đã sát cánh chiến đấu cùng mọi người.", "", False),
    (1038.04, 1039.36, "Frieren", "Oh, du Scheinheiliger.", "Ồ, đồ đạo đức giả.", "", False),
    (1041.54, 1043.34, "Heiter", "Ich mach mich mal auf den Weg.", "Tôi lên đường đây.", "", False),
    (1051.30, 1054.78, "Frieren", "Na dann, ich sollte auch langsam los.", "Vậy thôi, tôi cũng nên lên đường dần đây.", "", False),
    (1055.64, 1057.68, "Eisen", "Willst du auf Reisen weitere Zauber sammeln?", "Cậu định đi chu du để thu thập thêm phép thuật sao?", "", False),
    (1057.98, 1059.76, "Frieren", "Ja, das ist eins meiner Ziele.", "Ừ, đó là một trong những mục tiêu của tôi.", "", False),
    (1060.48, 1063.06, "Frieren", "Ich wünsche mir aber auch, mehr über die Menschen zu erfahren.", "Nhưng tôi cũng mong muốn được tìm hiểu nhiều hơn về con người.", "", False),
    (1065.78, 1066.68, "Eisen", "Verstehe ich.", "Tôi hiểu rồi.", "", False),
    (1067.58, 1069.80, "Frieren", "Ich hätte übrigens noch eine Bitte an dich.", "Nhân tiện, tôi còn một lời thỉnh cầu muốn nhờ cậu.", "", False),
    (1069.80, 1075.10, "Frieren", "Da ich ja eine Magierin bin, könnte ich gut einen starken Kämpfer wie dich gebrauchen.", "Vì tôi là một pháp sư, tôi rất cần một chiến binh mạnh mẽ như cậu đi cùng.", "", False),
    (1075.46, 1079.80, "Eisen", "Bitte verzeih mir, aber ich bin zu alt, um eine Axt zu schwingen.", "Xin hãy thứ lỗi cho tôi, nhưng tôi đã quá già để vung rìu rồi.", "", False),
    (1083.56, 1085.54, "Eisen", "Jetzt mach nicht so ein Gesicht, Frieren.", "Đừng làm vẻ mặt như thế chứ, Frieren.", "", False),
    (1085.98, 1091.22, "Eisen", "Selbst wenn die eigenen Kräfte schwinden, hat das Leben noch einige Überraschungen auf Lager.", "Ngay cả khi sức lực của bản thân suy giảm, cuộc sống vẫn còn cất giấu nhiều điều bất ngờ phía trước.", "", False),
    (1093.56, 1096.38, "Frieren", "Verstehe. Dann auf Wiedersehen, Eisen.", "Tôi hiểu rồi. Vậy tạm biệt nhé, Eisen.", "", False),
    (1097.46, 1098.66, "Eisen", "Ja, bis bald.", "Ừ, hẹn sớm gặp lại.", "", False),

    # Part 6: 1120.0 - 1275.0 (Gặp gỡ Fern tại nhà Heiter)
    (1140.24, 1142.32, "Frieren", "Schon wieder derselbe Baum.", "Lại là cái cây đó nữa rồi.", "Omitted by primary medium pass; recovered by independent small window 1140 and confirmed by focused-medium-late-review (prob 0.99).", False),
    (1143.06, 1144.66, "Frieren", "Andauernd verlaufe ich mich in diesem Wald.", "Mình cứ bị lạc mãi trong khu rừng này.", "Omitted by primary medium pass; recovered by independent small window 1140 and confirmed by focused-medium-late-review (prob 0.97).", False),
    (1145.56, 1146.58, "Frieren", "Wo bin ich hier?", "Mình đang ở đâu thế này?", "Omitted by primary medium pass; recovered by independent small window 1140 and confirmed by focused-medium-late-review (prob 0.99).", False),
    (1150.96, 1152.94, "Fern", "Suchen Sie nach etwas?", "Cô đang tìm thứ gì sao ạ?", "Primary medium heard low-confidence 'Schauen' (0.13); independent small and focused-medium-late-review confirmed 'Suchen Sie nach etwas?'.", False),
    (1158.06, 1159.78, "Fern", "Kann es sein, dass Sie sich verlaufen haben?", "Có phải cô bị lạc đường rồi không ạ?", "", False),
    (1160.90, 1164.34, "Frieren", "Ich suche eigentlich nur nach dem Haus von jemandem namens Heiter.", "Thực ra tôi chỉ đang tìm nhà của một người tên là Heiter.", "Corrected ASR 'Halter' -> 'Heiter'.", False),
    (1165.18, 1167.34, "Fern", "Ah, dann sind Sie wohl unser Gast.", "À, vậy chắc cô là vị khách của nhà cháu rồi.", "", False),
    (1170.80, 1173.00, "Frieren", "Du bist ja immer noch am Leben, Scheinheiliger.", "Cậu vẫn còn sống cơ đấy, đồ đạo đức giả.", "", False),
    (1174.68, 1178.50, "Heiter", "Es ist tatsächlich gar nicht so leicht, auf stilvolle Weise zu sterben.", "Thực sự là chẳng dễ dàng chút nào để qua đời một cách thật phong thái.", "", False),
    (1178.84, 1181.46, "Frieren", "Ich habe extra Schnaps gekauft, um ihn auf dein Grab zu gießen.", "Tôi đã cất công mua rượu mạnh để tưới lên mộ cậu đấy.", "Primary medium heard 'deinen Grab'; independent small confirmed 'dein Grab'.", False),
    (1181.54, 1182.32, "Frieren", "Willst du was davon?", "Cậu có muốn uống một chút không?", "", False),
    (1182.58, 1184.78, "Heiter", "Ich trinke gar keinen Alkohol mehr.", "Tôi hoàn toàn không uống rượu nữa rồi.", "", False),
    (1185.28, 1185.76, "Frieren", "Verstehe.", "Ra vậy.", "", False),
    (1186.56, 1189.48, "Frieren", "Doch ich denke nicht, dass die Göttin dir verzeihen wird,", "Nhưng tôi không nghĩ Nữ thần sẽ tha thứ cho cậu đâu,", "", False),
    (1189.48, 1191.54, "Frieren", "nur weil du inzwischen tugendhaft lebst.", "chỉ vì giờ đây cậu đã sống đức hạnh.", "", True),
    (1198.76, 1200.50, "Heiter", "Ich danke dir, meine Liebe.", "Cảm ơn cháu nhé, cháu yêu quý.", "", False),
    (1205.68, 1206.50, "Frieren", "Wer ist sie?", "Con bé là ai vậy?", "", False),
    (1207.10, 1208.38, "Heiter", "Ihr Name ist Fern.", "Tên con bé là Fern.", "", False),
    (1208.92, 1211.72, "Heiter", "Sie ist eine Kriegswaise aus den Ländern im Süden.", "Con bé là một trẻ mồ côi vì chiến tranh đến từ các vùng đất phương Nam.", "Corrected ASR 'Kriegsweise' -> 'Kriegswaise'.", False),
    (1213.20, 1214.50, "Frieren", "Das sieht dir nicht ähnlich.", "Chuyện này chẳng giống tính cách của cậu chút nào.", "", False),
    (1215.22, 1218.02, "Frieren", "Du bist nicht jemand, der anderen uneigennützig hilft.", "Cậu vốn đâu phải người hay giúp đỡ kẻ khác một cách vô tư.", "", False),
    (1218.02, 1220.26, "Frieren", "Du bist nicht wie Himmel.", "Cậu đâu có giống như Himmel.", "", False),
    (1222.96, 1225.46, "Heiter", "Frieren, warum bist du zu mir gekommen?", "Frieren này, tại sao cậu lại tìm đến chỗ tôi?", "Corrected ASR 'Friren' -> 'Frieren'.", False),
    (1225.90, 1228.30, "Frieren", "Ich wollte etwas in der Heiligen Stadt kaufen", "Tôi muốn mua vài thứ ở Thánh Đô,", "", False),
    (1228.30, 1230.08, "Frieren", "und ich versuche, wenn möglich,", "và nếu có thể thì tôi luôn cố gắng", "", True),
    (1230.18, 1232.06, "Frieren", "Bekannte an meinen Reisezielen zu treffen.", "ghé thăm những người quen ở nơi mình đi qua.", "", True),
    (1233.66, 1236.26, "Frieren", "Außerdem habe ich bei dir noch einige Schulden offen,", "Ngoài ra tôi vẫn còn nợ cậu vài ân tình", "", False),
    (1236.56, 1238.34, "Frieren", "die ich vor deinem Tod begleichen will.", "mà tôi muốn trả xong trước khi cậu qua đời.", "", True),
    (1242.10, 1244.16, "Heiter", "Eine Bitte hätte ich schon an dich.", "Quả thực tôi có một việc muốn nhờ cậu đây.", "", False),
    (1245.38, 1247.28, "Heiter", "Würdest du einen Lehrling aufnehmen?", "Cậu có sẵn lòng nhận một học trò không?", "", False),
    (1248.98, 1252.72, "Heiter", "Die kleine Fern hat nämlich das Potenzial zur Magierin.", "Bé Fern đây thực sự có tiềm năng trở thành một pháp sư.", "", False),
    (1252.96, 1255.74, "Heiter", "Würdest du sie bitte auf deinen Reisen mitnehmen?", "Cậu làm ơn đưa con bé đi cùng trong những chuyến hành trình của mình được không?", "", False),
    (1259.14, 1262.64, "Frieren", "Es tut mir leid, Heiter, aber das kann ich nicht machen.", "Xin lỗi cậu, Heiter, nhưng tôi không thể làm việc đó được.", "", False),
    (1263.20, 1264.28, "Frieren", "Sie wäre mir nur im Weg.", "Con bé sẽ chỉ làm vướng chân tôi thôi.", "", False),
    (1265.82, 1269.14, "Frieren", "Du weißt doch, wie viele Lehrlinge der Magie in echten Kämpfen sterben.", "Cậu cũng biết có bao nhiêu học trò pháp thuật đã bỏ mạng trong những trận chiến thực sự mà.", "", False),
    (1270.04, 1273.44, "Frieren", "Ich möchte kein Kind, das ein Freund mir anvertraut hat, in Gefahr bringen.", "Tôi không muốn đẩy một đứa trẻ mà bạn mình gửi gắm vào vòng nguy hiểm.", "", False),

    # Part 7: 1275.0 - 1559.986009 (Cuốn cổ thư của Ewig và người học trò mới)
    (1276.54, 1281.34, "Heiter", "Wenn das so ist, dann hätte ich eine andere Bitte an dich.", "Nếu đã vậy, thì tôi có một lời thỉnh cầu khác muốn nhờ cậu.", "", False),
    (1285.96, 1290.40, "Heiter", "Ich habe dieses Buch aus dem Grab von Ewig dem Weisen ausgegraben.", "Tôi đã khai quật cuốn sách này từ lăng mộ của Hiền nhân Ewig.", "", False),
    (1290.70, 1297.38, "Heiter", "In diesem Buch stehen verloren gegangene Zauber zur Wiederbelebung von Toten und zum Erlangen von Unsterblichkeit.", "Trong cuốn sách này có ghi chép những phép thuật đã thất truyền để hồi sinh người chết và đạt được sự bất tử.", "", False),
    (1297.82, 1301.24, "Heiter", "Ich kann mir nicht vorstellen, dass solche Zauber wirklich existieren.", "Tôi không thể hình dung nổi những phép thuật như thế lại thực sự tồn tại.", "", False),
    (1301.24, 1305.12, "Heiter", "Um das herauszufinden, möchte ich, dass du dieses Buch entschlüsselst.", "Để làm rõ điều đó, tôi muốn nhờ cậu giải mã cuốn sách này.", "", False),
    (1305.28, 1306.52, "Heiter", "Denkst du, du schaffst das?", "Cậu nghĩ mình làm được chứ?", "", False),
    (1307.08, 1309.14, "Frieren", "Es ist in einer geheimen Bilderschrift verfasst.", "Nó được viết bằng một loại chữ tượng hình bí mật.", "", False),
    (1309.46, 1312.02, "Frieren", "Die Leute in deinem Zeitalter stehen auf so etwas, oder?", "Người ở thời đại của cậu rất mê mấy thứ như thế này nhỉ?", "", False),
    (1312.70, 1315.22, "Frieren", "Ich werde wohl fünf oder sechs Jahre dafür brauchen.", "Chắc tôi sẽ cần khoảng năm hoặc sáu năm để giải mã nó.", "", False),
    (1315.70, 1317.04, "Heiter", "Wenn du das sagst.", "Nếu cậu đã nói vậy.", "", False),
    (1317.84, 1320.46, "Frieren", "Aber was willst du mit dem Inhalt dieses Buches anfangen?", "Nhưng cậu định làm gì với nội dung của cuốn sách này?", "", False),
    (1320.94, 1322.96, "Frieren", "Ich dachte immer, du hättest keine Angst vor dem Tod.", "Tôi cứ tưởng cậu không hề sợ cái chết cơ mà.", "", False),
    (1323.62, 1325.44, "Heiter", "Es gibt zwei Gründe dafür.", "Có hai lý do cho việc đó.", "", False),
    (1326.42, 1330.60, "Heiter", "Erstens habe ich euch damals wohl ein bisschen was vorgemacht.", "Thứ nhất, hồi đó có lẽ tôi đã làm bộ trước mặt mọi người một chút.", "", False),
    (1330.60, 1334.82, "Heiter", "Zweitens habe ich jetzt inzwischen mehr Angst vor dem Tod als früher.", "Thứ hai, giờ đây tôi đã sợ cái chết nhiều hơn trước kia rồi.", "", False),
    (1336.16, 1337.60, "Heiter", "Ich will ja auch nicht richtig unsterblich", "Tôi cũng đâu định trở nên bất tử thực sự,", "Uncertain ASR divergence: primary medium heard 'Ich wäre ja auch nicht richtig unsterblich, wäre nur ein kleines bisschen.'; independent small heard 'Ich will ja auch nicht richtig unsterblich werden, nur ein kleines bisschen.' Codex selected the supported small-model alternative as the coherent provisional reading; not manually heard.", False),
    (1338.38, 1339.80, "Heiter", "werden, nur ein kleines bisschen.", "chỉ một chút xíu thôi.", "Grouped with preceding clause; see uncertain ASR divergence note on 700341.", True),
    (1340.16, 1344.14, "Heiter", "Ich möchte auf meine alten Tage noch ein wenig mehr Zeit haben.", "Ở tuổi xế chiều này, tôi chỉ muốn có thêm một chút thời gian nữa.", "", False),
    (1347.76, 1349.90, "Heiter", "In den Heiligen Schriften steht außerdem,", "Hơn nữa, trong Kinh Thánh còn viết rằng", "", False),
    (1350.20, 1352.18, "Heiter", "dass man sein Leben gesund führen soll.", "con người nên sống một cuộc đời lành mạnh.", "", True),
    (1352.40, 1355.08, "Heiter", "Und ein langes Leben ist der beste Beweis dafür.", "Và sống trường thọ chính là minh chứng rõ nhất cho điều đó.", "", False),
    (1356.28, 1356.88, "Frieren", "Scheinheiliger.", "Đồ đạo đức giả.", "", False),
    (1358.86, 1360.06, "Heiter", "Eine Frage.", "Cho tôi hỏi một câu nhé.", "", False),
    (1360.74, 1365.94, "Heiter", "Könntest du Fern in Magie unterrichten, auch wenn es nur während deiner Pausen sein sollte?", "Cậu có thể dạy pháp thuật cho Fern, dù chỉ là trong những lúc cậu nghỉ giải lao được không?", "Capitalized proper name 'Fern'.", False),
    (1367.12, 1371.14, "Heiter", "Ich selber bin als Kleriker dazu leider nicht in der Lage.", "Bản thân tôi là một giáo sĩ nên tiếc là không đủ khả năng làm việc đó.", "", False),
    (1372.08, 1373.72, "Frieren", "Na gut, solange es nur das ist.", "Được thôi, miễn chỉ có vậy.", "", False),
    (1381.94, 1383.26, "Frieren", "Da ist sie ja.", "Con bé ở kia rồi.", "", False),
    (1384.10, 1386.60, "Frieren", "Es war ganz schön schwierig, dich zu finden.", "Tìm được em thật chẳng dễ chút nào.", "", False),
    (1386.92, 1388.42, "Frieren", "Trainierst du denn immer hier im Wald?", "Em lúc nào cũng tập luyện ở trong rừng này sao?", "", False),
    (1389.04, 1392.42, "Fern", "Dann haben sogar Sie Schwierigkeiten damit, mich aufzufinden.", "Vậy là ngay cả cô cũng gặp khó khăn trong việc tìm ra cháu.", "", False),
    (1394.30, 1397.78, "Fern", "Heiter sagt mir oft, dass ich eine schwache Präsenz habe.", "Ngài Heiter thường bảo rằng cháu có sự hiện diện rất mờ nhạt.", "", False),
    (1399.94, 1402.16, "Fern", "Aber ich finde, das ist eine wunderbare Sache.", "Nhưng cháu thấy đó lại là một điều tuyệt vời.", "", False),
    (1403.96, 1405.10, "Frieren", "Ja, das ist es.", "Ừ, đúng là vậy.", "", False),
    (1408.40, 1411.98, "Frieren", "Tatsächlich, ihre Magie aufzuspüren, funktioniert so gut wie gar nicht.", "Quả thực, việc dò tìm ma lực của con bé hầu như chẳng có tác dụng.", "", False),
    (1412.46, 1414.42, "Frieren", "Sie verfügt über eine hervorragende Magiekontrolle.", "Con bé sở hữu khả năng kiểm soát ma lực xuất sắc.", "", False),
    (1414.42, 1419.88, "Frieren", "Wie viel muss sie trainiert haben, um das in ihrem Alter so zu beherrschen?", "Ở độ tuổi này mà làm chủ được đến mức ấy, không biết con bé đã phải khổ luyện biết bao nhiêu?", "", False),
    (1420.30, 1425.92, "Fern", "Heiter hat gesagt, dass ich eine vollwertige Magierin bin, wenn ich diesen Felsen dort durchstoßen kann.", "Ngài Heiter từng nói rằng cháu sẽ trở thành một pháp sư thực thụ nếu có thể xuyên thủng tảng đá đằng kia.", "Corrected ASR 'Halter' -> 'Heiter'.", False),
    (1426.46, 1435.18, "Frieren", "Oh, Heiter versteht zwar Magie, aber es ist eigentlich...", "Ồ, Heiter tuy cũng hiểu về pháp thuật, nhưng thực ra điều đó...", "Corrected ASR 'Halter' -> 'Heiter'.", False),
    (1435.76, 1438.46, "Fern", "Meine magische Kraft löst sich jedes Mal auf.", "Ma lực của cháu lần nào cũng bị tan biến mất.", "", False),
    (1438.60, 1439.74, "Fern", "Ich kann nichts tun.", "Cháu chẳng làm được gì cả.", "", False),
    (1440.70, 1441.74, "Frieren", "Oh, ich verstehe.", "Ồ, tôi hiểu rồi.", "", False),
    (1441.74, 1444.92, "Fern", "Was kann ich denn nur machen, um besser zu werden?", "Cháu phải làm gì để tiến bộ hơn đây ạ?", "", False),
    (1446.02, 1448.32, "Frieren", "Fern? Darf ich dich vorher etwas fragen?", "Fern này? Trước đó tôi hỏi em một câu được không?", "", False),
    (1449.76, 1450.50, "Frieren", "Liebst du Magie?", "Em có yêu pháp thuật không?", "", False),
    (1451.60, 1453.58, "Fern", "Manchmal mehr, manchmal weniger.", "Đôi khi nhiều, đôi khi ít ạ.", "", False),
    (1456.12, 1457.48, "Frieren", "Ganz genauso wie ich.", "Giống hệt như tôi.", "", False),
    # Post-credits preview (1550.12 - 1559.62)
    (1550.12, 1551.98, "Heiter", "Wie kommst du mit Fern zurecht?", "Cậu với Fern hòa hợp thế nào rồi?", "Uncertain post-credits preview speech: focused-medium ASR output 'Wie kommst du mit Fernseher ein?'; phonetically reconstructed in context as 'Wie kommst du mit Fern zurecht?', not manually heard.", False),
    (1554.22, 1556.06, "Fern", "Es wäre eine Schande, wenn du jetzt sterben würdest.", "Sẽ thật đáng tiếc nếu bây giờ ngài qua đời đấy ạ.", "Post-credits preview speech: focused-medium ASR heard 'Es wäre schade, wenn du jetzt sterben würdest' / 'Schade, wenn du jetzt sterben wirst'; on-screen German quote at 1554-1556s reads 'Es wäre eine Schande, wenn du jetzt sterben würdest.' Not manually heard.", False),
    (1556.08, 1557.84, "Frieren", "Das hätte nicht unbedingt Magie sein müssen.", "Đâu nhất thiết phải là pháp thuật.", "Post-credits preview speech: both focused-medium passes heard spoken 'Das hätte nicht unbedingt Magie sein müssen.'; on-screen Episode 2 title card reads 'Es hätte nicht unbedingt Magie sein müssen ...'.", False),
    (1558.04, 1559.62, "Heiter", "Aber es lohnt sich, nach denen zu suchen.", "Nhưng rất đáng để đi tìm chúng đấy.", "Post-credits preview speech: confirmed by primary medium, both focused-medium passes, and on-screen German quote.", False),
]

reviewed_rows = []
captions = []
practice_groups = []
runtime_units = []

for idx, (st, en, speaker, de, vi, note, group_prev) in enumerate(RAW_CUES):
    cue_id = 700101 + idx
    st_r = round(float(st), 3)
    en_r = round(float(en), 3)
    if idx > 0 and st_r < captions[-1]["end"]:
        st_r = captions[-1]["end"]
    assert 0 <= st_r < en_r <= duration, f"Invalid timing at {cue_id}: {st_r}-{en_r}"
    parent_id = runtime_units[-1]["id"] if group_prev else cue_id
    caption = {
        "id": cue_id,
        "parentId": parent_id,
        "start": st_r,
        "end": en_r,
        "speaker": speaker,
        "text": de,
        "vi": vi,
    }
    captions.append(caption)
    reviewed_rows.append({
        **caption,
        "reviewNotes": note,
        "uncertain": bool(note),
    })
    if group_prev:
        prev = runtime_units[-1]
        if "legacyIds" not in prev:
            prev["legacyIds"] = [prev["id"]]
        prev["legacyIds"].append(cue_id)
        prev["end"] = en_r
        prev["text"] = prev["text"] + " " + de
        prev["vi"] = prev["vi"] + " " + vi
    else:
        runtime_units.append(caption.copy())

for unit in runtime_units:
    if "legacyIds" in unit:
        practice_groups.append({
            "id": unit["id"],
            "sourceIds": unit["legacyIds"],
            "start": unit["start"],
            "end": unit["end"],
            "speaker": unit["speaker"],
            "text": unit["text"],
            "vi": unit["vi"],
        })

# Write reviewed-lines.tsv and reviewed-lines.json
tsv_path = folder / "reviewed-lines.tsv"
with tsv_path.open("w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=["id", "parentId", "start", "end", "speaker", "text", "vi", "reviewNotes"],
        delimiter="\t",
    )
    writer.writeheader()
    for row in reviewed_rows:
        writer.writerow({k: row[k] for k in ["id", "parentId", "start", "end", "speaker", "text", "vi", "reviewNotes"]})

(folder / "reviewed-lines.json").write_text(json.dumps(reviewed_rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(folder / "practice-groups.json").write_text(json.dumps(practice_groups, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(folder / "caption-cues.json").write_text(json.dumps(captions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(folder / "aligned-utterances-audit.json").write_text(json.dumps(reviewed_rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Write runtime JS and JSON
(root / "frieren-s01e01-aligned.js").write_text(
    "// Complete practice units and short captions from the unchanged local Frieren S01E01 video.\n"
    + "const FRIEREN_S01E01_CAPTION_CUES = " + json.dumps(captions, ensure_ascii=False, indent=2) + ";\n"
    + "const FRIEREN_S01E01_ALIGNED_UTTERANCES = " + json.dumps(runtime_units, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8",
)
(root / "frieren-s01e01-aligned.json").write_text(json.dumps(runtime_units, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def stamp(seconds):
    ms = round(seconds * 1000)
    return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}"

for lang, field in [("de", "text"), ("vi", "vi")]:
    vtt_blocks = []
    for c in captions:
        voice = f"<v {c['speaker']}>{c[field]}" if c.get("speaker") else c[field]
        vtt_blocks.append(f"{c['id']}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{voice}")
    (folder / f"frieren_s01e01.{lang}.vtt").write_text("WEBVTT\n\n" + "\n\n".join(vtt_blocks) + "\n", encoding="utf-8")

print(f"Built {len(captions)} caption cues and {len(runtime_units)} practice units ({len(practice_groups)} grouped).", flush=True)
