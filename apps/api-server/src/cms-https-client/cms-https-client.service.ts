import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HandleCmsErrors } from '@common';
import { CmsForwardClientRequest } from '@api-interfaces';
import { BaseCmsRequest } from '@type';
import * as https from 'https';
import { HostService } from '@host';
import { EncryptionService } from '@security';
import { checkCmsTokenError, checkCmsStatusError } from '@common';

/**
 * Callback function to determine whether status check should be skipped.
 * Returns true if status check should be skipped, false otherwise.
 *
 * @param task - The task name from the request
 * @param response - The CMS response (before status check)
 * @returns true if status check should be skipped, false otherwise
 */
export type ShouldSkipStatusCheckCallback = (task: string, response: any) => boolean;

/**
 * Service for handling secure HTTPS client communications with CMS (Central Management System).
 * This service provides methods for making authenticated and unauthenticated requests to CMS APIs,
 * and for forwarding client requests after augmenting them with necessary authentication tokens.
 *
 * @category Business Services
 * @since 1.0.0
 */
@Injectable()
export class CmsHttpsClientService {
  /**
   * @param httpService - The NestJS HttpService for making HTTP requests.
   * @param hostService - Service for retrieving host-related information.
   * @param encryptionService - Service for handling encryption and hashing operations.
   */
  constructor(
    private readonly httpService: HttpService,
    private readonly hostService: HostService,
    private readonly encryptionService: EncryptionService
  ) {}

  /**
   * Sends an unauthenticated POST request to a public CMS API endpoint.
   * This method is suitable for endpoints that do not require a user authentication token.
   * Note: `rejectUnauthorized` is set to `false` for development/testing purposes,
   * which means SSL certificates will not be validated. This should be reviewed for production environments.
   *
   * @param url - The target URL of the CMS API endpoint.
   * @param data - The request payload, excluding the authentication token.
   * @returns A Promise that resolves with the response data from the CMS API.
   * @throws CmsError if the request fails or an unexpected error occurs.
   */
  @HandleCmsErrors()
  public async postPublic<T extends Omit<BaseCmsRequest, 'token'>, P>(
    url: string,
    data: T
  ): Promise<P> {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    Logger.log({ url, data, config });
    const response = await firstValueFrom(this.httpService.post<P>(url, data, config));
    return response.data;
  }

  /**
   * Sends an authenticated POST request to a CMS API endpoint.
   * This method expects the request data to include an authentication token.
   * Note: `rejectUnauthorized` is set to `false` for development/testing purposes,
   * which means SSL certificates will not be validated. This should be reviewed for production environments.
   *
   * @param url - The target URL of the CMS API endpoint.
   * @param data - The request payload, including the authentication token.
   * @returns A Promise that resolves with the response data from the CMS API.
   * @throws CmsError if the request fails or an unexpected error occurs.
   */
  @HandleCmsErrors()
  public async postAuthenticated<T extends BaseCmsRequest, P>(url: string, data: T): Promise<P> {
    const config = {
      headers: { 'Content-Type': 'application/json' },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    Logger.log({ url, data, config });
    const response = await firstValueFrom(this.httpService.post<P>(url, data, config));
    return response.data;
  }

  /**
   * Forwards an authenticated client request to a CMS API endpoint.
   * This method retrieves host information, constructs the full CMS API URL,
   * and injects the necessary authentication token into the request body before sending it.
   * The client is not expected to provide the token directly.
   *
   * @param sub - The subject (user ID) from the authentication token, used to find the host.
   * @param requestBody - The original request payload from the client, containing hostUid and task.
   * @param shouldSkipStatusCheck - Optional callback to determine if status check should be skipped (for CMS bug workarounds).
   * @returns A Promise that resolves with the response data from the CMS API.
   * @throws HostError.NoSuchHost if the specified host is not found.
   * @throws CmsError if the forwarded request fails or an unexpected error occurs.
   */
  @HandleCmsErrors()
  public async forwardAuthenticated<T extends CmsForwardClientRequest, P>(
    sub: string,
    requestBody: T,
    shouldSkipStatusCheck?: ShouldSkipStatusCheckCallback
  ): Promise<P> {
    const hostUid = requestBody.hostUid;
    const host = await this.hostService.findHostInternal(sub, hostUid);
    const url = `https://${host.address}:${host.port}/cm_api`;

    const request: BaseCmsRequest = {
      token: (host.token as string) || '',
      ...requestBody,
    };
    Logger.log(request);
    const rv = (await this.postAuthenticated(url, request)) as any;

    checkCmsTokenError(rv);

    const task = requestBody.task;
    const shouldSkip = shouldSkipStatusCheck ? shouldSkipStatusCheck(task, rv) : false;

    if (!shouldSkip) {
      checkCmsStatusError(rv, `CMS request failed: ${rv.note || 'Unknown error'}`);
    }

    return rv;
  }
}
