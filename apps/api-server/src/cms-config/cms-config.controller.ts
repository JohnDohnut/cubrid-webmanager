import { Body, Controller, Get, Logger, Param, Post, Request } from '@nestjs/common';
import { CmsConfigService } from './cms-config.service';
import { GetEnvClientResponse, GetAllSysParamClientResponse, ParamdumpClientResponse, SetSysParamClientResponse, StatdumpClientResponse, AddDbnameToServerClientRequest, AddDbnameToServerClientResponse, RemoveDbnameFromServerClientRequest, RemoveDbnameFromServerClientResponse } from '@api-interfaces';

/**
 * Controller for handling CMS environment configuration operations.
 *
 * Provides REST API endpoints for retrieving environment information
 * from CMS hosts including CUBRID version, broker version, database paths, and system information.
 * - All endpoints receive `hostUid` as a path parameter
 * - Follows RESTful pattern: /:hostUid/cms-config/{action}
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/cms-config')
export class CmsConfigController {
    private readonly logger = new Logger(CmsConfigController.name);

    constructor(private readonly cmsConfigService: CmsConfigService) {}

    /**
     * Get environment information from a CMS host.
     * Returns environment variables and system information without CMS envelope fields.
     *
     * @route GET /:hostUid/cms-config/env
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @returns GetEnvClientResponse Environment information without CMS envelope fields
     * @example
     * // POST /host-uid/cms-config/env
     */
    @Get('env')
    async getEnv(
        @Request() req,
        @Param('hostUid') hostUid: string
    ): Promise<GetEnvClientResponse> {
        const userId = req.user.sub;

        Logger.log(`Getting environment info for host: ${hostUid}`, 'CmsConfigController');
        const response = await this.cmsConfigService.getEnv(userId, hostUid);
        return response;
    }

    /**
     * Get database parameters dump from a CMS host.
     * Returns database server parameters without CMS envelope fields.
     *
     * @route GET /:hostUid/cms-config/param-dump
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @param dbname - Database name from query parameter
     * @returns ParamdumpClientResponse Database parameters without CMS envelope fields
     * @example
     * // GET /host-uid/cms-config/param-dump?dbname=demodb
     */
    @Get('param-dump/:dbname')
    async paramdump(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string
    ): Promise<ParamdumpClientResponse> {
        const userId = req.user.sub;

        Logger.log(
            `Getting paramdump info for host: ${hostUid}, dbname: ${dbname}`,
            'CmsConfigController',
        );
        const response = await this.cmsConfigService.getParamDump(
            userId,
            hostUid,
            dbname,
        );
        return response;
    }

    /**
     * Get database statistics dump from a CMS host.
     * Returns database statistics without CMS envelope fields.
     *
     * @route GET /:hostUid/cms-config/stat-dump/:dbname
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @param dbname - Database name from path parameter
     * @returns StatdumpClientResponse Database statistics without CMS envelope fields
     * @example
     * // GET /host-uid/cms-config/stat-dump/demodb
     */
    @Get('stat-dump/:dbname')
    async statdump(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
    ): Promise<StatdumpClientResponse> {
        const userId = req.user.sub;

        Logger.log(
            `Getting statdump info for host: ${hostUid}, dbname: ${dbname}`,
            'CmsConfigController',
        );
        const response = await this.cmsConfigService.getStatDump(userId, hostUid, dbname);
        return response;
    }

    /**
     * Get all system parameters from a configuration file on a CMS host.
     * Returns configuration file content without CMS envelope fields.
     *
     * @route GET /:hostUid/cms-config/all-sys-param
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @param confname - Configuration file name from query parameter (e.g., "cubridconf")
     * @returns GetAllSysParamClientResponse System parameters without CMS envelope fields
     * @example
     * // GET /host-uid/cms-config/all-sys-param?confname=cubridconf
     */
    @Get('all-sys-param')
    async getAllSystemParam(
        @Request() req,
        @Param('hostUid') hostUid: string,
    ): Promise<GetAllSysParamClientResponse> {
        const userId = req.user.sub;
        const confname = req.query.confname as string;

        Logger.log(
            `Getting all system parameters for host: ${hostUid}, confname: ${confname}`,
            'CmsConfigController',
        );
        const response = await this.cmsConfigService.getAllSystemParam(
            userId,
            hostUid,
            confname,
        );
        return response;
    }

    /**
     * Set system parameters in a configuration file on a CMS host.
     * Updates configuration file with provided data.
     *
     * @route POST /:hostUid/cms-config/set-sys-param
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @param body - Request body containing confname and confdata
     * @returns SetSysParamClientResponse Empty object on success (CMS envelope fields removed)
     * @example
     * // POST /host-uid/cms-config/set-sys-param
     * // Body: { "confname": "cubridconf", "confdata": ["# comment", "[section]", "key=value"] }
     */
    @Post('set-sys-param')
    async setSystemParam(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Body() body: { confname: string; confdata: string[] },
    ): Promise<SetSysParamClientResponse> {
        const userId = req.user.sub;

        Logger.log(
            `Setting system parameters for host: ${hostUid}, confname: ${body.confname}`,
            'CmsConfigController',
        );
        const response = await this.cmsConfigService.setSystemParam(
            userId,
            hostUid,
            body.confname,
            body.confdata,
        );
        return response;
    }

    /**
     * Add a database name to the server parameter in a configuration file.
     * Gets current configuration, appends dbname to server parameter, and updates.
     *
     * @route POST /:hostUid/cms-config/add-dbname-to-server
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @param body - Request body containing confname and dbname
     * @returns AddDbnameToServerClientResponse Empty object on success (CMS envelope fields removed)
     * @example
     * // POST /host-uid/cms-config/add-dbname-to-server
     * // Body: { "confname": "cubridconf", "dbname": "testdb" }
     */
    @Post('add-dbname-to-server')
    async addDbnameToServer(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Body() body: AddDbnameToServerClientRequest,
    ): Promise<AddDbnameToServerClientResponse> {
        const userId = req.user.sub;

        Logger.log(
            `Adding dbname ${body.dbname} to server parameter for host: ${hostUid}, confname: ${body.confname}`,
            'CmsConfigController',
        );
        const response = await this.cmsConfigService.addDbnameToServerParam(
            userId,
            hostUid,
            body,
        );
        return response;
    }

    /**
     * Remove a database name from the server parameter in a configuration file.
     * Gets current configuration, removes dbname from server parameter, and updates.
     *
     * @route POST /:hostUid/cms-config/remove-dbname-from-server
     * @param req - Express request (contains authenticated user)
     * @param hostUid - Host unique identifier from path parameter
     * @param body - Request body containing confname and dbname
     * @returns RemoveDbnameFromServerClientResponse Empty object on success (CMS envelope fields removed)
     * @example
     * // POST /host-uid/cms-config/remove-dbname-from-server
     * // Body: { "confname": "cubridconf", "dbname": "testdb" }
     */
    @Post('remove-dbname-from-server')
    async removeDbnameFromServer(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Body() body: RemoveDbnameFromServerClientRequest,
    ): Promise<RemoveDbnameFromServerClientResponse> {
        const userId = req.user.sub;

        Logger.log(
            `Removing dbname ${body.dbname} from server parameter for host: ${hostUid}, confname: ${body.confname}`,
            'CmsConfigController',
        );
        const response = await this.cmsConfigService.removeDbnameFromServerParam(
            userId,
            hostUid,
            body,
        );
        return response;
    }
}

