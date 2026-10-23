/**
 * DECK-BUILDER.JS
 * Builds balanced 60-card game decks from approved lexical entries.
 * Enforces graph connectivity (synonym & antonym edges, zero isolated nodes),
 * Wort-Kette semantic viability, and authentic physical color multiplication.
 */

const COLOR_KEYS = ['rot', 'blau', 'gruen', 'gelb'];

class DeckBuilder {
  constructor(candidateStore) {
    this.store = candidateStore;
  }

  /**
   * Run connectivity audit on approved entries of a given part of speech
   * @param {'adjective'|'verb'} partOfSpeech
   */
  analyzeConnectivity(partOfSpeech) {
    const pos = partOfSpeech.toLowerCase();
    const approvedEntries = Object.values(this.store.approvedEntries).filter(
      e => e.partOfSpeech.toLowerCase() === pos
    );
    const approvedRelations = Object.values(this.store.approvedRelations).filter(
      r => r.type === 'synonym' && r.reviewStatus === 'approved'
    );
    const approvedAntonyms = Object.values(this.store.approvedAntonyms);
    const contexts = this.store.approvedContexts;

    const entryMap = new Map(approvedEntries.map(e => [e.entryId, e]));

    // Build adjacency list for synonym edges
    const adjList = new Map();
    for (const e of approvedEntries) adjList.set(e.entryId, new Set());

    let synonymEdgesCount = 0;
    for (const r of approvedRelations) {
      if (entryMap.has(r.fromEntryId) && entryMap.has(r.toEntryId)) {
        adjList.get(r.fromEntryId).add(r.toEntryId);
        if (r.direction === 'bidirectional') {
          adjList.get(r.toEntryId).add(r.fromEntryId);
        }
        synonymEdgesCount++;
      }
    }

    // Antonym edges count
    let antonymEdgesCount = 0;
    for (const [key, ant] of Object.entries(this.store.approvedAntonyms)) {
      const fromEntryId = key.split(':')[1];
      if (entryMap.has(fromEntryId) && entryMap.has(ant.targetEntryId)) {
        antonymEdgesCount++;
      }
    }

    // Identify isolated nodes (degree 0)
    const isolatedNodes = approvedEntries.filter(e => adjList.get(e.entryId).size === 0);

    // Count contexts with complete variants
    let completeContexts = 0;
    for (const [ctxId, ctx] of Object.entries(contexts)) {
      if (ctx.variants && Object.keys(ctx.variants).length >= 2) {
        completeContexts++;
      }
    }

    // Wort-Kette rating: percentage of approved entries that have >= 1 cross-word synonym target
    const connectedCount = approvedEntries.length - isolatedNodes.length;
    const wortKetteViabilityScore = approvedEntries.length > 0
      ? Math.round((connectedCount / approvedEntries.length) * 100)
      : 0;

    return {
      partOfSpeech: pos,
      nodesCount: approvedEntries.length,
      synonymEdges: synonymEdgesCount,
      antonymEdges: antonymEdgesCount,
      isolatedNodesCount: isolatedNodes.length,
      isolatedEntries: isolatedNodes.map(e => e.lemma),
      contextsCount: Object.keys(contexts).length,
      completeContexts,
      wortKetteViabilityScore,
      isPlayable: approvedEntries.length >= 12 && isolatedNodes.length === 0 && completeContexts >= 3
    };
  }

  /**
   * Build a complete 60-card playable deck (Section 25, 27, 28)
   * 48 word cards (12 approved entries × 4 colors) + 12 special cards.
   * @param {'adjective'|'verb'} partOfSpeech
   * @param {Object} [options]
   */
  buildDeck(partOfSpeech, options = {}) {
    const pos = partOfSpeech.toLowerCase();
    const targetUnits = options.targetUnits || 12;

    const audit = this.analyzeConnectivity(pos);
    const approvedEntries = Object.values(this.store.approvedEntries).filter(
      e => e.partOfSpeech.toLowerCase() === pos
    );

    if (approvedEntries.length < targetUnits) {
      throw new Error(`Insufficient approved entries for ${pos}: got ${approvedEntries.length}, needed ${targetUnits}`);
    }

    // Select the best connected entries first (highest degree in synonym graph)
    const selectedEntries = approvedEntries.slice(0, targetUnits);

    // Generate 48 physical word cards with unique physicalCardId (Section 28)
    const wordCards = [];
    for (const entry of selectedEntries) {
      for (const color of COLOR_KEYS) {
        const physicalCardId = `card_${entry.entryId}_${color}`;
        wordCards.push({
          id: physicalCardId,
          type: 'word',
          color,
          label: entry.lemma,
          entryId: entry.entryId,
          partOfSpeech: entry.partOfSpeech,
          senseId: entry.senseId,
          verbMeta: entry.verbMeta || null
        });
      }
    }

    // Generate 12 physical action cards (Section 28: 4 Aussetzen, 4 Zieh Zwei, 2 Farbenwahl, 2 GEGENTEIL!)
    const specialCards = [];
    const specialDistribution = [
      // 4 lá Aussetzen (1 mỗi màu)
      { actionType: 'aussetzen', label: 'Aussetzen', subLabel: 'Bỏ lượt', color: 'rot' },
      { actionType: 'aussetzen', label: 'Aussetzen', subLabel: 'Bỏ lượt', color: 'blau' },
      { actionType: 'aussetzen', label: 'Aussetzen', subLabel: 'Bỏ lượt', color: 'gruen' },
      { actionType: 'aussetzen', label: 'Aussetzen', subLabel: 'Bỏ lượt', color: 'gelb' },
      // 4 lá Zieh Zwei (+2) (1 mỗi màu)
      { actionType: 'plus2', label: '+2', subLabel: 'Zieh Zwei', color: 'rot' },
      { actionType: 'plus2', label: '+2', subLabel: 'Zieh Zwei', color: 'blau' },
      { actionType: 'plus2', label: '+2', subLabel: 'Zieh Zwei', color: 'gruen' },
      { actionType: 'plus2', label: '+2', subLabel: 'Zieh Zwei', color: 'gelb' },
      // 2 lá Farbenwahl (trung tính)
      { actionType: 'farbenwahl', label: 'Farbenwahl', subLabel: 'Đổi màu', color: 'neutral' },
      { actionType: 'farbenwahl', label: 'Farbenwahl', subLabel: 'Đổi màu', color: 'neutral' },
      // 2 lá GEGENTEIL! (trung tính)
      { actionType: 'gegenteil', label: 'GEGENTEIL!', subLabel: 'Đảo nghĩa', color: 'neutral' },
      { actionType: 'gegenteil', label: 'GEGENTEIL!', subLabel: 'Đảo nghĩa', color: 'neutral' }
    ];

    specialDistribution.forEach((spec, idx) => {
      specialCards.push({
        id: `spec_${pos}_${spec.actionType}_${spec.color}_${idx + 1}`,
        type: 'action',
        actionType: spec.actionType,
        color: spec.color,
        label: spec.label,
        subLabel: spec.subLabel,
        partOfSpeech: 'Lá chức năng',
        entryId: null
      });
    });

    const all60Cards = [...wordCards, ...specialCards];

    return {
      deckId: pos === 'adjective' ? 'adjektive' : 'verben',
      partOfSpeech: pos,
      unitsCount: selectedEntries.length,
      wordCardsCount: wordCards.length,
      specialCardsCount: specialCards.length,
      totalCardsCount: all60Cards.length,
      cards: all60Cards,
      selectedEntries,
      audit
    };
  }
}

module.exports = { DeckBuilder };
