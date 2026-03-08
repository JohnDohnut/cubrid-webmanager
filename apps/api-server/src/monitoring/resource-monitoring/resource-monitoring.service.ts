import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseService, HandleResourceMonitoringErrors } from '@common';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { BaseCmsRequest, BaseCmsResponse, CmsGetHostStatResponse } from '@root/src/type';

/**
 * Service for managing resource monitoring operations.
 * Currently a placeholder.
 *
 * @category Infrastructure Services
 * @since 1.0.0
 */
@Injectable()
export class ResourceMonitoringService extends BaseService {
  constructor(
    protected readonly client: CmsHttpsClientService,
    protected readonly hostService: HostService
  ) {
    super(hostService, client);
  }

  @HandleResourceMonitoringErrors()
  async getHostStat(
    userId: string,
    hostUid: string
  ): Promise<Omit<CmsGetHostStatResponse, keyof BaseCmsResponse>> {
    const cmsRequest: BaseCmsRequest = {
      task: 'gethoststat',
    };

    const response = await this.executeCmsRequest<BaseCmsRequest, CmsGetHostStatResponse>(
      userId,
      hostUid,
      cmsRequest
    );
    return this.extractDomainData(response);
  }
}
