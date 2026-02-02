import { Body, Controller, Delete, Get, Logger, Param, Post, Request } from '@nestjs/common';
import {
  SetAutoExecQueryClientRequest,
  SetAutoExecQueryClientResponse,
  GetAutoExecQueryClientRequest,
  GetAutoExecQueryClientResponse,
  SetAutoStartRequest,
  SetAutoStartResponse,
  RemoveAutoStartRequest,
  RemoveAutoStartResponse,
} from '@api-interfaces';
import { validateRequiredFields } from '@util';
import { DatabaseConfigService } from './database-config.service';

/**
 * Controller for handling database configuration operations.
 * Handles auto-execution query and auto-start configuration.
 *
 * - All endpoints receive `hostUid` as a path parameter
 * - Follows RESTful pattern: /:hostUid/database/{action}/{identifier}
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/database')
export class DatabaseConfigController {
  private readonly logger = new Logger(DatabaseConfigController.name);

  constructor(private readonly configService: DatabaseConfigService) {}

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
    @Body() body: SetAutoExecQueryClientRequest
  ): Promise<SetAutoExecQueryClientResponse> {
    const userId = req.user.sub;

    validateRequiredFields(body, ['planlist'], 'database/auto-exec-query', this.logger);

    Logger.log(
      `Setting auto-exec query for database: ${dbname} on host: ${hostUid}`,
      'DatabaseConfigController'
    );
    return await this.configService.setAutoExecQuery(userId, hostUid, dbname, body);
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
    @Param('dbname') dbname: string
  ): Promise<GetAutoExecQueryClientResponse> {
    const userId = req.user.sub;

    Logger.log(
      `Getting auto-exec query for database: ${dbname} on host: ${hostUid}`,
      'DatabaseConfigController'
    );
    return await this.configService.getAutoExecQuery(userId, hostUid, dbname);
  }

  /**
   * Enable auto-start for a database.
   * Adds database name to the server parameter in configuration file.
   *
   * @route POST /:hostUid/database/auto-start
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param body Request body containing confname and dbname
   * @returns SetAutoStartResponse Empty object on success
   * @example
   * // POST /host-uid/database/auto-start
   * // Body: { "confname": "cubridconf", "dbname": "testdb" }
   */
  @Post('auto-start')
  async setAutoStart(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Body() body: SetAutoStartRequest
  ): Promise<SetAutoStartResponse> {
    const userId = req.user.sub;

    Logger.log(
      `Enabling auto-start for database: ${body.dbname} on host: ${hostUid}`,
      'DatabaseConfigController'
    );
    return await this.configService.setAutoStart(userId, hostUid, body);
  }

  /**
   * Disable auto-start for a database.
   * Removes database name from the server parameter in configuration file.
   *
   * @route DELETE /:hostUid/database/auto-start
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @param body Request body containing confname and dbname
   * @returns RemoveAutoStartResponse Empty object on success
   * @example
   * // DELETE /host-uid/database/auto-start
   * // Body: { "confname": "cubridconf", "dbname": "testdb" }
   */
  @Delete('auto-start')
  async removeAutoStart(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Body() body: RemoveAutoStartRequest
  ): Promise<RemoveAutoStartResponse> {
    const userId = req.user.sub;

    Logger.log(
      `Disabling auto-start for database: ${body.dbname} on host: ${hostUid}`,
      'DatabaseConfigController'
    );
    return await this.configService.removeAutoStart(userId, hostUid, body);
  }
}
