/* Hans is an additive local preview; existing films keep their progress keys. */
const HANS_LESSON = (() => {
  const deck = '🎬 Video: Hans im Glück';
  const video = {
    key: 'hans', series: 'Cổ tích Đức', seriesIcon: '📖', episodeTitle: 'Hans im Glück',
    icon: '🍀', title: '🍀 Hans im Glück – Chàng Hans may mắn', src: 'video/hans.mp4',
    storageKey: 'kino_calibrated_hans_v1', syncKey: 'vokabelgo_kino_perfected_hans',
    progressKey: 'vokabelgo_kino_progress_hans', fullDurationStr: '09:31', flashcardDeck: deck
  };
  const chapterData = {
    title: 'Hans im Glück', series: 'CỔ TÍCH ĐỨC',
    summary: 'Chàng Hans may mắn · Cùng Hans đổi vàng lấy ngựa, làm quen với những lời đề nghị và tìm niềm vui trên đường về nhà.',
    levelLabel: 'Gợi ý A2–B1',
    defaultMode: 'all', practiceModeVersion: 1,
    contentVersion: 2, captionCues: HANS_CAPTION_CUES,
    storageKey: 'vokabelgo_kino_chapters_v1_hans',
    legacyKey: video.progressKey, legacyCount: 0,
    chapters: [
      { title: 'Cục vàng và con ngựa', icon: '🐴', start: 0, end: 154.8,
        picks: [400108, 400109, 400118, 400121, 400126, 400127, 400129],
        goal: 'Nói điều mình muốn, hỏi lý do và đề nghị đổi một món đồ.' },
      { title: 'Từ ngựa đến bò và lợn', icon: '🐮', start: 154.8, end: 274.6,
        picks: [400139, 400141, 400142, 400150, 400161, 400162, 400165],
        goal: 'Bày tỏ điều mình thích, không thích và nói về nhu cầu ăn uống.' },
      { title: 'Con ngỗng và cuộc gặp bên đường', icon: '🪿', start: 274.6, end: 418.6,
        picks: [400171, 400176, 400177, 400179, 400182, 400195, 400197],
        goal: 'Nhờ giúp đỡ, đồng ý giúp người khác và hỏi về nguồn gốc một món đồ.' },
      { title: 'Bỏ gánh nặng, trở về với mẹ', icon: '🍀', start: 418.6, end: 539.4,
        picks: [400210, 400211, 400212, 400220, 400223, 400224, 400236],
        goal: 'Đưa lời khuyên, nói về mong ước và bày tỏ niềm hạnh phúc.' }
    ]
  };
  // Stable IDs and the exact source cue keep vocabulary tied to the story.
  const entries = [
    ['lohn', 'der Lohn', 'tiền công', 'der Lohn, die Löhne (m.)', 400110, ['seinen Lohn bekommen', 'für seine Arbeit bezahlt werden'], 'Ở đây là tiền công Hans nhận sau bảy năm làm việc.'],
    ['heim', 'heim', 'về nhà', 'Trạng từ chỉ hướng; heim = nach Hause.', 400109, ['heimgehen', 'heim zu seiner Mutter'], 'Dùng với động từ chuyển động; không nhầm với zu Hause (ở nhà).'],
    ['ehrlich', 'ehrlich', 'trung thực; thật thà', 'Tính từ: ehrlich – ehrlicher – am ehrlichsten.', 400112, ['ehrlich arbeiten', 'ehrlich sein'], 'treu und ehrlich: tận tụy và trung thực.'],
    ['auf-den-weg', 'sich auf den Weg machen', 'lên đường', 'Cụm phản thân: macht sich auf den Weg; hat sich auf den Weg gemacht.', 400115, ['sich auf den Weg nach Hause machen', 'sich früh auf den Weg machen'], 'Trong truyện: machte sich auf den Weg (thì quá khứ kể chuyện).'],
    ['pferd', 'das Pferd', 'con ngựa', 'das Pferd, die Pferde (n.)', 400127, ['auf einem Pferd reiten', 'vom Pferd fallen'], 'reiten: cưỡi ngựa; der Reiter: người cưỡi ngựa.'],
    ['zu-fuss', 'zu Fuß', 'đi bộ', 'Cụm trạng từ: zu Fuß gehen / laufen.', 400121, ['zu Fuß nach Hause gehen', 'zu Fuß unterwegs sein'], 'Viết hoa Fuß và dùng chữ ß.'],
    ['tauschen', 'tauschen', 'đổi; trao đổi', 'tauschen + Akk. gegen + Akk.; tauschte; hat getauscht.', 400165, ['ein Pferd gegen eine Kuh tauschen', 'etwas miteinander tauschen'], 'gegen nêu món đồ mình nhận lại trong cuộc trao đổi.'],
    ['von-herzen', 'von Herzen gern', 'rất sẵn lòng; hết lòng đồng ý', 'Cụm đáp lời đồng ý, thân thiện và nhiệt tình.', 400129, ['jemandem von Herzen danken', 'etwas gern tun'], 'Câu đáp ngắn có thể dùng khi chấp nhận một đề nghị.'],
    ['kuh', 'die Kuh', 'con bò cái', 'die Kuh, die Kühe (f.)', 400142, ['eine Kuh melken', 'eine Kuh gegen ein Schwein tauschen'], 'Hans nghĩ bò sẽ cho mình sữa, bơ và phô mai mỗi ngày.'],
    ['spass', 'Spaß machen', 'mang lại niềm vui; vui', 'etwas macht jemandem Spaß (Dat.).', 400139, ['Das macht Spaß.', 'Das macht mir keinen Spaß.'], 'keinen Spaß machen: không vui, chẳng thú vị.'],
    ['durst', 'der Durst', 'cơn khát; sự khát nước', 'der Durst (m.), thường không dùng số nhiều.', 400148, ['Durst haben', 'seinen Durst löschen'], 'großen Durst bekommen: trở nên rất khát.'],
    ['melken', 'melken', 'vắt sữa', 'melken + Akk.; thường dùng hat gemolken.', 400150, ['eine Kuh melken', 'mit der Hand melken'], 'Không phải con bò nào cũng còn cho sữa: đây là nút thắt của phần hai.'],
    ['lieber', 'lieber', 'thích hơn', 'etwas ist jemandem (Dat.) lieber: ai thích điều gì hơn. gern → lieber khi nói về việc thích làm hơn.', 400162, ['Ich esse lieber Gemüse.', 'Das ist mir lieber.'], 'viel lieber: thích hơn nhiều; đối chiếu với mag ich nicht.'],
    ['schwein', 'das Schwein', 'con lợn', 'das Schwein, die Schweine (n.)', 400165, ['ein junges Schwein', 'ein Schwein gegen eine Gans tauschen'], 'das Schweinefleisch: thịt lợn.'],
    ['gans', 'die Gans', 'con ngỗng', 'die Gans, die Gänse (f.)', 400197, ['eine weiße Gans', 'eine Gans unter dem Arm tragen'], 'Phân biệt Gans (con ngỗng) với ganz (toàn bộ; rất).'],
    ['helfen', 'helfen', 'giúp đỡ', 'helfen + Dat.; hilft; half; hat geholfen. Mệnh lệnh: Hilf!', 400176, ['jemandem helfen', 'Kannst du mir helfen?'], 'Bitte, hilf mir! = Làm ơn giúp tôi với!'],
    ['tausch', 'der Tausch', 'sự trao đổi; cuộc đổi chác', 'der Tausch (m.); trong bài: einen guten Tausch machen.', 400182, ['ein guter Tausch', 'einen Tausch machen'], 'Động từ liên quan: tauschen.'],
    ['gold-wert', 'Gold wert sein', 'quý như vàng; rất có giá trị', 'Cụm cố định: etwas ist Gold wert.', 400195, ['Deine Hilfe ist Gold wert.', 'Ein guter Rat ist Gold wert.'], 'Không cần hiểu theo nghĩa giá tiền bằng vàng; thường dùng để khen giá trị hữu ích.'],
    ['wetzstein', 'der Wetzstein', 'đá mài', 'der Wetzstein, die Wetzsteine (m.)', 400210, ['einen Wetzstein benutzen', 'ein Messer schärfen'], 'Từ giúp hiểu cốt truyện; không cần ưu tiên học thuộc nếu ít dùng.'],
    ['von-selbst', 'von selbst', 'tự nhiên; tự nó', 'Cụm trạng từ; sich ergeben: nảy sinh, đâu vào đấy.', 400211, ['Das ergibt sich von selbst.', 'Das geht von selbst.'], 'Alles andere ergibt sich von selbst: Mọi việc khác rồi sẽ tự đâu vào đấy.'],
    ['aufheben', 'aufheben', 'nhặt lên; giữ lại', 'Động từ tách: hebt auf; hob auf; hat aufgehoben.', 400220, ['einen Stein aufheben', 'etwas gut aufheben'], 'Trong câu Heb ihn gut auf!: giữ hòn đá cẩn thận.'],
    ['erfuellung', 'in Erfüllung gehen', 'trở thành hiện thực', 'Cụm cố định với der Wunsch (điều ước).', 400223, ['Ein Wunsch geht in Erfüllung.', 'Ein Traum geht in Erfüllung.'], 'Trong bài, Hans tin mọi điều mình mong đều thành hiện thực.'],
    ['glueckskind', 'das Glückskind', 'người may mắn', 'das Glückskind, die Glückskinder (n.)', 400224, ['ein Glückskind sein', 'Glück haben'], 'Glück có thể mang nghĩa may mắn hoặc hạnh phúc, tùy ngữ cảnh.'],
    ['gluecklich', 'glücklich', 'hạnh phúc; vui sướng', 'Tính từ: glücklich – glücklicher – am glücklichsten.', 400236, ['glücklich sein', 'glücklich nach Hause kommen'], 'Câu hỏi để nghĩ thêm: Hans có ít đồ hơn, vậy vì sao cậu lại hạnh phúc?']
  ];
  const flashcards = entries.map(([id, term, meaning, grammar, cueId, collocations, note]) => {
    const cue = HANS_CAPTION_CUES.find(item => item.id === cueId);
    if (!cue) throw new Error(`Hans vocabulary refers to missing cue ${cueId}`);
    return { id: `vk_hans_${id}`, term, meaning, grammar, example: cue.text,
      collocations, note, deck, tags: ['Video', 'Hans im Glück', 'Märchen'],
      videoKey: 'hans', cueId, sourceUrl: `?kino=hans&part=${chapterData.chapters.findIndex(c => cue.start >= c.start && cue.end <= c.end) + 1}` };
  });
  chapterData.vocabularyCount = flashcards.length;
  return { video, chapterData, flashcards };
})();
