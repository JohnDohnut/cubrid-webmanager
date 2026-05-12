import { formatLogPayload } from './format-log-payload';

const DETAIL_KEYS = new Set(['body', 'payload', 'message']);

function formatScalar(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return String(value);
}

export function formatAuditLog(
  title: string,
  fields: Record<string, unknown>,
  options?: { maxPayloadLength?: number }
): string {
  const maxPayloadLength = options?.maxPayloadLength ?? 1000;
  const headerParts = Object.entries(fields)
    .filter(
      ([key, value]) =>
        !DETAIL_KEYS.has(key) && value !== undefined && value !== null && value !== ''
    )
    .map(([key, value]) => `${key}=${formatScalar(value)}`);

  const lines = [`[${title}] ${headerParts.join(' | ')}`];

  for (const key of ['body', 'payload'] as const) {
    const value = fields[key];
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value as Record<string, unknown>).length === 0
    ) {
      continue;
    }

    const payload =
      typeof value === 'string' ? value : formatLogPayload(value, maxPayloadLength);
    const payloadLines = payload.split('\n');
    lines.push(`  ${key}: ${payloadLines[0]}`);
    for (let index = 1; index < payloadLines.length; index += 1) {
      lines.push(`  ${payloadLines[index]}`);
    }
  }

  const message = fields.message;
  if (message !== undefined && message !== null && message !== '') {
    lines.push(`  message: ${formatScalar(message)}`);
  }

  return lines.join('\n');
}
