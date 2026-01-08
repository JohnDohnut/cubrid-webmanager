import { AppError } from '@error/app-error';
import { UserErrorCode } from '@error/user/user-error-code';

export { UserErrorCode };

/**
 * Error class for user-related operations.
 * 사용자 관련 작업을 위한 오류 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export class UserError extends AppError {
    constructor(
        kind: 'USER',
        code: UserErrorCode,
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        super(kind, code, additionalData, originalError);
    }
    
    /**
     * Creates an error indicating that a user was not found.
     *
     * 사용자를 찾을 수 없음을 나타내는 오류를 생성합니다.
     */
    static UserNotFound(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.USER_NOT_FOUND,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that a user with the given ID already exists.
     *
     * 주어진 ID를 가진 사용자가 이미 존재함을 나타내는 오류를 생성합니다.
     */
    static UserAlreadyExists(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.USER_ALREADY_EXISTS,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that user data failed to save.
     *
     * 사용자 데이터 저장에 실패했음을 나타내는 오류를 생성합니다.
     */
    static DataSaveFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.DATA_SAVE_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that user data failed to load.
     *
     * 사용자 데이터 로드에 실패했음을 나타내는 오류를 생성합니다.
     */
    static DataLoadFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.DATA_LOAD_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that user data failed to delete.
     *
     * 사용자 데이터 삭제에 실패했음을 나타내는 오류를 생성합니다.
     */
    static DataDeleteFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.DATA_DELETE_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that user data failed to update.
     *
     * 사용자 데이터 업데이트에 실패했음을 나타내는 오류를 생성합니다.
     */
    static DataUpdateFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.DATA_UPDATE_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that a user resource is locked.
     *
     * 사용자 리소스가 잠겨 있음을 나타내는 오류를 생성합니다.
     */
    static ResourceLocked(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.RESOURCE_LOCKED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that a lock operation on a user resource failed.
     *
     * 사용자 리소스에 대한 잠금 작업이 실패했음을 나타내는 오류를 생성합니다.
     */
    static LockOperationFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.LOCK_OPERATION_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that the old password provided does not match.
     *
     * 제공된 이전 비밀번호가 일치하지 않음을 나타내는 오류를 생성합니다.
     */
    static OldPasswordMismatch(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.OLD_PASSWORD_MISMATCH,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that the new password provided is invalid.
     *
     * 제공된 새 비밀번호가 유효하지 않음을 나타내는 오류를 생성합니다.
     */
    static BadNewPassword(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.BAD_NEW_PASSWORD,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error for an unknown user-related issue.
     *
     * 알 수 없는 사용자 관련 문제를 나타내는 오류를 생성합니다.
     */
    static Unknown(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new UserError(
            'USER',
            UserErrorCode.UNKNOWN,
            additionalData,
            originalError,
        );
    }
}
