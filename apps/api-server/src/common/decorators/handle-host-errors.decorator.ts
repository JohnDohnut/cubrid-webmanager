import { HostError, LockError, LockErrorCode, StorageError, StorageErrorCode, AppError } from '@error';

/**
 * A method decorator that wraps host service methods in a try...catch block.
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

                if (err instanceof AppError) {
                    throw err;
                }

                if (err instanceof StorageError) {
                    switch (err.code) {
                        case StorageErrorCode.NO_SUCH_FILE:
                        case StorageErrorCode.FILE_NOT_FOUND:
                            throw HostError.NoSuchHost(
                                { userId: contextId, hostUid: err.additionalData?.filePath },
                                err,
                            );
                        case StorageErrorCode.FILE_ALREADY_EXISTS:
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

                if (err instanceof LockError) {
                    switch (err.code) {
                        case LockErrorCode.LOCK_NOT_FOUND:
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

                throw HostError.InternalError({ userId: contextId }, err);
            }
        };
    };
}
