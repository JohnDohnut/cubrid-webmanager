import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HandleCmsHttpsClientErrors } from '@decorators/handle-cms-https-client-errors.decorator';
import { BaseCmsRequest, CmsForwardClientRequest } from '@type/index';
import * as https from 'https';
import { HostService } from '@host';
import { EncryptionService } from '@security';
import { checkCmsTokenError, checkCmsStatusError } from '@common';

/**
 * Callback function to determine whether status check should be skipped.
 * Returns true if status check should be skipped, false otherwise.
 * 
 * status 체크를 스킵할지 결정하는 콜백 함수입니다.
 * true를 반환하면 status 체크를 스킵하고, false를 반환하면 체크를 수행합니다.
 * 
 * @param task - The task name from the request
 * @param response - The CMS response (before status check)
 * @returns true if status check should be skipped, false otherwise
 * 
 * @param task - 요청의 task 이름
 * @param response - CMS 응답 (status 체크 전)
 * @returns status 체크를 스킵해야 하면 true, 아니면 false
 */
export type ShouldSkipStatusCheckCallback = (
    task: string,
    response: any
) => boolean;

/**
 * Service for handling secure HTTPS client communications with CMS (Central Management System).
 * This service provides methods for making authenticated and unauthenticated requests to CMS APIs,
 * and for forwarding client requests after augmenting them with necessary authentication tokens.
 *
 * CMS (중앙 관리 시스템)와의 보안 HTTPS 클라이언트 통신을 처리하는 서비스입니다.
 * 이 서비스는 CMS API에 대한 인증된 및 비인증된 요청을 수행하고,
 * 필요한 인증 토큰을 추가한 후 클라이언트 요청을 전달하는 메서드를 제공합니다.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class CmsHttpsClientService {
    /**
     * @param httpService - The NestJS HttpService for making HTTP requests.
     * @param hostService - Service for retrieving host-related information.
     * @param encryptionService - Service for handling encryption and hashing operations.
     *
     * @param httpService - HTTP 요청을 수행하기 위한 NestJS HttpService.
     * @param hostService - 호스트 관련 정보를 검색하기 위한 서비스.
     * @param encryptionService - 암호화 및 해싱 작업을 처리하기 위한 서비스.
     */
    constructor(
        private readonly httpService: HttpService,
        private readonly hostService : HostService,
        private readonly encryptionService : EncryptionService
    ) {}

    /**
     * Sends an unauthenticated POST request to a public CMS API endpoint.
     * This method is suitable for endpoints that do not require a user authentication token.
     * Note: `rejectUnauthorized` is set to `false` for development/testing purposes,
     * which means SSL certificates will not be validated. This should be reviewed for production environments.
     *
     * 공개 CMS API 엔드포인트로 비인증 POST 요청을 보냅니다.
     * 이 메서드는 사용자 인증 토큰이 필요하지 않은 엔드포인트에 적합합니다.
     * 참고: 개발/테스트 목적으로 `rejectUnauthorized`가 `false`로 설정되어 있습니다.
     * 이는 SSL 인증서가 유효성 검사를 통과하지 않음을 의미합니다. 프로덕션 환경에서는 이 설정을 검토해야 합니다.
     *
     * @param url - The target URL of the CMS API endpoint.
     * @param data - The request payload, excluding the authentication token.
     * @returns A Promise that resolves with the response data from the CMS API.
     * @throws CmsError if the request fails or an unexpected error occurs.
     *
     * @param url - CMS API 엔드포인트의 대상 URL.
     * @param data - 인증 토큰을 제외한 요청 페이로드.
     * @returns CMS API의 응답 데이터를 포함하는 Promise.
     * @throws 요청 실패 또는 예기치 않은 오류 발생 시 CmsError.
     */
    @HandleCmsHttpsClientErrors()
    public async postPublic<T extends Omit<BaseCmsRequest, 'token'>, P>(
        url: string,
        data: T,
    ): Promise<P> {
        const config = {
            headers: { 'Content-Type': 'application/json' },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        Logger.log({ url, data, config });
        const response = await firstValueFrom(
            this.httpService.post<P>(url, data, config),
        );
        return response.data;
    }

    /**
     * Sends an authenticated POST request to a CMS API endpoint.
     * This method expects the request data to include an authentication token.
     * Note: `rejectUnauthorized` is set to `false` for development/testing purposes,
     * which means SSL certificates will not be validated. This should be reviewed for production environments.
     *
     * CMS API 엔드포인트로 인증된 POST 요청을 보냅니다.
     * 이 메서드는 요청 데이터에 인증 토큰이 포함될 것으로 예상합니다.
     * 참고: 개발/테스트 목적으로 `rejectUnauthorized`가 `false`로 설정되어 있습니다.
     * 이는 SSL 인증서가 유효성 검사를 통과하지 않음을 의미합니다. 프로덕션 환경에서는 이 설정을 검토해야 합니다.
     *
     * @param url - The target URL of the CMS API endpoint.
     * @param data - The request payload, including the authentication token.
     * @returns A Promise that resolves with the response data from the CMS API.
     * @throws CmsError if the request fails or an unexpected error occurs.
     *
     * @param url - CMS API 엔드포인트의 대상 URL.
     * @param data - 인증 토큰을 포함한 요청 페이로드.
     * @returns CMS API의 응답 데이터를 포함하는 Promise.
     * @throws 요청 실패 또는 예기치 않은 오류 발생 시 CmsError.
     */
    @HandleCmsHttpsClientErrors()
    public async postAuthenticated<T extends BaseCmsRequest, P>(
        url: string,
        data: T,
    ): Promise<P> {
        const config = {
            headers: { 'Content-Type': 'application/json' },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        Logger.log({ url, data, config });
        const response = await firstValueFrom(
            this.httpService.post<P>(url, data, config),
        );
        return response.data;
    }

    /**
     * Forwards an authenticated client request to a CMS API endpoint.
     * This method retrieves host information, constructs the full CMS API URL,
     * and injects the necessary authentication token into the request body before sending it.
     * The client is not expected to provide the token directly.
     *
     * 인증된 클라이언트 요청을 CMS API 엔드포인트로 전달합니다.
     * 이 메서드는 호스트 정보를 검색하고, 전체 CMS API URL을 구성하며,
     * 필요한 인증 토큰을 요청 본문에 삽입한 후 전송합니다.
     * 클라이언트는 토큰을 직접 제공할 필요가 없습니다.
     *
     * @param sub - The subject (user ID) from the authentication token, used to find the host.
     * @param requestBody - The original request payload from the client, containing hostUid and task.
     * @param shouldSkipStatusCheck - Optional callback to determine if status check should be skipped (for CMS bug workarounds).
     * @returns A Promise that resolves with the response data from the CMS API.
     * @throws HostError.NoSuchHost if the specified host is not found.
     * @throws CmsError if the forwarded request fails or an unexpected error occurs.
     *
     * @param sub - 인증 토큰의 주체(사용자 ID)로, 호스트를 찾는 데 사용됩니다.
     * @param requestBody - hostUid와 task를 포함한 클라이언트의 원본 요청 페이로드.
     * @param shouldSkipStatusCheck - status 체크를 스킵할지 결정하는 선택적 콜백 (CMS 버그 우회용).
     * @returns CMS API의 응답 데이터를 포함하는 Promise.
     * @throws 지정된 호스트를 찾을 수 없는 경우 HostError.NoSuchHost.
     * @throws 전달된 요청이 실패하거나 예기치 않은 오류 발생 시 CmsError.
     */
    @HandleCmsHttpsClientErrors()
    public async forwardAuthenticated<T extends CmsForwardClientRequest, P>(
        sub: string,
        requestBody: T,
        shouldSkipStatusCheck?: ShouldSkipStatusCheckCallback
    ): Promise<P> {
        const hostUid = requestBody.hostUid;
        const host = await this.hostService.findHostInternal(sub, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;

        const request: BaseCmsRequest = {
            token: host.token as string || "",
            ...requestBody
        };
        Logger.log(request);
        const rv = await this.postAuthenticated(url, request) as any;
        
        // 1. CMS token 에러 체크 (항상 수행)
        // CMS에서 토큰이 유효하지 않으면 에러를 던집니다
        checkCmsTokenError(rv);
        
        // 2. CMS status 에러 체크 (조건부로 스킵 가능)
        // CMS는 HTTP 201로 응답하지만, body의 status 필드가 'fail'일 수 있습니다.
        // 하지만 일부 task(예: lockdb)는 CMS 버그로 인해 항상 'fail'을 반환하지만
        // 실제로는 성공한 경우가 있어서, 콜백으로 스킵 여부를 결정할 수 있습니다.
        const task = requestBody.task;
        const shouldSkip = shouldSkipStatusCheck ? shouldSkipStatusCheck(task, rv) : false;
        
        if (!shouldSkip) {
            // status 필드가 'fail'이면 에러를 던집니다
            checkCmsStatusError(rv, `CMS request failed: ${rv.note || 'Unknown error'}`);
        }
        
        return rv;
    }
}
