import { expect, it } from 'vitest';
import { buildAddSlaveRequest, buildConvertMasterRequest, convertPlan, summarizeRequests } from './addSlaveRequest';

const node = (host, role, osPassword = 'pw') => ({ role, ssh: { host: ` ${host} `, sshPort: '22', osUser: 'cubrid', osPassword }, check: { hostkey_sha256: `SHA256:${host}` } });
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

it('starts ha_make_slave without any database: CMS takes the whole ha_db_list', () => {
  const body = buildAddSlaveRequest({ slave: node('haslave'), peers: [node('harep', 'replica'), node('hasl1', 'slave')], options });
  expect(body).toEqual({
    slave: { host: 'haslave', sshPort: 22, osUser: 'cubrid', osPassword: 'pw', hostKeyFingerprint: 'SHA256:haslave' },
    startHa: true,
    masterBackupPath: '/bk',
    existingSlaves: [{ host: 'hasl1', sshPort: 22, osUser: 'cubrid', osPassword: 'pw', hostKeyFingerprint: 'SHA256:hasl1' }],
    replicas: [{ host: 'harep', sshPort: 22, osUser: 'cubrid', osPassword: 'pw', hostKeyFingerprint: 'SHA256:harep' }],
  });
  expect(buildAddSlaveRequest({ slave: node('haslave'), peers: [], options })).not.toHaveProperty('replicas');
});

it('hides the passwords in the summary', () => {
  const sum = summarizeRequests({ dbNames: ['db1'], slave: node('haslave'), peers: [node('harep', 'replica'), node('hasl1', 'slave')], options }, { convert: true });
  expect(sum.convertMaster).toEqual({ dbNames: ['db1'], confirmMasterRestart: true });
  expect(sum.addSlave.slave.osPassword).toBe('••••');
  expect(sum.addSlave.replicas[0].osPassword).toBe('••••');
  expect(sum.addSlave.existingSlaves[0].osPassword).toBe('••••');
});
