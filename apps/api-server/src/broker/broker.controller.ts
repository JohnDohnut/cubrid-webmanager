import { Controller, Get, Logger, Param, Post, Request } from '@nestjs/common';
import { BrokerListClientResponse, GetBrokerStatusClientResponse } from '@api-interfaces';
import { BaseCmsResponse } from '@type';
import { BrokerService } from './broker.service';

/**
 * Controller for handling broker-related operations.
 * Provides REST API endpoints for broker management operations including:
 * - Get broker list for a specific host
 * - Stop a broker
 * - Start a broker
 * - Restart a broker
 * - Get broker status
 *
 * 브로커 관련 작업을 처리하기 위한 컨트롤러입니다.
 * 브로커의 시작, 중지, 재시작, 목록 조회, 상태 조회를 위한 REST API 엔드포인트를 제공합니다.
 * - 모든 엔드포인트는 경로 파라미터로 `hostUid`를 받습니다
 * - RESTful 패턴 준수: /:hostUid/broker/{action}/{identifier}
 *
 * @category Controllers
 * @since 1.0.0
 */
@Controller(':hostUid/broker')
export class BrokerController {
    private readonly logger = new Logger(BrokerController.name);

    constructor(private readonly brokerService: BrokerService) {}

    /**
     * Get list of brokers for a specific host.
     * 
     * 특정 호스트의 브로커 목록을 조회합니다.
     * 
     * @route GET /:hostUid/broker/list
     * @param req - Request object containing user information
     * @param hostUid - Host unique identifier from path parameter
     * @returns List of brokers
     * @example
     * // POST /host-uid/broker/list
     */
    @Get('list')
    async getBrokers(
        @Request() req,
        @Param('hostUid') hostUid: string,
    ): Promise<BrokerListClientResponse> {
        const userId = req.user.sub;
        
        const response = await this.brokerService.getBrokers(userId, hostUid);
        return response;
    }

    /**
     * Stop a broker.
     * 
     * 브로커를 중지합니다.
     * 
     * @route POST /:hostUid/broker/stop/:bname
     * @param req - Request object containing user information
     * @param hostUid - Host unique identifier from path parameter
     * @param bname - Broker name from path parameter
     * @returns Response indicating success or failure
     * @example
     * // POST /host-uid/broker/stop/query_editor
     */
    @Post('stop/:bname')
    async stopBroker(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('bname') bname: string,
    ): Promise<BaseCmsResponse> {
        const userId = req.user.sub;
        
        Logger.log(`Stopping broker: ${bname} on host: ${hostUid}`, 'BrokerController');
        const response = await this.brokerService.stopBroker(userId, hostUid, bname);
        return response;
    }

    /**
     * Start a broker.
     * 
     * 브로커를 시작합니다.
     * 
     * @route POST /:hostUid/broker/start/:bname
     * @param req - Request object containing user information
     * @param hostUid - Host unique identifier from path parameter
     * @param bname - Broker name from path parameter
     * @returns Response indicating success or failure
     * @example
     * // POST /host-uid/broker/start/query_editor
     */
    @Post('start/:bname')
    async startBroker(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('bname') bname: string,
    ): Promise<BaseCmsResponse> {
        const userId = req.user.sub;
        
        Logger.log(`Starting broker: ${bname} on host: ${hostUid}`, 'BrokerController');
        const response = await this.brokerService.startBroker(userId, hostUid, bname);
        return response;
    }

    /**
     * Restart a broker.
     * 
     * 브로커를 재시작합니다.
     * 
     * @route POST /:hostUid/broker/restart/:bname
     * @param req - Request object containing user information
     * @param hostUid - Host unique identifier from path parameter
     * @param bname - Broker name from path parameter
     * @returns Boolean indicating success
     * @example
     * // POST /host-uid/broker/restart/query_editor
     */
    @Post('restart/:bname')
    async restartBroker(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('bname') bname: string,
    ): Promise<boolean> {
        const userId = req.user.sub;
        
        Logger.log(`Restarting broker: ${bname} on host: ${hostUid}`, 'BrokerController');
        const response: boolean = await this.brokerService.restartBroker(userId, hostUid, bname);
        return response;
    }

    /**
     * Get broker status including application server information.
     * 
     * 애플리케이션 서버 정보를 포함한 브로커 상태를 조회합니다.
     * 
     * @route GET /:hostUid/broker/status/:bname
     * @param req - Request object containing user information
     * @param hostUid - Host unique identifier from path parameter
     * @param bname - Broker name from path parameter
     * @returns Broker status data without BaseCmsResponse fields
     * @example
     * // POST /host-uid/broker/status/query_editor
     */
    @Get('status/:bname')
    async getBrokerStatus(
        @Request() req,
        @Param('hostUid') hostUid: string,
        @Param('bname') bname: string,
    ): Promise<GetBrokerStatusClientResponse> {
        const userId = req.user.sub;
        
        Logger.log(`Getting broker status: ${bname} on host: ${hostUid}`, 'BrokerController');
        const response = await this.brokerService.getBrokerStatus(userId, hostUid, bname);
        return response;
    }
}
