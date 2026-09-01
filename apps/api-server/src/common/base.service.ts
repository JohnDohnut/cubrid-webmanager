import { HostService } from '@host';
import { CmsHttpsClientService } from '@cms-https-client/cms-https-client.service';
import { checkCmsStatusError } from './decorators/handle-cms-status-errors.decorator';
import { checkCmsTokenError } from './decorators/handle-cms-token-errors.decorator';
import { Logger } from '@nestjs/common';
import { BaseCmsRequest } from '@type/cms-request/base-cms-request';
import { formatAuditLog } from '@util';
import {
  CMS_ASYNC_JOB_FIRST_POLL_INTERVAL_MS,
  CMS_ASYNC_JOB_POLL_INTERVAL_MS,
  getLongJobCmsTimeoutMs,
} from '../cms-job/cms-job.constants';

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
   * CMS calls that CMS itself may run asynchronously (unload/load/create/optimize/
   * check/compact/copy/addvol/rename/backupdb/restoredb). Sends `async:"yes"`; if CMS
   * replies with `job-status:"running"` (either because we asked, or because CMS's own
   * internal http timeout elapsed and it fell back to async on its own), polls
   * `gettaskstatus` until the job reaches a terminal state, then returns that final
   * response — CMS returns the exact same body the task would have produced
   * synchronously, just with `uuid`/`job-status` merged on top.
   *
   * Safe against CMS builds that don't support this yet: `async` is simply an
   * unrecognized key there and the response never carries `job-status`, so the loop
   * below never engages and this call behaves exactly like executeLongRunningCmsRequest.
   */
  protected async executeAsyncCmsJobRequest<
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
    const requestWithToken = { ...cmsRequest, token: host.token || '', async: 'yes' };
    const timeoutMs = getLongJobCmsTimeoutMs();
    const deadline = Date.now() + timeoutMs;
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

    let response = await this.cmsClient.postAuthenticated<typeof requestWithToken, any>(
      url,
      requestWithToken,
      { timeoutMs }
    );

    let polls = 0;
    while (response?.['job-status'] === 'running') {
      if (Date.now() > deadline) {
        throw new Error(
          `CMS async job for task "${cmsRequest.task}" did not finish within ${timeoutMs}ms`
        );
      }
      await this.sleep(
        polls === 0 ? CMS_ASYNC_JOB_FIRST_POLL_INTERVAL_MS : CMS_ASYNC_JOB_POLL_INTERVAL_MS
      );
      polls += 1;
      // Re-read the host's token on every poll instead of reusing the one
      // captured at the top: CMS ties a single token per dbmt user, so a
      // relogin to this host anywhere else while a long job (hours) is
      // still polling would otherwise invalidate the captured token and
      // break tracking of a CMS job that's actually still running fine.
      const currentHost = await this.hostService.findHostInternal(userId, hostUid);
      response = await this.cmsClient.postAuthenticated<
        { task: string; token: string; uuid: unknown },
        any
      >(url, { task: 'gettaskstatus', token: currentHost.token || '', uuid: response.uuid });
    }

    this.logger.log(
      formatAuditLog('cms_response', {
        user: userId,
        method: 'POST',
        address: url,
        hostUid,
        task: cmsRequest.task,
        longRunning: true,
        status: response?.status ?? 'unknown',
        jobStatus: response?.['job-status'],
        polls,
        execTime: response?.__EXEC_TIME,
        durationMs: Date.now() - startedAt,
        payload: response,
      })
    );

    checkCmsTokenError(response);
    if (!options?.skipStatusCheck) {
      checkCmsStatusError(response);
    }

    return response as TResponse;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
