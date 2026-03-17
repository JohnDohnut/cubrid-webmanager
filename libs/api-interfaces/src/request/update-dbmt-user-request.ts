/**
 * Client request for updating a DBMT (CMS) user.
 * No password; updates auth settings only.
 */
export type UpdateDbmtUserRequest = {
  /** Target user id (login name) */
  targetid: string;
  /** DB auth array (e.g. [] for none). Optional; omitted is treated as []. */
  dbauth?: unknown[];
  /** CAS auth: 'none' | 'admin' | 'monitor' */
  casauth: string;
  /** DB create auth: 'none' | 'admin' */
  dbcreate: string;
  /** Status monitor auth: 'none' | 'admin' */
  statusmonitorauth: string;
};
