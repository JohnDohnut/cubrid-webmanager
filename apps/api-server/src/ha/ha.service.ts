import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseService, HandleCmsHttpsClientErrors, HandleHostErrors } from '@common';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { HeartbeatListCmsRequest } from '@type/cms-request';
import { HeartbeatListCmsResponse } from '@type/cms-response';
import { HeartbeatListClientRequest, HeartbeatListClientResponse } from '@api-interfaces';

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
  @HandleHostErrors()
  @HandleCmsHttpsClientErrors()
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

    const hadbinfolist = Array.isArray(response.hadbinfolist)
      ? response.hadbinfolist
      : (response.hadbinfolist ?? {});

    return {
      __EXEC_TIME: response.__EXEC_TIME,
      currentnode: response.currentnode,
      currentnodestate: response.currentnodestate,
      hadbinfolist,
      hanodelist: response.hanodelist ?? [],
      note: response.note ?? 'none',
      status: response.status ?? 'success',
      task: response.task ?? 'heartbeatlist',
    };
  }

  @HandleHostErrors()
  @HandleCmsHttpsClientErrors()
  async heartbeatlistInternal(userId : string, hostUid : string): Promise<HeartbeatListCmsResponse>{
    const cmsRequest : HeartbeatListCmsRequest = {
      task : 'heartbeatlist',
      dbmodeall : 'y'
    }
    return this.executeCmsRequest(userId, hostUid, cmsRequest)
  }
}