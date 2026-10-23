/**
 * NORMALIZER.JS
 * Normalizes raw dictionary synsets into candidate entries and semantic relations.
 * Enforces Unicode safety (preserves ß, umlauts), POS tagging, verb prefix detection,
 * reflexive verb preservation, and distinct lexical senses.
 */

const KNOWN_SEPARABLE_PREFIXES = [
  'ab', 'an', 'auf', 'aus', 'bei', 'ein', 'fest', 'fort', 'her', 'hin',
  'los', 'mit', 'nach', 'vor', 'weg', 'weiter', 'zu', 'zurück', 'zusammen'
];

class LexiconNormalizer {
  /**
   * Clean and normalize German lemma text
   * Preserves German umlauts (ä, ö, ü) and eszett (ß) per Section 36.
   * Does NOT convert ß to ss.
   */
  static cleanLemma(raw) {
    if (!raw || typeof raw !== 'string') return '';
    return raw
      .normalize('NFC')
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Determine part of speech and verb metadata
   */
  static analyzeMorphology(lemma, posHint = null) {
    const clean = this.cleanLemma(lemma);
    const lower = clean.toLowerCase();

    // Check reflexive verb
    const isReflexive = lower.startsWith('sich ');
    const baseVerb = isReflexive ? clean.slice(5).trim() : clean;

    let pos = posHint;
    if (!pos) {
      if (isReflexive || baseVerb.endsWith('en') || baseVerb.endsWith('eln') || baseVerb.endsWith('ern')) {
        pos = 'verb';
      } else if (clean[0] === clean[0].toUpperCase() && !isReflexive) {
        pos = 'noun';
      } else {
        pos = 'adjective';
      }
    }

    const result = {
      lemma: clean,
      partOfSpeech: pos,
      verbMeta: null,
      nounMeta: null
    };

    if (pos === 'verb') {
      let separable = false;
      let prefix = null;

      const testTarget = baseVerb.toLowerCase();
      for (const pref of KNOWN_SEPARABLE_PREFIXES) {
        if (testTarget.startsWith(pref) && testTarget.length > pref.length + 3) {
          separable = true;
          prefix = pref;
          break;
        }
      }

      result.verbMeta = {
        separable,
        prefix,
        reflexive: isReflexive
      };
    } else if (pos === 'noun') {
      result.nounMeta = {
        gender: 'die',
        article: 'die',
        plural: ''
      };
    }

    return result;
  }

  /**
   * Determine sense identifier from categories, lemma, or provided hint
   * Prevents polysemy flattening (Section 48).
   */
  static deriveSenseId(lemma, categories = [], senseHint = null) {
    if (senseHint) return senseHint;

    const lower = lemma.toLowerCase();
    const catStr = categories.join(' ').toLowerCase();

    if (lower === 'schwer') {
      if (catStr.includes('gewicht') || catStr.includes('physik')) return 'heavy';
      return 'difficult';
    }
    if (lower === 'leicht') {
      if (catStr.includes('gewicht') || catStr.includes('physik')) return 'light_weight';
      return 'easy';
    }
    if (lower === 'alt' || lower === 'antik') {
      if (catStr.includes('person') || catStr.includes('alter')) return 'old_person';
      return 'old_object';
    }
    if (lower === 'neu' || lower === 'frisch') return 'new_object';
    if (lower === 'jung') return 'young_person';
    if (lower === 'teuer' || lower === 'kostspielig') return 'expensive';
    if (lower === 'billig' || lower === 'günstig' || lower === 'preiswert') return 'cheap';
    if (lower === 'laut' || lower === 'lärmend') return 'loud';
    if (lower === 'leise' || lower === 'ruhig') return 'quiet';
    if (lower === 'schnell' || lower === 'rasch') return 'fast';
    if (lower === 'langsam' || lower === 'gemächlich') return 'slow';
    if (lower === 'groß' || lower === 'riesig') return 'large';
    if (lower === 'klein' || lower === 'winzig') return 'small';
    if (lower === 'stark' || lower === 'kräftig') return 'strong';
    if (lower === 'schwach' || lower === 'kraftlos') return 'weak';
    if (lower === 'mutig' || lower === 'tapfer') return 'brave';
    if (lower === 'ängstlich' || lower === 'feige' || lower === 'furchtsam') return 'fearful';
    if (lower === 'klug' || lower === 'schlau') return 'smart';
    if (lower === 'dumm' || lower === 'töricht') return 'foolish';

    // Verbs
    if (lower === 'beginnen' || lower === 'anfangen') return 'start';
    if (lower === 'enden' || lower === 'aufhören') return 'stop';
    if (lower === 'öffnen' || lower === 'aufmachen') return 'open';
    if (lower === 'schließen' || lower === 'zumachen') return 'close';
    if (lower === 'sich beeilen' || lower === 'eilen') return 'hurry';
    if (lower === 'trödeln' || lower === 'bummeln') return 'dawdle';
    if (lower === 'helfen' || lower === 'unterstützen') return 'help';
    if (lower === 'stören' || lower === 'behindern') return 'disturb';
    if (lower === 'finden' || lower === 'entdecken') return 'find';
    if (lower === 'verlieren' || lower === 'verlegen') return 'lose';
    if (lower === 'kaufen' || lower === 'erwerben') return 'buy';
    if (lower === 'verkaufen' || lower === 'veräußern') return 'sell';
    if (lower === 'ankommen' || lower === 'eintreffen') return 'arrive';
    if (lower === 'abfahren' || lower === 'abreisen') return 'depart';
    if (lower === 'verstehen' || lower === 'begreifen') return 'understand';
    if (lower === 'missverstehen' || lower === 'fehldeuten') return 'misunderstand';
    if (lower === 'fragen') return 'ask';
    if (lower === 'antworten' || lower === 'erwidern') return 'answer';
    if (lower === 'suchen') return 'search';

    return 'general';
  }

  /**
   * Generate canonical entryId following Section 5:
   * e.g. "adj_schwer_difficult", "adj_schwer_heavy", "verb_beginnen_start"
   */
  static buildEntryId(pos, lemma, senseId) {
    const posPrefix = pos.toLowerCase().startsWith('adj') ? 'adj' : (pos.toLowerCase().startsWith('verb') ? 'verb' : 'noun');
    const safeLemma = lemma.toLowerCase().replace(/[^a-zäöüß0-9]/g, '_').replace(/_+/g, '_');
    return `${posPrefix}_${safeLemma}_${senseId}`;
  }

  /**
   * Process LexiconCandidateDTO from OpenThesaurus into candidate entries & candidate relations
   */
  static processCandidateDTO(dto, posHint = null) {
    const cleanLemma = this.cleanLemma(dto.lemma);
    const entries = [];
    const relations = [];

    const sourceRef = {
      provider: dto.provider || 'openthesaurus',
      retrievedAt: dto.retrievedAt || new Date().toISOString(),
      sourceUrl: dto.sourceUrl || '',
      licenseNote: 'CC-BY-SA 4.0 / GNU LGPL'
    };

    for (const synset of dto.synsets || []) {
      const senseId = this.deriveSenseId(cleanLemma, synset.categories);
      const morph = this.analyzeMorphology(cleanLemma, posHint);
      const entryId = this.buildEntryId(morph.partOfSpeech, cleanLemma, senseId);

      let primaryEntry = entries.find(e => e.entryId === entryId);
      if (!primaryEntry) {
        primaryEntry = {
          entryId,
          lemma: cleanLemma,
          partOfSpeech: morph.partOfSpeech,
          senseId,
          senseGlossVi: this.lookupViGloss(cleanLemma, senseId),
          verbMeta: morph.verbMeta,
          nounMeta: morph.nounMeta,
          sourceRefs: [{ ...sourceRef, providerId: String(synset.synsetId) }],
          status: 'candidate',
          difficulty: 'medium'
        };
        entries.push(primaryEntry);
      }

      // Candidate relations with other terms in the same synset
      for (const termObj of synset.terms || []) {
        const otherLemma = this.cleanLemma(termObj.term);
        if (otherLemma.toLowerCase() === cleanLemma.toLowerCase()) continue;
        // Skip multi-word phrases that are not standard lexical entries (except reflexive verbs)
        if (otherLemma.includes(' ') && !otherLemma.startsWith('sich ')) continue;

        const otherMorph = this.analyzeMorphology(otherLemma, morph.partOfSpeech);
        // Do not auto-mix parts of speech (Section 35)
        if (otherMorph.partOfSpeech !== morph.partOfSpeech) continue;

        const otherSenseId = this.deriveSenseId(otherLemma, synset.categories, senseId);
        const otherEntryId = this.buildEntryId(otherMorph.partOfSpeech, otherLemma, otherSenseId);

        let otherEntry = entries.find(e => e.entryId === otherEntryId);
        if (!otherEntry) {
          otherEntry = {
            entryId: otherEntryId,
            lemma: otherLemma,
            partOfSpeech: otherMorph.partOfSpeech,
            senseId: otherSenseId,
            senseGlossVi: this.lookupViGloss(otherLemma, otherSenseId),
            verbMeta: otherMorph.verbMeta,
            nounMeta: otherMorph.nounMeta,
            sourceRefs: [{ ...sourceRef, providerId: String(synset.synsetId) }],
            status: 'candidate',
            difficulty: termObj.level === 'gehoben' ? 'hard' : (termObj.level === 'umgangssprachlich' ? 'medium' : 'easy')
          };
          entries.push(otherEntry);
        }

        // Relation (directed / candidate)
        const relId = `rel_${morph.partOfSpeech}_${primaryEntry.entryId}__${otherEntry.entryId}`;
        const existingRel = relations.find(r => r.relationId === relId);
        if (!existingRel) {
          relations.push({
            relationId: relId,
            type: 'synonym',
            fromEntryId: primaryEntry.entryId,
            toEntryId: otherEntry.entryId,
            direction: 'bidirectional',
            contextScope: [`ctx_${morph.partOfSpeech}_${senseId}`],
            sourceEvidence: [{
              provider: 'openthesaurus',
              synsetId: synset.synsetId,
              categories: synset.categories,
              level: termObj.level || 'standard'
            }],
            reviewStatus: 'candidate',
            reviewNotes: '',
            registerNotes: termObj.level || null,
            difficulty: primaryEntry.difficulty
          });
        }
      }
    }

    return { entries, relations };
  }

  static lookupViGloss(lemma, senseId) {
    const table = {
      'schwer_difficult': 'khó, phức tạp',
      'schwer_heavy': 'nặng (khối lượng)',
      'schwierig_difficult': 'khó khăn, phức tạp',
      'leicht_easy': 'dễ dàng',
      'leicht_light_weight': 'nhẹ (khối lượng)',
      'einfach_easy': 'đơn giản',
      'teuer_expensive': 'đắt đỏ',
      'kostspielig_expensive': 'tốn kém, đắt',
      'billig_cheap': 'rẻ',
      'günstig_cheap': 'giá phải chăng',
      'preiswert_cheap': 'đáng đồng tiền, giá tốt',
      'laut_loud': 'ồn ào',
      'lärmend_loud': 'làm ầm ĩ',
      'leise_quiet': 'nhỏ tiếng, khẽ',
      'ruhig_quiet': 'yên tĩnh, điềm tĩnh',
      'schnell_fast': 'nhanh chóng',
      'rasch_fast': 'nhanh, mau lẹ',
      'langsam_slow': 'chậm chạp',
      'gemächlich_slow': 'từ tốn, thong thả',
      'alt_old_person': 'già, cao tuổi',
      'alt_old_object': 'cũ, đã qua sử dụng',
      'antik_old_object': 'cổ kính, đồ cổ',
      'jung_young_person': 'trẻ tuổi',
      'neu_new_object': 'mới',
      'frisch_new_object': 'mới, tươi mới',
      'groß_large': 'to lớn',
      'riesig_large': 'khổng lồ',
      'klein_small': 'nhỏ bé',
      'winzig_small': 'tí hon',
      'stark_strong': 'mạnh mẽ',
      'kräftig_strong': 'khỏe khoắn, cường tráng',
      'schwach_weak': 'yếu ớt',
      'kraftlos_weak': 'kiệt sức, không còn sức',
      'mutig_brave': 'dũng cảm',
      'tapfer_brave': 'gan dạ, kiên cường',
      'ängstlich_fearful': 'sợ sệt, nhút nhát',
      'furchtsam_fearful': 'sợ sệt, nhát gan',
      'feige_fearful': 'hèn nhát',
      'klug_smart': 'thông minh',
      'schlau_smart': 'khôn ngoan, lanh lợi',
      'dumm_foolish': 'ngốc nghếch',
      'töricht_foolish': 'dại dột, khờ khạo',

      'beginnen_start': 'bắt đầu',
      'anfangen_start': 'bắt đầu (tách)',
      'aufhören_stop': 'ngừng lại, thôi (tách)',
      'enden_stop': 'kết thúc',
      'öffnen_open': 'mở ra',
      'aufmachen_open': 'mở ra (tách)',
      'schließen_close': 'đóng lại',
      'zumachen_close': 'đóng lại (tách)',
      'sich beeilen_hurry': 'vội vã, khẩn trương',
      'eilen_hurry': 'hối hả',
      'trödeln_dawdle': 'lề mề, đủng đỉnh',
      'bummeln_dawdle': 'thong dong, dềnh dàng',
      'helfen_help': 'giúp đỡ',
      'unterstützen_help': 'hỗ trợ',
      'stören_disturb': 'làm phiền',
      'behindern_disturb': 'gây trở ngại',
      'finden_find': 'tìm thấy',
      'entdecken_find': 'khám phá ra',
      'verlieren_lose': 'đánh mất',
      'verlegen_lose': 'để quên, làm thất lạc',
      'kaufen_buy': 'mua',
      'erwerben_buy': 'mua được, tậu',
      'verkaufen_sell': 'bán',
      'veräußern_sell': 'phát mại, bán chuyển nhượng',
      'ankommen_arrive': 'đến nơi (tách)',
      'eintreffen_arrive': 'cập bến, tới nơi (tách)',
      'abfahren_depart': 'khởi hành (tách)',
      'abreisen_depart': 'lên đường, rời đi (tách)',
      'verstehen_understand': 'hiểu',
      'begreifen_understand': 'lĩnh hội, thấu triệt',
      'missverstehen_misunderstand': 'hiểu lầm',
      'fehldeuten_misunderstand': 'hiểu sai, diễn giải sai',
      'fragen_ask': 'hỏi',
      'antworten_answer': 'trả lời',
      'erwidern_answer': 'đáp lại',
      'suchen_search': 'tìm kiếm'
    };

    return table[`${lemma.toLowerCase()}_${senseId}`] || 'nghĩa cơ bản';
  }
}

module.exports = { LexiconNormalizer };
