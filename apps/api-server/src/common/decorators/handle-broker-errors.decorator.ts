import { AppError, BrokerError, CmsError, HostError } from '@error';

/**
 * A method decorator that wraps broker service methods in a try...catch block.
 *
 * It translates underlying errors (like CmsError or HostError) into more specific
 * BrokerError types.
 *
 * 브로커 서비스 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * 하위 에러(CmsError 또는 HostError)를 더 구체적인 BrokerError 타입으로 변환합니다.
 *
 * @category Decorators
 * @since 1.0.0
 */
export function HandleBrokerErrors() {
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

                // Handle CmsError
                if (err instanceof CmsError) {
                    throw BrokerError.GetBrokersFailed({
                        originalCode: err.code,
                        originalMessage: err.message,
                        ...err.additionalData,
                    }, err);
                }

                // Handle HostError (e.g., if findHostInternal fails)
                if (err instanceof HostError) {
                    throw BrokerError.GetBrokersFailed({
                        originalCode: err.code,
                        originalMessage: err.message,
                        ...err.additionalData,
                    }, err);
                }
                
                // For any other unknown errors, wrap them.
                console.error(`[HandleBrokerErrors] Unknown error in ${propertyKey}:`, err);
                throw BrokerError.GetBrokersFailed({
                    originalMessage: err.message,
                }, err);
            }
        };

        return descriptor;
    };
}

