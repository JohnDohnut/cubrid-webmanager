import { AppError } from '@error/app-error';

/**
 * Enumeration of repository-related error codes.
 *
 * @category Errors
 * @since 1.0.0
 */
export enum RepositoryErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
}

/**
 * Error class for repository-related operations.
 *
 * @category Errors
 * @since 1.0.0
 */
export class RepositoryError extends AppError {
  constructor(
    kind: 'RESOURCE',
    code: RepositoryErrorCode,
    additionalData?: Record<string, any>,
    originalError?: Error
  ) {
    super(kind, code, additionalData, originalError);
  }

  /**
   * Creates an error indicating that a user was not found in the repository.
   */
  static UserNotFound(additionalData?: Record<string, any>, originalError?: Error) {
    return new RepositoryError(
      'RESOURCE',
      RepositoryErrorCode.USER_NOT_FOUND,
      additionalData,
      originalError
    );
  }

  /**
   * Creates an error indicating that a user with the given ID already exists in the repository.
   */
  static UserAlreadyExists(additionalData?: Record<string, any>, originalError?: Error) {
    return new RepositoryError(
      'RESOURCE',
      RepositoryErrorCode.USER_ALREADY_EXISTS,
      additionalData,
      originalError
    );
  }
}
