import { sanitizeForLog } from '../redaction/sanitize-for-log';

export function formatLogPayload(value: unknown, maxLength = 2000): string {
  if (value === undefined) {
    return 'undefined';
  }

  if (value === null) {
    return 'null';
  }

  try {
    const serialized = JSON.stringify(sanitizeForLog(value));
    if (!serialized || serialized.length <= maxLength) {
      return serialized ?? String(value);
    }

    return `${serialized.slice(0, maxLength)}...(truncated)`;
  } catch {
    return '[Unserializable]';
  }
}

function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return formatLogPayload(value, 500);
}

export function buildLogLine(fields: Record<string, unknown>): string {
  return Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${formatFieldValue(value)}`)
    .join(' ');
}
