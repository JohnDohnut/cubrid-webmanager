import { CmsError } from '@error/cms/cms-error';
import { AppError } from '@error/app-error';
import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

/**
 * A method decorator that wraps CMS client methods in a try...catch block.
 *
 * It provides centralized handling for HTTP/Axios errors when communicating
 * with CMS services, translating them into appropriate CmsError instances.
 *
 * This decorator handles various HTTP error scenarios:
 * - Response errors (4xx, 5xx status codes)
 * - Request errors (network issues, timeouts)
 * - Unknown errors
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class CmsHttpsClientService {
 *   @HandleCmsHttpsClientErrors()
 *   async postData(url: string, data: any): Promise<any> {
 *     return this.httpService.post(url, data);
 *   }
 * }
 * ```
 */
export function HandleCmsHttpsClientErrors() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }

        // Check if error has axios-like structure
        if (error?.response || error?.request || error?.config) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            throw CmsError.RequestFailed(
              {
                status: axiosError.response.status,
                data: axiosError.response.data,
              },
              error
            );
          } else if (axiosError.request) {
            Logger.log(axiosError.request);
            throw CmsError.NoResponse(undefined, error);
          }
        }
        throw CmsError.Unknown({ message: error.message || 'Unknown error' }, error);
      }
    };

    return descriptor;
  };
}
