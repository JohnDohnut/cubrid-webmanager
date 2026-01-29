import { UserError, LockError, StorageError, StorageErrorCode, AppError } from '@error';

/**
 * A method decorator that wraps user service methods in a try...catch block.
 *
 * Only converts system/library level errors (StorageError, LockError) to UserError.
 * Already converted AppError instances are passed through as-is.
 *
 * @category Decorators
 * @since 1.0.0
 */
export function HandleUserErrors() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (err) {
        if (err instanceof UserError) {
          throw err;
        }

        if (err instanceof AppError) {
          throw err;
        }

        if (err instanceof LockError) {
          throw UserError.LockOperationFailed({}, err);
        } else if (err instanceof StorageError) {
          switch (err.code) {
            case StorageErrorCode.NO_SUCH_FILE:
            case StorageErrorCode.FILE_NOT_FOUND: // Deprecated
              throw UserError.UserNotFound(err.additionalData || {}, err);
            case StorageErrorCode.FILE_ALREADY_EXISTS:
            case StorageErrorCode.PERMISSION_DENIED:
            case StorageErrorCode.UNKNOWN:
              throw UserError.Unknown({}, err);
            default:
              throw UserError.Unknown({}, err);
          }
        } else {
          throw UserError.Unknown({}, err);
        }
      }
    };
  };
}
