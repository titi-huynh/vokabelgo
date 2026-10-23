/**
 * OPENTHESAURUS-ADAPTER.JS
 * Provider adapter for OpenThesaurus (German synonym database).
 * Supports caching, timeout, offline fallbacks, and standard DTO mapping.
 */

const fs = require('fs');
const path = require('path');
const { LexiconProvider } = require('./lexicon-provider-interface');

class OpenThesaurusAdapter extends LexiconProvider {
  /**
   * @param {Object} [options]
   * @param {string} [options.cacheDir] - Directory where raw responses are persisted
   * @param {number} [options.timeoutMs] - HTTP timeout in milliseconds (default 6000)
   * @param {string} [options.baseUrl] - Base API URL
   */
  constructor(options = {}) {
    super();
    this.cacheDir = options.cacheDir || path.resolve(__dirname, '../../../data/lexicon/raw/openthesaurus');
    this.timeoutMs = options.timeoutMs || 6000;
    this.baseUrl = options.baseUrl || 'https://api.openthesaurus.de/synonyme/search';

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  getMetadata() {
    return {
      id: 'openthesaurus',
      name: 'OpenThesaurus',
      homeUrl: 'https://www.openthesaurus.de',
      apiDocs: 'https://www.openthesaurus.de/about/api',
      license: 'GNU Lesser General Public License (LGPL) or Creative Commons Attribution-ShareAlike 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      attributionText: 'Daten von OpenThesaurus (www.openthesaurus.de), lizenziert unter CC-BY-SA 4.0 / GNU LGPL.',
      termsNote: 'Kostenlose Nutzung mit Caching und Beachtung von Fair Use / Rate Limits.'
    };
  }

  /**
   * Safe file naming for German umlauts
   */
  getCachePath(lemma) {
    const safeName = encodeURIComponent(lemma.trim().toLowerCase());
    return path.join(this.cacheDir, `${safeName}.json`);
  }

  /**
   * Search a German lemma in OpenThesaurus
   * @param {string} lemma
   * @param {Object} [opts]
   * @param {boolean} [opts.forceRefresh]
   * @returns {Promise<{ success: boolean, data?: Object, fromCache: boolean, error?: string }>}
   */
  async searchLemma(lemma, opts = {}) {
    if (!lemma || typeof lemma !== 'string') {
      return { success: false, error: 'Invalid lemma provided', fromCache: false };
    }

    const cleanLemma = lemma.trim();
    const cacheFile = this.getCachePath(cleanLemma);

    // 1. Check disk cache first unless forceRefresh is set
    if (!opts.forceRefresh && fs.existsSync(cacheFile)) {
      try {
        const rawJson = fs.readFileSync(cacheFile, 'utf8');
        const rawData = JSON.parse(rawJson);
        const dto = this.mapToDTO(cleanLemma, rawData, true);
        return { success: true, data: dto, fromCache: true };
      } catch (err) {
        // Cache read failed, proceed to fetch
      }
    }

    // 2. Fetch from remote API with timeout
    const url = `${this.baseUrl}?q=${encodeURIComponent(cleanLemma)}&format=application/json`;
    let response;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'VokabelGo-DauTu-Lexicon/0.1 (Educational Game Project)'
        },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();

      // Persist raw response into /data/lexicon/raw/openthesaurus
      fs.writeFileSync(cacheFile, JSON.stringify(rawData, null, 2), 'utf8');

      const dto = this.mapToDTO(cleanLemma, rawData, false);
      return { success: true, data: dto, fromCache: false };
    } catch (netErr) {
      // 3. Fallback to cache if available
      if (fs.existsSync(cacheFile)) {
        try {
          const rawJson = fs.readFileSync(cacheFile, 'utf8');
          const rawData = JSON.parse(rawJson);
          const dto = this.mapToDTO(cleanLemma, rawData, true);
          return { success: true, data: dto, fromCache: true, fallbackNotice: netErr.message };
        } catch (e) {
          // ignore
        }
      }

      // 4. Return clean error object without crashing
      return {
        success: false,
        lemma: cleanLemma,
        provider: 'openthesaurus',
        error: `OpenThesaurus request failed: ${netErr.message}`,
        fromCache: false
      };
    }
  }

  /**
   * Convert OpenThesaurus raw response to standard LexiconCandidateDTO
   */
  mapToDTO(lemma, raw, fromCache) {
    const synsets = (raw.synsets || []).map(s => {
      return {
        synsetId: s.id || `syn_${Math.random().toString(36).slice(2, 8)}`,
        categories: Array.isArray(s.categories) ? s.categories : [],
        terms: (s.terms || []).map(t => ({
          term: t.term,
          level: t.level || 'standard'
        }))
      };
    });

    return {
      lemma,
      provider: 'openthesaurus',
      retrievedAt: raw.meta?.date || new Date().toISOString(),
      sourceUrl: `https://www.openthesaurus.de/synonyme/${encodeURIComponent(lemma)}`,
      synsets,
      rawMeta: raw.meta || {},
      fromCache
    };
  }
}

module.exports = { OpenThesaurusAdapter };
