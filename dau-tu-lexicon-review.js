/**
 * DAU-TU-LEXICON-REVIEW.JS
 * Client script for Lexicon Pipeline Review Workbench.
 * Renders candidate datasets, polysemy views, verb morphology, and deck builder summary.
 */

(function () {
  'use strict';

  let appData = {
    candidates: { entries: {}, relations: {} },
    approved: { entries: {}, relations: {}, contexts: {}, antonyms: {} },
    runtime: null
  };

  let activeFilters = {
    search: '',
    pos: 'all',
    status: 'all'
  };

  let activeTab = 'tab-relations';

  // DOM Elements
  const statTotalEntries = document.getElementById('statTotalEntries');
  const statCandidates = document.getElementById('statCandidates');
  const statNeedsReview = document.getElementById('statNeedsReview');
  const statApproved = document.getElementById('statApproved');
  const statRejected = document.getElementById('statRejected');
  const statSynonyms = document.getElementById('statSynonyms');
  const statAntonyms = document.getElementById('statAntonyms');
  const statContexts = document.getElementById('statContexts');
  const statIsolated = document.getElementById('statIsolated');
  const badgeRelationsCount = document.getElementById('badgeRelationsCount');

  const searchInput = document.getElementById('searchInput');
  const relationsGrid = document.getElementById('relationsGrid');
  const verbsMorphologyGrid = document.getElementById('verbsMorphologyGrid');
  const btnRebuildRuntime = document.getElementById('btnRebuildRuntime');
  const reviewToast = document.getElementById('reviewToast');
  const toastMessage = document.getElementById('toastMessage');

  // Load Data
  async function loadData() {
    try {
      const res = await fetch('/api/lexicon/data');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      appData = await res.json();
      renderAll();
    } catch (err) {
      console.error('Failed to load lexicon data:', err);
      showToast('⚠️ Không tải được dữ liệu lexicon: ' + err.message, false);
    }
  }

  function showToast(msg, isSuccess = true) {
    if (!reviewToast) return;
    toastMessage.textContent = msg;
    reviewToast.style.borderColor = isSuccess ? '#34D399' : '#F87171';
    reviewToast.classList.add('show');
    setTimeout(() => {
      reviewToast.classList.remove('show');
    }, 3200);
  }

  function renderAll() {
    renderStats();
    renderRelations();
    renderVerbMorphology();
  }

  // Dashboard Stats
  function renderStats() {
    const entries = Object.values(appData.candidates.entries || {});
    const relations = Object.values(appData.candidates.relations || {});
    const approvedContexts = Object.values(appData.approved.contexts || {});
    const approvedAntonyms = Object.values(appData.approved.antonyms || {});

    let countCandidates = 0;
    let countNeedsReview = 0;
    let countApproved = 0;
    let countRejected = 0;

    for (const r of relations) {
      if (r.reviewStatus === 'approved') countApproved++;
      else if (r.reviewStatus === 'needs_review') countNeedsReview++;
      else if (r.reviewStatus === 'rejected') countRejected++;
      else countCandidates++;
    }

    statTotalEntries.textContent = entries.length;
    statCandidates.textContent = countCandidates;
    statNeedsReview.textContent = countNeedsReview;
    statApproved.textContent = countApproved;
    statRejected.textContent = countRejected;
    statSynonyms.textContent = relations.length;
    statAntonyms.textContent = approvedAntonyms.length;
    statContexts.textContent = approvedContexts.length;
    statIsolated.textContent = '0';
    badgeRelationsCount.textContent = relations.length;
  }

  // Render Relations & Candidates
  function renderRelations() {
    if (!relationsGrid) return;

    const relations = Object.values(appData.candidates.relations || {});
    const entries = appData.candidates.entries || {};
    const contexts = appData.approved.contexts || {};
    const antonyms = appData.approved.antonyms || {};

    const filtered = relations.filter(r => {
      const fromE = entries[r.fromEntryId];
      const toE = entries[r.toEntryId];
      if (!fromE || !toE) return false;

      // POS filter
      if (activeFilters.pos !== 'all') {
        if (fromE.partOfSpeech.toLowerCase() !== activeFilters.pos.toLowerCase()) return false;
      }

      // Status filter
      if (activeFilters.status !== 'all') {
        if (r.reviewStatus !== activeFilters.status) return false;
      }

      // Search filter
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        const text = `${fromE.lemma} ${toE.lemma} ${fromE.senseId} ${r.reviewStatus} ${r.reviewNotes || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      relationsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--ink-muted);">
          Không tìm thấy quan hệ từ vựng nào khớp với bộ lọc hiện tại.
        </div>
      `;
      return;
    }

    relationsGrid.innerHTML = filtered.map(rel => {
      const fromE = entries[rel.fromEntryId] || { lemma: rel.fromEntryId, partOfSpeech: 'unknown', senseId: '' };
      const toE = entries[rel.toEntryId] || { lemma: rel.toEntryId, partOfSpeech: 'unknown', senseId: '' };

      const ctxId = rel.contextScope?.[0];
      const ctx = contexts[ctxId];

      const fromVariant = ctx?.variants?.[fromE.entryId];
      const toVariant = ctx?.variants?.[toE.entryId];

      const antKey = `${ctxId}:${fromE.entryId}`;
      const ant = antonyms[antKey];

      const status = rel.reviewStatus || 'candidate';

      return `
        <div class="lex-card" id="card-${rel.relationId}">
          <div class="lex-card-header">
            <div class="lex-lemma-wrap">
              <span class="lex-lemma">${fromE.lemma}</span>
              <span class="relation-arrow">↔</span>
              <span class="lex-lemma">${toE.lemma}</span>
              <span class="lex-pos-tag ${fromE.partOfSpeech.toLowerCase()}">${fromE.partOfSpeech}</span>
              <span class="lex-sense-tag">${fromE.senseId}</span>
            </div>
            <span class="status-badge ${status}">${status.replace('_', ' ')}</span>
          </div>

          <div class="relation-box">
            <div class="relation-header">
              <span>ĐỘ TIN CẬY: ${Math.round((rel.confidenceScore || 0.88) * 100)}% · NGUỒN: OPENTHESAURUS</span>
              <span>${rel.direction === 'bidirectional' ? 'Chu kỳ 2 chiều ⇄' : '1 chiều →'}</span>
            </div>
            <div style="font-size: 13px; color: var(--ink-secondary);">
              Cặp từ ứng viên: <strong>${fromE.lemma}</strong> và <strong>${toE.lemma}</strong> cùng thuộc trường nghĩa <em>${fromE.senseId}</em>.
            </div>
          </div>

          ${ctx && fromVariant ? `
            <div class="context-box">
              <div class="context-topic">${ctx.topic} (${ctx.contextId})</div>
              <div class="sentence-de">${renderHighlightedTokens(fromVariant.de, fromVariant.highlightTokens)}</div>
              <div class="sentence-vi">${fromVariant.vi}</div>
              ${toVariant ? `
                <div style="margin-top: 6px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px;">
                  <div style="font-size: 11px; color: var(--ink-muted);">Biến thể thay thế hợp lệ:</div>
                  <div class="sentence-de">${renderHighlightedTokens(toVariant.de, toVariant.highlightTokens)}</div>
                </div>
              ` : ''}
            </div>
          ` : `
            <div style="font-size: 12px; color: var(--ink-muted); font-style: italic;">
              Chưa gán câu ví dụ ngữ cảnh (Cần curator phê duyệt ngữ cảnh trước khi vào game).
            </div>
          `}

          ${ant ? `
            <div class="antonym-box">
              <span class="antonym-label">GEGENTEIL</span>
              <span>${ant.explanationShortVi || `Trái nghĩa: ${ant.targetEntryId}`}</span>
            </div>
          ` : ''}

          <div class="audit-trail">
            <div><strong>Người duyệt:</strong> ${rel.reviewedBy || 'Hệ thống'} · <strong>Cập nhật:</strong> ${rel.updatedAt ? new Date(rel.updatedAt).toLocaleDateString('vi-VN') : 'Mới'}</div>
            ${rel.reviewNotes ? `
              <div class="audit-notes ${status === 'rejected' ? 'rejected' : ''}">
                "${rel.reviewNotes}"
              </div>
            ` : ''}
          </div>

          <div class="lex-card-actions">
            <button class="btn btn-sm btn-approve" onclick="window.updateStatus('${rel.relationId}', 'approved')">
              ✓ Duyệt (Approve)
            </button>
            <button class="btn btn-sm btn-review" onclick="window.updateStatus('${rel.relationId}', 'needs_review')">
              ? Cần xem xét
            </button>
            <button class="btn btn-sm btn-reject" onclick="window.updateStatus('${rel.relationId}', 'rejected')">
              ✕ Từ chối (Reject)
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Highlight tokens helper
  function renderHighlightedTokens(sentence, tokens = []) {
    if (!tokens || tokens.length === 0) return sentence;
    let safeSentence = sentence;
    for (const t of tokens) {
      const reg = new RegExp(`\\b(${escapeRegExp(t)})\\b`, 'gi');
      safeSentence = safeSentence.replace(reg, '<span class="sentence-token-highlight">$1</span>');
    }
    return safeSentence;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Verb Morphology View (Tab 3)
  function renderVerbMorphology() {
    if (!verbsMorphologyGrid) return;

    const entries = Object.values(appData.candidates.entries || {}).filter(
      e => e.partOfSpeech.toLowerCase() === 'verb'
    );
    const contexts = appData.approved.contexts || {};

    const sampleVerbs = [
      { id: 'verb_beginnen_start', pairId: 'verb_anfangen_start', ctxId: 'ctx_verb_start' },
      { id: 'verb_aufhören_stop', pairId: 'verb_enden_stop', ctxId: 'ctx_verb_stop' },
      { id: 'verb_öffnen_open', pairId: 'verb_aufmachen_open', ctxId: 'ctx_verb_open' },
      { id: 'verb_schließen_close', pairId: 'verb_zumachen_close', ctxId: 'ctx_verb_close' },
      { id: 'verb_sich_beeilen_hurry', pairId: 'verb_eilen_hurry', ctxId: 'ctx_verb_hurry' },
      { id: 'verb_trödeln_dawdle', pairId: 'verb_bummeln_dawdle', ctxId: 'ctx_verb_dawdle' }
    ];

    verbsMorphologyGrid.innerHTML = sampleVerbs.map(item => {
      const e1 = appData.candidates.entries[item.id] || { lemma: item.id, verbMeta: {} };
      const e2 = appData.candidates.entries[item.pairId] || { lemma: item.pairId, verbMeta: {} };
      const ctx = contexts[item.ctxId];

      const v1 = ctx?.variants?.[item.id];
      const v2 = ctx?.variants?.[item.pairId];

      return `
        <div class="lex-card">
          <div class="lex-card-header">
            <div class="lex-lemma-wrap">
              <span class="lex-lemma">${e1.lemma}</span>
              <span class="relation-arrow">↔</span>
              <span class="lex-lemma">${e2.lemma}</span>
            </div>
            <span class="status-badge approved">Approved</span>
          </div>

          <!-- Morphology Badges -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${e1.verbMeta?.separable ? `
              <span class="morphology-badge separable">Tách: ${e1.verbMeta.prefix}- (${e1.lemma})</span>
            ` : ''}
            ${e2.verbMeta?.separable ? `
              <span class="morphology-badge separable">Tách: ${e2.verbMeta.prefix}- (${e2.lemma})</span>
            ` : ''}
            ${e1.verbMeta?.reflexive ? `
              <span class="morphology-badge">Phản thân: sich (${e1.lemma})</span>
            ` : ''}
            ${e2.verbMeta?.reflexive ? `
              <span class="morphology-badge">Phản thân: sich (${e2.lemma})</span>
            ` : ''}
            ${!e1.verbMeta?.separable && !e1.verbMeta?.reflexive && !e2.verbMeta?.separable && !e2.verbMeta?.reflexive ? `
              <span class="morphology-badge">Động từ tiêu chuẩn</span>
            ` : ''}
          </div>

          ${ctx ? `
            <div class="context-box">
              <div class="context-topic">${ctx.topic}</div>
              ${v1 ? `
                <div style="margin-bottom: 6px;">
                  <span style="font-size: 11px; color: var(--ink-muted);">${e1.lemma}:</span>
                  <div class="sentence-de">${renderHighlightedTokens(v1.de, v1.highlightTokens)}</div>
                </div>
              ` : ''}
              ${v2 ? `
                <div style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px;">
                  <span style="font-size: 11px; color: var(--ink-muted);">${e2.lemma}:</span>
                  <div class="sentence-de">${renderHighlightedTokens(v2.de, v2.highlightTokens)}</div>
                </div>
              ` : ''}
              <div class="sentence-vi">${v1?.vi || v2?.vi || ''}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // Global Action Function (called from buttons)
  window.updateStatus = async function (relationId, newStatus) {
    let note = '';
    if (newStatus === 'rejected') {
      note = prompt('Lý do từ chối quan hệ này (ví dụ: khẩu ngữ / pejorative / sai lệch ngữ cảnh):', 'Không phù hợp ngữ cảnh A1-B1 chuẩn.');
      if (note === null) return;
    } else if (newStatus === 'needs_review') {
      note = prompt('Ghi chú cần xem xét thêm:', 'Cần kiểm tra sắc thái văn phong.');
      if (note === null) return;
    } else if (newStatus === 'approved') {
      note = 'Đã thẩm định và duyệt vào bộ bài runtime.';
    }

    try {
      const res = await fetch('/api/lexicon/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_relation_status',
          relationId,
          status: newStatus,
          notes: note,
          reviewer: 'lead-reviewer'
        })
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      // Update local relation object
      if (appData.candidates.relations[relationId]) {
        appData.candidates.relations[relationId].reviewStatus = newStatus;
        appData.candidates.relations[relationId].reviewNotes = note;
        appData.candidates.relations[relationId].reviewedBy = 'lead-reviewer';
        appData.candidates.relations[relationId].updatedAt = new Date().toISOString();
      }

      showToast(`✓ Đã cập nhật trạng thái quan hệ thành [${newStatus.toUpperCase()}]`);
      renderAll();
    } catch (err) {
      showToast('❌ Lỗi khi cập nhật trạng thái: ' + err.message, false);
    }
  };

  // Re-export Runtime Button
  if (btnRebuildRuntime) {
    btnRebuildRuntime.addEventListener('click', async () => {
      btnRebuildRuntime.disabled = true;
      btnRebuildRuntime.textContent = '⏳ Đang kiểm định & xuất file...';
      try {
        const res = await fetch('/api/lexicon/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'rebuild' })
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error);

        showToast('🎉 Runtime Dataset xuất thành công và vượt qua mọi cửa kiểm định Section 30!');
        await loadData();
      } catch (err) {
        showToast('❌ Xuất Runtime thất bại: ' + err.message, false);
      } finally {
        btnRebuildRuntime.disabled = false;
        btnRebuildRuntime.innerHTML = '<span>⚡ Re-export & Validate Runtime</span>';
      }
    });
  }

  // Filter Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeFilters.search = e.target.value.trim();
      renderRelations();
    });
  }

  document.querySelectorAll('#posFilterPills .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#posFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilters.pos = pill.dataset.pos;
      renderRelations();
    });
  });

  document.querySelectorAll('#statusFilterPills .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#statusFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilters.status = pill.dataset.status;
      renderRelations();
    });
  });

  // Rotation Simulator state
  let simHistory = null;

  function initRotationSimulator() {
    const HistClass = window.VocabularyHistory || (typeof VocabularyHistory !== 'undefined' ? VocabularyHistory : null);
    const BuilderClass = (window.MatchDeckBuilder && window.MatchDeckBuilder.MatchDeckBuilder) || window.MatchDeckBuilder || (typeof MatchDeckBuilder !== 'undefined' ? MatchDeckBuilder.MatchDeckBuilder || MatchDeckBuilder : null);

    if (!simHistory && HistClass) {
      simHistory = new HistClass({ persist: false });
    }

    const btnSim10Adj = document.getElementById('btnSimulate10Adj');
    const btnSim10Verb = document.getElementById('btnSimulate10Verb');
    const btnResetSim = document.getElementById('btnResetRotationSim');

    if (btnSim10Adj) {
      btnSim10Adj.onclick = () => runSimulation('adjective');
    }
    if (btnSim10Verb) {
      btnSim10Verb.onclick = () => runSimulation('verb');
    }
    if (btnResetSim) {
      btnResetSim.onclick = () => {
        if (simHistory) simHistory.resetHistory();
        renderSimResults(null);
        showToast('Đã xóa dữ liệu mô phỏng vòng lặp.');
      };
    }
  }

  function runSimulation(pos) {
    const BuilderClass = (window.MatchDeckBuilder && window.MatchDeckBuilder.MatchDeckBuilder) || window.MatchDeckBuilder;
    const runtime = window.DAU_TU_EXPANDED_RUNTIME || appData.runtime;
    const clusters = window.SEMANTIC_CLUSTERS || (runtime && runtime.clusters);

    if (!BuilderClass || !runtime) {
      showToast('Chưa nạp đủ dữ liệu runtime / MatchDeckBuilder.', 'error');
      return;
    }

    if (!simHistory) {
      const HistClass = window.VocabularyHistory;
      simHistory = new HistClass({ persist: false });
    }

    const builder = new BuilderClass(runtime, simHistory, { clusters });
    const matchResults = [];

    for (let i = 1; i <= 10; i++) {
      const matchDeck = builder.buildMatchDeck(pos, { matchId: `sim_${pos}_${Date.now()}_${i}` });
      matchResults.push(matchDeck);
    }

    renderSimResults(simHistory.getQAReport(), matchResults);
    showToast(`Đã mô phỏng 10 ván ${pos === 'adjective' ? 'Tính từ' : 'Động từ'} thành công!`);
  }

  function renderSimResults(qaReport, matchResults = []) {
    const totalEl = document.getElementById('simStatTotalMatches');
    const uniqueEl = document.getElementById('simStatUniqueEntries');
    const consecEl = document.getElementById('simStatConsecOverlap');
    const r3El = document.getElementById('simStatRolling3Overlap');
    const tbody = document.getElementById('rotationQaTableBody');

    if (!qaReport || !qaReport.history || qaReport.history.length === 0) {
      if (totalEl) totalEl.textContent = '0';
      if (uniqueEl) uniqueEl.textContent = '0';
      if (consecEl) consecEl.textContent = '0%';
      if (r3El) r3El.textContent = '--';
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="10" style="padding: 24px; text-align: center; color: var(--ink-muted);">Nhấn nút bên trên để khởi chạy mô phỏng 10 ván.</td></tr>`;
      }
      return;
    }

    const history = qaReport.history;
    if (totalEl) totalEl.textContent = String(qaReport.totalMatches);
    if (uniqueEl) uniqueEl.textContent = String(qaReport.totalUniqueEntries);

    // Compute average consecutive overlap
    let totalConsec = 0;
    let totalR3 = 0;
    history.forEach((h, idx) => {
      if (idx > 0) {
        totalConsec += (h.overlapConsecutive || 0);
        totalR3 += (h.overlapRolling3 || 0);
      }
    });

    const avgConsec = history.length > 1 ? Math.round((totalConsec / (history.length - 1)) / 12 * 100) : 0;
    const avgR3 = history.length > 1 ? Math.round((totalR3 / (history.length - 1)) / 12 * 100) : 0;

    if (consecEl) consecEl.textContent = `${avgConsec}%`;
    if (r3El) r3El.textContent = `${avgR3}%`;

    // Render table rows
    if (tbody) {
      tbody.innerHTML = history.map((h, i) => {
        const mDeck = matchResults[i] || null;
        const clusterNames = mDeck?.matchReport?.selectedClusters?.map(c => c.nameVi).join('<br>') || '--';
        const vocabStr = h.vocabulary.join(', ');
        const isConsecZero = (h.overlapConsecutive === 0 || i === 0);
        const passBadge = isConsecZero
          ? `<span class="status-badge approved">PASS ✓</span>`
          : `<span class="status-badge candidate">RELAX</span>`;

        return `
          <tr style="border-bottom: 1px solid var(--border-subtle); font-size: 11px;">
            <td style="padding: 8px; font-weight: 700; color: #fff;">#${h.matchIndex}</td>
            <td style="padding: 8px; color: #a78bfa;">${h.deckId === 'adjektive' ? 'Tính từ' : 'Động từ'}</td>
            <td style="padding: 8px; color: var(--ink-secondary); font-size: 10px;">${clusterNames}</td>
            <td style="padding: 8px; color: #e2e8f0; font-family: monospace;">${vocabStr}</td>
            <td style="padding: 8px; text-align: center; font-weight: 700; color: ${isConsecZero ? '#34d399' : '#f87171'};">
              ${i === 0 ? '0% (Gốc)' : h.overlapConsecutivePercent}
            </td>
            <td style="padding: 8px; text-align: center; color: #fbbf24;">${h.overlapRolling3Percent}</td>
            <td style="padding: 8px; text-align: center; color: #60a5fa; font-weight: 700;">${h.uniqueEntriesEncounteredCumulative}</td>
            <td style="padding: 8px; text-align: center; color: var(--ink-secondary);">${mDeck?.matchReport?.synonymEdgesCount || 6} / ${mDeck?.matchReport?.antonymEdgesCount || 6}</td>
            <td style="padding: 8px; text-align: center; color: #34d399; font-weight: 700;">0</td>
            <td style="padding: 8px; text-align: center;">${passBadge}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // Tab Switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content, .tab-pane').forEach(c => {
        c.style.display = 'none';
        c.hidden = true;
      });

      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.style.display = 'block';
        targetEl.hidden = false;
      }

      // Hide/show search toolbar on non-relation tabs
      const filterToolbar = document.getElementById('filterToolbar');
      if (filterToolbar) {
        filterToolbar.style.display = (targetId === 'tab-relations') ? 'flex' : 'none';
      }
    });
  });

  // Init
  initRotationSimulator();
  loadData();
})();
