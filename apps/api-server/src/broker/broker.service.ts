import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { BaseService, HandleBrokerErrors } from '@common';
import { BrokerError } from '@error/broker/broker-error';
import { HostService } from '@host';
import { Injectable } from '@nestjs/common';
import { GetBrokerStatusClientResponse } from '@api-interfaces';
import {
  BaseCmsRequest,
  BaseCmsResponse,
  GetBrokerStatusCmsRequest,
  GetBrokerStatusCmsResponse,
  GetBrokersInfoCmsResponse,
  HandleBrokerCmsRequest,
} from '@type';

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
export class BrokerService extends BaseService {
  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService
  ) {
    super(hostService, cmsClient);
  }

  @HandleBrokerErrors()
  async getBrokers(userId: string, hostUid: string) {
    const cmsRequest: BaseCmsRequest = {
      task: 'getbrokersinfo',
    };
    const response = await this.executeCmsRequest<BaseCmsRequest, GetBrokersInfoCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    if (response.status !== 'success') {
      throw BrokerError.GetBrokersFailed();
    }
    return response.brokersinfo;
  }

  @HandleBrokerErrors()
  async stopBroker(userId: string, hostUid: string, bname: string): Promise<BaseCmsResponse> {
    const cmsRequest: HandleBrokerCmsRequest = {
      task: 'broker_stop',
      bname: bname,
    };

    const response = await this.executeCmsRequest<HandleBrokerCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    if (response.status !== 'success') {
      throw BrokerError.BrokerStopFailed();
    }
    return response;
  }

  @HandleBrokerErrors()
  async startBroker(userId: string, hostUid: string, bname: string): Promise<BaseCmsResponse> {
    const cmsRequest: HandleBrokerCmsRequest = {
      task: 'broker_start',
      bname: bname,
    };

    const response = await this.executeCmsRequest<HandleBrokerCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    if (response.status !== 'success') {
      throw BrokerError.BrokerStartFailed();
    }
    return response;
  }

  @HandleBrokerErrors()
  async restartBroker(userId: string, hostUid: string, bname: string): Promise<boolean> {
    const stopRequest: HandleBrokerCmsRequest = {
      task: 'broker_stop',
      bname: bname,
    };

    const stopResponse = await this.executeCmsRequest<HandleBrokerCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      stopRequest
    );
    if (stopResponse.status === 'success') {
      const startRequest: HandleBrokerCmsRequest = {
        task: 'broker_start',
        bname: bname,
      };

      const startResponse = await this.executeCmsRequest<
        HandleBrokerCmsRequest,
        BaseCmsResponse
      >(userId, hostUid, startRequest);
      if (startResponse.status === 'success') {
        return true;
      } else {
        throw BrokerError.BrokerStartFailed();
      }
    } else {
      throw BrokerError.BrokerStopFailed();
    }
  }

  /**
   * Get broker status including application server information.
   *
   * @param userId - User ID
   * @param hostUid - Host unique identifier
   * @param bname - Broker name
   * @returns Broker status data without BaseCmsResponse fields
   * @throws BrokerError if the request fails
   */
  @HandleBrokerErrors()
  async getBrokerStatus(
    userId: string,
    hostUid: string,
    bname: string
  ): Promise<GetBrokerStatusClientResponse> {
    const cmsRequest: GetBrokerStatusCmsRequest = {
      task: 'getbrokerstatus',
      bname: bname,
    };

    const response = await this.executeCmsRequest<
      GetBrokerStatusCmsRequest,
      GetBrokerStatusCmsResponse
    >(userId, hostUid, cmsRequest);

    if (response.status === 'success') {
      return this.extractDomainData(response);
    }

    throw BrokerError.GetBrokersFailed({ response });
  }

  @HandleBrokerErrors()
  async stopAllBrokers(userId: string, hostUid: string): Promise<boolean> {
    const cmsRequest: BaseCmsRequest = {
      task: 'stopbroker',
    };
    const response = await this.executeCmsRequest<BaseCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    if (response.status === 'success') {
      return true;
    }

    throw BrokerError.BrokerStopFailed();
  }

  @HandleBrokerErrors()
  async startAllBrokers(userId: string, hostUid: string): Promise<boolean> {
    const cmsRequest: BaseCmsRequest = {
      task: 'startbroker',
    };
    const response = await this.executeCmsRequest<BaseCmsRequest, BaseCmsResponse>(
      userId,
      hostUid,
      cmsRequest
    );

    if (response.status === 'success') {
      return true;
    }

    throw BrokerError.BrokerStartFailed();
  }
}
