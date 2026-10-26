/* Original NDR/KiKA episode, selected bilingual dialogue and independent progress. */
const ERDMAENNCHEN_PLATTE_REIFEN_LESSON = (() => {
  const deck = '🎬 Video: Jan & Henry – Platte Reifen';
  const video = {
    key: 'erdmaennchen_platte_reifen', series: 'Ein Fall für die Erdmännchen', seriesIcon: '🔎', episodeTitle: 'Platte Reifen',
    icon: '🚲', title: '🚲 Jan & Henry – Platte Reifen', src: 'video/erdmaennchen_platte_reifen.mp4',
    storageKey: 'kino_calibrated_erdmaennchen_platte_reifen_v1', syncKey: 'vokabelgo_kino_perfected_erdmaennchen_platte_reifen',
    progressKey: 'vokabelgo_kino_progress_erdmaennchen_platte_reifen', fullDurationStr: '12:30', flashcardDeck: deck,
    sourceUrl: 'https://www.kika.de/ein-fall-fuer-die-erdmaennchen/videos/platte-reifen-100?videoType=mainContent'
  };
  const chapterData = {
    title: 'Platte Reifen', series: 'EIN FALL FÜR DIE ERDMÄNNCHEN',
    summary: 'Lốp xe xẹp lép sau cơn mưa · Jan và Henry truy tìm thủ phạm làm xẹp lốp xe đạp và ô tô của ngài ủy viên từ chú nhím gai tới những chú chuột hamster sấy lông.',
    levelLabel: 'Gợi ý A2–B1', defaultMode: 'all', practiceModeVersion: 1,
    allLabel: 'Các câu trong bài',
    allDescription: 'Lời thoại chọn lọc · Có thể chuyển sang câu trọng tâm của từng phần',
    captionCues: ERDMAENNCHEN_PLATTE_REIFEN_CAPTION_CUES,
    storageKey: 'vokabelgo_kino_chapters_v1_erdmaennchen_platte_reifen',
    legacyKey: video.progressKey, legacyCount: 0,
    chapters: [
      { title: "Danh sách của Henry và dự báo thời tiết", icon: "📋", start: 0.0, end: 105.0,
        picks: [3200004, 3200013, 3200019, 3200021, 3200024, 3200026],
        goal: "Jan sốt ruột muốn đi, Henry kiểm tra danh sách từng mục — và nghe dự báo thời tiết trước khi khởi hành." },
      { title: "Đạp xe ra hồ, cơn mưa và chú nhím", icon: "🚲", start: 105.0, end: 262.0,
        picks: [3200044, 3200046, 3200052, 3200061, 3200067, 3200076],
        goal: "Đạp xe chậm, trú mưa, gặp chú nhím hay cuộn tròn — và phát hiện mọi lốp xe đều xẹp." },
      { title: "Vụ án mới và ngài ủy viên nghiêm túc", icon: "🔎", start: 262.0, end: 426.5,
        picks: [3200078, 3200093, 3200096, 3200105, 3200126],
        goal: "Gặp ngài ủy viên đang tự viết phiếu phạt cho chính mình; lốp ô tô của ngài cũng xẹp." },
      { title: "Nghi phạm nhím gai", icon: "🦔", start: 426.5, end: 537.0,
        picks: [3200141, 3200147, 3200155, 3200157, 3200165],
        goal: "Suy luận chỉ về chú nhím, nhưng chú có bằng chứng ngoại phạm: nút bần trên từng cái gai." },
      { title: "Chiếc 'thuyền hơi' biết đi", icon: "💨", start: 537.0, end: 622.9,
        picks: [3200177, 3200180, 3200192, 3200193, 3200198],
        goal: "Đuổi theo chiếc thuyền biết đi và phát hiện hai chú chuột hamster cùng chiếc 'máy sấy' của chúng." },
      { title: "Chiếc bơm hơi", icon: "🎁", start: 622.9, end: 662.0,
        picks: [3200200, 3200204, 3200207, 3200210],
        goal: "Trả lại thuyền cho nhím, tặng chuột hamster một chiếc bơm — vừa sấy lông vừa bơm lốp." },
      { title: "Một ngày tuyệt vời bên hồ", icon: "🏖️", start: 662.0, end: 750.0,
        picks: [3200215, 3200216, 3200223, 3200233, 3200238],
        goal: "Bơi lội vui vẻ, vụ án được báo đã phá xong, và màn kéo ngài ủy viên về nhà." }
    ]
  };
  const entries = [
    ["aufbrechen", "aufbrechen", "khởi hành, lên đường", "Động từ tách được: auf|brechen; bricht auf; brach auf; ist aufgebrochen.", 3200001, ["endlich aufbrechen", "früh am Morgen aufbrechen"], "Cụm hay dùng khi bắt đầu chuyến đi: 'Endlich aufbrechen!'"],
    ["abhaken", "abhaken", "đánh dấu xong (trong danh sách)", "Động từ tách được: ab|haken; hakt ab; hakte ab; hat abgehakt.", 3200002, ["die Liste abhaken", "einen Punkt abhaken"], "Henry cẩn thận đánh dấu từng mục trước khi đi."],
    ["ausflug", "der Ausflug", "chuyến đi chơi, chuyến dã ngoại", "der Ausflug, die Ausflüge (m.). Đi với machen / unternehmen.", 3200004, ["ein Ausflug an den Badesee", "einen Ausflug machen"], "Ghép từ Flug nhưng nghĩa là chuyến đi chơi ngắn trong ngày."],
    ["wetterbericht", "der Wetterbericht", "bản tin dự báo thời tiết", "der Wetterbericht, die Wetterberichte (m.). Từ ghép: das Wetter + der Bericht.", 3200023, ["der Wetterbericht für heute", "den Wetterbericht hören"], "Nghe dự báo thời tiết trước khi ra khỏi nhà là thói quen của Henry."],
    ["schirm", "der Schirm", "cái ô, dù", "der Schirm, die Schirme (m.); dạng đầy đủ: der Regenschirm.", 3200026, ["einen Schirm mitnehmen", "den Schirm aufspannen"], "Phát thanh viên dùng ngôi Sie lịch sự: Nehmen Sie besser einen Schirm mit."],
    ["sich-unterstellen", "sich unterstellen", "trú (mưa), đứng dưới mái che", "Động từ phản thân tách được: sich (Akk.) unter|stellen.", 3200044, ["sich bei Regen unterstellen", "da können wir uns unterstellen"], "Dùng khi tìm chỗ có mái che để trú cơn mưa bất chợt."],
    ["nass-werden", "nass werden", "bị ướt", "Cụm tính từ + động từ biến đổi trạng thái werden: wird nass; wurde nass; ist nass geworden.", 3200048, ["im Regen nass werden", "überhaupt nicht nass werden mögen"], "Trái nghĩa: trocken bleiben (giữ khô ráo)."],
    ["igel", "der Igel", "con nhím", "der Igel, die Igel (m.).", 3200058, ["ein stacheliger Igel", "sich wie ein Igel zusammenrollen"], "Nhím cuộn tròn khi trời mưa — chi tiết gợi mở vụ án."],
    ["platt-sein", "platt sein", "xẹp, hết hơi (lốp xe)", "Cụm tính từ vị ngữ: die Reifen sind platt.", 3200088, ["die Reifen sind platt", "einen platten Reifen haben"], "Cũng dùng khẩu ngữ: einen Platten haben = bị xẹp lốp."],
    ["strafzettel", "der Strafzettel", "phiếu phạt (dừng/đỗ xe sai quy định)", "der Strafzettel, die Strafzettel (m.). Từ ghép: die Strafe + der Zettel.", 3200104, ["einen Strafzettel schreiben", "einen Strafzettel bekommen"], "Ngài ủy viên nghiêm túc tự viết phiếu phạt cho chính xe của mình."],
    ["halteverbot", "das Halteverbot", "lệnh cấm dừng xe; khu vực cấm dừng xe", "das Halteverbot, die Halteverbote (n.). Từ ghép: das Halten + das Verbot.", 3200093, ["im Halteverbot halten", "aus dem Halteverbot rausfahren"], "Dừng xe ở khu vực cấm dừng xe (Halteverbot) là bị cấm — câu nói nghiêm túc hài hước của ngài ủy viên."],
    ["im-blick-haben", "im Blick haben", "để mắt tới, nắm được (mọi thứ)", "Cụm cố định: etwas/alles im Blick haben.", 3200096, ["immer alles im Blick haben", "die Straße im Blick haben"], "Ngài ủy viên tự khen mình luôn để mắt tới mọi thứ."],
    ["luft-verlieren", "die Luft verlieren", "bị xì hơi, mất hơi", "Động từ mạnh: verliert; verlor; hat verloren.", 3200097, ["die Luft verlieren", "warum die Fahrräder die Luft verloren haben"], "Hỏi lịch sự bằng ngôi Sie vì sao lốp xe đạp bị mất hơi."],
    ["stachel", "der Stachel", "cái gai (của nhím)", "der Stachel, die Stacheln (m., số nhiều -n).", 3200154, ["spitze Stacheln", "Korken auf die Stacheln stecken"], "Những chiếc gai nhọn của nhím ban đầu bị nghi làm thủng lốp xe."],
    ["korken", "der Korken", "nút bần (nút chai)", "der Korken, die Korken (m.).", 3200157, ["Korken auf die Stacheln stecken", "einen Korken finden"], "Chú nhím gắn nút bần lên đầu gai để không làm thủng thuyền hơi."],
    ["kitzeln", "kitzeln", "cù, làm nhột", "Động từ yếu: kitzelt; kitzelte; hat gekitzelt.", 3200163, ["jemanden kitzeln", "Das kitzelt!"], "Câu đùa của hai thám tử: không thể 'cù' cho hơi thoát ra khỏi lốp xe."],
    ["schlauchboot", "das Schlauchboot", "thuyền hơi, thuyền phao", "das Schlauchboot, die Schlauchboote (n.). Từ ghép: der Schlauch + das Boot.", 3200165, ["mit dem Schlauchboot fahren", "ein Schlauchboot aufpumpen"], "Chiếc thuyền hơi của chú nhím bị chuột hamster tưởng là máy sấy."],
    ["foehn", "der Föhn", "máy sấy tóc", "der Föhn, die Föhne (m.).", 3200177, ["unser Föhn", "mit dem Föhn trocknen"], "Chuột hamster gọi chiếc thuyền phao là máy sấy để sấy khô bộ lông ướt."],
    ["fell", "das Fell", "bộ lông (của động vật)", "das Fell, die Felle (n.).", 3200180, ["nasses Fell", "nasses Fell trocken kriegen"], "Không có gì khó chịu hơn 'nasses Fell' — một bộ lông bị ướt."],
    ["foehnen", "föhnen", "sấy (bằng máy sấy)", "Động từ yếu: föhnt; föhnte; hat geföhnt. Cụm phản thân: sich trocken föhnen.", 3200203, ["sich trocken föhnen", "die Haare föhnen"], "Chuột hamster lo lắng không biết sấy khô lông bằng cách nào sau khi trả lại thuyền hơi."],
    ["luftpumpe", "die Luftpumpe", "cái bơm hơi", "die Luftpumpe, die Luftpumpen (f.). Từ ghép: die Luft + die Pumpe.", 3200207, ["eine Luftpumpe", "mit der Luftpumpe aufpumpen"], "Món đồ giải quyết cả hai vấn đề: giúp chuột hamster sấy lông và giúp bơm lại lốp xe."],
    ["aufpumpen", "aufpumpen", "bơm căng (lại)", "Động từ tách được: auf|pumpen; pumpt auf; pumpte auf; hat aufgepumpt.", 3200210, ["die Reifen wieder aufpumpen", "ein Fahrrad aufpumpen"], "Bơm căng lại lốp xe đạp để tiếp tục chuyến đi chơi."]
  ];
  const flashcards = entries.map(([id, term, meaning, grammar, cueId, collocations, note]) => {
    const cue = ERDMAENNCHEN_PLATTE_REIFEN_ALIGNED_UTTERANCES.find(item => item.id === cueId);
    if (!cue) throw new Error(`Platte Reifen vocabulary refers to missing cue ${cueId}`);
    const chapter = chapterData.chapters.findIndex(c => cue.start >= c.start && cue.end <= c.end);
    if (chapter < 0) throw new Error(`Platte Reifen vocabulary falls outside chapters: ${cueId}`);
    return { id: `vk_erdmaennchen_platte_reifen_${id}`, term, meaning, grammar, example: cue.text,
      collocations, note, deck, tags: ['Video', 'Jan & Henry', 'Alltag'],
      videoKey: video.key, cueId, sourceUrl: `?kino=plattereifen&part=${chapter + 1}` };
  });
  chapterData.vocabularyCount = flashcards.length;
  return { video, chapterData, flashcards };
})();
