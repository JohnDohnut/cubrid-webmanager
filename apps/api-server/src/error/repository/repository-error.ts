import { AppError } from '@error/app-error';

/**
 * Enumeration of repository-related error codes.
 *
 * 리포지토리 관련 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export enum RepositoryErrorCode {
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
}

/**
 * Error class for repository-related operations.
 * 리포지토리 관련 작업을 위한 오류 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export class RepositoryError extends AppError {
    constructor(
        kind: 'RESOURCE',
        code: RepositoryErrorCode,
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        super(kind, code, additionalData, originalError);
    }
    
    /**
     * Creates an error indicating that a user was not found in the repository.
     *
     * 리포지토리에서 사용자를 찾을 수 없음을 나타내는 오류를 생성합니다.
     */
    static UserNotFound(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new RepositoryError(
            'RESOURCE',
            RepositoryErrorCode.USER_NOT_FOUND,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that a user with the given ID already exists in the repository.
     *
     * 주어진 ID를 가진 사용자가 리포지토리에 이미 존재함을 나타내는 오류를 생성합니다.
     */
    static UserAlreadyExists(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new RepositoryError(
            'RESOURCE',
            RepositoryErrorCode.USER_ALREADY_EXISTS,
            additionalData,
            originalError,
        );
    }
}
