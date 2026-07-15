const { test, expect } = require('@playwright/test');
const { AuthPage } = require('../pages/AuthPage');

test.describe('Register', () => {
  test('빈 폼으로 제출하면 필수 항목 오류가 표시된다', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.gotoRegister();
    await auth.registerSubmitBtn.click();

    await expect(page.getByText(/Username.*required/i)).toBeVisible();
    await expect(page.getByText(/Password.*required/i)).toBeVisible();
  });

  test('비밀번호와 확인 비밀번호가 다르면 오류가 표시되고 제출되지 않는다', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.gotoRegister();
    await auth.registerUsernameInput.fill(`e2e_user_${Date.now()}`);
    await auth.registerPasswordInput.fill('Password123!');
    await auth.registerConfirmPasswordInput.fill('Password124!');
    await auth.registerSubmitBtn.click();

    await expect(page.getByText(/do not match|일치하지 않/i)).toBeVisible();
    await expect(page).toHaveURL(/register/);
  });

  test('새 계정을 생성하면 로그인 페이지로 이동하고, 그 계정으로 로그인할 수 있다', async ({ page }) => {
    const auth = new AuthPage(page);
    const username = `e2e_user_${Date.now()}`;
    const password = 'Password123!';

    await auth.register(username, password);
    await expect(page).toHaveURL(/login/);

    await auth.login(username, password);
    await expect(page).not.toHaveURL(/login/);
  });

  test('이미 존재하는 사용자명으로 가입하면 오류가 표시된다', async ({ page }) => {
    const auth = new AuthPage(page);
    const username = `e2e_dup_${Date.now()}`;
    const password = 'Password123!';

    await auth.register(username, password);
    await expect(page).toHaveURL(/login/);

    await auth.register(username, password);
    await expect(page.getByText(/already exists|이미 존재/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/register/);
  });
});
