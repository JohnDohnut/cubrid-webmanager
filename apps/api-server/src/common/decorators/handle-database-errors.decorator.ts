import { AppError, DatabaseError, CmsError, HostError } from '@error/index';
import { ValidationError } from '@error/validation/validation-error';

/**
 * A method decorator that wraps database service methods in a try...catch block.
 *
 * It translates underlying errors into appropriate DatabaseError types.
 *
 * @category Decorators
 * @since 1.0.0
 */
export function HandleDatabaseErrors() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (err) {
        // Handle DatabaseError first - pass through as-is
        if (err instanceof DatabaseError) {
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

        // Handle ValidationError - pass through as-is (client input issues)
        if (err instanceof ValidationError) {
          throw err;
        }

        // If it's already an AppError (other types), convert to DatabaseError.Unknown
        if (err instanceof AppError) {
          throw DatabaseError.Unknown(
            {
              originalCode: err.code,
              originalMessage: err.message,
              ...err.additionalData,
            },
            err
          );
        }

        // For any other unknown errors, wrap them as DatabaseError.Unknown
        console.error(`[HandleDatabaseErrors] Unknown error in ${propertyKey}:`, err);
        throw DatabaseError.Unknown(
          {
            originalMessage: err instanceof Error ? err.message : String(err),
          },
          err instanceof Error ? err : undefined
        );
      }
    };
  };
}
