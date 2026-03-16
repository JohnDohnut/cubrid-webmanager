import {
  AddBackupInfoClientRequest,
  AddBackupInfoClientResponse,
  DeleteBackupInfoClientRequest,
  DeleteBackupInfoClientResponse,
  GetBackupInfoClientResponse,
  SetBackupInfoClientRequest,
  SetBackupInfoClientResponse,
  GetAutoBackupDbErrLogRequest,
  GetAutoBackupDbErrLogResponse,
  BackupDbInfoClientRequest,
  BackupDbInfoClientResponse,
  BackupDbClientRequest,
  BackupDbClientResponse,
} from '@api-interfaces';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import {
  BaseService,
  HandleDatabaseErrors,
} from '@common';
import { DatabaseError } from '@error/database/database-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import {
  AddBackupInfoCmsRequest,
  DeleteBackupInfoCmsRequest,
  GetBackupInfoCmsRequest,
  SetBackupInfoCmsRequest,
  GetAutoBackupDbErrLogCmsRequest,
  BackupDbInfoCmsRequest,
  BackupDbCmsRequest,
} from '@type/cms-request';
import {
  AddBackupInfoCmsResponse,
  DeleteBackupInfoCmsResponse,
  GetBackupInfoCmsResponse,
  SetBackupInfoCmsResponse,
  GetAutoBackupDbErrLogCmsResponse,
  BackupDbInfoCmsResponse,
  BackupDbCmsResponse,
  BackupInfo,
} from '@type/cms-response';

/**
 * Service for managing database backup operations.
 * Handles automated backup schedule management.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class DatabaseBackupService extends BaseService {
  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService
  ) {
    super(hostService, cmsClient);
  }

  /**
   * Add automated backup schedule information for a database.
   * Returns empty object on success (CMS envelope fields removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param backupInfo Backup information
   * @returns AddBackupInfoClientResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async addBackupSchedule(
    userId: string,
    hostUid: string,
    dbname: string,
    backupInfo: AddBackupInfoClientRequest
  ): Promise<AddBackupInfoClientResponse> {
    const cmsRequest: AddBackupInfoCmsRequest = {
      task: 'addbackupinfo',
      dbname: dbname,
      backupid: backupInfo.backupid,
      path: backupInfo.path,
      period_type: backupInfo.period_type,
      period_date: backupInfo.period_date,
      time: backupInfo.time,
      level: backupInfo.level,
      archivedel: backupInfo.archivedel,
      updatestatus: backupInfo.updatestatus,
      storeold: backupInfo.storeold,
      onoff: backupInfo.onoff,
      zip: backupInfo.zip,
      check: backupInfo.check,
      mt: backupInfo.mt,
      bknum: backupInfo.bknum,
    };

    await this.executeCmsRequest<AddBackupInfoCmsRequest, AddBackupInfoCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    return {};
  }

  /**
   * Set automated backup schedule information for a database.
   * Returns empty object on success (CMS envelope fields removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param backupInfo Backup information
   * @returns SetBackupInfoClientResponse Empty object on success
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async setBackupSchedule(
    userId: string,
    hostUid: string,
    dbname: string,
    backupInfo: SetBackupInfoClientRequest
  ): Promise<SetBackupInfoClientResponse> {
    const cmsRequest: SetBackupInfoCmsRequest = {
      task: 'setbackupinfo',
      dbname: dbname,
      backupid: backupInfo.backupid,
      path: backupInfo.path,
      period_type: backupInfo.period_type,
      period_date: backupInfo.period_date,
      time: backupInfo.time,
      level: backupInfo.level,
      archivedel: backupInfo.archivedel,
      updatestatus: backupInfo.updatestatus,
      storeold: backupInfo.storeold,
      onoff: backupInfo.onoff,
      zip: backupInfo.zip,
      check: backupInfo.check,
      mt: backupInfo.mt,
      bknum: backupInfo.bknum,
    };

    const response = await this.executeCmsRequest<
      SetBackupInfoCmsRequest,
      SetBackupInfoCmsResponse
    >(userId, hostUid, cmsRequest);

    return {
      __EXEC_TIME: response.__EXEC_TIME,
      note: response.note,
      status: response.status as 'success' | 'error',
      task: 'setbackupinfo',
    };
  }

  /**
   * Delete automated backup schedule information for a database.
   * Returns response with execution details.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param backupInfo Backup information to delete
   * @returns DeleteBackupInfoClientResponse Response with execution details
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async deleteBackupSchedule(
    userId: string,
    hostUid: string,
    dbname: string,
    backupInfo: DeleteBackupInfoClientRequest
  ): Promise<DeleteBackupInfoClientResponse> {
    const cmsRequest: DeleteBackupInfoCmsRequest = {
      task: 'deletebackupinfo',
      dbname: dbname,
      backupid: backupInfo.backupid,
    };

    const response = await this.executeCmsRequest<
      DeleteBackupInfoCmsRequest,
      DeleteBackupInfoCmsResponse
    >(userId, hostUid, cmsRequest);

    return {
      __EXEC_TIME: response.__EXEC_TIME,
      note: response.note,
      status: response.status as 'success' | 'error',
      task: 'deletebackupinfo',
    };
  }

  /**
   * Get automated backup schedule information for a database.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @returns GetBackupInfoClientResponse Backup information
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getBackupSchedule(
    userId: string,
    hostUid: string,
    dbname: string
  ): Promise<GetBackupInfoClientResponse> {
    const cmsRequest: GetBackupInfoCmsRequest = {
      task: 'getbackupinfo',
      dbname: dbname,
    };

    this.logger.debug(`Getting backup schedule information for database: ${dbname}`);

    const response = await this.executeCmsRequest<
      GetBackupInfoCmsRequest,
      GetBackupInfoCmsResponse
    >(userId, hostUid, cmsRequest);

    // Extract dbname before extractDomainData to preserve string type
    const responseDbname = response.dbname as string;
    const { dbname: _, ...rest } = this.extractDomainData(response);
    // CMS API returns backup info with database name as a dynamic key
    const backupArray = (rest[dbname] as BackupInfo[] | undefined) || [];

    return {
      dbname: responseDbname,
      backups: backupArray || [],
    };
  }

  /**
   * Get backup DB physical info (dbdir, freespace, level0/1/2 backup list).
   * CMS task: backupdbinfo. level0, level1, level2 may be empty arrays.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Client request with dbname
   * @returns BackupDbInfoClientResponse dbdir, freespace, level0, level1, level2
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getBackupDbInfo(
    userId: string,
    hostUid: string,
    request: BackupDbInfoClientRequest
  ): Promise<BackupDbInfoClientResponse> {
    const cmsRequest: BackupDbInfoCmsRequest = {
      task: 'backupdbinfo',
      dbname: request.dbname,
    };

    this.logger.debug(`Getting backup db info for database: ${request.dbname}`);

    const response = await this.executeCmsRequest<
      BackupDbInfoCmsRequest,
      BackupDbInfoCmsResponse
    >(userId, hostUid, cmsRequest);

    return {
      dbdir: response.dbdir ?? '',
      freespace: response.freespace ?? '',
      level0: Array.isArray(response.level0) ? response.level0 : [],
      level1: Array.isArray(response.level1) ? response.level1 : [],
      level2: Array.isArray(response.level2) ? response.level2 : [],
      note: response.note ?? 'none',
      status: response.status ?? 'success',
      task: response.task ?? 'backupdbinfo',
      __EXEC_TIME: response.__EXEC_TIME,
    };
  }

  /**
   * Execute database backup (level 0, 1, or 2). CMS task: backupdb.
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param dbname Database name
   * @param request Client request (level, volname, backupdir, removelog?, check?, mt?, zip?, safereplication?)
   * @returns BackupDbClientResponse __EXEC_TIME, note, status, task
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async backupDb(
    userId: string,
    hostUid: string,
    dbname: string,
    request: BackupDbClientRequest
  ): Promise<BackupDbClientResponse> {
    const cmsRequest: BackupDbCmsRequest = {
      task: 'backupdb',
      dbname,
      level: request.level,
      volname: request.volname,
      backupdir: request.backupdir,
      removelog: request.removelog ?? 'y',
      check: request.check ?? 'n',
      mt: request.mt ?? '0',
      zip: request.zip ?? 'n',
      safereplication: request.safereplication ?? 'n',
    };

    this.logger.debug(`Executing backup for database: ${dbname} level: ${request.level}`);

    const response = await this.executeCmsRequest<
      BackupDbCmsRequest,
      BackupDbCmsResponse
    >(userId, hostUid, cmsRequest);

    return {
      __EXEC_TIME: response.__EXEC_TIME,
      note: response.note,
      status: response.status as 'success' | 'error',
      task: 'backupdb',
    };
  }

  /**
   * Get auto-backup database error log.
   * Returns domain-only data (CMS envelope removed).
   *
   * @param userId User ID from JWT
   * @param hostUid Host UID
   * @param request Client request (empty object)
   * @returns GetAutoBackupDbErrLogResponse Error log entries
   * @throws DatabaseError If request fails or CMS status is fail
   */
  @HandleDatabaseErrors()
  async getAutoBackupDbErrLog(
    userId: string,
    hostUid: string,
    request: GetAutoBackupDbErrLogRequest
  ): Promise<GetAutoBackupDbErrLogResponse> {
    const cmsRequest: GetAutoBackupDbErrLogCmsRequest = {
      task: 'getautobackupdberrlog',
    };

    this.logger.debug('Getting auto-backup database error log');

    const response = await this.executeCmsRequest<
      GetAutoBackupDbErrLogCmsRequest,
      GetAutoBackupDbErrLogCmsResponse
    >(userId, hostUid, cmsRequest);

    return this.extractDomainData(response);
  }
}
