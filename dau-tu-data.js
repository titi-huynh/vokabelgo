/**
 * DAU-TU-DATA.JS
 * Dữ liệu chuẩn cho bản Preview "Đấu từ — VokabelGo" v0.1
 * Gồm 2 bộ bài độc lập: "Tính từ · Adjektive" và "Động từ · Verben".
 * Mỗi bộ có đúng 60 lá vật lý (48 lá từ + 12 lá chức năng).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DAU_TU_DATA = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const COLORS = {
    rot: { id: 'rot', nameVi: 'Đỏ', nameDe: 'Rot', hex: '#E5484D', borderHex: '#B22222', symbol: 'heart' },
    blau: { id: 'blau', nameVi: 'Xanh dương', nameDe: 'Blau', hex: '#2080E0', borderHex: '#0D47A1', symbol: 'circle' },
    gruen: { id: 'gruen', nameVi: 'Xanh lá', nameDe: 'Grün', hex: '#30A46C', borderHex: '#1B5E20', symbol: 'triangle' },
    gelb: { id: 'gelb', nameVi: 'Vàng', nameDe: 'Gelb', hex: '#F5A623', borderHex: '#D97706', symbol: 'diamond' }
  };

  const COLOR_KEYS = ['rot', 'blau', 'gruen', 'gelb'];

  // ==========================================
  // 1. BỘ TÍNH TỪ · ADJEKTIVE
  // ==========================================
  const ADJEKTIVE_ENTRIES = {
    // Nhóm 1: Độ khó bài tập (schwer ↔ schwierig | GEGENTEIL: leicht ↔ einfach)
    schwer: {
      entryId: 'schwer',
      lemma: 'schwer',
      partOfSpeech: 'Adjektiv',
      senseVi: 'khó, khó khăn',
      baseContextId: 'ctx_adj_difficulty_hard',
      pronunciation: 'schwer',
      dictionaryNotes: 'Duden: "schwer" = viel geistige Anstrengung erfordernd; im Kontext einer Aufgabe Gegenteil von "leicht".'
    },
    schwierig: {
      entryId: 'schwierig',
      lemma: 'schwierig',
      partOfSpeech: 'Adjektiv',
      senseVi: 'khó khăn, phức tạp',
      baseContextId: 'ctx_adj_difficulty_hard',
      pronunciation: 'schwierig',
      dictionaryNotes: 'Duden: "schwierig" = nicht einfach, verwickelt, kompliziert; syn. mit "schwer".'
    },
    leicht: {
      entryId: 'leicht',
      lemma: 'leicht',
      partOfSpeech: 'Adjektiv',
      senseVi: 'dễ, dễ dàng',
      baseContextId: 'ctx_adj_difficulty_easy',
      pronunciation: 'leicht',
      dictionaryNotes: 'Duden: "leicht" = keine Mühe machend, unkompliziert; Gegenteil von "schwer".'
    },
    einfach: {
      entryId: 'einfach',
      lemma: 'einfach',
      partOfSpeech: 'Adjektiv',
      senseVi: 'đơn giản, dễ làm',
      baseContextId: 'ctx_adj_difficulty_easy',
      pronunciation: 'einfach',
      dictionaryNotes: 'Duden: "einfach" = ohne Schwierigkeit zu bewältigen; syn. mit "leicht".'
    },

    // Nhóm 2: Mức giá phòng nghỉ (teuer ↔ kostspielig | GEGENTEIL: billig ↔ günstig)
    teuer: {
      entryId: 'teuer',
      lemma: 'teuer',
      partOfSpeech: 'Adjektiv',
      senseVi: 'đắt, đắt đỏ',
      baseContextId: 'ctx_adj_price_expensive',
      pronunciation: 'teuer',
      dictionaryNotes: 'Duden: "teuer" = einen hohen Preis habend, kostspielig; Gegenteil von "billig".'
    },
    kostspielig: {
      entryId: 'kostspielig',
      lemma: 'kostspielig',
      partOfSpeech: 'Adjektiv',
      senseVi: 'tốn kém, đắt đỏ',
      baseContextId: 'ctx_adj_price_expensive',
      pronunciation: 'kostspielig',
      dictionaryNotes: 'Duden: "kostspielig" = viel Geld kostend, aufwendig; syn. mit "teuer".'
    },
    billig: {
      entryId: 'billig',
      lemma: 'billig',
      partOfSpeech: 'Adjektiv',
      senseVi: 'rẻ, giá thấp',
      baseContextId: 'ctx_adj_price_cheap',
      pronunciation: 'billig',
      dictionaryNotes: 'Duden: "billig" = von geringem Preis; Gegenteil von "teuer".'
    },
    günstig: {
      entryId: 'günstig',
      lemma: 'günstig',
      partOfSpeech: 'Adjektiv',
      senseVi: 'giá phải chăng, tốt',
      baseContextId: 'ctx_adj_price_cheap',
      pronunciation: 'günstig',
      dictionaryNotes: 'Duden: "günstig" = preiswert, vorteilhaft im Preis; syn. mit "billig" im Preiskontext.'
    },

    // Nhóm 3: Âm lượng tiếng ồn (leise ↔ ruhig | GEGENTEIL: laut ↔ lärmend)
    leise: {
      entryId: 'leise',
      lemma: 'leise',
      partOfSpeech: 'Adjektiv',
      senseVi: 'nhỏ tiếng, yên tĩnh',
      baseContextId: 'ctx_adj_volume_quiet',
      pronunciation: 'leise',
      dictionaryNotes: 'Duden: "leise" = von geringer Lautstärke, kaum hörbar; Gegenteil von "laut".'
    },
    ruhig: {
      entryId: 'ruhig',
      lemma: 'ruhig',
      partOfSpeech: 'Adjektiv',
      senseVi: 'trầm tĩnh, êm ả',
      baseContextId: 'ctx_adj_volume_quiet',
      pronunciation: 'ruhig',
      dictionaryNotes: 'Duden: "ruhig" = ohne laute Geräusche, still; syn. mit "leise" bezüglich Lautstärke.'
    },
    laut: {
      entryId: 'laut',
      lemma: 'laut',
      partOfSpeech: 'Adjektiv',
      senseVi: 'to tiếng, ồn ào',
      baseContextId: 'ctx_adj_volume_loud',
      pronunciation: 'laut',
      dictionaryNotes: 'Duden: "laut" = mit hoher Lautstärke vernehmbar; Gegenteil von "leise".'
    },
    lärmend: {
      entryId: 'lärmend',
      lemma: 'lärmend',
      partOfSpeech: 'Adjektiv',
      senseVi: 'làm ầm ĩ, huyên náo',
      baseContextId: 'ctx_adj_volume_loud',
      pronunciation: 'lärmend',
      dictionaryNotes: 'Duden: "lärmend" = lauten Lärm verursachend; syn. mit "laut".'
    }
  };

  const ADJEKTIVE_CONTEXTS = {
    ctx_adj_difficulty_hard: {
      contextId: 'ctx_adj_difficulty_hard',
      topic: 'Bài tập khó khăn',
      explanationVi: 'Ở đây đang nói bài tập khó khăn, phức tạp; không phải vật nặng về khối lượng.',
      sentenceVariants: {
        schwer: {
          de: 'Die Aufgabe ist heute sehr schwer.',
          vi: 'Bài tập hôm nay rất khó.',
          highlightTokens: ['schwer']
        },
        schwierig: {
          de: 'Die Aufgabe ist heute sehr schwierig.',
          vi: 'Bài tập hôm nay rất khó khăn, phức tạp.',
          highlightTokens: ['schwierig']
        }
      }
    },
    ctx_adj_difficulty_easy: {
      contextId: 'ctx_adj_difficulty_easy',
      topic: 'Bài tập dễ dàng',
      explanationVi: 'Ở đây đang nói bài tập dễ dàng, đơn giản; không phải vật nhẹ về trọng lượng.',
      sentenceVariants: {
        leicht: {
          de: 'Die Aufgabe ist heute sehr leicht.',
          vi: 'Bài tập hôm nay rất dễ.',
          highlightTokens: ['leicht']
        },
        einfach: {
          de: 'Die Aufgabe ist heute sehr einfach.',
          vi: 'Bài tập hôm nay rất đơn giản.',
          highlightTokens: ['einfach']
        }
      }
    },
    ctx_adj_price_expensive: {
      contextId: 'ctx_adj_price_expensive',
      topic: 'Khách sạn giá đắt',
      explanationVi: 'Ở đây đang nói về mức giá phòng khách sạn đắt đỏ, tốn kém tiền bạc.',
      sentenceVariants: {
        teuer: {
          de: 'Das Hotel ist heute sehr teuer.',
          vi: 'Khách sạn hôm nay giá rất đắt.',
          highlightTokens: ['teuer']
        },
        kostspielig: {
          de: 'Das Hotel ist heute sehr kostspielig.',
          vi: 'Khách sạn hôm nay rất tốn kém.',
          highlightTokens: ['kostspielig']
        }
      }
    },
    ctx_adj_price_cheap: {
      contextId: 'ctx_adj_price_cheap',
      topic: 'Khách sạn giá phải chăng/rẻ',
      explanationVi: 'Ở đây đang nói về mức giá phòng khách sạn rẻ, vừa túi tiền.',
      sentenceVariants: {
        billig: {
          de: 'Das Hotel ist heute sehr billig.',
          vi: 'Khách sạn hôm nay giá rất rẻ.',
          highlightTokens: ['billig']
        },
        günstig: {
          de: 'Das Hotel ist heute sehr günstig.',
          vi: 'Khách sạn hôm nay giá rất phải chăng.',
          highlightTokens: ['günstig']
        }
      }
    },
    ctx_adj_volume_quiet: {
      contextId: 'ctx_adj_volume_quiet',
      topic: 'Bọn trẻ nhỏ tiếng, yên tĩnh',
      explanationVi: 'Ở đây đang nói về âm thanh nhỏ nhẹ, yên tĩnh; bọn trẻ không gây tiếng động ồn.',
      sentenceVariants: {
        leise: {
          de: 'Die Kinder sind heute sehr leise.',
          vi: 'Bọn trẻ hôm nay rất yên tĩnh.',
          highlightTokens: ['leise']
        },
        ruhig: {
          de: 'Die Kinder sind heute sehr ruhig.',
          vi: 'Bọn trẻ hôm nay rất trầm tĩnh, ngoan ngoãn.',
          highlightTokens: ['ruhig']
        }
      }
    },
    ctx_adj_volume_loud: {
      contextId: 'ctx_adj_volume_loud',
      topic: 'Bọn trẻ to tiếng, ồn ào',
      explanationVi: 'Ở đây đang nói về âm thanh to tiếng, bọn trẻ đang huyên náo, làm ầm.',
      sentenceVariants: {
        laut: {
          de: 'Die Kinder sind heute sehr laut.',
          vi: 'Bọn trẻ hôm nay rất ồn ào.',
          highlightTokens: ['laut']
        },
        lärmend: {
          de: 'Die Kinder sind heute sehr lärmend.',
          vi: 'Bọn trẻ hôm nay làm ầm ĩ náo động.',
          highlightTokens: ['lärmend']
        }
      }
    }
  };

  const ADJEKTIVE_SYNONYMS = [
    // khó
    { contextId: 'ctx_adj_difficulty_hard', from: 'schwer', to: 'schwierig' },
    { contextId: 'ctx_adj_difficulty_hard', from: 'schwierig', to: 'schwer' },
    // dễ
    { contextId: 'ctx_adj_difficulty_easy', from: 'leicht', to: 'einfach' },
    { contextId: 'ctx_adj_difficulty_easy', from: 'einfach', to: 'leicht' },
    // đắt
    { contextId: 'ctx_adj_price_expensive', from: 'teuer', to: 'kostspielig' },
    { contextId: 'ctx_adj_price_expensive', from: 'kostspielig', to: 'teuer' },
    // rẻ
    { contextId: 'ctx_adj_price_cheap', from: 'billig', to: 'günstig' },
    { contextId: 'ctx_adj_price_cheap', from: 'günstig', to: 'billig' },
    // yên tĩnh
    { contextId: 'ctx_adj_volume_quiet', from: 'leise', to: 'ruhig' },
    { contextId: 'ctx_adj_volume_quiet', from: 'ruhig', to: 'leise' },
    // ồn ào
    { contextId: 'ctx_adj_volume_loud', from: 'laut', to: 'lärmend' },
    { contextId: 'ctx_adj_volume_loud', from: 'lärmend', to: 'laut' }
  ];

  const ADJEKTIVE_ANTONYMS = {
    'ctx_adj_difficulty_hard:schwer': {
      targetEntryId: 'leicht',
      targetContextId: 'ctx_adj_difficulty_easy',
      explanationShortVi: 'schwer → leicht: khó → dễ'
    },
    'ctx_adj_difficulty_hard:schwierig': {
      targetEntryId: 'einfach',
      targetContextId: 'ctx_adj_difficulty_easy',
      explanationShortVi: 'schwierig → einfach: khó khăn → đơn giản'
    },
    'ctx_adj_difficulty_easy:leicht': {
      targetEntryId: 'schwer',
      targetContextId: 'ctx_adj_difficulty_hard',
      explanationShortVi: 'leicht → schwer: dễ → khó'
    },
    'ctx_adj_difficulty_easy:einfach': {
      targetEntryId: 'schwierig',
      targetContextId: 'ctx_adj_difficulty_hard',
      explanationShortVi: 'einfach → schwierig: đơn giản → khó khăn'
    },

    'ctx_adj_price_expensive:teuer': {
      targetEntryId: 'billig',
      targetContextId: 'ctx_adj_price_cheap',
      explanationShortVi: 'teuer → billig: đắt → rẻ'
    },
    'ctx_adj_price_expensive:kostspielig': {
      targetEntryId: 'günstig',
      targetContextId: 'ctx_adj_price_cheap',
      explanationShortVi: 'kostspielig → günstig: tốn kém → phải chăng'
    },
    'ctx_adj_price_cheap:billig': {
      targetEntryId: 'teuer',
      targetContextId: 'ctx_adj_price_expensive',
      explanationShortVi: 'billig → teuer: rẻ → đắt'
    },
    'ctx_adj_price_cheap:günstig': {
      targetEntryId: 'kostspielig',
      targetContextId: 'ctx_adj_price_expensive',
      explanationShortVi: 'günstig → kostspielig: phải chăng → tốn kém'
    },

    'ctx_adj_volume_quiet:leise': {
      targetEntryId: 'laut',
      targetContextId: 'ctx_adj_volume_loud',
      explanationShortVi: 'leise → laut: yên lặng → ồn ào'
    },
    'ctx_adj_volume_quiet:ruhig': {
      targetEntryId: 'lärmend',
      targetContextId: 'ctx_adj_volume_loud',
      explanationShortVi: 'ruhig → lärmend: trầm tĩnh → ầm ĩ'
    },
    'ctx_adj_volume_loud:laut': {
      targetEntryId: 'leise',
      targetContextId: 'ctx_adj_volume_quiet',
      explanationShortVi: 'laut → leise: ồn ào → yên lặng'
    },
    'ctx_adj_volume_loud:lärmend': {
      targetEntryId: 'ruhig',
      targetContextId: 'ctx_adj_volume_quiet',
      explanationShortVi: 'lärmend → ruhig: ầm ĩ → trầm tĩnh'
    }
  };

  // ==========================================
  // 2. BỘ ĐỘNG TỪ · VERBEN
  // ==========================================
  const VERBEN_ENTRIES = {
    // Nhóm 1: Giờ học bắt đầu / dừng lại (beginnen ↔ anfangen | GEGENTEIL: enden ↔ aufhören)
    beginnen: {
      entryId: 'beginnen',
      lemma: 'beginnen',
      partOfSpeech: 'Verb',
      senseVi: 'bắt đầu',
      baseContextId: 'ctx_verb_timing_start',
      pronunciation: 'beginnen',
      dictionaryNotes: 'Duden: "beginnen" = seinen Anfang nehmen, anheben; syn. mit "anfangen".'
    },
    anfangen: {
      entryId: 'anfangen',
      lemma: 'anfangen',
      partOfSpeech: 'Verb (tách)',
      senseVi: 'bắt đầu (tách)',
      baseContextId: 'ctx_verb_timing_start',
      pronunciation: 'anfangen',
      dictionaryNotes: 'Duden: "anfangen" = trennbares Verb (fängt an); zeitlich einsetzen.'
    },
    enden: {
      entryId: 'enden',
      lemma: 'enden',
      partOfSpeech: 'Verb',
      senseVi: 'kết thúc',
      baseContextId: 'ctx_verb_timing_end',
      pronunciation: 'enden',
      dictionaryNotes: 'Duden: "enden" = zu Ende gehen, aufhören; Gegenteil von "beginnen".'
    },
    aufhören: {
      entryId: 'aufhören',
      lemma: 'aufhören',
      partOfSpeech: 'Verb (tách)',
      senseVi: 'dừng lại, kết thúc',
      baseContextId: 'ctx_verb_timing_end',
      pronunciation: 'aufhören',
      dictionaryNotes: 'Duden: "aufhören" = trennbares Verb (hört auf); eine Handlung beenden.'
    },

    // Nhóm 2: Mở / Khép cửa sổ (öffnen ↔ aufmachen | GEGENTEIL: schließen ↔ zumachen)
    öffnen: {
      entryId: 'öffnen',
      lemma: 'öffnen',
      partOfSpeech: 'Verb',
      senseVi: 'mở ra',
      baseContextId: 'ctx_verb_window_open',
      pronunciation: 'öffnen',
      dictionaryNotes: 'Duden: "öffnen" = aufmachen; Gegenteil von "schließen".'
    },
    aufmachen: {
      entryId: 'aufmachen',
      lemma: 'aufmachen',
      partOfSpeech: 'Verb (tách)',
      senseVi: 'mở ra (tách)',
      baseContextId: 'ctx_verb_window_open',
      pronunciation: 'aufmachen',
      dictionaryNotes: 'Duden: "aufmachen" = trennbares Verb (macht auf); öffnen.'
    },
    schließen: {
      entryId: 'schließen',
      lemma: 'schließen',
      partOfSpeech: 'Verb',
      senseVi: 'đóng lại',
      baseContextId: 'ctx_verb_window_close',
      pronunciation: 'schließen',
      dictionaryNotes: 'Duden: "schließen" = zumachen; Gegenteil von "öffnen".'
    },
    zumachen: {
      entryId: 'zumachen',
      lemma: 'zumachen',
      partOfSpeech: 'Verb (tách)',
      senseVi: 'đóng lại, khép lại',
      baseContextId: 'ctx_verb_window_close',
      pronunciation: 'zumachen',
      dictionaryNotes: 'Duden: "zumachen" = trennbares Verb (macht zu); schließen.'
    },

    // Nhóm 3: Vội vã / Lề mề (sich beeilen ↔ eilen | GEGENTEIL: trödeln ↔ bummeln)
    'sich beeilen': {
      entryId: 'sich beeilen',
      lemma: 'sich beeilen',
      partOfSpeech: 'Verb (có "sich")',
      senseVi: 'vội vã, khẩn trương',
      baseContextId: 'ctx_verb_haste_fast',
      pronunciation: 'sich beeilen',
      dictionaryNotes: 'Duden: "sich beeilen" = reflexives Verb; schnell handeln/gehen.'
    },
    eilen: {
      entryId: 'eilen',
      lemma: 'eilen',
      partOfSpeech: 'Verb',
      senseVi: 'rảo bước vội, khẩn trương',
      baseContextId: 'ctx_verb_haste_fast',
      pronunciation: 'eilen',
      dictionaryNotes: 'Duden: "eilen" = sich sehr schnell fortbewegen; syn. mit "sich beeilen".'
    },
    trödeln: {
      entryId: 'trödeln',
      lemma: 'trödeln',
      partOfSpeech: 'Verb',
      senseVi: 'lề mề, chậm chạp',
      baseContextId: 'ctx_verb_haste_slow',
      pronunciation: 'trödeln',
      dictionaryNotes: 'Duden: "trödeln" = langsam und träge handeln; Gegenteil von "sich beeilen".'
    },
    bummeln: {
      entryId: 'bummeln',
      lemma: 'bummeln',
      partOfSpeech: 'Verb',
      senseVi: 'la cà, thong thả',
      baseContextId: 'ctx_verb_haste_slow',
      pronunciation: 'bummeln',
      dictionaryNotes: 'Duden: "bummeln" = ohne Eile spazieren, trödeln; syn. mit "trödeln" bezüglich Fortbewegung.'
    }
  };

  const VERBEN_CONTEXTS = {
    ctx_verb_timing_start: {
      contextId: 'ctx_verb_timing_start',
      topic: 'Khóa học bắt đầu lúc 8 giờ',
      explanationVi: 'Ở đây đang nói về hành động bắt đầu giờ học lúc 8 giờ sáng.',
      sentenceVariants: {
        beginnen: {
          de: 'Der Kurs beginnt um acht Uhr.',
          vi: 'Khóa học bắt đầu lúc 8 giờ.',
          highlightTokens: ['beginnt']
        },
        anfangen: {
          de: 'Der Kurs fängt um acht Uhr an.',
          vi: 'Khóa học bắt đầu lúc 8 giờ.',
          highlightTokens: ['fängt', 'an']
        }
      }
    },
    ctx_verb_timing_end: {
      contextId: 'ctx_verb_timing_end',
      topic: 'Khóa học kết thúc lúc 8 giờ',
      explanationVi: 'Ở đây đang nói về hành động kết thúc, dừng giờ học lúc 8 giờ.',
      sentenceVariants: {
        enden: {
          de: 'Der Kurs endet um acht Uhr.',
          vi: 'Khóa học kết thúc lúc 8 giờ.',
          highlightTokens: ['endet']
        },
        aufhören: {
          de: 'Der Kurs hört um acht Uhr auf.',
          vi: 'Khóa học dừng lại lúc 8 giờ.',
          highlightTokens: ['hört', 'auf']
        }
      }
    },
    ctx_verb_window_open: {
      contextId: 'ctx_verb_window_open',
      topic: 'Mở cửa sổ đón gió sáng',
      explanationVi: 'Ở đây đang nói về việc mở cửa sổ phòng vào buổi sáng sớm.',
      sentenceVariants: {
        öffnen: {
          de: 'Ich öffne das Fenster am Morgen.',
          vi: 'Tôi mở cửa sổ vào buổi sáng.',
          highlightTokens: ['öffne']
        },
        aufmachen: {
          de: 'Ich mache das Fenster am Morgen auf.',
          vi: 'Tôi mở cửa sổ vào buổi sáng.',
          highlightTokens: ['mache', 'auf']
        }
      }
    },
    ctx_verb_window_close: {
      contextId: 'ctx_verb_window_close',
      topic: 'Đóng cửa sổ vào buổi tối',
      explanationVi: 'Ở đây đang nói về việc khép, đóng kín cửa sổ vào buổi tối.',
      sentenceVariants: {
        schließen: {
          de: 'Ich schließe das Fenster am Abend.',
          vi: 'Tôi đóng cửa sổ vào buổi tối.',
          highlightTokens: ['schließe']
        },
        zumachen: {
          de: 'Ich mache das Fenster am Abend zu.',
          vi: 'Tôi khép cửa sổ vào buổi tối.',
          highlightTokens: ['mache', 'zu']
        }
      }
    },
    ctx_verb_haste_fast: {
      contextId: 'ctx_verb_haste_fast',
      topic: 'Vội vã, rảo bước trên đường',
      explanationVi: 'Ở đây đang nói về hành động vội vã, gấp rút đi đến trường.',
      sentenceVariants: {
        'sich beeilen': {
          de: 'Die Schülerin beeilt sich auf dem Weg.',
          vi: 'Nữ sinh vội vã trên đường đi.',
          highlightTokens: ['beeilt', 'sich']
        },
        eilen: {
          de: 'Die Schülerin eilt auf dem Weg.',
          vi: 'Nữ sinh rảo bước vội trên đường đi.',
          highlightTokens: ['eilt']
        }
      }
    },
    ctx_verb_haste_slow: {
      contextId: 'ctx_verb_haste_slow',
      topic: 'Lề mề, la cà trên đường',
      explanationVi: 'Ở đây đang nói về hành vi chậm chạp, lề mề hoặc la cà thong dong.',
      sentenceVariants: {
        trödeln: {
          de: 'Die Schülerin trödelt auf dem Weg.',
          vi: 'Nữ sinh lề mề, chậm chạp trên đường đi.',
          highlightTokens: ['trödelt']
        },
        bummeln: {
          de: 'Die Schülerin bummelt auf dem Weg.',
          vi: 'Nữ sinh thong thả, la cà trên đường đi.',
          highlightTokens: ['bummelt']
        }
      }
    }
  };

  const VERBEN_SYNONYMS = [
    // bắt đầu
    { contextId: 'ctx_verb_timing_start', from: 'beginnen', to: 'anfangen' },
    { contextId: 'ctx_verb_timing_start', from: 'anfangen', to: 'beginnen' },
    // kết thúc
    { contextId: 'ctx_verb_timing_end', from: 'enden', to: 'aufhören' },
    { contextId: 'ctx_verb_timing_end', from: 'aufhören', to: 'enden' },
    // mở
    { contextId: 'ctx_verb_window_open', from: 'öffnen', to: 'aufmachen' },
    { contextId: 'ctx_verb_window_open', from: 'aufmachen', to: 'öffnen' },
    // đóng
    { contextId: 'ctx_verb_window_close', from: 'schließen', to: 'zumachen' },
    { contextId: 'ctx_verb_window_close', from: 'zumachen', to: 'schließen' },
    // vội
    { contextId: 'ctx_verb_haste_fast', from: 'sich beeilen', to: 'eilen' },
    { contextId: 'ctx_verb_haste_fast', from: 'eilen', to: 'sich beeilen' },
    // chậm
    { contextId: 'ctx_verb_haste_slow', from: 'trödeln', to: 'bummeln' },
    { contextId: 'ctx_verb_haste_slow', from: 'bummeln', to: 'trödeln' }
  ];

  const VERBEN_ANTONYMS = {
    'ctx_verb_timing_start:beginnen': {
      targetEntryId: 'enden',
      targetContextId: 'ctx_verb_timing_end',
      explanationShortVi: 'beginnen → enden: bắt đầu → kết thúc'
    },
    'ctx_verb_timing_start:anfangen': {
      targetEntryId: 'aufhören',
      targetContextId: 'ctx_verb_timing_end',
      explanationShortVi: 'anfangen → aufhören: bắt đầu → kết thúc'
    },
    'ctx_verb_timing_end:enden': {
      targetEntryId: 'beginnen',
      targetContextId: 'ctx_verb_timing_start',
      explanationShortVi: 'enden → beginnen: kết thúc → bắt đầu'
    },
    'ctx_verb_timing_end:aufhören': {
      targetEntryId: 'anfangen',
      targetContextId: 'ctx_verb_timing_start',
      explanationShortVi: 'aufhören → anfangen: kết thúc → bắt đầu'
    },

    'ctx_verb_window_open:öffnen': {
      targetEntryId: 'schließen',
      targetContextId: 'ctx_verb_window_close',
      explanationShortVi: 'öffnen → schließen: mở → đóng'
    },
    'ctx_verb_window_open:aufmachen': {
      targetEntryId: 'zumachen',
      targetContextId: 'ctx_verb_window_close',
      explanationShortVi: 'aufmachen → zumachen: mở ra → khép lại'
    },
    'ctx_verb_window_close:schließen': {
      targetEntryId: 'öffnen',
      targetContextId: 'ctx_verb_window_open',
      explanationShortVi: 'schließen → öffnen: đóng → mở'
    },
    'ctx_verb_window_close:zumachen': {
      targetEntryId: 'aufmachen',
      targetContextId: 'ctx_verb_window_open',
      explanationShortVi: 'zumachen → aufmachen: khép lại → mở ra'
    },

    'ctx_verb_haste_fast:sich beeilen': {
      targetEntryId: 'trödeln',
      targetContextId: 'ctx_verb_haste_slow',
      explanationShortVi: 'sich beeilen → trödeln: vội vã → lề mề'
    },
    'ctx_verb_haste_fast:eilen': {
      targetEntryId: 'bummeln',
      targetContextId: 'ctx_verb_haste_slow',
      explanationShortVi: 'eilen → bummeln: rảo bước vội → la cà thong thả'
    },
    'ctx_verb_haste_slow:trödeln': {
      targetEntryId: 'sich beeilen',
      targetContextId: 'ctx_verb_haste_fast',
      explanationShortVi: 'trödeln → sich beeilen: lề mề → vội vã'
    },
    'ctx_verb_haste_slow:bummeln': {
      targetEntryId: 'eilen',
      targetContextId: 'ctx_verb_haste_fast',
      explanationShortVi: 'bummeln → eilen: la cà thong thả → rảo bước vội'
    }
  };

  // ==========================================
  // 3. SINH BỘ LÁ VẬT LÝ (EXACT 60 CARDS PER DECK)
  // ==========================================
  /**
   * Tạo 60 lá vật lý với ID duy nhất cho một bộ:
   * - 12 từ-nghĩa × 4 màu = 48 lá từ
   * - 4 lá Aussetzen (1 mỗi màu)
   * - 4 lá Zieh Zwei (+2) (1 mỗi màu)
   * - 2 lá Farbenwahl (trung tính)
   * - 2 lá GEGENTEIL! (trung tính)
   * Tổng: 60 lá.
   */
  function buildExpandedDeck() {
    let runtime = null;
    if (typeof DAU_TU_EXPANDED_RUNTIME !== 'undefined') {
      runtime = DAU_TU_EXPANDED_RUNTIME;
    } else {
      try {
        runtime = require('./data/lexicon/runtime/dau-tu-runtime-data.js');
      } catch (e) {}
    }
    if (!runtime || !runtime.decks || !runtime.decks.adjektive) return null;

    const base = runtime.decks.adjektive;
    return {
      id: 'lexicon_expanded',
      nameVi: 'Kho từ Mở rộng · Expanded Lexicon',
      description: 'Dữ liệu OpenThesaurus đã qua thẩm định (Section 30), 60 lá chuẩn bàn 4 người.',
      entries: base.entries || {},
      contexts: base.contexts || {},
      synonyms: base.synonyms || [],
      antonyms: base.antonyms || {},
      cards: base.cards || []
    };
  }

  let _activeMatchDecks = {};
  let _matchDeckBuilder = null;
  let _vocabularyHistory = null;

  function getMatchDeckBuilder() {
    if (_matchDeckBuilder) return _matchDeckBuilder;
    let BuilderClass = null;
    let HistClass = null;
    let clusters = null;

    if (typeof MatchDeckBuilder !== 'undefined') {
      BuilderClass = MatchDeckBuilder.MatchDeckBuilder || MatchDeckBuilder;
    } else {
      try {
        BuilderClass = require('./src/lexicon/match-deck-builder').MatchDeckBuilder;
      } catch (e) {}
    }

    if (typeof VocabularyHistory !== 'undefined') {
      HistClass = VocabularyHistory;
    } else {
      try {
        HistClass = require('./src/lexicon/vocabulary-history');
      } catch (e) {}
    }

    if (typeof SEMANTIC_CLUSTERS !== 'undefined') {
      clusters = SEMANTIC_CLUSTERS;
    } else {
      try {
        clusters = require('./src/lexicon/semantic-clusters');
      } catch (e) {}
    }

    let runtime = null;
    if (typeof DAU_TU_EXPANDED_RUNTIME !== 'undefined') {
      runtime = DAU_TU_EXPANDED_RUNTIME;
    } else {
      try {
        runtime = require('./data/lexicon/runtime/dau-tu-runtime-data.js');
      } catch (e) {}
    }

    if (BuilderClass && runtime) {
      _vocabularyHistory = HistClass ? new HistClass() : null;
      _matchDeckBuilder = new BuilderClass(runtime, _vocabularyHistory, { clusters: clusters || runtime.clusters });
    }
    return _matchDeckBuilder;
  }

  function buildDynamicMatchDeck(deckId, options = {}) {
    const builder = getMatchDeckBuilder();
    if (!builder) return null;
    const pos = (deckId === 'verben' || deckId === 'verb') ? 'verb' : 'adjective';
    const matchDeck = builder.buildMatchDeck(pos, options);
    _activeMatchDecks[deckId] = matchDeck;
    return matchDeck;
  }

  function getActiveMatchDeck(deckId) {
    return _activeMatchDecks[deckId] || null;
  }

  function setActiveMatchDeck(deckId, matchDeck) {
    _activeMatchDecks[deckId] = matchDeck;
  }

  function getVocabularyHistory() {
    if (!_vocabularyHistory) {
      getMatchDeckBuilder();
    }
    return _vocabularyHistory;
  }

  function getDeckData(deckId) {
    if (_activeMatchDecks[deckId]) {
      return _activeMatchDecks[deckId];
    }
    if (deckId === 'adjektive') return DAU_TU_DATA.ADJEKTIVE;
    if (deckId === 'verben') return DAU_TU_DATA.VERBEN;
    if (deckId === 'lexicon_expanded') return DAU_TU_DATA.LEXICON_EXPANDED;
    throw new Error(`Bộ từ không hợp lệ: ${deckId}`);
  }

  function createDeckPhysicalCards(deckId, options = {}) {
    if (options && options.matchDeck) {
      return options.matchDeck.cards.map(c => Object.assign({}, c));
    }
    if (_activeMatchDecks[deckId] && options && options.useActiveMatchDeck) {
      return _activeMatchDecks[deckId].cards.map(c => Object.assign({}, c));
    }
    if (deckId === 'lexicon_expanded') {
      const expDeck = buildExpandedDeck();
      if (expDeck && expDeck.cards) {
        return expDeck.cards.map(c => Object.assign({}, c, { deckId: 'lexicon_expanded' }));
      }
    }

    const isAdj = deckId === 'adjektive';
    const entries = isAdj ? ADJEKTIVE_ENTRIES : VERBEN_ENTRIES;
    const prefix = isAdj ? 'adj' : 'verb';
    const cards = [];

    // 48 lá từ: 12 entries x 4 colors
    Object.keys(entries).forEach(function (entryId) {
      COLOR_KEYS.forEach(function (colorKey) {
        cards.push({
          id: `${prefix}_card_${colorKey}_${entryId}`,
          deckId: deckId,
          type: 'word',
          color: colorKey,
          entryId: entryId,
          actionType: null,
          label: entries[entryId].lemma,
          partOfSpeech: entries[entryId].partOfSpeech
        });
      });
    });

    // 4 lá Aussetzen (1 mỗi màu)
    COLOR_KEYS.forEach(function (colorKey, idx) {
      cards.push({
        id: `${prefix}_action_aussetzen_${colorKey}_${idx + 1}`,
        deckId: deckId,
        type: 'action',
        color: colorKey,
        entryId: null,
        actionType: 'aussetzen',
        label: 'Aussetzen',
        partOfSpeech: 'Lá chức năng'
      });
    });

    // 4 lá Zieh Zwei (+2) (1 mỗi màu)
    COLOR_KEYS.forEach(function (colorKey, idx) {
      cards.push({
        id: `${prefix}_action_plus2_${colorKey}_${idx + 1}`,
        deckId: deckId,
        type: 'action',
        color: colorKey,
        entryId: null,
        actionType: 'plus2',
        label: '+2',
        subLabel: 'Zieh Zwei',
        partOfSpeech: 'Lá chức năng'
      });
    });

    // 2 lá Farbenwahl (trung tính)
    for (let i = 1; i <= 2; i++) {
      cards.push({
        id: `${prefix}_action_farbenwahl_${i}`,
        deckId: deckId,
        type: 'action',
        color: 'neutral',
        entryId: null,
        actionType: 'farbenwahl',
        label: 'Farbenwahl',
        partOfSpeech: 'Lá chức năng'
      });
    }

    // 2 lá GEGENTEIL! (trung tính)
    for (let i = 1; i <= 2; i++) {
      cards.push({
        id: `${prefix}_action_gegenteil_${i}`,
        deckId: deckId,
        type: 'action',
        color: 'neutral',
        entryId: null,
        actionType: 'gegenteil',
        label: 'GEGENTEIL!',
        partOfSpeech: 'Lá chức năng'
      });
    }

    if (cards.length !== 60) {
      throw new Error(`Lỗi sinh bộ bài ${deckId}: kỳ vọng đúng 60 lá, thực tế ${cards.length} lá.`);
    }

    return cards;
  }

  // 10 lá mẫu đại diện cho trang mẫu component
  // 6 lá từ (đủ 4 màu, từ dài, cụm có "sich") + 4 lá chức năng (+ mặt sau riêng)
  const SAMPLE_CARDS = [
    {
      id: 'sample_adj_rot_schwierig',
      type: 'word',
      color: 'rot',
      label: 'schwierig',
      partOfSpeech: 'Adjektiv',
      isDisplayTestOnly: false
    },
    {
      id: 'sample_adj_blau_freundlich',
      type: 'word',
      color: 'blau',
      label: 'freundlich',
      partOfSpeech: 'Adjektiv',
      isDisplayTestOnly: true,
      displayTestNote: 'Mẫu kiểm tra hiển thị (Adjektiv dài vừa)'
    },
    {
      id: 'sample_adj_gruen_modern',
      type: 'word',
      color: 'gruen',
      label: 'modern',
      partOfSpeech: 'Adjektiv',
      isDisplayTestOnly: true,
      displayTestNote: 'Mẫu kiểm tra hiển thị (Adjektiv ngắn)'
    },
    {
      id: 'sample_adj_gelb_leise',
      type: 'word',
      color: 'gelb',
      label: 'leise',
      partOfSpeech: 'Adjektiv',
      isDisplayTestOnly: false
    },
    {
      id: 'sample_verb_rot_anfangen',
      type: 'word',
      color: 'rot',
      label: 'anfangen',
      partOfSpeech: 'Verb',
      subBadge: 'Động từ tách',
      isDisplayTestOnly: false
    },
    {
      id: 'sample_verb_gruen_sich_beeilen',
      type: 'word',
      color: 'gruen',
      label: 'sich beeilen',
      partOfSpeech: 'Verb',
      subBadge: 'Có "sich"',
      isDisplayTestOnly: false
    },
    {
      id: 'sample_action_aussetzen',
      type: 'action',
      color: 'rot',
      actionType: 'aussetzen',
      label: 'Aussetzen',
      subBadge: 'Bỏ lượt',
      isDisplayTestOnly: false
    },
    {
      id: 'sample_action_plus2',
      type: 'action',
      color: 'blau',
      actionType: 'plus2',
      label: '+2',
      subLabel: 'Zieh Zwei',
      subBadge: '+2 lá',
      isDisplayTestOnly: false
    },
    {
      id: 'sample_action_farbenwahl',
      type: 'action',
      color: 'neutral',
      actionType: 'farbenwahl',
      label: 'Farbenwahl',
      subBadge: 'Đổi màu',
      isDisplayTestOnly: false
    },
    {
      id: 'sample_action_gegenteil',
      type: 'action',
      color: 'neutral',
      actionType: 'gegenteil',
      label: 'GEGENTEIL!',
      subBadge: 'Đổi nghĩa',
      isDisplayTestOnly: false
    }
  ];

  return {
    COLORS: COLORS,
    COLOR_KEYS: COLOR_KEYS,
    ADJEKTIVE: {
      id: 'adjektive',
      nameVi: 'Tính từ · Adjektive',
      description: 'Luyện các cặp tính từ quen thuộc: khó/dễ, đắt/rẻ, ồn ào/yên tĩnh.',
      entries: ADJEKTIVE_ENTRIES,
      contexts: ADJEKTIVE_CONTEXTS,
      synonyms: ADJEKTIVE_SYNONYMS,
      antonyms: ADJEKTIVE_ANTONYMS
    },
    VERBEN: {
      id: 'verben',
      nameVi: 'Động từ · Verben',
      description: 'Luyện các cặp động từ: bắt đầu/kết thúc, mở/đóng, vội vã/lề mề (có động từ tách và "sich").',
      entries: VERBEN_ENTRIES,
      contexts: VERBEN_CONTEXTS,
      synonyms: VERBEN_SYNONYMS,
      antonyms: VERBEN_ANTONYMS
    },
    get LEXICON_EXPANDED() {
      return buildExpandedDeck();
    },
    buildExpandedDeck: buildExpandedDeck,
    buildDynamicMatchDeck: buildDynamicMatchDeck,
    getActiveMatchDeck: getActiveMatchDeck,
    setActiveMatchDeck: setActiveMatchDeck,
    getMatchDeckBuilder: getMatchDeckBuilder,
    getVocabularyHistory: getVocabularyHistory,
    getDeckData: getDeckData,
    createDeckPhysicalCards: createDeckPhysicalCards,
    SAMPLE_CARDS: SAMPLE_CARDS
  };
});
