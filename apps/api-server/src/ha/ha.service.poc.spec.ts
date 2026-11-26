import { Test, TestingModule } from '@nestjs/testing';
import { HaService } from './ha.service';
import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { DatabaseUserService } from '@database/user/database-user.service';
import { HaJobRegistry } from './ha-job-registry';

// POC (HA node add): what the ha_add_nodes tasks get from the wizard's requests.
describe('HaService HA node add POC', () => {
  let service: HaService;
  let cmsClient: { postAuthenticated: jest.Mock };
  let isDbLoginActive: jest.Mock;
  let registry: { add: jest.Mock; list: jest.Mock };
  const host = {
    uid: 'h1', id: 'admin', address: '10.0.0.1', port: 8001, token: 't', alias: 'm',
    dbProfiles: {
      hadb: { dbname: 'hadb', id: 'dba', password: 'dbpw' },
      hadb2: { dbname: 'hadb2', id: 'dba', password: 'dbpw2' },
      gone: { dbname: 'gone', id: 'dba', password: 'x', loggedOut: true },
    },
  };
  const sent = () => cmsClient.postAuthenticated.mock.calls[0][1];
  const node = (host: string) => ({ host, sshPort: 22, osUser: 'cubrid', osPassword: 'pw', hostKeyFingerprint: `SHA256:${host}` });
  const cmsNode = (host: string) => ({ host, ssh_port: '22', os_user: 'cubrid', os_password: 'pw', hostkey_sha256: `SHA256:${host}` });

  beforeEach(async () => {
    cmsClient = { postAuthenticated: jest.fn().mockResolvedValue({ status: 'success', note: 'none', task: 'ha_add_nodes', uuid: 'u1', job_status: 'running' }) };
    isDbLoginActive = jest.fn();
    registry = { add: jest.fn(), list: jest.fn().mockResolvedValue([]) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HaService,
        { provide: HostService, useValue: { findHostInternal: jest.fn().mockResolvedValue(host) } },
        { provide: CmsHttpsClientService, useValue: cmsClient },
        { provide: DatabaseUserService, useValue: { isDbLoginActive } },
        { provide: HaJobRegistry, useValue: registry },
      ],
    }).compile();
    service = module.get(HaService);
  });

  it('plans with every node, no confirmation, and the logins of the databases logged in to now only', async () => {
    isDbLoginActive.mockImplementation((_u, _h, db) => db === 'hadb' || db === 'gone');
    const res = await service.addNodes('user', 'h1', {
      action: 'plan',
      newNodes: [{ ...node('nx1'), role: 'slave' }, { ...node('ny1'), role: 'replica' }],
      existingNodes: [node('hasl1')],
      confirmMasterRestart: true,
      checkDbNames: ['hadb', 'hadb2', 'gone'],
    });
    expect(sent()).toEqual(expect.objectContaining({
      task: 'ha_add_nodes',
      action: 'plan',
      new_nodes: [{ role: 'slave', ...cmsNode('nx1') }, { role: 'replica', ...cmsNode('ny1') }],
      existing_nodes: [cmsNode('hasl1')],
      start_ha: 'yes',
      // hadb2: saved login only; gone: logged out. Neither goes.
      db_accounts: [{ db: 'hadb', user: 'dba', password: 'dbpw' }],
    }));
    expect(sent()).not.toHaveProperty('confirm_master_restart');
    expect(sent()).not.toHaveProperty('db_names');
    expect(res).toMatchObject({ uuid: 'u1', job_status: 'running' });
  });

  it('runs a promotion with the databases picked and the confirmations given, and no database logins', async () => {
    isDbLoginActive.mockReturnValue(true);
    await service.addNodes('user', 'h1', {
      action: 'run',
      newNodes: [{ ...node('nx1'), role: 'slave' }],
      existingNodes: [],
      dbNames: ['hadb', 'hadb2'],
      confirmMasterRestart: true,
      confirmOtherDbRestart: true,
      confirmNewNodeDbRestart: false,
      rollbackConvert: true,
      startHa: false,
      checkDbNames: ['hadb'],
    });
    expect(sent()).toEqual(expect.objectContaining({
      action: 'run',
      db_names: 'hadb,hadb2',
      confirm_master_restart: 'yes',
      confirm_other_db_restart: 'yes',
      rollback_convert: 'yes',
      start_ha: 'no',
      existing_nodes: [],
    }));
    expect(sent()).not.toHaveProperty('confirm_new_node_db_restart');
    expect(sent()).not.toHaveProperty('db_accounts');
    // The run is kept to find again, with the nodes' logins but never a password.
    expect(registry.add).toHaveBeenCalledWith('user', 'h1', expect.objectContaining({
      uuid: 'u1',
      action: 'run',
      newNodes: [{ role: 'slave', host: 'nx1', sshPort: 22, osUser: 'cubrid', hostKeyFingerprint: 'SHA256:nx1' }],
      existingNodes: [],
    }));
    expect(JSON.stringify(registry.add.mock.calls[0][2])).not.toContain('pw');
  });

  it('keeps no record of a plan', async () => {
    await service.addNodes('user', 'h1', { action: 'plan', newNodes: [{ ...node('nx1'), role: 'slave' }], existingNodes: [] });
    expect(registry.add).not.toHaveBeenCalled();
  });

  it('leaves the logins out when none is live', async () => {
    isDbLoginActive.mockReturnValue(false);
    await service.addNodes('user', 'h1', { action: 'plan', newNodes: [{ ...node('nx1'), role: 'slave' }], existingNodes: [], checkDbNames: ['hadb'] });
    expect(sent()).not.toHaveProperty('db_accounts');
  });

  it('reads status, cancels, and cleans up with the new nodes\' logins', async () => {
    await service.addNodesStatus('user', 'h1', { uuid: 'u1', offset: 30 });
    expect(sent()).toEqual(expect.objectContaining({ task: 'ha_add_nodes_status', uuid: 'u1', offset: '30' }));
    cmsClient.postAuthenticated.mockClear();
    await service.cancelAddNodes('user', 'h1', { uuid: 'u1' });
    expect(sent()).toEqual(expect.objectContaining({ task: 'ha_add_nodes_cancel', uuid: 'u1' }));
    cmsClient.postAuthenticated.mockClear();
    await service.rollbackAddNodes('user', 'h1', { uuid: 'u1', newNodes: [{ ...node('nx1'), role: 'slave' }], existingNodes: [node('hasl1')] });
    expect(sent()).toEqual(expect.objectContaining({ task: 'ha_add_nodes', action: 'rollback', uuid: 'u1', new_nodes: [{ role: 'slave', ...cmsNode('nx1') }], existing_nodes: [cmsNode('hasl1')] }));
    cmsClient.postAuthenticated.mockClear();
    await service.cleanupAddNodes('user', 'h1', { uuid: 'u1', newNodes: [{ ...node('nx1'), role: 'slave' }] });
    expect(sent()).toEqual(expect.objectContaining({ task: 'ha_add_nodes', action: 'cleanup', uuid: 'u1', new_nodes: [{ role: 'slave', ...cmsNode('nx1') }] }));
  });
});
