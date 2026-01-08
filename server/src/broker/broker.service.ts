import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { HandleBrokerErrors, checkCmsTokenError } from '@common';
import { BrokerError } from '@error/broker/broker-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { BaseCmsRequest, BaseCmsResponse, GetBrokerStatusClientResponse, GetBrokerStatusCmsRequest, GetBrokerStatusCmsResponse, GetBrokersInfoCmsResponse, HandleBrokerCmsRequest } from '@type';

/**
 * Service for managing broker operations.
 *
 * Provides high-level business logic for broker-related operations
 * including message handling and service coordination.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class BrokerService {
    constructor(
        private readonly hostService : HostService,
        private readonly cmsClient : CmsHttpsClientService,
    ){}

    @HandleBrokerErrors()
    async getBrokers(userId: string, hostUid : string){
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`
        const body : BaseCmsRequest = {
            task : "getbrokersinfo",
            token : host.token ? host.token : ""
        }
        const response = await this.cmsClient.postAuthenticated<BaseCmsRequest, GetBrokersInfoCmsResponse>(url, body);
        
        checkCmsTokenError(response);
        
        if(response.status !== 'success'){
            throw BrokerError.GetBrokersFailed();
        }
        return response.brokersinfo;
        
    }

    
    @HandleBrokerErrors()
    async stopBroker(userId: string, hostUid: string, bname : string) : Promise<BaseCmsResponse>{
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`
        const body : HandleBrokerCmsRequest = {
            task : "broker_stop",
            token : host.token ? host.token : "",
            bname : bname
        }

        const response = await this.cmsClient.postAuthenticated<HandleBrokerCmsRequest, BaseCmsResponse>(url, body);
        
        checkCmsTokenError(response);
        
        if(response.status !== 'success'){
            throw BrokerError.BrokerStopFailed();
        }
        return response;

    }

    @HandleBrokerErrors()
    async startBroker(userId: string, hostUid: string, bname : string): Promise<BaseCmsResponse>{
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`
        const body : HandleBrokerCmsRequest = {
            task : "broker_start",
            token : host.token ? host.token : "",
            bname : bname
        }

        const response = await this.cmsClient.postAuthenticated<HandleBrokerCmsRequest, BaseCmsResponse>(url, body);
        
        checkCmsTokenError(response);
        
        if(response.status !== 'success'){
            throw BrokerError.BrokerStartFailed();
        }
        return response;

    }


    @HandleBrokerErrors()
    async restartBroker(userId: string, hostUid: string, bname : string) : Promise<boolean> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`
        const stopRequest : HandleBrokerCmsRequest = {
            task : "broker_stop",
            token : host.token ? host.token : "",
            bname : bname
        }

        const response = await this.cmsClient.postAuthenticated<HandleBrokerCmsRequest, BaseCmsResponse>(url, stopRequest);
        if(response.status === "success"){
            const startRequest : HandleBrokerCmsRequest = {
                task : "broker_start",
                token : host.token ? host.token : "",
                bname : bname
            }

            const response = await this.cmsClient.postAuthenticated<HandleBrokerCmsRequest, BaseCmsResponse>(url, startRequest);
            if(response.status === "success"){
                return true;
            }
            else{
                throw BrokerError.BrokerStartFailed();
            }
        }   
        else{
            throw BrokerError.BrokerStopFailed();
        }
    }

    /**
     * Get broker status including application server information.
     * 
     * 애플리케이션 서버 정보를 포함한 브로커 상태를 조회합니다.
     * 
     * @param userId - User ID
     * @param hostUid - Host unique identifier
     * @param bname - Broker name
     * @returns Broker status data without BaseCmsResponse fields
     * @throws BrokerError if the request fails
     */
    @HandleBrokerErrors()
    async getBrokerStatus(userId: string, hostUid: string, bname: string): Promise<GetBrokerStatusClientResponse> {
        const host = await this.hostService.findHostInternal(userId, hostUid);
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body : GetBrokerStatusCmsRequest = {
            task : "getbrokerstatus",
            token : host.token ? host.token : "",
            bname : bname
        };

        const response = await this.cmsClient.postAuthenticated<GetBrokerStatusCmsRequest, GetBrokerStatusCmsResponse>(url, body);
        
        checkCmsTokenError(response);
        
        if (response.status === "success") {
            const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
            return dataOnly;
        }
        
        throw BrokerError.GetBrokersFailed({ response });
    }
    
    @HandleBrokerErrors()
    async stopAllBrokers(userId: string, hostUid: string) : Promise<boolean>{
        const host = await this.hostService.findHostInternal(userId, hostUid)
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body  = {
            task : "stopbroker",
            token : host.token ? host.token : "",
        };
        const response : BaseCmsResponse = await this.cmsClient.postAuthenticated<BaseCmsRequest, BaseCmsResponse>(url, body);

        checkCmsTokenError(response);

        if(response.status === "success"){
            return true;
        }

        throw BrokerError.BrokerStopFailed();

    }

    @HandleBrokerErrors()
    async startAllBrokers(userId : string, hostUid : string) : Promise<boolean> {
        const host = await this.hostService.findHostInternal(userId, hostUid)
        const url = `https://${host.address}:${host.port}/cm_api`;
        const body  = {
            task : "startbroker",
            token : host.token ? host.token : "",
        };
        const response : BaseCmsResponse = await this.cmsClient.postAuthenticated<BaseCmsRequest, BaseCmsResponse>(url, body);

        checkCmsTokenError(response);

        if(response.status === "success"){
            return true;
        }

        throw BrokerError.BrokerStartFailed();
 
    }



}
