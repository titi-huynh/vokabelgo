const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Lexicon Pipeline v0.1 Dev Review & Game Runtime Screenshots', () => {
  const artifactDir = path.join(__dirname, '../test-results/captures');

  test('Capture 01 - 07: Lexicon Review Workbench', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 860 });
    await page.goto('/preview/dau-tu-lexicon-review');

    // Wait for data load
    await expect(page.locator('#statTotalEntries')).not.toHaveText('--');
    await page.waitForTimeout(600);

    // 01. LexiconReview_Candidates (Dashboard + Candidates list)
    await page.locator('#statusFilterPills button[data-status="candidate"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, '01_LexiconReview_Candidates.png') });

    // 02. AdjectiveCandidate (Focus on an adjective candidate)
    await page.locator('#posFilterPills button[data-pos="adjective"]').click();
    await page.locator('#searchInput').fill('wuchtig');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, '02_AdjectiveCandidate.png') });

    // 03. VerbCandidate (Verb morphology tab: separable verbs & reflexives)
    await page.locator('.tab-btn[data-tab="tab-morphology"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, '03_VerbCandidate.png') });

    // 04. PolysemySchwer (Polysemy tab: schwer difficult vs heavy)
    await page.locator('.tab-btn[data-tab="tab-polysemy"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, '04_PolysemySchwer.png') });

    // 05. ApprovedRelation (Approved relations view with context & audit trail)
    await page.locator('.tab-btn[data-tab="tab-relations"]').click();
    await page.locator('#searchInput').fill('');
    await page.locator('#posFilterPills button[data-pos="all"]').click();
    await page.locator('#statusFilterPills button[data-status="approved"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, '05_ApprovedRelation.png') });

    // 06. RejectedRelation (Rejected candidate relation with review notes)
    await page.locator('#statusFilterPills button[data-status="rejected"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, '06_RejectedRelation.png') });

    // 07. DeckBuilderSummary (Deck builder tab with graph connectivity audit)
    await page.locator('.tab-btn[data-tab="tab-deckbuilder"]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifactDir, '07_DeckBuilderSummary.png') });
  });

  test('Capture 08: Game Using Expanded Lexicon Deck', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 860 });
    await page.goto('/dau-tu.html?qa=1');

    // Select Expanded Lexicon Deck
    await page.locator('#deck-lexicon-expanded').click();
    await page.locator('#mode-practice').click();
    await page.waitForTimeout(300);

    // Click start game
    await page.locator('#btn-start').click();
    await expect(page.locator('#game')).toBeVisible();
    await page.waitForTimeout(600);

    // 08. GameUsingExpandedDeck
    await page.screenshot({ path: path.join(artifactDir, '08_GameUsingExpandedDeck.png') });
  });
});
