import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { checkCmsStatusError } from './decorators/handle-cms-status-errors.decorator';
import { checkCmsTokenError } from './decorators/handle-cms-token-errors.decorator';
import { Logger } from '@nestjs/common';
import { BaseCmsRequest } from '@type/cms-request/base-cms-request';
import { formatAuditLog } from '@util';
import { getLongJobCmsTimeoutMs } from '../cms-job/cms-job.constants';

/**
 * Base service class for CMS API communication.
 * Provides common functionality for host lookup, token insertion, and CMS request execution.
 *
 * @category Business Services
 * @since 1.0.0
 */
export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(
    protected readonly hostService: HostService,
    protected readonly cmsClient: CmsHttpsClientService
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Executes a CMS API request with common error handling.
   * Handles host lookup, URL construction, authentication, and error checking.
   * Automatically adds token to the request.
   *
   * @param userId User ID from JWT
   * @param hostUid Host unique identifier
   * @param cmsRequest CMS request object (token will be added automatically)
   * @returns CMS response
   * @throws Error If host not found, request fails, or CMS status is fail
   */
  protected async executeCmsRequest<
    TRequest extends Omit<BaseCmsRequest, 'token'>,
    TResponse
  >(
    userId: string,
    hostUid: string,
    cmsRequest: TRequest
  ): Promise<TResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    // Add token to request if not already present
    const requestWithToken = { ...cmsRequest, token: host.token || '' };
    const startedAt = Date.now();

    this.logger.log(
      formatAuditLog('cms_request', {
        user: userId,
        method: 'POST',
        address: url,
        hostUid,
        task: cmsRequest.task,
        body: requestWithToken,
      })
    );

    const response = await this.cmsClient.postAuthenticated<TRequest, TResponse>(
      url,
      requestWithToken
    );
    const cmsResponse = response as {
      status?: string;
      task?: string;
      __EXEC_TIME?: string;
    };

    this.logger.log(
      formatAuditLog('cms_response', {
        user: userId,
        method: 'POST',
        address: url,
        hostUid,
        task: cmsRequest.task,
        status: cmsResponse.status ?? 'unknown',
        execTime: cmsResponse.__EXEC_TIME,
        durationMs: Date.now() - startedAt,
        payload: response,
      })
    );

    checkCmsTokenError(response);
    checkCmsStatusError(response);

    return response;
  }

  /** CMS calls that may run for hours (unload/load). Does not hold user-file locks. */
  protected async executeLongRunningCmsRequest<
    TRequest extends Omit<BaseCmsRequest, 'token'>,
    TResponse
  >(
    userId: string,
    hostUid: string,
    cmsRequest: TRequest,
    options?: { skipStatusCheck?: boolean }
  ): Promise<TResponse> {
    const host = await this.hostService.findHostInternal(userId, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;
    const requestWithToken = { ...cmsRequest, token: host.token || '' };
    const timeoutMs = getLongJobCmsTimeoutMs();
    const startedAt = Date.now();

    this.logger.log(
      formatAuditLog('cms_request', {
        user: userId,
        method: 'POST',
        address: url,
        hostUid,
        task: cmsRequest.task,
        longRunning: true,
        body: requestWithToken,
      })
    );

    const response = await this.cmsClient.postAuthenticated<TRequest, TResponse>(
      url,
      requestWithToken,
      { timeoutMs }
    );

    const cmsResponse = response as {
      status?: string;
      task?: string;
      __EXEC_TIME?: string;
    };

    this.logger.log(
      formatAuditLog('cms_response', {
        user: userId,
        method: 'POST',
        address: url,
        hostUid,
        task: cmsRequest.task,
        longRunning: true,
        status: cmsResponse.status ?? 'unknown',
        execTime: cmsResponse.__EXEC_TIME,
        durationMs: Date.now() - startedAt,
        payload: response,
      })
    );

    checkCmsTokenError(response);
    if (!options?.skipStatusCheck) {
      checkCmsStatusError(response);
    }

    return response;
  }

  /**
   * Extracts domain-only data from CMS response by removing envelope fields.
   *
   * @param response CMS response with envelope fields
   * @returns Response without envelope fields (__EXEC_TIME, note, status, task)
   */
  protected extractDomainData<T extends { __EXEC_TIME?: any; note?: any; status?: any; task?: any }>(
    response: T
  ): Omit<T, '__EXEC_TIME' | 'note' | 'status' | 'task'> {
    const { __EXEC_TIME, note, status, task, ...dataOnly } = response;
    return dataOnly;
  }
}
