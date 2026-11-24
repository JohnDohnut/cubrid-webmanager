import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseService, HandleCmsErrors } from '@common';
import { HostService } from '@host';
import { Injectable, NotImplementedException } from '@nestjs/common';
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
 * POC (HA slave setup): CMS tasks for the ssh connection check and the slave
 * setup, which this host's CMS runs step by step (master side over ssh).
 * Filled in from the CMS side's spec; until then the endpoints answer 501.
 */
export const HA_MAKE_SLAVE_TASKS: { sshCheck: string | null; start: string | null; status: string | null; cancel: string | null } = {
  sshCheck: null,
  start: null,
  status: null,
  cancel: null,
};

function pendingSpec(what: string): never {
  throw new NotImplementedException(`HA slave POC: the CMS task for ${what} is not defined yet`);
}

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

  /** POC: ssh from this host to the master; returns the result and the master's host key fingerprint. */
  async checkSshConnection(_userId: string, _hostUid: string, _request: HaSshCheckDto): Promise<Record<string, unknown>> {
    if (!HA_MAKE_SLAVE_TASKS.sshCheck) pendingSpec('the ssh connection check');
    return {};
  }

  /** POC: starts the slave setup on this host; returns the CMS job uuid. */
  async startMakeSlave(_userId: string, _hostUid: string, _request: HaMakeSlaveStartDto): Promise<{ uuid: string }> {
    if (!HA_MAKE_SLAVE_TASKS.start) pendingSpec('the slave setup');
    return { uuid: '' };
  }

  /** POC: the setup's overall state, each step's state, the log after `offset`, and what was undone on failure. */
  async makeSlaveStatus(_userId: string, _hostUid: string, _request: HaMakeSlaveJobDto): Promise<Record<string, unknown>> {
    if (!HA_MAKE_SLAVE_TASKS.status) pendingSpec('the setup progress');
    return {};
  }

  /** POC: cancels the running setup. */
  async cancelMakeSlave(_userId: string, _hostUid: string, _request: HaMakeSlaveJobDto): Promise<Record<string, unknown>> {
    if (!HA_MAKE_SLAVE_TASKS.cancel) pendingSpec('the setup cancel');
    return {};
  }
}
