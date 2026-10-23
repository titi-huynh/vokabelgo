/* Official Cartoon Network Deutschland clip, selected bilingual dialogue and independent progress. */
const WE_BARE_BEARS_MALL_LESSON = (() => {
  const deck = '🎬 Video: We Bare Bears – Wir und die Mall (Đoạn trích)';
  const video = {
    key: 'we_bare_bears_mall', series: 'We Bare Bears – Bären wie wir', seriesIcon: '🐻', episodeTitle: 'Wir und die Mall (Đoạn trích)',
    icon: '🛍️', title: '🛍️ We Bare Bears – Wir und die Mall (Đoạn trích)', src: 'video/we_bare_bears_mall.mp4',
    storageKey: 'kino_calibrated_we_bare_bears_mall_v2', syncKey: 'vokabelgo_kino_perfected_we_bare_bears_mall_v2',
    progressKey: 'vokabelgo_kino_progress_we_bare_bears_mall', fullDurationStr: '04:34', flashcardDeck: deck,
    isExcerpt: true, sourceUrl: 'https://www.youtube.com/watch?v=9vTRSk7Xunc'
  };
  const chapterData = {
    title: 'Wir und die Mall (Đoạn trích)', series: 'WE BARE BEARS – BÄREN WIE WIR',
    summary: 'Đoạn trích chính thức từ tập Wir und die Mall · Náo loạn ở trung tâm thương mại khi Panda và Tom chạy trốn hội fan cuồng áo Esteller, còn Grizz cùng bảo vệ Griff đuổi bắt bằng tàu hỏa mini.',
    levelLabel: 'Gợi ý A2–B1', defaultMode: 'all', practiceModeVersion: 1, contentVersion: 2, isExcerpt: true,
    allLabel: 'Các câu trong bài',
    allDescription: 'Lời thoại chọn lọc · Có thể chuyển sang 7 câu trọng tâm',
    captionCues: WE_BARE_BEARS_MALL_CAPTION_CUES,
    storageKey: 'vokabelgo_kino_chapters_v1_we_bare_bears_mall',
    legacyKey: video.progressKey, legacyCount: 0,
    chapters: [
      { title: 'Rắc rối ở hàng chờ và ca trực bảo vệ', icon: '🛍️', start: 0, end: 101.5,
        picks: [1100101, 1100102, 1100105, 1100107, 1100111, 1100116, 1100117],
        goal: 'Nghe lời phàn nàn khi làm bẩn áo, đề nghị giữ chỗ trong hàng và kể lại các sự cố ở trung tâm thương mại.' },
      { title: 'Tín hiệu Code Red và cuộc rượt đuổi bằng tàu hỏa', icon: '🚂', start: 101.5, end: 182.0,
        picks: [1100125, 1100127, 1100128, 1100131, 1100132, 1100136, 1100143],
        goal: 'Rủ đồng đội cùng hành động, chỉ đường ở thang cuốn và bàn kế hoạch đuổi theo bằng tàu hỏa mini.' },
      { title: 'Giằng co chiếc áo giới hạn ở sảnh chính', icon: '👕', start: 182.0, end: 274.04,
        picks: [1100145, 1100149, 1100152, 1100154, 1100155, 1100158, 1100165],
        goal: 'Nói về tình thế bị dồn vào ngõ cụt, đề nghị bình tĩnh thương lượng và bảo vệ bạn bè.' }
    ]
  };
  const entries = [
    ['limitiert', 'limitiert', 'phiên bản giới hạn; có số lượng hạn chế', 'Tính từ / Phân từ II của limitieren: limitiert.', 1100101, ['ein limitiertes Esteller-Shirt', 'eine limitierte Auflage'], 'Trong câu này, limitierten có đuôi -en vì đứng sau đại từ sở hữu ở Dativ (mit meinem limitierten Esteller-Shirt).'],
    ['schenken', 'schenken', 'tặng (quà)', 'schenkt; schenkte; hat geschenkt. Đi với Dativ (người nhận) và Akkusativ (món quà).', 1100102, ['jemandem ein Shirt schenken', 'zum Geburtstag schenken'], 'Meine Mom hat mir das geschenkt: mir là tân ngữ Dativ chỉ người được tặng.'],
    ['schnappen', 'sich jemanden schnappen', 'tóm lấy; bắt lấy ai', 'Khẩu ngữ: schnappt sich; schnappte sich; hat sich geschnappt.', 1100104, ['sich die Bösewichte schnappen', 'Die schnappen wir uns!'], 'uns trong die schnappen wir uns là đại từ phản thân ở Dativ mang sắc thái khẩu ngữ sinh động.'],
    ['schlange', 'die Schlange', 'hàng người xếp hàng; con rắn', 'die Schlange, die Schlangen (f.).', 1100105, ['in der Schlange stehen', 'den Platz in der Schlange halten'], 'Khi đi mua sắm hoặc xin chữ ký, die Schlange chỉ hàng người đang xếp hàng chờ đến lượt.'],
    ['benutzbar', 'benutzbar', 'có thể sử dụng được', 'Tính từ ghép từ benutzen + hậu tố -bar; trái nghĩa: unbenutzbar.', 1100107, ['wieder benutzbar sein', 'gut benutzbar'], 'Hậu tố -bar gắn vào động từ thường mang nghĩa có thể làm gì (như machbar, trinkbar, benutzbar).'],
    ['uebernehmen', 'übernehmen', 'đảm nhận; tiếp quản', 'Động từ không tách: übernimmt; übernahm; hat übernommen.', 1100110, ['eine Aufgabe übernehmen', 'Willst du diesmal übernehmen?'], 'Vì tiền tố über- không nhận trọng âm ở đây nên übernehmen là động từ không tách.'],
    ['falsch-laufen', 'falsch laufen', 'diễn ra sai lệch; không như ý', 'läuft falsch; lief falsch; ist falsch gelaufen.', 1100111, ['Hier läuft alles falsch.', 'etwas läuft falsch'], 'Grizz thất vọng vì công việc bảo vệ thực tế khác hẳn những gì cậu tưởng tượng.'],
    ['vermoebeln', 'vermöbeln', 'dần cho một trận; đánh nhừ tử', 'Khẩu ngữ: vermöbelt; vermöbelte; hat vermöbelt.', 1100113, ['Bösewichte vermöbeln', 'jemanden im Videospiel vermöbeln'], 'Từ khẩu ngữ hài hước thường dùng trong phim hoạt hình hoặc trò chơi điện tử.'],
    ['ueberschwemmung', 'die Überschwemmung', 'vụ ngập nước; trận lụt', 'die Überschwemmung, die Überschwemmungen (f.).', 1100116, ['eine Riesenüberschwemmung haben', 'eine Überschwemmung verursachen'], 'Riesen- ghép trước danh từ (Riesenüberschwemmung) dùng để nhấn mạnh quy mô rất lớn.'],
    ['stromausfall', 'der Stromausfall', 'sự cố mất điện', 'der Stromausfall, die Stromausfälle (m.).', 1100117, ['einen Stromausfall haben', 'bei einem Stromausfall'], 'Danh từ ghép từ der Strom (điện) và der Ausfall (sự ngừng hoạt động).'],
    ['gerechtigkeit', 'die Gerechtigkeit', 'công lý; sự công bằng', 'die Gerechtigkeit (f.); danh từ trừu tượng, thường dùng ở số ít.', 1100125, ['für Gerechtigkeit sorgen', 'Gerechtigkeit auf den Straßen'], 'für etwas sorgen: đảm bảo, giữ gìn cho điều gì được thực hiện.'],
    ['rolltreppe', 'die Rolltreppe', 'thang cuốn', 'die Rolltreppe, die Rolltreppen (f.).', 1100132, ['bei der Rolltreppe', 'mit der Rolltreppe fahren'], 'Từ vựng rất quen thuộc khi hỏi và chỉ đường trong trung tâm thương mại hoặc nhà ga.'],
    ['einholen', 'einholen', 'đuổi kịp; bắt kịp', 'Động từ tách: holt ein; holte ein; hat eingeholt.', 1100136, ['jemanden zu Fuß einholen', 'den Vorsprung einholen'], 'Trong mệnh đề phụ với wenn, tiền tố ein- viết liền với động từ ở cuối câu: nicht einholen.'],
    ['abhaengen', 'jemanden abhängen', 'bỏ xa; cắt đuôi ai (khi rượt đuổi)', 'Động từ tách (khẩu ngữ): hängt ab; hängte ab; hat abgehängt.', 1100141, ['Sie hängen uns ab!', 'die Verfolger abhängen'], 'Ngoài nghĩa phụ thuộc (abhängen von), abhängen + Akkusativ trong khẩu ngữ còn có nghĩa chạy bỏ xa ai.'],
    ['schiene', 'die Schiene', 'đường ray; thanh ray', 'die Schiene, die Schienen (f.); thường dùng ở số nhiều khi chỉ đường tàu.', 1100143, ['auf Schienen fahren', 'die Schienen verlassen'], 'Griff lái chiếc tàu hỏa mini rời khỏi cả đường ray để đuổi theo trong trung tâm thương mại.'],
    ['sackgasse', 'die Sackgasse', 'ngõ cụt; đường cùng', 'die Sackgasse, die Sackgassen (f.).', 1100149, ['sich in eine Sackgasse verrennen', 'in einer Sackgasse landen'], 'sich in eine Sackgasse verrennen: vừa có nghĩa đen là chạy nhầm vào ngõ cụt, vừa có nghĩa bóng là lâm vào bế tắc.'],
    ['klamotten', 'die Klamotten', 'quần áo (khẩu ngữ)', 'die Klamotten (Pl.); danh từ khẩu ngữ, hầu như chỉ dùng ở số nhiều.', 1100154, ['eure Klamotten in Sicherheit bringen', 'neue Klamotten kaufen'], 'Cách nói thân mật hàng ngày thay cho die Kleidung.'],
    ['herausfordern', 'herausfordern', 'thách thức; khiêu khích', 'Động từ tách: fordert heraus; forderte heraus; hat herausgefordert.', 1100157, ['jemanden herausfordern', 'Forder mich nicht heraus!'], 'Ở thức mệnh lệnh ngôi du trong hội thoại, đuôi -e thường được lược bỏ: Forder mich nicht heraus!']
  ];
  const flashcards = entries.map(([id, term, meaning, grammar, cueId, collocations, note]) => {
    const cue = WE_BARE_BEARS_MALL_ALIGNED_UTTERANCES.find(item => item.id === cueId);
    if (!cue) throw new Error(`We Bare Bears Mall vocabulary refers to missing cue ${cueId}`);
    const chapter = chapterData.chapters.findIndex(c => cue.start >= c.start && cue.end <= c.end);
    if (chapter < 0) throw new Error(`We Bare Bears Mall vocabulary falls outside chapters: ${cueId}`);
    return { id: `vk_we_bare_bears_mall_${id}`, term, meaning, grammar, example: cue.text,
      collocations, note, deck, tags: ['Video', 'We Bare Bears', 'Einkaufszentrum'],
      videoKey: video.key, cueId, sourceUrl: `?kino=bears&part=${chapter + 1}` };
  });
  chapterData.vocabularyCount = flashcards.length;
  return { video, chapterData, flashcards };
})();
