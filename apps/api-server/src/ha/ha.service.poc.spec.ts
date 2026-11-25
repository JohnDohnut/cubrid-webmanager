import { Test, TestingModule } from '@nestjs/testing';
import { HaService } from './ha.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';

// POC (HA slave add): the requests the host-level tasks get, and the
// conversion's answer when a restart is not confirmed yet.
describe('HaService HA slave add POC', () => {
  let service: HaService;
  let cmsClient: { postAuthenticated: jest.Mock };
  const host = { uid: 'h1', id: 'admin', address: '10.0.0.1', port: 8001, token: 't', alias: 'm', dbProfiles: {} };
  const sent = () => cmsClient.postAuthenticated.mock.calls[0][1];
  const node = { host: 'haslave', sshPort: 22, osUser: 'cubrid', osPassword: 'pw', hostKeyFingerprint: 'SHA256:x' };

  beforeEach(async () => {
    cmsClient = { postAuthenticated: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HaService,
        { provide: HostService, useValue: { findHostInternal: jest.fn().mockResolvedValue(host) } },
        { provide: CmsHttpsClientService, useValue: cmsClient },
      ],
    }).compile();
    service = module.get(HaService);
  });

  it('sends the databases picked and both restart confirmations to ha_convert_master', async () => {
    cmsClient.postAuthenticated.mockResolvedValue({ status: 'success', note: 'none', task: 'ha_convert_master', uuid: 'u1', job_status: 'running' });
    const res = await service.convertMaster('user', 'h1', { dbNames: ['db1', 'db2'], confirmMasterRestart: true, confirmOtherDbRestart: true });
    expect(sent()).toMatchObject({ task: 'ha_convert_master', db_names: 'db1,db2', confirm_master_restart: 'yes', confirm_other_db_restart: 'yes' });
    expect(sent()).not.toHaveProperty('db_name');
    expect(res).toMatchObject({ uuid: 'u1', job_status: 'running' });
  });

  it('leaves out the other-database confirmation when it is not given', async () => {
    cmsClient.postAuthenticated.mockResolvedValue({ status: 'success', note: 'none', task: 'ha_convert_master', uuid: 'u1' });
    await service.convertMaster('user', 'h1', { dbNames: ['db1'], confirmMasterRestart: true });
    expect(sent()).not.toHaveProperty('confirm_other_db_restart');
  });

  it('returns the restart lists, not an error, when CMS asks for a confirmation', async () => {
    cmsClient.postAuthenticated.mockResolvedValue({
      status: 'failure',
      note: 'confirm_other_db_restart',
      task: 'ha_convert_master',
      ha_databases: ['db1'],
      restart_databases: ['db1', 'db2'],
      other_running_databases: ['db2'],
      single_databases: ['db2', 'db3'],
      message: 'db2 restarts too',
    });
    const res = await service.convertMaster('user', 'h1', { dbNames: ['db1'], confirmMasterRestart: true });
    expect(res).toEqual({
      confirm: 'confirm_other_db_restart',
      ha_databases: ['db1'],
      restart_databases: ['db1', 'db2'],
      other_running_databases: ['db2'],
      single_databases: ['db2', 'db3'],
      message: 'db2 restarts too',
    });
  });

  it('still fails on any other refusal', async () => {
    cmsClient.postAuthenticated.mockResolvedValue({ status: 'failure', note: 'already_ha', task: 'ha_convert_master' });
    await expect(service.convertMaster('user', 'h1', { dbNames: ['db1'], confirmMasterRestart: true })).rejects.toBeTruthy();
  });

  it('starts ha_make_slave without a database name: CMS takes every database in ha_db_list', async () => {
    cmsClient.postAuthenticated.mockResolvedValue({ status: 'success', note: 'none', task: 'ha_make_slave', uuid: 'u2', db_names: ['db1', 'db2'] });
    const res = await service.startAddSlave('user', 'h1', { slave: node, replicas: [{ ...node, host: 'harep' }] });
    expect(sent()).toMatchObject({ task: 'ha_make_slave', slave_host: 'haslave', os_password: 'pw', start_ha: 'yes' });
    expect(sent()).not.toHaveProperty('db_name');
    expect(sent().replicas).toEqual([{ host: 'harep', ssh_port: '22', os_user: 'cubrid', os_password: 'pw', hostkey_sha256: 'SHA256:x' }]);
    expect(res).toMatchObject({ uuid: 'u2', db_names: ['db1', 'db2'] });
  });
});
