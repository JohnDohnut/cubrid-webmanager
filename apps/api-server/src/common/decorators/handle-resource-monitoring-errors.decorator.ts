import { AppError, ResourceMonitoringError, CmsError, HostError } from '@error';

/**
 * A method decorator that wraps resource monitoring service methods in a try...catch block.
 *
 * It translates underlying errors (like CmsError or HostError) into more specific
 * ResourceMonitoringError types.
 *
 * @category Decorators
 * @since 1.0.0
 */
export function HandleResourceMonitoringErrors() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (err) {
        // If it's already an AppError, let it pass through, unless it's a CmsError or HostError.
        if (err instanceof AppError && !(err instanceof CmsError) && !(err instanceof HostError)) {
          throw err;
        }

        // CMS errors: pass through (client uses CMS response note)
        if (err instanceof CmsError) {
          throw err;
        }

        // Handle HostError (e.g., if findHostInternal fails)
        if (err instanceof HostError) {
          throw ResourceMonitoringError.HostNotFound(
            {
              originalCode: err.code,
              originalMessage: err.message,
              ...err.additionalData,
            },
            err
          );
        }

        // For any other unknown errors, wrap them.
        console.error(`[HandleResourceMonitoringErrors] Unknown error in ${propertyKey}:`, err);
        throw ResourceMonitoringError.Unknown(
          {
            originalMessage: err.message,
          },
          err
        );
      }
    };

    return descriptor;
  };
}
