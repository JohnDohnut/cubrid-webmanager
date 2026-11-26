import { Body, Controller, Logger, Param, Post, Request } from '@nestjs/common';
import { HeartbeatListClientResponse } from '@api-interfaces';
import { HaReloadCmsResponse } from '@type/cms-response';
import { HaAddNodesCleanupDto, HaAddNodesDto, HaAddNodesJobDto, HaAddNodesRollbackDto, HaSshCheckDto, HeartbeatListDto } from '@type/index';
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
   * POC (HA node add): ssh connection check from this host to a new or an existing node.
   *
   * @route POST /:hostUid/ha/add-nodes/check-connection
   */
  @Post('add-nodes/check-connection')
  async checkSshConnection(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaSshCheckDto) {
    this.logger.log(`HA node add POC: ssh check from host ${hostUid}`);
    return await this.haService.checkSshConnection(req.user.sub, hostUid, body);
  }

  /**
   * POC: starts a plan (checks only) or a run of adding nodes.
   *
   * @route POST /:hostUid/ha/add-nodes/start
   */
  @Post('add-nodes/start')
  async addNodes(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaAddNodesDto) {
    this.logger.log(`HA node add POC: ${body.action} on host ${hostUid}`);
    return await this.haService.addNodes(req.user.sub, hostUid, body);
  }

  /**
   * POC: the runs started on this host, to find one again after the browser closed.
   *
   * @route POST /:hostUid/ha/add-nodes/jobs
   */
  @Post('add-nodes/jobs')
  async addNodesJobs(@Request() req, @Param('hostUid') hostUid: string) {
    return await this.haService.addNodesJobs(req.user.sub, hostUid);
  }

  /**
   * POC: a job's state, steps, plan and new log.
   *
   * @route POST /:hostUid/ha/add-nodes/status
   */
  @Post('add-nodes/status')
  async addNodesStatus(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaAddNodesJobDto) {
    return await this.haService.addNodesStatus(req.user.sub, hostUid, body);
  }

  /**
   * POC: cancels the running job.
   *
   * @route POST /:hostUid/ha/add-nodes/cancel
   */
  @Post('add-nodes/cancel')
  async cancelAddNodes(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaAddNodesJobDto) {
    this.logger.log(`HA node add POC: cancel on host ${hostUid}`);
    return await this.haService.cancelAddNodes(req.user.sub, hostUid, body);
  }

  /**
   * POC: undoes what an interrupted job changed.
   *
   * @route POST /:hostUid/ha/add-nodes/rollback
   */
  @Post('add-nodes/rollback')
  async rollbackAddNodes(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaAddNodesRollbackDto) {
    this.logger.log(`HA node add POC: rollback on host ${hostUid}`);
    return await this.haService.rollbackAddNodes(req.user.sub, hostUid, body);
  }

  /**
   * POC: deletes the old database folders a successful job moved aside on the new nodes.
   *
   * @route POST /:hostUid/ha/add-nodes/cleanup
   */
  @Post('add-nodes/cleanup')
  async cleanupAddNodes(@Request() req, @Param('hostUid') hostUid: string, @Body() body: HaAddNodesCleanupDto) {
    this.logger.log(`HA node add POC: cleanup on host ${hostUid}`);
    return await this.haService.cleanupAddNodes(req.user.sub, hostUid, body);
  }
}
