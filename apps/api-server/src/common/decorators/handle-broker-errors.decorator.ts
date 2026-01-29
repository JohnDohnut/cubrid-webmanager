import { AppError, BrokerError, CmsError, HostError } from '@error';

/**
 * A method decorator that wraps broker service methods in a try...catch block.
 *
 * It translates underlying errors (like CmsError or HostError) into more specific
 * BrokerError types.
 *
 * @category Decorators
 * @since 1.0.0
 */
export function HandleBrokerErrors() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (err) {
        // Handle BrokerError first - pass through as-is
        if (err instanceof BrokerError) {
          throw err;
        }

        // Handle CmsError - pass through as-is (already appropriate error type)
        if (err instanceof CmsError) {
          throw err;
        }

        // Handle HostError - pass through as-is (already appropriate error type)
        if (err instanceof HostError) {
          throw err;
        }

        // If it's already an AppError (other types), convert to BrokerError.Unknown
        if (err instanceof AppError) {
          throw BrokerError.Unknown(
            {
              originalCode: err.code,
              originalMessage: err.message,
              ...err.additionalData,
            },
            err
          );
        }

        // For any other unknown errors, wrap them as BrokerError.Unknown
        console.error(`[HandleBrokerErrors] Unknown error in ${propertyKey}:`, err);
        throw BrokerError.Unknown(
          {
            originalMessage: err instanceof Error ? err.message : String(err),
          },
          err instanceof Error ? err : undefined
        );
      }
    };

    return descriptor;
  };
}
