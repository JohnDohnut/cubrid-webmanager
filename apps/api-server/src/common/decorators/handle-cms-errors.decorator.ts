import { AppError, ConfigError, CmsError, HostError } from '@error';
import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

export type HandleCmsErrorsOptions = {
  /**
   * Axios/HTTP 예외를 CmsError로 매핑 (기본 true).
   */
  mapHttpErrors?: boolean;
  /** AppError·기타 → ConfigError.Unknown('config') 또는 CmsError.Unknown('cms') */
  appErrorFallback?: 'config' | 'cms';
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
    Logger.log(e.request);
    return CmsError.NoResponse(undefined, error as Error);
  }
  return null;
}

function handleCatch(
  err: unknown,
  propertyKey: string,
  mapHttpErrors: boolean,
  appErrorFallback: HandleCmsErrorsOptions['appErrorFallback']
): never {

  if (mapHttpErrors) {
    const fromAxios = mapAxiosToCmsError(err);
    if (fromAxios) {
      throw fromAxios;
    }
  }

  if (err instanceof ConfigError) {
    throw err;
  }
  if (err instanceof CmsError) {
    throw err;
  }
  if (err instanceof HostError) {
    throw err;
  }

  if (err instanceof AppError) {
    if (appErrorFallback === 'config') {
      throw ConfigError.Unknown(
        {
          originalCode: err.code,
          originalMessage: err.message,
          ...err.additionalData,
        },
        err
      );
    }
    if (appErrorFallback === 'cms') {
      throw CmsError.Unknown(
        { originalCode: err.code, originalMessage: err.message, ...err.additionalData },
        err
      );
    }
    throw err;
  }

  if (appErrorFallback === 'config') {
    console.error(`[HandleCmsErrors] Unknown error in ${propertyKey}:`, err);
    throw ConfigError.Unknown(
      {
        originalMessage: err instanceof Error ? err.message : String(err),
      },
      err instanceof Error ? err : undefined
    );
  }
  if (appErrorFallback === 'cms') {
    console.error(`[HandleCmsErrors] Unknown error in ${propertyKey}:`, err);
    throw CmsError.Unknown(
      { originalMessage: err instanceof Error ? err.message : String(err) },
      err instanceof Error ? err : undefined
    );
  }

  throw CmsError.Unknown({ message: (err as Error)?.message || 'Unknown error' }, err as Error);
}

/**
 * CMS 관련 예외 처리 단일 데코레이터.
 * - HTTP(Axios) → CmsError
 * - 선택: 그 외 AppError를 Config/Cms Unknown으로 매핑 (cms-config·cms-user 등)
 */
export function HandleCmsErrors(options?: HandleCmsErrorsOptions) {
  const mapHttpErrors = options?.mapHttpErrors !== false;
  const appErrorFallback = options?.appErrorFallback;

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (err) {
        handleCatch(err, propertyKey, mapHttpErrors, appErrorFallback);
      }
    };

    return descriptor;
  };
}
