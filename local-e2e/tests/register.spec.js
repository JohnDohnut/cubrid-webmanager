const { test, expect } = require('@playwright/test');

/**
 * 계정 등록 테스트
 */
test.describe('Account Registration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Create Account/i }).click();
    await expect(page).toHaveURL(/register/);
  });

  test('빈 폼 제출 시 필수 항목 오류가 표시된다', async ({ page }) => {
    await page.getByRole('button', { name: /Create Account/i }).click();
    await expect(page.getByText(/Username is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

  test('사용자명이 2자이면 최소 길이 오류를 표시한다', async ({ page }) => {
    await page.getByPlaceholder(/unique username/i).fill('ab');
    await page.getByPlaceholder(/strong password/i).fill('123456');
    await page.getByPlaceholder(/Repeat your password/i).fill('123456');
    await page.getByRole('button', { name: /Create Account/i }).click();
    await expect(page.getByText(/At least 3 characters/i)).toBeVisible();
  });

  test('비밀번호가 5자 이하이면 최소 길이 오류를 표시한다', async ({ page }) => {
    await page.getByPlaceholder(/unique username/i).fill('validuser');
    await page.getByPlaceholder(/strong password/i).fill('123');
    await page.getByPlaceholder(/Repeat your password/i).fill('123');
    await page.getByRole('button', { name: /Create Account/i }).click();
    await expect(page.getByText(/At least 6 characters/i)).toBeVisible();
  });

  test('비밀번호가 일치하지 않으면 오류가 표시된다', async ({ page }) => {
    await page.getByPlaceholder(/unique username/i).fill('testuser');
    await page.getByPlaceholder(/strong password/i).fill('Password123!');
    await page.getByPlaceholder(/Repeat your password/i).fill('Password456!');
    await page.getByRole('button', { name: /Create Account/i }).click();
    await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
  });

  test('강한 비밀번호 입력 시 강도 표시기가 Good 또는 Strong을 표시한다', async ({ page }) => {
    await page.getByPlaceholder(/strong password/i).fill('Password123!@#');
    const strengthLabel = page.locator('p').filter({ hasText: /^(Good|Strong)$/i });
    await expect(strengthLabel).toBeVisible();
  });

  test('신규 계정 등록 성공 후 로그인 페이지로 이동하고 실제 로그인이 된다', async ({ page }) => {
    const uid  = Date.now().toString().slice(-6);
    const user = `e2e_user_${uid}`;
    const pass = 'Password123!';

    await page.getByPlaceholder(/unique username/i).fill(user);
    await page.getByPlaceholder(/strong password/i).fill(pass);
    await page.getByPlaceholder(/Repeat your password/i).fill(pass);
    await page.getByRole('button', { name: /Create Account/i }).click();

    await expect(page).toHaveURL(/login/, { timeout: 10000 });

    await page.getByPlaceholder(/Username/i).fill(user);
    await page.getByPlaceholder(/••••••••/).fill(pass);
    await page.getByRole('button', { name: /Authorize Access/i }).click();
    await expect(page.getByTitle(/Logout/i)).toBeVisible({ timeout: 10000 });
  });

  test('이미 존재하는 사용자명으로 등록하면 오류가 표시된다', async ({ page }) => {
    await page.getByPlaceholder(/unique username/i).fill(process.env.E2E_USERNAME);
    await page.getByPlaceholder(/strong password/i).fill('Password123!');
    await page.getByPlaceholder(/Repeat your password/i).fill('Password123!');
    await page.getByRole('button', { name: /Create Account/i }).click();
    await expect(page.getByText(/failed|already exists|taken/i).first()).toBeVisible({ timeout: 5000 });
  });

});
