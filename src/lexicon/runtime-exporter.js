/**
 * RUNTIME-EXPORTER.JS
 * Validates approved lexical data against strict integrity gates (Section 30)
 * and exports game-ready runtime datasets.
 */

const fs = require('fs');
const path = require('path');
const { DeckBuilder } = require('./deck-builder');
const SEMANTIC_CLUSTERS = require('./semantic-clusters');

class RuntimeExporter {
  constructor(candidateStore) {
    this.store = candidateStore;
    this.outputDir = path.resolve(__dirname, '../../data/lexicon/runtime');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Validate entire dataset before exporting (Section 30 Hard Failures)
   */
  validate() {
    const errors = [];
    const approvedEntries = this.store.approvedEntries;
    const approvedRelations = this.store.approvedRelations;
    const approvedContexts = this.store.approvedContexts;
    const approvedAntonyms = this.store.approvedAntonyms;

    // 1. Candidate / rejected data must NOT leak into approved dataset
    for (const [rId, rel] of Object.entries(approvedRelations)) {
      if (rel.reviewStatus !== 'approved') {
        errors.push(`Unapproved relation in approved store: ${rId} has status '${rel.reviewStatus}'`);
      }
      // 2. Relation must point to existing approved entries
      if (!approvedEntries[rel.fromEntryId]) {
        errors.push(`Relation ${rId} fromEntryId '${rel.fromEntryId}' does not exist in approved entries`);
      }
      if (!approvedEntries[rel.toEntryId]) {
        errors.push(`Relation ${rId} toEntryId '${rel.toEntryId}' does not exist in approved entries`);
      }
      // 3. Approved edge must have a valid context
      const ctxId = rel.contextScope?.[0];
      if (!ctxId || !approvedContexts[ctxId]) {
        errors.push(`Relation ${rId} lacks valid approved context (referenced '${ctxId}')`);
      }
    }

    // 4. Context variants check
    for (const [ctxId, ctx] of Object.entries(approvedContexts)) {
      if (!ctx.variants || Object.keys(ctx.variants).length < 2) {
        errors.push(`Context ${ctxId} has fewer than 2 sentence variants`);
      }
      for (const [entryId, v] of Object.entries(ctx.variants || {})) {
        if (!v.de || !v.highlightTokens || !v.vi) {
          errors.push(`Context ${ctxId} variant for '${entryId}' is malformed (missing de, highlightTokens, or vi)`);
        }
      }
    }

    // 5. GEGENTEIL target missing check
    for (const [key, ant] of Object.entries(approvedAntonyms)) {
      if (!ant.targetEntryId || !approvedEntries[ant.targetEntryId]) {
        errors.push(`Antonym ${key} targetEntryId '${ant.targetEntryId}' does not exist in approved entries`);
      }
      if (!ant.targetContextId || !approvedContexts[ant.targetContextId]) {
        errors.push(`Antonym ${key} targetContextId '${ant.targetContextId}' does not exist in approved contexts`);
      }
    }

    // 6. Unknown part-of-speech
    const validPos = ['adjective', 'verb', 'noun'];
    for (const [eId, entry] of Object.entries(approvedEntries)) {
      if (!validPos.includes(entry.partOfSpeech.toLowerCase())) {
        errors.push(`Entry ${eId} has unknown partOfSpeech '${entry.partOfSpeech}'`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export approved runtime files
   */
  exportRuntime() {
    const val = this.validate();
    if (!val.isValid) {
      throw new Error(`Runtime Export Validation Failed:\n- ${val.errors.join('\n- ')}`);
    }

    const deckBuilder = new DeckBuilder(this.store);
    const adjDeck = deckBuilder.buildDeck('adjective');
    const verbDeck = deckBuilder.buildDeck('verb');

    // Check duplicate physical card IDs
    const seenIds = new Set();
    for (const c of [...adjDeck.cards, ...verbDeck.cards]) {
      if (seenIds.has(c.id)) {
        throw new Error(`Duplicate physical card ID detected: ${c.id}`);
      }
      seenIds.add(c.id);
    }

    const runtimePayload = {
      version: '0.2.0',
      exportedAt: new Date().toISOString(),
      clusters: SEMANTIC_CLUSTERS,
      approvedPool: {
        entries: this.store.approvedEntries,
        contexts: this.store.approvedContexts,
        relations: this.store.approvedRelations,
        antonyms: this.store.approvedAntonyms,
        clusters: SEMANTIC_CLUSTERS
      },
      decks: {
        adjektive: {
          id: 'adjektive',
          name: 'Tính từ · Adjektive (Expanded Lexicon)',
          cards: adjDeck.cards,
          entries: this.filterEntriesForDeck(adjDeck.selectedEntries),
          contexts: this.filterContextsForDeck(adjDeck.selectedEntries),
          synonyms: this.formatSynonyms(adjDeck.selectedEntries),
          antonyms: this.formatAntonyms(adjDeck.selectedEntries)
        },
        verben: {
          id: 'verben',
          name: 'Động từ · Verben (Expanded Lexicon)',
          cards: verbDeck.cards,
          entries: this.filterEntriesForDeck(verbDeck.selectedEntries),
          contexts: this.filterContextsForDeck(verbDeck.selectedEntries),
          synonyms: this.formatSynonyms(verbDeck.selectedEntries),
          antonyms: this.formatAntonyms(verbDeck.selectedEntries)
        }
      },
      audit: {
        adjektive: adjDeck.audit,
        verben: verbDeck.audit
      }
    };

    // 1. JSON output
    const jsonPath = path.join(this.outputDir, 'dau-tu-approved-runtime.json');
    fs.writeFileSync(jsonPath, JSON.stringify(runtimePayload, null, 2), 'utf8');

    // 2. JavaScript UMD output for seamless browser inclusion
    const jsPath = path.join(this.outputDir, 'dau-tu-runtime-data.js');
    const jsContent = `/**
 * DAU-TU-RUNTIME-DATA.JS
 * Auto-generated approved runtime dataset for Đấu Từ Preview.
 * Exported at: ${runtimePayload.exportedAt}
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DAU_TU_EXPANDED_RUNTIME = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  return ${JSON.stringify(runtimePayload, null, 2)};
});
`;
    fs.writeFileSync(jsPath, jsContent, 'utf8');

    return {
      success: true,
      jsonPath,
      jsPath,
      stats: {
        adjCards: adjDeck.totalCardsCount,
        verbCards: verbDeck.totalCardsCount,
        adjEntries: adjDeck.unitsCount,
        verbEntries: verbDeck.unitsCount
      }
    };
  }

  filterEntriesForDeck(selectedEntries) {
    const map = {};
    for (const e of selectedEntries) {
      map[e.entryId] = {
        entryId: e.entryId,
        lemma: e.lemma,
        partOfSpeech: e.partOfSpeech === 'adjective' ? 'Adjektiv' : (e.partOfSpeech === 'verb' ? 'Verb' : 'Nomen'),
        senseVi: e.senseGlossVi,
        baseContextId: e.contextScope?.[0] || `ctx_${e.partOfSpeech}_${e.senseId}`,
        verbMeta: e.verbMeta || null
      };
    }
    return map;
  }

  filterContextsForDeck(selectedEntries) {
    const entryIds = new Set(selectedEntries.map(e => e.entryId));
    const result = {};
    for (const [ctxId, ctx] of Object.entries(this.store.approvedContexts)) {
      const hasAny = Object.keys(ctx.variants || {}).some(eId => entryIds.has(eId));
      if (hasAny) {
        result[ctxId] = {
          contextId: ctx.contextId,
          topic: ctx.topic || ctx.meaning,
          explanationVi: ctx.explanationVi || '',
          sentenceVariants: ctx.variants
        };
      }
    }
    return result;
  }

  formatSynonyms(selectedEntries) {
    const entryIds = new Set(selectedEntries.map(e => e.entryId));
    const result = [];
    for (const rel of Object.values(this.store.approvedRelations)) {
      if (entryIds.has(rel.fromEntryId) && entryIds.has(rel.toEntryId)) {
        result.push({
          contextId: rel.contextScope?.[0] || 'ctx_default',
          from: rel.fromEntryId,
          to: rel.toEntryId
        });
        if (rel.direction === 'bidirectional') {
          result.push({
            contextId: rel.contextScope?.[0] || 'ctx_default',
            from: rel.toEntryId,
            to: rel.fromEntryId
          });
        }
      }
    }
    return result;
  }

  formatAntonyms(selectedEntries) {
    const entryIds = new Set(selectedEntries.map(e => e.entryId));
    const result = {};
    for (const [key, ant] of Object.entries(this.store.approvedAntonyms)) {
      const fromEntryId = key.split(':')[1];
      if (entryIds.has(fromEntryId) && entryIds.has(ant.targetEntryId)) {
        result[key] = {
          targetEntryId: ant.targetEntryId,
          targetContextId: ant.targetContextId,
          explanationShortVi: ant.explanationShortVi || `${fromEntryId} ⇄ ${ant.targetEntryId}`
        };
      }
    }
    return result;
  }
}

module.exports = { RuntimeExporter };
