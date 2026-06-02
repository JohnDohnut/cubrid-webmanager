type RequestLike = {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string | null };
};

export function resolveClientIp(request: RequestLike): string {
  const forwarded = request.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  if (Array.isArray(forwarded)) {
    for (const entry of forwarded) {
      if (typeof entry === 'string' && entry.trim()) {
        return entry.split(',')[0].trim();
      }
    }
  }

  const realIp = request.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }

  return request.ip || request.socket?.remoteAddress || 'unknown';
}
