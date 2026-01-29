import { AppError } from '@error/app-error';
import { LockErrorCode } from '@error/lock/lock-error-code';

export { LockErrorCode };

/**
 * Error class for lock-related operations.
 *
 * @category Errors
 * @since 1.0.0
 */
export class LockError extends AppError {
  constructor(
    kind: 'LOCK',
    code: LockErrorCode,
    additionalData?: Record<string, any>,
    originalError?: Error
  ) {
    super(kind, code, additionalData, originalError);
  }

  /**
   * Creates an error indicating that a lock was not found.
   */
  static LockNotFound(additionalData?: Record<string, any>, originalError?: Error) {
    return new LockError('LOCK', LockErrorCode.LOCK_NOT_FOUND, additionalData, originalError);
  }

  /**
   * Creates an error indicating that permission was denied for a lock operation.
   */
  static PermissionDenied(additionalData?: Record<string, any>, originalError?: Error) {
    return new LockError('LOCK', LockErrorCode.PERMISSION_DENIED, additionalData, originalError);
  }

  /**
   * Creates an error indicating that a lock is already held.
   */
  static LockAlreadyHeld(additionalData?: Record<string, any>, originalError?: Error) {
    return new LockError('LOCK', LockErrorCode.LOCK_ALREADY_HELD, additionalData, originalError);
  }

  /**
   * Creates an error indicating that a lock is stale (e.g., expired).
   */
  static StaleLock(additionalData?: Record<string, any>, originalError?: Error) {
    return new LockError('LOCK', LockErrorCode.STALE_LOCK, additionalData, originalError);
  }

  /**
   * Creates an error for an unknown lock-related issue.
   */
  static Unknown(additionalData?: Record<string, any>, originalError?: Error) {
    return new LockError('LOCK', LockErrorCode.UNKNOWN, additionalData, originalError);
  }
}
