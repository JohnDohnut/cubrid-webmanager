import { LoadDatabaseRequest } from '@api-interfaces';

/**
 * CMS loaddb accepts user / _DBID / _DBPASSWD together; always send all three.
 */
export function normalizeLoadDatabaseRequest(body: LoadDatabaseRequest): LoadDatabaseRequest {
  const user = String(body.user ?? body._DBID ?? 'dba').trim() || 'dba';
  return {
    ...body,
    user,
    _DBID: String(body._DBID ?? user).trim() || user,
    _DBPASSWD: body._DBPASSWD != null ? String(body._DBPASSWD) : '',
  };
}
