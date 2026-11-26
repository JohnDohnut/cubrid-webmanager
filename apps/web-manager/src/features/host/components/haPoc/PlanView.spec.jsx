import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import PlanView from './PlanView';
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

// The plan of a single server: hadb to HA (hadb2 restarts and stays single), a new slave.
const plan = {
  local: { host: 'nodeA', state: 'single' },
  case: 1,
  master_host: 'nodeA',
  db_names: ['hadb'],
  nodes: [
    { host: 'nodeA', role: 'master', new: false, version: '11.4.5.1908', local: true },
    { host: 'nodeX1', role: 'slave', new: true, version: '11.4.5.1908', local: false },
  ],
  convert: { ha_databases: ['hadb'], restart_databases: ['hadb', 'hadb2'], other_running_databases: ['hadb2'], single_databases: ['hadb2', 'cubdb'] },
  confirm_required: ['confirm_master_restart', 'confirm_other_db_restart', 'confirm_new_node_db_restart'],
  new_node_databases: [{ host: 'nodeX1', running: ['db9'], staying_single: ['db9', 'db8'] }, { host: 'nodeX2', running: [], staying_single: [] }],
  node_paths: [{ host: 'nodeX1', db: 'hadb', vol: '/data/x/hadb', log: '/data/x/hadb/log', lob: '', repl_log_home: '/data/x', receive: '/data/x/ha_add_nodes_backup' }],
  changes: [{ host: 'nodeA', file: 'cubrid_ha.conf', key: 'ha_node_list', before: '', after: 'cubrid@nodeA:nodeX1' }],
  backup_bytes: 64 * 1024 * 1024,
  transfer_bytes: 64 * 1024 * 1024,
  process_increase: [{ host: 'nodeA', copylogdb: 1, applylogdb: 1 }],
  warnings: ['log_max_archives is 0 on nodeA'],
  primary_key_check: [
    { db: 'hadb', status: 'ok', tables: [], message: '' },
    { db: 'hadb2', status: 'partial', tables: ['PUB.t9'], message: '' },
    { db: 'hadb3', status: 'not_logged_in', tables: [], message: '' },
  ],
  steps: [
    { no: 1, stage: 'S1', id: 'precheck', title: 'Check this server', node: '', db: '', actor: 'script' },
    { no: 4, stage: 'S4', id: 'convert_stop', title: 'Stop the running databases', node: '', db: '', actor: 'script' },
    { no: 10, stage: 'S10', id: 'send_backup', title: 'Send the backup', node: 'nodeX1', db: 'hadb', actor: 'script' },
  ],
};

it('shows what the plan will do, and asks only for the confirmations not given yet', async () => {
  const onAgree = vi.fn();
  await act(async () => root.render(<PlanView plan={plan} W={CM.haAddSlave} L={CM.haSlavePoc} agreed={['confirm_master_restart']} onAgree={onAgree} />));
  const text = container.textContent;
  expect(text).toContain('Run on nodeA (single) · master nodeA');
  expect(container.querySelector('[data-testid="ha-plan-node-nodeA"]').textContent).toBe('nodeA (this host)Master11.4.5.1908');
  expect(container.querySelector('[data-testid="ha-plan-node-nodeX1"]').textContent).toBe('nodeX1Slave · new11.4.5.1908');
  expect(container.querySelector('[data-testid="ha-plan-convert"]').textContent).toContain('Of those, back as single databases: hadb2');
  expect(text).toContain('Backup 64.0 MB, transfer 64.0 MB');
  expect(text).toContain('nodeA +1/+1');
  expect(text).toContain('log_max_archives is 0 on nodeA');
  expect(container.querySelector('[data-testid="ha-plan-pk-hadb"]').textContent).toBe('hadbcheckednone');
  expect(container.querySelector('[data-testid="ha-plan-pk-hadb2"]').textContent).toBe('hadb2partly checked (not a dba account)not replicated: PUB.t9');
  expect(container.querySelector('[data-testid="ha-plan-pk-hadb3"]').textContent).toBe('hadb3not checked (not logged in)');
  expect(container.querySelector('[data-testid="ha-plan-changes"]').textContent).toContain('cubrid@nodeA:nodeX1');
  expect(container.querySelector('[data-testid="ha-stage-group-backup"]').textContent).toBe('Backup and transfer10S10Send the backupnodeX1hadb');
  expect(container.querySelector('[data-testid="ha-stage-group-promote"]').textContent).toBe('Promote to HA master4S4Stop the running databases');
  expect(container.querySelector('[data-testid="ha-plan-new-node-dbs-nodeX1"]').textContent).toBe('nodeX1: Running (stops and starts again): db9 · Stay single: db9, db8');
  expect(container.querySelector('[data-testid="ha-plan-new-node-dbs-nodeX2"]')).toBeNull();
  expect(container.querySelector('[data-testid="ha-plan-paths"]').textContent).toContain('nodeX1hadb/data/x/hadb/data/x/hadb/log-/data/x/data/x/ha_add_nodes_backup');
  expect(container.querySelector('[data-testid="ha-plan-convert"]').textContent).toContain('Promote to HA master');
  expect(text).not.toMatch(/switch/i);

  const boxes = [...container.querySelectorAll('[data-testid="ha-plan-confirm"] input[type=checkbox]')];
  expect(boxes.map((b) => b.checked)).toEqual([true, false, false]);
  expect(container.querySelector('[data-testid="ha-plan-confirm"]').textContent).toContain('the other running databases on the new nodes stop and start again');
  await act(async () => boxes[1].click());
  expect(onAgree).toHaveBeenCalledWith('confirm_other_db_restart', true);
});

it('has no switch block and no confirmation on an HA host', async () => {
  await act(async () => root.render(<PlanView plan={{ ...plan, convert: null, confirm_required: [], new_node_databases: [] }} W={CM.haAddSlave} L={CM.haSlavePoc} agreed={[]} onAgree={() => {}} />));
  expect(container.querySelector('[data-testid="ha-plan-convert"]')).toBeNull();
  expect(container.querySelector('[data-testid="ha-plan-confirm"]')).toBeNull();
  expect(container.textContent).not.toContain('Promote to HA master');
  expect(container.querySelector('[data-testid="ha-plan-steps"]').textContent).not.toContain('Stop the running databases');
  expect(container.querySelector('[data-testid="ha-stage-group-promote"]')).toBeNull();
  expect(container.textContent).toContain('Steps to run (2)');
});
