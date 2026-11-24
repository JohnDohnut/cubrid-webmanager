import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseService, HandleCmsErrors } from '@common';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { HaMakeSlaveJobDto, HaMakeSlaveStartDto, HaSshCheckDto } from '@type/index';
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
 * POC (HA slave setup): CMS tasks on the host that becomes the slave. Its
 * CMS checks the ssh connection to the master and runs the setup step by
 * step itself (master side over ssh). Linux CMS builds only.
 */
const HA_MAKE_SLAVE_TASKS = {
  sshCheck: 'ha_check_ssh',
  start: 'ha_make_slave',
  status: 'ha_make_slave_status',
  cancel: 'ha_make_slave_cancel',
  cleanup: 'ha_make_slave_cleanup',
} as const;
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
   * POC: ssh from this host to the master (CMS ha_check_ssh). Without a
   * fingerprint CMS stops before the password and returns hostkey_unknown
   * with the master's fingerprint; with the one the user confirmed and the
   * password it logs in and compares versions.
   */
  @HandleCmsErrors()
  async checkSshConnection(userId: string, hostUid: string, request: HaSshCheckDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_MAKE_SLAVE_TASKS.sshCheck, {
      host: request.masterHost,
      ssh_port: String(request.sshPort),
      os_user: request.osUser,
      os_password: request.hostKeyFingerprint ? request.osPassword : undefined,
      hostkey_sha256: request.hostKeyFingerprint,
    }), SSH_CHECK_TIMEOUT_MS);
  }

  /** POC: starts the slave setup on this host (CMS ha_make_slave); returns its uuid. */
  @HandleCmsErrors()
  async startMakeSlave(userId: string, hostUid: string, request: HaMakeSlaveStartDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_MAKE_SLAVE_TASKS.start, {
      db_name: request.dbName,
      master_host: request.masterHost,
      ssh_port: String(request.sshPort),
      os_user: request.osUser,
      os_password: request.osPassword,
      hostkey_sha256: request.hostKeyFingerprint,
      slave_host: request.slaveHost,
      repl_log_home: request.replLogHome,
      master_backup_path: request.masterBackupPath,
      slave_backup_path: request.slaveBackupPath,
      start_ha: request.startHa === false ? 'no' : 'yes',
      // Each replica as ha_check_ssh takes it; the log hides os_password at any depth.
      replicas: request.replicas?.length
        ? request.replicas.map((replica) => ({
          host: replica.host,
          ssh_port: String(replica.sshPort),
          os_user: replica.osUser,
          os_password: replica.osPassword,
          hostkey_sha256: replica.hostKeyFingerprint,
        }))
        : undefined,
    }));
  }

  /** POC: the setup's state, its steps, and the progress log after `offset` (CMS ha_make_slave_status). */
  @HandleCmsErrors()
  async makeSlaveStatus(userId: string, hostUid: string, request: HaMakeSlaveJobDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_MAKE_SLAVE_TASKS.status, {
      uuid: request.uuid,
      offset: String(request.offset ?? 0),
    }));
  }

  /** POC: cancels the running setup; CMS then undoes the finished steps (CMS ha_make_slave_cancel). */
  @HandleCmsErrors()
  async cancelMakeSlave(userId: string, hostUid: string, request: HaMakeSlaveJobDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_MAKE_SLAVE_TASKS.cancel, { uuid: request.uuid }));
  }

  /** POC: deletes the old slave database folders a successful setup moved aside (CMS ha_make_slave_cleanup). */
  @HandleCmsErrors()
  async cleanupMakeSlave(userId: string, hostUid: string, request: HaMakeSlaveJobDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_MAKE_SLAVE_TASKS.cleanup, { uuid: request.uuid }));
  }
}
