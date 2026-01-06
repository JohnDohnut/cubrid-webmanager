import { Body, Controller, Get, Logger, Param, Post, Request } from '@nestjs/common';
import { DatabaseUserService } from './database-user.service';
import { DatabaseLoginClientRequest } from '@type';
import { ValidationError } from '@error/validation/validation-error';
import { validateRequiredFields } from '@util';

/**
 * Controller for managing database users.
 * 
 * 데이터베이스 사용자 관리를 위한 컨트롤러입니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/database/users/{action}/{identifier}
 * 
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/database/users')
export class DatabaseUserController {
    private readonly logger = new Logger(DatabaseUserController.name);

    constructor(
        private readonly databaseUserService: DatabaseUserService
    ) {}

    /**
     * Get list of database users for a specific host.
     * 
     * 특정 호스트의 데이터베이스 사용자 목록을 조회합니다.
     * 
     * @route GET /:hostUid/database/users
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @returns Database users list
     * @example
     * // GET /host-uid/database/users
     */
    @Get()
    async getDatabaseUsers(
        @Request() req,
        @Param('hostUid') hostUid: string
    ) {
        const userId = req.user.sub;
        // TODO: Implement
        return await this.databaseUserService.getDatabaseUsers(userId);
    }

    /**
     * Login to a database using profile or client-provided credentials.
     * 
     * 프로파일 또는 클라이언트 제공 자격 증명을 사용하여 데이터베이스에 로그인합니다.
     * 
     * - Profile이 있는 경우: dbname만 필요 (body에 id, password 불필요)
     * - Profile이 없는 경우: dbname + id + password 필요
     *
     * @route POST /:hostUid/database/users/login/:dbname
     * @param req Express request (contains authenticated user)
     * @param hostUid Host unique identifier from path parameter
     * @param dbname Database name from path parameter
     * @param body Request body containing optional `id`, `password` (required if no profile)
     * @returns boolean True on success
     * @example
     * // POST /host-uid/database/users/login/demodb
     * // Body (if no profile): { "id": "user", "password": "pass" }
     */
    @Post('login/:dbname')
    async loginDatabase(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('dbname') dbname: string,
        @Body() body: Omit<DatabaseLoginClientRequest, 'hostUid' | 'dbname'>
    ): Promise<boolean> {
        const userId = req.user.sub;
        
        Logger.log(`Logging in to database: ${dbname} on host: ${hostUid}`, 'DatabaseUserController');
        const result = await this.databaseUserService.loginDatabase(
            userId,
            hostUid,
            dbname,
            body.id,
            body.password,
        );
        return result;
    }
}

