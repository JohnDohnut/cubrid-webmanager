import { expect, it } from 'vitest';
import { buildAddNodesRequest, buildConvertMasterRequest, convertPlan, newNodesProblem, summarizeRequests } from './addNodesRequest';

const node = (host, role, osPassword = 'pw') => ({ role, ssh: { host: ` ${host} `, sshPort: '22', osUser: 'cubrid', osPassword }, check: { hostkey_sha256: `SHA256:${host}` } });
const body = (host, role) => ({ role, host, sshPort: 22, osUser: 'cubrid', osPassword: 'pw', hostKeyFingerprint: `SHA256:${host}` });
const options = { replLogHome: '', masterBackupPath: ' /bk ', slaveBackupPath: '', haGroup: '', haPortId: '', startHa: true };

it('plans the restarts of a single server: every running database restarts, the ones not picked stay single', () => {
  expect(convertPlan({ picked: ['db1', 'down'], running: ['db1', 'db2'], all: ['db1', 'db2', 'down', 'db3'] })).toEqual({
    haDatabases: ['db1', 'down'],
    restartDatabases: ['db1', 'db2'],
    otherRunningDatabases: ['db2'],
    singleDatabases: ['db2', 'db3'],
  });
});

it('asks ha_convert_master for the databases picked, with the other restart only when agreed', () => {
  expect(buildConvertMasterRequest({ dbNames: ['db1'], options, confirmOtherDbRestart: false })).toEqual({ dbNames: ['db1'], confirmMasterRestart: true });
  expect(buildConvertMasterRequest({ dbNames: ['db1'], options: { ...options, haPortId: '59902' }, confirmOtherDbRestart: true }))
    .toEqual({ dbNames: ['db1'], confirmMasterRestart: true, confirmOtherDbRestart: true, haPortId: 59902 });
});

it('sends every new node and every existing node with its role', () => {
  expect(buildAddNodesRequest({
    newNodes: [node('ns1', 'slave'), node('nr1', 'replica')],
    peers: [node('hasl1', 'slave'), node('harep', 'replica')],
    options,
  })).toEqual({
    newNodes: [body('ns1', 'slave'), body('nr1', 'replica')],
    existingNodes: [body('hasl1', 'slave'), body('harep', 'replica')],
    startHa: true,
    masterBackupPath: '/bk',
  });
});

it('hides the passwords in the summary', () => {
  const sum = summarizeRequests({ dbNames: ['db1'], newNodes: [node('ns1', 'slave')], peers: [node('harep', 'replica')], options }, { convert: true });
  expect(sum.convertMaster).toEqual({ dbNames: ['db1'], confirmMasterRestart: true });
  expect(sum.addNodes.newNodes[0].osPassword).toBe('••••');
  expect(sum.addNodes.existingNodes[0].osPassword).toBe('••••');
});

it('wants at least one new node, each once, none already in the group', () => {
  expect(newNodesProblem([], ['m'])).toBe('none');
  expect(newNodesProblem([node('a', 'slave'), node('a', 'replica')], ['m'])).toBe('duplicate');
  expect(newNodesProblem([node('m', 'slave')], ['m'])).toBe('taken');
  expect(newNodesProblem([node('a', 'slave'), node('b', 'replica')], ['m'])).toBeNull();
});
