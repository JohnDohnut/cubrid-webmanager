/**
 * Enumeration of lock-related error codes.
 *
 * @category Errors
 * @since 1.0.0
 */
export enum LockErrorCode {
  LOCK_NOT_FOUND = 'LOCK_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  LOCK_ALREADY_HELD = 'LOCK_ALREADY_HELD',
  STALE_LOCK = 'STALE_LOCK',
  UNKNOWN = 'UNKNOWN',
}
