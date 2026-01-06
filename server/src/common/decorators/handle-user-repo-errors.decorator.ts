import { UserError } from '@error/user/user-error';
import { LockError, LockErrorCode } from '@error/lock/lock-error';
import { StorageError, StorageErrorCode } from '@error/storage/storage-error';

/**
 * A method decorator that wraps a repository method in a try...catch block.
 * 리포지토리 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * It provides centralized handling for LockError and StorageError, translating
 * them into the appropriate domain-specific UserError.
 *
 * LockError와 StorageError에 대한 중앙 집중식 처리를 제공하여
 * 적절한 도메인별 UserError로 변환합니다.
 *
 * @assumption This decorator assumes that the first argument of the decorated
 * method is a string (e.g., userId) that can be used for logging context.
 *
 * @가정 이 데코레이터는 데코레이팅된 메서드의 첫 번째 인수가
 * 로깅 컨텍스트에 사용할 수 있는 문자열(예: userId)이라고 가정합니다.
 *
 * @category Decorators
 * @since 1.0.0
 */
export function HandleUserRepoErrors() {
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
                const contextId = args[0] || 'unknown';

                // Handle storage errors first, as they are more specific
                // StorageError를 의미에 맞는 UserError로 변환
                if (err instanceof StorageError) {
                    switch (err.code) {
                        case StorageErrorCode.NO_SUCH_FILE:
                        case StorageErrorCode.FILE_NOT_FOUND: // Deprecated
                            throw UserError.UserNotFound(
                                { userId: contextId },
                                err,
                            );
                        case StorageErrorCode.FILE_ALREADY_EXISTS:
                            throw UserError.UserAlreadyExists(
                                { userId: contextId },
                                err,
                            );
                        default:
                            throw UserError.Unknown(
                                {
                                    resourceId: contextId,
                                    storageError: err.code,
                                },
                                err,
                            );
                    }
                }

                // Handle lock errors - 의미에 맞는 UserError로 변환
                if (err instanceof LockError) {
                    switch (err.code) {
                        case LockErrorCode.LOCK_NOT_FOUND:
                            // 락 파일이 없으면 사용자 파일도 없을 가능성이 높음
                            if (err.message?.includes('ENOENT')) {
                                throw UserError.UserNotFound(
                                    { userId: contextId },
                                    err,
                                );
                            }
                            // 그 외의 경우는 락 작업 실패
                            throw UserError.LockOperationFailed(
                                { resourceId: contextId, reason: err.code },
                                err,
                            );
                        case LockErrorCode.LOCK_ALREADY_HELD:
                            // 락이 이미 보유 중이면 리소스 잠김
                            throw UserError.ResourceLocked(
                                { resourceId: contextId },
                                err,
                            );
                        case LockErrorCode.PERMISSION_DENIED:
                        case LockErrorCode.STALE_LOCK:
                        case LockErrorCode.UNKNOWN:
                        default:
                            // 알 수 없는 락 에러는 락 작업 실패로 변환
                            throw UserError.LockOperationFailed(
                                { resourceId: contextId, reason: err.code },
                                err,
                            );
                    }
                }

                // If it's an unrecognized error, re-throw it to be handled elsewhere.
                throw err;
            }
        };

        return descriptor;
    };
}
