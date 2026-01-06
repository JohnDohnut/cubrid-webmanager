import { AppError } from '@error/app-error';
import { DatabaseErrorCode } from './database-error-code';

/**
 * Error class for database-related operations.
 * 
 * 데이터베이스 관련 작업을 위한 에러 클래스입니다.
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
     * 
     * 지정한 데이터베이스가 존재하지 않음을 나타내는 오류를 생성합니다.
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
     * 
     * 시작 정보 조회 실패를 나타내는 오류를 생성합니다.
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
     * 
     * 데이터베이스 시작 실패를 나타내는 오류를 생성합니다.
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
     * 
     * 데이터베이스 중지 실패를 나타내는 오류를 생성합니다.
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
     * 
     * 데이터베이스 재시작 실패를 나타내는 오류를 생성합니다.
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
     * 
     * 데이터베이스 로그인 실패를 나타내는 오류를 생성합니다.
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
     * 
     * 데이터베이스 공간 정보 조회 실패를 나타내는 오류를 생성합니다.
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
     * 
     * 내부 데이터베이스 관련 서버 오류를 나타내는 오류를 생성합니다.
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
     * 
     * 중복된 데이터베이스 프로파일을 나타내는 오류를 생성합니다.
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
