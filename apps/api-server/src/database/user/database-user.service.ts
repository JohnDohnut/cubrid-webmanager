import {
  BaseService,
  HandleCmsHttpsClientErrors,
  HandleDatabaseErrors,
  HandleHostErrors,
} from '@common';
import { DatabaseError } from '@error/database/database-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { UserRepositoryService } from '@repository';
import { DBAuthResolver } from '@util/db-auth-resolver';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseCmsResponse } from '@type';
import { LoginDBCmsRequest, UpdateUserCmsRequest } from '@type/cms-request';
import { UpdateUserCmsResponse } from '@type/cms-response';

/**
 * Service for managing database users.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseUserService extends BaseService {
  constructor(
    private readonly repository: UserRepositoryService,
    protected readonly cmsClient: CmsHttpsClientService,
    protected readonly hostService: HostService
  ) {
    super(hostService, cmsClient);
  }

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
    clientPassword?: string
  ): Promise<boolean> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const dbAuth = DBAuthResolver.resolve(host, dbname, clientId, clientPassword);

    const cmsRequest: LoginDBCmsRequest = {
      task: 'dbmtuserlogin',
      targetid: host.id,
      dbname: dbAuth.dbname,
      dbuser: dbAuth.id,
      dbpasswd: dbAuth.password,
    };

    const response = await this.executeCmsRequest<LoginDBCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    if (response.status === 'success') {
      return true;
    }

    throw DatabaseError.LoginDatabaseFailed({ response, dbname });
  }

  /**
   * Update a database user.
   * Returns empty object on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param username Username to update
   * @param userpass User password
   * @param groups Groups object containing group array
   * @param authorization Authorization array
   * @returns Empty object on success
   * @throws DatabaseError If CMS status is fail
   */
  @HandleHostErrors()
  @HandleCmsHttpsClientErrors()
  @HandleDatabaseErrors()
  async updateUser(
    userId: string,
    hostUid: string,
    dbname: string,
    username: string,
    userpass: string,
    groups: { group: string[] },
    authorization: string[]
  ): Promise<{}> {
    const cmsRequest: UpdateUserCmsRequest = {
      task: 'updateuser',
      dbname,
      username,
      userpass,
      groups,
      authorization,
    };

    await this.executeCmsRequest<UpdateUserCmsRequest, UpdateUserCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    return {};
  }
}
