const { expect } = require('@playwright/test');

/**
 * Page Object for the broker tree in the sidebar (see BrokerTree.jsx).
 *
 * Only the top-level broker node carries a stable `id` (broker.name), so
 * `data-testid="tree-node-{brokerName}"` works there. The nested "SQL Log"
 * folder and individual log-file nodes are NOT passed an `id` prop upstream
 * and therefore have no data-testid yet — broker_logs.spec.js falls back to
 * label text scoped inside the broker's subtree for those.
 */
class BrokerTreePage {
  constructor(page) {
    this.page = page;
    this.container = page.locator('#broker-tree-container');
  }

  /** The sidebar's Database/Broker/Log tree-tab switcher (TreeTabHeader.jsx) defaults to Database. */
  async switchToBrokerTab() {
    await this.page.getByTestId('tree-tab-broker').click();
    await expect(this.container).toBeVisible();
  }

  brokerNode(brokerName) {
    return this.container.getByTestId(`tree-node-${brokerName}`);
  }

  /** First broker row in the tree, regardless of name — useful when no fixed broker name is assumed. */
  firstBrokerNode() {
    return this.container.locator('[data-testid^="tree-node-"]').first();
  }

  async selectBroker(brokerName) {
    const broker = this.brokerNode(brokerName);
    await expect(broker).toBeVisible({ timeout: 10000 });
    await broker.locator('> summary').click();
  }

  async activateBroker(brokerName) {
    const broker = this.brokerNode(brokerName);
    await expect(broker).toBeVisible({ timeout: 10000 });
    await broker.locator('> summary').dblclick();
  }

  // Context menus only close on a mousedown outside `.context-menu-container`
  // (Sidebar.jsx's handleOutsideAction) — Escape is a no-op. A leftover menu
  // can overlap and block the next right-click, retrying forever until the
  // test times out looking like a browser crash. Dismiss defensively first.
  async openContextMenu(brokerName) {
    await this.page.mouse.click(2, 2).catch(() => {});
    const broker = this.brokerNode(brokerName);
    await expect(broker).toBeVisible({ timeout: 10000 });
    await broker.locator('> summary').click({ button: 'right' });
  }

  async expandSqlLogFolder(brokerName) {
    const broker = this.brokerNode(brokerName);
    await expect(broker).toBeVisible({ timeout: 10000 });
    const sqlLogSummary = broker.getByText(/SQL Log/i).first();
    await sqlLogSummary.click();
  }
}

module.exports = { BrokerTreePage };
