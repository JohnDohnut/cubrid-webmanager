import { CmsError } from '@error/cms/cms-error';
import { BaseCmsResponse } from '@type/cms-response/base-cms-response';

/**
 * Checks if a CMS response indicates a failure (status === 'fail').
 *
 * @param response - The CMS response to check
 * @returns true if the response indicates a failure
 */
export function isCmsStatusFailure(response: any): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }

  if ('status' in response) {
    return response.status === 'fail' || response.status === 'failure';
  }

  return false;
}

/**
 * Checks a CMS response for failure status and throws CmsError.RequestFailed if found.
 * This is a helper function that can be used directly in service methods.
 *
 * @param response - The CMS response to check
 * @param errorMessage - Optional custom error message
 * @throws CmsError.RequestFailed if the response status is 'fail'
 * @example
 * ```typescript
 * async getBrokerLogList(...): Promise<GetBrokerLogListClientResponse> {
 *   const cmsResponse = await this.client.forwardAuthenticated(...);
 *   checkCmsStatusError(cmsResponse);  // Automatically checks status === 'fail'
 *   // ... rest of processing
 * }
 * ```
 */
export function checkCmsStatusError(response: any, errorMessage?: string): void {
  if (isCmsStatusFailure(response)) {
    // Use custom error message if provided, otherwise use response.note if it's user-friendly
    // response.note from CMS typically contains user-friendly error messages (e.g., "Invalid password")
    const message =
      errorMessage ||
      (response.note ? `CMS request failed: ${response.note}` : 'CMS request failed');
    throw CmsError.RequestFailed({
      message: message,
      response: response,
    });
  }
}

/**
 * A method decorator that automatically checks CMS responses for failure status.
 *
 * CMS returns HTTP 201 but the body's status field may be 'fail'.
 * This decorator checks the method's return value and throws CmsError.RequestFailed if status is 'fail'.
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class LogService {
 *   @HandleCmsStatusErrors()
 *   async getBrokerLogList(...): Promise<GetBrokerLogListClientResponse> {
 *     const response = await this.client.forwardAuthenticated(...);
 *     // Decorator automatically checks status === 'fail'
 *     return { broker: response.broker, logfileinfo: response.logfileinfo };
 *   }
 * }
 * ```
 */
export function HandleCmsStatusErrors() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.then((response) => {
          checkCmsStatusError(response);
          return response;
        });
      }

      checkCmsStatusError(result);

      return result;
    };

    return descriptor;
  };
}
