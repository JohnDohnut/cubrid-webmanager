const { test, expect } = require('@playwright/test');
const { login, connectToHost, expandDatabase, dismissModal } = require('./helpers');

/**
 * 볼륨 관리 테스트
 * - Space Monitor 실제 데이터 로드
 * - Add Volume: 실제 볼륨 생성 실행 (Generic 타입, /tmp 경로)
 *   ※ CUBRID는 볼륨 삭제를 지원하지 않으므로 테스트용 /tmp 경로 사용
 * - Set Automation Volume: 실제 설정 저장
 * - Volume 행 클릭 → 상세 정보 실제 로드
 */
test.describe('Volume Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
    await expandDatabase(page);
  });

  const spaceFolder = (page) =>
    page.locator('#db-tree-container').getByText('Space', { exact: true }).first();

  // ─── Space Monitor: 실제 데이터 로드 ────────────────────────────────────

  test('Space 노드를 클릭하면 Space Monitor 대시보드가 표시된다', async ({ page }) => {
    await spaceFolder(page).click();
    await expect(
      page.getByText(/Space Monitor|Database Space/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('Space Monitor에 Volume Categorization 섹션과 실제 데이터 행이 있다', async ({ page }) => {
    await spaceFolder(page).click();
    await expect(page.getByText(/Volume Categor/i)).toBeVisible({ timeout: 15000 });

    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Space Monitor에 Physical Volume Topology 섹션이 있다', async ({ page }) => {
    await spaceFolder(page).click();
    await expect(
      page.getByText(/Physical Volume|Volume Topology/i)
    ).toBeVisible({ timeout: 15000 });
  });

  test('Space Monitor 요약 카드(Used·Free)에 실제 수치가 표시된다', async ({ page }) => {
    await spaceFolder(page).click();
    await expect(page.getByText('Used', { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Free', { exact: true })).toBeVisible({ timeout: 5000 });

    // 실제 숫자 값이 있어야 함
    await expect(
      page.getByText(/\d+\s*(MB|GB|KB|Pages)/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  // ─── Add Volume: 실제 볼륨 생성 ──────────────────────────────────────────

  test('Add Volume: Generic 타입으로 실제 볼륨을 생성한다', async ({ page }) => {
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Add Volume/i);

    // 볼륨 타입 선택 (Generic)
    const typeSelect = modal.locator('select').first();
    if (await typeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await typeSelect.selectOption({ label: /Generic/i });
    }

    // 경로 입력 (/tmp — CUBRID 볼륨은 삭제 불가이므로 /tmp 사용)
    const pathInput = modal.locator('input[type="text"]').first();
    await expect(pathInput).toBeVisible();
    await pathInput.fill('/tmp/cubrid_e2e_vol');

    // 볼륨 크기 입력 (있는 경우)
    const sizeInput = modal.locator('input[type="number"]').first();
    if (await sizeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sizeInput.fill('20');
    }

    const addBtn = modal.getByRole('button', { name: /Add|Confirm|OK/i }).last();
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    // 성공 또는 백그라운드 잡 확인
    await expect(
      page.getByText(/success|complete|added/i)
        .or(page.locator('#sidebar-background-jobs'))
    ).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  test('Add Volume: 볼륨 타입 선택 옵션이 있다', async ({ page }) => {
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    const typeSelector = modal.locator('select').first()
      .or(modal.getByText(/Generic|Data|Index|Temp/i).first());
    await expect(typeSelector).toBeVisible({ timeout: 3000 });

    await dismissModal(page);
  });

  test('Add Volume: 경로 미입력 시 유효성 오류가 표시된다', async ({ page }) => {
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Add Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();

    const addBtn = modal.getByRole('button', { name: /Add|Confirm|OK/i }).last();
    await addBtn.click();

    // 빈 상태에서 제출하면 오류 또는 버튼 비활성화
    const hasError = await modal.getByText(/required|필수/i).isVisible({ timeout: 2000 }).catch(() => false);
    const isDisabled = await addBtn.isDisabled().catch(() => false);
    expect(hasError || isDisabled).toBe(true);

    await dismissModal(page);
  });

  // ─── Set Automation Volume: 실제 설정 저장 ──────────────────────────────

  test('Set Automation Volume: 실제 크기를 설정하고 저장한다', async ({ page }) => {
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Set Automation Volume' }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Automation Volume|Auto.*Volume/i);

    // 크기 입력 필드에 값 설정
    const sizeInput = modal.locator('input[type="number"], input[type="text"]').first();
    await expect(sizeInput).toBeVisible();
    const currentVal = await sizeInput.inputValue();
    await sizeInput.fill('100');

    const saveBtn = modal.getByRole('button', { name: /Save|Set|Confirm|OK/i }).last();
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    // 저장 성공 확인
    await expect(
      page.getByText(/success|saved|complete/i)
        .or(page.locator('[class*="toast"]').first())
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});

    // 원복: 이전 값으로 되돌리기
    await spaceFolder(page).click({ button: 'right' });
    await page.getByRole('button', { name: 'Set Automation Volume' }).click();
    const modalAgain = page.locator('div[role="dialog"]');
    await expect(modalAgain).toBeVisible();
    const sizeInputAgain = modalAgain.locator('input[type="number"], input[type="text"]').first();
    await sizeInputAgain.fill(currentVal || '0');
    await modalAgain.getByRole('button', { name: /Save|Set|Confirm|OK/i }).last().click();
    await page.getByRole('button', { name: /Close|OK|Dismiss/i }).first().click().catch(() => {});
  });

  // ─── Volume 행 클릭 → 실제 상세 정보 로드 ───────────────────────────────

  test('Space Monitor에서 볼륨 행을 클릭하면 실제 상세 정보가 로드된다', async ({ page }) => {
    await spaceFolder(page).click();
    await expect(
      page.getByText(/Physical Volume|Volume Topology/i)
    ).toBeVisible({ timeout: 15000 });

    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 5000 });
    await firstRow.click();

    // 상세 정보에 실제 데이터가 있어야 함
    await expect(
      page.getByText(/Location|Page Size|Total Pages|Free Pages|Purpose/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

});
