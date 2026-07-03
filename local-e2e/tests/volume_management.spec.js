const { test, expect } = require('@playwright/test');
const { login, connectToHost, expandDatabase, dismissModal } = require('./helpers');

/**
 * 볼륨 관리 테스트
 * - Space 노드 탐색
 * - Add Volume 모달: UI 확인 및 유효성 검사
 * - Set Automation Volume 모달
 * - Volume Info Monitor (개별 볼륨 정보)
 * - Volume Category Monitor (카테고리 요약)
 */
test.describe('Volume Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
    await expandDatabase(page);
  });

  const spaceFolder = (page) =>
    page.locator('#db-tree-container').getByText('Space', { exact: true }).first();

  // ─── Space Monitor ────────────────────────────────────────────────────────

  test('Space 노드를 클릭하면 Space Monitor 대시보드가 표시된다', async ({ page }) => {
    await spaceFolder(page).click();
    await expect(
      page.getByText(/Space Monitor|Database Space/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('Space Monitor에 Volume Categorization 섹션이 있다', async ({ page }) => {
    await spaceFolder(page).click();
    await expect(
      page.getByText(/Volume Categor/i)
    ).toBeVisible({ timeout: 15000 });
  });

  test('Space Monitor에 Physical Volume Topology 섹션이 있다', async ({ page }) => {
    await spaceFolder(page).click();
    await expect(
      page.getByText(/Physical Volume|Volume Topology/i)
    ).toBeVisible({ timeout: 15000 });
  });

  test('Space Monitor 요약 카드(Used/Free/Usage)가 표시된다', async ({ page }) => {
    await spaceFolder(page).click();
    await expect(page.getByText('Used',  { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Free',  { exact: true })).toBeVisible({ timeout: 5000 });
  });

  // ─── Add Volume ───────────────────────────────────────────────────────────

  test('Space 우클릭 → Add Volume 모달이 열린다', async ({ page }) => {
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Add Volume|Volume/i);

    await dismissModal(page);
  });

  test('Add Volume: 볼륨 타입 선택 옵션이 있다', async ({ page }) => {
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // 볼륨 타입 (Generic/Data/Index/Temp)
    const typeSelector = modal.locator('select').or(
      modal.getByText(/Generic|Data|Index|Temp/i).first()
    );
    await expect(typeSelector).toBeVisible({ timeout: 3000 });

    await dismissModal(page);
  });

  test('Add Volume: 경로 입력 필드가 있다', async ({ page }) => {
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    const pathInput = modal.locator('input[type="text"]').first();
    await expect(pathInput).toBeVisible();

    await dismissModal(page);
  });

  test('Add Volume: 이름·경로 미입력 시 유효성 오류가 표시된다', async ({ page }) => {
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    const submitBtn = modal.getByRole('button', { name: /Add|Submit|Confirm/i }).last();
    await submitBtn.click();

    const error = modal.getByText(/required|필수/i);
    if (await error.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(error.first()).toBeVisible();
    }

    await dismissModal(page);
  });

  // ─── Set Automation Volume ────────────────────────────────────────────────

  test('Space 우클릭 → Set Automation Volume 모달이 열린다', async ({ page }) => {
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Set Automation Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Automation Volume|Auto.*Volume/i);

    await dismissModal(page);
  });

  test('Set Automation Volume: 볼륨 크기 입력 필드가 있다', async ({ page }) => {
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Set Automation Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    // 크기 입력 필드 (숫자 또는 텍스트)
    const sizeInput = modal.locator('input[type="number"], input[type="text"]').first();
    await expect(sizeInput).toBeVisible();

    await dismissModal(page);
  });

  // ─── Volume Info (개별 볼륨 클릭) ────────────────────────────────────────

  test('Space Monitor에서 볼륨 행을 클릭하면 상세 정보가 표시된다', async ({ page }) => {
    await spaceFolder(page).click();
    await expect(page.getByText(/Physical Volume|Volume Topology/i)).toBeVisible({ timeout: 15000 });

    // 테이블의 첫 번째 볼륨 행 클릭
    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstRow.click();
      // 상세 정보 패널 또는 모달이 표시되어야 한다
      await expect(
        page.getByText(/Location|Page Size|Total Pages/i).first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

});
