import { AppError } from '@error/app-error';
import { CmsUserErrorCode } from './cms-user-error-code';

/**
 * Error class for CMS user (DBMT user) operations.
 *
 * @category Errors
 * @since 1.0.0
 */
export class CmsUserError extends AppError {
  constructor(
    kind: 'CMS_USER',
    code: CmsUserErrorCode,
    additionalData?: Record<string, any>,
    originalError?: Error
  ) {
    super(kind, code, additionalData, originalError);
  }

  static GetDbmtUserInfoFailed(
    additionalData?: Record<string, any>,
    originalError?: Error
  ) {
    return new CmsUserError(
      'CMS_USER',
      CmsUserErrorCode.GET_DBMT_USER_INFO_FAILED,
      additionalData,
      originalError
    );
  }

  static UpdateDbmtUserFailed(
    additionalData?: Record<string, any>,
    originalError?: Error
  ) {
    return new CmsUserError(
      'CMS_USER',
      CmsUserErrorCode.UPDATE_DBMT_USER_FAILED,
      additionalData,
      originalError
    );
  }

  static DeleteDbmtUserFailed(
    additionalData?: Record<string, any>,
    originalError?: Error
  ) {
    return new CmsUserError(
      'CMS_USER',
      CmsUserErrorCode.DELETE_DBMT_USER_FAILED,
      additionalData,
      originalError
    );
  }

  static SetDbmtPasswdFailed(
    additionalData?: Record<string, any>,
    originalError?: Error
  ) {
    return new CmsUserError(
      'CMS_USER',
      CmsUserErrorCode.SET_DBMT_PASSWD_FAILED,
      additionalData,
      originalError
    );
  }

  static Unknown(additionalData?: Record<string, any>, originalError?: Error) {
    return new CmsUserError(
      'CMS_USER',
      CmsUserErrorCode.UNKNOWN,
      additionalData,
      originalError
    );
  }
}
