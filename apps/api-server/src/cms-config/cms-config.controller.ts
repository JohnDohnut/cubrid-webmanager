import { Body, Controller, Get, Logger, Param, Post, Request } from '@nestjs/common';
import { CmsConfigService } from './cms-config.service';
import { GetEnvClientResponse, GetAllSysParamClientResponse, ParamdumpClientResponse, SetSysParamClientResponse, StatdumpClientResponse } from '@api-interfaces';

/**
 * Controller for handling CMS environment configuration operations.
 *
 * Provides REST API endpoints for retrieving environment information
 * from CMS hosts including CUBRID version, broker version, database paths, and system information.
 *
 * CMS 환경 구성 작업을 처리하기 위한 컨트롤러입니다.
 *
 * CUBRID 버전, 브로커 버전, 데이터베이스 경로, 시스템 정보 등
 * CMS 호스트의 환경 정보를 조회하는 REST API 엔드포인트를 제공합니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/cms-config/{action}
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
     * CMS 호스트의 환경 정보를 조회합니다.
     * CMS 메타 필드를 제거한 환경 변수 및 시스템 정보를 반환합니다.
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
     * CMS 호스트의 데이터베이스 파라미터 덤프를 조회합니다.
     * CMS 메타 필드를 제거한 데이터베이스 서버 파라미터를 반환합니다.
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
     * CMS 호스트의 데이터베이스 통계 덤프(statdump)를 조회합니다.
     * CMS 메타 필드를 제거한 통계 정보를 반환합니다.
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
     * CMS 호스트의 설정 파일에서 모든 시스템 파라미터를 조회합니다.
     * CMS 메타 필드를 제거한 설정 파일 내용을 반환합니다.
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
     * CMS 호스트의 설정 파일에 시스템 파라미터를 설정합니다.
     * 제공된 데이터로 설정 파일을 업데이트합니다.
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
}

