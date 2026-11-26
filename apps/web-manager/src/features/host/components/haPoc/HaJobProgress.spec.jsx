import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ rollback: vi.fn() }));
vi.hoisted(() => {
  window.matchMedia ??= () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined });
});
vi.mock('../../../../api/apiClient', () => ({ default: { defaults: { headers: { common: {} } } } }));
vi.mock('../../hostApi', () => ({ hostApi: { haAddNodesRollback: mocks.rollback } }));
import HaJobProgress from './HaJobProgress';
import { CM } from '../../../../constants/cmLabels';

let container;
let root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

it('names the node and database of each step, and lists what could not be undone', async () => {
  const job = {
    uuid: 'u1',
    job_status: 'fail',
    phase: 'done',
    step_no: 3,
    step_count: 4,
    step_node: 'nodeX1',
    step_db: 'hadb',
    steps: [
      { no: 1, stage: 'S1', id: 'precheck', title: 'Check this server', node: '', db: '', state: 'done' },
      { no: 3, stage: 'S10', id: 'send_backup', title: 'Send the backup', node: 'nodeX1', db: 'hadb', state: 'failed', detail: 'nodeX1: a test transfer failed' },
    ],
    unrestored: [{ node: 'nodeS1', kind: 'config', path: '/home/cubrid/CUBRID/conf/cubrid_ha.conf' }],
    log: '',
  };
  await act(async () => root.render(<HaJobProgress hostUid="h1" job={job} setJob={() => {}} L={CM.haSlavePoc} />));
  expect(container.textContent).toContain('Step 3 / 4, Send the backup (nodeX1 · hadb)');
  expect(container.querySelector('[data-testid="ha-stage-group-backup"]').textContent)
    .toBe('Backup and transfer3S10Send the backupnodeX1hadbfailednodeX1: a test transfer failed');
  expect(container.querySelector('[data-testid="ha-job-unrestored"]').textContent)
    .toBe('Not undone (check these by hand)nodeS1 · config · /home/cubrid/CUBRID/conf/cubrid_ha.conf');
});

it('tags the promotion steps on a single server, and leaves them out on an HA host', async () => {
  const job = {
    uuid: 'u1', job_status: 'success', phase: 'done', step_no: 2, step_count: 2,
    steps: [
      { no: 1, stage: 'S4', id: 'convert_stop', title: 'Stop the running databases', node: '', db: '', state: 'done' },
      { no: 2, stage: 'S11', id: 'new_config', title: 'Prepare the new node', node: 'nodeX1', db: '', state: 'done' },
    ],
    log: '',
  };
  await act(async () => root.render(<HaJobProgress hostUid="h1" job={job} setJob={() => {}} L={CM.haSlavePoc} promoting />));
  expect(container.querySelector('[data-testid="ha-stage-group-promote"]').textContent).toBe('Promote to HA master1S4Stop the running databasesdone');
  await act(async () => root.render(<HaJobProgress hostUid="h1" job={job} setJob={() => {}} L={CM.haSlavePoc} />));
  expect(container.querySelector('[data-testid="ha-job-steps"]').textContent).not.toContain('Stop the running databases');
  expect(container.textContent).not.toContain('Promote to HA master');
});

it('undoes an interrupted job with every node\'s login, then polls it again', async () => {
  mocks.rollback.mockResolvedValue({ uuid: 'u1', job_status: 'running' });
  let job = { uuid: 'u1', job_status: 'interrupted', phase: 'done', steps: [], log: '' };
  const setJob = (fn) => { job = typeof fn === 'function' ? fn(job) : fn; };
  const nodes = { newNodes: [{ role: 'slave', host: 'nx1', osPassword: 'pw' }], existingNodes: [{ host: 'hasl1', osPassword: 'pw' }] };
  await act(async () => root.render(<HaJobProgress hostUid="h1" job={job} setJob={setJob} L={CM.haSlavePoc} rollbackNodes={nodes} />));
  expect(container.textContent).toContain('The job stopped mid-way');
  await act(async () => [...container.querySelectorAll('button')].find((b) => b.textContent === 'Undo').click());
  expect(mocks.rollback).toHaveBeenCalledWith('h1', 'u1', nodes);
  expect(job).toMatchObject({ job_status: 'running', phase: 'rollback' });
});

it('takes an undone job as ended, and offers Undo again after a blocked one', async () => {
  const nodes = { newNodes: [], existingNodes: [] };
  const render = (job) => act(async () => root.render(<HaJobProgress hostUid="h1" job={job} setJob={() => {}} L={CM.haSlavePoc} rollbackNodes={nodes} />));
  const buttons = () => [...container.querySelectorAll('button')].map((b) => [b.textContent, b.disabled]);
  await render({ uuid: 'u1', job_status: 'rolled_back', phase: 'done', steps: [], log: '' });
  expect(buttons()).toEqual([['Cancel', true]]);
  await render({ uuid: 'u1', job_status: 'rollback_blocked', phase: 'done', steps: [], log: '' });
  expect(buttons()).toEqual([['Cancel', true], ['Undo', false]]);
  expect(container.textContent).toContain('A command did not answer');
});

it('says the cause and what to do when the run fails on a node', async () => {
  const job = { uuid: 'u1', job_status: 'fail', phase: 'done', error: 'no_answer', message: 'haxs1: no answer in 30 s', step_node: 'haxs1', action: 'Check haxs1', steps: [], log: '' };
  await act(async () => root.render(<HaJobProgress hostUid="h1" job={job} setJob={() => {}} L={CM.haSlavePoc} causes={CM.haAddSlave.sshCauses} sshLabels={CM.haAddSlave.sshLabels} />));
  expect(container.querySelector('[data-testid="ha-job-problem"]').textContent)
    .toBe('haxs1 · Cause: The node did not answer in timeTo do: Check haxs1Detail: haxs1: no answer in 30 s');
});

it('asks again only for the passwords of the nodes it lost before undoing, and keeps none', async () => {
  mocks.rollback.mockReset();
  mocks.rollback.mockResolvedValue({ uuid: 'u1', job_status: 'running' });
  let job = { uuid: 'u1', job_status: 'rollback_failed', phase: 'done', error: 'connection_lost', lost_nodes: ['haxs1'], steps: [], log: '' };
  const setJob = (fn) => { job = typeof fn === 'function' ? fn(job) : fn; };
  const nodes = {
    newNodes: [{ role: 'slave', host: 'haxs1', osPassword: 'old' }, { role: 'replica', host: 'haxr1', osPassword: 'pr' }],
    existingNodes: [{ host: 'hasl1', osPassword: 'ps' }],
  };
  const { Provider } = await import('react-redux');
  const { configureStore } = await import('@reduxjs/toolkit');
  const store = configureStore({ reducer: { user: () => ({ preferences: { uiLocale: 'en' } }) } });
  await act(async () => root.render(<Provider store={store}><HaJobProgress hostUid="h1" job={job} setJob={setJob} L={CM.haSlavePoc} rollbackNodes={nodes} /></Provider>));
  await act(async () => [...container.querySelectorAll('button')].find((b) => b.textContent === 'Undo').click());
  const dialog = document.querySelector('[data-testid="ha-relog-modal"]');
  expect(dialog.textContent).toContain('haxs1 OS password');
  expect(dialog.textContent).not.toContain('haxr1');
  const input = dialog.querySelector('input[type=password]');
  expect(input.value).toBe('');
  const undo = () => [...dialog.querySelectorAll('button')].find((b) => b.textContent === 'Undo');
  expect(undo().disabled).toBe(true);
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, 'new');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => undo().click());
  expect(mocks.rollback).toHaveBeenCalledWith('h1', 'u1', {
    newNodes: [{ role: 'slave', host: 'haxs1', osPassword: 'new' }, { role: 'replica', host: 'haxr1', osPassword: 'pr' }],
    existingNodes: [{ host: 'hasl1', osPassword: 'ps' }],
  });
  expect(document.querySelector('[data-testid="ha-relog-modal"]')).toBeNull();
});

it('shows a failed node login on undo per node and asks those passwords again', async () => {
  mocks.rollback.mockReset();
  mocks.rollback.mockResolvedValueOnce({
    login_failed: true, error: 'auth_failed', message: 'hasl1: Permission denied', action: 'Check the password',
    node_checks: [{ node: 'hasl1', code: 'auth_failed', message: 'hasl1: Permission denied', action: 'Check the password' }, { node: 'haxs1', code: 'ok' }],
  });
  let job = { uuid: 'u1', job_status: 'interrupted', phase: 'done', steps: [], log: '' };
  const setJob = (fn) => { job = typeof fn === 'function' ? fn(job) : fn; };
  const nodes = { newNodes: [{ role: 'slave', host: 'haxs1', osPassword: 'a' }], existingNodes: [{ host: 'hasl1', osPassword: 'b' }] };
  const { Provider } = await import('react-redux');
  const { configureStore } = await import('@reduxjs/toolkit');
  const store = configureStore({ reducer: { user: () => ({ preferences: { uiLocale: 'en' } }) } });
  const W = CM.haAddSlave;
  await act(async () => root.render(<Provider store={store}><HaJobProgress hostUid="h1" job={job} setJob={setJob} L={CM.haSlavePoc} rollbackNodes={nodes} causes={W.sshCauses} sshLabels={W.sshLabels} /></Provider>));
  await act(async () => [...container.querySelectorAll('button')].find((b) => b.textContent === 'Undo').click());
  expect(container.querySelector('[data-testid="ha-undo-login-failed-hasl1"]').textContent)
    .toBe('hasl1 · Cause: Wrong user or passwordTo do: Check the passwordDetail: hasl1: Permission denied');
  expect(container.querySelector('[data-testid="ha-undo-login-failed-haxs1"]')).toBeNull();
  expect(job.job_status).toBe('interrupted');
  const dialog = document.querySelector('[data-testid="ha-relog-modal"]');
  expect([...dialog.querySelectorAll('label')].map((l) => l.textContent.trim())).toEqual(['hasl1 OS password']);
});
