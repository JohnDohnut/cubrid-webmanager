import { LockError } from '@error/lock/lock-error';
import { AppError } from '@error';

/**
 * A method decorator that wraps lock service methods in a try...catch block.
 * 락 서비스 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * It provides centralized handling for file system errors related to lock operations,
 * translating them into appropriate LockError instances.
 *
 * 락 작업과 관련된 파일 시스템 오류에 대한 중앙 집중식 처리를 제공하여
 * 적절한 LockError 인스턴스로 변환합니다.
 *
 * This decorator handles various lock-related file system errors including:
 * - ENOENT: Lock file not found
 * - EACCES/EPERM: Permission denied
 * - EEXIST/ELOCKED: Lock already held
 * - ENOTACQUIRED: Lock not acquired
 * - ECOMPROMISED: Lock compromised
 * - ERELEASED: Lock already released
 *
 * 이 데코레이터는 다음을 포함한 다양한 락 관련 파일 시스템 오류를 처리합니다:
 * - ENOENT: 락 파일을 찾을 수 없음
 * - EACCES/EPERM: 권한 거부
 * - EEXIST/ELOCKED: 락이 이미 보유됨
 * - ENOTACQUIRED: 락을 획득하지 못함
 * - ECOMPROMISED: 락이 손상됨
 * - ERELEASED: 락이 이미 해제됨
 *
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class LockService {
 *   @HandleLockFsErrors()
 *   async acquireLock(filePath: string): Promise<void> {
 *     // Lock acquisition logic
 *     // 락 획득 로직
 *   }
 * }
 * ```
 */
export function HandleLockFsErrors() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (err) {
                if (err instanceof AppError) {
                    throw err;
                }
                switch (err?.code) {
                    case 'ENOENT':
                        throw LockError.LockNotFound(
                            { filePath: err.path },
                            err,
                        );
                    case 'EACCES':
                    case 'EPERM':
                        throw LockError.PermissionDenied(
                            { filePath: err.path },
                            err,
                        );
                    case 'EEXIST':
                    case 'ELOCKED': // proper-lockfile code
                        throw LockError.LockAlreadyHeld(
                            { filePath: err.file || err.path },
                            err,
                        );
                    case 'ENOTACQUIRED': // proper-lockfile code
                        throw LockError.LockNotFound(
                            { filePath: err.file },
                            err,
                        );
                    case 'ECOMPROMISED': // proper-lockfile code
                        throw LockError.Unknown(
                            { reason: 'Lock compromised', filePath: err.file },
                            err,
                        );
                    case 'ERELEASED': // proper-lockfile code
                        throw LockError.LockNotFound(
                            {
                                reason: 'Lock already released',
                                filePath: err.file,
                            },
                            err,
                        );
                    default:
                        throw LockError.Unknown(
                            { originalCode: err?.code },
                            err,
                        );
                }
            }
        };
        return descriptor;
    };
}
