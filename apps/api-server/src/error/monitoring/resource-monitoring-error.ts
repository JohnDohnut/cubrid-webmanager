import { AppError } from '@error/app-error';
import { ResourceMonitoringErrorCode } from './resource-monitoring-error-code';

/**
 * Custom error class for resource monitoring operations.
 *
 * @category Error
 * @since 1.0.0
 */
export class ResourceMonitoringError extends AppError {
  constructor(
    code: ResourceMonitoringErrorCode,
    additionalData?: Record<string, any>,
    originalError?: Error
  ) {
    super('RESOURCE', code, additionalData, originalError);
  }

  /**
   * Creates an error for an unknown or unexpected issue.
   */
  static Unknown(additionalData?: Record<string, any>, originalError?: Error) {
    return new ResourceMonitoringError(
      ResourceMonitoringErrorCode.UNKNOWN,
      additionalData,
      originalError
    );
  }

  /**
   * Creates an error for when the CMS API call fails.
   */
  static CmsApiFailure(additionalData?: Record<string, any>, originalError?: Error) {
    return new ResourceMonitoringError(
      ResourceMonitoringErrorCode.CMS_API_FAILURE,
      additionalData,
      originalError
    );
  }

  /**
   * Creates an error for when the target host is not found.
   */
  static HostNotFound(additionalData?: Record<string, any>, originalError?: Error) {
    return new ResourceMonitoringError(
      ResourceMonitoringErrorCode.HOST_NOT_FOUND,
      additionalData,
      originalError
    );
  }
}
