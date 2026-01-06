import { CmsError } from '@error/cms/cms-error';
import { BaseCmsResponse } from '@type/cms-response/base-cms-response';

/**
 * Checks if a CMS response indicates a failure (status === 'fail').
 * CMS 응답이 실패를 나타내는지 확인합니다 (status === 'fail').
 *
 * @param response - The CMS response to check
 * @returns true if the response indicates a failure
 */
export function isCmsStatusFailure(response: any): boolean {
    if (!response || typeof response !== 'object') {
        return false;
    }

    // BaseCmsResponse를 확장하는 타입인지 확인
    if ('status' in response) {
        return response.status === 'fail';
    }

    return false;
}

/**
 * Checks a CMS response for failure status and throws CmsError.RequestFailed if found.
 * This is a helper function that can be used directly in service methods.
 *
 * CMS 응답의 status 필드를 확인하고, 'fail'이면 CmsError.RequestFailed를 던집니다.
 * 서비스 메서드에서 직접 사용할 수 있는 헬퍼 함수입니다.
 *
 * @param response - The CMS response to check
 * @param errorMessage - Optional custom error message
 * @throws CmsError.RequestFailed if the response status is 'fail'
 * @example
 * ```typescript
 * async getBrokerLogList(...): Promise<GetBrokerLogListClientResponse> {
 *   const cmsResponse = await this.client.forwardAuthenticated(...);
 *   checkCmsStatusError(cmsResponse);  // 자동으로 status === 'fail' 체크
 *   // ... 나머지 처리
 * }
 * ```
 */
export function checkCmsStatusError(response: any, errorMessage?: string): void {
    if (isCmsStatusFailure(response)) {
        throw CmsError.RequestFailed({
            message: errorMessage || `CMS request failed: ${response.note || 'Unknown error'}`,
            response: response,
        });
    }
}

/**
 * A method decorator that automatically checks CMS responses for failure status.
 * CMS 응답의 status 필드가 'fail'인 경우 자동으로 에러를 던지는 메서드 데코레이터입니다.
 *
 * CMS는 HTTP 201로 응답하지만 body의 status 필드가 'fail'일 수 있습니다.
 * 이 decorator는 메서드의 반환값을 체크하여 status가 'fail'이면 CmsError.RequestFailed를 던집니다.
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
 *     // decorator가 자동으로 status === 'fail' 체크
 *     return { broker: response.broker, logfileinfo: response.logfileinfo };
 *   }
 * }
 * ```
 */
export function HandleCmsStatusErrors() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const result = await originalMethod.apply(this, args);

            // Promise인 경우 (비동기 메서드)
            if (result instanceof Promise) {
                return result.then((response) => {
                    checkCmsStatusError(response);
                    return response;
                });
            }

            // 동기 메서드인 경우
            checkCmsStatusError(result);

            return result;
        };

        return descriptor;
    };
}

