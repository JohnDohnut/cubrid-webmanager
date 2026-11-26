import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseService, HandleCmsErrors } from '@common';
import { HostService } from '@host';
import { DatabaseUserService } from '@database/user/database-user.service';
import { Injectable } from '@nestjs/common';
import { HaAddNodesCleanupDto, HaAddNodesDto, HaAddNodesJobDto, HaAddNodesRollbackDto, HaNewNodeDto, HaSshCheckDto, HaSshNodeDto } from '@type/index';
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
 * POC (HA node add): CMS tasks on the host the job runs from (the master, or
 * a single server it first promotes to one). Its CMS checks ssh to each node
 * and runs the add-nodes script, which adds new slaves and replicas over ssh.
 * Linux CMS builds only.
 */
const HA_NODES_TASKS = {
  sshCheck: 'ha_check_ssh',
  addNodes: 'ha_add_nodes',
  status: 'ha_add_nodes_status',
  cancel: 'ha_add_nodes_cancel',
} as const;
// ha_check_ssh answers within about 20 seconds.
const SSH_CHECK_TIMEOUT_MS = 40_000;

type CmsPocRequest = { task: string } & Record<string, unknown>;

@Injectable()
export class HaService extends BaseService {
  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService,
    private readonly databaseUserService: DatabaseUserService
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
    return this.pocCall(userId, hostUid, this.pocRequest(HA_NODES_TASKS.sshCheck, {
      host: request.host,
      ssh_port: String(request.sshPort),
      os_user: request.osUser,
      os_password: request.hostKeyFingerprint ? request.osPassword : undefined,
      hostkey_sha256: request.hostKeyFingerprint,
    }), SSH_CHECK_TIMEOUT_MS);
  }

  /** A node as ha_check_ssh and ha_add_nodes take it; the log hides os_password at any depth. */
  private nodeFields(n: HaSshNodeDto) {
    return {
      host: n.host,
      ssh_port: String(n.sshPort),
      os_user: n.osUser,
      os_password: n.osPassword,
      hostkey_sha256: n.hostKeyFingerprint,
    };
  }

  private newNodeFields(n: HaNewNodeDto) {
    return { role: n.role, ...this.nodeFields(n) };
  }

  /**
   * The logins of the databases the user is logged in to now, for CMS to look
   * for tables without a primary key. A database with only a saved login (not
   * logged in, or logged out) is left out: nothing is read from it.
   */
  private async liveDbAccounts(userId: string, hostUid: string, dbNames: string[] = []) {
    if (dbNames.length === 0) return undefined;
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const accounts = dbNames
      .filter((db) => this.databaseUserService.isDbLoginActive(userId, hostUid, db, host.token))
      .map((db) => ({ db, profile: host.dbProfiles?.[db] }))
      .filter(({ profile }) => profile && !profile.loggedOut && profile.id)
      .map(({ db, profile }) => ({ db, user: profile.id, password: profile.password ?? '' }));
    return accounts.length > 0 ? accounts : undefined;
  }

  /**
   * POC: starts a job (CMS ha_add_nodes): `plan` checks every node and writes
   * what run would do, changing nothing; `run` adds the new nodes. Returns its
   * uuid; the result comes through status. The restart confirmations go only
   * with run.
   */
  @HandleCmsErrors()
  async addNodes(userId: string, hostUid: string, request: HaAddNodesDto) {
    const run = request.action === 'run';
    const yes = (on?: boolean) => (run && on ? 'yes' : undefined);
    const promoting = (request.dbNames?.length ?? 0) > 0;
    return this.pocCall(userId, hostUid, this.pocRequest(HA_NODES_TASKS.addNodes, {
      action: request.action,
      new_nodes: request.newNodes.map((n) => this.newNodeFields(n)),
      existing_nodes: request.existingNodes.map((n) => this.nodeFields(n)),
      db_names: promoting ? request.dbNames.join(',') : undefined,
      confirm_master_restart: yes(request.confirmMasterRestart),
      confirm_other_db_restart: yes(request.confirmOtherDbRestart),
      confirm_new_node_db_restart: yes(request.confirmNewNodeDbRestart),
      rollback_convert: promoting ? (request.rollbackConvert ? 'yes' : 'no') : undefined,
      start_ha: request.startHa === false ? 'no' : 'yes',
      db_accounts: run ? undefined : await this.liveDbAccounts(userId, hostUid, request.checkDbNames),
    }));
  }

  /** POC: a job's state, its steps, the plan and the log after `offset` (CMS ha_add_nodes_status). */
  @HandleCmsErrors()
  async addNodesStatus(userId: string, hostUid: string, request: HaAddNodesJobDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_NODES_TASKS.status, {
      uuid: request.uuid,
      offset: String(request.offset ?? 0),
    }));
  }

  /** POC: cancels the running job; the script then undoes what it changed (CMS ha_add_nodes_cancel). */
  @HandleCmsErrors()
  async cancelAddNodes(userId: string, hostUid: string, request: HaAddNodesJobDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_NODES_TASKS.cancel, { uuid: request.uuid }));
  }

  /** POC: undoes what an interrupted job changed, from its undo record (CMS ha_add_nodes, action rollback, same uuid). */
  @HandleCmsErrors()
  async rollbackAddNodes(userId: string, hostUid: string, request: HaAddNodesRollbackDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_NODES_TASKS.addNodes, {
      action: 'rollback',
      uuid: request.uuid,
      new_nodes: request.newNodes.map((n) => this.newNodeFields(n)),
      existing_nodes: request.existingNodes.map((n) => this.nodeFields(n)),
    }));
  }

  /** POC: deletes the old database folders a successful job moved aside on the new nodes (CMS ha_add_nodes, action cleanup). */
  @HandleCmsErrors()
  async cleanupAddNodes(userId: string, hostUid: string, request: HaAddNodesCleanupDto) {
    return this.pocCall(userId, hostUid, this.pocRequest(HA_NODES_TASKS.addNodes, {
      action: 'cleanup',
      uuid: request.uuid,
      new_nodes: request.newNodes.map((n) => this.newNodeFields(n)),
    }));
  }
}
