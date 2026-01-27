import { AppError } from '@error/app-error';
import { BrokerErrorCode } from './broker-error-code';

export class BrokerError extends AppError {
    constructor(
        kind: 'CMS',
        code: BrokerErrorCode,
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        super(kind, code, additionalData, originalError);
    }
    
    static GetBrokersFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new BrokerError(
            'CMS',
            BrokerErrorCode.GET_BROKER_FAILED,
            additionalData,
            originalError,
        );
    }

    static BrokerStopFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new BrokerError(
            'CMS',
            BrokerErrorCode.BROKER_STOP_FAILED,
            additionalData,
            originalError,
        );
    }

    static BrokerStartFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new BrokerError(
            'CMS',
            BrokerErrorCode.BROKER_START_FAILED,
            additionalData,
            originalError,
        );
    }

    static Unknown(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new BrokerError(
            'CMS',
            BrokerErrorCode.UNKNOWN,
            additionalData,
            originalError,
        );
    }
}
