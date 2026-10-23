/* WDR's Fahrstuhl episode: selected dialogue, independent progress, source-linked vocabulary. */
const TRUDES_FAHRSTUHL_LESSON = (() => {
  const deck = '🎬 Video: Trudes Tier – Fahrstuhl';
  const video = {
    key: 'trudes_fahrstuhl', series: 'Trudes Tier', seriesIcon: '🐾', episodeTitle: 'Fahrstuhl',
    icon: '🛗', title: '🛗 Trudes Tier – Fahrstuhl', src: 'video/trudes_fahrstuhl.mp4',
    storageKey: 'kino_calibrated_trudes_fahrstuhl_v1', syncKey: 'vokabelgo_kino_perfected_trudes_fahrstuhl',
    progressKey: 'vokabelgo_kino_progress_trudes_fahrstuhl', fullDurationStr: '06:52', flashcardDeck: deck,
    sourceUrl: 'https://www.wdrmaus.de/filme/lachgeschichten/trudes_tier_fahrstuhl.php5'
  };
  const chapterData = {
    title: 'Fahrstuhl', series: 'TRUDES TIER',
    summary: 'Thang máy · Trude và Tier mang trả nồi chiên cho mẹ. Một chiếc tủ chuyển nhà khiến chuyến đi trở nên rắc rối.',
    levelLabel: 'Gợi ý A2–B1', defaultMode: 'all', practiceModeVersion: 1,
    allLabel: 'Các câu trong bài',
    allDescription: 'Lời thoại chọn lọc · Có thể chuyển sang 7 câu trọng tâm',
    captionCues: TRUDES_FAHRSTUHL_CAPTION_CUES,
    storageKey: 'vokabelgo_kino_chapters_v1_trudes_fahrstuhl',
    legacyKey: video.progressKey, legacyCount: 0,
    chapters: [
      { title: 'Mang nồi chiên trả mẹ', icon: '🪜', start: 0, end: 103.5,
        picks: [600102, 600107, 600108, 600109, 600110, 600111, 600117],
        goal: 'Nhờ cầm giúp đồ, chọn cầu thang bộ hay thang máy và hẹn gặp nhau ở trên.' },
      { title: 'Nói về nỗi sợ', icon: '💬', start: 103.5, end: 179.5,
        picks: [600121, 600122, 600123, 600124, 600125, 600129, 600134],
        goal: 'Hỏi lý do, nói điều mình chưa làm được và giải thích cảm xúc của mình.' },
      { title: 'Chiếc tủ để tập thử', icon: '🚪', start: 179.5, end: 266,
        picks: [600138, 600140, 600141, 600143, 600144, 600147, 600151],
        goal: 'Đưa gợi ý, thử một điều mới, tự nhắc bình tĩnh và hỏi về đồ thất lạc.' },
      { title: 'Trude lên được tầng trên', icon: '🛗', start: 266, end: 328,
        picks: [600154, 600156, 600157, 600158, 600162, 600165, 600166],
        goal: 'Tự động viên, gọi người khác dừng lại và báo mình đã làm được.' },
      { title: 'Hóa ra mẹ cũng có nỗi sợ', icon: '🕷️', start: 328, end: 411.92,
        picks: [600168, 600169, 600170, 600172, 600174, 600175, 600179],
        goal: 'Kể lại việc vừa làm, nhờ giúp đỡ và thỏa thuận một điều kiện đơn giản.' }
    ]
  };
  const entries = [
    ['fahrstuhl', 'der Fahrstuhl', 'thang máy', 'der Fahrstuhl, die Fahrstühle (m.); đồng nghĩa: der Aufzug.', 600108, ['mit dem Fahrstuhl fahren', 'den Fahrstuhl nehmen'], 'Trong phim còn dùng từ Aufzug với cùng nghĩa.'],
    ['treppe', 'die Treppe', 'cầu thang bộ', 'die Treppe, die Treppen (f.).', 600109, ['die Treppe nehmen', 'die Treppe hinaufgehen'], 'die Treppe nehmen: chọn đi cầu thang bộ.'],
    ['zurueckbringen', 'zurückbringen', 'mang trả; mang trở lại', 'Động từ tách: bringt zurück; hat zurückgebracht.', 600102, ['jemandem etwas zurückbringen', 'ein geliehenes Gerät zurückbringen'], 'deiner Mutter là người nhận, ở cách Dativ.'],
    ['vorbeikommen', 'vorbeikommen', 'ghé qua', 'Động từ tách: kommt vorbei; ist vorbeigekommen.', 600103, ['bei jemandem vorbeikommen', 'kurz vorbeikommen'], 'dringend vorbeikommen sollen: được bảo phải ghé qua gấp.'],
    ['gleich-da', 'gleich da sein', 'sắp đến; sắp có mặt', 'gleich trong ngữ cảnh này chỉ thời gian rất gần.', 600108, ['Ich bin gleich da.', 'Der Bus ist gleich da.'], 'Không dịch gleich thành giống nhau trong câu này.'],
    ['oben', 'sich oben treffen', 'gặp nhau ở trên', 'sich treffen: trifft sich; hat sich getroffen. oben chỉ vị trí.', 600111, ['Wir treffen uns oben.', 'sich am Eingang treffen'], 'Phân biệt oben (ở trên) và nach oben (lên trên).'],
    ['weiterkommen', 'nicht weiterkommen', 'không đi tiếp được; bị mắc lại', 'Động từ tách: kommt weiter; ist weitergekommen.', 600114, ['hier nicht weiterkommen', 'mit einer Aufgabe nicht weiterkommen'], 'Trong cảnh này chiếc tủ chắn cầu thang nên Trude không đi tiếp được.'],
    ['kollege', 'der Kollege', 'đồng nghiệp nam', 'der Kollege, die Kollegen (m.); Nomen yếu: auf meinen Kollegen.', 600116, ['auf einen Kollegen warten', 'mit Kollegen arbeiten'], 'warten auf + Akkusativ: chờ ai hoặc điều gì.'],
    ['angst', 'Angst vor etwas haben', 'sợ điều gì', 'die Angst, die Ängste (f.); Angst vor + Dativ.', 600125, ['Angst vor engen Räumen haben', 'keine Angst haben'], 'Trude giải thích nỗi sợ của mình trong tình huống hư cấu của phim.'],
    ['eng', 'eng', 'chật; hẹp', 'Tính từ: eng – enger – am engsten.', 600125, ['ein enger Raum', 'in engen Räumen'], 'engen Räumen là dạng Dativ số nhiều sau vor trong cụm nói về nỗi sợ.'],
    ['von-alleine', 'von alleine', 'tự nó; tự động', 'Cụm trạng từ; cũng dùng von allein.', 600141, ['Die Tür geht von alleine zu.', 'Das geht nicht von alleine.'], 'zugehen: đóng lại; trong câu chính động từ tách thành geht ... zu.'],
    ['panik', 'Panik kriegen', 'hoảng lên', 'die Panik (f.); kriegen là cách nói thân mật của bekommen.', 600126, ['Panik bekommen', 'in Panik geraten'], 'Trude dùng cụm này để kể cảm giác khi cửa tự đóng lại.'],
    ['ueben', 'üben', 'luyện tập; tập thử', 'üben + Akk.; übte; hat geübt.', 600138, ['etwas üben', 'gut zum Üben sein'], 'müsstest là Konjunktiv II, diễn đạt một gợi ý.'],
    ['probieren', 'es mal probieren', 'thử xem sao', 'probieren: probierte; hat probiert. ich probier’s = ich probiere es.', 600143, ['etwas Neues probieren', 'Ich probiere es mal.'], 'mal làm lời nói tự nhiên và nhẹ hơn.'],
    ['ruhig-bleiben', 'ruhig bleiben', 'giữ bình tĩnh', 'bleiben: blieb; ist geblieben.', 600144, ['Bitte bleib ruhig.', 'erst einmal ruhig bleiben'], 'Trude tự nhắc mình trong lúc thử ở trong tủ.'],
    ['schrank', 'der Schrank', 'chiếc tủ', 'der Schrank, die Schränke (m.).', 600151, ['in dem Schrank', 'einen Schrank transportieren'], 'in dem Schrank nói về vị trí ở bên trong tủ.'],
    ['umzug', 'der Umzug', 'việc chuyển nhà', 'der Umzug, die Umzüge (m.).', 600150, ['zu einem Umzug gehören', 'bei einem Umzug helfen'], 'Người chuyển nhà tưởng nồi chiên cũng là đồ cần mang đi.'],
    ['schaffen', 'es schaffen', 'làm được; thành công', 'schaffen: schaffte; hat geschafft.', 600165, ['Ich habe es geschafft.', 'Du schaffst das.'], 'Ich hab’s là cách nói rút gọn của Ich habe es.'],
    ['ab-und-zu', 'ab und zu', 'thỉnh thoảng', 'Cụm trạng từ chỉ tần suất.', 600179, ['ab und zu vorbeikommen', 'ab und zu etwas mitbringen'], 'Mẹ đưa ra điều kiện để hai bạn được giữ nồi chiên.'],
    ['behalten', 'behalten', 'giữ lại', 'behält; behielt; hat behalten. Động từ không tách.', 600179, ['etwas behalten dürfen', 'die Fritteuse behalten'], 'Phân biệt behalten (giữ lại) với zurückbringen (mang trả).']
  ];
  const flashcards = entries.map(([id, term, meaning, grammar, cueId, collocations, note]) => {
    const cue = TRUDES_FAHRSTUHL_ALIGNED_UTTERANCES.find(item => item.id === cueId);
    if (!cue) throw new Error(`Trudes Tier vocabulary refers to missing cue ${cueId}`);
    const chapter = chapterData.chapters.findIndex(c => cue.start >= c.start && cue.end <= c.end);
    if (chapter < 0) throw new Error(`Trudes Tier vocabulary falls outside chapters: ${cueId}`);
    return { id: `vk_trudes_fahrstuhl_${id}`, term, meaning, grammar, example: cue.text,
      collocations, note, deck, tags: ['Video', 'Trudes Tier', 'Alltag'],
      videoKey: video.key, cueId, sourceUrl: `?kino=trude&part=${chapter + 1}` };
  });
  chapterData.vocabularyCount = flashcards.length;
  return { video, chapterData, flashcards };
})();
