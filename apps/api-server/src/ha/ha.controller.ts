import { Body, Controller, Logger, Param, Post, Request } from '@nestjs/common';
import { HeartbeatListClientResponse } from '@api-interfaces';
import { HaReloadCmsResponse } from '@type/cms-response';
import { HaMakeSlaveJobDto, HaMakeSlaveStartDto, HaSshCheckDto, HeartbeatListDto } from '@type/index';
import { HaService } from './ha.service';

@Controller(':hostUid/ha')
export class HaController {
  private readonly logger = new Logger(HaController.name);

  constructor(private readonly haService: HaService) {}

  /**
   * Get HA heartbeat information.
   * CMS task: heartbeatlist
   *
   * @route POST /:hostUid/ha/heartbeat-list
   */
  @Post('heartbeat-list')
  async heartbeatList(
    @Request() req,
    @Param('hostUid') hostUid: string,
    @Body() body: HeartbeatListDto
  ): Promise<HeartbeatListClientResponse> {
    const userId = req.user.sub;
    this.logger.log(`Getting HA heartbeat list on host: ${hostUid}`);
    return await this.haService.heartbeatList(userId, hostUid, body);
  }

  /**
   * Reload HA configuration on the CMS host.
   * CMS task: ha_reload
   *
   * @route POST /:hostUid/ha/reload
   */
  @Post('reload')
  async haReload(
    @Request() req,
    @Param('hostUid') hostUid: string
  ): Promise<HaReloadCmsResponse> {
    const userId = req.user.sub;
    this.logger.log(`HA reload on host: ${hostUid}`);
    return await this.haService.haReload(userId, hostUid);
  }

  /**
   * POC (HA slave setup): ssh connection check from this host to the master.
   *
   * @route POST /:hostUid/ha/make-slave/check-connection
   */
  @Post('make-slave/check-connection')
  async checkSshConnection(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaSshCheckDto) {
    this.logger.log(`HA slave POC: ssh check from host ${hostUid}`);
    return await this.haService.checkSshConnection(req.user.sub, hostUid, body);
  }

  /**
   * POC: starts the slave setup on this host.
   *
   * @route POST /:hostUid/ha/make-slave/start
   */
  @Post('make-slave/start')
  async startMakeSlave(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaMakeSlaveStartDto) {
    this.logger.log(`HA slave POC: setup start on host ${hostUid}`);
    return await this.haService.startMakeSlave(req.user.sub, hostUid, body);
  }

  /**
   * POC: the setup's state, step states and new log.
   *
   * @route POST /:hostUid/ha/make-slave/status
   */
  @Post('make-slave/status')
  async makeSlaveStatus(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaMakeSlaveJobDto) {
    return await this.haService.makeSlaveStatus(req.user.sub, hostUid, body);
  }

  /**
   * POC: cancels the setup.
   *
   * @route POST /:hostUid/ha/make-slave/cancel
   */
  @Post('make-slave/cancel')
  async cancelMakeSlave(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaMakeSlaveJobDto) {
    this.logger.log(`HA slave POC: setup cancel on host ${hostUid}`);
    return await this.haService.cancelMakeSlave(req.user.sub, hostUid, body);
  }

  /**
   * POC: deletes the old slave database folders a successful setup moved aside.
   *
   * @route POST /:hostUid/ha/make-slave/cleanup
   */
  @Post('make-slave/cleanup')
  async cleanupMakeSlave(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaMakeSlaveJobDto) {
    this.logger.log(`HA slave POC: cleanup on host ${hostUid}`);
    return await this.haService.cleanupMakeSlave(req.user.sub, hostUid, body);
  }
}
