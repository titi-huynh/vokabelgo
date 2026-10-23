/* Original NDR/KiKA episode, selected bilingual dialogue and independent progress. */
const ERDMAENNCHEN_NUDELTRICK_LESSON = (() => {
  const deck = '🎬 Video: Jan & Henry – Der Nudeltrick';
  const video = {
    key: 'erdmaennchen_nudeltrick', series: 'Ein Fall für die Erdmännchen', seriesIcon: '🔎', episodeTitle: 'Der Nudeltrick',
    icon: '🎩', title: '🎩 Jan & Henry – Der Nudeltrick', src: 'video/erdmaennchen_nudeltrick.mp4',
    storageKey: 'kino_calibrated_erdmaennchen_nudeltrick_v1', syncKey: 'vokabelgo_kino_perfected_erdmaennchen_nudeltrick',
    progressKey: 'vokabelgo_kino_progress_erdmaennchen_nudeltrick', fullDurationStr: '12:27', flashcardDeck: deck,
    sourceUrl: 'https://www.kika.de/ein-fall-fuer-die-erdmaennchen/videos/der-nudeltrick-s-e-100'
  };
  const chapterData = {
    title: 'Der Nudeltrick', series: 'EIN FALL FÜR DIE ERDMÄNNCHEN',
    summary: 'Trò ảo thuật với mì · Tiền của khán giả bỗng biến thành mì. Jan và Henry lần theo manh mối từ một cuốn sách phép thuật.',
    levelLabel: 'Gợi ý A2–B1', defaultMode: 'all', practiceModeVersion: 1,
    allLabel: 'Các câu trong bài',
    allDescription: 'Lời thoại chọn lọc · Có thể chuyển sang 7 câu trọng tâm',
    captionCues: ERDMAENNCHEN_NUDELTRICK_CAPTION_CUES,
    storageKey: 'vokabelgo_kino_chapters_v1_erdmaennchen_nudeltrick',
    legacyKey: video.progressKey, legacyCount: 0,
    chapters: [
      { title: 'Cùng đi xem ảo thuật', icon: '🎩', start: 0, end: 141,
        picks: [900101, 900103, 900106, 900109, 900111, 900113, 900114],
        goal: 'Nói điều mình háo hức chờ đợi, nhờ giữ bí mật và hỏi giờ một cách lịch sự.' },
      { title: 'Tiền biến thành mì', icon: '🍝', start: 141, end: 242,
        picks: [900115, 900118, 900119, 900124, 900125, 900126, 900130],
        goal: 'Hỏi nơi cất đồ, nhắc giữ đồ cẩn thận và kể lại chuyện tiền bị mất.' },
      { title: 'Cuốn sách cũng biến mất', icon: '📖', start: 242, end: 359,
        picks: [900131, 900132, 900136, 900138, 900141, 900146, 900152],
        goal: 'Đề nghị bình tĩnh, phủ nhận liên quan và trao đổi điều có thể hoặc khó xảy ra.' },
      { title: 'Ai biết trò ảo thuật này?', icon: '💭', start: 359, end: 434,
        picks: [900153, 900157, 900159, 900160, 900161, 900163, 900164],
        goal: 'Đưa giả thuyết về chuyện đã xảy ra và gợi ý đến cửa hàng gần đó để hỏi.' },
      { title: 'Manh mối trên phố', icon: '🛍️', start: 434, end: 554,
        picks: [900167, 900169, 900170, 900174, 900180, 900185, 900186],
        goal: 'Xin lỗi khi va vào người khác, hỏi về đồ vật và nhận ra một manh mối đáng chú ý.' },
      { title: 'Theo dõi buổi tập bí mật', icon: '🧀', start: 554, end: 622,
        picks: [900187, 900188, 900189, 900190, 900194, 900195, 900197],
        goal: 'Rủ nhau đi theo, hỏi điều nhìn thấy và nói rằng mình cần đọc lại hướng dẫn.' },
      { title: 'Bắt quả tang và học bí quyết', icon: '🔎', start: 622, end: 746.92,
        picks: [900200, 900204, 900206, 900209, 900213, 900219, 900223],
        goal: 'Chất vấn, yêu cầu trả lại đồ và kiểm tra mình đã làm đúng một việc hay chưa.' }
    ]
  };
  const entries = [
    ['freuen', 'sich auf etwas freuen', 'háo hức chờ đợi điều gì', 'sich freuen auf + Akkusativ; freute sich; hat sich gefreut.', 900101, ['sich auf eine Show freuen', 'Ich freue mich auf das Wochenende.'], 'auf dùng cho điều mình đang mong chờ; über thường dùng cho niềm vui về điều đã có hoặc đã xảy ra.'],
    ['zauberer', 'der Zauberer', 'ảo thuật gia; phù thủy', 'der Zauberer, die Zauberer (m.); nữ: die Zauberin.', 900102, ['ein guter Zauberer', 'einen Zaubertrick zeigen'], 'Trong buổi diễn này, Zauberer chỉ người biểu diễn ảo thuật.'],
    ['verraten', 'verraten', 'tiết lộ', 'verrät; verriet; hat verraten. Mệnh lệnh với du: verrat(e).', 900109, ['ein Geheimnis verraten', 'jemandem einen Trick verraten'], 'Verrat doch bitte nicht alles là lời nhờ đừng kể trước mọi diễn biến.'],
    ['uhr', 'die Uhr', 'đồng hồ', 'die Uhr, die Uhren (f.).', 900112, ['Meine Uhr ist weg.', 'auf die Uhr schauen'], 'weg sein: biến mất, không còn ở chỗ cũ.'],
    ['aufbewahren', 'aufbewahren', 'cất; bảo quản', 'Động từ tách: bewahrt auf; hat aufbewahrt.', 900115, ['Geld aufbewahren', 'etwas an einem sicheren Ort aufbewahren'], 'Trong câu hỏi, auf đứng cuối: Wo bewahren Sie ... auf?'],
    ['aufpassen', 'auf etwas aufpassen', 'trông chừng; giữ gìn thứ gì', 'aufpassen auf + Akkusativ; passt auf; hat aufgepasst.', 900119, ['auf das Geld aufpassen', 'Pass gut darauf auf.'], 'darauf thay cho auf + vật đã được nhắc đến.'],
    ['stattdessen', 'stattdessen', 'thay vào đó', 'Trạng từ; viết liền một từ.', 900126, ['Stattdessen haben sie Nudeln.', 'etwas anderes stattdessen nehmen'], 'Tiền bị lấy đi, còn mì được đặt vào túi thay cho tiền.'],
    ['klauen', 'klauen', 'lấy trộm', 'Động từ khẩu ngữ: klaute; hat geklaut. Trung tính hơn: stehlen.', 900125, ['jemandem Geld klauen', 'ein Buch klauen'], 'Den Leuten wurde ... geklaut là câu bị động: mọi người bị lấy trộm tiền.'],
    ['beruhigen', 'sich beruhigen', 'bình tĩnh lại', 'sich beruhigen: beruhigte sich; hat sich beruhigt.', 900131, ['Beruhigen Sie sich bitte.', 'sich langsam beruhigen'], 'Đây là lời yêu cầu lịch sự với Sie.'],
    ['nichts-zu-tun', 'damit nichts zu tun haben', 'không liên quan đến chuyện đó', 'Cấu trúc: mit etwas nichts zu tun haben.', 900132, ['Ich habe damit nichts zu tun.', 'mit einem Vorfall nichts zu tun haben'], 'damit ở đây có nghĩa với chuyện đó, không phải để mà.'],
    ['verwandeln', 'in etwas verwandeln', 'biến thành thứ gì', 'verwandeln in + Akkusativ; verwandelte; hat verwandelt.', 900135, ['Geld in Nudeln verwandeln', 'sich in etwas verwandeln'], 'irgendwas là cách nói thân mật của irgendetwas.'],
    ['unwahrscheinlich', 'unwahrscheinlich', 'khó có khả năng xảy ra', 'Tính từ; trái nghĩa: wahrscheinlich.', 900136, ['etwas für unwahrscheinlich halten', 'Das ist unwahrscheinlich.'], 'etwas für ... halten: cho rằng điều gì có một tính chất nào đó.'],
    ['verdaechtigen', 'verdächtigen', 'nghi ngờ ai là người làm một việc xấu', 'verdächtigen + Akkusativ; verdächtigte; hat verdächtigt.', 900141, ['jemanden verdächtigen', 'einen Verdächtigen befragen'], 'Trong câu này, có người muốn khiến mọi người nghi ngờ Aubergini.'],
    ['besitzen', 'besitzen', 'sở hữu', 'besitzt; besaß; hat besessen.', 900147, ['ein Buch besitzen', 'Wer besitzt dieses Buch?'], 'wer mở đầu mệnh đề chỉ người: chỉ ai có cuốn sách thì mới biết các trò.'],
    ['unsichtbar', 'unsichtbar', 'vô hình; không nhìn thấy được', 'Tính từ; trái nghĩa: sichtbar.', 900150, ['ein unsichtbares Buch', 'unsichtbar werden'], 'Trong ein unsichtbares Buch, tính từ có đuôi -es vì Buch là danh từ giống trung.'],
    ['geheimnisvoll', 'geheimnisvoll', 'bí ẩn', 'geheimnisvoll – geheimnisvoller – am geheimnisvollsten.', 900152, ['immer geheimnisvoller werden', 'eine geheimnisvolle Geschichte'], 'immer + so sánh hơn: càng lúc càng.'],
    ['um-die-ecke', 'um die Ecke', 'ở góc phố; ngay gần đây', 'Cụm chỉ vị trí thường gặp trong hội thoại.', 900163, ['ein Laden um die Ecke', 'gleich um die Ecke'], 'Trong câu này, hai bạn nói về một cửa hàng gần chỗ đang đứng.'],
    ['nachfragen', 'nachfragen', 'hỏi lại; hỏi để biết thêm', 'Động từ tách: fragt nach; hat nachgefragt.', 900164, ['im Laden nachfragen', 'noch einmal nachfragen'], 'einfach mal làm đề nghị hỏi thử nghe tự nhiên và nhẹ hơn.'],
    ['ausdenken', 'sich etwas ausdenken', 'nghĩ ra điều gì', 'Động từ tách: denkt sich etwas aus; hat sich etwas ausgedacht.', 900174, ['sich einen Trick ausdenken', 'sich eine Geschichte ausdenken'], 'mir trong ich habe mir ... ausgedacht là đại từ phản thân ở Dativ.'],
    ['auftreten', 'auftreten', 'biểu diễn trước khán giả', 'Động từ tách: tritt auf; trat auf; ist aufgetreten.', 900175, ['auf einer Bühne auftreten', 'nicht mehr auftreten können'], 'auftreten trong cảnh này mang nghĩa biểu diễn.'],
    ['beobachten', 'beobachten', 'quan sát; theo dõi', 'beobachten + Akkusativ; beobachtete; hat beobachtet.', 900186, ['jemanden beobachten', 'etwas genau beobachten'], 'wir sollten ... lieber: gợi ý rằng tốt hơn là mình nên làm điều gì.'],
    ['nachlesen', 'nachlesen', 'đọc lại; tra trong sách', 'Động từ tách: liest nach; las nach; hat nachgelesen.', 900194, ['im Buch nachlesen', 'nachlesen, wie etwas geht'], 'wie das geht: việc đó làm như thế nào.'],
    ['erwischen', 'erwischen', 'bắt được; bắt quả tang', 'erwischte; hat erwischt.', 900200, ['jemanden erwischen', 'jemanden auf frischer Tat erwischen'], 'Ở đây hai thám tử tìm thấy Krokodella cùng cuốn sách.'],
    ['publikum', 'das Publikum', 'khán giả', 'das Publikum (n.); danh từ tập hợp, thường dùng ở số ít.', 900208, ['vor Publikum auftreten', 'das Geld vom Publikum'], 'Publikum chỉ tập thể người xem; từ chỉ một khán giả là der Zuschauer hoặc die Zuschauerin.']
  ];
  const flashcards = entries.map(([id, term, meaning, grammar, cueId, collocations, note]) => {
    const cue = ERDMAENNCHEN_NUDELTRICK_ALIGNED_UTTERANCES.find(item => item.id === cueId);
    if (!cue) throw new Error(`Nudeltrick vocabulary refers to missing cue ${cueId}`);
    const chapter = chapterData.chapters.findIndex(c => cue.start >= c.start && cue.end <= c.end);
    if (chapter < 0) throw new Error(`Nudeltrick vocabulary falls outside chapters: ${cueId}`);
    return { id: `vk_erdmaennchen_nudeltrick_${id}`, term, meaning, grammar, example: cue.text,
      collocations, note, deck, tags: ['Video', 'Jan & Henry', 'Alltag'],
      videoKey: video.key, cueId, sourceUrl: `?kino=nudeltrick&part=${chapter + 1}` };
  });
  chapterData.vocabularyCount = flashcards.length;
  return { video, chapterData, flashcards };
})();
