import { AppError, CmsError, HostError, ConfigError } from '@error';

/**
 * A method decorator that wraps CMS config service methods in a try...catch block.
 *
 * It translates underlying errors (like CmsError, HostError, or ConfigError) into appropriate error types.
 * ConfigError instances are passed through as-is.
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
                // Handle specific error types first (before AppError check)
                // Handle ConfigError - pass through as ConfigError
                if (err instanceof ConfigError) {
                    throw err;
                }

                // Handle HostError (e.g., if findHostInternal fails) - pass through as-is
                if (err instanceof HostError) {
                    throw err;
                }

                // Handle CmsError - pass through as CmsError
                if (err instanceof CmsError) {
                    throw err;
                }

                // If it's already an AppError (other types), convert to ConfigError.Unknown
                if (err instanceof AppError) {
                    throw ConfigError.Unknown({
                        originalCode: err.code,
                        originalMessage: err.message,
                        ...err.additionalData,
                    }, err);
                }
                
                // For any other unknown errors, wrap them as ConfigError.Unknown
                console.error(`[HandleCmsConfigErrors] Unknown error in ${propertyKey}:`, err);
                throw ConfigError.Unknown({
                    originalMessage: err instanceof Error ? err.message : String(err),
                }, err instanceof Error ? err : undefined);
            }
        };

        return descriptor;
    };
}

