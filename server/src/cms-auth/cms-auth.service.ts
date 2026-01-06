import { Injectable, Logger } from '@nestjs/common';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import {
    HostInfo,
    CheckFileCmsRequest,
    LoginCmsRequest,
    LoginCmsResponse,
    User,
} from '@type/index';
import { UserRepositoryService } from '@repository';
import { HostError } from '@error/index';

/**
 * Service for handling authentication with the CMS (Central Management System).
 * This service manages the login process to CMS hosts, including retrieving host credentials,
 * performing the login request, and storing the obtained authentication token.
 *
 * CMS(중앙 관리 시스템)와의 인증을 처리하는 서비스입니다.
 * 이 서비스는 호스트 자격 증명 검색, 로그인 요청 수행 및 획득한 인증 토큰 저장을 포함하여
 * CMS 호스트에 대한 로그인 프로세스를 관리합니다.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class CmsAuthService {
    constructor(
        //private readonly repository : UserRepositoryService,
        private readonly client: CmsHttpsClientService,
        private readonly repository: UserRepositoryService,
    ) {}
    
    /**
     * Performs a login operation to a specific CMS host for a given user.
     * Retrieves host details, constructs a login request, sends it to the CMS,
     * and stores the received authentication token in the user's host information.
     *
     * 지정된 사용자에 대해 특정 CMS 호스트에 로그인 작업을 수행합니다.
     * 호스트 세부 정보를 검색하고, 로그인 요청을 구성하고, CMS로 전송하고,
     * 수신된 인증 토큰을 사용자 호스트 정보에 저장합니다.
     *
     * @param userId - The ID of the user performing the login.
     * @param uid - The unique identifier of the host to log in to.
     * @returns A Promise that resolves with the authentication token received from the CMS.
     * @throws HostError.NoSuchHost if the specified host is not found for the user.
     */
    public async login(userId: string, uid: string) {
        const user = await this.repository.loadUserById(userId);
        Logger.log(uid);
        const host: HostInfo = user.host_list[uid];
        if (!host) {
            throw HostError.NoSuchHost({ uid: uid });
        }

        const url = `https://${host.address}:${host.port}/cm_api`;
        const request: LoginCmsRequest = {
            task: 'login',
            host: host.address,
            port: host.port.toString(),
            id: host.id,
            password: host.password,
            clientver: '11.4',
        };

        const response = await this.client.postPublic<
            LoginCmsRequest,
            LoginCmsResponse
        >(url, request);

        // Store token in host info
        host.token = response.token;
        await this.repository.atomicUpdateUser(userId, async (user : User) => {
            user.host_list[uid] = host
            return user;
        } );

        return response.token;
    }

    /**
     * Tests a login operation to a CMS host using provided host information.
     * This method is typically used for testing connectivity and credentials without
     * associating the host with a specific user.
     *
     * 제공된 호스트 정보를 사용하여 CMS 호스트에 대한 로그인 작업을 테스트합니다.
     * 이 메서드는 일반적으로 호스트를 특정 사용자와 연결하지 않고
     * 연결 및 자격 증명을 테스트하는 데 사용됩니다.
     *
     * @param host - The host information to use for the login test.
     * @returns A Promise that resolves with the authentication token received from the CMS.
     */
    public async testLogin(host: HostInfo): Promise<string> {
        const url = `https://${host.address}:${host.port}/cm_api`;

        const requestData: LoginCmsRequest = {
            task: 'login',
            host: host.address,
            port: host.port.toString(),
            id: host.id,
            password: host.password,
            clientver: '13.23',
        };

        const response = await this.client.postPublic<
            LoginCmsRequest,
            LoginCmsResponse
        >(url, requestData);

        return response.token;
    }
}
