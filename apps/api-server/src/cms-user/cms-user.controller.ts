import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Request } from '@nestjs/common';
import {
  DeleteDbmtUserClientResponse,
  GetDbmtUserInfoClientResponse,
  SetDbmtPasswdClientResponse,
  UpdateDbmtUserClientResponse,
  UpdateDbmtUserRequest,
  SetDbmtPasswdRequest,
} from '@api-interfaces';
import { validateRequiredFields } from '@util';
import { CmsUserService } from './cms-user.service';

/**
 * Controller for CMS (DBMT) user management: get list, update, delete, set password.
 * Base path: /:hostUid/cms-user
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/cms-user')
export class CmsUserController {
  private readonly logger = new Logger(CmsUserController.name);

  constructor(private readonly cmsUserService: CmsUserService) {}

  /**
   * Get DBMT user info (dblist, userlist). CMS task: getdbmtuserinfo.
   * @route GET /:hostUid/cms-user
   */
  @Get()
  async getDbmtUserInfo(
    @Request() req,
    @Param('hostUid') hostUid: string
  ): Promise<GetDbmtUserInfoClientResponse> {
    const userId = req.user.sub;
    this.logger.log(`Getting DBMT user info on host: ${hostUid}`);
    return await this.cmsUserService.getDbmtUserInfo(userId, hostUid);
  }

  /**
   * Update DBMT user. CMS task: updatedbmtuser.
   * @route PUT /:hostUid/cms-user
   */
  @Put()
  async updateDbmtUser(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Body() body: UpdateDbmtUserRequest
  ): Promise<UpdateDbmtUserClientResponse> {
    const userId = req.user.sub;
    validateRequiredFields(
      body,
      ['targetid', 'casauth', 'dbcreate', 'statusmonitorauth'],
      'cms-user',
      this.logger
    );
    this.logger.log(`Updating DBMT user: ${body.targetid} on host: ${hostUid}`);
    return await this.cmsUserService.updateDbmtUser(userId, hostUid, body);
  }

  /**
   * Delete DBMT user. CMS task: deletedbmtuser.
   * @route DELETE /:hostUid/cms-user/:targetid
   */
  @Delete(':targetid')
  async deleteDbmtUser(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Param('targetid') targetid: string
  ): Promise<DeleteDbmtUserClientResponse> {
    const userId = req.user.sub;
    this.logger.log(`Deleting DBMT user: ${targetid} on host: ${hostUid}`);
    return await this.cmsUserService.deleteDbmtUser(userId, hostUid, targetid);
  }

  /**
   * Set DBMT user password. CMS task: setdbmtpasswd.
   * @route PUT /:hostUid/cms-user/set-password
   */
  @Put('set-password')
  async setDbmtPasswd(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Body() body: SetDbmtPasswdRequest
  ): Promise<SetDbmtPasswdClientResponse> {
    const userId = req.user.sub;
    validateRequiredFields(body, ['targetid', 'newpassword'], 'cms-user/set-password', this.logger);
    this.logger.log(`Setting DBMT password for: ${body.targetid} on host: ${hostUid}`);
    return await this.cmsUserService.setDbmtPasswd(
      userId,
      hostUid,
      body.targetid,
      body.newpassword
    );
  }
}
