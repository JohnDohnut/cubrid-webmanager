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

    // h1 텍스트는 "CUBRID Manager" (두 텍스트 노드)
    await expect(page.getByRole('heading', { name: /CUBRID Manager/i })).toBeVisible();
    // 서브타이틀 "Sign In"
    await expect(page.getByText('Sign In')).toBeVisible();

    // 로그인 페이지 로고의 alt 속성은 "CUBRID"
    const logoImg = page.getByAltText('CUBRID');
    await expect(logoImg).toBeVisible();

    // 법적 footer — Website / GitHub 링크
    await expect(
      page.getByText('GitHub').or(page.getByText('Website')).first()
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

    // 사이드바 헤더 — CUBRID / Admin badge / Manager Console (exact 사용해 다른 텍스트와 구별)
    await expect(sidebar.getByText('CUBRID', { exact: true }).first()).toBeVisible();
    await expect(sidebar.getByText('Admin', { exact: true }).first()).toBeVisible();
    await expect(sidebar.getByText('Manager Console', { exact: true })).toBeVisible();

    // SplitPane 리사이즈 핸들 (Tailwind 커스텀 컴포넌트, title 속성으로 식별)
    const resizeHandle = page.locator('[title="Drag to resize"]').first();
    await expect(resizeHandle).toBeVisible();
  });

  test('로그인 페이지에 사용자 이름·비밀번호 입력 필드가 표시된다', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByPlaceholder(/Username/i)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Authorize Access/i })).toBeVisible();
  });

});
