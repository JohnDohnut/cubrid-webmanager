import { AppError, CmsError, HostError } from '@error';

/**
 * A method decorator that wraps CMS config service methods in a try...catch block.
 *
 * It translates underlying errors (like CmsError or HostError) into appropriate error types.
 * Since CmsConfigService currently throws generic Error, we pass through CmsError
 * and convert HostError to a more descriptive error.
 *
 * CMS 설정 서비스 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * 하위 에러(CmsError 또는 HostError)를 적절한 에러 타입으로 변환합니다.
 * CmsConfigService가 현재 일반 Error를 던지므로, CmsError는 그대로 전달하고
 * HostError는 더 설명적인 에러로 변환합니다.
 *
 * @category Decorators
 * @since 1.0.0
 */
export function HandleCmsConfigErrors() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (err) {
                // If it's already an AppError, let it pass through, unless it's a CmsError or HostError.
                if (err instanceof AppError && !(err instanceof CmsError) && !(err instanceof HostError)) {
                    throw err;
                }

                // Handle CmsError - pass through as CmsError since CmsConfigService may handle it
                if (err instanceof CmsError) {
                    throw err;
                }

                // Handle HostError (e.g., if findHostInternal fails)
                if (err instanceof HostError) {
                    throw new Error(
                        `Failed to access CMS config: ${err.message || 'Host not found or inaccessible'}`,
                    );
                }
                
                // For any other unknown errors, wrap them.
                console.error(`[HandleCmsConfigErrors] Unknown error in ${propertyKey}:`, err);
                throw new Error(
                    `CMS config operation failed: ${err.message || 'Unknown error'}`,
                );
            }
        };

        return descriptor;
    };
}

