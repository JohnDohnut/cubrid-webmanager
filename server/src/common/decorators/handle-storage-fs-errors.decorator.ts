import { StorageError } from '@error/storage/storage-error';
import { AppError } from '@error';

/**
 * A method decorator that wraps storage methods in a try...catch block.
i * 스토리지 메서드를 try...catch 블록으로 감싸는 메서드 데코레이터입니다.
 * 
 * It provides centralized handling for file system errors, translating
 * them into appropriate StorageError instances.
 * 
 * 파일 시스템 오류에 대한 중앙 집중식 처리를 제공하여 
 * 적절한 StorageError 인스턴스로 변환합니다.
 * 
 * This decorator catches common file system errors (ENOENT, EEXIST, EACCES, EPERM)
 * and converts them to domain-specific StorageError objects with proper error codes
 * and additional context.
 * 
 * 이 데코레이터는 일반적인 파일 시스템 오류(ENOENT, EEXIST, EACCES, EPERM)를 
 * 포착하여 적절한 오류 코드와 추가 컨텍스트가 있는 도메인별 StorageError 객체로 변환합니다.
 * 
 * @category Decorators
 * @since 1.0.0
 * @example
 * ```typescript
 * class StorageService {
 *   @HandleStorageFsErrors()
 *   async readFile(path: string): Promise<string> {
 *     return fs.readFile(path, 'utf-8');
 *   }
 * }
 * ```
 */
export function HandleStorageFsErrors() {
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
                        throw StorageError.NoSuchFile(
                            { filePath: err.path },
                            err,
                        );
                    case 'EEXIST':
                        throw StorageError.AlreadyExists(
                            { filePath: err.path },
                            err,
                        );
                    case 'EACCES':
                    case 'EPERM':
                        throw StorageError.PermissionDenied(
                            { filePath: err.path },
                            err,
                        );
                    default:
                        throw StorageError.Unknown(
                            {
                                originalCode: err?.code,
                                originalMessage: err?.message,
                            },
                            err,
                        );
                }
            }
        };
        return descriptor;
    };
}
