import { HostError, LockError, LockErrorCode, StorageError, StorageErrorCode, AppError } from '@error';

/**
 * A method decorator that wraps host service methods in a try...catch block.
 * 호스트 서비스 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 *
 * 시스템/라이브러리 레벨 에러(StorageError, LockError)를 의미에 맞는 HostError로 변환하고,
 * 이미 AppError로 변환된 에러는 그대로 전달합니다.
 *
 * Converts system/library level errors (StorageError, LockError) to semantically appropriate HostError.
 * Already converted AppError instances are passed through as-is.
 *
 * @category Decorators
 * @since 1.0.0
 */
export function HandleHostErrors() {
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

                // 이미 AppError로 변환된 에러는 그대로 전달
                if (err instanceof AppError) {
                    throw err;
                }

                // StorageError를 의미에 맞는 HostError로 변환
                if (err instanceof StorageError) {
                    switch (err.code) {
                        case StorageErrorCode.NO_SUCH_FILE:
                        case StorageErrorCode.FILE_NOT_FOUND: // Deprecated
                            // 호스트 파일이 없으면 호스트가 없는 것
                            throw HostError.NoSuchHost(
                                { userId: contextId, hostUid: err.additionalData?.filePath },
                                err,
                            );
                        case StorageErrorCode.FILE_ALREADY_EXISTS:
                            // 호스트 파일이 이미 존재하면 중복 호스트
                            throw HostError.DuplicatedHost(
                                { userId: contextId },
                                err,
                            );
                        default:
                            throw HostError.InternalError(
                                {
                                    userId: contextId,
                                    originalError: 'StorageError',
                                    storageErrorCode: err.code,
                                    ...err.additionalData,
                                },
                                err,
                            );
                    }
                }

                // LockError를 의미에 맞는 HostError로 변환
                if (err instanceof LockError) {
                    switch (err.code) {
                        case LockErrorCode.LOCK_NOT_FOUND:
                            // 락 파일이 없으면 호스트 파일도 없을 가능성이 높음
                            if (err.message?.includes('ENOENT')) {
                                throw HostError.NoSuchHost(
                                    { userId: contextId },
                                    err,
                                );
                            }
                            throw HostError.InternalError(
                                {
                                    userId: contextId,
                                    originalError: 'LockError',
                                    lockErrorCode: err.code,
                                    ...err.additionalData,
                                },
                                err,
                            );
                        case LockErrorCode.LOCK_ALREADY_HELD:
                            // 락이 이미 보유 중이면 내부 에러
                            throw HostError.InternalError(
                                {
                                    userId: contextId,
                                    originalError: 'LockError',
                                    lockErrorCode: err.code,
                                    ...err.additionalData,
                                },
                                err,
                            );
                        default:
                            throw HostError.InternalError(
                                {
                                    userId: contextId,
                                    originalError: 'LockError',
                                    lockErrorCode: err.code,
                                    ...err.additionalData,
                                },
                                err,
                            );
                    }
                }

                // 알 수 없는 에러는 InternalError로 변환
                throw HostError.InternalError({ userId: contextId }, err);
            }
        };
    };
}
