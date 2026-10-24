/* Chapter bounds sit between complete spoken turns; all sources remain original MP4s. */
const KINO_ALIASES = { peppa_supermarkt: 'peppa', pizzaschwester: 'pizza', babysitter: 'babysitter', hans: 'hans', trudes_fahrstuhl: 'trude', erdmaennchen_nudeltrick: 'nudeltrick', erdmaennchen_schmucklose: 'schmucklose', we_bare_bears_mall: 'bears', frieren_s01e01: 'frieren', sakura_s01e01: 'sakura', druck_s07e01: 'druck', simplicissimus_leberwurst: 'simplicissimus', trudes_bagger: 'bagger' };
const KINO_CHAPTER_DATA = {
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
};
