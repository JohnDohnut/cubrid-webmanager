import { UnloadDatabaseRequest, UnloadInfoClientResponse } from '@api-interfaces';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import {
  checkCmsStatusError,
  checkCmsTokenError,
  HandleCmsStatusErrors,
  HandleDatabaseErrors,
} from '@common';
import { DatabaseError } from '@error/database/database-error';
import { HostService } from '@host';
import { Injectable, Logger } from '@nestjs/common';
import { UnloadDatabaseCmsRequest, UnloadInfoCmsRequest } from '@type/cms-request';
import {
  UnloadDatabaseCmsResponse,
  UnloadInfoCmsResponse,
} from '@type/cms-response';

/**
 * Service for managing database management operations.
 * Handles database unloading, loading, optimization, checking, and related management tasks.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseManagementService {
  private readonly logger = new Logger(DatabaseManagementService.name);

  constructor(
    private readonly hostService: HostService,
    private readonly cmsClient: CmsHttpsClientService
  ) {}

  /**
   * Unload a database.
   * Returns empty object on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request containing unload information
   * @returns Empty object on success
   * @throws DatabaseError If request fails or parameters are invalid
   */
  @HandleDatabaseErrors()
  @HandleCmsStatusErrors()
  async unloadDatabase(
    userId: string,
    hostUid: string,
    dbname: string,
    request: UnloadDatabaseRequest
  ): Promise<{}> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    // Determine target based on isSchemaIncluded and isDataIncluded
    let target: 'schema' | 'object' | 'both';

    if (request.isSchemaIncluded && request.isDataIncluded) {
      target = 'both';
    } else if (request.isSchemaIncluded) {
      target = 'schema';
    } else if (request.isDataIncluded) {
      target = 'object';
    } else {
      throw DatabaseError.InvalidParameter(
        'Both isSchemaIncluded and isDataIncluded cannot be false',
        {
          isSchemaIncluded: request.isSchemaIncluded,
          isDataIncluded: request.isDataIncluded,
        }
      );
    }

    // Build CMS request from client request
    const cmsRequest: UnloadDatabaseCmsRequest = {
      task: 'unloaddb',
      token: host.token || '',
      dbname: dbname,
      targetdir: request.targetdir,
      target: target,
      dbuser: request.dbuser,
      dbpasswd: request.dbpasswd,
      usehash: request.usehash,
      hashdir: request.hashdir,
      class: request.class,
      ref: request.ref,
      classonly: request.classonly,
      'as-dba': request['as-dba'],
      'skip-index-detail': request['skip-index-detail'],
      'split-schema-files': request['split-schema-files'],
      delimit: request.delimit,
      estimate: request.estimate,
      prefix: request.prefix,
      cach: request.cach,
      lofile: request.lofile,
    };

    const response = await this.cmsClient.postAuthenticated<
      UnloadDatabaseCmsRequest,
      UnloadDatabaseCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    return response.result;
  }

  /**
   * Get unload information for databases on a host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @returns UnloadInfoClientResponse Unload information without CMS envelope fields
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getUnloadInfo(
    userId: string,
    hostUid: string
  ): Promise<UnloadInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const request: UnloadInfoCmsRequest = {
      task: 'unloadinfo',
      token: host.token || '',
    };

    const response = await this.cmsClient.postAuthenticated<
      UnloadInfoCmsRequest,
      UnloadInfoCmsResponse
    >(url, request);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    const { __EXEC_TIME, note, status, task, ...dataOnly } = response;

    return {
      database: dataOnly.database || [],
    };
  }
}
