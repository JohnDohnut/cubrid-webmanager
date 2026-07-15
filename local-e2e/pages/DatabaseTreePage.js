const { expect } = require('@playwright/test');

/**
 * Page Object for the database tree in the sidebar (see DatabaseTree.jsx).
 *
 * Sub-nodes (Users/Job automation/Backup Plan/Query Plan/Space/Log) reuse
 * static ids across every database ("Users", "Backup Plan", ...), so their
 * data-testid is NOT globally unique — always scope queries inside the
 * owning database's subtree via `dbNode(dbname)`.
 *
 * Toggling (expand) a database only lazy-loads read-only data; it never
 * logs in. Double-click activates: logs in (or opens LoginDatabaseModal if
 * no saved profile) and opens the dashboard tab.
 */
class DatabaseTreePage {
  constructor(page) {
    this.page = page;
    this.container = page.locator('#db-tree-container');
  }

  async waitForAuthorized() {
    await expect(this.container).toHaveAttribute('data-authorized', 'true', { timeout: 30000 });
  }

  dbNode(dbname) {
    return this.page.getByTestId(`tree-node-${dbname}`);
  }

  async expandDatabase(dbname) {
    const db = this.dbNode(dbname);
    await expect(db).toBeVisible({ timeout: 15000 });
    const isOpen = await db.evaluate((el) => el.open);
    if (!isOpen) {
      await db.locator('> summary').click();
    }
    return db;
  }

  async selectDatabase(dbname) {
    const db = this.dbNode(dbname);
    await expect(db).toBeVisible({ timeout: 15000 });
    await db.locator('> summary').click();
  }

  /** Double-click: logs in if needed, then opens the DB dashboard tab. */
  async activateDatabase(dbname) {
    const db = this.dbNode(dbname);
    await expect(db).toBeVisible({ timeout: 15000 });
    await db.locator('> summary').dblclick();
  }

  async openContextMenu(dbname) {
    const db = this.dbNode(dbname);
    await expect(db).toBeVisible({ timeout: 15000 });
    await db.locator('> summary').click({ button: 'right' });
  }

  /** Sub-node scoped within a specific database's subtree, e.g. subNode('demodb', 'Users'). */
  subNode(dbname, subId) {
    return this.dbNode(dbname).getByTestId(`tree-node-${subId}`);
  }

  async expandSubNode(dbname, subId) {
    await this.expandDatabase(dbname);
    const node = this.subNode(dbname, subId);
    await expect(node).toBeVisible({ timeout: 10000 });
    const isOpen = await node.evaluate((el) => el.open).catch(() => false);
    if (!isOpen) {
      await node.locator('> summary').click();
    }
    return node;
  }

  /** Backup Plan / Query Plan leaf items, keyed by backupid / query_id (also scoped per-db). */
  planItem(dbname, planId) {
    return this.dbNode(dbname).getByTestId(`tree-node-${planId}`);
  }
}

module.exports = { DatabaseTreePage };
