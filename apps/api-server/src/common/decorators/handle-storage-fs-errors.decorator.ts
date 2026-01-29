import { StorageError } from '@error/storage/storage-error';
import { AppError } from '@error';

/**
 * A method decorator that wraps storage methods in a try...catch block.
 *
 * It provides centralized handling for file system errors, translating
 * them into appropriate StorageError instances.
 *
 * This decorator catches common file system errors (ENOENT, EEXIST, EACCES, EPERM)
 * and converts them to domain-specific StorageError objects with proper error codes
 * and additional context.
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
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
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
            throw StorageError.NoSuchFile({ filePath: err.path }, err);
          case 'EEXIST':
            throw StorageError.AlreadyExists({ filePath: err.path }, err);
          case 'EACCES':
          case 'EPERM':
            throw StorageError.PermissionDenied({ filePath: err.path }, err);
          default:
            throw StorageError.Unknown(
              {
                originalCode: err?.code,
                originalMessage: err?.message,
              },
              err
            );
        }
      }
    };
    return descriptor;
  };
}
