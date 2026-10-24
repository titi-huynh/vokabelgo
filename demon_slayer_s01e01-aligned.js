// Demon Slayer: Kimetsu no Yaiba (lồng tiếng Đức) — tập 1 "Grausamkeit".
// Lời thoại Đức do nhận dạng giọng nói tại máy (Whisper small), đã đối chiếu mô hình base và medium ở các điểm ngờ và rà soát biên tập;
// 1 tiếng phản ứng không lời đã bỏ, vài mảnh không phân giải được giữ ngoài bài — danh sách trong báo cáo đợt bàn giao.
// Vùng nhạc kết (sau 1211s) đã quét bằng 3 mô hình: không có thoại Đức, chỉ có bài hát tiếng Nhật.
// Phụ đề Việt là bản dịch phục vụ học tập, chờ rà soát. Nguồn video: tệp do chị/Codex bàn giao (source.json đi kèm),
// quyền phát hành chưa xác minh — chỉ dùng học tập nội bộ, không công bố.
const DEMON_SLAYER_S01E01_ALIGNED_UTTERANCES = [
  {
    "id": 500001,
    "parentId": 1,
    "start": 26.05,
    "end": 32.04,
    "text": "Warum? Wie konnte es nur dazukommen?",
    "vi": "Tại sao? Sao mọi chuyện lại thành ra thế này?"
  },
  {
    "id": 500002,
    "parentId": 2,
    "start": 34.76,
    "end": 38.04,
    "text": "Du darfst nicht sterben, Nezuko. Auf keinen Fall.",
    "vi": "Em không được chết, Nezuko. Tuyệt đối không."
  },
  {
    "id": 500003,
    "parentId": 3,
    "start": 40.34,
    "end": 44.92,
    "text": "Ich werde dich irgendwie retten. Ich lass dich nicht sterben.",
    "vi": "Anh sẽ cứu em bằng mọi giá. Anh không để em chết đâu."
  },
  {
    "id": 500004,
    "parentId": 4,
    "start": 46.25,
    "end": 50.82,
    "text": "Hast du das verstanden? Ich werde dich retten.",
    "vi": "Em nghe rõ chưa? Anh sẽ cứu em."
  },
  {
    "id": 500005,
    "parentId": 5,
    "start": 63.83,
    "end": 69.85,
    "text": "Tanjiro? Oh je, du bist ja ganz schwarz im Gesicht.",
    "vi": "Tanjiro? Ôi trời, mặt con đen nhẻm hết rồi kìa."
  },
  {
    "id": 500006,
    "parentId": 6,
    "start": 70.78,
    "end": 71.8,
    "text": "Na los, komm mal her.",
    "vi": "Nào, lại đây mẹ xem."
  },
  {
    "id": 500007,
    "parentId": 7,
    "start": 74.52,
    "end": 77.16,
    "text": "Da draußen in der Kälte kann es sehr gefährlich sein.",
    "vi": "Ngoài kia lạnh lắm, có thể rất nguy hiểm đấy."
  },
  {
    "id": 500008,
    "parentId": 8,
    "start": 77.28,
    "end": 78.5,
    "text": "Du weißt, dass du nicht gehen musst.",
    "vi": "Con biết là con không cần phải đi mà."
  },
  {
    "id": 500009,
    "parentId": 9,
    "start": 78.5,
    "end": 81.12,
    "text": "Ja, ich weiß, aber ich möchte,",
    "vi": "Dạ con biết, nhưng con muốn,"
  },
  {
    "id": 500010,
    "parentId": 10,
    "start": 81.3,
    "end": 83.48,
    "text": "dass wir zum Jahreswechsel genug Essen im Haus haben.",
    "vi": "nhà mình có đủ thức ăn cho dịp năm mới."
  },
  {
    "id": 500011,
    "parentId": 11,
    "start": 84.1,
    "end": 85.94,
    "text": "Dafür verkaufe ich ein bisschen Holzkohle.",
    "vi": "Vì thế con sẽ bán một ít than củi."
  },
  {
    "id": 500012,
    "parentId": 12,
    "start": 87.3,
    "end": 88.22,
    "text": "Ach Tanjiro.",
    "vi": "Ôi, Tanjiro."
  },
  {
    "id": 500013,
    "parentId": 13,
    "start": 93.02,
    "end": 94.9,
    "text": "Willst du heute wieder in die Stadt gehen?",
    "vi": "Hôm nay anh lại xuống phố nữa à?"
  },
  {
    "id": 500014,
    "parentId": 14,
    "start": 95.4,
    "end": 96.58,
    "text": "Ich will auch mitkommen.",
    "vi": "Em cũng muốn đi theo."
  },
  {
    "id": 500015,
    "parentId": 15,
    "start": 99.42,
    "end": 102.54,
    "text": "Euer Bruder wird sehr schnell sein müssen. Ihr würdet ihn aufhalten.",
    "vi": "Anh trai các con sẽ phải đi rất nhanh. Các con chỉ làm vướng chân anh thôi."
  },
  {
    "id": 500016,
    "parentId": 16,
    "start": 103.08,
    "end": 104.0,
    "text": "Manno Mama.",
    "vi": "Ôi mẹ ơi."
  },
  {
    "id": 500017,
    "parentId": 17,
    "start": 104.72,
    "end": 105.4,
    "text": "Vergiss das.",
    "vi": "Quên chuyện đó đi."
  },
  {
    "id": 500018,
    "parentId": 18,
    "start": 106.04,
    "end": 108.44,
    "text": "Außerdem kann er heute unseren Karren nicht mitnehmen.",
    "vi": "Hơn nữa hôm nay anh ấy không mang theo xe kéo được."
  },
  {
    "id": 500019,
    "parentId": 19,
    "start": 109.02,
    "end": 111.46,
    "text": "Ihr könntet euch also nirgendwo hinsetzen und ausruhen.",
    "vi": "Nên các con sẽ chẳng có chỗ nào để ngồi nghỉ đâu."
  },
  {
    "id": 500020,
    "parentId": 20,
    "start": 113.86,
    "end": 115.22,
    "text": "Wie ungerecht!",
    "vi": "Thật bất công!"
  },
  {
    "id": 500021,
    "parentId": 21,
    "start": 117.0,
    "end": 118.48,
    "text": "Wir wollen so gerne mit!",
    "vi": "Tụi con rất muốn đi theo mà!"
  },
  {
    "id": 500022,
    "parentId": 22,
    "start": 119.13,
    "end": 120.95,
    "text": "Ich helfe dir auch, versprochen.",
    "vi": "Em cũng sẽ phụ anh, em hứa đấy."
  },
  {
    "id": 500023,
    "parentId": 23,
    "start": 121.73,
    "end": 123.69,
    "text": "Das ist wirklich lieb von dir, Hanako.",
    "vi": "Con thật ngoan, Hanako."
  },
  {
    "id": 500024,
    "parentId": 24,
    "start": 124.05,
    "end": 126.37,
    "text": "Aber heute musst du zu Hause bleiben.",
    "vi": "Nhưng hôm nay con phải ở nhà."
  },
  {
    "id": 500025,
    "parentId": 25,
    "start": 126.97,
    "end": 127.87,
    "text": "Wie jetzt?",
    "vi": "Sao lại thế ạ?"
  },
  {
    "id": 500026,
    "parentId": 26,
    "start": 129.81,
    "end": 131.99,
    "text": "Du auch, Shigeru. Wisst ihr was?",
    "vi": "Cả con nữa, Shigeru. Biết gì không?"
  },
  {
    "id": 500027,
    "parentId": 27,
    "start": 132.65,
    "end": 134.11,
    "text": "Ich bring dir etwas aus der Stadt mit.",
    "vi": "Anh sẽ mang gì đó từ phố về cho em."
  },
  {
    "id": 500028,
    "parentId": 28,
    "start": 134.63,
    "end": 135.17,
    "text": "Versprochen?",
    "vi": "Thật chứ ạ?"
  },
  {
    "id": 500029,
    "parentId": 29,
    "start": 135.85,
    "end": 136.17,
    "text": "Ja.",
    "vi": "Ừ."
  },
  {
    "id": 500030,
    "parentId": 30,
    "start": 137.84,
    "end": 140.76,
    "text": "Und dir lese ich was vor, wenn ich wieder zu Hause bin.",
    "vi": "Còn em, khi về nhà anh sẽ đọc truyện cho nghe."
  },
  {
    "id": 500031,
    "parentId": 31,
    "start": 141.62,
    "end": 142.18,
    "text": "Gut.",
    "vi": "Được ạ."
  },
  {
    "id": 500032,
    "parentId": 32,
    "start": 142.84,
    "end": 143.78,
    "text": "Seht ihr, geht doch.",
    "vi": "Thấy chưa, thế có phải ngoan không."
  },
  {
    "id": 500033,
    "parentId": 33,
    "start": 143.78,
    "end": 146.32,
    "text": "Was würden wir nur ohne dich machen, Tanjiro?",
    "vi": "Không có con thì nhà mình biết làm sao, Tanjiro?"
  },
  {
    "id": 500034,
    "parentId": 34,
    "start": 147.6,
    "end": 148.88,
    "text": "Ich mach mich dann auf den Weg.",
    "vi": "Con xin phép đi đây ạ."
  },
  {
    "id": 500035,
    "parentId": 35,
    "start": 149.76,
    "end": 152.68,
    "text": "Ach ja, Takeo, kannst du in der Zwischenzeit etwas Holz hacken?",
    "vi": "À phải rồi, Takeo, trong lúc anh đi, em chẻ ít củi giúp anh nhé?"
  },
  {
    "id": 500036,
    "parentId": 36,
    "start": 153.1,
    "end": 154.56,
    "text": "Aber nur so viel du schaffst, hörst du?",
    "vi": "Nhưng chỉ vừa sức thôi, nghe chưa?"
  },
  {
    "id": 500037,
    "parentId": 37,
    "start": 155.14,
    "end": 157.72,
    "text": "Ich dachte eigentlich, dass wir das zusammen machen wollten.",
    "vi": "Em cứ tưởng anh em mình sẽ làm cùng nhau chứ."
  },
  {
    "id": 500038,
    "parentId": 38,
    "start": 158.52,
    "end": 161.04,
    "text": "Aber gut, ich schätze, dann kümmere ich mich alleine drum.",
    "vi": "Thôi được, chắc em tự lo một mình vậy."
  },
  {
    "id": 500039,
    "parentId": 39,
    "start": 163.34,
    "end": 164.58,
    "text": "So ist es brav.",
    "vi": "Thế mới ngoan."
  },
  {
    "id": 500040,
    "parentId": 40,
    "start": 164.78,
    "end": 165.78,
    "text": "Was soll das auf einmal?",
    "vi": "Sao tự nhiên lại thế?"
  },
  {
    "id": 500041,
    "parentId": 41,
    "start": 166.18,
    "end": 167.52,
    "text": "Takeo wird ja ganz rot.",
    "vi": "Mặt Takeo đỏ hết lên rồi kìa."
  },
  {
    "id": 500042,
    "parentId": 42,
    "start": 168.12,
    "end": 168.94,
    "text": "Hey, sei still.",
    "vi": "Này, im đi."
  },
  {
    "id": 500043,
    "parentId": 43,
    "start": 169.34,
    "end": 170.34,
    "text": "So ist es brav.",
    "vi": "Thế mới ngoan."
  },
  {
    "id": 500044,
    "parentId": 44,
    "start": 170.68,
    "end": 172.0,
    "text": "Du sollst aufhören.",
    "vi": "Em đã bảo thôi đi mà."
  },
  {
    "id": 500045,
    "parentId": 45,
    "start": 177.18,
    "end": 179.68,
    "text": "Komm schnell wieder zurück, verstanden?",
    "vi": "Nhớ quay về sớm đấy, nghe chưa?"
  },
  {
    "id": 500046,
    "parentId": 46,
    "start": 180.42,
    "end": 182.42,
    "text": "Und pass bitte gut auf dich auf!",
    "vi": "Và nhớ giữ gìn sức khỏe nhé!"
  },
  {
    "id": 500047,
    "parentId": 47,
    "start": 187.75,
    "end": 188.71,
    "text": "Hey, Brüderchen.",
    "vi": "Này, anh trai."
  },
  {
    "id": 500048,
    "parentId": 48,
    "start": 189.51,
    "end": 190.65,
    "text": "Ah, Nezuko.",
    "vi": "À, Nezuko."
  },
  {
    "id": 500049,
    "parentId": 49,
    "start": 191.33,
    "end": 193.55,
    "text": "Ich war mit Rokuta unterwegs, damit er einschläft.",
    "vi": "Chị vừa dắt Rokuta đi dạo để nó ngủ."
  },
  {
    "id": 500050,
    "parentId": 50,
    "start": 194.07,
    "end": 195.75,
    "text": "Er hat die ganze Zeit wieder nur geweint.",
    "vi": "Nó cứ khóc mãi thôi."
  },
  {
    "id": 500051,
    "parentId": 51,
    "start": 196.75,
    "end": 199.25,
    "text": "Vaters Tod geht auch an ihm nicht einfach so vorbei.",
    "vi": "Cái chết của cha cũng ảnh hưởng đến nó không ít."
  },
  {
    "id": 500052,
    "parentId": 52,
    "start": 201.57,
    "end": 202.79,
    "text": "Seit er von uns gegangen ist,",
    "vi": "Từ khi cha rời xa chúng ta,"
  },
  {
    "id": 500053,
    "parentId": 53,
    "start": 202.89,
    "end": 204.71,
    "text": "verlassen sich alle auf dich, Tanjiro.",
    "vi": "mọi người trong nhà đều trông cậy vào anh, Tanjiro."
  },
  {
    "id": 500054,
    "parentId": 54,
    "start": 207.67,
    "end": 208.81,
    "text": "Komm gesund zu uns zurück.",
    "vi": "Hãy trở về với nhà mình bình an nhé."
  },
  {
    "id": 500055,
    "parentId": 55,
    "start": 212.4,
    "end": 213.72,
    "text": "Wir haben es zwar nicht leicht,",
    "vi": "Nhà mình tuy không dễ dàng gì,"
  },
  {
    "id": 500056,
    "parentId": 56,
    "start": 214.72,
    "end": 215.74,
    "text": "aber wir sind glücklich.",
    "vi": "nhưng chúng ta hạnh phúc."
  },
  {
    "id": 500057,
    "parentId": 57,
    "start": 216.93,
    "end": 218.63,
    "text": "Das Leben kann plötzlich umschlagen.",
    "vi": "Cuộc đời có thể đổi thay bất chợt."
  },
  {
    "id": 500058,
    "parentId": 58,
    "start": 219.31,
    "end": 220.43,
    "text": "Fast wie das Wetter.",
    "vi": "Gần như thời tiết vậy."
  },
  {
    "id": 500059,
    "parentId": 59,
    "start": 221.42,
    "end": 222.72,
    "text": "Immer in Bewegung.",
    "vi": "Luôn luôn chuyển động."
  },
  {
    "id": 500060,
    "parentId": 60,
    "start": 223.22,
    "end": 224.1,
    "text": "Stets im Wechsel.",
    "vi": "Không ngừng thay đổi."
  },
  {
    "id": 500061,
    "parentId": 61,
    "start": 225.1,
    "end": 226.94,
    "text": "Es kann nicht immer die Sonne für uns scheinen.",
    "vi": "Không phải lúc nào mặt trời cũng chiếu rọi chúng ta."
  },
  {
    "id": 500062,
    "parentId": 62,
    "start": 227.9,
    "end": 229.78,
    "text": "Aber es kann auch nicht immer schneien.",
    "vi": "Nhưng cũng không phải lúc nào tuyết cũng rơi."
  },
  {
    "id": 500063,
    "parentId": 63,
    "start": 231.36,
    "end": 232.46,
    "text": "Doch eins steht fest.",
    "vi": "Chỉ có một điều chắc chắn."
  },
  {
    "id": 500064,
    "parentId": 64,
    "start": 233.79,
    "end": 234.97,
    "text": "Wenn das Glück zerbricht,",
    "vi": "Khi hạnh phúc tan vỡ,"
  },
  {
    "id": 500065,
    "parentId": 65,
    "start": 235.87,
    "end": 239.29,
    "text": "liegt in der Luft der Geruch von Blut.",
    "vi": "trong không khí sẽ phảng phất mùi máu."
  },
  {
    "id": 500066,
    "parentId": 66,
    "start": 248.61,
    "end": 250.01,
    "text": "Oh, du bist es, Tanjiro.",
    "vi": "Ồ, Tanjiro đấy à."
  },
  {
    "id": 500067,
    "parentId": 67,
    "start": 250.43,
    "end": 253.25,
    "text": "Dass du an so einem Tag zu uns ins Dorf runterkommst,",
    "vi": "Vào một ngày như thế này mà cháu còn xuống làng với chúng ta,"
  },
  {
    "id": 500068,
    "parentId": 68,
    "start": 253.45,
    "end": 255.21,
    "text": "du bist wirklich ein fleißiger Junge,",
    "vi": "cháu đúng là một cậu bé chăm chỉ,"
  },
  {
    "id": 500069,
    "parentId": 69,
    "start": 255.45,
    "end": 257.23,
    "text": "Pass auf, dass du dich nicht erkältest.",
    "vi": "nhớ cẩn thận kẻo cảm lạnh đấy."
  },
  {
    "id": 500070,
    "parentId": 70,
    "start": 257.63,
    "end": 259.03,
    "text": "Das bisschen macht mir schon nichts.",
    "vi": "Chuyện nhỏ này không làm khó được cháu đâu."
  },
  {
    "id": 500071,
    "parentId": 71,
    "start": 259.03,
    "end": 261.23,
    "text": "Ich hab Holzkohle mitgebracht. Braucht ihr welche?",
    "vi": "Cháu có mang theo than củi. Các bác có cần không ạ?"
  },
  {
    "id": 500072,
    "parentId": 72,
    "start": 262.46,
    "end": 263.42,
    "text": "Hey, Tanjiro!",
    "vi": "Này, Tanjiro!"
  },
  {
    "id": 500073,
    "parentId": 73,
    "start": 264.74,
    "end": 266.48,
    "text": "Ich kaufe dir etwas Kohle ab.",
    "vi": "Bác mua của cháu ít than nhé."
  },
  {
    "id": 500074,
    "parentId": 74,
    "start": 266.9,
    "end": 268.36,
    "text": "Ich auch, als Dank dafür,",
    "vi": "Bác cũng vậy, để cảm ơn chuyện"
  },
  {
    "id": 500075,
    "parentId": 75,
    "start": 268.48,
    "end": 270.16,
    "text": "dass du neulich meine Tür repariert hast.",
    "vi": "hôm trước cháu sửa cánh cửa cho bác."
  },
  {
    "id": 500076,
    "parentId": 76,
    "start": 270.62,
    "end": 272.34,
    "text": "Bei der Gelegenheit nehme ich auch etwas.",
    "vi": "Nhân tiện bác cũng lấy một ít."
  },
  {
    "id": 500077,
    "parentId": 77,
    "start": 277.16,
    "end": 277.64,
    "text": "Tanjiro!",
    "vi": "Tanjiro!"
  },
  {
    "id": 500078,
    "parentId": 78,
    "start": 278.56,
    "end": 280.04,
    "text": "Ein Glück, dass du da bist.",
    "vi": "May quá, có cháu ở đây."
  },
  {
    "id": 500079,
    "parentId": 79,
    "start": 281.02,
    "end": 283.38,
    "text": "Meine Liebste behauptet, ich hätte diesen Teller zerbrochen.",
    "vi": "Vợ bác cứ khăng khăng là bác đã làm vỡ cái đĩa này."
  },
  {
    "id": 500080,
    "parentId": 80,
    "start": 283.88,
    "end": 285.44,
    "text": "Kannst du mir nicht irgendwie helfen?",
    "vi": "Cháu giúp bác được không?"
  },
  {
    "id": 500081,
    "parentId": 81,
    "start": 285.8,
    "end": 286.46,
    "text": "Riech mal dran.",
    "vi": "Ngửi thử đi."
  },
  {
    "id": 500082,
    "parentId": 82,
    "start": 290.98,
    "end": 292.8,
    "text": "Ich rieche eindeutig eine Katze.",
    "vi": "Cháu ngửi rõ ràng mùi một con mèo."
  },
  {
    "id": 500083,
    "parentId": 83,
    "start": 293.34,
    "end": 293.92,
    "text": "Siehst du?",
    "vi": "Thấy chưa?"
  },
  {
    "id": 500084,
    "parentId": 84,
    "start": 294.67,
    "end": 296.45,
    "text": "Sieh an, es war eine Katze.",
    "vi": "Đấy, hóa ra là một con mèo."
  },
  {
    "id": 500085,
    "parentId": 85,
    "start": 296.69,
    "end": 298.63,
    "text": "Ich hab doch gesagt, ich war es nicht.",
    "vi": "Anh đã bảo không phải anh làm mà."
  },
  {
    "id": 500086,
    "parentId": 86,
    "start": 299.05,
    "end": 300.99,
    "text": "Sag mal, Tanjiro, denkst du,",
    "vi": "Này Tanjiro, cháu nghĩ là,"
  },
  {
    "id": 500087,
    "parentId": 87,
    "start": 301.09,
    "end": 303.59,
    "text": "du könntest mir einen kleinen Augenblick mit dem Gepäck helfen?",
    "vi": "cháu có thể giúp bác một lát với đống hành lý này không?"
  },
  {
    "id": 500088,
    "parentId": 88,
    "start": 308.24,
    "end": 309.82,
    "text": "Es ist ganz schön spät geworden.",
    "vi": "Trời đã khá muộn rồi."
  },
  {
    "id": 500089,
    "parentId": 89,
    "start": 310.78,
    "end": 313.18,
    "text": "Aber immerhin konnte ich alles verkaufen.",
    "vi": "Nhưng ít ra mình cũng bán hết được."
  },
  {
    "id": 500090,
    "parentId": 90,
    "start": 315.29,
    "end": 316.43,
    "text": "Warte, Tanjiro!",
    "vi": "Khoan đã, Tanjiro!"
  },
  {
    "id": 500091,
    "parentId": 91,
    "start": 318.38,
    "end": 320.54,
    "text": "Willst du um diese Uhrzeit etwa wieder auf den Berg?",
    "vi": "Giờ này cháu còn định quay lên núi sao?"
  },
  {
    "id": 500092,
    "parentId": 92,
    "start": 321.08,
    "end": 322.62,
    "text": "Das ist doch viel zu gefährlich.",
    "vi": "Nguy hiểm lắm đấy."
  },
  {
    "id": 500093,
    "parentId": 93,
    "start": 323.32,
    "end": 325.4,
    "text": "Mach dir nur keine Sorgen, ich hab eine gute Nase.",
    "vi": "Bác đừng lo, mũi cháu thính lắm."
  },
  {
    "id": 500094,
    "parentId": 94,
    "start": 326.22,
    "end": 328.02,
    "text": "Nichts da, du übernachtest bei mir.",
    "vi": "Không được, cháu ngủ lại nhà bác đêm nay."
  },
  {
    "id": 500095,
    "parentId": 95,
    "start": 328.44,
    "end": 329.86,
    "text": "Na los doch, ich warte.",
    "vi": "Nào đi thôi, bác đợi."
  },
  {
    "id": 500096,
    "parentId": 96,
    "start": 331.72,
    "end": 332.58,
    "text": "Aber ich...",
    "vi": "Nhưng cháu..."
  },
  {
    "id": 500097,
    "parentId": 97,
    "start": 332.58,
    "end": 333.6,
    "text": "Keine Wiederrede.",
    "vi": "Không cãi nữa."
  },
  {
    "id": 500098,
    "parentId": 98,
    "start": 335.05,
    "end": 336.65,
    "text": "Hier draußen gibt es Dämonen.",
    "vi": "Ngoài này có quỷ đấy."
  },
  {
    "id": 500099,
    "parentId": 99,
    "start": 350.65,
    "end": 351.63,
    "text": "Danke für das Essen.",
    "vi": "Cháu cảm ơn bác vì bữa ăn."
  },
  {
    "id": 500100,
    "parentId": 100,
    "start": 356.99,
    "end": 358.89,
    "text": "Ich hab da mal eine Frage, Saburo.",
    "vi": "Bác Saburo, cho cháu hỏi một điều."
  },
  {
    "id": 500101,
    "parentId": 101,
    "start": 359.63,
    "end": 361.09,
    "text": "Was für Dämonen gibt es hier?",
    "vi": "Ở đây có những loại quỷ nào ạ?"
  },
  {
    "id": 500102,
    "parentId": 102,
    "start": 362.1,
    "end": 365.96,
    "text": "Seit jeher treiben menschenfressende Dämonen nachts in unserem Land hier Unwesen.",
    "vi": "Từ xưa đến nay, lũ quỷ ăn thịt người vẫn hoành hành ban đêm ở vùng này."
  },
  {
    "id": 500103,
    "parentId": 103,
    "start": 369.18,
    "end": 372.52,
    "text": "Und deshalb hält man sich nach Sonnenuntergang draußen nicht mehr auf.",
    "vi": "Vì thế sau khi mặt trời lặn, người ta không ra ngoài nữa."
  },
  {
    "id": 500104,
    "parentId": 104,
    "start": 373.04,
    "end": 375.74,
    "text": "Morgen früh kannst du, meinetwegen, direkt nach Hause laufen.",
    "vi": "Sáng mai nếu cháu muốn, cứ chạy thẳng về nhà."
  },
  {
    "id": 500105,
    "parentId": 105,
    "start": 381.15,
    "end": 383.75,
    "text": "Und diese Dämonen sind nicht in der Lage,",
    "vi": "Và những con quỷ đó không thể nào"
  },
  {
    "id": 500106,
    "parentId": 106,
    "start": 383.95,
    "end": 385.4,
    "text": "die Häuser der Menschen zu betreten?",
    "vi": "vào được nhà của con người, đúng không ạ?"
  },
  {
    "id": 500107,
    "parentId": 107,
    "start": 386.51,
    "end": 388.78,
    "text": "Doch, das sind sie, ja.",
    "vi": "Có chứ, chúng vào được đấy."
  },
  {
    "id": 500108,
    "parentId": 108,
    "start": 392.72,
    "end": 395.7,
    "text": "Das heißt dann, dass wir alle irgendwann gefressen werden?",
    "vi": "Vậy nghĩa là sớm muộn gì tất cả chúng ta cũng bị ăn thịt sao?"
  },
  {
    "id": 500109,
    "parentId": 109,
    "start": 398.84,
    "end": 402.74,
    "text": "Um das zu verhindern, existieren auch schon genauso lange die Dämonenjäger,",
    "vi": "Để ngăn điều đó, từ lâu cũng đã có những thợ săn quỷ,"
  },
  {
    "id": 500110,
    "parentId": 110,
    "start": 403.14,
    "end": 404.3,
    "text": "um sie zu töten.",
    "vi": "để tiêu diệt chúng."
  },
  {
    "id": 500111,
    "parentId": 111,
    "start": 406.96,
    "end": 409.62,
    "text": "Es wird Zeit zu schlafen, ruhe dich etwas aus.",
    "vi": "Đến giờ ngủ rồi, cháu nghỉ ngơi một chút đi."
  },
  {
    "id": 500112,
    "parentId": 112,
    "start": 413.09,
    "end": 417.11,
    "text": "Seit er seine Familie verloren hat, lebt der alte Saburo hier zurückgezogen.",
    "vi": "Từ khi mất cả gia đình, ông Saburo sống khép kín ở đây."
  },
  {
    "id": 500113,
    "parentId": 113,
    "start": 418.03,
    "end": 419.55,
    "text": "Bestimmt ist er sehr einsam.",
    "vi": "Chắc hẳn ông rất cô đơn."
  },
  {
    "id": 500114,
    "parentId": 114,
    "start": 419.55,
    "end": 422.01,
    "text": "Das nächste Mal bringe ich meine Geschwister mit.",
    "vi": "Lần sau cháu sẽ dẫn các em theo."
  },
  {
    "id": 500115,
    "parentId": 115,
    "start": 422.25,
    "end": 423.29,
    "text": "Er und seine Geschichten.",
    "vi": "Ông và những câu chuyện của ông."
  },
  {
    "id": 500116,
    "parentId": 116,
    "start": 423.85,
    "end": 425.73,
    "text": "So was wie Dämonen gibt es nicht.",
    "vi": "Quỷ làm gì tồn tại chứ."
  },
  {
    "id": 500117,
    "parentId": 117,
    "start": 426.09,
    "end": 426.97,
    "text": "Ich hab keine Angst.",
    "vi": "Cháu không sợ đâu."
  },
  {
    "id": 500118,
    "parentId": 118,
    "start": 428.14,
    "end": 429.36,
    "text": "Aber schon merkwürdig.",
    "vi": "Nhưng cũng thật lạ."
  },
  {
    "id": 500119,
    "parentId": 119,
    "start": 430.26,
    "end": 433.46,
    "text": "Bevor Großmutter gestorben ist, redete sie auch von solchen Dingen.",
    "vi": "Trước khi bà mất, bà cũng từng nói về những chuyện như thế."
  },
  {
    "id": 500120,
    "parentId": 120,
    "start": 440.36,
    "end": 441.38,
    "text": "Pass auf dich auf.",
    "vi": "Con nhớ giữ gìn nhé."
  },
  {
    "id": 500121,
    "parentId": 121,
    "start": 452.18,
    "end": 455.78,
    "text": "Immer wenn das Glück zerbricht, liegt er in der Luft.",
    "vi": "Mỗi khi hạnh phúc tan vỡ, nó lại phảng phất trong không khí."
  },
  {
    "id": 500122,
    "parentId": 122,
    "start": 463.56,
    "end": 464.44,
    "text": "Es riecht nach Blut.",
    "vi": "Có mùi máu."
  },
  {
    "id": 500123,
    "parentId": 123,
    "start": 488.36,
    "end": 490.74,
    "text": "Nein, Nezuko! Was ist denn los?",
    "vi": "Không, Nezuko! Có chuyện gì vậy?"
  },
  {
    "id": 500124,
    "parentId": 124,
    "start": 491.14,
    "end": 492.12,
    "text": "Was ist denn hier passiert?",
    "vi": "Chuyện gì đã xảy ra ở đây thế này?"
  },
  {
    "id": 500125,
    "parentId": 125,
    "start": 493.04,
    "end": 494.1,
    "text": "Was ist passiert?",
    "vi": "Đã xảy ra chuyện gì?"
  },
  {
    "id": 500126,
    "parentId": 126,
    "start": 501.13,
    "end": 501.75,
    "text": "Mama.",
    "vi": "Mẹ."
  },
  {
    "id": 500127,
    "parentId": 127,
    "start": 510.86,
    "end": 511.48,
    "text": "Hanako.",
    "vi": "Hanako."
  },
  {
    "id": 500128,
    "parentId": 128,
    "start": 512.38,
    "end": 513.0,
    "text": "Takeo.",
    "vi": "Takeo."
  },
  {
    "id": 500129,
    "parentId": 129,
    "start": 514.9,
    "end": 515.52,
    "text": "Shigeru.",
    "vi": "Shigeru."
  },
  {
    "id": 500130,
    "parentId": 130,
    "start": 516.48,
    "end": 517.1,
    "text": "Nezuko.",
    "vi": "Nezuko."
  },
  {
    "id": 500131,
    "parentId": 131,
    "start": 518.2,
    "end": 518.82,
    "text": "Rokuta.",
    "vi": "Rokuta."
  },
  {
    "id": 500132,
    "parentId": 132,
    "start": 526.89,
    "end": 528.71,
    "text": "Nezuko ist als Einzige noch warm.",
    "vi": "Nezuko là người duy nhất còn ấm."
  },
  {
    "id": 500133,
    "parentId": 133,
    "start": 530.9,
    "end": 532.5,
    "text": "Vielleicht kann ein Arzt sie noch retten.",
    "vi": "Có lẽ bác sĩ vẫn cứu được em ấy."
  },
  {
    "id": 500134,
    "parentId": 134,
    "start": 533.98,
    "end": 535.38,
    "text": "Wie konnte das alles nur passieren?",
    "vi": "Sao tất cả chuyện này lại xảy ra được?"
  },
  {
    "id": 500135,
    "parentId": 135,
    "start": 537.02,
    "end": 537.84,
    "text": "War das ein Bär?",
    "vi": "Là gấu sao?"
  },
  {
    "id": 500136,
    "parentId": 136,
    "start": 538.48,
    "end": 540.62,
    "text": "Vielleicht ist er zu früh aus seinem Winterschlaf erwacht.",
    "vi": "Có lẽ nó tỉnh giấc quá sớm sau kỳ ngủ đông."
  },
  {
    "id": 500137,
    "parentId": 137,
    "start": 546.79,
    "end": 548.03,
    "text": "Ich krieg kaum noch Luft.",
    "vi": "Mình gần như không thở nổi nữa."
  },
  {
    "id": 500138,
    "parentId": 138,
    "start": 548.74,
    "end": 550.54,
    "text": "Die Kälte schneidet sich in meine Lunge.",
    "vi": "Cái lạnh cắt vào phổi mình."
  },
  {
    "id": 500139,
    "parentId": 139,
    "start": 551.18,
    "end": 551.86,
    "text": "Lauf weiter.",
    "vi": "Chạy tiếp đi."
  },
  {
    "id": 500140,
    "parentId": 140,
    "start": 551.86,
    "end": 554.12,
    "text": "Du darfst jetzt nicht aufgeben.",
    "vi": "Giờ không được bỏ cuộc."
  },
  {
    "id": 500141,
    "parentId": 141,
    "start": 554.58,
    "end": 555.78,
    "text": "Bewege deine Beine.",
    "vi": "Nhấc chân lên."
  },
  {
    "id": 500142,
    "parentId": 142,
    "start": 556.24,
    "end": 556.84,
    "text": "Schneller.",
    "vi": "Nhanh hơn nữa."
  },
  {
    "id": 500143,
    "parentId": 143,
    "start": 557.34,
    "end": 558.92,
    "text": "Wieso ist der Weg zur Stadt nur so weit?",
    "vi": "Sao đường xuống phố lại xa thế này?"
  },
  {
    "id": 500144,
    "parentId": 144,
    "start": 560.42,
    "end": 560.84,
    "text": "Mist.",
    "vi": "Chết tiệt."
  },
  {
    "id": 500145,
    "parentId": 145,
    "start": 562.29,
    "end": 563.91,
    "text": "Ich lass dich nicht sterben.",
    "vi": "Anh không để em chết đâu."
  },
  {
    "id": 500146,
    "parentId": 146,
    "start": 566.06,
    "end": 567.48,
    "text": "Ich werde dich irgendwie retten.",
    "vi": "Anh sẽ cứu em bằng mọi giá."
  },
  {
    "id": 500147,
    "parentId": 147,
    "start": 568.56,
    "end": 570.12,
    "text": "Hörst du, dein Bruder rettet dich?",
    "vi": "Em nghe không, anh trai sẽ cứu em."
  },
  {
    "id": 500148,
    "parentId": 148,
    "start": 579.17,
    "end": 579.77,
    "text": "Verdammt.",
    "vi": "Khốn kiếp."
  },
  {
    "id": 500149,
    "parentId": 149,
    "start": 588.76,
    "end": 589.42,
    "text": "Glück gehabt.",
    "vi": "May quá."
  },
  {
    "id": 500150,
    "parentId": 150,
    "start": 590.66,
    "end": 591.36,
    "text": "Der Schnee.",
    "vi": "Tuyết."
  },
  {
    "id": 500151,
    "parentId": 151,
    "start": 592.43,
    "end": 594.07,
    "text": "Er hat meine Landung abgefedert.",
    "vi": "Nó đã đỡ cho cú rơi của mình."
  },
  {
    "id": 500152,
    "parentId": 152,
    "start": 596.42,
    "end": 597.02,
    "text": "Nezuko.",
    "vi": "Nezuko."
  },
  {
    "id": 500153,
    "parentId": 153,
    "start": 603.91,
    "end": 604.51,
    "text": "Nezuko.",
    "vi": "Nezuko."
  },
  {
    "id": 500154,
    "parentId": 154,
    "start": 605.28,
    "end": 606.24,
    "text": "Was ist nur mit dir?",
    "vi": "Em bị sao vậy?"
  },
  {
    "id": 500155,
    "parentId": 155,
    "start": 607.49,
    "end": 608.67,
    "text": "Hör mal, du musst nicht laufen.",
    "vi": "Nghe này, em không cần chạy đâu."
  },
  {
    "id": 500156,
    "parentId": 156,
    "start": 608.67,
    "end": 610.93,
    "text": "Ich kann dich bis zur Stadt tragen.",
    "vi": "Anh có thể cõng em xuống phố."
  },
  {
    "id": 500157,
    "parentId": 157,
    "start": 611.93,
    "end": 612.93,
    "text": "Hast du verstanden?",
    "vi": "Em hiểu không?"
  },
  {
    "id": 500158,
    "parentId": 158,
    "start": 622.08,
    "end": 622.68,
    "text": "Sie.",
    "vi": "Con bé."
  },
  {
    "id": 500159,
    "parentId": 159,
    "start": 623.65,
    "end": 624.57,
    "text": "Sie ist ...",
    "vi": "Con bé đã..."
  },
  {
    "id": 500160,
    "parentId": 160,
    "start": 625.21,
    "end": 626.21,
    "text": "ein Dämon.",
    "vi": "thành quỷ rồi."
  },
  {
    "id": 500161,
    "parentId": 161,
    "start": 627.68,
    "end": 630.52,
    "text": "Stimmt es tatsächlich, was der Alte Saburo gesagt hat?",
    "vi": "Những gì ông Saburo nói là thật sao?"
  },
  {
    "id": 500162,
    "parentId": 162,
    "start": 632.79,
    "end": 634.47,
    "text": "Ist Nezuko einer dieser Dämonen?",
    "vi": "Nezuko là một trong những con quỷ đó sao?"
  },
  {
    "id": 500163,
    "parentId": 163,
    "start": 635.27,
    "end": 635.61,
    "text": "Nein.",
    "vi": "Không."
  },
  {
    "id": 500164,
    "parentId": 164,
    "start": 636.33,
    "end": 638.17,
    "text": "Ich kenne sie schon seit sie auf der Welt ist.",
    "vi": "Anh biết em ấy từ khi em ấy chào đời."
  },
  {
    "id": 500165,
    "parentId": 165,
    "start": 639.47,
    "end": 641.31,
    "text": "Auch wenn sich ihr Geruch verändert hat.",
    "vi": "Dù mùi của em ấy đã thay đổi."
  },
  {
    "id": 500166,
    "parentId": 166,
    "start": 642.46,
    "end": 644.58,
    "text": "Nezuko hätte so etwas niemals getan.",
    "vi": "Nezuko không bao giờ làm chuyện như vậy."
  },
  {
    "id": 500167,
    "parentId": 167,
    "start": 644.58,
    "end": 648.01,
    "text": "Sie lag doch über Rokuta, als wollte sie ihn schützen.",
    "vi": "Em ấy còn nằm đè lên Rokuta như muốn che chở cho nó."
  },
  {
    "id": 500168,
    "parentId": 168,
    "start": 649.14,
    "end": 651.1,
    "text": "Und sie hatte auch kein Blut am Mund.",
    "vi": "Và miệng em ấy cũng không dính máu."
  },
  {
    "id": 500169,
    "parentId": 169,
    "start": 651.82,
    "end": 653.08,
    "text": "Außerdem ist da noch etwas.",
    "vi": "Hơn nữa còn một điều nữa."
  },
  {
    "id": 500170,
    "parentId": 170,
    "start": 653.76,
    "end": 655.4,
    "text": "Da ist noch ein anderer Geruch.",
    "vi": "Còn một mùi khác nữa."
  },
  {
    "id": 500171,
    "parentId": 171,
    "start": 664.91,
    "end": 666.65,
    "text": "Sie wird auch immer stärker.",
    "vi": "Con bé cũng ngày càng khỏe hơn."
  },
  {
    "id": 500172,
    "parentId": 172,
    "start": 667.66,
    "end": 669.72,
    "text": "Während ich in Sicherheit geschlafen habe,",
    "vi": "Trong khi mình ngủ yên an toàn,"
  },
  {
    "id": 500173,
    "parentId": 173,
    "start": 670.74,
    "end": 673.36,
    "text": "wurde meine ganze Familie hier abgeschlachtet.",
    "vi": "thì cả gia đình mình đã bị thảm sát ở đây."
  },
  {
    "id": 500174,
    "parentId": 174,
    "start": 674.8,
    "end": 675.82,
    "text": "Ich kann ...",
    "vi": "Anh không thể..."
  },
  {
    "id": 500175,
    "parentId": 175,
    "start": 675.82,
    "end": 677.54,
    "text": "ich kann mir nicht vorstellen,",
    "vi": "anh không thể tưởng tượng được,"
  },
  {
    "id": 500176,
    "parentId": 176,
    "start": 679.55,
    "end": 681.69,
    "text": "wie sehr du gelitten haben musst.",
    "vi": "em đã phải đau đớn đến mức nào."
  },
  {
    "id": 500177,
    "parentId": 177,
    "start": 683.33,
    "end": 685.59,
    "text": "Deshalb muss ich zumindest dir helfen, Nezuko.",
    "vi": "Vì thế ít nhất anh phải giúp em, Nezuko."
  },
  {
    "id": 500178,
    "parentId": 178,
    "start": 685.59,
    "end": 687.64,
    "text": "Aber du bist zu stark.",
    "vi": "Nhưng em khỏe quá."
  },
  {
    "id": 500179,
    "parentId": 179,
    "start": 688.1,
    "end": 689.54,
    "text": "Ich komme nicht gegen sie an.",
    "vi": "Anh không chống lại nổi em ấy."
  },
  {
    "id": 500180,
    "parentId": 180,
    "start": 690.06,
    "end": 692.99,
    "text": "Nezuko, du musst dich dagegen wehren.",
    "vi": "Nezuko, em phải chống lại nó."
  },
  {
    "id": 500181,
    "parentId": 181,
    "start": 693.35,
    "end": 694.47,
    "text": "Du musst durchhalten.",
    "vi": "Em phải cố chịu đựng."
  },
  {
    "id": 500182,
    "parentId": 182,
    "start": 694.87,
    "end": 695.67,
    "text": "Nur noch ein bisschen.",
    "vi": "Chỉ một chút nữa thôi."
  },
  {
    "id": 500183,
    "parentId": 183,
    "start": 697.63,
    "end": 699.35,
    "text": "Du darfst nicht zum Dämon werden.",
    "vi": "Em không được trở thành quỷ."
  },
  {
    "id": 500184,
    "parentId": 184,
    "start": 699.71,
    "end": 700.65,
    "text": "Reiß dich zusammen.",
    "vi": "Tỉnh táo lại đi."
  },
  {
    "id": 500185,
    "parentId": 185,
    "start": 701.37,
    "end": 702.09,
    "text": "Sei jetzt stark!",
    "vi": "Giờ hãy mạnh mẽ lên!"
  },
  {
    "id": 500186,
    "parentId": 186,
    "start": 703.13,
    "end": 704.07,
    "text": "Sei stark!",
    "vi": "Mạnh mẽ lên!"
  },
  {
    "id": 500187,
    "parentId": 187,
    "start": 737.0,
    "end": 737.78,
    "text": "Was soll das?",
    "vi": "Chuyện gì thế này?"
  },
  {
    "id": 500188,
    "parentId": 188,
    "start": 742.54,
    "end": 743.34,
    "text": "Wer ist das?",
    "vi": "Người đó là ai?"
  },
  {
    "id": 500189,
    "parentId": 189,
    "start": 748.33,
    "end": 748.97,
    "text": "Ein Katana?",
    "vi": "Một thanh katana?"
  },
  {
    "id": 500190,
    "parentId": 190,
    "start": 750.49,
    "end": 751.83,
    "text": "Wieso beschützt du sie?",
    "vi": "Sao cậu lại bảo vệ nó?"
  },
  {
    "id": 500191,
    "parentId": 191,
    "start": 752.19,
    "end": 754.99,
    "text": "Ganz einfach, weil sie meine kleine Schwester ist.",
    "vi": "Đơn giản thôi, vì đó là em gái tôi."
  },
  {
    "id": 500192,
    "parentId": 192,
    "start": 758.99,
    "end": 759.27,
    "text": "Nicht!",
    "vi": "Đừng!"
  },
  {
    "id": 500193,
    "parentId": 193,
    "start": 759.93,
    "end": 760.49,
    "text": "Nezuko!",
    "vi": "Nezuko!"
  },
  {
    "id": 500194,
    "parentId": 194,
    "start": 763.15,
    "end": 765.13,
    "text": "Das da ist wirklich deine Schwester?",
    "vi": "Đó thật sự là em gái cậu sao?"
  },
  {
    "id": 500195,
    "parentId": 195,
    "start": 781.55,
    "end": 782.11,
    "text": "Nezuko!",
    "vi": "Nezuko!"
  },
  {
    "id": 500196,
    "parentId": 196,
    "start": 782.51,
    "end": 783.33,
    "text": "Kein Schritt weiter!",
    "vi": "Không được bước thêm bước nào nữa!"
  },
  {
    "id": 500197,
    "parentId": 197,
    "start": 787.28,
    "end": 789.72,
    "text": "Es ist meine Pflicht, jeden Dämon zu vernichten.",
    "vi": "Nhiệm vụ của ta là tiêu diệt mọi con quỷ."
  },
  {
    "id": 500198,
    "parentId": 198,
    "start": 790.08,
    "end": 791.9,
    "text": "Ob sie deine Schwester ist oder nicht,",
    "vi": "Dù nó có là em gái cậu hay không,"
  },
  {
    "id": 500199,
    "parentId": 199,
    "start": 792.02,
    "end": 793.22,
    "text": "ich schlage ihr den Kopf ab.",
    "vi": "ta cũng sẽ chặt đầu nó."
  },
  {
    "id": 500200,
    "parentId": 200,
    "start": 793.78,
    "end": 794.76,
    "text": "Nein, warte!",
    "vi": "Không, khoan đã!"
  },
  {
    "id": 500201,
    "parentId": 201,
    "start": 795.38,
    "end": 797.1,
    "text": "Nezuko hat niemanden getötet.",
    "vi": "Nezuko chưa giết ai cả."
  },
  {
    "id": 500202,
    "parentId": 202,
    "start": 798.48,
    "end": 800.54,
    "text": "Bei uns zu Hause habe ich noch einen anderen,",
    "vi": "Ở nhà chúng tôi, tôi còn ngửi thấy một mùi khác,"
  },
  {
    "id": 500203,
    "parentId": 203,
    "start": 800.54,
    "end": 802.66,
    "text": "einen fremden Geruch wahrgenommen.",
    "vi": "một mùi lạ."
  },
  {
    "id": 500204,
    "parentId": 204,
    "start": 803.14,
    "end": 803.82,
    "text": "Dieser Fremde.",
    "vi": "Chính kẻ lạ đó."
  },
  {
    "id": 500205,
    "parentId": 205,
    "start": 804.28,
    "end": 806.74,
    "text": "Er hat meine Familie getötet.",
    "vi": "Hắn đã giết cả gia đình tôi."
  },
  {
    "id": 500206,
    "parentId": 206,
    "start": 807.34,
    "end": 808.9,
    "text": "Nezuko hat nichts damit zu tun.",
    "vi": "Nezuko không liên quan gì cả."
  },
  {
    "id": 500207,
    "parentId": 207,
    "start": 809.4,
    "end": 810.88,
    "text": "Auch wenn ich keine Ahnung habe,",
    "vi": "Dù tôi cũng không hiểu,"
  },
  {
    "id": 500208,
    "parentId": 208,
    "start": 811.02,
    "end": 812.3,
    "text": "wieso sie sich gerade so benimmt.",
    "vi": "sao em ấy lại hành động như vậy."
  },
  {
    "id": 500209,
    "parentId": 209,
    "start": 812.92,
    "end": 813.68,
    "text": "Verstehst du?",
    "vi": "Anh hiểu không?"
  },
  {
    "id": 500210,
    "parentId": 210,
    "start": 814.22,
    "end": 815.9,
    "text": "Es gibt eine einfache Erklärung.",
    "vi": "Có một cách giải thích đơn giản."
  },
  {
    "id": 500211,
    "parentId": 211,
    "start": 816.66,
    "end": 818.22,
    "text": "Dämonenblut gelangt in ihre Wunden",
    "vi": "Máu quỷ đã ngấm vào vết thương của nó,"
  },
  {
    "id": 500212,
    "parentId": 212,
    "start": 818.22,
    "end": 819.64,
    "text": "und dadurch wurde sie auch zum Dämon.",
    "vi": "và vì thế nó cũng biến thành quỷ."
  },
  {
    "id": 500213,
    "parentId": 213,
    "start": 821.35,
    "end": 823.87,
    "text": "So vermehren sich die menschenfressenden Dämonen.",
    "vi": "Lũ quỷ ăn thịt người sinh sôi theo cách đó đấy."
  },
  {
    "id": 500214,
    "parentId": 214,
    "start": 824.73,
    "end": 826.71,
    "text": "Nezuko würde niemals Menschen fressen.",
    "vi": "Nezuko không bao giờ ăn thịt người."
  },
  {
    "id": 500215,
    "parentId": 215,
    "start": 827.59,
    "end": 828.81,
    "text": "Hörst du dir überhaupt zu?",
    "vi": "Cậu có nghe chính mình nói gì không?"
  },
  {
    "id": 500216,
    "parentId": 216,
    "start": 828.81,
    "end": 830.89,
    "text": "Sie hat dich eben attackiert.",
    "vi": "Nó vừa tấn công cậu đấy."
  },
  {
    "id": 500217,
    "parentId": 217,
    "start": 831.05,
    "end": 832.85,
    "text": "Wäre ich nicht gekommen, hätte sie dich gefressen.",
    "vi": "Nếu ta không đến, nó đã ăn thịt cậu rồi."
  },
  {
    "id": 500218,
    "parentId": 218,
    "start": 833.4,
    "end": 834.38,
    "text": "Das stimmt nicht.",
    "vi": "Không đúng."
  },
  {
    "id": 500219,
    "parentId": 219,
    "start": 834.78,
    "end": 837.38,
    "text": "Sie ist noch verwirrt und hat mich einfach nicht erkannt.",
    "vi": "Em ấy chỉ đang hoảng loạn và không nhận ra tôi thôi."
  },
  {
    "id": 500220,
    "parentId": 220,
    "start": 838.02,
    "end": 839.98,
    "text": "Sie könnte niemals jemanden verletzen.",
    "vi": "Em ấy không bao giờ làm hại ai."
  },
  {
    "id": 500221,
    "parentId": 221,
    "start": 840.64,
    "end": 842.28,
    "text": "Irgendwie verwandle ich sie schon zurück.",
    "vi": "Bằng cách nào đó tôi sẽ biến em ấy trở lại."
  },
  {
    "id": 500222,
    "parentId": 222,
    "start": 842.72,
    "end": 844.26,
    "text": "Irgendwie werde ich sie heilen.",
    "vi": "Bằng cách nào đó tôi sẽ chữa cho em ấy."
  },
  {
    "id": 500223,
    "parentId": 223,
    "start": 845.04,
    "end": 846.12,
    "text": "Es gibt keine Heilung.",
    "vi": "Không có cách chữa đâu."
  },
  {
    "id": 500224,
    "parentId": 224,
    "start": 846.68,
    "end": 849.22,
    "text": "Wer einmal ein Dämon ist, kann nie wieder ein Mensch werden.",
    "vi": "Kẻ nào đã thành quỷ thì không bao giờ làm người lại được."
  },
  {
    "id": 500225,
    "parentId": 225,
    "start": 849.91,
    "end": 851.17,
    "text": "Ich schaffe es.",
    "vi": "Tôi sẽ làm được."
  },
  {
    "id": 500226,
    "parentId": 226,
    "start": 851.39,
    "end": 853.39,
    "text": "Ich finde einen Weg, sie zurückzu verwandeln.",
    "vi": "Tôi sẽ tìm ra cách biến em ấy trở lại."
  },
  {
    "id": 500227,
    "parentId": 227,
    "start": 853.99,
    "end": 855.51,
    "text": "Bitte töte sie nicht.",
    "vi": "Xin đừng giết em ấy."
  },
  {
    "id": 500228,
    "parentId": 228,
    "start": 856.28,
    "end": 857.82,
    "text": "Lass mich denjenigen finden,",
    "vi": "Hãy để tôi tìm ra kẻ,"
  },
  {
    "id": 500229,
    "parentId": 229,
    "start": 857.82,
    "end": 859.82,
    "text": "der das meiner Familie angetan hat,",
    "vi": "kẻ đã làm điều này với gia đình tôi,"
  },
  {
    "id": 500230,
    "parentId": 230,
    "start": 860.44,
    "end": 861.46,
    "text": "Ich übernehme das.",
    "vi": "tôi sẽ tự tay xử lý."
  },
  {
    "id": 500231,
    "parentId": 231,
    "start": 861.84,
    "end": 862.26,
    "text": "Bitte!",
    "vi": "Xin anh!"
  },
  {
    "id": 500232,
    "parentId": 232,
    "start": 866.4,
    "end": 867.99,
    "text": "Ich kann nicht.",
    "vi": "Tôi không thể."
  },
  {
    "id": 500233,
    "parentId": 233,
    "start": 868.53,
    "end": 869.81,
    "text": "Noch jemanden verlieren.",
    "vi": "Mất thêm một người nữa."
  },
  {
    "id": 500234,
    "parentId": 234,
    "start": 871.78,
    "end": 872.98,
    "text": "Bitte, hör auf.",
    "vi": "Xin anh, dừng lại đi."
  },
  {
    "id": 500235,
    "parentId": 235,
    "start": 874.88,
    "end": 875.68,
    "text": "Töte sie nicht.",
    "vi": "Đừng giết em ấy."
  },
  {
    "id": 500236,
    "parentId": 236,
    "start": 876.42,
    "end": 878.18,
    "text": "Sie ist alles, was ich noch habe.",
    "vi": "Em ấy là tất cả những gì tôi còn lại."
  },
  {
    "id": 500237,
    "parentId": 237,
    "start": 879.02,
    "end": 880.32,
    "text": "Ich flehe dich an.",
    "vi": "Tôi cầu xin anh."
  },
  {
    "id": 500238,
    "parentId": 238,
    "start": 892.44,
    "end": 895.53,
    "text": "Du darfst niemals einem anderen die Macht über Leben und Tod geben.",
    "vi": "Cậu không bao giờ được trao cho kẻ khác quyền sinh sát."
  },
  {
    "id": 500239,
    "parentId": 239,
    "start": 897.02,
    "end": 899.58,
    "text": "Was kauerst du denn da nur so erbärmlich am Boden?",
    "vi": "Sao cậu cứ co ro thảm hại dưới đất thế?"
  },
  {
    "id": 500240,
    "parentId": 240,
    "start": 900.24,
    "end": 902.28,
    "text": "So hättest du deine Familie nicht retten können.",
    "vi": "Như thế thì cậu đã chẳng cứu được gia đình mình."
  },
  {
    "id": 500241,
    "parentId": 241,
    "start": 902.56,
    "end": 904.06,
    "text": "Denn hier geht es um alles oder nichts.",
    "vi": "Vì ở đây chỉ có được ăn cả, ngã về không."
  },
  {
    "id": 500242,
    "parentId": 242,
    "start": 905.0,
    "end": 906.54,
    "text": "Denkst du denn wirklich ein Schwächling,",
    "vi": "Cậu thật sự nghĩ một kẻ yếu đuối,"
  },
  {
    "id": 500243,
    "parentId": 243,
    "start": 906.58,
    "end": 908.72,
    "text": "wie du, hättest das Zeug dazu, ein Dämon zu heilen?",
    "vi": "như cậu, lại có thể chữa cho một con quỷ sao?"
  },
  {
    "id": 500244,
    "parentId": 244,
    "start": 909.3,
    "end": 911.4,
    "text": "Oder gar an den wahren Tätern Rache zu nehmen?",
    "vi": "Hay thậm chí trả thù được những kẻ thủ ác thật sự?"
  },
  {
    "id": 500245,
    "parentId": 245,
    "start": 911.86,
    "end": 913.4,
    "text": "Das ist armselig.",
    "vi": "Thật thảm hại."
  },
  {
    "id": 500246,
    "parentId": 246,
    "start": 914.31,
    "end": 916.75,
    "text": "Die Schwachen haben keine Rechte und keine Wahl.",
    "vi": "Kẻ yếu không có quyền, cũng không có lựa chọn."
  },
  {
    "id": 500247,
    "parentId": 247,
    "start": 917.65,
    "end": 919.89,
    "text": "Sie werden immer durch die Kraft der Starken unterdrückt.",
    "vi": "Chúng luôn bị sức mạnh của kẻ mạnh chèn ép."
  },
  {
    "id": 500248,
    "parentId": 248,
    "start": 921.25,
    "end": 922.93,
    "text": "Vielleicht weiß ja einer der Dämonen,",
    "vi": "Có lẽ một con quỷ nào đó lại biết,"
  },
  {
    "id": 500249,
    "parentId": 249,
    "start": 922.93,
    "end": 924.43,
    "text": "wie man deiner Schwester helfen kann.",
    "vi": "cách giúp em gái cậu."
  },
  {
    "id": 500250,
    "parentId": 250,
    "start": 924.43,
    "end": 927.63,
    "text": "Nur leider sind diesen dreckigen Dämonen",
    "vi": "Chỉ tiếc là với lũ quỷ bẩn thỉu đó,"
  },
  {
    "id": 500251,
    "parentId": 251,
    "start": 927.63,
    "end": 930.07,
    "text": "deine Wünsche und Begierden vollkommen gleich, verstehst du?",
    "vi": "mong muốn và khát khao của cậu hoàn toàn chẳng là gì, hiểu không?"
  },
  {
    "id": 500252,
    "parentId": 252,
    "start": 930.61,
    "end": 933.45,
    "text": "Und ich interessiere mich ebenso wenig für deine Wünsche.",
    "vi": "Và ta cũng chẳng quan tâm gì đến mong muốn của cậu."
  },
  {
    "id": 500253,
    "parentId": 253,
    "start": 933.79,
    "end": 934.75,
    "text": "Das ist die Realität.",
    "vi": "Đó là hiện thực."
  },
  {
    "id": 500254,
    "parentId": 254,
    "start": 935.31,
    "end": 937.19,
    "text": "Wieso hast du dich über deine Schwester geworfen?",
    "vi": "Sao cậu lại lao ra che cho em gái mình?"
  },
  {
    "id": 500255,
    "parentId": 255,
    "start": 937.77,
    "end": 939.21,
    "text": "Wolltest du sie so etwa beschützen?",
    "vi": "Cậu định bảo vệ nó như thế sao?"
  },
  {
    "id": 500256,
    "parentId": 256,
    "start": 940.42,
    "end": 942.32,
    "text": "Hättest du stattdessen deine Axt gezogen",
    "vi": "Giá mà lúc đó cậu rút rìu ra,"
  },
  {
    "id": 500257,
    "parentId": 257,
    "start": 942.32,
    "end": 944.56,
    "text": "und mir nicht den Rücken zugekehrt?",
    "vi": "thay vì quay lưng lại với ta?"
  },
  {
    "id": 500258,
    "parentId": 258,
    "start": 944.78,
    "end": 946.38,
    "text": "Deine Fehler haben zugelassen,",
    "vi": "Chính sai lầm của cậu đã tạo cơ hội,"
  },
  {
    "id": 500259,
    "parentId": 259,
    "start": 946.44,
    "end": 947.58,
    "text": "dass ich sie mir schnappen konnte.",
    "vi": "để ta bắt được nó."
  },
  {
    "id": 500260,
    "parentId": 260,
    "start": 948.16,
    "end": 950.42,
    "text": "Wolltest du etwa, dass ich euch beide zusammen aufspieße?",
    "vi": "Cậu muốn ta xiên cả hai anh em cậu cùng lúc à?"
  },
  {
    "id": 500261,
    "parentId": 261,
    "start": 954.28,
    "end": 956.74,
    "text": "Weine nicht. Verzweifle nicht.",
    "vi": "Đừng khóc. Đừng tuyệt vọng."
  },
  {
    "id": 500262,
    "parentId": 262,
    "start": 957.7,
    "end": 959.64,
    "text": "Das ist das Letzte, das du jetzt tun solltest.",
    "vi": "Đó là điều cuối cùng cậu nên làm lúc này."
  },
  {
    "id": 500263,
    "parentId": 263,
    "start": 960.77,
    "end": 962.71,
    "text": "Ich weiß, dass du am Boden zerstört bist.",
    "vi": "Ta biết cậu đang sụp đổ hoàn toàn."
  },
  {
    "id": 500264,
    "parentId": 264,
    "start": 963.53,
    "end": 964.89,
    "text": "Deine Familie wurde getötet.",
    "vi": "Gia đình cậu đã bị giết."
  },
  {
    "id": 500265,
    "parentId": 265,
    "start": 965.35,
    "end": 966.49,
    "text": "Deine Schwester ist ein Dämon.",
    "vi": "Em gái cậu là một con quỷ."
  },
  {
    "id": 500266,
    "parentId": 266,
    "start": 967.4,
    "end": 968.36,
    "text": "Das tut weh.",
    "vi": "Đau lắm."
  },
  {
    "id": 500267,
    "parentId": 267,
    "start": 969.25,
    "end": 970.63,
    "text": "Sicherlich willst du schreien.",
    "vi": "Chắc hẳn cậu muốn hét lên."
  },
  {
    "id": 500268,
    "parentId": 268,
    "start": 971.83,
    "end": 972.75,
    "text": "Ich verstehe dich.",
    "vi": "Ta hiểu cậu."
  },
  {
    "id": 500269,
    "parentId": 269,
    "start": 974.33,
    "end": 976.61,
    "text": "Wäre ich nur einen halben Tag früher hier gewesen,",
    "vi": "Giá như ta đến sớm hơn chỉ nửa ngày,"
  },
  {
    "id": 500270,
    "parentId": 270,
    "start": 977.61,
    "end": 979.81,
    "text": "hätte deine Familie vermutlich nicht sterben müssen.",
    "vi": "gia đình cậu có lẽ đã không phải chết."
  },
  {
    "id": 500271,
    "parentId": 271,
    "start": 981.36,
    "end": 984.31,
    "text": "Aber niemand vermag es, die Zeit zurückzudrehen.",
    "vi": "Nhưng không ai có thể quay ngược thời gian."
  },
  {
    "id": 500272,
    "parentId": 272,
    "start": 985.04,
    "end": 986.6,
    "text": "Fühle die Wut.",
    "vi": "Hãy cảm nhận cơn giận."
  },
  {
    "id": 500273,
    "parentId": 273,
    "start": 987.41,
    "end": 989.55,
    "text": "Spüre den Zorn über etwas Unverzeihliches.",
    "vi": "Cảm nhận cơn phẫn nộ trước điều không thể tha thứ."
  },
  {
    "id": 500274,
    "parentId": 274,
    "start": 990.19,
    "end": 993.25,
    "text": "Er wird dir die Kraft geben, aufzustehen und weiterzugehen.",
    "vi": "Nó sẽ cho cậu sức mạnh để đứng lên và bước tiếp."
  },
  {
    "id": 500275,
    "parentId": 275,
    "start": 993.89,
    "end": 995.37,
    "text": "Wenn du nicht stark genug bist,",
    "vi": "Nếu cậu không đủ mạnh,"
  },
  {
    "id": 500276,
    "parentId": 276,
    "start": 996.27,
    "end": 998.63,
    "text": "wirst du deine Schwester weder retten noch heilen können.",
    "vi": "cậu sẽ chẳng cứu nổi em gái, cũng chẳng chữa được cho nó."
  },
  {
    "id": 500277,
    "parentId": 277,
    "start": 999.45,
    "end": 1001.25,
    "text": "So rächst du deine Familie niemals.",
    "vi": "Như thế cậu sẽ không bao giờ trả được thù cho gia đình."
  },
  {
    "id": 500278,
    "parentId": 278,
    "start": 1021.98,
    "end": 1024.18,
    "text": "Ein direkter Angriff getrieben von Emotionen.",
    "vi": "Một đòn tấn công trực diện bị cảm xúc dẫn dắt."
  },
  {
    "id": 500279,
    "parentId": 279,
    "start": 1025.04,
    "end": 1025.94,
    "text": "Wirklich frech!",
    "vi": "Thật hỗn xược!"
  },
  {
    "id": 500280,
    "parentId": 280,
    "start": 1040.32,
    "end": 1041.6,
    "text": "Wo ist seine Axt?",
    "vi": "Rìu của nó đâu?"
  },
  {
    "id": 500281,
    "parentId": 281,
    "start": 1051.28,
    "end": 1053.3,
    "text": "Bevor er sich hinter den Bäumen versteckt hat,",
    "vi": "Trước khi nấp sau những cái cây,"
  },
  {
    "id": 500282,
    "parentId": 282,
    "start": 1053.84,
    "end": 1056.02,
    "text": "warf er nicht nur den Stein nach mir,",
    "vi": "nó không chỉ ném đá vào ta,"
  },
  {
    "id": 500283,
    "parentId": 283,
    "start": 1056.67,
    "end": 1058.79,
    "text": "sondern gleichzeitig auch seine Axt nach oben.",
    "vi": "mà đồng thời còn ném cả chiếc rìu lên trời."
  },
  {
    "id": 500284,
    "parentId": 284,
    "start": 1060.53,
    "end": 1062.57,
    "text": "Und um zu verbergen, dass er unbewaffnet war,",
    "vi": "Và để che giấu việc mình không có vũ khí,"
  },
  {
    "id": 500285,
    "parentId": 285,
    "start": 1063.37,
    "end": 1065.41,
    "text": "verbarg er mit seiner Haltung die Sicht auf seine Hände.",
    "vi": "nó dùng tư thế của mình để che khuất đôi tay."
  },
  {
    "id": 500286,
    "parentId": 286,
    "start": 1067.26,
    "end": 1069.5,
    "text": "Er wusste bereits, dass er keine Chance gegen mich hat.",
    "vi": "Nó đã biết trước mình không có cửa thắng ta."
  },
  {
    "id": 500287,
    "parentId": 287,
    "start": 1070.56,
    "end": 1071.86,
    "text": "Die Axt sollte mich erwischen,",
    "vi": "Chiếc rìu lẽ ra sẽ trúng ta,"
  },
  {
    "id": 500288,
    "parentId": 288,
    "start": 1072.56,
    "end": 1073.94,
    "text": "nachdem ich ihn niedergestreckt habe.",
    "vi": "sau khi ta hạ gục nó."
  },
  {
    "id": 500289,
    "parentId": 289,
    "start": 1075.67,
    "end": 1076.37,
    "text": "Dieser Junge.",
    "vi": "Cậu bé này."
  },
  {
    "id": 500290,
    "parentId": 290,
    "start": 1082.84,
    "end": 1083.7,
    "text": "Sie wird ihn fressen!",
    "vi": "Nó sẽ ăn thịt anh nó mất!"
  },
  {
    "id": 500291,
    "parentId": 291,
    "start": 1088.84,
    "end": 1089.5,
    "text": "Nein, warte!",
    "vi": "Không, khoan đã!"
  },
  {
    "id": 500292,
    "parentId": 292,
    "start": 1093.58,
    "end": 1095.24,
    "text": "Nezuko hat niemanden getötet.",
    "vi": "Nezuko chưa giết ai cả."
  },
  {
    "id": 500293,
    "parentId": 293,
    "start": 1097.41,
    "end": 1099.39,
    "text": "Nezuko würde niemals Menschen fressen.",
    "vi": "Nezuko không bao giờ ăn thịt người."
  },
  {
    "id": 500294,
    "parentId": 294,
    "start": 1102.56,
    "end": 1106.16,
    "text": "Vor langer Zeit sagte jemand auch diese Worte",
    "vi": "Ngày xưa cũng từng có người nói những lời y như vậy,"
  },
  {
    "id": 500295,
    "parentId": 295,
    "start": 1106.16,
    "end": 1108.82,
    "text": "und wurde trotzdem vom Dämon gefressen.",
    "vi": "rồi vẫn bị con quỷ đó ăn thịt."
  },
  {
    "id": 500296,
    "parentId": 296,
    "start": 1109.55,
    "end": 1111.11,
    "text": "Wenn ein Dämon ausgehungert ist,",
    "vi": "Khi một con quỷ đói khát,"
  },
  {
    "id": 500297,
    "parentId": 297,
    "start": 1112.17,
    "end": 1114.27,
    "text": "tötet und frisst er selbst seine Eltern und Geschwister.",
    "vi": "nó sẽ giết và ăn cả cha mẹ và anh chị em của mình."
  },
  {
    "id": 500298,
    "parentId": 298,
    "start": 1115.13,
    "end": 1116.73,
    "text": "Sie sind besonders nährstoffreich für ihn.",
    "vi": "Chúng đặc biệt giàu dinh dưỡng đối với nó."
  },
  {
    "id": 500299,
    "parentId": 299,
    "start": 1117.82,
    "end": 1119.86,
    "text": "Unzählige Male schon habe ich das beobachtet.",
    "vi": "Ta đã chứng kiến điều đó vô số lần."
  },
  {
    "id": 500300,
    "parentId": 300,
    "start": 1121.91,
    "end": 1123.59,
    "text": "Dieses Mädchen ist schwer verletzt.",
    "vi": "Cô bé này bị thương nặng."
  },
  {
    "id": 500301,
    "parentId": 301,
    "start": 1124.6,
    "end": 1127.24,
    "text": "Sicherlich nutzt sie eine Menge ihrer Kraft, um sich zu regenerieren.",
    "vi": "Chắc hẳn nó đang dùng rất nhiều sức để hồi phục."
  },
  {
    "id": 500302,
    "parentId": 302,
    "start": 1128.33,
    "end": 1129.93,
    "text": "Auch bei der Verwandlung in einen Dämon",
    "vi": "Ngay cả việc biến thành quỷ,"
  },
  {
    "id": 500303,
    "parentId": 303,
    "start": 1129.93,
    "end": 1131.59,
    "text": "dürfte sie viel Energie verloren haben.",
    "vi": "có lẽ cũng đã làm nó mất nhiều năng lượng."
  },
  {
    "id": 500304,
    "parentId": 304,
    "start": 1131.59,
    "end": 1135.94,
    "text": "Das bedeutet, sie ist gerade komplett ausgehungert.",
    "vi": "Nghĩa là lúc này nó đang hoàn toàn đói khát."
  },
  {
    "id": 500305,
    "parentId": 305,
    "start": 1137.36,
    "end": 1139.5,
    "text": "Eigentlich sollte sie sich auf menschliches Fleisch",
    "vi": "Đáng lẽ nó phải lao vào thịt người,"
  },
  {
    "id": 500306,
    "parentId": 306,
    "start": 1139.5,
    "end": 1140.98,
    "text": "und Blut regelrecht stürzen.",
    "vi": "và máu một cách điên cuồng."
  },
  {
    "id": 500307,
    "parentId": 307,
    "start": 1142.2,
    "end": 1143.72,
    "text": "Und doch beschützt sie ihn.",
    "vi": "Vậy mà nó lại bảo vệ cậu bé."
  },
  {
    "id": 500308,
    "parentId": 308,
    "start": 1144.28,
    "end": 1145.56,
    "text": "Sie sieht mich als Bedrohung.",
    "vi": "Nó coi ta là mối đe dọa."
  },
  {
    "id": 500309,
    "parentId": 309,
    "start": 1148.79,
    "end": 1149.75,
    "text": "Diese beiden.",
    "vi": "Hai anh em này."
  },
  {
    "id": 500310,
    "parentId": 310,
    "start": 1150.64,
    "end": 1153.14,
    "text": "Vielleicht sind sie ja eine Ausnahme.",
    "vi": "Có lẽ chúng thật sự là một ngoại lệ."
  },
  {
    "id": 500311,
    "parentId": 311,
    "start": 1171.46,
    "end": 1175.86,
    "text": "Verzeih, dass wir euch zurückgelassen haben, mein Junge!",
    "vi": "Xin lỗi vì đã bỏ lại hai anh em con, con trai của ta!"
  },
  {
    "id": 500312,
    "parentId": 312,
    "start": 1176.82,
    "end": 1178.54,
    "text": "Kümmere dich um deine Schwester!",
    "vi": "Hãy chăm sóc em gái con nhé!"
  },
  {
    "id": 500313,
    "parentId": 313,
    "start": 1190.55,
    "end": 1191.25,
    "text": "Du bist wach.",
    "vi": "Em tỉnh rồi à."
  },
  {
    "id": 500314,
    "parentId": 314,
    "start": 1195.14,
    "end": 1197.76,
    "text": "Nimm deine Schwester und suche nach Sakonji Urokodaki.",
    "vi": "Dẫn em gái cậu đi tìm Sakonji Urokodaki."
  },
  {
    "id": 500315,
    "parentId": 315,
    "start": 1197.76,
    "end": 1199.76,
    "text": "Er lebt am Fuße des Sagiri-Bergs.",
    "vi": "Ông ấy sống dưới chân núi Sagiri."
  },
  {
    "id": 500316,
    "parentId": 316,
    "start": 1201.31,
    "end": 1204.09,
    "text": "Sag ihm, Giyu Tomioka würde dich zu ihm schicken.",
    "vi": "Nói với ông ấy rằng Giyu Tomioka cử cậu đến."
  },
  {
    "id": 500317,
    "parentId": 317,
    "start": 1205.95,
    "end": 1208.79,
    "text": "Jetzt, da es bewölkt ist, scheint es deiner Schwester gut zu gehen.",
    "vi": "Lúc này trời đang nhiều mây, em gái cậu có vẻ ổn."
  },
  {
    "id": 500318,
    "parentId": 318,
    "start": 1209.45,
    "end": 1211.29,
    "text": "Aber lasse sie niemals direkt in die Sonne.",
    "vi": "Nhưng đừng bao giờ để nó ra nắng trực tiếp."
  }
];
