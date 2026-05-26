import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Request } from '@nestjs/common';
import {
  AddHostRequest,
  CreateHostGroupRequest,
  GetHostsResponse,
  HostResponse,
  UpdateHostGroupRequest,
  UpdateHostClientRequest,
} from '@api-interfaces';
import { HostService, AddHostPayload } from './host.service';
import { validateRequiredFields } from '@util';

@Controller('host')
export class HostController {
  private readonly logger = new Logger(HostController.name);

  constructor(private readonly hostService: HostService) {}

  @Post()
  async addHost(@Request() request, @Body() hostInfo: AddHostPayload): Promise<GetHostsResponse> {
    const userId = request.user.sub;
    validateRequiredFields(
      hostInfo,
      ['address', 'port', 'id', 'password', 'alias'],
      'host/add',
      this.logger
    );
    return { host_groups: await this.hostService.addHost(userId, hostInfo) };
  }

  @Post('group')
  async createGroup(
    @Request() request,
    @Body() body: CreateHostGroupRequest
  ): Promise<GetHostsResponse> {
    const userId = request.user.sub;
    validateRequiredFields(body, ['name'], 'host/group/create', this.logger);
    return { host_groups: await this.hostService.createHostGroup(userId, body.name) };
  }

  @Put('group/:groupId')
  async updateGroup(
    @Request() request,
    @Param('groupId') groupId: string,
    @Body() body: UpdateHostGroupRequest
  ): Promise<GetHostsResponse> {
    const userId = request.user.sub;
    return { host_groups: await this.hostService.updateHostGroup(userId, groupId, body) };
  }

  @Delete('group/:groupId')
  async deleteGroup(
    @Request() request,
    @Param('groupId') groupId: string
  ): Promise<GetHostsResponse> {
    const userId = request.user.sub;
    return { host_groups: await this.hostService.deleteHostGroup(userId, groupId) };
  }

  @Get()
  async getHosts(@Request() request): Promise<GetHostsResponse> {
    const userId = request.user.sub;
    return await this.hostService.getHostList(userId);
  }

  @Get(':hostUid')
  async getHost(@Request() request, @Param('hostUid') hostUid: string): Promise<HostResponse> {
    const userId = request.user.sub;
    return await this.hostService.findHost(userId, hostUid);
  }

  @Put(':hostUid')
  async updateHost(
    @Request() request,
    @Param('hostUid') hostUid: string,
    @Body() hostInfo: Omit<UpdateHostClientRequest, 'hostUid'>
  ): Promise<GetHostsResponse> {
    const userId = request.user.sub;
    return { host_groups: await this.hostService.updateHost(userId, hostUid, hostInfo) };
  }

  @Delete(':hostUid')
  async deleteHost(
    @Request() request,
    @Param('hostUid') hostUid: string
  ): Promise<GetHostsResponse> {
    const userId = request.user.sub;
    return { host_groups: await this.hostService.deleteHost(userId, hostUid) };
  }

  @Post(':hostUid/mark-ha')
  async markHa(
    @Request() request,
    @Param('hostUid') hostUid: string,
    @Body() body: { groupName?: string }
  ): Promise<GetHostsResponse> {
    const userId = request.user.sub;
    return { host_groups: await this.hostService.markGroupHa(userId, hostUid, body?.groupName) };
  }
}
