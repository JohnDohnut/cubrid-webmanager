import { AppError } from '@error/app-error';
import { DatabaseErrorCode } from './database-error-code';

/**
 * Error class for database-related operations.
 * 
 * @category Errors
 * @since 1.0.0
 */
export class DatabaseError extends AppError {
    constructor(
        kind: 'DATABASE',
        code: DatabaseErrorCode,
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        super(kind, code, additionalData, originalError);
    }

    /**
     * Creates an error indicating that the specified database does not exist.
     */
    static NoSuchDatabase(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new DatabaseError(
            'DATABASE',
            DatabaseErrorCode.NO_SUCH_DATABASE,
            additionalData,
            originalError,
        );
    }
    
    /**
     * Creates an error indicating that getting start info failed.
     */
    static GetStartInfoFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new DatabaseError(
            'DATABASE',
            DatabaseErrorCode.GET_START_INFO_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that starting database failed.
     */
    static StartDatabaseFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new DatabaseError(
            'DATABASE',
            DatabaseErrorCode.START_DATABASE_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that stopping database failed.
     */
    static StopDatabaseFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new DatabaseError(
            'DATABASE',
            DatabaseErrorCode.STOP_DATABASE_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that restarting database failed.
     */
    static RestartDatabaseFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new DatabaseError(
            'DATABASE',
            DatabaseErrorCode.RESTART_DATABASE_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that database login failed.
     */
    static LoginDatabaseFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new DatabaseError(
            'DATABASE',
            DatabaseErrorCode.LOGIN_DATABASE_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating that getting database space info failed.
     */
    static GetDBSpaceInfoFailed(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new DatabaseError(
            'DATABASE',
            DatabaseErrorCode.GET_DB_SPACE_INFO_FAILED,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating an internal database-related server error.
     */
    static InternalError(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new DatabaseError(
            'DATABASE',
            DatabaseErrorCode.INTERNAL_ERROR,
            additionalData,
            originalError,
        );
    }

    /**
     * Creates an error indicating a duplicated database profile.
     */
    static DuplicatedDatabaseProfile(
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        return new DatabaseError(
            'DATABASE',
            DatabaseErrorCode.DUPLICATED_DATABASE_PROFILE,
            additionalData,
            originalError,
        );
    }
}
