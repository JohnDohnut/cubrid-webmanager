import { expect, it } from 'vitest';
import { buildAddNodesRequest, convertPlan, newNodesProblem, summarizeRequest } from './addNodesRequest';

const node = (host, role, osPassword = 'pw') => ({ role, ssh: { host: ` ${host} `, sshPort: '22', osUser: 'cubrid', osPassword }, check: { hostkey_sha256: `SHA256:${host}` } });
const body = (host, role) => ({ ...(role ? { role } : {}), host, sshPort: 22, osUser: 'cubrid', osPassword: 'pw', hostKeyFingerprint: `SHA256:${host}` });
const options = { replLogHome: '', backupPath: ' /bk ', remoteBackupPath: '', haGroup: '', haPortId: '', startHa: true, rollbackConvert: false };

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
    backupPath: '/bk',
  });
});

it('adds the databases to put in HA and the agreed restarts on a single server', () => {
  const req = buildAddNodesRequest({ single: true, dbNames: ['db1'], confirmOtherDbRestart: true, newNodes: [node('ns1', 'slave')], peers: [], options: { ...options, haPortId: '59902' } }, 'run');
  expect(req).toMatchObject({ action: 'run', dbNames: ['db1'], confirmMasterRestart: true, confirmOtherDbRestart: true, rollbackConvert: false, haPortId: 59902, existingNodes: [] });
  expect(buildAddNodesRequest({ single: true, dbNames: ['db1'], confirmOtherDbRestart: false, newNodes: [], peers: [], options })).not.toHaveProperty('confirmOtherDbRestart');
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
