import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseService, HandleCmsErrors } from '@common';
import { HostService } from '@host';
import { CmsError } from '@error/cms/cms-error';
import { Injectable } from '@nestjs/common';
import { HaAddSlaveStartDto, HaConvertMasterDto, HaSlaveCleanupDto, HaSlaveJobDto, HaSshCheckDto, HaSshNodeDto } from '@type/index';
import {
  HaReloadCmsRequest,
  HaStartDatabaseCmsRequest,
  HaStartNodeCmsRequest,
  HaStopDatabaseCmsRequest,
  HaStopNodeCmsRequest,
  HeartbeatListCmsRequest,
} from '@type/cms-request';
import {
  HaReloadCmsResponse,
  HaStartDatabaseCmsResponse,
  HaStopDatabaseCmsResponse,
  HeartbeatListCmsResponse,
} from '@type/cms-response';
import { HeartbeatListClientRequest, HeartbeatListClientResponse } from '@api-interfaces';

/**
 * POC (HA slave add): CMS tasks on the master. Its CMS checks ssh to the new
 * slave and each replica, turns a single database into an HA master if
 * needed, and builds the new slave over ssh. Linux CMS builds only.
 */
const HA_SLAVE_TASKS = {
  sshCheck: 'ha_check_ssh',
  convertMaster: 'ha_convert_master',
  makeSlave: 'ha_make_slave',
  status: 'ha_make_slave_status',
  cancel: 'ha_make_slave_cancel',
  cleanup: 'ha_make_slave_cleanup',
} as const;
// ha_convert_master's answers when a restart is not confirmed yet (it then does not start).
const CONVERT_CONFIRM_NOTES = new Set(['confirm_master_restart', 'confirm_other_db_restart']);
// ha_check_ssh answers within about 20 seconds.
const SSH_CHECK_TIMEOUT_MS = 40_000;

type CmsPocRequest = { task: string } & Record<string, unknown>;

@Injectable()
export class HaService extends BaseService {
  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService
  ) {
    super(hostService, cmsClient);
  }

  /**
   * Get HA heartbeat list data.
   * CMS task: heartbeatlist.
   */
  @HandleCmsErrors()
  async heartbeatList(
    userId: string,
    hostUid: string,
    request: HeartbeatListClientRequest
  ): Promise<HeartbeatListClientResponse> {
    const cmsRequest: HeartbeatListCmsRequest = {
      task: 'heartbeatlist',
      dbmodeall: request.dbmodeall,
    };

    const response = await this.executeCmsRequest<
      HeartbeatListCmsRequest,
      HeartbeatListCmsResponse
    >(userId, hostUid, cmsRequest);

    const data = this.extractDomainData(response);
    const hadbinfolist = Array.isArray(data.hadbinfolist)
      ? data.hadbinfolist
      : (data.hadbinfolist ?? {});

    return {
      ...data,
      hadbinfolist,
      hanodelist: data.hanodelist ?? [],
    };
  }

  /**
   * `dbmodeall` 'y' also runs `cubrid changemode` for every database
   * (hadbinfolist); 'n' with no dblist gives only the nodes
   * (currentnode, currentnodestate, hanodelist), which is all a caller that
   * only needs node roles should ask for (CMS cm_job_task.cpp
   * ts_heartbeat_list, record_ha_topology_to_struct).
   */
  @HandleCmsErrors()
  async heartbeatlistInternal(
    userId: string,
    hostUid: string,
    dbmodeall: 'y' | 'n' = 'y'
  ): Promise<HeartbeatListCmsResponse> {
    const cmsRequest: HeartbeatListCmsRequest = {
      task: 'heartbeatlist',
      dbmodeall,
    };
    return this.executeCmsRequest(userId, hostUid, cmsRequest);
  }

  /**
   * CMS `ha_start` — `{ task, dbname }` + token; success envelope `task: 'ha_start'`.
   * Always one database (`cubrid heartbeat start <db>`); callers starting
   * several send them one at a time, since parallel calls race cub_master's
   * HA activation.
   */
  @HandleCmsErrors()
  async haStart(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<HaStartDatabaseCmsResponse> {
    const cmsRequest: HaStartDatabaseCmsRequest = { task: 'ha_start', dbname };
    return this.executeAsyncCmsJobRequest<HaStartDatabaseCmsRequest, HaStartDatabaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );
  }

  /**
   * CMS `ha_stop` — `{ task, dbname }` + token; success envelope `task: 'ha_stop'`.
   * Always one database (`cubrid heartbeat stop <db>`) — see
   * HaStopDatabaseCmsRequest for why only haStopNode, for a whole-service
   * stop, sends it without one.
   */
  @HandleCmsErrors()
  async haStop(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<HaStopDatabaseCmsResponse> {
    const cmsRequest: HaStopDatabaseCmsRequest = { task: 'ha_stop', dbname };
    return this.executeAsyncCmsJobRequest<HaStopDatabaseCmsRequest, HaStopDatabaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );
  }
  /**
   * CMS `ha_start` without a dbname (`cubrid heartbeat start`): starts
   * cub_master if needed, activates HA and brings up every `ha_db_list`
   * database. If one of them fails, the engine takes the node's HA down
   * again. Only the whole-service start sends it (its own type, so no
   * other path can leave the dbname out).
   */
  @HandleCmsErrors()
  async haStartNode(userId: string, hostUid: string): Promise<HaStartDatabaseCmsResponse> {
    const cmsRequest: HaStartNodeCmsRequest = { task: 'ha_start' };
    return this.executeAsyncCmsJobRequest<HaStartNodeCmsRequest, HaStartDatabaseCmsResponse>(userId, hostUid, cmsRequest);
  }

  /**
   * CMS `ha_stop` without a dbname (`cubrid heartbeat stop`): deactivates
   * heartbeat on the node, stopping its HA servers, copylogdb and applylogdb;
   * cub_master, CMS and non-HA databases keep running. Only the
   * whole-service stop sends it.
   */
  @HandleCmsErrors()
  async haStopNode(userId: string, hostUid: string): Promise<HaStopDatabaseCmsResponse> {
    const cmsRequest: HaStopNodeCmsRequest = { task: 'ha_stop' };
    return this.executeAsyncCmsJobRequest<HaStopNodeCmsRequest, HaStopDatabaseCmsResponse>(userId, hostUid, cmsRequest);
  }


  /**
   * CMS `ha_reload` — `{ task: 'ha_reload' }` + token; success envelope `task: 'ha_reload'`.
   */
  @HandleCmsErrors()
  async haReload(userId: string, hostUid: string): Promise<HaReloadCmsResponse> {
    const cmsRequest: HaReloadCmsRequest = {
      task: 'ha_reload',
    };
    return this.executeAsyncCmsJobRequest<HaReloadCmsRequest, HaReloadCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );
  }

  /** CMS fields of a POC call, without empty optional values. */
  private pocRequest(task: string, fields: Record<string, unknown>): CmsPocRequest {
    const request: CmsPocRequest = { task };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null && value !== '') request[key] = value;
    }
    return request;
  }

  private async pocCall(userId: string, hostUid: string, request: CmsPocRequest, timeoutMs?: number) {
    const response = await this.executeCmsRequest<CmsPocRequest, Record<string, unknown>>(
      userId,
      hostUid,
      request,
      timeoutMs ? { timeoutMs } : undefined
    );
    return this.extractDomainData(response as { __EXEC_TIME?: unknown; note?: unknown; status?: unknown; task?: unknown });
  }

  /**
   * POC: ssh from this host (the master) to the new slave or a replica (CMS
   * ha_check_ssh). Without a fingerprint CMS stops before the password and
   * returns hostkey_unknown with the node's key; with the one the user
   * confirmed and the password it logs in and compares versions.
   */
  @HandleCmsErrors()
  async checkSshConnection(userId: string, hostUid: string, request: HaSshCheckDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_SLAVE_TASKS.sshCheck, {
      host: request.host,
      ssh_port: String(request.sshPort),
      os_user: request.osUser,
      os_password: request.hostKeyFingerprint ? request.osPassword : undefined,
      hostkey_sha256: request.hostKeyFingerprint,
    }), SSH_CHECK_TIMEOUT_MS);
  }

  /**
   * POC: turns this single (non-HA) host into a one-node HA master with the
   * databases picked as its ha_db_list; every running database restarts
   * (CMS ha_convert_master). When a restart is not confirmed yet CMS does
   * not start: that answer (which confirmation, and the databases that
   * restart or stay single) comes back as data with `confirm`, for the
   * screen to show before it asks again.
   */
  @HandleCmsErrors()
  async convertMaster(userId: string, hostUid: string, request: HaConvertMasterDto) {
    const cmsRequest = this.pocRequest(HA_SLAVE_TASKS.convertMaster, {
      db_names: request.dbNames.join(','),
      confirm_master_restart: request.confirmMasterRestart ? 'yes' : undefined,
      confirm_other_db_restart: request.confirmOtherDbRestart ? 'yes' : undefined,
      master_host: request.masterHost,
      ha_group: request.haGroup,
      ha_port_id: request.haPortId === undefined ? undefined : String(request.haPortId),
    });
    try {
      return await this.pocCall(userId, hostUid, cmsRequest);
    } catch (err) {
      const response = err instanceof CmsError ? err.additionalData?.response : undefined;
      const note = typeof response?.note === 'string' ? response.note : '';
      if (!CONVERT_CONFIRM_NOTES.has(note)) throw err;
      return {
        confirm: note,
        ha_databases: response.ha_databases,
        restart_databases: response.restart_databases,
        other_running_databases: response.other_running_databases,
        single_databases: response.single_databases,
        message: response.message,
      };
    }
  }

  /** POC: adds a new slave from this host, the HA master, for every database in its ha_db_list (CMS ha_make_slave); returns its uuid and those databases. */
  @HandleCmsErrors()
  async startAddSlave(userId: string, hostUid: string, request: HaAddSlaveStartDto) {
    // Each node as ha_check_ssh takes it; the log hides os_password at any depth.
    const node = (n: HaSshNodeDto) => ({
      host: n.host,
      ssh_port: String(n.sshPort),
      os_user: n.osUser,
      os_password: n.osPassword,
      hostkey_sha256: n.hostKeyFingerprint,
    });
    const slave = node(request.slave);
    return this.pocCall(userId, hostUid, this.pocRequest(HA_SLAVE_TASKS.makeSlave, {
      slave_host: slave.host,
      ssh_port: slave.ssh_port,
      os_user: slave.os_user,
      os_password: slave.os_password,
      hostkey_sha256: slave.hostkey_sha256,
      // The existing nodes: CMS takes both keys and merges them, and tells slaves from replicas by the master's settings.
      existing_nodes: request.existingSlaves?.length ? request.existingSlaves.map(node) : undefined,
      replicas: request.replicas?.length ? request.replicas.map(node) : undefined,
      master_host: request.masterHost,
      repl_log_home: request.replLogHome,
      master_backup_path: request.masterBackupPath,
      slave_backup_path: request.slaveBackupPath,
      start_ha: request.startHa === false ? 'no' : 'yes',
    }));
  }

  /** POC: a job's state, its steps, and the log after `offset`; conversion and slave add alike (CMS ha_make_slave_status). */
  @HandleCmsErrors()
  async slaveJobStatus(userId: string, hostUid: string, request: HaSlaveJobDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_SLAVE_TASKS.status, {
      uuid: request.uuid,
      offset: String(request.offset ?? 0),
    }));
  }

  /** POC: cancels the running job; CMS then undoes the finished steps (CMS ha_make_slave_cancel). */
  @HandleCmsErrors()
  async cancelSlaveJob(userId: string, hostUid: string, request: HaSlaveJobDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_SLAVE_TASKS.cancel, { uuid: request.uuid }));
  }

  /** POC: deletes the old database folders a successful slave add moved aside on the new slave (CMS ha_make_slave_cleanup). */
  @HandleCmsErrors()
  async cleanupSlaveJob(userId: string, hostUid: string, request: HaSlaveCleanupDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_SLAVE_TASKS.cleanup, { uuid: request.uuid, os_password: request.osPassword }));
  }
}
