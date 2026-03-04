import {
  CreateDatabaseClientRequest,
  CreateDatabaseClientResponse,
  CreateDatabaseWithConfigRequest,
  CreateDatabaseWithConfigResponse,
  DatabaseVolumeInfoClientResponse,
  StartInfoClientResponse,
} from '@api-interfaces';
import { GetCreatedbInfoClientResponse } from '@api-interfaces/response/get-createdb-info-client-response';
import { CmsConfigService } from '@cms-config/cms-config.service';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import {
  BaseService,
  HandleDatabaseErrors,
} from '@common';
import { DatabaseError } from '@error/database/database-error';
import { HostError } from '@error/index';
import { ValidationError } from '@error/validation/validation-error';
import { FileService } from '@file/file.service';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { UserRepositoryService } from '@repository';
import { BaseCmsRequest, BaseCmsResponse } from '@type';
import { DatabaseUserService } from '../user/database-user.service';
import { DatabaseConfigService } from '../config/database-config.service';
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
export class DatabaseLifecycleService extends BaseService {
  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService,
    private readonly repository: UserRepositoryService,
    private readonly cmsConfigService: CmsConfigService,
    private readonly fileService: FileService,
    private readonly databaseUserService: DatabaseUserService,
    private readonly databaseConfigService: DatabaseConfigService
  ) {
    super(hostService, cmsClient);
  }

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
    const cmsRequest: BaseCmsRequest = {
      task: 'startinfo',
    };
    const response = await this.executeCmsRequest<
      BaseCmsRequest,
      StartInfoCmsResponse | BaseCmsResponse
    >(userId, hostUid, cmsRequest);

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
    const dataOnly = this.extractDomainData(response);
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
    const cmsRequest: StartDatabaseCmsRequest = {
      task: 'startdb',
      dbname: dbname,
    };

    const response = await this.executeCmsRequest<StartDatabaseCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

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
    const cmsRequest: StopDatabaseCmsRequest = {
      task: 'stopdb',
      dbname: dbname,
    };

    const response = await this.executeCmsRequest<StopDatabaseCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

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
    const stopRequest: StopDatabaseCmsRequest = {
      task: 'stopdb',
      dbname: dbname,
    };

    const stopResponse = await this.executeCmsRequest<StopDatabaseCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      stopRequest
    );

    if (stopResponse.status === 'success') {
      const startRequest: StartDatabaseCmsRequest = {
        task: 'startdb',
        dbname: dbname,
      };

      const startResponse = await this.executeCmsRequest<
        StartDatabaseCmsRequest,
        BaseCmsResponse
      >(userId, hostUid, startRequest);

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
    const startInfoRequest: BaseCmsRequest = {
      task: 'startinfo',
    };

    const startInfo = await this.executeCmsRequest<
      BaseCmsRequest,
      StartInfoCmsResponse | BaseCmsResponse
    >(userId, hostUid, startInfoRequest);

    if ('dblist' in startInfo && 'activelist' in startInfo) {
      const dbExists = startInfo.dblist.some((el) => el.dbs.some((db) => db.dbname === dbname));

      if (!dbExists) {
        throw DatabaseError.NoSuchDatabase({ dbname, hostUid });
      }
    } else {
      throw DatabaseError.InternalError();
    }

    const spaceInfoRequest: DbSpaceInfoCmsRequest = {
      task: 'dbspaceinfo',
      dbname: dbname,
    };
    const response = await this.executeCmsRequest<
      DbSpaceInfoCmsRequest,
      DbSpaceInfoCmsResponse | BaseCmsResponse
    >(userId, hostUid, spaceInfoRequest);

    if (response.status === 'success') {
      return this.extractDomainData(response as DbSpaceInfoCmsResponse);
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
   * Create a new database (internal use).
   * Returns empty object on success.
   *
   * @internal
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Client request containing database creation information
   * @returns CreateDatabaseClientResponse Empty object on success
   * @throws DatabaseError If request fails
   */
  @HandleDatabaseErrors()
  async createDatabaseInternal(
    userId: string,
    hostUid: string,
    request: CreateDatabaseClientRequest
  ): Promise<CreateDatabaseClientResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);

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
    // Convert numeric values to strings as CMS expects string format
    const cmsRequest: CreateDatabaseCmsRequest = {
      task: 'createdb',
      dbname: request.dbname,
      numpage: String(request.numpage),
      pagesize: String(request.pagesize),
      logsize: String(request.logsize),
      logpagesize: String(request.logpagesize),
      genvolpath: request.genvolpath,
      logvolpath: request.logvolpath,
      exvol: cmsExvol,
      charset: request.charset,
      overwrite_config_file: request.overwrite_config_file,
    };

    await this.executeCmsRequest<CreateDatabaseCmsRequest, CreateDatabaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    return {};
  }

  /**
   * Create a new database with optional configuration.
   * Executes database creation, user update, auto-add volume, and auto-start in sequence.
   * Returns results from all executed operations with success/error status.
   * Operations continue even if previous ones fail, allowing partial success.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Client request containing database creation and configuration information
   * @returns CreateDatabaseWithConfigResponse Results from all executed operations with success/error status
   */
  async createDatabase(
    userId: string,
    hostUid: string,
    request: CreateDatabaseWithConfigRequest
  ): Promise<CreateDatabaseWithConfigResponse> {
    const { updateUser, setAutoAddVol, setAutoStart, ...createDbRequest } = request;

    const response: CreateDatabaseWithConfigResponse = {
      createDatabase: { success: false },
    };

    // 1. Create database
    try {
      const createDatabaseResult = await this.createDatabaseInternal(
        userId,
        hostUid,
        createDbRequest
      );
      response.createDatabase = {
        success: true,
        data: createDatabaseResult,
      };

      // 1-1. Start database after successful creation
      try {
        const startInfo = await this.startDatabase(userId, hostUid, createDbRequest.dbname);
        response.startDatabase = {
          success: true,
          data: startInfo,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        const errorCode = (error as any)?.code || (error instanceof Error ? error.name : 'UNKNOWN');
        const errorDetails = (error as any)?.details;
        this.logger.error(`Failed to start database: ${errorMessage}`, errorStack);
        response.startDatabase = {
          success: false,
          error: {
            message: errorMessage || 'Failed to start database',
            code: errorCode,
            details: errorDetails,
          },
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorCode = (error as any)?.code || (error instanceof Error ? error.name : 'UNKNOWN');
      const errorDetails = (error as any)?.details;
      this.logger.error(`Failed to create database: ${errorMessage}`, errorStack);
      response.createDatabase = {
        success: false,
        error: {
          message: errorMessage || 'Failed to create database',
          code: errorCode,
          details: errorDetails,
        },
      };
    }

    // 2. Update user if requested
    if (updateUser) {
      try {
        // Use top-level dbname and username (default to "dba" if not provided)
        const username = request.username || 'dba';
        // For createDatabase, we only update password, so use empty groups and authorization
        const updateUserResult = await this.databaseUserService.updateUser(
          userId,
          hostUid,
          createDbRequest.dbname,
          username,
          updateUser.userpass,
          { group: [] },
          []
        );
        response.updateUser = {
          success: true,
          data: updateUserResult,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        const errorCode = (error as any)?.code || (error instanceof Error ? error.name : 'UNKNOWN');
        const errorDetails = (error as any)?.details;
        this.logger.error(`Failed to update user: ${errorMessage}`, errorStack);
        response.updateUser = {
          success: false,
          error: {
            message: errorMessage || 'Failed to update user',
            code: errorCode,
            details: errorDetails,
          },
        };
      }
    }

    // 3. Set auto-add volume if requested
    if (setAutoAddVol) {
      try {
        const setAutoAddVolResult = await this.databaseConfigService.setAutoAddVol(
          userId,
          hostUid,
          createDbRequest.dbname,
          setAutoAddVol
        );
        response.setAutoAddVol = {
          success: true,
          data: setAutoAddVolResult,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        const errorCode = (error as any)?.code || (error instanceof Error ? error.name : 'UNKNOWN');
        const errorDetails = (error as any)?.details;
        this.logger.error(`Failed to set auto-add volume: ${errorMessage}`, errorStack);
        response.setAutoAddVol = {
          success: false,
          error: {
            message: errorMessage || 'Failed to set auto-add volume',
            code: errorCode,
            details: errorDetails,
          },
        };
      }
    }

    // 4. Set auto-start if requested
    if (setAutoStart) {
      try {
        // Use top-level dbname and automatically use "cubridconf" as confname
        const setAutoStartResult = await this.databaseConfigService.setAutoStart(userId, hostUid, {
          confname: DATABASE_CONSTANTS.CUBRID_CONF_NAME,
          dbname: createDbRequest.dbname,
        });
        response.setAutoStart = {
          success: true,
          data: setAutoStartResult,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        const errorCode = (error as any)?.code || (error instanceof Error ? error.name : 'UNKNOWN');
        const errorDetails = (error as any)?.details;
        this.logger.error(`Failed to set auto-start: ${errorMessage}`, errorStack);
        response.setAutoStart = {
          success: false,
          error: {
            message: errorMessage || 'Failed to set auto-start',
            code: errorCode,
            details: errorDetails,
          },
        };
      }
    }

    return response;
  }
}
