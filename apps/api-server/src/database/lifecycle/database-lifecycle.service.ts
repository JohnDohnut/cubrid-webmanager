import {
  CreateDatabaseClientRequest,
  CreateDatabaseClientResponse,
  DatabaseVolumeInfoClientResponse,
  StartInfoClientResponse,
} from '@api-interfaces';
import { GetCreatedbInfoClientResponse } from '@api-interfaces/response/get-createdb-info-client-response';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import {
  checkCmsStatusError,
  checkCmsTokenError,
  HandleDatabaseErrors,
} from '@common';
import { DatabaseError } from '@error/database/database-error';
import { HostError } from '@error/index';
import { ValidationError } from '@error/validation/validation-error';
import { FileService } from '@file/file.service';
import { HostService } from '@host';
import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryService } from '@repository';
import { BaseCmsRequest, BaseCmsResponse } from '@type';
import {
  CreateDatabaseCmsRequest,
  DbSpaceInfoCmsRequest,
  StartDatabaseCmsRequest,
  StopDatabaseCmsRequest,
} from '@type/cms-request';
import {
  CreateDatabaseCmsResponse,
  DbSpaceInfoCmsResponse,
  StartInfoCmsResponse,
} from '@type/cms-response';
import { convertExvolArrayToCmsFormat } from '@util';

/**
 * Service for managing database lifecycle operations.
 * Handles database start, stop, restart, creation, profile management, and space information.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseLifecycleService {
  private readonly logger = new Logger(DatabaseLifecycleService.name);

  constructor(
    private readonly hostService: HostService,
    private readonly cmsClient: CmsHttpsClientService,
    private readonly repository: UserRepositoryService,
    private readonly cmsConfigService: CmsConfigService,
    private readonly fileService: FileService
  ) {}

  /**
   * Get start information for databases on a host (internal use).
   * Returns raw CMS response without transformation.
   *
   * @internal
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @returns StartInfoCmsResponse
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async startInfoInternal(userId: string, hostUid: string): Promise<StartInfoCmsResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);

    const url = `https://${host.address}:${host.port}/cm_api`;
    const data: BaseCmsRequest = {
      task: 'startinfo',
      token: host.token || '',
    };
    const response = await this.cmsClient.postAuthenticated<
      BaseCmsRequest,
      StartInfoCmsResponse | BaseCmsResponse
    >(url, data);

    checkCmsTokenError(response);

    if (response.status === 'success') {
      return response as StartInfoCmsResponse;
    } else {
      throw DatabaseError.GetStartInfoFailed({ response });
    }
  }

  /**
   * Get start information for databases on a host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @returns StartInfoClientResponse
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async startInfo(userId: string, hostUid: string): Promise<StartInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const response = await this.startInfoInternal(userId, hostUid);
    const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
    const dbProfiles = host.dbProfiles || {};
    const dbs = dataOnly.dblist?.[0]?.dbs || [];
    const activeList = dataOnly.activelist?.[0]?.active || [];

    const clientResponse: StartInfoClientResponse = {
      activelist: { active: activeList },
      dblist: {
        dbs: dbs.map((db) => ({
          ...db,
          isProfileExists: !!dbProfiles[db.dbname],
        })),
      },
    };

    return clientResponse;
  }

  /**
   * Start a database on a host.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name to start
   * @returns Latest start info (StartInfoClientResponse) on success
   * @throws DatabaseError If CMS status is fail
   */
  @HandleDatabaseErrors()
  async startDatabase(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<StartInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const data: StartDatabaseCmsRequest = {
      task: 'startdb',
      token: host.token || '',
      dbname: dbname,
    };

    const response = await this.cmsClient.postAuthenticated<
      StartDatabaseCmsRequest,
      BaseCmsResponse
    >(url, data);

    checkCmsTokenError(response);

    if (response.status === 'success') {
      return await this.startInfo(userId, hostUid);
    }

    throw DatabaseError.StartDatabaseFailed({ response, dbname });
  }

  /**
   * Stop a database on a host.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name to stop
   * @returns Latest start info (StartInfoClientResponse) on success
   * @throws DatabaseError If CMS status is fail
   */
  @HandleDatabaseErrors()
  async stopDatabase(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<StartInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const data: StopDatabaseCmsRequest = {
      task: 'stopdb',
      token: host.token || '',
      dbname: dbname,
    };

    const response = await this.cmsClient.postAuthenticated<
      StopDatabaseCmsRequest,
      BaseCmsResponse
    >(url, data);

    checkCmsTokenError(response);

    if (response.status === 'success') {
      return await this.startInfo(userId, hostUid);
    }

    throw DatabaseError.StopDatabaseFailed({ response, dbname });
  }

  /**
   * Restart a database (stop then start).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name to restart
   * @returns Latest start info (StartInfoClientResponse) on success
   * @throws DatabaseError If stop/start step fails
   */
  @HandleDatabaseErrors()
  async restartDatabase(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<StartInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const stopRequest: StopDatabaseCmsRequest = {
      task: 'stopdb',
      token: host.token || '',
      dbname: dbname,
    };

    const stopResponse = await this.cmsClient.postAuthenticated<
      StopDatabaseCmsRequest,
      BaseCmsResponse
    >(url, stopRequest);

    checkCmsTokenError(stopResponse);

    if (stopResponse.status === 'success') {
      const startRequest: StartDatabaseCmsRequest = {
        task: 'startdb',
        token: host.token || '',
        dbname: dbname,
      };

      const startResponse = await this.cmsClient.postAuthenticated<
        StartDatabaseCmsRequest,
        BaseCmsResponse
      >(url, startRequest);

      checkCmsTokenError(startResponse);

      if (startResponse.status === 'success') {
        return await this.startInfo(userId, hostUid);
      } else {
        throw DatabaseError.StartDatabaseFailed({
          response: startResponse,
          dbname,
        });
      }
    } else {
      throw DatabaseError.StopDatabaseFailed({
        response: stopResponse,
        dbname,
      });
    }
  }

  /**
   * Save a database profile for a host.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param databaseId Database user ID
   * @param databasePassword Database password
   * @returns Latest start info (StartInfoClientResponse) on success
   * @throws DatabaseError If profile already exists or save fails
   */
  @HandleDatabaseErrors()
  async saveDatabaseProfile(
    userId: string,
    hostUid: string,
    dbname: string,
    databaseId: string,
    databasePassword: string
  ): Promise<StartInfoClientResponse> {
    if (dbname == null || databaseId == null || databasePassword == null) {
      const missingFields = [
        dbname == null && 'dbname',
        databaseId == null && 'id',
        databasePassword == null && 'password',
      ].filter(Boolean) as string[];

      throw ValidationError.MissingDBCredentials(dbname || 'unknown', missingFields);
    }

    await this.repository.atomicUpdateUser(userId, async (user) => {
      const host = user.host_list[hostUid];
      if (!host) {
        throw HostError.NoSuchHost({ hostUid });
      }

      if (host.dbProfiles == null) {
        host.dbProfiles = {};
      }

      if (host.dbProfiles[dbname]) {
        throw DatabaseError.DuplicatedDatabaseProfile({
          dbname,
          hostUid,
        });
      }

      host.dbProfiles[dbname] = {
        dbname,
        id: databaseId,
        password: databasePassword,
      };

      return user;
    });

    return await this.startInfo(userId, hostUid);
  }

  /**
   * Get database volume/space information for a database on a host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @returns DatabaseVolumeInfoClientResponse
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getDBSpaceInfo(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<DatabaseVolumeInfoClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const startInfoRequest: BaseCmsRequest = {
      task: 'startinfo',
      token: host.token || '',
    };

    const startInfo = await this.cmsClient.postAuthenticated<
      BaseCmsRequest,
      StartInfoCmsResponse | BaseCmsResponse
    >(url, startInfoRequest);

    if ('dblist' in startInfo && 'activelist' in startInfo) {
      const dbExists = startInfo.dblist.some((el) => el.dbs.some((db) => db.dbname === dbname));

      if (!dbExists) {
        throw DatabaseError.NoSuchDatabase({ dbname, hostUid });
      }
    } else {
      checkCmsTokenError(startInfo);
      throw DatabaseError.InternalError();
    }

    const spaceInfoRequest: DbSpaceInfoCmsRequest = {
      task: 'dbspaceinfo',
      token: host.token || '',
      dbname: dbname,
    };
    const response = await this.cmsClient.postAuthenticated<
      DbSpaceInfoCmsRequest,
      DbSpaceInfoCmsResponse | BaseCmsResponse
    >(url, spaceInfoRequest);

    checkCmsTokenError(response);

    if (response.status === 'success') {
      const { __EXEC_TIME, note, status, task, ...dataOnly } = response as DbSpaceInfoCmsResponse;
      return dataOnly;
    } else {
      throw DatabaseError.GetDBSpaceInfoFailed({ response, dbname });
    }
  }

  /**
   * Get default information for creating a database.
   * Returns default database directory path and related information.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @returns GetCreatedbInfoClientResponse Default database creation information
   * @throws DatabaseError If request fails
   */
  @HandleDatabaseErrors()
  async getCreatedbInfo(userId: string, hostUid: string): Promise<GetCreatedbInfoClientResponse> {
    const envInfo = await this.cmsConfigService.getEnv(userId, hostUid);

    return {
      defaultDbDirectory: envInfo.CUBRID_DATABASES || '',
      cubridVersion: envInfo.CUBRIDVER,
      cubridPath: envInfo.CUBRID,
    };
  }

  /**
   * Create a new database.
   * Returns empty object on success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Client request containing database creation information
   * @returns CreateDatabaseClientResponse Empty object on success
   * @throws DatabaseError If request fails
   */
  @HandleDatabaseErrors()
  async createDatabase(
    userId: string,
    hostUid: string,
    request: CreateDatabaseClientRequest
  ): Promise<CreateDatabaseClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    // Collect files to check before parsing exvol
    const filesToCheck: string[] = [];

    // Add exvol volume paths (before parsing/converting)
    if (request.exvol && Array.isArray(request.exvol)) {
      for (const volumeObj of request.exvol) {
        for (const [volumeName, volumeInfo] of Object.entries(volumeObj)) {
          if (volumeInfo && typeof volumeInfo === 'object' && 'volpath' in volumeInfo) {
            filesToCheck.push(volumeInfo.volpath);
          }
        }
      }
    }

    // Check file existence before proceeding
    if (filesToCheck.length > 0) {
      for (const file of filesToCheck) {
        const checkFileResponse = await this.fileService.checkfileInternal(host, [file]);

        if (checkFileResponse.existfile) {
          throw DatabaseError.DuplicatedFile(checkFileResponse.existfile, undefined, {
            message: `File already exists: ${checkFileResponse.existfile}`,
            existfile: checkFileResponse.existfile,
          });
        }
      }
    }

    // Convert exvol from client format to CMS format
    const cmsExvol = request.exvol ? convertExvolArrayToCmsFormat(request.exvol) : [];

    // Build CMS request from client request
    const cmsRequest: CreateDatabaseCmsRequest = {
      task: 'createdb',
      token: host.token || '',
      dbname: request.dbname,
      numpage: request.numpage,
      pagesize: request.pagesize,
      logsize: request.logsize,
      logpagesize: request.logpagesize,
      genvolpath: request.genvolpath,
      logvolpath: request.logvolpath,
      exvol: cmsExvol,
      charset: request.charset,
      overwrite_config_file: request.overwrite_config_file,
    };

    const response = await this.cmsClient.postAuthenticated<
      CreateDatabaseCmsRequest,
      CreateDatabaseCmsResponse
    >(url, cmsRequest);

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    return {};
  }
}
