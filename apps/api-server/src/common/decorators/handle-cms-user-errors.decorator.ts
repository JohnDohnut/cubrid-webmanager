import { AppError, CmsError, CmsUserError, HostError } from '@error';

/**
 * Method decorator that wraps CMS user service methods and maps errors to CmsUserError.
 *
 * @category Decorators
 * @since 1.0.0
 */
export function HandleCmsUserErrors() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (err) {
        if (err instanceof CmsUserError) throw err;
        if (err instanceof CmsError) throw err;
        if (err instanceof HostError) throw err;
        if (err instanceof AppError) {
          throw CmsUserError.Unknown(
            { originalCode: err.code, originalMessage: err.message, ...err.additionalData },
            err
          );
        }
        console.error(`[HandleCmsUserErrors] Unknown error in ${propertyKey}:`, err);
        throw CmsUserError.Unknown(
          { originalMessage: err instanceof Error ? err.message : String(err) },
          err instanceof Error ? err : undefined
        );
      }
    };

    return descriptor;
  };
}
