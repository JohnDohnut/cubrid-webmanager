import { AppError } from '@error/app-error';
import { BrokerErrorCode } from './broker-error-code';

/**
 * Error class for broker-related operations.
 *
 * @category Errors
 * @since 1.0.0
 */
export class BrokerError extends AppError {
  constructor(
    kind: 'BROKER',
    code: BrokerErrorCode,
    additionalData?: Record<string, any>,
    originalError?: Error
  ) {
    super(kind, code, additionalData, originalError);
  }

  /**
   * Creates an error indicating that getting broker information failed.
   */
  static GetBrokersFailed(additionalData?: Record<string, any>, originalError?: Error) {
    return new BrokerError('BROKER', BrokerErrorCode.GET_BROKER_FAILED, additionalData, originalError);
  }

  /**
   * Creates an error indicating that stopping broker failed.
   */
  static BrokerStopFailed(additionalData?: Record<string, any>, originalError?: Error) {
    return new BrokerError(
      'BROKER',
      BrokerErrorCode.BROKER_STOP_FAILED,
      additionalData,
      originalError
    );
  }

  /**
   * Creates an error indicating that starting broker failed.
   */
  static BrokerStartFailed(additionalData?: Record<string, any>, originalError?: Error) {
    return new BrokerError(
      'BROKER',
      BrokerErrorCode.BROKER_START_FAILED,
      additionalData,
      originalError
    );
  }

  /**
   * Creates an error for an unknown broker-related issue.
   */
  static Unknown(additionalData?: Record<string, any>, originalError?: Error) {
    return new BrokerError('BROKER', BrokerErrorCode.UNKNOWN, additionalData, originalError);
  }

  /**
   * Creates an error indicating an internal broker-related server error.
   */
  static InternalError(additionalData?: Record<string, any>, originalError?: Error) {
    return new BrokerError('BROKER', BrokerErrorCode.INTERNAL_ERROR, additionalData, originalError);
  }
}
