import { CmsError } from '@error/cms/cms-error';
import { BaseCmsResponse } from '@type/cms-response/base-cms-response';

/**
 * Invalid token error message from CMS.
 * CMS에서 반환하는 유효하지 않은 토큰 오류 메시지입니다.
 */
const INVALID_TOKEN_MESSAGE =
    'Request is rejected due to invalid token. Please reconnect.';

/**
 * Checks if a CMS response indicates an invalid token error.
 * CMS 응답이 유효하지 않은 토큰 오류를 나타내는지 확인합니다.
 *
 * @param response - The CMS response to check
 * @returns true if the response indicates an invalid token
 */
export function isInvalidTokenError(response: any): boolean {
    if (!response || typeof response !== 'object') {
        return false;
    }

    // BaseCmsResponse를 확장하는 타입인지 확인
    if ('note' in response) {
        return response.note === INVALID_TOKEN_MESSAGE;
    }

    return false;
}

/**
 * Checks a CMS response for invalid token errors and throws CmsError.InvalidToken() if found.
 * This is a helper function that can be used directly in service methods.
 *
 * CMS 응답에서 유효하지 않은 토큰 오류를 확인하고, 발견되면 CmsError.InvalidToken()을 던집니다.
 * 서비스 메서드에서 직접 사용할 수 있는 헬퍼 함수입니다.
 *
 * @param response - The CMS response to check
 * @throws CmsError.InvalidToken if the response indicates an invalid token
 * @example
 * ```typescript
 * async startInfo(...): Promise<StartInfoClientResponse> {
 *   const response = await this.cmsClient.postAuthenticated(...);
 *   checkCmsTokenError(response);  // 자동으로 token 에러 체크
 *   // ... 나머지 처리
 * }
 * ```
 */
export function checkCmsTokenError(response: any): void {
    if (isInvalidTokenError(response)) {
        throw CmsError.InvalidToken();
    }
}

/**
 * A method decorator that automatically checks CMS responses for invalid token errors.
 * CMS 응답에서 유효하지 않은 토큰 오류를 자동으로 확인하는 메서드 데코레이터입니다.
 *
 * This decorator wraps methods that return CMS responses and checks if the response
 * indicates an invalid token. If so, it throws CmsError.InvalidToken().
 *
 * 이 데코레이터는 CMS 응답을 반환하는 메서드를 감싸고, 응답이 유효하지 않은 토큰을
 * 나타내는지 확인합니다. 그렇다면 CmsError.InvalidToken()을 던집니다.
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class DatabaseService {
 *   @HandleCmsTokenErrors()
 *   async startInfo(userId: string, hostUid: string): Promise<StartInfoCmsResponse> {
 *     const response = await this.cmsClient.postAuthenticated(...);
 *     return response;  // 데코레이터가 자동으로 token 에러 체크
 *   }
 * }
 * ```
 */
export function HandleCmsTokenErrors() {
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
                    if (isInvalidTokenError(response)) {
                        throw CmsError.InvalidToken();
                    }
                    return response;
                });
            }

            // 동기 메서드인 경우
            if (isInvalidTokenError(result)) {
                throw CmsError.InvalidToken();
            }

            return result;
        };

        return descriptor;
    };
}

