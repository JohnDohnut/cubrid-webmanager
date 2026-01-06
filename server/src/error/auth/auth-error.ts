import { AppError } from '@error/app-error';
import { AuthErrorCode } from '@error/auth/auth-error-code';

export { AuthErrorCode };

/**
 * Represents an authentication-specific error.
 * Extends AppError and provides static factory methods for common authentication error scenarios.
 *
 * 인증 관련 오류를 나타냅니다.
 * AppError를 확장하며 일반적인 인증 오류 시나리오에 대한 정적 팩토리 메서드를 제공합니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export class AuthError extends AppError {
    constructor(
        kind: 'AUTH' | 'INTERNAL',
        code: AuthErrorCode,
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        super(kind, code, additionalData, originalError);
    }
    
    /**
     * Creates an error indicating invalid authentication credentials.
     *
     * 유효하지 않은 인증 자격 증명을 나타내는 오류를 생성합니다.
     */
    static InvalidCredentials(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new AuthError(
            'AUTH',
            AuthErrorCode.INVALID_CREDENTIALS,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating an internal authentication server error.
     *
     * 내부 인증 서버 오류를 나타내는 오류를 생성합니다.
     */
    static InternalError(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new AuthError(
            'INTERNAL',
            AuthErrorCode.INTERNAL_ERROR,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that the user does not have permission to access a resource.
     *
     * 사용자가 리소스에 접근할 권한이 없음을 나타내는 오류를 생성합니다.
     */
    static PermissionDenied(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new AuthError(
            'AUTH',
            AuthErrorCode.PERMISSION_DENIED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating an invalid or expired authentication token.
     *
     * 유효하지 않거나 만료된 인증 토큰을 나타내는 오류를 생성합니다.
     */
    static InvalidToken(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new AuthError(
            'AUTH',
            AuthErrorCode.INVALID_TOKEN,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error for an unknown authentication issue.
     *
     * 알 수 없는 인증 문제를 나타내는 오류를 생성합니다.
     */
    static Unknown(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new AuthError(
            'AUTH',
            AuthErrorCode.UNKNOWN,
            additionalData,
            originalError,
        );
    }
}
