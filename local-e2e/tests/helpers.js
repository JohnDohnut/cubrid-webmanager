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
  await page.getByPlaceholder(/Enter username/i).fill(process.env.E2E_USERNAME);
  await page.getByPlaceholder(/••••••••/).fill(process.env.E2E_PASSWORD);
  await page.getByRole('button', { name: /Authorize Access/i }).click();
  await expect(page).not.toHaveURL(/login/, { timeout: 10000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 호스트 연결

/**
 * 첫 번째(또는 E2E_HOST 이름에 해당하는) 호스트를 클릭하고
 * DB 트리가 표시될 때까지 기다립니다.
 */
async function connectToHost(page) {
  let hostItem;
  if (E2E_HOST) {
    hostItem = page.locator('#host-section').getByText(E2E_HOST).first();
  } else {
    hostItem = page.locator('#host-section div[title*=":"]').first();
  }
  await hostItem.click();
  await expect(page.locator('#db-tree-container')).toBeVisible({ timeout: 10000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// DB 트리 조작

/**
 * DB 트리에서 지정한 데이터베이스 노드를 펼칩니다.
 * 이미 펼쳐져 있으면 아무 것도 하지 않습니다.
 * @returns {Locator} 데이터베이스 노드 locator
 */
async function expandDatabase(page, dbName = E2E_DB) {
  const dbNode = page.locator('#db-tree-container')
    .locator('div')
    .filter({ hasText: new RegExp(`^${dbName}$`) })
    .first();
  await expect(dbNode).toBeVisible({ timeout: 10000 });
  const chevron = dbNode.locator('span.material-symbols-outlined:has-text("chevron_right")');
  if (await chevron.isVisible()) await chevron.click();
  return dbNode;
}

/**
 * 데이터베이스 노드를 우클릭해서 컨텍스트 메뉴를 엽니다.
 * @returns {Locator} 데이터베이스 노드 locator
 */
async function openDbContextMenu(page, dbName = E2E_DB) {
  const dbNode = page.locator('#db-tree-container')
    .locator('div')
    .filter({ hasText: new RegExp(`^${dbName}$`) })
    .first();
  await expect(dbNode).toBeVisible({ timeout: 10000 });
  await dbNode.click({ button: 'right' });
  return dbNode;
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

module.exports = {
  E2E_DB,
  login,
  connectToHost,
  expandDatabase,
  openDbContextMenu,
  dismissModal,
};
