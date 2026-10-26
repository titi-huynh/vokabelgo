/* Chapter bounds sit between complete spoken turns; all sources remain original MP4s. */
const KINO_ALIASES = { frieren_s01e02: 'frieren2', sakura_s01e02: 'sakura2', k_on_s01e01: 'kon', delicious_in_dungeon_s01e01: 'dungeon', peppa_supermarkt: 'peppa', pizzaschwester: 'pizza', babysitter: 'babysitter', hans: 'hans', trudes_fahrstuhl: 'trude', erdmaennchen_nudeltrick: 'nudeltrick', erdmaennchen_schmucklose: 'schmucklose', pinguine_popcorn_panik: 'pinguine', courage_diamantraub: 'courage', spongebob_pizza: 'spongebob', we_bare_bears_mall: 'bears', frieren_s01e01: 'frieren', sakura_s01e01: 'sakura', druck_s07e01: 'druck', simplicissimus_leberwurst: 'simplicissimus', trudes_bagger: 'bagger', erdmaennchen_spukschloss: 'spukschloss', spy_family_s01e01: 'spy', demon_slayer_s01e01: 'demon' };
const KINO_CHAPTER_DATA = {
  frieren_s01e02: { ...FRIEREN_S01E02_LESSON.chapterData, genre: 'Anime', get cues() { return FRIEREN_S01E02_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('frieren_s01e02'); } },
  sakura_s01e02: { ...SAKURA_S01E02_LESSON.chapterData, genre: 'Anime', get cues() { return SAKURA_S01E02_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('sakura_s01e02'); } },
  k_on_s01e01: { ...K_ON_S01E01_LESSON.chapterData, genre: 'Anime', get cues() { return K_ON_S01E01_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('k_on_s01e01'); } },
  delicious_in_dungeon_s01e01: { ...DELICIOUS_IN_DUNGEON_S01E01_LESSON.chapterData, genre: 'Anime', get cues() { return DELICIOUS_IN_DUNGEON_S01E01_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('delicious_in_dungeon_s01e01'); } },
  peppa_supermarkt: {
    genre: 'Thiếu nhi',
    title: 'Im Supermarkt', series: 'PEPPA WUTZ', levelLabel: 'Gợi ý A1–A2',
    storageKey: 'vokabelgo_kino_peppa_chapters_v1', cueCount: 312,
    legacyKey: 'vokabelgo_kino_progress_peppa_supermarkt', legacyCount: 106,
    get cues() { return PEPPA_ALIGNED_UTTERANCES; },
    chapters: [
    { title: 'Mua thực phẩm', icon: '🛒', start: 0, end: 177.72,
      picks: [100301, 100401, 100601, 100701, 101001, 101502, 101802], goal: 'Gọi tên thực phẩm và nghe những lời nhắc khi mua sắm.' },
    { title: 'Quầy thanh toán tự động', icon: '🧾', start: 177.72, end: 359.56,
      picks: [102301, 102302, 102501, 102602, 102902, 103403, 103701], goal: 'Làm quen với lời hướng dẫn ở quầy tự thanh toán.' },
    { title: 'Máy đồ chơi', icon: '🧸', start: 359.56, end: 548.56,
      picks: [104701, 104802, 105002, 105304, 105602, 105703, 106301], goal: 'Hỏi cách chơi, nói điều mình muốn và nhờ giúp đỡ.' },
    { title: 'Tự thiết kế đồ chơi', icon: '🎨', start: 548.56, end: 727.6,
      picks: [106702, 106703, 106801, 106901, 107201, 107303, 108002], goal: 'Nghe cách lựa chọn và mô tả món đồ chơi của mình.' },
    { title: 'Cùng làm tacos', icon: '🌮', start: 727.6, end: 919.04,
      picks: [108701, 108802, 109002, 109401, 109402, 109803, 110001], goal: 'Làm quen với nguyên liệu và các bước chuẩn bị món ăn.' }
  ]
  },
  pizzaschwester: {
    genre: 'Thiếu nhi',
    title: 'Pizza-Schwestern', series: 'BLUEY', levelLabel: 'Gợi ý A2',
    storageKey: 'vokabelgo_kino_chapters_v1_pizzaschwester', cueCount: 193,
    legacyKey: 'vokabelgo_kino_pizzaschwester_v3', legacyCount: 72,
    get cues() { return PIZZA_ALIGNED_UTTERANCES; },
    chapters: [
      { title: 'Tiệm pizza và chiếc xe cũ', icon: '🍕', start: 0, end: 134.5,
        picks: [200203,200302,200401,200502,200601,201001,201502],
        goal: 'Nhận đơn pizza, hỏi địa chỉ và giao món cho khách.' },
      { title: 'Thử chiếc xe mới', icon: '🚗', start: 134.5, end: 273.72,
        picks: [202302,202402,202502,203202,204602,204801,204803],
        goal: 'Mô tả chiếc xe mới, xin đến lượt và nói về việc sạc pin.' },
      { title: 'Trở lại tiệm pizza và sửa xe', icon: '🔧', start: 273.72, end: 419.97932,
        picks: [205102,205301,205701,205902,206601,206801,207104],
        goal: 'Cùng chơi tiếp, nhờ sửa xe và mang pizza đến cho khách.' }
    ]
  },
  babysitter: {
    genre: 'Thiếu nhi',
    title: 'Die Babysitter', series: 'BLUEY', levelLabel: 'Gợi ý A2',
    storageKey: 'vokabelgo_kino_chapters_v1_babysitter', cueCount: 171,
    legacyKey: 'vokabelgo_kino_progress_babysitter', legacyCount: 64,
    get cues() { return BABYSITTER_ALIGNED_UTTERANCES; },
    chapters: [
      { title: 'Người trông trẻ đến', icon: '👋', start: 0, end: 101.12,
        picks: [300201,300202,300303,300601,300704,301101,301201],
        goal: 'Chào hỏi, giới thiệu bản thân và làm quen với người trông trẻ.' },
      { title: 'Hỏi chuyện làm quen', icon: '💬', start: 101.12, end: 188.68,
        picks: [301601,301602,301702,301801,302201,302501,303002],
        goal: 'Đặt câu hỏi đơn giản và nói điều mình chưa quen.' },
      { title: 'Chơi và kể chuyện', icon: '📖', start: 188.68, end: 335.1,
        picks: [303303,303401,303702,303705,303902,304002,305003],
        goal: 'Rủ nhau chơi, hỏi ý kiến và theo dõi câu chuyện trước giờ ngủ.' },
      { title: 'Yên tâm trước giờ ngủ', icon: '🌙', start: 335.1, end: 416.821406,
        picks: [305501,305901,305902,305903,306001,306101,306201],
        goal: 'Nói về nỗi lo, lời hứa và thử một điều mới.' }
    ]
  },
  hans: { ...HANS_LESSON.chapterData, genre: 'Cổ tích', get cues() { return HANS_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('hans'); } },
  trudes_fahrstuhl: { ...TRUDES_FAHRSTUHL_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return TRUDES_FAHRSTUHL_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('trudes_fahrstuhl'); } },
  erdmaennchen_nudeltrick: { ...ERDMAENNCHEN_NUDELTRICK_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return ERDMAENNCHEN_NUDELTRICK_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('erdmaennchen_nudeltrick'); } },
  erdmaennchen_schmucklose: { ...ERDMAENNCHEN_SCHMUCKLOSE_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return ERDMAENNCHEN_SCHMUCKLOSE_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('erdmaennchen_schmucklose'); } },
  pinguine_popcorn_panik: { ...PINGUINE_POPCORN_PANIK_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return PINGUINE_POPCORN_PANIK_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('pinguine_popcorn_panik'); } },
  courage_diamantraub: { ...COURAGE_DIAMANTRAUB_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return COURAGE_DIAMANTRAUB_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('courage_diamantraub'); } },
  spongebob_pizza: { ...SPONGEBOB_PIZZA_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return SPONGEBOB_PIZZA_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('spongebob_pizza'); } },
  we_bare_bears_mall: { ...WE_BARE_BEARS_MALL_LESSON.chapterData, genre: 'Hoạt hình', get cues() { return WE_BARE_BEARS_MALL_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('we_bare_bears_mall'); } },
  frieren_s01e01: { ...FRIEREN_S01E01_LESSON.chapterData, genre: 'Anime', get cues() { return FRIEREN_S01E01_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('frieren_s01e01'); } },
  sakura_s01e01: { ...SAKURA_S01E01_LESSON.chapterData, genre: 'Anime', get cues() { return SAKURA_S01E01_ALIGNED_UTTERANCES; }, get captionCues() { return KinoData.captions('sakura_s01e01'); } }
,
  druck_s07e01: {
    genre: 'Tuổi teen',
    title: 'Alles ist verzaubert', series: 'DRUCK', levelLabel: 'Gợi ý B1–B2',
    catalogTitle: 'DRUCK · Alles ist verzaubert (Mùa 7 · Tập 1)',
    storageKey: 'vokabelgo_kino_chapters_v1_druck_s07e01', cueCount: 268,
    get cues() { return DRUCK_S07E01_ALIGNED_UTTERANCES; },
    chapters: [
    { title: 'Tin nhắn và chuyến đi', icon: '🎒', start: 0.04, end: 176.6,
      picks: [500001, 500002, 500003, 500004, 500005, 500006, 500007], goal: 'Chào hỏi, hẹn gặp lại và kể chuyện thường ngày qua tin nhắn thoại.' },
    { title: 'Ngày đầu của Lou', icon: '🏫', start: 177.84, end: 328.72,
      picks: [500047, 500048, 500049, 500050, 500051, 500052, 500053], goal: 'Chào đón học sinh mới và những câu xã giao đầu tiên ở trường.' },
    { title: 'Ngồi cạnh Lou', icon: '📚', start: 335.4, end: 503.04,
      picks: [500068, 500069, 500070, 500071, 500072, 500073, 500074], goal: 'Bắt chuyện làm quen và nói về sách vở, môn học.' },
    { title: 'Cây cảnh và bóng đá', icon: '🪴', start: 505.28, end: 745.8,
      picks: [500114, 500115, 500116, 500117, 500118, 500119, 500120], goal: 'Nói về sở thích, việc nhà và thể thao với bạn bè, gia đình.' },
    { title: 'Lời mời Halloween', icon: '🎃', start: 751.44, end: 922.64,
      picks: [500165, 500166, 500167, 500168, 500169, 500170, 500171], goal: 'Rủ rê đi chơi, bàn kế hoạch và nói sau lưng một cách dí dỏm.' },
    { title: 'Đêm Halloween', icon: '👻', start: 934.4, end: 1088.48,
      picks: [500205, 500206, 500207, 500208, 500209, 500210, 500211], goal: 'Phản ứng bất ngờ, rủ nhau khám phá nơi lạ.' },
    { title: 'Vòng tròn ma thuật', icon: '✨', start: 1089.76, end: 1246.8,
      picks: [500249, 500250, 500251, 500252, 500253, 500254, 500255], goal: 'Đùa giỡn, hô thần chú và chia sẻ bài hát yêu thích.' }
    ]
  },
  simplicissimus_leberwurst: {
    genre: 'Khoa học',
    title: 'Warum deine Leberwurst 1,09 € kostet', series: 'Simplicissimus', levelLabel: 'Gợi ý B2',
    catalogTitle: 'Simplicissimus · Warum deine Leberwurst 1,09 € kostet',
    storageKey: 'vokabelgo_kino_chapters_v1_simplicissimus_leberwurst', cueCount: 259,
    get cues() { return SIMPLICISSIMUS_LEBERWURST_ALIGNED_UTTERANCES; },
    chapters: [
    { title: 'Cái giá thật của xúc xích gan', icon: '🥩', start: 1.12, end: 242.3,
      picks: [500001, 500002, 500003, 500004, 500005, 500006, 500007], goal: 'Từ vựng về ngành công nghiệp thịt, mạng lưới lợi ích và chính trị.' },
    { title: 'Phân bón và nước ngầm', icon: '💧', start: 243.77, end: 423.68,
      picks: [500079, 500080, 500081, 500082, 500083, 500084, 500085], goal: 'Từ vựng môi trường: phân chuồng, nitrat, chỉ thị EU và giới hạn ô nhiễm.' },
    { title: 'Con người trả giá', icon: '👷', start: 428.03, end: 669.77,
      picks: [500142, 500143, 500144, 500145, 500146, 500147, 500148], goal: 'Từ vựng về điều kiện lao động, lao động nhập cư và trách nhiệm xã hội.' },
    { title: 'Luật mới và câu hỏi mở', icon: '⚖️', start: 669.88, end: 775.22,
      picks: [500226, 500227, 500228, 500229, 500230, 500231, 500232], goal: 'Theo dõi tranh luận lập pháp và những câu hỏi phản biện ở cuối video.' }
    ]
  }
,
  trudes_bagger: {
    genre: 'Hoạt hình',
    title: 'Bagger', series: 'Trudes Tier', levelLabel: 'Gợi ý A2',
    catalogTitle: 'Trudes Tier · Bagger',
    storageKey: 'vokabelgo_kino_chapters_v1_trudes_bagger', cueCount: 54,
    get cues() { return TRUDES_BAGGER_ALIGNED_UTTERANCES; },
    chapters: [
    { title: 'Chiếc máy xúc trong vườn', icon: '🚜', start: 0, end: 189.84,
      picks: [500001, 500002, 500003, 500004, 500005, 500006, 500007], goal: 'Phát hiện một vật lạ, hỏi xem chuyện gì đã xảy ra và giải thích.' },
    { title: 'Trả lại và xin lỗi', icon: '🙏', start: 191.56, end: 349.68,
      picks: [500030, 500031, 500032, 500033, 500034, 500035, 500036], goal: 'Học cách nói lời xin lỗi, nhận lỗi và sửa sai.' }
    ]
  }
,
  erdmaennchen_spukschloss: {
    genre: 'Hoạt hình',
    title: 'Das Spukschloss', series: 'Ein Fall für die Erdmännchen', levelLabel: 'Gợi ý A2–B1',
    catalogTitle: 'Ein Fall für die Erdmännchen · Das Spukschloss',
    storageKey: 'vokabelgo_kino_chapters_v1_erdmaennchen_spukschloss', cueCount: 201,
    get cues() { return ERDMAENNCHEN_SPUKSCHLOSS_ALIGNED_UTTERANCES; },
    chapters: [
    { title: 'Lâu đài của bà bá tước', icon: '🏰', start: 0, end: 190.84,
      picks: [500001, 500002, 500003, 500004, 500005, 500006, 500007], goal: 'Đến thăm một lâu đài và nghe kể về một bí ẩn ban đêm.' },
    { title: 'Kế hoạch dọa ma', icon: '🎭', start: 192.16, end: 355.78,
      picks: [500041, 500042, 500043, 500044, 500045, 500046, 500047], goal: 'Bàn kế hoạch, chuẩn bị mặt nạ và sẵn sàng cho ban đêm.' },
    { title: 'Ai là con ma?', icon: '🌙', start: 363.19, end: 537.25,
      picks: [500088, 500089, 500090, 500091, 500092, 500093, 500094], goal: 'Lần theo tiếng động lạ, thẩm vấn nghi phạm và loại trừ từng người.' },
    { title: 'Cư dân trên gác mái', icon: '🦇', start: 540.19, end: 694.53,
      picks: [500148, 500149, 500150, 500151, 500152, 500153, 500154], goal: 'Phát hiện sự thật bất ngờ và tìm giải pháp tốt cho mọi người.' },
    { title: 'Khai trương khách sạn ma', icon: '🎉', start: 695.92, end: 739.36,
      picks: [500187, 500188, 500189, 500190, 500191, 500192, 500193], goal: 'Chào đón vị khách đầu tiên và xử lý tình huống bất ngờ.' }
    ]
  }
,
  spy_family_s01e01: {
    genre: 'Anime',
    title: 'Operation Strix', series: 'SPY × FAMILY', levelLabel: 'Gợi ý B1',
    catalogTitle: 'SPY × FAMILY · Operation Strix',
    storageKey: 'vokabelgo_kino_chapters_v1_spy_family_s01e01', cueCount: 444,
    get cues() { return SPY_FAMILY_S01E01_ALIGNED_UTTERANCES; },
    chapters: [
    { title: 'Nhiệm vụ mang tên Strix', icon: '🎯', start: 3.47, end: 250.68,
      picks: [500001, 500002, 500003, 500004, 500005, 500006, 500007], goal: 'Nghe bối cảnh chiến tranh lạnh, màn giao ảnh và nhiệm vụ kỳ lạ: phải kết hôn và có con trong một tuần.' },
    { title: 'Nhận nuôi Anya', icon: '🏠', start: 256.3, end: 432.28,
      picks: [500085, 500086, 500087, 500088, 500089, 500090, 500091], goal: 'Theo dõi buổi xem nhà, chuyến đến trại trẻ và khoảnh khắc Anya giải ô chữ khiến Loid quyết định nhận nuôi.' },
    { title: 'Ngày đầu tiên làm cha', icon: '🛒', start: 433.1, end: 583.46,
      picks: [500155, 500156, 500157, 500158, 500159, 500160, 500161], goal: 'Học cách chào hàng xóm, dắt trẻ đi mua sắm, nắm tay và dỗ trẻ nín khóc.' },
    { title: 'Sách dạy con và giấy tờ giả', icon: '📚', start: 594.76, end: 767.0,
      picks: [500203, 500204, 500205, 500206, 500207, 500208, 500209], goal: 'Nghe lời khuyên nuôi dạy con trong sách, buổi ôn tập đầu tiên và thương vụ giấy tờ giả với Franky.' },
    { title: 'Anya nghịch máy phát tín hiệu', icon: '📻', start: 775.32, end: 939.23,
      picks: [500264, 500265, 500266, 500267, 500268, 500269, 500270], goal: 'Theo dõi tình huống leo thang: Anya phát tín hiệu lạ, mật vụ chú ý và vụ bắt cóc xảy ra.' },
    { title: 'Giải cứu Anya', icon: '💥', start: 939.23, end: 1158.57,
      picks: [500305, 500306, 500307, 500308, 500309, 500310, 500311], goal: 'Nghe màn trà trộn giải cứu, cuộc đối đầu với Edgar và lời đe dọa để bảo vệ con gái nuôi.' },
    { title: 'Đoàn tụ và ôn thi', icon: '🎒', start: 1173.68, end: 1246.36,
      picks: [500377, 500378, 500379, 500380, 500381, 500382, 500383], goal: 'Học cách động viên sau nguy hiểm, cái cớ chuyển nhà và kế hoạch học thuộc đáp án cho kỳ thi.' },
    { title: 'Kỳ thi và lá thư', icon: '✉️', start: 1257.47, end: 1435.81,
      picks: [500402, 500403, 500404, 500405, 500406, 500407, 500408], goal: 'Theo dõi phòng thi qua khả năng đọc suy nghĩ, tin vui trúng tuyển và yêu cầu bất ngờ của vòng hai: cần cả cha lẫn mẹ.' },
    ]
  },
  demon_slayer_s01e01: {
    genre: 'Anime',
    title: 'Grausamkeit', series: 'Demon Slayer', levelLabel: 'Gợi ý B1',
    catalogTitle: 'Demon Slayer · Grausamkeit',
    storageKey: 'vokabelgo_kino_chapters_v1_demon_slayer_s01e01', cueCount: 318,
    get cues() { return DEMON_SLAYER_S01E01_ALIGNED_UTTERANCES; },
    chapters: [
    { title: 'Buổi sáng chia tay', icon: '🏠', start: 26.05, end: 172.0,
      picks: [500001, 500002, 500003, 500004, 500005, 500006, 500007], goal: 'Nghe mẹ Kamado dặn dò Tanjiro, các em níu anh ở lại và lời hứa mang quà từ phố về.' },
    { title: 'Gặp Nezuko và xuống làng bán than', icon: '🎒', start: 177.18, end: 303.59,
      picks: [500045, 500046, 500047, 500048, 500049, 500050, 500051], goal: 'Theo dõi cuộc gặp với Nezuko trên đường núi, đoạn độc thoại về hạnh phúc mong manh và cảnh bán than trong làng.' },
    { title: 'Ngủ lại nhà ông Saburo', icon: '🌙', start: 308.24, end: 433.46,
      picks: [500088, 500089, 500090, 500091, 500092, 500093, 500094], goal: 'Nghe truyền thuyết về quỷ ăn thịt người, các thợ săn quỷ và lời dặn không ra ngoài sau khi mặt trời lặn.' },
    { title: 'Trở về và thảm kịch', icon: '🩸', start: 440.36, end: 570.12,
      picks: [500120, 500121, 500122, 500123, 500124, 500125, 500126], goal: 'Theo dõi Tanjiro ngửi thấy mùi máu, phát hiện thảm kịch và cõng Nezuko chạy xuyên tuyết.' },
    { title: 'Nezuko biến thành quỷ', icon: '👹', start: 579.17, end: 704.07,
      picks: [500148, 500149, 500150, 500151, 500152, 500153, 500154], goal: 'Nghe Tanjiro vật lộn với Nezuko, gọi em tỉnh lại và tự trấn an rằng em không thể là thủ phạm.' },
    { title: 'Kiếm sĩ bí ẩn xuất hiện', icon: '⚔️', start: 737.0, end: 880.32,
      picks: [500187, 500188, 500189, 500190, 500191, 500192, 500193], goal: 'Nghe cuộc đối đầu bên vực tuyết: Giyu đòi chém Nezuko, Tanjiro kể về mùi lạ và quỳ xuống van xin.' },
    { title: 'Bài học khắc nghiệt của Giyu', icon: '🗣️', start: 892.44, end: 1001.25,
      picks: [500238, 500239, 500240, 500241, 500242, 500243, 500244], goal: 'Nghe bài răn dạy nổi tiếng: không trao quyền sinh sát cho kẻ khác, kẻ yếu không có quyền cũng không có lựa chọn.' },
    { title: 'Ngoại lệ và lên đường', icon: '🗻', start: 1021.98, end: 1211.29,
      picks: [500278, 500279, 500280, 500281, 500282, 500283, 500284], goal: 'Nghe Giyu phân tích đòn rìu giấu kín, nhận ra hai anh em là ngoại lệ và chỉ đường đến chân núi Sagiri.' },
    ]
  }
};
