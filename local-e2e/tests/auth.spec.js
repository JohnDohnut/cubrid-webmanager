const { test, expect } = require('@playwright/test');

/**
 * 인증 흐름 테스트
 * - 로그인 성공/실패
 * - 세션 유지 (새로고침 후에도 로그인 상태)
 * - 로그아웃
 */
test.describe('Authentication', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ─── 로그인 ───────────────────────────────────────────────────────────────

  test('잘못된 자격증명은 오류 메시지를 표시한다', async ({ page }) => {
    await page.getByPlaceholder(/Username/i).fill('wrong_user');
    await page.getByPlaceholder(/••••••••/).fill('wrong_pass');
    await page.getByRole('button', { name: /Login/i }).click();

    const error = page.getByText(/Authentication Failed|Login failed|Invalid|incorrect/i);
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test('올바른 자격증명으로 로그인하면 대시보드로 이동한다', async ({ page }) => {
    await page.getByPlaceholder(/Username/i).fill(process.env.E2E_USERNAME);
    await page.getByPlaceholder(/••••••••/).fill(process.env.E2E_PASSWORD);
    await page.getByRole('button', { name: /Login/i }).click();

    await expect(page).not.toHaveURL(/login/, { timeout: 10000 });
    await expect(page.getByTitle(/Logout/i)).toBeVisible();
  });

  test('빈 폼으로 제출하면 유효성 오류가 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: /Login/i }).click();
    // 필드 오류 또는 서버 오류 중 하나
    const feedback = page.getByText(/required|필수|Enter/i).first()
      .or(page.getByText(/Login failed/i));
    await expect(feedback).toBeVisible({ timeout: 5000 });
  });

  // ─── 세션 ─────────────────────────────────────────────────────────────────

  test('페이지 새로고침 후에도 로그인 상태가 유지된다', async ({ page }) => {
    await page.getByPlaceholder(/Username/i).fill(process.env.E2E_USERNAME);
    await page.getByPlaceholder(/••••••••/).fill(process.env.E2E_PASSWORD);
    await page.getByRole('button', { name: /Login/i }).click();
    await expect(page.getByTitle(/Logout/i)).toBeVisible({ timeout: 10000 });

    await page.reload();

    await expect(page.getByTitle(/Logout/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/Username/i)).not.toBeVisible();
  });

  // ─── 로그아웃 ─────────────────────────────────────────────────────────────

  test('로그아웃하면 로그인 페이지로 이동한다', async ({ page }) => {
    await page.getByPlaceholder(/Username/i).fill(process.env.E2E_USERNAME);
    await page.getByPlaceholder(/••••••••/).fill(process.env.E2E_PASSWORD);
    await page.getByRole('button', { name: /Login/i }).click();
    await expect(page.getByTitle(/Logout/i)).toBeVisible({ timeout: 10000 });

    await page.getByTitle(/Logout/i).click();

    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible({ timeout: 5000 });
  });

});
