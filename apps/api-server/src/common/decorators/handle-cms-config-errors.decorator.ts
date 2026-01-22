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
                // If it's already an AppError (ConfigError, CmsError, HostError, etc.), let it pass through
                if (err instanceof AppError) {
                    throw err;
                }

                // Handle HostError (e.g., if findHostInternal fails)
                if (err instanceof HostError) {
                    throw err;
                }

                // Handle CmsError - pass through as CmsError
                if (err instanceof CmsError) {
                    throw err;
                }

                // Handle ConfigError - pass through as ConfigError
                if (err instanceof ConfigError) {
                    throw err;
                }
                
                // For any other unknown errors, wrap them as ConfigError
                console.error(`[HandleCmsConfigErrors] Unknown error in ${propertyKey}:`, err);
                throw ConfigError.GetAllSysParamFailed('unknown', {
                    message: err instanceof Error ? err.message : String(err),
                    originalError: err instanceof Error ? err : undefined,
                });
            }
        };

        return descriptor;
    };
}

