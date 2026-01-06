/**
 * Enumeration of storage-related error codes.
 *
 * 저장소 관련 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export enum StorageErrorCode {
    NO_SUCH_FILE = 'NO_SUCH_FILE',
    FILE_NOT_FOUND = 'FILE_NOT_FOUND', // Deprecated: Use NO_SUCH_FILE instead
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    FILE_ALREADY_EXISTS = 'FILE_ALREADY_EXISTS',
    UNKNOWN = 'UNKNOWN',
}
