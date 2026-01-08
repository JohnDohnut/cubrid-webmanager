import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { CmsForwardClientRequest, GetEnvClientResponse, GetAllSysParamClientResponse, ParamdumpClientResponse, SetSysParamClientResponse, StatdumpClientResponse } from '@api-interfaces';
import { ParamdumpCmsRequest, SetSysParamCmsRequest, StatdumpCmsRequest, BaseCmsRequest } from '@type';
import { GetEnvCmsResponse } from '@type/cms-response/get-env-cms-response';
import { GetAllSysParamCmsRequest } from '@type/cms-request/get-all-sys-param-cms-request';
import { GetAllSysParamCmsResponse } from '@type/cms-response/get-all-sys-param-cms-response';
import { ParamdumpCmsResponse } from '@type/cms-response/paramdump-cms-response';
import { StatdumpCmsResponse } from '@type/cms-response/statdump-cms-response';
import { BaseCmsResponse } from '@type/cms-response/base-cms-response';
import { HandleCmsConfigErrors, checkCmsTokenError, checkCmsStatusError } from '@common';

/**
 * Service for managing CMS environment configuration operations.
 *
 * Provides methods to retrieve environment information from CMS hosts
 * including CUBRID version, broker version, database paths, and system information.
 *
 * CMS 환경 구성 작업을 관리하는 서비스입니다.
 *
 * CUBRID 버전, 브로커 버전, 데이터베이스 경로, 시스템 정보 등
 * CMS 호스트의 환경 정보를 조회하는 메서드를 제공합니다.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class CmsConfigService {

    constructor(
        private readonly hostService : HostService,
        private readonly cmsClient : CmsHttpsClientService,
    ){}

    /**
     * Get environment information from a CMS host.
     * Returns domain-only data (CMS envelope removed).
     *
     * CMS 호스트의 환경 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @returns GetEnvClientResponse Environment information without CMS envelope fields
     * @throws Error if the request fails or CMS status is not success
     */
    @HandleCmsConfigErrors()
    async getEnv(userId: string, hostUid: string): Promise<GetEnvClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body: BaseCmsRequest = {
            task: 'getenv',
            token: host.token || '',
        };

        const response = await this.cmsClient.postAuthenticated<BaseCmsRequest, GetEnvCmsResponse>(url, body);

        checkCmsTokenError(response);

        if (response.status === 'success') {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }

        checkCmsStatusError(response, `Failed to get environment info: ${response.note || 'Unknown error'}`);
        throw new Error(`Failed to get environment info: ${response.note || 'Unknown error'}`);
    }

    /**
     * Get database parameters dump from a CMS host.
     * Returns domain-only data (CMS envelope removed).
     *
     * CMS 호스트의 데이터베이스 파라미터 덤프를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @param dbname - Database name
     * @returns ParamdumpClientResponse Database parameters without CMS envelope fields
     * @throws Error if the request fails or CMS status is not success
     */
    @HandleCmsConfigErrors()
    async getParamDump(
        userId: string,
        hostUid: string,
        dbname: string,
    ): Promise<ParamdumpClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request: BaseCmsRequest & { dbname: string; both: 'n' } = {
            task: 'paramdump',
            token: host.token || '',
            both: 'n',
            dbname: dbname,
        };

        const response = await this.cmsClient.postAuthenticated<BaseCmsRequest & { dbname: string; both: 'n' }, ParamdumpCmsResponse>(url, request);

        checkCmsTokenError(response);

        if (response.status === 'success') {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }

        checkCmsStatusError(response, `Failed to get paramdump: ${response.note || 'Unknown error'}`);
        throw new Error(
            `Failed to get paramdump: ${response.note || 'Unknown error'}`,
        );
    }

    /**
     * Get database statistics dump from a CMS host.
     * Returns domain-only data (CMS envelope removed).
     *
     * CMS 호스트의 데이터베이스 통계 덤프(statdump)를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @param dbname - Database name
     * @returns StatdumpClientResponse Database statistics without CMS envelope fields
     * @throws Error if the request fails or CMS status is not success
     */
    @HandleCmsConfigErrors()
    async getStatDump(
        userId: string,
        hostUid: string,
        dbname: string,
    ): Promise<StatdumpClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;

        const request: BaseCmsRequest & { dbname: string } = {
            task: 'statdump',
            token: host.token || '',
            dbname,
        };

        const response = await this.cmsClient.postAuthenticated<BaseCmsRequest & { dbname: string }, StatdumpCmsResponse>(url, request);

        checkCmsTokenError(response);

        if (response.status === 'success') {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }

        checkCmsStatusError(response, `Failed to get statdump: ${response.note || 'Unknown error'}`);
        throw new Error(`Failed to get statdump: ${response.note || 'Unknown error'}`);
    }

    /**
     * Get all system parameters from a configuration file on a CMS host.
     * Returns domain-only data (CMS envelope removed).
     *
     * CMS 호스트의 설정 파일에서 모든 시스템 파라미터를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @param confname - Configuration file name (e.g., "cubridconf", "broker.conf")
     * @returns GetAllSysParamClientResponse System parameters without CMS envelope fields
     * @throws Error if the request fails or CMS status is not success
     */
    @HandleCmsConfigErrors()
    async getAllSystemParam(
        userId: string,
        hostUid: string,
        confname: string,
    ): Promise<GetAllSysParamClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request: GetAllSysParamCmsRequest = {
            task: 'getallsysparam',
            token: host.token || '',
            confname: confname,
        };

        const response = await this.cmsClient.postAuthenticated<GetAllSysParamCmsRequest, GetAllSysParamCmsResponse>(url, request);

        checkCmsTokenError(response);

        if (response.status === 'success') {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }

        checkCmsStatusError(response, `Failed to get all system parameters: ${response.note || 'Unknown error'}`);
        throw new Error(
            `Failed to get all system parameters: ${response.note || 'Unknown error'}`,
        );
    }

    /**
     * Set system parameters in a configuration file on a CMS host.
     * Returns domain-only data (CMS envelope removed).
     *
     * CMS 호스트의 설정 파일에 시스템 파라미터를 설정합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @param userId - User ID from JWT
     * @param hostUid - Host unique identifier
     * @param confname - Configuration file name (e.g., "cubridconf", "broker.conf")
     * @param confdata - Configuration data as array of lines
     * @returns SetSysParamClientResponse Empty object on success (CMS envelope fields removed)
     * @throws Error if the request fails or CMS status is not success
     */
    @HandleCmsConfigErrors()
    async setSystemParam(
        userId: string,
        hostUid: string,
        confname: string,
        confdata: string[],
    ): Promise<SetSysParamClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const request: SetSysParamCmsRequest = {
            task: 'setsysparam',
            token: host.token || '',
            confname: confname,
            confdata: confdata,
        };

        const response = await this.cmsClient.postAuthenticated<SetSysParamCmsRequest, BaseCmsResponse>(url, request);

        checkCmsTokenError(response);

        if (response.status === 'success') {
            return {};
        }

        checkCmsStatusError(response, `Failed to set system parameters: ${response.note || 'Unknown error'}`);
        throw new Error(
            `Failed to set system parameters: ${response.note || 'Unknown error'}`,
        );
    }
}

