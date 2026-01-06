import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { HostService } from '@host';
import { Injectable, Logger } from '@nestjs/common';
import {
    GetBrokerLogListClientResponse,
    GetLogFileInfoCmsResponse as LogFileInfoCmsResponse,
    ViewLogCmsResponse,
    ViewLogClientResponse,
    GetDatabaseLogInfoCmsResponse as LogInfoCmsResponse,
    GetDatabaseLogListClientResponse,
    LoadAccessLogCmsResponse,
    LoadAccessLogClientResponse,
    GetAdminLogInfoCmsResponse,
    GetAdminLogInfoClientResponse,
    BaseCmsRequest,
} from '../type';
import { checkCmsTokenError, checkCmsStatusError } from '@common';

@Injectable()
export class LogService {
    constructor(
        private readonly client: CmsHttpsClientService,
        private readonly hostService: HostService,
    ) {}

    async getBrokerLogList(userId: string, hostUid: string, bname: string) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body: BaseCmsRequest & { broker: string } = {
            task: 'getlogfileinfo',
            token: host.token || '',
            broker: bname,
        };

        const cmsResponse = await this.client.postAuthenticated<BaseCmsRequest & { broker: string }, LogFileInfoCmsResponse>(url, body);

        checkCmsTokenError(cmsResponse);
        checkCmsStatusError(cmsResponse);

        Logger.debug(cmsResponse);
        const response: GetBrokerLogListClientResponse = {
            broker: cmsResponse.broker,
            logfileinfo: cmsResponse.logfileinfo,
        };
        return response;
    }

    async getDatabaseLogList(userId: string, hostUid: string, dbname: string) {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body: BaseCmsRequest & { dbname: string } = {
            task: 'getloginfo',
            token: host.token || '',
            dbname: dbname,
        };

        const cmsResponse = await this.client.postAuthenticated<BaseCmsRequest & { dbname: string }, LogInfoCmsResponse>(url, body);

        checkCmsTokenError(cmsResponse);
        checkCmsStatusError(cmsResponse);

        const response: GetDatabaseLogListClientResponse = {
            dbname: cmsResponse.dbname,
            loginfo: cmsResponse.loginfo,
        };
        return response;
    }

    async getCMSLogList(
        userId: string,
        hostUid: string,
    ): Promise<LoadAccessLogClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body: BaseCmsRequest = {
            task: 'loadaccesslog',
            token: host.token || '',
        };

        const cmsResponse = await this.client.postAuthenticated<BaseCmsRequest, LoadAccessLogCmsResponse>(url, body);

        checkCmsTokenError(cmsResponse);
        checkCmsStatusError(cmsResponse);

        const response: LoadAccessLogClientResponse = {
            accesslog: cmsResponse.accesslog,
            errorlog: cmsResponse.errorlog,
        };
        return response;
    }

    /**
     * View broker log file content.
     * Returns log lines within the specified range.
     *
     * 브로커 로그 파일 내용을 조회합니다.
     * 지정된 범위 내의 로그 라인을 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @param path - Log file path
     * @param start - Start line number (1-based)
     * @param end - End line number (1-based)
     * @returns ViewLogClientResponse Log file content without CMS envelope fields
     */
    async viewLog(
        userId: string,
        hostUid: string,
        path: string,
        start: string,
        end: string,
    ): Promise<ViewLogClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body: BaseCmsRequest & { path: string; start: string; end: string } = {
            task: 'viewlog',
            token: host.token || '',
            path: path,
            start: start,
            end: end,
        };

        const cmsResponse = await this.client.postAuthenticated<BaseCmsRequest & { path: string; start: string; end: string }, ViewLogCmsResponse>(url, body);

        checkCmsTokenError(cmsResponse);
        checkCmsStatusError(cmsResponse);

        const { __EXEC_TIME, note, status, task, ...dataOnly } = cmsResponse;
        return dataOnly;
    }

    /**
     * Get admin log information from a CMS host.
     * Returns admin log file information without CMS envelope fields.
     *
     * CMS 호스트의 관리자 로그 정보를 조회합니다.
     * CMS 메타 필드를 제거한 관리자 로그 파일 정보를 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @returns GetAdminLogInfoClientResponse Admin log information without CMS envelope fields
     */
    async getAdminLogInfo(
        userId: string,
        hostUid: string,
    ): Promise<GetAdminLogInfoClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body: BaseCmsRequest = {
            task: 'getadminloginfo',
            token: host.token || '',
        };

        const cmsResponse = await this.client.postAuthenticated<BaseCmsRequest, GetAdminLogInfoCmsResponse>(url, body);

        checkCmsTokenError(cmsResponse);
        checkCmsStatusError(cmsResponse);

        const { __EXEC_TIME, note, status, task, ...dataOnly } = cmsResponse;
        return dataOnly;
    }
}
