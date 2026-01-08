/**
 * Enumeration of host-related error codes.
 *
 * 호스트 관련 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export enum HostErrorCode {
    EXCEED_MAX_HOSTS = 'EXCEED_MAX_HOSTS',
    INVALID_FORMAT = 'INVALID_FORMAT',
    DUPLICATED_HOST = 'DUPLICATED_HOST',
    NO_SUCH_HOST = 'NO_SUCH_HOST',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}
