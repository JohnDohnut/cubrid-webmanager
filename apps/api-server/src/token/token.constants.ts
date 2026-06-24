/** Access JWT lifetime (Bearer API calls). */
export const ACCESS_TOKEN_EXPIRES = '1d';

export const ACCESS_TOKEN_EXPIRES_SEC = 24 * 60 * 60;

/** Refresh token lifetime (opaque, server-stored). */
export const REFRESH_TOKEN_EXPIRES_MS = 14 * 24 * 60 * 60 * 1000;

export const TOKEN_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
