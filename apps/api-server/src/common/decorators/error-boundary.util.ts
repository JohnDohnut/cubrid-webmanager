import { AppError } from '@error/app-error';

export function rethrowKnownAppError(err: unknown): void {
  if (err instanceof AppError) {
    throw err;
  }
}

export function rethrowOrWrapUnknown(
  err: unknown,
  propertyKey: string,
  logLabel: string,
  unknownFactory: (detail: Record<string, unknown>, cause?: Error) => AppError
): never {
  rethrowKnownAppError(err);

  console.error(`[${logLabel}] Unknown error in ${propertyKey}:`, err);
  throw unknownFactory(
    { originalMessage: err instanceof Error ? err.message : String(err) },
    err instanceof Error ? err : undefined
  );
}
