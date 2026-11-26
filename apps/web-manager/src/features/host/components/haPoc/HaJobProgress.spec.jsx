import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ rollback: vi.fn() }));
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
