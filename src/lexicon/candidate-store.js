/**
 * CANDIDATE-STORE.JS
 * Storage manager for candidate and approved lexical datasets.
 * Handles deduplication, status transitions, audit trails, and dashboard metrics.
 */

const fs = require('fs');
const path = require('path');

class CandidateStore {
  constructor(options = {}) {
    this.candidatesFile = options.candidatesFile || process.env.VOKABELGO_CANDIDATES_FILE || path.resolve(__dirname, '../../data/lexicon/candidates/candidates.json');
    this.approvedFile = options.approvedFile || process.env.VOKABELGO_APPROVED_FILE || path.resolve(__dirname, '../../data/lexicon/approved/approved.json');

    this.ensureDirs();
    this.load();
  }

  ensureDirs() {
    const cDir = path.dirname(this.candidatesFile);
    const aDir = path.dirname(this.approvedFile);
    if (!fs.existsSync(cDir)) fs.mkdirSync(cDir, { recursive: true });
    if (!fs.existsSync(aDir)) fs.mkdirSync(aDir, { recursive: true });
  }

  load() {
    if (fs.existsSync(this.candidatesFile)) {
      try {
        const cData = JSON.parse(fs.readFileSync(this.candidatesFile, 'utf8'));
        this.candidateEntries = cData.entries || {};
        this.candidateRelations = cData.relations || {};
      } catch (e) {
        this.candidateEntries = {};
        this.candidateRelations = {};
      }
    } else {
      this.candidateEntries = {};
      this.candidateRelations = {};
    }

    if (fs.existsSync(this.approvedFile)) {
      try {
        const aData = JSON.parse(fs.readFileSync(this.approvedFile, 'utf8'));
        this.approvedEntries = aData.entries || {};
        this.approvedRelations = aData.relations || {};
        this.approvedContexts = aData.contexts || {};
        this.approvedAntonyms = aData.antonyms || {};
      } catch (e) {
        this.approvedEntries = {};
        this.approvedRelations = {};
        this.approvedContexts = {};
        this.approvedAntonyms = {};
      }
    } else {
      this.approvedEntries = {};
      this.approvedRelations = {};
      this.approvedContexts = {};
      this.approvedAntonyms = {};
    }
  }

  saveCandidates() {
    const payload = {
      version: '0.1.0',
      updatedAt: new Date().toISOString(),
      entriesCount: Object.keys(this.candidateEntries).length,
      relationsCount: Object.keys(this.candidateRelations).length,
      entries: this.candidateEntries,
      relations: this.candidateRelations
    };
    fs.writeFileSync(this.candidatesFile, JSON.stringify(payload, null, 2), 'utf8');
  }

  pruneOrphanApprovedEntries() {
    const activeEntryIds = new Set();
    // From approved relations
    for (const r of Object.values(this.approvedRelations)) {
      if (r.reviewStatus === 'approved') {
        activeEntryIds.add(r.fromEntryId);
        activeEntryIds.add(r.toEntryId);
      }
    }
    // From approved contexts
    for (const ctx of Object.values(this.approvedContexts)) {
      for (const eId of Object.keys(ctx.variants || {})) {
        activeEntryIds.add(eId);
      }
    }
    // From approved antonyms
    for (const [key, ant] of Object.entries(this.approvedAntonyms)) {
      const fromE = key.split(':')[1];
      if (fromE) activeEntryIds.add(fromE);
      if (ant.targetEntryId) activeEntryIds.add(ant.targetEntryId);
    }

    for (const eId of Object.keys(this.approvedEntries)) {
      if (!activeEntryIds.has(eId)) {
        delete this.approvedEntries[eId];
        if (this.candidateEntries[eId]) {
          this.candidateEntries[eId].status = 'candidate';
        }
      }
    }
  }

  saveApproved() {
    this.pruneOrphanApprovedEntries();
    const payload = {
      version: '0.1.0',
      updatedAt: new Date().toISOString(),
      entriesCount: Object.keys(this.approvedEntries).length,
      relationsCount: Object.keys(this.approvedRelations).length,
      contextsCount: Object.keys(this.approvedContexts).length,
      antonymsCount: Object.keys(this.approvedAntonyms).length,
      entries: this.approvedEntries,
      relations: this.approvedRelations,
      contexts: this.approvedContexts,
      antonyms: this.approvedAntonyms
    };
    fs.writeFileSync(this.approvedFile, JSON.stringify(payload, null, 2), 'utf8');
  }

  /**
   * Ingest normalized entries & relations from a provider
   */
  ingest({ entries = [], relations = [] }) {
    let addedEntries = 0;
    let addedRelations = 0;

    for (const entry of entries) {
      if (!this.candidateEntries[entry.entryId]) {
        this.candidateEntries[entry.entryId] = {
          ...entry,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        addedEntries++;
      } else {
        // Merge sourceRefs if from new synset
        const existing = this.candidateEntries[entry.entryId];
        for (const sRef of entry.sourceRefs || []) {
          const already = (existing.sourceRefs || []).some(
            r => r.provider === sRef.provider && r.providerId === sRef.providerId
          );
          if (!already) {
            existing.sourceRefs = existing.sourceRefs || [];
            existing.sourceRefs.push(sRef);
            existing.updatedAt = new Date().toISOString();
          }
        }
      }
    }

    for (const rel of relations) {
      if (!this.candidateRelations[rel.relationId]) {
        this.candidateRelations[rel.relationId] = {
          ...rel,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        addedRelations++;
      } else {
        // Merge source evidence
        const existingRel = this.candidateRelations[rel.relationId];
        for (const ev of rel.sourceEvidence || []) {
          const hasEv = (existingRel.sourceEvidence || []).some(
            e => e.provider === ev.provider && e.synsetId === ev.synsetId
          );
          if (!hasEv) {
            existingRel.sourceEvidence = existingRel.sourceEvidence || [];
            existingRel.sourceEvidence.push(ev);
            existingRel.updatedAt = new Date().toISOString();
          }
        }
      }
    }

    this.saveCandidates();
    return { addedEntries, addedRelations };
  }

  /**
   * Transition relation review status
   * @param {string} relationId
   * @param {'candidate'|'needs_review'|'approved'|'rejected'|'deprecated'} status
   * @param {string} [reviewNotes]
   * @param {string} [reviewedBy]
   */
  setRelationStatus(relationId, status, reviewNotes = '', reviewedBy = 'reviewer') {
    const rel = this.candidateRelations[relationId];
    if (!rel) throw new Error(`Relation not found: ${relationId}`);

    const validStatuses = ['candidate', 'needs_review', 'approved', 'rejected', 'deprecated'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Allowed: ${validStatuses.join(', ')}`);
    }

    rel.reviewStatus = status;
    rel.reviewNotes = reviewNotes || rel.reviewNotes;
    rel.reviewedBy = reviewedBy;
    rel.updatedAt = new Date().toISOString();

    if (status === 'approved') {
      // Synchronize into approved store
      this.approvedRelations[relationId] = { ...rel };
      // Also approve endpoints
      if (this.candidateEntries[rel.fromEntryId]) {
        this.approvedEntries[rel.fromEntryId] = { ...this.candidateEntries[rel.fromEntryId], status: 'approved' };
        this.candidateEntries[rel.fromEntryId].status = 'approved';
      }
      if (this.candidateEntries[rel.toEntryId]) {
        this.approvedEntries[rel.toEntryId] = { ...this.candidateEntries[rel.toEntryId], status: 'approved' };
        this.candidateEntries[rel.toEntryId].status = 'approved';
      }
      this.saveApproved();
    } else {
      // If was previously approved and now rejected/deprecated, remove from approved store
      if (this.approvedRelations[relationId]) {
        delete this.approvedRelations[relationId];
        this.saveApproved();
      }
    }

    this.saveCandidates();
    return rel;
  }

  /**
   * Add context sentence variants (Section 9)
   */
  setContext(contextObj) {
    if (!contextObj.contextId || !contextObj.variants) {
      throw new Error('contextId and variants required');
    }
    this.approvedContexts[contextObj.contextId] = {
      ...contextObj,
      updatedAt: new Date().toISOString()
    };
    this.saveApproved();
    return this.approvedContexts[contextObj.contextId];
  }

  /**
   * Add context-specific antonym (GEGENTEIL) relation (Section 13, 14)
   */
  setAntonym(key, antonymObj) {
    if (!key || !antonymObj.targetEntryId || !antonymObj.targetContextId) {
      throw new Error('Antonym requires valid key, targetEntryId, and targetContextId');
    }
    this.approvedAntonyms[key] = {
      ...antonymObj,
      type: 'antonym',
      reviewStatus: 'approved',
      updatedAt: new Date().toISOString()
    };
    this.saveApproved();
    return this.approvedAntonyms[key];
  }

  /**
   * Search / filter candidate relations
   */
  queryRelations(filters = {}) {
    let list = Object.values(this.candidateRelations);

    if (filters.status) {
      list = list.filter(r => r.reviewStatus === filters.status);
    }
    if (filters.pos) {
      list = list.filter(r => {
        const entry = this.candidateEntries[r.fromEntryId];
        return entry && entry.partOfSpeech.toLowerCase() === filters.pos.toLowerCase();
      });
    }
    if (filters.lemma) {
      const q = filters.lemma.toLowerCase();
      list = list.filter(r => {
        const fromE = this.candidateEntries[r.fromEntryId];
        const toE = this.candidateEntries[r.toEntryId];
        return (fromE && fromE.lemma.toLowerCase().includes(q)) ||
               (toE && toE.lemma.toLowerCase().includes(q));
      });
    }

    return list.map(r => ({
      ...r,
      fromEntry: this.candidateEntries[r.fromEntryId] || null,
      toEntry: this.candidateEntries[r.toEntryId] || null,
      context: this.approvedContexts[r.contextScope?.[0]] || null
    }));
  }

  /**
   * Dashboard Summary (Section 53)
   */
  getDashboardSummary() {
    const candidateEntriesList = Object.values(this.candidateEntries);
    const candidateRelationsList = Object.values(this.candidateRelations);
    const approvedRelationsList = Object.values(this.approvedRelations);
    const approvedEntriesList = Object.values(this.approvedEntries);

    const synonymRelations = candidateRelationsList.filter(r => r.type === 'synonym');
    const antonymRelations = Object.keys(this.approvedAntonyms);

    const approvedCount = candidateRelationsList.filter(r => r.reviewStatus === 'approved').length;
    const candidateCount = candidateRelationsList.filter(r => r.reviewStatus === 'candidate').length;
    const needsReviewCount = candidateRelationsList.filter(r => r.reviewStatus === 'needs_review').length;
    const rejectedCount = candidateRelationsList.filter(r => r.reviewStatus === 'rejected').length;

    // Detect isolated entries (nodes with 0 approved relations)
    const connectedEntryIds = new Set();
    for (const r of approvedRelationsList) {
      connectedEntryIds.add(r.fromEntryId);
      connectedEntryIds.add(r.toEntryId);
    }
    const isolatedEntries = approvedEntriesList.filter(e => !connectedEntryIds.has(e.entryId)).length;

    return {
      entriesTotal: candidateEntriesList.length,
      candidates: candidateCount,
      needsReview: needsReviewCount,
      approved: approvedCount,
      rejected: rejectedCount,
      synonymRelations: synonymRelations.length,
      antonymRelations: antonymRelations.length,
      contexts: Object.keys(this.approvedContexts).length,
      isolatedEntries
    };
  }
}

module.exports = { CandidateStore };
