import { Logger } from '@nestjs/common';
import { ValidationError } from '@error/validation/validation-error';

/**
 * Validates that required fields are present in the request body.
 * Throws ValidationError if any fields are missing.
 *
 * 요청 body에 필수 필드가 있는지 검증합니다.
 * 누락된 필드가 있으면 ValidationError를 던집니다.
 *
 * @param body - Request body object to validate
 * @param fieldNames - Array of required field names to check
 * @param endpoint - Endpoint path for error context (e.g., 'database/start')
 * @param logger - Logger instance (optional, for logging missing fields)
 * @throws ValidationError if any required fields are missing
 *
 * @example
 * ```typescript
 * validateRequiredFields(body, ['hostUid', 'dbname'], 'database/start', Logger);
 * ```
 */
export function validateRequiredFields(
    body: any,
    fieldNames: string[],
    endpoint: string,
    logger?: Logger,
): void {
    if (!body) {
        const missingFields = fieldNames;
        if (logger) {
            logger.error(
                `Missing required fields: ${missingFields.join(', ')}`,
                'Validation',
            );
        }
        throw ValidationError.MissingRequiredField(missingFields, { endpoint });
    }

    const missingFields: string[] = [];

    for (const fieldName of fieldNames) {
        const value = body[fieldName];
        // null과 undefined 모두 체크 (빈 문자열은 허용)
        if (value == null) {
            missingFields.push(fieldName);
        }
    }

    if (missingFields.length > 0) {
        if (logger) {
            logger.error(
                `Missing required fields: ${missingFields.join(', ')}`,
                'Validation',
            );
        }
        throw ValidationError.MissingRequiredField(missingFields, { endpoint });
    }
}

