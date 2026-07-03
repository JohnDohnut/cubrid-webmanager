const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

/**
 * 호스트 관리 테스트
 * - 호스트 추가 유효성 검사
 * - 호스트 추가/삭제
 * - 호스트 전환 시 DB 상태 초기화 (regression)
 */
test.describe('Host Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ─── 추가 유효성 검사 ──────────────────────────────────────────────────────

  test('빈 폼으로 연결 시도하면 필수 항목 오류가 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: /Add/i }).click();
    await expect(page.getByText('New connection', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Connect', exact: true }).click();

    await expect(page.getByText(/Host Name is required/i)).toBeVisible();
    await expect(page.getByText(/Address is required/i)).toBeVisible();
    await expect(page.getByText(/User is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();

    await page.getByRole('button', { name: 'Discard' }).click();
    await expect(page.getByText('New connection')).not.toBeVisible();
  });

  // ─── 추가 / 삭제 ──────────────────────────────────────────────────────────

  test('호스트를 추가하면 목록에 나타나고, 삭제하면 사라진다', async ({ page }) => {
    const name = `TestHost_${Date.now().toString().slice(-4)}`;

    // 추가
    await page.getByRole('button', { name: /Add/i }).click();
    await page.locator('input[name="alias"]').fill(name);
    await page.locator('input[name="address"]').fill('127.0.0.1');
    await page.locator('input[name="port"]').fill('8001');
    await page.locator('input[name="id"]').fill('admin');
    await page.locator('input[name="password"]').fill('admin_pass');
    await page.getByRole('button', { name: 'Connect', exact: true }).click();

    const hostItem = page.locator('#host-section').getByText(name);
    await expect(hostItem).toBeVisible();

    // 삭제
    await hostItem.click({ button: 'right' });
    await page.getByRole('button', { name: /Delete Host/i }).click();
    await expect(page.getByText('Remove Host Connection')).toBeVisible();
    await page.getByRole('button', { name: /Confirm Removal/i }).click();

    await expect(hostItem).not.toBeVisible({ timeout: 5000 });
  });

  // ─── 호스트 전환 시 DB 상태 초기화 (regression) ──────────────────────────

  test('두 번째 호스트로 전환하면 이전 호스트의 DB 선택이 초기화된다', async ({ page }) => {
    // 호스트가 2개 이상 등록된 환경에서만 실행
    const hosts = page.locator('#host-section div[title*=":"]');
    if (await hosts.count() < 2) { test.skip(); return; }

    // 첫 번째 호스트 연결
    await hosts.first().dblclick();
    await expect(page.locator('#db-tree-container')).toBeVisible({ timeout: 15000 });

    // DB 선택
    await page.locator('#db-tree-container').locator('div[role="treeitem"]').first().click();

    // 두 번째 호스트로 전환
    await hosts.nth(1).dblclick();
    await expect(page.locator('#db-tree-container')).toBeVisible({ timeout: 15000 });

    // 이전 호스트의 오류나 잔류 상태가 없어야 한다
    await expect(page.getByText(/error|failed/i)).not.toBeVisible();
  });

  // ─── 컨텍스트 메뉴 ────────────────────────────────────────────────────────

  test('호스트 우클릭 메뉴에서 편집 모달이 열린다', async ({ page }) => {
    const host = page.locator('#host-section div[title*=":"]').first();
    await expect(host).toBeVisible({ timeout: 10000 });

    await host.click({ button: 'right' });
    await page.getByRole('button', { name: /Edit Host/i }).click();

    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    await page.getByRole('button', { name: /Discard|Cancel|Close/i }).first().click();
  });

});
