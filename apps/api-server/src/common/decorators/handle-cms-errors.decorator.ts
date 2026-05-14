import { CmsError } from '@error/cms/cms-error';
import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { buildLogLine } from '@util';
import { rethrowKnownAppError, rethrowOrWrapUnknown } from './error-boundary.util';

export type HandleCmsErrorsOptions = {
  /** Maps Axios/HTTP exceptions to CmsError (default: true). */
  mapHttpErrors?: boolean;
};

function mapAxiosToCmsError(error: unknown): CmsError | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const e = error as AxiosError;
  if (!('response' in e) && !('request' in e) && !('config' in e)) {
    return null;
  }

  if (e.response) {
    return CmsError.RequestFailed(
      {
        status: e.response.status,
        data: e.response.data,
      },
      error as Error
    );
  }

  if (e.request) {
    const request = e.request as { method?: string; host?: string; path?: string };
    Logger.warn(
      buildLogLine({
        event: 'cms_no_response',
        method: request.method,
        host: request.host,
        path: request.path,
      })
    );
    return CmsError.NoResponse(undefined, error as Error);
  }

  return null;
}

function handleCatch(err: unknown, propertyKey: string, mapHttpErrors: boolean): never {
  if (mapHttpErrors) {
    const fromAxios = mapAxiosToCmsError(err);
    if (fromAxios) {
      throw fromAxios;
    }
  }

  rethrowKnownAppError(err);

  rethrowOrWrapUnknown(err, propertyKey, 'HandleCmsErrors', (detail, cause) =>
    CmsError.Unknown(detail, cause)
  );
}

/**
 * CMS 호출 경계용 데코레이터.
 * - Axios/HTTP -> CmsError
 * - AppError(Cms/Host/Config/Database/Validation 등)는 그대로 전달
 * - 그 외 -> CmsError.Unknown
 */
export function HandleCmsErrors(options?: HandleCmsErrorsOptions) {
  const mapHttpErrors = options?.mapHttpErrors !== false;

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (err) {
        handleCatch(err, propertyKey, mapHttpErrors);
      }
    };

    return descriptor;
  };
}
