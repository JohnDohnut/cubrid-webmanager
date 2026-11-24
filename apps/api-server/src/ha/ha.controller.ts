import { Body, Controller, Logger, Param, Post, Request } from '@nestjs/common';
import { HeartbeatListClientResponse } from '@api-interfaces';
import { HaReloadCmsResponse } from '@type/cms-response';
import { HaAddSlaveStartDto, HaConvertMasterDto, HaSlaveCleanupDto, HaSlaveJobDto, HaSshCheckDto, HeartbeatListDto } from '@type/index';
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
   * POC (HA slave add, run on the master): ssh connection check to the new slave or a replica.
   *
   * @route POST /:hostUid/ha/add-slave/check-connection
   */
  @Post('add-slave/check-connection')
  async checkSshConnection(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaSshCheckDto) {
    this.logger.log(`HA slave POC: ssh check from host ${hostUid}`);
    return await this.haService.checkSshConnection(req.user.sub, hostUid, body);
  }

  /**
   * POC: turns a single database into an HA master (restarts it).
   *
   * @route POST /:hostUid/ha/add-slave/convert-master
   */
  @Post('add-slave/convert-master')
  async convertMaster(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaConvertMasterDto) {
    this.logger.log(`HA slave POC: convert to HA master on host ${hostUid}`);
    return await this.haService.convertMaster(req.user.sub, hostUid, body);
  }

  /**
   * POC: starts adding a new slave from this host, the master.
   *
   * @route POST /:hostUid/ha/add-slave/start
   */
  @Post('add-slave/start')
  async startAddSlave(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaAddSlaveStartDto) {
    this.logger.log(`HA slave POC: add-slave start on host ${hostUid}`);
    return await this.haService.startAddSlave(req.user.sub, hostUid, body);
  }

  /**
   * POC: a job's state, step states and new log.
   *
   * @route POST /:hostUid/ha/add-slave/status
   */
  @Post('add-slave/status')
  async slaveJobStatus(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaSlaveJobDto) {
    return await this.haService.slaveJobStatus(req.user.sub, hostUid, body);
  }

  /**
   * POC: cancels the running job.
   *
   * @route POST /:hostUid/ha/add-slave/cancel
   */
  @Post('add-slave/cancel')
  async cancelSlaveJob(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaSlaveJobDto) {
    this.logger.log(`HA slave POC: cancel on host ${hostUid}`);
    return await this.haService.cancelSlaveJob(req.user.sub, hostUid, body);
  }

  /**
   * POC: deletes the old database folders a successful slave add moved aside on the new slave.
   *
   * @route POST /:hostUid/ha/add-slave/cleanup
   */
  @Post('add-slave/cleanup')
  async cleanupSlaveJob(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaSlaveCleanupDto) {
    this.logger.log(`HA slave POC: cleanup on host ${hostUid}`);
    return await this.haService.cleanupSlaveJob(req.user.sub, hostUid, body);
  }
}
