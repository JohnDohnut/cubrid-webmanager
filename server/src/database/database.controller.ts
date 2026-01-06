import { Body, Controller, Get, Logger, Param, Post, Request } from '@nestjs/common';
import {
    DatabaseVolumeInfoClientResponse,
    StartInfoClientResponse,
    AddBackupInfoClientRequest,
    AddBackupInfoClientResponse,
    GetBackupInfoClientRequest,
    GetBackupInfoClientResponse,
    SetAutoExecQueryClientRequest,
    SetAutoExecQueryClientResponse,
    GetAutoExecQueryClientRequest,
    GetAutoExecQueryClientResponse,
} from '@type';
import { SaveDatabaseProfileRequest } from '@type/request/sava-database-profile';
import { validateRequiredFields } from '@util';
import { DatabaseService } from './database.service';

/**
 * Controller for handling database operations.
 *
 * - Exposes REST endpoints to query start info and to start/stop/restart a DB
 * - Requires authentication; extracts `userId` from JWT (`req.user.sub`)
 * - All endpoints receive `hostUid` as a path parameter
 * - Follows RESTful pattern: /:hostUid/database/{action}/{identifier}
 *
 * 데이터베이스 작업을 처리하는 컨트롤러입니다.
 * - 시작 정보 조회 및 DB 시작/중지/재시작 REST 엔드포인트 제공
 * - 인증 필요, JWT의 `req.user.sub`에서 사용자 ID를 추출합니다
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/database/{action}/{identifier}
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/database')
export class DatabaseController {
    private readonly logger = new Logger(DatabaseController.name);

    constructor(private readonly databaseService: DatabaseService) {}

    /**
     * Get start information for databases on a host.
     * Returns only domain data (BaseCmsResponse fields stripped out).
     *
     * 호스트의 데이터베이스 시작 정보를 조회합니다. CMS 메타 필드(BaseCmsResponse)는 제거한 순수 데이터만 반환합니다.
     *
     * @route GET /:hostUid/database/start-info
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @returns StartInfoClientResponse Start info without CMS envelope fields
     * @example
     * // POST /host-uid/database/start-info
     */
    @Get('start-info')
    async getStartInfo(
        @Request() req,
        @Param('hostUid') hostUid: string
    ): Promise<StartInfoClientResponse> {
        const userId = req.user.sub;
        
        Logger.log(`Getting start info for host: ${hostUid}`, 'DatabaseController');
        const response = await this.databaseService.startInfo(userId, hostUid);
        return response;
    }

    /**
     * Start a database on a host.
     * 성공 시 최신 시작 정보를 반환하고, 실패 시 도메인 에러(DatabaseError)를 던집니다.
     *
     * @route POST /:hostUid/database/start/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns StartInfoClientResponse 최신 데이터베이스 시작 정보
     * @example
     * // POST /host-uid/database/start/demodb
     */
    @Post('start/:dbname')
    async startDatabase(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string
    ): Promise<StartInfoClientResponse> {
        const userId = req.user.sub;
        
        Logger.log(`Starting database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        const result = await this.databaseService.startDatabase(userId, hostUid, dbname);
        return result;
    }

    /**
     * Stop a database on a host.
     * 성공 시 최신 시작 정보를 반환하고, 실패 시 도메인 에러(DatabaseError)를 던집니다.
     *
     * @route POST /:hostUid/database/stop/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns StartInfoClientResponse 최신 데이터베이스 시작 정보
     * @example
     * // POST /host-uid/database/stop/demodb
     */
    @Post('stop/:dbname')
    async stopDatabase(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string
    ): Promise<StartInfoClientResponse> {
        const userId = req.user.sub;
        
        Logger.log(`Stopping database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        const result = await this.databaseService.stopDatabase(userId, hostUid, dbname);
        return result;
    }

    /**
     * Restart a database on a host (stop → start sequence).
     * 성공 시 최신 시작 정보를 반환하고, 중지/시작 단계별 실패 시 해당 도메인 에러를 던집니다.
     *
     * @route POST /:hostUid/database/restart/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns StartInfoClientResponse 최신 데이터베이스 시작 정보
     * @example
     * // POST /host-uid/database/restart/demodb
     */
    @Post('restart/:dbname')
    async restartDatabase(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string
    ): Promise<StartInfoClientResponse> {
        const userId = req.user.sub;
        
        Logger.log(`Restarting database: ${dbname} on host: ${hostUid}`, 'DatabaseController');
        const result = await this.databaseService.restartDatabase(userId, hostUid, dbname);
        return result;
    }


    /**
     * Save a database profile for a host.
     * 성공 시 최신 시작 정보를 반환합니다 (isProfileExists가 업데이트됨).
     *
     * @route POST /:hostUid/database/register/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing `id`, `password`
     * @returns StartInfoClientResponse 최신 데이터베이스 시작 정보
     * @example
     * // POST /host-uid/database/register/demodb
     * // Body: { "id": "user", "password": "pass" }
     */
    @Post('register/:dbname')
    async saveDatabaseProfile(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
        @Body() body: Omit<SaveDatabaseProfileRequest, 'hostUid' | 'dbname'>,
    ): Promise<StartInfoClientResponse> {
        const userId = req.user.sub;

        validateRequiredFields(
            body,
            ['id', 'password'],
            'database/register',
            this.logger,
        );

        return await this.databaseService.saveDatabaseProfile(
            userId,
            hostUid,
            dbname,
            body.id,
            body.password,
        );
    }

    /**
     * Get database volume/space information for a database on a host.
     * Returns domain-only data (CMS envelope removed).
     *
     * 특정 호스트의 데이터베이스 볼륨/공간 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @route GET /:hostUid/database/volume-info/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns DatabaseVolumeInfoClientResponse 데이터베이스 볼륨/공간 정보
     * @example
     * // POST /host-uid/database/volume-info/demodb
     */
    @Get('volume-info/:dbname')
    async getDatabaseVolumeInfo(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
    ): Promise<DatabaseVolumeInfoClientResponse> {
        const userId = req.user.sub;

        Logger.log(
            `Getting volume info for database: ${dbname} on host: ${hostUid}`,
            'DatabaseController',
        );
        const response = await this.databaseService.getDBSpaceInfo(
            userId,
            hostUid,
            dbname,
        );
        return response;
    }

    /**
     * Add backup information for a database.
     * Returns empty object on success.
     *
     * 데이터베이스의 백업 정보를 추가합니다.
     * 성공 시 빈 객체를 반환합니다.
     *
     * @route POST /:hostUid/database/backup/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing backup information
     * @returns AddBackupInfoClientResponse Empty object on success
     * @example
     * // POST /host-uid/database/backup/demodb
     * // Body: { "backupid": "test_backup", "path": "/path/to/backup", ... }
     */
    @Post('backup/:dbname')
    async addBackupInfo(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
        @Body() body: AddBackupInfoClientRequest,
    ): Promise<AddBackupInfoClientResponse> {
        const userId = req.user.sub;

        validateRequiredFields(
            body,
            ['backupid', 'path', 'period_type', 'period_date', 'time', 'level'],
            'database/backup',
            this.logger,
        );

        Logger.log(
            `Adding backup info for database: ${dbname} on host: ${hostUid}`,
            'DatabaseController',
        );
        return await this.databaseService.addBackupInfo(userId, hostUid, dbname, body);
    }

    /**
     * Get backup information for a database.
     * Returns domain-only data (CMS envelope removed).
     *
     * 데이터베이스의 백업 정보를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @route GET /:hostUid/database/backup/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns GetBackupInfoClientResponse Backup information
     * @example
     * // GET /host-uid/database/backup/demodb
     */
    @Get('backup/:dbname')
    async getBackupInfo(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
    ): Promise<GetBackupInfoClientResponse> {
        const userId = req.user.sub;

        Logger.log(
            `Getting backup info for database: ${dbname} on host: ${hostUid}`,
            'DatabaseController',
        );
        return await this.databaseService.getBackupInfo(userId, hostUid, dbname);
    }

    /**
     * Set auto-execution query for a database.
     * Returns empty object on success.
     *
     * 데이터베이스의 자동 실행 쿼리를 설정합니다.
     * 성공 시 빈 객체를 반환합니다.
     *
     * @route POST /:hostUid/database/auto-exec-query/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing auto-execution query plan
     * @returns SetAutoExecQueryClientResponse Empty object on success
     * @example
     * // POST /host-uid/database/auto-exec-query/demodb
     * // Body: { "planlist": [{ "queryplan": [...] }] }
     */
    @Post('auto-exec-query/:dbname')
    async setAutoExecQuery(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
        @Body() body: SetAutoExecQueryClientRequest,
    ): Promise<SetAutoExecQueryClientResponse> {
        const userId = req.user.sub;

        validateRequiredFields(
            body,
            ['planlist'],
            'database/auto-exec-query',
            this.logger,
        );

        Logger.log(
            `Setting auto-exec query for database: ${dbname} on host: ${hostUid}`,
            'DatabaseController',
        );
        return await this.databaseService.setAutoExecQuery(userId, hostUid, dbname, body);
    }

    /**
     * Get auto-execution query for a database.
     * Returns domain-only data (CMS envelope removed).
     *
     * 데이터베이스의 자동 실행 쿼리를 조회합니다.
     * CMS 메타 필드를 제거한 순수 데이터만 반환합니다.
     *
     * @route GET /:hostUid/database/auto-exec-query/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns GetAutoExecQueryClientResponse Auto-execution query information
     * @example
     * // GET /host-uid/database/auto-exec-query/demodb
     */
    @Get('auto-exec-query/:dbname')
    async getAutoExecQuery(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
    ): Promise<GetAutoExecQueryClientResponse> {
        const userId = req.user.sub;

        Logger.log(
            `Getting auto-exec query for database: ${dbname} on host: ${hostUid}`,
            'DatabaseController',
        );
        return await this.databaseService.getAutoExecQuery(userId, hostUid, dbname);
    }

}

