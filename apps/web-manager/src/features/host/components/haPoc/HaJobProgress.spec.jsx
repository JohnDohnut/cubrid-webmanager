import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('../../hostApi', () => ({ hostApi: {} }));
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
      { no: 1, id: 'precheck', title: 'Check this server', node: '', db: '', state: 'done' },
      { no: 3, id: 'send_backup', title: 'Send the backup', node: 'nodeX1', db: 'hadb', state: 'failed' },
    ],
    unrestored: [{ node: 'nodeS1', kind: 'config', path: '/home/cubrid/CUBRID/conf/cubrid_ha.conf' }],
    log: '',
  };
  await act(async () => root.render(<HaJobProgress hostUid="h1" job={job} setJob={() => {}} L={CM.haSlavePoc} />));
  expect(container.textContent).toContain('Step 3 / 4, Send the backup (nodeX1 · hadb)');
  expect(container.querySelector('ol').textContent).toContain('3Send the backupnodeX1hadbfailed');
  expect(container.querySelector('[data-testid="ha-job-unrestored"]').textContent)
    .toBe('Not undone (check these by hand)nodeS1 · config · /home/cubrid/CUBRID/conf/cubrid_ha.conf');
});
