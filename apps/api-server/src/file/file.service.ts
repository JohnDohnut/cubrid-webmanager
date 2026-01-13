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
 * 
 * Provides business logic for file management operations including
 * file checking, uploading, downloading, and listing.
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

