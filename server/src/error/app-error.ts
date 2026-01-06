import { AuthErrorCode } from '@error/auth/auth-error-code';
import { StorageErrorCode } from '@error/storage/storage-error-code';
import { LockErrorCode } from '@error/lock/lock-error-code';
import { HostErrorCode } from '@error/host/host-error-code';
import { UserErrorCode } from '@error/user/user-error-code';
import { DatabaseErrorCode } from '@error/database/database-error-code';

export type ErrorKind =
    | 'AUTH'
    | 'STORAGE'
    | 'LOCK'
    | 'RESOURCE'
    | 'USER'
    | 'INTERNAL'
    | 'CMS'
    | 'DATABASE'
    | 'VALIDATION';

/**
 * Base error class for all application errors.
 *
 * @category Errors
 * @since 1.0.0
 */
export class AppError extends Error {
    constructor(
        public readonly kind: ErrorKind,
        public readonly code: string,
        public readonly additionalData?: Record<string, any>,
        public readonly originalError?: Error,
    ) {
        super(code);
        this.name = new.target.name;
    }

    // RFC 7807 Problem Details generation (for client response - excluding internal information)
    toProblemDetails(requestUrl?: string) {
        // 클라이언트로 보내는 최소한의 정보만 포함
        const baseResponse = {
            type: `/errors/${this.kind.toLowerCase()}/${this.code.toLowerCase()}`,
            title: this.code
                .split('_')
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase(),
                )
                .join(' '),
            status: this.getHttpStatus(),
            detail: this.message,
            code: this.code,
        };

        // additionalData에서 안전한 필드만 필터링하여 포함
        // 보안상 민감한 정보는 제외 (response, stack, originalError, hostUid 등)
        if (this.additionalData) {
            const safeFields = this.getSafeFieldsForClient(this.additionalData);
            if (Object.keys(safeFields).length > 0) {
                return { ...baseResponse, ...safeFields };
            }
        }

        return baseResponse;
    }

    /**
     * 클라이언트에 안전하게 노출할 수 있는 필드만 필터링합니다.
     * 보안상 민감한 정보는 제외합니다.
     * 
     * @private
     */
    private getSafeFieldsForClient(additionalData: Record<string, any>): Record<string, any> {
        const safeFields: Record<string, any> = {};
        
        // 허용된 안전한 필드 목록 (화이트리스트 방식)
        const allowedFields = [
            'missingFields',      // 유효성 검사에 필요
            'dbname',             // DB 이름 (공개 정보)
            'bname',              // 브로커 이름 (공개 정보)
            'message',            // 사용자 친화적 메시지
        ];

        // 민감한 정보 필드 (제외)
        const sensitiveFields = [
            'response',           // CMS 응답 전체 (내부 정보 포함)
            'stack',              // 스택 트레이스
            'originalError',      // 원본 에러
            'hostUid',            // 호스트 UID (보안)
            'userId',             // 사용자 ID (보안)
            'password',           // 비밀번호
            'token',              // 토큰
            'address',            // 호스트 주소 (보안)
            'port',               // 포트 (보안)
        ];

        for (const [key, value] of Object.entries(additionalData)) {
            // 허용된 필드이고 민감한 필드가 아닌 경우만 포함
            if (allowedFields.includes(key) && !sensitiveFields.includes(key)) {
                // 값이 객체인 경우 재귀적으로 필터링하지 않고 원본 유지
                // (missingFields는 배열이므로 안전)
                safeFields[key] = value;
            }
        }

        return safeFields;
    }

    // Detailed information for logging (including internal system information)
    toLogDetails(requestUrl?: string) {
        return {
            type: `/errors/${this.kind.toLowerCase()}/${this.code.toLowerCase()}`,
            title: this.code
                .split('_')
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase(),
                )
                .join(' '),
            status: this.getHttpStatus(),
            detail: this.message,
            instance: requestUrl || '',
            kind: this.kind,
            code: this.code,
            timestamp: new Date().toISOString(),
            // Include all additional data
            ...(this.additionalData || {}),
            // Original error information (for debugging)
            ...(this.originalError
                ? {
                      originalError: {
                          name: this.originalError.name,
                          message: this.originalError.message,
                          stack: this.originalError.stack,
                      },
                  }
                : {}),
        };
    }

    private getHttpStatus(): number {
        switch (this.kind) {
            case 'AUTH':
                switch (this.code) {
                    case AuthErrorCode.INVALID_CREDENTIALS:
                    case AuthErrorCode.INVALID_TOKEN:
                        return 401;
                    case AuthErrorCode.PERMISSION_DENIED:
                        return 403;
                    case AuthErrorCode.INTERNAL_ERROR:
                        return 500;
                    case AuthErrorCode.UNKNOWN:
                        return 500;
                    default:
                        return 401;
                }
            case 'RESOURCE':
                // Subdivide RESOURCE errors
                switch (this.code) {
                    case HostErrorCode.NO_SUCH_HOST:
                        return 404; // Not Found
                    case HostErrorCode.EXCEED_MAX_HOSTS:
                    case HostErrorCode.INVALID_FORMAT:
                        return 400;
                    case HostErrorCode.DUPLICATED_HOST:
                        return 409; // Conflict - resource collision
                    case HostErrorCode.INTERNAL_ERROR:
                        return 500; // Internal Server Error
                    default:
                        return 400;
                }
            case 'USER':
                switch (this.code) {
                    case UserErrorCode.USER_NOT_FOUND:
                        return 404; // Not Found
                    case UserErrorCode.USER_ALREADY_EXISTS:
                        return 409; // Conflict - resource already exists
                    case UserErrorCode.DATA_SAVE_FAILED:
                    case UserErrorCode.DATA_LOAD_FAILED:
                    case UserErrorCode.DATA_DELETE_FAILED:
                    case UserErrorCode.DATA_UPDATE_FAILED:
                        return 500; // Internal server error
                    case UserErrorCode.RESOURCE_LOCKED:
                        return 423; // Locked - resource is locked
                    case UserErrorCode.LOCK_OPERATION_FAILED:
                        return 500; // Internal server error
                    case UserErrorCode.OLD_PASSWORD_MISMATCH:
                    case UserErrorCode.BAD_NEW_PASSWORD:
                        return 400; // Bad request
                    case UserErrorCode.UNKNOWN:
                        return 500; // Internal server error

                    default:
                        return 500;
                }
            case 'STORAGE':
                switch (this.code) {
                    case StorageErrorCode.NO_SUCH_FILE:
                    case StorageErrorCode.FILE_NOT_FOUND: // Deprecated
                    case StorageErrorCode.FILE_ALREADY_EXISTS:
                        return 400;
                    case StorageErrorCode.PERMISSION_DENIED:
                        return 403;
                    case StorageErrorCode.UNKNOWN:
                        return 500;
                    default:
                        return 500;
                }
            case 'LOCK':
                switch (this.code) {
                    case LockErrorCode.LOCK_NOT_FOUND:
                        return 404; // Not Found
                    case LockErrorCode.PERMISSION_DENIED:
                        return 403;
                    case LockErrorCode.LOCK_ALREADY_HELD:
                        return 409;
                    case LockErrorCode.STALE_LOCK:
                        return 410; // Gone - expired lock
                    case LockErrorCode.UNKNOWN:
                        return 500;
                    default:
                        return 500;
                }
            case 'INTERNAL':
                return 500;
            case 'DATABASE':
                // DatabaseError의 경우 에러 코드에 따라 구체적인 HTTP 상태 반환
                switch (this.code) {
                    case DatabaseErrorCode.NO_SUCH_DATABASE:
                        return 404; // Not Found
                    case DatabaseErrorCode.DUPLICATED_DATABASE_PROFILE:
                        return 409; // Conflict - resource already exists
                    case DatabaseErrorCode.INTERNAL_ERROR:
                    case DatabaseErrorCode.GET_START_INFO_FAILED:
                    case DatabaseErrorCode.START_DATABASE_FAILED:
                    case DatabaseErrorCode.STOP_DATABASE_FAILED:
                    case DatabaseErrorCode.RESTART_DATABASE_FAILED:
                    case DatabaseErrorCode.LOGIN_DATABASE_FAILED:
                    case DatabaseErrorCode.GET_DB_SPACE_INFO_FAILED:
                        return 500; // Internal Server Error
                    default:
                        return 500; // Internal Server Error
                }
            case 'CMS':
                // CMS 관련 에러 (DatabaseError가 아닌 순수 CMS 에러)
                return 500;
            case 'VALIDATION':
                return 400; // Bad Request
            default:
                return 500;
        }
    }
}
