import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  window.matchMedia ??= () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined });
});
const mocks = vi.hoisted(() => ({ heartbeat: vi.fn(), check: vi.fn() }));
vi.mock('../../../../api/apiClient', () => ({ default: { defaults: { headers: { common: {} } } } }));
vi.mock('../../../server/monitoringApi', () => ({ monitoringApi: { getHaHeartbeatList: mocks.heartbeat } }));
vi.mock('../../hostApi', () => ({ hostApi: { haAddSlaveCheck: mocks.check } }));
import HaAddNodesWizard from './HaAddNodesWizard';

let container;
let root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.resetAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

const render = (database) => act(async () => {
  const fixed = {
    user: { preferences: { uiLocale: 'en' } },
    host: { hosts: [{ uid: 'h1', alias: 'hamaster', address: '127.0.0.1', port: 8001 }] },
    database,
  };
  const store = configureStore({ reducer: Object.fromEntries(Object.entries(fixed).map(([key, value]) => [key, () => value])) });
  root.render(<Provider store={store}><HaAddNodesWizard hostUid="h1" /></Provider>);
});

const text = () => container.textContent;
const nextButton = () => [...container.querySelectorAll('button')].find((b) => b.textContent === 'Next');
const row = (name) => container.querySelector(`[data-testid="ha-target-db-${name}"]`);
const click = (el) => act(async () => el.click());
const heartbeat = (role) => ({
  currentnode: 'hamaster',
  currentnodestate: role,
  hanodelist: [{ node: [{ hostname: 'hamaster', state: role }, { hostname: 'hasl1', state: 'slave' }, { hostname: 'hareplica', state: 'replica' }] }],
  hadbinfolist: [{ server: [{ dbmode: [{ dbname: 'hadb', server_mode: 'active' }] }] }],
});

it('lists every database of ha_db_list on an HA master, with its running and HA state', async () => {
  mocks.heartbeat.mockResolvedValue(heartbeat('master'));
  await render({
    haDbNamesByHost: { h1: ['hadb', 'hadb2'] },
    databasesByHost: { h1: [{ dbname: 'hadb' }, { dbname: 'hadb2' }, { dbname: 'other' }] },
    activeDatabasesByHost: { h1: ['hadb'] },
  });
  expect(mocks.heartbeat).toHaveBeenCalledWith('h1');
  expect(text()).toContain('Mode: HA');
  expect(container.querySelector('[data-testid="ha-target-node-hamaster"]').textContent).toBe('hamaster (this host)Master');
  expect(container.querySelector('[data-testid="ha-target-node-hasl1"]').textContent).toBe('hasl1Slave');
  expect(container.querySelector('[data-testid="ha-target-node-hareplica"]').textContent).toBe('hareplicaReplica');
  expect(row('hadb').textContent).toBe('hadbrunningactive');
  expect(row('hadb2').textContent).toBe('hadb2stopped-');
  expect(row('other')).toBeNull();
  expect(nextButton().disabled).toBe(false);
});

it('keeps Next off on a replica host', async () => {
  mocks.heartbeat.mockResolvedValue(heartbeat('replica'));
  await render({ haDbNamesByHost: { h1: ['hadb'] }, databasesByHost: { h1: [{ dbname: 'hadb' }] }, activeDatabasesByHost: { h1: ['hadb'] } });
  expect(text()).toContain('Running on a replica host is not supported yet (optional, planned).');
  expect(nextButton().disabled).toBe(true);
});

it('says a slave host is not supported yet, naming the master', async () => {
  mocks.heartbeat.mockResolvedValue({
    currentnode: 'hasl1',
    currentnodestate: 'slave',
    hanodelist: [{ node: [{ hostname: 'hamaster', state: 'master' }, { hostname: 'hasl1', state: 'slave' }, { hostname: 'hareplica', state: 'replica' }] }],
  });
  await render({ haDbNamesByHost: { h1: ['hadb'] }, databasesByHost: { h1: [{ dbname: 'hadb' }] }, activeDatabasesByHost: { h1: ['hadb'] } });
  expect(text()).toContain('Running on a slave host is not supported yet (after testing). Open this on the master (hamaster).');
  expect(container.querySelector('[data-testid="ha-target-node-hasl1"]').textContent).toBe('hasl1 (this host)Slave');
  expect(nextButton().disabled).toBe(true);
});

it('on a single server, shows what restarts for the pick and asks again when the pick changes', async () => {
  await render({
    haDbNamesByHost: { h1: [] },
    databasesByHost: { h1: [{ dbname: 'db1' }, { dbname: 'db2' }, { dbname: 'down' }] },
    activeDatabasesByHost: { h1: ['db1', 'db2'] },
  });
  expect(mocks.heartbeat).not.toHaveBeenCalled();
  expect(text()).toContain('Mode: Single (not HA)');
  const box = (name) => row(name).querySelector('input[type=checkbox]');
  const consent = (label) => [...container.querySelectorAll('input[type=checkbox]')].find((i) => i.closest('label')?.textContent.includes(label));
  const plan = () => container.querySelector('[data-testid="ha-convert-plan"]').textContent;
  expect(box('down').disabled).toBe(false);
  expect(nextButton().disabled).toBe(true);

  await click(box('db1'));
  expect(plan()).toContain('Promote to HA master');
  expect(plan()).toContain('Into HA: db1');
  expect(plan()).toContain('Restart (every running database): db1, db2');
  expect(plan()).toContain('Of those, back as single databases: db2');
  expect(plan()).toContain('Stay single: db2, down');
  await click(consent('promote to HA master'));
  expect(nextButton().disabled).toBe(true);
  await click(consent('not picked restart too'));
  expect(nextButton().disabled).toBe(false);

  await click(box('down'));
  expect(plan()).toContain('Into HA: db1, down');
  expect(consent('promote to HA master').checked).toBe(false);
  expect(nextButton().disabled).toBe(true);
});

it('on a single server, needs one agreement only when every running database is picked', async () => {
  await render({
    haDbNamesByHost: { h1: [] },
    databasesByHost: { h1: [{ dbname: 'db1' }, { dbname: 'db2' }] },
    activeDatabasesByHost: { h1: ['db1'] },
  });
  await click(row('db1').querySelector('input[type=checkbox]'));
  expect(container.querySelector('[data-testid="ha-convert-plan"]').textContent).not.toContain('back as single');
  const consents = [...container.querySelectorAll('[data-testid="ha-convert-plan"] input[type=checkbox]')];
  expect(consents).toHaveLength(1);
  await click(consents[0]);
  expect(nextButton().disabled).toBe(false);
});

it('waits for the host start info before choosing the mode', async () => {
  await render({ haDbNamesByHost: {}, databasesByHost: {}, activeDatabasesByHost: {} });
  expect(text()).toContain('Reading the HA nodes');
  expect(text()).not.toContain('Mode:');
  expect(nextButton().disabled).toBe(true);
});

const type = (input, value) => act(async () => {
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
});

it('adds several new nodes, each with its role, and fills the existing nodes from the HA settings, fixed', async () => {
  mocks.heartbeat.mockResolvedValue(heartbeat('master'));
  mocks.check.mockImplementation(async (_h, body) => ({ result: body.hostKeyFingerprint ? 'ok' : 'hostkey_unknown', hostkey_type: 'ecdsa', hostkey_sha256: 'SHA256:k', remote_hostname: body.host }));
  await render({ haDbNamesByHost: { h1: ['hadb'] }, databasesByHost: { h1: [{ dbname: 'hadb' }] }, activeDatabasesByHost: { h1: ['hadb'] } });
  await click(nextButton());

  const row = (n) => container.querySelector(`[data-testid="ha-new-node-${n}"]`);
  const fill = async (n, host) => {
    const r = row(n);
    const input = (label) => {
      const el = [...r.querySelectorAll('label[for]')].find((l) => l.textContent.trim().startsWith(label));
      return document.getElementById(el.htmlFor);
    };
    await type(input('Host (node name)'), host);
    await type(input('OS user'), 'cubrid');
    await type(input('OS password'), 'pw');
    await click([...r.querySelectorAll('button')].find((b) => b.textContent === 'Check connection'));
    await click([...r.querySelectorAll('input[type=checkbox]')].find((i) => i.closest('label')?.textContent.includes('server\'s key')));
  };
  await fill(1, 'ns1');
  expect(nextButton().disabled).toBe(false);
  await click([...container.querySelectorAll('button')].find((b) => b.textContent === 'Add a row'));
  await click([...row(2).querySelectorAll('button')].find((b) => b.textContent === 'Replica'));
  expect(nextButton().disabled).toBe(true);
  await fill(2, 'ns1');
  expect(text()).toContain('The same host is in twice.');
  expect(nextButton().disabled).toBe(true);
  await fill(2, 'hareplica');
  expect(text()).toContain('That node name is already in this HA group.');
  await fill(2, 'nr1');
  expect(nextButton().disabled).toBe(false);
  await click(nextButton());

  expect(text()).toContain('Needed to register the new nodes on every existing node');
  const hosts = [...container.querySelectorAll('input')].filter((i) => ['hasl1', 'hareplica'].includes(i.value));
  expect(hosts.map((i) => [i.value, i.disabled])).toEqual([['hasl1', true], ['hareplica', true]]);
  expect(text()).toContain('Existing slave');
  expect(text()).toContain('Existing replica');
  expect(nextButton().disabled).toBe(true);
});

const okCheck = async (_h, body) => ({ result: body.hostKeyFingerprint ? 'ok' : 'hostkey_unknown', hostkey_sha256: `SHA256:${body.host}`, remote_hostname: body.host });
const labelled = (scope, label) => document.getElementById([...scope.querySelectorAll('label[for]')].find((l) => l.textContent.trim().startsWith(label)).htmlFor);
const confirmNewNode = async (n, host) => {
  const r = container.querySelector(`[data-testid="ha-new-node-${n}"]`);
  await type(labelled(r, 'Host (node name)'), host);
  await type(labelled(r, 'OS user'), 'cubrid');
  await type(labelled(r, 'OS password'), 'pw');
  await click([...r.querySelectorAll('button')].find((b) => b.textContent === 'Check connection'));
  await click([...r.querySelectorAll('input[type=checkbox]')].find((i) => i.closest('label')?.textContent.includes('server\'s key')));
};

it('goes through an empty existing nodes step when the master has no slave and no replica', async () => {
  mocks.heartbeat.mockResolvedValue({ currentnode: 'hamaster', currentnodestate: 'master', hanodelist: [{ node: [{ hostname: 'hamaster', state: 'master' }] }] });
  mocks.check.mockImplementation(okCheck);
  await render({ haDbNamesByHost: { h1: ['hadb'] }, databasesByHost: { h1: [{ dbname: 'hadb' }] }, activeDatabasesByHost: { h1: ['hadb'] } });
  await click(nextButton());
  await confirmNewNode(1, 'ns1');
  await click(nextButton());
  expect(text()).toContain('No node other than this host. Just go Next.');
  expect(container.querySelector('[data-testid="ha-bulk-existing"]')).toBeNull();
  expect(nextButton().disabled).toBe(false);
});

it('with ten existing nodes, puts one account into all and checks them all, each key still confirmed on its own', async () => {
  const names = Array.from({ length: 10 }, (_, i) => `node${i + 1}`);
  mocks.heartbeat.mockResolvedValue({
    currentnode: 'hamaster',
    currentnodestate: 'master',
    hanodelist: [{ node: [{ hostname: 'hamaster', state: 'master' }, ...names.map((n, i) => ({ hostname: n, state: i < 6 ? 'slave' : 'replica' }))] }],
  });
  mocks.check.mockImplementation(okCheck);
  await render({ haDbNamesByHost: { h1: ['hadb'] }, databasesByHost: { h1: [{ dbname: 'hadb' }] }, activeDatabasesByHost: { h1: ['hadb'] } });
  expect(container.querySelectorAll('[data-testid^="ha-target-node-"]')).toHaveLength(11);
  await click(nextButton());
  await confirmNewNode(1, 'ns1');
  await click(nextButton());

  const bulk = container.querySelector('[data-testid="ha-bulk-existing"]');
  expect(bulk.textContent).toContain('Confirmed 0 / 10');
  await type(labelled(bulk, 'OS user'), 'cubrid');
  await type(labelled(bulk, 'OS password'), 'pw');
  await click([...bulk.querySelectorAll('button')].find((b) => b.textContent === 'Put into all'));
  mocks.check.mockClear();
  await click([...bulk.querySelectorAll('button')].find((b) => b.textContent === 'Check all'));
  // The first round only: no password, no key.
  expect(mocks.check).toHaveBeenCalledTimes(10);
  expect(mocks.check.mock.calls.every(([, b]) => !b.osPassword && !b.hostKeyFingerprint)).toBe(true);
  expect(nextButton().disabled).toBe(true);

  const keys = [...container.querySelectorAll('input[type=checkbox]')].filter((i) => i.closest('label')?.textContent.includes('server\'s key'));
  expect(keys).toHaveLength(10);
  for (const key of keys) await click(key);
  expect(bulk.textContent).toContain('Confirmed 10 / 10');
  expect(nextButton().disabled).toBe(false);
});
