import { DatabaseError } from '@error/database/database-error';
import { rethrowKnownAppError, rethrowOrWrapUnknown } from './error-boundary.util';

/**
 * DB 모듈 경계용 데코레이터.
 * AppError는 그대로 전달하고, 그 외만 DatabaseError.Unknown으로 감쌉니다.
 */
export function HandleDatabaseErrors() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (err) {
        rethrowKnownAppError(err);

        rethrowOrWrapUnknown(err, propertyKey, 'HandleDatabaseErrors', (detail, cause) =>
          DatabaseError.Unknown(detail, cause)
        );
      }
    };

    return descriptor;
  };
}
