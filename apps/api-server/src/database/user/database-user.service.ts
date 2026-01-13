import { checkCmsTokenError, HandleCmsHttpsClientErrors, HandleDatabaseErrors, HandleHostErrors } from '@common';
import { DatabaseError } from '@error/database/database-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { UserRepositoryService } from '@repository';
import { DBAuthResolver } from '@util/db-auth-resolver';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseCmsResponse } from '@type';
import { LoginDBCmsRequest } from '@type/cms-request';

/**
 * Service for managing database users.
 * 
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseUserService {
    constructor(
        private readonly repository: UserRepositoryService,
        private readonly cmsClient: CmsHttpsClientService,
        private readonly hostService: HostService,
    ) {}

    /**
     * Get list of database users for a specific host.
     * 
     * @param userId User ID from JWT
     * @returns Database users list
     */
    async getDatabaseUsers(userId: string) {
        return [];
    }

    /**
     * Login to a database using profile or client-provided credentials.
     *
     * @param userId User ID from JWT
     * @param hostUid Host UID
     * @param dbname Database name
     * @param clientId Client-provided DB user ID (required if profile doesn't exist)
     * @param clientPassword Client-provided DB password (required if profile doesn't exist)
     * @returns true on success
     * @throws DatabaseError If CMS status is fail or profile doesn't exist and credentials are not provided
     */
    @HandleHostErrors()
    @HandleCmsHttpsClientErrors()
    @HandleDatabaseErrors()
    async loginDatabase(
        userId: string,
        hostUid: string,
        dbname: string,
        clientId?: string,
        clientPassword?: string,
    ): Promise<boolean> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const dbAuth = DBAuthResolver.resolve(host, dbname, clientId, clientPassword);
        
        const url = `https://${host.address}:${host.port}/cm_api`;
        const data: LoginDBCmsRequest = {
            task: 'dbmtuserlogin',
            token: host.token || '',
            targetid: host.id,
            dbname: dbAuth.dbname,
            dbuser: dbAuth.id,
            dbpasswd: dbAuth.password,
        };

        const response = await this.cmsClient.postAuthenticated<
            LoginDBCmsRequest,
            BaseCmsResponse
        >(url, data);

        checkCmsTokenError(response);

        if (response.status === 'success') {
            return true;
        }

        throw DatabaseError.LoginDatabaseFailed({ response, dbname });
    }
}

