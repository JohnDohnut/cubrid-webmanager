import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { HandleResourceMonitoringErrors } from '@common';
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
export class ResourceMonitoringService {

    constructor(
        private readonly client : CmsHttpsClientService,
        private readonly hostService : HostService,
    ){}
    @HandleResourceMonitoringErrors()
    async getHostStat(userId : string, hostUid : string) : Promise<Omit<CmsGetHostStatResponse, keyof BaseCmsResponse>>{

        const host = await this.hostService.findHostInternal(userId, hostUid);

        const url = `https://${host.address}:${host.port}/cm_api`
        const body = {
            token : host.token || "",
            task : "gethoststat"
        }

        const response = await this.client.postAuthenticated<BaseCmsRequest, CmsGetHostStatResponse>(url, body);
        const {__EXEC_TIME, task, status, note, ...dataOnly} = response
        return dataOnly;

    }

}

