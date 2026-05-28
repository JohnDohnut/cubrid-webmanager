export const REDACTED_VALUE = '[REDACTED]';

export function isSensitiveLogKey(key: string): boolean {
  const lower = key.toLowerCase();

  if (
    lower === 'authorization' ||
    lower === 'cookie' ||
    lower === 'token' ||
    lower === 'secret' ||
    lower === '_dbid' ||
    lower === '_dbpasswd'
  ) {
    return true;
  }

  return (
    lower.includes('password') ||
    lower.includes('passwd') ||
    lower.includes('userpass') ||
    lower.includes('secret')
  );
}

export function sanitizeForLog<T>(value: T, seen = new WeakSet<object>()): T {
  if (value == null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeForLog(entry, seen)) as T;
  }

  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (seen.has(value as object)) {
    return '[Circular]' as T;
  }

  seen.add(value as object);

  const sanitized: Record<string, unknown> = {};
  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    sanitized[key] = isSensitiveLogKey(key) ? REDACTED_VALUE : sanitizeForLog(entryValue, seen);
  }

  return sanitized as T;
}

export function sanitizeHeadersForLog(headers: Record<string, unknown>): Record<string, unknown> {
  return sanitizeForLog(headers) as Record<string, unknown>;
}
