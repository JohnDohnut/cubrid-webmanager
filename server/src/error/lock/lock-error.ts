import { AppError } from '@error/app-error';
import { LockErrorCode } from '@error/lock/lock-error-code';

export { LockErrorCode };

/**
 * Error class for lock-related operations.
 * 잠금 관련 작업을 위한 오류 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export class LockError extends AppError {
    constructor(
        kind: 'LOCK',
        code: LockErrorCode,
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        super(kind, code, additionalData, originalError);
    }
    
    /**
     * Creates an error indicating that a lock was not found.
     *
     * 잠금을 찾을 수 없음을 나타내는 오류를 생성합니다.
     */
    static LockNotFound(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new LockError(
            'LOCK',
            LockErrorCode.LOCK_NOT_FOUND,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that permission was denied for a lock operation.
     *
     * 잠금 작업에 대한 권한이 거부되었음을 나타내는 오류를 생성합니다.
     */
    static PermissionDenied(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new LockError(
            'LOCK',
            LockErrorCode.PERMISSION_DENIED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that a lock is already held.
     *
     * 잠금이 이미 유지되고 있음을 나타내는 오류를 생성합니다.
     */
    static LockAlreadyHeld(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new LockError(
            'LOCK',
            LockErrorCode.LOCK_ALREADY_HELD,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that a lock is stale (e.g., expired).
     *
     * 잠금이 오래되었음(예: 만료됨)을 나타내는 오류를 생성합니다.
     */
    static StaleLock(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new LockError(
            'LOCK',
            LockErrorCode.STALE_LOCK,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error for an unknown lock-related issue.
     *
     * 알 수 없는 잠금 관련 문제를 나타내는 오류를 생성합니다.
     */
    static Unknown(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new LockError(
            'LOCK',
            LockErrorCode.UNKNOWN,
            additionalData,
            originalError,
        );
    }
}
