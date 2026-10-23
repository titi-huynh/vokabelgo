/* Original NDR/KiKA episode, selected bilingual dialogue and independent progress. */
const ERDMAENNCHEN_SCHMUCKLOSE_LESSON = (() => {
  const deck = '🎬 Video: Jan & Henry – Die schmucklose Gräfin';
  const video = {
    key: 'erdmaennchen_schmucklose', series: 'Ein Fall für die Erdmännchen', seriesIcon: '🔎', episodeTitle: 'Die schmucklose Gräfin',
    icon: '👑', title: '👑 Jan & Henry – Die schmucklose Gräfin', src: 'video/erdmaennchen_schmucklose.mp4',
    storageKey: 'kino_calibrated_erdmaennchen_schmucklose_v1', syncKey: 'vokabelgo_kino_perfected_erdmaennchen_schmucklose',
    progressKey: 'vokabelgo_kino_progress_erdmaennchen_schmucklose', fullDurationStr: '12:02', flashcardDeck: deck,
    sourceUrl: 'https://www.kika.de/ein-fall-fuer-die-erdmaennchen/videos/die-schmucklose-graefin-s-e-100'
  };
  const chapterData = {
    title: 'Die schmucklose Gräfin', series: 'EIN FALL FÜR DIE ERDMÄNNCHEN',
    summary: 'Nữ bá tước mất trang sức · Jan và Henry lần theo dấu vết hạt lạc tới một chú voi ăn kiêng và cô chim ác là điệu đà.',
    levelLabel: 'Gợi ý A2–B1', defaultMode: 'all', practiceModeVersion: 1,
    allLabel: 'Các câu trong bài',
    allDescription: 'Lời thoại chọn lọc · Có thể chuyển sang 7 câu trọng tâm',
    captionCues: ERDMAENNCHEN_SCHMUCKLOSE_CAPTION_CUES,
    storageKey: 'vokabelgo_kino_chapters_v1_erdmaennchen_schmucklose',
    legacyKey: video.progressKey, legacyCount: 0,
    chapters: [
      { title: 'Biệt thự của nữ bá tước', icon: '👑', start: 0, end: 145.0,
        picks: [1000101, 1000112, 1000117, 1000118, 1000122, 1000125, 1000128],
        goal: 'Kể về việc nhìn thấy xe cảnh sát, hỏi chuyện xảy ra và lắng nghe người khác trình bày sự việc.' },
      { title: 'Hạt lạc rơi trên sàn', icon: '🥜', start: 145.0, end: 250.0,
        picks: [1000130, 1000137, 1000138, 1000139, 1000144, 1000145, 1000152],
        goal: 'Đặt câu hỏi điều tra, thảo luận các khả năng và lần theo dấu vết tìm thấy.' },
      { title: 'Gặp chú voi đang ăn kiêng', icon: '🐘', start: 250.0, end: 329.5,
        picks: [1000155, 1000159, 1000161, 1000166, 1000169, 1000171, 1000174],
        goal: 'Bày tỏ ngạc nhiên trước một loài vật lớn, chất vấn nghi phạm và nghe lời giải thích.' },
      { title: 'Cô chim ác là điệu đà', icon: '🪶', start: 329.5, end: 482.0,
        picks: [1000180, 1000183, 1000194, 1000202, 1000203, 1000206, 1000207],
        goal: 'Miêu tả ngoại hình, đưa giả thuyết về vụ trộm và hỏi nguồn gốc món đồ mượn.' },
      { title: 'Người bạn trai bí ẩn', icon: '🔎', start: 482.0, end: 569.4,
        picks: [1000211, 1000212, 1000216, 1000219, 1000222, 1000223, 1000226],
        goal: 'Nhận ra địa điểm quen thuộc, đối chất và chỉ ra bằng chứng phát hiện được.' },
      { title: 'Lời thú nhận của Wilhelm', icon: '💌', start: 569.4, end: 665.3,
        picks: [1000229, 1000232, 1000235, 1000236, 1000241, 1000243, 1000246],
        goal: 'Thừa nhận sai lầm, bày tỏ tình cảm chân thành và xin lỗi khi nghi oan cho người khác.' },
      { title: 'Cuộn len và những món quà mới', icon: '🧶', start: 665.3, end: 722.48,
        picks: [1000249, 1000251, 1000256, 1000257, 1000259, 1000261, 1000265],
        goal: 'Thông báo kết quả phá án, đón nhận tình huống bất ngờ và gợi ý những món đồ len hữu ích.' }
    ]
  };
  const entries = [
    ['schmuck', 'der Schmuck', 'đồ trang sức', 'der Schmuck (m.); danh từ số ít, không dùng số nhiều.', 1000117, ['den Schmuck stehlen', 'echter Schmuck'], 'Chủ đề trung tâm của tập phim: nữ bá tước bị mất trang sức.'],
    ['stehlen', 'stehlen', 'lấy trộm; đánh cắp', 'stiehlt; stahl; hat gestohlen. Dạng bị động: ist gestohlen worden.', 1000117, ['jemandem etwas stehlen', 'Geld stehlen'], 'Mein ganzer Schmuck ist gestohlen worden: Toàn bộ trang sức của tôi đã bị trộm.'],
    ['beweisstueck', 'das Beweisstück', 'vật chứng; bằng chứng', 'das Beweisstück, die Beweisstücke (n.).', 1000122, ['ein Beweisstück mitnehmen', 'wichtiges Beweisstück'], 'Viên cảnh sát lấy chiếc khăn len làm vật chứng để điều tra.'],
    ['vorschrift', 'die Vorschrift', 'quy định; điều lệ', 'die Vorschrift, die Vorschriften (f.).', 1000123, ['Vorschrift ist Vorschrift', 'eine Vorschrift befolgen'], 'Vorschrift ist Vorschrift: Quy định là quy định, câu nói quen thuộc của viên cảnh sát.'],
    ['einbrecher', 'der Einbrecher', 'kẻ đột nhập; tên trộm', 'der Einbrecher, die Einbrecher (m.); nữ: die Einbrecherin.', 1000130, ['ein Einbrecher im Haus', 'den Einbrecher fassen'], 'Người đột nhập vào nhà để lấy trộm đồ.'],
    ['auffallen', 'auffallen', 'đập vào mắt; nhận thấy điều bất thường', 'fällt auf; fiel auf; ist aufgefallen. Đi với Dativ.', 1000137, ['jemandem auffallen', 'Ist Ihnen etwas aufgefallen?'], 'Ist Ihnen irgendwas aufgefallen?: Bác có nhận thấy điều gì bất thường không?'],
    ['einbruch', 'der Einbruch', 'vụ đột nhập; vụ trộm nhà', 'der Einbruch, die Einbrüche (m.). Động từ: einbrechen.', 1000138, ['an einen Einbruch glauben', 'Spuren eines Einbruchs'], 'Wilhelm không tin có vụ đột nhập vì không có cửa sổ nào vỡ.'],
    ['schluesselloch', 'das Schlüsselloch', 'lỗ khóa', 'das Schlüsselloch, die Schlüssellöcher (n.).', 1000140, ['durchs Schlüsselloch schauen', 'gespenstersicher sein'], 'Jan và Henry đùa rằng con ma có thể chui qua lỗ khóa.'],
    ['vergesslich', 'vergesslich', 'hay quên; đãng trí', 'Tính từ: vergesslich.', 1000143, ['vergesslich sein', 'im Alter vergesslich werden'], 'Wilhelm gợi ý nữ bá tước để quên trang sức, khiến bà không hài lòng.'],
    ['erdnuss', 'die Erdnuss', 'hạt lạc; đậu phộng', 'die Erdnuss, die Erdnüsse (f.).', 1000146, ['eine Erdnuss essen', 'eine Tüte Erdnüsse'], 'Manh mối quan trọng mà Jan và Henry tìm thấy trên sàn biệt thự.'],
    ['spurensuche', 'die Spurensuche', 'việc tìm kiếm dấu vết', 'die Spurensuche, die Spurensuchen (f.).', 1000145, ['sich auf Spurensuche machen', 'erfolgreiche Spurensuche'], 'sich auf Spurensuche machen: bắt đầu lần theo dấu vết vụ án.'],
    ['elefant', 'der Elefant', 'con voi', 'der Elefant, die Elefanten (m.); danh từ yếu N-Deklination.', 1000159, ['ein dicker Elefant', 'ein Rüsselwärmer für Elefanten'], 'Jan và Henry lần theo dấu vết hạt lạc và gặp một chú voi.'],
    ['dick-machen', 'dick machen', 'làm béo; gây tăng cân', 'Động từ: macht dick; hat dick gemacht.', 1000170, ['Erdnüsse machen dick', 'Süßigkeiten machen dick'], 'Chú voi giải thích không được ăn lạc vì lạc làm béo.'],
    ['diaet', 'die Diät', 'chế độ ăn kiêng', 'die Diät, die Diäten (f.). Cụm: auf Diät sein.', 1000171, ['auf Diät sein', 'eine strenge Diät machen'], 'Ich bin auf Diät: Tôi đang trong chế độ ăn kiêng.'],
    ['elster', 'die Elster', 'chim ác là', 'die Elster, die Elstern (f.).', 1000176, ['eine diebische Elster', 'Hannelore Elster'], 'Loài chim thường bị định kiến là hay tha những vật sáng loáng.'],
    ['stiebitzen', 'stiebitzen', 'lấy trộm; ăn cắp vặt', 'stiebitzt; stiebitzte; hat gestiebitzt. Khẩu ngữ thân mật.', 1000183, ['etwas stiebitzen', 'Süßigkeiten stiebitzen'], 'Từ ngữ biểu cảm chỉ hành động cuỗm đồ nhanh thoăn thoắt.'],
    ['funkeln', 'funkeln', 'lấp lánh; sáng lấp lánh', 'funkelt; funkelte; hat gefunkelt.', 1000183, ['funkeln und glitzern', 'funkelnder Schmuck'], 'Đặc điểm của đồ trang sức khiến chim ác là bị nghi ngờ.'],
    ['friseur', 'der Friseur', 'thợ làm tóc; tiệm làm tóc', 'der Friseur, die Friseure (m.); nữ: die Friseurin.', 1000203, ['beim Friseur sein', 'zum Friseur gehen'], 'Hannelore làm tóc để chuẩn bị cùng bạn trai đi xem nhạc kịch opera.'],
    ['irrtum', 'der Irrtum', 'sự nhầm lẫn; sự hiểu lầm', 'der Irrtum, die Irrtümer (m.).', 1000207, ['ein großer Irrtum', 'Das ist ein Irrtum.'], 'Hannelore khẳng định chuyện trộm cắp chỉ là sự hiểu lầm.'],
    ['butler', 'der Butler', 'người quản gia', 'der Butler, die Butler (m.).', 1000219, ['der Butler der Gräfin', 'als Butler arbeiten'], 'Hóa ra bạn trai bí ẩn của Hannelore chính là bác quản gia Wilhelm.'],
    ['flunkern', 'flunkern', 'nói khoác; bịa chuyện vô hại', 'flunkert; flunkerte; hat geflunkert. Thân mật nhẹ nhàng hơn lügen.', 1000229, ['ein bisschen flunkern', 'nicht flunkern'], 'Wilhelm thừa nhận mình nói khoác về căn biệt thự để gây ấn tượng.'],
    ['freude', 'eine Freude machen', 'mang lại niềm vui cho ai', 'die Freude (f.); jemandem eine Freude machen.', 1000235, ['jemandem eine Freude machen', 'große Freude'], 'Wilhelm mượn trang sức chỉ vì muốn làm cho bạn gái vui.'],
    ['beschwindeln', 'beschwindeln', 'nói dối; lừa dối ai', 'beschwindelt; beschwindelte; hat beschwindelt.', 1000236, ['jemanden beschwindeln', 'niemanden beschwindeln müssen'], 'Hannelore nhắc rằng có tình cảm thật lòng thì không cần phải lừa dối nhau.'],
    ['auge-zudruecken', 'ein Auge zudrücken', 'nhắm mắt bỏ qua; châm chước', 'Thành ngữ: drückt ein Auge zu; drückte ein Auge zu; hat ein Auge zugedrückt.', 1000241, ['ein Auge zudrücken', 'noch einmal ein Auge zudrücken'], 'Nữ bá tước quyết định tha thứ và châm chước cho Wilhelm lần này.']
  ];
  const flashcards = entries.map(([id, term, meaning, grammar, cueId, collocations, note]) => {
    const cue = ERDMAENNCHEN_SCHMUCKLOSE_ALIGNED_UTTERANCES.find(item => item.id === cueId);
    if (!cue) throw new Error(`Schmucklose vocabulary refers to missing cue ${cueId}`);
    const chapter = chapterData.chapters.findIndex(c => cue.start >= c.start && cue.end <= c.end);
    if (chapter < 0) throw new Error(`Schmucklose vocabulary falls outside chapters: ${cueId}`);
    return { id: `vk_erdmaennchen_schmucklose_${id}`, term, meaning, grammar, example: cue.text,
      collocations, note, deck, tags: ['Video', 'Jan & Henry', 'Alltag'],
      videoKey: video.key, cueId, sourceUrl: `?kino=schmucklose&part=${chapter + 1}` };
  });
  chapterData.vocabularyCount = flashcards.length;
  return { video, chapterData, flashcards };
})();
