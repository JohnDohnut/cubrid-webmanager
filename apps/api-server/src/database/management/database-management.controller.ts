import { Body, Controller, Get, Logger, Param, Post, Request } from '@nestjs/common';
import { UnloadDatabaseRequest, UnloadInfoClientResponse } from '@api-interfaces';
import { validateRequiredFields } from '@util';
import { DatabaseManagementService } from './database-management.service';

/**
 * Controller for handling database management operations.
 * Handles database unloading, loading, optimization, checking, and related management tasks.
 *
 * - All endpoints receive `hostUid` as a path parameter
 * - Follows RESTful pattern: /:hostUid/database/{action}/:dbname
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/database')
export class DatabaseManagementController {
  private readonly logger = new Logger(DatabaseManagementController.name);

  constructor(private readonly managementService: DatabaseManagementService) {}

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
    @Body() body: UnloadDatabaseRequest
  ): Promise<{}> {
    const userId = req.user.sub;

    validateRequiredFields(
      body,
      ['targetdir', 'isSchemaIncluded', 'isDataIncluded', 'dbuser', 'dbpasswd'],
      'database/unload',
      this.logger
    );

    Logger.log(`Unloading database: ${dbname} on host: ${hostUid}`, 'DatabaseManagementController');
    return await this.managementService.unloadDatabase(userId, hostUid, dbname, body);
  }

  /**
   * Get unload information for databases on a host.
   * Returns domain-only data (CMS envelope removed).
   *
   * @route GET /:hostUid/database/unload-info
   * @param req Express request (contains authenticated user)
   * @param hostUid Host unique identifier from path parameter
   * @returns UnloadInfoClientResponse Unload information without CMS envelope fields
   * @example
   * // GET /host-uid/database/unload-info
   */
  @Get('unload-info')
  async getUnloadInfo(
    @Request() req,
    @Param('hostUid') hostUid: string
  ): Promise<UnloadInfoClientResponse> {
    const userId = req.user.sub;

    Logger.log(`Getting unload info for host: ${hostUid}`, 'DatabaseManagementController');
    return await this.managementService.getUnloadInfo(userId, hostUid);
  }
}
