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
 * 데이터베이스 사용자 관리를 위한 서비스입니다.
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
     * 특정 호스트의 데이터베이스 사용자 목록을 조회합니다.
     * 
     * @param userId 사용자 ID (JWT)
     * @returns Database users list
     */
    async getDatabaseUsers(userId: string) {
        return [];
    }

    /**
     * Login to a database using profile or client-provided credentials.
     *
     * 프로파일 또는 클라이언트 제공 자격 증명을 사용하여 데이터베이스에 로그인합니다.
     *
     * @param userId 사용자 ID (JWT)
     * @param hostUid 호스트 UID
     * @param dbname 데이터베이스 이름
     * @param clientId 클라이언트 제공 DB 사용자 ID (프로파일이 없는 경우 필수)
     * @param clientPassword 클라이언트 제공 DB 비밀번호 (프로파일이 없는 경우 필수)
     * @returns 성공 시 true
     * @throws DatabaseError CMS status가 fail인 경우 또는 프로파일이 없고 자격 증명이 제공되지 않은 경우
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

