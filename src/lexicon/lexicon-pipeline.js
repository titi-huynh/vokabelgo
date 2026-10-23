/**
 * LEXICON-PIPELINE.JS
 * Master pipeline orchestrator for Đấu Từ Lexical Pipeline v0.1.
 * Connects OpenThesaurusAdapter -> LexiconNormalizer -> CandidateStore -> DeckBuilder -> RuntimeExporter.
 */

const { OpenThesaurusAdapter } = require('./providers/openthesaurus-adapter');
const { LexiconNormalizer } = require('./normalizer');
const { CandidateStore } = require('./candidate-store');
const { DeckBuilder } = require('./deck-builder');
const { RuntimeExporter } = require('./runtime-exporter');

const SEED_ADJECTIVE_LEMMAS = [
  'schwer', 'schwierig', 'leicht', 'einfach', 'teuer', 'kostspielig',
  'billig', 'günstig', 'preiswert', 'leise', 'ruhig', 'laut', 'lärmend',
  'schnell', 'rasch', 'langsam', 'gemächlich', 'alt', 'jung', 'neu',
  'frisch', 'groß', 'riesig', 'klein', 'winzig', 'stark', 'kräftig',
  'schwach', 'kraftlos', 'mutig', 'tapfer', 'ängstlich', 'klug', 'schlau', 'dumm'
];

const SEED_VERB_LEMMAS = [
  'beginnen', 'anfangen', 'aufhören', 'enden', 'öffnen', 'aufmachen',
  'schließen', 'zumachen', 'sich beeilen', 'eilen', 'trödeln', 'bummeln',
  'helfen', 'unterstützen', 'stören', 'behindern', 'finden', 'entdecken',
  'verlieren', 'verlegen', 'kaufen', 'erwerben', 'verkaufen', 'veräußern',
  'ankommen', 'eintreffen', 'abfahren', 'abreisen', 'verstehen', 'begreifen',
  'missverstehen', 'fragen', 'antworten', 'erwidern', 'suchen'
];

class LexiconPipeline {
  constructor(options = {}) {
    this.adapter = new OpenThesaurusAdapter(options.adapterOptions);
    this.store = new CandidateStore(options.storeOptions);
  }

  /**
   * Run import step on a list of lemmas
   */
  async importLemmas(lemmas, posHint = null) {
    let importedCount = 0;
    let errorsCount = 0;
    const results = [];

    for (const lemma of lemmas) {
      const res = await this.adapter.searchLemma(lemma);
      if (res.success) {
        const processed = LexiconNormalizer.processCandidateDTO(res.data, posHint);
        const { addedEntries, addedRelations } = this.store.ingest(processed);
        importedCount++;
        results.push({ lemma, success: true, addedEntries, addedRelations, fromCache: res.fromCache });
      } else {
        errorsCount++;
        results.push({ lemma, success: false, error: res.error });
      }
    }

    return {
      total: lemmas.length,
      importedCount,
      errorsCount,
      results
    };
  }

  /**
   * Seed curated demo contexts and approved relations (Sections 9, 10, 13, 14)
   * This prepares high-quality approved datasets for both Adjektive and Verben.
   */
  seedApprovedDemo() {
    // 1. Approved Adjective Contexts
    this.store.setContext({
      contextId: 'ctx_adjective_difficult',
      meaning: 'difficult',
      topic: 'Bài tập khó khăn, phức tạp',
      explanationVi: 'Nói về độ khó của bài tập hoặc nhiệm vụ; không phải vật nặng.',
      variants: {
        adj_schwer_difficult: {
          de: 'Die Aufgabe ist heute sehr schwer.',
          highlightTokens: ['schwer'],
          vi: 'Bài tập hôm nay rất khó.'
        },
        adj_schwierig_difficult: {
          de: 'Die Aufgabe ist heute sehr schwierig.',
          highlightTokens: ['schwierig'],
          vi: 'Bài tập hôm nay rất khó khăn, phức tạp.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_easy',
      meaning: 'easy',
      topic: 'Bài tập dễ dàng, đơn giản',
      explanationVi: 'Nói về bài tập dễ dàng; không phải vật nhẹ.',
      variants: {
        adj_leicht_easy: {
          de: 'Die Aufgabe ist heute sehr leicht.',
          highlightTokens: ['leicht'],
          vi: 'Bài tập hôm nay rất dễ.'
        },
        adj_einfach_easy: {
          de: 'Die Aufgabe ist heute sehr einfach.',
          highlightTokens: ['einfach'],
          vi: 'Bài tập hôm nay rất đơn giản.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_expensive',
      meaning: 'expensive',
      topic: 'Khách sạn giá đắt đỏ',
      explanationVi: 'Mức giá phòng đắt, tốn nhiều tiền bạc.',
      variants: {
        adj_teuer_expensive: {
          de: 'Das Hotel ist heute sehr teuer.',
          highlightTokens: ['teuer'],
          vi: 'Khách sạn hôm nay giá rất đắt.'
        },
        adj_kostspielig_expensive: {
          de: 'Das Hotel ist heute sehr kostspielig.',
          highlightTokens: ['kostspielig'],
          vi: 'Khách sạn hôm nay rất tốn kém.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_cheap',
      meaning: 'cheap',
      topic: 'Khách sạn giá rẻ, phải chăng',
      explanationVi: 'Mức giá phòng phải chăng, vừa túi tiền.',
      variants: {
        adj_billig_cheap: {
          de: 'Das Hotel ist heute sehr billig.',
          highlightTokens: ['billig'],
          vi: 'Khách sạn hôm nay giá rất rẻ.'
        },
        adj_günstig_cheap: {
          de: 'Das Hotel ist heute sehr günstig.',
          highlightTokens: ['günstig'],
          vi: 'Khách sạn hôm nay giá rất phải chăng.'
        },
        adj_preiswert_cheap: {
          de: 'Das Hotel ist heute sehr preiswert.',
          highlightTokens: ['preiswert'],
          vi: 'Khách sạn hôm nay giá rất tốt, hợp lý.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_quiet',
      meaning: 'quiet',
      topic: 'Âm thanh yên tĩnh, khẽ',
      explanationVi: 'Không gian tĩnh lặng, không có tiếng ồn.',
      variants: {
        adj_leise_quiet: {
          de: 'Die Kinder sind heute sehr leise.',
          highlightTokens: ['leise'],
          vi: 'Bọn trẻ hôm nay nói rất khẽ.'
        },
        adj_ruhig_quiet: {
          de: 'Die Kinder sind heute sehr ruhig.',
          highlightTokens: ['ruhig'],
          vi: 'Bọn trẻ hôm nay rất yên lặng, điềm tĩnh.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_loud',
      meaning: 'loud',
      topic: 'Âm thanh ồn ào, huyên náo',
      explanationVi: 'Âm lượng lớn, gây náo động.',
      variants: {
        adj_laut_loud: {
          de: 'Die Kinder sind heute sehr laut.',
          highlightTokens: ['laut'],
          vi: 'Bọn trẻ hôm nay rất ồn ào.'
        },
        adj_lärmend_loud: {
          de: 'Die Kinder sind heute sehr lärmend.',
          highlightTokens: ['lärmend'],
          vi: 'Bọn trẻ hôm nay làm ầm ĩ náo động.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_fast',
      meaning: 'fast',
      topic: 'Tốc độ nhanh',
      explanationVi: 'Chuyển động hoặc xử lý tốc độ cao.',
      variants: {
        adj_schnell_fast: {
          de: 'Der Zug fährt heute sehr schnell.',
          highlightTokens: ['schnell'],
          vi: 'Chuyến tàu hôm nay chạy rất nhanh.'
        },
        adj_rasch_fast: {
          de: 'Der Zug fährt heute sehr rasch.',
          highlightTokens: ['rasch'],
          vi: 'Chuyến tàu hôm nay di chuyển rất mau lẹ.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_slow',
      meaning: 'slow',
      topic: 'Tốc độ chậm',
      explanationVi: 'Chuyển động từ tốn, chậm rãi.',
      variants: {
        adj_langsam_slow: {
          de: 'Der Zug fährt heute sehr langsam.',
          highlightTokens: ['langsam'],
          vi: 'Chuyến tàu hôm nay chạy rất chậm.'
        },
        adj_gemächlich_slow: {
          de: 'Der Zug fährt heute sehr gemächlich.',
          highlightTokens: ['gemächlich'],
          vi: 'Chuyến tàu hôm nay chạy rất thong thả, từ tốn.'
        }
      },
      reviewStatus: 'approved'
    });

    // Size Cluster: large (groß, riesig) <-> small (klein, winzig)
    this.store.setContext({
      contextId: 'ctx_adjective_large',
      meaning: 'large',
      topic: 'Kích thước to lớn',
      explanationVi: 'Quy mô, kích thước đồ vật hoặc không gian to lớn, khổng lồ.',
      variants: {
        adj_groß_large: {
          de: 'Das neue Haus ist heute sehr groß.',
          highlightTokens: ['groß'],
          vi: 'Ngôi nhà mới hôm nay rất to lớn.'
        },
        adj_riesig_large: {
          de: 'Das neue Gebäude ist heute sehr riesig.',
          highlightTokens: ['riesig'],
          vi: 'Tòa nhà mới hôm nay thực sự khổng lồ.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_small',
      meaning: 'small',
      topic: 'Kích thước nhỏ bé',
      explanationVi: 'Kích thước nhỏ bé, tí hon.',
      variants: {
        adj_klein_small: {
          de: 'Das kleine Zimmer ist heute sehr klein.',
          highlightTokens: ['klein'],
          vi: 'Căn phòng nhỏ hôm nay rất bé.'
        },
        adj_winzig_small: {
          de: 'Das kleine Zimmer ist heute sehr winzig.',
          highlightTokens: ['winzig'],
          vi: 'Căn phòng nhỏ hôm nay thực sự tí hon.'
        }
      },
      reviewStatus: 'approved'
    });

    // Strength Cluster: strong (stark, kräftig) <-> weak (schwach, kraftlos)
    this.store.setContext({
      contextId: 'ctx_adjective_strong',
      meaning: 'strong',
      topic: 'Sức mạnh cơ bắp, thể lực',
      explanationVi: 'Thể lực cường tráng, mạnh mẽ.',
      variants: {
        adj_stark_strong: {
          de: 'Der Sportler ist heute sehr stark.',
          highlightTokens: ['stark'],
          vi: 'Vận động viên hôm nay rất mạnh mẽ.'
        },
        adj_kräftig_strong: {
          de: 'Der Sportler ist heute sehr kräftig.',
          highlightTokens: ['kräftig'],
          vi: 'Vận động viên hôm nay rất khỏe khoắn, cường tráng.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_weak',
      meaning: 'weak',
      topic: 'Sức khỏe yếu ớt',
      explanationVi: 'Thể lực yếu, không còn sức lực.',
      variants: {
        adj_schwach_weak: {
          de: 'Der Kranke ist heute sehr schwach.',
          highlightTokens: ['schwach'],
          vi: 'Người bệnh hôm nay rất yếu ớt.'
        },
        adj_kraftlos_weak: {
          de: 'Der Kranke ist heute sehr kraftlos.',
          highlightTokens: ['kraftlos'],
          vi: 'Người bệnh hôm nay kiệt sức, không còn lực.'
        }
      },
      reviewStatus: 'approved'
    });

    // Courage Cluster: brave (mutig, tapfer) <-> fearful (ängstlich, furchtsam)
    this.store.setContext({
      contextId: 'ctx_adjective_brave',
      meaning: 'brave',
      topic: 'Lòng dũng cảm, can trường',
      explanationVi: 'Tính cách dũng cảm, không run sợ trước nguy hiểm.',
      variants: {
        adj_mutig_brave: {
          de: 'Die Feuerwehr ist heute sehr mutig.',
          highlightTokens: ['mutig'],
          vi: 'Lực lượng cứu hỏa hôm nay rất dũng cảm.'
        },
        adj_tapfer_brave: {
          de: 'Die Feuerwehr ist heute sehr tapfer.',
          highlightTokens: ['tapfer'],
          vi: 'Lực lượng cứu hỏa hôm nay rất can trường, gan dạ.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_fearful',
      meaning: 'fearful',
      topic: 'Tính nhút nhát, sợ sệt',
      explanationVi: 'Cảm giác sợ hãi, e ngại.',
      variants: {
        adj_ängstlich_fearful: {
          de: 'Der kleine Junge ist heute sehr ängstlich.',
          highlightTokens: ['ängstlich'],
          vi: 'Cậu bé hôm nay rất sợ sệt, nhút nhát.'
        },
        adj_furchtsam_fearful: {
          de: 'Der kleine Junge ist heute rất furchtsam.',
          highlightTokens: ['furchtsam'],
          vi: 'Cậu bé hôm nay rất nhát gan, e dè.'
        }
      },
      reviewStatus: 'approved'
    });

    // Smartness Cluster: smart (klug, schlau) <-> foolish (dumm, töricht)
    this.store.setContext({
      contextId: 'ctx_adjective_smart',
      meaning: 'smart',
      topic: 'Trí thông minh, khôn khéo',
      explanationVi: 'Tư duy sắc sảo, nhanh nhẹn, khôn khéo.',
      variants: {
        adj_klug_smart: {
          de: 'Die Studentin ist heute sehr klug.',
          highlightTokens: ['klug'],
          vi: 'Nữ sinh viên hôm nay rất thông minh.'
        },
        adj_schlau_smart: {
          de: 'Die Studentin ist heute sehr schlau.',
          highlightTokens: ['schlau'],
          vi: 'Nữ sinh viên hôm nay rất khôn ngoan, lanh lợi.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_foolish',
      meaning: 'foolish',
      topic: 'Sự dại dột, ngốc nghếch',
      explanationVi: 'Hành động hoặc suy nghĩ khờ khạo, không thấu đáo.',
      variants: {
        adj_dumm_foolish: {
          de: 'Dieser Fehler ist heute sehr dumm.',
          highlightTokens: ['dumm'],
          vi: 'Sai sót này hôm nay thật ngốc nghếch.'
        },
        adj_töricht_foolish: {
          de: 'Dieser Plan ist heute sehr töricht.',
          highlightTokens: ['töricht'],
          vi: 'Kế hoạch này hôm nay thật dại dột, khờ khạo.'
        }
      },
      reviewStatus: 'approved'
    });

    // Age & State Cluster: old (alt, antik) <-> new (neu, frisch)
    this.store.setContext({
      contextId: 'ctx_adjective_old_object',
      meaning: 'old_object',
      topic: 'Đồ vật cũ kỹ, cổ kính',
      explanationVi: 'Đồ vật đã qua thời gian dài, mang nét xưa cũ hoặc cổ điển.',
      variants: {
        adj_alt_old_object: {
          de: 'Das alte Möbel ist heute sehr alt.',
          highlightTokens: ['alt'],
          vi: 'Món đồ nội thất cũ hôm nay đã rất già nua, cũ kỹ.'
        },
        adj_antik_old_object: {
          de: 'Das alte Möbel ist heute sehr antik.',
          highlightTokens: ['antik'],
          vi: 'Món đồ nội thất hôm nay mang nét rất cổ kính, đồ cổ.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_adjective_new_object',
      meaning: 'new_object',
      topic: 'Đồ vật mới tinh, tươi mới',
      explanationVi: 'Vật dụng hoặc thực phẩm vừa mới sản xuất, còn mới tinh, tươi nguyên.',
      variants: {
        adj_neu_new_object: {
          de: 'Das neue Fahrrad ist heute sehr neu.',
          highlightTokens: ['neu'],
          vi: 'Chiếc xe đạp mới hôm nay còn rất mới tinh.'
        },
        adj_frisch_new_object: {
          de: 'Das Brot beim Bäcker ist heute sehr frisch.',
          highlightTokens: ['frisch'],
          vi: 'Bánh mì ở tiệm hôm nay rất tươi mới.'
        }
      },
      reviewStatus: 'approved'
    });

    // 2. Approved Adjective Antonyms (GEGENTEIL, Section 13, 14)
    this.store.setAntonym('ctx_adjective_difficult:adj_schwer_difficult', {
      targetEntryId: 'adj_leicht_easy',
      targetContextId: 'ctx_adjective_easy',
      explanationShortVi: 'schwer → leicht: khó → dễ'
    });
    this.store.setAntonym('ctx_adjective_difficult:adj_schwierig_difficult', {
      targetEntryId: 'adj_einfach_easy',
      targetContextId: 'ctx_adjective_easy',
      explanationShortVi: 'schwierig → einfach: khó khăn → đơn giản'
    });
    this.store.setAntonym('ctx_adjective_easy:adj_leicht_easy', {
      targetEntryId: 'adj_schwer_difficult',
      targetContextId: 'ctx_adjective_difficult',
      explanationShortVi: 'leicht → schwer: dễ → khó'
    });
    this.store.setAntonym('ctx_adjective_easy:adj_einfach_easy', {
      targetEntryId: 'adj_schwierig_difficult',
      targetContextId: 'ctx_adjective_difficult',
      explanationShortVi: 'einfach → schwierig: đơn giản → khó khăn'
    });
    this.store.setAntonym('ctx_adjective_expensive:adj_teuer_expensive', {
      targetEntryId: 'adj_billig_cheap',
      targetContextId: 'ctx_adjective_cheap',
      explanationShortVi: 'teuer → billig: đắt → rẻ'
    });
    this.store.setAntonym('ctx_adjective_expensive:adj_kostspielig_expensive', {
      targetEntryId: 'adj_günstig_cheap',
      targetContextId: 'ctx_adjective_cheap',
      explanationShortVi: 'kostspielig → günstig: tốn kém → phải chăng'
    });
    this.store.setAntonym('ctx_adjective_cheap:adj_billig_cheap', {
      targetEntryId: 'adj_teuer_expensive',
      targetContextId: 'ctx_adjective_expensive',
      explanationShortVi: 'billig → teuer: rẻ → đắt'
    });
    this.store.setAntonym('ctx_adjective_cheap:adj_günstig_cheap', {
      targetEntryId: 'adj_kostspielig_expensive',
      targetContextId: 'ctx_adjective_expensive',
      explanationShortVi: 'günstig → kostspielig: phải chăng → tốn kém'
    });
    this.store.setAntonym('ctx_adjective_quiet:adj_leise_quiet', {
      targetEntryId: 'adj_laut_loud',
      targetContextId: 'ctx_adjective_loud',
      explanationShortVi: 'leise → laut: yên lặng → ồn ào'
    });
    this.store.setAntonym('ctx_adjective_quiet:adj_ruhig_quiet', {
      targetEntryId: 'adj_lärmend_loud',
      targetContextId: 'ctx_adjective_loud',
      explanationShortVi: 'ruhig → lärmend: trầm tĩnh → ầm ĩ'
    });
    this.store.setAntonym('ctx_adjective_loud:adj_laut_loud', {
      targetEntryId: 'adj_leise_quiet',
      targetContextId: 'ctx_adjective_quiet',
      explanationShortVi: 'laut → leise: ồn ào → yên lặng'
    });
    this.store.setAntonym('ctx_adjective_loud:adj_lärmend_loud', {
      targetEntryId: 'adj_ruhig_quiet',
      targetContextId: 'ctx_adjective_quiet',
      explanationShortVi: 'lärmend → ruhig: ầm ĩ → trầm tĩnh'
    });
    this.store.setAntonym('ctx_adjective_fast:adj_schnell_fast', {
      targetEntryId: 'adj_langsam_slow',
      targetContextId: 'ctx_adjective_slow',
      explanationShortVi: 'schnell → langsam: nhanh → chậm'
    });
    this.store.setAntonym('ctx_adjective_slow:adj_langsam_slow', {
      targetEntryId: 'adj_schnell_fast',
      targetContextId: 'ctx_adjective_fast',
      explanationShortVi: 'langsam → schnell: chậm → nhanh'
    });

    // Size Antonyms
    this.store.setAntonym('ctx_adjective_large:adj_groß_large', {
      targetEntryId: 'adj_klein_small',
      targetContextId: 'ctx_adjective_small',
      explanationShortVi: 'groß → klein: to lớn → nhỏ bé'
    });
    this.store.setAntonym('ctx_adjective_large:adj_riesig_large', {
      targetEntryId: 'adj_winzig_small',
      targetContextId: 'ctx_adjective_small',
      explanationShortVi: 'riesig → winzig: khổng lồ → tí hon'
    });
    this.store.setAntonym('ctx_adjective_small:adj_klein_small', {
      targetEntryId: 'adj_groß_large',
      targetContextId: 'ctx_adjective_large',
      explanationShortVi: 'klein → groß: nhỏ bé → to lớn'
    });
    this.store.setAntonym('ctx_adjective_small:adj_winzig_small', {
      targetEntryId: 'adj_riesig_large',
      targetContextId: 'ctx_adjective_large',
      explanationShortVi: 'winzig → riesig: tí hon → khổng lồ'
    });

    // Strength Antonyms
    this.store.setAntonym('ctx_adjective_strong:adj_stark_strong', {
      targetEntryId: 'adj_schwach_weak',
      targetContextId: 'ctx_adjective_weak',
      explanationShortVi: 'stark → schwach: mạnh mẽ → yếu ớt'
    });
    this.store.setAntonym('ctx_adjective_strong:adj_kräftig_strong', {
      targetEntryId: 'adj_kraftlos_weak',
      targetContextId: 'ctx_adjective_weak',
      explanationShortVi: 'kräftig → kraftlos: cường tráng → kiệt sức'
    });
    this.store.setAntonym('ctx_adjective_weak:adj_schwach_weak', {
      targetEntryId: 'adj_stark_strong',
      targetContextId: 'ctx_adjective_strong',
      explanationShortVi: 'schwach → stark: yếu ớt → mạnh mẽ'
    });
    this.store.setAntonym('ctx_adjective_weak:adj_kraftlos_weak', {
      targetEntryId: 'adj_kräftig_strong',
      targetContextId: 'ctx_adjective_strong',
      explanationShortVi: 'kraftlos → kräftig: kiệt sức → cường tráng'
    });

    // Courage Antonyms
    this.store.setAntonym('ctx_adjective_brave:adj_mutig_brave', {
      targetEntryId: 'adj_ängstlich_fearful',
      targetContextId: 'ctx_adjective_fearful',
      explanationShortVi: 'mutig → ängstlich: dũng cảm → sợ sệt'
    });
    this.store.setAntonym('ctx_adjective_brave:adj_tapfer_brave', {
      targetEntryId: 'adj_furchtsam_fearful',
      targetContextId: 'ctx_adjective_fearful',
      explanationShortVi: 'tapfer → furchtsam: can trường → nhát gan'
    });
    this.store.setAntonym('ctx_adjective_fearful:adj_ängstlich_fearful', {
      targetEntryId: 'adj_mutig_brave',
      targetContextId: 'ctx_adjective_brave',
      explanationShortVi: 'ängstlich → mutig: sợ sệt → dũng cảm'
    });
    this.store.setAntonym('ctx_adjective_fearful:adj_furchtsam_fearful', {
      targetEntryId: 'adj_tapfer_brave',
      targetContextId: 'ctx_adjective_brave',
      explanationShortVi: 'furchtsam → tapfer: nhát gan → can trường'
    });

    // Smartness Antonyms
    this.store.setAntonym('ctx_adjective_smart:adj_klug_smart', {
      targetEntryId: 'adj_dumm_foolish',
      targetContextId: 'ctx_adjective_foolish',
      explanationShortVi: 'klug → dumm: thông minh → ngốc nghếch'
    });
    this.store.setAntonym('ctx_adjective_smart:adj_schlau_smart', {
      targetEntryId: 'adj_töricht_foolish',
      targetContextId: 'ctx_adjective_foolish',
      explanationShortVi: 'schlau → töricht: khôn ngoan → khờ khạo'
    });
    this.store.setAntonym('ctx_adjective_foolish:adj_dumm_foolish', {
      targetEntryId: 'adj_klug_smart',
      targetContextId: 'ctx_adjective_smart',
      explanationShortVi: 'dumm → klug: ngốc nghếch → thông minh'
    });
    this.store.setAntonym('ctx_adjective_foolish:adj_töricht_foolish', {
      targetEntryId: 'adj_schlau_smart',
      targetContextId: 'ctx_adjective_smart',
      explanationShortVi: 'töricht → schlau: khờ khạo → khôn ngoan'
    });

    // Age Antonyms
    this.store.setAntonym('ctx_adjective_old_object:adj_alt_old_object', {
      targetEntryId: 'adj_neu_new_object',
      targetContextId: 'ctx_adjective_new_object',
      explanationShortVi: 'alt → neu: cũ → mới'
    });
    this.store.setAntonym('ctx_adjective_old_object:adj_antik_old_object', {
      targetEntryId: 'adj_frisch_new_object',
      targetContextId: 'ctx_adjective_new_object',
      explanationShortVi: 'antik → frisch: cổ kính → tươi mới'
    });
    this.store.setAntonym('ctx_adjective_new_object:adj_neu_new_object', {
      targetEntryId: 'adj_alt_old_object',
      targetContextId: 'ctx_adjective_old_object',
      explanationShortVi: 'neu → alt: mới → cũ'
    });
    this.store.setAntonym('ctx_adjective_new_object:adj_frisch_new_object', {
      targetEntryId: 'adj_antik_old_object',
      targetContextId: 'ctx_adjective_old_object',
      explanationShortVi: 'frisch → antik: tươi mới → cổ kính'
    });

    // 3. Approved Verb Contexts (Section 10, 11)
    this.store.setContext({
      contextId: 'ctx_verb_start',
      meaning: 'start',
      topic: 'Giờ học bắt đầu',
      explanationVi: 'Diễn tả hành động bắt đầu; anfangen là động từ tách (fängt ... an).',
      variants: {
        verb_beginnen_start: {
          de: 'Der Deutschkurs beginnt um acht Uhr.',
          highlightTokens: ['beginnt'],
          vi: 'Khóa học tiếng Đức bắt đầu lúc tám giờ.'
        },
        verb_anfangen_start: {
          de: 'Der Deutschkurs fängt um acht Uhr an.',
          highlightTokens: ['fängt', 'an'],
          vi: 'Khóa học tiếng Đức bắt đầu lúc tám giờ.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_stop',
      meaning: 'stop',
      topic: 'Giờ học kết thúc, dừng lại',
      explanationVi: 'Diễn tả hành động kết thúc; aufhören là động từ tách (hört ... auf).',
      variants: {
        verb_enden_stop: {
          de: 'Der Deutschkurs endet um zehn Uhr.',
          highlightTokens: ['endet'],
          vi: 'Khóa học tiếng Đức kết thúc lúc mười giờ.'
        },
        verb_aufhören_stop: {
          de: 'Der Deutschkurs hört um zehn Uhr auf.',
          highlightTokens: ['hört', 'auf'],
          vi: 'Khóa học tiếng Đức dừng lại lúc mười giờ.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_open',
      meaning: 'open',
      topic: 'Mở cửa sổ',
      explanationVi: 'Hành động mở cửa sổ; aufmachen là động từ tách (mache ... auf).',
      variants: {
        verb_öffnen_open: {
          de: 'Ich öffne das Fenster am Morgen.',
          highlightTokens: ['öffne'],
          vi: 'Tôi mở cửa sổ vào buổi sáng.'
        },
        verb_aufmachen_open: {
          de: 'Ich mache das Fenster am Morgen auf.',
          highlightTokens: ['mache', 'auf'],
          vi: 'Tôi mở cửa sổ vào buổi sáng.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_close',
      meaning: 'close',
      topic: 'Đóng cửa sổ',
      explanationVi: 'Hành động đóng cửa sổ; zumachen là động từ tách (mache ... zu).',
      variants: {
        verb_schließen_close: {
          de: 'Ich schließe das Fenster am Abend.',
          highlightTokens: ['schließe'],
          vi: 'Tôi đóng cửa sổ vào buổi tối.'
        },
        verb_zumachen_close: {
          de: 'Ich mache das Fenster am Abend zu.',
          highlightTokens: ['mache', 'zu'],
          vi: 'Tôi đóng cửa sổ vào buổi tối.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_hurry',
      meaning: 'hurry',
      topic: 'Khẩn trương, vội vã',
      explanationVi: 'sich beeilen là động từ phản thân (beeilt sich).',
      variants: {
        verb_sich_beeilen_hurry: {
          de: 'Er beeilt sich sehr vor der Prüfung.',
          highlightTokens: ['beeilt', 'sich'],
          vi: 'Anh ấy rất vội vã trước giờ thi.'
        },
        verb_eilen_hurry: {
          de: 'Er eilt sehr vor der Prüfung.',
          highlightTokens: ['eilt'],
          vi: 'Anh ấy rất hối hả trước giờ thi.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_dawdle',
      meaning: 'dawdle',
      topic: 'Lề mề, dềnh dàng',
      explanationVi: 'Hành động lề mề, không vội.',
      variants: {
        verb_trödeln_dawdle: {
          de: 'Er trödelt oft auf dem Heimweg.',
          highlightTokens: ['trödelt'],
          vi: 'Anh ấy thường lề mề trên đường về nhà.'
        },
        verb_bummeln_dawdle: {
          de: 'Er bummelt oft auf dem Heimweg.',
          highlightTokens: ['bummelt'],
          vi: 'Anh ấy thường la cà dềnh dàng trên đường về nhà.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_help',
      meaning: 'help',
      topic: 'Giúp đỡ bạn bè',
      explanationVi: 'Hành động hỗ trợ, tương trợ người khác.',
      variants: {
        verb_helfen_help: {
          de: 'Wir helfen den neuen Schülern.',
          highlightTokens: ['helfen'],
          vi: 'Chúng tôi giúp đỡ các học sinh mới.'
        },
        verb_unterstützen_help: {
          de: 'Wir unterstützen den neuen Schülern.',
          highlightTokens: ['unterstützen'],
          vi: 'Chúng tôi hỗ trợ các bạn học sinh mới.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_disturb',
      meaning: 'disturb',
      topic: 'Làm phiền giờ học',
      explanationVi: 'Hành vi gây quấy rầy, cản trở.',
      variants: {
        verb_stören_disturb: {
          de: 'Niemand stört den Unterricht heute.',
          highlightTokens: ['stört'],
          vi: 'Hôm nay không ai làm phiền giờ học.'
        },
        verb_behindern_disturb: {
          de: 'Niemand behindert den Unterricht heute.',
          highlightTokens: ['behindert'],
          vi: 'Hôm nay không ai cản trở giờ học.'
        }
      },
      reviewStatus: 'approved'
    });

    // Verb Find/Lose
    this.store.setContext({
      contextId: 'ctx_verb_find',
      meaning: 'find',
      topic: 'Tìm thấy, khám phá đồ vật',
      explanationVi: 'Hành động tìm thấy hoặc phát hiện ra đồ vật bị giấu/mất.',
      variants: {
        verb_finden_find: {
          de: 'Ich finde den Schlüssel im Zimmer.',
          highlightTokens: ['finde'],
          vi: 'Tôi tìm thấy chìa khóa trong phòng.'
        },
        verb_entdecken_find: {
          de: 'Ich entdecke den Schlüssel im Zimmer.',
          highlightTokens: ['entdecke'],
          vi: 'Tôi phát hiện ra chìa khóa trong phòng.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_lose',
      meaning: 'lose',
      topic: 'Làm mất, làm thất lạc',
      explanationVi: 'Hành động để quên hoặc làm rơi mất đồ đạc.',
      variants: {
        verb_verlieren_lose: {
          de: 'Ich verliere oft den Schlüssel im Haus.',
          highlightTokens: ['verliere'],
          vi: 'Tôi thường làm mất chìa khóa trong nhà.'
        },
        verb_verlegen_lose: {
          de: 'Ich verlege oft den Schlüssel im Haus.',
          highlightTokens: ['verlege'],
          vi: 'Tôi thường để quên, thất lạc chìa khóa trong nhà.'
        }
      },
      reviewStatus: 'approved'
    });

    // Verb Buy/Sell
    this.store.setContext({
      contextId: 'ctx_verb_buy',
      meaning: 'buy',
      topic: 'Mua sắm, sở hữu hàng hóa',
      explanationVi: 'Hành động mua hoặc tậu được đồ dùng.',
      variants: {
        verb_kaufen_buy: {
          de: 'Wir kaufen heute ein schönes Ticket.',
          highlightTokens: ['kaufen'],
          vi: 'Chúng tôi hôm nay mua một tấm vé đẹp.'
        },
        verb_erwerben_buy: {
          de: 'Wir erwerben heute ein wertvolles Buch.',
          highlightTokens: ['erwerben'],
          vi: 'Chúng tôi hôm nay sở hữu/tậu một cuốn sách quý.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_sell',
      meaning: 'sell',
      topic: 'Bán hàng, nhượng lại',
      explanationVi: 'Hành động bán đồ đạc hoặc chuyển nhượng tài sản.',
      variants: {
        verb_verkaufen_sell: {
          de: 'Wir verkaufen heute das alte Fahrrad.',
          highlightTokens: ['verkaufen'],
          vi: 'Chúng tôi hôm nay bán chiếc xe đạp cũ.'
        },
        verb_veräußern_sell: {
          de: 'Wir veräußern heute das alte Fahrrad.',
          highlightTokens: ['veräußern'],
          vi: 'Chúng tôi hôm nay bán thanh lý, nhượng lại chiếc xe cũ.'
        }
      },
      reviewStatus: 'approved'
    });

    // Verb Travel (Arrive/Depart)
    this.store.setContext({
      contextId: 'ctx_verb_arrive',
      meaning: 'arrive',
      topic: 'Đến nơi, cập bến',
      explanationVi: 'ankommen (kommt ... an) và eintreffen (trifft ... ein) là động từ tách.',
      variants: {
        verb_ankommen_arrive: {
          de: 'Der Zug kommt pünktlich in Berlin an.',
          highlightTokens: ['kommt', 'an'],
          vi: 'Chuyến tàu đến Berlin đúng giờ.'
        },
        verb_eintreffen_arrive: {
          de: 'Der Zug trifft pünktlich in Berlin ein.',
          highlightTokens: ['trifft', 'ein'],
          vi: 'Chuyến tàu cập bến Berlin đúng giờ.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_depart',
      meaning: 'depart',
      topic: 'Khởi hành, lên đường rời đi',
      explanationVi: 'abfahren (fährt ... ab) và abreisen (reist ... ab) là động từ tách.',
      variants: {
        verb_abfahren_depart: {
          de: 'Der Zug fährt um neun Uhr ab.',
          highlightTokens: ['fährt', 'ab'],
          vi: 'Chuyến tàu khởi hành lúc 9 giờ.'
        },
        verb_abreisen_depart: {
          de: 'Die Gäste reisen um neun Uhr ab.',
          highlightTokens: ['reisen', 'ab'],
          vi: 'Các vị khách lên đường rời đi lúc 9 giờ.'
        }
      },
      reviewStatus: 'approved'
    });

    // Verb Cognition (Understand/Misunderstand)
    this.store.setContext({
      contextId: 'ctx_verb_understand',
      meaning: 'understand',
      topic: 'Hiểu, lĩnh hội bài học',
      explanationVi: 'Nắm bắt ý nghĩa, thấu triệt kiến thức.',
      variants: {
        verb_verstehen_understand: {
          de: 'Ich verstehe die Grammatik jetzt ganz genau.',
          highlightTokens: ['verstehe'],
          vi: 'Tôi hiểu ngữ pháp bây giờ rất rõ ràng.'
        },
        verb_begreifen_understand: {
          de: 'Ich begreife die Grammatik jetzt ganz genau.',
          highlightTokens: ['begreife'],
          vi: 'Tôi lĩnh hội sâu sắc ngữ pháp bây giờ.'
        }
      },
      reviewStatus: 'approved'
    });

    this.store.setContext({
      contextId: 'ctx_verb_misunderstand',
      meaning: 'misunderstand',
      topic: 'Hiểu lầm, hiểu sai ý',
      explanationVi: 'Không hiểu đúng hoặc diễn giải sai ý người khác.',
      variants: {
        verb_missverstehen_misunderstand: {
          de: 'Niemand missversteht die Erklärung heute.',
          highlightTokens: ['missversteht'],
          vi: 'Không ai hiểu lầm lời giải thích hôm nay.'
        },
        verb_fehldeuten_misunderstand: {
          de: 'Niemand fehldeutet die Erklärung heute.',
          highlightTokens: ['fehldeutet'],
          vi: 'Không ai hiểu sai lời giải thích hôm nay.'
        }
      },
      reviewStatus: 'approved'
    });

    // 4. Approved Verb Antonyms (GEGENTEIL, Section 13, 14)
    this.store.setAntonym('ctx_verb_start:verb_beginnen_start', {
      targetEntryId: 'verb_enden_stop',
      targetContextId: 'ctx_verb_stop',
      explanationShortVi: 'beginnen → enden: bắt đầu → kết thúc'
    });
    this.store.setAntonym('ctx_verb_start:verb_anfangen_start', {
      targetEntryId: 'verb_aufhören_stop',
      targetContextId: 'ctx_verb_stop',
      explanationShortVi: 'anfangen → aufhören: bắt đầu → ngừng lại'
    });
    this.store.setAntonym('ctx_verb_stop:verb_enden_stop', {
      targetEntryId: 'verb_beginnen_start',
      targetContextId: 'ctx_verb_start',
      explanationShortVi: 'enden → beginnen: kết thúc → bắt đầu'
    });
    this.store.setAntonym('ctx_verb_stop:verb_aufhören_stop', {
      targetEntryId: 'verb_anfangen_start',
      targetContextId: 'ctx_verb_start',
      explanationShortVi: 'aufhören → anfangen: ngừng lại → bắt đầu'
    });
    this.store.setAntonym('ctx_verb_open:verb_öffnen_open', {
      targetEntryId: 'verb_schließen_close',
      targetContextId: 'ctx_verb_close',
      explanationShortVi: 'öffnen → schließen: mở → đóng'
    });
    this.store.setAntonym('ctx_verb_open:verb_aufmachen_open', {
      targetEntryId: 'verb_zumachen_close',
      targetContextId: 'ctx_verb_close',
      explanationShortVi: 'aufmachen → zumachen: mở ra → đóng lại'
    });
    this.store.setAntonym('ctx_verb_close:verb_schließen_close', {
      targetEntryId: 'verb_öffnen_open',
      targetContextId: 'ctx_verb_open',
      explanationShortVi: 'schließen → öffnen: đóng → mở'
    });
    this.store.setAntonym('ctx_verb_close:verb_zumachen_close', {
      targetEntryId: 'verb_aufmachen_open',
      targetContextId: 'ctx_verb_open',
      explanationShortVi: 'zumachen → aufmachen: đóng lại → mở ra'
    });
    this.store.setAntonym('ctx_verb_hurry:verb_sich_beeilen_hurry', {
      targetEntryId: 'verb_trödeln_dawdle',
      targetContextId: 'ctx_verb_dawdle',
      explanationShortVi: 'sich beeilen → trödeln: vội vã → lề mề'
    });
    this.store.setAntonym('ctx_verb_dawdle:verb_trödeln_dawdle', {
      targetEntryId: 'verb_sich_beeilen_hurry',
      targetContextId: 'ctx_verb_hurry',
      explanationShortVi: 'trödeln → sich beeilen: lề mề → vội vã'
    });

    // Verb Find/Lose Antonyms
    this.store.setAntonym('ctx_verb_find:verb_finden_find', {
      targetEntryId: 'verb_verlieren_lose',
      targetContextId: 'ctx_verb_lose',
      explanationShortVi: 'finden → verlieren: tìm thấy → đánh mất'
    });
    this.store.setAntonym('ctx_verb_find:verb_entdecken_find', {
      targetEntryId: 'verb_verlegen_lose',
      targetContextId: 'ctx_verb_lose',
      explanationShortVi: 'entdecken → verlegen: khám phá → thất lạc'
    });
    this.store.setAntonym('ctx_verb_lose:verb_verlieren_lose', {
      targetEntryId: 'verb_finden_find',
      targetContextId: 'ctx_verb_find',
      explanationShortVi: 'verlieren → finden: đánh mất → tìm thấy'
    });
    this.store.setAntonym('ctx_verb_lose:verb_verlegen_lose', {
      targetEntryId: 'verb_entdecken_find',
      targetContextId: 'ctx_verb_find',
      explanationShortVi: 'verlegen → entdecken: thất lạc → khám phá'
    });

    // Verb Buy/Sell Antonyms
    this.store.setAntonym('ctx_verb_buy:verb_kaufen_buy', {
      targetEntryId: 'verb_verkaufen_sell',
      targetContextId: 'ctx_verb_sell',
      explanationShortVi: 'kaufen → verkaufen: mua → bán'
    });
    this.store.setAntonym('ctx_verb_buy:verb_erwerben_buy', {
      targetEntryId: 'verb_veräußern_sell',
      targetContextId: 'ctx_verb_sell',
      explanationShortVi: 'erwerben → veräußern: tậu được → nhượng lại'
    });
    this.store.setAntonym('ctx_verb_sell:verb_verkaufen_sell', {
      targetEntryId: 'verb_kaufen_buy',
      targetContextId: 'ctx_verb_buy',
      explanationShortVi: 'verkaufen → kaufen: bán → mua'
    });
    this.store.setAntonym('ctx_verb_sell:verb_veräußern_sell', {
      targetEntryId: 'verb_erwerben_buy',
      targetContextId: 'ctx_verb_buy',
      explanationShortVi: 'veräußern → erwerben: nhượng lại → tậu được'
    });

    // Verb Travel Antonyms
    this.store.setAntonym('ctx_verb_arrive:verb_ankommen_arrive', {
      targetEntryId: 'verb_abfahren_depart',
      targetContextId: 'ctx_verb_depart',
      explanationShortVi: 'ankommen → abfahren: đến nơi → khởi hành'
    });
    this.store.setAntonym('ctx_verb_arrive:verb_eintreffen_arrive', {
      targetEntryId: 'verb_abreisen_depart',
      targetContextId: 'ctx_verb_depart',
      explanationShortVi: 'eintreffen → abreisen: cập bến → lên đường rời đi'
    });
    this.store.setAntonym('ctx_verb_depart:verb_abfahren_depart', {
      targetEntryId: 'verb_ankommen_arrive',
      targetContextId: 'ctx_verb_arrive',
      explanationShortVi: 'abfahren → ankommen: khởi hành → đến nơi'
    });
    this.store.setAntonym('ctx_verb_depart:verb_abreisen_depart', {
      targetEntryId: 'verb_eintreffen_arrive',
      targetContextId: 'ctx_verb_arrive',
      explanationShortVi: 'abreisen → eintreffen: lên đường rời đi → cập bến'
    });

    // Verb Cognition Antonyms
    this.store.setAntonym('ctx_verb_understand:verb_verstehen_understand', {
      targetEntryId: 'verb_missverstehen_misunderstand',
      targetContextId: 'ctx_verb_misunderstand',
      explanationShortVi: 'verstehen → missverstehen: hiểu → hiểu lầm'
    });
    this.store.setAntonym('ctx_verb_understand:verb_begreifen_understand', {
      targetEntryId: 'verb_fehldeuten_misunderstand',
      targetContextId: 'ctx_verb_misunderstand',
      explanationShortVi: 'begreifen → fehldeuten: lĩnh hội → diễn giải sai'
    });
    this.store.setAntonym('ctx_verb_misunderstand:verb_missverstehen_misunderstand', {
      targetEntryId: 'verb_verstehen_understand',
      targetContextId: 'ctx_verb_understand',
      explanationShortVi: 'missverstehen → verstehen: hiểu lầm → hiểu'
    });
    this.store.setAntonym('ctx_verb_misunderstand:verb_fehldeuten_misunderstand', {
      targetEntryId: 'verb_begreifen_understand',
      targetContextId: 'ctx_verb_understand',
      explanationShortVi: 'fehldeuten → begreifen: diễn giải sai → lĩnh hội'
    });

    // 5. Approve matching candidate relations
    for (const rel of Object.values(this.store.candidateRelations)) {
      const cId = rel.contextScope?.[0];
      if (cId && this.store.approvedContexts[cId]) {
        this.store.setRelationStatus(rel.relationId, 'approved', 'Đã thẩm định ngữ nghĩa, độ tương đương và câu ví dụ ngữ cảnh A1-B1.', 'lead-linguist');
      }
    }

    // 6. Explicitly curate sample Rejected and Needs-Review relations for audit trail (Section 7, 24)
    if (this.store.candidateRelations['rel_adjective_adj_leicht_easy__adj_kinderleicht_easy']) {
      this.store.setRelationStatus(
        'rel_adjective_adj_leicht_easy__adj_kinderleicht_easy',
        'rejected',
        'Rejected: Sắc thái khẩu ngữ/thân mật (colloquial/informal). Không phù hợp cho bộ bài học thuật chuẩn A1-B1 của VokabelGo.',
        'dr-weber-curator'
      );
    }
    if (this.store.candidateRelations['rel_adjective_adj_schwer_difficult__adj_kompliziert_difficult']) {
      this.store.setRelationStatus(
        'rel_adjective_adj_schwer_difficult__adj_kompliziert_difficult',
        'needs_review',
        'Needs Review: "kompliziert" mang nghĩa phức tạp về hệ thống/kỹ thuật, cần đánh giá thêm tính thay thế trong câu đời sống.',
        'dr-weber-curator'
      );
    }
  }

  /**
   * Run entire pipeline from ingestion to export
   */
  async runFullPipeline() {
    console.log('--- STEP 1 & 2: Ingest Seed Lemmas via OpenThesaurusAdapter ---');
    const adjImport = await this.importLemmas(SEED_ADJECTIVE_LEMMAS, 'adjective');
    const verbImport = await this.importLemmas(SEED_VERB_LEMMAS, 'verb');

    console.log(`[PIPELINE] Adjectives imported: ${adjImport.importedCount}/${adjImport.total}`);
    console.log(`[PIPELINE] Verbs imported: ${verbImport.importedCount}/${verbImport.total}`);

    console.log('--- STEP 3: Curate Approved Senses, Contexts & Antonyms ---');
    this.seedApprovedDemo();

    console.log('--- STEP 4: Validate and Export Runtime Dataset ---');
    const exporter = new RuntimeExporter(this.store);
    const exportResult = exporter.exportRuntime();

    console.log('--- STEP 5: Summary Report ---');
    const summary = this.store.getDashboardSummary();
    console.log('[PIPELINE SUMMARY]:', JSON.stringify(summary, null, 2));

    return {
      adjImport,
      verbImport,
      exportResult,
      summary
    };
  }
}

const SEMANTIC_CLUSTERS = require('./semantic-clusters');

module.exports = {
  LexiconPipeline,
  SEED_ADJECTIVE_LEMMAS,
  SEED_VERB_LEMMAS,
  SEMANTIC_CLUSTERS
};

if (require.main === module) {
  const p = new LexiconPipeline();
  p.runFullPipeline()
    .then(res => {
      console.log('🎉 PIPELINE COMPLETED SUCCESSFULLY!');
    })
    .catch(err => {
      console.error('❌ PIPELINE FAILED:', err);
      process.exit(1);
    });
}
