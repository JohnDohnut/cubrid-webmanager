import { expect, it } from 'vitest';
import { buildAddNodesRequest, convertPlan, newNodesProblem, summarizeRequest } from './addNodesRequest';

const node = (host, role, osPassword = 'pw') => ({ role, ssh: { host: ` ${host} `, sshPort: '22', osUser: 'cubrid', osPassword }, check: { hostkey_sha256: `SHA256:${host}` } });
const body = (host, role) => ({ ...(role ? { role } : {}), host, sshPort: 22, osUser: 'cubrid', osPassword: 'pw', hostKeyFingerprint: `SHA256:${host}` });
const options = { startHa: true, rollbackConvert: false };

it('plans the restarts of a single server: every running database restarts, the ones not picked stay single', () => {
  expect(convertPlan({ picked: ['db1', 'down'], running: ['db1', 'db2'], all: ['db1', 'db2', 'down', 'db3'] })).toEqual({
    haDatabases: ['db1', 'down'],
    restartDatabases: ['db1', 'db2'],
    otherRunningDatabases: ['db2'],
    singleDatabases: ['db2', 'db3'],
  });
});

it('asks ha_add_nodes for a plan with every new node and its role, and the existing nodes without roles', () => {
  expect(buildAddNodesRequest({
    newNodes: [node('ns1', 'slave'), node('nr1', 'replica')],
    peers: [node('hasl1', 'slave'), node('harep', 'replica')],
    options: { ...options, rollbackConvert: true },
  })).toEqual({
    action: 'plan',
    newNodes: [body('ns1', 'slave'), body('nr1', 'replica')],
    existingNodes: [body('hasl1'), body('harep')],
    startHa: true,
  });
});

it('sends the databases to put in HA on a single server, and the restart confirmations only with run', () => {
  const state = { single: true, dbNames: ['db1'], newNodes: [node('ns1', 'slave')], peers: [], options: { ...options, rollbackConvert: true } };
  const plan = buildAddNodesRequest(state, 'plan', ['confirm_master_restart', 'confirm_other_db_restart']);
  expect(plan).toEqual({ action: 'plan', dbNames: ['db1'], rollbackConvert: true, startHa: true, newNodes: [body('ns1', 'slave')], existingNodes: [] });
  expect(plan).not.toHaveProperty('confirmMasterRestart');
  expect(buildAddNodesRequest(state, 'run', ['confirm_master_restart', 'confirm_other_db_restart']))
    .toMatchObject({ action: 'run', confirmMasterRestart: true, confirmOtherDbRestart: true });
  expect(buildAddNodesRequest(state, 'run', ['confirm_master_restart'])).not.toHaveProperty('confirmOtherDbRestart');
});

it('hides the passwords in the summary', () => {
  const sum = summarizeRequest({ newNodes: [node('ns1', 'slave')], peers: [node('harep', 'replica')], options });
  expect(sum.newNodes[0].osPassword).toBe('••••');
  expect(sum.existingNodes[0].osPassword).toBe('••••');
});

it('wants at least one new node, each once, none already in the group', () => {
  expect(newNodesProblem([], ['m'])).toBe('none');
  expect(newNodesProblem([node('a', 'slave'), node('a', 'replica')], ['m'])).toBe('duplicate');
  expect(newNodesProblem([node('m', 'slave')], ['m'])).toBe('taken');
  expect(newNodesProblem([node('a', 'slave'), node('b', 'replica')], ['m'])).toBeNull();
});
