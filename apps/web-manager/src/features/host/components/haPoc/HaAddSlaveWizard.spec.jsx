import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  window.matchMedia ??= () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined });
});
const mocks = vi.hoisted(() => ({ heartbeat: vi.fn() }));
vi.mock('../../../../api/apiClient', () => ({ default: { defaults: { headers: { common: {} } } } }));
vi.mock('../../../server/monitoringApi', () => ({ monitoringApi: { getHaHeartbeatList: mocks.heartbeat } }));
vi.mock('../../hostApi', () => ({ hostApi: {} }));
import HaAddSlaveWizard from './HaAddSlaveWizard';

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
  root.render(<Provider store={store}><HaAddSlaveWizard hostUid="h1" /></Provider>);
});

const text = () => container.textContent;
const nextButton = () => [...container.querySelectorAll('button')].find((b) => b.textContent === 'Next');
const row = (name) => container.querySelector(`[data-testid="ha-target-db-${name}"]`);
const click = (el) => act(async () => el.click());
const heartbeat = (role) => ({
  currentnodestate: role,
  hanodelist: [{ node: [{ hostname: 'hamaster', state: role }, { hostname: 'hareplica', state: 'replica' }] }],
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
  expect(text()).toContain('hareplica');
  expect(row('hadb').textContent).toBe('hadbrunningactive');
  expect(row('hadb2').textContent).toBe('hadb2stopped-');
  expect(row('other')).toBeNull();
  expect(nextButton().disabled).toBe(false);
});

it('keeps Next off on an HA host that is not the master', async () => {
  mocks.heartbeat.mockResolvedValue(heartbeat('slave'));
  await render({ haDbNamesByHost: { h1: ['hadb'] }, databasesByHost: { h1: [{ dbname: 'hadb' }] }, activeDatabasesByHost: { h1: ['hadb'] } });
  expect(text()).toContain('Run this on the master');
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
  expect(plan()).toContain('Into HA: db1');
  expect(plan()).toContain('Restart (every running database): db1, db2');
  expect(plan()).toContain('Of those, back as single databases: db2');
  expect(plan()).toContain('Stay single: db2, down');
  await click(consent('switch to HA'));
  expect(nextButton().disabled).toBe(true);
  await click(consent('not picked restart too'));
  expect(nextButton().disabled).toBe(false);

  await click(box('down'));
  expect(plan()).toContain('Into HA: db1, down');
  expect(consent('switch to HA').checked).toBe(false);
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
