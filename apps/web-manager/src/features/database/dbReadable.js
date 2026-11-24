import { dbKey } from './dbKey';

/**
 * Whether a database's screens may read it: logged in on this host and not
 * in the middle of logging out. The logout request can drop the server's
 * login before its answer reaches loggedInDatabases, and a read sent in
 * that gap (a dashboard refreshing as the logout confirm closes) comes back
 * MISSING_DB_CREDENTIALS.
 */
export function isDbReadable(state, hostUid, dbname) {
  if (!hostUid || !dbname) return false;
  const key = dbKey(hostUid, dbname);
  const db = state.database;
  return Boolean(db?.loggedInDatabases?.includes(key)) && !db?.loggingOutDatabases?.[key];
}
