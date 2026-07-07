/**
 * E2E 공통 헬퍼 모음
 *
 * 모든 spec 파일에서 require('./helpers')로 가져다 씁니다.
 * 로그인·호스트 선택·DB 트리 조작처럼 반복되는 코드를 한 곳에서 관리합니다.
 */

const { expect } = require('@playwright/test');

/** .env에서 읽어오는 기본값들 */
const E2E_DB   = process.env.E2E_DB   || 'demodb';
const E2E_HOST = process.env.E2E_HOST || null; // null이면 첫 번째 호스트 사용

// ─────────────────────────────────────────────────────────────────────────────
// 인증

/** 로그인 후 대시보드가 로드될 때까지 기다립니다. */
async function login(page) {
  await page.goto('/');
  await page.getByPlaceholder(/Username/i).fill(process.env.E2E_USERNAME);
  await page.getByPlaceholder(/••••••••/).fill(process.env.E2E_PASSWORD);
  await page.getByRole('button', { name: /Authorize Access/i }).click();
  await expect(page).not.toHaveURL(/login/, { timeout: 10000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 호스트 연결

/**
 * 호스트 그룹을 모두 펼친 뒤, E2E_HOST_ADDRESS:E2E_HOST_PORT 에 해당하는
 * 호스트를 클릭하고 DB 트리가 표시될 때까지 기다립니다.
 *
 * 호스트 그룹은 기본적으로 collapsed (<details> 요소)이므로
 * 클릭 전에 summary를 눌러 펼쳐야 합니다.
 */
async function connectToHost(page) {
  const address   = process.env.E2E_HOST_ADDRESS || 'localhost';
  const port      = process.env.E2E_HOST_PORT    || '8001';
  const hostTitle = `${address}:${port}`;

  await expect(page.locator('#host-section')).toBeVisible({ timeout: 10000 });

  // HostGroupTree가 렌더링될 때까지 기다린다 (API 응답 후 <details> 요소 DOM 추가)
  await page.locator('#host-section details').first().waitFor({ state: 'attached', timeout: 15000 });

  // 접혀 있는 호스트 그룹(<details>)을 모두 펼친다
  // summary 클릭 → handleGroupSelect → expandedGroups.add(groupId) → open=true
  const groups = page.locator('#host-section details');
  const groupCount = await groups.count();
  for (let i = 0; i < groupCount; i++) {
    const isOpen = await groups.nth(i).evaluate(el => el.open);
    if (!isOpen) {
      await groups.nth(i).locator('summary').first().click();
      await page.waitForTimeout(400);
    }
  }

  // 대상 호스트 클릭
  const hostItem = page.locator(`#host-section [title="${hostTitle}"]`);
  await expect(hostItem).toBeVisible({ timeout: 8000 });
  await hostItem.click();

  // DB 트리 컨테이너가 나타날 때까지 기다린다 (selectedHostUid 설정 완료)
  await expect(page.locator('#db-tree-container')).toBeVisible({ timeout: 10000 });

  // 1) CMS 세션 확립 대기 — opacity-100 클래스가 붙으면 authorized 상태
  await expect(page.locator('#db-tree-container')).toHaveClass(/opacity-100/, { timeout: 30000 });

  // 2) DB 목록 렌더링 대기 — CMS 인증 완료 후 DB list API가 별도로 호출되어
  //    <details id="dbname"> 노드가 DOM에 추가될 때까지 기다린다.
  //    이 단계를 생략하면 바로 details#demodb를 조회할 때 "not found" 오류가 난다.
  await page.locator('#db-tree-container details').first().waitFor({ state: 'visible', timeout: 15000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// DB 트리 조작

/**
 * DB 트리에서 지정한 데이터베이스 노드를 펼칩니다.
 * 이미 펼쳐져 있으면 아무 것도 하지 않습니다.
 *
 * DatabaseTree의 각 DB는 TreeNode → <details id="{dbName}"> 로 렌더링됩니다.
 * @returns {Locator} DB <details> 요소 locator
 */
async function expandDatabase(page, dbName = E2E_DB) {
  const dbDetails = page.locator(`#db-tree-container details#${dbName}`);
  const dbSummary = dbDetails.locator('> summary');
  await expect(dbSummary).toBeVisible({ timeout: 15000 });
  const isOpen = await dbDetails.evaluate(el => el.open);
  if (!isOpen) {
    await dbSummary.click();
    await page.waitForTimeout(300);
  }
  return dbDetails;
}

/**
 * 데이터베이스 노드를 우클릭해서 컨텍스트 메뉴를 엽니다.
 *
 * DatabaseTree의 각 DB는 TreeNode → <details id="{dbName}"> 로 렌더링됩니다.
 * @returns {Locator} DB <summary> 요소 locator
 */
async function openDbContextMenu(page, dbName = E2E_DB) {
  const dbSummary = page.locator(`#db-tree-container details#${dbName} > summary`);
  await expect(dbSummary).toBeVisible({ timeout: 15000 });
  // Left-click first to dispatch setSelectedDatabase to Redux
  // (right-click alone does not call onSelect, so selectedDatabase stays null)
  await dbSummary.click();
  await page.waitForTimeout(150);
  await dbSummary.click({ button: 'right' });
  return dbSummary;
}

/**
 * DB 트리에서 Job automation 폴더를 펼칩니다.
 * expandDatabase(page) 호출 후에 사용하세요.
 * Backup Plan / Query Plan 노드에 접근하려면 이 함수가 필요합니다.
 */
async function expandJobAutomation(page, dbName = E2E_DB) {
  // Job automation 폴더는 demodb 내부에 있으며 id="Job automation" 으로 렌더링됩니다
  const jaDetails = page.locator(`#db-tree-container details#${dbName} [id="Job automation"]`);
  const jaSummary = jaDetails.locator('> summary');
  await expect(jaSummary).toBeVisible({ timeout: 10000 });
  const isOpen = await jaDetails.evaluate(el => el.open).catch(() => false);
  if (!isOpen) {
    await jaSummary.click();
    await page.waitForTimeout(300);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 모달 유틸리티

/**
 * 열려 있는 dialog를 Cancel/Discard/Close 버튼으로 닫습니다.
 */
async function dismissModal(page) {
  const modal = page.locator('div[role="dialog"]');
  const btn = modal.getByRole('button', { name: /Discard|Cancel|Close/i }).first();
  await btn.click();
  await expect(modal).not.toBeVisible({ timeout: 5000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// DB 시작/중지 (background job 아님 — RefreshingOverlay로 진행 표시)

/**
 * 데이터베이스가 실행 중이면 중지합니다. 이미 중지된 경우 아무 것도 하지 않습니다.
 * Stop Database uses a sidebar RefreshingOverlay (not a background job).
 */
async function stopDatabase(page, dbName = E2E_DB) {
  const dbSummary = page.locator(`#db-tree-container details#${dbName} > summary`);
  await expect(dbSummary).toBeVisible({ timeout: 15000 });
  await dbSummary.click();
  await page.waitForTimeout(150);
  await dbSummary.click({ button: 'right' });
  const stopBtn = page.getByRole('button', { name: /Stop Database/i });
  if (await stopBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await stopBtn.click();
    await page.getByText(/Stopping database/i).waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    await page.getByText(/Stopping database/i).waitFor({ state: 'hidden', timeout: 30000 });
    await page.waitForTimeout(300);
  } else {
    await page.keyboard.press('Escape');
  }
}

/**
 * 데이터베이스가 중지되어 있으면 시작합니다. 이미 실행 중이면 아무 것도 하지 않습니다.
 */
async function startDatabase(page, dbName = E2E_DB) {
  const dbSummary = page.locator(`#db-tree-container details#${dbName} > summary`);
  await expect(dbSummary).toBeVisible({ timeout: 15000 });
  await dbSummary.click();
  await page.waitForTimeout(150);
  await dbSummary.click({ button: 'right' });
  const startBtn = page.getByRole('button', { name: /Start Database/i });
  if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await startBtn.click();
    await page.getByText(/Starting database/i).waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    await page.getByText(/Starting database/i).waitFor({ state: 'hidden', timeout: 30000 });
    await page.waitForTimeout(300);
  } else {
    await page.keyboard.press('Escape');
  }
}

/**
 * 호스트 섹션의 접혀있는 그룹(<details>)을 모두 펼칩니다.
 * connectToHost 없이 호스트 항목에 직접 접근할 때 사용합니다.
 */
async function expandHostGroups(page) {
  await expect(page.locator('#host-section')).toBeVisible({ timeout: 10000 });
  await page.locator('#host-section details').first()
    .waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  const groups = page.locator('#host-section details');
  const groupCount = await groups.count();
  for (let i = 0; i < groupCount; i++) {
    const isOpen = await groups.nth(i).evaluate(el => el.open).catch(() => true);
    if (!isOpen) {
      await groups.nth(i).locator('summary').first().click();
      await page.waitForTimeout(400);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  E2E_DB,
  login,
  connectToHost,
  expandHostGroups,
  expandDatabase,
  expandJobAutomation,
  openDbContextMenu,
  dismissModal,
  stopDatabase,
  startDatabase,
};
