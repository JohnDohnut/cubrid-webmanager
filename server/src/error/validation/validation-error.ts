import { AppError } from '@error/app-error';
import { ValidationErrorCode } from './validation-error-code';

/**
 * Error class for validation-related operations.
 * Used for request body validation, form validation, etc.
 * 
 * 유효성 검사 관련 작업을 위한 에러 클래스입니다.
 * 요청 본문 검증, 폼 검증 등에 사용됩니다.
 */
export class ValidationError extends AppError {
    constructor(
        kind: 'VALIDATION',
        code: ValidationErrorCode,
        additionalData?: Record<string, any>,
        originalError?: Error,
    ) {
        super(kind, code, additionalData, originalError);
    }
    
    /**
     * Creates a validation error for invalid request body.
     * 
     * @param missingFields - Array of missing required field names
     * @param additionalData - Additional error context
     * @returns ValidationError instance
     */
    static InvalidRequestBody(
        missingFields?: string[],
        additionalData?: Record<string, any>,
    ) {
        return new ValidationError(
            'VALIDATION',
            ValidationErrorCode.INVALID_REQUEST_BODY,
            {
                missingFields,
                ...additionalData,
            },
        );
    }

    /**
     * Creates a validation error for missing required field(s).
     * 
     * @param fieldNames - Array of missing field names
     * @param additionalData - Additional error context
     * @returns ValidationError instance
     */
    static MissingRequiredField(
        fieldNames: string | string[],
        additionalData?: Record<string, any>,
    ) {
        const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
        return new ValidationError(
            'VALIDATION',
            ValidationErrorCode.MISSING_REQUIRED_FIELD,
            {
                missingFields: fields,
                ...additionalData,
            },
        );
    }

    /**
     * Creates a validation error for missing database credentials.
     * Used when database profile doesn't exist and client must provide credentials.
     * 
     * 데이터베이스 자격 증명 누락을 나타내는 유효성 검사 오류를 생성합니다.
     * 데이터베이스 프로파일이 없을 때 클라이언트가 자격 증명을 제공해야 하는 경우에 사용됩니다.
     * 
     * @param dbname - Database name
     * @param missingFields - Array of missing credential field names (e.g., ['id', 'password'])
     * @param additionalData - Additional error context
     * @returns ValidationError instance
     */
    static MissingDBCredentials(
        dbname: string,
        missingFields: string[],
        additionalData?: Record<string, any>,
    ) {
        return new ValidationError(
            'VALIDATION',
            ValidationErrorCode.MISSING_DB_CREDENTIALS,
            {
                dbname,
                missingFields,
                message: `Database profile not found for dbname: ${dbname}. Client must provide id and password when profile doesn't exist.`,
                ...additionalData,
            },
        );
    }

    /**
     * Creates a validation error for invalid field format.
     * 
     * @param fieldName - Field name with invalid format
     * @param expectedFormat - Expected format description
     * @param additionalData - Additional error context
     * @returns ValidationError instance
     */
    static InvalidFieldFormat(
        fieldName: string,
        expectedFormat?: string,
        additionalData?: Record<string, any>,
    ) {
        return new ValidationError(
            'VALIDATION',
            ValidationErrorCode.INVALID_FIELD_FORMAT,
            {
                fieldName,
                expectedFormat,
                ...additionalData,
            },
        );
    }
}

