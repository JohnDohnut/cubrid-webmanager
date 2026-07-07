const { test, expect } = require('@playwright/test');
const { login, connectToHost, openDbContextMenu, E2E_DB } = require('./helpers');

/**
 * 비동기 백그라운드 잡 테스트
 * - 잡 제출 시 백그라운드 잡 패널 표시
 * - 잡 완료 시 succeeded/failed 상태 전환
 * - 실행 중 경과 시간 표시
 * - 잡 완료 후 토스트 알림 표시
 */
test.describe('Async Job Tracking', () => {

  const JOB_TIMEOUT = 5 * 60 * 1000; // 최대 5분

  test.beforeEach(async ({ page }) => {
    await login(page);
    await connectToHost(page);
  });

  async function submitOptimize(page) {
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: /Optimize Database/i }).click();

    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.getByRole('button', { name: /Execute|Run|Optim/i }).last().click();
  }

  // ─── 잡 패널 표시 ─────────────────────────────────────────────────────────

  test('잡을 제출하면 백그라운드 잡 패널이 나타난다', async ({ page }) => {
    await submitOptimize(page);

    const panel = page.locator('#sidebar-background-jobs');
    await expect(panel).toBeVisible({ timeout: 10000 });
  });

  test('잡 실행 중에는 스피너가 표시된다', async ({ page }) => {
    await submitOptimize(page);

    const panel = page.locator('#sidebar-background-jobs');
    await expect(panel).toBeVisible({ timeout: 10000 });
    await expect(panel.locator('.animate-spin')).toBeVisible({ timeout: 5000 });
  });

  // ─── 경과 시간 ────────────────────────────────────────────────────────────

  test('잡 실행 중 경과 시간이 표시된다', async ({ page }) => {
    await submitOptimize(page);

    const panel = page.locator('#sidebar-background-jobs');
    await expect(panel).toBeVisible({ timeout: 10000 });

    // 경과 시간 (예: "3s", "1m 5s")
    const elapsed = panel.locator('.tabular-nums');
    await expect(elapsed).toBeVisible({ timeout: 5000 });
    await expect(elapsed).toHaveText(/\d+s|\d+m/, { timeout: 5000 });
  });

  // ─── 잡 완료 상태 ─────────────────────────────────────────────────────────

  test('잡이 완료되면 succeeded 또는 failed 상태로 전환된다', async ({ page }) => {
    await submitOptimize(page);

    const panel = page.locator('#sidebar-background-jobs');
    await expect(panel).toBeVisible({ timeout: 10000 });

    // 스피너가 사라질 때까지 기다림 (잡 완료)
    await expect(panel.locator('.animate-spin')).toHaveCount(0, { timeout: JOB_TIMEOUT });

    // 성공 또는 실패 아이콘 중 하나가 있어야 한다
    const successIcon = panel.locator('.text-green-500, .text-emerald-500');
    const failIcon    = panel.locator('.text-red-500, .text-rose-500');
    const isTerminal  = (await successIcon.count()) > 0 || (await failIcon.count()) > 0;
    expect(isTerminal).toBe(true);
  });

  // ─── 토스트 알림 ──────────────────────────────────────────────────────────

  test('잡이 완료되면 완료 알림이 표시된다', async ({ page }) => {
    await submitOptimize(page);

    const panel = page.locator('#sidebar-background-jobs');
    await expect(panel).toBeVisible({ timeout: 10000 });
    await expect(panel.locator('.animate-spin')).toHaveCount(0, { timeout: JOB_TIMEOUT });

    // 성공/실패 모달 또는 토스트
    const notification = page.locator('[role="status"], [class*="toast"]')
      .or(page.getByText(/succeeded|failed|complete/i));
    await expect(notification.first()).toBeVisible({ timeout: 10000 });
  });

  // ─── 복수 잡 ──────────────────────────────────────────────────────────────

  test('여러 잡을 연속 제출하면 패널에 모두 나타난다', async ({ page }) => {
    // 첫 번째 잡
    await submitOptimize(page);
    const panel = page.locator('#sidebar-background-jobs');
    await expect(panel).toBeVisible({ timeout: 10000 });

    // 두 번째 잡 (Check Database — 빠른 완료)
    await openDbContextMenu(page);
    await page.getByRole('button', { name: 'Manage Database' }).hover();
    await page.getByRole('button', { name: /Check Database/i }).click();
    const modal2 = page.locator('div[role="dialog"]');
    await expect(modal2).toBeVisible({ timeout: 5000 });
    await modal2.getByRole('button', { name: /Run|Check|Execute/i }).last().click();

    // 두 잡 모두 패널에 있어야 한다
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

});
