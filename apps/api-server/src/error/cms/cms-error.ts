import { AppError } from '@error/app-error';

/**
 * Enumeration of CMS error codes.
 *
 * CMS 오류 코드 열거형입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export enum CmsErrorCode {
    REQUEST_FAILED = 'REQUEST_FAILED',
    NO_RESPONSE = 'NO_RESPONSE',
    INVALID_TOKEN = 'INVALID_TOKEN',
    UNKNOWN = 'UNKNOWN',
}

/**
 * Represents a CMS-specific error.
 * Extends AppError and provides static factory methods for common CMS error scenarios.
 *
 * CMS 관련 오류를 나타냅니다.
 * AppError를 확장하며 일반적인 CMS 오류 시나리오에 대한 정적 팩토리 메서드를 제공합니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export class CmsError extends AppError {
    constructor(
        kind: 'CMS',
        code: CmsErrorCode,
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        super(kind, code, additionalData, originalError);
    }
    
    /**
     * Creates an error indicating that the request to the CMS API failed.
     *
     * CMS API로의 요청이 실패했음을 나타내는 오류를 생성합니다.
     */
    static RequestFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new CmsError(
            'CMS',
            CmsErrorCode.REQUEST_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that no response was received from the CMS API.
     *
     * CMS API로부터 응답을 받지 못했음을 나타내는 오류를 생성합니다.
     */
    static NoResponse(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new CmsError(
            'CMS',
            CmsErrorCode.NO_RESPONSE,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error for an unknown CMS issue.
     *
     * 알 수 없는 CMS 문제를 나타내는 오류를 생성합니다.
     */
    static Unknown(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new CmsError(
            'CMS',
            CmsErrorCode.UNKNOWN,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating an invalid authentication token for CMS.
     *
     * CMS에 대한 유효하지 않은 인증 토큰을 나타내는 오류를 생성합니다.
     */
    static InvalidToken(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new CmsError(
            'CMS',
            CmsErrorCode.INVALID_TOKEN,
            additionalData,
            originalError,
        );
    }
}
