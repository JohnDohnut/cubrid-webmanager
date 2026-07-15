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
  }

  brokerNode(brokerName) {
    return this.page.getByTestId(`tree-node-${brokerName}`);
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

  async openContextMenu(brokerName) {
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
