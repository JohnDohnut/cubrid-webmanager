const { test, expect } = require('@playwright/test');
const { AuthPage } = require('../pages/AuthPage');
const { HostTreePage } = require('../pages/HostTreePage');

const E2E_HOST_ADDRESS = process.env.E2E_HOST_ADDRESS || 'localhost';
const E2E_HOST_PORT = process.env.E2E_HOST_PORT || '8001';

test.describe('Server Dashboard', () => {
  let hostTree;
  let hostUid;

  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login(process.env.E2E_USERNAME, process.env.E2E_PASSWORD);

    hostTree = new HostTreePage(page);
    const host = hostTree.hostRowByConnection(E2E_HOST_ADDRESS, E2E_HOST_PORT);
    await expect(host).toBeVisible({ timeout: 10000 });
    hostUid = await hostTree.getUidByConnection(E2E_HOST_ADDRESS, E2E_HOST_PORT);
    await hostTree.activateHost(hostUid);
  });

  test('호스트를 활성화하면 서버 대시보드 탭이 열리고 주요 섹션이 표시된다', async ({ page }) => {
    await expect(page.getByTestId(`tab-host:${hostUid}`)).toBeVisible({ timeout: 10000 });
    const dashboard = page.getByTestId('server-dashboard');
    await expect(dashboard).toBeVisible();

    for (const testId of [
      'server-dashboard-storage-volumes',
      'server-dashboard-broker-status',
      'server-dashboard-system-status',
      'server-dashboard-database-list',
      'server-dashboard-system-info',
    ]) {
      await expect(dashboard.getByTestId(testId)).toBeVisible({ timeout: 15000 });
    }
  });

  test('새로고침 버튼을 누르면 대시보드가 다시 로드된다', async ({ page }) => {
    const dashboard = page.getByTestId('server-dashboard');
    await expect(dashboard).toBeVisible();

    const refreshBtn = page.getByTestId('server-dashboard-refresh-btn');
    await refreshBtn.click();
    await expect(refreshBtn).toBeEnabled({ timeout: 15000 });
    await expect(dashboard.getByTestId('server-dashboard-broker-status')).toBeVisible();
  });
});
