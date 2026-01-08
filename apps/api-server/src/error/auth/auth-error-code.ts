/**
 * Enumeration of authentication error codes.
 *
 * 인증 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export enum AuthErrorCode {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    INVALID_TOKEN = 'INVALID_TOKEN',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    UNKNOWN = 'UNKNOWN',
}
