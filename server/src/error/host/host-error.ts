import { AppError } from '@error/app-error';
import { HostErrorCode } from '@error/host/host-error-code';

export { HostErrorCode };

/**
 * Error class for host-related operations.
 * 호스트 관련 작업을 위한 오류 클래스입니다.
 *
 * @category Errors
 * @since 1.0.0
 */
export class HostError extends AppError {
    constructor(
        kind: 'RESOURCE',
        code: HostErrorCode,
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        super(kind, code, additionalData, originalError);
    }
    
    /**
     * Creates an error indicating that the maximum number of hosts has been exceeded.
     *
     * 최대 호스트 수를 초과했음을 나타내는 오류를 생성합니다.
     */
    static ExceedMaxHosts(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new HostError(
            'RESOURCE',
            HostErrorCode.EXCEED_MAX_HOSTS,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating an invalid format for host information.
     *
     * 호스트 정보의 형식이 유효하지 않음을 나타내는 오류를 생성합니다.
     */
    static InvalidFormat(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new HostError(
            'RESOURCE',
            HostErrorCode.INVALID_FORMAT,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating a duplicate host entry.
     *
     * 중복된 호스트 항목을 나타내는 오류를 생성합니다.
     */
    static DuplicatedHost(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new HostError(
            'RESOURCE',
            HostErrorCode.DUPLICATED_HOST,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that no such host was found.
     *
     * 해당 호스트를 찾을 수 없음을 나타내는 오류를 생성합니다.
     */
    static NoSuchHost(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new HostError(
            'RESOURCE',
            HostErrorCode.NO_SUCH_HOST,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating an internal host-related server error.
     *
     * 내부 호스트 관련 서버 오류를 나타내는 오류를 생성합니다.
     */
    static InternalError(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new HostError(
            'RESOURCE',
            HostErrorCode.INTERNAL_ERROR,
            additionalData,
            originalError,
        );
    }
}
