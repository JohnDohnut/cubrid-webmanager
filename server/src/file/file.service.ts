import { Injectable, Logger } from '@nestjs/common';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { CmsAuthService } from '@cms-auth/cms-auth.service';
import { UserRepositoryService } from '@repository';
import { 
    CheckFileCmsRequest, 
    CheckFileCmsResponse, 
    HostInfo 
} from '@type/index';
import { HostError } from '@error/index';
import { HandleCmsHttpsClientErrors } from '@decorators/handle-cms-https-client-errors.decorator';
import { CmsError } from '@error/cms/cms-error';
import { checkCmsTokenError, checkCmsStatusError } from '@common';

/**
 * Service for file operations.
 * 파일 작업을 위한 서비스입니다.
 * 
 * Provides business logic for file management operations including
 * file checking, uploading, downloading, and listing.
 * 
 * 파일 검사, 업로드, 다운로드, 목록 조회를 포함한 파일 관리 작업을 위한
 * 비즈니스 로직을 제공합니다.
 * 
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class FileService {
    constructor(
        private readonly cmsHttpsClient: CmsHttpsClientService,
        private readonly cmsAuthService: CmsAuthService,
        private readonly userRepository: UserRepositoryService,
    ) {}

    /**
     * Checks if a file exists on the specified CMS host.
     * 지정된 CMS 호스트에서 파일이 존재하는지 확인합니다.
     * 
     * @param {string} userId - The unique identifier of the user
     * @param {string} hostUid - The unique identifier of the host
     * @returns {Promise<CheckFileCmsResponse>} Response containing file check information
     * @throws {HostError.NoSuchHost} If no host with the given UID is found
     * @example
     * ```typescript
     * const response = await fileService.checkFile("user123", "host456");
     * console.log(response.status); // "success" or error status
     * ```
     */
    @HandleCmsHttpsClientErrors()
    async checkFile(userId: string, hostUid: string): Promise<CheckFileCmsResponse> {
        const user = await this.userRepository.loadUserById(userId);
        const host: HostInfo = user.host_list[hostUid];
        
        if (!host) {
            throw HostError.NoSuchHost({ hostUid });
        }

        if (host.token) {
            try {
                const authUrl = `https://${host.address}:${host.port}/cm_api`;
                const checkFileRequest: CheckFileCmsRequest = {
                    task: 'checkfile',
                    token: host.token,
                };

                const response = await this.cmsHttpsClient.postAuthenticated<CheckFileCmsRequest, CheckFileCmsResponse>(authUrl, checkFileRequest);
                
                checkCmsTokenError(response);
                checkCmsStatusError(response, `Failed to check file: ${response.note || 'Unknown error'}`);
                
                return response;
            } catch (error) {
                Logger.warn(`Token invalid for host ${hostUid}:`, error.message);
                host.token = undefined;
                await this.userRepository.updateUser(userId, user);
                throw CmsError.InvalidToken();
            }
        }
        throw CmsError.InvalidToken();
    }
}

