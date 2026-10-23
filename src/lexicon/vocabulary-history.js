/**
 * VOCABULARY-HISTORY.JS
 * Local match history and anti-repeat tracker for Đấu Từ.
 * Tracks per-entry play frequencies, recency, cooldowns, and match-to-match overlaps.
 * Supports sliding window audits and debug reset for QA.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VocabularyHistory = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'vokabelgo_dau_tu_vocab_history_v1';

  class VocabularyHistory {
    /**
     * @param {Object} [options]
     * @param {string} [options.storageKey]
     * @param {boolean} [options.persist]
     */
    constructor(options = {}) {
      this.storageKey = options.storageKey || STORAGE_KEY;
      this.persist = options.persist !== false;
      this.entries = {}; // entryId -> { timesPlayed, lastPlayedMatchId, lastPlayedAt, matchesPlayed: [] }
      this.matches = []; // array of match records: { matchId, deckId, timestamp, selectedEntryIds, metrics }

      this.load();
    }

    load() {
      if (!this.persist) return;
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(this.storageKey);
          if (raw) {
            const data = JSON.parse(raw);
            this.entries = data.entries || {};
            this.matches = data.matches || [];
          }
        }
      } catch (err) {
        // Fallback to empty in-memory state
        this.entries = {};
        this.matches = [];
      }
    }

    save() {
      if (!this.persist) return;
      try {
        if (typeof localStorage !== 'undefined') {
          const payload = {
            version: '1.0.0',
            updatedAt: new Date().toISOString(),
            matchesCount: this.matches.length,
            entries: this.entries,
            matches: this.matches
          };
          localStorage.setItem(this.storageKey, JSON.stringify(payload));
        }
      } catch (err) {
        // Ignore storage errors (quota/disabled)
      }
    }

    /**
     * Record a completed or started match with its selected entries
     * @param {Object} matchRecord
     * @param {string} matchRecord.matchId
     * @param {string} matchRecord.deckId
     * @param {string[]} matchRecord.selectedEntryIds
     * @param {Object} [matchRecord.metrics]
     */
    recordMatch(matchRecord) {
      const { matchId, deckId, selectedEntryIds = [], metrics = {} } = matchRecord;
      const timestamp = new Date().toISOString();

      const record = {
        matchId: matchId || `match_${this.matches.length + 1}_${Date.now()}`,
        deckId: deckId || 'adjektive',
        timestamp,
        selectedEntryIds: [...selectedEntryIds],
        metrics
      };

      this.matches.push(record);

      // Update per-entry statistics
      for (const entryId of selectedEntryIds) {
        if (!this.entries[entryId]) {
          this.entries[entryId] = {
            entryId,
            timesPlayed: 0,
            lastPlayedMatchId: null,
            lastPlayedAt: null,
            matchIndices: []
          };
        }
        const eStats = this.entries[entryId];
        eStats.timesPlayed += 1;
        eStats.lastPlayedMatchId = record.matchId;
        eStats.lastPlayedAt = timestamp;
        eStats.matchIndices.push(this.matches.length - 1);
      }

      this.save();
      return record;
    }

    /**
     * Get statistics for a specific entry
     * @param {string} entryId
     */
    getEntryStats(entryId) {
      const stats = this.entries[entryId];
      if (!stats) {
        return {
          entryId,
          timesPlayed: 0,
          lastPlayedMatchId: null,
          lastPlayedAt: null,
          matchesSinceLastPlayed: Infinity,
          isNeverPlayed: true
        };
      }

      const lastIdx = stats.matchIndices.length > 0 ? stats.matchIndices[stats.matchIndices.length - 1] : -1;
      const matchesSince = lastIdx >= 0 ? (this.matches.length - 1 - lastIdx) : Infinity;

      return {
        entryId,
        timesPlayed: stats.timesPlayed,
        lastPlayedMatchId: stats.lastPlayedMatchId,
        lastPlayedAt: stats.lastPlayedAt,
        matchesSinceLastPlayed: matchesSince,
        isNeverPlayed: stats.timesPlayed === 0
      };
    }

    /**
     * Compute overlap ratio of a candidate vocabulary list against recent matches
     * @param {string[]} candidateEntryIds
     * @param {number} [windowSize=1] - 1 for consecutive match (Match N vs N-1), 3 for rolling 3
     * @param {string} [deckFilter]
     */
    getOverlapWithRecent(candidateEntryIds, windowSize = 1, deckFilter = null) {
      if (!candidateEntryIds || candidateEntryIds.length === 0) {
        return { overlapCount: 0, overlapRatio: 0, repeatedEntries: [] };
      }

      let relevantMatches = this.matches;
      if (deckFilter) {
        relevantMatches = relevantMatches.filter(m => m.deckId === deckFilter);
      }

      const recentSlice = relevantMatches.slice(-windowSize);
      if (recentSlice.length === 0) {
        return { overlapCount: 0, overlapRatio: 0, repeatedEntries: [] };
      }

      const recentEntriesSet = new Set();
      for (const m of recentSlice) {
        for (const eId of m.selectedEntryIds) {
          recentEntriesSet.add(eId);
        }
      }

      const repeated = candidateEntryIds.filter(eId => recentEntriesSet.has(eId));
      const overlapRatio = repeated.length / candidateEntryIds.length;

      return {
        overlapCount: repeated.length,
        totalCandidates: candidateEntryIds.length,
        overlapRatio: Math.round(overlapRatio * 1000) / 1000,
        repeatedEntries: repeated,
        comparedMatchesCount: recentSlice.length
      };
    }

    /**
     * Get summary of all matches for QA reporting
     */
    getQAReport() {
      const report = [];
      const seenEntries = new Set();

      for (let i = 0; i < this.matches.length; i++) {
        const m = this.matches[i];
        for (const eId of m.selectedEntryIds) seenEntries.add(eId);

        // Compare with immediate previous match
        let overlapNMinus1 = 0;
        let repeatedNMinus1 = [];
        if (i > 0) {
          const prev = this.matches[i - 1];
          const prevSet = new Set(prev.selectedEntryIds);
          repeatedNMinus1 = m.selectedEntryIds.filter(id => prevSet.has(id));
          overlapNMinus1 = repeatedNMinus1.length;
        }

        // Compare with rolling 3 matches (up to 3 prior matches)
        let rolling3Overlap = 0;
        let rolling3Repeated = [];
        if (i > 0) {
          const start = Math.max(0, i - 3);
          const rollingSet = new Set();
          for (let k = start; k < i; k++) {
            for (const id of this.matches[k].selectedEntryIds) rollingSet.add(id);
          }
          rolling3Repeated = m.selectedEntryIds.filter(id => rollingSet.has(id));
          rolling3Overlap = rolling3Repeated.length;
        }

        report.push({
          matchIndex: i + 1,
          matchId: m.matchId,
          deckId: m.deckId,
          timestamp: m.timestamp,
          vocabularyCount: m.selectedEntryIds.length,
          vocabulary: m.selectedEntryIds,
          overlapConsecutive: overlapNMinus1,
          overlapConsecutivePercent: m.selectedEntryIds.length > 0 ? `${Math.round((overlapNMinus1 / m.selectedEntryIds.length) * 100)}%` : '0%',
          repeatedConsecutive: repeatedNMinus1,
          overlapRolling3: rolling3Overlap,
          overlapRolling3Percent: m.selectedEntryIds.length > 0 ? `${Math.round((rolling3Overlap / m.selectedEntryIds.length) * 100)}%` : '0%',
          repeatedRolling3: rolling3Repeated,
          uniqueEntriesEncounteredCumulative: seenEntries.size
        });
      }

      return {
        totalMatches: this.matches.length,
        totalUniqueEntries: seenEntries.size,
        history: report
      };
    }

    /**
     * Clear all recorded history (debug / QA reset)
     */
    resetHistory() {
      this.entries = {};
      this.matches = [];
      if (this.persist && typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem(this.storageKey);
        } catch (e) {}
      }
    }
  }

  return VocabularyHistory;
});
