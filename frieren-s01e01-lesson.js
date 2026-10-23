/* Frieren S01E01 complete local Kino lesson: full dialogue default, 7-pick focus mode, independent progress, source-linked vocabulary. */
const FRIEREN_S01E01_LESSON = (() => {
  const deck = '🎬 Video: Frieren – Das Ende der Reise';
  const video = {
    key: 'frieren_s01e01', series: 'Frieren', seriesIcon: '🪄', episodeTitle: 'Das Ende der Reise',
    icon: '🪄', title: '🪄 Frieren – Das Ende der Reise', src: 'video/frieren_s01e01.mp4',
    storageKey: 'kino_calibrated_frieren_s01e01_v1', syncKey: 'vokabelgo_kino_perfected_frieren_s01e01',
    progressKey: 'vokabelgo_kino_progress_frieren_s01e01', fullDurationStr: '26:00', flashcardDeck: deck
  };
  const chapterData = {
    title: 'Das Ende der Reise', catalogTitle: 'Frieren · Tập 1', series: 'FRIEREN · TẬP 1',
    summary: 'Điểm kết thúc của hành trình · Nhóm anh hùng trở về sau mười năm đánh bại Ma Vương. Cái chết của Himmel mở ra cho Frieren chuyến đi mới để thấu hiểu con người.',
    levelLabel: 'Gợi ý B1–B2 · Bản thử: 5 câu cần rà lời',
    defaultMode: 'all', practiceModeVersion: 1,
    contentVersion: 1, captionCues: FRIEREN_S01E01_CAPTION_CUES,
    storageKey: 'vokabelgo_kino_chapters_v1_frieren_s01e01',
    legacyKey: video.progressKey, legacyCount: 0,
    chapters: [
      { title: 'Khải hoàn trở về kinh đô', icon: '🏰', start: 0, end: 274.5,
        picks: [700102, 700104, 700105, 700109, 700118, 700126, 700127],
        goal: 'Nói về kế hoạch tìm việc sau chuyến đi, chúc mừng chiến thắng và trò chuyện cùng đồng đội.' },
      { title: 'Đêm tiệc chia tay và mưa sao băng', icon: '🌠', start: 274.5, end: 440.0,
        picks: [700131, 700133, 700139, 700148, 700149, 700161, 700167],
        goal: 'Ôn lại kỷ niệm mười năm đồng hành, hỏi thăm bạn bè và hẹn gặp lại để ngắm sao băng.' },
      { title: 'Năm mươi năm trôi qua và cuộc hội ngộ', icon: '⏳', start: 440.0, end: 680.0,
        picks: [700175, 700176, 700178, 700196, 700197, 700203, 700210],
        goal: 'Hỏi về dự định tương lai, tìm kiếm một món đồ và trò chuyện khi gặp lại người bạn cũ.' },
      { title: 'Chuyến phiêu lưu cuối cùng của nhóm anh hùng', icon: '🌌', start: 680.0, end: 870.0,
        picks: [700217, 700220, 700231, 700234, 700238, 700242, 700245],
        goal: 'Rủ bạn đồng hành lên đường, ước lượng thời gian đi bộ và bày tỏ lòng biết ơn vì những kỷ niệm đẹp.' },
      { title: 'Lời tiễn biệt Himmel và nỗi day dứt của Frieren', icon: '🕯️', start: 870.0, end: 1120.0,
        picks: [700249, 700261, 700264, 700268, 700279, 700281, 700288],
        goal: 'Bày tỏ nỗi tiếc thương, hỏi thăm sức khỏe lúc chia tay và chia sẻ mong muốn hiểu thêm về con người.' },
      { title: 'Gặp gỡ Fern tại nhà Heiter', icon: '🌲', start: 1120.0, end: 1275.0,
        picks: [700291, 700293, 700294, 700295, 700307, 700319, 700322],
        goal: 'Hỏi đường khi bị lạc trong rừng, giới thiệu một người mới và từ chối khéo một lời nhờ cậy khó.' },
      { title: 'Cuốn cổ thư của Ewig và người học trò mới', icon: '📖', start: 1275.0, end: 1559.986009,
        picks: [700330, 700334, 700349, 700353, 700367, 700369, 700375],
        goal: 'Nhờ giải mã một cuốn sách cổ, nhận lời dạy học trò và khích lệ người đang tập luyện kiên trì.' }
    ]
  };
  const entries = [
    ['hauptstadt', 'die Hauptstadt', 'thủ đô; kinh đô', 'die Hauptstadt, die Hauptstädte (f.).', 700102, ['in die Hauptstadt zurückkehren', 'da ist die Hauptstadt'], 'Ghép từ Haupt- (chính) và die Stadt (thành phố).'],
    ['heimkehr', 'die Heimkehr', 'sự trở về nhà; ngày khải hoàn trở về', 'die Heimkehr (f.), thường dùng ở số ít.', 700103, ['auf der triumphalen Heimkehr', 'nach der Heimkehr'], 'Liên quan đến động từ tách heimkehren (trở về nhà).'],
    ['arbeit-suchen', 'sich eine Arbeit suchen', 'tìm kiếm một công việc', 'suchen + Akk.; mir ở cách Dativ chỉ người hưởng lợi.', 700105, ['sich eine neue Arbeit suchen', 'nach einer Arbeit suchen'], 'Eisen lo nghĩ thực tế về cuộc sống sau khi đánh bại Ma Vương.'],
    ['nachdenken', 'über etwas nachdenken', 'suy nghĩ, ngẫm nghĩ về điều gì', 'Động từ tách: denkt nach; dachte nach; hat nachgedacht. Đi với über + Akk.', 700106, ['über solche Sachen nachdenken', 'lange über eine Frage nachdenken'], 'Tiền tố nach- đứng ở cuối câu hỏi.'],
    ['zeitalter', 'das Zeitalter', 'kỷ nguyên; thời đại', 'das Zeitalter, die Zeitalter (n.).', 700119, ['ein Zeitalter des Friedens', 'in deinem Zeitalter'], 'anbrechen: mở ra, bắt đầu (dùng cho thời đại hoặc buổi bình minh).'],
    ['aufbrechen', 'aufbrechen', 'lên đường; khởi hành', 'Động từ tách: bricht auf; brach auf; ist aufgebrochen.', 700124, ['früh am Morgen aufbrechen', 'zu einer Reise aufbrechen'], 'Dùng trợ động từ sein vì chỉ sự di chuyển.'],
    ['erinnerung', 'die Erinnerung', 'kỷ niệm; ký ức', 'die Erinnerung, die Erinnerungen (f.).', 700147, ['schreckliche Erinnerungen haben', 'wunderschöne Erinnerungen'], 'Trong tập phim, ký ức 10 năm bên nhóm anh hùng là mạch cảm xúc chính của Frieren.'],
    ['erleben', 'erleben', 'trải qua; trải nghiệm', 'erleben + Akk.; erlebte; hat erlebt. Động từ không tách.', 700149, ['Abenteuer mit Freunden erleben', 'viel zusammen erleben'], 'Himmel trân trọng từng chuyến phiêu lưu đã trải qua cùng đồng đội.'],
    ['ruecksicht', 'Rücksicht nehmen', 'tâm lý; biết nghĩ cho người khác', 'die Rücksicht (f.); Rücksicht auf jemanden (Akk.) nehmen.', 700165, ['ein bisschen Rücksicht nehmen', 'auf andere Rücksicht nehmen'], 'Mệnh lệnh thức thân mật: Nimm mal Rücksicht!'],
    ['vorhaben', 'etwas vorhaben', 'có dự định; định làm gì', 'Động từ tách: hat vor; hatte vor; hat vorgehabt.', 700175, ['Was hast du von nun an vor?', 'heute Abend etwas vorhaben'], 'von nun an: từ giờ trở đi.'],
    ['vorbeischauen', 'ab und zu vorbeischauen', 'thỉnh thoảng ghé thăm', 'Động từ tách: schaut vorbei; ist vorbeigeschaut.', 700178, ['bei Freunden vorbeischauen', 'ab und zu mal vorbeischauen'], 'ab und zu đồng nghĩa với hin und wieder (thỉnh thoảng).'],
    ['augenblick', 'der Augenblick', 'khoảnh khắc; thoáng chốc', 'der Augenblick, die Augenblicke (m.).', 700181, ['nur wie ein kurzer Augenblick', 'keinen Augenblick vergessen'], 'Với tuổi thọ của tinh linh, 50 hay 100 năm chỉ như một thoáng chốc.'],
    ['sich-verlaufen', 'sich verlaufen', 'đi lạc; bị lạc đường', 'Động từ phản thân không tách: verläuft sich; verlief sich; hat sich verlaufen.', 700197, ['sich in der Stadt verlaufen', 'sich im Wald verlaufen'], 'Xuất hiện cả khi Frieren trở lại thành phố lẫn khi đi trong rừng tìm nhà Heiter.'],
    ['wertvoll', 'wertvoll', 'quý giá; có giá trị lớn', 'Tính từ: wertvoll – wertvoller – am wertvollsten.', 700214, ['ein sehr wertvolles Geschenk', 'wertvolle Zeit'], 'Trước danh từ trung tính das Geschenk sau ein: ein sehr wertvolles Geschenk.'],
    ['zu-fuss', 'zu Fuß', 'đi bộ', 'Cụm cố định: zu Fuß gehen / brauchen.', 700234, ['eine Woche zu Fuß brauchen', 'zu Fuß unterwegs sein'], 'Viết hoa danh từ Fuß với chữ ß.'],
    ['lebensspanne', 'die Lebensspanne', 'tuổi thọ; quãng đời', 'die Lebensspanne, die Lebensspannen (f.).', 700262, ['die menschliche Lebensspanne', 'eine kurze Lebensspanne'], 'Ghép từ das Leben (cuộc đời) và die Spanne (khoảng).'],
    ['kennenlernen', 'jemanden besser kennenlernen', 'tìm hiểu, làm quen ai kỹ hơn', 'Động từ tách: lernt kennen; hat kennengelernt.', 700264, ['jemanden besser kennenlernen', 'neue Menschen kennenlernen'], 'Câu hỏi tự trách của Frieren trong lễ tang của Himmel.'],
    ['auf-den-weg', 'sich auf den Weg machen', 'lên đường; khởi hành', 'Cụm phản thân: macht sich auf den Weg; hat sich auf den Weg gemacht.', 700277, ['Ich mach mich mal auf den Weg.', 'sich früh auf den Weg machen'], 'Cách nói tự nhiên khi chào tạm biệt để bắt đầu di chuyển.'],
    ['erfahren', 'mehr über jemanden erfahren', 'biết thêm, tìm hiểu thêm về ai', 'erfährt; erfuhr; hat erfahren + über (Akk.).', 700281, ['mehr über die Menschen erfahren', 'etwas Neues erfahren'], 'Mục tiêu mới của Frieren sau khi tiễn biệt Himmel.'],
    ['lehrling', 'der Lehrling', 'học trò; người học việc', 'der Lehrling, die Lehrlinge (m.).', 700319, ['einen Lehrling aufnehmen', 'Lehrlinge der Magie'], 'aufnehmen: nhận vào, thu nhận.'],
    ['anvertrauen', 'jemandem jemanden anvertrauen', 'gửi gắm, phó thác ai cho ai', 'Động từ tách: vertraut an; hat anvertraut (Dat. + Akk.).', 700325, ['einem Freund ein Kind anvertrauen', 'jemandem ein Geheimnis anvertrauen'], 'Trong mệnh đề quan hệ, trợ động từ hat đứng cuối mệnh đề.'],
    ['entschluesseln', 'entschlüsseln', 'giải mã', 'entschlüsseln + Akk.; entschlüsselte; hat entschlüsselt.', 700330, ['ein altes Buch entschlüsseln', 'eine Geheimschrift entschlüsseln'], 'Gốc từ: der Schlüssel (chìa khóa).'],
    ['unterrichten', 'jemanden in etwas unterrichten', 'dạy, giảng dạy cho ai môn gì', 'unterrichten (không tách) + Akk. + in (Dat.).', 700349, ['Fern in Magie unterrichten', 'Kinder unterrichten'], 'Heiter nhờ Frieren dạy pháp thuật cho Fern trong lúc nghỉ giải lao.'],
    ['sich-lohen', 'sich lohnen', 'đáng công; bõ công; đáng giá', 'es lohnt sich + zu + Infinitiv.', 700375, ['Es lohnt sich, danach zu suchen.', 'Die Mühe lohnt sich.'], 'Câu thoại kết tập phim sau phần nhạc kết thúc.']
  ];
  const flashcards = entries.map(([id, term, meaning, grammar, cueId, collocations, note]) => {
    const cue = FRIEREN_S01E01_CAPTION_CUES.find(item => item.id === cueId);
    if (!cue) throw new Error(`Frieren vocabulary refers to missing cue ${cueId}`);
    const chapter = chapterData.chapters.findIndex(c => cue.start >= c.start && cue.end <= c.end);
    if (chapter < 0) throw new Error(`Frieren vocabulary falls outside chapters: ${cueId}`);
    return { id: `vk_frieren_s01e01_${id}`, term, meaning, grammar, example: cue.text,
      collocations, note, deck, tags: ['Video', 'Frieren', 'Fantasy'],
      videoKey: video.key, cueId, sourceUrl: `?kino=frieren&part=${chapter + 1}` };
  });
  chapterData.vocabularyCount = flashcards.length;
  return { video, chapterData, flashcards };
})();
