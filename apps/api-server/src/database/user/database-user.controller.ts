import { Body, Controller, Get, Logger, Param, Post, Put, Request } from '@nestjs/common';
import { DatabaseUserService } from './database-user.service';
import {
  DatabaseLoginClientRequest,
  UpdateDbUserRequest,
  UpdateDbUserResponse,
} from '@api-interfaces';
import { ValidationError } from '@error/validation/validation-error';
import { validateRequiredFields } from '@util';

/**
 * Controller for managing database users.
 *
 * - All endpoints receive `hostUid` as a path parameter
 * - Follows RESTful pattern: /:hostUid/database/users/{action}/{identifier}
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/database/users')
export class DatabaseUserController {
  private readonly logger = new Logger(DatabaseUserController.name);

  constructor(private readonly databaseUserService: DatabaseUserService) {}

  /**
   * Get list of database users for a specific host.
   *
   * @route GET /:hostUid/database/users
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @returns Database users list
   * @example
   * // GET /host-uid/database/users
   */
  @Get()
  async getDatabaseUsers(@Request() req, @Param('hostUid') hostUid: string) {
    const userId = req.user.sub;
    // TODO: Implement
    return await this.databaseUserService.getDatabaseUsers(userId);
  }

  /**
   * Login to a database using profile or client-provided credentials.
   *
   * - If profile exists: only dbname is required (id, password not needed in body)
   * - If profile doesn't exist: dbname + id + password are required
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
      body.password
    );
    return result;
  }

  /**
   * Update a database user.
   * Returns empty object on success.
   *
   * @route PUT /:hostUid/database/users/:dbname/:username
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param dbname Database name from path parameter
   * @param username Username to update from path parameter
   * @param body Request body containing user information
   * @returns UpdateDbUserResponse Empty object on success
   * @example
   * // PUT /host-uid/database/users/demodb/yifan
   * // Body: { "userpass": "1111", "groups": { "group": ["public"] }, "authorization": [] }
   */
  @Put(':dbname/:username')
  async updateUser(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('dbname') dbname: string,
    @Param('username') username: string,
    @Body() body: Omit<UpdateDbUserRequest, 'dbname' | 'username'>
  ): Promise<UpdateDbUserResponse> {
    const userId = req.user.sub;

    validateRequiredFields(
      body,
      ['userpass', 'groups', 'authorization'],
      'database/users/update',
      this.logger
    );

    Logger.log(
      `Updating user: ${username} in database: ${dbname} on host: ${hostUid}`,
      'DatabaseUserController'
    );
    return await this.databaseUserService.updateUser(
      userId,
      hostUid,
      dbname,
      username,
      body.userpass,
      body.groups,
      body.authorization
    );
  }
}
