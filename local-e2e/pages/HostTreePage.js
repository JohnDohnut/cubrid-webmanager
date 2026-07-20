const { expect } = require('@playwright/test');

/**
 * Page Object for the host/group tree in the sidebar (Server List panel).
 *
 * Current click semantics (see ServerListItem.jsx / HostGroupTree.jsx):
 * - Group: single click both selects AND toggles expand/collapse.
 * - Host: single click only selects (setSelectedHost). Double-click logs in
 *   (if needed) and opens the dashboard. Never assume a single click on a
 *   host activates it — that behavior was removed.
 *
 * Selectors: group/host rows carry data-testid via TreeNode
 * (`tree-node-{groupId}`) and ServerListItem (`host-item-{hostUid}`).
 */
class HostTreePage {
  constructor(page) {
    this.page = page;
    this.hostSection = page.locator('#host-section');
  }

  groupRow(groupId) {
    return this.page.getByTestId(`tree-node-${groupId}`);
  }

  hostRow(hostUid) {
    return this.page.getByTestId(`host-item-${hostUid}`);
  }

  /** Finds a host row by its address:port title (used when the uid isn't known upfront). */
  hostRowByConnection(address, port) {
    return this.hostSection.locator(`[title="${address}:${port}"]`);
  }

  /** Reads the host's uid out of its own data-testid (host-item-{uid}). */
  async getUidByConnection(address, port) {
    const testId = await this.hostRowByConnection(address, port).getAttribute('data-testid');
    return testId.replace('host-item-', '');
  }

  async expandGroup(groupId) {
    const group = this.groupRow(groupId);
    await expect(group).toBeVisible({ timeout: 10000 });
    const isOpen = await group.evaluate((el) => el.open).catch(() => true);
    if (!isOpen) {
      await group.locator('> summary').click();
    }
  }

  /** Expands every group <details> currently rendered in the host section. */
  async expandAllGroups() {
    await expect(this.hostSection).toBeVisible({ timeout: 10000 });
    const groups = this.hostSection.locator('details');
    await groups.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
    const count = await groups.count();
    for (let i = 0; i < count; i++) {
      const isOpen = await groups.nth(i).evaluate((el) => el.open);
      if (!isOpen) {
        await groups.nth(i).locator('> summary').click();
      }
    }
  }

  /** Selects a host (single click) without logging in / opening its dashboard. */
  async selectHost(hostUid) {
    const host = this.hostRow(hostUid);
    await expect(host).toBeVisible({ timeout: 10000 });
    await host.click();
  }

  /** Double-clicks a host: logs in if needed, then opens its dashboard tab. */
  async activateHost(hostUid) {
    const host = this.hostRow(hostUid);
    await expect(host).toBeVisible({ timeout: 10000 });
    await host.dblclick();
    await expect(this.page.locator('#db-tree-container')).toHaveAttribute('data-authorized', 'true', { timeout: 30000 });
  }

  // Context menus (Sidebar.jsx's ContextMenuWrapper) only close on a mousedown
  // outside `.context-menu-container` — Escape is a no-op. A leftover menu
  // from a previous action can physically overlap and block the next
  // right-click ("intercepts pointer events"), retrying forever until the
  // test times out looking like a browser crash. Dismiss defensively first.
  async _dismissAnyOpenMenu() {
    await this.page.mouse.click(2, 2).catch(() => {});
  }

  async openHostContextMenu(hostUid) {
    await this._dismissAnyOpenMenu();
    const host = this.hostRow(hostUid);
    await expect(host).toBeVisible({ timeout: 10000 });
    await host.click({ button: 'right' });
  }

  async openGroupContextMenu(groupId) {
    await this._dismissAnyOpenMenu();
    const group = this.groupRow(groupId);
    await expect(group).toBeVisible({ timeout: 10000 });
    await group.locator('> summary').click({ button: 'right' });
  }
}

module.exports = { HostTreePage };
