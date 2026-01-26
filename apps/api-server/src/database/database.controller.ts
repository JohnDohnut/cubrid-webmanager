import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Request } from '@nestjs/common';
import {
    DatabaseVolumeInfoClientResponse,
    StartInfoClientResponse,
    AddBackupInfoClientRequest,
    AddBackupInfoClientResponse,
    SetBackupInfoClientRequest,
    SetBackupInfoClientResponse,
    DeleteBackupInfoClientRequest,
    DeleteBackupInfoClientResponse,
    GetBackupInfoClientRequest,
    GetBackupInfoClientResponse,
    SetAutoExecQueryClientRequest,
    SetAutoExecQueryClientResponse,
    GetAutoExecQueryClientRequest,
    GetAutoExecQueryClientResponse,
    SaveDatabaseProfileRequest,
    UnloadDatabaseRequest,
} from '@api-interfaces';
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
     * Returns latest start info on success, throws domain error (DatabaseError) on failure.
     *
     * @route POST /:hostUid/database/start/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns StartInfoClientResponse Latest database start information
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
     * Returns latest start info on success, throws domain error (DatabaseError) on failure.
     *
     * @route POST /:hostUid/database/stop/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns StartInfoClientResponse Latest database start information
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
     * Returns latest start info on success, throws domain error for each step failure.
     *
     * @route POST /:hostUid/database/restart/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns StartInfoClientResponse Latest database start information
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
     * Returns latest start info on success (isProfileExists is updated).
     *
     * @route POST /:hostUid/database/register/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing `id`, `password`
     * @returns StartInfoClientResponse Latest database start information
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
     * @route GET /:hostUid/database/volume-info/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns DatabaseVolumeInfoClientResponse Database volume/space information
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
     * Add automated backup schedule information for a database.
     * Returns empty object on success.
     *
     * @route POST /:hostUid/database/backup-schedule/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing backup schedule information
     * @returns AddBackupInfoClientResponse Empty object on success
     * @example
     * // POST /host-uid/database/backup-schedule/demodb
     * // Body: { "backupid": "test_backup", "path": "/path/to/backup", ... }
     */
    @Post('backup-schedule/:dbname')
    async addBackupSchedule(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
        @Body() body: AddBackupInfoClientRequest,
    ): Promise<AddBackupInfoClientResponse> {
        const userId = req.user.sub;

        validateRequiredFields(
            body,
            ['backupid', 'path', 'period_type', 'period_date', 'time', 'level'],
            'database/backup-schedule',
            this.logger,
        );

        Logger.log(
            `Adding backup schedule for database: ${dbname} on host: ${hostUid}`,
            'DatabaseController',
        );
        return await this.databaseService.addBackupSchedule(userId, hostUid, dbname, body);
    }

    /**
     * Set automated backup schedule information for a database.
     * Returns empty object on success.
     *
     * @route PUT /:hostUid/database/backup-schedule/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing backup schedule information
     * @returns SetBackupInfoClientResponse Empty object on success
     * @example
     * // PUT /host-uid/database/backup-schedule/demodb
     * // Body: { "backupid": "t2", "path": "/path/to/backup", ... }
     */
    @Put('backup-schedule/:dbname')
    async setBackupSchedule(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
        @Body() body: SetBackupInfoClientRequest,
    ): Promise<SetBackupInfoClientResponse> {
        const userId = req.user.sub;

        validateRequiredFields(
            body,
            ['backupid', 'path', 'period_type', 'period_date', 'time', 'level'],
            'database/backup-schedule',
            this.logger,
        );

        Logger.log(
            `Setting backup schedule for database: ${dbname} on host: ${hostUid}`,
            'DatabaseController',
        );
        return await this.databaseService.setBackupSchedule(userId, hostUid, dbname, body);
    }

    /**
     * Delete automated backup schedule information for a database.
     * Returns response with execution details.
     *
     * @route DELETE /:hostUid/database/backup-schedule/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing backup ID to delete
     * @returns DeleteBackupInfoClientResponse Response with execution details
     * @example
     * // DELETE /host-uid/database/backup-schedule/demodb
     * // Body: { "backupid": "t2" }
     */
    @Delete('backup-schedule/:dbname')
    async deleteBackupSchedule(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
        @Body() body: DeleteBackupInfoClientRequest,
    ): Promise<DeleteBackupInfoClientResponse> {
        const userId = req.user.sub;

        validateRequiredFields(
            body,
            ['backupid'],
            'database/backup-schedule',
            this.logger,
        );

        Logger.log(
            `Deleting backup schedule for database: ${dbname} on host: ${hostUid}`,
            'DatabaseController',
        );
        return await this.databaseService.deleteBackupSchedule(userId, hostUid, dbname, body);
    }

    /**
     * Get automated backup schedule information for a database.
     * Returns domain-only data (CMS envelope removed).
     *
     * @route GET /:hostUid/database/backup-schedule/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @returns GetBackupInfoClientResponse Backup schedule information
     * @example
     * // GET /host-uid/database/backup-schedule/demodb
     */
    @Get('backup-schedule/:dbname')
    async getBackupSchedule(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
    ): Promise<GetBackupInfoClientResponse> {
        const userId = req.user.sub;

        Logger.log(
            `Getting backup schedule for database: ${dbname} on host: ${hostUid}`,
            'DatabaseController',
        );
        return await this.databaseService.getBackupSchedule(userId, hostUid, dbname);
    }

    /**
     * Set auto-execution query for a database.
     * Returns empty object on success.
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

    /**
     * Unload a database.
     * Returns empty object on success.
     *
     * @route POST /:hostUid/database/unload/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing unload configuration
     * @returns Empty object on success
     * @example
     * // POST /host-uid/database/unload/demodb
     * // Body: { "targetdir": "/path/to/backup", "isSchemaIncluded": true, "isDataIncluded": true, "dbuser": "user", "dbpasswd": "pass" }
     */
    @Post('unload/:dbname')
    async unloadDatabase(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
        @Body() body: UnloadDatabaseRequest,
    ): Promise<{}> {
        const userId = req.user.sub;

        validateRequiredFields(
            body,
            ['targetdir', 'isSchemaIncluded', 'isDataIncluded', 'dbuser', 'dbpasswd'],
            'database/unload',
            this.logger,
        );

        Logger.log(
            `Unloading database: ${dbname} on host: ${hostUid}`,
            'DatabaseController',
        );
        return await this.databaseService.unloadDatabase(userId, hostUid, dbname, body);
    }

}

