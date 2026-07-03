const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

/**
 * UI 브랜딩·디자인 테스트
 * - 로그인 페이지 로고·텍스트 확인
 * - Dark/Light 모드 전환
 * - 사이드바 디자인 토큰 확인
 */
test.describe('Modernized UI Branding', () => {

  test('로그인 페이지에 올바른 브랜딩과 로고가 표시된다', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('CUBRID', { exact: true })).toBeVisible();
    await expect(page.getByText('Web Manager', { exact: true })).toBeVisible();

    const logoImg = page.getByAltText(/CUBRID Logo/i);
    await expect(logoImg).toBeVisible();

    await expect(
      page.getByText(/Powered by CUBRID/i).or(page.getByText(/All rights reserved/i))
    ).toBeVisible();
  });

  test('다크/라이트 모드 토글이 작동한다', async ({ page }) => {
    await login(page);

    // 테마 토글 버튼 (태양/달 아이콘)
    const toggleBtn = page
      .locator('button:has-text("dark_mode"), button:has-text("light_mode")')
      .or(page.getByRole('button', { name: /dark|light|theme/i }))
      .first();
    await expect(toggleBtn).toBeVisible();

    const isInitiallyDark = await page.evaluate(
      () => document.documentElement.classList.contains('dark')
    );

    await toggleBtn.click();

    const isNowDark = await page.evaluate(
      () => document.documentElement.classList.contains('dark')
    );
    expect(isNowDark).not.toBe(isInitiallyDark);
  });

  test('로그인 후 사이드바가 올바른 디자인 토큰으로 렌더링된다', async ({ page }) => {
    await login(page);

    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toBeVisible();

    // 사이드바 내부 Admin / Manager Console 텍스트
    await expect(sidebar.getByText('Admin')).toBeVisible();
    await expect(sidebar.getByText('Manager Console')).toBeVisible();

    // SplitPane 리사이즈 핸들 존재 확인
    const resizeHandle = page.locator('.Resizer.horizontal, .Resizer.vertical').first();
    await expect(resizeHandle).toBeVisible();
  });

  test('로그인 페이지에 사용자 이름·비밀번호 입력 필드가 표시된다', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByPlaceholder(/Enter username/i)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Authorize Access/i })).toBeVisible();
  });

});
