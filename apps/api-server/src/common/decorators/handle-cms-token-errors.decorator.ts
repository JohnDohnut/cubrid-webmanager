import { CmsError } from '@error/cms/cms-error';
import { BaseCmsResponse } from '@type/cms-response/base-cms-response';

/**
 * Invalid token error message from CMS.
 */
const INVALID_TOKEN_MESSAGE =
    'Request is rejected due to invalid token. Please reconnect.';

/**
 * Checks if a CMS response indicates an invalid token error.
 *
 * @param response - The CMS response to check
 * @returns true if the response indicates an invalid token
 */
export function isInvalidTokenError(response: any): boolean {
    if (!response || typeof response !== 'object') {
        return false;
    }

    if ('note' in response) {
        return response.note === INVALID_TOKEN_MESSAGE;
    }

    return false;
}

/**
 * Checks a CMS response for invalid token errors and throws CmsError.InvalidToken() if found.
 * This is a helper function that can be used directly in service methods.
 *
 * @param response - The CMS response to check
 * @throws CmsError.InvalidToken if the response indicates an invalid token
 * @example
 * ```typescript
 * async startInfo(...): Promise<StartInfoClientResponse> {
 *   const response = await this.cmsClient.postAuthenticated(...);
 *   checkCmsTokenError(response);  // Automatically checks for token errors
 *   // ... rest of processing
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
 *
 * This decorator wraps methods that return CMS responses and checks if the response
 * indicates an invalid token. If so, it throws CmsError.InvalidToken().
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class DatabaseService {
 *   @HandleCmsTokenErrors()
 *   async startInfo(userId: string, hostUid: string): Promise<StartInfoCmsResponse> {
 *     const response = await this.cmsClient.postAuthenticated(...);
 *     return response;  // Decorator automatically checks for token errors
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

            if (result instanceof Promise) {
                return result.then((response) => {
                    if (isInvalidTokenError(response)) {
                        throw CmsError.InvalidToken();
                    }
                    return response;
                });
            }

            if (isInvalidTokenError(result)) {
                throw CmsError.InvalidToken();
            }

            return result;
        };

        return descriptor;
    };
}

