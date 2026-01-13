import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Request,
} from '@nestjs/common';
import {
    AddHostRequest,
    GetHostsResponse,
    HostResponse,
    UpdateHostClientRequest,
} from '@api-interfaces';
import { HostService } from './host.service';

/**
 * Controller for managing host-related operations.
 *
 * Handles HTTP requests for host management including adding, updating,
 * retrieving, and deleting hosts. All operations require user authentication.
 * - Follows RESTful pattern: /host (list/add), /host/:hostUid (get/update/delete)
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller('host')
export class HostController {
    constructor(private readonly hostService: HostService) {}

    /**
     * Add a new host to user's host list.
     *
     * @param request - Express request object containing user payload
     * @param hostInfo - Host information without UID
     * @returns Promise<GetHostsResponse> Updated host list without passwords
     */
    @Post()
    async addHost(
        @Request() request,
        @Body() hostInfo: AddHostRequest,
    ): Promise<GetHostsResponse> {
        const userId = request.user.sub;
        return { host_list: await this.hostService.addHost(userId, hostInfo) };
    }

    /**
     * Get all hosts for the authenticated user.
     *
     * @param request - Express request object containing user payload
     * @returns Promise<GetHostsResponse> List of hosts without passwords
     */
    @Get()
    async getHosts(@Request() request): Promise<GetHostsResponse> {
        const userId = request.user.sub;
        return await this.hostService.getHostList(userId);
    }

    /**
     * Get a specific host by UID.
     *
     * @route GET /host/:hostUid
     * @param request - Express request object containing user payload
     * @param hostUid - Host unique identifier from path parameter
     * @returns Promise<HostResponse> Host information without password
     * @example
     * // GET /host/host-uid
     */
    @Get(':hostUid')
    async getHost(
        @Request() request,
        @Param('hostUid') hostUid: string,
    ): Promise<HostResponse> {
        const userId = request.user.sub;
        return await this.hostService.findHost(userId, hostUid);
    }

    /**
     * Update an existing host.
     *
     * @route PUT /host/:hostUid
     * @param request - Express request object containing user payload
     * @param hostUid - Host unique identifier from path parameter
     * @param hostInfo - Updated host information (without hostUid)
     * @returns Promise<GetHostsResponse> Updated host list
     * @example
     * // PUT /host/host-uid
     * // Body: { "name": "new-name", "address": "192.168.1.1", ... }
     */
    @Put(':hostUid')
    async updateHost(
        @Request() request,
        @Param('hostUid') hostUid: string,
        @Body() hostInfo: Omit<UpdateHostClientRequest, 'hostUid'>,
    ): Promise<GetHostsResponse> {
        const userId = request.user.sub;
        return {host_list : await this.hostService.updateHost(userId, hostUid, hostInfo)};
    }

    /**
     * Delete a host and return updated host list.
     *
     * @route DELETE /host/:hostUid
     * @param request - Express request object containing user payload
     * @param hostUid - Host unique identifier from path parameter
     * @returns Promise<GetHostsResponse> Updated host list without passwords
     * @example
     * // DELETE /host/host-uid
     */
    @Delete(':hostUid')
    async deleteHost(
        @Request() request,
        @Param('hostUid') hostUid: string,
    ): Promise<GetHostsResponse> {
        const userId = request.user.sub;
        return {host_list : await this.hostService.deleteHost(userId, hostUid)};
    }
}
