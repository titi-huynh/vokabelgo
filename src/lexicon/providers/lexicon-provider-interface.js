/**
 * LEXICON-PROVIDER-INTERFACE.JS
 * Multi-source future architecture interface for dictionary/thesaurus adapters.
 * Every provider must implement searchLemma() and getMetadata().
 */

class LexiconProvider {
  /**
   * Search a German lemma.
   * @param {string} lemma - The German canonical lemma (e.g. 'schwer', 'anfangen')
   * @returns {Promise<LexiconProviderResult>}
   */
  async searchLemma(lemma) {
    throw new Error('searchLemma() must be implemented by LexiconProvider subclass');
  }

  /**
   * Get provider metadata and attribution.
   * @returns {Object} { id, name, homeUrl, license, licenseUrl, attributionText }
   */
  getMetadata() {
    throw new Error('getMetadata() must be implemented by LexiconProvider subclass');
  }
}

/**
 * Standard DTO returned by LexiconProvider subclasses
 * @typedef {Object} LexiconCandidateDTO
 * @property {string} lemma
 * @property {string} provider
 * @property {string} retrievedAt
 * @property {string} [sourceUrl]
 * @property {Array<{ synsetId: string|number, categories: string[], terms: Array<{ term: string, level?: string }> }>} synsets
 */

module.exports = { LexiconProvider };
