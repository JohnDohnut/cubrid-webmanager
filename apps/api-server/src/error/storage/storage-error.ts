import { AppError } from '@error/app-error';
import { StorageErrorCode } from '@error/storage/storage-error-code';

export { StorageErrorCode };

/**
 * Error class for storage-related operations.
 * 저장소 관련 작업을 위한 오류 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export class StorageError extends AppError {
    constructor(
        kind: 'STORAGE',
        code: StorageErrorCode,
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        super(kind, code, additionalData, originalError);
    }
    
    /**
     * Creates an error indicating that a file was not found.
     *
     * 파일을 찾을 수 없음을 나타내는 오류를 생성합니다.
     */
    static NoSuchFile(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new StorageError(
            'STORAGE',
            StorageErrorCode.NO_SUCH_FILE,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that a file was not found.
     * @deprecated Use NoSuchFile instead
     *
     * 파일을 찾을 수 없음을 나타내는 오류를 생성합니다.
     * @deprecated NoSuchFile을 사용하세요
     */
    static NotFound(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new StorageError(
            'STORAGE',
            StorageErrorCode.FILE_NOT_FOUND,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that permission was denied for a file operation.
     *
     * 파일 작업에 대한 권한이 거부되었음을 나타내는 오류를 생성합니다.
     */
    static PermissionDenied(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new StorageError(
            'STORAGE',
            StorageErrorCode.PERMISSION_DENIED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that a file already exists.
     *
     * 파일이 이미 존재함을 나타내는 오류를 생성합니다.
     */
    static AlreadyExists(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new StorageError(
            'STORAGE',
            StorageErrorCode.FILE_ALREADY_EXISTS,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error for an unknown storage-related issue.
     *
     * 알 수 없는 저장소 관련 문제를 나타내는 오류를 생성합니다.
     */
    static Unknown(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new StorageError(
            'STORAGE',
            StorageErrorCode.UNKNOWN,
            additionalData,
            originalError,
        );
    }
}
