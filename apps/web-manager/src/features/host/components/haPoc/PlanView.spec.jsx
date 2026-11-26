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
  confirm_required: ['confirm_master_restart', 'confirm_other_db_restart'],
  changes: [{ host: 'nodeA', file: 'cubrid_ha.conf', key: 'ha_node_list', before: '', after: 'cubrid@nodeA:nodeX1' }],
  backup_bytes: 64 * 1024 * 1024,
  transfer_bytes: 64 * 1024 * 1024,
  process_increase: [{ host: 'nodeA', copylogdb: 1, applylogdb: 1 }],
  warnings: ['log_max_archives is 0 on nodeA'],
  steps: [
    { no: 1, id: 'precheck', title: 'Check this server', node: '', db: '', actor: 'script' },
    { no: 10, id: 'send_backup', title: 'Send the backup', node: 'nodeX1', db: 'hadb', actor: 'script' },
  ],
};

it('shows what the plan will do, and asks only for the confirmations not given yet', async () => {
  const onAgree = vi.fn();
  await act(async () => root.render(<PlanView plan={plan} W={CM.haAddSlave} agreed={['confirm_master_restart']} onAgree={onAgree} />));
  const text = container.textContent;
  expect(text).toContain('Run on nodeA (single) · master nodeA');
  expect(container.querySelector('[data-testid="ha-plan-node-nodeA"]').textContent).toBe('nodeA (this host)Master11.4.5.1908');
  expect(container.querySelector('[data-testid="ha-plan-node-nodeX1"]').textContent).toBe('nodeX1Slave · new11.4.5.1908');
  expect(container.querySelector('[data-testid="ha-plan-convert"]').textContent).toContain('Of those, back as single databases: hadb2');
  expect(text).toContain('Backup 64.0 MB, transfer 64.0 MB');
  expect(text).toContain('nodeA +1/+1');
  expect(text).toContain('log_max_archives is 0 on nodeA');
  expect(container.querySelector('[data-testid="ha-plan-changes"]').textContent).toContain('cubrid@nodeA:nodeX1');
  expect(container.querySelector('[data-testid="ha-plan-steps"]').textContent).toContain('10Send the backupnodeX1hadb');

  const boxes = [...container.querySelectorAll('[data-testid="ha-plan-confirm"] input[type=checkbox]')];
  expect(boxes.map((b) => b.checked)).toEqual([true, false]);
  await act(async () => boxes[1].click());
  expect(onAgree).toHaveBeenCalledWith('confirm_other_db_restart', true);
});

it('has no switch block and no confirmation on an HA host', async () => {
  await act(async () => root.render(<PlanView plan={{ ...plan, convert: null, confirm_required: [] }} W={CM.haAddSlave} agreed={[]} onAgree={() => {}} />));
  expect(container.querySelector('[data-testid="ha-plan-convert"]')).toBeNull();
  expect(container.querySelector('[data-testid="ha-plan-confirm"]')).toBeNull();
});
